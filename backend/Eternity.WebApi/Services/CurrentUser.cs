using System.Security.Claims;
using Eternity.Application.Common.Interfaces;

namespace Eternity.WebApi.Services;

public class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    public Guid Id {
        get {
            var idClaim = httpContextAccessor.HttpContext?.User.Claims.FirstOrDefault(
                c => c.Type == ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(idClaim?.Value)) {
                return Guid.Parse(idClaim.Value);;
            }
            throw new UnauthorizedAccessException("User context is not available.");
        }
    }

    public bool IsAvailable {
        get {
            var idClaim = httpContextAccessor.HttpContext?.User.Claims.FirstOrDefault(
                c => c.Type == ClaimTypes.NameIdentifier);
            return idClaim?.Value != null && Guid.TryParse(idClaim.Value, out _);
        }
    }
    
    public string Name {
        get {
            var nameClaim = httpContextAccessor.HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
            if (!string.IsNullOrEmpty(nameClaim?.Value)) {
                return nameClaim.Value;
            }
            throw new UnauthorizedAccessException("User name is not available.");
        }
    }
    
    public List<string>? Roles => httpContextAccessor.HttpContext?.User
        .FindAll(ClaimTypes.Role).Select(x => x.Value).ToList();
}
