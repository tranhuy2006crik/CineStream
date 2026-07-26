import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function useSocket(showtimeId, onSeatsUpdated) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onSeatsUpdated);
  callbackRef.current = onSeatsUpdated;

  useEffect(() => {
    if (!showtimeId) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('join-showtime', showtimeId);
    socket.on('seats-updated', (data) => {
      callbackRef.current?.(data);
    });

    return () => {
      socket.emit('leave-showtime', showtimeId);
      socket.disconnect();
    };
  }, [showtimeId]);

  return socketRef;
}
