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
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<Call> Calls => Set<Call>();
    public DbSet<CallParticipant> CallParticipants => Set<CallParticipant>();

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);
        builder.ApplyConfiguration(new UserAccountConfiguration());
        builder.ApplyConfiguration(new RegistrationRequestConfiguration());
        builder.ApplyConfiguration(new UserSessionConfiguration());
        builder.ApplyConfiguration(new CallConfiguration());
        builder.ApplyConfiguration(new CallParticipantConfiguration());
    }
}
