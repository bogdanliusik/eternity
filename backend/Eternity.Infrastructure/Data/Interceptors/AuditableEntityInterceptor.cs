using Eternity.Application.Common.Interfaces;
using Eternity.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Eternity.Infrastructure.Data.Interceptors;

public class AuditableEntityInterceptor(ICurrentUser user, TimeProvider dateTime) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result) {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, 
        InterceptionResult<int> result, CancellationToken cancellationToken = default) {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void UpdateEntities(DbContext? context) {
        if (context == null) return;
        foreach (var entry in context.ChangeTracker.Entries<BaseAuditableEntity>()) {
            if (entry.State is EntityState.Added or EntityState.Modified || entry.HasChangedOwnedEntities()) {
                var utcNow = dateTime.GetUtcNow();
                if (entry.State == EntityState.Added) {
                    entry.Entity.CreatedBy = user.Id;
                    entry.Entity.CreatedAt = utcNow;
                } 
                entry.Entity.ModifiedBy = user.Id;
                entry.Entity.ModifiedAt = utcNow;
            }
        }
    }
}

public static class Extensions {
    public static bool HasChangedOwnedEntities(this EntityEntry entry) =>
        entry.References.Any(r => 
            r.TargetEntry != null && 
            r.TargetEntry.Metadata.IsOwned() && 
            (r.TargetEntry.State == EntityState.Added || r.TargetEntry.State == EntityState.Modified));
}
