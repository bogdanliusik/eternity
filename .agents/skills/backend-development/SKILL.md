---
name: backend-development
description: Follow the repo's backend architecture and CQRS patterns. Use when changing endpoints, commands, queries, validators, DTOs, auth checks, hubs, or backend services.
---

# Backend Development

## Layer boundaries

- `Eternity.Domain` -- entities (private constructors, static `Create()` factories, behavior methods), constants (`Policies`, `RoleNames`), domain services.
- `Eternity.Application` -- MediatR commands/queries, `Result`/`Result<T>`, FluentValidation validators, behaviors, `IAppDbContext` and other interfaces.
- `Eternity.Infrastructure` -- `AppDbContext` (implements `IAppDbContext`), entity configurations, Identity, migrations, background jobs, DI registration.
- `Eternity.WebApi` -- endpoint groups, SignalR hubs, web-layer services (`CurrentUser`, `ConnectionTracker`, `CookieAuthService`), DI and middleware.

## Endpoint pattern

Endpoints extend `EndpointGroupBase`, are auto-discovered, and mapped under `/api/{groupName}`:

```csharp
public class ExampleEndpoint : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group) {
        group.RequireAuthorization();
        group.MapGet("/", GetAll);
        group.MapPost("/", Create);
    }

    private static async Task<IResult> GetAll(IMediator mediator) {
        var result = await mediator.Send(new GetAllExamplesQuery());
        return Results.Ok(result);
    }
}
```

Keep endpoints thin. Delegate all logic to MediatR handlers.

## Command/query pattern

Request record + handler class + optional validator, all in the same file:

```csharp
public record CreateExampleCommand(string Name) : IRequest<Result<ExampleDto>>;

public class CreateExampleCommandHandler(IAppDbContext dbContext, ICurrentUser currentUser)
    : IRequestHandler<CreateExampleCommand, Result<ExampleDto>>
{
    public async Task<Result<ExampleDto>> Handle(CreateExampleCommand request, CancellationToken ct) {
        // ... returns Result<ExampleDto>.Success(dto) or Result<ExampleDto>.Failure([...])
    }
}

public class CreateExampleCommandValidator : AbstractValidator<CreateExampleCommand>
{
    public CreateExampleCommandValidator() {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
    }
}
```

## MediatR pipeline order

`ResponseHandlingBehavior` (exception catch) -> `AuthorizationBehaviour` (auth) -> `ValidationBehaviour` (FluentValidation) -> Handler.

## Authorization

Two layers:
- **Transport:** `group.RequireAuthorization()`, `.AllowAnonymous()`, `.RequireAuthorization(Policies.AdminOnly)` on endpoints. `[Authorize]` on hubs.
- **Application:** custom `[Authorize(Policy = ...)]` attribute on handler classes, enforced by `AuthorizationBehaviour`. Returns `Result.Failure` on denial.

## SignalR hubs

- `GeneralHub` (`/hubs/general`) -- presence, notifications.
- `CallHub` (`/hubs/call`) -- call room coordination, signaling.
- Hubs are `partial class` (for `[LoggerMessage]` source gen), use primary constructor injection, delegate domain logic to MediatR.

## Data access

- Use `IAppDbContext` in Application, never `AppDbContext` directly.
- Entity configurations: one `IEntityTypeConfiguration<T>` per entity in `Infrastructure/Data/Configurations/`.
- EF Core uses Npgsql + `UseSnakeCaseNamingConvention()`.
- Migrations only when schema actually changes. Do not hand-edit snapshots.

## Avoid

- Fat endpoints with business logic.
- Exception-driven control flow for expected failures (use `Result`).
- Skipping validation or auth checks that similar features use.
- Crossing layer boundaries (e.g. referencing `AppDbContext` from Application).
- External analyzer packages (use .NET 10 SDK built-in analyzers only).
