using Eternity.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Eternity.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public UserAccount UserAccount { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime RefreshTokenExpiry { get; set; }
}
