import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Compass,
  ArrowLeftRight,
  Dna,
  Target,
  Sliders,
  Building2,
  Sparkles,
  MessageSquareQuote,
  Bookmark,
  History,
  GitCompare,
  Database,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  LogIn,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar, alerts, savedCompanyIds, savedScenarios, user, openAuthModal } = useApp();
  const unreadAlerts = alerts.filter((a) => a.isNew).length;

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Explore Companies', to: '/explore', icon: Compass },
        { name: 'Compare', to: '/compare', icon: ArrowLeftRight },
      ],
    },
    {
      title: 'PERSONALIZE',
      items: [
        { name: 'Career DNA', to: '/career-dna', icon: Dna },
        { name: 'Career Fit', to: '/career-fit', icon: Target },
        { name: 'What-If Simulator', to: '/what-if', icon: Sliders },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'Company Intelligence', to: '/company/vkaps-it-solutions', icon: Building2 },
        { name: 'Ask CompanyIQ', to: '/ask', icon: Sparkles },
        { name: 'Review Insights', to: '/review-insights', icon: MessageSquareQuote },
      ],
    },
    {
      title: 'MY RESEARCH',
      items: [
        { name: 'Saved Companies', to: '/saved', icon: Bookmark, badge: savedCompanyIds.length > 0 ? String(savedCompanyIds.length) : undefined },
        { name: 'Research History', to: '/history', icon: History },
        { name: 'Saved Comparisons', to: '/saved-comparisons', icon: GitCompare, badge: savedScenarios.length > 0 ? String(savedScenarios.length) : undefined },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Data & Sources', to: '/sources', icon: Database },
        { name: 'Alerts', to: '/alerts', icon: Bell, badge: unreadAlerts > 0 ? String(unreadAlerts) : undefined },
        { name: 'Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`hidden md:flex bg-[#0C1222] dark:bg-[#080D1C] text-[#94A3B8] flex-col shrink-0 transition-all duration-300 select-none z-30 border-r border-[#1E293B] dark:border-[#1E293B] ${
        isSidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Brand logo header */}
      <div className="h-[60px] px-4 flex items-center justify-between border-b border-[#1E293B] dark:border-[#1E293B]">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 text-white no-underline">
          <div className="w-7 h-7 rounded-[4px] bg-[#373D91] flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            <Layers size={16} />
          </div>
          {!isSidebarCollapsed && (
            <span className="font-bold text-[16px] tracking-tight text-white">
              Company<span className="text-[#818CF8]">IQ</span>
            </span>
          )}
        </NavLink>
      </div>

      {/* Nav items list */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            {!isSidebarCollapsed && (
              <h3 className="px-2.5 mb-1.5 text-[10px] font-bold text-[#475569] tracking-wider uppercase">
                {section.title}
              </h3>
            )}
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={isSidebarCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-[13px] transition-colors relative group ${
                        isActive
                          ? 'bg-[#1E293B] text-white font-medium border-l-2 border-[#818CF8]'
                          : 'text-[#94A3B8] hover:bg-[#151E33] hover:text-[#E2E8F0]'
                      } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span className="text-[10px] bg-[#1E293B] text-[#94A3B8] px-1.5 py-0.2 rounded font-medium">
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed tooltip */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-[72px] bg-[#0F172A] text-white text-[12px] px-2 py-1 rounded shadow-lg whitespace-nowrap hidden group-hover:block z-50 border border-[#334155] pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User profile / bottom actions */}
      <div className="p-3 border-t border-[#1E293B] space-y-2">
        {user ? (
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[4px] hover:bg-[#1E293B] transition-colors group text-left cursor-pointer"
            title={isSidebarCollapsed ? `${user.name} (${user.email})` : 'Account settings'}
          >
            <div className="w-6 h-6 rounded-full bg-[#373D91] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden text-left flex-1 min-w-0">
                <span className="text-[12px] font-medium text-white block truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#64748B] block truncate">
                  {user.email}
                </span>
              </div>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 bg-[#373D91] hover:bg-[#2C317A] text-white rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer shadow-xs ${
              isSidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title={isSidebarCollapsed ? 'Sign In / Register' : undefined}
          >
            <LogIn size={14} className="shrink-0" />
            {!isSidebarCollapsed && <span>Sign In</span>}
          </button>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-[11px] text-[#64748B] hover:text-[#CBD5E1] hover:bg-[#151E33] rounded-[4px] transition-colors cursor-pointer"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

