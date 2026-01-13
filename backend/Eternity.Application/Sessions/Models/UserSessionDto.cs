namespace Eternity.Application.Sessions.Models;

public class UserSessionDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public DateTimeOffset StartedAt { get; init; }
    public DateTimeOffset? EndedAt { get; init; }
    public string? IpAddress { get; init; }
    public string? DeviceInfo { get; init; }
    public string? BrowserInfo { get; init; }
    public bool IsActive { get; init; }
    public bool IsCurrentSession { get; init; }
}
