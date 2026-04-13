namespace Eternity.Application.Common.Security;

public class CookieSettings
{
    public const string SectionName = "CookieSettings";
    public string AccessTokenCookieName { get; init; } = "eternity_access_token";
    public string SessionIdCookieName { get; init; } = "eternity_session_id";
    public string SameSiteMode { get; init; } = "Strict";
    public string SecurePolicy { get; init; } = "Always"; // Always, SameAsRequest, None
}
