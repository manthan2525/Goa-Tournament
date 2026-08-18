import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Trophy, SlidersHorizontal, RefreshCw, ArrowUpDown } from 'lucide-react';
import api from '../services/api';
import TournamentCard from '../components/TournamentCard';
import { SPORTS_LIST, GOA_LOCATIONS, TOURNAMENT_FORMATS } from '../utils/constants';

const Tournaments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [format, setFormat] = useState(searchParams.get('format') || 'All');
  const [feeType, setFeeType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (sport !== 'All') params.sport = sport;
      if (location !== 'All') params.location = location;
      if (status !== 'All') params.status = status;
      if (format !== 'All') params.format = format;
      if (feeType !== 'all') params.feeType = feeType;
      if (sortBy) params.sortBy = sortBy;

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
  }, [sport, location, status, format, feeType, sortBy]);

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
    setFeeType('all');
    setSortBy('newest');
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

      {/* Sport Quick Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', ...SPORTS_LIST].map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              sport === s
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search tournaments by name, stadium, sport, or description..."
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Goa Location
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
              <option value="UPCOMING">Upcoming</option>
              <option value="REGISTRATION_OPEN">Registration Open</option>
              <option value="ONGOING">Live & Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Format
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

          {/* Fee Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Registration Fee
            </label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500"
            >
              <option value="all">All Fees</option>
              <option value="free">Free Entry Only</option>
              <option value="paid">Paid Tournaments</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-emerald-400" /> Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 font-semibold text-emerald-400"
            >
              <option value="newest">Newest Added</option>
              <option value="date">Start Date (Earliest)</option>
              <option value="deadline">Registration Deadline</option>
              <option value="fee_low">Entry Fee: Low to High</option>
              <option value="fee_high">Entry Fee: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Found {tournaments.length} tournaments matching your criteria</span>
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
