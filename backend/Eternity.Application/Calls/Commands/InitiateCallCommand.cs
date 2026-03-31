using Eternity.Application.Calls.Models;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Domain.Constants;
using Eternity.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Calls.Commands;

public record InitiateCallCommand(List<Guid> InviteeIds, CallType Type, string? Name)
    : IRequest<Result<CallDto>>;

public class InitiateCallCommandHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<InitiateCallCommand, Result<CallDto>>
{
    public async Task<Result<CallDto>> Handle(InitiateCallCommand request, CancellationToken cancellationToken) {
        var userId = currentUser.Id;

        var isInActiveCall = await dbContext.CallParticipants
            .AnyAsync(p => p.UserId == userId
                           && p.Status == ParticipantStatus.Joined
                           && p.Call.Status == CallStatus.Active, cancellationToken);

        if (isInActiveCall) {
            return Result<CallDto>.Failure(["You are already in an active call."]);
        }

        var existingUserIds = await dbContext.UserAccounts
            .Where(u => request.InviteeIds.Contains(u.Id))
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        var missingIds = request.InviteeIds.Except(existingUserIds).ToList();
        if (missingIds.Count > 0) {
            return Result<CallDto>.Failure(["One or more invited users do not exist."]);
        }

        var call = Call.Create(userId, request.Type, request.Name, request.InviteeIds);

        await dbContext.Calls.AddAsync(call, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var savedCall = await dbContext.Calls
            .AsNoTracking()
            .Include(c => c.Participants)
                .ThenInclude(p => p.User)
            .Include(c => c.Initiator)
            .FirstAsync(c => c.Id == call.Id, cancellationToken);

        return Result<CallDto>.Success(MapToDto(savedCall));
    }

    private static CallDto MapToDto(Call call) {
        var participants = call.Participants.Select(MapParticipantToDto).ToList();
        var initiator = participants.First(p => p.UserId == call.InitiatorId);
        var duration = call.StartedAt != null && call.EndedAt != null
            ? (int?)(call.EndedAt.Value - call.StartedAt.Value).TotalSeconds
            : null;

        return new CallDto {
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
        };
    }

    internal static CallParticipantDto MapParticipantToDto(CallParticipant p) {
        return new CallParticipantDto {
            Id = p.Id,
            UserId = p.UserId,
            Username = p.User.UserName,
            FullName = p.User.FullName,
            AvatarUrl = p.User.AvatarUrl,
            ParticipantStatus = p.Status,
            JoinedAt = p.JoinedAt,
            LeftAt = p.LeftAt
        };
    }
}

public class InitiateCallCommandValidator : AbstractValidator<InitiateCallCommand>
{
    public InitiateCallCommandValidator() {
        RuleFor(x => x.InviteeIds)
            .NotEmpty().WithMessage("At least one invitee is required.")
            .Must(ids => ids.Count <= CallParticipant.MaxParticipantsPerCall - 1)
            .WithMessage($"A call cannot have more than {CallParticipant.MaxParticipantsPerCall} total participants.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid call type.");

        RuleFor(x => x.Name)
            .MaximumLength(256).When(x => x.Name != null);
    }
}
