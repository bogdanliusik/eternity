---
name: frontend-linting
description: ESLint config, linting commands, and frontend verification. Use when checking or fixing lint errors, adjusting ESLint config, or verifying frontend changes.
---

# Frontend Linting and Verification

## Source of truth

- `frontend/eslint.config.js` -- flat config (ESLint 9), extends `@angular-eslint/recommended` + `eslint-config-prettier`.
- Prettier handles formatting; ESLint handles code quality. They do not overlap.

## Key rules

- Component selector: `app-kebab-case` (element). Directive selector: `appCamelCase` (attribute).
- Unused vars: `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: "^_"`, `varsIgnorePattern: "^_"`.
- Inline templates processed via `angular.processInlineTemplates`.
- HTML files: `angular.configs.templateRecommended` + `angular.configs.templateAccessibility`.
- Do not weaken recommended rules to suppress warnings; fix the code instead.

## Commands

From `frontend/`:

```bash
npm run lint          # check for lint errors (ng lint)
npm run lint:fix      # auto-fix what it can (import sorting, unused imports, etc.)
npm run build         # verify compilation
```

## Verification

- Run `npm run lint` then `npm run build` after any frontend change.
- UI changes: manually validate light theme, dark theme, mobile, and desktop.
- No automated test coverage exists; do not assume specs exist.
