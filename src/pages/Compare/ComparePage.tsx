import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { ComparisonResult, Company } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CompanySelectModal } from '../../components/modals/CompanySelectModal';
import {
  Swords,
  Bookmark,
  ShieldCheck,
  X,
  Plus,
  RotateCcw,
  Building2,
  Sparkles,
  Trophy,
  ArrowRight,
  Info,
  Layers,
  MapPin,
  ExternalLink,
  Flame,
  TableProperties,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    comparisonCompanies,
    setComparisonCompanies,
    removeCompanyFromComparison,
    addCompanyToComparison,
    careerDNA,
    saveScenario,
    openEvidenceDrawer,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'table' | 'battle'>('table');
  const [tableSubMode, setTableSubMode] = useState<'intelligence' | 'fit'>('intelligence');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real comparison from backend API whenever comparisonCompanies or careerDNA changes
  useEffect(() => {
    let isMounted = true;
    if (comparisonCompanies.length >= 2) {
      setLoading(true);
      setError(null);
      apiClient
        .calculateComparison(comparisonCompanies, careerDNA.priorities)
        .then((res) => {
          if (isMounted) {
            if (res.success && res.data) {
              setComparisonResult(res.data);
            } else {
              setError(res.message || 'Failed to calculate comparison');
            }
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Error connecting to comparison service');
            setLoading(false);
          }
        });
    } else {
      setComparisonResult(null);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [comparisonCompanies, careerDNA.priorities]);

  const companies = comparisonResult?.companies || [];

  const handleSaveCurrentComparison = async () => {
    if (comparisonCompanies.length < 2) return;
    const titles = companies.length ? companies.map((c) => c.shortName).join(' vs ') : comparisonCompanies.join(' vs ');
    await saveScenario({
      title: `${titles} · Comparison`,
      description:
        comparisonResult?.rankings?.map((r) => `${r.companyName} ${r.score}%`).join(' · ') ||
        'Custom comparison scenario',
      companies: comparisonCompanies,
      companyIds: comparisonCompanies,
      priorities: careerDNA.priorities,
      scenarioType: 'comparison',
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3500);
  };

  const handleSelectCompanyFromModal = (company: Company) => {
    const id = company.slug || company.id;
    addCompanyToComparison(id);
  };

  const quickStartCohorts = [
    {
      title: 'Startup Agility vs. Enterprise Scale',
      subtitle: 'VKAPS IT Solutions vs. TCS',
      companies: ['vkaps-it-solutions', 'tcs'],
      tag: 'Startup vs Enterprise',
    },
    {
      title: 'Agile Tech Firm vs. IT Giant',
      subtitle: 'VKAPS IT Solutions vs. Infosys',
      companies: ['vkaps-it-solutions', 'infosys'],
      tag: 'Culture & Growth',
    },
    {
      title: 'Global Tech Titans',
      subtitle: 'Microsoft vs. Google',
      companies: ['microsoft', 'google'],
      tag: 'Big Tech Battle',
    },
    {
      title: 'Top-3 Global IT Consultancies',
      subtitle: 'TCS vs. Infosys vs. Accenture',
      companies: ['tcs', 'infosys', 'accenture'],
      tag: '3-Way Showdown',
    },
  ];

  const categoriesToCompare = [
    { key: 'overall', name: 'Overall Intelligence', note: 'Composite verification rating' },
    { key: 'learning', name: 'Learning & Development', note: 'Apprentice tracks, skill progression' },
    { key: 'growth', name: 'Growth Opportunities', note: 'Project velocity, career advancement' },
    { key: 'salary', name: 'Salary & Compensation', note: 'Base pay & variable benchmarks' },
    { key: 'culture', name: 'Culture & Environment', note: 'Peer collaboration, engineering vibes' },
    { key: 'wlb', name: 'Work-Life Balance', note: 'Burnout risk, schedule flexibility' },
    { key: 'management', name: 'Management Quality', note: 'Leadership clarity & mentorship' },
    { key: 'stability', name: 'Stability & Financial Health', note: 'Runway, reserves, market strength' },
    { key: 'technology', name: 'Technology Exposure', note: 'GenAI APIs, cloud, modern tech stack' },
    { key: 'benefits', name: 'Benefits & Perks', note: 'Corporate healthcare, PTO, bonuses' },
    { key: 'location', name: 'Location & Work Arrangement', isInfo: true },
    { key: 'size', name: 'Size & Business Scale', isInfo: true },
    { key: 'promotion', name: 'Promotion Timeline', isMissing: true },
  ];

  const battleAnalysis = comparisonResult?.battleAnalysis;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#7547CB] dark:text-[#A78BFA]" />
          <span>Real-time calculation via POST /api/v1/comparisons/calculate</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] flex items-center gap-1 animate-pulse">
              <RotateCcw size={11} className="animate-spin" /> Calculating comparison...
            </span>
          )}
          {isSavedNotice && (
            <span className="text-[12px] font-semibold text-[#177454] dark:text-[#34D399] bg-[#EBF8F2] dark:bg-[#10B981]/15 px-2.5 py-0.5 rounded animate-in fade-in">
              ✓ Comparison saved to Saved Comparisons!
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight">
            Compare Companies Head-to-Head
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            Select 2 or 3 companies. Evaluate empirical metrics, culture, and career fit trade-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparisonCompanies.length >= 2 && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<Bookmark size={13} />}
                onClick={handleSaveCurrentComparison}
              >
                Save comparison
              </Button>
              <Button
                variant={activeTab === 'battle' ? 'outline' : 'primary'}
                size="sm"
                icon={<Swords size={14} className={activeTab === 'battle' ? 'text-[#7547CB] dark:text-[#A78BFA]' : ''} />}
                onClick={() => setActiveTab(activeTab === 'battle' ? 'table' : 'battle')}
              >
                {activeTab === 'battle' ? 'Standard table view' : 'Battle mode'}
              </Button>
            </>
          )}

          {comparisonCompanies.length < 3 && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Company
            </Button>
          )}
        </div>
      </div>

      {/* Company Selector Cards Header Bar */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#14213D] dark:text-[#F8FAFC]">
            <Building2 size={15} className="text-[#7547CB] dark:text-[#A78BFA]" />
            <span>Selected Companies ({comparisonCompanies.length} of 3)</span>
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            {comparisonCompanies.length === 0 && 'Select at least 2 companies to start comparing'}
            {comparisonCompanies.length === 1 && 'Add 1 more company to begin comparing'}
            {comparisonCompanies.length === 2 && 'Ready to compare · You may add a 3rd company'}
            {comparisonCompanies.length === 3 && 'Maximum 3 companies selected'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Selected Company Slots */}
          {[0, 1, 2].map((slotIdx) => {
            const companySlug = comparisonCompanies[slotIdx];
            const companyObj = companies.find((c) => c.slug === companySlug || c.id === companySlug);

            if (companySlug) {
              return (
                <div
                  key={companySlug}
                  className="p-3.5 rounded-lg border border-[#CBD5E1] dark:border-[#384869] bg-[#FAFBFD] dark:bg-[#131C31] flex items-center justify-between gap-3 relative group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-[12px] text-white shrink-0 uppercase shadow-xs"
                      style={{ backgroundColor: companyObj?.logoBg || '#1E293B' }}
                    >
                      {companyObj?.logoText || companySlug.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] block truncate leading-tight">
                        {companyObj?.shortName || companySlug.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block truncate">
                        {companyObj?.industry || 'Technology'} · {companyObj?.overallScore ? `${companyObj.overallScore}/100 IQ` : 'Loading...'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeCompanyFromComparison(companySlug)}
                    className="p-1 rounded-md text-[#94A3B8] hover:text-[#B64348] dark:hover:text-[#F87171] hover:bg-[#FEE2E2]/50 dark:hover:bg-[#EF4444]/15 transition-colors cursor-pointer"
                    title={`Remove ${companyObj?.shortName || companySlug}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            }

            // Empty Slot
            return (
              <button
                key={`empty-slot-${slotIdx}`}
                onClick={() => setIsModalOpen(true)}
                className="p-3.5 rounded-lg border border-dashed border-[#CBD5E1] dark:border-[#384869] hover:border-[#7547CB] dark:hover:border-[#A78BFA] bg-transparent hover:bg-[#FAF5FF]/30 dark:hover:bg-[#1E1B4B]/20 flex items-center justify-center gap-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#7547CB] dark:hover:text-[#A78BFA] transition-all cursor-pointer group"
              >
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-medium">
                  {slotIdx === 0
                    ? '+ Add first company'
                    : slotIdx === 1
                    ? '+ Add second company'
                    : '+ Add third company'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STATE 1: EMPTY STATE (< 2 COMPANIES SELECTED) */}
      {comparisonCompanies.length < 2 && (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-8 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF5FF] dark:bg-[#7547CB]/15 border border-[#E9D5FF] dark:border-[#7547CB]/30 flex items-center justify-center text-[#7547CB] dark:text-[#A78BFA]">
              <Building2 size={28} />
            </div>
            <h2 className="text-[20px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
              Choose at least two companies to start comparing
            </h2>
            <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
              {comparisonCompanies.length === 1
                ? 'You have selected 1 company. Add one more company to unlock the side-by-side category scorecard and real-time Battle Mode.'
                : 'Select 2 or 3 companies to view verified category ratings, work-life balance feedback, career fit alignment, and empirical trade-offs.'}
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                icon={<Plus size={15} />}
                onClick={() => setIsModalOpen(true)}
              >
                Select a company
              </Button>
            </div>
          </div>

          {/* Quick Start Scenarios */}
          <div className="pt-6 border-t border-[#E2E8F0] dark:border-[#26324A] text-left">
            <div className="flex items-center gap-2 mb-3 text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              <Sparkles size={13} className="text-[#7547CB] dark:text-[#A78BFA]" />
              <span>Or launch a pre-configured battle matchup:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickStartCohorts.map((cohort) => (
                <div
                  key={cohort.title}
                  onClick={() => setComparisonCompanies(cohort.companies)}
                  className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#26324A] hover:border-[#7547CB] dark:hover:border-[#A78BFA] bg-[#F8FAFC] dark:bg-[#131C31] hover:bg-white dark:hover:bg-[#0F172A] transition-all cursor-pointer group shadow-xs"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF5FF] dark:bg-[#7547CB]/20 text-[#7547CB] dark:text-[#C084FC] inline-block mb-2">
                    {cohort.tag}
                  </span>
                  <h4 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC] group-hover:text-[#7547CB] dark:group-hover:text-[#A78BFA] transition-colors leading-tight">
                    {cohort.subtitle}
                  </h4>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                    {cohort.title}
                  </p>
                  <div className="mt-3 flex items-center text-[11px] font-semibold text-[#7547CB] dark:text-[#A78BFA] gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Compare now</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE COMPARISON (>= 2 COMPANIES) */}
      {comparisonCompanies.length >= 2 && (
        <div className="space-y-6">
          {/* View Mode Toggle: Table vs Battle */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#26324A] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-4 py-2 text-[13px] rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-[#373D91] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] text-[#14213D] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31]'
                }`}
              >
                <TableProperties size={15} />
                <span>Standard Comparison Table</span>
              </button>

              <button
                onClick={() => setActiveTab('battle')}
                className={`px-4 py-2 text-[13px] rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'battle'
                    ? 'bg-[#7547CB] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] text-[#14213D] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31]'
                }`}
              >
                <Swords size={15} />
                <span>Battle Mode (Head-to-Head)</span>
              </button>
            </div>

            {activeTab === 'table' && (
              <div className="flex items-center gap-1 bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-md text-[12px]">
                <button
                  onClick={() => setTableSubMode('intelligence')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    tableSubMode === 'intelligence'
                      ? 'bg-white dark:bg-[#0F172A] text-[#14213D] dark:text-[#F8FAFC] shadow-2xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Company Intelligence
                </button>
                <button
                  onClick={() => setTableSubMode('fit')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    tableSubMode === 'fit'
                      ? 'bg-white dark:bg-[#0F172A] text-[#7547CB] dark:text-[#A78BFA] shadow-2xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  My Career Fit
                </button>
              </div>
            )}
          </div>

          {/* VIEW TAB 1: STANDARD TABLE */}
          {activeTab === 'table' && (
            <>
              {tableSubMode === 'intelligence' ? (
                /* 1A: COMPANY INTELLIGENCE TABLE */
                <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] bg-[#F8FAFC] dark:bg-[#131C31]">
                          <th className="p-4 text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider w-[240px]">
                            Category
                          </th>
                          {companies.map((company) => (
                            <th key={company.id} className="p-4 min-w-[220px]">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-[12px] text-white uppercase shadow-xs"
                                    style={{ backgroundColor: company.logoBg || '#1E293B' }}
                                  >
                                    {company.logoText || company.shortName?.slice(0, 3)}
                                  </div>
                                  <div>
                                    <span className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight">
                                      {company.shortName}
                                    </span>
                                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                      {company.industry || 'Technology'}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => removeCompanyFromComparison(company.id)}
                                  className="text-[#94A3B8] hover:text-[#B64348] dark:hover:text-[#F87171] p-1 rounded hover:bg-[#FEE2E2]/40 transition-colors cursor-pointer"
                                  title="Remove company"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </th>
                          ))}

                          {companies.length < 3 && (
                            <th className="p-4 w-[200px]">
                              <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-2.5 px-3 rounded-md border border-dashed border-[#CBD5E1] dark:border-[#384869] text-[#7547CB] dark:text-[#A78BFA] hover:bg-[#FAF5FF] dark:hover:bg-[#1E1B4B]/20 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Plus size={14} /> Add 3rd company
                              </button>
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B] text-[13px]">
                        {categoriesToCompare.map((cat) => {
                          const catCompData = comparisonResult?.categoryComparison?.find(
                            (c) => c.key === cat.key
                          );
                          const leaderId = catCompData?.winnerId;

                          return (
                            <tr key={cat.key} className="hover:bg-[#FAFBFD] dark:hover:bg-[#131C31]/40 transition-colors">
                              <td className="p-4">
                                <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC] block">
                                  {cat.name}
                                </span>
                                {cat.note && (
                                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                                    {cat.note}
                                  </span>
                                )}
                              </td>

                              {companies.map((company) => {
                                if (cat.isMissing) {
                                  return (
                                    <td key={company.id} className="p-4">
                                      <span className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1">
                                        — Insufficient aggregate data
                                      </span>
                                    </td>
                                  );
                                }

                                if (cat.isInfo) {
                                  if (cat.key === 'location') {
                                    return (
                                      <td key={company.id} className="p-4">
                                        <div className="text-[12px] text-[#14213D] dark:text-[#F8FAFC] font-medium">
                                          {company.workArrangement || 'Hybrid'}
                                        </div>
                                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 mt-0.5">
                                          <MapPin size={11} /> {company.locations?.[0] || 'Multiple Locations'}
                                        </div>
                                      </td>
                                    );
                                  }
                                  if (cat.key === 'size') {
                                    return (
                                      <td key={company.id} className="p-4">
                                        <div className="text-[12px] text-[#14213D] dark:text-[#F8FAFC] font-medium">
                                          {company.size || 'Enterprise'}
                                        </div>
                                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                                          {company.employeeCount ? `${company.employeeCount.toLocaleString()} employees` : 'Verified scale'}
                                        </div>
                                      </td>
                                    );
                                  }
                                }

                                const score = catCompData?.scores?.[company.id] ?? (cat.key === 'overall' ? company.overallScore : null);
                                const isWinner = leaderId === company.id && score !== null;

                                return (
                                  <td key={company.id} className="p-4">
                                    {score !== null ? (
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-[18px] font-bold ${
                                              isWinner
                                                ? 'text-[#7547CB] dark:text-[#A78BFA]'
                                                : 'text-[#14213D] dark:text-[#F8FAFC]'
                                            }`}
                                          >
                                            {score}
                                          </span>
                                          {isWinner && (
                                            <span className="text-[10px] font-bold text-[#177454] dark:text-[#34D399] bg-[#EBF8F2] dark:bg-[#10B981]/15 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                              <Trophy size={10} /> Highest
                                            </span>
                                          )}
                                        </div>
                                        {cat.key !== 'overall' && (
                                          <button
                                            onClick={() => openEvidenceDrawer(company.id, cat.key)}
                                            className="text-[11px] text-[#64748B] dark:text-[#94A3B8] hover:text-[#7547CB] dark:hover:text-[#A78BFA] hover:underline mt-1 block cursor-pointer"
                                          >
                                            Evidence & sources ↗
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-[#94A3B8] font-medium">
                                        Insufficient data
                                      </span>
                                    )}
                                  </td>
                                );
                              })}

                              {companies.length < 3 && <td className="p-4" />}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* 1B: CAREER FIT TABLE */
                <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg overflow-hidden shadow-xs">
                  <div className="p-4 bg-[#FAF9FD] dark:bg-[#131C31] border-b border-[#E2E8F0] dark:border-[#26324A] flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#7547CB] dark:text-[#A78BFA]">
                      Calculated using your saved Career DNA: {careerDNA.targetRole} ({careerDNA.experience})
                    </span>
                    <Link to="/what-if" className="text-[#373D91] dark:text-[#818CF8] hover:underline font-medium">
                      Simulate in What-If ↗
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] bg-[#F8FAFC] dark:bg-[#131C31]">
                          <th className="p-4 text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider w-[220px]">
                            Company
                          </th>
                          <th className="p-4 text-center">Fit Score</th>
                          <th className="p-4">Alignment Tier</th>
                          <th className="p-4">Primary Match Signal</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B] text-[13px]">
                        {companies.map((company, idx) => {
                          const fit = company.careerFit || {
                            fitScore: company.overallScore || 80,
                            tier: 'Strong Match',
                          };

                          return (
                            <tr key={company.id} className="hover:bg-[#FAFBFD] dark:hover:bg-[#131C31]/40 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-[12px] text-white uppercase shadow-xs"
                                    style={{ backgroundColor: company.logoBg || '#1E293B' }}
                                  >
                                    {company.logoText || company.shortName?.slice(0, 3)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight">
                                      {company.shortName}
                                    </span>
                                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                      {company.size || 'Enterprise'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4 text-center">
                                <span className="text-[24px] font-extrabold text-[#7547CB] dark:text-[#A78BFA]">
                                  {fit.fitScore}%
                                </span>
                              </td>

                              <td className="p-4">
                                <Badge level="high" text={(fit as any).tier || (fit as any).matchGrade || 'Strong Match'} />
                              </td>

                              <td className="p-4 text-[12px] text-[#5A6A85] dark:text-[#CBD5E1]">
                                {company.positiveSignals?.[0] || 'Empirically supported engineering track record'}
                              </td>

                              <td className="p-4 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/company/${company.slug || company.id}`)}
                                >
                                  View Intelligence
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Dynamic Comparison Explanation Card */}
              <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-[#7547CB] dark:text-[#A78BFA]">
                  <Sparkles size={16} />
                  <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                    {comparisonResult?.leadCompany?.headline || 'Understanding the Comparison'}
                  </h3>
                </div>
                <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
                  {comparisonResult?.leadCompany?.explanation ||
                    'Each company exhibits distinct empirical strengths. Look into individual category scores and evidence citations to evaluate specific fit for your career stage.'}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  <span>Evidence grounded in employee feedback, verified registry records, and verified tech stacks.</span>
                  <button
                    onClick={() => setActiveTab('battle')}
                    className="text-[#7547CB] dark:text-[#A78BFA] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View full Battle Mode breakdown</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* VIEW TAB 2: DEDICATED BATTLE MODE VIEW */}
          {activeTab === 'battle' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Battle Header */}
              <div className="bg-gradient-to-r from-[#1E1B4B]/90 via-[#312E81]/80 to-[#1E1B4B]/90 border border-[#4338CA]/30 rounded-lg p-6 text-white space-y-2 relative overflow-hidden">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[#C084FC]">
                  <Flame size={14} />
                  <span>HEAD-TO-HEAD BATTLE SHOWDOWN</span>
                </div>
                <h2 className="text-[26px] font-extrabold tracking-tight">
                  {companies.map((c) => c.shortName).join(' vs ')}
                </h2>
                <p className="text-[13px] text-[#E0E7FF] max-w-2xl leading-relaxed">
                  {battleAnalysis?.tradeoffAnalysis?.title || 'Focused empirical strengths and trade-offs breakdown.'}
                </p>
              </div>

              {/* Side-by-Side Company Battle Cards */}
              <div className={`grid grid-cols-1 ${companies.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-11'} gap-4 items-center`}>
                {companies.length === 2 ? (
                  <>
                    {/* Company 1 */}
                    <div className="md:col-span-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 text-center space-y-3 shadow-xs">
                      <div
                        className="w-12 h-12 mx-auto rounded-lg text-white flex items-center justify-center font-bold text-[14px] uppercase shadow-xs"
                        style={{ backgroundColor: companies[0].logoBg || '#1E293B' }}
                      >
                        {companies[0].logoText || companies[0].shortName?.slice(0, 3)}
                      </div>
                      <h3 className="text-[20px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                        {companies[0].shortName}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#7547CB] dark:text-[#A78BFA] block">
                        {battleAnalysis?.company1?.strengths || 'Core specialized strengths'}
                      </span>
                      <div className="text-[40px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] leading-none pt-1">
                        {battleAnalysis?.company1?.fitScore || companies[0].overallScore}%
                        <span className="text-[14px] font-semibold text-[#64748B] dark:text-[#94A3B8] ml-1">fit</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-1">
                        {companies[0].size || 'Enterprise scale'} · {companies[0].locations?.[0] || 'India'}
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                      <div className="w-10 h-10 rounded-full bg-[#FAF5FF] dark:bg-[#7547CB]/20 border border-[#E9D5FF] dark:border-[#7547CB]/40 flex items-center justify-center text-[12px] font-extrabold text-[#7547CB] dark:text-[#C084FC] shadow-xs">
                        VS
                      </div>
                    </div>

                    {/* Company 2 */}
                    <div className="md:col-span-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 text-center space-y-3 shadow-xs">
                      <div
                        className="w-12 h-12 mx-auto rounded-lg text-white flex items-center justify-center font-bold text-[14px] uppercase shadow-xs"
                        style={{ backgroundColor: companies[1].logoBg || '#7547CB' }}
                      >
                        {companies[1].logoText || companies[1].shortName?.slice(0, 3)}
                      </div>
                      <h3 className="text-[20px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                        {companies[1].shortName}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#7547CB] dark:text-[#A78BFA] block">
                        {battleAnalysis?.company2?.strengths || 'Core specialized strengths'}
                      </span>
                      <div className="text-[40px] font-extrabold text-[#7547CB] dark:text-[#A78BFA] leading-none pt-1">
                        {battleAnalysis?.company2?.fitScore || companies[1].overallScore}%
                        <span className="text-[14px] font-semibold text-[#64748B] dark:text-[#94A3B8] ml-1">fit</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-1">
                        {companies[1].size || 'Enterprise scale'} · {companies[1].locations?.[0] || 'India'}
                      </div>
                    </div>
                  </>
                ) : (
                  // 3 Companies Layout
                  companies.map((c, idx) => {
                    const compSummary = battleAnalysis?.companies?.find((s: any) => s.id === c.id || s.name === c.shortName);
                    return (
                      <div
                        key={c.id}
                        className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-5 text-center space-y-2.5 shadow-xs"
                      >
                        <div
                          className="w-10 h-10 mx-auto rounded-lg text-white flex items-center justify-center font-bold text-[13px] uppercase shadow-xs"
                          style={{ backgroundColor: c.logoBg || '#1E293B' }}
                        >
                          {c.logoText || c.shortName?.slice(0, 3)}
                        </div>
                        <h3 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                          {c.shortName}
                        </h3>
                        <span className="text-[11px] font-semibold text-[#7547CB] dark:text-[#A78BFA] block">
                          {compSummary?.strengths || 'Empirical strengths'}
                        </span>
                        <div className="text-[32px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] leading-none pt-1">
                          {compSummary?.fitScore || c.overallScore}%
                          <span className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] ml-1">fit</span>
                        </div>
                        <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          {c.size || 'Enterprise'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Category-by-Category Battle Breakdown with Evidence */}
              <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                      Category-by-Category Empirical Breakdown
                    </h3>
                    <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] mt-0.5">
                      Winner declared strictly when empirical data verifies a statistical advantage.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(battleAnalysis?.categoryBattles || []).map((battle) => {
                    const isWinnerCompany1 = battle.winnerId === companies[0]?.id;
                    const isWinnerCompany2 = battle.winnerId === companies[1]?.id;
                    const isWinnerCompany3 = battle.winnerId === companies[2]?.id;

                    return (
                      <div
                        key={battle.category}
                        className="p-4 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg space-y-2 hover:border-[#CBD5E1] dark:hover:border-[#384869] transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          {/* Category Name */}
                          <div className="sm:w-1/3">
                            <span className="font-bold text-[14px] text-[#14213D] dark:text-[#F8FAFC]">
                              {battle.category}
                            </span>
                          </div>

                          {/* Scores Comparison */}
                          <div className="sm:w-1/3 flex items-center justify-center gap-3 text-[14px] font-extrabold">
                            {companies.map((comp, idx) => {
                              const s = battle.scores?.[comp.id];
                              const isLeading = battle.winnerId === comp.id;

                              return (
                                <React.Fragment key={comp.id}>
                                  {idx > 0 && <span className="text-[#94A3B8] font-normal">:</span>}
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`${
                                        isLeading
                                          ? 'text-[#177454] dark:text-[#34D399]'
                                          : 'text-[#64748B] dark:text-[#94A3B8]'
                                      }`}
                                    >
                                      {s !== null && s !== undefined ? s : '—'}
                                    </span>
                                    <span className="text-[10px] text-[#94A3B8] font-normal">
                                      ({comp.shortName})
                                    </span>
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* Winner Badge */}
                          <div className="sm:w-1/3 text-left sm:text-right">
                            {battle.hasWinner ? (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#EBF8F2] dark:bg-[#10B981]/15 text-[#177454] dark:text-[#34D399] inline-flex items-center gap-1">
                                <Trophy size={11} /> Winner: {battle.winner}
                              </span>
                            ) : battle.isTie ? (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8]">
                                Tied score
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#131C31] text-[#94A3B8]">
                                Insufficient data
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Evidence & Grounding Explanation */}
                        {battle.evidenceReason && (
                          <div className="pt-1.5 text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] border-t border-[#E2E8F0]/60 dark:border-[#26324A]/60 flex items-start gap-1.5">
                            <Info size={13} className="text-[#7547CB] dark:text-[#A78BFA] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{battle.evidenceReason}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nuanced Strategic Verdict & Trade-off Analysis */}
              {battleAnalysis?.tradeoffAnalysis && (
                <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-[#7547CB]/10 text-[#7547CB] dark:text-[#A78BFA]">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                        {battleAnalysis.tradeoffAnalysis.title}
                      </h3>
                      <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8]">
                        Realistic candidate trade-offs based on organizational stage and priorities.
                      </p>
                    </div>
                  </div>

                  <p className="text-[13px] text-[#14213D] dark:text-[#E2E8F0] leading-relaxed">
                    {battleAnalysis.tradeoffAnalysis.summary}
                  </p>

                  {/* Persona-Based Decision Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {battleAnalysis.tradeoffAnalysis.recommendations.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3.5 rounded-md bg-[#FAF9FD] dark:bg-[#131C31] border border-[#E9E4F5] dark:border-[#26324A] space-y-1"
                      >
                        <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] uppercase tracking-wider block">
                          FOR: {rec.persona}
                        </span>
                        <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
                          {rec.choice}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Balanced Bottom-line Verdict */}
                  <div className="p-3.5 rounded-md bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] text-[12px] text-[#14213D] dark:text-[#F8FAFC] font-medium">
                    <span className="font-bold text-[#7547CB] dark:text-[#A78BFA]">The Bottom Line: </span>
                    {battleAnalysis.tradeoffAnalysis.verdict}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Company Selection Modal */}
      <CompanySelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectCompany={handleSelectCompanyFromModal}
        selectedCompanyIds={comparisonCompanies}
        title="Add Company to Comparison"
        subtitle="Search and select any company from the database to evaluate head-to-head."
      />
    </div>
  );
};
