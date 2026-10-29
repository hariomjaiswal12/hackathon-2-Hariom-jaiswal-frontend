import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CompanyIQ ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] dark:bg-[#3B1219] text-[#EF4444] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-2">
              {this.props.fallbackTitle || 'Unable to load this section'}
            </h2>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-6">
              An error occurred while loading this view. You can reload the page or return to the overview dashboard.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#373D91] hover:bg-[#2C3175] text-white text-[13px] font-medium rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} /> Reload
              </button>
              <a
                href="/dashboard"
                className="px-4 py-2 border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#14213D] dark:text-[#F8FAFC] text-[13px] font-medium rounded-[4px] flex items-center gap-2 transition-colors no-underline"
              >
                <Home size={14} /> Overview
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

