using Eternity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Eternity.Infrastructure.Data.Configurations;

public sealed class CallConfiguration : IEntityTypeConfiguration<Call>
{
    public void Configure(EntityTypeBuilder<Call> builder) {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .IsRequired();
        builder.Property(x => x.InitiatorId).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(256).IsRequired(false);
        builder.Property(x => x.Type).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.StartedAt).IsRequired(false);
        builder.Property(x => x.EndedAt).IsRequired(false);
        builder.HasOne(x => x.Initiator).WithMany().HasForeignKey(x => x.InitiatorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(x => x.Participants)
            .WithOne(x => x.Call)
            .HasForeignKey(x => x.CallId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(x => x.InitiatorId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => new { x.Status, x.CreatedAt }).HasDatabaseName("ix_calls_status_created_at");
    }
}
