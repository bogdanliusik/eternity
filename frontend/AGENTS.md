# Frontend AGENTS.md

Instructions for all work in `frontend/`.

## Stack

- Angular 20 standalone application.
- The app runs with zoneless change detection.
- PrimeNG plus TailwindCSS for UI.
- NgRx Signal Store is the default pattern for non-trivial state.
- Do not introduce Angular Material.

## App Shape

- App-wide providers are configured in `src/app/app.config.ts`.
- Routes are centralized in `src/app/app.routes.ts`.
- Keep `core/` for app-wide services, auth, theme, and real-time clients.
- Keep `shared/` for reusable standalone UI and utilities.
- Keep `features/` for screen-level flows and feature-specific stores/services.
- Authenticated pages belong under the `Layout` shell and lazy-load standalone components.

## State and Forms

- Prefer NgRx Signal Store for feature or reusable component state.
- Follow the existing store style with `signalStore`, `withState`, `withComputed`, `withMethods`, `rxMethod`, and `tapResponse`.
- Keep components lean and move orchestration into stores and services.
- Use typed reactive forms for non-trivial forms.
- Avoid introducing new `any` in touched code when a precise type is practical.

## UI and Theme

- Use PrimeNG as behavior primitives, not as the final visual design.
- Match the existing Eternity visual language before introducing new UI patterns.
- Theme changes must stay compatible with:
  - `src/styles.css`
  - `src/app/core/themes/eternity-theme.ts`
  - `src/app/core/themes/theme.service.ts`
- Preserve light and dark theme support.
- Preserve mobile usability and touch targets when UI changes.

## Real-Time

- SignalR usage should go through the shared hub services built on `SignalRService`.
- Keep real-time orchestration in shared services rather than feature-local ad hoc clients.
- When peer or media behavior is needed, extend the existing shared client services instead of creating parallel implementations.

## Verification

- Run `npm run build`.
- UI changes require manual validation of the touched flow in light theme, dark theme, mobile width, and desktop width.
- Frontend automated test coverage is currently limited; do not assume a spec already exists.

## Skills to Check

- `.agents/skills/ui-quality/SKILL.md`
- `.agents/skills/angular-frontend/SKILL.md`
- `.agents/skills/debugging-troubleshooting/SKILL.md`
- `.agents/skills/systematic-debugging/SKILL.md`
- `.agents/skills/verification-before-completion/SKILL.md`
