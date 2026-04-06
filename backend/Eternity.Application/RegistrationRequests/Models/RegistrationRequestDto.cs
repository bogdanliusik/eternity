using Eternity.Domain.Constants;
using Eternity.Domain.Entities;

namespace Eternity.Application.RegistrationRequests.Models;

public class RegistrationRequestDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public RegistrationRequestStatus Status { get; set; }
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }

    public static RegistrationRequestDto FromEntity(RegistrationRequest entity) {
        return new RegistrationRequestDto {
            Id = entity.Id,
            Name = entity.Name,
            Username = entity.UserName,
            Email = entity.Email,
            Status = entity.Status,
            RequestedAt = entity.RequestedAt,
            ProcessedAt = entity.ProcessedAt
        };
    }
}
