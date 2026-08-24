import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-slate-400">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-rose-400 mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-300">
            This area requires an <span className="font-mono font-bold text-emerald-400">{allowedRoles.join(' or ')}</span> account.
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Logged in as: <span className="font-semibold text-slate-300">{user?.email}</span> ({user?.role})
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
