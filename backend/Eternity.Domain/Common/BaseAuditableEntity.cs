namespace Eternity.Domain.Common;

public abstract class BaseAuditableEntity : BaseEntity<string>
{
    public DateTimeOffset CreatedAt { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTimeOffset ModifiedAt { get; set; }

    public Guid? ModifiedBy { get; set; }
}
