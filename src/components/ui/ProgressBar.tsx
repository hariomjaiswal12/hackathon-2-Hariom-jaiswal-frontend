import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string; // hex or tailwind class
  height?: number;
  showValue?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = '#373D91',
  height = 6,
  showValue = false,
  label,
  className = '',
  animated = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1 text-[12px]">
          {label && <span className="text-[#111936] dark:text-[#F8FAFC] font-medium">{label}</span>}
          {showValue && <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold">{value}</span>}
        </div>
      )}
      <div
        className="w-full bg-[#E2E8F0] dark:bg-[#1E293B] rounded-[3px] overflow-hidden transition-colors"
        style={{ height: `${height}px` }}
      >
        <div
          className={`h-full rounded-[3px] ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};
