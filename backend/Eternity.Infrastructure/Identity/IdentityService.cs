using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Eternity.Infrastructure.Identity;

public class IdentityService(UserManager<ApplicationUser> userManager,
    IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
    IAuthorizationService authorizationService,
    IOptions<JwtSettings> jwtSettings,
    ILogger<IdentityService> logger
    ) : IIdentityService
{
    public async Task<Result<Guid>> CreateUserAsync(string userName, string password) {
        var user = new ApplicationUser {
            UserName = userName,
            Email = userName,
        };
        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded) {
            logger.LogInformation("User {UserName} created successfully", userName);
        } else {
            logger.LogWarning("Failed to create user {UserName}: {Errors}", 
                userName, string.Join(", ", result.Errors.Select(e => e.Description)));
        }
        return result.ToApplicationResult(user.Id);
    }
    
    public async Task<Result<AppTokenInfo>> LoginAsync(string userName, string password) {
        var identityUser = await userManager.FindByNameAsync(userName);
        if (identityUser == null) {
            logger.LogWarning("Login attempt failed: User {UserName} not found", userName);
            return Result<AppTokenInfo>.Failure(["Invalid credentials"]);
        }
        var isValidPassword = await userManager.CheckPasswordAsync(identityUser, password);
        if (!isValidPassword) {
            logger.LogWarning("Login attempt failed: Invalid password for user {UserName}", userName);
            return Result<AppTokenInfo>.Failure(["Invalid credentials"]);
        }
        logger.LogInformation("User {UserName} logged in successfully", userName);
        return await GenerateAppTokenInfo(identityUser);
    }

    public async Task<Result<AppTokenInfo>> RefreshTokenAsync(AppTokenInfo oldTokenInfo) {
        var principal = GetTokenPrincipal(oldTokenInfo.AccessToken);
        if (principal?.Identity?.Name == null) {
            logger.LogWarning("Refresh token attempt failed: Invalid access token");
            return Result<AppTokenInfo>.Failure(["Invalid access token"]);
        }
        var identityUser = await userManager.FindByNameAsync(principal.Identity.Name);
        if (identityUser == null) {
            logger.LogWarning("Refresh token attempt failed: User {UserName} not found", principal.Identity.Name);
            return Result<AppTokenInfo>.Failure(["User not found"]);
        }
        if (string.IsNullOrEmpty(identityUser.RefreshToken) || oldTokenInfo.RefreshToken != identityUser.RefreshToken) {
            logger.LogWarning("Refresh token attempt failed: Invalid refresh token for user {UserName}", 
                identityUser.UserName);
            return Result<AppTokenInfo>.Failure(["Invalid refresh token"]);
        }
        if (identityUser.RefreshTokenExpiry < DateTime.UtcNow) {
            logger.LogWarning("Refresh token attempt failed: Expired refresh token for user {UserName}", 
                identityUser.UserName);
            return Result<AppTokenInfo>.Failure(["Refresh token expired"]);
        }
        logger.LogInformation("Token refreshed successfully for user {UserName}", identityUser.UserName);
        return await GenerateAppTokenInfo(identityUser);
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
    
    private string GenerateAccessToken(string id, string userName, string email, IEnumerable<string> roles) {
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, id),
            new(ClaimTypes.Name, userName),
            new(ClaimTypes.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Value.SecretKey));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var securityToken = new JwtSecurityToken(
            issuer: jwtSettings.Value.Issuer,
            audience: jwtSettings.Value.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtSettings.Value.AccessTokenExpirationMinutes),
            signingCredentials: signingCredentials
        );
        return new JwtSecurityTokenHandler().WriteToken(securityToken);
    }
    
    private static string GenerateRefreshToken() {
        var randomNumber = new byte[64];
        using var numberGenerator = RandomNumberGenerator.Create();
        numberGenerator.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
    
    private ClaimsPrincipal? GetTokenPrincipal(string token) {
        try {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Value.SecretKey));
            var validation = new TokenValidationParameters {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = securityKey,
                ValidateLifetime = false, // We're validating expired tokens for refresh
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Value.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Value.Audience,
                ClockSkew = TimeSpan.Zero
            };
            return new JwtSecurityTokenHandler().ValidateToken(token, validation, out _);
        } catch (Exception ex) {
            logger.LogWarning(ex, "Failed to validate token");
            return null;
        }
    }

    private async Task<Result<AppTokenInfo>> GenerateAppTokenInfo(ApplicationUser identityUser) {
        if (string.IsNullOrEmpty(identityUser.UserName) || string.IsNullOrEmpty(identityUser.Email)) {
            return Result<AppTokenInfo>.Failure(["Invalid user"]);
        }
        var roles = await userManager.GetRolesAsync(identityUser);
        var accessToken = GenerateAccessToken(
            identityUser.Id.ToString(), 
            identityUser.UserName,
            identityUser.Email,
            roles
        );
        var refreshToken = GenerateRefreshToken();
        identityUser.RefreshToken = refreshToken;
        identityUser.RefreshTokenExpiry = DateTime.UtcNow.AddDays(jwtSettings.Value.RefreshTokenExpirationDays);
        await userManager.UpdateAsync(identityUser);
        return Result<AppTokenInfo>.Success(new AppTokenInfo(accessToken, refreshToken));
    }
}