using Eternity.Application.Common.Interfaces;
using Eternity.Domain.Entities;
using Eternity.Infrastructure.Data.Configurations;
using Eternity.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options), IAppDbContext
{
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();

    public DbSet<RegistrationRequest> RegistrationRequests => Set<RegistrationRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new UserAccountConfiguration());
        modelBuilder.ApplyConfiguration(new RegistrationRequestConfiguration());
    }
}
