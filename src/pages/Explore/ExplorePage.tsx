import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { Company, CompanySuggestion, CompanySubmissionInput } from '../../types';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  Search,
  Filter,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  Building2,
  CheckCircle2,
  PlusCircle,
  X,
  FileCheck,
  Globe,
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { toggleSaveCompany, isCompanySaved, addCompanyToComparison } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [minWlbFilter, setMinWlbFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'highestScore' | 'highestFit' | 'mostReviewed'>('relevance');

  // Autocomplete Suggestions state
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Async data state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Company Submission Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionForm, setSubmissionForm] = useState<CompanySubmissionInput>({
    name: '',
    legalName: '',
    registrationNumber: '',
    jurisdiction: 'India / ROC Gwalior',
    country: 'India',
    city: '',
    headquarters: '',
    website: '',
    industry: 'IT Services & Software Development',
    description: '',
    foundedYear: 2024,
    officialEmail: '',
    evidenceNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live autocomplete suggestions (debounced 300ms)
  useEffect(() => {
    if (!search.trim() || search.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await apiClient.getCompanySuggestions(search.trim(), 6);
        if (res.success && res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
          setShowSuggestions(res.data.suggestions.length > 0);
        }
      } catch {
        // Silently fail suggestions without breaking the main flow
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch companies from backend
  const fetchCompaniesFromApi = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = {
      page,
      limit,
    };

    if (search.trim()) params.search = search.trim();
    if (industryFilter !== 'all') params.industry = industryFilter;
    if (locationFilter !== 'all') params.location = locationFilter;
    if (countryFilter !== 'all') params.country = countryFilter;
    if (minScoreFilter > 0) params.minScore = minScoreFilter;
    if (minWlbFilter > 0) params.minWlb = minWlbFilter;
    if (sortBy !== 'relevance') params.sortBy = sortBy;

    try {
      const res = await apiClient.getCompanies(params);
      if (res.success && res.data) {
        setCompanies(res.data.companies || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.pages || 1);
          setTotalCount(res.data.pagination.total || 0);
        }
      } else {
        setError(res.error?.message || 'Failed to load companies from backend.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error connecting to backend API.');
    } finally {
      setLoading(false);
    }
  }, [search, industryFilter, locationFilter, countryFilter, minScoreFilter, minWlbFilter, sortBy, page, limit]);

  // Debounced search effect (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompaniesFromApi();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchCompaniesFromApi]);

  const clearFilters = () => {
    setSearch('');
    setIndustryFilter('all');
    setLocationFilter('all');
    setCountryFilter('all');
    setMinScoreFilter(0);
    setMinWlbFilter(0);
    setSortBy('relevance');
    setPage(1);
  };

  const handleSelectSuggestion = (suggestion: CompanySuggestion) => {
    setSearch(suggestion.shortName || suggestion.name);
    setShowSuggestions(false);
    setPage(1);
    navigate(`/company/${suggestion.id}`);
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccessMsg(null);
    setSubmitErrorMsg(null);

    try {
      const res = await apiClient.submitCompany(submissionForm);
      if (res.success) {
        setSubmitSuccessMsg('Company registration submitted successfully. It will be officially verified by CompanyIQ administrators.');
        setTimeout(() => {
          setIsSubmitModalOpen(false);
          setSubmitSuccessMsg(null);
          fetchCompaniesFromApi();
        }, 2200);
      } else {
        setSubmitErrorMsg(res.error?.message || 'Failed to submit company.');
      }
    } catch (err: any) {
      setSubmitErrorMsg(err.message || 'Network error submitting company.');
    } finally {
      setSubmitting(false);
    }
  };

  // Provenance Badge Helper
  const renderProvenanceBadge = (company: Company) => {
    const status = company.verificationStatus;
    const isRegistry = status === 'OFFICIAL_REGISTRY' || company.registrationNumber;

    if (isRegistry) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 size={10} className="shrink-0" />
          <span>Official Registry</span>
        </span>
      );
    }

    if (status === 'ADMIN_VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <FileCheck size={10} className="shrink-0" />
          <span>Admin Verified</span>
        </span>
      );
    }

    if (status === 'THIRD_PARTY_VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Globe size={10} className="shrink-0" />
          <span>Verified Entity</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
        <ShieldCheck size={10} className="shrink-0" />
        <span>CompanyIQ Intelligence</span>
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />
          <span>Live Corporate Discovery · Ministry of Corporate Affairs, OpenCorporates, Companies House & Wikidata</span>
        </div>
        {loading && (
          <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] flex items-center gap-1 animate-pulse">
            <RotateCcw size={11} className="animate-spin" /> Querying API...
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight">
            Explore Companies & Startups
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] mt-1">
            Discover verified corporate entities from India and around the world, grounded in official registries and empirical evidence.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 text-[12px] border-[#373D91] text-[#373D91] dark:border-[#8B5CF6] dark:text-[#8B5CF6]"
          >
            <PlusCircle size={14} /> Submit Company
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4 space-y-3 relative">
        {/* Search Input Container with Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] z-10" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Search real company by name, CIN, domain (e.g. VKAPS, TCS, Infosys, Microsoft, Google)..."
            className="w-full pl-9 pr-10 py-2.5 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6] focus:bg-white dark:focus:bg-[#131C31] transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setSuggestions([]);
                setShowSuggestions(false);
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC]"
            >
              <X size={14} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] shadow-lg z-50 overflow-hidden divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              <div className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#131C31] text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                <span>Verified Suggestions</span>
                {loadingSuggestions && <span className="text-[10px] text-[#7547CB] animate-pulse">Searching...</span>}
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="p-3 hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={item.name}
                        className="w-7 h-7 rounded object-contain bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-0.5"
                        onError={(e) => {
                          // Fallback to text avatar
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center font-bold text-[11px] uppercase"
                        style={{ backgroundColor: item.logoBg || '#1E293B', color: '#FFFFFF' }}
                      >
                        {item.logoText || item.name.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                          {item.name}
                        </span>
                        {item.registrationNumber && (
                          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                            {item.registrationNumber}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {item.industry} · {item.location || item.country}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium">
                      View details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Pills / Selects */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#64748B] dark:text-[#94A3B8] font-medium flex items-center gap-1">
              <Filter size={13} /> Filters:
            </span>

            {/* Country Filter */}
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-2.5 py-1 text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
            >
              <option value="all">Country: All</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Global">Global</option>
            </select>

            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-2.5 py-1 text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
            >
              <option value="all">Industry: All</option>
              <option value="IT Services">IT Services</option>
              <option value="Technology">Technology & Software</option>
              <option value="Digital Engineering">Digital Engineering</option>
              <option value="Financial Technology">Fintech & Banking IT</option>
              <option value="Cloud">Cloud & E-Commerce</option>
              <option value="Semiconductors">Semiconductors & AI Systems</option>
              <option value="Networking">Networking & Security</option>
              <option value="Enterprise Software">Enterprise Software & ERP</option>
            </select>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-2.5 py-1 text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
            >
              <option value="all">Location: All</option>
              <option value="India">All India Hubs</option>
              <option value="Indore">Indore</option>
              <option value="Bangalore">Bangalore / Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Noida">Noida / NCR</option>
              <option value="Chennai">Chennai</option>
              <option value="Global">Global / US</option>
            </select>

            {/* Score Filter */}
            <select
              value={minScoreFilter}
              onChange={(e) => {
                setMinScoreFilter(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-2.5 py-1 text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
            >
              <option value="0">Overall Score: All</option>
              <option value="80">Score: 80+</option>
              <option value="85">Score: 85+</option>
              <option value="90">Score: 90+</option>
            </select>

            {/* WLB Filter */}
            <select
              value={minWlbFilter}
              onChange={(e) => {
                setMinWlbFilter(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-2.5 py-1 text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
            >
              <option value="0">WLB: All</option>
              <option value="80">WLB: 80+</option>
              <option value="85">WLB: 85+</option>
            </select>

            {(search || industryFilter !== 'all' || locationFilter !== 'all' || countryFilter !== 'all' || minScoreFilter > 0 || minWlbFilter > 0) && (
              <button
                onClick={clearFilters}
                className="text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium px-2 py-1 cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-2.5 py-1 text-[#14213D] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#373D91] dark:focus:border-[#8B5CF6]"
            >
              <option value="relevance">Relevance</option>
              <option value="highestScore">Highest Score</option>
              <option value="highestFit">Highest Fit</option>
              <option value="mostReviewed">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Count summary */}
      <div className="flex items-center justify-between text-[12px] text-[#64748B] dark:text-[#94A3B8]">
        <div>
          <span>Showing {companies.length} of {totalCount} genuine companies</span> · Page {page} of {totalPages}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Could not load companies"
          description={error}
          retryText="Retry search"
          onRetry={fetchCompaniesFromApi}
        />
      )}

      {/* Loading Skeletons */}
      {loading && companies.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-4 w-1/3">
                <div className="w-10 h-10 rounded bg-[#E2E8F0] dark:bg-[#1E293B]"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-3/4"></div>
                  <div className="h-3 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-8 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-16"></div>
              <div className="h-8 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-16"></div>
              <div className="h-8 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-28"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State if no match */}
      {!loading && !error && companies.length === 0 && (
        <EmptyState
          title="No verified companies found"
          description={`No genuine registry matches for "${search}". Try searching TCS, VKAPS, Infosys, Microsoft, or submit your company for verification.`}
          actionText="Submit Company"
          onAction={() => setIsSubmitModalOpen(true)}
        />
      )}

      {/* Company List */}
      {!error && companies.length > 0 && (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] divide-y divide-[#E2E8F0] dark:divide-[#1E293B] overflow-hidden">
          {/* Table Header Row */}
          <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-[#F8FAFC] dark:bg-[#131C31] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
            <div className="col-span-4">Company & Verification</div>
            <div className="col-span-2 text-center">Intelligence</div>
            <div className="col-span-2 text-center">Career Fit</div>
            <div className="col-span-2">Registry & Provenance</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Company Rows */}
          {companies.map((company) => {
            const isSaved = isCompanySaved(company.id);
            const fitScore = (company as any).careerFit?.fitScore;

            return (
              <div
                key={company.id}
                className="p-5 md:px-6 md:py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-[#FAFBFD] dark:hover:bg-[#131C31] transition-colors"
              >
                {/* 1. Company / Location */}
                <div className="md:col-span-4 flex items-center gap-3">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-10 h-10 rounded-[6px] object-contain bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-1 shrink-0 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-[6px] flex items-center justify-center font-bold text-[14px] shrink-0 uppercase shadow-xs"
                      style={{
                        backgroundColor: company.logoBg || '#1E293B',
                        color: company.logoColor || '#FFFFFF',
                      }}
                    >
                      {company.logoText || company.name.slice(0, 3)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => navigate(`/company/${(company as any).slug || company.id}`)}
                        className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] hover:text-[#373D91] dark:hover:text-[#8B5CF6] cursor-pointer transition-colors leading-tight"
                      >
                        {company.name}
                      </h3>
                      {renderProvenanceBadge(company)}
                    </div>

                    <div className="flex items-center gap-2 text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      <span>{company.industry}</span>
                      <span>·</span>
                      <span>{company.location || company.country}</span>
                    </div>

                    {company.website && !company.website.includes('unavailable') && !company.website.includes('example.com') && (
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit official website of ${company.name}`}
                        className="inline-flex items-center gap-1 text-[11px] text-[#373D91] dark:text-[#8B5CF6] hover:underline mt-0.5 font-medium"
                      >
                        <span>{company.domain || company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. Intelligence Score */}
                <div className="md:col-span-2 md:text-center flex md:flex-col items-baseline md:items-center justify-between md:justify-center">
                  <span className="md:hidden text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium">Intelligence:</span>
                  <div>
                    {company.overallScore !== null && company.overallScore !== undefined ? (
                      <>
                        <span className="text-[24px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-none">
                          {company.overallScore}
                        </span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">out of 100</span>
                      </>
                    ) : (
                      <div className="text-center">
                        <span className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">
                          Not available
                        </span>
                        <span className="text-[10px] text-[#94A3B8] dark:text-[#64748B] italic block">
                          Evidence pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Career Fit */}
                <div className="md:col-span-2 md:text-center flex md:flex-col items-baseline md:items-center justify-between md:justify-center">
                  <span className="md:hidden text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium">Career Fit:</span>
                  <div>
                    {fitScore !== undefined && fitScore !== null ? (
                      <>
                        <span className="text-[24px] font-bold text-[#7547CB] dark:text-[#A78BFA] leading-none">
                          {fitScore}%
                        </span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">Personal Match</span>
                      </>
                    ) : (
                      <div className="text-center">
                        <span className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">
                          Not available
                        </span>
                        <span className="text-[10px] text-[#94A3B8] dark:text-[#64748B] italic block">
                          Set Career DNA
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Signals & Coverage */}
                <div className="md:col-span-2 space-y-1">
                  {company.registrationNumber ? (
                    <div className="text-[11px] font-mono font-medium text-[#14213D] dark:text-[#F8FAFC]">
                      CIN: {company.registrationNumber}
                    </div>
                  ) : (
                    <span className="text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] block truncate">
                      {company.positiveSignals?.[0] || 'Verified legal entity'}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-semibold text-[#177454] dark:text-[#22C55E]">
                      {company.confidence?.label || 'Verified Registry'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block truncate">
                    {company.dataSources?.[0]?.provider || company.sampleSourcesSummary || 'Official filing'}
                  </span>
                </div>

                {/* 5. Actions */}
                <div className="md:col-span-2 flex flex-col items-start md:items-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/company/${company.id}`)}
                  >
                    View Details
                  </Button>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    <button
                      onClick={() => toggleSaveCompany(company.id)}
                      className="hover:text-[#373D91] dark:hover:text-[#8B5CF6] transition-colors cursor-pointer"
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => {
                        addCompanyToComparison(company.id);
                        navigate('/compare');
                      }}
                      className="hover:text-[#373D91] dark:hover:text-[#8B5CF6] transition-colors cursor-pointer"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            icon={<ChevronLeft size={14} />}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      )}

      {/* Submit Company Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC]"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Submit Company for Verification
              </h3>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                Add an official business or startup. Records will be cross-referenced against public corporate registries before receiving verified status.
              </p>
            </div>

            {submitSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded text-[12px]">
                {submitSuccessMsg}
              </div>
            )}

            {submitErrorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded text-[12px]">
                {submitErrorMsg}
              </div>
            )}

            <form onSubmit={handleCompanySubmit} className="space-y-3 text-[12px]">
              <div>
                <label className="block font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  Company Trade Name *
                </label>
                <input
                  type="text"
                  required
                  value={submissionForm.name}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, name: e.target.value })}
                  placeholder="e.g. VKAPS IT Solutions"
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    Corporate ID / CIN
                  </label>
                  <input
                    type="text"
                    value={submissionForm.registrationNumber || ''}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, registrationNumber: e.target.value })}
                    placeholder="e.g. U72900MP2018PTC047186"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    Industry *
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionForm.industry}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, industry: e.target.value })}
                    placeholder="e.g. IT Services & Software"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    Official Website
                  </label>
                  <input
                    type="url"
                    value={submissionForm.website || ''}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, website: e.target.value })}
                    placeholder="https://vkaps.com"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={submissionForm.city || ''}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, city: e.target.value })}
                    placeholder="e.g. Indore, Madhya Pradesh"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  Official Verification Notes / Registration Proof
                </label>
                <textarea
                  rows={2}
                  value={submissionForm.evidenceNotes || ''}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, evidenceNotes: e.target.value })}
                  placeholder="Provide MCA registration link, ROC filing details, or official domain proof."
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom informational cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1.5 flex items-center gap-1.5">
            <Building2 size={16} className="text-[#373D91] dark:text-[#8B5CF6]" />
            Official Registry Provenance
          </h4>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
            CompanyIQ integrates legitimate public corporate records including India's Ministry of Corporate Affairs (MCA), UK Companies House, OpenCorporates, and Wikidata. Scores and reviews are presented only when genuine evidence has been collected.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1.5">
              Can't find your company?
            </h4>
            <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed mb-3">
              Search by Corporate Identification Number (CIN), domain, or submit your startup using the submission workflow.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Reset filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitModalOpen(true)}
            >
              + Submit Company
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
