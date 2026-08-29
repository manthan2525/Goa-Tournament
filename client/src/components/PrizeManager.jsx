import React from 'react';
import { Trophy, Plus, Trash2, IndianRupee } from 'lucide-react';

const PrizeManager = ({ prizes = [], onChange }) => {
  const addPrize = () => {
    const nextPos = prizes.length + 1;
    let defaultTitle = `${nextPos}th Prize`;
    if (nextPos === 1) defaultTitle = '1st Prize';
    else if (nextPos === 2) defaultTitle = '2nd Prize';
    else if (nextPos === 3) defaultTitle = '3rd Prize';

    const newPrize = {
      position: nextPos,
      title: defaultTitle,
      amount: 0,
      description: '',
    };
    onChange([...prizes, newPrize]);
  };

  const removePrize = (index) => {
    const updated = prizes.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updatePrize = (index, field, value) => {
    const updated = [...prizes];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' || field === 'position' ? Number(value) || 0 : value,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tournament Prizes</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Configure 1st, 2nd, 3rd, 4th, 5th, or special category prizes</p>
          </div>
        </div>
        <button
          type="button"
          onClick={addPrize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Prize
        </button>
      </div>

      {prizes.length === 0 ? (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">No structured prizes added yet.</p>
          <button
            type="button"
            onClick={addPrize}
            className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
          >
            + Click to add 1st Prize
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {prizes.map((prize, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  #{idx + 1} {prize.title || 'Prize'}
                </span>
                <button
                  type="button"
                  onClick={() => removePrize(idx)}
                  className="p-1 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove prize"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Prize Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Prize / Runner Up"
                    value={prize.title}
                    onChange={(e) => updatePrize(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 25000"
                      value={prize.amount || ''}
                      onChange={(e) => updatePrize(idx, 'amount', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Trophy + Gold Medals"
                    value={prize.description || ''}
                    onChange={(e) => updatePrize(idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrizeManager;
