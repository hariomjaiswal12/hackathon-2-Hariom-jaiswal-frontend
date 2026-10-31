import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, loadAppData, openAuthModal } = useApp();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const error = searchParams.get('error');
      const message = searchParams.get('message');
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const returnTo = searchParams.get('returnTo') || '/dashboard';

      // 1. Handle explicit error from Google or backend
      if (error) {
        setStatus('error');
        if (error === 'access_denied') {
          setErrorMessage('Google authentication was cancelled.');
        } else if (error === 'ACCOUNT_EXISTS_WITH_PASSWORD') {
          setErrorMessage(
            'An account with this email already exists using password authentication. Please sign in with your email and password.'
          );
        } else {
          setErrorMessage(message || error || 'Google authentication failed. Please try again.');
        }
        return;
      }

      // 2. Handle missing token
      if (!token) {
        setStatus('error');
        setErrorMessage('No authentication token received from Google callback.');
        return;
      }

      // 3. Store tokens and hydrate session
      try {
        apiClient.setToken(token, refreshToken || undefined);
        const userRes = await apiClient.getMe();
        if (userRes.success && userRes.data) {
          setUser(userRes.data);
          setIsAuthenticated(true);
          // Background app data hydration
          loadAppData().catch(() => {});

          setStatus('success');
          // Smooth transition to target route
          setTimeout(() => {
            navigate(returnTo, { replace: true });
          }, 400);
        } else {
          setStatus('error');
          setErrorMessage('Failed to retrieve user profile after Google sign-in.');
          apiClient.clearToken();
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Unable to establish authenticated session.');
        apiClient.clearToken();
      }
    };

    processCallback();
  }, [searchParams, navigate, setUser, setIsAuthenticated, loadAppData]);

  return (
    <div className="min-h-screen bg-[#080D1C] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white mx-auto flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
          IQ
        </div>

        {/* State: Processing */}
        {status === 'processing' && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Authenticating with Google
            </h2>
            <p className="text-sm text-slate-400">
              Verifying your Google credentials and preparing your CompanyIQ workspace...
            </p>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Authentication Successful
            </h2>
            <p className="text-sm text-slate-400">
              Welcome back! Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {/* State: Error */}
        {status === 'error' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Sign-In Incomplete
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigate('/');
                  setTimeout(() => openAuthModal(), 100);
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>Try Signing In Again</span>
                <ArrowRight size={15} />
              </button>

              <Link
                to="/"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
              >
                Return to Home Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
