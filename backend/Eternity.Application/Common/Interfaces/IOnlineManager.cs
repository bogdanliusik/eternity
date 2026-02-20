namespace Eternity.Application.Common.Interfaces;

public interface IOnlineManager
{
    bool IsSessionOnline(Guid sessionId);
    Task<bool> SendMessageToSessionAsync(Guid sessionId, string message, CancellationToken cancellationToken = default);
}
