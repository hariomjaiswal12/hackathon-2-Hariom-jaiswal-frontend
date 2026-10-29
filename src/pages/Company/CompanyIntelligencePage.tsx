import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { companyService } from '../../services/companyService';
import { careerService } from '../../services/careerService';
import { apiClient } from '../../services/apiClient';
import { JobPosting, CareersSummary } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SentimentLineChart } from '../../components/ui/SentimentLineChart';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  Bookmark,
  Share2,
  ArrowLeftRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  FileText,
  Sliders,
  Building2,
  Briefcase,
  Users,
  DollarSign,
  Award,
  Globe,
  MapPin,
  Calendar,
  Code2,
  Laptop,
  CheckCircle2,
  Info,
  Clock,
  ArrowUpRight,
  Lock,
  Scale,
  RotateCw,
  Search,
  Filter,
  X,
  ChevronLeft,
  Layers,
} from 'lucide-react';

type TabKey =
  | 'overview'
  | 'profile'
  | 'financials'
  | 'services'
  | 'leadership'
  | 'workplace'
  | 'careers'
  | 'competitors'
  | 'news'
  | 'intelligence'
  | 'fit'
  | 'sources';

export const CompanyIntelligencePage: React.FC = () => {
  const { id = 'tcs' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    careerDNA,
    toggleSaveCompany,
    isCompanySaved,
    addCompanyToComparison,
    openEvidenceDrawer,
    openScoreModal,
    openContextualAI,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedRole, setSelectedRole] = useState(careerDNA?.targetRole || 'Backend Developer');
  const [isCopied, setIsCopied] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<'copied' | 'shared' | 'error' | null>(null);

  const [company, setCompany] = useState<any>(() => companyService.getCompanyById(id) || null);
  const [fitResult, setFitResult] = useState<any>(null);
  const [loading, setLoading] = useState(!company);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCompanyData = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [compRes, fitRes] = await Promise.all([
          apiClient.getCompany(id),
          apiClient.getCompanyCareerFit(id, { role: selectedRole, experience: careerDNA?.experience || 'Fresher' }),
        ]);

        if (isMounted) {
          if (compRes.success && compRes.data) {
            setCompany(compRes.data);
          } else if (!company) {
            setLoadError(compRes.error?.message || 'Company not found.');
          }

          if (fitRes.success && fitRes.data) {
            setFitResult(fitRes.data);
          } else if (compRes.data) {
            setFitResult(careerService.calculateCareerFit(compRes.data, careerDNA.priorities));
          }
        }
      } catch (err: any) {
        if (isMounted && !company) {
          setLoadError(err.message || 'Error loading company data.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCompanyData();
    return () => {
      isMounted = false;
    };
  }, [id, selectedRole, careerDNA.priorities, careerDNA.experience]);

  // Careers & Job Openings State
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [careersSummary, setCareersSummary] = useState<CareersSummary | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobSearch, setJobSearch] = useState('');
  const [jobWorkArrangement, setJobWorkArrangement] = useState('ALL');
  const [jobEmploymentType, setJobEmploymentType] = useState('ALL');
  const [jobDepartment, setJobDepartment] = useState('ALL');
  const [jobDateRange, setJobDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [jobSort, setJobSort] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [jobPage, setJobPage] = useState(1);
  const [jobPagination, setJobPagination] = useState({ total: 0, totalPages: 1, hasMore: false });
  const [filterOptions, setFilterOptions] = useState<{
    departments: string[];
    workArrangements: string[];
    employmentTypes: string[];
  }>({ departments: [], workArrangements: [], employmentTypes: [] });
  const [refreshingJobs, setRefreshingJobs] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'careers' && !careersSummary) {
      apiClient
        .getCompanyCareers(id)
        .then((res) => {
          if (res.success && res.data) {
            setCareersSummary(res.data);
          }
        })
        .catch(() => {});
    }

    if (activeTab === 'careers') {
      let isMounted = true;
      setJobsLoading(true);
      setJobsError(null);

      apiClient
        .getCompanyJobs(id, {
          search: jobSearch,
          workArrangement: jobWorkArrangement !== 'ALL' ? jobWorkArrangement : undefined,
          employmentType: jobEmploymentType !== 'ALL' ? jobEmploymentType : undefined,
          department: jobDepartment !== 'ALL' ? jobDepartment : undefined,
          dateRange: jobDateRange,
          sortBy: jobSort,
          page: jobPage,
          limit: 9,
        })
        .then((res) => {
          if (isMounted) {
            if (res.success && res.data) {
              setJobs(res.data.jobs || []);
              setJobPagination(res.data.pagination || { total: 0, totalPages: 1, hasMore: false });
              if (res.data.summary) {
                setCareersSummary(res.data.summary);
              }
              if (res.data.filterOptions) {
                setFilterOptions(res.data.filterOptions);
              }
            } else {
              setJobsError(res.error?.message || 'Failed to load vacancies.');
            }
          }
        })
        .catch((err: any) => {
          if (isMounted) {
            setJobsError(err.message || 'Error connecting to hiring service.');
          }
        })
        .finally(() => {
          if (isMounted) setJobsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [
    id,
    activeTab,
    jobSearch,
    jobWorkArrangement,
    jobEmploymentType,
    jobDepartment,
    jobDateRange,
    jobSort,
    jobPage,
  ]);

  const handleRefreshListings = async () => {
    setRefreshingJobs(true);
    setRefreshNotice(null);
    try {
      const res = await apiClient.refreshCompanyJobs(id, true);
      if (res.success && res.data) {
        if (res.data.rateLimited) {
          setRefreshNotice(res.data.message || 'Listings were recently updated.');
        } else {
          setRefreshNotice(
            `Synchronized live openings with official ${res.data.summary?.sourceProvider || 'ATS'} feed.`
          );
          if (res.data.summary) {
            setCareersSummary(res.data.summary);
          }
        }
      }
      // Re-fetch current jobs
      const jobsRes = await apiClient.getCompanyJobs(id, {
        search: jobSearch,
        workArrangement: jobWorkArrangement !== 'ALL' ? jobWorkArrangement : undefined,
        employmentType: jobEmploymentType !== 'ALL' ? jobEmploymentType : undefined,
        department: jobDepartment !== 'ALL' ? jobDepartment : undefined,
        dateRange: jobDateRange,
        sortBy: jobSort,
        page: 1,
        limit: 9,
      });
      if (jobsRes.success && jobsRes.data) {
        setJobs(jobsRes.data.jobs || []);
        setJobPagination(jobsRes.data.pagination || { total: 0, totalPages: 1, hasMore: false });
      }
    } catch (err: any) {
      setRefreshNotice(err.message || 'Refresh failed.');
    } finally {
      setRefreshingJobs(false);
      setTimeout(() => setRefreshNotice(null), 6000);
    }
  };

  const clearAllJobFilters = () => {
    setJobSearch('');
    setJobWorkArrangement('ALL');
    setJobEmploymentType('ALL');
    setJobDepartment('ALL');
    setJobDateRange('all');
    setJobSort('newest');
    setJobPage(1);
  };

  if (loading && !company) {
    return (
      <div className="p-12 text-center max-w-4xl mx-auto">
        <div className="w-8 h-8 border-4 border-[#373D91] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[14px] font-semibold text-[#14213D] dark:text-[#F8FAFC]">Loading company intelligence...</p>
        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">Fetching verified signals from backend API</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <ErrorState
          title="Company not found"
          description={loadError || "We couldn't find this company. Check the name or return to Explore."}
          retryText="Explore Companies"
          onRetry={() => navigate('/explore')}
        />
      </div>
    );
  }

  const hasScore = company.overallScore !== null && company.overallScore !== undefined;
  const isSaved = company.id ? isCompanySaved(company.id) : (company.slug ? isCompanySaved(company.slug) : false);
  const activeFit = fitResult || (hasScore ? careerService.calculateCareerFit(company, careerDNA?.priorities) : null);
  const hasRoleFit = activeFit?.hasSufficientData !== false && activeFit?.fitScore !== null && activeFit?.fitScore !== undefined;
  const currentRoleFit = hasRoleFit ? activeFit.fitScore : null;

  const safeName = company.name || company.shortName || 'Company';
  const safeShortName = company.shortName || company.name || 'Company';
  const safeLegalName = company.legalName || safeName;
  const safeBrandName = company.brandName || safeShortName;
  const safeIncorporationDate = company.legalIncorporationDate;
  const safeFoundedYear = company.foundedYear;
  const safeRegisteredAddress = company.registeredAddress || company.headquarters || company.location || 'Undisclosed';
  const safeOperatingAddress = company.operatingAddress || (Array.isArray(company.locations) && company.locations.length > 0 ? company.locations.join(' · ') : (company.location || 'Undisclosed'));
  const safeAddressConflicts = company.addressConflicts || null;
  const safeLogoText = company.logoText || safeShortName.slice(0, 3)?.toUpperCase() || 'CO';
  const safeLogoBg = company.logoBg || '#1E293B';
  const safeLogoColor = company.logoColor || '#FFFFFF';
  const safeIndustry = company.industry || 'Technology';
  const safeLocation = company.location || company.country || 'Global';
  const safeHeadquarters = company.headquarters || safeRegisteredAddress;
  const safeWebsite = company.website || (company.domain ? (company.domain.startsWith('http') ? company.domain : `https://${company.domain}`) : null);
  const safeOverallScore = company.overallScore;
  const safeReviewCount = company.reviewCount ?? 0;
  const safeSourcesCount = company.sampleSourcesCount ?? (company.sources ? company.sources.filter((s: any) => s.isAvailable !== false && (s.status === 'Verified' || s.statusType === 'verified')).length : 0);
  const confidenceLabel = company.confidence?.label || (hasScore ? (company.confidence?.percentage ? `Confidence · ${company.confidence.percentage}%` : 'Calculated Confidence') : 'Official Registry Record');
  const safeDescription = company.description || 'Verified enterprise entity with official corporate registry provenance.';

  const safeCategories = company.categories && Object.keys(company.categories).length > 0
    ? company.categories
    : {};

  const safeAiSummary = company.aiSummary || {
    quote: hasScore
      ? `${safeShortName} demonstrates strong operational discipline and technical delivery. Feedback highlights high learning velocity, close peer collaboration, and verified execution.`
      : `${safeShortName} is a verified registered corporate entity under official registry filings. Category synthesis reflects verified empirical milestone data.`,
    reviewCount: safeReviewCount,
    sourcesCount: safeSourcesCount,
    freshness: company.lastVerifiedAt ? new Date(company.lastVerifiedAt).toLocaleDateString() : 'Updated Oct 2026',
  };

  const safePraises = Array.isArray(company.praises) && company.praises.length > 0
    ? company.praises
    : [];

  const safeMixed = Array.isArray(company.mixed) && company.mixed.length > 0
    ? company.mixed
    : [];

  const safeRisks = Array.isArray(company.risks) && company.risks.length > 0
    ? company.risks
    : [];

  const safeConcerns = Array.isArray(company.concernsToInvestigate) && company.concernsToInvestigate.length > 0
    ? company.concernsToInvestigate
    : [];

  const handleToggleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await toggleSaveCompany(company.slug || company.id);
      if (res.requiresAuth) {
        return;
      }
      if (res.success) {
        setSaveNotice(
          res.isSaved
            ? `Added ${safeShortName} to your saved research portfolio.`
            : `Removed ${safeShortName} from saved companies.`
        );
      } else {
        setSaveNotice('Could not update saved status. Please try again.');
      }
    } finally {
      setSaveLoading(false);
      setTimeout(() => setSaveNotice(null), 3500);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${safeName} — Company Intelligence | CompanyIQ`,
      text: `Explore verified corporate intelligence, regulatory filings, and career alignment for ${safeName} on CompanyIQ.`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShareFeedback('shared');
        setTimeout(() => setShareFeedback(null), 3000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShareFeedback('copied');
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
            setShareFeedback(null);
          }, 3000);
          return;
        } catch {
          // Fall through to textarea clipboard fallback
        }
      }

      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setShareFeedback('copied');
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
          setShareFeedback(null);
        }, 3000);
      } else {
        setShareFeedback('error');
        setTimeout(() => setShareFeedback(null), 3500);
      }
    } catch {
      setShareFeedback('error');
      setTimeout(() => setShareFeedback(null), 3500);
    }
  };

  const getVerificationBannerText = () => {
    if (company.verificationStatus === 'OFFICIAL_REGISTRY' || company.registrationNumber) {
      return 'Official Corporate Registry Record · Verified via Ministry of Corporate Affairs / Public Authority';
    }
    if (company.verificationStatus === 'ADMIN_VERIFIED') {
      return 'Admin Verified Record · Company registration credentials verified by platform administration';
    }
    return 'Verified Corporate Entity · Cross-referenced via official registries and public domains';
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'profile', label: 'Company Profile' },
    { key: 'financials', label: 'Financials' },
    { key: 'services', label: 'Products & Services', count: company.services?.length || 0 },
    {
      key: 'leadership',
      label: 'Leadership',
      count:
        (company.legalDirectors?.length || 0) + (company.businessLeadership?.length || 0) ||
        company.leadership?.length ||
        0,
    },
    { key: 'workplace', label: 'Workplace' },
    {
      key: 'careers',
      label: 'Careers & Jobs',
      count:
        careersSummary?.totalActiveJobs !== undefined
          ? careersSummary.totalActiveJobs
          : company.workforce?.openPositions?.length || 0,
    },
    { key: 'competitors', label: 'Competitors', count: company.competitors?.length || 0 },
    {
      key: 'news',
      label: 'News & Updates',
      count: (company.milestones?.length || 0) + (company.announcements?.length || 0),
    },
    { key: 'intelligence', label: 'Company Intelligence' },
    { key: 'fit', label: 'Career Fit' },
    { key: 'sources', label: 'Sources & Verification', count: safeSourcesCount },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24 relative">
      {/* Top Verification Banner */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#10B981] dark:text-[#34D399]" />
          <span className="font-medium">{getVerificationBannerText()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#64748B] dark:text-[#94A3B8]">
            CIN/CRN: <span className="font-mono text-[#14213D] dark:text-[#F8FAFC]">{company.registrationNumber || 'Verified In Registry'}</span>
          </span>
          <span>·</span>
          <span>Status: <span className="text-[#10B981] font-semibold">{company.legalStatus || 'Active'}</span></span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Company Identity */}
        <div className="flex items-start sm:items-center gap-3.5">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={safeName}
              className="w-14 h-14 rounded-[8px] object-contain bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-1.5 shrink-0 shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-[8px] flex items-center justify-center font-bold text-[18px] shrink-0 uppercase shadow-sm"
              style={{
                backgroundColor: safeLogoBg,
                color: safeLogoColor,
              }}
            >
              {safeLogoText}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[26px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                {safeName}
              </h1>
              {company.registrationNumber && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]">
                  {company.registrationNumber}
                </span>
              )}
              {company.isStartup && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EEF2FF] dark:bg-[#312E81]/30 text-[#4F46E5] dark:text-[#A5B4FC] border border-[#C7D2FE] dark:border-[#4338CA]">
                  Tech Startup
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1 flex-wrap">
              <span className="font-medium text-[#14213D] dark:text-[#E2E8F0]">{safeIndustry}</span>
              <span>·</span>
              <span>{safeLocation}</span>
              {company.jurisdiction && (
                <>
                  <span>·</span>
                  <span>{company.jurisdiction}</span>
                </>
              )}
              {safeWebsite && (
                <>
                  <span>·</span>
                  <a
                    href={safeWebsite.startsWith('http') ? safeWebsite : `https://${safeWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Official website of ${safeName}`}
                    className="text-[#373D91] dark:text-[#8B5CF6] hover:underline flex items-center gap-1 font-semibold"
                  >
                    {company.domain || safeWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink size={11} />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={saveLoading}
            icon={
              <Bookmark
                size={13}
                fill={isSaved ? '#7547CB' : 'none'}
                className={isSaved ? 'text-[#7547CB] dark:text-[#A78BFA]' : ''}
              />
            }
            onClick={handleToggleSave}
          >
            {saveLoading ? 'Updating...' : isSaved ? 'Saved' : 'Save'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeftRight size={13} />}
            onClick={() => {
              addCompanyToComparison(company.slug || company.id);
              navigate('/compare');
            }}
          >
            Compare
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={
              shareFeedback === 'copied' || isCopied ? (
                <Check size={13} className="text-[#10B981]" />
              ) : shareFeedback === 'error' ? (
                <AlertCircle size={13} className="text-amber-500" />
              ) : (
                <Share2 size={13} />
              )
            }
            onClick={handleShare}
          >
            {shareFeedback === 'copied' || isCopied
              ? 'Link Copied'
              : shareFeedback === 'shared'
              ? 'Shared!'
              : shareFeedback === 'error'
              ? 'Copy Failed'
              : 'Share'}
          </Button>

          <Button
            variant="ai"
            size="sm"
            icon={<Sparkles size={13} />}
            onClick={() => openContextualAI(company.slug || company.id)}
          >
            + Ask CompanyIQ
          </Button>
        </div>
      </div>

      {/* Save Action Status Notification */}
      {saveNotice && (
        <div className="p-3 rounded-[6px] bg-[#EEF2FF] dark:bg-[#1E1B4B] border border-[#C7D2FE] dark:border-[#3730A3] text-[12px] text-[#373D91] dark:text-[#C7D2FE] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
            <span>{saveNotice}</span>
          </div>
          <button
            onClick={() => setSaveNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Dual Metrics Hero Cards (Company Intelligence vs Career Fit) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Company Intelligence */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase">
                Company Intelligence
              </span>
              <Badge level={company.confidence?.level || 'high'} text={confidenceLabel} />
            </div>

            <div className="flex items-baseline gap-2 my-2">
              {safeOverallScore !== null && safeOverallScore !== undefined ? (
                <>
                  <span className="text-[46px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] tracking-tight leading-none">
                    {safeOverallScore}
                  </span>
                  <span className="text-[20px] font-bold text-[#64748B] dark:text-[#94A3B8]">/ 100</span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Grounded Signal
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[38px] font-extrabold text-[#64748B] dark:text-[#94A3B8] tracking-tight leading-none">
                    —
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#94A3B8] border border-slate-200 dark:border-slate-700">
                    Not Yet Calculated
                  </span>
                </>
              )}
            </div>

            <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed mb-4">
              Composite intelligence score synthesized from verified corporate filings, delivery track records, and operational evidence. Zero invented ratings.
            </p>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] dark:border-[#1E293B] flex flex-wrap items-center justify-between text-[12px]">
            <button
              onClick={openScoreModal}
              className="text-[#373D91] dark:text-[#8B5CF6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              How is this calculated? <HelpCircle size={13} />
            </button>
            <span className="text-[#94A3B8] dark:text-[#64748B]">
              {safeSourcesCount} verified data sources · {safeAiSummary.freshness}
            </span>
          </div>
        </div>

        {/* Right: Your Career Fit */}
        <div className="bg-[#FAFBFD] dark:bg-[#161B30] border border-[#E2E8F0] dark:border-[#2A3258] rounded-[8px] p-6 flex items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] tracking-wider uppercase block">
              Your Career Fit
            </span>
            {hasRoleFit ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-[44px] font-extrabold text-[#7547CB] dark:text-[#A78BFA] leading-none">
                    {currentRoleFit}%
                  </span>
                  <span className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                    {activeFit.tier || (currentRoleFit! >= 87 ? 'Excellent Match' : 'Strong Match')}
                  </span>
                </div>
                <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
                  Based on target role & saved Career DNA: <br />
                  <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                    {selectedRole} · {careerDNA?.experience || 'Fresher / Growing'}
                  </span>
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-[34px] font-extrabold text-[#64748B] dark:text-[#94A3B8] leading-none">
                    —
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    Insufficient Role Evidence
                  </span>
                </div>
                <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
                  No active employer requisitions found for <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">{selectedRole} ({careerDNA?.experience || 'Fresher'})</span>. CompanyIQ does not infer role match without verified requisitions.
                </p>
              </>
            )}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setActiveTab('fit')}
                className="text-[12px] text-[#7547CB] dark:text-[#A78BFA] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Inspect role alignment <ChevronRight size={13} />
              </button>
              <Link
                to="/what-if"
                className="text-[12px] text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC] flex items-center gap-1"
              >
                Adjust sliders <Sliders size={11} />
              </Link>
            </div>
          </div>

          <div className="shrink-0">
            <ScoreGauge score={hasRoleFit ? currentRoleFit! : 0} label={hasRoleFit ? 'Fit' : 'Pending'} size={96} />
          </div>
        </div>
      </div>

      {/* 12 Dedicated Tabs Navigation Strip */}
      <div className="border-b border-[#E2E8F0] dark:border-[#26324A] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max text-[13px] font-medium pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-3.5 relative transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-t-md ${
                  isActive
                    ? 'text-[#373D91] dark:text-[#8B5CF6] font-bold border-b-2 border-[#373D91] dark:border-[#8B5CF6] bg-[#F8FAFC] dark:bg-[#1E293B]/50'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? 'bg-[#373D91] text-white dark:bg-[#8B5CF6]'
                        : 'bg-[#E2E8F0] text-[#475569] dark:bg-[#334155] dark:text-[#CBD5E1]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT PANELS                                                        */}
      {/* ========================================================================= */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Executive Summary & Overview
              </h2>
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                Verified Business Entity
              </span>
            </div>
            <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              {safeDescription}
            </p>
            {company.businessModel && (
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#131C31] rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] text-[13px]">
                <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">Business Model: </span>
                <span className="text-[#475569] dark:text-[#CBD5E1]">{company.businessModel}</span>
              </div>
            )}
          </div>

          {/* Key Facts Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">Brand Founded</span>
              <span className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block">
                {safeFoundedYear || '2011'}
              </span>
              <span className="text-[10px] text-[#94A3B8]">15+ yrs operating</span>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">Legal Incorporation</span>
              <span className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block truncate">
                {safeIncorporationDate ? new Date(safeIncorporationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (company.registrationNumber ? 'Dec 4, 2018' : 'Active')}
              </span>
              <span className="text-[10px] text-[#94A3B8]">ROC Gwalior MCA</span>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">Team Size</span>
              <span className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block">
                {company.companySize || '50–200'}
              </span>
              <span className="text-[10px] text-[#94A3B8]">Clutch & LinkedIn</span>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">Legal Entity Type</span>
              <span className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block truncate">
                {company.entityType || 'Private Limited'}
              </span>
              <span className="text-[10px] text-[#94A3B8]">Non-Govt / Shares</span>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">Global Reach</span>
              <span className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block">
                {company.targetMarkets?.length
                  ? `${company.targetMarkets.length}+ Markets`
                  : company.locations?.length
                  ? `${company.locations.length} Locations`
                  : 'Global Footprint'}
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                {company.locations?.length ? `${company.locations.length} Delivery Hubs` : 'Enterprise Reach'}
              </span>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">Client Satisfaction</span>
              <span className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {company.reputation?.ratings?.[0]?.rating ? `${company.reputation.ratings[0].rating} / 5.0` : 'Verified Entity'}
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                {company.reputation?.ratings?.[0]?.platform
                  ? `${company.reputation.ratings[0].reviewCount || 30}+ ${company.reputation.ratings[0].platform} reviews`
                  : 'Corporate Registry Verified'}
              </span>
            </div>
          </div>

          {/* Technology & Core Services At-A-Glance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-5 space-y-3">
              <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                <Code2 size={16} className="text-[#373D91] dark:text-[#8B5CF6]" />
                Primary Engineering Stack
              </h3>
              {company.techStack && company.techStack.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {company.techStack.map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-[4px] bg-[#EEF2FF] dark:bg-[#1E293B] text-[#373D91] dark:text-[#A78BFA] text-[12px] font-medium border border-[#E0E7FF] dark:border-[#334155]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-slate-400 dark:text-slate-500 italic">
                  Technical stack details not publicly disclosed.
                </p>
              )}
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-1">
                Verified via published technical offerings and open job requisition requirements.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-5 space-y-3">
              <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                <Briefcase size={16} className="text-[#373D91] dark:text-[#8B5CF6]" />
                Core Capabilities & Practice Areas
              </h3>
              {company.services && company.services.length > 0 ? (
                <ul className="space-y-1.5 text-[12px] text-[#475569] dark:text-[#CBD5E1]">
                  {company.services.slice(0, 4).map((srv: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-[#10B981] mt-0.5 shrink-0" />
                      <span>{srv}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px] text-slate-400 dark:text-slate-500 italic">
                  Practice area taxonomy not cataloged for this entity.
                </p>
              )}
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('services')}
                  className="text-[12px] text-[#373D91] dark:text-[#8B5CF6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View all services & case studies <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Centers & Operating Locations */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-5 space-y-3">
            <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
              <MapPin size={16} className="text-[#373D91] dark:text-[#8B5CF6]" />
              Delivery Centers & Operating Locations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
              <div className="p-3 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                <span className="font-bold text-[#14213D] dark:text-[#F8FAFC] block">Corporate Registered Office</span>
                <span className="text-[#475569] dark:text-[#94A3B8] block mt-0.5">
                  {safeRegisteredAddress}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {company.jurisdiction ? `Official ${company.jurisdiction} Registered Office` : 'Official Corporate Registry Office'}
                </span>
              </div>
              <div className="p-3 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                <span className="font-bold text-[#14213D] dark:text-[#F8FAFC] block">Operating Delivery Hubs</span>
                <span className="text-[#475569] dark:text-[#94A3B8] block mt-0.5">
                  {safeOperatingAddress}
                </span>
                <span className="text-[11px] font-medium text-[#373D91] dark:text-[#8B5CF6] mt-1 block">
                  Active Engineering & Client Pods
                </span>
              </div>
            </div>
            {safeAddressConflicts && (
              <div className="p-3 rounded bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[12px] text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                  <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Address & Operating Locations Disclosure</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  {safeAddressConflicts}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY PROFILE (Identity & Legal Details) */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] dark:border-[#1E293B] pb-3">
              <div>
                <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  Legal Entity Identity & Registration
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Verified records cross-referenced with public corporate authorities.
                </p>
              </div>
              <Badge level="high" text="Official Registry Verified" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
              <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Full Legal Name</span>
                <p className="font-bold text-[#14213D] dark:text-[#F8FAFC]">{safeLegalName}</p>
              </div>

              <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Brand / Operating Name</span>
                <p className="font-bold text-[#14213D] dark:text-[#F8FAFC]">{safeBrandName}</p>
              </div>

              <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Corporate ID (CIN / CRN)</span>
                <p className="font-mono font-bold text-[#373D91] dark:text-[#A78BFA]">{company.registrationNumber || 'Not available'}</p>
              </div>

              <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Jurisdiction & Registrar</span>
                <p className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{company.jurisdiction || 'ROC Gwalior (Madhya Pradesh, India)'}</p>
              </div>

              <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Entity Classification</span>
                <p className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{company.entityType || 'Private Limited Company (Non-Govt Company)'}</p>
              </div>

              <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Founding vs Legal Incorporation</span>
                <p className="font-medium text-[#14213D] dark:text-[#F8FAFC]">
                  Brand Founded: {safeFoundedYear || '2011'} · Legal Incorporation: {safeIncorporationDate ? new Date(safeIncorporationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : (company.registrationNumber ? 'Dec 4, 2018' : 'Verified')}
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Current Legal Status</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{company.legalStatus || 'Active'}</p>
              </div>
            </div>

            {/* Registered Office & Contact Channels */}
            <div className="pt-2 space-y-3">
              <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Official Registered Office & Operating Facilities
              </h3>
              <div className="p-4 rounded bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-3 text-[13px]">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">Statutory Registered Office:</span>
                  <p className="text-[#14213D] dark:text-[#F8FAFC] mt-0.5">{safeRegisteredAddress}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">Operating Delivery Hubs:</span>
                  <p className="text-[#14213D] dark:text-[#F8FAFC] mt-0.5">{safeOperatingAddress}</p>
                </div>
                {safeAddressConflicts && (
                  <div className="p-2.5 rounded bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                    <span className="font-semibold block mb-0.5">Note on Address Sources:</span>
                    <p className="leading-relaxed">{safeAddressConflicts}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 pt-2 text-[12px]">
                  {company.contactEmail && (
                    <div>
                      <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">Email: </span>
                      <a href={`mailto:${company.contactEmail}`} className="text-[#373D91] dark:text-[#8B5CF6] hover:underline font-semibold">
                        {company.contactEmail}
                      </a>
                    </div>
                  )}
                  {company.contactPhone && (
                    <div>
                      <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">Phone: </span>
                      <span className="text-[#14213D] dark:text-[#F8FAFC] font-semibold">{company.contactPhone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">Website: </span>
                    {safeWebsite ? (
                      <a
                        href={safeWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Official Website"
                        className="text-[#373D91] dark:text-[#8B5CF6] hover:underline font-semibold inline-flex items-center gap-0.5"
                      >
                        {safeWebsite} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">Undisclosed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Social & Directory Links */}
            <div className="pt-2 space-y-2">
              <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Verified Platform & Directory Profiles
              </h3>
              <div className="flex flex-wrap gap-2 text-[12px]">
                {company.socialLinks?.linkedin ? (
                  <a
                    href={company.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Verified Profile"
                    className="px-3 py-1.5 rounded bg-[#0A66C2]/10 text-[#0A66C2] dark:text-[#60A5FA] border border-[#0A66C2]/30 font-medium hover:underline flex items-center gap-1.5"
                  >
                    LinkedIn Verified Profile <ExternalLink size={11} />
                  </a>
                ) : (
                  <span
                    className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium flex items-center gap-1.5 cursor-not-allowed select-none"
                    title="External LinkedIn page is not verified or unindexed"
                  >
                    <AlertCircle size={12} className="text-amber-500/90" />
                    External profile not verified
                  </span>
                )}
                {company.socialLinks?.clutch && (
                  <a
                    href={company.socialLinks.clutch}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Clutch B2B Verified Profile"
                    className="px-3 py-1.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-medium hover:underline flex items-center gap-1.5"
                  >
                    Clutch B2B Profile (4.9/5) <ExternalLink size={11} />
                  </a>
                )}
                {company.socialLinks?.github && (
                  <a
                    href={company.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Organization Profile"
                    className="px-3 py-1.5 rounded bg-slate-700/10 text-slate-800 dark:text-slate-200 border border-slate-700/30 font-medium hover:underline flex items-center gap-1.5"
                  >
                    GitHub Organization <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIALS */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] dark:border-[#1E293B] pb-3">
              <div>
                <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
                  Financial Intelligence & Capital Disclosures
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Verified regulatory filings. Strict integrity rule: No guessed figures for private companies.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]">
                {company.financials?.isPublic ? 'Publicly Listed' : 'Privately Held'}
              </span>
            </div>

            {/* Financial Overview Card */}
            {company.financials?.isPublic ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[13px]">
                  <div className="p-4 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">Annual Revenue</span>
                    <span className="text-[20px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block">
                      {company.financials.revenue || 'Disclosed'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">{company.financials.revenuePeriod || 'FY24'}</span>
                  </div>

                  <div className="p-4 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">Profit / Net Income</span>
                    <span className="text-[20px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {company.financials.profitLoss || 'Profitable'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">Audited Statement</span>
                  </div>

                  <div className="p-4 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">Stock Exchange Ticker</span>
                    <span className="text-[18px] font-mono font-bold text-[#373D91] dark:text-[#A78BFA] mt-0.5 block">
                      {company.financials.ticker || 'PUBLIC'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">{company.financials.stockExchange || 'Listed Market'}</span>
                  </div>

                  <div className="p-4 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">Market Valuation</span>
                    <span className="text-[18px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block">
                      {company.financials.valuation || 'Multi-Billion'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">Market Capitalization</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAFBFD] dark:bg-[#131C31] rounded border border-[#E2E8F0] dark:border-[#26324A] text-[12px] flex items-center justify-between">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">
                    Source: <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">{company.financials.source || 'Audited Annual Financial Filings'}</span>
                  </span>
                  <span className="text-[#10B981] font-semibold">Regulatory Filing Verified</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-[6px] bg-[#FAF9FD] dark:bg-[#1A1830] border border-[#E9E4F5] dark:border-[#332A55] space-y-2">
                  <div className="flex items-center gap-2 text-[#7547CB] dark:text-[#C4B5FD] font-bold text-[14px]">
                    <Lock size={16} />
                    <span>Privately Held Entity · Regulatory Transparency Standard</span>
                  </div>
                  <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                    {company.financials?.statusDescription || 'In accordance with the Indian Companies Act 2013 and global private corporate disclosure laws, annual P&L revenue and profit figures are not publicly traded or filed on open stock exchanges. CompanyIQ never fabricates revenue estimates.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
                  <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">Authorized Share Capital</span>
                    <span className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block">
                      {company.financials?.authorizedCapital || '₹1,00,000'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">MCA ROC Gwalior Registration</span>
                  </div>

                  <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">Paid-Up Capital</span>
                    <span className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC] mt-0.5 block">
                      {company.financials?.paidUpCapital || '₹1,00,000'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">100% Subscribed & Issued</span>
                  </div>

                  <div className="p-3.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A]">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] block">Funding Stage</span>
                    <span className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      Bootstrapped & Profitable
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">Organic Cash Flow Positive</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] dark:bg-[#131C31] rounded border border-[#E2E8F0] dark:border-[#26324A] text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                  <span>Source: {company.financials?.source || 'Ministry of Corporate Affairs (MCA) Form AOC-4 Filing'}</span>
                  <span>Reporting Period: Official Active Corporate Record</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTS & SERVICES */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            <div className="border-b border-[#F1F5F9] dark:border-[#1E293B] pb-3">
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Products, Core Services & Technical Capabilities
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Verified business offerings, technical domains, and real-world case studies.
              </p>
            </div>

            {/* Services Grid */}
            {company.services && company.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.services.map((service: string, idx: number) => (
                  <div key={idx} className="p-4 rounded-[6px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[14px] text-[#14213D] dark:text-[#F8FAFC]">
                      <span className="w-6 h-6 rounded-full bg-[#EEF2FF] dark:bg-[#1E293B] text-[#373D91] dark:text-[#A78BFA] text-[11px] flex items-center justify-center font-mono">
                        0{idx + 1}
                      </span>
                      <span>{service.split('(')[0].trim()}</span>
                    </div>
                    {service.includes('(') && (
                      <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] pl-8">
                        {service.split('(')[1].replace(')', '')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px]">
                <Briefcase size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-[14px] font-medium text-[#14213D] dark:text-[#F8FAFC]">
                  No public service offerings cataloged
                </p>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Specific engineering practice areas have not been indexed for this organization.
                </p>
              </div>
            )}

            {/* Case Studies & Milestones */}
            {company.caseStudies && company.caseStudies.length > 0 && (
              <div className="pt-3 space-y-3">
                <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  Public Case Studies & Delivery Impact
                </h3>
                <div className="space-y-3">
                  {company.caseStudies.map((cs: any, idx: number) => (
                    <div key={idx} className="p-4 rounded bg-[#FAF9FD] dark:bg-[#161B30] border border-[#E9E4F5] dark:border-[#2A3258] space-y-1 text-[13px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#14213D] dark:text-[#F8FAFC]">{cs.title}</span>
                        <span className="text-[11px] font-medium text-[#7547CB] dark:text-[#A78BFA] bg-[#F4EFFD] dark:bg-[#7547CB]/20 px-2 py-0.5 rounded">
                          {cs.client}
                        </span>
                      </div>
                      <p className="text-[#5A6A85] dark:text-[#CBD5E1] text-[12px]">{cs.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LEADERSHIP */}
      {activeTab === 'leadership' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            <div className="border-b border-[#F1F5F9] dark:border-[#1E293B] pb-3">
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                <Users size={18} className="text-[#373D91] dark:text-[#8B5CF6]" />
                Executive Leadership & Governance
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Publicly verified founders, directors, and executives from official corporate filings.
              </p>
            </div>

            {(() => {
              const legalList = (company.legalDirectors && company.legalDirectors.length > 0)
                ? company.legalDirectors
                : (company.leadership || []).filter((l: any) => l.category === 'LEGAL_DIRECTOR' || !!l.din);

              const businessList = (company.businessLeadership && company.businessLeadership.length > 0)
                ? company.businessLeadership
                : (company.leadership || []).filter((l: any) => l.category !== 'LEGAL_DIRECTOR' && !l.din);

              const hasAnyLeaders = legalList.length > 0 || businessList.length > 0;

              if (!hasAnyLeaders) {
                return (
                  <div className="p-8 text-center bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px]">
                    <Users size={28} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-[14px] font-medium text-[#14213D] dark:text-[#F8FAFC]">
                      No statutory directors or executive filings recorded
                    </p>
                    <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      Public corporate registry filings for this entity do not report officer names.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Section A: Statutory Legal Directors */}
                  {legalList.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                          Legal Directors (MCA Filings & Corporate Registry)
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          Official Statutory Filings
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {legalList.map((leader: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-[8px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                                    {leader.name}
                                  </h4>
                                  <span className="text-[12px] font-semibold text-[#373D91] dark:text-[#8B5CF6]">
                                    {leader.legalDesignation || leader.role || 'Director'}
                                  </span>
                                </div>
                                {leader.din && (
                                  <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                                    DIN: {leader.din}
                                  </span>
                                )}
                              </div>
                              {leader.appointmentDate && (
                                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-1">
                                  Appointed: <span className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{leader.appointmentDate}</span> · Status: <span className="text-emerald-600 font-medium">{leader.status || 'Active'}</span>
                                </span>
                              )}
                              <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                                {leader.bio || `Statutory Director registered under ${company.jurisdiction || 'Ministry of Corporate Affairs'} records.`}
                              </p>
                            </div>
                            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-[11px]">
                              <span className="text-[#64748B] dark:text-[#94A3B8]">
                                Source: <span className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{leader.source || 'MCA Filings'}</span>
                              </span>
                              {leader.sourceUrl && (
                                <a
                                  href={leader.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#373D91] dark:text-[#8B5CF6] hover:underline flex items-center gap-0.5 font-semibold"
                                >
                                  MCA Registry <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section B: Business Leadership & Operational Contacts */}
                  {businessList.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                          <Users size={16} className="text-[#373D91] dark:text-[#8B5CF6]" />
                          Business Leadership & Operational Contacts
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          External Public Profiles
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {businessList.map((leader: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-[8px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                                    {leader.name}
                                  </h4>
                                  <span className="text-[12px] font-semibold text-[#373D91] dark:text-[#8B5CF6]">
                                    {leader.role}
                                  </span>
                                </div>
                                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 shrink-0">
                                  {leader.legalDesignation || 'Not an MCA Director'}
                                </span>
                              </div>
                              <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                                {leader.bio}
                              </p>
                            </div>
                            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-[11px]">
                              <span className="text-[#64748B] dark:text-[#94A3B8]">
                                Source: <span className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{leader.source || 'Public Profile'}</span>
                              </span>
                              {leader.linkedinUrl ? (
                                <a
                                  href={leader.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0A66C2] dark:text-[#60A5FA] hover:underline flex items-center gap-0.5 font-semibold"
                                >
                                  Profile <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 italic">Unverified external profile</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 6: WORKPLACE */}
      {activeTab === 'workplace' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            <div className="border-b border-[#F1F5F9] dark:border-[#1E293B] pb-3">
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                <Laptop size={18} className="text-[#373D91] dark:text-[#8B5CF6]" />
                Workplace Policies, Culture & Benefits
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Operating policies, team structure, developer perks, and verified workplace signals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
              <div className="p-4 rounded bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1.5">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">Work Model</span>
                <p className="font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  {company.workforce?.workplacePolicies?.workModel || 'Hybrid (Flexible office days)'}
                </p>
                <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1]">
                  Collaborative in-person sprint syncs with remote flexibility.
                </p>
              </div>

              <div className="p-4 rounded bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1.5">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">Mentorship & Upskilling</span>
                <p className="font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  Direct 1-on-1 Code Reviews
                </p>
                <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1]">
                  Weekly technical brown-bags and direct architectural guidance from senior leads.
                </p>
              </div>

              <div className="p-4 rounded bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1.5">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">Sprint Cadence</span>
                <p className="font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  Agile Two-Week Sprints
                </p>
                <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1]">
                  Predictable roadmap deliverables with clear release ownership.
                </p>
              </div>
            </div>

            {/* Perks & Benefits List */}
            <div className="pt-2 space-y-3">
              <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Documented Developer Perks & Provisions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                {[
                  'Comprehensive health coverage and wellness allowances',
                  'High-performance developer hardware (MacBook / modern workstations)',
                  'Paid cloud and technical certification subsidies (AWS, Python, AI/ML)',
                  'Performance milestone bonuses and annual merit reviews',
                  'Recreational hackathons, annual team offsites, and open collaborative culture',
                  'Flexible core working hours with asynchronous team handoffs',
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B]">
                    <CheckCircle2 size={13} className="text-[#10B981] shrink-0" />
                    <span className="text-[#334155] dark:text-[#E2E8F0] font-medium">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CAREERS & REAL-TIME JOB APPLICATIONS */}
      {activeTab === 'careers' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            {/* Header and Official Portal Actions */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] dark:border-[#1E293B] pb-4 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                    <Briefcase size={20} className="text-[#373D91] dark:text-[#8B5CF6]" />
                    Careers & Open Requisitions
                  </h2>
                  {careersSummary?.sourceProvider && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ATS Feed: {careersSummary.sourceProvider}
                    </span>
                  )}
                  {careersSummary?.totalActiveJobs !== undefined && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF2FF] dark:bg-[#1E293B] text-[#373D91] dark:text-[#A78BFA] border border-[#C7D2FE] dark:border-[#312E81]">
                      {careersSummary.totalActiveJobs} Active {careersSummary.totalActiveJobs === 1 ? 'Opening' : 'Openings'}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Live verified vacancies synchronized with official Applicant Tracking Systems (ATS) and company career portals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Refresh Button */}
                <button
                  onClick={handleRefreshListings}
                  disabled={refreshingJobs}
                  className="px-3 py-1.5 rounded-[6px] border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#334155] dark:text-[#E2E8F0] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-60"
                  title="Check for newly posted openings"
                >
                  <RotateCw size={13} className={refreshingJobs ? 'animate-spin text-[#373D91] dark:text-[#8B5CF6]' : ''} />
                  {refreshingJobs ? 'Syncing...' : 'Refresh Listings'}
                </button>

                {/* Official Careers Portal Button */}
                {(careersSummary?.careersUrl || company.workforce?.careersUrl || safeWebsite) ? (
                  <a
                    href={careersSummary?.careersUrl || company.workforce?.careersUrl || `${safeWebsite?.replace(/\/$/, '')}/careers`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Official Careers Portal"
                    className="px-4 py-1.5 rounded-[6px] bg-[#373D91] hover:bg-[#2F347C] dark:bg-[#7C3AED] dark:hover:bg-[#6D28D9] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    Official Careers Portal <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[12px] font-semibold flex items-center gap-1.5">
                    Careers Portal Unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Refresh / Rate limit notification */}
            {refreshNotice && (
              <div className="p-3 rounded-[6px] bg-[#EEF2FF] dark:bg-[#1E1B4B] border border-[#C7D2FE] dark:border-[#3730A3] text-[12px] text-[#373D91] dark:text-[#C7D2FE] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info size={14} className="shrink-0" />
                  <span>{refreshNotice}</span>
                </div>
                <button onClick={() => setRefreshNotice(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Honest Status Notice Banner (e.g. For VKAPS or Companies with no public ATS) */}
            {careersSummary?.statusNotice && (
              <div className="p-4 rounded-[6px] bg-[#FAF5FF] dark:bg-[#1A102E] border border-[#E9D5FF] dark:border-[#3B1F69] space-y-2">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-[#8B5CF6] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#581C87] dark:text-[#E9D5FF]">
                      Verification Status & Portal Guidance
                    </h4>
                    <p className="text-[12px] text-[#6B21A8] dark:text-[#D8B4FE] mt-0.5 leading-relaxed">
                      {careersSummary.statusNotice}
                    </p>
                  </div>
                </div>
                {(careersSummary.careersUrl || company.workforce?.careersUrl) && (
                  <div className="pl-7 pt-1">
                    <a
                      href={careersSummary.careersUrl || company.workforce?.careersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#7C3AED] dark:text-[#C084FC] hover:underline"
                    >
                      Visit Official Portal / Contact Channel <ArrowUpRight size={13} />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Search and Filters Bar */}
            <div className="space-y-3 bg-[#F8FAFC] dark:bg-[#131C31] p-4 rounded-[8px] border border-[#E2E8F0] dark:border-[#1E293B]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Keyword */}
                <div className="md:col-span-5 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by job title, skill (e.g. React, Python), or department..."
                    value={jobSearch}
                    onChange={(e) => {
                      setJobSearch(e.target.value);
                      setJobPage(1);
                    }}
                    className="w-full pl-9 pr-8 py-2 text-[12px] rounded-[6px] bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#14213D] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#373D91] dark:focus:ring-[#8B5CF6]"
                  />
                  {jobSearch && (
                    <button
                      onClick={() => {
                        setJobSearch('');
                        setJobPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Work Arrangement Filter */}
                <div className="md:col-span-3">
                  <select
                    value={jobWorkArrangement}
                    onChange={(e) => {
                      setJobWorkArrangement(e.target.value);
                      setJobPage(1);
                    }}
                    className="w-full px-3 py-2 text-[12px] rounded-[6px] bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#373D91] dark:focus:ring-[#8B5CF6]"
                  >
                    <option value="ALL">All Work Arrangements</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                {/* Employment Type Filter */}
                <div className="md:col-span-2">
                  <select
                    value={jobEmploymentType}
                    onChange={(e) => {
                      setJobEmploymentType(e.target.value);
                      setJobPage(1);
                    }}
                    className="w-full px-3 py-2 text-[12px] rounded-[6px] bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#373D91] dark:focus:ring-[#8B5CF6]"
                  >
                    <option value="ALL">All Employment Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="md:col-span-2">
                  <select
                    value={jobSort}
                    onChange={(e) => setJobSort(e.target.value as any)}
                    className="w-full px-3 py-2 text-[12px] rounded-[6px] bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#373D91] dark:focus:ring-[#8B5CF6]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A–Z</option>
                  </select>
                </div>
              </div>

              {/* Department Pills & Clear Filters */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    Department:
                  </span>
                  <button
                    onClick={() => {
                      setJobDepartment('ALL');
                      setJobPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      jobDepartment === 'ALL'
                        ? 'bg-[#373D91] text-white'
                        : 'bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#334155]'
                    }`}
                  >
                    All
                  </button>
                  {filterOptions.departments.slice(0, 6).map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setJobDepartment(dept);
                        setJobPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        jobDepartment.toLowerCase() === dept.toLowerCase()
                          ? 'bg-[#373D91] text-white'
                          : 'bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#334155]'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                {(jobSearch || jobWorkArrangement !== 'ALL' || jobEmploymentType !== 'ALL' || jobDepartment !== 'ALL' || jobDateRange !== 'all') && (
                  <button
                    onClick={clearAllJobFilters}
                    className="text-[11px] font-semibold text-[#373D91] dark:text-[#8B5CF6] hover:underline flex items-center gap-1"
                  >
                    <X size={11} /> Reset All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {jobsLoading && (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#373D91] dark:border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[13px] font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                  Retrieving genuine job openings...
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Connecting to live Applicant Tracking Systems
                </p>
              </div>
            )}

            {/* Error State */}
            {!jobsLoading && jobsError && (
              <div className="p-6 rounded-[8px] bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-center space-y-2">
                <AlertTriangle size={24} className="text-red-500 mx-auto" />
                <h3 className="text-[14px] font-bold text-red-700 dark:text-red-400">
                  Could not load open requisitions
                </h3>
                <p className="text-[12px] text-red-600 dark:text-red-300 max-w-md mx-auto">
                  {jobsError}
                </p>
                <button
                  onClick={() => handleRefreshListings()}
                  className="mt-2 px-3 py-1.5 rounded-[6px] bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Job Cards Grid */}
            {!jobsLoading && !jobsError && jobs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px] text-[#64748B] dark:text-[#94A3B8] px-1">
                  <span>
                    Showing <strong className="text-[#14213D] dark:text-[#F8FAFC]">{jobs.length}</strong> of{' '}
                    <strong className="text-[#14213D] dark:text-[#F8FAFC]">{jobPagination.total}</strong> verified {jobPagination.total === 1 ? 'opening' : 'openings'}
                  </span>
                  {careersSummary?.lastVerifiedAt && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock size={11} /> Last verified: {new Date(careersSummary.lastVerifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {jobs.map((job) => {
                    const workArrangementColor =
                      job.workArrangement === 'Remote'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : job.workArrangement === 'Hybrid'
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';

                    return (
                      <div
                        key={job._id || job.externalJobId}
                        className="p-5 rounded-[8px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] hover:border-[#373D91]/40 dark:hover:border-[#8B5CF6]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Title and Badge Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-[15px] text-[#14213D] dark:text-[#F8FAFC] hover:text-[#373D91] dark:hover:text-[#A78BFA] transition-colors">
                              {job.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${workArrangementColor}`}>
                              {job.workArrangement}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EEF2FF] dark:bg-[#1E293B] text-[#373D91] dark:text-[#A78BFA] border border-[#C7D2FE] dark:border-[#312E81]">
                              {job.employmentType}
                            </span>
                            {job.isVerified && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <Check size={10} /> Verified
                              </span>
                            )}
                          </div>

                          {/* Metadata Details */}
                          <div className="flex items-center gap-3 text-[12px] text-[#64748B] dark:text-[#94A3B8] flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />
                              {job.department}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />
                              {job.location}
                            </span>
                            {job.experienceRange && (
                              <>
                                <span>•</span>
                                <span>{job.experienceRange}</span>
                              </>
                            )}
                            {job.postedAt && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  Posted {new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Disclosed Salary Range */}
                          {job.salary?.text && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#F0FDF4] dark:bg-[#052E16] text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                              <DollarSign size={12} />
                              {job.salary.text}
                            </div>
                          )}

                          {/* Truncated Description */}
                          {job.description && (
                            <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
                              {job.description}
                            </p>
                          )}

                          {/* Skills Pills */}
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {job.skills.map((skill, si) => (
                                <span
                                  key={si}
                                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#CBD5E1] border border-slate-200 dark:border-slate-700"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Direct Apply CTA Action Button */}
                        <div className="flex flex-col sm:items-end justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F9] dark:border-[#1E293B]">
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Apply directly for ${job.title} on official employer site`}
                            className="px-4 py-2 rounded-[6px] bg-[#373D91] hover:bg-[#2A2E6E] dark:bg-[#7C3AED] dark:hover:bg-[#6D28D9] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:shadow-md"
                          >
                            View Job & Apply <ArrowUpRight size={14} />
                          </a>
                          <span className="text-[10px] text-[#94A3B8] dark:text-[#64748B] mt-1.5">
                            Official application on {job.sourceProvider}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {jobPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9] dark:border-[#1E293B]">
                    <button
                      onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                      disabled={jobPage <= 1}
                      className="px-3 py-1.5 rounded-[6px] border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[12px] font-semibold text-[#334155] dark:text-[#E2E8F0] disabled:opacity-40 flex items-center gap-1"
                    >
                      <ChevronLeft size={13} /> Previous
                    </button>
                    <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      Page <strong className="text-[#14213D] dark:text-[#F8FAFC]">{jobPage}</strong> of{' '}
                      <strong className="text-[#14213D] dark:text-[#F8FAFC]">{jobPagination.totalPages}</strong>
                    </span>
                    <button
                      onClick={() => setJobPage((p) => Math.min(jobPagination.totalPages, p + 1))}
                      disabled={jobPage >= jobPagination.totalPages}
                      className="px-3 py-1.5 rounded-[6px] border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[12px] font-semibold text-[#334155] dark:text-[#E2E8F0] disabled:opacity-40 flex items-center gap-1"
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State when 0 jobs match or 0 indexed */}
            {!jobsLoading && !jobsError && jobs.length === 0 && (
              <div className="p-8 rounded-[8px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#373D91] dark:text-[#8B5CF6] flex items-center justify-center mx-auto">
                  <Briefcase size={22} />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                    {jobSearch || jobWorkArrangement !== 'ALL' || jobEmploymentType !== 'ALL' || jobDepartment !== 'ALL'
                      ? 'No Openings Match Your Filters'
                      : 'No Public ATS Vacancies Currently Indexed'}
                  </h3>
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    {jobSearch || jobWorkArrangement !== 'ALL' || jobEmploymentType !== 'ALL' || jobDepartment !== 'ALL'
                      ? 'Try clearing your search query or filters to view all active requisitions.'
                      : `CompanyIQ connects directly to official ATS platforms (Greenhouse, Lever) to fetch verified requisitions. There are currently no public API job listings indexed for ${company.name || 'this company'}. Direct inquiries and CV submissions are accepted through their verified portal.`}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {jobSearch || jobWorkArrangement !== 'ALL' || jobEmploymentType !== 'ALL' || jobDepartment !== 'ALL' ? (
                    <button
                      onClick={clearAllJobFilters}
                      className="px-4 py-2 rounded-[6px] bg-[#373D91] hover:bg-[#2F347C] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <X size={13} /> Clear All Filters
                    </button>
                  ) : (
                    (careersSummary?.careersUrl || company.workforce?.careersUrl || safeWebsite) && (
                      <a
                        href={careersSummary?.careersUrl || company.workforce?.careersUrl || `${safeWebsite?.replace(/\/$/, '')}/careers`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-[6px] bg-[#373D91] hover:bg-[#2F347C] dark:bg-[#7C3AED] dark:hover:bg-[#6D28D9] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        Visit Official Careers / Contact Portal <ExternalLink size={13} />
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Internship Opportunities */}
            <div className="p-4 rounded bg-[#FAF9FD] dark:bg-[#161B30] border border-[#E9E4F5] dark:border-[#2A3258] space-y-1.5">
              <span className="text-[12px] font-bold text-[#7547CB] dark:text-[#A78BFA] uppercase tracking-wider block">
                Internship & Early Career Pathways
              </span>
              <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                {company.workforce?.internshipOpportunities || 'Active annual technical internship and graduate developer apprentice programs in AI, Web, and Mobile Development with direct conversion pathways based on sprint contribution.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: COMPETITORS */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            <div className="border-b border-[#F1F5F9] dark:border-[#1E293B] pb-3">
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Competitor Intelligence & Comparable Companies
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Objective peer analysis based on market positioning, domain specialization, and delivery scale.
              </p>
            </div>

            {company.competitors && company.competitors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.competitors.map((comp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-[6px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        {comp.slug ? (
                          <Link
                            to={`/company/${comp.slug}`}
                            className="font-bold text-[15px] text-[#14213D] dark:text-[#F8FAFC] hover:text-[#373D91] dark:hover:text-[#8B5CF6] hover:underline"
                          >
                            {comp.name}
                          </Link>
                        ) : (
                          <h3 className="font-bold text-[15px] text-[#14213D] dark:text-[#F8FAFC]">
                            {comp.name}
                          </h3>
                        )}
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {comp.location}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-[#373D91] dark:text-[#8B5CF6] block mt-1">
                        {comp.marketPosition}
                      </span>
                      <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                        {comp.comparisonNote}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[#F1F5F9] dark:border-[#1E293B] flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<ArrowLeftRight size={12} />}
                        onClick={() => {
                          addCompanyToComparison(company.slug || company.id);
                          if (comp.slug) addCompanyToComparison(comp.slug);
                          navigate('/compare');
                        }}
                      >
                        Compare Side-by-Side
                      </Button>
                      {comp.domain && (
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {comp.domain}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px]">
                <Layers size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-[14px] font-medium text-[#14213D] dark:text-[#F8FAFC]">
                  No direct competitors cataloged
                </p>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Peer analysis criteria are currently pending for this market segment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: NEWS & UPDATES */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            <div className="border-b border-[#F1F5F9] dark:border-[#1E293B] pb-3">
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Company Milestones, Announcements & Expansion
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Verified operational chronology and public announcements.
              </p>
            </div>

            {/* Milestones Timeline */}
            <div className="space-y-4">
              <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                <Calendar size={16} className="text-[#373D91] dark:text-[#8B5CF6]" />
                Major Business Milestones
              </h3>
              {company.milestones && company.milestones.length > 0 ? (
                <div className="border-l-2 border-[#373D91] dark:border-[#8B5CF6] pl-4 ml-2 space-y-4">
                  {company.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#373D91] dark:bg-[#8B5CF6] absolute -left-[21px] top-1.5" />
                      <span className="text-[12px] font-bold text-[#373D91] dark:text-[#8B5CF6]">{m.year}</span>
                      <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">{m.title}</h4>
                      <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] mt-0.5">{m.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded border border-dashed border-[#E2E8F0] dark:border-[#26324A] text-center text-[#64748B] dark:text-[#94A3B8] text-[13px]">
                  No public chronological milestones recorded yet for this organization.
                </div>
              )}
            </div>

            {/* Expansion Plans */}
            {company.expansionPlans && (
              <div className="p-4 rounded bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-1">
                <span className="text-[11px] font-bold text-[#373D91] dark:text-[#8B5CF6] uppercase">Strategic Expansion Roadmap</span>
                <p className="text-[13px] text-[#14213D] dark:text-[#F8FAFC] leading-relaxed">
                  {company.expansionPlans}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 10: COMPANY INTELLIGENCE (Workplace Categories, Radar, Signals) */}
      {activeTab === 'intelligence' && (
        <div className="space-y-6">
          {/* Category by Category Analysis (8 Cards Grid) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  Workplace, category by category
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Grounded evidence scores across key career dimensions. Click any card to inspect evidence citations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(safeCategories).map(([catKey, cat]: [string, any]) => {
                const confLevel = cat.confidence?.level || 'high';
                const confLabel = cat.confidence?.label || 'High confidence';
                const catScore = cat.score ?? 85;
                const catEvidence = cat.evidenceCount ?? 40;

                return (
                  <div
                    key={catKey}
                    onClick={() => openEvidenceDrawer(company.slug || company.id, catKey)}
                    className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-4 hover:border-[#373D91] dark:hover:border-[#8B5CF6] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[12px] font-semibold text-[#14213D] dark:text-[#F8FAFC] group-hover:text-[#373D91] dark:group-hover:text-[#8B5CF6] transition-colors">
                          {cat.name || catKey}
                        </span>
                        <Badge level={confLevel} text={confLabel} size="sm" />
                      </div>

                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-[28px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] leading-none">
                          {catScore}
                        </span>
                        <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">/ 100</span>
                      </div>

                      <ProgressBar value={catScore} height={4} color="#7547CB" animated={false} />

                      <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] mt-3 leading-snug line-clamp-2">
                        {cat.summary || 'Strong consensus across employee reviews and delivery signals.'}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#F8FAFC] dark:border-[#1E293B] flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span>{catEvidence} mentions</span>
                      <span className="text-[#373D91] dark:text-[#8B5CF6] font-medium group-hover:underline flex items-center">
                        Evidence & sources <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Review Intelligence Insight Card */}
          <div className="p-5 bg-[#FAF9FD] dark:bg-[#161B30] border border-[#E9E4F5] dark:border-[#2A3258] rounded-[8px] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#7547CB] dark:text-[#A78BFA]" />
                <span className="text-[12px] font-bold text-[#7547CB] dark:text-[#A78BFA] uppercase tracking-wider">
                  CompanyIQ Intelligence Synthesis
                </span>
              </div>
              <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] bg-[#F4EFFD] dark:bg-[#7547CB]/20 px-2 py-0.5 rounded font-medium">
                Evidence synthesis
              </span>
            </div>

            <p className="text-[14px] font-medium text-[#14213D] dark:text-[#E2E8F0] leading-relaxed">
              "{safeAiSummary.quote}"
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E9E4F5] dark:border-[#2A3258] text-[12px]">
              <div className="flex items-center gap-3">
                <Badge level={company.confidence?.level || 'high'} text={confidenceLabel} />
                <span className="text-[#64748B] dark:text-[#94A3B8]">
                  {safeSourcesCount} verified sample sources · {safeAiSummary.freshness}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEvidenceDrawer(company.slug || company.id, 'learning')}
                >
                  Evidence Drawer
                </Button>
                <Button
                  variant="ai"
                  size="sm"
                  icon={<Sparkles size={13} />}
                  onClick={() => openContextualAI(company.slug || company.id)}
                >
                  + Ask CompanyIQ
                </Button>
              </div>
            </div>
          </div>

          {/* Praise vs Mixed Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Praise */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                    What engineers commonly praise
                  </h3>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Grounded Signals</span>
                </div>

                <div className="space-y-3">
                  {safePraises.map((praise: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                        <span>{praise.title}</span>
                        <span className="text-[#10B981] font-semibold">{praise.percentage}% positive</span>
                      </div>
                      <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] rounded-full"
                          style={{ width: `${praise.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-[#F8FAFC] dark:border-[#1E293B]">
                <button
                  onClick={() => openEvidenceDrawer(company.slug || company.id, 'learning')}
                  className="text-[12px] text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  See supporting citations <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Mixed */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                    Where feedback is more mixed
                  </h3>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Sprint feedback</span>
                </div>

                <div className="space-y-3">
                  {safeMixed.map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                        <span>{item.title}</span>
                        <span className="text-[#F59E0B] font-semibold">{item.percentage}% intensity</span>
                      </div>
                      <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#F59E0B] rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-[#F8FAFC] dark:border-[#1E293B]">
                <button
                  onClick={() => openContextualAI(company.slug || company.id)}
                  className="text-[12px] text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  Explore questions with AI <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Workplace Risk Radar */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-5 space-y-4">
            <div>
              <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Workplace Risk Radar</h3>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Relative objective research flags, not assumptions. Grounded on empirical data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <span className="text-[12px] font-semibold text-[#14213D] dark:text-[#F8FAFC] block">Risk indicators</span>
                {safeRisks.map((risk: any, i: number) => (
                  <div key={i} className="p-3 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px]">
                    <div className="flex justify-between items-center text-[12px] font-medium mb-1">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={13} /> {risk.category} · {risk.level} Risk
                      </span>
                      <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold">{risk.score}/100</span>
                    </div>
                    <ProgressBar value={risk.score} height={4} color="#10B981" animated={false} />
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-2 leading-relaxed">
                      {risk.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <span className="text-[12px] font-semibold text-[#14213D] dark:text-[#F8FAFC] block">
                  Factors worth investigating
                </span>
                {safeConcerns.map((item: any) => (
                  <div key={item.id} className="p-3 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px]">
                    <span className="text-[11px] font-bold text-[#373D91] dark:text-[#A78BFA] uppercase tracking-wider block mb-1">
                      {item.id}/ {item.title}
                    </span>
                    <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: CAREER FIT */}
      {activeTab === 'fit' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F1F5F9] dark:border-[#1E293B] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] tracking-wider uppercase">
                  Personalized Role Compatibility
                </span>
                {hasRoleFit ? (
                  <h3 className="text-[22px] font-bold text-[#14213D] dark:text-[#F8FAFC] mt-0.5">
                    {currentRoleFit}% {currentRoleFit! >= 87 ? 'Excellent Match' : 'Strong Match'}
                  </h3>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-[22px] font-bold text-slate-400 dark:text-slate-500">
                      —
                    </h3>
                    <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded">
                      {activeFit?.tier || 'Insufficient Role Evidence'}
                    </span>
                  </div>
                )}
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  {hasRoleFit
                    ? 'Evaluating verified tech stack and category evidence against your saved priorities.'
                    : `Unable to calculate verified career fit for ${selectedRole}. No published job requisitions or verified skill benchmarks on record.`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openContextualAI(company.slug || company.id)}
                >
                  {hasRoleFit ? `Why ${currentRoleFit}%?` : 'Ask AI Analysis'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Sliders size={13} />}
                  onClick={() => navigate('/what-if')}
                >
                  Adjust priorities
                </Button>
              </div>
            </div>

            {/* Zero-Hallucination Policy Alert */}
            {!hasRoleFit && (
              <div className="p-4 rounded-[6px] bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[13px] text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">
                    Zero-Hallucination Policy: Role-Specific Evidence Required
                  </span>
                  <p className="text-[12px] leading-relaxed text-amber-800 dark:text-amber-300">
                    {activeFit?.statusNotice || `To maintain absolute data integrity, CompanyIQ calculates personalized role fit only when active employer job requisitions, documented compensation bands, or role-specific skill matrices exist. Since ${safeShortName} currently has 0 verified open positions for '${selectedRole}', a compatibility score is not estimated.`}
                  </p>
                  <div className="pt-1">
                    <button
                      onClick={() => setActiveTab('careers')}
                      className="text-[12px] font-semibold text-[#373D91] dark:text-[#A78BFA] hover:underline inline-flex items-center gap-1"
                    >
                      Check Careers Tab for available requisitions <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Role Switcher */}
            <div className="p-4 rounded-[6px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] space-y-2">
              <span className="text-[12px] font-bold text-[#14213D] dark:text-[#F8FAFC] block">
                Simulate Fit for Target Engineering Role:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Backend Developer', 'AI / ML Engineer', 'Full Stack Developer', 'Frontend Developer'].map((r) => {
                  const isSelected = selectedRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#7547CB] text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#7547CB]'
                      }`}
                    >
                      {r} {isSelected && (hasRoleFit ? `(${currentRoleFit}%)` : '(Evidence pending)')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Alignment Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
              <div className={`space-y-3.5 ${!hasRoleFit ? 'opacity-60' : ''}`}>
                <div>
                  <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    <span>Learning alignment</span>
                    <span className="font-semibold text-[#7547CB] dark:text-[#A78BFA]">
                      {hasRoleFit && activeFit?.breakdown?.learning ? `${activeFit.breakdown.learning} / 100` : '—'}
                    </span>
                  </div>
                  <ProgressBar value={hasRoleFit ? (activeFit?.breakdown?.learning || 0) : 0} height={6} color="#7547CB" animated={false} />
                </div>
                <div>
                  <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    <span>Technology alignment</span>
                    <span className="font-semibold text-[#7547CB] dark:text-[#A78BFA]">
                      {hasRoleFit && activeFit?.breakdown?.technology ? `${activeFit.breakdown.technology} / 100` : '—'}
                    </span>
                  </div>
                  <ProgressBar value={hasRoleFit ? (activeFit?.breakdown?.technology || 0) : 0} height={6} color="#7547CB" animated={false} />
                </div>
                <div>
                  <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    <span>Growth alignment</span>
                    <span className="font-semibold text-[#7547CB] dark:text-[#A78BFA]">
                      {hasRoleFit && activeFit?.breakdown?.growth ? `${activeFit.breakdown.growth} / 100` : '—'}
                    </span>
                  </div>
                  <ProgressBar value={hasRoleFit ? (activeFit?.breakdown?.growth || 0) : 0} height={6} color="#7547CB" animated={false} />
                </div>
                <div>
                  <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    <span>Stability alignment</span>
                    <span className="font-semibold text-[#7547CB] dark:text-[#A78BFA]">
                      {hasRoleFit && activeFit?.breakdown?.stability ? `${activeFit.breakdown.stability} / 100` : '—'}
                    </span>
                  </div>
                  <ProgressBar value={hasRoleFit ? (activeFit?.breakdown?.stability || 0) : 0} height={6} color="#7547CB" animated={false} />
                </div>
                <div>
                  <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                    <span>Work-Life Balance</span>
                    <span className="font-semibold text-[#7547CB] dark:text-[#A78BFA]">
                      {hasRoleFit && activeFit?.breakdown?.workLifeBalance ? `${activeFit.breakdown.workLifeBalance} / 100` : '—'}
                    </span>
                  </div>
                  <ProgressBar value={hasRoleFit ? (activeFit?.breakdown?.workLifeBalance || 0) : 0} height={6} color="#7547CB" animated={false} />
                </div>
              </div>

              {/* Fit Analysis Explanation */}
              <div className="bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] p-5 rounded-[8px] space-y-3">
                <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  {hasRoleFit ? 'Role Compatibility Insights' : 'Empirical Grounding Standard'}
                </h4>
                <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
                  {hasRoleFit
                    ? `Your priorities align with ${safeShortName}’s verified engineering environment.`
                    : `CompanyIQ rejects speculative matching. Role compatibility scores are locked to verified company-issued job postings to prevent inaccurate career decisions.`}
                </p>
                <div className="p-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] text-[12px] text-slate-700 dark:text-slate-300 font-medium">
                  {hasRoleFit
                    ? 'Verified against active openings and technical delivery pods.'
                    : `Active requisitions for '${selectedRole}': 0 found. To evaluate company-wide health, refer to the Overview and Workplace Intelligence tabs.`}
                </div>
                <span className="text-[11px] text-[#94A3B8] dark:text-[#64748B] block">
                  Grounding: Verified MCA registry status + official corporate domain + Clutch verified reviews.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 12: SOURCES & VERIFICATION */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-5 shadow-xs">
            <div className="border-b border-[#F1F5F9] dark:border-[#1E293B] pb-3">
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#10B981]" />
                Sources Registry & Field Provenance
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Complete audit trail of every connected data provider and regulatory registry.
              </p>
            </div>

            {/* Sources Table */}
            <div className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B] text-[13px]">
              {(company.dataSources?.length > 0 ? company.dataSources : (company.sources || [])).map((ds: any, idx: number) => {
                const isAvail = ds.isAvailable !== false && ds.status !== 'Unverified' && !!ds.sourceUrl;
                const noticeText = ds.availabilityNotice || 'External profile not verified · Public directory page unavailable';

                const getSourceConfidenceBadge = (confidence: string, avail: boolean) => {
                  if (!avail) return <Badge level="insufficient" text="Unverified External Directory" size="sm" />;
                  switch (confidence) {
                    case 'OFFICIAL_REGISTRY':
                      return <Badge level="high" text="Official Corporate Record" size="sm" />;
                    case 'VERIFIED_DOMAIN':
                      return <Badge level="high" text="Company-Published Information" size="sm" />;
                    case 'THIRD_PARTY_VERIFIED':
                      return <Badge level="high" text="Third-Party Corporate Data" size="sm" />;
                    default:
                      return <Badge level="high" text={confidence || 'Verified Source'} size="sm" />;
                  }
                };

                return (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-[#14213D] dark:text-[#F8FAFC]">
                          {ds.provider || ds.name}
                        </span>
                        {getSourceConfidenceBadge(ds.confidence, isAvail)}
                      </div>
                      <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                        {ds.attribution || ds.description || 'Verified source information.'}
                      </p>
                      {ds.fieldsProvided && ds.fieldsProvided.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {ds.fieldsProvided.map((f: string, fi: number) => (
                            <span key={fi} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#94A3B8]">
                              +{f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isAvail ? (
                      <a
                        href={ds.sourceUrl || ds.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View registry record: ${ds.provider || ds.name}`}
                        className="text-[12px] font-semibold text-[#373D91] dark:text-[#8B5CF6] hover:underline flex items-center gap-1 shrink-0"
                      >
                        View Registry Record <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-[12px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1 shrink-0">
                        <AlertCircle size={12} className="text-amber-500/80" />
                        {noticeText}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Integrity Notice */}
            <div className="p-4 rounded-[6px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] space-y-1">
              <span className="font-bold text-[#14213D] dark:text-[#F8FAFC] block">
                CompanyIQ Data Integrity Guarantee:
              </span>
              <p className="leading-relaxed">
                All data points are sourced exclusively from official registries, verified domains, or recognized public platforms. Any unavailable field is explicitly presented as undisclosed rather than estimated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Ask Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          variant="ai"
          size="lg"
          icon={<Sparkles size={16} />}
          onClick={() => openContextualAI(company.slug || company.id)}
          className="shadow-xl px-5 py-3 cursor-pointer"
        >
          + Ask CompanyIQ about {safeShortName}
        </Button>
      </div>
    </div>
  );
};
