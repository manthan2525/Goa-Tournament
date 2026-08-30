import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Zap,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import TournamentCard from '../components/TournamentCard';
import SportLiveCard from '../components/SportLiveCard';
import LiveScoreTicker from '../components/LiveScoreTicker';
import { SPORTS_LIST } from '../utils/constants';

// Per-sport hero theme definitions (NO banner images, ONLY pure Tailwind gradients + icons)
const SPORT_HERO_THEMES = {
  Football: {
    badge: '⚡ Goa Premier Football Hub',
    heading: 'Dominate the Football Pitch Across Goa',
    sub: 'From Panaji turf leagues to Margao floodlit tournaments — register squads, track live scores, and manage tournament brackets in real-time.',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    glow1: 'from-emerald-500/20 to-teal-500/20',
    glow2: 'from-green-600/15 to-emerald-400/15',
    emoji: '⚽',
    cta: { label: 'Explore Football Tournaments', to: '/tournaments?sport=Football' },
  },
  Cricket: {
    badge: '🏏 Goa T20 & Box Cricket Circuit',
    heading: 'Step Up to the Crease — Live Ball-by-Ball Coverage',
    sub: 'Tennis ball tourneys, leather ball trophies, and night box cricket championships across Mapusa, Vasco, and South Goa grounds.',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-950/40',
    badgeText: 'text-amber-800 dark:text-amber-400',
    border: 'border-amber-500/30',
    glow1: 'from-amber-500/20 to-orange-500/20',
    glow2: 'from-yellow-600/15 to-amber-400/15',
    emoji: '🏏',
    cta: { label: 'Explore Cricket Tournaments', to: '/tournaments?sport=Cricket' },
  },
  Badminton: {
    badge: '🏸 Indoor Badminton Championships',
    heading: 'Smash Your Way to Glory Across Indoor Courts',
    sub: 'Singles, doubles, and mixed category tournaments with real-time set point tracking and verified player entries.',
    badgeBg: 'bg-teal-500/10 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-500/30',
    glow1: 'from-teal-500/20 to-cyan-500/20',
    glow2: 'from-emerald-600/15 to-teal-400/15',
    emoji: '🏸',
    cta: { label: 'Explore Badminton Tournaments', to: '/tournaments?sport=Badminton' },
  },
  Chess: {
    badge: '♟️ FIDE & Open Chess Battles',
    heading: 'Outsmart Opponents on Goa’s Premier Chess Stage',
    sub: 'Rapid, Blitz, and Classical tournaments. Track round standings, FIDE rating categories, and tournament prize pools.',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/30',
    glow1: 'from-purple-500/20 to-indigo-500/20',
    glow2: 'from-violet-600/15 to-purple-400/15',
    emoji: '♟️',
    cta: { label: 'Explore Chess Tournaments', to: '/tournaments?sport=Chess' },
  },
  Futsal: {
    badge: '⚽ Fast-Paced 5v5 Futsal Action',
    heading: 'High-Octane Turf Battles & Futsal Trophies',
    sub: 'Under floodlights across Panaji, Calangute, and Margao turfs. Instant automated knockout brackets and quick squad entries.',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    glow1: 'from-emerald-500/20 to-lime-500/20',
    glow2: 'from-green-600/15 to-emerald-400/15',
    emoji: '⚡',
    cta: { label: 'Explore Futsal Tournaments', to: '/tournaments?sport=Futsal' },
  },
  Volleyball: {
    badge: '🏐 Beach & Indoor Volleyball',
    heading: 'Spike, Serve & Conquere Goa’s Sand & Hardcourts',
    sub: 'Beach volleyball classics at Calangute and indoor state tournaments with real-time set updates.',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/30',
    glow1: 'from-blue-500/20 to-cyan-500/20',
    glow2: 'from-sky-600/15 to-blue-400/15',
    emoji: '🏐',
    cta: { label: 'Explore Volleyball Tournaments', to: '/tournaments?sport=Volleyball' },
  },
  Basketball: {
    badge: '🏀 3v3 & Full-Court Hoops',
    heading: 'Dominate the Hardwood Across Goa Courts',
    sub: 'Street 3v3 jams and inter-club championships with live quarter scoring and instant team rankings.',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-500/30',
    glow1: 'from-orange-500/20 to-red-500/20',
    glow2: 'from-amber-600/15 to-orange-400/15',
    emoji: '🏀',
    cta: { label: 'Explore Basketball Tournaments', to: '/tournaments?sport=Basketball' },
  },
  'Table Tennis': {
    badge: '🏓 Table Tennis Open Circuit',
    heading: 'Lightning-Fast Rally Battles & Ranked Matches',
    sub: 'State rankers and open category tournaments with verified match schedules and live score updates.',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/30',
    glow1: 'from-rose-500/20 to-pink-500/20',
    glow2: 'from-red-600/15 to-rose-400/15',
    emoji: '🏓',
    cta: { label: 'Explore Table Tennis Tournaments', to: '/tournaments?sport=Table%20Tennis' },
  },
  Tennis: {
    badge: '🎾 Grass, Clay & Hardcourt Tennis',
    heading: 'Game, Set & Match Across Goa’s Finest Clubs',
    sub: 'Singles and doubles championships. Live game point tracking and verified registration entry.',
    badgeBg: 'bg-lime-500/10 dark:bg-lime-950/40',
    badgeText: 'text-lime-700 dark:text-lime-400',
    border: 'border-lime-500/30',
    glow1: 'from-lime-500/20 to-emerald-500/20',
    glow2: 'from-green-600/15 to-lime-400/15',
    emoji: '🎾',
    cta: { label: 'Explore Tennis Tournaments', to: '/tournaments?sport=Tennis' },
  },
  Kabaddi: {
    badge: '🤼 Pro Kabaddi & Open Raids',
    heading: 'Raid, Tackle & Win Goa’s Kabaddi Titles',
    sub: 'High-intensity mats and village tournaments with real-time raid point trackers and squad lists.',
    badgeBg: 'bg-red-500/10 dark:bg-red-950/40',
    badgeText: 'text-red-700 dark:text-red-400',
    border: 'border-red-500/30',
    glow1: 'from-red-500/20 to-orange-500/20',
    glow2: 'from-rose-600/15 to-red-400/15',
    emoji: '🤼',
    cta: { label: 'Explore Kabaddi Tournaments', to: '/tournaments?sport=Kabaddi' },
  },
  All: {
    badge: '🏆 GoaSportX',
    heading: 'GoaSportX — One Platform. Every Sport. Every Tournament.',
    sub: 'Discover, host, and play Football, Cricket, Badminton, Futsal, Chess & more across Panaji, Mapusa, Margao, Vasco, and all Goa venues.',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    glow1: 'from-emerald-500/20 to-teal-500/20',
    glow2: 'from-teal-600/15 to-cyan-400/15',
    emoji: '🏆',
    cta: { label: 'Browse All Tournaments', to: '/tournaments' },
  },
};

const Home = () => {
  const [selectedSport, setSelectedSport] = useState('All');
  const [tournaments, setTournaments] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournamentsRes, liveRes] = await Promise.all([
          api.get('/tournaments?limit=12'),
          api.get('/matches/live'),
        ]);

        if (tournamentsRes.data.success) {
          setTournaments(tournamentsRes.data.tournaments);
        }
        if (liveRes.data.success) {
          setLiveMatches(liveRes.data.matches);
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTournaments =
    selectedSport === 'All'
      ? tournaments
      : tournaments.filter(
          (t) => t.sport?.toLowerCase() === selectedSport.toLowerCase()
        );

  const theme = SPORT_HERO_THEMES[selectedSport] || SPORT_HERO_THEMES.All;

  return (
    <div className="space-y-6 sm:space-y-8 pb-2 text-slate-900 dark:text-white">
      {/* ── Live Score Ticker Bar (if live matches exist) ── */}
      <LiveScoreTicker liveMatches={liveMatches} />

      {/* ── Hero Banner ── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-14 shadow-sm transition-all duration-500 text-slate-900 dark:text-white">
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

            {/* Heading */}
            <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-slate-900 dark:text-white leading-tight transition-all duration-300">
              {theme.heading}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
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
                className="px-7 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-display font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Live Match Hub</span>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800 max-w-lg">
              <div>
                <p className="font-mono font-black text-2xl text-emerald-700 dark:text-emerald-400">{tournaments.length || '10'}+</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Tournaments</p>
              </div>
              <div>
                <p className="font-mono font-black text-2xl text-slate-900 dark:text-white">Live</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-Time Scores</p>
              </div>
              <div>
                <p className="font-mono font-black text-2xl text-teal-700 dark:text-teal-400">UPI</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">QR Payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tournaments Grid ── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              {selectedSport === 'All' ? 'Active Tournaments in Goa' : `${selectedSport} Tournaments in Goa`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedSport === 'All'
                ? 'Browse all active tournaments across Goa'
                : `Showing all ${selectedSport} tournaments`}
            </p>
          </div>
          <Link
            to="/tournaments"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTournaments.map((t) => (
              <TournamentCard key={t._id} tournament={t} />
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-xs text-slate-900 dark:text-white">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white">No {selectedSport} tournaments listed yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Be the first organizer to host a {selectedSport} tournament in Goa!
            </p>
          </div>
        )}
      </section>

      {/* ── Feature Highlights ── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Smart Fixture Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Auto-generate knockout brackets, round-robin leagues, and group stages with byes and seeded pairings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 flex items-center justify-center text-teal-700 dark:text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">UPI QR Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Scan UPI QR codes, upload payment screenshots, and let organizers verify entries via cloud dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center text-rose-700 dark:text-rose-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Real-Time WebSockets</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Live score changes broadcasted instantly to spectators and players — no browser refresh needed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
