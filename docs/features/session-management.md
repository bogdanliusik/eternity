# Session Management

## Purpose

User sessions are first-class application records. They are used for auth validity, admin visibility, live presence, remote termination, and some session-scoped real-time rules.

## Core Model

Main entity: `UserSession`

Important fields include:

- session id
- user id
- refresh token and expiry
- started and ended timestamps
- IP address and user agent metadata
- termination flag
- online flag

Useful definitions:

- Active: session is not terminated and has not expired.
- Online: session currently has at least one active general hub connection.
- Inactive: session was terminated or expired.

## Backend Surface

Endpoint group: `/api/sessions`

- `GET /api/sessions/current`
- `GET /api/sessions/getAll`
- `POST /api/sessions/terminate/{id}`
- `POST /api/sessions/pingSession`

Backend behavior:

- `current` returns the caller's current session.
- `getAll` is an admin view with filtering by active and online state.
- `terminate/{id}` lets admins end a specific session.
- `pingSession` sends a live message to an online session.

## Live Presence

`GeneralHub` is responsible for session presence tracking.

- A session becomes online when its first general hub connection opens.
- A session becomes offline when its last general hub connection closes.
- Multiple tabs can share the same session.

This means a session can be active but offline when the user is authenticated without a current live hub connection.

## Frontend Surface

Admin route:

- `/administration/sessions`

The administration UI groups sessions into online, active, and inactive views and supports terminate and ping actions.

## Technical Notes

- Startup resets stale online flags so abandoned live connections do not survive process restarts.
- Background cleanup handles natural session expiry.
- Session identity also affects some live workflows, so session changes can have user-visible real-time side effects.
