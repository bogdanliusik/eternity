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
public record GetAllSessionsQuery(int PageNumber, int PageSize, bool? IsActive = null) 
    : IRequest<Result<PaginatedList<UserSessionDto>>>, IPaginatedQuery;

public class GetAllSessionsQueryHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<GetAllSessionsQuery, Result<PaginatedList<UserSessionDto>>>
{
    public async Task<Result<PaginatedList<UserSessionDto>>> Handle(GetAllSessionsQuery request, 
        CancellationToken cancellationToken) {
        var query = dbContext.UserSessions.AsNoTracking();
        if (request.IsActive.HasValue) {
            var now = DateTime.UtcNow;
            if (request.IsActive.Value) {
                query = query.Where(s => !s.IsTerminated && s.RefreshTokenExpiry > now);
            } else {
                query = query.Where(s => s.IsTerminated || s.RefreshTokenExpiry <= now);
            }
        }
        var sessions = await query
            .OrderByDescending(s => s.StartedAt)
            .Select(s => new UserSessionDto {
                Id = s.Id,
                UserId = s.UserId,
                StartedAt = s.StartedAt,
                EndedAt = s.EndedAt,
                IpAddress = s.IpAddress,
                DeviceInfo = s.DeviceInfo,
                BrowserInfo = s.BrowserInfo,
                IsActive = !s.IsTerminated && s.RefreshTokenExpiry > DateTime.UtcNow,
                IsCurrentSession = currentUser.SessionId == s.Id
            })
            .PaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
        return Result<PaginatedList<UserSessionDto>>.Success(sessions);
    }
}
