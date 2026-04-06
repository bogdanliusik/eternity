using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Application.RegistrationRequests.Models;
using Eternity.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.RegistrationRequests.Queries;

[Authorize(Policy = Policies.AdminOnly)]
public record GetRegistrationRequestsQuery(RegistrationRequestStatus Status)
    : IRequest<Result<List<RegistrationRequestDto>>>;

public class GetRegistrationRequestsQueryHandler(IAppDbContext dbContext)
    : IRequestHandler<GetRegistrationRequestsQuery, Result<List<RegistrationRequestDto>>>
{
    public async Task<Result<List<RegistrationRequestDto>>> Handle(GetRegistrationRequestsQuery request,
        CancellationToken cancellationToken) {
        var requests = await dbContext.RegistrationRequests.AsNoTracking()
            .Where(r => r.Status == request.Status)
            .OrderByDescending(r => r.RequestedAt)
            .Select(r => new RegistrationRequestDto {
                Id = r.Id,
                Name = r.Name,
                Username = r.UserName,
                Email = r.Email,
                Status = r.Status,
                RequestedAt = r.RequestedAt,
                ProcessedAt = r.ProcessedAt
            })
            .ToListAsync(cancellationToken);
        return Result<List<RegistrationRequestDto>>.Success(requests);
    }
}
