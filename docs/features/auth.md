# Auth

## Purpose

Authentication is based on cookie-carried JWTs backed by persisted user sessions. Logging in creates a session on the backend, and authenticated requests stay tied to that session for authorization, refresh, and live connection behavior.

Registration is not direct account activation. Public sign-up submits a registration request, and admin approval is handled by a separate feature.

## Backend Surface

Endpoint group: `/api/users`

- `POST /api/users/loginCookie`
- `POST /api/users/logout`
- `GET /api/users/getCurrentUser`
- `GET /api/users/getCurrentUserNameAsMember`
- `GET /api/users/getCurrentUserNameAsAdmin`
- `GET /api/users/search`

Backend behavior:

- `loginCookie` validates credentials, creates a persisted session, and sets auth cookies.
- `logout` terminates the current session and removes cookies.
- `getCurrentUser` is the main frontend bootstrap endpoint for authenticated state.
- Roles are enforced through policies such as `MemberOnly` and `AdminOnly`.

## Frontend Surface

Routes:

- `/login`
- `/register`

Frontend behavior:

1. The app initializes auth state by calling `getCurrentUser`.
2. Successful auth populates the auth store.
3. The frontend connects its general SignalR client after auth succeeds.
4. `401` responses clear auth state and redirect to `/login`.

## Technical Notes

- Auth is cookie-based even though the backend uses JWT bearer auth internally.
- Session identity is part of the authenticated context and is used outside plain HTTP requests.
- Cookie validity, token refresh, and session validity should be considered together when changing auth behavior.
- The backend exposes logout, but the main architectural point is session termination rather than client-only state clearing.
