namespace Eternity.Application.Common.Models;

public class AppTokenInfo(string accessToken, string refreshToken)
{
    public string AccessToken { get; } = accessToken;
    public string RefreshToken { get; } = refreshToken;
}
