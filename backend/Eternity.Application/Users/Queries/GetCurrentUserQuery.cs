using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Users.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Users.Queries;

public record GetCurrentUserQuery: IRequest<Result<UserDto>>;

public class GetCurrentUserQueryHandler(IAppDbContext dbContext, ICurrentUser currentUser, 
    IIdentityService identityService)
    : IRequestHandler<GetCurrentUserQuery, Result<UserDto>>
{
    public async Task<Result<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken) {
        var result = await identityService.GetUserRolesAsync(currentUser.Id);
        if (!result.Succeeded) {
            return Result<UserDto>.Failure(result.Errors);
        }
        var user = await dbContext.UserAccounts
            .Select(u => new UserDto {
                Id = u.Id,
                Username = u.UserName,
                Email = u.Email,
                AvatarUrl = u.AvatarUrl,
                IsOnline = u.IsOnline,
                Roles = result.Data
            })
            .FirstAsync(u => u.Id == currentUser.Id, cancellationToken);
        return Result<UserDto>.Success(user);
    }
}
