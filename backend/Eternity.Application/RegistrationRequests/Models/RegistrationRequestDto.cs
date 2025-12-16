using Eternity.Domain.Entities;

namespace Eternity.Application.RegistrationRequests.Models;

public class RegistrationRequestDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }

    public static RegistrationRequestDto FromEntity(RegistrationRequest entity) => new() {
        Id = entity.Id,
        Name = entity.Name,
        Username = entity.UserName,
        Email = entity.Email,
        Status = entity.Status.ToString().ToLowerInvariant(),
        RequestedAt = entity.RequestedAt,
        ProcessedAt = entity.ProcessedAt
    };
}
