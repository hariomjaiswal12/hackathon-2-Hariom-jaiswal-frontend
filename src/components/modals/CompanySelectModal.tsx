import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/apiClient';
import { Company } from '../../types';
import { Search, X, Building2, Check, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface CompanySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCompany: (company: Company) => void;
  selectedCompanyIds: string[];
  title?: string;
  subtitle?: string;
  maxSelect?: number;
  footerText?: string;
  onSelectMultiple?: (companies: Company[]) => void;
}

export const CompanySelectModal: React.FC<CompanySelectModalProps> = ({
  isOpen,
  onClose,
  onSelectCompany,
  selectedCompanyIds,
  title = 'Add Company to Comparison',
  subtitle = 'Select up to 3 companies to evaluate empirical metrics, culture, and career fit head-to-head.',
  maxSelect,
  footerText,
  onSelectMultiple,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open & clear search
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchCompanies('');
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchCompanies(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  const fetchCompanies = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string | number> = { limit: 15 };
      if (query.trim()) {
        queryParams.search = query.trim();
      }
      const res = await apiClient.getCompanies(queryParams);
      if (res.success && res.data?.companies) {
        setCompanies(res.data.companies);
      } else {
        setCompanies([]);
      }
    } catch (err: any) {
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const normalizedSelected = selectedCompanyIds.map((id) => id.toLowerCase().trim());

  const quickFilterPills = [
    { label: 'VKAPS IT Solutions', query: 'VKAPS' },
    { label: 'TCS', query: 'TCS' },
    { label: 'Infosys', query: 'Infosys' },
    { label: 'Accenture', query: 'Accenture' },
    { label: 'Microsoft', query: 'Microsoft' },
    { label: 'Google', query: 'Google' },
    { label: 'NVIDIA', query: 'NVIDIA' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] dark:border-[#26324A] flex items-start justify-between bg-[#F8FAFC] dark:bg-[#131C31]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-[#7547CB]/10 text-[#7547CB] dark:text-[#A78BFA]">
                <Building2 size={16} />
              </span>
              <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight">
                {title}
              </h2>
            </div>
            <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#14213D] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] p-1.5 rounded-md hover:bg-[#E2E8F0]/50 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Quick Filters */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#26324A] space-y-3 bg-white dark:bg-[#0F172A]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name, alias, industry, or CIN (e.g. VKAPS, TCS, Google)..."
              className="w-full pl-10 pr-9 py-2.5 text-[13px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#CBD5E1] dark:border-[#384869] rounded-md text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7547CB] dark:focus:border-[#A78BFA] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] dark:hover:text-[#CBD5E1]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Pills & Add All */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#64748B] dark:text-[#94A3B8] font-medium mr-1 flex items-center gap-1">
                <Sparkles size={11} className="text-[#7547CB] dark:text-[#A78BFA]" /> Quick add:
              </span>
              {quickFilterPills.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setSearchTerm(pill.query)}
                  className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                    searchTerm === pill.query
                      ? 'bg-[#7547CB] text-white border-[#7547CB]'
                      : 'bg-[#F1F5F9] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] hover:border-[#7547CB] dark:hover:border-[#A78BFA]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {onSelectMultiple && companies.length > 0 && (() => {
              const unselected = companies.filter(
                (c) =>
                  !normalizedSelected.includes((c.slug || c.id).toLowerCase()) &&
                  !normalizedSelected.includes((c.shortName || '').toLowerCase())
              );
              if (unselected.length === 0) return null;
              return (
                <button
                  type="button"
                  onClick={() => {
                    onSelectMultiple(unselected);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-[#7547CB]/10 hover:bg-[#7547CB]/20 text-[#7547CB] dark:text-[#A78BFA] font-semibold border border-[#7547CB]/30 transition-colors cursor-pointer"
                >
                  + Add all matching ({unselected.length})
                </button>
              );
            })()}
          </div>
        </div>

        {/* Company List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[260px] max-h-[380px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#7547CB] dark:text-[#A78BFA] gap-2">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-[12px] font-medium">Searching verified company records...</span>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-md bg-[#FEF2F2] dark:bg-[#991B1B]/20 border border-[#FCA5A5] dark:border-[#DC2626] text-[#B91C1C] dark:text-[#F87171] text-[13px] text-center">
              {error}
            </div>
          )}

          {!loading && !error && companies.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Building2 size={32} className="mx-auto text-[#94A3B8] opacity-60" />
              <p className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                No companies found
              </p>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                No verified records match &ldquo;{searchTerm}&rdquo;. Try searching for another name like VKAPS, Infosys, or Microsoft.
              </p>
            </div>
          )}

          {!loading && !error && companies.map((comp) => {
            const compId = comp.slug || comp.id;
            const isAlreadySelected = normalizedSelected.includes(compId.toLowerCase()) ||
              normalizedSelected.includes((comp.shortName || '').toLowerCase());
            const isStartup = comp.slug === 'vkaps-it-solutions' || (comp.size && comp.size.includes('50-200'));

            return (
              <div
                key={comp.id || comp.slug}
                onClick={() => {
                  if (!isAlreadySelected) {
                    onSelectCompany(comp);
                    onClose();
                  }
                }}
                className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  isAlreadySelected
                    ? 'bg-[#F8FAFC] dark:bg-[#131C31]/40 border-[#E2E8F0] dark:border-[#26324A] opacity-60 cursor-not-allowed'
                    : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#26324A] hover:border-[#7547CB] dark:hover:border-[#A78BFA] hover:shadow-xs cursor-pointer'
                }`}
              >
                {/* Logo and Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-[12px] text-white shrink-0 uppercase shadow-xs"
                    style={{ backgroundColor: comp.logoBg || '#1E293B' }}
                  >
                    {comp.logoText || (comp.shortName ? comp.shortName.slice(0, 3) : 'CIQ')}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] truncate">
                        {comp.shortName || comp.name}
                      </span>
                      {isStartup && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5FF] dark:bg-[#7547CB]/20 text-[#7547CB] dark:text-[#C084FC] border border-[#E9D5FF] dark:border-[#7547CB]/40">
                          Startup / Agile
                        </span>
                      )}
                      {comp.overallScore && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8]">
                          {comp.overallScore}/100 IQ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 truncate">
                      <span className="truncate">{comp.name}</span>
                      <span>•</span>
                      <span className="truncate">{comp.industry || 'Technology'}</span>
                      {comp.locations?.[0] && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin size={10} /> {comp.locations[0]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="shrink-0">
                  {isAlreadySelected ? (
                    <span className="text-[11px] font-semibold text-[#177454] dark:text-[#34D399] bg-[#EBF8F2] dark:bg-[#10B981]/15 px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Check size={12} /> Selected
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCompany(comp);
                        onClose();
                      }}
                    >
                      Select
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#E2E8F0] dark:border-[#26324A] bg-[#F8FAFC] dark:bg-[#131C31] flex items-center justify-between text-[12px] text-[#64748B] dark:text-[#94A3B8]">
          <span>
            {footerText || (maxSelect ? `${selectedCompanyIds.length} of ${maxSelect} companies selected` : `${selectedCompanyIds.length} companies selected`)}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
