using Eternity.Application.Common.Interfaces;
using Eternity.Domain.Constants;
using Eternity.Infrastructure.Data;
using Eternity.Infrastructure.Data.Interceptors;
using Eternity.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Eternity.Infrastructure;

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder) {
        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();
        var dbConnectionString = builder.Configuration.GetConnectionString("EternityDb");
        builder.Services.AddDbContext<AppDbContext>((sp, options) => {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseNpgsql(dbConnectionString, dbContextOptionsBuilder => 
                dbContextOptionsBuilder
                    .MigrationsAssembly(typeof(AppDbContext).Assembly.FullName))
                .UseSnakeCaseNamingConvention();
        });
        builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
        builder.Services.AddScoped<AppDbContextInitializer>();
        builder.Services.AddDefaultIdentity<ApplicationUser>(options => {
            // Password settings
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 8;
            
            // Lockout settings
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
            
            // User settings
            options.User.RequireUniqueEmail = true;
        }).AddRoles<IdentityRole<Guid>>().AddEntityFrameworkStores<AppDbContext>();
        builder.Services.AddTransient<IIdentityService, IdentityService>();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddAuthorization(options => {
            options.AddPolicy(Policies.CanPurge, policy => policy.RequireRole(RoleNames.Admin));
            options.AddPolicy(Policies.AdminOnly, policy => policy.RequireRole(RoleNames.Admin));
            options.AddPolicy(Policies.MemberOnly, policy => policy.RequireRole(RoleNames.Member));
        });
    }
}
