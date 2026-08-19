import React, { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList, Search, ChevronLeft, ChevronRight, X, Eye, FileText, CheckCircle2, AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import AadhaarReviewModal from '../../components/AadhaarReviewModal';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedRegForAadhaar, setSelectedRegForAadhaar] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/admin/registrations?${params}`);
      if (res.data.success) {
        setRegistrations(res.data.data.registrations);
        setPagination({ total: res.data.data.total, pages: res.data.data.pages });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-teal-400" /> Platform Registrations
          </h1>
          <p className="text-xs text-slate-400 mt-1">{pagination.total} total team registrations across all tournaments</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-teal-500 focus:outline-none"
        >
          <option value="">All Payment Statuses</option>
          <option value="PENDING">Pending Verification</option>
          <option value="VERIFIED">Verified & Confirmed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{error}</div>}

      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70">
                {['Team / Squad', 'Tournament', 'Captain', 'Phone', 'Payment Status', 'Aadhaar Status', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 w-20 bg-slate-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : registrations.length === 0 ? (
                <tr><td colSpan="8" className="px-5 py-16 text-center text-slate-500">No registrations found.</td></tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{reg.teamName}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap max-w-[160px] truncate">{reg.tournament?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{reg.captainName || reg.user?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{reg.contactPhone || reg.user?.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                        reg.paymentStatus === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400' :
                        reg.paymentStatus === 'REJECTED' ? 'bg-rose-500/15 text-rose-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>
                        {reg.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                        reg.aadhaarVerificationStatus === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400' :
                        reg.aadhaarVerificationStatus === 'REJECTED' ? 'bg-rose-500/15 text-rose-400' :
                        'bg-teal-500/15 text-teal-400'
                      }`}>
                        {reg.aadhaarVerificationStatus || 'NOT_REQUIRED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      {reg.tournament?.requireAadhaarVerification ? (
                        <button
                          onClick={() => setSelectedRegForAadhaar(reg)}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-bold text-[10px] flex items-center gap-1 border border-teal-500/30"
                        >
                          <FileText className="w-3 h-3" /> Inspect Aadhaar
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono">Standard</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-[10px] text-slate-500">Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {selectedRegForAadhaar && (
        <AadhaarReviewModal
          registration={selectedRegForAadhaar}
          onClose={() => setSelectedRegForAadhaar(null)}
          onSuccess={() => { setSelectedRegForAadhaar(null); fetchRegistrations(); }}
        />
      )}
    </div>
  );
};

export default AdminRegistrations;
