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
        var session = await dbContext.UserSessions
            .AsNoTracking()
            .Where(s => s.Id == currentUser.SessionId)
            .Select(s => new UserSessionDto {
                Id = s.Id,
                UserId = s.UserId,
                StartedAt = s.StartedAt,
                EndedAt = s.EndedAt,
                IpAddress = s.IpAddress,
                DeviceInfo = s.DeviceInfo,
                BrowserInfo = s.BrowserInfo,
                IsActive = !s.IsTerminated && s.RefreshTokenExpiry > DateTime.UtcNow,
                IsCurrentSession = true
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (session == null) {
            return Result<UserSessionDto>.Failure(["Session not found"]);
        }
        return Result<UserSessionDto>.Success(session);
    }
}
