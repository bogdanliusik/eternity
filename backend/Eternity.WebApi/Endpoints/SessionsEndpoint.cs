using Eternity.Application.Sessions.Commands;
using Eternity.Application.Sessions.Queries;
using Eternity.Domain.Constants;
using Eternity.WebApi.Extensions;
using MediatR;

namespace Eternity.WebApi.Endpoints;

public class SessionsEndpoint : EndpointGroupBase
{
    public override string GroupName => "sessions";
    
    public override void Map(RouteGroupBuilder group) {
        group.RequireAuthorization();
        group.MapGet(GetCurrentSession, "current");
        group.MapGet(GetAllSessions, "getAll").RequireAuthorization(Policies.AdminOnly);;
        group.MapPost(TerminateSession, "terminate/{id:guid}").RequireAuthorization(Policies.AdminOnly);
    }

    private static async Task<IResult> GetAllSessions([AsParameters] SessionFilterQuery filter, IMediator mediator) {
        var result = await mediator.Send(new GetAllSessionsQuery(filter.PageNumber, filter.PageSize, filter.IsActive));
        return Results.Ok(result);
    }

    private static async Task<IResult> GetCurrentSession(IMediator mediator) {
        var result = await mediator.Send(new GetCurrentSessionQuery());
        return Results.Ok(result);
    }
    
    private static async Task<IResult> TerminateSession(Guid id, IMediator mediator) {
        var result = await mediator.Send(new TerminateSessionCommand(id));
        return Results.Ok(result);
    }

    private class SessionFilterQuery {
        public int PageNumber { get; init; }
        public int PageSize { get; init; }
        public bool? IsActive { get; init; }
    }
}
