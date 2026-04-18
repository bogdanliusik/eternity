---
name: issue-workflow
description: Start working on a GitHub issue. Use when the user references an issue by number or URL.
---

# Issue Workflow

## Steps

1. **Fetch the issue:** `gh issue view <number>` to read title, body, and labels.
2. **Check local state:** run `git status` and `git branch --show-current`. If not on `develop` or there are uncommitted changes, ask the user how to proceed before continuing.
3. **Branch from `develop`:**
   - `git checkout develop && git pull origin develop`
   - Branch name: `<type>/<short-description>` (e.g. `feature/user-avatar-upload`, `fix/chat-scroll-jump`).
   - Derive type from issue labels or content: `feature`, `fix`, `refactor`, `chore`, etc.
4. **Implement the changes** following all AGENTS.md rules and relevant skills.
5. **Run verification** per the Verification Baseline in root AGENTS.md.
6. **Ask the user to review** before committing. Do not commit or create a PR until the user explicitly confirms.
7. **Commit and push** after approval:
   - Conventional Commit format: `<type>(<scope>): <summary>`.
   - Push to origin.
8. **Create a PR** via `gh pr create`:
   - Target: `develop`.
   - Title matches commit subject.
   - Body: short summary + `Closes #<issue-number>`.
