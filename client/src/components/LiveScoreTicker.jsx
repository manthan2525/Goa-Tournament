import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronRight, Activity } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const LiveScoreTicker = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const { lastLiveScore } = useSocket();

  const fetchLiveMatches = async () => {
    try {
      const res = await api.get('/matches/live');
      if (res.data.success) {
        // Filter out any match whose tournament was deleted (null population)
        const valid = (res.data.matches || []).filter(
          (m) => m.tournament && (m.tournament._id || m.tournament.name)
        );
        setLiveMatches(valid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
  }, []);

  // Update real-time if live score event occurs
  useEffect(() => {
    if (lastLiveScore) {
      // Ignore updates from orphaned matches
      if (!lastLiveScore.match?.tournament) return;
      setLiveMatches((prev) => {
        const matchIdx = prev.findIndex((m) => m._id === lastLiveScore.matchId);
        if (matchIdx !== -1) {
          if (lastLiveScore.match?.status !== 'LIVE') {
            return prev.filter((m) => m._id !== lastLiveScore.matchId);
          }
          const updated = [...prev];
          updated[matchIdx] = lastLiveScore.match;
          return updated;
        } else if (lastLiveScore.match?.status === 'LIVE') {
          return [lastLiveScore.match, ...prev];
        }
        return prev;
      });
    }
  }, [lastLiveScore]);

  if (liveMatches.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/90 border-y border-rose-500/30 py-2.5 px-4 overflow-hidden backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Live Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black tracking-wider uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-500 live-indicator"></span>
            LIVE NOW
          </span>
        </div>

        {/* Matches Scroller */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5">
          {liveMatches.map((m) => (
            <Link
              key={m._id}
              to={`/tournaments/${m.tournament?._id || m.tournament}`}
              className="flex items-center gap-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 py-1.5 px-3 rounded-xl flex-shrink-0 transition-colors"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {m.tournament?.sport || 'Match'}
              </span>

              <div className="flex items-center gap-2 text-xs font-semibold text-white font-mono">
                <span className="truncate max-w-[100px]">{m.teamA?.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-400 font-black">
                  {m.scoreA?.display || m.scoreA?.current || 0} : {m.scoreB?.display || m.scoreB?.current || 0}
                </span>
                <span className="truncate max-w-[100px]">{m.teamB?.name}</span>
              </div>

              {m.summary && (
                <span className="text-[10px] text-slate-400 italic hidden sm:inline truncate max-w-[120px]">
                  {m.summary}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <Link
          to="/live"
          className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 flex-shrink-0"
        >
          <span>All Live</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default LiveScoreTicker;
