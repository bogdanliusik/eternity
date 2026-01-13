using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Sessions.Commands;

public record TerminateSessionCommand(Guid SessionId) : IRequest<Result>;

[Authorize(Policy = Policies.AdminOnly)]
public class TerminateSessionCommandHandler(IAppDbContext dbContext) : IRequestHandler<TerminateSessionCommand, Result>
{
    public async Task<Result> Handle(TerminateSessionCommand request, CancellationToken cancellationToken) {
        var session = await dbContext.UserSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);
        if (session == null) {
            return Result.Failure(["Session not found"]);
        }
        if (session.IsTerminated) {
            return Result.Success();
        }
        session.Terminate();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
