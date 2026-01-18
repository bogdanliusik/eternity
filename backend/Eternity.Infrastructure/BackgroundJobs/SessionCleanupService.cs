using Eternity.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Eternity.Infrastructure.BackgroundJobs;

/// <summary>
/// Background service that periodically marks expired sessions with their EndedAt timestamp.
/// This ensures that sessions which expire naturally (token expiry) have their EndedAt set correctly.
/// </summary>
public class SessionCleanupService(
    IServiceScopeFactory scopeFactory,
    ILogger<SessionCleanupService> logger)
    : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(15);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("Session cleanup service started");
        while (!stoppingToken.IsCancellationRequested) {
            try {
                await ProcessExpiredSessionsAsync(stoppingToken);
            } catch (Exception ex) {
                logger.LogError(ex, "Error occurred while processing expired sessions");
            }
            await Task.Delay(_interval, stoppingToken);
        }
        logger.LogInformation("Session cleanup service stopped");
    }

    private async Task ProcessExpiredSessionsAsync(CancellationToken cancellationToken) {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        var now = DateTime.UtcNow;
        var expiredSessions = await dbContext.UserSessions
            .Where(s => !s.IsTerminated 
                        && s.EndedAt == null 
                        && s.RefreshTokenExpiry <= now)
            .ToListAsync(cancellationToken);
        if (expiredSessions.Count == 0) {
            logger.LogDebug("No expired sessions to process");
            return;
        }
        logger.LogInformation("Processing {Count} expired sessions", expiredSessions.Count);
        foreach (var session in expiredSessions) {
            session.MarkExpired();
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Successfully marked {Count} sessions as expired", expiredSessions.Count);
    }
}
