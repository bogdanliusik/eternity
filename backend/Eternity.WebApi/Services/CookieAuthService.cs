using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Microsoft.Extensions.Options;

namespace Eternity.WebApi.Services;

public partial class CookieAuthService(
    IOptions<CookieSettings> cookieSettings,
    IOptions<JwtSettings> jwtSettings,
    IWebHostEnvironment environment,
    ILogger<CookieAuthService> logger) : ICookieAuthService
{
    private readonly CookieSettings _cookieSettings = cookieSettings.Value;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;

    public void SetAuthenticationCookies(HttpResponse response, AppTokenInfo tokenInfo) {
        var isSecure = _cookieSettings.SecurePolicy switch {
            "Always" => true,
            "None" => false,
            "SameAsRequest" => response.HttpContext.Request.IsHttps,
            _ => !environment.IsDevelopment()
        };
        if (!Enum.TryParse<SameSiteMode>(_cookieSettings.SameSiteMode, ignoreCase: true, out var sameSiteMode)) {
            LogInvalidSameSiteMode(logger, _cookieSettings.SameSiteMode);
            sameSiteMode = SameSiteMode.Strict;
        }
        var cookieExpiration = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.RefreshTokenExpirationMinutes);
        var cookieOptions = new CookieOptions {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = sameSiteMode,
            Expires = cookieExpiration,
            Path = "/",
            IsEssential = true
        };
        response.Cookies.Append(_cookieSettings.AccessTokenCookieName, tokenInfo.AccessToken, cookieOptions);
        response.Cookies.Append(_cookieSettings.SessionIdCookieName, tokenInfo.SessionId.ToString(), cookieOptions);
    }

    public void RemoveAuthenticationCookies(HttpResponse response) {
        response.Cookies.Delete(_cookieSettings.AccessTokenCookieName);
        response.Cookies.Delete(_cookieSettings.SessionIdCookieName);
    }

    [LoggerMessage(Level = LogLevel.Warning,
        Message = "Invalid SameSiteMode value '{SameSiteMode}' in cookie settings, falling back to Strict")]
    private static partial void LogInvalidSameSiteMode(ILogger logger, string sameSiteMode);
}
