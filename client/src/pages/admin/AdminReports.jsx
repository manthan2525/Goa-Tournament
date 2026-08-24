import React, { useEffect, useState } from 'react';
import { BarChart3, Trophy, Users, MapPin, Building2, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { formatLocation } from '../../utils/constants';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/reports');
        if (res.data.success) {
          setReports(res.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />
          <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  const maxSport = Math.max(...(reports?.sportsData?.map(s => s.count) || [1]), 1);
  const maxLoc = Math.max(...(reports?.locationData?.map(l => l.count) || [1]), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-rose-400" /> Platform Analytics & Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">Aggregated statistics calculated live from MongoDB Atlas</p>
      </div>

      {error && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sports Popularity */}
        <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Popularity by Sport
          </h3>
          <div className="space-y-3">
            {reports?.sportsData?.length > 0 ? (
              reports.sportsData.map((item) => (
                <div key={item._id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item._id}</span>
                    <span className="font-mono text-amber-400">{item.count} tournaments</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / maxSport) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No sports data available</p>
            )}
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" /> Distribution by Goa District
          </h3>
          <div className="space-y-3">
            {reports?.locationData?.length > 0 ? (
              reports.locationData.map((item) => (
                <div key={item._id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{formatLocation(item._id)}</span>
                    <span className="font-mono text-emerald-400">{item.count} venues</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / maxLoc) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No location data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Active Organizers */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-violet-400" /> Top Platform Organizers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports?.topOrganizersData?.length > 0 ? (
            reports.topOrganizersData.map((org, index) => (
              <div key={org._id || index} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-sm flex-shrink-0">
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{org.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{org.organizationName || org.email}</p>
                  <p className="text-[10px] font-mono text-violet-400 font-bold mt-0.5">{org.tournamentCount} Hosted</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No organizers data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
