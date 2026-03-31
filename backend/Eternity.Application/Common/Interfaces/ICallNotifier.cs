using Eternity.Application.Calls.Models;
using Eternity.Domain.Constants;

namespace Eternity.Application.Common.Interfaces;

/// <summary>
/// Abstraction for sending real-time call notifications to users.
/// Implemented in the WebApi layer using SignalR (GeneralHub for notifications, CallHub for in-call signaling).
/// </summary>
public interface ICallNotifier
{
    /// <summary>
    /// Notify invitees about an incoming call via GeneralHub (so it works from any page).
    /// </summary>
    Task NotifyIncomingCallAsync(string callId, CallParticipantDto initiator, CallType callType,
        List<CallParticipantDto> participants, List<Guid> inviteeUserIds);

    /// <summary>
    /// Notify participants in a call room that someone has joined.
    /// </summary>
    Task NotifyParticipantJoinedAsync(string callId, Guid userId, string username, string fullName);

    /// <summary>
    /// Notify participants in a call room that someone has left.
    /// </summary>
    Task NotifyParticipantLeftAsync(string callId, Guid userId);

    /// <summary>
    /// Notify participants in a call room that someone declined.
    /// </summary>
    Task NotifyCallDeclinedAsync(string callId, Guid userId);

    /// <summary>
    /// Notify all participants that the call has ended (terminal status reached).
    /// </summary>
    Task NotifyCallEndedAsync(string callId, string reason, List<Guid> participantUserIds);
}
