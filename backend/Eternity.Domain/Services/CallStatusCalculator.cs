using Eternity.Domain.Constants;
using Eternity.Domain.Entities;

namespace Eternity.Domain.Services;

/// <summary>
/// Pure domain service for calculating call-level status from participant states.
/// Stateless and unit-testable independently — no database or infrastructure dependencies.
/// </summary>
public static class CallStatusCalculator
{
    /// <summary>
    /// Calculates the call-level status based on participant states.
    /// 
    /// Transition rules:
    /// - Active:    at least one participant is currently Joined
    /// - Completed: someone was in the call (Joined or Left) and everyone has now Left
    /// - Missed:    initiator left and no invitee ever joined
    /// - Cancelled: initiator left before anyone responded (all invitees still Ringing/Missed)
    /// - Declined:  all invitees explicitly declined, no one ever joined
    /// </summary>
    public static CallStatus Calculate(IReadOnlyList<CallParticipant> participants, Guid initiatorId) {
        if (participants.Count == 0) {
            return CallStatus.Cancelled;
        }

        var hasAnyJoined = participants.Any(p => p.Status == ParticipantStatus.Joined);
        if (hasAnyJoined) {
            return CallStatus.Active;
        }

        var invitees = participants.Where(p => p.UserId != initiatorId).ToList();
        var initiator = participants.FirstOrDefault(p => p.UserId == initiatorId);

        // If the initiator hasn't left yet, the call is still active (waiting)
        if (initiator is { Status: ParticipantStatus.Joined }) {
            return CallStatus.Active;
        }

        var anyInviteeEverJoined = invitees.Any(p =>
            p.Status == ParticipantStatus.Left || p.JoinedAt != null);

        if (anyInviteeEverJoined) {
            return CallStatus.Completed;
        }

        var allInviteesDeclined = invitees.Count > 0 &&
                                   invitees.All(p => p.Status == ParticipantStatus.Declined);
        if (allInviteesDeclined) {
            return CallStatus.Declined;
        }

        // Check if all invitees are still in non-responsive states (Ringing or Missed)
        // and the initiator has left — this means the initiator cancelled/gave up
        var allInviteesNonResponsive = invitees.All(p =>
            p.Status is ParticipantStatus.Ringing or ParticipantStatus.Missed);

        if (allInviteesNonResponsive && initiator is { Status: ParticipantStatus.Left }) {
            return CallStatus.Cancelled;
        }

        // Mixed: some declined, some didn't respond, initiator left
        // This is "Missed" because the call never connected
        var someDeclinedSomeMissed = invitees.Any(p => p.Status == ParticipantStatus.Declined)
                                     && invitees.Any(p =>
                                         p.Status is ParticipantStatus.Ringing or ParticipantStatus.Missed);

        if (someDeclinedSomeMissed && initiator is { Status: ParticipantStatus.Left }) {
            return CallStatus.Missed;
        }

        // Default: if no one is joined but call hasn't been terminated
        // This could happen if initiator is still Ringing (shouldn't normally occur)
        return CallStatus.Active;
    }
}
