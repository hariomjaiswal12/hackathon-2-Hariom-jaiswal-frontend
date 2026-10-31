import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  Plus,
  X,
  RotateCcw,
  Download,
  Info,
  CheckCircle2,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Compass,
  Scale,
  Brain,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Radar,
  Lightbulb,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

// --- Brand Logo SVGs ---
const GoogleLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const MicrosoftLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 23 23">
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

const AdobeLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#FA0F00">
    <path d="M13.96 3h10.04v18h-4.32l-3.32-8.52h-4.72l5.04 12.52h-4.36l-2.04-5.24h-4.56l4.28-10.76h4l4 10.76h-4.04z M0 3h7.32l7.76 18h-4.36l-2.24-5.6h-5.48l3.48-8.8h-6.48z" />
  </svg>
);

interface CompanyMetadata {
  id: string;
  name: string;
  shortName: string;
  logoColor: string;
  badge: string;
  color: string; // Theme color for charts
  overallScore: number;
}

const DEFAULT_COMPANIES: CompanyMetadata[] = [
  {
    id: 'google',
    name: 'Google',
    shortName: 'Google',
    logoColor: '#4285F4',
    badge: 'Overall Leader',
    color: '#3B82F6', // Blue
    overallScore: 88,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    shortName: 'Microsoft',
    logoColor: '#05A6F0',
    badge: 'Best Work-Life Balance',
    color: '#06B6D4', // Cyan
    overallScore: 84,
  },
  {
    id: 'adobe',
    name: 'Adobe',
    shortName: 'Adobe',
    logoColor: '#FA0F00',
    badge: 'Top Design & Culture',
    color: '#8B5CF6', // Purple
    overallScore: 86,
  },
];

interface MetricDefinition {
  key: string;
  label: string;
  tooltip: string;
  scores: Record<string, number>;
}

const DEFAULT_METRICS: MetricDefinition[] = [
  {
    key: 'overall',
    label: 'Overall signal',
    tooltip: 'Aggregate intelligence score based on all verified employee sources',
    scores: { google: 88, microsoft: 84, adobe: 86 },
  },
  {
    key: 'culture',
    label: 'Work culture',
    tooltip: 'Psychological safety, inclusivity, peer collaboration, and company values',
    scores: { google: 86, microsoft: 80, adobe: 83 },
  },
  {
    key: 'growth',
    label: 'Career growth',
    tooltip: 'Promotion velocity, mentorship access, and internal project mobility',
    scores: { google: 85, microsoft: 82, adobe: 81 },
  },
  {
    key: 'compensation',
    label: 'Compensation',
    tooltip: 'Base salary competitiveness, equity grants (RSUs), and annual bonus payouts',
    scores: { google: 90, microsoft: 85, adobe: 87 },
  },
  {
    key: 'wlb',
    label: 'Work-life balance',
    tooltip: 'Working hours predictability, on-call expectations, and remote flexibility',
    scores: { google: 72, microsoft: 84, adobe: 82 },
  },
  {
    key: 'management',
    label: 'Management',
    tooltip: 'Executive leadership transparency, management support, and clear direction',
    scores: { google: 84, microsoft: 83, adobe: 82 },
  },
  {
    key: 'learning',
    label: 'Learning & Development',
    tooltip: 'Access to modern GenAI tools, conference stipends, and peer engineering standards',
    scores: { google: 91, microsoft: 86, adobe: 85 },
  },
];

const SEARCHABLE_SUGGESTIONS = [
  { id: 'amazon', name: 'Amazon', initial: 'A', color: '#FF9900', score: 85 },
  { id: 'apple', name: 'Apple Inc.', initial: 'A', color: '#555555', score: 89 },
  { id: 'meta', name: 'Meta Platforms', initial: 'M', color: '#0668E1', score: 87 },
  { id: 'nvidia', name: 'NVIDIA', initial: 'N', color: '#76B900', score: 93 },
  { id: 'netflix', name: 'Netflix', initial: 'N', color: '#E50914', score: 86 },
  { id: 'tcs', name: 'TCS', initial: 'T', color: '#004B87', score: 78 },
  { id: 'infosys', name: 'Infosys', initial: 'I', color: '#007CC3', score: 79 },
];

export const CompareSection: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Active state
  const [activeCompanies, setActiveCompanies] = useState<CompanyMetadata[]>(DEFAULT_COMPANIES);
  const [metrics, setMetrics] = useState<MetricDefinition[]>(DEFAULT_METRICS);
  const [viewMode, setViewMode] = useState<'metrics' | 'radar' | 'insights'>('metrics');
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [activeRadarTooltip, setActiveRadarTooltip] = useState<{ label: string; values: { name: string; score: number; color: string }[] } | null>(null);

  // Animation Trigger
  const [isVisible, setIsVisible] = useState(false);
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isExported, setIsExported] = useState(false);

  // Trigger entrance animations when section comes into viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Smooth score counter animation on reveal
  useEffect(() => {
    if (!isVisible) return;
    const targets: Record<string, number> = {};
    activeCompanies.forEach((c) => {
      targets[c.id] = c.overallScore;
    });

    let frame = 0;
    const totalFrames = 30;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const current: Record<string, number> = {};
      activeCompanies.forEach((c) => {
        current[c.id] = Math.round(targets[c.id] * Math.min(1, progress));
      });
      setAnimatedScores(current);

      if (frame >= totalFrames) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isVisible, activeCompanies]);

  // Try real-time comparison calculation via backend API
  useEffect(() => {
    let isMounted = true;
    const companyIds = activeCompanies.map((c) => c.id);
    if (companyIds.length >= 2) {
      setIsLoadingApi(true);
      apiClient
        .calculateComparison(companyIds)
        .then((res) => {
          if (!isMounted) return;
          if (res.success && res.data?.categoryComparison) {
            const serverCats = res.data.categoryComparison;
            // Update metrics with live backend calculations where matched
            setMetrics((prev) =>
              prev.map((m) => {
                const found = serverCats.find((sc: any) => sc.key === m.key || sc.name?.toLowerCase().includes(m.key));
                if (found && found.scores) {
                  const cleanedScores: Record<string, number> = { ...m.scores };
                  Object.entries(found.scores).forEach(([cid, val]) => {
                    if (typeof val === 'number') {
                      cleanedScores[cid] = val;
                    }
                  });
                  return {
                    ...m,
                    scores: cleanedScores,
                  };
                }
                return m;
              })
            );
          }
        })
        .catch(() => {
          // Keep resilient defaults if offline
        })
        .finally(() => {
          if (isMounted) setIsLoadingApi(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeCompanies]);

  // Remove Company from comparison
  const handleRemoveCompany = (id: string) => {
    if (activeCompanies.length <= 1) return;
    setActiveCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  // Add Company to comparison
  const handleAddCompany = (suggestion: typeof SEARCHABLE_SUGGESTIONS[0]) => {
    if (activeCompanies.some((c) => c.id === suggestion.id)) {
      setIsSearchOpen(false);
      return;
    }
    if (activeCompanies.length >= 4) return;

    const newCompany: CompanyMetadata = {
      id: suggestion.id,
      name: suggestion.name,
      shortName: suggestion.name.split(' ')[0],
      logoColor: suggestion.color,
      badge: 'Challenger',
      color: suggestion.color,
      overallScore: suggestion.score,
    };

    setActiveCompanies((prev) => [...prev, newCompany]);
    // Populate default scores for new company across metrics
    setMetrics((prev) =>
      prev.map((m) => ({
        ...m,
        scores: {
          ...m.scores,
          [suggestion.id]: Math.min(95, Math.max(70, suggestion.score + Math.floor((Math.random() - 0.4) * 8))),
        },
      }))
    );
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Reset to original Google / Microsoft / Adobe defaults
  const handleReset = () => {
    setActiveCompanies(DEFAULT_COMPANIES);
    setMetrics(DEFAULT_METRICS);
  };

  // Export comparison summary report as clean download
  const handleExport = () => {
    const reportText = [
      '====================================================',
      ' COMPANYIQ INTELLIGENCE — COMPARISON REPORT',
      ` Generated: ${new Date().toLocaleString()}`,
      '====================================================',
      '',
      'COMPARED ENTITIES:',
      ...activeCompanies.map((c, i) => `  ${i + 1}. ${c.name} (${c.overallScore}/100 IQ Signal) — ${c.badge}`),
      '',
      'DETAILED METRIC BREAKDOWN:',
      ...metrics.map((m) => {
        const scores = activeCompanies.map((c) => `${c.shortName}: ${m.scores[c.id] || 'N/A'}`).join(' | ');
        return `  • ${m.label.padEnd(24)}: ${scores}`;
      }),
      '',
      '====================================================',
      ' CompanyIQ Empirical Workplace Intelligence',
      ' Data aggregated from LinkedIn, Blind, Glassdoor, and Levels.fyi',
      '====================================================',
    ].join('\n');

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CompanyIQ-Comparison-${activeCompanies.map((c) => c.shortName).join('-vs-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  };

  // Find overall leader
  const highestScore = Math.max(...activeCompanies.map((c) => c.overallScore));

  // Radar Chart Calculations (Pure SVG Mathematics)
  const radarDimensions = [
    { key: 'culture', label: 'Culture' },
    { key: 'growth', label: 'Growth' },
    { key: 'compensation', label: 'Compensation' },
    { key: 'wlb', label: 'Work-Life' },
    { key: 'management', label: 'Management' },
    { key: 'learning', label: 'Learning' },
  ];

  const radarRadius = 140;
  const radarCenter = 190;
  const totalAxes = radarDimensions.length;

  const getCoordinates = (index: number, valueNormalized: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = radarRadius * valueNormalized;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle),
    };
  };

  const filteredSuggestions = SEARCHABLE_SUGGESTIONS.filter(
    (s) =>
      !activeCompanies.some((c) => c.id === s.id) &&
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section
      id="compare"
      ref={sectionRef}
      className="scroll-mt-20 py-24 md:py-32 px-5 sm:px-6 bg-slate-50/70 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 border-t border-slate-200/80 dark:border-white/5 relative overflow-hidden select-none transition-colors duration-300"
    >
      {/* Ambient Radial Lighting Overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(37,99,235,0.08),transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-10">
        
        {/* =========================================================================
            1. HERO SECTION: Modern Typography Hierarchy & Gradient Accents
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200/80 dark:border-white/10 pb-8">
          
          <div className="space-y-4 max-w-2xl">
            {/* Eyebrow Label: COMPANY COMPARISON */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-[0.2em] uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              COMPANY COMPARISON
            </div>

            {/* Main Heading with Gradient Highlights */}
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                Compare companies.
              </span>{' '}
              <br className="hidden sm:inline" />
              <span className="text-slate-900 dark:text-white">
                Not just ratings.
              </span>
            </h2>

            {/* Supporting Description */}
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-[17px] leading-relaxed">
              Go beyond ratings. Discover how companies compare across workplace culture, career growth, compensation, leadership, and more.
            </p>
          </div>

          {/* Action Controls & Interactive View Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* View Switcher Pills */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/80 dark:border-white/10 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('metrics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'metrics'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 size={14} />
                <span>Metrics</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('radar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'radar'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Radar size={14} />
                <span>AI Radar</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('insights')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'insights'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Lightbulb size={14} />
                <span>Insights</span>
              </button>
            </div>

            {/* Export Action Button */}
            <button
              type="button"
              onClick={handleExport}
              title="Download comparison report"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-white/10 text-xs font-semibold shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              {isExported ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Exported</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Export</span>
                </>
              )}
            </button>

            {/* Add Company Trigger */}
            {activeCompanies.length < 4 && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Company</span>
              </button>
            )}

            {/* Reset to Google/Microsoft/Adobe */}
            {activeCompanies.length !== 3 && (
              <button
                type="button"
                onClick={handleReset}
                title="Reset to default 3 companies"
                className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
              </button>
            )}

          </div>

        </div>

        {/* =========================================================================
            2. INTERACTIVE SEARCH / ADD COMPANY POPUP MODAL
            ========================================================================= */}
        {isSearchOpen && (
          <div className="relative p-5 rounded-2xl bg-white dark:bg-[#0B132B] border border-blue-200 dark:border-blue-900/60 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-blue-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Add a company to compare (Up to 4 companies)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies (e.g., NVIDIA, Apple, Amazon, TCS)..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredSuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleAddCompany(s)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.initial}
                  </span>
                  <span>{s.name}</span>
                  <span className="text-slate-400 text-[10px]">({s.score} IQ)</span>
                  <Plus size={12} className="text-blue-500 ml-0.5" />
                </button>
              ))}
              {filteredSuggestions.length === 0 && (
                <p className="text-xs text-slate-400 py-2">
                  No matching companies found. Try "Apple", "NVIDIA", or "Amazon".
                </p>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            3. COMPANY HEADER CARDS ROW
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCompanies.map((company, index) => {
            const isLeader = company.overallScore === highestScore;
            const currentScore = animatedScores[company.id] ?? company.overallScore;

            return (
              <div
                key={company.id}
                onMouseEnter={() => setHoveredCompany(company.id)}
                onMouseLeave={() => setHoveredCompany(null)}
                className={`relative p-6 rounded-2xl transition-all duration-300 border ${
                  isLeader
                    ? 'bg-gradient-to-b from-blue-50/90 to-white dark:from-blue-950/30 dark:to-[#0F172A] border-blue-300 dark:border-blue-700/60 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'bg-white dark:bg-[#0F172A] border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl'
                } hover:-translate-y-1 group`}
              >
                {/* Leader Crown Badge */}
                {isLeader && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold shadow-md shadow-blue-500/30 uppercase tracking-wider">
                    <Trophy size={11} className="text-amber-300" />
                    <span>Top Signal</span>
                  </div>
                )}

                {/* Remove Company Button (when > 2 companies) */}
                {activeCompanies.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCompany(company.id)}
                    title={`Remove ${company.name}`}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}

                {/* Top Row: Logo & Name */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform">
                    {company.id === 'google' && <GoogleLogo className="w-7 h-7" />}
                    {company.id === 'microsoft' && <MicrosoftLogo className="w-6 h-6" />}
                    {company.id === 'adobe' && <AdobeLogo className="w-6 h-6" />}
                    {!['google', 'microsoft', 'adobe'].includes(company.id) && (
                      <span
                        className="font-extrabold text-white text-base w-full h-full rounded flex items-center justify-center"
                        style={{ backgroundColor: company.logoColor }}
                      >
                        {company.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                      <span>{company.name}</span>
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {company.badge}
                    </p>
                  </div>
                </div>

                {/* Animated Overall Score Counter */}
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                      {currentScore}
                    </span>
                    <span className="text-sm font-semibold text-slate-400 ml-1">/100</span>
                  </div>

                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Verified Signal
                  </span>
                </div>

                {/* Micro Progress Track */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      isLeader
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-500'
                        : 'bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-400'
                    }`}
                    style={{ width: `${currentScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            4. MAIN DISPLAY: METRICS COMPARISON TABLE
            ========================================================================= */}
        {viewMode === 'metrics' && (
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-300">
            
            {/* Table Header Row */}
            <div className="grid grid-cols-12 bg-slate-50 dark:bg-[#131C31] px-6 py-4.5 border-b border-slate-200/80 dark:border-slate-800 items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                Evaluation Dimension
              </div>
              <div className="hidden sm:grid sm:col-span-8 lg:col-span-9 grid-cols-3 gap-4 text-center">
                {activeCompanies.map((c) => (
                  <div key={c.id} className="flex items-center justify-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c.shortName}</span>
                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                      ({c.overallScore})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Metric Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {metrics.map((row) => {
                // Find highest score in this row to highlight the category leader
                const rowScores = activeCompanies.map((c) => row.scores[c.id] || 0);
                const rowMax = Math.max(...rowScores);

                return (
                  <div
                    key={row.key}
                    onMouseEnter={() => setHoveredMetric(row.key)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    className="grid grid-cols-12 px-6 py-4.5 items-center hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Metric Label + Info Tooltip */}
                    <div className="col-span-12 sm:col-span-4 lg:col-span-3 mb-2 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {row.label}
                        </span>
                        <div className="relative group/tooltip">
                          <Info size={13} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block w-56 p-2 rounded-lg bg-slate-900 text-white text-[11px] shadow-xl z-30 pointer-events-none leading-snug">
                            {row.tooltip}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bars & Numerical Scores */}
                    <div className="col-span-12 sm:col-span-8 lg:col-span-9 grid grid-cols-3 gap-4 items-center">
                      {activeCompanies.map((company) => {
                        const score = row.scores[company.id] || 0;
                        const isWinnerInRow = score === rowMax && rowMax > 0;

                        return (
                          <div key={company.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                            {/* Animated Gradient Bar */}
                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-white/5">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                  isWinnerInRow
                                    ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-sm shadow-blue-500/40'
                                    : 'bg-gradient-to-r from-slate-400 to-blue-400 dark:from-slate-600 dark:to-slate-400'
                                }`}
                                style={{ width: isVisible ? `${score}%` : '0%' }}
                              />
                            </div>

                            {/* Numerical Value Badge */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className={`text-xs font-bold ${
                                  isWinnerInRow
                                    ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {score}
                              </span>
                              {isWinnerInRow && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Category Leader" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table Footer Legend */}
            <div className="px-6 py-4 bg-slate-50/70 dark:bg-[#131C31] border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>Category Leader</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <span>Competitive Benchmark</span>
                </span>
              </div>
              <span>
                Scores compiled from over 14,000+ verified employee signals.
              </span>
            </div>

          </div>
        )}

        {/* =========================================================================
            5. INTERACTIVE DATA VISUALIZATION: SVG RADAR CHART
            ========================================================================= */}
        {viewMode === 'radar' && (
          <div className="p-7 sm:p-10 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-xl animate-in fade-in duration-300">
            <div className="text-center max-w-lg mx-auto mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Multi-Dimensional Company Radar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visualizing empirical strengths across 6 core workplace dimensions. Hover over any node to view exact scores.
              </p>
            </div>

            {/* The SVG Polar Chart Container */}
            <div className="relative flex justify-center items-center py-2">
              <svg width="380" height="380" viewBox="0 0 380 380" className="overflow-visible select-none">
                {/* Concentric Polygons for 20%, 40%, 60%, 80%, 100% */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((ringLevel) => {
                  const points = radarDimensions
                    .map((_, i) => {
                      const pt = getCoordinates(i, ringLevel);
                      return `${pt.x},${pt.y}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={ringLevel}
                      points={points}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-slate-200 dark:text-slate-800"
                    />
                  );
                })}

                {/* Radial Axis Spokes */}
                {radarDimensions.map((dim, i) => {
                  const outer = getCoordinates(i, 1.0);
                  const labelPt = getCoordinates(i, 1.2);
                  return (
                    <g key={dim.key}>
                      <line
                        x1={radarCenter}
                        y1={radarCenter}
                        x2={outer.x}
                        y2={outer.y}
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-slate-200 dark:text-slate-800"
                      />
                      <text
                        x={labelPt.x}
                        y={labelPt.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[11px] font-bold fill-slate-700 dark:fill-slate-300"
                      >
                        {dim.label}
                      </text>
                    </g>
                  );
                })}

                {/* Company Radar Polygons */}
                {activeCompanies.map((company) => {
                  const points = radarDimensions
                    .map((dim, i) => {
                      const metricObj = metrics.find((m) => m.key === dim.key);
                      const rawScore = metricObj?.scores[company.id] || 75;
                      const norm = rawScore / 100;
                      const pt = getCoordinates(i, norm);
                      return `${pt.x},${pt.y}`;
                    })
                    .join(' ');

                  const isHovered = hoveredCompany === company.id;

                  return (
                    <g key={company.id} className="transition-opacity duration-300">
                      {/* Filled Polygon */}
                      <polygon
                        points={points}
                        fill={company.color}
                        fillOpacity={hoveredCompany && !isHovered ? 0.08 : 0.22}
                        stroke={company.color}
                        strokeWidth={isHovered ? 3 : 2}
                        strokeDasharray={isHovered ? 'none' : 'none'}
                        className="transition-all duration-300"
                      />

                      {/* Vertex Markers */}
                      {radarDimensions.map((dim, i) => {
                        const metricObj = metrics.find((m) => m.key === dim.key);
                        const rawScore = metricObj?.scores[company.id] || 75;
                        const norm = rawScore / 100;
                        const pt = getCoordinates(i, norm);

                        return (
                          <circle
                            key={dim.key + company.id}
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 5 : 3.5}
                            fill={company.color}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="cursor-pointer transition-transform"
                            onMouseEnter={() => {
                              setActiveRadarTooltip({
                                label: dim.label,
                                values: activeCompanies.map((c) => ({
                                  name: c.name,
                                  score: metrics.find((m) => m.key === dim.key)?.scores[c.id] || 0,
                                  color: c.color,
                                })),
                              });
                            }}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Radar Tooltip Display */}
            {activeRadarTooltip && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900 text-white max-w-sm mx-auto shadow-lg text-center animate-in fade-in">
                <span className="font-bold text-xs text-blue-400 block mb-1">
                  {activeRadarTooltip.label} Ratings:
                </span>
                <div className="flex justify-center gap-4 text-xs">
                  {activeRadarTooltip.values.map((v) => (
                    <span key={v.name} className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                      <span>{v.name}: <strong>{v.score}</strong></span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Radar Chart Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              {activeCompanies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseEnter={() => setHoveredCompany(c.id)}
                  onMouseLeave={() => setHoveredCompany(null)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {c.name}
                  </span>
                  <span className="text-slate-400 text-xs">({c.overallScore})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            6. CATEGORY INSIGHTS VIEW
            ========================================================================= */}
        {viewMode === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
            {metrics.map((m) => {
              const bestScore = Math.max(...activeCompanies.map((c) => m.scores[c.id] || 0));
              const winningCompany = activeCompanies.find((c) => (m.scores[c.id] || 0) === bestScore);

              return (
                <div
                  key={m.key}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {m.label}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50">
                      {winningCompany?.shortName} Leads ({bestScore})
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {m.tooltip}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {activeCompanies.map((c) => (
                      <div key={c.id} className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{c.name}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{m.scores[c.id] || 0}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            7. BOTTOM CALL TO ACTION: BATTLE MODE & FULL WORKSPACE LAUNCHER
            ========================================================================= */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Want deeper compensation benchmarks and culture tradeoffs?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Launch Head-to-Head Battle Mode or build your Career DNA to see personal match percentages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/compare')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Explore Head-to-Head Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
