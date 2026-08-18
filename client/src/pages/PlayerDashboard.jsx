import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { PAYMENT_STATUS_COLORS } from '../utils/constants';

const PlayerDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegForPayment, setSelectedRegForPayment] = useState(null);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my-registrations');
      if (res.data.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Area */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-display font-black text-2xl shadow-xl shadow-emerald-500/20">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl text-white">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user?.email} • {user?.phone || 'Goa, India'}</p>
          </div>
        </div>

        <Link
          to="/tournaments"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          + Join Another Tournament
        </Link>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">
            My Registered Teams & Status
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {registrations.length} Total Registrations
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-48 rounded-2xl glass-card border border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : registrations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {registrations.map((reg) => {
              const statusStyle =
                PAYMENT_STATUS_COLORS[reg.status] || PAYMENT_STATUS_COLORS.PENDING;
              const hasPayment = !!reg.payment;

              return (
                <div
                  key={reg._id}
                  className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                          {reg.tournament?.sport} Tournament
                        </span>
                        <h3 className="font-display font-bold text-lg text-white">
                          {reg.tournament?.name}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide font-mono ${statusStyle.badge}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Team Details */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Team Name:</span>
                        <span className="font-bold text-white">{reg.teamName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Captain / Contact:</span>
                        <span className="text-slate-200">{reg.captainName} ({reg.contactPhone})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Venue:</span>
                        <span className="text-slate-200">{reg.tournament?.venue}, {reg.tournament?.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Fee Amount:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {reg.tournament?.registrationFee === 0
                            ? 'FREE'
                            : `₹${reg.tournament?.registrationFee?.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    </div>

                    {/* Rejection notice if any */}
                    {reg.status === 'REJECTED' && reg.rejectionReason && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          Rejection Reason:
                        </p>
                        <p>{reg.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <Link
                      to={`/tournaments/${reg.tournament?._id}`}
                      className="text-xs font-bold text-slate-300 hover:text-emerald-400 flex items-center gap-1"
                    >
                      <span>View Tournament</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {reg.status === 'PENDING' && !hasPayment && reg.tournament?.registrationFee > 0 && (
                      <button
                        onClick={() => setSelectedRegForPayment(reg)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Complete UPI Payment
                      </button>
                    )}

                    {reg.status === 'REJECTED' && (
                      <button
                        onClick={() => setSelectedRegForPayment(reg)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Re-upload Payment Proof
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 glass-card rounded-2xl text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-white">No Registrations Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't joined any tournament yet. Browse active tournaments in Goa and register your squad!
            </p>
            <Link
              to="/tournaments"
              className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Browse Tournaments
            </Link>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedRegForPayment && (
        <PaymentModal
          registration={selectedRegForPayment}
          tournament={selectedRegForPayment.tournament}
          onClose={() => setSelectedRegForPayment(null)}
          onSuccess={() => {
            setSelectedRegForPayment(null);
            fetchMyRegistrations();
          }}
        />
      )}
    </div>
  );
};

export default PlayerDashboard;
