using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Sessions.Commands;

public record SetSessionOfflineCommand(Guid SessionId) : IRequest<Result>;

public class SetSessionOfflineCommandHandler(IAppDbContext dbContext)
    : IRequestHandler<SetSessionOfflineCommand, Result>
{
    public async Task<Result> Handle(SetSessionOfflineCommand request, CancellationToken cancellationToken) {
        var session = await dbContext.UserSessions.FirstOrDefaultAsync(
            s => s.Id == request.SessionId,
            cancellationToken
        );
        if (session != null) {
            session.SetOffline();
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        return Result.Success();
    }
}
