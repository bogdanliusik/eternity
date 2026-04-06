using Eternity.Application.Calls.Models;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Users.Queries;

public record SearchUsersQuery(string? Search) : IRequest<Result<List<UserSummaryDto>>>;

public class SearchUsersQueryHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<SearchUsersQuery, Result<List<UserSummaryDto>>>
{
    public async Task<Result<List<UserSummaryDto>>> Handle(SearchUsersQuery request,
        CancellationToken cancellationToken) {
        var userId = currentUser.Id;
        var query = dbContext.UserAccounts.AsNoTracking().Where(u => u.Id != userId);
        if (!string.IsNullOrWhiteSpace(request.Search)) {
            var search = request.Search.Trim();
            query = query.Where(u =>
                u.UserName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.FullName.Contains(search, StringComparison.OrdinalIgnoreCase)
            );
        }
        var users = await query.OrderBy(u => u.FullName)
            .Take(20)
            .Select(u => new UserSummaryDto {
                Id = u.Id,
                Username = u.UserName,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                IsOnline = dbContext.UserSessions.Any(s => s.UserId == u.Id && s.IsOnline && !s.IsTerminated)
            })
            .ToListAsync(cancellationToken);
        return Result<List<UserSummaryDto>>.Success(users);
    }
}
