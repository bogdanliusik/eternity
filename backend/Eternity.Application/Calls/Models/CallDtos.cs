using Eternity.Domain.Constants;
using Eternity.Domain.Entities;

namespace Eternity.Application.Calls.Models;

public record CallParticipantDto
{
    public required string Id { get; init; }
    public required Guid UserId { get; init; }
    public required string Username { get; init; }
    public required string FullName { get; init; }
    public string? AvatarUrl { get; init; }
    public required ParticipantStatus ParticipantStatus { get; init; }
    public DateTimeOffset? JoinedAt { get; init; }
    public DateTimeOffset? LeftAt { get; init; }
}

public record CallDto
{
    public required string Id { get; init; }
    public string? Name { get; init; }
    public required CallType Type { get; init; }
    public required CallStatus Status { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? StartedAt { get; init; }
    public DateTimeOffset? EndedAt { get; init; }
    public int? DurationSeconds { get; init; }
    public required List<CallParticipantDto> Participants { get; init; }
    public required CallParticipantDto InitiatedBy { get; init; }

    /// <summary>
    ///     Returns the explicit call name if set, otherwise generates a display name
    ///     from the participant full names (joined by ", ").
    /// </summary>
    public static string? ResolveDisplayName(string? explicitName, IEnumerable<CallParticipant> participants) {
        if (!string.IsNullOrWhiteSpace(explicitName)) {
            return explicitName;
        }
        var names = participants.Select(p => p.User.FullName).Where(n => !string.IsNullOrWhiteSpace(n)).ToList();
        return names.Count > 0 ? string.Join(", ", names) : null;
    }
}

public record CallHistoryDto : CallDto
{
    /// <summary>
    ///     The participant status of the requesting user within this call.
    ///     Used by the frontend to derive per-user display status
    ///     (e.g., a Completed call can appear as "Missed" for a user who never joined).
    /// </summary>
    public required ParticipantStatus UserParticipantStatus { get; init; }
}

public record UserSummaryDto
{
    public required Guid Id { get; init; }
    public required string Username { get; init; }
    public required string FullName { get; init; }
    public string? AvatarUrl { get; init; }
    public bool IsOnline { get; init; }
}
