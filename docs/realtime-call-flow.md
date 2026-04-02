# Real-Time Call Flow

## High-Level Flow

- REST endpoints create and query calls.
- SignalR `CallHub` manages live room membership, participant events, and media state updates.
- PeerJS handles WebRTC peer connections for media streaming.
- The frontend call room coordinates REST, SignalR, and PeerJS together.

## Why This Matters

- Call features usually cannot be changed safely in only one layer.
- A bug may live in REST state, hub coordination, or WebRTC setup even when the symptom looks similar.
