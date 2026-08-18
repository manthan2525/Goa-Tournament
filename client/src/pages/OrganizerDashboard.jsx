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
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentReviewModal from '../components/PaymentReviewModal';
import ScoreUpdateModal from '../components/ScoreUpdateModal';
import { STATUS_COLORS } from '../utils/constants';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Payment review modal states
  const [selectedTournamentPayments, setSelectedTournamentPayments] = useState([]);
  const [activePaymentForReview, setActivePaymentForReview] = useState(null);
  const [showPaymentListModal, setShowPaymentListModal] = useState(false);
  const [reviewTournamentName, setReviewTournamentName] = useState('');

  // Score modal states
  const [activeMatchForScore, setActiveMatchForScore] = useState(null);
  const [tournamentMatchesList, setTournamentMatchesList] = useState([]);
  const [showMatchSelectorModal, setShowMatchSelectorModal] = useState(false);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tournaments/organizer/my-tournaments');
      if (res.data.success) {
        setTournaments(res.data.tournaments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const handleStartTournament = async (tournamentId, tournamentName) => {
    if (
      !window.confirm(
        `Are you sure you want to generate bracket fixtures and start '${tournamentName}'?`
      )
    ) {
      return;
    }

    try {
      const res = await api.post(`/tournaments/${tournamentId}/start`);
      if (res.data.success) {
        setActionMessage(res.data.message);
        setTimeout(() => setActionMessage(''), 4000);
        fetchOrganizerData();
      }
    } catch (err) {
      alert(err.message || 'Failed to generate fixtures.');
    }
  };

  const handleOpenPaymentReview = async (tournamentId, name) => {
    try {
      setReviewTournamentName(name);
      const res = await api.get(`/payments/tournament/${tournamentId}`);
      if (res.data.success) {
        setSelectedTournamentPayments(res.data.payments || []);
        setShowPaymentListModal(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch payments.');
    }
  };

  const handleOpenScorepad = async (tournamentId, name) => {
    try {
      setReviewTournamentName(name);
      const res = await api.get(`/matches/tournament/${tournamentId}`);
      if (res.data.success) {
        setTournamentMatchesList(res.data.matches || []);
        setShowMatchSelectorModal(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch matches.');
    }
  };

  // Aggregated stats
  const totalTournaments = tournaments.length;
  const totalPendingPayments = tournaments.reduce(
    (acc, t) => acc + (t.pendingPaymentsCount || 0),
    0
  );
  const totalVerifiedTeams = tournaments.reduce(
    (acc, t) => acc + (t.verifiedTeams || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Organizer Suite
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {user?.organizationName || 'Goa Sports Trust'}
            </span>
          </div>
          <h1 className="font-display font-black text-3xl text-white">
            Tournament Management Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review UPI payments, auto-generate bracket fixtures, and broadcast live scores.
          </p>
        </div>

        <Link
          to="/create-tournament"
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Host New Tournament</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Tournaments</span>
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-display font-black text-3xl text-white font-mono">
            {totalTournaments}
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Payments Review</span>
            <CreditCard className="w-5 h-5 text-amber-400" />
          </div>
          <p className="font-display font-black text-3xl text-amber-400 font-mono">
            {totalPendingPayments}
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Confirmed Teams</span>
            <Users className="w-5 h-5 text-teal-400" />
          </div>
          <p className="font-display font-black text-3xl text-teal-400 font-mono">
            {totalVerifiedTeams}
          </p>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-white">Your Hosted Tournaments</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-40 rounded-2xl glass-card border border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <div className="space-y-4">
            {tournaments.map((t) => {
              const statusInfo = STATUS_COLORS[t.status] || STATUS_COLORS.REGISTRATION_OPEN;

              return (
                <div
                  key={t._id}
                  className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Info */}
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-900 text-emerald-400 border border-slate-700">
                          {t.sport}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-xl text-white">{t.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          {t.venue}, {t.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-teal-400" />
                          {t.verifiedTeams || 0} / {t.maxTeams} Verified Squads
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          Fee: {t.registrationFee === 0 ? 'FREE' : `₹${t.registrationFee}`}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Review Payments CTA */}
                      <button
                        onClick={() => handleOpenPaymentReview(t._id, t.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all ${
                          t.pendingPaymentsCount > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Review Payments</span>
                        {t.pendingPaymentsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                            {t.pendingPaymentsCount}
                          </span>
                        )}
                      </button>

                      {/* Start / Generate Fixtures CTA */}
                      {t.status === 'REGISTRATION_OPEN' && (
                        <button
                          onClick={() => handleStartTournament(t._id, t.name)}
                          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Generate Fixtures</span>
                        </button>
                      )}

                      {/* Live Scorepad CTA */}
                      {t.status === 'ONGOING' && (
                        <button
                          onClick={() => handleOpenScorepad(t._id, t.name)}
                          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 flex items-center gap-1.5 transition-all"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Live Scorepad</span>
                        </button>
                      )}

                      {/* View Tournament Link */}
                      <Link
                        to={`/tournaments/${t._id}`}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
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
          <div className="p-16 glass-card rounded-2xl text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-white">No Tournaments Hosted Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first football, cricket, or badminton tournament and open registrations for Goa teams!
            </p>
            <Link
              to="/create-tournament"
              className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Host Tournament
            </Link>
          </div>
        )}
      </div>

      {/* Payment List Modal */}
      {showPaymentListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  Payment Verification Dashboard
                </h3>
                <p className="text-xs text-emerald-400 font-medium">{reviewTournamentName}</p>
              </div>
              <button
                onClick={() => setShowPaymentListModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {selectedTournamentPayments.length > 0 ? (
              <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {selectedTournamentPayments.map((p) => (
                  <div
                    key={p._id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-900/40 p-2 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.screenshotUrl}
                        alt="Proof"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-slate-900"
                      />
                      <div>
                        <p className="font-bold text-sm text-white">{p.registration?.teamName}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          UTR: {p.transactionId} • ₹{p.amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          p.status === 'VERIFIED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'REJECTED'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {p.status}
                      </span>

                      <button
                        onClick={() => setActivePaymentForReview(p)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No payment proofs submitted yet for this tournament.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Selector Modal for Scoring */}
      {showMatchSelectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  Select Match to Update Score
                </h3>
                <p className="text-xs text-emerald-400 font-medium">{reviewTournamentName}</p>
              </div>
              <button
                onClick={() => setShowMatchSelectorModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Match #{m.matchNumber} • {m.round}
                      </span>
                      <p className="font-bold text-white text-sm">
                        {m.teamA?.name} ({m.scoreA?.current || 0}) vs {m.teamB?.name} ({m.scoreB?.current || 0})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          m.status === 'LIVE'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : m.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
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
          onClose={() => setActiveMatchForScore(null)}
          onUpdated={() => {
            setActiveMatchForScore(null);
            fetchOrganizerData();
          }}
        />
      )}
    </div>
  );
};

export default OrganizerDashboard;
