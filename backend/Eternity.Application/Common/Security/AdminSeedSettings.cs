namespace Eternity.Application.Common.Security;

public class AdminSeedSettings
{
    public const string SectionName = "AdminSeed";
    public string? Username { get; init; }
    public string? Email { get; init; }
    public string? Password { get; init; }
}
