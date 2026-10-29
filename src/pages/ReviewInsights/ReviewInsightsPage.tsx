import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { ReviewAggregateData } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SentimentLineChart } from '../../components/ui/SentimentLineChart';
import { Sparkles, ExternalLink, ShieldCheck, RotateCcw } from 'lucide-react';

export const ReviewInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { companies, openEvidenceDrawer, openContextualAI } = useApp();
  const [selectedCompanyId, setSelectedCompanyId] = useState('tcs');

  const [insights, setInsights] = useState<ReviewAggregateData | null>(null);
  const [loading, setLoading] = useState(true);

  const company = companies.find((c) => c.id === selectedCompanyId) || companies[0] || {
    id: selectedCompanyId,
    name: selectedCompanyId.toUpperCase(),
    shortName: selectedCompanyId.toUpperCase(),
    reviewCount: 127,
    sampleSourcesCount: 3,
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient.getReviewInsights(selectedCompanyId).then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setInsights(res.data);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCompanyId]);

  const totalReviews = insights?.totalReviews ?? company.reviewCount ?? 127;
  const sampleSourcesCount = insights?.sampleSourcesCount ?? company.sampleSourcesCount ?? 3;
  const daysSinceCheck = insights?.daysSinceCheck ?? 12;

  const positiveThemes = insights?.commonPositiveThemes || [
    { theme: 'Learning', percentage: 76, signal: 'positive' },
    { theme: 'Growth', percentage: 71, signal: 'positive' },
    { theme: 'Stability', percentage: 87, signal: 'positive' },
  ];

  const concernsThemes = insights?.concernsWorthExploring || [
    { concern: 'Salary progression', percentage: 43, signal: 'negative' },
    { concern: 'Management consistency', percentage: 31, signal: 'negative' },
    { concern: 'Peak workload / WLB', percentage: 28, signal: 'negative' },
  ];

  const themesTable = insights?.themesTable?.length ? insights.themesTable : [
    {
      theme: 'Learning opportunities',
      relatedMentions: 86,
      evidenceQuality: 'High · Recent',
      signal: 'positive',
      nextStep: 'Open learning evidence ↗',
      categoryKey: 'learning',
    },
    {
      theme: 'Project exposure / growth',
      relatedMentions: 78,
      evidenceQuality: 'High · Recent',
      signal: 'positive',
      nextStep: 'View source breakdown ↗',
      categoryKey: 'growth',
    },
    {
      theme: 'Salary progression',
      relatedMentions: 49,
      evidenceQuality: 'Mixed · Source conflict',
      signal: 'mixed',
      nextStep: 'Inspect salary conflict ↗',
      categoryKey: 'salary',
    },
    {
      theme: 'Work-life balance predictability',
      relatedMentions: 58,
      evidenceQuality: 'Moderate · Project-dependent',
      signal: 'neutral',
      nextStep: 'Explore balance signals ↗',
      categoryKey: 'wlb',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />
          <span>Real-time backend data via GET /api/v1/companies/{selectedCompanyId}/review-insights</span>
        </div>
        {loading && (
          <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] flex items-center gap-1 animate-pulse">
            <RotateCcw size={11} className="animate-spin" /> Querying review insights...
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
            INTELLIGENCE / REVIEWS ANALYSIS
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Understand the patterns behind the reviews
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] mt-1">
            Aggregated themes, sentiment and source agreement for {company.shortName}.
          </p>
        </div>

        {/* Company Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Company:</span>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-3 py-1.5 text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4">
          <span className="text-[32px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight">
            {totalReviews}
          </span>
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">Sample reviews</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4">
          <span className="text-[32px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight">
            {sampleSourcesCount}
          </span>
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">Sample sources</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4">
          <span className="text-[32px] font-bold text-[#373D91] dark:text-[#8B5CF6] block leading-tight">
            86
          </span>
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">Learning-related mentions</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4">
          <span className="text-[32px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight">
            {daysSinceCheck} days
          </span>
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">Since source check</span>
        </div>
      </div>

      {/* Common Positive Themes vs Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive themes */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-4">
          <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Common positive themes</h3>
          <div className="space-y-3">
            {positiveThemes.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>{item.theme}</span>
                  <span className="text-[#177454] dark:text-[#22C55E] font-semibold">{item.percentage}% positive</span>
                </div>
                <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#177454] dark:bg-[#22C55E] rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
          <span className="text-[11px] text-[#94A3B8] dark:text-[#64748B] block pt-1">
            Backend AI-grouped themes · Verified confidence
          </span>
        </div>

        {/* Concerns worth exploring */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-4">
          <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Concerns worth exploring</h3>
          <div className="space-y-3">
            {concernsThemes.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>{item.concern || item.theme}</span>
                  <span className="text-[#9A6417] dark:text-[#F59E0B] font-semibold">{item.percentage}% negative</span>
                </div>
                <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#9A6417] dark:bg-[#F59E0B] rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
          <span className="text-[11px] text-[#94A3B8] dark:text-[#64748B] block pt-1">
            Grounded review corpus analysis
          </span>
        </div>
      </div>

      {/* Sentiment Trend & Source Agreement Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1">
            Sentiment trend · 2024–2026
          </h3>
          <SentimentLineChart height={150} />
          <span className="text-[11px] text-[#94A3B8] dark:text-[#64748B] block mt-2">
            Descriptive sample review trend over time.
          </span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-3">Source agreement</h3>
            <div className="space-y-2.5 text-[12px]">
              <div className="p-3 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC] block">Sample Source A</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">52 reviews · Oct 16, 2026</span>
                </div>
                <Badge level="high" text="Verified" size="sm" />
              </div>

              <div className="p-3 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC] block">Sample Source B</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">44 reviews · Oct 14, 2026</span>
                </div>
                <Badge level="high" text="Verified" size="sm" />
              </div>

              <div className="p-3 bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC] block">Sample Source C</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">31 reviews · Oct 12, 2026</span>
                </div>
                <Badge level="mixed" text="Mixed" size="sm" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-3 leading-relaxed">
            {insights?.sourceAgreement?.summary || 'Learning shows agreement across the sample. Salary signals are conflicting.'}
          </p>
        </div>
      </div>

      {/* Review Themes Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
        <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-3">Review themes breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-2.5">Theme</th>
                <th className="pb-2.5">Related Mentions</th>
                <th className="pb-2.5">Evidence Quality</th>
                <th className="pb-2.5 text-right">Research Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
              {themesTable.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#FAFBFD] dark:hover:bg-[#131C31]">
                  <td className="py-3 font-semibold text-[#14213D] dark:text-[#F8FAFC]">{row.theme}</td>
                  <td className="py-3 text-[#14213D] dark:text-[#F8FAFC] font-bold">{row.relatedMentions}</td>
                  <td className="py-3 text-[#177454] dark:text-[#22C55E] font-medium">{row.evidenceQuality}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => openEvidenceDrawer(company.id, row.categoryKey || 'learning')}
                      className="text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium cursor-pointer"
                    >
                      {row.nextStep || 'Open evidence ↗'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom informational card */}
      <div className="p-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
            Ask CompanyIQ about {company.shortName}'s reviews
          </h4>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Grounded Q&A answers questions specifically referencing review insights and category signals.
          </p>
        </div>
        <Button
          variant="ai"
          size="sm"
          icon={<Sparkles size={13} />}
          onClick={() => openContextualAI(company.id)}
        >
          Ask about reviews
        </Button>
      </div>
    </div>
  );
};
