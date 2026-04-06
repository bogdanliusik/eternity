# Registration Requests

## Purpose

Public sign-up does not create an immediately usable application account. It creates a registration request that must be reviewed by an admin.

This keeps registration approval explicit and separates sign-up from activation.

## Backend Surface

Endpoint group: `/api/registration-requests`

- `POST /api/registration-requests`
- `GET /api/registration-requests?status={status}`
- `GET /api/registration-requests/counts`
- `GET /api/registration-requests/pending-count`
- `POST /api/registration-requests/{id}/approve`
- `POST /api/registration-requests/{id}/reject`

Backend behavior:

- Public submission is anonymous and rate limited.
- Submission creates a pending registration request and a locked Identity user.
- Approval unlocks the user, grants the `Member` role, and creates the application-level user record.
- Rejection marks the request as rejected and removes the pending user account.

## Frontend Surface

Routes:

- `/register`
- `/administration/registration-requests`

Frontend behavior:

- The public form validates input and submits a registration request.
- The admin page shows pending, approved, and rejected tabs.
- Admin approve and reject actions update both the page state and the pending-count badge.

## Technical Notes

- Duplicate prevention is handled in application logic rather than by a request-only database rule.
- Approval is the point where a registrant becomes a usable application user.
