using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;

namespace Eternity.WebApi.Extensions;

public static class RateLimitingExtensions
{
    public const string RegistrationPolicyName = "registration-submissions";

    public static void AddEternityRateLimiting(this IHostApplicationBuilder builder) {
        builder.Services.AddRateLimiter(options => {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy(
                RegistrationPolicyName,
                context => {
                    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    return RateLimitPartition.GetSlidingWindowLimiter(
                        ip,
                        _ => new SlidingWindowRateLimiterOptions {
                            PermitLimit = 10,
                            Window = TimeSpan.FromSeconds(30),
                            SegmentsPerWindow = 3,
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0
                        }
                    );
                }
            );
        });
        builder.Services.Configure<ForwardedHeadersOptions>(o => {
            o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            o.KnownIPNetworks.Clear();
            o.KnownProxies.Clear();
        });
    }
}
