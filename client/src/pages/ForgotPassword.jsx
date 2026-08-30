import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1 = Request OTP, Step 2 = Verify OTP & Reset Password, Step 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Request 6-digit OTP code
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setStep(2);
        setSuccessMessage(res.data.message || 'OTP code sent to your email address.');
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
        }
        setCooldown(30); // 30 second cooldown before resending
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit numeric OTP code sent to your email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/reset-password-otp', {
        email: email.trim(),
        otp: cleanOtp,
        password,
      });

      if (res.data.success) {
        setStep(3);
        setSuccessMessage('Password reset successfully! Redirecting to sign in...');
        
        // Auto-login or redirect after 2.2 seconds
        setTimeout(() => {
          if (res.data.token && res.data.user) {
            window.location.href = '/';
          } else {
            navigate('/login');
          }
        }, 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Please verify your OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-slate-900 dark:text-white">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="GoaSportX Logo"
              className="w-14 h-14 object-contain mx-auto hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Enter OTP Verification' : 'Password Reset Success'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
            {step === 1
              ? "Enter your registered email address to receive a 6-digit verification OTP code."
              : step === 2
              ? `We sent a 6-digit OTP code to ${email}`
              : "Your password has been updated successfully."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && step !== 3 && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Dev OTP Box */}
        {devOtp && step === 2 && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl text-xs space-y-1 text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Development Testing OTP:</span>
            </div>
            <p className="font-mono font-black text-lg text-slate-900 dark:text-white tracking-widest">
              {devOtp}
            </p>
            <p className="text-[10px] opacity-80">Use this code above to reset your password immediately.</p>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Sending OTP Code...' : 'Send 6-Digit OTP Code'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP Code & Set New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  6-Digit OTP Code *
                </label>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={cooldown > 0 || submitting}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${submitting ? 'animate-spin' : ''}`} />
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-mono font-extrabold tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password (min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Resetting Password...' : 'Verify OTP & Reset Password'}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold underline"
              >
                Change Email
              </button>

              <Link
                to="/login"
                className="font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Password Updated!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your GoaSportX password has been reset successfully. Redirecting you now...
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Sign In Now →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
