using Eternity.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eternity.Infrastructure.BackgroundJobs.SessionCleanup;

/// <summary>
///     Background service that periodically marks expired sessions with their EndedAt timestamp.
///     This ensures that sessions which expire naturally (token expiry) have their EndedAt set correctly.
/// </summary>
public partial class SessionCleanupService(
    IServiceScopeFactory scopeFactory,
    ILogger<SessionCleanupService> logger,
    IOptions<SessionCleanupSettings> options) : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(options.Value.IntervalMinutes);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("Session cleanup service started");
        while (!stoppingToken.IsCancellationRequested) {
            await Task.Delay(_interval, stoppingToken);
            try {
                await ProcessExpiredSessionsAsync(stoppingToken);
            } catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) {
                break;
            } catch (Exception ex) {
                logger.LogError(ex, "Error occurred while processing expired sessions");
            }
        }
        logger.LogInformation("Session cleanup service stopped");
    }

    private async Task ProcessExpiredSessionsAsync(CancellationToken cancellationToken) {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        var now = DateTime.UtcNow;
        var expiredSessions = await dbContext.UserSessions
            .Where(s => !s.IsTerminated && s.EndedAt == null && s.RefreshTokenExpiry <= now)
            .ToListAsync(cancellationToken);
        if (expiredSessions.Count == 0) {
            logger.LogDebug("No expired sessions to process");
            return;
        }
        LogProcessingExpiredSessions(logger, expiredSessions.Count);
        foreach (var session in expiredSessions) {
            session.MarkExpired();
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        LogSessionsMarkedExpired(logger, expiredSessions.Count);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing {Count} expired sessions")]
    private static partial void LogProcessingExpiredSessions(ILogger logger, int count);

    [LoggerMessage(Level = LogLevel.Information, Message = "Successfully marked {Count} sessions as expired")]
    private static partial void LogSessionsMarkedExpired(ILogger logger, int count);
}
