# AGENTS.md

Repository-wide instructions for coding agents.

## Scope and Precedence

- This file applies to the whole repository.
- Additional rules exist in:
  - `frontend/AGENTS.md`
  - `backend/AGENTS.md`
- When working inside `frontend/` or `backend/`, follow the deeper `AGENTS.md` first, then this file.
- Use `.agents/skills/` for standardized task-specific skills.
- Use `docs/` for deeper context, architecture notes, feature docs, and runbooks.
- Use `docs/tooling-policy.md` for when subagents, Context7, or MCP are worth using.

## Repo Map

- `frontend/` - Angular 21 standalone app using PrimeNG, TailwindCSS, SignalR, and PeerJS client integrations.
- `backend/` - .NET 10 solution using WebApi/Application/Infrastructure/Domain layers, MediatR, EF Core, PostgreSQL, and SignalR.
- `docker-compose.yml` - full local stack for postgres, backend, frontend, and peerjs.
- `scripts/` - local setup and utility scripts.
- `docs/features/` - concise docs for the current user-facing capabilities and their backend/frontend surfaces.

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

- Before non-trivial work, load the smallest relevant skill set via the `skill` tool.
- Prefer loading 1-2 relevant skills over loading the entire catalog.
- More specific skills override more general skills for that task.
- `AGENTS.md` rules override skills.
- Put stable repo rules in `AGENTS.md`, reusable task playbooks in `.agents/skills/`, and longer explanations in `docs/`.
- Frontend work: load `angular-frontend`, `ui-quality`, or `verification-before-completion` as needed.
- Backend work: load `backend-development`, `postgres`, or `verification-before-completion` as needed.
- Debugging: load `systematic-debugging` or `debugging-troubleshooting`.

## Guidance Maintenance

- If a change materially alters architecture, conventions, verification, deployment, debugging workflow, or other durable team guidance, update the relevant `.md` files in the same changeset.
- Update `AGENTS.md` for stable repo rules, `.agents/skills/` for task playbooks, and `docs/` for deeper explanation or current feature behavior.
- Do not leave important guidance updates as follow-up work when the code change already establishes the new pattern.

## Cross-Layer Changes

- When a change spans frontend and backend, start from the user-facing flow and confirm the contract first.
- Update both layers in the same changeset when the contract changes.
- Re-check schema, auth, session, and real-time implications only when they are relevant to the flow.
- Verify the affected flow end to end when feasible.

## Verification Baseline

- Frontend-only changes: run `npm run lint` and `npm run build` in `frontend/`.
- Backend-only changes: run `dotnet format Eternity.sln --verify-no-changes` and `dotnet build Eternity.sln` in `backend/`.
- Cross-layer changes: run both frontend and backend verification.
- Schema, auth, real-time, or compose changes: verify the affected end-to-end flow when feasible.
- Do not claim automated coverage that the repository does not currently have.

## Issue Workflow

When the user references a GitHub issue (by number or URL):

1. **Fetch the issue** using `gh issue view` to read the title, body, and labels.
2. **Check local state** before branching:
   - Run `git status` and `git branch --show-current`.
   - If the current branch is not `develop`, or there are uncommitted/staged changes, **ask the user** how to proceed (e.g. stash, commit, switch anyway) before continuing.
3. **Create a branch from `develop`**:
   - Always branch from an up-to-date `develop`: `git checkout develop && git pull origin develop`.
   - Branch name follows Conventional format: `<type>/<short-description>` (e.g. `feature/user-avatar-upload`, `fix/chat-scroll-jump`).
   - Derive the type from the issue labels or content (`feature`, `fix`, `refactor`, `chore`, etc.).
4. **Implement the changes**, following all other rules in this file and the relevant sub-AGENTS.md.
5. **Run verification** per the Verification Baseline section.
6. **Ask the user to manually review** the changes before committing. Do not commit or create a PR until the user explicitly confirms.
7. **Commit and push** after user approval:
   - Follow the Commit Convention below.
   - Push the branch to origin.
8. **Create a PR** using `gh pr create`:
   - Target branch: `develop`.
   - Title: matches the commit subject.
   - Body: include a short summary of what changed and why, and add `Closes #<issue-number>` to auto-close the issue on merge.

## Commit Convention

- Use Conventional Commit format: `<type>(<scope>): <summary>`.
- Prefer `feature`, `fix`, `refactor`, `docs`, `chore`, `test`.
- Keep the subject specific and descriptive.
- Add a short body when the change needs intent or operational context.
