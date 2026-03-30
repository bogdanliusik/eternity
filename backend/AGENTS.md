# Backend Agent Rules

Instructions for all work in `backend/`.

## Stack and Architecture

- .NET 9 solution: `Eternity.sln`.
- Projects:
  - `Eternity.WebApi` - minimal API and transport.
  - `Eternity.Application` - CQRS/MediatR, validation, behaviors.
  - `Eternity.Infrastructure` - EF Core, Identity, persistence, jobs.
  - `Eternity.Domain` - entities, domain rules/constants/events.
- Respect layer boundaries (no infrastructure concerns in Domain/Application).

## Build and Run

- Restore: `dotnet restore Eternity.sln`
- Build: `dotnet build Eternity.sln -c Debug`
- Run API: `dotnet run --project Eternity.WebApi/Eternity.WebApi.csproj`
- Tests (when present):
  - all: `dotnet test Eternity.sln`
  - single: `dotnet test --filter "FullyQualifiedName~Namespace.Class.Test"`

## Coding Rules

- Keep endpoints thin; move logic into Application handlers/services.
- Prefer `Result`/`Result<T>` for expected failures; avoid exception-driven flow.
- Use async/await for I/O and DB work.
- Keep nullability strict (`Nullable` enabled).
- Use `IAppDbContext` in Application; keep EF configuration in Infrastructure.
- Follow naming conventions:
  - `*Command`, `*Query`, `*Dto`, `*Settings`
- Keep methods focused and explicit.

## Validation, Auth, and Errors

- Reuse existing MediatR pipeline behaviors (validation/authorization/response handling).
- Add FluentValidation validators for new request models.
- Keep authorization policy checks explicit and consistent.
- Return clear API errors; do not leak secrets/internal details.

## Data and Migrations

- Preserve existing DB naming and conventions.
- Add migrations only when schema changes require it.
- Do not modify generated migration snapshots manually unless required and understood.

## Quality Bar

- Compile before finishing.
- Run the narrowest relevant verification first, then broader checks.
- Avoid unrelated formatting churn.
