using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Domain.Constants;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Calls.Commands;

public record DeclineCallCommand(string CallId) : IRequest<Result<DeclineCallResult>>;

public record DeclineCallResult(CallStatus CallStatus, bool CallEnded, List<Guid> ParticipantUserIds);

public class DeclineCallCommandHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<DeclineCallCommand, Result<DeclineCallResult>>
{
    public async Task<Result<DeclineCallResult>> Handle(DeclineCallCommand request,
        CancellationToken cancellationToken) {
        var userId = currentUser.Id;

        var call = await dbContext.Calls
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == request.CallId, cancellationToken);

        if (call == null) {
            return Result<DeclineCallResult>.Failure(["Call not found."]);
        }

        if (call.Status != CallStatus.Active) {
            return Result<DeclineCallResult>.Failure(["This call is no longer active."]);
        }

        var participant = call.GetParticipant(userId);
        if (participant == null) {
            return Result<DeclineCallResult>.Failure(["You are not a participant of this call."]);
        }

        if (participant.Status != ParticipantStatus.Ringing) {
            return Result<DeclineCallResult>.Failure(["You can only decline a call that is ringing."]);
        }

        participant.Decline();

        var wasActive = call.Status == CallStatus.Active;
        call.RecalculateStatus();
        var callEnded = wasActive && call.Status != CallStatus.Active;

        await dbContext.SaveChangesAsync(cancellationToken);

        var participantUserIds = call.Participants.Select(p => p.UserId).ToList();

        return Result<DeclineCallResult>.Success(
            new DeclineCallResult(call.Status, callEnded, participantUserIds));
    }
}

public class DeclineCallCommandValidator : AbstractValidator<DeclineCallCommand>
{
    public DeclineCallCommandValidator() {
        RuleFor(x => x.CallId).NotEmpty().MaximumLength(26);
    }
}
