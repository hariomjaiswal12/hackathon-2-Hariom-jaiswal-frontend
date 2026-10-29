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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[10px] shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 text-[#64748B] dark:text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC] p-1 rounded-sm transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#373D91] to-[#6D4AFF] dark:from-[#6D4AFF] dark:to-[#8B5CF6] text-white mx-auto flex items-center justify-center font-bold text-[18px] mb-2.5 shadow-md">
            IQ
          </div>
          <h2 id="auth-modal-title" className="text-[20px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
            {user
              ? 'Your Profile'
              : mode === 'login'
              ? 'Sign in to CompanyIQ'
              : mode === 'register'
              ? 'Create your account'
              : mode === 'forgot'
              ? 'Reset your password'
              : 'Set new password'}
          </h2>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            {user
              ? `Currently signed in as ${user.name} (${user.email})`
              : mode === 'login'
              ? 'Access verified company intelligence, Career DNA, and alerts.'
              : mode === 'register'
              ? 'Join to track verified company hiring, culture scores, and executive insights.'
              : mode === 'forgot'
              ? 'Enter your registered email to receive a password reset link.'
              : 'Enter your verification token and your new password.'}
          </p>
        </div>

        {/* Authenticated User View */}
        {user ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] text-[13px] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#26324A]">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Account Status</span>
                {user.isDemoUser ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                    <Sparkles size={12} /> Demo Session
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
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

            <div className="flex items-center gap-2 pt-1">
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
            {/* Mode Tabs for Login / Register */}
            {(mode === 'login' || mode === 'register') && (
              <div role="tablist" aria-label="Authentication Options" className="flex border-b border-[#E2E8F0] dark:border-[#26324A] mb-5">
                <button
                  type="button"
                  role="tab"
                  id="tab-login"
                  aria-selected={mode === 'login'}
                  aria-controls="auth-form"
                  onClick={() => handleModeSwitch('login')}
                  className={`flex-1 pb-2.5 text-[13px] font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'border-[#373D91] dark:border-[#8B5CF6] text-[#373D91] dark:text-[#8B5CF6]'
                      : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-register"
                  aria-selected={mode === 'register'}
                  aria-controls="auth-form"
                  onClick={() => handleModeSwitch('register')}
                  className={`flex-1 pb-2.5 text-[13px] font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                    mode === 'register'
                      ? 'border-[#373D91] dark:border-[#8B5CF6] text-[#373D91] dark:text-[#8B5CF6]'
                      : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            {/* Back button for Forgot / Reset Password */}
            {(mode === 'forgot' || mode === 'reset') && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#373D91] dark:text-[#8B5CF6] hover:underline cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-[6px] flex items-start gap-2 text-[12px] text-red-700 dark:text-red-300"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div
                role="status"
                className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-[6px] flex items-start gap-2 text-[12px] text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* Main Form */}
            <form id="auth-form" onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {/* Register: Full Name */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-name" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="e.g. Alex Morgan"
                      disabled={loading}
                      className={`w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none transition-colors ${
                        fieldErrors.name
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#8B5CF6]'
                      }`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.name}</p>
                  )}
                </div>
              )}

              {/* Register: Career Stage & Work Style */}
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="auth-career-stage" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                      Career Stage
                    </label>
                    <select
                      id="auth-career-stage"
                      value={careerStage}
                      onChange={(e) => setCareerStage(e.target.value)}
                      disabled={loading}
                      className="w-full px-2.5 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-[12px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
                    >
                      <option value="Student">Student</option>
                      <option value="Fresher">Fresher (0-1 yrs)</option>
                      <option value="1-2 years">Early Career (1-3 yrs)</option>
                      <option value="3+ years">Mid-Senior (3+ yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="auth-work-style" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                      Work Style
                    </label>
                    <select
                      id="auth-work-style"
                      value={preferredWorkStyle}
                      onChange={(e) => setPreferredWorkStyle(e.target.value)}
                      disabled={loading}
                      className="w-full px-2.5 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-[12px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Register: Target Role */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-target-role" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                    Target Role
                  </label>
                  <div className="relative">
                    <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      id="auth-target-role"
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Full Stack Engineer"
                      disabled={loading}
                      className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>
              )}

              {/* Email Address Field (Login, Register, Forgot) */}
              {mode !== 'reset' && (
                <div>
                  <label htmlFor="auth-email" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="you@example.com"
                      disabled={loading}
                      className={`w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none transition-colors ${
                        fieldErrors.email
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#8B5CF6]'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              )}

              {/* Password Field (Login, Register) */}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="auth-password" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">
                      Password <span className="text-red-500">*</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('forgot')}
                        className="text-[11px] text-[#373D91] dark:text-[#8B5CF6] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      placeholder="Enter your password"
                      disabled={loading}
                      className={`w-full pl-9 pr-10 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none transition-colors ${
                        fieldErrors.password
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#8B5CF6]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
                </div>
              )}

              {/* Reset Password Form Fields */}
              {mode === 'reset' && (
                <>
                  <div>
                    <label htmlFor="auth-reset-token" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                      Reset Token <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        id="auth-reset-token"
                        type="text"
                        value={resetToken}
                        onChange={(e) => {
                          setResetToken(e.target.value);
                          if (fieldErrors.resetToken) setFieldErrors((prev) => ({ ...prev, resetToken: '' }));
                        }}
                        placeholder="Paste verification token"
                        disabled={loading}
                        className={`w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[12px] font-mono text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none transition-colors ${
                          fieldErrors.resetToken
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#8B5CF6]'
                        }`}
                      />
                    </div>
                    {fieldErrors.resetToken && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.resetToken}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="auth-new-password" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        id="auth-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
                        }}
                        placeholder="Enter new password (min 6 characters)"
                        disabled={loading}
                        className={`w-full pl-9 pr-10 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none transition-colors ${
                          fieldErrors.newPassword
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#8B5CF6]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {fieldErrors.newPassword && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="auth-confirm-password" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        id="auth-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }}
                        placeholder="Re-enter new password"
                        disabled={loading}
                        className={`w-full pl-9 pr-10 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none transition-colors ${
                          fieldErrors.confirmPassword
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#8B5CF6]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full justify-center mt-3"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                  ? 'Create Account'
                  : mode === 'forgot'
                  ? 'Send Reset Link'
                  : 'Update Password'}
              </Button>
            </form>

            {/* Google OAuth 2.0 Sign-In Section */}
            {(mode === 'login' || mode === 'register') && (
              <div className="mt-4">
                {/* Divider */}
                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E2E8F0] dark:border-[#26324A]" />
                  </div>
                  <span className="relative bg-white dark:bg-[#0F172A] px-2 text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium">
                    or continue with
                  </span>
                </div>

                {/* One Google button: the official GIS button when it is available, otherwise the styled fallback. */}
                <div
                  ref={googleBtnContainerRef}
                  className={`w-full flex justify-center ${officialGoogleReady ? '' : 'hidden'}`}
                />
                {!officialGoogleReady && (
                  <button
                    type="button"
                    onClick={handleCustomGoogleClick}
                    disabled={loading || googleLoading}
                    aria-label={mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}
                    className="w-full py-2.5 px-4 bg-white dark:bg-[#131C31] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#14213D] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#334155] rounded-[6px] text-[13px] font-semibold flex items-center justify-center gap-2.5 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/40"
                  >
                    {googleLoading ? (
                      <Loader2 size={16} className="animate-spin text-[#6D4AFF]" />
                    ) : (
                      <GoogleIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                    )}
                    <span>
                      {googleLoading
                        ? 'Connecting to Google...'
                        : mode === 'register'
                        ? 'Sign up with Google'
                        : 'Continue with Google'}
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Dedicated Demo Login Section (Only visible in Sign In mode) */}
            {mode === 'login' && (
              <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#26324A]">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-3 bg-[#EEF0F9] dark:bg-[#1E293B] hover:bg-[#E0E4F5] dark:hover:bg-[#2A3B5C] text-[#373D91] dark:text-[#A78BFA] border border-[#CBD5E1] dark:border-[#334155] rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={14} className="text-[#373D91] dark:text-[#A78BFA]" />
                  <span>Explore with Demo Account</span>
                </button>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] text-center mt-1.5">
                  Instant preview access with sample career preferences. No password required.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};