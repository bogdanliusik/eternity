using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Eternity.Infrastructure.Identity;

public class CookieAuthService : ICookieAuthService
{
    private readonly CookieSettings _cookieSettings;
    private readonly JwtSettings _jwtSettings;
    private readonly IWebHostEnvironment _environment;

    public CookieAuthService(
        IOptions<CookieSettings> cookieSettings,
        IOptions<JwtSettings> jwtSettings,
        IWebHostEnvironment environment)
    {
        _cookieSettings = cookieSettings.Value;
        _jwtSettings = jwtSettings.Value;
        _environment = environment;
    }

    public void SetAuthenticationCookies(HttpResponse response, AppTokenInfo tokenInfo) {
        var isSecure = _cookieSettings.SecurePolicy switch {
            "Always" => true,
            "None" => false,
            "SameAsRequest" => response.HttpContext.Request.IsHttps,
            _ => !_environment.IsDevelopment()
        };
        var accessCookieOptions = new CookieOptions {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = _cookieSettings.SameSiteMode,
            Expires = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            Path = "/",
            IsEssential = true
        };
        var refreshCookieOptions = new CookieOptions {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = _cookieSettings.SameSiteMode,
            Expires = DateTimeOffset.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            Path = "/",
            IsEssential = true
        };
        response.Cookies.Append(
            _cookieSettings.AccessTokenCookieName, 
            tokenInfo.AccessToken, 
            accessCookieOptions
        );
        response.Cookies.Append(
            _cookieSettings.RefreshTokenCookieName, 
            tokenInfo.RefreshToken, 
            refreshCookieOptions
        );
    }
    
    public void RemoveAuthenticationCookies(HttpResponse response) {
        response.Cookies.Delete(_cookieSettings.AccessTokenCookieName);
        response.Cookies.Delete(_cookieSettings.RefreshTokenCookieName);
    }
}
