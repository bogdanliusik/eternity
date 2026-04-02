---
name: full-stack-feature
description: Implement features that span frontend, backend, and often database or real-time behavior. Use when a feature crosses layers.
---

# Full-Stack Feature Implementation

## Goal

Implement features that span frontend, backend, and often database or real-time behavior without drifting between layers.

## Use this when

- A feature touches frontend plus backend and possibly database, auth, SignalR, or PeerJS behavior.

## Recommended sequence

1. Start from the user-facing flow.
2. Define or confirm the frontend-backend contract.
3. Update domain or data model if needed.
4. Add EF configuration and migration if the schema changes.
5. Add Application command or query plus validator.
6. Expose it through the endpoint group or hub surface.
7. Update frontend service, store, and UI.
8. Update SignalR or PeerJS coordination if the feature is real-time.
9. Verify the feature end to end.

## Working rules

- Keep contracts explicit.
- Reuse existing store and handler patterns.
- Think about auth, empty states, and error states from the start.
