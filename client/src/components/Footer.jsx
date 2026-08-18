import React from 'react';
import { Trophy, MapPin, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                GOA<span className="text-emerald-400">TOURNAMENT</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering Goa's sports community with real-time tournament brackets, automated scheduling, UPI QR payments, and instant live scoreboards.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <MapPin className="w-3.5 h-3.5" />
              <span>Panaji • Mapusa • Margao • Vasco</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
              Explore Tournaments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/tournaments?sport=Football" className="hover:text-emerald-400 transition-colors">
                  Football Tournaments
                </Link>
              </li>
              <li>
                <Link to="/tournaments?sport=Cricket" className="hover:text-emerald-400 transition-colors">
                  Cricket Leagues
                </Link>
              </li>
              <li>
                <Link to="/tournaments?sport=Badminton" className="hover:text-emerald-400 transition-colors">
                  Badminton Opens
                </Link>
              </li>
              <li>
                <Link to="/tournaments?sport=Kabaddi" className="hover:text-emerald-400 transition-colors">
                  Kabaddi Championships
                </Link>
              </li>
              <li>
                <Link to="/live" className="hover:text-emerald-400 transition-colors">
                  Live Match Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Goa Venues */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
              Key Goa Venues
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">Tilak Maidan Stadium (Vasco)</li>
              <li className="text-slate-400">Campal Indoor Complex (Panaji)</li>
              <li className="text-slate-400">Peddem Sports Complex (Mapusa)</li>
              <li className="text-slate-400">Fatorda Multipurpose (Margao)</li>
              <li className="text-slate-400">Duler Stadium (Mapusa)</li>
            </ul>
          </div>

          {/* System & MCA Info */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
              Platform Architecture
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Engine:</span>
                <span className="text-emerald-400 font-mono">React + Vite + Socket.IO</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Backend:</span>
                <span className="text-teal-400 font-mono">Node.js / Express / Mongo</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Auth & Payments:</span>
                <span className="text-amber-400 font-mono">JWT + QR Cloudinary</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                Master of Computer Applications (MCA) Capstone Platform
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Goa Tournament Engine. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Goa's Multi-Sport Athletes & Organizers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
