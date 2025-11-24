using Eternity.Application.Common.Models;
using Microsoft.AspNetCore.Http;

namespace Eternity.Application.Common.Interfaces;

public interface ICookieAuthService
{
    void SetAuthenticationCookies(HttpResponse response, AppTokenInfo tokenInfo);
    void RemoveAuthenticationCookies(HttpResponse response);
}
