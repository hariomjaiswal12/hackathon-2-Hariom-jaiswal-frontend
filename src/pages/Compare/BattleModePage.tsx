import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { ComparisonResult, Company } from '../../types';
import { Button } from '../../components/ui/Button';
import { CompanySelectModal } from '../../components/modals/CompanySelectModal';
import {
  Swords,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Plus,
  X,
  Trophy,
  Info,
  Sparkles,
  Flame,
  Building2,
  Bookmark,
} from 'lucide-react';

export const BattleModePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    comparisonCompanies,
    setComparisonCompanies,
    removeCompanyFromComparison,
    addCompanyToComparison,
    careerDNA,
    saveScenario,
  } = useApp();

  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

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
              setError(res.message || 'Failed to calculate battle analysis');
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
  const battleAnalysis = comparisonResult?.battleAnalysis;

  const handleSaveCurrentComparison = async () => {
    if (comparisonCompanies.length < 2) return;
    const titles = companies.length ? companies.map((c) => c.shortName).join(' vs ') : comparisonCompanies.join(' vs ');
    await saveScenario({
      title: `${titles} · Battle Mode`,
      description:
        comparisonResult?.rankings?.map((r) => `${r.companyName} ${r.score}%`).join(' · ') ||
        'Head-to-head battle matchup',
      companies: comparisonCompanies,
      companyIds: comparisonCompanies,
      priorities: careerDNA.priorities,
      scenarioType: 'battle',
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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#7547CB] dark:text-[#A78BFA]" />
          <span>Real-time Battle Mode via POST /api/v1/comparisons/calculate</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] flex items-center gap-1 animate-pulse">
              <RotateCcw size={11} className="animate-spin" /> Calculating battle showdown...
            </span>
          )}
          {isSavedNotice && (
            <span className="text-[12px] font-semibold text-[#177454] dark:text-[#34D399] bg-[#EBF8F2] dark:bg-[#10B981]/15 px-2.5 py-0.5 rounded">
              ✓ Battle saved to Saved Comparisons!
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] tracking-wider uppercase flex items-center gap-1.5">
            <Flame size={13} />
            <span>PROFESSIONAL BATTLE MODE / HEAD-TO-HEAD</span>
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            {companies.length >= 2
              ? companies.map((c) => c.shortName).join(' vs ')
              : 'Battle Mode Showdown'}
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            A focused comparison of empirical strengths and trade-offs grounded in verified records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparisonCompanies.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              icon={<Bookmark size={13} />}
              onClick={handleSaveCurrentComparison}
            >
              Save battle
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={13} />}
            onClick={() => navigate('/compare')}
          >
            Standard comparison
          </Button>
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

      {/* Company Selector Pills */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-3.5 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-[#14213D] dark:text-[#F8FAFC] mr-1 flex items-center gap-1.5">
            <Building2 size={14} className="text-[#7547CB] dark:text-[#A78BFA]" />
            Comparing:
          </span>
          {comparisonCompanies.map((cId) => {
            const comp = companies.find((c) => c.id === cId || c.slug === cId);
            return (
              <div
                key={cId}
                className="px-2.5 py-1 rounded-md bg-[#FAF9FD] dark:bg-[#131C31] border border-[#CBD5E1] dark:border-[#384869] flex items-center gap-2 text-[12px] font-bold text-[#14213D] dark:text-[#F8FAFC]"
              >
                <div
                  className="w-4 h-4 rounded text-white text-[9px] flex items-center justify-center font-bold uppercase"
                  style={{ backgroundColor: comp?.logoBg || '#1E293B' }}
                >
                  {comp?.logoText || cId.slice(0, 2)}
                </div>
                <span>{comp?.shortName || cId.toUpperCase()}</span>
                <button
                  onClick={() => removeCompanyFromComparison(cId)}
                  className="text-[#94A3B8] hover:text-[#B64348] dark:hover:text-[#F87171] cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
          {comparisonCompanies.length < 3 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-2.5 py-1 rounded-md border border-dashed border-[#CBD5E1] dark:border-[#384869] text-[#7547CB] dark:text-[#A78BFA] hover:bg-[#FAF5FF] dark:hover:bg-[#1E1B4B]/20 text-[12px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> Add company
            </button>
          )}
        </div>
        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          {comparisonCompanies.length} of 3 selected
        </span>
      </div>

      {/* EMPTY STATE */}
      {comparisonCompanies.length < 2 && (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-8 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF5FF] dark:bg-[#7547CB]/15 border border-[#E9D5FF] dark:border-[#7547CB]/30 flex items-center justify-center text-[#7547CB] dark:text-[#A78BFA]">
              <Swords size={28} />
            </div>
            <h2 className="text-[20px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
              Select at least two companies for Battle Mode
            </h2>
            <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
              Battle Mode delivers head-to-head category breakdowns, highlights verified advantages, and contrasts realistic career trade-offs.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                icon={<Plus size={15} />}
                onClick={() => setIsModalOpen(true)}
              >
                Choose companies
              </Button>
            </div>
          </div>

          {/* Quick Start Scenarios */}
          <div className="pt-6 border-t border-[#E2E8F0] dark:border-[#26324A] text-left">
            <div className="flex items-center gap-2 mb-3 text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              <Sparkles size={13} className="text-[#7547CB] dark:text-[#A78BFA]" />
              <span>Launch a featured battle matchup:</span>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE BATTLE VIEW */}
      {comparisonCompanies.length >= 2 && (
        <div className="space-y-6">
          {/* Battle Cards Side-by-Side */}
          <div className={`grid grid-cols-1 ${companies.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-11'} gap-4 items-center`}>
            {companies.length === 2 ? (
              <>
                {/* Company 1 Card */}
                <div className="md:col-span-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 text-center space-y-3 shadow-xs">
                  <div
                    className="w-12 h-12 mx-auto rounded-lg text-white flex items-center justify-center font-bold text-[14px] uppercase shadow-xs"
                    style={{ backgroundColor: companies[0]?.logoBg || '#1E293B' }}
                  >
                    {companies[0]?.logoText || companies[0]?.shortName?.slice(0, 3)}
                  </div>
                  <h2 className="text-[22px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                    {companies[0]?.shortName}
                  </h2>
                  <span className="text-[12px] text-[#7547CB] dark:text-[#A78BFA] font-medium block">
                    {battleAnalysis?.company1?.strengths || 'Core specialized strengths'}
                  </span>
                  <div className="text-[44px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] leading-none pt-2">
                    {battleAnalysis?.company1?.fitScore || companies[0]?.overallScore}%
                    <span className="text-[16px] font-semibold text-[#64748B] dark:text-[#94A3B8] ml-1">fit</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {companies[0]?.size || 'Enterprise'}
                  </div>
                </div>

                {/* VS Badge */}
                <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                  <div className="w-10 h-10 rounded-full bg-[#FAF5FF] dark:bg-[#131C31] border border-[#E9E4F5] dark:border-[#26324A] flex items-center justify-center text-[12px] font-bold text-[#7547CB] dark:text-[#A78BFA] shadow-xs">
                    VS
                  </div>
                </div>

                {/* Company 2 Card */}
                <div className="md:col-span-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 text-center space-y-3 shadow-xs">
                  <div
                    className="w-12 h-12 mx-auto rounded-lg text-white flex items-center justify-center font-bold text-[14px] uppercase shadow-xs"
                    style={{ backgroundColor: companies[1]?.logoBg || '#7547CB' }}
                  >
                    {companies[1]?.logoText || companies[1]?.shortName?.slice(0, 3)}
                  </div>
                  <h2 className="text-[22px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                    {companies[1]?.shortName}
                  </h2>
                  <span className="text-[12px] text-[#7547CB] dark:text-[#A78BFA] font-medium block">
                    {battleAnalysis?.company2?.strengths || 'Core specialized strengths'}
                  </span>
                  <div className="text-[44px] font-extrabold text-[#7547CB] dark:text-[#A78BFA] leading-none pt-2">
                    {battleAnalysis?.company2?.fitScore || companies[1]?.overallScore}%
                    <span className="text-[16px] font-semibold text-[#64748B] dark:text-[#94A3B8] ml-1">fit</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {companies[1]?.size || 'Enterprise'}
                  </div>
                </div>
              </>
            ) : (
              // 3-Company Cards
              companies.map((c) => {
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
                      {compSummary?.strengths || 'Consistent delivery metrics'}
                    </span>
                    <div className="text-[36px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] leading-none pt-1">
                      {compSummary?.fitScore || c.overallScore}%
                      <span className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] ml-1">fit</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      {c.size || 'Enterprise scale'}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Category Battle Rows */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 space-y-4 shadow-xs">
            <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
              Head-to-Head Category Breakdown
            </h3>
            <div className="space-y-3">
              {(battleAnalysis?.categoryBattles || []).map((b) => (
                <div
                  key={b.category}
                  className="p-4 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px]">
                    <div className="sm:w-1/3">
                      <span className="font-bold text-[#14213D] dark:text-[#F8FAFC]">{b.category}</span>
                    </div>

                    <div className="sm:w-1/3 flex items-center justify-center gap-3 font-bold">
                      {companies.map((comp, idx) => {
                        const s = b.scores?.[comp.id];
                        const isLeading = b.winnerId === comp.id;
                        return (
                          <React.Fragment key={comp.id}>
                            {idx > 0 && <span className="text-[#CBD5E1] dark:text-[#475569] font-normal">:</span>}
                            <span className={isLeading ? 'text-[#177454] dark:text-[#22C55E]' : 'text-[#64748B] dark:text-[#94A3B8]'}>
                              {s !== null && s !== undefined ? s : '—'}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="sm:w-1/3 text-left sm:text-right">
                      {b.hasWinner ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#EBF8F2] dark:bg-[#10B981]/15 text-[#177454] dark:text-[#34D399] inline-flex items-center gap-1">
                          <Trophy size={11} /> Winner: {b.winner}
                        </span>
                      ) : b.isTie ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8]">
                          Tied
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#94A3B8]">
                          Insufficient data
                        </span>
                      )}
                    </div>
                  </div>

                  {b.evidenceReason && (
                    <div className="pt-1.5 text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] border-t border-[#E2E8F0]/60 dark:border-[#26324A]/60 flex items-start gap-1.5">
                      <Info size={13} className="text-[#7547CB] dark:text-[#A78BFA] shrink-0 mt-0.5" />
                      <span>{b.evidenceReason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nuanced Strategic Verdict & Trade-off Analysis */}
          {battleAnalysis?.tradeoffAnalysis && (
            <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-lg p-6 space-y-3 shadow-xs">
              <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                {battleAnalysis.tradeoffAnalysis.title}
              </h3>
              <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
                {battleAnalysis.tradeoffAnalysis.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {battleAnalysis.tradeoffAnalysis.recommendations.map((rec, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3.5 rounded-md bg-[#FAF9FD] dark:bg-[#131C31] border border-[#E9E4F5] dark:border-[#26324A] space-y-1"
                  >
                    <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] uppercase tracking-wider block">
                      FOR: {rec.persona}
                    </span>
                    <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1]">
                      {rec.choice}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-md bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] text-[12px] text-[#14213D] dark:text-[#F8FAFC] font-medium">
                <span className="font-bold text-[#7547CB] dark:text-[#A78BFA]">The Bottom Line: </span>
                {battleAnalysis.tradeoffAnalysis.verdict}
              </div>
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
        title="Add Company to Battle"
        subtitle="Search and select companies to compare head-to-head in real time."
      />
    </div>
  );
};
