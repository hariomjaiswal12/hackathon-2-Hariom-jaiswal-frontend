import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-center ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] flex items-center justify-center text-[#5A6A85] dark:text-[#94A3B8] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-1.5">{title}</h3>
      <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

