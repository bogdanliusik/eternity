using Eternity.Application.Common.Models;
using Eternity.Application.RegistrationRequests.Commands;
using Eternity.Application.RegistrationRequests.Queries;
using Eternity.Domain.Constants;
using Eternity.WebApi.Extensions;
using MediatR;

namespace Eternity.WebApi.Endpoints;

public class RegistrationRequestsEndpoint : EndpointGroupBase
{
    public override string GroupName => "registration-requests";
    
    public override void Map(RouteGroupBuilder group) {
        group.RequireAuthorization(Policies.AdminOnly);
        group.MapGet(GetRequests, "");
        group.MapGet(GetCounts, "counts");
        group.MapGet(GetPendingCount, "pending-count");
        group.MapPost(ApproveRequest, "{id}/approve");
        group.MapPost(RejectRequest, "{id}/reject");
        group.MapPost(SubmitRegistrationRequest, "").AllowAnonymous();
    }

    private static async Task<IResult> GetRequests([AsParameters] RequestStatusQuery query, IMediator mediator) {
        var result = await mediator.Send(new GetRegistrationRequestsQuery(query.Status));
        return ToHttpResult(result);
    }

    private static async Task<IResult> GetCounts(IMediator mediator) {
        var result = await mediator.Send(new GetRegistrationRequestsCountsQuery());
        return ToHttpResult(result);
    }

    private static async Task<IResult> GetPendingCount(IMediator mediator) {
        var result = await mediator.Send(new GetPendingRegistrationRequestsCountQuery());
        return ToHttpResult(result);
    }

    private static async Task<IResult> ApproveRequest(Guid id, IMediator mediator) {
        var result = await mediator.Send(new ApproveRegistrationRequestCommand(id));
        return ToHttpResult(result);
    }

    private static async Task<IResult> RejectRequest(Guid id, IMediator mediator) {
        var result = await mediator.Send(new RejectRegistrationRequestCommand(id));
        return ToHttpResult(result);
    }

    private static async Task<IResult> SubmitRegistrationRequest(SubmitRegistrationRequestCommand command, IMediator mediator) {
        var result = await mediator.Send(command);
        return ToHttpResult(result);
    }

    private static IResult ToHttpResult<T>(Result<T> result) => Results.Ok(result);

    private sealed class RequestStatusQuery
    {
        public RegistrationRequestStatus Status { get; init; } = RegistrationRequestStatus.Pending;
    }
}
