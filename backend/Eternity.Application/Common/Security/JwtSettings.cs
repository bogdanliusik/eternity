namespace Eternity.Application.Common.Security;

public class JwtSettings
{
    public const string SectionName = "JwtSettings";
    public string SecretKey { get; init; } = string.Empty;
    public int AccessTokenExpirationSeconds { get; init; } = (int)TimeSpan.FromMinutes(15).TotalSeconds;
    public int RefreshTokenExpirationMinutes { get; init; } = (int)TimeSpan.FromDays(3).TotalMinutes;
    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
}
