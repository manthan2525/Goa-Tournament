import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  User,
  Mail,
  Lock,
  Phone,
  Building,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, verifyEmailOtp, resendVerificationOtp } = useAuth();
  const navigate = useNavigate();

  // Registration Form State
  const [step, setStep] = useState(1); // 1 = Registration Details, 2 = Verify Email OTP
  const [role, setRole] = useState('PLAYER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [location, setLocation] = useState('Panaji, Goa');
  const [avatarFile, setAvatarFile] = useState(null);

  // OTP Verification State
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  // Step 1: Submit Registration Details
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name || !email || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('role', role);
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password);
      formData.append('phone', phone.trim());
      formData.append('location', location);

      if (role === 'ORGANIZER') {
        formData.append('organizationName', organizationName.trim());
      }

      if (avatarFile) {
        formData.append('profileImage', avatarFile);
      }

      const res = await register(formData);

      if (res?.requiresVerification || res?.success) {
        setStep(2);
        setSuccessMessage(res?.message || `A 6-digit verification code has been sent to ${email.trim()}.`);
        setCooldown(30);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify 6-Digit Email OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanOtp = otp.replace(/\D/g, '').trim();

    if (!cleanOtp) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (cleanOtp.length !== 6) {
      setError('OTP code must be exactly 6 digits.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await verifyEmailOtp(email.trim().toLowerCase(), cleanOtp);

      if (res?.success) {
        setSuccessMessage('✨ Email verified successfully! Redirecting to your dashboard...');
        setTimeout(() => {
          navigate(role === 'ORGANIZER' ? '/organizer-dashboard' : '/tournaments');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify OTP code. Please check and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend 6-Digit Verification OTP
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
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="GoaSportX Logo"
            className="w-14 h-14 object-contain mx-auto"
          />
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            {step === 1 ? (
              <>
                Join Goa<span className="text-amber-500 font-extrabold">SportX</span>
              </>
            ) : (
              'Verify Email Address'
            )}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {step === 1
              ? 'One Platform. Every Sport. Every Tournament.'
              : `We sent a 6-digit OTP verification code to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-xl text-slate-900 dark:text-white">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
              <p className="text-[11px] opacity-90 pl-6">
                📩 Please check your <strong>Primary inbox</strong> and <strong>Spam / Junk folder</strong> for an email from GoaSportX.
              </p>
            </div>
          )}

          {/* STEP 1: Registration Details */}
          {step === 1 && (
            <>
              {/* Role Toggle Selector */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setRole('PLAYER')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'PLAYER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Player / Team</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ORGANIZER')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'ORGANIZER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Host / Organizer</span>
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohit Fernandes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {role === 'ORGANIZER' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Club / Sports Association Name *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Panaji Sports Association"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98221 XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Profile Avatar Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {submitting ? 'Creating Profile & Sending OTP...' : 'Register & Verify Email'}
                </button>
              </form>
            </>
          )}

          {/* STEP 2: Verify 6-Digit Email OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    6-Digit Verification OTP Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || submitting}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${submitting ? 'animate-spin' : ''}`} />
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP Code'}
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
                <span>{submitting ? 'Verifying OTP...' : 'Verify Email & Activate Account'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email / Back to Registration</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
