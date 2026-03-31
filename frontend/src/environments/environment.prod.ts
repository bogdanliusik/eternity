export const environment = {
  production: true,
  iceServers: [
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
    // Add TURN server config here when available:
    // { urls: 'turn:your-turn-server.com:3478', username: '...', credential: '...' }
  ],
  peerJs: {
    host: location.hostname,
    port: location.port ? Number(location.port) : (location.protocol === 'https:' ? 443 : 80),
    path: '/',
    secure: location.protocol === 'https:'
  }
};
