import React from 'react';
import { Trophy, Mail, Phone, MessageCircle, Instagram, Facebook, Youtube, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────
// CONFIGURABLE CONTACT & SOCIAL INFO
// ─────────────────────────────────────────────
const CONTACT = {
  email: 'support@goatournament.com',
  phone: '+91 XXXXXXXXXX',
  whatsapp: '+91 8605477064',
};

const SOCIAL = {
  instagram: 'https://www.instagram.com/__manthan25__?igsi=MXVvM3J4ZWwxbWRtdA==',
  facebook:  null,
  youtube:   null,
};
// ─────────────────────────────────────────────

const Footer = () => {
  const hasSocial = Object.values(SOCIAL).some(Boolean);

  return (
    <footer className="bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm mt-20 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
                <Trophy className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <span className="font-display font-black text-lg text-slate-900 dark:text-white tracking-tight">
                GOA<span className="text-emerald-600 dark:text-emerald-400">TOURNAMENT</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
              Discover, register, and manage sports tournaments across Goa.
              Real-time fixtures, live scores, and UPI payments — all in one platform.
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
              Multi-Sport Arena Platform
            </p>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  All Tournaments
                </Link>
              </li>
              <li>
                <Link to="/tournaments?sport=Football" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Football
                </Link>
              </li>
              <li>
                <Link to="/tournaments?sport=Cricket" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Cricket
                </Link>
              </li>
              <li>
                <Link to="/tournaments?sport=Badminton" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Badminton
                </Link>
              </li>
              <li>
                <Link to="/tournaments?sport=Kabaddi" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Kabaddi
                </Link>
              </li>
              <li>
                <Link to="/live" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                  Live Matches
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-widest mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-start gap-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 group-hover:text-emerald-700" />
                  <span className="break-all">{CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 group-hover:text-emerald-700" />
                  <span>{CONTACT.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 group-hover:text-emerald-700" />
                  <span>WhatsApp Us</span>
                </a>
              </li>
            </ul>
          </div>

          {/* ── Social / Account ── */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-widest mb-4">
              {hasSocial ? 'Follow Us' : 'Your Account'}
            </h4>

            {hasSocial ? (
              <ul className="space-y-2.5 text-xs">
                {SOCIAL.instagram && (
                  <li>
                    <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
                      <Instagram className="w-3.5 h-3.5 text-pink-600 group-hover:text-emerald-600" />
                      Instagram
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  </li>
                )}
                {SOCIAL.facebook && (
                  <li>
                    <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
                      <Facebook className="w-3.5 h-3.5 text-blue-600 group-hover:text-emerald-600" />
                      Facebook
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  </li>
                )}
                {SOCIAL.youtube && (
                  <li>
                    <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
                      <Youtube className="w-3.5 h-3.5 text-rose-600 group-hover:text-emerald-600" />
                      YouTube
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Sign In</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Create Account</Link>
                </li>
                <li>
                  <Link to="/player-dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">My Registrations</Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">My Profile</Link>
                </li>
              </ul>
            )}
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Goa Tournament. All rights reserved.</p>
          <p className="text-slate-500 dark:text-slate-400 text-center">
            Made for Goa's athletes, teams &amp; organizers.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
