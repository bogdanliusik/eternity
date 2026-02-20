using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Domain.Constants;
using MediatR;

namespace Eternity.Application.Sessions.Commands;

public record PingSessionCommand(Guid SessionId, string Message) : IRequest<Result<bool>>;

[Authorize(Policy = Policies.AdminOnly)]
public class PingSessionCommandHandler(IOnlineManager onlineManager) : IRequestHandler<PingSessionCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(PingSessionCommand request, 
        CancellationToken cancellationToken) {
        var delivered = await onlineManager.SendMessageToSessionAsync(
            request.SessionId, request.Message, cancellationToken);
        if (!delivered) {
            return Result<bool>.Failure(["Failed to deliver message to session."]);
        }
        return Result<bool>.Success(true);
    }
}
