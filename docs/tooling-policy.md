# Tooling Policy

This document explains when AI agents working in this repository should rely on local repo guidance only, and when additional tooling such as subagents, Context7, or MCP is worth using.

## Default Position

- The default guidance system for this repo is:
  - `AGENTS.md`
  - nested `AGENTS.md`
  - `.agents/skills/`
  - `docs/`
- This is sufficient for normal coding work in this repository.
- Additional tooling should only be used when it clearly improves speed, correctness, or verification.

## Subagents

### Recommendation

- Use subagents for non-trivial exploration and multi-area analysis.
- They are the highest-value optional tool for this repo today.

### Good use cases

- exploring frontend and backend patterns in parallel
- triaging bugs that may span UI, API, auth, SignalR, PeerJS, or database layers
- reviewing broad changesets or PRs
- understanding full-stack impact before implementing a large feature

### Avoid when

- the task is a small local edit
- the answer is already obvious from one file or one subsystem
- the coordination cost would exceed the work itself

## Context7

### Recommendation

- Use Context7 as a supporting reference source, not as the source of truth.
- It is optional, not required.

### Good use cases

- Angular 21 framework details not already shown in repo code
- PrimeNG API details not obvious from local usage
- .NET 10 or EF Core API questions where repo examples are insufficient
- upgrade or compatibility work

### Avoid when

- the repo already contains a clear working example
- the task is mainly about repo-specific architecture or conventions
- external guidance would be more generic than the local pattern

## MCP

### Recommendation

- Do not treat MCP as required for this repo.
- Add or use MCP only for concrete recurring pain points.

### Good use cases

- browser automation or visual verification via Playwright-style tooling
- live database inspection, query-plan analysis, or schema verification
- GitHub, CI, or deployment environment automation when the workflow genuinely needs it

### Overkill when

- normal coding tasks are fully solvable from the local repo and shell tools
- a build command and code inspection are enough to verify the change
- the tool would add setup cost without improving outcomes

## Practical Recommendation For This Repo

- Use the repo guidance system by default.
- Use subagents for larger or cross-layer tasks.
- Use Context7 only when local code does not answer the framework question.
- Defer MCP until you have a specific recurring need, such as browser verification or live database inspection.

## Review Trigger

Revisit this policy when any of these become common:

- repeated need for browser-driven UI validation
- repeated need for live Postgres inspection or query-plan analysis
- repeated need for GitHub or CI automation beyond basic git and `gh` usage
- repeated agent mistakes caused by missing external framework context
