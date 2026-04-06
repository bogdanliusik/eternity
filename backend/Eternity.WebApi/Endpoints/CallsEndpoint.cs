using Eternity.Application.Calls.Commands;
using Eternity.Application.Calls.Queries;
using Eternity.Application.Common.Interfaces;
using Eternity.Domain.Constants;
using Eternity.WebApi.Extensions;
using MediatR;

namespace Eternity.WebApi.Endpoints;

public class CallsEndpoint : EndpointGroupBase
{
    public override string GroupName => "calls";

    public override void Map(RouteGroupBuilder group) {
        group.RequireAuthorization();
        group.MapPost(InitiateCall);
        group.MapPost(DeclineCall, "{callId}/decline");
        group.MapGet(GetCallHistory, "history");
        group.MapGet(GetCall, "{callId}");
    }

    private static async Task<IResult> InitiateCall(InitiateCallRequest request, IMediator mediator,
        ICallNotifier callNotifier) {
        var result = await mediator.Send(new InitiateCallCommand(request.InviteeIds, request.Type, request.Name));
        if (!result.Succeeded) {
            return Results.Ok(result);
        }
        var call = result.Data;
        var inviteeUserIds = call.Participants.Where(p => p.UserId != call.InitiatedBy.UserId)
            .Select(p => p.UserId)
            .ToList();
        await callNotifier.NotifyIncomingCallAsync(
            call.Id,
            call.InitiatedBy,
            call.Type,
            call.Participants,
            inviteeUserIds
        );
        return Results.Ok(result);
    }

    private static async Task<IResult> DeclineCall(string callId, IMediator mediator, ICallNotifier callNotifier,
        ICurrentUser currentUser) {
        var result = await mediator.Send(new DeclineCallCommand(callId));
        if (!result.Succeeded) {
            return Results.Ok(result);
        }
        var data = result.Data;
        await callNotifier.NotifyCallDeclinedAsync(callId, currentUser.Id);
        if (data.CallEnded) {
            await callNotifier.NotifyCallEndedAsync(callId, "All invitees declined.", data.ParticipantUserIds);
        }
        return Results.Ok(result);
    }

    private static async Task<IResult> GetCallHistory(IMediator mediator) {
        var result = await mediator.Send(new GetCallHistoryQuery());
        return Results.Ok(result);
    }

    private static async Task<IResult> GetCall(string callId, IMediator mediator) {
        var result = await mediator.Send(new GetCallQuery(callId));
        return Results.Ok(result);
    }
}

public class InitiateCallRequest
{
    public List<Guid> InviteeIds { get; set; } = [];
    public CallType Type { get; set; }
    public string? Name { get; set; }
}
