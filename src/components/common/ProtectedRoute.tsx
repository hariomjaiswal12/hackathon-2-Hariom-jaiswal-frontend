import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, LogIn, Compass, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  title = 'Authentication Required',
  description = 'Sign in or create an account to access your personalized preferences, saved shortlists, and research history.',
}) => {
  const { isAuthenticated, isLoadingAuth, openAuthModal } = useApp();

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <Loader2 className="w-8 h-8 text-[#373D91] dark:text-[#8B5CF6] animate-spin mb-3" />
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#EEF0F9] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] flex items-center justify-center text-[#373D91] dark:text-[#A78BFA] mb-4 shadow-sm">
          <Lock size={24} />
        </div>
        <h2 className="text-[20px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-2">
          {title}
        </h2>
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-6">
          {description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={openAuthModal}
            className="w-full sm:w-auto px-6 py-2.5 gap-2"
          >
            <LogIn size={15} />
            <span>Sign In / Register</span>
          </Button>

          <Link to="/explore">
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto px-6 py-2.5 gap-2"
            >
              <Compass size={15} />
              <span>Explore Real Companies</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

