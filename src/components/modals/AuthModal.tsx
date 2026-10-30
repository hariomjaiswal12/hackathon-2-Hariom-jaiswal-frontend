import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Loader2,
  Maximize2,
  Sun,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { apiClient } from '../../services/apiClient';

// Official Google "G" 4-color branding SVG icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalInitialError,
    login,
    loginDemo,
    loginGoogle,
    register,
    user,
    logout,
  } = useApp();

  // Mode: login, register, forgot-password, reset-password
  const [mode, setMode] = useState<AuthMode>('login');

  // Form states - completely empty by default (no hardcoded credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [careerStage, setCareerStage] = useState('Fresher');
  const [targetRole, setTargetRole] = useState('Backend Developer');
  const [preferredWorkStyle, setPreferredWorkStyle] = useState('Hybrid');
  const [defaultLocation, setDefaultLocation] = useState('Bangalore, India');

  // Password reset specific states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Google OAuth states & integration
  const [googleLoading, setGoogleLoading] = useState(false);
  const [officialGoogleReady, setOfficialGoogleReady] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const gisInitializedFor = useRef('');
  const loginGoogleRef = useRef(loginGoogle);
  const closeAuthModalRef = useRef(closeAuthModal);
  const navigateRef = useRef(navigate);
  loginGoogleRef.current = loginGoogle;
  closeAuthModalRef.current = closeAuthModal;
  navigateRef.current = navigate;
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const isGoogleConfigured =
    Boolean(googleClientId) &&
    googleClientId !== 'your_google_oauth_client_id' &&
    !googleClientId.startsWith('your_');

  // Initialize Google Identity Services once per open modal, and render a single official button.
  useEffect(() => {
    if (!isAuthModalOpen || (mode !== 'login' && mode !== 'register') || !isGoogleConfigured) {
      setOfficialGoogleReady(false);
      return;
    }

    let cancelled = false;
    let timer = 0;

    const mountOfficialButton = () => {
      const gis = (window as any).google?.accounts?.id;
      const container = googleBtnContainerRef.current;
      if (!gis || !container) return false;

      container.replaceChildren();
      if (gisInitializedFor.current !== googleClientId) {
        gis.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              setErrorMsg('Google did not return an authentication credential.');
              return;
            }
            setGoogleLoading(true);
            setErrorMsg(null);
            try {
              const res = await loginGoogleRef.current(response.credential);
              if (res.success) {
                setSuccessMsg('Authenticated with Google successfully! Opening dashboard...');
                setTimeout(() => {
                  closeAuthModalRef.current();
                  navigateRef.current('/dashboard');
                }, 600);
              } else {
                setErrorMsg(res.error || 'Google authentication failed.');
              }
            } catch (err: any) {
              setErrorMsg(err.message || 'Unable to reach the CompanyIQ API. Please try again shortly.');
            } finally {
              setGoogleLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        gisInitializedFor.current = googleClientId;
      }
      gis.renderButton(container, {
        theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
        size: 'large',
        width: Math.max(container.clientWidth, 320),
        text: mode === 'register' ? 'signup_with' : 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
      if (!cancelled) setOfficialGoogleReady(true);
      return true;
    };

    if (!mountOfficialButton()) {
      let attempts = 0;
      timer = window.setInterval(() => {
        attempts += 1;
        if (mountOfficialButton() || attempts >= 25) window.clearInterval(timer);
      }, 200);
    }

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      googleBtnContainerRef.current?.replaceChildren();
      setOfficialGoogleReady(false);
    };
  }, [isAuthModalOpen, mode, isGoogleConfigured, googleClientId]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const originalError = console.error.bind(console);
    const originalLog = console.log.bind(console);
    const report = (...args: unknown[]) => {
      const text = args.map((item) => (typeof item === 'string' ? item : '')).join(' ');
      if (text.includes('origin is not allowed') || text.includes('origin_mismatch')) {
        setGoogleLoading(false);
        setErrorMsg(
          `Google blocked sign-in for ${window.location.origin}. Add that exact origin, with no path or trailing slash, under Authorized JavaScript origins for this Web client, then reload.`
        );
      }
    };
    console.error = (...args: unknown[]) => {
      report(...args);
      originalError(...args);
    };
    console.log = (...args: unknown[]) => {
      report(...args);
      originalLog(...args);
    };
    return () => {
      console.error = originalError as typeof console.error;
      console.log = originalLog as typeof console.log;
    };
  }, [isAuthModalOpen]);

  const handleCustomGoogleClick = () => {
    if (!isGoogleConfigured) {
      setErrorMsg(
        'Google Sign-In requires an active Google OAuth Client ID. Please configure VITE_GOOGLE_CLIENT_ID in h2frontend/.env (refer to docs/google-oauth-setup.md).'
      );
      return;
    }

    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      setGoogleLoading(true);
      (window as any).google.accounts.id.prompt((notification: any) => {
        setGoogleLoading(false);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.() || 'Prompt closed';
          console.log('[Google GIS] Prompt status:', reason);
        }
      });
    } else {
      setErrorMsg('Google Identity Services is initializing. Please try again in a moment.');
    }
  };

  // Clear fields and errors whenever modal is opened or closed
  useEffect(() => {
    if (!isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setFieldErrors({});
      setSuccessMsg(null);
      setShowPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setMode('login');
    } else if (authModalInitialError) {
      setErrorMsg(authModalInitialError);
    }
  }, [isAuthModalOpen, authModalInitialError]);

  if (!isAuthModalOpen) return null;

  // Validation helpers
  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg(null);
    setFieldErrors({});
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});
    setSuccessMsg(null);

    const errors: Record<string, string> = {};

    if (mode === 'login') {
      if (!email.trim()) {
        errors.email = 'Email address is required';
      } else if (!validateEmail(email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!password) {
        errors.password = 'Password is required';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setLoading(true);
      try {
        const result = await login(email.trim(), password);
        if (result.success) {
          setSuccessMsg('Signed in successfully! Opening dashboard...');
          setTimeout(() => {
            closeAuthModal();
            navigate('/dashboard');
          }, 600);
        } else {
          setErrorMsg(result.error || 'Invalid email or password. Please verify your credentials.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication error. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'register') {
      if (!name.trim()) {
        errors.name = 'Full name is required';
      }
      if (!email.trim()) {
        errors.email = 'Email address is required';
      } else if (!validateEmail(email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setLoading(true);
      try {
        const result = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          careerStage,
          targetRole: targetRole.trim() || 'Software Engineer',
          preferredWorkStyle,
          defaultLocation,
        });
        if (result.success) {
          setSuccessMsg('Account created successfully! Welcome to CompanyIQ.');
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        } else {
          setErrorMsg(result.error || 'Registration failed. An account with this email may already exist.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Registration error. Please check connection.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        errors.email = 'Email address is required';
      } else if (!validateEmail(email)) {
        errors.email = 'Please enter a valid email address';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setLoading(true);
      try {
        const res = await apiClient.forgotPassword(email.trim());
        if (res.success) {
          const msg = res.data?.message || 'If an account exists, password reset instructions have been sent.';
          setSuccessMsg(msg);
          // If in development/test environment, a token is provided directly
          if (res.data?.resetToken) {
            setResetToken(res.data.resetToken);
            setTimeout(() => {
              setMode('reset');
            }, 1200);
          }
        } else {
          setErrorMsg(res.error?.message || 'Unable to process password reset request.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Connection error.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'reset') {
      if (!resetToken.trim()) {
        errors.resetToken = 'Reset token is required';
      }
      if (!newPassword) {
        errors.newPassword = 'New password is required';
      } else if (newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters long';
      }
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setLoading(true);
      try {
        const res = await apiClient.resetPassword(resetToken.trim(), newPassword);
        if (res.success) {
          setSuccessMsg('Password has been successfully updated! You can now sign in.');
          setTimeout(() => {
            handleModeSwitch('login');
          }, 1400);
        } else {
          setErrorMsg(res.error?.message || 'Invalid or expired reset token. Please request a new one.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Connection error.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Dedicated demo login handler: securely requests server demo session without exposing passwords in client
  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    setFieldErrors({});
    try {
      const res = await loginDemo();
      if (res.success) {
        setSuccessMsg('Signed in to demo session successfully! Opening dashboard...');
        setTimeout(() => {
          closeAuthModal();
          navigate('/dashboard');
        }, 600);
      } else {
        setErrorMsg(
          res.error?.includes('connect') || res.error?.includes('Failed')
            ? 'The CompanyIQ API is unreachable. Please try again shortly.'
            : res.error || 'Failed to authenticate demo session.'
        );
      }
    } catch (err: any) {
      setErrorMsg(
        'Unable to connect to the CompanyIQ backend or database. Please check that the server is online.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Outer Card Container */}
      <div className={`w-full ${user ? 'max-w-md p-6' : 'max-w-4xl'} bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row transition-all`}>
        
        {/* Close Button in Modal */}
        <button
          onClick={closeAuthModal}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 z-30 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Authenticated User View */}
        {user ? (
          <div className="w-full space-y-4">
            <div className="text-center mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#373D91] to-[#6D4AFF] dark:from-[#6D4AFF] dark:to-[#8B5CF6] text-white mx-auto flex items-center justify-center font-bold text-[18px] mb-2.5 shadow-md">
                IQ
              </div>
              <h2 id="auth-modal-title" className="text-[20px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Your Profile
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                Currently signed in as {user.name} ({user.email})
              </p>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-xl text-[13px] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#26324A]">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Account Status</span>
                {user.isDemoUser ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={12} /> Demo Session
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck size={12} /> Authenticated
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Name:</span>
                <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Email:</span>
                <span className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Target Role:</span>
                <span className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{user.targetRole || 'Software Engineer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Career Stage:</span>
                <span className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{user.careerStage || 'Fresher'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                className="w-full justify-center"
                onClick={closeAuthModal}
              >
                Close
              </Button>
              <Button
                variant="danger"
                size="md"
                className="w-full justify-center"
                onClick={async () => {
                  await logout();
                  closeAuthModal();
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: Cyberpunk VR Headset Visual Showcase (Hidden on small mobile) */}
            <div className="hidden md:block md:w-1/2 relative bg-black shrink-0 overflow-hidden select-none min-h-[580px]">
              <img
                src="/images/auth/vr-cyber-headset.jpg"
                alt="Spatial Computing Cyberpunk VR Visual"
                className="w-full h-full object-cover object-center filter saturate-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Floating Glass Pill Toolbar (Matches Reference Image top-left: [ ] ☼ ↻) */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/65 backdrop-blur-md border border-white/15 text-white/90 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    } else {
                      document.exitFullscreen().catch(() => {});
                    }
                  }}
                  title="Fullscreen"
                  className="p-1 rounded hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <Maximize2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    document.documentElement.classList.toggle('dark');
                  }}
                  title="Toggle Theme"
                  className="p-1 rounded hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <Sun size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setPassword('');
                    setName('');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  title="Reset Form"
                  className="p-1 rounded hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Authentication Form (Matches Reference Screenshot) */}
            <div className="w-full md:w-1/2 p-7 sm:p-9 md:p-10 flex flex-col justify-center">
              
              {/* Header Title & Subtitle */}
              <div className="mb-6">
                <h2 id="auth-modal-title" className="text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-tight">
                  {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'New Password'}
                </h2>
                
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                  {mode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('register')}
                        className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer transition-colors"
                      >
                        Sign up
                      </button>
                    </>
                  ) : mode === 'register' ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('login')}
                        className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer transition-colors"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Remember your password?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('login')}
                        className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer transition-colors"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-start gap-2.5 animate-in fade-in"
                >
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="flex-1 leading-snug">{errorMsg}</span>
                </div>
              )}

              {/* Success Message Alert */}
              {successMsg && (
                <div
                  role="status"
                  className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 animate-in fade-in"
                >
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="flex-1 leading-snug font-medium">{successMsg}</span>
                </div>
              )}

              {/* Form Body */}
              <form id="auth-form" onSubmit={handleSubmit} noValidate className="space-y-4">
                
                {/* Full Name for Registration */}
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                    />
                  </div>
                )}

                {/* Email Address */}
                {mode !== 'reset' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      disabled={loading}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-xs"
                    />
                  </div>
                )}

                {/* Password Input with Eye Visibility Toggle */}
                {(mode === 'login' || mode === 'register') && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=""
                        disabled={loading}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Options Row: Remember Me & Forgot Password */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between pt-0.5 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-slate-600 dark:text-slate-300">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot')}
                      className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Primary Action Button: Solid Black Button Matching Reference */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-[15px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Update Password'}
                    </span>
                  )}
                </button>
              </form>

              {/* Social Logins (Google & GitHub) */}
              {(mode === 'login' || mode === 'register') && (
                <>
                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative inline-block bg-white dark:bg-[#0F172A] px-3 text-xs lowercase font-normal text-slate-400">
                      or
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Google Sign In */}
                    <button
                      type="button"
                      onClick={handleCustomGoogleClick}
                      disabled={loading || googleLoading}
                      className="flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 transition-all text-xs sm:text-[13px] font-medium shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {googleLoading ? (
                        <Loader2 size={15} className="animate-spin text-blue-600" />
                      ) : (
                        <GoogleIcon className="w-4 h-4 shrink-0" />
                      )}
                      <span className="truncate">Continue with Google</span>
                    </button>

                    {/* GitHub Sign In */}
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      disabled={loading}
                      className="flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 transition-all text-xs sm:text-[13px] font-medium shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span className="truncate">Continue with GitHub</span>
                    </button>
                  </div>

                  {/* Demo Quick Access */}
                  <div className="mt-5 text-center">
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer py-1"
                    >
                      <Sparkles size={13} className="text-indigo-500" />
                      <span>Instant Preview: Explore with Demo Account →</span>
                    </button>
                  </div>
                </>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};