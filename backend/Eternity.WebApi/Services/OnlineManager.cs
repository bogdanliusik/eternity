using Eternity.Application.Common.Interfaces;
using Eternity.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Eternity.WebApi.Services;

public class OnlineManager(IHubContext<GeneralHub> hubContext, ConnectionTracker connectionTracker) : IOnlineManager
{
    public async Task<bool> SendMessageToSessionAsync(Guid sessionId, string message, 
        CancellationToken cancellationToken = default) {
        if (!connectionTracker.HasActiveConnections(sessionId)) {
            return false;
        }
        var group = ConnectionTracker.GetSessionGroup(sessionId);
        await hubContext.Clients.Group(group).SendAsync("ReceiveMessage", message, cancellationToken);
        return true;
    }
    
    public bool IsSessionOnline(Guid sessionId) {
        return connectionTracker.HasActiveConnections(sessionId);
    }
}
