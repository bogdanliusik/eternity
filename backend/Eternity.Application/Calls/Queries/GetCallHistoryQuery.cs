using Eternity.Application.Calls.Models;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Calls.Queries;

public record GetCallHistoryQuery : IRequest<Result<List<CallHistoryDto>>>;

public class GetCallHistoryQueryHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<GetCallHistoryQuery, Result<List<CallHistoryDto>>>
{
    public async Task<Result<List<CallHistoryDto>>> Handle(GetCallHistoryQuery request,
        CancellationToken cancellationToken) {
        var userId = currentUser.Id;
        var calls = await dbContext.Calls.AsNoTracking()
            .Include(c => c.Participants)
            .ThenInclude(p => p.User)
            .Include(c => c.Initiator)
            .Where(c => c.Participants.Any(p => p.UserId == userId))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
        var result = calls.Select(call => {
            var participants = call.Participants.Select(p => new CallParticipantDto {
                Id = p.Id,
                UserId = p.UserId,
                Username = p.User.UserName,
                FullName = p.User.FullName,
                AvatarUrl = p.User.AvatarUrl,
                ParticipantStatus = p.Status,
                JoinedAt = p.JoinedAt,
                LeftAt = p.LeftAt
            }).ToList();
            var initiator = participants.First(p => p.UserId == call.InitiatorId);
            var userParticipant = call.Participants.First(p => p.UserId == userId);
            var duration = call is { StartedAt: not null, EndedAt: not null }
                ? (int?)(call.EndedAt.Value - call.StartedAt.Value).TotalSeconds
                : null;
            return new CallHistoryDto {
                Id = call.Id,
                Name = CallDto.ResolveDisplayName(call.Name, call.Participants),
                Type = call.Type,
                Status = call.Status,
                CreatedAt = call.CreatedAt,
                StartedAt = call.StartedAt,
                EndedAt = call.EndedAt,
                DurationSeconds = duration,
                Participants = participants,
                InitiatedBy = initiator,
                UserParticipantStatus = userParticipant.Status
            };
        }).ToList();
        return Result<List<CallHistoryDto>>.Success(result);
    }
}
