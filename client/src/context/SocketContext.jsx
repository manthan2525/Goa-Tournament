import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastLiveScore, setLastLiveScore] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onGlobalScore(payload) {
      setLastLiveScore(payload);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('global_live_score', onGlobalScore);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('global_live_score', onGlobalScore);
    };
  }, []);

  const joinTournament = (tournamentId) => {
    if (tournamentId) {
      socket.emit('join_tournament', tournamentId);
    }
  };

  const leaveTournament = (tournamentId) => {
    if (tournamentId) {
      socket.emit('leave_tournament', tournamentId);
    }
  };

  const joinMatch = (matchId) => {
    if (matchId) {
      socket.emit('join_match', matchId);
    }
  };

  const leaveMatch = (matchId) => {
    if (matchId) {
      socket.emit('leave_match', matchId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastLiveScore,
        joinTournament,
        leaveTournament,
        joinMatch,
        leaveMatch,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
