namespace Eternity.Domain.Entities;

public class UserAccount
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = null!; 
    public string Email { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public bool IsOnline { get; private set; }
}
