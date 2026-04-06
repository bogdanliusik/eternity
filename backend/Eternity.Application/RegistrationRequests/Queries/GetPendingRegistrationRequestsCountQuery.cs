using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.RegistrationRequests.Queries;

[Authorize(Policy = Policies.AdminOnly)]
public sealed record GetPendingRegistrationRequestsCountQuery : IRequest<Result<int>>;

public sealed class GetPendingRegistrationRequestsCountQueryHandler(IAppDbContext dbContext)
    : IRequestHandler<GetPendingRegistrationRequestsCountQuery, Result<int>>
{
    public async Task<Result<int>> Handle(GetPendingRegistrationRequestsCountQuery request,
        CancellationToken cancellationToken) {
        var pendingCount = await dbContext.RegistrationRequests.AsNoTracking()
            .CountAsync(r => r.Status == RegistrationRequestStatus.Pending, cancellationToken);
        return Result<int>.Success(pendingCount);
    }
}
