import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Trophy,
  ClipboardList,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  ArrowRight,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import api from '../../services/api';

const StatCard = ({ icon: Icon, label, value, sub, color = 'emerald', loading }) => {
  const colorMap = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    violet: 'text-violet-700 bg-violet-50 border-violet-200',
    teal: 'text-teal-700 bg-teal-50 border-teal-200',
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-slate-300 transition-all shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {loading ? (
          <div className="h-8 w-16 rounded-lg bg-slate-100 animate-pulse" />
        ) : (
          <p className="font-display font-black text-3xl text-slate-900">{value ?? 0}</p>
        )}
      </div>
      <p className="mt-3 text-xs font-bold text-slate-700">{label}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const t = stats?.tournamentsByStatus || {};
  const r = stats?.registrationsByStatus || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Full platform overview — real-time data from MongoDB Atlas.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Users & Organizers */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          People
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Players"
            value={stats?.totalUsers}
            color="blue"
            loading={loading}
          />
          <StatCard
            icon={Building2}
            label="Total Organizers"
            value={stats?.totalOrganizers}
            color="violet"
            loading={loading}
          />
          <StatCard
            icon={ClipboardList}
            label="Total Registrations"
            value={stats?.totalRegistrations}
            color="teal"
            loading={loading}
          />
          <StatCard
            icon={Trophy}
            label="Total Tournaments"
            value={stats?.totalTournaments}
            color="amber"
            loading={loading}
          />
        </div>
      </div>

      {/* Tournament Status Breakdown */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Tournament Status
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Upcoming', key: 'UPCOMING', color: 'blue' },
            { label: 'Reg. Open', key: 'REGISTRATION_OPEN', color: 'emerald' },
            { label: 'Reg. Closed', key: 'REGISTRATION_CLOSED', color: 'amber' },
            { label: 'Ongoing', key: 'ONGOING', color: 'rose' },
            { label: 'Completed', key: 'COMPLETED', color: 'teal' },
            { label: 'Cancelled', key: 'CANCELLED', color: 'rose' },
          ].map(({ label, key, color }) => (
            <div
              key={key}
              className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-xs"
            >
              {loading ? (
                <div className="h-7 w-12 mx-auto rounded-lg bg-slate-100 animate-pulse mb-2" />
              ) : (
                <p className="font-display font-black text-2xl text-slate-900">{t[key] ?? 0}</p>
              )}
              <p className="text-[10px] text-slate-600 font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Status */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Registration Status
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
            <Clock className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              {loading ? (
                <div className="h-7 w-14 rounded bg-slate-100 animate-pulse" />
              ) : (
                <p className="font-display font-black text-2xl text-slate-900">{r.PENDING ?? 0}</p>
              )}
              <p className="text-[10px] text-slate-500 font-medium">Pending Review</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              {loading ? (
                <div className="h-7 w-14 rounded bg-slate-100 animate-pulse" />
              ) : (
                <p className="font-display font-black text-2xl text-slate-900">{r.APPROVED ?? 0}</p>
              )}
              <p className="text-[10px] text-slate-500 font-medium">Approved</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
            <XCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
            <div>
              {loading ? (
                <div className="h-7 w-14 rounded bg-slate-100 animate-pulse" />
              ) : (
                <p className="font-display font-black text-2xl text-slate-900">{r.REJECTED ?? 0}</p>
              )}
              <p className="text-[10px] text-slate-500 font-medium">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-bold text-slate-900">Recent Players</p>
            </div>
            <Link
              to="/admin/users"
              className="text-[10px] text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                  <div className="space-y-1 flex-1">
                    <div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2 w-40 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : stats?.recentUsers?.length > 0 ? (
              stats.recentUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 overflow-hidden flex-shrink-0">
                    {u.profilePhoto ? (
                      <img src={u.profilePhoto} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      u.name?.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 flex-shrink-0">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-xs text-slate-400">No players yet</div>
            )}
          </div>
        </div>

        {/* Recent Tournaments */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-bold text-slate-900">Recent Tournaments</p>
            </div>
            <Link
              to="/admin/tournaments"
              className="text-[10px] text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="space-y-1 flex-1">
                    <div className="h-2.5 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2 w-24 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : stats?.recentTournaments?.length > 0 ? (
              stats.recentTournaments.map((t) => (
                <div key={t._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {t.bannerImage ? (
                      <img src={t.bannerImage} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.sport} • {t.organizer?.name || 'Unknown'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono flex-shrink-0 ${
                    t.status === 'REGISTRATION_OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    t.status === 'ONGOING' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    t.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                    'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {t.status?.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-xs text-slate-400">No tournaments yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Organizers */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-violet-600" />
            <p className="text-xs font-bold text-slate-900">Recent Organizers</p>
          </div>
          <Link
            to="/admin/organizers"
            className="text-[10px] text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-600">
                <th className="text-left px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider">Organizer</th>
                <th className="text-left px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-center px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider">Tournaments</th>
                <th className="text-left px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3"><div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3 hidden sm:table-cell"><div className="h-2 w-36 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3 text-center"><div className="h-2.5 w-8 mx-auto bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3 hidden md:table-cell"><div className="h-2 w-20 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : stats?.recentOrganizers?.length > 0 ? (
                stats.recentOrganizers.map((org) => (
                  <tr key={org._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center text-[10px] font-bold text-violet-700 overflow-hidden flex-shrink-0">
                          {org.profilePhoto ? (
                            <img src={org.profilePhoto} alt={org.name} className="w-full h-full object-cover" />
                          ) : (
                            org.name?.charAt(0)
                          )}
                        </div>
                        <span className="text-slate-900 font-bold">{org.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">{org.email}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-bold font-mono">
                        {org.tournamentCount ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 hidden md:table-cell">
                      {new Date(org.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-slate-400">No organizers yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
