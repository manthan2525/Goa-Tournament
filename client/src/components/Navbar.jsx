import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Trophy,
  Activity,
  PlusCircle,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Home as HomeIcon,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, isOrganizer, logout } = useAuth();
  const { isConnected } = useSocket();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'ADMIN';
  const avatarUrl = user?.profilePhoto || user?.profileImage;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
              <img
                src="/logo.png"
                alt="GoaSportX Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform flex-shrink-0"
              />
              <div>
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center">
                  Goa<span className="text-amber-500 dark:text-amber-400 font-extrabold">SportX</span>
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block -mt-1">
                  ONE PLATFORM. EVERY SPORT.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/tournaments"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/tournaments')
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/50'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tournaments
              </Link>

              <Link
                to="/live"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive('/live')
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 live-indicator"></span>
                Live Center
              </Link>

              {isAuthenticated && (
                <Link
                  to="/player-dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/player-dashboard')
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/50'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  My Registrations
                </Link>
              )}

              {isOrganizer && (
                <Link
                  to="/organizer-dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/organizer-dashboard')
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Organizer Suite
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 font-bold'
                      : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right Action Area */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
                title={isDark ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>☀️ Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>🌙 Dark</span>
                  </>
                )}
              </button>

              {/* Live Socket Status Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                  isConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                }`}
                title={isConnected ? 'Real-time WebSocket Live' : 'Connecting WebSocket...'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                ></span>
                {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
              </div>

              {/* In-App Notifications Dropdown */}
              {isAuthenticated && <NotificationDropdown />}

              {isOrganizer && (
                <Link
                  to="/create-tournament"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  Host
                </Link>
              )}

              {isAuthenticated ? (
                <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    title="View & Edit Profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 overflow-hidden group-hover:border-emerald-500 transition-colors">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="text-left leading-tight hidden lg:block">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px] group-hover:text-emerald-600 transition-colors">
                        {user?.name}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        {user?.role}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Header Actions */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                title={isDark ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>

              {isAuthenticated && <NotificationDropdown />}

              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
                title={isConnected ? 'Connected' : 'Offline'}
              ></div>

              {isOrganizer && (
                <Link
                  to="/create-tournament"
                  className="p-2 rounded-lg bg-emerald-600 text-white font-bold"
                  title="Create Tournament"
                >
                  <PlusCircle className="w-4 h-4" />
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/98 dark:bg-slate-900/98 border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-lg transition-colors">
            {/* Mobile Theme Toggle Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                Theme: {isDark ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
              </span>
              <button
                onClick={toggleTheme}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
              >
                Switch to {isDark ? 'Light ☀️' : 'Dark 🌙'}
              </button>
            </div>

            <Link
              to="/tournaments"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/tournaments')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Browse Tournaments
            </Link>

            <Link
              to="/live"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                isActive('/live')
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 live-indicator"></span>
              Live Match Center
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/player-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive('/player-dashboard')
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  My Registrations &amp; Verification
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive('/profile')
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  My Profile &amp; Settings
                </Link>
              </>
            )}

            {isOrganizer && (
              <>
                <Link
                  to="/organizer-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive('/organizer-dashboard')
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Organizer Management Suite
                </Link>
                <Link
                  to="/create-tournament"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white text-center"
                >
                  + Host a Tournament
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold bg-rose-600 text-white text-center"
              >
                🛡️ Admin Dashboard
              </Link>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              {isAuthenticated ? (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{user?.name}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">{user?.role}</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-800/50"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-xs"
                  >
                    Join Goa Sports
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around text-[10px] font-medium text-slate-600 dark:text-slate-400 shadow-lg transition-colors">
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            isActive('/') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HomeIcon className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          to="/tournaments"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            isActive('/tournaments') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span>Tournaments</span>
        </Link>

        <Link
          to="/live"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors relative ${
            isActive('/live') ? 'text-rose-600 dark:text-rose-400 font-bold' : 'hover:text-slate-900 dark:hover:text-white text-rose-600/80 dark:text-rose-400/80'
          }`}
        >
          <div className="relative">
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 live-indicator"></span>
          </div>
          <span>Live Center</span>
        </Link>

        {isAuthenticated ? (
          <Link
            to={isAdmin ? '/admin/dashboard' : isOrganizer ? '/organizer-dashboard' : '/player-dashboard'}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              location.pathname.startsWith('/admin') || isActive('/organizer-dashboard') || isActive('/player-dashboard')
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isAdmin ? (
              <ShieldAlert className="w-5 h-5 mb-0.5 text-rose-600 dark:text-rose-400" />
            ) : isOrganizer ? (
              <ShieldCheck className="w-5 h-5 mb-0.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <UserIcon className="w-5 h-5 mb-0.5" />
            )}
            <span>{isAdmin ? 'Admin' : isOrganizer ? 'Suite' : 'My Teams'}</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex flex-col items-center py-1 px-2 rounded-lg hover:text-slate-900 dark:hover:text-white"
          >
            <UserIcon className="w-5 h-5 mb-0.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </>
  );
};

export default Navbar;
