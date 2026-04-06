# Skills Policy

This file keeps the repo's guidance system focused instead of turning it into overlapping instructions.

## Goal

- Keep `AGENTS.md` files short and stable.
- Keep `.agents/skills/` limited to reusable task workflows.
- Keep `docs/` for architecture, feature descriptions, and human-readable context.

## What Belongs Where

### Put it in `AGENTS.md` when

- the rule applies to most tasks
- it describes stable repo architecture or hard constraints
- breaking it would likely cause incorrect work across many changes

Examples:

- layer boundaries
- verification baseline
- main stack choices
- durable cross-layer rules

### Put it in `.agents/skills/` when

- it is a repeatable workflow or playbook
- it is task-shaped rather than feature-shaped
- it contains concrete steps, heuristics, or checklists
- it is useful across multiple future tasks

Examples:

- debugging workflow
- backend implementation workflow
- UI quality review checklist
- migration and query tuning workflow

### Put it in `docs/` when

- the content is explanatory rather than directive
- humans need background context, architecture, or feature notes
- the content is too long for a skill or stable rule file

Examples:

- architecture overview
- feature docs in `docs/features/`
- tooling policy
- deeper design notes

## When to Add a Skill

Add a skill only if most of these are true:

- the workflow comes up repeatedly
- it is useful beyond one current feature
- it gives more value than a short AGENTS rule would
- it can stay concise and specific
- it reduces repeated agent mistakes

Good candidates:

- recurring debugging patterns
- repeated backend or frontend implementation workflows
- recurring migration or verification procedures

Bad candidates:

- current feature walkthroughs
- notes that mainly describe existing endpoints or screens
- rules that already belong in `AGENTS.md`
- generic best-practice dumps not tailored to this repo

## Feature Guidance Rule

- Skills should not depend on the existence of a specific current feature.
- Current feature behavior belongs in `docs/features/`.
- If a proposed skill mainly explains one feature's endpoints, live flow, or UI, it should be a doc instead.

## When to Update, Merge, or Remove Skills

Update an existing skill when the workflow is still valid but the guidance is stale or incomplete.

Remove or merge a skill when:

- it duplicates another skill
- it became too generic to be useful
- it became too narrow to justify its own file
- the useful parts moved into stable repo rules
- agents no longer need it to complete tasks correctly

If two skills are usually read together, consider merging them. If a skill no longer adds unique operational value, prefer deleting it.

## Size and Style Guidelines

- Keep skills short enough to scan quickly.
- Prefer repo-specific guidance over generic advice.
- Use sequences and checklists when they improve execution.
- Avoid copying the same rule into multiple files.
- Link to other skills or docs instead of repeating content.

## External Skill Check

Before adding an external skill, ask:

- does it fit this stack and architecture?
- is it better than the local guidance we already have?
- will it push patterns that conflict with repo conventions?
- is it specific enough to be useful here?
- can the useful part be adapted into local guidance instead?

Default stance:

- prefer local repo-owned guidance
- add external skills sparingly
- only keep them when they clearly improve agent behavior in this repo

## Maintenance Process

When a skill changes:

1. Update the skill file.
2. Update `AGENTS.md` references only if selection guidance changed.
3. Update `docs/` only if deeper explanation is needed.

When durable project guidance changes:

1. Decide whether it belongs in `AGENTS.md`, `.agents/skills/`, or `docs/`.
2. Update the right files in the same changeset.
3. Prefer deleting weak guidance over leaving overlapping instructions behind.

## Review Trigger

Review the skill system when any of these happen:

- agents repeatedly ignore or misuse skills
- multiple skills begin overlapping
- the stack or architecture changes materially
- a workflow becomes common across many tasks
- the guidance starts feeling long, repetitive, or hard to scan

## Success Criteria

The guidance system is healthy when:

- agents can quickly find the right instructions
- `AGENTS.md` files stay short
- skills remain practical and reused
- docs describe architecture and features without pretending to be workflows
- new guidance reduces repeated mistakes instead of adding noise
