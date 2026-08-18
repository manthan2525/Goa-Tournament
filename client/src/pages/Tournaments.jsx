import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Trophy, SlidersHorizontal, RefreshCw } from 'lucide-react';
import api from '../services/api';
import TournamentCard from '../components/TournamentCard';
import { SPORTS_LIST, GOA_LOCATIONS, TOURNAMENT_FORMATS } from '../utils/constants';

const Tournaments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [format, setFormat] = useState(searchParams.get('format') || 'All');
  const [feeMax, setFeeMax] = useState(searchParams.get('feeMax') || '');

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (sport !== 'All') params.sport = sport;
      if (location !== 'All') params.location = location;
      if (status !== 'All') params.status = status;
      if (format !== 'All') params.format = format;
      if (feeMax) params.feeMax = feeMax;

      const res = await api.get('/tournaments', { params });
      if (res.data.success) {
        setTournaments(res.data.tournaments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [sport, location, status, format, feeMax]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTournaments();
  };

  const resetFilters = () => {
    setSearch('');
    setSport('All');
    setLocation('All');
    setStatus('All');
    setFormat('All');
    setFeeMax('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-white">
            Discover Tournaments in Goa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and register for tournaments across Panaji, Mapusa, Margao, and Vasco stadiums.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search tournaments by name, stadium, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-24 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Sport Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Sport Discipline
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500"
            >
              {SPORTS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Goa Location / Town
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500"
            >
              {GOA_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Tournament Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="REGISTRATION_OPEN">Registration Open</option>
              <option value="ONGOING">Live & Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Tournament Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500"
            >
              <option value="All">All Formats</option>
              <option value="KNOCKOUT">Knockout</option>
              <option value="ROUND_ROBIN">Round Robin</option>
              <option value="GROUP_KNOCKOUT">Group + Knockout</option>
            </select>
          </div>

          {/* Max Entry Fee */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Max Fee (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 2000"
              value={feeMax}
              onChange={(e) => setFeeMax(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Found {tournaments.length} tournaments matching your filters</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-2xl glass-card border border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <TournamentCard key={t._id} tournament={t} />
          ))}
        </div>
      ) : (
        <div className="p-16 glass-card rounded-2xl text-center space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-lg text-white">No tournaments matched your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, location filter, or sport selection.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
