using Eternity.Application.Common.Models;

namespace Eternity.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<Result<Guid>> CreateUserAsync(string userName, string password);
    Task<Result<AppTokenInfo>> LoginAsync(string userId, string policyName);
    Task<Result<AppTokenInfo>> RefreshToken(AppTokenInfo oldTokenInfo);
    Task<bool> AuthorizeAsync(Guid userId, string policyName);
    Task<Result> DeleteUserAsync(Guid userId);
    Task<Result<IList<string>>> GetUserRolesAsync(Guid userId);
}
