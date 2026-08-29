import React, { useEffect, useState } from "react";
import { Activity, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import SportLiveCard, { SPORT_META } from "../components/SportLiveCard";
import { SPORTS_LIST } from "../utils/constants";

const matchesSportFilter = (match, tab) => {
  if (tab === "All") return true;
  const sport = match.tournament?.sport || "";
  return sport.toLowerCase().trim() === tab.toLowerCase().trim();
};

const LiveCenter = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const { lastLiveScore, socket } = useSocket();

  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/matches/live");
      if (res.data.success) {
        const filtered = (res.data.matches || []).filter(
          (m) => m.tournament && (m.tournament._id || m.tournament.name)
        );
        setLiveMatches(filtered);
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
        if (!payload.match.tournament) return;
        setLiveMatches((prev) => {
          const idx = prev.findIndex((m) => m._id === payload.match._id);
          if (idx !== -1) {
            if (payload.match.status === "LIVE") {
              const updated = [...prev];
              updated[idx] = payload.match;
              return updated;
            } else {
              return prev.filter((m) => m._id !== payload.match._id);
            }
          } else if (payload.match.status === "LIVE") {
            return [payload.match, ...prev];
          }
          return prev;
        });
      }
    };

    socket.on("global_live_score", onGlobalScore);
    socket.on("score_changed", onGlobalScore);

    return () => {
      socket.off("global_live_score", onGlobalScore);
      socket.off("score_changed", onGlobalScore);
    };
  }, []);

  const availableTabs = [...new Set(SPORTS_LIST)];
  const visibleMatches = liveMatches.filter((m) => matchesSportFilter(m, activeTab));

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 text-xs font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 live-indicator" />
              Live Spectator Hub
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">• WebSocket Sync</span>
          </div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">Goa Sports Live Center</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time scorepad updates streamed from tournament pitches across Goa.
          </p>
        </div>
        <button
          onClick={fetchLiveMatches}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Radio className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
          Refresh Stream
        </button>
      </div>

      {/* Sport filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {availableTabs.map((tab) => {
          const meta = SPORT_META[tab] || { emoji: "🏆", label: tab };
          const displayLabel = tab === "All" ? "All" : `${meta.emoji} ${meta.label}`;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                activeTab === tab
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {/* Matches grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : visibleMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleMatches.map((m) => (
            <SportLiveCard key={m._id} match={m} />
          ))}
        </div>
      ) : (
        <div className="p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 max-w-lg mx-auto shadow-xs text-slate-900 dark:text-white">
          <Activity className="w-14 h-14 text-slate-400 mx-auto" />
          <h3 className="font-bold text-xl text-slate-900 dark:text-white">
            {activeTab === "All"
              ? "No Matches Currently Live"
              : `No live ${activeTab} matches right now`}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {activeTab === "All"
              ? "No ongoing fixtures streaming right now. Check scheduled upcoming tournaments."
              : `There are no live ${activeTab} matches at the moment. Try a different sport or check back soon.`}
          </p>
          <Link
            to="/tournaments"
            className="inline-block px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
          >
            Explore Upcoming Fixtures
          </Link>
        </div>
      )}
    </div>
  );
};

export default LiveCenter;
