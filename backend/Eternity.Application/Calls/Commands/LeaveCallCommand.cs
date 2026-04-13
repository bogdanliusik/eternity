using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Domain.Constants;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Calls.Commands;

public record LeaveCallCommand(Guid CallId) : IRequest<Result<LeaveCallResult>>;

public record LeaveCallResult(CallStatus CallStatus, bool CallEnded, List<Guid> ParticipantUserIds);

public class LeaveCallCommandHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<LeaveCallCommand, Result<LeaveCallResult>>
{
    public async Task<Result<LeaveCallResult>> Handle(LeaveCallCommand request, CancellationToken cancellationToken) {
        var userId = currentUser.Id;
        var call = await dbContext.Calls.Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == request.CallId, cancellationToken);
        if (call == null) {
            return Result<LeaveCallResult>.Failure(["Call not found."]);
        }
        var participant = call.GetParticipant(userId);
        if (participant == null) {
            return Result<LeaveCallResult>.Failure(["You are not a participant of this call."]);
        }
        if (participant.Status != ParticipantStatus.Joined) {
            return Result<LeaveCallResult>.Failure(["You are not currently in this call."]);
        }
        participant.Leave();
        var wasActive = call.Status == CallStatus.Active;
        call.RecalculateStatus();
        var callEnded = wasActive && call.Status != CallStatus.Active;
        await dbContext.SaveChangesAsync(cancellationToken);
        var participantUserIds = call.Participants.Select(p => p.UserId).ToList();
        return Result<LeaveCallResult>.Success(new LeaveCallResult(call.Status, callEnded, participantUserIds));
    }
}

public class LeaveCallCommandValidator : AbstractValidator<LeaveCallCommand>
{
    public LeaveCallCommandValidator() {
        RuleFor(x => x.CallId).NotEmpty();
    }
}
