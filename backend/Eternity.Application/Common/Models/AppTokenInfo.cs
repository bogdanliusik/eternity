namespace Eternity.Application.Common.Models;

public class AppTokenInfo(string accessToken, Guid sessionId)
{
    public string AccessToken { get; } = accessToken;
    public Guid SessionId { get; } = sessionId;
}
