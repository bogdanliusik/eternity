using Eternity.Application.Common.Interfaces;
using Eternity.Infrastructure.Data;
using Eternity.WebApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using NSwag;
using NSwag.Generation.Processors.Security;

namespace Eternity.WebApi.Extensions;

public static class ServicesExtensions
{
    public static void AddWebServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddScoped<ICurrentUser, CurrentUser>();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<AppDbContext>();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddOpenApiDocument((configure, sp) => {
            configure.Title = "Eternity API";
            configure.AddSecurity("JWT", [], new OpenApiSecurityScheme {
                Type = OpenApiSecuritySchemeType.ApiKey,
                Name = "Authorization",
                In = OpenApiSecurityApiKeyLocation.Header,
                Description = "Type into the textbox: Bearer {your JWT token}."
            });
            configure.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
        });
    }
    
    public static void AddEternityAuthentication(this IHostApplicationBuilder builder) {
        builder.Services.AddAuthentication(options => {
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options => {
            options.TokenValidationParameters = new TokenValidationParameters {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                // ValidIssuer = "your_issuer",
                // ValidAudience = "your_audience",
                IssuerSigningKey = new SymmetricSecurityKey("6AD2EFDE-AB2C-4841-A05E-7045C855BA22"u8.ToArray()),
                ClockSkew = TimeSpan.Zero
            };
            options.Events = new JwtBearerEvents {
                OnMessageReceived = context => {
                    var accessToken = context.HttpContext.Request.Cookies["AccessToken"];
                    if (!string.IsNullOrEmpty(accessToken)) {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });
    }
}
