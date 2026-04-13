# Backend AGENTS.md

Instructions for all work in `backend/`.

## Stack and Layers

- .NET 10 solution: `Eternity.sln`.
- `Eternity.WebApi` - minimal API transport, SignalR hubs, and web-layer services.
- `Eternity.Application` - CQRS, MediatR, validators, behaviors, and application models.
- `Eternity.Infrastructure` - EF Core, Identity, persistence, migrations, and background jobs.
- `Eternity.Domain` - entities and domain rules.
- Respect layer boundaries.

## Endpoint Pattern

- Endpoints are grouped by classes derived from `EndpointGroupBase`.
- Endpoint groups are auto-discovered and mapped under `/api/{groupName}`.
- Keep endpoints thin and delegate business logic to Application handlers or dedicated services.

## Application Layer Conventions

- Use MediatR commands and queries.
- Use `Result` and `Result<T>` for expected failures.
- Put FluentValidation validators next to the request type.
- Use `IAppDbContext` from Application instead of `AppDbContext` directly.
- Keep methods explicit and focused.
- Use endpoint or hub authorization at the transport layer and request-level authorization when app-layer policy checks matter.

## Auth and Security

- JWT authentication is carried in cookies and tied to persisted user sessions.
- Be careful with cookie refresh, session validity, and hub authentication behavior.
- Keep API and hub errors clear without leaking internal details.

## Data and Startup

- PostgreSQL is the database.
- EF Core uses Npgsql and snake_case naming.
- Migrations live in `Eternity.Infrastructure/Migrations`.
- Startup currently applies migrations, resets stale online session flags, and seeds roles plus the admin user.
- Add migrations only when schema changes require them.
- Do not hand-edit migration snapshots unless it is necessary and understood.

## Real-Time and Runtime

- SignalR hubs are a first-class part of the backend architecture, not optional extras.
- Re-check hub behavior when changing auth, session, presence, or other live workflows.
- The root `docker-compose.yml` is the main full-stack local environment, and compose runs the backend with Production settings.

## Formatting

- `backend/.editorconfig` is the source of truth for backend formatting and analyzer settings.
- `docs/backend-formatting.md` describes the expected local workflow, Rider usage, and validation commands.
- `dotnet format Eternity.sln` is the authoritative formatter for backend code.

## Verification

- Run `dotnet format Eternity.sln --verify-no-changes` when changing backend formatting or analyzer configuration.
- Run `dotnet build Eternity.sln`.
- Run the narrowest useful verification first, then broader checks.
- Backend automated test coverage is currently limited; do not assume a test project already exists.

## Skills to Check

- `.agents/skills/backend-development/SKILL.md`
- `.agents/skills/postgres/SKILL.md`
- `.agents/skills/debugging-troubleshooting/SKILL.md`
- `.agents/skills/systematic-debugging/SKILL.md`
- `.agents/skills/verification-before-completion/SKILL.md`
