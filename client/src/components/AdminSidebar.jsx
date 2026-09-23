import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Trophy,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/organizers', icon: Building2, label: 'Organizers' },
  { to: '/admin/tournaments', icon: Trophy, label: 'Tournaments' },
  { to: '/admin/registrations', icon: ClipboardList, label: 'Registrations' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/activity', icon: Activity, label: 'Activity Log' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarUrl = user?.profilePhoto || user?.profileImage;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="px-5 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-display font-black text-sm text-slate-900 dark:text-white">Admin Panel</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">GoaSportX</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        {/* Admin Profile */}
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 overflow-hidden flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'A'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold uppercase">ADMIN</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all group"
          >
            <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400" />
            Sign out of Admin
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
