import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  ShieldCheck,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Zap,
  Eye,
  CreditCard,
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  FileText,
  Check,
  X,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentReviewModal from '../components/PaymentReviewModal';
import ScoreUpdateModal from '../components/ScoreUpdateModal';
import EditTournamentModal from '../components/EditTournamentModal';
import DeleteTournamentModal from '../components/DeleteTournamentModal';
import DeclareWinnersModal from '../components/DeclareWinnersModal';
import AadhaarReviewModal from '../components/AadhaarReviewModal';
import TeamDetailsModal from '../components/TeamDetailsModal';
import FixtureWarningModal from '../components/FixtureWarningModal';
import { getRegenerateWarning } from '../utils/fixtureWarnings';
import { STATUS_COLORS, formatLocation } from '../utils/constants';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [activeTab, setActiveTab] = useState('tournaments'); // 'tournaments' | 'participants'

  // Modals state
  const [selectedTournamentForEdit, setSelectedTournamentForEdit] = useState(null);
  const [selectedTournamentForDelete, setSelectedTournamentForDelete] = useState(null);
  const [selectedTournamentForWinners, setSelectedTournamentForWinners] = useState(null);
  const [selectedRegistrationForAadhaar, setSelectedRegistrationForAadhaar] = useState(null);

  // Payment review modal states
  const [selectedTournamentPayments, setSelectedTournamentPayments] = useState([]);
  const [activePaymentForReview, setActivePaymentForReview] = useState(null);
  const [showPaymentListModal, setShowPaymentListModal] = useState(false);
  const [reviewTournamentName, setReviewTournamentName] = useState('');

  // Participant management tab state
  const [selectedTournamentForParticipants, setSelectedTournamentForParticipants] = useState(null);
  const [participantRegistrations, setParticipantRegistrations] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantFilter, setParticipantFilter] = useState('ALL'); // 'ALL' | 'PENDING_PAYMENT' | 'PENDING_AADHAAR' | 'VERIFIED' | 'REJECTED'
  const [selectedRegDetails, setSelectedRegDetails] = useState(null);
  const [participantSearch, setParticipantSearch] = useState('');

  const formatWhatsAppUrl = (phoneStr) => {
    if (!phoneStr) return '#';
    const clean = String(phoneStr).replace(/\D/g, '');
    if (!clean) return '#';
    const formatted = clean.length === 10 ? `91${clean}` : clean;
    return `https://wa.me/${formatted}`;
  };

  // Score modal states
  const [activeMatchForScore, setActiveMatchForScore] = useState(null);
  const [tournamentMatchesList, setTournamentMatchesList] = useState([]);
  const [showMatchSelectorModal, setShowMatchSelectorModal] = useState(false);
  const [selectedTournamentSport, setSelectedTournamentSport] = useState(null);

  // Warning Modal state
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningConfig, setWarningConfig] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [startingTournament, setStartingTournament] = useState(false);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      setApiError('');
      const res = await api.get('/tournaments/organizer/my-tournaments');
      if (res.data?.success) {
        setTournaments(res.data.tournaments || []);
        if (res.data.tournaments && res.data.tournaments.length > 0 && !selectedTournamentForParticipants) {
          setSelectedTournamentForParticipants(res.data.tournaments[0]);
        }
      } else {
        setApiError(res.data?.message || 'Failed to fetch organizer tournaments.');
      }
    } catch (err) {
      console.error('Organizer Suite fetch error:', err);
      setApiError(err.message || 'Failed to load organizer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  // Fetch participants when selected tournament changes in participants tab
  useEffect(() => {
    if (selectedTournamentForParticipants?._id) {
      const fetchParticipants = async () => {
        try {
          setLoadingParticipants(true);
          const res = await api.get(
            `/registrations/tournament/${selectedTournamentForParticipants._id}`
          );
          if (res.data.success) {
            setParticipantRegistrations(res.data.registrations || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingParticipants(false);
        }
      };
      fetchParticipants();
    }
  }, [selectedTournamentForParticipants]);

  const executeStartTournament = async (tournamentId, tournamentName) => {
    try {
      setStartingTournament(true);
      const res = await api.post(`/tournaments/${tournamentId}/start`);
      if (res.data.success) {
        setActionMessage(res.data.message);
        setTimeout(() => setActionMessage(''), 4000);
        fetchOrganizerData();
      }
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to generate fixtures.');
    } finally {
      setStartingTournament(false);
    }
  };

  const handleStartTournament = (tournamentId, tournamentName) => {
    const targetTournament = tournaments.find((t) => t._id === tournamentId);
    const hasStarted = targetTournament && (targetTournament.status === 'ONGOING' || targetTournament.status === 'COMPLETED');

    const warning = getRegenerateWarning(targetTournament, hasStarted);

    if (warning.shouldWarn) {
      setWarningConfig(warning);
      setPendingAction(() => () => executeStartTournament(tournamentId, tournamentName));
      setWarningModalOpen(true);
    } else {
      executeStartTournament(tournamentId, tournamentName);
    }
  };

  const handleOpenPaymentReview = async (tournamentId, tournamentName) => {
    try {
      setReviewTournamentName(tournamentName);
      const res = await api.get(`/payments/tournament/${tournamentId}`);
      if (res.data.success) {
        setSelectedTournamentPayments(res.data.payments || []);
        setShowPaymentListModal(true);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to fetch tournament payments.');
    }
  };

  const handleOpenScorepad = async (tournamentId, tournamentName, sport) => {
    try {
      setReviewTournamentName(tournamentName);
      setSelectedTournamentSport(sport);
      const res = await api.get(`/matches/tournament/${tournamentId}`);
      if (res.data.success) {
        setTournamentMatchesList(res.data.matches || []);
        setShowMatchSelectorModal(true);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to fetch tournament matches.');
    }
  };

  // Aggregated stats
  const totalTournaments = tournaments.length;
  const totalRegistrations = tournaments.reduce(
    (acc, t) => acc + (t.totalRegistrations || 0),
    0
  );
  const totalPendingPayments = tournaments.reduce(
    (acc, t) => acc + (t.pendingPaymentsCount || 0),
    0
  );
  const totalPendingAadhaar = tournaments.reduce(
    (acc, t) => acc + (t.pendingAadhaarCount || 0),
    0
  );
  const totalVerifiedTeams = tournaments.reduce(
    (acc, t) => acc + (t.verifiedTeams || 0),
    0
  );

  const filteredRegistrations = participantRegistrations.filter((reg) => {
    if (participantSearch) {
      const q = participantSearch.toLowerCase();
      const matchTeam = reg.teamName?.toLowerCase().includes(q);
      const matchCaptain = reg.captainName?.toLowerCase().includes(q);
      const matchEmail = (reg.contactEmail || reg.user?.email || '').toLowerCase().includes(q);
      const matchPhone = (reg.contactPhone || reg.user?.phone || '').includes(q);
      if (!matchTeam && !matchCaptain && !matchEmail && !matchPhone) return false;
    }

    if (participantFilter === 'PENDING_PAYMENT') {
      return reg.paymentStatus === 'PENDING' || reg.payment?.status === 'PENDING';
    }
    if (participantFilter === 'PENDING_AADHAAR') {
      return reg.aadhaarVerificationStatus === 'PENDING';
    }
    if (participantFilter === 'VERIFIED') {
      return reg.status === 'VERIFIED' || reg.status === 'APPROVED';
    }
    if (participantFilter === 'REJECTED') {
      return reg.status === 'REJECTED';
    }
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-white">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm text-slate-900 dark:text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              Organizer Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {user?.organizationName || 'Goa Sports Trust'}
            </span>
          </div>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Tournament Management Center
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Review UPI payments, verify Aadhaar records, generate bracket fixtures, and broadcast live scores.
          </p>
        </div>

        <Link
          to="/create-tournament"
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Host New Tournament</span>
        </Link>
      </div>

      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span className="font-bold">{apiError}</span>
          </div>
          <button
            onClick={fetchOrganizerData}
            className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors flex-shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Hosted</span>
            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white font-mono">
            {totalTournaments}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Payments</span>
            <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-amber-600 dark:text-amber-400 font-mono">
            {totalPendingPayments}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Aadhaar</span>
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-teal-600 dark:text-teal-400 font-mono">
            {totalPendingAadhaar}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirmed Teams</span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-indigo-600 dark:text-indigo-400 font-mono">
            {totalVerifiedTeams}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tournaments'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Hosted Tournaments ({tournaments.length})
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'participants'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Participant Verification Center
        </button>
      </div>

      {/* TAB 1: Tournaments List */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"></div>
              ))}
            </div>
          ) : tournaments.length > 0 ? (
            <div className="space-y-4">
              {tournaments.map((t) => {
                const statusInfo = STATUS_COLORS[t.status] || STATUS_COLORS.REGISTRATION_OPEN;

                return (
                  <div
                    key={t._id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-slate-900 dark:text-white"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Info */}
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                            {t.sport}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${statusInfo.badge}`}>
                            {statusInfo.label}
                          </span>
                          {t.requireAadhaarVerification && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50">
                              Aadhaar Required
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">{t.name}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {t.venue}, {formatLocation(t.location)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {t.verifiedTeams || 0} / {t.maxTeams} Verified Teams
                          </span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            Fee: {t.registrationFee === 0 ? 'FREE' : `₹${t.registrationFee}`}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Review Payments CTA */}
                        <button
                          onClick={() => handleOpenPaymentReview(t._id, t.name)}
                          className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                            t.pendingPaymentsCount > 0
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Payments</span>
                          {t.pendingPaymentsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                              {t.pendingPaymentsCount}
                            </span>
                          )}
                        </button>

                        {/* Declare Winners */}
                        <button
                          onClick={() => setSelectedTournamentForWinners(t)}
                          className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center gap-1.5 transition-all"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Winners</span>
                        </button>

                        {/* Start / Generate Fixtures CTA */}
                        {t.status === 'REGISTRATION_OPEN' && (
                          <button
                            onClick={() => handleStartTournament(t._id, t.name)}
                            className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Bracket</span>
                          </button>
                        )}

                        {/* Live Scorepad CTA */}
                        {t.status === 'ONGOING' && (
                          <button
                            onClick={() => handleOpenScorepad(t._id, t.name, t.sport)}
                            className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1.5 transition-all"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Scorepad</span>
                          </button>
                        )}

                        {/* Edit Tournament */}
                        <button
                          onClick={() => setSelectedTournamentForEdit(t)}
                          className="p-2 min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center"
                          title="Edit Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Tournament */}
                        <button
                          onClick={() => setSelectedTournamentForDelete(t)}
                          className="p-2 min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center"
                          title="Delete Tournament"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* View Tournament Link */}
                        <Link
                          to={`/tournaments/${t._id}`}
                          className="p-2 min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center"
                          title="View Public Page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3 text-slate-900 dark:text-white">
              <Trophy className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">No Tournaments Hosted Yet</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Create your first tournament and open registrations for Goa sports teams!
              </p>
              <Link
                to="/create-tournament"
                className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Host Tournament
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Participant Management */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          {/* Tournament Selector & Search & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm text-slate-900 dark:text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex-shrink-0">Select Tournament:</label>
                <select
                  value={selectedTournamentForParticipants?._id || ''}
                  onChange={(e) => {
                    const t = tournaments.find((item) => item._id === e.target.value);
                    if (t) setSelectedTournamentForParticipants(t);
                  }}
                  className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:border-emerald-500 min-w-[200px]"
                >
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.sport})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search team, captain, email, or phone..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setParticipantFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  participantFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Squads ({participantRegistrations.length})
              </button>
              <button
                onClick={() => setParticipantFilter('PENDING_PAYMENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  participantFilter === 'PENDING_PAYMENT'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pending Payment
              </button>
              <button
                onClick={() => setParticipantFilter('PENDING_AADHAAR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  participantFilter === 'PENDING_AADHAAR'
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800/50'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pending Aadhaar
              </button>
              <button
                onClick={() => setParticipantFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  participantFilter === 'VERIFIED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Verified / Approved
              </button>
              <button
                onClick={() => setParticipantFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  participantFilter === 'REJECTED'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/50'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Participants Display Container */}
          {loadingParticipants ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Loading participant records...
            </div>
          ) : filteredRegistrations.length > 0 ? (
            <div className="space-y-4">
              {/* DESKTOP TABLE VIEW (Visible on md and larger) */}
              <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm text-slate-900 dark:text-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Team Name</th>
                      <th className="p-3.5">Captain</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Aadhaar</th>
                      <th className="p-3.5">Entry Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredRegistrations.map((reg) => {
                      const email = reg.contactEmail || reg.user?.email || 'N/A';
                      const phone = reg.contactPhone || reg.user?.phone || 'N/A';
                      const whatsapp = reg.contactWhatsapp || reg.user?.whatsapp || phone;

                      return (
                        <tr key={reg._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{reg.teamName}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {reg.playersList?.length || 0} Players
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-800 dark:text-slate-200 whitespace-nowrap font-medium">
                            {reg.captainName}
                          </td>
                          <td className="p-3.5">
                            <div className="space-y-1">
                              {email !== 'N/A' && (
                                <div className="text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[180px]">
                                  📧 {email}
                                </div>
                              )}
                              {phone !== 'N/A' && (
                                <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                  📞 {phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                reg.paymentStatus === 'VERIFIED'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                  : reg.paymentStatus === 'REJECTED'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                                  : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400'
                              }`}
                            >
                              {reg.paymentStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                reg.aadhaarVerificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                  : reg.aadhaarVerificationStatus === 'REJECTED'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                                  : reg.aadhaarVerificationStatus === 'NOT_REQUIRED'
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400'
                              }`}
                            >
                              {reg.aadhaarVerificationStatus || 'NOT_REQUIRED'}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                reg.status === 'VERIFIED'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                  : reg.status === 'REJECTED'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                                  : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50'
                              }`}
                            >
                              {reg.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                            {/* View Team Details Button */}
                            <button
                              onClick={() => setSelectedRegDetails(reg)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
                            >
                              View Team
                            </button>

                            {/* Direct WhatsApp Button */}
                            {phone !== 'N/A' && (
                              <a
                                href={formatWhatsAppUrl(whatsapp !== 'N/A' ? whatsapp : phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/50 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                WhatsApp
                              </a>
                            )}

                            {/* Direct Call Button */}
                            {phone !== 'N/A' && (
                              <a
                                href={`tel:${phone}`}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors"
                                title="Call Captain"
                              >
                                Call
                              </a>
                            )}

                            {/* Aadhaar review button */}
                            {reg.aadhaarDocument && (
                              <button
                                onClick={() => setSelectedRegistrationForAadhaar(reg)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/50"
                              >
                                Aadhaar
                              </button>
                            )}

                            {/* Payment review button */}
                            {reg.payment && (
                              <button
                                onClick={() => setActivePaymentForReview(reg.payment)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/50"
                              >
                                Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (Visible on small screens < md) */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {filteredRegistrations.map((reg) => {
                  const email = reg.contactEmail || reg.user?.email || 'N/A';
                  const phone = reg.contactPhone || reg.user?.phone || 'N/A';
                  const whatsapp = reg.contactWhatsapp || reg.user?.whatsapp || phone;
                  const isSame = phone !== 'N/A' && (phone === whatsapp || whatsapp === 'N/A');

                  return (
                    <div key={reg._id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm text-slate-900 dark:text-white">
                      {/* Team & Captain */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">{reg.teamName}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                            Captain: <span className="text-slate-900 dark:text-white font-bold">{reg.captainName}</span>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {reg.playersList?.length || 0} Players
                        </span>
                      </div>

                      {/* Contact Info Box */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                        {email !== 'N/A' && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                            <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                            <span className="truncate">{email}</span>
                          </div>
                        )}
                        {phone !== 'N/A' && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span>{isSame ? 'Phone / WhatsApp: ' : 'Phone: '}{phone}</span>
                          </div>
                        )}
                        {!isSame && whatsapp !== 'N/A' && (
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span>WhatsApp: {whatsapp}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase font-mono">
                        <span className={`px-2 py-0.5 rounded-full ${
                          reg.paymentStatus === 'VERIFIED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                          reg.paymentStatus === 'REJECTED' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          Payment: {reg.paymentStatus || 'PENDING'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          reg.status === 'VERIFIED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                          reg.status === 'REJECTED' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          Entry: {reg.status}
                        </span>
                      </div>

                      {/* Action Buttons Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <button
                          onClick={() => setSelectedRegDetails(reg)}
                          className="w-full py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-center transition-colors"
                        >
                          View Details
                        </button>
                        {phone !== 'N/A' && (
                          <a
                            href={formatWhatsAppUrl(whatsapp !== 'N/A' ? whatsapp : phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 rounded-xl font-bold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-center flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        {phone !== 'N/A' && (
                          <a
                            href={`tel:${phone}`}
                            className="w-full py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-center flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Call
                          </a>
                        )}
                        {email !== 'N/A' && (
                          <a
                            href={`mailto:${email}`}
                            className="w-full py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-center flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Email
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              No participants matching search or filter criteria.
            </div>
          )}
        </div>
      )}

      {/* Edit Tournament Modal */}
      {selectedTournamentForEdit && (
        <EditTournamentModal
          tournament={selectedTournamentForEdit}
          onClose={() => setSelectedTournamentForEdit(null)}
          onUpdated={() => {
            setSelectedTournamentForEdit(null);
            fetchOrganizerData();
          }}
        />
      )}

      {/* Delete Tournament Modal */}
      {selectedTournamentForDelete && (
        <DeleteTournamentModal
          tournament={selectedTournamentForDelete}
          onClose={() => setSelectedTournamentForDelete(null)}
          onDeleted={() => {
            setSelectedTournamentForDelete(null);
            fetchOrganizerData();
          }}
        />
      )}

      {/* Declare Winners Modal */}
      {selectedTournamentForWinners && (
        <DeclareWinnersModal
          tournament={selectedTournamentForWinners}
          onClose={() => setSelectedTournamentForWinners(null)}
          onUpdated={() => {
            setSelectedTournamentForWinners(null);
            fetchOrganizerData();
          }}
        />
      )}

      {/* Aadhaar Review Modal */}
      {selectedRegistrationForAadhaar && (
        <AadhaarReviewModal
          registration={selectedRegistrationForAadhaar}
          onClose={() => setSelectedRegistrationForAadhaar(null)}
          onUpdated={() => {
            setSelectedRegistrationForAadhaar(null);
            fetchOrganizerData();
          }}
        />
      )}

      {/* Payment List Modal */}
      {showPaymentListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Payment Verification Dashboard
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{reviewTournamentName}</p>
              </div>
              <button
                onClick={() => setShowPaymentListModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {selectedTournamentPayments.length > 0 ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {selectedTournamentPayments.map((p) => (
                  <div
                    key={p._id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.screenshotUrl}
                        alt="Proof"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                      />
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{p.registration?.teamName}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                          UTR: {p.transactionId} • ₹{p.amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          p.status === 'VERIFIED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                            : p.status === 'REJECTED'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                            : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50'
                        }`}
                      >
                        {p.status}
                      </span>

                      <button
                        onClick={() => setActivePaymentForReview(p)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No payment proofs submitted yet for this tournament.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Selector Modal for Scoring */}
      {showMatchSelectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Select Match to Update Score
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{reviewTournamentName}</p>
              </div>
              <button
                onClick={() => setShowMatchSelectorModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {tournamentMatchesList.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {tournamentMatchesList.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => {
                      setShowMatchSelectorModal(false);
                      setActiveMatchForScore(m);
                    }}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        Match #{m.matchNumber} • {m.round}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {m.teamA?.name} ({m.scoreA?.current || 0}) vs {m.teamB?.name} ({m.scoreB?.current || 0})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          m.status === 'LIVE'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                            : m.status === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No matches generated yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Payment Review Modal */}
      {activePaymentForReview && (
        <PaymentReviewModal
          payment={activePaymentForReview}
          onClose={() => setActivePaymentForReview(null)}
          onUpdated={() => {
            setActivePaymentForReview(null);
            setShowPaymentListModal(false);
            fetchOrganizerData();
          }}
        />
      )}

      {/* Individual Match Scorepad Modal */}
      {activeMatchForScore && (
        <ScoreUpdateModal
          match={activeMatchForScore}
          sport={selectedTournamentSport}
          onClose={() => setActiveMatchForScore(null)}
          onUpdated={() => {
            setActiveMatchForScore(null);
            fetchOrganizerData();
          }}
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

      {/* Team Details Modal */}
      {selectedRegDetails && (
        <TeamDetailsModal
          registration={selectedRegDetails}
          onClose={() => setSelectedRegDetails(null)}
          onReviewPayment={(reg) => {
            if (reg.payment) setActivePaymentForReview(reg.payment);
          }}
          onReviewAadhaar={(reg) => {
            if (reg.aadhaarDocument) setSelectedRegistrationForAadhaar(reg);
          }}
        />
      )}
    </div>
  );
};

export default OrganizerDashboard;
