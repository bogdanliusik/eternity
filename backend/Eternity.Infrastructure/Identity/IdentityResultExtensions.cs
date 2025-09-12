using Eternity.Application.Common.Models;
using Microsoft.AspNetCore.Identity;

namespace Eternity.Infrastructure.Identity;

public static class IdentityResultExtensions
{
    public static Result ToApplicationResult(this IdentityResult result) {
        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => e.Description));
    }
    
    public static Result<T> ToApplicationResult<T>(this IdentityResult result, T body) {
        return result.Succeeded
            ? Result<T>.Success(body)
            : Result<T>.Failure(result.Errors.Select(e => e.Description));
    }
}
