import React, { useState } from 'react';
import { Trophy, Clock, Zap, CheckCircle2, Shield, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

const FixtureBracket = ({ matches = [], onMatchClick, isOrganizer = false }) => {
  const [selectedMobileRound, setSelectedMobileRound] = useState('ALL');

  if (!matches || matches.length === 0) {
    return (
      <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
        <Trophy className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-900">Fixtures Not Generated Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          The tournament organizer will generate the match schedule once registrations close.
        </p>
      </div>
    );
  }

  // Group matches by roundIndex or round name
  const roundMap = {};
  matches.forEach((m) => {
    const roundKey = m.round || `Round ${m.roundIndex || 1}`;
    if (!roundMap[roundKey]) {
      roundMap[roundKey] = [];
    }
    roundMap[roundKey].push(m);
  });

  const roundNames = Object.keys(roundMap);

  return (
    <div className="space-y-4">
      {/* Mobile Round Filter Pills (Visible on small screens) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setSelectedMobileRound('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
            selectedMobileRound === 'ALL'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          All Rounds
        </button>
        {roundNames.map((rName) => (
          <button
            key={rName}
            onClick={() => setSelectedMobileRound(rName)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedMobileRound === rName
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            {rName}
          </button>
        ))}
      </div>

      {/* Bracket Tree Canvas */}
      <div className="overflow-x-auto pb-6 rounded-2xl bg-slate-50 p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-start gap-4 sm:gap-8 min-w-full">
          {roundNames
            .filter((rName) => selectedMobileRound === 'ALL' || selectedMobileRound === rName)
            .map((roundName) => {
              const roundMatches = roundMap[roundName];

              return (
                <div
                  key={roundName}
                  className="flex-1 min-w-[260px] sm:min-w-[290px] max-w-[340px] space-y-3.5"
                >
                  {/* Round Header */}
                  <div className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs sticky top-0 z-10 backdrop-blur-md">
                    <span className="font-display font-bold text-xs uppercase tracking-wider text-emerald-700 truncate">
                      {roundName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex-shrink-0 font-bold">
                      {roundMatches.length} {roundMatches.length === 1 ? 'Match' : 'Matches'}
                    </span>
                  </div>

                  {/* Matches List in Round */}
                  <div className="space-y-3">
                    {roundMatches.map((match) => {
                      const isLive = match.status === 'LIVE';
                      const isCompleted = match.status === 'COMPLETED';
                      const winnerName = match.winner?.name;

                      const isTeamAWinner = winnerName && winnerName === match.teamA?.name;
                      const isTeamBWinner = winnerName && winnerName === match.teamB?.name;

                      return (
                        <div
                          key={match._id || match.matchNumber}
                          onClick={() => onMatchClick && onMatchClick(match)}
                          className={`relative rounded-xl p-3 sm:p-3.5 border transition-all duration-200 ${
                            isLive
                              ? 'bg-white border-rose-400 shadow-md ring-1 ring-rose-400/40'
                              : isCompleted
                              ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          } ${onMatchClick ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''}`}
                        >
                          {/* Match Header Bar */}
                          <div className="flex items-center justify-between mb-2 text-[10px] text-slate-500">
                            <span className="font-mono font-semibold text-slate-600">Match #{match.matchNumber}</span>
                            <div className="flex items-center gap-1.5">
                              {isLive && (
                                <span className="flex items-center gap-1 text-rose-600 font-bold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-indicator"></span>
                                  LIVE
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> FT
                                </span>
                              )}
                              {!isLive && !isCompleted && (
                                <span className="text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Scheduled
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Team A */}
                          <div
                            className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                              isTeamAWinner
                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                : 'text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                              <span className="truncate">{match.teamA?.name || 'TBD'}</span>
                            </div>
                            <span
                              className={`font-mono text-sm px-1.5 py-0.5 rounded flex-shrink-0 ${
                                isLive || isCompleted
                                  ? 'bg-slate-100 text-slate-900 font-bold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {match.scoreA?.display || match.scoreA?.current || 0}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="my-1.5 border-t border-slate-100"></div>

                          {/* Team B */}
                          <div
                            className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                              isTeamBWinner
                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                : 'text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                              <span className="truncate">{match.teamB?.name || 'TBD'}</span>
                            </div>
                            <span
                              className={`font-mono text-sm px-1.5 py-0.5 rounded flex-shrink-0 ${
                                isLive || isCompleted
                                  ? 'bg-slate-100 text-slate-900 font-bold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {match.scoreB?.display || match.scoreB?.current || 0}
                            </span>
                          </div>

                          {/* Match Details footer */}
                          {match.summary && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 italic truncate">
                              {match.summary}
                            </div>
                          )}

                          {/* Organizer Scorepad CTA if active */}
                          {isOrganizer && (
                            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-end">
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 hover:underline">
                                <Zap className="w-3 h-3 text-emerald-600" /> Update Scorepad
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default FixtureBracket;
