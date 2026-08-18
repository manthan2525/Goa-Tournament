import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Zap,
  MapPin,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
  Radio,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const LiveCenter = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastLiveScore, socket } = useSocket();

  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matches/live');
      if (res.data.success) {
        setLiveMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();

    const onGlobalScore = (payload) => {
      if (payload.match) {
        setLiveMatches((prev) => {
          const idx = prev.findIndex((m) => m._id === payload.match._id);
          if (idx !== -1) {
            if (payload.match.status === 'LIVE') {
              const updated = [...prev];
              updated[idx] = payload.match;
              return updated;
            } else {
              // Remove if completed from live center
              return prev.filter((m) => m._id !== payload.match._id);
            }
          } else if (payload.match.status === 'LIVE') {
            return [payload.match, ...prev];
          }
          return prev;
        });
      }
    };

    socket.on('global_live_score', onGlobalScore);
    socket.on('score_changed', onGlobalScore);

    return () => {
      socket.off('global_live_score', onGlobalScore);
      socket.off('score_changed', onGlobalScore);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 live-indicator"></span>
              Live Spectator Hub
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              • Instant WebSocket Sync
            </span>
          </div>
          <h1 className="font-display font-black text-3xl text-white">
            Goa Sports Live Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time scorepad updates streamed directly from tournament pitches across Goa.
          </p>
        </div>

        <button
          onClick={fetchLiveMatches}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          Refresh Stream
        </button>
      </div>

      {/* Live Matches Container */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 rounded-3xl glass-card border border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : liveMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveMatches.map((m) => (
            <div
              key={m._id}
              className="relative rounded-3xl glass-panel border border-rose-500/40 p-6 sm:p-8 space-y-6 shadow-2xl shadow-rose-950/20 overflow-hidden"
            >
              {/* Glowing header strip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-950 text-emerald-400 border border-emerald-500/30">
                    {m.tournament?.sport || 'Sports'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    {m.round}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-black text-rose-400 uppercase tracking-widest font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 live-indicator"></span>
                  LIVE NOW
                </div>
              </div>

              {/* Tournament Title */}
              <div>
                <h3 className="font-display font-bold text-lg text-white truncate">
                  {m.tournament?.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{m.tournament?.venue}, {m.tournament?.location} • {m.venueCourt}</span>
                </div>
              </div>

              {/* Huge Live Scoreboard */}
              <div className="grid grid-cols-5 items-center bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800">
                {/* Team A */}
                <div className="col-span-2 text-center space-y-1">
                  <p className="font-display font-bold text-base sm:text-lg text-white truncate">
                    {m.teamA?.name}
                  </p>
                  <span className="text-[10px] uppercase font-mono text-slate-400">Team A</span>
                </div>

                {/* Score */}
                <div className="col-span-1 text-center font-mono">
                  <div className="text-2xl sm:text-4xl font-black text-emerald-400 tracking-wider">
                    {m.scoreA?.display || m.scoreA?.current || 0} : {m.scoreB?.display || m.scoreB?.current || 0}
                  </div>
                  <span className="text-[10px] text-rose-400 uppercase font-bold tracking-widest block mt-1 animate-pulse">
                    IN PROGRESS
                  </span>
                </div>

                {/* Team B */}
                <div className="col-span-2 text-center space-y-1">
                  <p className="font-display font-bold text-base sm:text-lg text-white truncate">
                    {m.teamB?.name}
                  </p>
                  <span className="text-[10px] uppercase font-mono text-slate-400">Team B</span>
                </div>
              </div>

              {/* Live Commentary */}
              {m.summary && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 italic flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{m.summary}</span>
                </div>
              )}

              {/* View Match Tournament */}
              <div className="pt-2 flex items-center justify-end">
                <Link
                  to={`/tournaments/${m.tournament?._id || m.tournament}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 group"
                >
                  <span>Full Tournament Bracket & Standings</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 glass-panel rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <Activity className="w-14 h-14 text-slate-600 mx-auto" />
          <h3 className="font-bold text-xl text-white">No Matches Currently Live</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            There are no ongoing fixtures streaming right now. Check scheduled upcoming tournaments across Goa stadiums.
          </p>
          <Link
            to="/tournaments"
            className="inline-block px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
          >
            Explore Upcoming Fixtures
          </Link>
        </div>
      )}
    </div>
  );
};

export default LiveCenter;
