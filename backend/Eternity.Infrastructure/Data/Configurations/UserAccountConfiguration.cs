using Eternity.Domain.Entities;
using Eternity.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Eternity.Infrastructure.Data.Configurations;

public sealed class UserAccountConfiguration : IEntityTypeConfiguration<UserAccount>
{
    public void Configure(EntityTypeBuilder<UserAccount> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.UserName).HasMaxLength(256).IsRequired();
        builder.Property(p => p.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.AvatarUrl).HasMaxLength(512);
        
        builder.HasIndex(x => x.UserName).IsUnique();
        builder.HasIndex(x => x.Email);
        
        builder.HasOne<ApplicationUser>()
            .WithOne(u => u.UserAccount)
            .HasForeignKey<UserAccount>(x => x.Id)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();
    }
}
