import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (userId) => {
  if (socket && socket.connected) return socket;
  
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  
  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
    if (userId) {
      socket.emit('join', userId);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
  });
  
  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (room) => {
  if (socket) socket.emit('joinDistrict', room);
};

export default { initSocket, getSocket, disconnectSocket, joinRoom };
