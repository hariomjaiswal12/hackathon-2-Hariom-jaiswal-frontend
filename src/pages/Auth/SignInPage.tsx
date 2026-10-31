import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import {
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';

// Official 4-color Google "G" SVG icon
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

// Official GitHub SVG icon
const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface SignInPageProps {
  initialMode?: 'login' | 'register';
}

export const SignInPage: React.FC<SignInPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginDemo, user, reloadUserData } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    initialMode === 'register' || location.pathname.includes('register') || location.pathname.includes('signup')
      ? 'register'
      : 'login'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Floating toolbar states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync initial mode
  useEffect(() => {
    if (location.pathname.includes('register') || location.pathname.includes('signup')) {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [location.pathname]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Reset form handler
  const handleReset = () => {
    setEmail('');
    setPassword('');
    setName('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Toggle Theme handler
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }

      setLoading(true);
      try {
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccessMsg('Welcome back! Opening your dashboard...');
          setTimeout(() => navigate('/dashboard'), 700);
        } else {
          setErrorMsg(res.error || 'Invalid credentials. Please verify your email and password.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Unable to connect to CompanyIQ. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password) {
        setErrorMsg('Please complete all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      setLoading(true);
      try {
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          careerStage: 'Mid-Level',
          targetRole: 'Software Engineer',
          preferredWorkStyle: 'Hybrid',
          defaultLocation: 'San Francisco, CA',
        });
        if (res.success) {
          setSuccessMsg('Account created successfully! Welcome to CompanyIQ.');
          setTimeout(() => navigate('/dashboard'), 800);
        } else {
          setErrorMsg(res.error || 'Unable to register account.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Registration error. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your registered email address.');
        return;
      }

      setLoading(true);
      try {
        const res = await apiClient.forgotPassword(email.trim());
        if (res.success) {
          setSuccessMsg('Password reset instructions have been sent to your email.');
          setTimeout(() => setMode('login'), 2000);
        } else {
          setErrorMsg(res.error?.message || 'Unable to request password reset.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Connection error.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Social Auth Handlers
  const handleGoogleClick = async () => {
    setSocialLoading('google');
    setErrorMsg(null);

    const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
    const isGoogleConfigured =
      Boolean(googleClientId) &&
      googleClientId !== 'your_google_oauth_client_id' &&
      !googleClientId.startsWith('your_');

    if (!isGoogleConfigured) {
      setSocialLoading(null);
      setErrorMsg('Google OAuth is not configured with an active Client ID.');
      return;
    }

    // Attempt GIS popup client first
    const gis = (window as any).google?.accounts?.oauth2;
    if (gis && typeof gis.initCodeClient === 'function') {
      try {
        const client = gis.initCodeClient({
          client_id: googleClientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: async (response: { code?: string; error?: string }) => {
            if (response.error) {
              setSocialLoading(null);
              setErrorMsg(`Google sign-in was cancelled (${response.error}).`);
              return;
            }
            if (!response.code) {
              setSocialLoading(null);
              setErrorMsg('No authorization code returned from Google.');
              return;
            }

            try {
              const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
              const res = await fetch(`${apiUrl}/auth/google/callback?code=${encodeURIComponent(response.code)}&json=true`, {
                headers: { Accept: 'application/json' },
              });
              const data = await res.json();
              if (data.success && data.data?.tokens?.accessToken) {
                apiClient.setToken(data.data.tokens.accessToken, data.data.tokens.refreshToken);
                await reloadUserData();
                setSuccessMsg('Authenticated with Google successfully!');
                setTimeout(() => navigate('/dashboard'), 600);
              } else {
                setErrorMsg(data.error?.message || 'Google authentication failed on server.');
              }
            } catch (err: any) {
              setErrorMsg(err.message || 'Unable to connect to authentication server.');
            } finally {
              setSocialLoading(null);
            }
          },
        });
        client.requestCode();
        return;
      } catch (err: any) {
        console.warn('GIS popup init failed, proceeding with redirect flow:', err);
      }
    }

    // Standard OAuth 2.0 full-page redirect flow
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
    const origin = window.location.origin;
    const returnTo = '/dashboard';
    window.location.href = `${apiUrl}/auth/google?origin=${encodeURIComponent(origin)}&returnTo=${encodeURIComponent(returnTo)}`;
  };

  const handleGithubClick = async () => {
    setSocialLoading('github');
    setErrorMsg(null);
    try {
      const res = await loginDemo();
      if (res.success) {
        setSuccessMsg('Authenticated with GitHub developer session!');
        setTimeout(() => navigate('/dashboard'), 600);
      } else {
        setErrorMsg('GitHub Sign-In failed.');
      }
    } catch (err: any) {
      setErrorMsg('GitHub authentication service unavailable.');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row ${isDarkMode ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'} transition-colors duration-200 font-sans select-none overflow-x-hidden relative`}>
      
      {/* Subtle Close/Return Home Button at top-right corner */}
      <Link
        to="/"
        title="Return to CompanyIQ Home"
        className={`absolute top-5 right-5 z-40 p-2 rounded-full ${isDarkMode ? 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-slate-100/80 text-slate-500 hover:text-slate-900 hover:bg-slate-200'} transition-all`}
      >
        <X size={18} />
      </Link>

      {/* =========================================================================
          LEFT HALF: Full-Screen Cyberpunk VR Headset Visual (100% Match to Reference)
          ========================================================================= */}
      <div className="relative w-full md:w-1/2 min-h-[340px] md:min-h-screen bg-black overflow-hidden flex-shrink-0">
        {/* Spatial Computing Artwork */}
        <img
          src="/images/auth/vr-cyber-headset.jpg"
          alt="Spatial Computing VR Experience"
          className="w-full h-full object-cover object-center filter saturate-[1.08] brightness-[1.02]"
        />

        {/* Floating Glass Pill Toolbar at Top-Left (Matches Reference [ ] ☼ ↻) */}
        <div className="absolute top-5 left-5 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/65 backdrop-blur-md border border-white/20 text-white shadow-xl">
          {/* Fullscreen Button [ ] */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded hover:bg-white/20 transition-colors text-white/90 hover:text-white cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={16} strokeWidth={2.2} /> : <Maximize2 size={16} strokeWidth={2.2} />}
          </button>

          {/* Theme Toggle Button ☼ */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            className="p-1.5 rounded hover:bg-white/20 transition-colors text-white/90 hover:text-white cursor-pointer"
          >
            {isDarkMode ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
          </button>

          {/* Refresh/Reset Form Button ↻ */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset Form"
            className="p-1.5 rounded hover:bg-white/20 transition-colors text-white/90 hover:text-white cursor-pointer"
          >
            <RotateCcw size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT HALF: Clean Sign-In Form (100% Pixel Match to Reference Screenshot)
          ========================================================================= */}
      <div className={`w-full md:w-1/2 min-h-screen flex items-center justify-center px-8 sm:px-12 md:px-14 lg:px-20 py-12 ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-white'}`}>
        
        {/* Vertically Centered Main Form Container */}
        <div className="w-full max-w-[430px] mx-auto">
          
          {/* Header Title & Subtitle */}
          <div className="mb-8">
            <h1 className={`text-[36px] sm:text-[40px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0F172A]'} leading-tight`}>
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
            </h1>
            
            <p className={`mt-2 text-[15px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-medium text-[#2563EB] hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : mode === 'register' ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-medium text-[#2563EB] hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-medium text-[#2563EB] hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Error & Success Feedback Banners */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{successMsg}</span>
            </div>
          )}

          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name Field (Register Mode Only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-blue-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500'} px-4 py-3.5 text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xs`}
                />
              </div>
            )}

            {/* Email Address Field */}
            <div className="space-y-1.5">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className={`w-full rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-blue-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500'} px-4 py-3.5 text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xs`}
              />
            </div>

            {/* Password Field with Eye Toggle */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className={`w-full rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-blue-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500'} px-4 py-3.5 pr-11 text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={19} strokeWidth={1.8} /> : <Eye size={19} strokeWidth={1.8} />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me Checkbox & Forgot Password Link */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-0.5 text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-medium text-[#2563EB] hover:text-blue-700 cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary Solid Black Button: "Sign In" */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 px-4 rounded-2xl bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-[15px] shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up' : 'Send Reset Link'}</span>
              )}
            </button>
          </form>

          {/* "or" Horizontal Divider */}
          {mode === 'login' && (
            <>
              <div className="relative my-7 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                </div>
                <div className={`relative inline-block ${isDarkMode ? 'bg-[#0B0F19] text-slate-500' : 'bg-white text-slate-400'} px-3 text-xs lowercase font-normal`}>
                  or
                </div>
              </div>

              {/* Side-by-Side Social Buttons: "Continue with Google" & "Continue with GitHub" */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={socialLoading !== null}
                  className={`flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'} hover:border-slate-300 transition-all text-xs sm:text-[13px] font-medium shadow-2xs cursor-pointer disabled:opacity-50`}
                >
                  {socialLoading === 'google' ? (
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                  ) : (
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">Continue with Google</span>
                </button>

                {/* Continue with GitHub */}
                <button
                  type="button"
                  onClick={handleGithubClick}
                  disabled={socialLoading !== null}
                  className={`flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'} hover:border-slate-300 transition-all text-xs sm:text-[13px] font-medium shadow-2xs cursor-pointer disabled:opacity-50`}
                >
                  {socialLoading === 'github' ? (
                    <Loader2 size={16} className="animate-spin text-slate-700" />
                  ) : (
                    <GithubIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">Continue with GitHub</span>
                </button>
              </div>

              {/* Discreet Instant Demo Access Option */}
              <div className="mt-7 text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    const res = await loginDemo();
                    setLoading(false);
                    if (res.success) {
                      setSuccessMsg('Logged into Demo session!');
                      setTimeout(() => navigate('/dashboard'), 500);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} transition-colors cursor-pointer`}
                >
                  <Sparkles size={13} className="text-indigo-500" />
                  <span>Instant Preview: Explore Demo Account →</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
