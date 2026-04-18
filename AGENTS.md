# AGENTS.md

Repository-wide rules for coding agents. Sub-rules in `frontend/AGENTS.md` and `backend/AGENTS.md` take precedence for their respective directories.

## Repo Map

- `frontend/` -- Angular 21 standalone app (PrimeNG, TailwindCSS, SignalR, PeerJS).
- `backend/` -- .NET 10 solution (WebApi / Application / Infrastructure / Domain, MediatR, EF Core, PostgreSQL, SignalR).
- `docker-compose.yml` -- full local stack (postgres, backend, frontend, peerjs).
- `scripts/` -- local setup and utility scripts.

## Rules

- Keep changes focused and minimal.
- Follow existing patterns before introducing new abstractions.
- Do not add secrets to git.
- Prefer readable, explicit code over clever shortcuts.
- Preserve existing behavior, error handling, and accessibility unless the task requires a change.

## Git

- Do not revert unrelated changes.
- Do not run destructive git commands.
- Do not create commits unless explicitly requested.
- Conventional Commit format: `<type>(<scope>): <summary>`. Types: `feature`, `fix`, `refactor`, `docs`, `chore`, `test`.

## Skills

Load the smallest relevant skill set before non-trivial work. `AGENTS.md` rules override skills.

Available skills in `.agents/skills/`:
- `angular-frontend` -- frontend implementation patterns.
- `frontend-linting` -- ESLint config, linting commands, and frontend verification.
- `backend-development` -- backend CQRS and endpoint patterns.
- `backend-formatting` -- formatting config, Rider/Roslyn divergence, analyzer setup, and backend verification.
- `ui-quality` -- visual consistency and theme compliance.
- `debugging` -- root-cause investigation workflow.
- `issue-workflow` -- GitHub issue branch/PR workflow.

## Cross-Layer Changes

- Start from the user-facing flow and confirm the API contract first.
- Update both layers in the same changeset when the contract changes.
- Verify the affected flow end to end when feasible.

## Verification

If verification was not run, say so explicitly. No automated test coverage exists; do not claim otherwise. Verification commands are defined in the `backend-formatting` and `frontend-linting` skills.

## Guidance Maintenance

If a change alters architecture, conventions, or workflows, update the relevant AGENTS.md or skill files in the same changeset.
