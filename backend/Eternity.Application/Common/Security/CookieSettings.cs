using Microsoft.AspNetCore.Http;

namespace Eternity.Application.Common.Security;

public class CookieSettings
{
    public const string SectionName = "CookieSettings";
    public string AccessTokenCookieName { get; init; } = "eternity_access_token";
    public string RefreshTokenCookieName { get; init; } = "eternity_refresh_token";
    public SameSiteMode SameSiteMode { get; init; } = SameSiteMode.Strict;
    public string SecurePolicy { get; init; } = "Always"; // Always, SameAsRequest, None
}
