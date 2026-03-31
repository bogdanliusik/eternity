using Eternity.Application.Calls.Models;
using Eternity.Application.Common.Interfaces;
using Eternity.Domain.Constants;
using Eternity.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.WebApi.Services;

/// <summary>
/// Implements ICallNotifier using SignalR.
/// - Incoming call notifications go through GeneralHub (always connected) so users receive them on any page.
/// - In-call signaling (participant joined/left/declined, call ended) goes through CallHub groups.
/// </summary>
public class CallNotifier(
    IHubContext<GeneralHub> generalHubContext,
    IHubContext<CallHub> callHubContext,
    IAppDbContext dbContext,
    ILogger<CallNotifier> logger) : ICallNotifier
{
    public async Task NotifyIncomingCallAsync(string callId, CallParticipantDto initiator, CallType callType,
        List<CallParticipantDto> participants, List<Guid> inviteeUserIds) {
        var notification = new {
            callId,
            callType,
            initiator = new {
                userId = initiator.UserId,
                username = initiator.Username,
                fullName = initiator.FullName,
                avatarUrl = initiator.AvatarUrl
            },
            participants = participants.Select(p => new {
                userId = p.UserId,
                username = p.Username,
                fullName = p.FullName,
                avatarUrl = p.AvatarUrl,
                participantStatus = p.ParticipantStatus
            })
        };

        var sessionIds = await dbContext.UserSessions
            .AsNoTracking()
            .Where(s => inviteeUserIds.Contains(s.UserId) && s.IsOnline && !s.IsTerminated)
            .Select(s => s.Id)
            .ToListAsync();

        var sendTasks = sessionIds
            .Select(sid => generalHubContext.Clients
                .Group(ConnectionTracker.GetSessionGroup(sid))
                .SendAsync("IncomingCall", notification));

        await Task.WhenAll(sendTasks);

        logger.LogInformation(
            "Sent incoming call notification for call {CallId} to {Count} session(s) of {UserCount} invitee(s)",
            callId, sessionIds.Count, inviteeUserIds.Count);
    }

    public async Task NotifyParticipantJoinedAsync(string callId, Guid userId, string username, string fullName) {
        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await callHubContext.Clients.Group(callGroup).SendAsync("ParticipantJoined", new {
            callId,
            userId,
            username,
            fullName
        });

        logger.LogInformation("Notified call {CallId} that user {UserId} joined", callId, userId);
    }

    public async Task NotifyParticipantLeftAsync(string callId, Guid userId) {
        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await callHubContext.Clients.Group(callGroup).SendAsync("ParticipantLeft", new {
            callId,
            userId
        });

        logger.LogInformation("Notified call {CallId} that user {UserId} left", callId, userId);
    }

    public async Task NotifyCallDeclinedAsync(string callId, Guid userId) {
        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await callHubContext.Clients.Group(callGroup).SendAsync("ParticipantDeclined", new {
            callId,
            userId
        });

        // Notify only the initiator via GeneralHub so they can dismiss the ringing UI
        // (they might not have joined CallHub yet if the call hasn't connected)
        var initiatorId = await dbContext.Calls
            .AsNoTracking()
            .Where(c => c.Id == callId)
            .Select(c => c.InitiatorId)
            .FirstOrDefaultAsync();

        if (initiatorId != default) {
            var sessionIds = await dbContext.UserSessions
                .AsNoTracking()
                .Where(s => s.UserId == initiatorId && s.IsOnline && !s.IsTerminated)
                .Select(s => s.Id)
                .ToListAsync();

            var sendTasks = sessionIds
                .Select(sid => generalHubContext.Clients
                    .Group(ConnectionTracker.GetSessionGroup(sid))
                    .SendAsync("CallDeclined", new { callId, userId }));

            await Task.WhenAll(sendTasks);
        }

        logger.LogInformation("Notified that user {UserId} declined call {CallId}", userId, callId);
    }

    public async Task NotifyCallEndedAsync(string callId, string reason, List<Guid> participantUserIds) {
        var payload = new { callId, reason };

        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await callHubContext.Clients.Group(callGroup).SendAsync("CallEnded", payload);

        var sessionIds = await dbContext.UserSessions
            .AsNoTracking()
            .Where(s => participantUserIds.Contains(s.UserId) && s.IsOnline && !s.IsTerminated)
            .Select(s => s.Id)
            .ToListAsync();

        var sendTasks = sessionIds
            .Select(sid => generalHubContext.Clients
                .Group(ConnectionTracker.GetSessionGroup(sid))
                .SendAsync("CallEnded", payload));

        await Task.WhenAll(sendTasks);

        logger.LogInformation("Notified all participants that call {CallId} ended: {Reason}", callId, reason);
    }
}
