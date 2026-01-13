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
            var roles = new[] { RoleNames.Admin, RoleNames.Member };
            await AddUser(adminSeed.Username.Trim(), adminSeed.Email.Trim(), adminSeed.Password, roles);
        }
        catch (Exception ex) {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task AddUser(string userName, string email, string password, IEnumerable<string> roles) {
        if (userManager.Users.All(u => u.UserName != userName)) {
            var result = await identityService.CreateUserAsync(userName, email, password);
            if (!result.Succeeded) {
                throw new AggregateException(result.Errors.Select(e => new InvalidOperationException(e)));
            }
            var createdUser = await userManager.FindByNameAsync(userName);
            if (createdUser == null) {
                throw new InvalidOperationException($"Couldn't create {userName} user");
            }
            foreach (var role in roles) {
                await userManager.AddToRoleAsync(createdUser, role);
            }
            await context.UserAccounts.AddAsync(new UserAccount {
                Id = result.Data,
                UserName = userName,
                Email = email
            });
            await context.SaveChangesAsync();
        }
    }
    
    private async Task EnsureRolesAsync(params string[] roles) {
        foreach (var role in roles)
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
    }
}
