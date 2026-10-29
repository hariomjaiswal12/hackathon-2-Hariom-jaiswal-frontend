import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadarChart } from '../../components/ui/RadarChart';
import { SentimentLineChart } from '../../components/ui/SentimentLineChart';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertTriangle,
  Bookmark,
  Layers,
  Database,
  UserCheck,
} from 'lucide-react';

export const ComponentSpecimensPage: React.FC = () => {
  const [sliderVal, setSliderVal] = useState(95);

  const colors = [
    { name: 'Primary - Research', hex: '#373D91', role: 'Primary buttons, active states, research links' },
    { name: 'AI - Interpretation', hex: '#7547CB', role: 'AI tags, personal Career Fit, AI actions' },
    { name: 'Success - Supported', hex: '#177454', role: 'Verified sources, positive signals, top match' },
    { name: 'Warning - Mixed / Stale', hex: '#9A6417', role: 'Conflicting evidence, mixed sentiment, stale sources' },
    { name: 'Danger - Unavailable', hex: '#B64348', role: 'Missing data, errors, destructive actions' },
    { name: 'Typography - Navy', hex: '#14213D', role: 'Primary headings and high-contrast text' },
    { name: 'Canvas - Slate', hex: '#F8FAFC', role: 'Page background canvas' },
    { name: 'Surface - White', hex: '#FFFFFF', role: 'Card surface, inputs, panels' },
    { name: 'Border - Neutral', hex: '#E2E8F0', role: 'Structural hairline borders' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Top Banner Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#373D91] dark:text-[#818CF8]" />
        <span>COMPANYIQ / DESIGN SYSTEM / 1.0</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-[32px] font-extrabold text-[#14213D] dark:text-[#F8FAFC] tracking-tight">
          Foundations · CompanyIQ Design System
        </h1>
        <p className="text-[14px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
          Precise by design. Evidence before interpretation. The individual's priorities, always in view.
        </p>
      </div>

      {/* 3 Principles from Page 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">01</span>
          <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1.5">Evidence, not certainty</h3>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
            Expose provenance, freshness and limitations. Never fabricate confidence.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">02</span>
          <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1.5">Company ≠ personal fit</h3>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
            Keep company intelligence and individual priorities strictly separate.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">03</span>
          <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-1.5">Clarity over decoration</h3>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
            Ruled tables, restrained surfaces, deliberate emphasis.
          </p>
        </div>
      </div>

      {/* Color Palette (Page 1) */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          Semantic Color Palette
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {colors.map((c) => (
            <div key={c.hex} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4 flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-[4px] border border-black/10 dark:border-white/10 shrink-0 shadow-xs"
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <span className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC] block">{c.name}</span>
                <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] block">{c.hex}</span>
                <span className="text-[11px] text-[#94A3B8] block mt-0.5">{c.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution Language (Page 1) */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-3">
        <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Attribution Language</h3>
        <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8]">
          Never merge these into a single claim of truth:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px]">
            <span className="font-bold text-[#373D91] dark:text-[#818CF8] block mb-1">Source data</span>
            <span className="text-[#64748B] dark:text-[#94A3B8]">What the sample reviews and corporate filings state.</span>
          </div>
          <div className="p-3.5 bg-[#FAF9FD] dark:bg-[#7547CB]/10 border border-[#E9E4F5] dark:border-[#7547CB]/30 rounded-[4px]">
            <span className="font-bold text-[#7547CB] dark:text-[#A78BFA] block mb-1">AI interpretation</span>
            <span className="text-[#64748B] dark:text-[#94A3B8]">What CompanyIQ derives with declared confidence.</span>
          </div>
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px]">
            <span className="font-bold text-[#14213D] dark:text-[#F8FAFC] block mb-1">User preference</span>
            <span className="text-[#64748B] dark:text-[#94A3B8]">What the jobseeker prioritizes via Career DNA.</span>
          </div>
        </div>
      </div>

      {/* Button & Input Specimens (Page 2) */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          Button & Control Specimens
        </h2>
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md">Analyze a Company</Button>
            <Button variant="outline" size="md">Compare</Button>
            <Button variant="outline" size="md">View Sources</Button>
            <Button variant="ghost" size="md" className="text-[#B64348] dark:text-[#F87171]">Remove company</Button>
            <Button variant="ai" size="md" icon={<Sparkles size={14} />}>+ Ask CompanyIQ</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge level="high" text="High confidence · 82%" />
            <Badge level="mixed" text="Mixed signals" />
            <Badge level="insufficient" text="Insufficient data" />
            <Badge level="stale" text="Stale · Recheck source" />
            <Badge variant="status" text="Verified" />
            <Badge variant="tag" text="User preference" />
          </div>

          <div className="max-w-md space-y-2">
            <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC]">
              <span>Interactive Priority Slider</span>
              <span className="font-bold text-[#373D91] dark:text-[#818CF8]">{sliderVal}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full accent-[#373D91] h-1.5 bg-[#E2E8F0] dark:bg-[#1E293B] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Visual Data Components (Gauges, Radar, Lines) */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          Data Visualizations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 text-center space-y-3">
            <h4 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Career Fit Gauge</h4>
            <ScoreGauge score={87} label="Fit" size={110} subtext="Excellent Match" />
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 text-center space-y-3">
            <h4 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Priority Radar</h4>
            <RadarChart
              size={200}
              data={[
                { label: 'Learning', value: 95 },
                { label: 'Growth', value: 90 },
                { label: 'Stability', value: 85 },
                { label: 'Culture', value: 80 },
                { label: 'Balance', value: 75 },
                { label: 'Salary', value: 70 },
              ]}
            />
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-3">
            <h4 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Sentiment Trend (2024-2026)</h4>
            <SentimentLineChart height={140} />
          </div>
        </div>
      </div>

      {/* Empty States Showcase (Page 15 in Figma) */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          Empty States (Page 15)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EmptyState
            title="No companies found"
            description="Try a broader name or clear a filter to see more companies."
            actionText="Clear filters"
            onAction={() => alert('Filters cleared')}
          />
          <EmptyState
            title="Insufficient review data"
            description="We don't have enough reliable feedback to summarize employee sentiment. No score is shown."
            actionText="View available sources"
            onAction={() => alert('Navigating to sources')}
          />
          <EmptyState
            title="Make the research personal"
            description="Build your Career DNA to unlock personalized recommendations."
            actionText="Build My Career DNA"
            onAction={() => alert('Opening Career DNA builder')}
          />
        </div>
      </div>

      {/* Error States Showcase (Page 16 in Figma) */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          Error States (Page 16)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ErrorState
            title="CompanyIQ AI is temporarily unavailable"
            description="Your saved research is still available. Try again in a moment."
            onRetry={() => alert('Retrying AI request...')}
          />
          <ErrorState
            title="Company not found"
            description="We couldn't find this company. Check the name or return to Explore."
            retryText="Explore Companies"
            onRetry={() => alert('Exploring')}
          />
          <ErrorState
            title="Company data unavailable"
            description="We can't retrieve reliable company information right now. No score is shown."
            retryText="Retry data request"
            onRetry={() => alert('Retrying')}
          />
        </div>
      </div>

      {/* Loading Skeletons Showcase (Page 17 in Figma) */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          Loading Skeletons (Page 17)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton type="card" subtitle="CompanyIQ is analyzing available evidence..." />
          <Skeleton type="chart" subtitle="CompanyIQ is analyzing sentiment trends..." />
          <Skeleton type="text" subtitle="Synthesizing review themes..." />
        </div>
      </div>
    </div>
  );
};

