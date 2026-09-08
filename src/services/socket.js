import { io } from 'socket.io-client';

// Detect appropriate socket URL:
// In development, window.location.hostname with port 3000 or same origin
const host = window.location.hostname;
const socketUrl = window.location.port === '5173' 
  ? `http://${host}:3000` 
  : window.location.origin;

export const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('[Socket] Connected to server with ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected from server:', reason);
});

socket.on('connect_error', (error) => {
  console.warn('[Socket] Connection error:', error.message);
});
