import React from "react";
import { AlertTriangle, ShieldAlert, X, Radio, ArrowRight } from "lucide-react";

/**
 * Reusable Fixture Warning & Confirmation Modal (Light Mode)
 *
 * Support 3 Warning Levels:
 * - NORMAL: Amber theme (Tournament started)
 * - HIGH: Orange theme (Completed match / Bracket impact)
 * - CRITICAL: Red / Rose theme (Live match / Automatic regeneration)
 */
const FixtureWarningModal = ({
  isOpen,
  title = "⚠️ Tournament Already Started",
  level = "NORMAL", // 'NORMAL' | 'HIGH' | 'CRITICAL'
  details = [],
  comparison = null, // { oldTeamA, newTeamA, oldTeamB, newTeamB, etc. }
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const isCritical = level === "CRITICAL";
  const isHigh = level === "HIGH";

  let headerBg = "bg-amber-50 border-amber-300 text-amber-800";
  let iconBg = "bg-amber-100 text-amber-700 border-amber-300";
  let confirmBtnClass = "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm";
  let cardBorder = "border-amber-300";

  if (isCritical) {
    headerBg = "bg-rose-50 border-rose-300 text-rose-800";
    iconBg = "bg-rose-100 text-rose-700 border-rose-300";
    confirmBtnClass = "bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-sm";
    cardBorder = "border-rose-300";
  } else if (isHigh) {
    headerBg = "bg-orange-50 border-orange-300 text-orange-800";
    iconBg = "bg-orange-100 text-orange-700 border-orange-300";
    confirmBtnClass = "bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-sm";
    cardBorder = "border-orange-300";
  }

  const detailLines = Array.isArray(details) ? details : [details];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className={`relative w-full max-w-md my-auto rounded-3xl bg-white border ${cardBorder} shadow-2xl p-5 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150`}>
        {/* Top Header Icon & Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              {isCritical ? (
                <Radio className="w-6 h-6 animate-pulse text-rose-600" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border ${headerBg}`}>
                {isCritical ? "🔴 CRITICAL WARNING" : isHigh ? "⚠️ HIGH IMPACT" : "⚠️ TOURNAMENT STARTED"}
              </span>
              <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 pt-1 leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details / Bullets */}
        {detailLines.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
            {detailLines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className={isCritical ? "text-rose-600 font-bold" : "text-amber-600 font-bold"}>•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Box (if team name or detail change confirmation) */}
        {comparison && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
            <p className="text-[10px] uppercase font-bold text-slate-500">Match Change Comparison</p>
            <div className="grid grid-cols-2 gap-2 text-slate-800">
              <div className="p-2 rounded-xl bg-white border border-rose-200 space-y-1">
                <span className="text-[10px] text-rose-600 block font-bold">Old</span>
                <p className="font-bold text-slate-900 truncate">{comparison.oldA} vs {comparison.oldB}</p>
              </div>
              <div className="p-2 rounded-xl bg-white border border-emerald-200 space-y-1">
                <span className="text-[10px] text-emerald-600 block font-bold">New</span>
                <p className="font-bold text-slate-900 truncate">{comparison.newA} vs {comparison.newB}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${confirmBtnClass}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixtureWarningModal;
