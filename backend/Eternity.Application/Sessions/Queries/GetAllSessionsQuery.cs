using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Mapping;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Application.Sessions.Models;
using Eternity.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Sessions.Queries;

[Authorize(Policy = Policies.AdminOnly)]
public record GetAllSessionsQuery(int PageNumber, int PageSize, bool? IsActive = null, bool? IsOnline = null)
    : IRequest<Result<PaginatedList<UserSessionDto>>>, IPaginatedQuery;

public class GetAllSessionsQueryHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<GetAllSessionsQuery, Result<PaginatedList<UserSessionDto>>>
{
    public async Task<Result<PaginatedList<UserSessionDto>>> Handle(GetAllSessionsQuery request,
        CancellationToken cancellationToken) {
        var now = DateTime.UtcNow;
        var query = dbContext.UserSessions.AsNoTracking();
        if (request.IsActive.HasValue) {
            if (request.IsActive.Value) {
                query = query.Where(s => !s.IsTerminated && s.RefreshTokenExpiry > now);
            } else {
                query = query.Where(s => s.IsTerminated || s.RefreshTokenExpiry <= now);
            }
        }
        if (request.IsOnline.HasValue) {
            query = query.Where(s => s.IsOnline == request.IsOnline.Value);
        }
        var sessions = await query.ProjectWithUser(dbContext.UserAccounts.AsNoTracking(), currentUser.SessionId, now)
            .OrderByDescending(s => s.StartedAt)
            .PaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
        return Result<PaginatedList<UserSessionDto>>.Success(sessions);
    }
}
