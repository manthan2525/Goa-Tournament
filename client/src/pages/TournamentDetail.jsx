import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import FixtureBracket from '../components/FixtureBracket';
import StandingsTable from '../components/StandingsTable';
import RegisterModal from '../components/RegisterModal';
import PaymentModal from '../components/PaymentModal';
import ScoreUpdateModal from '../components/ScoreUpdateModal';
import { STATUS_COLORS } from '../utils/constants';

const TournamentDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isOrganizer } = useAuth();
  const { joinTournament, leaveTournament, socket } = useSocket();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [verifiedTeams, setVerifiedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fixtures');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState(null);
  const [selectedMatchForScore, setSelectedMatchForScore] = useState(null);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tournRes, matchRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/matches/tournament/${id}`),
      ]);

      if (tournRes.data.success) {
        setTournament(tournRes.data.tournament);
        setVerifiedTeams(tournRes.data.verifiedTeams || []);
      }

      if (matchRes.data.success) {
        setMatches(matchRes.data.matches || []);
        setStandings(matchRes.data.standings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentData();
    joinTournament(id);

    // Listen for real-time live score updates via WebSockets
    const onMatchUpdate = (payload) => {
      if (payload.match && payload.match.tournament?.toString() === id.toString()) {
        setMatches((prev) => {
          const index = prev.findIndex((m) => m._id === payload.match._id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = payload.match;
            return updated;
          }
          return prev;
        });

        // Re-fetch standings if match was completed
        if (payload.match.status === 'COMPLETED') {
          api.get(`/matches/tournament/${id}`).then((res) => {
            if (res.data.success) {
              setStandings(res.data.standings || []);
            }
          });
        }
      }
    };

    const onTournamentUpdate = () => {
      fetchTournamentData();
    };

    socket.on('match_update', onMatchUpdate);
    socket.on('score_changed', onMatchUpdate);
    socket.on('tournament_update', onTournamentUpdate);

    return () => {
      leaveTournament(id);
      socket.off('match_update', onMatchUpdate);
      socket.off('score_changed', onMatchUpdate);
      socket.off('tournament_update', onTournamentUpdate);
    };
  }, [id]);

  const handleRegistrationSuccess = (data) => {
    setShowRegisterModal(false);
    if (!data.isFree && data.registration) {
      setActiveRegistration(data.registration);
      setShowPaymentModal(true);
    } else {
      fetchTournamentData();
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchTournamentData();
  };

  const handleMatchClick = (match) => {
    if (isOrganizer && tournament?.organizer?._id === user?._id) {
      setSelectedMatchForScore(match);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-mono text-slate-400">Loading Goa tournament arena...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">Tournament Not Found</h2>
        <Link to="/tournaments" className="mt-4 inline-block text-xs font-bold text-emerald-400">
          ← Back to Tournaments
        </Link>
      </div>
    );
  }

  const isTournamentOwner = isOrganizer && tournament?.organizer?._id === user?._id;
  const statusInfo = STATUS_COLORS[tournament.status] || STATUS_COLORS.REGISTRATION_OPEN;
  const fallbackBanner =
    tournament.bannerImage ||
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header Card */}
      <div className="relative rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        {/* Banner Media */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={fallbackBanner}
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
              {tournament.sport}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700">
              {tournament.format?.replace('_', ' ')}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusInfo.badge}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h1 className="font-display font-black text-2xl sm:text-4xl text-white">
                {tournament.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{tournament.venue}, {tournament.location}, Goa</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    {new Date(tournament.startDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration CTA Action */}
            <div>
              {tournament.status === 'REGISTRATION_OPEN' && (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-6 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  Register Team ({tournament.registrationFee === 0 ? 'FREE' : `₹${tournament.registrationFee}`})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Details Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-900/60 text-xs">
          <div className="p-4 flex items-center gap-3">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Entry Fee</p>
              <p className="font-bold text-white text-sm font-mono">
                {tournament.registrationFee === 0 ? 'FREE' : `₹${tournament.registrationFee.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-teal-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Squad Capacity</p>
              <p className="font-bold text-white text-sm font-mono">
                {verifiedTeams.length} / {tournament.maxTeams} Teams
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Prize Pool</p>
              <p className="font-bold text-white text-sm truncate max-w-[150px]">
                {tournament.prizePool || 'Medals & Trophies'}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <User className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Organizer</p>
              <p className="font-bold text-white text-sm truncate max-w-[150px]">
                {tournament.organizer?.name || 'Goa Sports Authority'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('fixtures')}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'fixtures'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Fixtures & Brackets ({matches.length})
        </button>

        {(tournament.format === 'ROUND_ROBIN' || tournament.format === 'GROUP_KNOCKOUT') && (
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'standings'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Points Table / Standings
          </button>
        )}

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'teams'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Confirmed Squads ({verifiedTeams.length})
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Rules & Venue Details
        </button>
      </div>

      {/* Tab 1: Fixtures & Brackets */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="font-display font-bold text-lg text-white">Live Tournament Tree</h3>
            </div>
            {isTournamentOwner && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                Click any match to launch live score control pad
              </span>
            )}
          </div>

          <FixtureBracket
            matches={matches}
            onMatchClick={handleMatchClick}
            isOrganizer={isTournamentOwner}
          />
        </div>
      )}

      {/* Tab 2: Standings Table */}
      {activeTab === 'standings' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-white">League Standings</h3>
          <StandingsTable standings={standings} />
        </div>
      )}

      {/* Tab 3: Confirmed Squads */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-white">Verified Participating Teams</h3>
          {verifiedTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifiedTeams.map((team, idx) => (
                <div
                  key={team._id || idx}
                  className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      VERIFIED
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base">{team.teamName}</h4>
                  <p className="text-xs text-slate-400">Captain: {team.captainName}</p>
                  {team.playersList && team.playersList.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                      Roster: {team.playersList.map((p) => p.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 glass-card rounded-2xl text-center">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No teams confirmed yet. Be the first to register!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Rules & Venue */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Tournament Rules & Guidelines</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {tournament.rules ||
                '1. Standard official sports federation rules apply.\n2. Teams must report 30 minutes prior to scheduled fixture.\n3. Referee decisions are final and binding.\n4. Sports attire and appropriate safety gear mandatory.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-teal-400">
              <MapPin className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Goa Venue & Contact</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <p className="text-slate-500 font-medium">Stadium / Ground</p>
                <p className="font-semibold text-white">{tournament.venue}</p>
                <p className="text-slate-400">{tournament.location}, Goa</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-slate-500 font-medium">Organizer Contact</p>
                <p className="font-semibold text-white">{tournament.organizer?.name}</p>
                <p className="text-slate-400 font-mono">{tournament.organizer?.phone || '+91 98221 45678'}</p>
                <p className="text-slate-400">{tournament.organizer?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showRegisterModal && (
        <RegisterModal
          tournament={tournament}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {showPaymentModal && activeRegistration && (
        <PaymentModal
          registration={activeRegistration}
          tournament={tournament}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {selectedMatchForScore && (
        <ScoreUpdateModal
          match={selectedMatchForScore}
          onClose={() => setSelectedMatchForScore(null)}
          onUpdated={(updatedMatch) => {
            setMatches((prev) =>
              prev.map((m) => (m._id === updatedMatch._id ? updatedMatch : m))
            );
          }}
        />
      )}
    </div>
  );
};

export default TournamentDetail;
