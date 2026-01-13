namespace Eternity.Domain.Entities;

public class UserSession
{
    private UserSession() { }

    private UserSession(Guid userId, string refreshToken, DateTime refreshTokenExpiry,
        string? ipAddress, string? userAgent) {
        Id = Guid.NewGuid();
        UserId = userId;
        RefreshToken = refreshToken;
        RefreshTokenExpiry = refreshTokenExpiry;
        StartedAt = DateTimeOffset.UtcNow;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        (DeviceInfo, BrowserInfo) = ParseUserAgent(userAgent);
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public string RefreshToken { get; private set; } = null!;

    public DateTime RefreshTokenExpiry { get; private set; }

    public DateTimeOffset StartedAt { get; private set; }

    public DateTimeOffset? EndedAt { get; private set; }

    public string? IpAddress { get; private set; }

    public string? UserAgent { get; private set; }

    public string? DeviceInfo { get; private set; }

    public string? BrowserInfo { get; private set; }

    public bool IsTerminated { get; private set; }

    public bool IsActive => !IsTerminated && RefreshTokenExpiry > DateTime.UtcNow;

    public static UserSession Create(Guid userId, string refreshToken, DateTime refreshTokenExpiry,
        string? ipAddress, string? userAgent) {
        ArgumentException.ThrowIfNullOrWhiteSpace(refreshToken);
        return new UserSession(userId, refreshToken, refreshTokenExpiry, ipAddress, userAgent);
    }

    public void UpdateRefreshToken(string refreshToken, DateTime refreshTokenExpiry) {
        ArgumentException.ThrowIfNullOrWhiteSpace(refreshToken);
        RefreshToken = refreshToken;
        RefreshTokenExpiry = refreshTokenExpiry;
    }

    public void Terminate() {
        if (IsTerminated) {
            return;
        }
        IsTerminated = true;
        EndedAt = DateTimeOffset.UtcNow;
    }

    private static (string? device, string? browser) ParseUserAgent(string? userAgent) {
        if (string.IsNullOrWhiteSpace(userAgent)) {
            return (null, null);
        }
        var device = ParseDevice(userAgent);
        var browser = ParseBrowser(userAgent);
        return (device, browser);
    }

    private static string ParseDevice(string userAgent) {
        if (userAgent.Contains("iPhone", StringComparison.OrdinalIgnoreCase)) return "iPhone";
        if (userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase)) return "iPad";
        if (userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase)) {
            return userAgent.Contains("Mobile", StringComparison.OrdinalIgnoreCase) 
                ? "Android Phone" 
                : "Android Tablet";
        }
        if (userAgent.Contains("Windows", StringComparison.OrdinalIgnoreCase)) return "Windows PC";
        if (userAgent.Contains("Macintosh", StringComparison.OrdinalIgnoreCase)) return "Mac";
        if (userAgent.Contains("Linux", StringComparison.OrdinalIgnoreCase)) return "Linux PC";
        return "Unknown Device";
    }

    private static string ParseBrowser(string userAgent) {
        if (userAgent.Contains("Edg/", StringComparison.OrdinalIgnoreCase)) return "Microsoft Edge";
        if (userAgent.Contains("OPR/", StringComparison.OrdinalIgnoreCase) || 
            userAgent.Contains("Opera", StringComparison.OrdinalIgnoreCase)) return "Opera";
        if (userAgent.Contains("Chrome/", StringComparison.OrdinalIgnoreCase) &&
            !userAgent.Contains("Chromium", StringComparison.OrdinalIgnoreCase)) return "Google Chrome";
        if (userAgent.Contains("Safari/", StringComparison.OrdinalIgnoreCase) &&
            !userAgent.Contains("Chrome", StringComparison.OrdinalIgnoreCase)) return "Safari";
        if (userAgent.Contains("Firefox/", StringComparison.OrdinalIgnoreCase)) return "Mozilla Firefox";
        if (userAgent.Contains("MSIE", StringComparison.OrdinalIgnoreCase) ||
            userAgent.Contains("Trident/", StringComparison.OrdinalIgnoreCase)) return "Internet Explorer";
        return "Unknown Browser";
    }
}
