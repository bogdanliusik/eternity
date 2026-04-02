---
name: systematic-debugging
description: Force root-cause investigation before code changes. Use for any non-trivial bug, flaky behavior, build failure, runtime error, or integration issue.
---

# Systematic Debugging

## Goal

Force root-cause investigation before code changes so bug fixes are based on evidence instead of guesswork.

## Workflow

1. Read the error output carefully.
2. Reproduce the issue consistently when possible.
3. Check recent changes and environment differences.
4. In cross-layer flows, identify where the failure first becomes visible.
5. Trace the bad data, state, or event backward to its origin.
6. Find the nearest working example in the same repo.
7. Form one specific hypothesis.
8. Make the smallest possible change or check to prove or disprove it.
9. Fix the root cause, not the symptom.
10. Re-run the original failing flow and nearby flows.

## Repo reminders

- Cookie auth and session validity can make frontend and backend symptoms look unrelated.
- SignalR and PeerJS failures may be timing- or lifecycle-related.
- Compose and host-run behavior can differ because compose uses Production settings.

## Red flags

- quick speculative fixes
- stacked changes with no evidence
- claiming a bug is fixed without rerunning the failing scenario
