using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Security;
using Eternity.Infrastructure.Data;
using Eternity.WebApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.IdentityModel.Tokens;
using NSwag;
using NSwag.Generation.Processors.Security;

namespace Eternity.WebApi.Extensions;

public static class ServicesExtensions
{
    public static void AddWebServices(this IHostApplicationBuilder builder) {
        var keysDirectory = Path.Combine(builder.Environment.ContentRootPath, "data-protection-keys");
        builder.Services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(keysDirectory));
        builder.Services.AddScoped<ICurrentUser, CurrentUser>();
        builder.Services.AddScoped<ICookieAuthService, CookieAuthService>();
        builder.Services.AddSingleton<ConnectionTracker>();
        builder.Services.AddSingleton<CallConnectionTracker>();
        builder.Services.AddSingleton<IOnlineManager, OnlineManager>();
        builder.Services.AddScoped<ICallNotifier, CallNotifier>();
        builder.Services.AddSignalR();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddOpenApiDocument((configure, _) => {
            configure.Title = "Eternity API";
            configure.AddSecurity(
                "JWT",
                [],
                new OpenApiSecurityScheme {
                    Type = OpenApiSecuritySchemeType.ApiKey,
                    Name = "Authorization",
                    In = OpenApiSecurityApiKeyLocation.Header,
                    Description = "Type into the textbox: Bearer {your JWT token}."
                }
            );
            configure.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
        });
        builder.Services.AddCors(options => {
            options.AddPolicy(
                "AllowAngularApp",
                policy => {
                    var allowedOrigins =
                        builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>() ?? [];
                    policy.WithOrigins(allowedOrigins.Where(o => !string.IsNullOrWhiteSpace(o)).ToArray())
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                }
            );
        });
        builder.AddEternityRateLimiting();
    }

    public static void AddEternityAuthentication(this IHostApplicationBuilder builder) {
        var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>();
        if (jwtSettings == null) {
            throw new InvalidOperationException(
                "JWT settings are not configured. Please add JwtSettings section to appsettings.json"
            );
        }
        if (string.IsNullOrEmpty(jwtSettings.SecretKey) || jwtSettings.SecretKey.Length < 32) {
            throw new InvalidOperationException(
                "JWT SecretKey must be at least 32 characters long. " +
                "Please set it in environment variables or user secrets."
            );
        }
        builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
        builder.Services.Configure<CookieSettings>(builder.Configuration.GetSection(CookieSettings.SectionName));
        builder.Services.AddAuthentication(options => {
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options => {
            var cookieSettings =
                builder.Configuration.GetSection(CookieSettings.SectionName).Get<CookieSettings>() ??
                new CookieSettings();
            options.TokenValidationParameters = new TokenValidationParameters {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
            options.Events = new JwtBearerEvents {
                OnMessageReceived = context => HandleMessageReceived(context, cookieSettings),
                OnAuthenticationFailed = context => {
                    if (context.Exception is SecurityTokenExpiredException) {
                        context.Response.Headers.Append("Token-Expired", "true");
                    }
                    return Task.CompletedTask;
                }
            };
            options.SaveToken = true;
        });
    }

    private static async Task HandleMessageReceived(MessageReceivedContext context, CookieSettings cookieSettings) {
        var accessToken = context.HttpContext.Request.Cookies[cookieSettings.AccessTokenCookieName];
        if (string.IsNullOrEmpty(accessToken)) {
            return;
        }
        var sessionIdStr = context.HttpContext.Request.Cookies[cookieSettings.SessionIdCookieName];
        if (string.IsNullOrEmpty(sessionIdStr) || !Guid.TryParse(sessionIdStr, out var sessionId)) {
            context.Token = accessToken;
            return;
        }
        var identityService = context.HttpContext.RequestServices.GetRequiredService<IIdentityService>();
        var isSessionValid = await identityService.IsSessionValidAsync(sessionId);
        if (!isSessionValid) {
            var isWebSocketRequest = context.HttpContext.Request.Path.StartsWithSegments("/hubs");
            if (!isWebSocketRequest) {
                var cookieAuthService = context.HttpContext.RequestServices.GetRequiredService<ICookieAuthService>();
                cookieAuthService.RemoveAuthenticationCookies(context.HttpContext.Response);
            }
            context.Fail("Session has been terminated");
            return;
        }
        if (IsTokenExpired(accessToken)) {
            var refreshResult = await identityService.RefreshTokenAsync(sessionId);
            if (refreshResult.Succeeded) {
                var isWebSocketRequest = context.HttpContext.Request.Path.StartsWithSegments("/hubs");
                if (!isWebSocketRequest) {
                    var cookieAuthService =
                        context.HttpContext.RequestServices.GetRequiredService<ICookieAuthService>();
                    cookieAuthService.SetAuthenticationCookies(context.HttpContext.Response, refreshResult.Data);
                }
                accessToken = refreshResult.Data.AccessToken;
            }
        }
        context.Token = accessToken;
    }

    private static bool IsTokenExpired(string token) {
        try {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            return jwtToken.ValidTo < DateTime.UtcNow;
        } catch {
            return true;
        }
    }
}
