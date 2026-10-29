import React from 'react';
import { useApp } from '../../context/AppContext';

interface ScoreGaugeProps {
  score: number; // 0-100
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  subtext?: string;
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label = 'Career Fit',
  size = 90,
  strokeWidth = 6,
  color,
  subtext,
  className = '',
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const defaultRingColor = isDark ? '#8B5CF6' : '#7547CB';
  const ringColor = color || defaultRingColor;
  const trackColor = isDark ? '#1E293B' : '#EAE6F8';

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="transition-colors duration-200"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[20px] font-bold text-[#111936] dark:text-[#F8FAFC] leading-none tracking-tight">
            {score}%
          </span>
          {label && (
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">
              {label}
            </span>
          )}
        </div>
      </div>

      {subtext && (
        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1.5 font-medium text-center">
          {subtext}
        </span>
      )}
    </div>
  );
};
