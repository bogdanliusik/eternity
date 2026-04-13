using Eternity.Application.Calls.Models;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Calls.Queries;

public record GetCallQuery(Guid CallId) : IRequest<Result<CallDto>>;

public class GetCallQueryHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<GetCallQuery, Result<CallDto>>
{
    public async Task<Result<CallDto>> Handle(GetCallQuery request, CancellationToken cancellationToken) {
        var userId = currentUser.Id;
        var call = await dbContext.Calls.AsNoTracking()
            .Include(c => c.Participants)
            .ThenInclude(p => p.User)
            .Include(c => c.Initiator)
            .FirstOrDefaultAsync(c => c.Id == request.CallId, cancellationToken);
        if (call == null) {
            return Result<CallDto>.Failure(["Call not found."]);
        }
        if (!call.IsParticipant(userId)) {
            return Result<CallDto>.Failure(["You are not a participant of this call."]);
        }
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
        var duration = call is { StartedAt: not null, EndedAt: not null }
            ? (int?)(call.EndedAt.Value - call.StartedAt.Value).TotalSeconds
            : null;
        return Result<CallDto>.Success(
            new CallDto {
                Id = call.Id,
                Name = CallDto.ResolveDisplayName(call.Name, call.Participants),
                Type = call.Type,
                Status = call.Status,
                CreatedAt = call.CreatedAt,
                StartedAt = call.StartedAt,
                EndedAt = call.EndedAt,
                DurationSeconds = duration,
                Participants = participants,
                InitiatedBy = initiator
            }
        );
    }
}

public class GetCallQueryValidator : AbstractValidator<GetCallQuery>
{
    public GetCallQueryValidator() {
        RuleFor(x => x.CallId).NotEmpty();
    }
}
