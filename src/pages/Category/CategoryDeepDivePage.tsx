import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { companyService } from '../../services/companyService';
import { apiClient } from '../../services/apiClient';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SentimentLineChart } from '../../components/ui/SentimentLineChart';
import { ArrowLeft, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export const CategoryDeepDivePage: React.FC = () => {
  const { id = 'tcs', categoryKey = 'learning' } = useParams<{ id: string; categoryKey: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer, openContextualAI } = useApp();
  const [activeTab, setActiveTab] = useState<'distribution' | 'trend' | 'sources' | 'limitations'>('distribution');

  const [company, setCompany] = useState<any>(() => companyService.getCompanyById(id) || companyService.getCompanies()[0]);

  React.useEffect(() => {
    let isMounted = true;
    apiClient.getCompany(id).then((res) => {
      if (isMounted && res.success && res.data) {
        setCompany(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const cat = company.categories?.[categoryKey] || company.categories?.learning || {
    name: categoryKey,
    score: 80,
    confidence: { level: 'high', label: 'High confidence' },
    summary: 'Available evidence highlights structured patterns.',
    evidenceCount: 60,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />
        <span>Demo data · Illustrative, not verified company research</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
            WORKPLACE CATEGORY / {company.shortName}
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            {cat.name}
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] mt-1">
            A focused view of {categoryKey}-related evidence, trends and limitations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<ArrowLeft size={13} />}
          onClick={() => navigate(`/company/${company.id}`)}
        >
          Back to company
        </Button>
      </div>

      {/* Top Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Score Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase block mb-1">
            {cat.name} score
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-[44px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] leading-none">
              {cat.score}
            </span>
            <span className="text-[20px] font-bold text-[#64748B] dark:text-[#94A3B8]">/ 100</span>
          </div>
          <span className="text-[12px] text-[#177454] dark:text-[#22C55E] font-medium block mb-2">
            +5 vs previous snapshot
          </span>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
            A weighted summary of available {cat.name.toLowerCase()} evidence.
          </p>
        </div>

        {/* Evidence Coverage Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase block mb-1">
            Evidence coverage
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-[44px] font-extrabold text-[#373D91] dark:text-[#8B5CF6] leading-none">
              {cat.evidenceCount}
            </span>
            <span className="text-[20px] font-bold text-[#64748B] dark:text-[#94A3B8]">mentions</span>
          </div>
          <div className="mb-2">
            <Badge level="high" text="High confidence · 82%" />
          </div>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
            127 total reviews · 3 sample sources · Checked 12 days ago
          </p>
        </div>
      </div>

      {/* Secondary Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0] dark:border-[#26324A] text-[13px] font-medium">
        {[
          { key: 'distribution', label: 'Evidence distribution' },
          { key: 'trend', label: 'Trend' },
          { key: 'sources', label: 'Sources' },
          { key: 'limitations', label: 'Limitations' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'text-[#373D91] dark:text-[#8B5CF6] font-bold border-b-2 border-[#373D91] dark:border-[#8B5CF6]'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Distribution & Trend side-by-side (Page 20) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Evidence Distribution */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-4">
          <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
            {cat.name} evidence distribution
          </h3>
          <div className="space-y-3 text-[12px]">
            <div>
              <div className="flex justify-between text-[#177454] dark:text-[#22C55E] font-medium mb-1">
                <span>Positive 63 mentions</span>
              </div>
              <div className="h-2.5 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                <div className="h-full bg-[#177454] dark:bg-[#22C55E] rounded-full" style={{ width: '73%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#5A6A85] dark:text-[#94A3B8] font-medium mb-1">
                <span>Neutral 15 mentions</span>
              </div>
              <div className="h-2.5 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                <div className="h-full bg-[#5A6A85] dark:bg-[#94A3B8] rounded-full" style={{ width: '17%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#9A6417] dark:text-[#F59E0B] font-medium mb-1">
                <span>Negative 8 mentions</span>
              </div>
              <div className="h-2.5 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                <div className="h-full bg-[#9A6417] dark:bg-[#F59E0B] rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#94A3B8] dark:text-[#64748B] block pt-2">
            Source data · Illustrative labels from Sample A / B / C
          </span>
        </div>

        {/* Trend Chart */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1">
            {cat.name} trend · 2024–2026
          </h3>
          <SentimentLineChart height={150} />
          <span className="text-[11px] text-[#94A3B8] dark:text-[#64748B] block mt-2">
            AI interpretation: a positive sample trend, not a future prediction
          </span>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
        <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-3">Sample sources breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-2">Sample Source</th>
                <th className="pb-2">Total Reviews</th>
                <th className="pb-2">{cat.name} Mentions</th>
                <th className="pb-2">Signal</th>
                <th className="pb-2 text-right">Freshness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
              <tr>
                <td className="py-2.5 font-medium text-[#14213D] dark:text-[#F8FAFC]">Sample Source A</td>
                <td className="py-2.5 text-[#64748B] dark:text-[#94A3B8]">52</td>
                <td className="py-2.5 text-[#14213D] dark:text-[#F8FAFC] font-semibold">35</td>
                <td className="py-2.5 text-[#177454] dark:text-[#22C55E] font-medium">Generally positive</td>
                <td className="py-2.5 text-right text-[#64748B] dark:text-[#94A3B8]">Oct 16, 2026</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#14213D] dark:text-[#F8FAFC]">Sample Source B</td>
                <td className="py-2.5 text-[#64748B] dark:text-[#94A3B8]">44</td>
                <td className="py-2.5 text-[#14213D] dark:text-[#F8FAFC] font-semibold">30</td>
                <td className="py-2.5 text-[#177454] dark:text-[#22C55E] font-medium">Generally positive</td>
                <td className="py-2.5 text-right text-[#64748B] dark:text-[#94A3B8]">Oct 14, 2026</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#14213D] dark:text-[#F8FAFC]">Sample Source C</td>
                <td className="py-2.5 text-[#64748B] dark:text-[#94A3B8]">31</td>
                <td className="py-2.5 text-[#14213D] dark:text-[#F8FAFC] font-semibold">21</td>
                <td className="py-2.5 text-[#9A6417] dark:text-[#F59E0B] font-medium">Mixed but positive overall</td>
                <td className="py-2.5 text-right text-[#64748B] dark:text-[#94A3B8]">Oct 12, 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* What this does—and does not—tell you */}
      <div className="bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-4">
        <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          What this does—and does not—tell you
        </h3>
        <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed">
          {cat.name} is frequently mentioned positively in the available sample. Specific training quality, mentor access and project allocation can still differ by role, location and team.
        </p>
        <p className="text-[12px] text-[#9A6417] dark:text-[#F59E0B] leading-relaxed">
          Promotion timelines are missing. Learning mentions do not prove faster promotions. Source data and AI interpretation should not be treated as the same thing.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEvidenceDrawer(company.id, categoryKey)}
          >
            View evidence
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/sources')}
          >
            Open Sources
          </Button>
          <Button
            variant="ai"
            size="sm"
            icon={<Sparkles size={13} />}
            onClick={() => openContextualAI(company.id)}
          >
            Ask about {categoryKey}
          </Button>
        </div>
      </div>
    </div>
  );
};

