import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Zap } from "lucide-react";
import { formatLocation } from "../utils/constants";

export const SPORT_META = {
  Football:       { emoji: "⚽", label: "Football" },
  Cricket:        { emoji: "🏏", label: "Cricket" },
  Badminton:      { emoji: "🏸", label: "Badminton" },
  Chess:          { emoji: "♟️",  label: "Chess" },
  Kabaddi:        { emoji: "🤼", label: "Kabaddi" },
  "Table Tennis": { emoji: "🏓", label: "Table Tennis" },
  Volleyball:     { emoji: "🏐", label: "Volleyball" },
  Basketball:     { emoji: "🏀", label: "Basketball" },
  Futsal:         { emoji: "⚽", label: "Futsal" },
  Tennis:         { emoji: "🎾", label: "Tennis" },
};

const FootballScore = ({ match }) => {
  const fd = match.liveData?.football || {};
  const goals = fd.goals || [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
        <div className="text-center space-y-1 min-w-0">
          <p className="font-display font-bold text-sm sm:text-base text-white break-words leading-tight">{match.teamA?.name || "Team A"}</p>
          <span className="text-[10px] uppercase font-mono text-slate-400">Home</span>
        </div>
        <div className="text-center flex-shrink-0 px-2">
          <div className="text-2xl sm:text-4xl font-black font-mono text-emerald-400 tracking-wider whitespace-nowrap">
            {match.scoreA?.current ?? 0}<span className="text-slate-600 mx-1">-</span>{match.scoreB?.current ?? 0}
          </div>
          {fd.minute != null && (
            <div className="mt-1 text-xs font-mono text-rose-400 font-bold">
              {fd.minute}&apos;{fd.half && <span className="ml-1 text-slate-400 font-normal">{fd.half === 1 ? "1st Half" : "2nd Half"}</span>}
            </div>
          )}
          <span className="text-[10px] text-rose-400 uppercase font-bold tracking-widest block mt-1 animate-pulse">IN PROGRESS</span>
        </div>
        <div className="text-center space-y-1 min-w-0">
          <p className="font-display font-bold text-sm sm:text-base text-white break-words leading-tight">{match.teamB?.name || "Team B"}</p>
          <span className="text-[10px] uppercase font-mono text-slate-400">Away</span>
        </div>
      </div>
      {goals.length > 0 && (
        <div className="space-y-1.5 px-1">
          {goals.map((g, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
              <span>⚽</span>
              <span className="font-mono text-emerald-400 flex-shrink-0">{g.minute}&apos;</span>
              <span className="font-semibold truncate">{g.team}</span>
              {g.player && <span className="text-slate-500 truncate">({g.player})</span>}
            </div>
          ))}
        </div>
      )}
      {((fd.yellowCards?.length ?? 0) > 0 || (fd.redCards?.length ?? 0) > 0) && (
        <div className="flex items-center gap-3 text-xs text-slate-400 px-1">
          {fd.yellowCards?.length > 0 && <span className="flex items-center gap-1"><span className="w-3 h-4 rounded-sm bg-yellow-400 inline-block" />{fd.yellowCards.length}</span>}
          {fd.redCards?.length > 0 && <span className="flex items-center gap-1"><span className="w-3 h-4 rounded-sm bg-rose-500 inline-block" />{fd.redCards.length}</span>}
        </div>
      )}
    </div>
  );
};

const CricketScore = ({ match }) => {
  const cd = match.liveData?.cricket || {};
  const runs = cd.runs ?? match.scoreA?.current ?? 0;
  const wickets = cd.wickets ?? 0;
  const overs = cd.overs ?? "0.0";
  const innings = cd.innings ?? 1;
  const target = cd.target ?? null;
  const battingTeam = cd.battingTeam ?? 1;
  const battingName = battingTeam === 1 ? (match.teamA?.name || "Team A") : (match.teamB?.name || "Team B");
  const fieldingName = battingTeam === 1 ? (match.teamB?.name || "Team B") : (match.teamA?.name || "Team A");
  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-bold text-sm sm:text-base text-white truncate">{battingName}</p>
          <span className="text-[10px] uppercase font-mono text-emerald-400">Batting</span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">{runs}/{wickets}</div>
          <div className="text-xs font-mono text-slate-400">{overs} Overs</div>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-bold text-sm sm:text-base text-white truncate">{fieldingName}</p>
          <span className="text-[10px] uppercase font-mono text-slate-400">Bowling</span>
        </div>
        {target != null && (
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold text-amber-400">Target: {target}</div>
            {innings === 2 && <div className="text-[10px] text-slate-400">Need {Math.max(0, target - runs)} from {Math.max(0, 10 - wickets)} wkts</div>}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2">
        <span>{innings === 1 ? "1st Innings" : "2nd Innings"}</span>
        <span className="text-rose-400 font-bold animate-pulse uppercase tracking-wider">Live</span>
      </div>
    </div>
  );
};

const BadmintonScore = ({ match }) => {
  const bd = match.liveData?.badminton || {};
  const sets = bd.sets || [];
  const currentSet = bd.currentSet ?? (sets.length + 1);
  const pointA = bd.pointA ?? 0;
  const pointB = bd.pointB ?? 0;
  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
      {sets.length > 0 && (
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 pb-2 border-b border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Player / Team</span>
          <div className="flex items-center gap-2">
            {sets.map((_, i) => <span key={i} className="w-8 text-center text-[10px] uppercase font-mono text-slate-400">S{i+1}</span>)}
            <span className="w-10 text-center text-[10px] uppercase font-mono text-emerald-400">Now</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <p className="font-display font-bold text-sm text-white truncate">{match.teamA?.name || "Player A"}</p>
        <div className="flex items-center gap-2 font-mono">
          {sets.map((s, i) => <span key={i} className={`w-8 text-center text-sm font-bold ${s[0] > s[1] ? "text-emerald-400" : "text-slate-400"}`}>{s[0]}</span>)}
          <span className="w-10 text-center text-base font-black text-emerald-400">{pointA}</span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <p className="font-display font-bold text-sm text-white truncate">{match.teamB?.name || "Player B"}</p>
        <div className="flex items-center gap-2 font-mono">
          {sets.map((s, i) => <span key={i} className={`w-8 text-center text-sm font-bold ${s[1] > s[0] ? "text-emerald-400" : "text-slate-400"}`}>{s[1]}</span>)}
          <span className="w-10 text-center text-base font-black text-teal-400">{pointB}</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2">
        <span>Set {currentSet} — {pointA} : {pointB}</span>
        <span className="text-rose-400 font-bold animate-pulse uppercase tracking-wider">Live</span>
      </div>
    </div>
  );
};

const GenericScore = ({ match }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
    <div className="text-center space-y-1 min-w-0">
      <p className="font-display font-bold text-sm sm:text-base text-white break-words leading-tight">{match.teamA?.name || "Team A"}</p>
      <span className="text-[10px] uppercase font-mono text-slate-400">Team A</span>
    </div>
    <div className="text-center flex-shrink-0 px-2">
      <div className="text-2xl sm:text-4xl font-black font-mono text-emerald-400 tracking-wider whitespace-nowrap">
        {match.scoreA?.display || match.scoreA?.current || 0}<span className="text-slate-600 mx-1">:</span>{match.scoreB?.display || match.scoreB?.current || 0}
      </div>
      <span className="text-[10px] text-rose-400 uppercase font-bold tracking-widest block mt-1 animate-pulse">IN PROGRESS</span>
    </div>
    <div className="text-center space-y-1 min-w-0">
      <p className="font-display font-bold text-sm sm:text-base text-white break-words leading-tight">{match.teamB?.name || "Team B"}</p>
      <span className="text-[10px] uppercase font-mono text-slate-400">Team B</span>
    </div>
  </div>
);

const SportLiveCard = ({ match }) => {
  const sport = match.tournament?.sport || "Football";
  const meta = SPORT_META[sport] || { emoji: "🏆", label: sport };
  const renderScore = () => {
    switch (sport) {
      case "Football": case "Futsal": return <FootballScore match={match} />;
      case "Cricket": return <CricketScore match={match} />;
      case "Badminton": case "Table Tennis": case "Tennis": return <BadmintonScore match={match} />;
      default: return <GenericScore match={match} />;
    }
  };
  return (
    <div className="relative rounded-3xl glass-panel border border-rose-500/40 p-5 sm:p-7 space-y-5 shadow-2xl shadow-rose-950/20 overflow-hidden">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-950 text-emerald-400 border border-emerald-500/30">{meta.emoji} {meta.label}</span>
          <span className="text-xs font-mono font-semibold text-slate-400 truncate">{match.round}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-black text-rose-400 uppercase tracking-widest font-mono flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-rose-500 live-indicator" />
          LIVE NOW
        </div>
      </div>
      <div>
        <h3 className="font-display font-bold text-base sm:text-lg text-white truncate">{match.tournament?.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 flex-wrap">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">
            {match.tournament?.venue}{match.tournament?.location ? `, ${formatLocation(match.tournament.location)}` : ""}{match.venueCourt ? ` \u2022 ${match.venueCourt}` : ""}
          </span>
        </div>
      </div>
      {renderScore()}
      {match.summary && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 italic flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="line-clamp-2">{match.summary}</span>
        </div>
      )}
      <div className="pt-1 flex items-center justify-end">
        <Link to={`/tournaments/${match.tournament?._id || match.tournament}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 group">
          <span>Full Bracket &amp; Standings</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default SportLiveCard;
