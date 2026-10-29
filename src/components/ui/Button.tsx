import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ai' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[#373D91] hover:bg-[#2C317A] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white rounded-[6px] border border-transparent shadow-xs';
      break;
    case 'ai':
      variantClasses =
        'bg-[#6D4AFF] hover:bg-[#5E3DE0] dark:bg-[#8B5CF6] dark:hover:bg-[#7C4EE4] text-white rounded-[6px] border border-transparent shadow-xs';
      break;
    case 'outline':
      variantClasses =
        'bg-white dark:bg-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] text-[#111936] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#26324A] hover:border-[#CBD5E1] dark:hover:border-[#34415C] rounded-[6px] shadow-2xs';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#131C31] text-[#111936] dark:text-[#F8FAFC] rounded-[6px]';
      break;
    case 'danger':
      variantClasses =
        'bg-[#B64348] hover:bg-[#9B363B] dark:bg-[#EF4444] dark:hover:bg-[#DC2626] text-white rounded-[6px]';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'text-[12px] px-2.5 py-1.5 gap-1.5';
      break;
    case 'md':
      sizeClasses = 'text-[13px] px-3.5 py-2 gap-2 leading-tight';
      break;
    case 'lg':
      sizeClasses = 'text-[14px] px-4 py-2.5 gap-2';
      break;
  }

  return (
    <button className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} disabled={disabled} {...props}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
