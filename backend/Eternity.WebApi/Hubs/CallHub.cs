using Eternity.Application.Calls.Commands;
using Eternity.Application.Common.Interfaces;
using Eternity.WebApi.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Eternity.WebApi.Hubs;

[Authorize]
public class CallHub(
    CallConnectionTracker callConnectionTracker,
    IMediator mediator,
    ICurrentUser currentUser,
    ILogger<CallHub> logger) : Hub
{
    /// <summary>
    /// Called by the client after connecting to join a specific call room.
    /// Enforces one-active-call-per-session at the hub level, then delegates to JoinCallCommand.
    /// </summary>
    public async Task JoinCall(string callId) {
        if (!currentUser.IsAvailable) {
            await Clients.Caller.SendAsync("CallError", "Unauthorized.");
            return;
        }

        var userId = currentUser.Id;
        var sessionId = currentUser.SessionId;

        if (callConnectionTracker.IsSessionInAnyCall(userId, sessionId)) {
            if (callConnectionTracker.IsSessionInCall(callId, userId, sessionId)) {
                var existingConnectionId = callConnectionTracker.GetConnectionIdForSession(callId, userId, sessionId);
                if (existingConnectionId != null && existingConnectionId != Context.ConnectionId) {
                    await Clients.Caller.SendAsync("CallError", "You are already in this call from another tab.");
                    return;
                }
            } else {
                await Clients.Caller.SendAsync("CallError", "You are already in another active call from this session.");
                return;
            }
        }

        var result = await mediator.Send(new JoinCallCommand(callId));
        if (!result.Succeeded) {
            await Clients.Caller.SendAsync("CallError", result.Errors.FirstOrDefault() ?? "Failed to join call.");
            return;
        }

        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        callConnectionTracker.AddSessionToCall(callId, userId, sessionId, Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, callGroup);

        var callDto = result.Data;
        var participant = callDto.Participants.FirstOrDefault(p => p.UserId == userId);
        if (participant != null) {
            await Clients.OthersInGroup(callGroup).SendAsync("ParticipantJoined", new {
                callId,
                userId,
                username = participant.Username,
                fullName = participant.FullName,
                avatarUrl = participant.AvatarUrl
            });
        }

        await Clients.Caller.SendAsync("CallJoined", callDto);

        var existingPeers = callConnectionTracker.GetExistingPeerRegistrations(callId, userId);
        foreach (var (peerUserId, peerId) in existingPeers) {
            await Clients.Caller.SendAsync("PeerIdRegistered", new {
                userId = peerUserId,
                peerId
            });
        }

        var existingMediaStates = callConnectionTracker.GetExistingMediaStates(callId, userId);
        foreach (var (mediaUserId, audioEnabled, videoEnabled) in existingMediaStates) {
            await Clients.Caller.SendAsync("MediaStateChanged", new {
                userId = mediaUserId,
                audioEnabled,
                videoEnabled
            });
        }

        logger.LogInformation("User {UserId} (session {SessionId}) joined call {CallId}, connection {ConnectionId}",
            userId, sessionId, callId, Context.ConnectionId);
    }

    /// <summary>
    /// Client registers its PeerJS peer ID so other participants can establish WebRTC connections.
    /// </summary>
    public async Task RegisterPeerId(string callId, string peerId) {
        if (!currentUser.IsAvailable) return;

        var userId = currentUser.Id;
        var sessionId = currentUser.SessionId;
        callConnectionTracker.SetPeerId(callId, userId, sessionId, peerId);

        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await Clients.OthersInGroup(callGroup).SendAsync("PeerIdRegistered", new {
            userId,
            peerId
        });

        logger.LogInformation("User {UserId} registered peerId {PeerId} in call {CallId}",
            userId, peerId, callId);
    }

    /// <summary>
    /// Client broadcasts a change in their media state (mic/camera toggle) to all other participants.
    /// </summary>
    public async Task NotifyMediaStateChanged(string callId, bool audioEnabled, bool videoEnabled) {
        if (!currentUser.IsAvailable) return;

        callConnectionTracker.SetMediaState(callId, currentUser.Id, currentUser.SessionId, audioEnabled, videoEnabled);

        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await Clients.OthersInGroup(callGroup).SendAsync("MediaStateChanged", new {
            userId = currentUser.Id,
            audioEnabled,
            videoEnabled
        });
    }

    /// <summary>
    /// Client explicitly leaves a call room.
    /// Only triggers domain-level Leave if no other session of this user is in the call.
    /// </summary>
    public async Task LeaveCall(string callId) {
        if (!currentUser.IsAvailable) return;

        var userId = currentUser.Id;
        var sessionId = currentUser.SessionId;

        var callGroup = CallConnectionTracker.GetCallGroup(callId);

        callConnectionTracker.RemoveSessionFromCall(callId, userId, sessionId, Context.ConnectionId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, callGroup);

        if (!callConnectionTracker.IsUserInCall(callId, userId)) {
            var result = await mediator.Send(new LeaveCallCommand(callId));
            if (!result.Succeeded) {
                await Clients.Caller.SendAsync("CallError", result.Errors.FirstOrDefault() ?? "Failed to leave call.");
                return;
            }

            await Clients.OthersInGroup(callGroup).SendAsync("ParticipantLeft", new {
                callId,
                userId
            });

            if (result.Data.CallEnded) {
                await Clients.Group(callGroup).SendAsync("CallEnded", new {
                    callId,
                    reason = "All participants left."
                });
            }
        }

        await Clients.Caller.SendAsync("CallLeft", new { callId });

        logger.LogInformation("User {UserId} (session {SessionId}) left call {CallId}", userId, sessionId, callId);
    }

    /// <summary>
    /// Send a WebRTC signaling message to a specific user in the call.
    /// Currently unused (PeerJS handles its own signaling), but kept as a fallback mechanism.
    /// </summary>
    public async Task SendSignal(string callId, Guid targetUserId, object signal) {
        if (!currentUser.IsAvailable) return;

        var usersInCall = callConnectionTracker.GetUsersInCall(callId);
        if (!usersInCall.Contains(targetUserId)) return;

        var targetConnectionIds = callConnectionTracker.GetConnectionIdsForUser(callId, targetUserId);
        var sendTasks = targetConnectionIds
            .Select(connId => Clients.Client(connId).SendAsync("SignalReceived", new {
                fromUserId = currentUser.Id,
                signal
            }));

        await Task.WhenAll(sendTasks);
    }

    public override async Task OnDisconnectedAsync(Exception? exception) {
        if (currentUser.IsAvailable) {
            var sessionKey = callConnectionTracker.GetSessionKeyByConnection(Context.ConnectionId);
            var callId = callConnectionTracker.GetCallIdByConnection(Context.ConnectionId);

            if (callId != null && sessionKey != null) {
                var userId = sessionKey.UserId;
                var sessionId = sessionKey.SessionId;

                var callGroup = CallConnectionTracker.GetCallGroup(callId);
                callConnectionTracker.RemoveSessionFromCall(callId, userId, sessionId, Context.ConnectionId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, callGroup);

                if (!callConnectionTracker.IsUserInCall(callId, userId)) {
                    var result = await mediator.Send(new LeaveCallCommand(callId));

                    await Clients.Group(callGroup).SendAsync("ParticipantLeft", new {
                        callId,
                        userId
                    });

                    if (result.Succeeded && result.Data.CallEnded) {
                        await Clients.Group(callGroup).SendAsync("CallEnded", new {
                            callId,
                            reason = "All participants disconnected."
                        });
                    }
                }

                logger.LogInformation("User {UserId} (session {SessionId}) disconnected from call {CallId}",
                    userId, sessionId, callId);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
