import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Trophy, IndianRupee, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { STATUS_COLORS } from '../utils/constants';

const TournamentCard = ({ tournament }) => {
  const statusInfo = STATUS_COLORS[tournament.status] || STATUS_COLORS.REGISTRATION_OPEN;
  const progressPercent = Math.min(
    100,
    Math.round(((tournament.registeredTeamsCount || 0) / (tournament.maxTeams || 16)) * 100)
  );

  const fallbackBanner =
    tournament.bannerImage ||
    tournament.banner ||
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative rounded-3xl glass-card border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-emerald-950/20">
      {/* Banner / Media Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={fallbackBanner}
          alt={tournament.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            {tournament.sport}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700">
            {tournament.format?.replace('_', ' ')}
          </span>
          {tournament.requireAadhaarVerification && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-950/80 backdrop-blur-md text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Aadhaar
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Location overlay bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{tournament.venue}, {tournament.location}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
            {tournament.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
            {tournament.description || 'Join elite squads competing in Goa. Register your team today.'}
          </p>
        </div>

        {/* If Completed and Winner Declared */}
        {tournament.status === 'COMPLETED' && tournament.winner && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs">
            <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Champion</span>
              <span className="font-bold text-white truncate block">{tournament.winner}</span>
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-2 border-y border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Starts</p>
              <p className="font-semibold text-white">
                {new Date(tournament.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <IndianRupee className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Entry Fee</p>
              <p className="font-semibold text-white">
                {tournament.registrationFee === 0 ? 'FREE ENTRY' : `₹${tournament.registrationFee.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Registration Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Teams Registered
            </span>
            <span className="font-semibold text-white">
              {tournament.registeredTeamsCount || 0} / {tournament.maxTeams}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white transition-all group/btn"
          >
            <span>View Tournament & Fixtures</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
