using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Sessions.Commands;

public record TerminateCurrentSessionCommand : IRequest<Result>;

public class TerminateCurrentSessionCommandHandler(IAppDbContext dbContext, ICurrentUser currentUser) 
    : IRequestHandler<TerminateCurrentSessionCommand, Result>
{
    public async Task<Result> Handle(TerminateCurrentSessionCommand request, CancellationToken cancellationToken) {
        var session = await dbContext.UserSessions.FirstOrDefaultAsync(
            s => s.Id == currentUser.SessionId, cancellationToken);
        if (session == null) {
            return Result.Failure(["Session not found"]);
        }
        if (!session.IsTerminated) {
            session.Terminate();
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        return Result.Success();
    }
}
