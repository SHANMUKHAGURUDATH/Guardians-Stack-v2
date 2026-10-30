import React, { useState, useEffect } from 'react';
import {
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Users,
  FileCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { EMAIL_REGEX, VALIDATION_LIMITS } from '../types/accountFeatures';
import { firebaseConfig } from '../firebase';

type AuthView = 'login' | 'register' | 'forgot' | 'reset-code';

export const AuthPortal: React.FC = () => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    sendPasswordReset,
    confirmResetWithCode,
    enterDemoMode,
    emailProviderSetupRequired,
    clearEmailProviderNotice,
  } = useAuth();
  const { notify } = useToast();

  const [view, setView] = useState<AuthView>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSentEmail, setResetSentEmail] = useState<string | null>(null);

  // Automatically pick up ?oobCode=... from password reset link if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const code = params.get('oobCode');
    if (mode === 'resetPassword' && code) {
      setResetCode(code);
      setView('reset-code');
    }
  }, []);

  const switchView = (next: AuthView) => {
    setView(next);
    setFormError(null);
    setResetSentEmail(null);
  };

  // Password strength calculation (0-4)
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: 'Enter password', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-cyan-500' };
    return { score: 4, label: 'Very Strong', color: 'bg-emerald-500' };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!EMAIL_REGEX.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password, rememberMe);
      notify('success', 'Signed In Successfully', 'Welcome back to Guardian Stack.');
    } catch (err: any) {
      const msg = err?.message || 'Unable to sign in.';
      setFormError(msg);
      notify('error', 'Sign-In Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2 || trimmedName.length > VALIDATION_LIMITS.DISPLAY_NAME_MAX) {
      setFormError('Please enter your full name (2–100 characters).');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setFormError('Password must contain at least one letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithEmail(trimmedName, trimmedEmail, password);
      notify(
        'success',
        'Account Created',
        `Verification link sent to ${trimmedEmail}. Welcome to Guardian Stack!`
      );
    } catch (err: any) {
      const msg = err?.message || 'Registration failed.';
      setFormError(msg);
      notify('error', 'Registration Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle(rememberMe);
      notify('success', 'Authenticated with Google', 'Cloud vault & family records synced.');
    } catch (err: any) {
      const msg = err?.message || 'Google sign-in failed.';
      setFormError(msg);
      notify('error', 'Google Sign-In Issue', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!EMAIL_REGEX.test(email.trim())) {
      setFormError('Please enter the email address associated with your account.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setResetSentEmail(email.trim());
      notify(
        'success',
        'Password Reset Email Dispatched',
        `Check ${email.trim()} for instructions to reset your password.`
      );
    } catch (err: any) {
      const msg = err?.message || 'Failed to send password reset email.';
      setFormError(msg);
      notify('error', 'Password Reset Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!resetCode.trim()) {
      setFormError('Please enter the password reset action code from your email link.');
      return;
    }
    if (newResetPassword.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmResetWithCode(resetCode.trim(), newResetPassword);
      notify('success', 'Password Reset Complete', 'You can now sign in with your new password.');
      // Clean URL params if any
      if (window.location.search.includes('oobCode')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setPassword('');
      switchView('login');
    } catch (err: any) {
      const msg = err?.message || 'Invalid or expired reset code.';
      setFormError(msg);
      notify('error', 'Reset Code Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchDemo = () => {
    enterDemoMode();
    notify(
      'info',
      'Demo Mode Activated',
      'Signed in as Aarav Mehta (Demo). All modules and CRUD actions are unlocked.'
    );
  };

  const pwdStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Minimal Brand Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  GUARDIAN STACK
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">
                Actuarial Intelligence &amp; Family Protection Platform
              </p>
            </div>
          </div>

          <button
            onClick={handleLaunchDemo}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quick Demo Access</span>
          </button>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Platform Value & Demo Mode Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Trust Identity &amp; Family Vault Protection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Enterprise Insurance Intelligence &amp; Family Protection Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Sign in or create an account to access your 51-field actuarial HLV dashboard,
                manage family members and policy nominees with 100% allocation safeguards,
                customize account security settings, and track support requests.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Users className="w-4 h-4" />
                  <span>Family &amp; Nominee Registry</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Maintain individual family profiles and enforce verified 100% beneficiary share
                  limits across every policy.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <FileCheck className="w-4 h-4" />
                  <span>Actuarial HLV &amp; Vault</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Dynamic Human Life Value modeling, ML risk clusters, medical underwriting
                  passports, and PDF advisory reports.
                </p>
              </div>
            </div>

            {/* Interactive Demo Mode Launch Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/60 shadow-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Instant Sandbox
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2">
                    Explore Immediately in Interactive Demo Mode
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Test all five new modules and every existing actuarial dashboard immediately
                    with pre-configured family, nominee, and support records—no registration
                    required.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Continue in Demo Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
              {/* Mode Switch Tabs (Sign In vs Create Account) */}
              {(view === 'login' || view === 'register') && (
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-850 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      view === 'login'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchView('register')}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      view === 'register'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Firebase Email/Password Provider Setup Walkthrough if triggered */}
              {emailProviderSetupRequired && (
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-700/70 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2 text-amber-300 font-bold">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Enable Email/Password Provider in Firebase Console</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearEmailProviderNotice}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                  <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1">
                    <li>
                      Open Firebase Console for project{' '}
                      <code className="px-1 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">
                        {firebaseConfig.projectId}
                      </code>
                      .
                    </li>
                    <li>
                      Navigate to <strong>Authentication → Sign-in method</strong>.
                    </li>
                    <li>
                      Click <strong>Email/Password</strong>, toggle <strong>Enable</strong>, and
                      click <strong>Save</strong>.
                    </li>
                  </ol>
                  <p className="text-[11px] text-amber-200/90">
                    Tip: <strong>Google Sign-In</strong> and <strong>Demo Mode</strong> are active
                    right now without additional setup.
                  </p>
                </div>
              )}

              {/* Form Error Alert */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* VIEW 1: LOGIN */}
              {view === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      Sign In to Your Account
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Access your protected actuarial workspace and family vault.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => switchView('forgot')}
                          className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-850 text-cyan-500 focus:ring-cyan-500"
                        />
                        <span>Keep session signed in on this device</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In Securely</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      Or Continue With
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Sign In with Google (Verified Cloud Sync)</span>
                  </button>
                </form>
              )}

              {/* VIEW 2: REGISTER */}
              {view === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      Create Policyholder Account
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Register with your name, email, and strong password.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Legal Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Priya Nair"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          maxLength={VALIDATION_LIMITS.EMAIL_MAX}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="priya.nair@example.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 8 characters with letters & numbers"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {password && (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex gap-1 h-1.5">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`flex-1 rounded-full ${
                                  pwdStrength.score >= step ? pwdStrength.color : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Password strength: <strong className="text-slate-200">{pwdStrength.label}</strong>
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Sign Up Instantly with Google</span>
                  </button>
                </form>
              )}

              {/* VIEW 3: FORGOT PASSWORD */}
              {view === 'forgot' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <KeyRound className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-base font-bold text-slate-100">Reset Your Password</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      ← Back to Sign In
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Enter your registered email address and we will send you a secure password
                    reset link.
                  </p>

                  {resetSentEmail ? (
                    <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 space-y-3 text-xs">
                      <div className="flex items-start space-x-2 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Reset Instructions Sent</p>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            If an account exists for <strong>{resetSentEmail}</strong>, a password
                            reset email has been dispatched. Check your inbox and spam folder.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => switchView('reset-code')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-[11px]"
                        >
                          Enter Reset Code Manually
                        </button>
                        <button
                          type="button"
                          onClick={() => switchView('login')}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px]"
                        >
                          Return to Sign In
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Account Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>Send Password Reset Link</span>
                        )}
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => switchView('reset-code')}
                          className="text-[11px] text-slate-400 hover:text-cyan-400 underline"
                        >
                          Already have a password reset action code? Complete reset here
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* VIEW 4: COMPLETE RESET WITH ACTION CODE */}
              {view === 'reset-code' && (
                <form onSubmit={handleConfirmResetCode} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-100">Set New Password</h2>
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      ← Sign In
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Reset Action Code (oobCode)
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Paste code from reset link"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Confirm New Password</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Guardian Stack Insurance Intelligence Platform • Protected Access</span>
          <span>Firebase Zero-Trust Security • End-to-End Session Isolation</span>
        </div>
      </footer>
    </div>
  );
};
