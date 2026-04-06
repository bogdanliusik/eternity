# Architecture Overview

This repository is a full-stack application with an Angular frontend, a .NET backend, and PostgreSQL persistence. This document describes the application structure and main technical boundaries. Current feature behavior is documented separately in `docs/features/`.

## System Shape

- `frontend/` contains the Angular client.
- `backend/` contains the .NET solution and all server-side layers.
- `docker-compose.yml` defines the main local full-stack runtime.
- `scripts/` contains setup and utility scripts.

At runtime, the frontend communicates with the backend through the server's public transport surfaces, and PostgreSQL stores application data.

## Frontend Architecture

- The frontend is an Angular 20 standalone application.
- App-wide providers are configured in `frontend/src/app/app.config.ts`.
- Routes are centralized in `frontend/src/app/app.routes.ts`.
- `core/` contains app-wide infrastructure, theme, HTTP, and shared client integrations.
- `shared/` contains reusable standalone UI components and utilities.
- `features/` contains screen-level flows and feature-specific stores or services.
- The main application runs inside the `Layout` shell and lazy-loads feature pages.
- State is primarily handled with NgRx Signal Store for non-trivial flows.
- PrimeNG provides behavior primitives, while Tailwind and theme tokens shape the final UI.

This structure keeps cross-cutting concerns centralized while allowing user-facing capabilities to evolve inside feature folders.

## Backend Architecture

The backend is a .NET 9 solution split into four layers:

- `Eternity.WebApi` handles HTTP transport, endpoint groups, hubs, and web-facing services.
- `Eternity.Application` contains commands, queries, validators, DTOs, and application-layer interfaces.
- `Eternity.Infrastructure` contains EF Core persistence, Identity, migrations, and background jobs.
- `Eternity.Domain` contains entities, constants, and domain rules.

Key backend patterns:

- HTTP endpoints are grouped by classes derived from `EndpointGroupBase` and mapped under `/api/{groupName}`.
- Application logic uses MediatR commands and queries.
- Expected failures use `Result` or `Result<T>` rather than exception-driven control flow.
- Validation uses FluentValidation close to the request types.
- Application code depends on abstractions such as `IAppDbContext` instead of infrastructure types.

This keeps transport thin, business logic explicit, and layer boundaries clear.

## Integration Model

- The frontend depends on backend contracts rather than direct database access.
- Server transport stays in `Eternity.WebApi`, while business rules stay in `Eternity.Application` and `Eternity.Domain`.
- Shared application behavior should be expressed through explicit APIs, DTOs, validators, and service abstractions.
- Cross-layer changes should preserve the separation between UI, transport, application orchestration, infrastructure, and domain rules.

## Persistence and Startup

- PostgreSQL is the main database.
- EF Core uses Npgsql and snake_case naming.
- Migrations live in `backend/Eternity.Infrastructure/Migrations`.
- Startup applies migrations and seeds required baseline data.
- Background jobs handle ongoing maintenance concerns.

Persistence concerns are intentionally centralized in Infrastructure so Application and WebApi stay focused on orchestration and transport.

## Local Runtime

- The root `docker-compose.yml` is the main local full-stack environment.
- The local stack includes the services needed to run the application end to end.
- Compose runs the backend with Production settings, so local host-run and compose-run behavior can differ.
- `scripts/setup-local.ps1` is the intended bootstrap path when the full environment should be set up consistently.

## Feature Docs

Feature-specific behavior is documented separately in `docs/features/`. This document stays focused on the underlying application structure and runtime model.
