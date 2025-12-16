using Eternity.Application.Common.Models;

namespace Eternity.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<Result<Guid>> CreateUserAsync(string userName, string email, string password);
    Task<Result<Guid>> FindUserIdByNameAsync(string userName);
    Task<Result> DeleteUserByNameAsync(string userName);
    Task<Result<AppTokenInfo>> LoginAsync(string userName, string password);
    Task<Result<AppTokenInfo>> RefreshTokenAsync(AppTokenInfo oldTokenInfo);
    Task<bool> AuthorizeAsync(Guid userId, string policyName);
    Task<Result> DeleteUserAsync(string userId);
    Task<Result<IList<string>>> GetUserRolesAsync(Guid userId);
    Task<Result> SetUserLockoutEndAsync(Guid userId, DateTimeOffset? lockoutEnd);
    Task<Result> AddUserToRoleAsync(Guid userId, string role);
}
