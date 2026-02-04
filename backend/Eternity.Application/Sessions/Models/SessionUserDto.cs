namespace Eternity.Application.Sessions.Models;

public record SessionUserDto
{
    public Guid Id { get; init; }
    public required string Username { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? AvatarUrl { get; set; }
}
