import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Edit3,
  Trash2,
  Award,
  Medal,
  Play,
  Camera,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import FixtureBracket from '../components/FixtureBracket';
import StandingsTable from '../components/StandingsTable';
import RegisterModal from '../components/RegisterModal';
import PaymentModal from '../components/PaymentModal';
import ScoreUpdateModal from '../components/ScoreUpdateModal';
import EditTournamentModal from '../components/EditTournamentModal';
import DeleteTournamentModal from '../components/DeleteTournamentModal';
import DeclareWinnersModal from '../components/DeclareWinnersModal';
import { STATUS_COLORS } from '../utils/constants';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState(null);
  const [selectedMatchForScore, setSelectedMatchForScore] = useState(null);
  const [startingTournament, setStartingTournament] = useState(false);
  const [actionError, setActionError] = useState('');

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

    // Real-time Socket events
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

  const handleStartTournament = async () => {
    try {
      setStartingTournament(true);
      setActionError('');
      const res = await api.post(`/tournaments/${id}/start`);
      if (res.data.success) {
        fetchTournamentData();
      }
    } catch (err) {
      setActionError(err.message || 'Failed to start tournament fixtures.');
    } finally {
      setStartingTournament(false);
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

  const isTournamentOwner = isOrganizer && (tournament?.organizer?._id === user?._id || user?.role === 'ADMIN');
  const statusInfo = STATUS_COLORS[tournament.status] || STATUS_COLORS.REGISTRATION_OPEN;
  const bannerImg =
    tournament.bannerImage ||
    tournament.banner ||
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80';

  const organizerAvatar = tournament.organizer?.profilePhoto || tournament.organizer?.profileImage;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Organizer Action Bar (If Owner) */}
      {isTournamentOwner && (
        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 bg-emerald-950/20 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Organizer Control Panel</p>
              <p className="text-[11px] text-slate-400">You are the host of this tournament.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tournament.status !== 'ONGOING' && tournament.status !== 'COMPLETED' && (
              <button
                onClick={handleStartTournament}
                disabled={startingTournament}
                className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {startingTournament ? 'Generating Fixtures...' : 'Start Tournament'}
              </button>
            )}

            <button
              onClick={() => setShowWinnersModal(true)}
              className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md"
            >
              <Trophy className="w-3.5 h-3.5" />
              Declare / Edit Winners
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              Edit Tournament
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>

            <Link
              to="/organizer-dashboard"
              className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-all"
            >
              Organizer Suite →
            </Link>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-400" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="relative rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        {/* Banner Media */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={bannerImg}
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
            {tournament.requireAadhaarVerification && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-teal-950/80 backdrop-blur-md text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Aadhaar Verification Required
              </span>
            )}
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
                {tournament.startTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{tournament.startTime}</span>
                  </div>
                )}
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
            <IndianRupee className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Entry Fee</p>
              <p className="font-bold text-white text-sm font-mono">
                {tournament.registrationFee === 0 ? 'FREE' : `₹${tournament.registrationFee.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Squad Capacity</p>
              <p className="font-bold text-white text-sm font-mono">
                {verifiedTeams.length} / {tournament.maxTeams} Teams
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Prize Pool</p>
              <p className="font-bold text-white text-sm truncate max-w-[150px]">
                {tournament.prizePool || 'Medals & Trophies'}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 overflow-hidden flex-shrink-0">
              {organizerAvatar ? (
                <img src={organizerAvatar} alt={tournament.organizer?.name} className="w-full h-full object-cover" />
              ) : (
                tournament.organizer?.name?.charAt(0) || 'O'
              )}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Organizer</p>
              <p className="font-bold text-white text-sm truncate max-w-[140px]">
                {tournament.organizer?.name || 'Goa Sports Authority'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Winners Showcase Section (If Completed or Winner declared) */}
      {(tournament.status === 'COMPLETED' || tournament.winner) && (
        <div className="rounded-3xl glass-panel border border-amber-500/40 p-6 sm:p-8 bg-gradient-to-b from-amber-950/30 via-slate-900/60 to-slate-950/80 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-white">
                Tournament Champions & Winners
              </h2>
              <p className="text-xs text-amber-300/80">
                Official results declared for {tournament.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* 1st Place Champion */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-amber-500/60 shadow-xl shadow-amber-500/10 text-center space-y-2 relative overflow-hidden order-first md:order-2 md:-mt-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 text-slate-950 font-black">
                <Trophy className="w-7 h-7" />
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                1st Place Champion
              </span>
              <h3 className="font-display font-black text-xl text-white pt-1">
                {tournament.winner || 'Champion Declared'}
              </h3>
              <p className="text-[11px] text-amber-300 font-semibold">
                Winner Category: {tournament.winnerType || 'Team'}
              </p>
            </div>

            {/* 2nd Place Runner-Up */}
            {tournament.runnerUp && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700 text-center space-y-2 order-2 md:order-1">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center mx-auto text-slate-200">
                  <Award className="w-6 h-6" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  2nd Place Runner-Up
                </span>
                <h4 className="font-display font-bold text-base text-white pt-1">
                  {tournament.runnerUp}
                </h4>
              </div>
            )}

            {/* 3rd Place */}
            {tournament.thirdPlace && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700 text-center space-y-2 order-3">
                <div className="w-12 h-12 rounded-full bg-amber-950/50 border border-amber-800/60 flex items-center justify-center mx-auto text-amber-500">
                  <Medal className="w-6 h-6" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-800/50">
                  3rd Place / Bronze
                </span>
                <h4 className="font-display font-bold text-base text-white pt-1">
                  {tournament.thirdPlace}
                </h4>
              </div>
            )}
          </div>
        </div>
      )}

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
                <p className="text-slate-500 font-medium">Organizer Details</p>
                <p className="font-semibold text-white">{tournament.organizer?.name}</p>
                {tournament.organizer?.organizationName && (
                  <p className="text-emerald-400 text-xs font-semibold">{tournament.organizer.organizationName}</p>
                )}
                <p className="text-slate-400 font-mono">{tournament.organizer?.phone || '+91 98221 45678'}</p>
                <p className="text-slate-400">{tournament.organizer?.email}</p>
                {tournament.organizer?.bio && (
                  <p className="text-slate-400 italic mt-1 pt-1 border-t border-slate-800/80 text-[11px]">
                    "{tournament.organizer.bio}"
                  </p>
                )}
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

      {showEditModal && (
        <EditTournamentModal
          tournament={tournament}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updated) => {
            setTournament(updated);
            fetchTournamentData();
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteTournamentModal
          tournament={tournament}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            navigate('/tournaments');
          }}
        />
      )}

      {showWinnersModal && (
        <DeclareWinnersModal
          tournament={tournament}
          teams={verifiedTeams}
          onClose={() => setShowWinnersModal(false)}
          onUpdated={(updated) => {
            setTournament(updated);
            fetchTournamentData();
          }}
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
