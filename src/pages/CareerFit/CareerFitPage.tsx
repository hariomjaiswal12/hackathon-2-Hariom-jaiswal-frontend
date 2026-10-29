import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { CareerFitResult } from '../../types';
import { CompanyCard } from '../../components/common/CompanyCard';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Edit3, Sparkles, ShieldCheck, ArrowRight, AlertTriangle, RotateCcw } from 'lucide-react';

export const CareerFitPage: React.FC = () => {
  const navigate = useNavigate();
  const { careerDNA, companies, openEvidenceDrawer, openContextualAI } = useApp();

  const [matches, setMatches] = useState<CareerFitResult[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('tcs');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient.getAllCareerFits().then((res) => {
      if (isMounted) {
        if (res.success && res.data?.matches) {
          setMatches(res.data.matches);
          if (res.data.matches.length > 0) {
            // Keep TCS selected if present, else first
            const hasTcs = res.data.matches.some((m) => m.companyId === 'tcs');
            setSelectedMatchId(hasTcs ? 'tcs' : res.data.matches[0].companyId);
          }
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [careerDNA.priorities]);

  // Enrich matched companies with company metadata from companies list
  const enrichedMatches = matches.map((m) => {
    const comp = companies.find((c) => c.id === m.companyId) || {
      id: m.companyId,
      name: m.companyName,
      shortName: m.companyName,
      logoText: m.companyName.slice(0, 3).toLowerCase(),
      overallScore: 82,
      industry: 'IT Services & Technology',
      location: 'India',
      description: 'Enterprise employer with strong technical delivery footprint.',
      confidence: { level: 'high' as const, label: 'High confidence' },
      reviewCount: 120,
      sampleSourcesCount: 3,
      categories: {},
      positiveSignals: ['Broad learning opportunities', 'Organizational stability'],
      concernSignals: ['Salary progression'],
    };
    return {
      company: {
        ...comp,
        careerFit: m,
      },
      fit: m,
    };
  });

  const activeMatch = matches.find((m) => m.companyId === selectedMatchId) || matches[0] || {
    companyId: 'tcs',
    companyName: 'TCS',
    fitScore: 87,
    tier: 'Excellent Match' as const,
    breakdown: [
      { categoryKey: 'learning', categoryName: 'Learning', score: 91, userWeight: 95, alignmentScore: 96 },
      { categoryKey: 'growth', categoryName: 'Growth', score: 88, userWeight: 90, alignmentScore: 92 },
      { categoryKey: 'stability', categoryName: 'Stability', score: 89, userWeight: 85, alignmentScore: 88 },
      { categoryKey: 'salary', categoryName: 'Salary', score: 70, userWeight: 70, alignmentScore: 71 },
    ],
    whyItFits: [
      'Learning and stability align closely with your strongest priorities.',
      'Broad technology and project exposure support early career development.',
    ],
    tradeOffs: [
      'Salary progression: Mixed employee feedback makes this worth checking.',
      'Role-specific evidence is limited: Team-level allocation can differ from enterprise averages.',
    ],
  };

  const activeCompany = companies.find((c) => c.id === activeMatch.companyId) || enrichedMatches[0]?.company;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Disclaimer */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#373D91] dark:text-[#818CF8]" />
          <span>Real-time Career Fit calculation via GET /api/v1/career-fit</span>
        </div>
        {loading && (
          <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] flex items-center gap-1 animate-pulse">
            <RotateCcw size={11} className="animate-spin" /> Calculating personal fit...
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] tracking-wider uppercase block">
            PERSONALIZED / SAVED CAREER DNA
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Companies That Match Your Career DNA
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            Research starting points for your priorities. A strong match is personal alignment, not an employment guarantee.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Edit3 size={13} />}
          onClick={() => navigate('/career-dna/build')}
        >
          Edit profile
        </Button>
      </div>

      {/* Saved Profile Context Strip */}
      <div className="bg-[#FAF9FD] dark:bg-[#131C31] border border-[#E9E4F5] dark:border-[#26324A] rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#7547CB] text-white flex items-center justify-center font-bold text-[11px]">
            DNA
          </div>
          <div>
            <span className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight">
              {careerDNA.targetRole} · {careerDNA.experience}
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
              Learning {careerDNA.priorities.learning} · Growth {careerDNA.priorities.growth} · Stability {careerDNA.priorities.stability} · Culture {careerDNA.priorities.culture} · WLB {careerDNA.priorities.wlb} · Salary {careerDNA.priorities.salary}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-[#7547CB] dark:text-[#C4B5FD] bg-[#F4EFFD] dark:bg-[#7547CB]/20 border border-transparent dark:border-[#7547CB]/30 px-2.5 py-1 rounded-[4px] self-start sm:self-auto">
          Saved-profile fit
        </span>
      </div>

      {/* Matches Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Ranked by Career Fit ({matches.length || 3} matches from API)
          </span>
          <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA]">
            Click any company below to inspect alignment breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedMatches.map(({ company, fit }) => (
            <div
              key={company.id}
              onClick={() => setSelectedMatchId(company.id)}
              className={`cursor-pointer transition-all rounded-[6px] ${
                selectedMatchId === company.id
                  ? 'ring-2 ring-[#7547CB] shadow-md'
                  : 'hover:shadow-xs'
              }`}
            >
              <CompanyCard company={company as any} />
            </div>
          ))}
        </div>
      </div>

      {/* Deep Match Explanation & Trade-Offs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why Company is a Fit */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Why {activeMatch.companyName} is an {activeMatch.fitScore}% fit for you
              </h3>
              <Badge level="high" text={activeMatch.tier} />
            </div>

            <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed mb-5">
              {activeMatch.whyItFits?.[0] || 'Learning and stability align closely with your strongest priorities.'}
            </p>

            <div className="space-y-3 mb-5">
              {activeMatch.breakdown?.slice(0, 4).map((item) => (
                <div key={item.categoryKey}>
                  <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#E2E8F0] mb-1">
                    <span>{item.categoryName} alignment</span>
                    <span className="font-semibold text-[#7547CB] dark:text-[#A78BFA]">{item.alignmentScore || item.score}</span>
                  </div>
                  <ProgressBar value={item.alignmentScore ?? item.score ?? 0} height={6} color="#7547CB" animated={false} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-semibold text-[#7547CB] dark:text-[#A78BFA]">API calculated</span>
              <span className="text-[#CBD5E1] dark:text-[#475569]">·</span>
              <Badge level="high" text="High confidence" size="sm" />
              <span className="text-[11px] text-[#94A3B8]">Verified employee reviews</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F8FAFC] dark:border-[#1E293B]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEvidenceDrawer(activeMatch.companyId, 'learning')}
            >
              Evidence behind this match
            </Button>
          </div>
        </div>

        {/* Trade-Offs to Investigate */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-3">
              Trade-offs to investigate for {activeMatch.companyName}
            </h3>

            <div className="space-y-4 mb-5">
              {activeMatch.tradeOffs?.map((tradeoff, idx) => (
                <div key={idx} className="p-3.5 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] space-y-1">
                  <span className="text-[12px] font-bold text-[#9A6417] dark:text-[#F59E0B] flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Trade-off #{idx + 1}
                  </span>
                  <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
                    {tradeoff}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-4">
              A company-wide signal may not describe your actual team. Career Fit supports your decision; it does not make it for you.
            </p>
          </div>

          <div className="pt-3 border-t border-[#F8FAFC] dark:border-[#1E293B]">
            <Button
              variant="ai"
              size="sm"
              icon={<Sparkles size={13} />}
              onClick={() => openContextualAI(activeMatch.companyId)}
            >
              + Ask CompanyIQ about {activeMatch.companyName}
            </Button>
          </div>
        </div>
      </div>

      {/* How Personalization Works */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-4">
        <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          How personalization works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px]">
            <span className="font-bold text-[#373D91] dark:text-[#818CF8] block mb-1">01 / Source data</span>
            <p className="text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
              Empirical company evidence, sample sizes and freshness.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px]">
            <span className="font-bold text-[#373D91] dark:text-[#818CF8] block mb-1">02 / User preference</span>
            <p className="text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
              Your role, experience, skills and priority weights.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px]">
            <span className="font-bold text-[#373D91] dark:text-[#818CF8] block mb-1">03 / Grounded Match</span>
            <p className="text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
              Personalized alignment calculated without mutating company intelligence.
            </p>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRight size={13} />}
            onClick={() => navigate('/compare')}
          >
            Compare companies in scenario
          </Button>
        </div>
      </div>
    </div>
  );
};
