using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Sessions.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Sessions.Queries;

public record GetCurrentSessionQuery : IRequest<Result<UserSessionDto>>;

public class GetCurrentSessionQueryHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<GetCurrentSessionQuery, Result<UserSessionDto>>
{
    public async Task<Result<UserSessionDto>> Handle(GetCurrentSessionQuery request,
        CancellationToken cancellationToken) {
        var now = DateTime.UtcNow;
        var session = await dbContext.UserSessions.AsNoTracking()
            .Where(s => s.Id == currentUser.SessionId)
            .ProjectWithUser(dbContext.UserAccounts.AsNoTracking(), currentUser.SessionId, now)
            .FirstOrDefaultAsync(cancellationToken);
        if (session == null) {
            return Result<UserSessionDto>.Failure(["Session not found"]);
        }
        return Result<UserSessionDto>.Success(session);
    }
}
