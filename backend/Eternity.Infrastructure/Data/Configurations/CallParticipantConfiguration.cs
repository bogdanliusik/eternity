using Eternity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Eternity.Infrastructure.Data.Configurations;

public sealed class CallParticipantConfiguration : IEntityTypeConfiguration<CallParticipant>
{
    public void Configure(EntityTypeBuilder<CallParticipant> builder) {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasMaxLength(26) // ULID is 26 characters
            .IsRequired();

        builder.Property(x => x.CallId)
            .HasMaxLength(26)
            .IsRequired();

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.JoinedAt)
            .IsRequired(false);

        builder.Property(x => x.LeftAt)
            .IsRequired(false);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.CallId, x.UserId })
            .IsUnique()
            .HasDatabaseName("ix_call_participants_call_id_user_id");

        builder.HasIndex(x => x.UserId);

        builder.HasIndex(x => new { x.UserId, x.Status })
            .HasDatabaseName("ix_call_participants_user_id_status");
    }
}
