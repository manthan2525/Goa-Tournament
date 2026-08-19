import React, { useEffect, useState, useCallback } from 'react';
import { Activity, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const AdminActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/activity-logs?page=${page}&limit=25`);
      if (res.data.success) {
        setLogs(res.data.data.logs);
        setPagination({ total: res.data.data.total, pages: res.data.data.pages });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-rose-400" /> Platform Audit & Activity Log
        </h1>
        <p className="text-xs text-slate-400 mt-1">Non-sensitive system & administrative action audit trail</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{error}</div>}

      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70">
                {['Timestamp', 'Action', 'Actor', 'Role', 'Target', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 w-20 bg-slate-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-16 text-center text-slate-500">No activity logs recorded yet.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{log.performedBy?.name || 'System'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                        log.performerRole === 'ADMIN' ? 'bg-rose-500/15 text-rose-400' :
                        log.performerRole === 'ORGANIZER' ? 'bg-violet-500/15 text-violet-400' :
                        'bg-slate-500/15 text-slate-400'
                      }`}>
                        {log.performerRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-semibold max-w-[140px] truncate">{log.targetName || log.targetType}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-[240px] truncate">{log.details || '—'}</td>
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
    </div>
  );
};

export default AdminActivity;
