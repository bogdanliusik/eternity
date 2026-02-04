namespace Eternity.Application.Users.Models;

public record UserDto
{
    public Guid Id { get; init; }
    public required string Username { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public required IList<string> Roles { get; set; }
}
