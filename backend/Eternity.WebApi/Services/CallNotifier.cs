using Eternity.Application.Calls.Models;
using Eternity.Application.Common.Interfaces;
using Eternity.Domain.Constants;
using Eternity.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.WebApi.Services;

/// <summary>
///     Implements ICallNotifier using SignalR.
///     - Incoming call notifications go through GeneralHub (always connected) so users receive them on any page.
///     - In-call signaling (participant joined/left/declined, call ended) goes through CallHub groups.
/// </summary>
public partial class CallNotifier(
    IHubContext<GeneralHub> generalHubContext,
    IHubContext<CallHub> callHubContext,
    IAppDbContext dbContext,
    ILogger<CallNotifier> logger) : ICallNotifier
{
    public async Task NotifyIncomingCallAsync(Guid callId, CallParticipantDto initiator, CallType callType,
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
        var sessionIds = await dbContext.UserSessions.AsNoTracking()
            .Where(s => inviteeUserIds.Contains(s.UserId) && s.IsOnline && !s.IsTerminated)
            .Select(s => s.Id)
            .ToListAsync();
        var sendTasks = sessionIds.Select(sid =>
            generalHubContext.Clients.Group(ConnectionTracker.GetSessionGroup(sid))
                .SendAsync("IncomingCall", notification)
        );
        await Task.WhenAll(sendTasks);
        LogIncomingCallNotification(logger, callId, sessionIds.Count, inviteeUserIds.Count);
    }

    public async Task NotifyParticipantJoinedAsync(Guid callId, Guid userId, string username, string fullName) {
        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await callHubContext.Clients.Group(callGroup)
            .SendAsync("ParticipantJoined", new { callId, userId, username, fullName });
        LogParticipantJoined(logger, callId, userId);
    }

    public async Task NotifyParticipantLeftAsync(Guid callId, Guid userId) {
        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await callHubContext.Clients.Group(callGroup).SendAsync("ParticipantLeft", new { callId, userId });
        LogParticipantLeft(logger, callId, userId);
    }

    public async Task NotifyCallDeclinedAsync(Guid callId, Guid userId) {
        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await callHubContext.Clients.Group(callGroup).SendAsync("ParticipantDeclined", new { callId, userId });
        var initiatorId = await dbContext.Calls.AsNoTracking()
            .Where(c => c.Id == callId)
            .Select(c => c.InitiatorId)
            .FirstOrDefaultAsync();
        if (initiatorId != Guid.Empty) {
            var sessionIds = await dbContext.UserSessions.AsNoTracking()
                .Where(s => s.UserId == initiatorId && s.IsOnline && !s.IsTerminated)
                .Select(s => s.Id)
                .ToListAsync();
            var sendTasks = sessionIds.Select(sid =>
                generalHubContext.Clients.Group(ConnectionTracker.GetSessionGroup(sid))
                    .SendAsync("CallDeclined", new { callId, userId })
            );
            await Task.WhenAll(sendTasks);
        }
        LogCallDeclined(logger, userId, callId);
    }

    public async Task NotifyCallEndedAsync(Guid callId, string reason, List<Guid> participantUserIds) {
        var payload = new { callId, reason };
        var callGroup = CallConnectionTracker.GetCallGroup(callId);
        await callHubContext.Clients.Group(callGroup).SendAsync("CallEnded", payload);
        var sessionIds = await dbContext.UserSessions.AsNoTracking()
            .Where(s => participantUserIds.Contains(s.UserId) && s.IsOnline && !s.IsTerminated)
            .Select(s => s.Id)
            .ToListAsync();
        var sendTasks = sessionIds.Select(sid =>
            generalHubContext.Clients.Group(ConnectionTracker.GetSessionGroup(sid)).SendAsync("CallEnded", payload)
        );
        await Task.WhenAll(sendTasks);
        LogCallEnded(logger, callId, reason);
    }

    [LoggerMessage(Level = LogLevel.Information,
        Message = "Sent incoming call notification for call {CallId} to {Count} session(s) of {UserCount} invitee(s)")]
    private static partial void LogIncomingCallNotification(ILogger logger, Guid callId, int count, int userCount);

    [LoggerMessage(Level = LogLevel.Information, Message = "Notified call {CallId} that user {UserId} joined")]
    private static partial void LogParticipantJoined(ILogger logger, Guid callId, Guid userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Notified call {CallId} that user {UserId} left")]
    private static partial void LogParticipantLeft(ILogger logger, Guid callId, Guid userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Notified that user {UserId} declined call {CallId}")]
    private static partial void LogCallDeclined(ILogger logger, Guid userId, Guid callId);

    [LoggerMessage(Level = LogLevel.Information,
        Message = "Notified all participants that call {CallId} ended: {Reason}")]
    private static partial void LogCallEnded(ILogger logger, Guid callId, string reason);
}
