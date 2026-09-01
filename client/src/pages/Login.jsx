import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Mail, Lock, ShieldAlert, ArrowRight, LogIn, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, verifyEmailOtp, resendVerificationOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Unverified Email Verification State
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const redirectPath = location.state?.from?.pathname || '/';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      setSubmitting(true);
      const res = await login(email.trim(), password);
      if (res?.success) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        setRequiresVerification(true);
        setSuccessMessage(err.response.data.message || 'Please enter the 6-digit OTP sent to your email.');
        setCooldown(30);
      } else {
        setError(err.response?.data?.message || err.message || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanOtp = otp.replace(/\D/g, '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await verifyEmailOtp(email.trim().toLowerCase(), cleanOtp);
      if (res?.success) {
        setSuccessMessage('✨ Email verified successfully! Redirecting...');
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setSuccessMessage('');

    try {
      setSubmitting(true);
      const res = await resendVerificationOtp(email.trim().toLowerCase());
      setOtp('');
      setSuccessMessage(res?.message || `A fresh 6-digit verification code has been sent to ${email.trim()}.`);
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-slate-900 dark:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="GoaSportX Logo"
            className="w-14 h-14 object-contain mx-auto"
          />
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            {requiresVerification ? 'Verify Your Email' : (
              <>
                Welcome to Goa<span className="text-amber-500 font-extrabold">SportX</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {requiresVerification ? `Enter the 6-digit code sent to ${email}` : 'One Platform. Every Sport. Every Tournament.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-xl text-slate-900 dark:text-white">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
              <p className="text-[11px] opacity-90 pl-6">
                📩 Please check your <strong>Primary inbox</strong> and <strong>Spam / Junk folder</strong>.
              </p>
            </div>
          )}

          {!requiresVerification ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {submitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    6-Digit Verification OTP *
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
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
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3.5 py-3 bg-white dark:bg-slate-900 border-2 border-emerald-500/50 dark:border-emerald-500/40 rounded-xl text-lg font-mono font-bold tracking-widest text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className="w-full py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Verifying OTP...' : 'Verify & Sign In'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setRequiresVerification(false)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Back to Sign In Form
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Register CTA */}
        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
            Register new player or organizer profile
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
