namespace Eternity.Infrastructure.BackgroundJobs.SessionCleanup;

public class SessionCleanupSettings
{
    public const string SectionName = "SessionCleanup";
    
    /// <summary>
    /// The interval in minutes between session cleanup runs.
    /// </summary>
    public int IntervalMinutes { get; init; } = 15;
}
