import React from 'react';
import { ConfidenceLevel } from '../../types';

interface BadgeProps {
  variant?: 'confidence' | 'status' | 'category' | 'role' | 'tag';
  level?: ConfidenceLevel;
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'confidence',
  level,
  text,
  size = 'md',
  className = '',
  children,
}) => {
  const content = text || children;

  let colorClasses = 'bg-[#F1F5F9] dark:bg-[#131C31] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#26324A]';

  if (level === 'high') {
    colorClasses = 'bg-[#EBF8F2] dark:bg-[#22C55E]/15 text-[#177454] dark:text-[#22C55E] border-[#BCE8D3] dark:border-[#22C55E]/30';
  } else if (level === 'mixed' || level === 'conflict' || level === 'stale') {
    colorClasses = 'bg-[#FEF7EE] dark:bg-[#F59E0B]/15 text-[#9A6417] dark:text-[#F59E0B] border-[#F7E1C5] dark:border-[#F59E0B]/30';
  } else if (level === 'insufficient' || level === 'low') {
    colorClasses = 'bg-[#FDF2F2] dark:bg-[#EF4444]/15 text-[#B64348] dark:text-[#EF4444] border-[#F9D2D2] dark:border-[#EF4444]/30';
  } else if (variant === 'status') {
    if (typeof content === 'string' && (content.includes('Verified') || content.includes('Supported'))) {
      colorClasses = 'bg-[#EBF8F2] dark:bg-[#22C55E]/15 text-[#177454] dark:text-[#22C55E] border-[#BCE8D3] dark:border-[#22C55E]/30';
    } else if (typeof content === 'string' && (content.includes('Mixed') || content.includes('Stale') || content.includes('refresh'))) {
      colorClasses = 'bg-[#FEF7EE] dark:bg-[#F59E0B]/15 text-[#9A6417] dark:text-[#F59E0B] border-[#F7E1C5] dark:border-[#F59E0B]/30';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-[12px]';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-[4px] border border-solid transition-colors ${sizeClasses} ${colorClasses} ${className}`}
    >
      {content}
    </span>
  );
};
