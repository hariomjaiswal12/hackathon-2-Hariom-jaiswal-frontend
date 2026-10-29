import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { CareerDNAPreferences, WhatIfResult, Company } from '../../types';
import { CompanySelectModal } from '../../components/modals/CompanySelectModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  RotateCcw,
  Bookmark,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Building2,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';

export const WhatIfSimulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveScenario, openEvidenceDrawer, openContextualAI, reloadCareerDNA } = useApp();

  // Baseline priorities
  const baselinePriorities: CareerDNAPreferences = {
    learning: 95,
    growth: 90,
    stability: 85,
    culture: 80,
    wlb: 75,
    salary: 70,
    technology: 90,
    location: 60,
  };

  const [priorities, setPriorities] = useState<CareerDNAPreferences>({ ...baselinePriorities });
  const [scenarioResult, setScenarioResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  // Initialize companies from URL params if available, else default to classic cohort
  const [simulatedCompanyIds, setSimulatedCompanyIds] = useState<string[]>(() => {
    const fromUrl = searchParams.get('companies');
    if (fromUrl) {
      return fromUrl.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    }
    return ['accenture', 'tcs', 'infosys'];
  });

  // Pagination for long company lists (e.g. 10 or 26 companies)
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const isBaseline =
    priorities.wlb === baselinePriorities.wlb &&
    priorities.learning === baselinePriorities.learning &&
    priorities.growth === baselinePriorities.growth &&
    priorities.salary === baselinePriorities.salary &&
    priorities.stability === baselinePriorities.stability &&
    priorities.culture === baselinePriorities.culture;

  // Request backend scenario calculation
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient.calculateWhatIf(priorities, simulatedCompanyIds).then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setScenarioResult(res.data);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // Make sure Career DNA is preserved in background
    reloadCareerDNA();

    return () => {
      isMounted = false;
    };
  }, [priorities, simulatedCompanyIds]);

  const handleSliderChange = (key: keyof CareerDNAPreferences, val: number) => {
    setPriorities((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setPriorities({ ...baselinePriorities });
  };

  const handleAddCompany = (company: Company) => {
    const slug = (company.slug || company.id).toLowerCase();
    if (!simulatedCompanyIds.includes(slug)) {
      setSimulatedCompanyIds((prev) => [...prev, slug]);
    }
  };

  const handleAddMultipleCompanies = (companies: Company[]) => {
    const newSlugs = companies
      .map((c) => (c.slug || c.id).toLowerCase())
      .filter((s) => !simulatedCompanyIds.includes(s));
    if (newSlugs.length > 0) {
      setSimulatedCompanyIds((prev) => [...prev, ...newSlugs]);
    }
  };

  const handleRemoveCompany = (companyId: string) => {
    setSimulatedCompanyIds((prev) => prev.filter((id) => id.toLowerCase() !== companyId.toLowerCase()));
  };

  const handleClearAll = () => {
    setSimulatedCompanyIds([]);
  };

  // Preset Cohorts
  const presetCohorts = [
    { label: 'Tier-1 IT', ids: ['accenture', 'tcs', 'infosys'] },
    { label: 'Cloud & Big Tech', ids: ['microsoft', 'google', 'amazon'] },
    { label: 'AI & Graphics', ids: ['nvidia', 'adobe', 'apple'] },
    { label: 'Digital Engineering', ids: ['persistent', 'coforge', 'ltimindtree'] },
    { label: 'Enterprise Systems', ids: ['salesforce', 'cisco', 'sap'] },
    { label: 'VKAPS vs TCS', ids: ['vkaps-it-solutions', 'tcs'] },
    {
      label: 'Top 10 Verified',
      ids: ['accenture', 'tcs', 'infosys', 'microsoft', 'google', 'amazon', 'nvidia', 'apple', 'adobe', 'salesforce'],
    },
  ];

  // Rank calculations from backend
  const scenarioRankings = scenarioResult?.scenarioRankings || [];
  const baselineRankings = scenarioResult?.baselineRankings || [];
  const shifts = scenarioResult?.shifts || scenarioResult?.delta || [];

  const topCompany = scenarioRankings[0] || null;
  const isInfosysLeader = topCompany?.companyId === 'infosys';

  // Paginated scenario rankings for large cohorts
  const totalPages = Math.ceil(scenarioRankings.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedRankings = scenarioRankings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveScenario = async () => {
    if (simulatedCompanyIds.length === 0) return;

    await saveScenario({
      title: isBaseline
        ? `Baseline · ${simulatedCompanyIds.length} Companies`
        : `What-If · WLB ${priorities.wlb} (${simulatedCompanyIds.length} Co.)`,
      description: scenarioRankings
        .filter((r) => r.score !== null)
        .slice(0, 3)
        .map((r) => `${r.companyName} ${r.score}%`)
        .join(' · ') || 'Custom What-If scenario',
      companies: simulatedCompanyIds,
      priorities,
      isBaseline,
      scenarioType: 'whatif',
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer & Integrity Strip */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#373D91] dark:text-[#818CF8]" />
          <span>Real-time calculation via POST /api/v1/scenarios/calculate (Career DNA remains untouched)</span>
        </div>
        {savedToast && (
          <span className="text-[12px] font-semibold text-[#177454] dark:text-[#34D399] bg-[#EBF8F2] dark:bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/30 animate-in fade-in">
            ✓ Scenario saved to research comparisons!
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] tracking-wider uppercase block">
            DYNAMIC WHAT-IF SIMULATOR · ALL DATABASE COMPANIES
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            What If Your Priorities Change?
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            Simulate and test trade-offs dynamically for any company in the database. Choose custom companies or preset cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw size={13} />}
            onClick={handleReset}
            disabled={isBaseline}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Bookmark size={13} />}
            onClick={handleSaveScenario}
            disabled={simulatedCompanyIds.length === 0}
          >
            Save scenario
          </Button>
        </div>
      </div>

      {/* Context Indicator Strip */}
      <div className="bg-[#FAF9FD] dark:bg-[#131C31] border border-[#E9E4F5] dark:border-[#26324A] rounded-[6px] p-3.5 flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-2 text-[#14213D] dark:text-[#F8FAFC] font-medium">
          <Sparkles size={15} className="text-[#7547CB] dark:text-[#A78BFA] shrink-0" />
          <span>
            {isBaseline
              ? `Baseline scenario: Learning (${priorities.learning}) and growth (${priorities.growth}) lead your priorities across ${simulatedCompanyIds.length} selected companies.`
              : `Active simulation: Work-Life Balance changed (${baselinePriorities.wlb} → ${priorities.wlb}). Company intelligence evidence is strictly unchanged.`}
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] uppercase tracking-wider shrink-0 ml-2">
          {isBaseline ? 'BASELINE' : 'AFTER SIMULATION'}
        </span>
      </div>

      {/* Dynamic Company Selection Section */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#7547CB] dark:text-[#A78BFA]" />
            <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
              Simulated Companies ({simulatedCompanyIds.length})
            </h3>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Select any companies across the database to test fit
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => setIsSelectModalOpen(true)}
            >
              Add Company
            </Button>
            {simulatedCompanyIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-[#64748B] hover:text-[#B91C1C] dark:text-[#94A3B8] dark:hover:text-[#F87171] px-2 py-1 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Selected Company Chips */}
        {simulatedCompanyIds.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-md bg-[#FAFBFD] dark:bg-[#131C31]/40 space-y-2">
            <Building2 size={24} className="mx-auto text-[#94A3B8]" />
            <p className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
              No companies currently selected
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Click "+ Add Company" or choose a preset cohort below to simulate what-if rankings.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {simulatedCompanyIds.map((companyId) => {
              const matchedRanking = scenarioRankings.find(
                (r) => r.companyId.toLowerCase() === companyId.toLowerCase()
              );
              const displayName = matchedRanking?.companyName || companyId.toUpperCase();
              const logoBg = matchedRanking?.logoBg || '#1E293B';
              const logoText = matchedRanking?.logoText || displayName.slice(0, 3);

              return (
                <div
                  key={companyId}
                  className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[12px] group transition-all"
                >
                  <div
                    className="w-5 h-5 rounded-[3px] flex items-center justify-center font-bold text-[9px] text-white shrink-0 uppercase"
                    style={{ backgroundColor: logoBg }}
                  >
                    {logoText.slice(0, 3)}
                  </div>
                  <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                    {displayName}
                  </span>
                  {matchedRanking?.score !== null && matchedRanking?.score !== undefined ? (
                    <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] bg-white dark:bg-[#0F172A] px-1 rounded border border-[#E2E8F0] dark:border-[#334155]">
                      {matchedRanking.score}%
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#B45309] dark:text-[#FBBF24] bg-[#FEF3C7] dark:bg-[#78350F]/40 px-1 rounded">
                      Unrated
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveCompany(companyId)}
                    className="text-[#94A3B8] hover:text-[#B91C1C] dark:hover:text-[#F87171] p-0.5 rounded transition-colors cursor-pointer"
                    title={`Remove ${displayName}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Presets Strip */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F1F5F9] dark:border-[#1E293B] text-[12px]">
          <span className="text-[#64748B] dark:text-[#94A3B8] font-medium mr-1 flex items-center gap-1">
            <Sparkles size={11} className="text-[#7547CB] dark:text-[#A78BFA]" /> Quick Cohorts:
          </span>
          {presetCohorts.map((cohort) => {
            const isSelected =
              cohort.ids.length === simulatedCompanyIds.length &&
              cohort.ids.every((id) => simulatedCompanyIds.includes(id));

            return (
              <button
                key={cohort.label}
                onClick={() => setSimulatedCompanyIds(cohort.ids)}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#7547CB] text-white border-[#7547CB] dark:bg-[#8B5CF6] dark:border-[#8B5CF6]'
                    : 'bg-white dark:bg-[#131C31] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#26324A] hover:border-[#7547CB]/50'
                }`}
              >
                {cohort.label} ({cohort.ids.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulator Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Sliders */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <Sliders size={16} className="text-[#7547CB] dark:text-[#A78BFA]" />
                Your Scenario Priorities
              </h3>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                Adjust sliders to test sensitivity
              </span>
            </div>
            {!isBaseline && (
              <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] bg-[#F4EFFD] dark:bg-[#7547CB]/20 px-2 py-0.5 rounded">
                Customized
              </span>
            )}
          </div>

          <div className="space-y-4 pt-1">
            {[
              { key: 'salary', label: 'Salary & Compensation', val: priorities.salary },
              { key: 'learning', label: 'Learning & Skill Growth', val: priorities.learning },
              { key: 'growth', label: 'Career Growth & Promotion', val: priorities.growth },
              { key: 'wlb', label: 'Work-Life Balance', val: priorities.wlb, highlight: true },
              { key: 'stability', label: 'Job Security & Stability', val: priorities.stability },
              { key: 'culture', label: 'Company Culture & Values', val: priorities.culture },
            ].map(({ key, label, val, highlight }) => (
              <div
                key={key}
                className={`p-2.5 rounded-[4px] transition-colors ${
                  highlight && priorities.wlb !== baselinePriorities.wlb
                    ? 'bg-[#F4EFFD] border border-[#7547CB]/30 dark:bg-[#7547CB]/15 dark:border-[#7547CB]/30'
                    : ''
                }`}
              >
                <div className="flex justify-between items-center text-[12px] font-semibold text-[#14213D] dark:text-[#E2E8F0] mb-1.5">
                  <span className={highlight && priorities.wlb !== baselinePriorities.wlb ? 'text-[#7547CB] dark:text-[#A78BFA] font-bold' : ''}>
                    {label}
                  </span>
                  <span className={`font-bold ${highlight && priorities.wlb !== baselinePriorities.wlb ? 'text-[#7547CB] dark:text-[#A78BFA]' : 'text-[#373D91] dark:text-[#818CF8]'}`}>
                    {val}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={val}
                  onChange={(e) => handleSliderChange(key as any, Number(e.target.value))}
                  className={`w-full h-1.5 rounded-lg cursor-pointer ${
                    highlight && priorities.wlb !== baselinePriorities.wlb
                      ? 'accent-[#7547CB] bg-[#D5DCF3] dark:bg-[#1E293B]'
                      : 'accent-[#373D91] bg-[#E2E8F0] dark:bg-[#1E293B]'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Quick preset buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleSliderChange('wlb', 100)}
              className="w-full text-[12px] text-[#7547CB] dark:text-[#C4B5FD] bg-[#F4EFFD] hover:bg-[#EAE2FB] dark:bg-[#7547CB]/20 dark:hover:bg-[#7547CB]/30 p-2 rounded-[4px] font-medium transition-colors text-center cursor-pointer border border-[#E9E4F5] dark:border-[#7547CB]/30"
            >
              Simulate: Set Work-Life Balance to 100 ↗
            </button>
            <button
              onClick={() => {
                setPriorities({
                  ...baselinePriorities,
                  salary: 100,
                  growth: 95,
                  wlb: 40,
                });
              }}
              className="w-full text-[12px] text-[#373D91] dark:text-[#818CF8] bg-[#EEF2FF] hover:bg-[#E0E7FF] dark:bg-[#373D91]/20 dark:hover:bg-[#373D91]/30 p-2 rounded-[4px] font-medium transition-colors text-center cursor-pointer border border-[#C7D2FE] dark:border-[#373D91]/40"
            >
              Simulate: Max Salary & Growth (High Intensity) ↗
            </button>
          </div>

          <div className="pt-4 border-t border-[#F8FAFC] dark:border-[#1E293B]">
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Priority weights scale each company's verified category evidence dynamically. Saved Career DNA in MongoDB remains untouched.
            </p>
          </div>
        </div>

        {/* Right Column: Live Rankings & Animated Changes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Rankings List Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  {isBaseline ? 'Baseline Career Fit Ranking' : 'Updated Scenario Fit Ranking'}
                </h3>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                  Real-time weighted alignment calculation across {scenarioRankings.length} companies
                </span>
              </div>
              {loading && <RotateCcw size={14} className="animate-spin text-[#7547CB]" />}
            </div>

            {/* Empty State */}
            {scenarioRankings.length === 0 && !loading && (
              <div className="text-center py-12 space-y-2 border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-md">
                <Building2 size={32} className="mx-auto text-[#94A3B8] opacity-60" />
                <p className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  No companies selected
                </p>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                  Add companies above to calculate Career Fit alignment and discover which employer best fits your goals.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={13} />}
                    onClick={() => setIsSelectModalOpen(true)}
                  >
                    Select Companies
                  </Button>
                </div>
              </div>
            )}

            {/* Ranked Companies List */}
            <div className="space-y-3">
              {paginatedRankings.map((scen, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index;
                const isLeader = globalIndex === 0 && scen.hasSufficientData;
                const shift = shifts.find((s) => s.companyId === scen.companyId);
                const isExpanded = expandedBreakdownId === scen.companyId;

                return (
                  <div
                    key={scen.companyId}
                    className={`rounded-[6px] border transition-all duration-300 ease-out overflow-hidden ${
                      isLeader
                        ? 'border-[#7547CB] dark:border-[#8B5CF6] bg-[#FAF9FD] dark:bg-[#131C31] shadow-xs'
                        : 'border-[#E2E8F0] dark:border-[#26324A] bg-white dark:bg-[#0F172A]'
                    }`}
                  >
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Rank, Logo, Name, Badges */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[14px] font-bold text-[#94A3B8] w-6 shrink-0">
                          {scen.rank ? (scen.rank < 10 ? `0${scen.rank}` : scen.rank) : '—'}
                        </span>
                        <div
                          className="w-9 h-9 rounded-[4px] flex items-center justify-center font-bold text-[12px] text-white shrink-0 uppercase shadow-xs"
                          style={{ backgroundColor: scen.logoBg || '#1E293B' }}
                        >
                          {scen.logoText || scen.companyName.slice(0, 3)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] truncate">
                              {scen.companyName}
                            </span>
                            {isLeader && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#7547CB]/10 text-[#7547CB] dark:text-[#C084FC] border border-[#7547CB]/30">
                                #1 Match
                              </span>
                            )}
                            {!scen.hasSufficientData && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#B45309] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#B45309]/50 flex items-center gap-1">
                                <AlertTriangle size={10} /> Insufficient Evidence
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 truncate">
                            <span className="truncate">{scen.industry || 'Technology'}</span>
                            <span>•</span>
                            <span className="truncate">{scen.location || 'Global'}</span>
                            {shift && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-[#7547CB] dark:text-[#A78BFA]">
                                  {shift.scenarioChange}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Score and Progress Bar */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        {scen.hasSufficientData ? (
                          <>
                            <div className="w-24 sm:w-28 hidden md:block">
                              <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    isLeader ? 'bg-[#7547CB]' : 'bg-[#373D91]'
                                  }`}
                                  style={{ width: `${scen.score}%` }}
                                />
                              </div>
                            </div>

                            <span
                              className={`text-[26px] font-extrabold leading-none ${
                                isLeader
                                  ? 'text-[#7547CB] dark:text-[#A78BFA]'
                                  : 'text-[#14213D] dark:text-[#F8FAFC]'
                              }`}
                            >
                              {scen.score}%
                            </span>
                          </>
                        ) : (
                          <div className="text-right">
                            <span className="text-[18px] font-bold text-[#94A3B8]">
                              —
                            </span>
                            <span className="text-[10px] text-[#94A3B8] block">
                              Pending intel
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedBreakdownId(isExpanded ? null : scen.companyId)}
                          className="p-1 rounded text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
                          title="Toggle category breakdown"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Category Breakdown Accordion */}
                    {isExpanded && (
                      <div className="p-4 border-t border-[#E2E8F0] dark:border-[#26324A] bg-[#F8FAFC] dark:bg-[#0B1120] space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                          <span>VERIFIED EVIDENCE CATEGORY BREAKDOWN</span>
                          <span>WEIGHTED FIT</span>
                        </div>

                        {scen.hasSufficientData && scen.breakdown && scen.breakdown.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                            {scen.breakdown.map((cat) => (
                              <div
                                key={cat.category}
                                className="p-2 rounded bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC] block">
                                    {cat.label}
                                  </span>
                                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                                    Evidence score: {cat.score !== null ? `${cat.score}/100` : 'Pending'} (Weight: {cat.priorityWeight})
                                  </span>
                                </div>
                                <span className="font-bold text-[#7547CB] dark:text-[#A78BFA] text-[13px]">
                                  {cat.weightedContribution}%
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded bg-[#FEF3C7]/40 dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#B45309]/30 text-[12px] text-[#92400E] dark:text-[#FCD34D]">
                            {scen.coverageNote ||
                              'Insufficient empirical workplace intelligence to compute deterministic fit score. Minimum 2 category scores required.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls for Large Selections */}
            {scenarioRankings.length > pageSize && (
              <div className="flex items-center justify-between pt-2 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, scenarioRankings.length)} of {scenarioRankings.length} companies
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="px-2 font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic AI Explanation Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-4">
            <div>
              <h4 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                {scenarioResult?.keyTakeaway || (
                  isBaseline
                    ? 'Why the leading company ranks #1 at baseline'
                    : topCompany
                    ? `Why ${topCompany.companyName} leads under current scenario priorities`
                    : 'Simulation Insights'
                )}
              </h4>
            </div>

            <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
              {scenarioResult?.explanation || (
                isBaseline
                  ? 'Your baseline priorities emphasize learning and growth. Adjust sliders on the left to simulate how candidate rankings adapt to different career goals.'
                  : 'Scenario priorities alter the weight of verified company intelligence categories, shifting the overall alignment score.'
              )}
            </p>

            {scenarioResult?.sensitivitySummary && (
              <div className="p-3 rounded-md bg-[#FAF9FD] dark:bg-[#131C31] border border-[#E9E4F5] dark:border-[#26324A] text-[12px] text-[#14213D] dark:text-[#F8FAFC]">
                <span className="font-semibold text-[#7547CB] dark:text-[#A78BFA] block mb-0.5">
                  Sensitivity Analysis:
                </span>
                {scenarioResult.sensitivitySummary}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-[#7547CB] dark:text-[#A78BFA]">
                Backend calculation
              </span>
              <span className="text-[#CBD5E1] dark:text-[#475569]">·</span>
              <Badge level="high" text="Verified Grounded Intelligence" size="sm" />
            </div>

            {topCompany && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F8FAFC] dark:border-[#1E293B]">
                <Button
                  variant="ai"
                  size="sm"
                  onClick={() => openContextualAI(topCompany.companyId)}
                >
                  Explain with AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEvidenceDrawer(topCompany.companyId, 'learning')}
                >
                  Evidence Drawer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/company/${topCompany.companyId}`)}
                >
                  Company Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Changes Summary Table */}
      {shifts.length > 0 && (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-3">
            Scenario Comparison Summary ({shifts.length} Companies)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px] uppercase tracking-wider">
                  <th className="pb-2.5">Company</th>
                  <th className="pb-2.5">Industry</th>
                  <th className="pb-2.5">Baseline · WLB 75</th>
                  <th className="pb-2.5">
                    {isBaseline ? 'Current Scenario' : `After · WLB ${priorities.wlb}`}
                  </th>
                  <th className="pb-2.5 text-right">Scenario Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                {shifts.map((shift) => (
                  <tr key={shift.companyId} className="hover:bg-[#FAFBFD] dark:hover:bg-[#131C31]/50">
                    <td className="py-3 font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-[3px] flex items-center justify-center font-bold text-[9px] text-white shrink-0 uppercase"
                        style={{ backgroundColor: shift.logoBg || '#1E293B' }}
                      >
                        {(shift.logoText || shift.companyName).slice(0, 3)}
                      </div>
                      <span>{shift.companyName}</span>
                    </td>
                    <td className="py-3 text-[#64748B] dark:text-[#94A3B8]">
                      {shift.industry || 'Technology'}
                    </td>
                    <td className="py-3 text-[#64748B] dark:text-[#94A3B8] font-medium">
                      {shift.baselineScore !== null ? `${shift.baselineScore}%` : '—'}
                    </td>
                    <td className="py-3 text-[#14213D] dark:text-[#F8FAFC] font-bold">
                      {shift.scenarioScore !== null ? `${shift.scenarioScore}%` : '—'}
                    </td>
                    <td className="py-3 text-right">
                      {!shift.hasSufficientData ? (
                        <span className="font-medium text-[#B45309] dark:text-[#FBBF24]">
                          Insufficient data
                        </span>
                      ) : shift.scoreDiff !== null && shift.scoreDiff > 0 ? (
                        <span className="font-bold text-[#177454] dark:text-[#34D399] inline-flex items-center gap-1">
                          <TrendingUp size={13} /> +{shift.scoreDiff} points
                        </span>
                      ) : shift.scoreDiff !== null && shift.scoreDiff < 0 ? (
                        <span className="font-bold text-[#B64348] dark:text-[#F87171] inline-flex items-center gap-1">
                          <TrendingDown size={13} /> {shift.scoreDiff} points
                        </span>
                      ) : (
                        <span className="font-medium text-[#64748B] dark:text-[#94A3B8]">No change</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Company Selection Modal */}
      <CompanySelectModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSelectCompany={handleAddCompany}
        onSelectMultiple={handleAddMultipleCompanies}
        selectedCompanyIds={simulatedCompanyIds}
        title="Add Company to What-If Simulation"
        subtitle="Search across all 126 companies in the database to simulate fit scores and priority trade-offs."
        footerText={`${simulatedCompanyIds.length} companies selected for What-If simulation`}
      />
    </div>
  );
};
