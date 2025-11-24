using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Application.Users.Models;
using Eternity.Application.Users.Queries;
using Eternity.Domain.Constants;
using Eternity.WebApi.Extensions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;

namespace Eternity.WebApi.Endpoints;

public sealed class UsersEndpoint : EndpointGroupBase
{
    public override string GroupName => "users";
    
    public override void Map(RouteGroupBuilder group) {
        group.RequireAuthorization();
        group.MapPost(Login, "login").AllowAnonymous();
        group.MapPost(LoginCookie, "loginCookie").AllowAnonymous();
        group.MapPost(RefreshToken, "refreshToken").AllowAnonymous();
        group.MapPost(RefreshTokenCookie, "refreshTokenCookie").AllowAnonymous();
        group.MapPost(Logout, "logout");
        group.MapGet(GetCurrentUser, "getCurrentUser");
        group.MapGet(GetCurrentUserNameAsMember, "getCurrentUserNameAsMember")
            .RequireAuthorization(Policies.MemberOnly);
        group.MapGet(GetCurrentUserNameAsAdmin, "getCurrentUserNameAsAdmin")
             .RequireAuthorization(Policies.AdminOnly);
    }

    private static async Task<IResult> Login(LoginRequest loginRequest, IIdentityService identityService) {
        var loginResult = await identityService.LoginAsync(loginRequest.Username, loginRequest.Password);
        if (!loginResult.Succeeded) {
            return Results.Unauthorized();
        }
        return Results.Ok(loginResult.Data);
    }
    
    private static async Task<IResult> LoginCookie(LoginRequest loginRequest, IIdentityService identityService,
        ICookieAuthService cookieAuthService, HttpResponse response) {
        await Task.Delay(1000);
        var loginResult = await identityService.LoginAsync(loginRequest.Username, loginRequest.Password);
        if (!loginResult.Succeeded) {
            return Results.Unauthorized();
        }
        cookieAuthService.SetAuthenticationCookies(response, loginResult.Data);
        return Results.Ok(Result.Success());
    }

    private static async Task<IResult> RefreshToken(AppTokenInfo oldTokenInfo, IIdentityService identityService) {
        var refreshResult = await identityService.RefreshTokenAsync(oldTokenInfo);
        if (!refreshResult.Succeeded) {
            return Results.Unauthorized();
        }
        return Results.Ok(refreshResult.Data);
    }

    private static async Task<IResult> RefreshTokenCookie(
        HttpRequest request,
        HttpResponse response,
        IIdentityService identityService,
        ICookieAuthService cookieAuthService,
        IOptions<CookieSettings> cookieSettings) {
        var settings = cookieSettings.Value;
        if (!request.Cookies.TryGetValue(settings.AccessTokenCookieName, out var accessToken) ||
            !request.Cookies.TryGetValue(settings.RefreshTokenCookieName, out var refreshToken)) {
            return Results.Unauthorized();
        }
        var refreshResult = await identityService.RefreshTokenAsync(
            new AppTokenInfo(accessToken, refreshToken)
        );
        if (!refreshResult.Succeeded) {
            return Results.Unauthorized();
        }
        cookieAuthService.SetAuthenticationCookies(response, refreshResult.Data);
        return Results.Ok();
    }
    
    private static IResult Logout(HttpResponse response, ICookieAuthService cookieAuthService) {
        cookieAuthService.RemoveAuthenticationCookies(response);
        return Results.Ok();
    }
    
    private async Task<IResult> GetCurrentUser(IMediator mediator) {
        await Task.Delay(1000);
        var currentUser = await mediator.Send(new GetCurrentUserQuery());
        return Results.Ok(currentUser);
    }
    
    private static IResult GetCurrentUserNameAsMember(ICurrentUser currentUser) {
        return Results.Ok(currentUser.Name);
    }
    
    private static IResult GetCurrentUserNameAsAdmin(ICurrentUser currentUser) {
        return Results.Ok(currentUser.Name);
    }
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}
