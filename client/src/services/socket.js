import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL || '/';

const socket = io(socketUrl, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export default socket;
