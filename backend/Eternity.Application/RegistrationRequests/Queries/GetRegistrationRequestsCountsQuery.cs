using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Application.RegistrationRequests.Models;
using Eternity.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.RegistrationRequests.Queries;

[Authorize(Policy = Policies.AdminOnly)]
public record GetRegistrationRequestsCountsQuery : IRequest<Result<RegistrationRequestsCountsDto>>;

public class GetRegistrationRequestsCountsQueryHandler(IAppDbContext dbContext)
    : IRequestHandler<GetRegistrationRequestsCountsQuery, Result<RegistrationRequestsCountsDto>>
{
    public async Task<Result<RegistrationRequestsCountsDto>> Handle(GetRegistrationRequestsCountsQuery request, 
        CancellationToken cancellationToken) {
        var groupedCounts = await dbContext.RegistrationRequests
            .AsNoTracking()
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);
        var counts = new RegistrationRequestsCountsDto {
            Pending = groupedCounts.FirstOrDefault(x => x.Status == RegistrationRequestStatus.Pending)?.Count ?? 0,
            Approved = groupedCounts.FirstOrDefault(x => x.Status == RegistrationRequestStatus.Approved)?.Count ?? 0,
            Rejected = groupedCounts.FirstOrDefault(x => x.Status == RegistrationRequestStatus.Rejected)?.Count ?? 0
        };
        return Result<RegistrationRequestsCountsDto>.Success(counts);
    }
}
