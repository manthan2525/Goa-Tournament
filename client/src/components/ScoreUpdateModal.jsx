import React, { useState } from "react";
import { X, Zap, Plus, Minus, CheckCircle, ShieldAlert, Radio } from "lucide-react";
import api from "../services/api";

// ─── Football controls ────────────────────────────────────────────────────────
const FootballControls = ({ scoreA, setScoreA, scoreB, setScoreB, liveData, setLiveData }) => {
  const fd = liveData.football || { minute: 0, half: 1, goals: [], yellowCards: [], redCards: [] };
  const setFd = (patch) => setLiveData((prev) => ({ ...prev, football: { ...fd, ...patch } }));

  const addGoal = (team) => {
    const score = team === "A" ? scoreA : scoreB;
    const setter = team === "A" ? setScoreA : setScoreB;
    const newScore = score + 1;
    setter(newScore);
    setFd({ goals: [...fd.goals, { team: team === "A" ? "Team A" : "Team B", minute: fd.minute, player: "" }] });
  };

  return (
    <div className="space-y-4">
      {/* Score counters */}
      <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
        {[{ label: "Team A", score: scoreA, setScore: setScoreA, side: "A" },
          { label: "Team B", score: scoreB, setScore: setScoreB, side: "B" }].map(({ label, score, setScore, side }) => (
          <div key={side} className="text-center space-y-2">
            <p className="text-xs font-bold text-white">{label}</p>
            <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">{score}</div>
            <div className="flex items-center justify-center gap-2">
              <button type="button" onClick={() => setScore((p) => Math.max(0, p - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all active:scale-95">
                <Minus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setScore((p) => p + 1)}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center transition-all active:scale-95 shadow-md shadow-emerald-500/20">
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
            <button type="button" onClick={() => addGoal(side)}
              className="w-full py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors">
              ⚽ + Goal
            </button>
          </div>
        ))}
      </div>
      {/* Match clock */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Match Minute</label>
          <input type="number" min="0" max="120" value={fd.minute}
            onChange={(e) => setFd({ minute: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full min-h-[44px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Half</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[1, 2].map((h) => (
              <button key={h} type="button" onClick={() => setFd({ half: h })}
                className={`min-h-[44px] rounded-xl text-xs font-bold border transition-all ${fd.half === h ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"}`}>
                {h === 1 ? "1st" : "2nd"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Goals log */}
      {fd.goals.length > 0 && (
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Goals</p>
          {fd.goals.map((g, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
              <span>⚽</span>
              <span className="font-mono text-emerald-400">{g.minute}&apos;</span>
              <span className="font-semibold flex-1">{g.team}</span>
              <button type="button" onClick={() => setFd({ goals: fd.goals.filter((_, j) => j !== i) })}
                className="text-rose-400 hover:text-rose-300 text-[10px] font-bold">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Cricket controls ─────────────────────────────────────────────────────────
const CricketControls = ({ scoreA, setScoreA, liveData, setLiveData }) => {
  const cd = liveData.cricket || { runs: 0, wickets: 0, overs: "0.0", innings: 1, target: "", battingTeam: 1 };
  const setCd = (patch) => {
    const updated = { ...cd, ...patch };
    setLiveData((prev) => ({ ...prev, cricket: updated }));
    // Sync scoreA.current with runs for bracket/standings
    setScoreA(updated.runs ?? 0);
  };

  const addRuns = (n) => setCd({ runs: (cd.runs || 0) + n });
  const addWicket = () => setCd({ wickets: Math.min((cd.wickets || 0) + 1, 10) });

  return (
    <div className="space-y-4">
      {/* Main stats */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Runs", value: cd.runs, key: "runs", min: 0 },
            { label: "Wickets", value: cd.wickets, key: "wickets", min: 0, max: 10 },
          ].map(({ label, value, key, min, max }) => (
            <div key={key} className="col-span-1">
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">{label}</label>
              <input type="number" min={min} max={max} value={value}
                onChange={(e) => setCd({ [key]: Math.max(min ?? 0, parseInt(e.target.value) || 0) })}
                className="w-full min-h-[44px] px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono text-center focus:outline-none focus:border-emerald-500" />
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-semibold text-slate-300 mb-1">Overs</label>
            <input type="text" value={cd.overs} placeholder="18.2"
              onChange={(e) => setCd({ overs: e.target.value })}
              className="w-full min-h-[44px] px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono text-center focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        {/* Quick run buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 4, 6].map((n) => (
            <button key={n} type="button" onClick={() => addRuns(n)}
              className={`py-2 rounded-xl text-xs font-black border transition-all active:scale-95 ${n === 6 ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500/20" : n === 4 ? "bg-teal-500/10 border-teal-500/50 text-teal-400 hover:bg-teal-500/20" : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"}`}>
              +{n}
            </button>
          ))}
        </div>
        <button type="button" onClick={addWicket}
          className="w-full py-2 rounded-xl text-xs font-black bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors active:scale-95 disabled:opacity-40"
          disabled={(cd.wickets || 0) >= 10}>
          🏏 Wicket ({cd.wickets || 0}/10)
        </button>
      </div>
      {/* Innings & target */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Innings</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[1, 2].map((inn) => (
              <button key={inn} type="button" onClick={() => setCd({ innings: inn })}
                className={`min-h-[44px] rounded-xl text-xs font-bold border transition-all ${cd.innings === inn ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"}`}>
                {inn === 1 ? "1st Inn" : "2nd Inn"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Target (2nd Inn)</label>
          <input type="number" min="0" value={cd.target || ""}
            placeholder="e.g. 178"
            onChange={(e) => setCd({ target: parseInt(e.target.value) || 0 })}
            className="w-full min-h-[44px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500" />
        </div>
      </div>
      {/* Batting team */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Batting Team</label>
        <div className="grid grid-cols-2 gap-1.5">
          {[{ val: 1, label: "Team A" }, { val: 2, label: "Team B" }].map(({ val, label }) => (
            <button key={val} type="button" onClick={() => setCd({ battingTeam: val })}
              className={`min-h-[44px] rounded-xl text-xs font-bold border transition-all ${cd.battingTeam === val ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Badminton controls ───────────────────────────────────────────────────────
const BadmintonControls = ({ scoreA, setScoreA, scoreB, setScoreB, liveData, setLiveData }) => {
  const bd = liveData.badminton || { sets: [], currentSet: 1, pointA: 0, pointB: 0 };
  const setBd = (patch) => {
    const updated = { ...bd, ...patch };
    setLiveData((prev) => ({ ...prev, badminton: updated }));
    // Sync scoreA/B with sets won
    setScoreA(updated.sets.filter((s) => s[0] > s[1]).length);
    setScoreB(updated.sets.filter((s) => s[1] > s[0]).length);
  };

  const addPoint = (side) => {
    const newA = side === "A" ? (bd.pointA || 0) + 1 : (bd.pointA || 0);
    const newB = side === "B" ? (bd.pointB || 0) + 1 : (bd.pointB || 0);
    setBd({ pointA: newA, pointB: newB });
  };

  const finalizeSet = () => {
    const newSets = [...(bd.sets || []), [bd.pointA || 0, bd.pointB || 0]];
    setBd({ sets: newSets, currentSet: (bd.currentSet || 1) + 1, pointA: 0, pointB: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Current set points */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Set {bd.currentSet || 1} — Current Points</p>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Team A", score: bd.pointA || 0, side: "A" }, { label: "Team B", score: bd.pointB || 0, side: "B" }].map(({ label, score, side }) => (
            <div key={side} className="text-center space-y-2">
              <p className="text-xs font-bold text-white">{label}</p>
              <div className={`text-3xl font-black font-mono ${side === "A" ? "text-emerald-400" : "text-teal-400"}`}>{score}</div>
              <div className="flex items-center justify-center gap-2">
                <button type="button" onClick={() => setBd(side === "A" ? { pointA: Math.max(0, (bd.pointA || 0) - 1) } : { pointB: Math.max(0, (bd.pointB || 0) - 1) })}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all active:scale-95">
                  <Minus className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => addPoint(side)}
                  className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-md ${side === "A" ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20" : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20"}`}>
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={finalizeSet}
          className="w-full py-2 rounded-xl text-xs font-black bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors">
          ✓ End Set {bd.currentSet || 1} ({bd.pointA || 0} – {bd.pointB || 0})
        </button>
      </div>
      {/* Completed sets */}
      {(bd.sets || []).length > 0 && (
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Completed Sets</p>
          {bd.sets.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-xs text-slate-300">
              <span className="text-slate-400">Set {i + 1}</span>
              <span className={`font-mono font-bold ${s[0] > s[1] ? "text-emerald-400" : "text-teal-400"}`}>{s[0]} – {s[1]}</span>
              <button type="button" onClick={() => setBd({ sets: bd.sets.filter((_, j) => j !== i), currentSet: (bd.currentSet || 1) - 1 })}
                className="text-rose-400 hover:text-rose-300 text-[10px] font-bold">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Generic controls (all other sports) ─────────────────────────────────────
const GenericControls = ({ scoreA, setScoreA, scoreB, setScoreB }) => (
  <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
    {[{ label: "Team A", score: scoreA, setScore: setScoreA }, { label: "Team B", score: scoreB, setScore: setScoreB }].map(({ label, score, setScore }, i) => (
      <div key={i} className={`text-center space-y-2 ${i === 1 ? "border-l border-slate-800 pl-3" : ""}`}>
        <p className="text-xs font-bold text-white">{label}</p>
        <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">{score}</div>
        <div className="flex items-center justify-center gap-2">
          <button type="button" onClick={() => setScore((p) => Math.max(0, p - 1))}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all">
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setScore((p) => p + 1)}
            className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold flex items-center justify-center transition-all shadow-md shadow-emerald-500/20">
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

// ─── Main ScoreUpdateModal ────────────────────────────────────────────────────
const SPORT_EMOJI = { Football:"⚽", Cricket:"🏏", Badminton:"🏸", Chess:"♟️", Kabaddi:"🤼", "Table Tennis":"🏓", Volleyball:"🏐", Basketball:"🏀", Futsal:"⚽", Tennis:"🎾" };

const ScoreUpdateModal = ({ match, onClose, onUpdated, onEditDetails, sport: sportProp }) => {
  const sport = sportProp || match?.tournament?.sport || "Football";
  const emoji = SPORT_EMOJI[sport] || "🏆";

  const [scoreA, setScoreA] = useState(match?.scoreA?.current || 0);
  const [scoreB, setScoreB] = useState(match?.scoreB?.current || 0);
  const [status, setStatus] = useState(match?.status || "SCHEDULED");
  const [summary, setSummary] = useState(match?.summary || "");
  const [venueCourt, setVenueCourt] = useState(match?.venueCourt || "Main Arena");
  const [liveData, setLiveData] = useState(match?.liveData || {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setSubmitting(true);
      const payload = {
        scoreA: { current: Number(scoreA), display: String(scoreA) },
        scoreB: { current: Number(scoreB), display: String(scoreB) },
        status,
        summary,
        venueCourt,
        liveData,
      };
      const res = await api.put(`/matches/${match._id}/score`, payload);
      if (res.data.success) {
        onUpdated(res.data.match);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to update score.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderControls = () => {
    switch (sport) {
      case "Football": case "Futsal":
        return <FootballControls scoreA={scoreA} setScoreA={setScoreA} scoreB={scoreB} setScoreB={setScoreB} liveData={liveData} setLiveData={setLiveData} />;
      case "Cricket":
        return <CricketControls scoreA={scoreA} setScoreA={setScoreA} liveData={liveData} setLiveData={setLiveData} />;
      case "Badminton": case "Table Tennis": case "Tennis":
        return <BadmintonControls scoreA={scoreA} setScoreA={setScoreA} scoreB={scoreB} setScoreB={setScoreB} liveData={liveData} setLiveData={setLiveData} />;
      default:
        return <GenericControls scoreA={scoreA} setScoreA={setScoreA} scoreB={scoreB} setScoreB={setScoreB} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col my-auto rounded-2xl glass-panel border border-slate-700 shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <Zap className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-lg sm:text-xl text-white">{sport} Scorepad</h3>
            </div>
            <p className="text-xs text-slate-400">Match #{match.matchNumber} • {match.round}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Sport-specific score controls */}
          {renderControls()}

          {/* Match Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Match Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "SCHEDULED", label: "Scheduled", color: "border-slate-700 text-slate-300" },
                { val: "LIVE", label: "🔴 LIVE", color: "border-rose-500 bg-rose-500/10 text-rose-400 font-bold" },
                { val: "COMPLETED", label: "✓ Final", color: "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold" },
              ].map((item) => (
                <button key={item.val} type="button" onClick={() => setStatus(item.val)}
                  className={`min-h-[44px] py-2 px-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${status === item.val ? `${item.color} ring-2 ring-emerald-500/40` : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Commentary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Live Commentary</label>
            <input type="text" placeholder="e.g. 78&apos; Spectacular goal by Rohit!" value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
          </div>

          {/* Pitch / Court */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pitch / Court / Arena</label>
            <input type="text" placeholder="e.g. Court 1 / Main Pitch" value={venueCourt}
              onChange={(e) => setVenueCourt(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-shrink-0">
            {onEditDetails ? (
              <button type="button" onClick={() => { onClose(); onEditDetails(match); }}
                className="px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl transition-colors">
                Edit Fixture →
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all">
                <Radio className="w-4 h-4 animate-pulse" />
                {submitting ? "Broadcasting..." : "Broadcast Score"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScoreUpdateModal;
