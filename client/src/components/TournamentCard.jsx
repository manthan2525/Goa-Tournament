import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Trophy, IndianRupee, ArrowRight, ShieldCheck, Share2 } from 'lucide-react';
import { STATUS_COLORS, formatLocation } from '../utils/constants';
import { getSportLogo, getSportTheme } from '../utils/sportLogos';
import ShareModal from './ShareModal';

const TournamentCard = ({ tournament }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const statusInfo = STATUS_COLORS[tournament.status] || STATUS_COLORS.REGISTRATION_OPEN;
  const progressPercent = Math.min(
    100,
    Math.round(((tournament.registeredTeamsCount || 0) / (tournament.maxTeams || 16)) * 100)
  );

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/tournaments/${tournament._id}`;
    const title = tournament?.name || 'Goa Tournament';
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on Goa Tournament!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          setShowShareModal(true);
        }
        return;
      }
    }
    setShowShareModal(true);
  };

  // Home & Listing cards ALWAYS use the clean transparent SVG sport logo + sport theme header
  const bannerImage = tournament.bannerImage || tournament.banner;
  const sportLogoPath = getSportLogo(tournament.sport);
  const theme = getSportTheme(tournament.sport);

  return (
    <div className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-md card-hover flex flex-col overflow-hidden transition-all text-slate-900 dark:text-white">
      {/* Header Image / Sport Cover */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900 flex flex-col justify-between p-4 group-hover:scale-[1.01] transition-transform duration-500">
        {bannerImage ? (
          <>
            <img
              src={bannerImage}
              alt={tournament.name}
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30 pointer-events-none" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
            <img
              src={sportLogoPath}
              alt={`${tournament.sport} logo`}
              className="w-16 h-16 object-contain filter drop-shadow-md invert dark:invert-0 brightness-200 dark:brightness-100 opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Top Badges Row */}
        <div className="relative z-20 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/70 backdrop-blur-md text-white border border-white/20 shadow-xs uppercase">
              {tournament.sport || 'Sports'}
            </span>
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-900/60 backdrop-blur-md text-slate-200 border border-slate-700/50 uppercase">
              {tournament.format?.replace('_', ' ')}
            </span>
          </div>

          {/* Prominent Price Tag (Matching Mockup 05) */}
          <div className="pointer-events-none">
            <span className="px-3 py-1 rounded-xl text-xs font-black tracking-wide bg-emerald-600 text-white shadow-md border border-emerald-400/30 flex items-center gap-0.5">
              {tournament.registrationFee === 0 ? 'FREE' : `₹${tournament.registrationFee.toLocaleString('en-IN')}`}
              <span className="text-[9px] font-normal opacity-90">/Team</span>
            </span>
          </div>
        </div>

        {/* Bottom Details Overlay */}
        <div className="relative z-20 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5 font-medium truncate bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 max-w-[80%]">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate text-[11px] font-medium text-slate-100">
              {tournament.venue}, {formatLocation(tournament.location)}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shadow-sm ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
            {tournament.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
            {tournament.description || 'Join elite squads competing in Goa. Register your team today.'}
          </p>
        </div>

        {/* If Completed and Winner Declared */}
        {tournament.status === 'COMPLETED' && tournament.winner && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-xs">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Champion</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">{tournament.winner}</span>
            </div>
          </div>
        )}

        {/* Prize Pool Summary Badge */}
        {((tournament.prizes && tournament.prizes.length > 0) || tournament.prizePool) && (
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between text-xs">
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {tournament.prizes && tournament.prizes.length > 0
                ? `${tournament.prizes[0].title || '1st Prize'}: ₹${Number(tournament.prizes[0].amount || 0).toLocaleString('en-IN')}`
                : 'Prize Pool'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {tournament.prizes && tournament.prizes.length > 1
                ? `+${tournament.prizes.length - 1} More Prizes`
                : tournament.prizePool || ''}
            </span>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-2 border-y border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Starts</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {new Date(tournament.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Entry Fee</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {tournament.registrationFee === 0 ? 'FREE ENTRY' : `₹${tournament.registrationFee.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Registration Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Teams Registered
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {tournament.registeredTeamsCount || 0} / {tournament.maxTeams}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/50 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 100 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons Area */}
        <div className="pt-2 flex items-center gap-2">
          <Link
            to={`/tournaments/${tournament._id}`}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs group/btn"
          >
            <span>View Tournament &amp; Fixtures</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={handleShare}
            title="Share Tournament"
            aria-label="Share Tournament"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-xs"
          >
            <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Quick Share Modal */}
      {showShareModal && (
        <ShareModal
          tournament={tournament}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default TournamentCard;
