# Skills Policy

This file explains how to keep the repo's AI guidance system useful over time instead of letting it grow into instruction clutter.

## Goal

- Keep `AGENTS.md` files short and stable.
- Keep `.agents/skills/` focused on high-value workflows.
- Keep `docs/` for deeper explanation and human-readable context.

## What Belongs Where

### Put it in `AGENTS.md` when

- the rule should apply almost all the time
- it describes stable repo architecture or hard constraints
- violating it would likely cause incorrect work in many tasks

Examples:

- layer boundaries
- required verification baseline
- main stack choices
- skill discovery rules

### Put it in `.agents/skills/` when

- it is a repeatable workflow or playbook
- it is only relevant for certain tasks
- it contains step-by-step guidance, heuristics, or checklists
- it would make `AGENTS.md` too long or too specific

Examples:

- debugging workflow
- full-stack feature implementation flow
- UI quality review checklist
- migration and query tuning workflow

### Put it in `docs/` when

- the content is explanatory rather than directive
- humans need background context or runbooks
- the content is too long for a skill or rule file

Examples:

- architecture overviews
- local-dev notes
- troubleshooting notes
- real-time flow explanations

## When to Add a New Skill

Add a new skill only if most of these are true:

- the workflow comes up repeatedly
- it is useful across multiple future tasks
- it is more procedural than architectural
- it can stay short and specific
- it would reduce repeated prompting or repeated agent mistakes

Good candidates:

- recurring debugging patterns
- repeated cross-layer implementation flows
- recurring deployment or migration procedures

Bad candidates:

- one-off feature notes
- rules that already belong in `AGENTS.md`
- long architecture explanations that belong in `docs/`
- overly generic best-practice dumps not tailored to this repo

## When to Update an Existing Skill

Update an existing skill instead of creating a new one when:

- the new guidance fits the same workflow
- agents are making the same mistake within that area
- the repo pattern changed and the skill is now stale
- two skills are starting to overlap heavily

Prefer improving an existing skill before splitting it.

## When to Remove or Merge Skills

Remove or merge a skill when:

- it duplicates another skill
- the underlying workflow is no longer used in the repo
- it became too generic to be useful
- it became too narrow to justify its own file
- agents no longer need it because the guidance moved into stable repo rules

If two skills are usually read together, consider merging them.

## Size and Style Guidelines

- Keep skills short enough to scan quickly.
- Start with `Purpose`, `Use When`, and `Why This Is a Skill`.
- Prefer repo-specific guidance over generic advice.
- Use checklists and sequences when they help.
- Avoid copying the same rule into multiple files.
- Link related skills instead of duplicating content.

## How to Evaluate a Proposed External Skill

Before adding an external skill, ask:

- does it fit this stack and architecture?
- is it better than the local skill we already have?
- will it push patterns that conflict with repo conventions?
- is it specific enough to be useful here?
- can we adapt the useful parts locally instead of depending on a remote definition?

Default stance:

- prefer local repo-owned skills
- add external skills sparingly
- only add them when they clearly improve agent behavior in this repo

## Lightweight Maintenance Process

When a skill changes:

1. Update the skill file.
2. Update `.agents/skills/` discovery references if selection guidance needs to change.
3. Update `AGENTS.md` references only if the skill should become part of standard task selection.
4. Update `docs/` only if deeper explanation is needed.

When a large or durable code change lands:

1. Decide whether it changes stable repo rules, a repeatable workflow, or deeper explanatory context.
2. Update the relevant `AGENTS.md`, `.agents/skills/`, or `docs/` files in the same changeset.
3. Prefer same-change guidance updates over creating documentation debt for later.

## Review Trigger

Review the skill system when any of these happen:

- agents repeatedly ignore or misuse skills
- multiple skills begin overlapping
- the stack or architecture changes materially
- a new workflow becomes common across tasks
- the guidance starts feeling long, repetitive, or hard to scan

## Success Criteria

The skill system is healthy when:

- agents can quickly find the right guidance
- `AGENTS.md` files stay short
- skills are practical and reused
- docs hold explanation instead of operational rules
- new guidance reduces repeated mistakes instead of adding noise
