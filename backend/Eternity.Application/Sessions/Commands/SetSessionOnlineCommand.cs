using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Sessions.Commands;

public record SetSessionOnlineCommand(Guid SessionId) : IRequest<Result>;

public class SetSessionOnlineCommandHandler(IAppDbContext dbContext) : IRequestHandler<SetSessionOnlineCommand, Result>
{
    public async Task<Result> Handle(SetSessionOnlineCommand request, CancellationToken cancellationToken) {
        var session = await dbContext.UserSessions.FirstOrDefaultAsync(
            s => s.Id == request.SessionId && !s.IsTerminated,
            cancellationToken
        );
        if (session != null) {
            session.SetOnline();
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        return Result.Success();
    }
}
