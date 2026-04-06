using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Domain.Entities;
using Eternity.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Eternity.Infrastructure.Identity;

public class IdentityService(
    UserManager<ApplicationUser> userManager,
    IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
    IAuthorizationService authorizationService,
    IOptions<JwtSettings> jwtSettings,
    AppDbContext dbContext,
    ILogger<IdentityService> logger) : IIdentityService
{
    public async Task<Result<Guid>> CreateUserAsync(string userName, string email, string password) {
        var user = new ApplicationUser { UserName = userName, Email = email };
        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded) {
            logger.LogInformation("User {UserName} created successfully", userName);
        } else {
            logger.LogWarning(
                "Failed to create user {UserName}: {Errors}",
                userName,
                string.Join(", ", result.Errors.Select(e => e.Description))
            );
        }
        return result.ToApplicationResult(user.Id);
    }

    public async Task<Result<Guid>> FindUserIdByNameAsync(string userName) {
        var user = await userManager.FindByNameAsync(userName);
        if (user == null) {
            return Result<Guid>.Failure([$"User {userName} not found"]);
        }
        return Result<Guid>.Success(user.Id);
    }

    public async Task<Result> DeleteUserByNameAsync(string userName) {
        var user = await userManager.FindByNameAsync(userName);
        if (user == null) {
            return Result.Success();
        }
        var result = await userManager.DeleteAsync(user);
        return result.ToApplicationResult();
    }

    public async Task<Result<AppTokenInfo>> LoginAsync(string userName, string password, string? ipAddress,
        string? userAgent) {
        var identityUser = await userManager.FindByNameAsync(userName);
        if (identityUser == null) {
            logger.LogWarning("Login attempt failed: User {UserName} not found", userName);
            return Result<AppTokenInfo>.Failure(["Invalid credentials"]);
        }
        var lockoutCheck = CheckLockout(identityUser);
        if (!lockoutCheck.Succeeded) {
            return lockoutCheck;
        }
        var isValidPassword = await userManager.CheckPasswordAsync(identityUser, password);
        if (!isValidPassword) {
            logger.LogWarning("Login attempt failed: Invalid password for user {UserName}", userName);
            return Result<AppTokenInfo>.Failure(["Invalid credentials"]);
        }
        logger.LogInformation("User {UserName} logged in successfully", userName);
        return await GenerateAppTokenInfo(identityUser, ipAddress, userAgent);
    }

    public async Task<Result<AppTokenInfo>> RefreshTokenAsync(Guid sessionId) {
        var session = await dbContext.UserSessions.FirstOrDefaultAsync(s => s.Id == sessionId && !s.IsTerminated);
        if (session == null) {
            logger.LogWarning("Refresh token attempt failed: Session {SessionId} not found or terminated", sessionId);
            return Result<AppTokenInfo>.Failure(["Invalid session"]);
        }
        if (session.RefreshTokenExpiry < DateTime.UtcNow) {
            logger.LogWarning("Refresh token attempt failed: Expired refresh token for session {SessionId}", sessionId);
            session.Terminate();
            await dbContext.SaveChangesAsync(CancellationToken.None);
            return Result<AppTokenInfo>.Failure(["Refresh token expired"]);
        }
        var identityUser = await userManager.FindByIdAsync(session.UserId.ToString());
        if (identityUser == null) {
            logger.LogWarning("Refresh token attempt failed: User {UserId} not found", session.UserId);
            return Result<AppTokenInfo>.Failure(["User not found"]);
        }
        var lockoutCheck = CheckLockout(identityUser);
        if (!lockoutCheck.Succeeded) {
            return lockoutCheck;
        }
        logger.LogInformation(
            "Token refreshed successfully for user {UserName}, session {SessionId}",
            identityUser.UserName,
            sessionId
        );
        return await GenerateAppTokenInfoForExistingSession(identityUser, session);
    }

    public async Task<bool> IsSessionValidAsync(Guid sessionId) {
        var session = await dbContext.UserSessions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == sessionId);
        return session is { IsActive: true };
    }

    public async Task<bool> AuthorizeAsync(Guid userId, string policyName) {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) {
            return false;
        }
        var principal = await userClaimsPrincipalFactory.CreateAsync(user);
        var result = await authorizationService.AuthorizeAsync(principal, policyName);
        return result.Succeeded;
    }

    public async Task<Result> DeleteUserAsync(string userId) {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) {
            return Result.Success();
        }
        var result = await userManager.DeleteAsync(user);
        if (result.Succeeded) {
            logger.LogInformation("User {UserId} deleted successfully", userId);
        }
        return result.ToApplicationResult();
    }

    public async Task<Result<IList<string>>> GetUserRolesAsync(Guid userId) {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) {
            return Result<IList<string>>.Failure([$"User with ID {userId} not found"]);
        }
        var roles = await userManager.GetRolesAsync(user);
        return Result<IList<string>>.Success(roles);
    }

    public async Task<Result> SetUserLockoutEndAsync(Guid userId, DateTimeOffset? lockoutEnd) {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) {
            return Result.Failure(["User not found"]);
        }
        var result = await userManager.SetLockoutEndDateAsync(user, lockoutEnd);
        if (result.Succeeded) {
            await userManager.SetLockoutEnabledAsync(user, lockoutEnd.HasValue);
            logger.LogInformation("Lockout for user {UserId} set to {Lockout}", userId, lockoutEnd);
            return Result.Success();
        }
        return result.ToApplicationResult();
    }

    public async Task<Result> AddUserToRoleAsync(Guid userId, string role) {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) {
            return Result.Failure(["User not found"]);
        }
        var result = await userManager.AddToRoleAsync(user, role);
        return result.ToApplicationResult();
    }

    private Result<AppTokenInfo> CheckLockout(ApplicationUser identityUser) {
        if (identityUser is { LockoutEnabled: true, LockoutEnd: not null } &&
            identityUser.LockoutEnd > DateTimeOffset.UtcNow) {
            logger.LogWarning(
                "User {UserName} is locked out until {LockoutEnd}",
                identityUser.UserName,
                identityUser.LockoutEnd
            );
            return Result<AppTokenInfo>.Failure(["User is not approved or is locked."]);
        }
        return Result<AppTokenInfo>.Success(null!);
    }

    private string GenerateAccessToken(string id, string userName, string email, IEnumerable<string> roles,
        Guid sessionId) {
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, id),
            new(ClaimTypes.Name, userName),
            new(ClaimTypes.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Sid, sessionId.ToString())
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Value.SecretKey));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var securityToken = new JwtSecurityToken(
            jwtSettings.Value.Issuer,
            jwtSettings.Value.Audience,
            claims,
            expires: DateTime.UtcNow.AddSeconds(jwtSettings.Value.AccessTokenExpirationSeconds),
            signingCredentials: signingCredentials
        );
        return new JwtSecurityTokenHandler().WriteToken(securityToken);
    }

    private static string GenerateRefreshToken() {
        var randomNumber = new byte[64];
        using var numberGenerator = RandomNumberGenerator.Create();
        numberGenerator.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }

    private async Task<Result<AppTokenInfo>> GenerateAppTokenInfo(ApplicationUser identityUser, string? ipAddress,
        string? userAgent) {
        if (string.IsNullOrEmpty(identityUser.UserName) || string.IsNullOrEmpty(identityUser.Email)) {
            return Result<AppTokenInfo>.Failure(["Invalid user"]);
        }
        var roles = await userManager.GetRolesAsync(identityUser);
        var refreshToken = GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddMinutes(jwtSettings.Value.RefreshTokenExpirationMinutes);

        // Create new session
        var session = UserSession.Create(identityUser.Id, refreshToken, refreshTokenExpiry, ipAddress, userAgent);
        dbContext.UserSessions.Add(session);
        await dbContext.SaveChangesAsync(CancellationToken.None);
        var accessToken = GenerateAccessToken(
            identityUser.Id.ToString(),
            identityUser.UserName,
            identityUser.Email,
            roles,
            session.Id
        );
        return Result<AppTokenInfo>.Success(new AppTokenInfo(accessToken, session.Id));
    }

    private async Task<Result<AppTokenInfo>> GenerateAppTokenInfoForExistingSession(ApplicationUser identityUser,
        UserSession session) {
        if (string.IsNullOrEmpty(identityUser.UserName) || string.IsNullOrEmpty(identityUser.Email)) {
            return Result<AppTokenInfo>.Failure(["Invalid user"]);
        }
        var roles = await userManager.GetRolesAsync(identityUser);
        var refreshToken = GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddMinutes(jwtSettings.Value.RefreshTokenExpirationMinutes);

        // Update existing session with new refresh token
        session.UpdateRefreshToken(refreshToken, refreshTokenExpiry);
        await dbContext.SaveChangesAsync(CancellationToken.None);
        var accessToken = GenerateAccessToken(
            identityUser.Id.ToString(),
            identityUser.UserName,
            identityUser.Email,
            roles,
            session.Id
        );
        return Result<AppTokenInfo>.Success(new AppTokenInfo(accessToken, session.Id));
    }
}
