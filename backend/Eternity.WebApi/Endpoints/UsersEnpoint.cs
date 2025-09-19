using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Users.Models;
using Eternity.Application.Users.Queries;
using Eternity.Domain.Constants;
using Eternity.WebApi.Extensions;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

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

    private static async Task<IResult> LoginCookie(LoginRequest loginRequest, IIdentityService identityService, HttpResponse response) {
        await Task.Delay(1000);
        var loginResult = await identityService.LoginAsync(loginRequest.Username, loginRequest.Password);
        if (!loginResult.Succeeded) {
            return Results.Ok(loginResult);
        }
        SetAuthCookies(response, loginResult.Data);
        return Results.Ok(Result.Success());
    }

    private static async Task<IResult> RefreshToken(AppTokenInfo oldTokenInfo, IIdentityService identityService) {
        var refreshResult = await identityService.RefreshToken(oldTokenInfo);
        if (!refreshResult.Succeeded) {
            return Results.Unauthorized();
        }
        return Results.Ok(refreshResult.Data);
    }

    private static async Task<IResult> RefreshTokenCookie(HttpRequest request, HttpResponse response, IIdentityService identityService) {
        if (!request.Cookies.TryGetValue("AccessToken", out var accessToken) ||
            !request.Cookies.TryGetValue("RefreshToken", out var refreshToken)) {
            return Results.Unauthorized();
        }
        var refreshResult = await identityService.RefreshToken(new AppTokenInfo(accessToken, refreshToken));
        if (!refreshResult.Succeeded) {
            return Results.Unauthorized();
        }
        SetAuthCookies(response, refreshResult.Data);
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
    
    private static void SetAuthCookies(HttpResponse response, AppTokenInfo tokenInfo) {
        var accessCookie = new CookieOptions {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.Now.AddDays(30)
        };
        var refreshCookie = new CookieOptions {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.Now.AddDays(60)
        };
        response.Cookies.Append("AccessToken", tokenInfo.AccessToken, accessCookie);
        response.Cookies.Append("RefreshToken", tokenInfo.RefreshToken, refreshCookie);
    }
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}
