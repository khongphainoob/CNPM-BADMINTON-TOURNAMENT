let io = null;

export function initSocket(serverInstance, IoServerClass) {
  io = new IoServerClass(serverInstance, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-match', (matchId) => {
      socket.join(`match-${matchId}`);
    });
  });

  return io;
}

export function getIo() {
  return io;
}

export function broadcastScoreUpdate(matchId, data) {
  if (io) {
    io.to(`match-${matchId}`).emit('score-update', data);
    io.emit('global-score-update', { matchId, ...data });
  }
}
