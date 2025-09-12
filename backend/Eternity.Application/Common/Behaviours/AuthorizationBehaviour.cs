using System.Reflection;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using MediatR;

namespace Eternity.Application.Common.Behaviours;

public class AuthorizationBehaviour<TRequest, TResponse>(
    ICurrentUser user,
    IIdentityService identityService) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
    where TResponse : IResult<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, 
        CancellationToken cancellationToken) {
        var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>().ToList();
        if (authorizeAttributes.Count == 0) return await next(cancellationToken);
        if (!user.IsAvailable) {
            return TResponse.Failure(["Unauthorized access"]);
        }
        var authorizeAttributesWithRoles = authorizeAttributes.Where(a => !string.IsNullOrWhiteSpace(a.Roles)).ToList();
        if (authorizeAttributesWithRoles.Count != 0) {
            var authorized = false;
            foreach (var roles in authorizeAttributesWithRoles.Select(a => a.Roles.Split(','))) {
                foreach (var role in roles) {
                    var isInRole = user.Roles?.Any(x => role == x)??false;
                    if (isInRole) {
                        authorized = true;
                        break;
                    }
                }
            }
            if (!authorized) {
                return TResponse.Failure(["Forbidden access"]);
            }
        }
        var authorizeAttributesWithPolicies = authorizeAttributes
            .Where(a => !string.IsNullOrWhiteSpace(a.Policy)).ToList();
        if (authorizeAttributesWithPolicies.Count != 0) {
            foreach (var policy in authorizeAttributesWithPolicies.Select(a => a.Policy)) {
                var authorized = await identityService.AuthorizeAsync(user.Id, policy);
                if (!authorized) {
                    return TResponse.Failure(["Forbidden access"]);
                }
            }
        }
        return await next(cancellationToken);
    }
}
