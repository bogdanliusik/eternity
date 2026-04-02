---
name: verification-before-completion
description: Require fresh verification evidence before claiming success. Use before saying a build passes, a bug is fixed, or a task is complete.
---

# Verification Before Completion

## Goal

Prevent completion claims that are not backed by fresh evidence from the actual verification command or flow.

## Workflow

1. Identify what command or manual flow proves the claim.
2. Run the relevant verification.
3. Read the result, not just the exit code.
4. Make sure the evidence actually supports the claim.
5. Only then state the outcome.

## Repo-specific examples

- Frontend-only change:
  - run `npm run build`
  - for UI changes, manually validate light theme, dark theme, mobile, and desktop when feasible
- Backend-only change:
  - run `dotnet build Eternity.sln`
- Schema, auth, real-time, or compose change:
  - build is not enough by itself; verify the affected end-to-end flow when feasible

## Rule

- If verification was not run, say that clearly.
