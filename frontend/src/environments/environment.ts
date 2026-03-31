export const environment = {
  production: false,
  iceServers: [
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
    // Add TURN server config here when available:
    // { urls: 'turn:your-turn-server.com:3478', username: '...', credential: '...' }
  ],
  peerJs: {
    host: 'localhost',
    port: 9000,
    path: '/',
    secure: false
  }
};
