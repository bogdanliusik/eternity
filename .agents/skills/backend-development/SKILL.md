---
name: backend-development
description: Follow the repo's backend architecture and CQRS patterns. Use when changing endpoints, commands, queries, validators, DTOs, auth checks, hubs, or backend services.
---

# Backend Development

## Goal

Add or modify backend behavior in the repo's existing CQRS, minimal API, and real-time style.

## Use this when

- Adding or changing endpoints, commands, queries, validators, DTOs, auth checks, hubs, or backend services.

## Workflow

1. Start from the existing endpoint-group pattern in `Eternity.WebApi/Endpoints/`.
2. Keep endpoints thin and delegate logic to Application handlers or dedicated services.
3. Use MediatR plus FluentValidation.
4. Use `Result` or `Result<T>` for expected failures.
5. Use `IAppDbContext` in Application.
6. Re-check auth, session, and real-time implications if the feature is user-facing.
7. Run `dotnet build Eternity.sln`.

## Avoid

- Fat endpoints.
- Exception-driven normal control flow.
- Skipping validation or policy checks that similar features already use.
- Crossing layer boundaries casually.
