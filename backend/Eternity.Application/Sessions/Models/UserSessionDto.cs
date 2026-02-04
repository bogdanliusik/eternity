using Eternity.Application.Users.Models;
using Eternity.Domain.Entities;

namespace Eternity.Application.Sessions.Models;

public class UserSessionDto
{
    public Guid Id { get; init; }
    public DateTimeOffset StartedAt { get; init; }
    public DateTimeOffset? EndedAt { get; init; }
    public string? IpAddress { get; init; }
    public string? DeviceInfo { get; init; }
    public string? BrowserInfo { get; init; }
    public bool IsActive { get; init; }
    public bool IsCurrentSession { get; init; }
    public required UserDto User { get; init; }
}

internal static class UserSessionDtoExtensions
{
    public static IQueryable<UserSessionDto> ProjectWithUser(this IQueryable<UserSession> sessions,
        IQueryable<UserAccount> users, Guid currentSessionId, DateTime now) =>
        sessions.Join(users, s => s.UserId, u => u.Id, (s, u) => new UserSessionDto {
            Id = s.Id,
            StartedAt = s.StartedAt,
            EndedAt = s.EndedAt,
            IpAddress = s.IpAddress,
            DeviceInfo = s.DeviceInfo,
            BrowserInfo = s.BrowserInfo,
            IsActive = !s.IsTerminated && s.RefreshTokenExpiry > now,
            IsCurrentSession = s.Id == currentSessionId,
            User = new UserDto {
                Id = u.Id,
                Username = u.UserName,
                FullName = u.FullName,
                Email = u.Email,
                AvatarUrl = u.AvatarUrl,
                Roles = Array.Empty<string>()
            }
        });
}
