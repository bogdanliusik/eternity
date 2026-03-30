# AGENTS.md

Repository-wide instructions for coding agents.

## Scope and Priority

- This file defines global rules for the whole repository.
- Additional rules exist in:
  - `frontend/AGENTS.md`
  - `backend/AGENTS.md`
- When working inside `frontend/` or `backend/`, follow the local file first, then this file.

## Repo Structure

- `frontend/` - Angular application (PrimeNG + TailwindCSS).
- `backend/` - .NET 9 solution with WebApi/Application/Infrastructure/Domain layers.
- `scripts/` - local setup and utility scripts.

## Universal Engineering Rules

- Keep changes focused and minimal; avoid unrelated refactors.
- Follow existing patterns before introducing new abstractions.
- Do not add secrets to git (`.env*`, credentials, tokens).
- Prefer readable, explicit code over clever shortcuts.
- Preserve accessibility and error handling when modifying behavior.
- If verification cannot be run locally, state exactly what was not verified.

## Git Hygiene

- Do not revert unrelated user changes.
- Do not run destructive git commands.
- Do not create commits unless explicitly requested.

## Commit Convention

- Use Conventional Commit format:
  - `<type>(<scope>): <summary>`
- Example:
  - `feature(call-history): refine mobile menu typography and calls hierarchy`
- Prefer `feature`, `fix`, `refactor`, `docs`, `chore`, `test`.
- Keep summaries concise and action-oriented.

## Rule Files Discovery

- Cursor rules: none currently found.
- Copilot instructions: none currently found.
- If these are added later, treat them as high-priority constraints.
