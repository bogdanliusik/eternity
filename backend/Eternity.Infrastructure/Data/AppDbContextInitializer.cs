using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Security;
using Eternity.Domain.Constants;
using Eternity.Domain.Entities;
using Eternity.Infrastructure.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eternity.Infrastructure.Data;

public static class InitializerExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app) {
        using var scope = app.Services.CreateScope();
        var initializer = scope.ServiceProvider.GetRequiredService<AppDbContextInitializer>();
        await initializer.InitialiseAsync();
        await initializer.SeedAsync();
    }
}

public class AppDbContextInitializer(ILogger<AppDbContextInitializer> logger, AppDbContext context, 
    UserManager<ApplicationUser> userManager, IIdentityService identityService, 
    RoleManager<IdentityRole<Guid>> roleManager, IOptions<AdminSeedSettings> adminSeedOptions) 
{
    public async Task InitialiseAsync() {
        try {
            await context.Database.MigrateAsync();
        } catch (Exception ex) {
            logger.LogError(ex, "An error occurred while initializing the database.");
            throw;
        }
    }
    
    public async Task SeedAsync() {
        try {
            await EnsureRolesAsync(RoleNames.Admin, RoleNames.Member);
            var adminSeed = adminSeedOptions.Value;
            if (string.IsNullOrWhiteSpace(adminSeed.Username) || string.IsNullOrWhiteSpace(adminSeed.Email)) {
                logger.LogInformation("Admin seed configuration missing username or email; skipping admin creation.");
                return;
            }
            if (string.IsNullOrWhiteSpace(adminSeed.Password)) {
                logger.LogWarning("Admin seed password not provided; skipping admin creation.");
                return;
            }
            if (string.IsNullOrEmpty(adminSeed.FullName)) {
                logger.LogWarning("Admin seed full name not provided");
                return;
            }
            await SeedOrUpdateUserAsync(adminSeed, RoleNames.Admin, RoleNames.Member);
        }
        catch (Exception ex) {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task SeedOrUpdateUserAsync(AdminSeedSettings seed, params string[] roles) {
        var userName = seed.Username?.Trim();
        var email = seed.Email?.Trim();
        var fullName = seed.FullName?.Trim();
        var password = seed.Password;
        if (string.IsNullOrWhiteSpace(userName) || string.IsNullOrWhiteSpace(email) 
            || string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(password)) {
            throw new InvalidOperationException("Admin seed values are missing required fields.");
        }
        var identityUser = await userManager.FindByNameAsync(userName);
        if (identityUser == null) {
            identityUser = await CreateIdentityUserAsync(userName, email, password);
        } else {
            await EnsureIdentityUserUpdatedAsync(identityUser, email, password);
        }
        var existingRoles = await userManager.GetRolesAsync(identityUser);
        foreach (var role in roles.Where(role => !existingRoles.Contains(role))) {
            await userManager.AddToRoleAsync(identityUser, role);
        }
        await UpsertUserAccountAsync(identityUser.Id, userName, fullName, email);
        await context.SaveChangesAsync();
    }

    private async Task<ApplicationUser> CreateIdentityUserAsync(string userName, string email, string password) {
        var result = await identityService.CreateUserAsync(userName, email, password);
        if (!result.Succeeded) {
            throw new AggregateException(result.Errors.Select(e => new InvalidOperationException(e)));
        }
        var createdUser = await userManager.FindByNameAsync(userName);
        if (createdUser == null) {
            throw new InvalidOperationException($"Couldn't create {userName} user");
        }
        return createdUser;
    }

    private async Task EnsureIdentityUserUpdatedAsync(ApplicationUser identityUser, string email, string password) {
        if (!string.Equals(identityUser.Email, email, StringComparison.OrdinalIgnoreCase)) {
            identityUser.Email = email;
            var updateResult = await userManager.UpdateAsync(identityUser);
            if (!updateResult.Succeeded) {
                throw new AggregateException(updateResult.Errors.Select(
                    e => new InvalidOperationException(e.Description)));
            }
        }
        var resetToken = await userManager.GeneratePasswordResetTokenAsync(identityUser);
        var passwordResult = await userManager.ResetPasswordAsync(identityUser, resetToken, password);
        if (!passwordResult.Succeeded) {
            throw new AggregateException(passwordResult.Errors.Select(
                e => new InvalidOperationException(e.Description)));
        }
    }

    private async Task UpsertUserAccountAsync(Guid id, string userName, string fullName, string email) {
        var userAccount = await context.UserAccounts.FirstOrDefaultAsync(u => u.Id == id);
        if (userAccount == null) {
            await context.UserAccounts.AddAsync(new UserAccount {
                Id = id,
                UserName = userName,
                FullName = fullName,
                Email = email
            });
            return;
        }
        userAccount.UserName = userName;
        userAccount.FullName = fullName;
        userAccount.Email = email;
    }
    
    private async Task EnsureRolesAsync(params string[] roles) {
        foreach (var role in roles)
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
    }
}
