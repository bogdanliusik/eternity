using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Eternity.Infrastructure.Identity;

public class IdentityService(UserManager<ApplicationUser> userManager, 
    IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
    IAuthorizationService authorizationService
    ) : IIdentityService
{
    public async Task<Result<Guid>> CreateUserAsync(string userName, string password) {
        var user = new ApplicationUser {
            UserName = userName,
            Email = userName,
        };
        var result = await userManager.CreateAsync(user, password);
        return result.ToApplicationResult(user.Id);
    }
    
    public async Task<Result<AppTokenInfo>> LoginAsync(string userName, string password) {
        var identityUser = await userManager.FindByNameAsync(userName);
        if (identityUser == null) {
            return Result<AppTokenInfo>.Failure([$"User {userName} not found"]);
        }
        var isValidPassword = await userManager.CheckPasswordAsync(identityUser, password);
        if (!isValidPassword) {
            return Result<AppTokenInfo>.Failure(["Invalid password"]);
        }
        return await GenerateAppTokenInfo(identityUser);
    }

    public async Task<Result<AppTokenInfo>> RefreshToken(AppTokenInfo oldTokenInfo) {
        var principal = GetTokenPrincipal(oldTokenInfo.AccessToken);
        if (principal == null || string.IsNullOrEmpty(principal.Identity?.Name)) {
            return Result<AppTokenInfo>.Failure(["Invalid access token"]);
        }
        var identityUser = await userManager.FindByNameAsync(principal.Identity.Name);
        if (identityUser == null) {
            return Result<AppTokenInfo>.Failure(["User not found"]);
        }
        if (oldTokenInfo.RefreshToken != identityUser.RefreshToken) {
            return Result<AppTokenInfo>.Failure(["Invalid refresh token provided"]);
        }
        if (identityUser.RefreshTokenExpiry < DateTime.Now) {
            return Result<AppTokenInfo>.Failure(["Refresh token expired"]);
        }
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

    public async Task<Result> DeleteUserAsync(Guid userId) {
        var user = await userManager.FindByIdAsync(userId.ToString());
        return user != null ? await DeleteUserAsync(user) : Result.Success();
    }
    
    public async Task<Result<IList<string>>> GetUserRolesAsync(Guid userId) {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) {
            return Result<IList<string>>.Failure([$"User with ID {userId} not found"]);
        }
        var roles = await userManager.GetRolesAsync(user);
        return Result<IList<string>>.Success(roles);
    }
    
    private async Task<Result> DeleteUserAsync(ApplicationUser user) {
        var result = await userManager.DeleteAsync(user);
        return result.ToApplicationResult();
    }
    
    private string GenerateAccessToken(Guid id, string userName, string email, IEnumerable<string> roles) {
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, id.ToString()),
            new(ClaimTypes.Name, userName),
            new(ClaimTypes.Email, email),
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        //TODO: replace with value from config
        var staticKey = "6AD2EFDE-AB2C-4841-A05E-7045C855BA22";
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(staticKey));
        var signingCred = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);
        var securityToken = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddSeconds(60),
            signingCredentials: signingCred
        );
        var tokenString = new JwtSecurityTokenHandler().WriteToken(securityToken);
        return tokenString;
    }
    
    private static string GenerateRefreshToken() {
        var randomNumber = new byte[64];
        using (var numberGenerator = RandomNumberGenerator.Create()) {
            numberGenerator.GetBytes(randomNumber);
        }
        var token = Convert.ToBase64String(randomNumber)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
        return token;
    }
    
    private static ClaimsPrincipal? GetTokenPrincipal(string token) {
        var securityKey = new SymmetricSecurityKey("6AD2EFDE-AB2C-4841-A05E-7045C855BA22"u8.ToArray());
        var validation = new TokenValidationParameters {
            IssuerSigningKey = securityKey,
            ValidateLifetime = false,
            ValidateActor = false,
            ValidateIssuer = false,
            ValidateAudience = false,
        };
        return new JwtSecurityTokenHandler().ValidateToken(token, validation, out _);
    }

    private async Task<Result<AppTokenInfo>> GenerateAppTokenInfo(ApplicationUser identityUser) {
        if (string.IsNullOrEmpty(identityUser.UserName) || string.IsNullOrEmpty(identityUser.Email)) {
            return Result<AppTokenInfo>.Failure(["Invalid user"]);
        }
        var roles = await userManager.GetRolesAsync(identityUser);
        var accessToken = GenerateAccessToken(identityUser.Id, identityUser.UserName, identityUser.Email, roles);
        var refreshToken = GenerateRefreshToken();
        identityUser.RefreshToken = refreshToken;
        identityUser.RefreshTokenExpiry = DateTime.UtcNow.AddHours(12);
        await userManager.UpdateAsync(identityUser);
        return Result<AppTokenInfo>.Success(new AppTokenInfo(accessToken, refreshToken));
    }
}