using Eternity.Domain.Constants;
using Eternity.Domain.Services;

namespace Eternity.Domain.Entities;

public class Call
{
    private readonly List<CallParticipant> _participants = [];
    private Call() { }

    private Call(Guid initiatorId, CallType type, string? name) {
        Id = Ulid.NewUlid().ToString();
        InitiatorId = initiatorId;
        Type = type;
        Name = name;
        Status = CallStatus.Active;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public string Id { get; } = null!;
    public Guid InitiatorId { get; }
    public string? Name { get; private set; }
    public CallType Type { get; private set; }
    public CallStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? StartedAt { get; private set; }
    public DateTimeOffset? EndedAt { get; private set; }
    public IReadOnlyList<CallParticipant> Participants => _participants.AsReadOnly();
    public UserAccount Initiator { get; private set; } = null!;

    public static Call Create(Guid initiatorId, CallType type, string? name, List<Guid> inviteeIds) {
        if (inviteeIds.Count == 0) {
            throw new ArgumentException("At least one invitee is required.", nameof(inviteeIds));
        }
        var totalParticipants = inviteeIds.Count + 1; // +1 for initiator
        if (totalParticipants > CallParticipant.MaxParticipantsPerCall) {
            throw new ArgumentException(
                $"A call cannot have more than {CallParticipant.MaxParticipantsPerCall} participants.",
                nameof(inviteeIds)
            );
        }
        var call = new Call(initiatorId, type, name);
        call._participants.Add(CallParticipant.CreateAsInitiator(call.Id, initiatorId));
        foreach (var inviteeId in inviteeIds) {
            call._participants.Add(CallParticipant.CreateAsInvitee(call.Id, inviteeId));
        }
        return call;
    }

    public void MarkStarted() {
        if (StartedAt == null) {
            StartedAt = DateTimeOffset.UtcNow;
        }
    }

    public void RecalculateStatus() {
        var newStatus = CallStatusCalculator.Calculate(_participants, InitiatorId);
        Status = newStatus;
        if (newStatus is not CallStatus.Active && EndedAt == null) {
            EndedAt = DateTimeOffset.UtcNow;
            foreach (var participant in _participants) {
                participant.MarkMissed();
            }
        }
    }

    public CallParticipant? GetParticipant(Guid userId) {
        return _participants.FirstOrDefault(p => p.UserId == userId);
    }

    public bool IsParticipant(Guid userId) {
        return _participants.Any(p => p.UserId == userId);
    }

    public bool HasAnyJoinedParticipant() {
        return _participants.Any(p => p.Status == ParticipantStatus.Joined);
    }
}
