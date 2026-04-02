---
name: debugging-troubleshooting
description: Investigate bugs and failures methodically in this repo. Use for runtime errors, regressions, startup failures, broken flows, or integration issues.
---

# Debugging and Troubleshooting

## Goal

Give investigations a repeatable workflow so fixes target root cause instead of symptoms.

## Use this when

- Investigating a bug, regression, startup failure, runtime error, or broken integration flow.

## Workflow

1. Reproduce the issue first.
2. Identify the failing layer before editing code:
   - frontend rendering or state
   - REST API
   - auth, cookies, or sessions
   - SignalR
   - PeerJS or media devices
   - database or migration
   - compose or container startup
3. Use the narrowest check that can confirm or reject the current hypothesis.
4. Compare the failing flow with the nearest working flow in the repo.
5. Confirm root cause and rerun the failing flow after the fix.

## Read with this skill

- `systematic-debugging`
- `verification-before-completion`
