import React from 'react';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'CompanyIQ AI is temporarily unavailable.',
  description = 'Your saved research is still available. Try again in a moment.',
  onRetry,
  retryText = 'Try again',
  className = '',
}) => {
  return (
    <div className={`p-6 bg-[#FDF2F2] dark:bg-[#2A1515] border border-[#F9D2D2] dark:border-[#522525] rounded-[6px] text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1111] border border-[#F9D2D2] dark:border-[#522525] flex items-center justify-center text-[#B64348] dark:text-[#EF4444] mb-3">
        <AlertCircle size={20} />
      </div>
      <h3 className="text-[15px] font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-1">{title}</h3>
      <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] max-w-sm mb-4 leading-relaxed">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-[#F9D2D2] dark:border-[#522525]">
          {retryText}
        </Button>
      )}
    </div>
  );
};

