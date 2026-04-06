using Eternity.Application.Common.Interfaces;
using Eternity.Application.Sessions.Commands;
using Eternity.WebApi.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Eternity.WebApi.Hubs;

[Authorize]
public class GeneralHub(
    ConnectionTracker connectionTracker,
    IMediator mediator,
    ICurrentUser currentUser,
    ILogger<GeneralHub> logger) : Hub
{
    public override async Task OnConnectedAsync() {
        if (!currentUser.IsAvailable) {
            Context.Abort();
            return;
        }
        var sessionId = currentUser.SessionId;
        var becameOnline = connectionTracker.AddConnection(sessionId, Context.ConnectionId);
        if (becameOnline) {
            await mediator.Send(new SetSessionOnlineCommand(sessionId));
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, ConnectionTracker.GetSessionGroup(sessionId));
        logger.LogInformation(
            "SignalR connected: session {SessionId}, connection {ConnectionId}",
            sessionId,
            Context.ConnectionId
        );
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception) {
        if (currentUser.IsAvailable) {
            var sessionId = currentUser.SessionId;
            var becameOffline = connectionTracker.RemoveConnection(sessionId, Context.ConnectionId);
            if (becameOffline) {
                await mediator.Send(new SetSessionOfflineCommand(sessionId));
            }
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConnectionTracker.GetSessionGroup(sessionId));
            logger.LogInformation(
                "SignalR disconnected: session {SessionId}, connection {ConnectionId}",
                sessionId,
                Context.ConnectionId
            );
        }
        await base.OnDisconnectedAsync(exception);
    }
}
