import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
} from 'lucide-react';
import api from '../services/api';
import TournamentCard from '../components/TournamentCard';
import LiveScoreTicker from '../components/LiveScoreTicker';
import { SPORTS_LIST } from '../utils/constants';

// ─────────────────────────────────────────────────────────────────
// SPORT THEMES — pure CSS / emoji only.
// These NEVER use any organizer-uploaded tournament banner.
// ─────────────────────────────────────────────────────────────────
const SPORT_THEMES = {
  All: {
    emoji: '🏆',
    badge: 'Goa Multi-Sport Arena 2026',
    heading: (
      <>
        Where Goa Competes.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
          Discover. Register. Compete.
        </span>
      </>
    ),
    sub: 'Football • Cricket • Badminton • Kabaddi and more — find tournaments happening near you across Goa.',
    cta: { label: 'Explore All Tournaments', to: '/tournaments' },
    glow1: 'bg-emerald-500/20',
    glow2: 'bg-teal-500/15',
    accent: 'from-emerald-400 via-teal-300 to-cyan-400',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    ctaColor: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25',
  },
  Football: {
    emoji: '⚽',
    badge: 'Football Tournaments — Goa',
    heading: (
      <>
        Football in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400">
          Find & Join Football Tournaments.
        </span>
      </>
    ),
    sub: 'Compete in knockout leagues, group stages, and 5-a-side cups across Panaji, Vasco, Margao, and Mapusa.',
    cta: { label: 'Explore Football Tournaments', to: '/tournaments?sport=Football' },
    glow1: 'bg-green-500/20',
    glow2: 'bg-emerald-600/15',
    accent: 'from-green-400 via-emerald-300 to-teal-400',
    border: 'border-green-500/30',
    badgeBg: 'bg-green-500/10',
    badgeText: 'text-green-400',
    ctaColor: 'bg-green-500 hover:bg-green-400 shadow-green-500/25',
  },
  Cricket: {
    emoji: '🏏',
    badge: 'Cricket Tournaments — Goa',
    heading: (
      <>
        Cricket in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400">
          Discover & Compete with Your Team.
        </span>
      </>
    ),
    sub: 'T20, ODI, and box cricket tournaments across Goa\'s finest grounds. Register your squad and play!',
    cta: { label: 'Explore Cricket Tournaments', to: '/tournaments?sport=Cricket' },
    glow1: 'bg-amber-500/20',
    glow2: 'bg-yellow-500/15',
    accent: 'from-amber-400 via-yellow-300 to-orange-400',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    ctaColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25',
  },
  Badminton: {
    emoji: '🏸',
    badge: 'Badminton Tournaments — Goa',
    heading: (
      <>
        Badminton in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
          Find Tournaments & Register Your Team.
        </span>
      </>
    ),
    sub: 'Singles, doubles, and mixed doubles tournaments happening at indoor courts across Goa.',
    cta: { label: 'Explore Badminton Tournaments', to: '/tournaments?sport=Badminton' },
    glow1: 'bg-sky-500/20',
    glow2: 'bg-cyan-500/15',
    accent: 'from-sky-400 via-cyan-300 to-blue-400',
    border: 'border-sky-500/30',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    ctaColor: 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/25',
  },
  Kabaddi: {
    emoji: '🤼',
    badge: 'Kabaddi Tournaments — Goa',
    heading: (
      <>
        Kabaddi in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-red-400">
          Raid, Tackle & Conquer.
        </span>
      </>
    ),
    sub: 'Pro kabaddi-style tournaments bringing raw strength and teamwork to Goa\'s arenas.',
    cta: { label: 'Explore Kabaddi Tournaments', to: '/tournaments?sport=Kabaddi' },
    glow1: 'bg-rose-500/20',
    glow2: 'bg-pink-500/15',
    accent: 'from-rose-400 via-pink-300 to-red-400',
    border: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    ctaColor: 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/25',
  },
  Chess: {
    emoji: '♟️',
    badge: 'Chess Tournaments — Goa',
    heading: (
      <>
        Chess in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400">
          Think. Plan. Checkmate.
        </span>
      </>
    ),
    sub: 'Open and rated chess tournaments for all skill levels across Goa. Register and compete.',
    cta: { label: 'Explore Chess Tournaments', to: '/tournaments?sport=Chess' },
    glow1: 'bg-violet-500/20',
    glow2: 'bg-purple-500/15',
    accent: 'from-violet-400 via-purple-300 to-indigo-400',
    border: 'border-violet-500/30',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-400',
    ctaColor: 'bg-violet-500 hover:bg-violet-400 shadow-violet-500/25',
  },
  'Table Tennis': {
    emoji: '🏓',
    badge: 'Table Tennis Tournaments — Goa',
    heading: (
      <>
        Table Tennis in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
          Fast. Precise. Competitive.
        </span>
      </>
    ),
    sub: 'Singles and doubles table tennis tournaments at venues across Goa. Find your match!',
    cta: { label: 'Explore Table Tennis Tournaments', to: '/tournaments?sport=Table Tennis' },
    glow1: 'bg-orange-500/20',
    glow2: 'bg-amber-500/15',
    accent: 'from-orange-400 via-amber-300 to-yellow-400',
    border: 'border-orange-500/30',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    ctaColor: 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/25',
  },
  Volleyball: {
    emoji: '🏐',
    badge: 'Volleyball Tournaments — Goa',
    heading: (
      <>
        Volleyball in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-300 to-sky-400">
          Spike, Block & Win.
        </span>
      </>
    ),
    sub: 'Indoor and beach volleyball tournaments happening across Goa\'s courts and shores.',
    cta: { label: 'Explore Volleyball Tournaments', to: '/tournaments?sport=Volleyball' },
    glow1: 'bg-indigo-500/20',
    glow2: 'bg-blue-500/15',
    accent: 'from-indigo-400 via-blue-300 to-sky-400',
    border: 'border-indigo-500/30',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
    ctaColor: 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/25',
  },
  Basketball: {
    emoji: '🏀',
    badge: 'Basketball Tournaments — Goa',
    heading: (
      <>
        Basketball in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-300 to-rose-400">
          Dribble, Shoot & Dominate.
        </span>
      </>
    ),
    sub: '3×3 and 5×5 basketball tournaments at courts across Goa. Find your next game!',
    cta: { label: 'Explore Basketball Tournaments', to: '/tournaments?sport=Basketball' },
    glow1: 'bg-orange-600/20',
    glow2: 'bg-red-500/15',
    accent: 'from-orange-400 via-red-300 to-rose-400',
    border: 'border-orange-500/30',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    ctaColor: 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/25',
  },
  Futsal: {
    emoji: '🥅',
    badge: 'Futsal Tournaments — Goa',
    heading: (
      <>
        Futsal in Goa.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-green-400">
          Fast-Paced Indoor Football.
        </span>
      </>
    ),
    sub: 'High-energy futsal leagues and cups played at indoor arenas across Goa. Register your 5-a-side team.',
    cta: { label: 'Explore Futsal Tournaments', to: '/tournaments?sport=Futsal' },
    glow1: 'bg-teal-500/20',
    glow2: 'bg-emerald-500/15',
    accent: 'from-teal-400 via-emerald-300 to-green-400',
    border: 'border-teal-500/30',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    ctaColor: 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/25',
  },
};

// Fallback for any sport not in the map above
const DEFAULT_THEME = SPORT_THEMES.All;

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

  const theme = SPORT_THEMES[selectedSport] || DEFAULT_THEME;

  return (
    <div className="space-y-16">
      {/* Live Ticker */}
      <LiveScoreTicker />

      {/* ── Sport Filter Pills — drives the hero banner below ── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {SPORTS_LIST.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSport === sport
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </section>

      {/* ── Sport-Reactive Hero ── */}
      {/* NOTE: uses ONLY CSS gradients + emoji + text — NO organizer banners */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 p-8 sm:p-14 shadow-sm transition-all duration-500">
          {/* Sport-coloured ambient glows */}
          <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full ${theme.glow1} blur-3xl pointer-events-none transition-colors duration-700`} />
          <div className={`absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full ${theme.glow2} blur-3xl pointer-events-none transition-colors duration-700`} />

          {/* Decorative sport emoji — right side, large, faded */}
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] sm:text-[180px] leading-none select-none pointer-events-none opacity-10"
            aria-hidden="true"
          >
            {theme.emoji}
          </div>

          <div className="relative z-10 max-w-4xl space-y-6">
            {/* Sport badge */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${theme.badgeBg} border ${theme.border} ${theme.badgeText} text-xs font-bold tracking-wide uppercase font-mono`}>
              <Flame className="w-4 h-4" />
              {theme.badge}
            </div>

            {/* Heading */}
            <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-slate-900 leading-tight transition-all duration-300">
              {theme.heading}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
              {theme.sub}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={theme.cta.to}
                className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm tracking-wide shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>{theme.cta.label}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/live"
                className="px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-display font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Activity className="w-4 h-4 text-rose-600" />
                <span>Live Match Hub</span>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 max-w-lg">
              <div>
                <p className="font-mono font-black text-2xl text-emerald-700">{tournaments.length || '10'}+</p>
                <p className="text-xs text-slate-500 font-medium">Active Tournaments</p>
              </div>
              <div>
                <p className="font-mono font-black text-2xl text-slate-900">Live</p>
                <p className="text-xs text-slate-500 font-medium">Real-Time Scores</p>
              </div>
              <div>
                <p className="font-mono font-black text-2xl text-teal-700">UPI</p>
                <p className="text-xs text-slate-500 font-medium">QR Payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tournaments Grid ── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900">
              {selectedSport === 'All' ? 'Active Tournaments in Goa' : `${selectedSport} Tournaments in Goa`}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedSport === 'All'
                ? 'Browse all active tournaments across Goa'
                : `Showing all ${selectedSport} tournaments`}
            </p>
          </div>
          <Link
            to="/tournaments"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTournaments.map((t) => (
              <TournamentCard key={t._id} tournament={t} />
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900">No {selectedSport} tournaments listed yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Be the first organizer to host a {selectedSport} tournament in Goa!
            </p>
          </div>
        )}
      </section>

      {/* ── Feature Highlights ── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">Smart Fixture Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-generate knockout brackets, round-robin leagues, and group stages with byes and seeded pairings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">UPI QR Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scan UPI QR codes, upload payment screenshots, and let organizers verify entries via cloud dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">Real-Time WebSockets</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Live score changes broadcasted instantly to spectators and players — no browser refresh needed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
