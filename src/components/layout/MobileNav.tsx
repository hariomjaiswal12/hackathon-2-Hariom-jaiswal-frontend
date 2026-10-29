import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, ArrowLeftRight, Dna, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { name: 'Home', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore', to: '/explore', icon: Compass },
    { name: 'Compare', to: '/compare', icon: ArrowLeftRight },
    { name: 'Career DNA', to: '/career-dna', icon: Dna },
    { name: 'Profile', to: '/settings', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#26324A] px-2 py-1.5 flex items-center justify-around z-40 select-none shadow-lg transition-colors">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 text-[10px] rounded transition-colors ${
                isActive
                  ? 'text-[#6D4AFF] dark:text-[#8B5CF6] font-bold'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#111936] dark:hover:text-white'
              }`
            }
          >
            <Icon size={18} className="mb-0.5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
