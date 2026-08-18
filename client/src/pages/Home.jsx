import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Flame,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  Award,
} from 'lucide-react';
import api from '../services/api';
import TournamentCard from '../components/TournamentCard';
import LiveScoreTicker from '../components/LiveScoreTicker';
import { SPORTS_LIST, GOA_LOCATIONS } from '../utils/constants';

const Home = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('All');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tournaments');
        if (res.data.success) {
          setTournaments(res.data.tournaments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments =
    selectedSport === 'All'
      ? tournaments
      : tournaments.filter((t) => t.sport === selectedSport);

  return (
    <div className="space-y-16">
      {/* Live Ticker */}
      <LiveScoreTicker />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-8 sm:p-14">
          {/* Ambient light glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase font-mono">
              <Flame className="w-4 h-4 text-emerald-400" />
              Goa Multi-Sport Arena 2026
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-white leading-tight">
              Where Goa Competes. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Live Scores, Fixtures & UPI Registrations.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              The complete tournament engine for football, cricket, badminton, and kabaddi leagues across Panaji, Mapusa, Margao, and Vasco. Scan & pay via UPI, generate bracket fixtures automatically, and track scores live.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/tournaments"
                className="px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm tracking-wide shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Explore Tournaments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/live"
                className="px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-display font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Activity className="w-4 h-4 text-rose-400" />
                <span>Spectator Live Hub</span>
              </Link>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-lg">
              <div>
                <p className="font-mono font-black text-2xl text-emerald-400">10+</p>
                <p className="text-xs text-slate-400">Goa Venues</p>
              </div>
              <div>
                <p className="font-mono font-black text-2xl text-white">100%</p>
                <p className="text-xs text-slate-400">Live Socket.IO Sync</p>
              </div>
              <div>
                <p className="font-mono font-black text-2xl text-teal-400">Instant</p>
                <p className="text-xs text-slate-400">QR Payment Check</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sport Category Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Active Tournaments in Goa</h2>
            <p className="text-xs text-slate-400">Filter by your favorite sport discipline</p>
          </div>
          <Link
            to="/tournaments"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Sports pill buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
          {SPORTS_LIST.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSport === sport
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl glass-card border border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredTournaments.map((t) => (
              <TournamentCard key={t._id} tournament={t} />
            ))}
          </div>
        ) : (
          <div className="p-12 glass-card rounded-2xl text-center">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-semibold text-white">No tournaments listed for {selectedSport}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Be the first organizer to host a tournament in Goa!
            </p>
          </div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Smart Fixture Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-generate single elimination knockout brackets, round-robin leagues, and group stages with byes and seeded pairings.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">UPI QR Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan custom UPI QR codes, upload transaction screenshots directly, and let organizers verify entries via cloud dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Real-Time WebSockets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live score changes broadcasted immediately to spectators and players without needing any browser page refresh.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
