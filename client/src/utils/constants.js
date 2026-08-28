export const GOA_LOCATIONS = [
  'All',
  'Panaji',
  'Mapusa',
  'Margao',
  'Vasco da Gama',
  'Porvorim',
  'Ponda',
  'Calangute',
  'Candolim',
  'Bicholim',
  'Curchorem',
  'Mormugao',
];

export const SPORTS_LIST = [
  'All',
  'Football',
  'Cricket',
  'Badminton',
  'Chess',
  'Kabaddi',
  'Table Tennis',
  'Volleyball',
  'Basketball',
  'Futsal',
  'Tennis',
];

export const TOURNAMENT_FORMATS = [
  { value: 'KNOCKOUT', label: 'Single Elimination (Knockout Bracket)', description: 'Teams compete in elimination rounds from Round 1 / QF to Final.' },
  { value: 'ROUND_ROBIN', label: 'Round Robin (League Points Table)', description: 'Every team plays every other team once; top points win.' },
  { value: 'GROUP_KNOCKOUT', label: 'Group Stage + Knockout Finals', description: 'Teams play in groups; top group finishers advance to semi-finals.' },
];

export const STATUS_COLORS = {
  REGISTRATION_OPEN: {
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    label: 'Registration Open',
  },
  REGISTRATION_CLOSED: {
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    label: 'Registration Closed',
  },
  ONGOING: {
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse',
    label: 'Live & Ongoing',
  },
  COMPLETED: {
    badge: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
    label: 'Completed',
  },
  DRAFT: {
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    label: 'Draft',
  },
};

export const PAYMENT_STATUS_COLORS = {
  PENDING: {
    badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    label: 'Pending Verification',
  },
  VERIFIED: {
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    label: 'Verified & Confirmed',
  },
  REJECTED: {
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    label: 'Rejected',
  },
};

export const formatLocation = (loc) => {
  if (!loc) return 'Goa, India';
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object' && loc !== null) {
    return loc.address || (loc.latitude && loc.longitude ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : 'Goa, India');
  }
  return String(loc);
};
