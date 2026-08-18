import { Server } from 'socket.io';

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
        // Allow requests with no origin (like mobile apps, curl) or matched origins
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in development
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Join tournament room
    socket.on('join_tournament', (tournamentId) => {
      if (tournamentId) {
        socket.join(`tournament_${tournamentId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined tournament_${tournamentId}`);
      }
    });

    // Leave tournament room
    socket.on('leave_tournament', (tournamentId) => {
      if (tournamentId) {
        socket.leave(`tournament_${tournamentId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left tournament_${tournamentId}`);
      }
    });

    // Join specific match room
    socket.on('join_match', (matchId) => {
      if (matchId) {
        socket.join(`match_${matchId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined match_${matchId}`);
      }
    });

    // Leave match room
    socket.on('leave_match', (matchId) => {
      if (matchId) {
        socket.leave(`match_${matchId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
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

  // Broadcast to match room, tournament room, and global live stream
  ioInstance.to(`match_${match._id}`).emit('score_changed', payload);
  ioInstance.to(`tournament_${match.tournament}`).emit('match_update', payload);
  ioInstance.emit('global_live_score', payload);
};

export const broadcastTournamentUpdate = (tournamentId, data) => {
  if (!ioInstance) return;
  ioInstance.to(`tournament_${tournamentId}`).emit('tournament_update', data);
  ioInstance.emit('global_tournament_update', { tournamentId, ...data });
};
