import React from 'react';
import { Trophy } from 'lucide-react';

const StandingsTable = ({ standings = [] }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="p-8 glass-card rounded-2xl text-center">
        <Trophy className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">
          Standings table will populate as league matches complete.
        </p>
      </div>
    );
  }

  // Group standings by group (e.g. League, Group A, Group B)
  const groupMap = {};
  standings.forEach((s) => {
    const grp = s.group || 'League';
    if (!groupMap[grp]) {
      groupMap[grp] = [];
    }
    groupMap[grp].push(s);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupMap).map(([groupName, rows]) => (
        <div key={groupName} className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
          <div className="py-3 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-emerald-400 uppercase tracking-wider">
              {groupName} Standings
            </h4>
            <span className="text-xs text-slate-400 font-mono">3 Pts for Win • 1 for Draw</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-3 text-center">P</th>
                  <th className="py-3 px-3 text-center">W</th>
                  <th className="py-3 px-3 text-center">D</th>
                  <th className="py-3 px-3 text-center">L</th>
                  <th className="py-3 px-3 text-center hidden sm:table-cell">GF</th>
                  <th className="py-3 px-3 text-center hidden sm:table-cell">GA</th>
                  <th className="py-3 px-3 text-center">GD</th>
                  <th className="py-3 px-4 text-center font-bold text-white">PTS</th>
                  <th className="py-3 px-3 text-center hidden md:table-cell">Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {rows.map((row, idx) => {
                  const isTop = idx === 0;
                  const isQualify = idx < 2;

                  return (
                    <tr
                      key={row._id || row.teamName}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isTop ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                            isTop
                              ? 'bg-emerald-500 text-slate-950'
                              : isQualify
                              ? 'bg-slate-800 text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                        {row.teamName}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{row.played}</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-400 font-medium">
                        {row.won}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{row.drawn}</td>
                      <td className="py-3 px-3 text-center font-mono text-rose-400/80">{row.lost}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.goalsFor}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.goalsAgainst}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium">
                        <span className={row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-white text-sm bg-slate-900/40">
                        {row.points}
                      </td>
                      <td className="py-3 px-3 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.form && row.form.length > 0 ? (
                            row.form.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center font-mono ${
                                  f === 'W'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : f === 'D'
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-rose-500 text-white'
                                }`}
                              >
                                {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StandingsTable;
