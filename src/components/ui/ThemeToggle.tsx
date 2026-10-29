import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 'md' }) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] bg-white dark:bg-[#131C31] text-[#5A6A85] dark:text-[#CBD5E1] hover:text-[#111936] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#18223A] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/40 ${
        size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
      } ${className}`}
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Sun Icon */}
      <Sun
        size={size === 'sm' ? 15 : 17}
        className={`absolute transform transition-all duration-300 ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100 text-[#D97706]'
        }`}
      />

      {/* Moon Icon */}
      <Moon
        size={size === 'sm' ? 15 : 17}
        className={`absolute transform transition-all duration-300 ${
          isDark
            ? 'rotate-0 scale-100 opacity-100 text-[#8B5CF6]'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
};

