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
  Maximize2,
  Share2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import FixtureBracket from '../components/FixtureBracket';
import StandingsTable from '../components/StandingsTable';
import RegisterModal from '../components/RegisterModal';
import GroupManagementModal from '../components/GroupManagementModal';
import PaymentModal from '../components/PaymentModal';
import ScoreUpdateModal from '../components/ScoreUpdateModal';
import EditTournamentModal from '../components/EditTournamentModal';
import DeleteTournamentModal from '../components/DeleteTournamentModal';
import DeclareWinnersModal from '../components/DeclareWinnersModal';
import ManualMatchModal from '../components/ManualMatchModal';
import FixtureWarningModal from '../components/FixtureWarningModal';
import ShareModal from '../components/ShareModal';
import {
  isTournamentStarted,
  getFixtureEditWarning,
  getFixtureCreateWarning,
  getRegenerateWarning,
} from '../utils/fixtureWarnings';
import MapPreview from '../components/map/MapPreview';
import BannerLightbox from '../components/BannerLightbox';
import { STATUS_COLORS } from '../utils/constants';
import { getSportLogo, getSportTheme } from '../utils/sportLogos';

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
  const [showManualMatchModal, setShowManualMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [showBannerLightbox, setShowBannerLightbox] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetClearGroups, setResetClearGroups] = useState(false);
  const [resettingFixtures, setResettingFixtures] = useState(false);
  const [showGroupManagementModal, setShowGroupManagementModal] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState(null);
  const [selectedMatchForScore, setSelectedMatchForScore] = useState(null);
  const [startingTournament, setStartingTournament] = useState(false);
  const [actionError, setActionError] = useState('');

  // Warning Modal state
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningConfig, setWarningConfig] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const executeResetFixtures = async () => {
    try {
      setResettingFixtures(true);
      setActionError('');
      const hasLive = matches.some((m) => m.status === 'LIVE');
      const queryParams = new URLSearchParams();
      if (hasLive) queryParams.append('force', 'true');
      if (resetClearGroups) queryParams.append('clearGroups', 'true');

      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await api.delete(`/tournaments/${id}/fixtures${queryStr}`);
      if (res.data.success) {
        setShowResetModal(false);
        fetchTournamentData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to reset fixtures.');
    } finally {
      setResettingFixtures(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/tournaments/${id}`;
    const title = tournament?.name || 'GoaSportX';
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on GoaSportX!`,
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
    if (data.registration) {
      setActiveRegistration(data.registration);
      if (tournament.registrationFee > 0) {
        setShowPaymentModal(true);
      }
    }
    fetchTournamentData();
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchTournamentData();
  };

  const executeStartTournament = async () => {
    try {
      setStartingTournament(true);
      setActionError('');
      const res = await api.post(`/tournaments/${id}/start`);
      if (res.data.success) {
        fetchTournamentData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to generate automatic fixtures.');
    } finally {
      setStartingTournament(false);
    }
  };

  const handleStartTournament = () => {
    const hasStarted = isTournamentStarted(tournament);
    if (matches.length > 0 || hasStarted) {
      setWarningConfig({
        title: matches.length > 0 ? "🔴 WARNING — Fixtures Already Exist" : "⚠️ Tournament Already Started",
        level: matches.length > 0 ? "CRITICAL" : "NORMAL",
        details: [
          matches.length > 0
            ? "Fixtures have already been generated for this tournament."
            : "This tournament has already started.",
          "Generating or re-creating automatic fixtures may replace existing matches, live scores, and standings.",
        ],
        confirmText: "Yes, Generate Fixtures",
      });
      setPendingAction(() => executeStartTournament);
      setWarningModalOpen(true);
    } else {
      executeStartTournament();
    }
  };

  const handleOpenCreateManual = () => {
    const hasStarted = isTournamentStarted(tournament);
    if (hasStarted) {
      setWarningConfig({
        title: "⚠️ Tournament Already Started",
        level: "NORMAL",
        details: [
          "This tournament has already started.",
          "Adding a new manual fixture may affect ongoing schedules and standings.",
        ],
        confirmText: "Continue Creating Fixture",
      });
      setPendingAction(() => () => {
        setEditingMatch(null);
        setShowManualMatchModal(true);
      });
      setWarningModalOpen(true);
    } else {
      setEditingMatch(null);
      setShowManualMatchModal(true);
    }
  };

  const handleOpenEditManual = (match) => {
    const hasStarted = isTournamentStarted(tournament, matches);
    const warning = getFixtureEditWarning(tournament, match, hasStarted);

    if (warning.shouldWarn) {
      setWarningConfig(warning);
      setPendingAction(() => () => {
        setSelectedMatchForScore(null);
        setEditingMatch(match);
        setShowManualMatchModal(true);
      });
      setWarningModalOpen(true);
    } else {
      setSelectedMatchForScore(null);
      setEditingMatch(match);
      setShowManualMatchModal(true);
    }
  };

  const handleMatchClick = (match) => {
    if (isTournamentOwner || isOrganizer) {
      setSelectedMatchForScore(match);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        <div className="h-64 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <Trophy className="w-16 h-16 text-slate-400 mx-auto" />
        <h2 className="font-bold text-xl text-slate-900 dark:text-white">Tournament Not Found</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">The requested tournament could not be located.</p>
        <button
          onClick={() => navigate('/tournaments')}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Back to Tournaments
        </button>
      </div>
    );
  }

  const isTournamentOwner =
    user && tournament.organizer && (user._id === tournament.organizer._id || user._id === tournament.organizer);

  const statusInfo = STATUS_COLORS[tournament.status] || STATUS_COLORS.REGISTRATION_OPEN;
  const organizerBanner = tournament.bannerImage || tournament.banner;
  const hasOrganizerBanner = Boolean(organizerBanner);
  const sportTheme = getSportTheme(tournament.sport);
  const sportLogoPath = getSportLogo(tournament.sport);
  const bannerImg = organizerBanner || sportLogoPath;

  const organizerAvatar = tournament.organizer?.profilePhoto || tournament.organizer?.profileImage;

  const groupMatches = matches.filter((m) => m.group || m.round?.startsWith('Group'));
  const knockoutMatches = matches.filter((m) => m.roundIndex >= 10 || m.round?.includes('Semi-Final') || m.round?.includes('Final'));

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-white">
      {/* Organizer Action Bar (If Owner) */}
      {isTournamentOwner && (
        <div className="p-4 rounded-2xl bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Organizer Control Panel</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">You are the host of this tournament.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowWinnersModal(true)}
              className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md"
            >
              <Trophy className="w-3.5 h-3.5" />
              Declare Winners
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Tournament
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>

            <Link
              to="/organizer-dashboard"
              className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-800 dark:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              Organizer Suite →
            </Link>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm text-slate-900 dark:text-white">
        {hasOrganizerBanner ? (
          /* Organizer Uploaded Banner: Opens fullsize Lightbox */
          <div
            onClick={() => setShowBannerLightbox(true)}
            className="relative w-full bg-slate-950 cursor-zoom-in group/banner"
            title="Click to view full tournament banner"
            role="button"
            aria-label="View full tournament banner"
          >
            <img
              src={bannerImg}
              alt={`${tournament.name} banner`}
              className="w-full max-h-[520px] object-contain"
            />

            {/* Hover overlay — click hint */}
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold border border-slate-700 flex items-center gap-2 shadow-xl">
                <Maximize2 className="w-4 h-4 text-emerald-400" /> View Full Banner
              </span>
            </div>

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
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

            <div className="absolute top-4 right-4 pointer-events-none">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusInfo.badge}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        ) : (
          /* Fallback Header (No organizer banner uploaded): Clean SVG Sport Header */
          <div className={`relative h-56 w-full bg-gradient-to-br ${sportTheme.gradient} p-6 flex flex-col items-center justify-center text-center overflow-hidden`}>
            <div className="relative z-10 p-4 rounded-2xl bg-white/10 dark:bg-slate-950/40 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-inner flex items-center justify-center mb-2">
              <img
                src={sportLogoPath}
                alt={`${tournament.sport} logo`}
                className="w-16 h-16 object-contain filter drop-shadow-md invert dark:invert-0 brightness-200 dark:brightness-100"
              />
            </div>
            <span className="relative z-10 font-display font-black text-sm tracking-widest uppercase text-white/90 drop-shadow-sm flex items-center gap-1.5">
              <span>{sportTheme.emoji}</span> {tournament.sport} Championship
            </span>

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none z-20">
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

            <div className="absolute top-4 right-4 pointer-events-none z-20">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusInfo.badge}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        )}

        {/* Tournament Info & Register */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-900 dark:text-white">
              {tournament.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{tournament.venue}, {typeof tournament.location === 'object' && tournament.location !== null ? tournament.location.address : `${tournament.location}, Goa`}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
                  <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>{tournament.startTime}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(tournament.status === 'REGISTRATION_OPEN' || tournament.status === 'UPCOMING') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    navigate('/login', { state: { message: 'Please login or create an account to register for this tournament.' } });
                  } else {
                    setShowRegisterModal(true);
                  }
                }}
                className="px-6 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Register Team ({tournament.registrationFee === 0 ? 'FREE' : `₹${tournament.registrationFee}`})
              </button>
            )}

            <button
              onClick={handleShare}
              className="px-5 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Share Tournament</span>
            </button>
          </div>
        </div>

        {/* Quick Details Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white">
          <div className="p-4 flex items-center gap-3">
            <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Entry Fee</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                {tournament.registrationFee === 0 ? 'FREE' : `₹${tournament.registrationFee.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Squad Capacity</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                {verifiedTeams.length} / {tournament.maxTeams} Teams
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Prize Pool</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[150px]">
                {tournament.prizePool || 'Medals & Trophies'}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 overflow-hidden flex-shrink-0">
              {organizerAvatar ? (
                <img src={organizerAvatar} alt={tournament.organizer?.name} className="w-full h-full object-cover" />
              ) : (
                tournament.organizer?.name?.charAt(0) || 'O'
              )}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Organizer</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[140px]">
                {tournament.organizer?.name || 'Goa Sports Authority'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Winners Showcase Section (If Completed or Winner declared) */}
      {(tournament.status === 'COMPLETED' || tournament.winner) && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 p-6 sm:p-8 shadow-sm relative overflow-hidden text-slate-900 dark:text-white">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                Tournament Champions & Winners
              </h2>
              <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold">
                Official results declared for {tournament.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* 1st Place Champion */}
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 shadow-sm text-center space-y-2 relative overflow-hidden order-first md:order-2 md:-mt-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center mx-auto shadow-sm text-slate-950 font-black">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                1st Place Champion
              </span>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white pt-1">
                {tournament.winner || 'Champion Declared'}
              </h3>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 font-semibold">
                Winner Category: {tournament.winnerType || 'Team'}
              </p>
            </div>

            {/* 2nd Place Runner-Up */}
            {tournament.runnerUp && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-2 order-2 md:order-1">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center mx-auto text-slate-700 dark:text-slate-300">
                  <Award className="w-6 h-6" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                  2nd Place Runner-Up
                </span>
                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white pt-1">
                  {tournament.runnerUp}
                </h4>
              </div>
            )}

            {/* 3rd Place */}
            {tournament.thirdPlace && (
              <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-center space-y-2 order-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center mx-auto text-amber-800 dark:text-amber-400">
                  <Medal className="w-6 h-6" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                  3rd Place / Bronze
                </span>
                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white pt-1">
                  {tournament.thirdPlace}
                </h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🏆 TOURNAMENT PRIZES BREAKDOWN SECTION */}
      {((tournament.prizes && tournament.prizes.length > 0) || tournament.prizePool) && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 space-y-4 shadow-xs text-slate-900 dark:text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/50 text-amber-800 dark:text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">🏆 Tournament Prizes</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Official reward structure for top finishing teams</p>
            </div>
          </div>

          {tournament.prizes && tournament.prizes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {tournament.prizes.map((p, idx) => {
                let badgeEmoji = '🏆';
                let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
                if (p.position === 1 || idx === 0) {
                  badgeEmoji = '🥇';
                  badgeClass = 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/50 font-black';
                } else if (p.position === 2 || idx === 1) {
                  badgeEmoji = '🥈';
                  badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-bold';
                } else if (p.position === 3 || idx === 2) {
                  badgeEmoji = '🥉';
                  badgeClass = 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 font-bold';
                }

                return (
                  <div
                    key={p._id || idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 shadow-xs hover:border-amber-400 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${badgeClass}`}>
                        <span>{badgeEmoji}</span> {p.title || `${p.position}th Prize`}
                      </span>
                      {p.description && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 leading-normal">{p.description}</p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Prize</span>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-base">
                        ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Total Prize Pool:</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">{tournament.prizePool}</span>
            </div>
          )}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('fixtures')}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'fixtures'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Fixtures & Brackets ({matches.length})
        </button>

        {(tournament.format === 'ROUND_ROBIN' || tournament.format === 'GROUP_KNOCKOUT') && (
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'standings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Points Table / Standings
          </button>
        )}

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'teams'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Confirmed Squads ({verifiedTeams.length})
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Rules & Venue Details
        </button>
      </div>

      {/* Tab 1: Fixtures & Brackets */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-slate-900 dark:text-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Live Match Schedule & Brackets</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Real-time match tree and scheduled fixtures</p>
              </div>
            </div>

            {isTournamentOwner && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Stage-Aware Auto Fixtures Button */}
                <button
                  onClick={handleStartTournament}
                  disabled={startingTournament}
                  className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    startingTournament
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : matches.length > 0 && tournament.format === 'GROUP_KNOCKOUT' && groupMatches.length > 0 && groupMatches.every((m) => m.status === 'COMPLETED') && knockoutMatches.length === 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title="Generate automatic fixtures for current tournament stage"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {startingTournament
                    ? 'Generating...'
                    : matches.length === 0
                    ? 'Auto Fixtures'
                    : tournament.format === 'GROUP_KNOCKOUT'
                    ? knockoutMatches.length > 0
                      ? 'Fixtures Complete ✓'
                      : groupMatches.length > 0 && groupMatches.every((m) => m.status === 'COMPLETED')
                      ? 'Generate Knockout Finals'
                      : 'Group Stage Generated ✓'
                    : 'Fixtures Complete ✓'}
                </button>

                {/* Manual Fixture Button */}
                <button
                  onClick={handleOpenCreateManual}
                  className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-all shadow-md"
                  title="Create a match fixture manually"
                >
                  <Zap className="w-3.5 h-3.5" />
                  + Manual Fixture
                </button>

                {/* Manage Groups Button (If Group Stage + Knockout) */}
                {tournament.format === 'GROUP_KNOCKOUT' && (
                  <button
                    onClick={() => setShowGroupManagementModal(true)}
                    className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md"
                    title="Manually assign teams to groups and set group structure"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Manage Groups
                  </button>
                )}

                {/* Reset Fixtures Button */}
                <button
                  onClick={() => setShowResetModal(true)}
                  disabled={resettingFixtures || matches.length === 0}
                  className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Safely reset all generated fixtures and standings for this tournament"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resettingFixtures ? 'Resetting...' : 'Reset Fixtures'}
                </button>
              </div>
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
          <StandingsTable standings={standings} />
        </div>
      )}

      {/* Tab 3: Confirmed Squads */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          {verifiedTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {verifiedTeams.map((team, idx) => (
                <div
                  key={team._id || idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-slate-900 dark:text-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                      VERIFIED
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{team.teamName}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Captain: {team.captainName}</p>
                  {team.playersList && team.playersList.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      Roster: {team.playersList.map((p) => p.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-xs text-slate-900 dark:text-white">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No teams confirmed yet. Be the first to register!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Rules & Venue */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Tournament Rules & Guidelines</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {tournament.rules ||
                '1. Standard official sports federation rules apply.\n2. Teams must report 30 minutes prior to scheduled fixture.\n3. Referee decisions are final and binding.\n4. Sports attire and appropriate safety gear mandatory.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
              <MapPin className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Goa Venue & Contact</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Stadium / Ground</p>
                <p className="font-semibold text-slate-900 dark:text-white">{tournament.venue}</p>
                <p className="text-slate-600 dark:text-slate-400">
                  {typeof tournament.location === 'object' && tournament.location !== null 
                    ? tournament.location.address 
                    : `${tournament.location}, Goa`}
                </p>
              </div>

              {typeof tournament.location === 'object' && tournament.location !== null && tournament.location.latitude && (
                <MapPreview location={tournament.location} venueName={tournament.venue} />
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 font-medium">Organizer Details</p>
                <p className="font-semibold text-slate-900 dark:text-white">{tournament.organizer?.name}</p>
                {tournament.organizer?.organizationName && (
                  <p className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">{tournament.organizer.organizationName}</p>
                )}
                <p className="text-slate-600 dark:text-slate-400 font-mono">{tournament.organizer?.phone || '+91 98221 45678'}</p>
                <p className="text-slate-600 dark:text-slate-400">{tournament.organizer?.email}</p>
                {tournament.organizer?.bio && (
                  <p className="text-slate-500 dark:text-slate-400 italic mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
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
          sport={tournament?.sport}
          onClose={() => setSelectedMatchForScore(null)}
          onUpdated={(updatedMatch) => {
            setSelectedMatchForScore(null);
            setMatches((prev) =>
              prev.map((m) => (m._id === updatedMatch._id ? updatedMatch : m))
            );
          }}
          onEditDetails={(matchToEdit) => handleOpenEditManual(matchToEdit)}
        />
      )}

      {/* Manual Match Modal */}
      {showManualMatchModal && (
        <ManualMatchModal
          tournament={tournament}
          verifiedTeams={verifiedTeams}
          editingMatch={editingMatch}
          onClose={() => {
            setShowManualMatchModal(false);
            setEditingMatch(null);
          }}
          onSuccess={() => {
            fetchTournamentData();
          }}
        />
      )}

      {/* Banner Fullsize Lightbox */}
      {showBannerLightbox && (
        <BannerLightbox
          imageUrl={bannerImg}
          altText={`${tournament.name} banner`}
          onClose={() => setShowBannerLightbox(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          tournament={tournament}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Reset Fixtures Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Reset Fixtures?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{tournament.name}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {matches.some((m) => m.status === 'LIVE') ? (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[11px] text-rose-600 dark:text-rose-400">⚠️ LIVE MATCH IN PROGRESS</p>
                  <p>A match is currently LIVE. Resetting fixtures will interrupt live score reporting and permanently clear current match data.</p>
                </div>
              ) : matches.some((m) => m.status === 'COMPLETED') ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400">⚠️ MATCHES CONTAIN RESULTS</p>
                  <p>Matches already contain scores and completed results. Resetting fixtures will remove current match standings and scores.</p>
                </div>
              ) : (
                <p>This action will clear all generated match fixtures and standings for this tournament so you can generate them again from a clean state.</p>
              )}

              {/* Reset Options Choice */}
              {tournament.format === 'GROUP_KNOCKOUT' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Reset Options:</span>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="resetGroupOption"
                        checked={!resetClearGroups}
                        onChange={() => setResetClearGroups(false)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Clear fixtures only (Keep group team assignments)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="resetGroupOption"
                        checked={resetClearGroups}
                        onChange={() => setResetClearGroups(true)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Clear fixtures + reset group assignments</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                <p className="font-bold">✓ Preserved Data:</p>
                <p>Team registrations, player profiles, payments, banner, prizes, and tournament details will NOT be deleted.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resettingFixtures}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeResetFixtures}
                disabled={resettingFixtures}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {resettingFixtures ? 'Resetting...' : 'Yes, Reset Fixtures'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Management Modal */}
      {showGroupManagementModal && (
        <GroupManagementModal
          tournamentId={id}
          onClose={() => setShowGroupManagementModal(false)}
          onSaved={() => fetchTournamentData()}
        />
      )}

      {/* Fixture Warning & Confirmation Modal */}
      {warningConfig && (
        <FixtureWarningModal
          isOpen={warningModalOpen}
          title={warningConfig.title}
          level={warningConfig.level}
          details={warningConfig.details}
          comparison={warningConfig.comparison}
          confirmText={warningConfig.confirmText}
          cancelText="Cancel"
          loading={startingTournament}
          onConfirm={() => {
            setWarningModalOpen(false);
            if (pendingAction) pendingAction();
          }}
          onCancel={() => {
            setWarningModalOpen(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
};

export default TournamentDetail;
