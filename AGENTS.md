# AGENTS.md

Repository-wide instructions for coding agents.

## Scope and Precedence

- This file applies to the whole repository.
- Additional rules exist in:
  - `frontend/AGENTS.md`
  - `backend/AGENTS.md`
- When working inside `frontend/` or `backend/`, follow the deeper `AGENTS.md` first, then this file.
- Use `.agents/skills/` for standardized task-specific skills.
- Use `docs/` for deeper context, architecture notes, and runbooks.
- Use `docs/tooling-policy.md` for when subagents, Context7, or MCP are worth using.

## Repo Map

- `frontend/` - Angular 20 standalone app using PrimeNG, TailwindCSS, SignalR, and PeerJS client integrations.
- `backend/` - .NET 9 solution using WebApi/Application/Infrastructure/Domain layers, MediatR, EF Core, PostgreSQL, and SignalR.
- `docker-compose.yml` - full local stack for postgres, backend, frontend, and peerjs.
- `scripts/` - local setup and utility scripts.

## Always-On Rules

- Keep changes focused and minimal.
- Follow existing patterns before introducing new abstractions.
- Do not add secrets to git (`.env*`, credentials, tokens).
- Prefer readable, explicit code over clever shortcuts.
- Preserve accessibility, error handling, and existing behavior unless the task requires a change.
- If verification cannot be run locally, state exactly what was not verified.

## Git Hygiene

- Do not revert unrelated user changes.
- Do not run destructive git commands.
- Do not create commits unless explicitly requested.

## Skill Usage

- Before non-trivial work, read the smallest relevant skill set from `.agents/skills/`.
- Prefer reading 1-2 relevant skills over reading the entire skill catalog.
- More specific skills override more general skills for that task.
- `AGENTS.md` rules override skills.
- Put stable repo rules in `AGENTS.md`, reusable task playbooks in `.agents/skills/`, and longer explanations in `docs/`.

## Guidance Maintenance

- If a change materially alters architecture, conventions, verification, deployment, debugging workflow, or other durable team guidance, update the relevant `.md` files in the same changeset.
- Update `AGENTS.md` for stable repo rules, `.agents/skills/` for task playbooks, and `docs/` for deeper explanation or runbooks.
- Do not leave important guidance updates as follow-up work when the code change already establishes the new pattern.

## Verification Baseline

- Frontend-only changes: run `npm run build` in `frontend/`.
- Backend-only changes: run `dotnet build Eternity.sln` in `backend/`.
- Schema, auth, real-time, or compose changes: verify the affected end-to-end flow when feasible.
- Do not claim automated coverage that the repository does not currently have.

## Commit Convention

- Use Conventional Commit format: `<type>(<scope>): <summary>`.
- Prefer `feature`, `fix`, `refactor`, `docs`, `chore`, `test`.
- Keep the subject specific and descriptive.
- Add a short body when the change needs intent or operational context.
