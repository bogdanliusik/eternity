# Calls

## Purpose

The calls feature supports authenticated audio and video calls with durable call history, live room coordination, and direct media streaming.

## Backend Surface

Endpoint group: `/api/calls`

- `POST /api/calls`
- `POST /api/calls/{callId}/decline`
- `GET /api/calls/history`
- `GET /api/calls/{callId}`

Related hub endpoints:

- `/hubs/general`
- `/hubs/call`

Backend behavior:

- REST endpoints create calls, fetch history, fetch call details, and record declines.
- `GeneralHub` delivers incoming-call and other session-level notifications.
- `CallHub` manages live room membership and participant state.
- The backend enforces one active call per session at the live coordination layer.

## Frontend Surface

Routes:

- `/call-history`
- `/call/:callId`

Frontend behavior:

- Call history lists user calls and supports new-call creation.
- Incoming calls are handled globally while the user is authenticated.
- Entering a call room loads call data, connects to the call hub, and initializes peer/media state.

## Real-Time Model

Calls use more than one runtime path:

- HTTP stores durable call state and returns call/history data.
- SignalR coordinates notifications, room membership, and media-state updates.
- PeerJS handles WebRTC peer connection setup for the actual media streams.

## Technical Notes

- Call state is persisted, but participant experience is highly live and session-aware.
- History status is user-relative, so the same call can appear differently to different participants.
- Changes to calls often need coordinated updates across frontend UI, backend handlers, hubs, and real-time clients.
