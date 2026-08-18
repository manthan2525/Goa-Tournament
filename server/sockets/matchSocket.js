import { Server } from 'socket.io';
import { setNotificationIO } from '../utils/notify.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5000',
  ];

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  setNotificationIO(ioInstance);

  ioInstance.on('connection', (socket) => {
    // Join personal user room for private notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Leave personal user room
    socket.on('leave_user', (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });

    // Join tournament room
    socket.on('join_tournament', (tournamentId) => {
      if (tournamentId) {
        socket.join(`tournament_${tournamentId}`);
      }
    });

    // Leave tournament room
    socket.on('leave_tournament', (tournamentId) => {
      if (tournamentId) {
        socket.leave(`tournament_${tournamentId}`);
      }
    });

    // Join specific match room
    socket.on('join_match', (matchId) => {
      if (matchId) {
        socket.join(`match_${matchId}`);
      }
    });

    // Leave match room
    socket.on('leave_match', (matchId) => {
      if (matchId) {
        socket.leave(`match_${matchId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized yet!');
  }
  return ioInstance;
};

// Real-time broadcast helpers
export const broadcastScoreUpdate = (match) => {
  if (!ioInstance) return;
  const payload = {
    matchId: match._id,
    tournamentId: match.tournament,
    match,
    updatedAt: new Date().toISOString(),
  };

  ioInstance.to(`match_${match._id}`).emit('score_changed', payload);
  ioInstance.to(`tournament_${match.tournament}`).emit('match_update', payload);
  ioInstance.emit('global_live_score', payload);
};

export const broadcastTournamentUpdate = (tournamentId, data) => {
  if (!ioInstance) return;
  ioInstance.to(`tournament_${tournamentId}`).emit('tournament_update', data);
  ioInstance.emit('global_tournament_update', { tournamentId, ...data });
};
