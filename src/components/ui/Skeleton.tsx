import React from 'react';

interface SkeletonProps {
  className?: string;
  type?: 'card' | 'chart' | 'text' | 'chat';
  subtitle?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  type = 'card',
  subtitle = 'CompanyIQ is analyzing available evidence...',
}) => {
  return (
    <div className={`bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 animate-pulse ${className}`}>
      {type === 'card' && (
        <div className="space-y-3">
          <div className="h-4 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-full"></div>
          <div className="h-3 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-5/6"></div>
          <div className="h-3 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-2/3"></div>
        </div>
      )}

      {type === 'chart' && (
        <div className="space-y-4">
          <div className="h-4 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-1/4 mb-3"></div>
          <div className="flex items-end gap-3 h-28 pt-4">
            <div className="h-16 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-1/4"></div>
            <div className="h-24 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-1/4"></div>
            <div className="h-12 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-1/4"></div>
            <div className="h-20 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-1/4"></div>
          </div>
        </div>
      )}

      {type === 'text' && (
        <div className="space-y-2">
          <div className="h-3 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-full"></div>
          <div className="h-3 bg-[#F1F5F9] dark:bg-[#1E293B] rounded w-4/5"></div>
        </div>
      )}

      {subtitle && (
        <div className="mt-4 pt-3 border-t border-[#F8FAFC] dark:border-[#1E293B]">
          <p className="text-[11px] text-[#94A3B8] italic">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

