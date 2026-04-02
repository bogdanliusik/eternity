# Architecture Overview

This repository is a full-stack product with a clear split between Angular frontend and .NET backend.

## Frontend

- Angular 20 standalone app.
- App-wide providers live in `frontend/src/app/app.config.ts`.
- Routes are centralized in `frontend/src/app/app.routes.ts`.
- `core/` holds app-wide services and infrastructure concerns.
- `shared/` holds reusable standalone UI and utilities.
- `features/` holds screen-level flows and feature stores or services.
- State is primarily managed with NgRx Signal Store.
- UI uses PrimeNG for behavior and Tailwind plus theme tokens for final presentation.

## Backend

- .NET 9 solution with four layers:
  - `Eternity.WebApi`
  - `Eternity.Application`
  - `Eternity.Infrastructure`
  - `Eternity.Domain`
- Minimal API endpoints are grouped by `EndpointGroupBase` implementations and auto-mapped under `/api/{groupName}`.
- Application logic uses MediatR commands and queries plus `Result`-based responses.
- Validation uses FluentValidation.
- Persistence uses EF Core with PostgreSQL and snake_case naming.

## Real-Time

- SignalR is a first-class part of the architecture.
- `GeneralHub` handles presence and session-related live behavior.
- `CallHub` handles call-room live behavior.
- PeerJS is used alongside SignalR for WebRTC media setup in call flows.

## Local Stack

- The root `docker-compose.yml` runs postgres, backend, frontend, and peerjs.
- `scripts/setup-local.ps1` is the intended bootstrap path for the full environment.
