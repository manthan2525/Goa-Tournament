// Centralized Sport Logos & Themes Utility for Goa Tournament Application
// Maps sport categories to clean vector SVG icons and adaptive card headers.
// Used for Home page, listing cards, Live Center, and dashboards.

export const sportLogos = {
  football: '/assets/sports/football.svg',
  cricket: '/assets/sports/cricket.svg',
  badminton: '/assets/sports/badminton.svg',
  chess: '/assets/sports/chess.svg',
  kabaddi: '/assets/sports/kabaddi.svg',
  'table tennis': '/assets/sports/table-tennis.svg',
  tabletennis: '/assets/sports/table-tennis.svg',
  volleyball: '/assets/sports/volleyball.svg',
  basketball: '/assets/sports/basketball.svg',
  futsal: '/assets/sports/futsal.svg',
  tennis: '/assets/sports/tennis.svg',
  default: '/assets/sports/default.svg',
};

// Sport theme configurations for rich visual card headers in Light & Dark mode
export const sportThemes = {
  football: {
    gradient: 'from-emerald-600 via-teal-600 to-green-700 dark:from-emerald-950 dark:via-teal-900 dark:to-slate-900',
    accent: 'emerald',
    iconColor: 'text-emerald-300 dark:text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    label: 'FOOTBALL',
    emoji: '⚽',
  },
  cricket: {
    gradient: 'from-amber-600 via-yellow-600 to-orange-700 dark:from-amber-950 dark:via-amber-900 dark:to-slate-900',
    accent: 'amber',
    iconColor: 'text-amber-300 dark:text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    label: 'CRICKET',
    emoji: '🏏',
  },
  badminton: {
    gradient: 'from-blue-600 via-sky-600 to-indigo-700 dark:from-blue-950 dark:via-sky-900 dark:to-slate-900',
    accent: 'blue',
    iconColor: 'text-blue-300 dark:text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    label: 'BADMINTON',
    emoji: '🏸',
  },
  chess: {
    gradient: 'from-slate-700 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950',
    accent: 'slate',
    iconColor: 'text-slate-300 dark:text-slate-200',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    label: 'CHESS',
    emoji: '♟️',
  },
  kabaddi: {
    gradient: 'from-rose-600 via-red-600 to-orange-700 dark:from-rose-950 dark:via-red-900 dark:to-slate-900',
    accent: 'rose',
    iconColor: 'text-rose-300 dark:text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    label: 'KABADDI',
    emoji: '🤼',
  },
  'table tennis': {
    gradient: 'from-teal-600 via-cyan-600 to-emerald-700 dark:from-teal-950 dark:via-cyan-900 dark:to-slate-900',
    accent: 'teal',
    iconColor: 'text-teal-300 dark:text-teal-400',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    label: 'TABLE TENNIS',
    emoji: '🏓',
  },
  volleyball: {
    gradient: 'from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-950 dark:via-purple-900 dark:to-slate-900',
    accent: 'violet',
    iconColor: 'text-violet-300 dark:text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    label: 'VOLLEYBALL',
    emoji: '🏐',
  },
  basketball: {
    gradient: 'from-orange-600 via-amber-600 to-red-700 dark:from-orange-950 dark:via-amber-900 dark:to-slate-900',
    accent: 'orange',
    iconColor: 'text-orange-300 dark:text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    label: 'BASKETBALL',
    emoji: '🏀',
  },
  futsal: {
    gradient: 'from-emerald-700 via-teal-700 to-cyan-800 dark:from-emerald-950 dark:via-teal-950 dark:to-slate-900',
    accent: 'emerald',
    iconColor: 'text-emerald-300 dark:text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    label: 'FUTSAL',
    emoji: '⚽',
  },
  tennis: {
    gradient: 'from-lime-600 via-emerald-600 to-green-700 dark:from-lime-950 dark:via-emerald-900 dark:to-slate-900',
    accent: 'lime',
    iconColor: 'text-lime-300 dark:text-lime-400',
    badge: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    label: 'TENNIS',
    emoji: '🎾',
  },
  default: {
    gradient: 'from-emerald-600 via-teal-600 to-slate-800 dark:from-emerald-950 dark:via-teal-950 dark:to-slate-950',
    accent: 'emerald',
    iconColor: 'text-emerald-300 dark:text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    label: 'SPORTS',
    emoji: '🏆',
  },
};

/**
 * Returns the transparent SVG sport logo path for a given sport name.
 * Handles capitalization safely (e.g. Football, football, FOOTBALL).
 * NEVER falls back to tournament.banner.
 *
 * @param {string} sportName Sport category
 * @returns {string} Path to SVG logo file
 */
export const getSportLogo = (sportName) => {
  if (!sportName || typeof sportName !== 'string') {
    return sportLogos.default;
  }
  const normalized = sportName.trim().toLowerCase();
  return sportLogos[normalized] || sportLogos.default;
};

/**
 * Returns theme configuration (gradients, badge colors, emojis) for a sport category.
 *
 * @param {string} sportName Sport category
 * @returns {Object} Theme details
 */
export const getSportTheme = (sportName) => {
  if (!sportName || typeof sportName !== 'string') {
    return sportThemes.default;
  }
  const normalized = sportName.trim().toLowerCase();
  return sportThemes[normalized] || sportThemes.default;
};

export default getSportLogo;
