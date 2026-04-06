using Eternity.Domain.Constants;
using Eternity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Eternity.Infrastructure.Data.Configurations;

public class RegistrationRequestConfiguration : IEntityTypeConfiguration<RegistrationRequest>
{
    public void Configure(EntityTypeBuilder<RegistrationRequest> builder) {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(256).IsRequired();
        builder.Property(x => x.UserName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Status).HasDefaultValue(RegistrationRequestStatus.Pending).IsRequired();
        builder.Property(x => x.RequestedAt).IsRequired();
        builder.Property(x => x.ProcessedAt).IsRequired(false);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.UserName);
        builder.HasIndex(x => x.Email);
    }
}
