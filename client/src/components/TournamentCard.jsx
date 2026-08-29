import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Trophy, IndianRupee, ArrowRight, ShieldCheck } from 'lucide-react';
import { STATUS_COLORS, formatLocation } from '../utils/constants';
import { getSportImage } from '../utils/sportImages';

const TournamentCard = ({ tournament }) => {
  const statusInfo = STATUS_COLORS[tournament.status] || STATUS_COLORS.REGISTRATION_OPEN;
  const progressPercent = Math.min(
    100,
    Math.round(((tournament.registeredTeamsCount || 0) / (tournament.maxTeams || 16)) * 100)
  );

  // Home & Listing cards ALWAYS show the sport-specific image, NEVER the organizer's uploaded banner
  const sportCardImage = getSportImage(tournament.sport);

  return (
    <div className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-md card-hover flex flex-col overflow-hidden transition-all text-slate-900 dark:text-white">
      {/* Banner/Header Image: Sport specific image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={sportCardImage}
          alt={`${tournament.sport} - ${tournament.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-xs">
            {tournament.sport}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
            {tournament.format?.replace('_', ' ')}
          </span>
          {tournament.requireAadhaarVerification && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50/90 dark:bg-teal-950/90 backdrop-blur-md text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50 flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Aadhaar
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Location overlay bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs pointer-events-none">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
              {tournament.venue}, {formatLocation(tournament.location)}
            </span>
          </div>
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

        {/* Action Button */}
        <div className="pt-2">
          <Link
            to={`/tournaments/${tournament._id}`}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs group/btn"
          >
            <span>View Tournament &amp; Fixtures</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
