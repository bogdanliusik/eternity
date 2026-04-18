# Backend AGENTS.md

Rules for all work in `backend/`. These override root `AGENTS.md` where they conflict.

## Stack

- .NET 10 solution: `Eternity.sln`.
- `Eternity.WebApi` -- minimal API endpoints, SignalR hubs, web-layer services.
- `Eternity.Application` -- MediatR commands/queries, `Result`/`Result<T>`, FluentValidation, behaviors, interfaces.
- `Eternity.Infrastructure` -- EF Core (`AppDbContext`), Identity, migrations, background jobs.
- `Eternity.Domain` -- entities, constants, domain services.
- Respect layer boundaries strictly.

## Key conventions

- Endpoints extend `EndpointGroupBase`, are auto-discovered, and must stay thin.
- All commands/queries return `Result` or `Result<T>` -- no exception-driven control flow.
- Validators go next to the request type in the same file.
- Use `IAppDbContext` in Application, never `AppDbContext` directly.
- JWT carried in cookies, tied to persisted sessions. Be careful with cookie refresh, session validity, and hub auth.
- SignalR hubs are first-class -- re-check hub behavior when changing auth, session, or presence flows.
- EF Core uses Npgsql + snake_case naming. Migrations only when schema actually changes.
- `dotnet format Eternity.sln` is the authoritative formatter. `.editorconfig` is the source of truth.

## Skills

Load `backend-development` for implementation work, `backend-formatting` for formatting/analyzer issues, `debugging` for bug investigation.
