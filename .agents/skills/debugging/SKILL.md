---
name: debugging
description: Investigate bugs and failures methodically. Use for any non-trivial bug, flaky behavior, build failure, runtime error, or integration issue.
---

# Debugging

## Rule

Fix the root cause, not the symptom. No code changes until you have evidence.

## Workflow

1. Read the error output carefully.
2. Reproduce the issue consistently.
3. Check recent changes and environment differences.
4. Identify the failing layer and trace the bad data or event backward to its origin.
5. Find the nearest working example in the repo.
6. Form one specific hypothesis.
7. Make the smallest possible check to prove or disprove it.
8. Fix the root cause.
9. Re-run the original failing flow and nearby flows.

## Red flags

- Quick speculative fixes without evidence.
- Stacked changes with no intermediate verification.
- Claiming a bug is fixed without rerunning the failing scenario.
- If verification was not run, say so explicitly.
