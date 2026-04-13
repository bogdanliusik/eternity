using Eternity.Domain.Constants;

namespace Eternity.Domain.Entities;

public class CallParticipant
{
    public const int MaxParticipantsPerCall = 5;
    private CallParticipant() { }

    private CallParticipant(Guid callId, Guid userId, ParticipantStatus status) {
        Id = Guid.NewGuid();
        CallId = callId;
        UserId = userId;
        Status = status;
    }

    public Guid Id { get; private set; }
    public Guid CallId { get; private set; }
    public Guid UserId { get; private set; }
    public ParticipantStatus Status { get; private set; }
    public DateTimeOffset? JoinedAt { get; private set; }
    public DateTimeOffset? LeftAt { get; private set; }
    public Call Call { get; private set; } = null!;
    public UserAccount User { get; private set; } = null!;

    public static CallParticipant CreateAsInitiator(Guid callId, Guid userId) {
        var participant = new CallParticipant(callId, userId, ParticipantStatus.Joined) {
            JoinedAt = DateTimeOffset.UtcNow
        };
        return participant;
    }

    public static CallParticipant CreateAsInvitee(Guid callId, Guid userId) {
        return new CallParticipant(callId, userId, ParticipantStatus.Ringing);
    }

    public void Join() {
        if (Status is ParticipantStatus.Ringing or ParticipantStatus.Missed or ParticipantStatus.Left) {
            Status = ParticipantStatus.Joined;
            JoinedAt = DateTimeOffset.UtcNow;
            LeftAt = null;
        }
    }

    public void Leave() {
        if (Status == ParticipantStatus.Joined) {
            Status = ParticipantStatus.Left;
            LeftAt = DateTimeOffset.UtcNow;
        }
    }

    public void Decline() {
        if (Status == ParticipantStatus.Ringing) {
            Status = ParticipantStatus.Declined;
        }
    }

    public void MarkMissed() {
        if (Status == ParticipantStatus.Ringing) {
            Status = ParticipantStatus.Missed;
        }
    }
}
