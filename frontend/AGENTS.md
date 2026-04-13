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

## Linting

- `eslint.config.js` (flat config, ESLint 9) is the source of truth for lint rules.
- Config extends `@angular-eslint/recommended` for `.ts` and `.html` files, plus `eslint-config-prettier` to avoid conflicts with Prettier.
- Import ordering is enforced by `eslint-plugin-simple-import-sort`.
- Custom rules are minimal: component/directive selector prefixes (`app`), `_`-prefix pattern for unused variables, and import sorting. Everything else uses recommended defaults.
- `npm run lint` runs ESLint via Angular CLI (`ng lint`).
- `npm run lint:fix` auto-fixes what it can (import sorting, unused imports, etc.).
- Do not weaken recommended rules to suppress warnings; fix the code instead.
- Prettier handles formatting (Ctrl+Shift+F); ESLint handles code quality. They do not overlap.

## Verification

- Run `npm run lint` to check for lint errors.
- Run `npm run build` to verify compilation.
- UI changes require manual validation of the touched flow in light theme, dark theme, mobile width, and desktop width.
- Frontend automated test coverage is currently limited; do not assume a spec already exists.

## Skills to Check

- `.agents/skills/ui-quality/SKILL.md`
- `.agents/skills/angular-frontend/SKILL.md`
- `.agents/skills/debugging-troubleshooting/SKILL.md`
- `.agents/skills/systematic-debugging/SKILL.md`
- `.agents/skills/verification-before-completion/SKILL.md`
