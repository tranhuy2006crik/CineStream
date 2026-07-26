let ioInstance = null;

export function initSeatSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('join-showtime', (showtimeId) => {
      if (showtimeId) socket.join(`showtime:${showtimeId}`);
    });

    socket.on('leave-showtime', (showtimeId) => {
      if (showtimeId) socket.leave(`showtime:${showtimeId}`);
    });

    socket.on('disconnect', () => {});
  });
}

export function emitSeatUpdate(showtimeId, data) {
  if (ioInstance && showtimeId) {
    ioInstance.to(`showtime:${showtimeId}`).emit('seats-updated', data);
  }
}
