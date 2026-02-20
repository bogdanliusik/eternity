using Eternity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Eternity.Infrastructure.Data.Configurations;

public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
{
    public void Configure(EntityTypeBuilder<UserSession> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.UserId)
            .IsRequired();
        builder.Property(x => x.RefreshToken)
            .HasMaxLength(512)
            .IsRequired();
        builder.Property(x => x.RefreshTokenExpiry)
            .IsRequired();
        builder.Property(x => x.StartedAt)
            .IsRequired();
        builder.Property(x => x.EndedAt)
            .IsRequired(false);
        builder.Property(x => x.IpAddress)
            .HasMaxLength(45); // IPv6 max length
        builder.Property(x => x.UserAgent)
            .HasMaxLength(1024);
        builder.Property(x => x.DeviceInfo)
            .HasMaxLength(128);
        builder.Property(x => x.BrowserInfo)
            .HasMaxLength(128);
        builder.Property(x => x.IsTerminated)
            .HasDefaultValue(false)
            .IsRequired();
        builder.Property(x => x.IsOnline)
            .HasDefaultValue(false)
            .IsRequired();
        
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.RefreshToken);
        builder.HasIndex(x => new { x.UserId, x.IsTerminated });
        
        builder.HasIndex(x => new { x.IsTerminated, x.RefreshTokenExpiry })
            .HasDatabaseName("ix_user_sessions_is_terminated_refresh_token_expiry");
        builder.HasIndex(x => new { x.IsTerminated, x.EndedAt, x.RefreshTokenExpiry })
            .HasDatabaseName("ix_user_sessions_is_terminated_ended_at_refresh_token_expiry");

        builder.Ignore(x => x.IsActive);
    }
}
