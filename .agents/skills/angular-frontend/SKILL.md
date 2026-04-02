---
name: angular-frontend
description: Follow the repo's Angular frontend patterns. Use when changing routes, components, stores, forms, services, shared UI, or real-time client flows.
---

# Angular Frontend Patterns

## Goal

Implement frontend changes using the architecture and patterns this Angular app already uses.

## Use this when

- Adding or changing routes, components, stores, forms, services, shared UI, or real-time client behavior.

## Workflow

1. Confirm where the change belongs: `core/`, `shared/`, or `features/`.
2. Reuse the existing standalone component and route structure.
3. Use NgRx Signal Store for non-trivial state.
4. Keep orchestration in stores or services rather than inflating components.
5. Use shared SignalR and PeerJS services for real-time work.
6. Run `npm run build` and manually validate the touched flow.

## Project patterns

- Routes are centralized in `src/app/app.routes.ts`.
- App-wide providers live in `src/app/app.config.ts`.
- Non-trivial state should follow the existing `signalStore`, `withState`, `withComputed`, `withMethods`, `rxMethod`, and `tapResponse` style.
- Use typed reactive forms for non-trivial forms.

## Avoid

- Introducing Angular Material.
- Moving feature-specific code into `core/`.
- Replacing store-based flows with scattered component state when the feature already fits the store pattern.
