using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Sessions.Commands;
using Eternity.Application.Users.Queries;
using Eternity.Domain.Constants;
using Eternity.WebApi.Extensions;
using MediatR;

namespace Eternity.WebApi.Endpoints;

public sealed class UsersEndpoint : EndpointGroupBase
{
    public override string GroupName => "users";

    public override void Map(RouteGroupBuilder group) {
        group.RequireAuthorization();
        group.MapPost(LoginCookie, "loginCookie").AllowAnonymous();
        group.MapPost(Logout, "logout");
        group.MapGet(GetCurrentUser, "getCurrentUser");
        group.MapGet(GetCurrentUserNameAsMember, "getCurrentUserNameAsMember")
            .RequireAuthorization(Policies.MemberOnly);
        group.MapGet(GetCurrentUserNameAsAdmin, "getCurrentUserNameAsAdmin").RequireAuthorization(Policies.AdminOnly);
        group.MapGet(SearchUsers, "search");
    }

    private static async Task<IResult> LoginCookie(LoginRequest loginRequest, IIdentityService identityService,
        ICookieAuthService cookieAuthService, HttpContext context) {
        var ipAddress = GetClientIpAddress(context);
        var userAgent = context.Request.Headers.UserAgent.ToString();
        var loginResult = await identityService.LoginAsync(
            loginRequest.Username,
            loginRequest.Password,
            ipAddress,
            userAgent
        );
        if (!loginResult.Succeeded) {
            return Results.Json(loginResult, statusCode: StatusCodes.Status401Unauthorized);
        }
        cookieAuthService.SetAuthenticationCookies(context.Response, loginResult.Data);
        return Results.Ok(Result.Success());
    }

    private static async Task<IResult> Logout(IMediator mediator, ICookieAuthService cookieAuthService,
        HttpResponse response) {
        await mediator.Send(new TerminateCurrentSessionCommand());
        cookieAuthService.RemoveAuthenticationCookies(response);
        return Results.Ok();
    }

    private async Task<IResult> GetCurrentUser(IMediator mediator) {
        var currentUser = await mediator.Send(new GetCurrentUserQuery());
        return Results.Ok(currentUser);
    }

    private static IResult GetCurrentUserNameAsMember(ICurrentUser currentUser) {
        return Results.Ok(currentUser.Name);
    }

    private static IResult GetCurrentUserNameAsAdmin(ICurrentUser currentUser) {
        return Results.Ok(currentUser.Name);
    }

    private static async Task<IResult> SearchUsers(string? search, IMediator mediator) {
        var result = await mediator.Send(new SearchUsersQuery(search));
        return Results.Ok(result);
    }

    private static string? GetClientIpAddress(HttpContext context) {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor)) {
            var ip = forwardedFor.Split(',').FirstOrDefault()?.Trim();
            if (!string.IsNullOrEmpty(ip)) {
                return ip;
            }
        }
        return context.Connection.RemoteIpAddress?.ToString();
    }
}

public class LoginRequest
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}
