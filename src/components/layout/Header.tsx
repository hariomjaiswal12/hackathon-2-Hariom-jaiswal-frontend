import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Bell, HelpCircle, X } from 'lucide-react';
import { Company } from '../../types';
import { companyService } from '../../services/companyService';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  actionSlot?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ actionSlot }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, alerts, user, openAuthModal } = useApp();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const unreadAlerts = alerts.filter((a) => a.isNew).length;

  // Derive breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return ['Overview'];
    if (path === '/explore') return ['Explore Companies'];
    if (path.startsWith('/company/')) {
      const parts = path.split('/');
      const companyId = parts[2];
      const company = companyService.getCompanyById(companyId);
      const name = company ? company.name : 'Company';
      if (parts[3] === 'category') {
        const cat = parts[4];
        return ['Explore', company?.shortName || name, cat.charAt(0).toUpperCase() + cat.slice(1)];
      }
      return ['Explore', company?.shortName || name];
    }
    if (path === '/career-dna') return ['Career DNA', 'Your profile'];
    if (path === '/career-dna/build') return ['Career DNA', 'Build profile'];
    if (path === '/career-fit') return ['Career Fit'];
    if (path === '/compare') return ['Compare'];
    if (path === '/compare/battle') return ['Compare', 'Battle'];
    if (path === '/what-if') return ['What-If Simulator'];
    if (path === '/ask') return ['Ask CompanyIQ'];
    if (path === '/review-insights') return ['Review Insights'];
    if (path === '/saved') return ['My Research', 'Saved Companies'];
    if (path === '/saved-comparisons') return ['My Research', 'Saved Comparisons'];
    if (path === '/history') return ['My Research', 'History'];
    if (path === '/sources') return ['Data & Sources'];
    if (path === '/alerts') return ['Alerts'];
    if (path === '/settings') return ['Settings'];
    if (path === '/design-system') return ['System', 'Design System & UI Kit'];
    return ['CompanyIQ'];
  };

  const breadcrumbs = getBreadcrumbs();

  // Search results
  const [searchResults, setSearchResults] = useState<Company[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const local = companyService.getCompanies().filter(
      (c) => c.name.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    );
    setSearchResults(local);

    companyService.searchCompanies(searchQuery).then((res) => {
      if (res && res.companies) {
        setSearchResults(res.companies);
      }
    });
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[60px] bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#26324A] px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-[#CBD5E1] dark:text-[#34415C]">/</span>}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-[#111936] dark:text-[#F8FAFC] font-semibold'
                  : 'hover:text-[#111936] dark:hover:text-[#F8FAFC] cursor-pointer'
              }
              onClick={() => {
                if (idx === 0 && breadcrumbs[0] === 'Explore') navigate('/explore');
                if (idx === 0 && breadcrumbs[0] === 'Career DNA') navigate('/career-dna');
                if (idx === 0 && breadcrumbs[0] === 'Compare') navigate('/compare');
                if (idx === 0 && breadcrumbs[0] === 'My Research') navigate('/saved');
              }}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Right: Search, Theme Toggle, Notifications, Avatar, Page Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <div className="relative" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[#94A3B8] dark:text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search companies, industries, roles..."
              className="w-[240px] md:w-[300px] pl-8 pr-7 py-1.5 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-[12px] text-[#111936] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:border-[#6D4AFF] focus:bg-white dark:focus:bg-[#0F172A] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC]"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Search Popover */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute right-0 top-full mt-1.5 w-[360px] bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] shadow-xl p-2 z-50">
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] px-2 py-1 block uppercase">
                Matching Companies ({searchResults.length})
              </span>
              {searchResults.length === 0 ? (
                <div className="p-3 text-[12px] text-[#94A3B8] dark:text-[#64748B] text-center">
                  No company found matching "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => {
                        setIsSearchFocused(false);
                        setSearchQuery('');
                        navigate(`/company/${company.id}`);
                      }}
                      className="p-2 hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] rounded-[4px] flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="text-[13px] font-medium text-[#111936] dark:text-[#F8FAFC] block">
                          {company.name}
                        </span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {company.industry} · {company.location}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] font-bold text-[#6D4AFF] block">
                          {company.overallScore}/100
                        </span>
                        <span className="text-[10px] text-[#8B5CF6]">View Intelligence</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Animated Theme Toggle Button */}
        <ThemeToggle size="sm" />

        {/* Notifications Bell */}
        <Link
          to="/alerts"
          className="relative p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] rounded-[6px] transition-colors"
          title="Watchlist alerts"
        >
          <Bell size={16} />
          {unreadAlerts > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6D4AFF]" />
          )}
        </Link>

        {/* Help icon */}
        <Link
          to="/sources"
          className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#111936] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] rounded-[6px] transition-colors hidden sm:block"
          title="Data integrity & methodology"
        >
          <HelpCircle size={16} />
        </Link>

        {/* User profile avatar / Sign in */}
        {user ? (
          <button
            onClick={openAuthModal}
            className="w-7 h-7 rounded-full bg-[#111936] dark:bg-[#6D4AFF] text-white flex items-center justify-center text-[12px] font-bold hover:opacity-90 shadow-xs cursor-pointer"
            title={`${user.name} (${user.email}) · Account`}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </button>
        ) : (
          <button
            onClick={openAuthModal}
            className="px-2.5 py-1 bg-[#373D91] dark:bg-[#6D4AFF] text-white rounded-[4px] text-[12px] font-semibold hover:opacity-90 cursor-pointer shadow-xs"
          >
            Sign In
          </button>
        )}

        {/* Action Slot if provided */}
        {actionSlot && <div className="ml-1">{actionSlot}</div>}
      </div>
    </header>
  );
};
