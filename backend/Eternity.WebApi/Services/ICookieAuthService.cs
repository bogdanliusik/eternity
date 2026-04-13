using Eternity.Application.Common.Models;
using Microsoft.AspNetCore.Http;

namespace Eternity.WebApi.Services;

public interface ICookieAuthService
{
    void SetAuthenticationCookies(HttpResponse response, AppTokenInfo tokenInfo);
    void RemoveAuthenticationCookies(HttpResponse response);
}
