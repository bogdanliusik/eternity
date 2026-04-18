# Frontend AGENTS.md

Rules for all work in `frontend/`. These override root `AGENTS.md` where they conflict.

## Stack

- Angular 21 standalone, zoneless change detection.
- PrimeNG + TailwindCSS for UI. Do not introduce Angular Material.
- NgRx Signal Store for non-trivial state.

## Structure

- `src/app/app.config.ts` -- app-wide providers.
- `src/app/app.routes.ts` -- centralized routes; authenticated pages lazy-load under `Layout` shell.
- `core/` -- app-wide singletons (auth, theme, HTTP, SignalR, PeerJS).
- `shared/` -- reusable standalone components and directives.
- `features/` -- screen-level pages with co-located components, models, services, and stores.

## Skills

Load `angular-frontend` for implementation work, `frontend-linting` for linting/verification, `ui-quality` for visual changes, `debugging` for bug investigation.
