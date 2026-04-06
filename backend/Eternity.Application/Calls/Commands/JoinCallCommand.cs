using Eternity.Application.Calls.Models;
using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Domain.Constants;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Calls.Commands;

public record JoinCallCommand(string CallId) : IRequest<Result<CallDto>>;

public class JoinCallCommandHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<JoinCallCommand, Result<CallDto>>
{
    public async Task<Result<CallDto>> Handle(JoinCallCommand request, CancellationToken cancellationToken) {
        var userId = currentUser.Id;
        var call = await dbContext.Calls.Include(c => c.Participants)
            .ThenInclude(p => p.User)
            .Include(c => c.Initiator)
            .FirstOrDefaultAsync(c => c.Id == request.CallId, cancellationToken);
        if (call == null) {
            return Result<CallDto>.Failure(["Call not found."]);
        }
        if (call.Status != CallStatus.Active) {
            return Result<CallDto>.Failure(["This call is no longer active."]);
        }
        var participant = call.GetParticipant(userId);
        if (participant == null) {
            return Result<CallDto>.Failure(["You are not a participant of this call."]);
        }
        if (participant.Status == ParticipantStatus.Joined) {
            var existingParticipants =
                call.Participants.Select(InitiateCallCommandHandler.MapParticipantToDto).ToList();
            var existingInitiator = existingParticipants.First(p => p.UserId == call.InitiatorId);
            var existingDuration = call.StartedAt != null && call.EndedAt != null
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
                    DurationSeconds = existingDuration,
                    Participants = existingParticipants,
                    InitiatedBy = existingInitiator
                }
            );
        }
        if (participant.Status == ParticipantStatus.Declined) {
            return Result<CallDto>.Failure(["You have already declined this call."]);
        }
        // Note: per-session "already in another call" enforcement is handled
        // at the CallHub level (in-memory tracker), not here.
        // The domain model tracks user-level participation, while session-level
        // tracking is an infrastructure concern.
        participant.Join();
        if (userId != call.InitiatorId && call.StartedAt == null) {
            call.MarkStarted();
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        var participants = call.Participants.Select(InitiateCallCommandHandler.MapParticipantToDto).ToList();
        var initiator = participants.First(p => p.UserId == call.InitiatorId);
        var duration = call.StartedAt != null && call.EndedAt != null
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

public class JoinCallCommandValidator : AbstractValidator<JoinCallCommand>
{
    public JoinCallCommandValidator() {
        RuleFor(x => x.CallId).NotEmpty().MaximumLength(26);
    }
}
