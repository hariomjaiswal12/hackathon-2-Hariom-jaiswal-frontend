import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AuthModal } from '../../components/modals/AuthModal';
import { PolaroidLineCarousel, type PolaroidSlide } from '../../components/ui/polaroid-line-carousel';
import { FeatureShowcase } from '../../components/landing/FeatureShowcase';
import { CareerDNASection } from '../../components/landing/CareerDNASection';
import {
  Search,
  Sparkles,
  ArrowRight,
  Check,
  Star,
  Menu,
  X,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  UserRound,
  Scale,
  Database,
  Info,
  AlertTriangle,
  Quote,
} from 'lucide-react';

const SOURCE_CARDS = [
  { name: 'Levels.fyi', desc: 'Salary data' },
  { name: 'Teamblind', desc: 'Anonymous posts' },
  { name: 'Reddit', desc: 'Community threads' },
  { name: 'Comparably', desc: 'Culture scores' },
  { name: 'AmbitionBox', desc: 'India reviews' },
  { name: 'Glassdoor', desc: 'Ratings & reviews' },
  { name: 'Fishbowl', desc: 'Workplace chat' },
  { name: 'Indeed', desc: 'Job reviews' },
  { name: 'LinkedIn', desc: 'Professional signals' },
  { name: 'The Muse', desc: 'Career advice' },
];

const POLAROID_SLIDES: PolaroidSlide[] = [
  {
    image: '/images/companyiq/linkedin-research.webp',
    title: 'LinkedIn — Professional Signals',
    caption: 'Company overview, headcount velocity, leadership signals & alumni networks.',
    note: 'LinkedIn Signals',
    alt: 'LinkedIn Company Research and Professional Signals',
  },
  {
    image: '/images/companyiq/ambitionbox-reviews.webp',
    title: 'AmbitionBox — Employee Reviews',
    caption: 'Verified employee reviews, workplace culture ratings, and salary satisfaction.',
    note: 'AmbitionBox Reviews',
    alt: 'AmbitionBox Verified Employee Reviews and Workplace Ratings',
  },
  {
    image: '/images/companyiq/glassdoor-insights.webp',
    title: 'Glassdoor — Ratings & Reviews',
    caption: '4.4★ overall ratings, 94% CEO approval, and verified pros & cons breakdown.',
    note: 'Glassdoor Ratings',
    alt: 'Glassdoor Company Ratings, CEO Approval, and Pros/Cons',
  },
  {
    image: '/images/companyiq/indeed-careers.webp',
    title: 'Indeed — Career Opportunities',
    caption: 'Active hiring requisitions, compensation ranges, and recruitment demand trends.',
    note: 'Indeed Requisitions',
    alt: 'Indeed Active Requisitions, Salary Data, and Hiring Demand',
  },
  {
    image: '/images/companyiq/levelsfyi-salaries.webp',
    title: 'Levels.fyi — Salary Intelligence',
    caption: 'Base, RSU stock, bonus breakdowns, and verified level-by-level compensation.',
    note: 'Levels.fyi Salaries',
    alt: 'Levels.fyi Verified Compensation Bands and Leveling Matrix',
  },
  {
    image: '/images/companyiq/teamblind-discussions.webp',
    title: 'TeamBlind — Anonymous Insights',
    caption: 'Anonymous verified tech employee discussions, workplace culture, and sentiment.',
    note: 'TeamBlind Insights',
    alt: 'TeamBlind Anonymous Employee Discussions and Workplace Culture',
  },
  {
    image: '/images/companyiq/reddit-community.webp',
    title: 'Reddit — Community Discussions',
    caption: 'r/cscareerquestions and tech community unfiltered career advice & consensus.',
    note: 'Reddit Discussions',
    alt: 'Reddit r/cscareerquestions Tech Career Community Consensus',
  },
  {
    image: '/images/companyiq/comparably-culture.webp',
    title: 'Comparably — Culture Insights',
    caption: 'Workplace culture scores, executive team approval, and diversity benchmarks.',
    note: 'Comparably Culture',
    alt: 'Comparably Culture Score, Leadership Ratings, and Diversity',
  },
  {
    image: '/images/companyiq/themuse-advice.webp',
    title: 'The Muse — Career Guidance',
    caption: 'Company culture deep dives, employee stories, and real-world interview coaching.',
    note: 'The Muse Careers',
    alt: 'The Muse Company Culture Deep Dives and Interview Coaching',
  },
];

const SEARCH_CHIPS = ['Google', 'Microsoft', 'Adobe', 'Amazon', 'Apple', 'Netflix', 'Stripe', 'OpenAI'];

const COMPARE_ROWS = [
  { label: 'Overall signal', scores: [88, 84, 86] },
  { label: 'Work culture', scores: [86, 82, 84] },
  { label: 'Career growth', scores: [84, 80, 79] },
  { label: 'Compensation', scores: [90, 86, 85] },
  { label: 'Work-life balance', scores: [74, 81, 88] },
  { label: 'Management', scores: [82, 83, 81] },
  { label: 'Learning', scores: [89, 84, 80] },
  { label: 'Stability', scores: [80, 88, 86] },
  { label: 'Career fit', scores: [91, 86, 84] },
];

function signalBarClass(score: number) {
  if (score >= 85) return 'bg-[#1D4ED8]';
  if (score >= 78) return 'bg-[#60A5FA]';
  return 'bg-[#CBD5E1]';
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal, loginDemo } = useApp();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleExploreWithDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await loginDemo();
      if (res.success) {
        navigate('/dashboard');
      } else {
        openAuthModal(
          res.error || 'Failed to authenticate the demo session. The CompanyIQ API is unavailable.'
        );
      }
    } catch (err: any) {
      openAuthModal(
        err.message || 'Unable to connect to the CompanyIQ API. Please try again shortly.'
      );
    } finally {
      setDemoLoading(false);
    }
  };

  // Navigation & Scroll State
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Hero animations & interactive 3D Tilt
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [heroMounted, setHeroMounted] = useState(true);
  const [ratingCount, setRatingCount] = useState(0);
  const [cultureScoreCount, setCultureScoreCount] = useState(0);
  const [recommendCount, setRecommendCount] = useState(0);

  // 10 Tabs animation trigger
  const tabsSectionRef = useRef<HTMLDivElement>(null);
  const [tabsConverged, setTabsConverged] = useState(false);

  // 3-step section visible step
  const stepsSectionRef = useRef<HTMLDivElement>(null);
  const [stepsVisible, setStepsVisible] = useState(false);

  // Comparison active hover
  const compareSectionRef = useRef<HTMLDivElement>(null);
  const [compareVisible, setCompareVisible] = useState(false);
  const [hoveredCompany, setHoveredCompany] = useState<'google' | 'microsoft' | 'adobe' | null>(null);

  // Scroll listener for sticky nav & progress bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (currentScroll / totalHeight) * 100 : 0;
      setScrollY(currentScroll);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero Mount & Counters Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroMounted(true);
    }, 50);

    // Animate Rating count up: 0 -> 4.4
    let r = 0;
    const rInterval = setInterval(() => {
      r += 0.2;
      if (r >= 4.4) {
        setRatingCount(4.4);
        clearInterval(rInterval);
      } else {
        setRatingCount(parseFloat(r.toFixed(1)));
      }
    }, 45);

    // Animate Culture score: 0 -> 88
    let c = 0;
    const cInterval = setInterval(() => {
      c += 4;
      if (c >= 88) {
        setCultureScoreCount(88);
        clearInterval(cInterval);
      } else {
        setCultureScoreCount(c);
      }
    }, 30);

    // Animate Recommend count: 0 -> 92
    let m = 0;
    const mInterval = setInterval(() => {
      m += 4;
      if (m >= 92) {
        setRecommendCount(92);
        clearInterval(mInterval);
      } else {
        setRecommendCount(m);
      }
    }, 30);

    return () => {
      clearTimeout(timer);
      clearInterval(rInterval);
      clearInterval(cInterval);
      clearInterval(mInterval);
    };
  }, []);

  // 3D Mouse Parallax on Hero Card
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (y / (rect.height / 2)) * -4;
    const rotateY = (x / (rect.width / 2)) * 4;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
      transition: 'transform 0.15s ease-out',
    });
  };

  const handleHeroMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.6s ease-out',
    });
  };

  // Intersection Observers for Storytelling Sections
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.target === tabsSectionRef.current && entry.isIntersecting) {
          setTabsConverged(true);
        }
        if (entry.target === stepsSectionRef.current && entry.isIntersecting) {
          setStepsVisible(true);
        }
        if (entry.target === compareSectionRef.current && entry.isIntersecting) {
          setCompareVisible(true);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, { threshold: 0.2 });
    if (tabsSectionRef.current) observer.observe(tabsSectionRef.current);
    if (stepsSectionRef.current) observer.observe(stepsSectionRef.current);
    if (compareSectionRef.current) observer.observe(compareSectionRef.current);

    return () => observer.disconnect();
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Top Thin Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-[100] transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* =========================================================================
          SECTION 1: STICKY NAVBAR
      ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 20
            ? 'h-[62px] bg-[#070B14]/90 backdrop-blur-md shadow-lg shadow-black/30'
            : 'h-[70px] bg-[#070B14]/60 backdrop-blur-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* CompanyIQ Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers size={18} className="text-white" />
            </div>
            <span className="font-bold text-[18px] tracking-tight text-white">
              Company<span className="text-blue-400">IQ</span>
            </span>
          </Link>

          {/* Desktop Center Navigation Items */}
          <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-slate-300">
            <a href="#search" className="hover:text-white transition-colors">
              Explore
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#compare" className="hover:text-white transition-colors">
              Compare
            </a>
            <a href="#ai-insights" className="hover:text-white transition-colors">
              AI Insights
            </a>
            <a href="#transparency" className="hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleExploreWithDemo}
              disabled={demoLoading}
              className="text-[13px] font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/60 transition-colors cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles size={13} className="text-purple-400" />
              <span>{demoLoading ? 'Starting...' : 'Try Demo'}</span>
            </button>
            <button
              onClick={openAuthModal}
              className="text-[13.5px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer px-2 py-1"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 text-[13.5px] font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              Start Researching
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B1120]/95 backdrop-blur-xl border-b border-slate-800 px-6 py-5 space-y-4 shadow-2xl">
            <a
              href="#search"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 text-sm font-medium py-1"
            >
              Explore
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 text-sm font-medium py-1"
            >
              How It Works
            </a>
            <a
              href="#compare"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 text-sm font-medium py-1"
            >
              Compare
            </a>
            <a
              href="#ai-insights"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 text-sm font-medium py-1"
            >
              AI Insights
            </a>
            <a
              href="#transparency"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 text-sm font-medium py-1"
            >
              About
            </a>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleExploreWithDemo();
                }}
                disabled={demoLoading}
                className="w-full py-2.5 rounded-lg bg-purple-950/50 border border-purple-700/60 text-purple-300 text-sm font-semibold hover:bg-purple-900/50 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className="text-purple-400" />
                <span>{demoLoading ? 'Starting...' : 'Explore with Demo Account'}</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2.5 rounded-lg border border-slate-700 text-slate-200 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/explore');
                }}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 shadow-md shadow-blue-600/30"
              >
                Start Researching
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 2: FULL-SCREEN IMMERSIVE POLAROID LINE CAROUSEL GALLERY
      ========================================================================= */}
      <section className="relative w-full h-[100svh] min-h-[680px] max-h-[1020px] flex flex-col justify-between pt-[68px] pb-1 overflow-hidden bg-[#070B14]">
        {/* Cinematic Ambient Glows in Deep Black Canvas */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full pointer-events-none -z-10 opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.22) 0%, rgba(99, 102, 241, 0.12) 40%, rgba(139, 92, 246, 0.05) 60%, transparent 75%)',
          }}
        />

        {/* TOP: Section Header with Problem Statement */}
        <div className="w-full max-w-4xl mx-auto px-6 text-center space-y-1.5 z-10 pt-1 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10.5px] sm:text-[11px] font-semibold tracking-widest uppercase shadow-xs">
            <Sparkles size={12} className="text-blue-400" />
            <span>THE PROBLEM WITH COMPANY RESEARCH</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.12]">
            Company Research Is{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Scattered Everywhere.
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-xl mx-auto font-normal">
            From professional networks to salary insights and employee reviews, job seekers visit
            multiple platforms to understand a single company.
          </p>
        </div>

        {/* CENTER & BOTTOM: Full-Screen Hanging Polaroid Gallery spanning full viewport width */}
        <div className="relative w-full flex-1 min-h-0 my-1">
          <PolaroidLineCarousel
            slides={POLAROID_SLIDES}
            height="100%"
            cardWidth={350}
            sag={44}
            swing={1}
            autoplay={4500}
            string="#94A3B8"
            background="transparent"
            ink="#F8FAFC"
            className="w-full h-full"
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 2B: TRANSITION TO COMPANYIQ SOLUTION
      ========================================================================= */}
      <section className="relative w-full py-16 px-6 bg-gradient-to-b from-[#070B14] via-[#0B1120] to-[#070B14]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[11px] font-semibold tracking-wider uppercase">
            <Layers size={13} className="text-indigo-400" />
            <span>AI-POWERED UNIFIED INTELLIGENCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white tracking-tight leading-tight">
            Nine Platforms. Countless Insights.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              One CompanyIQ.
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            CompanyIQ brings scattered company information together, helping you explore workplace
            culture, employee reviews, salaries, career opportunities, and company intelligence in
            one place.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => navigate('/explore')}
              className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Explore CompanyIQ</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={handleExploreWithDemo}
              disabled={demoLoading}
              className="px-6 py-3.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 hover:text-purple-200 border border-purple-800/60 font-semibold text-sm sm:text-base flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={15} className="text-purple-400" />
              <span>{demoLoading ? 'Starting Demo...' : 'Explore with Demo Account'}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
            <CheckCircle2 size={14} className="text-blue-400" />
            <span>Free to research · No credit card required</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2C: LIVE SYNTHESIZED COMPANY INTELLIGENCE SHOWCASE
      ========================================================================= */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Live Synthesized Company Intelligence Showcase */}
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold tracking-wider uppercase">
              <Layers size={13} className="text-indigo-400" />
              <span>Unified Intelligence Showcase</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              One Consolidated View · Zero Tab Switching
            </h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              How CompanyIQ unifies signals from LinkedIn, AmbitionBox, Glassdoor, Levels.fyi, and
              Blind into actionable corporate clarity.
            </p>
          </div>

          <div
            className={`transition-all duration-1000 delay-200 transform ${
              heroMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            ref={heroCardRef}
            style={tiltStyle}
          >
            {/* Main Company Intelligence Dashboard Card */}
            <div className="rounded-2xl bg-[#0F172A]/90 border border-slate-700/70 p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)]">
              {/* Card Header: Tab / Category Indicator */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">
                    Synthesized Company Intelligence
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Multi-source verified · Live telemetry</span>
              </div>

              {/* Company Logo, Title, and Overall Score */}
              <div className="py-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Google Icon SVG */}
                  <div className="w-12 h-12 rounded-xl bg-white p-2.5 flex items-center justify-center shadow-md">
                    <svg viewBox="0 0 24 24" className="w-7 h-7">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Google</h2>
                    <p className="text-xs text-slate-400">
                      Internet & Technology · 150,000+ employees
                    </p>
                  </div>
                </div>

                {/* Score Rating Badge */}
                <div className="flex items-center gap-3 bg-[#0B1120] border border-slate-700/80 rounded-xl px-4 py-2.5">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                      <span className="text-2xl font-extrabold text-white">
                        {ratingCount.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                      Very High Confidence (94%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid: Category Progress Bars & Circular Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4 border-t border-slate-800/80">
                {/* 4 Category Bars */}
                <div className="md:col-span-7 space-y-3.5">
                  {/* Work Culture */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Work Culture</span>
                      <span className="text-blue-400 font-semibold">88%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: heroMounted ? '88%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Career Growth */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Career Growth</span>
                      <span className="text-blue-400 font-semibold">84%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 delay-100 ease-out"
                        style={{ width: heroMounted ? '84%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Work-Life Balance */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Work-Life Balance</span>
                      <span className="text-blue-400 font-semibold">76%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 delay-200 ease-out"
                        style={{ width: heroMounted ? '76%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Compensation & Benefits */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Compensation & Benefits</span>
                      <span className="text-blue-400 font-semibold">92%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 delay-300 ease-out"
                        style={{ width: heroMounted ? '92%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2 Circular Gauge Meters */}
                <div className="md:col-span-5 flex items-center justify-around bg-[#0B1120] rounded-xl p-3 border border-slate-800/80">
                  {/* Gauge 1: Culture Score */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-slate-800"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-blue-500"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={
                            2 * Math.PI * 26 * (1 - (heroMounted ? cultureScoreCount / 100 : 0))
                          }
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                        />
                      </svg>
                      <span className="absolute text-sm font-bold text-white">
                        {cultureScoreCount}%
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 mt-1.5 text-center">
                      Culture Fit
                    </span>
                  </div>

                  {/* Gauge 2: Recommend */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-slate-800"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-indigo-400"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={
                            2 * Math.PI * 26 * (1 - (heroMounted ? recommendCount / 100 : 0))
                          }
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                        />
                      </svg>
                      <span className="absolute text-sm font-bold text-white">
                        {recommendCount}%
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 mt-1.5 text-center">
                      Recommend
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Insight Card Inside Dashboard */}
              <div className="mt-4 rounded-xl bg-[#0B1120] border border-blue-500/30 p-4 relative overflow-hidden">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <Sparkles size={13} className="text-blue-400" />
                  <span>AI Insight · Synthesized from 12,450 reviews</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
                  Strong engineering autonomy and market-leading compensation, though recent
                  organizational changes have impacted perception of long-term job stability.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                  <span>Sources: Glassdoor (5.2k) · LinkedIn (3.1k) · AmbitionBox (4.1k) · Levels.fyi</span>
                  <span className="text-slate-400 font-medium">Freshness: 2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner of Hero */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
          <div className="tracking-widest uppercase font-bold text-slate-300">
            AGGREGATING DATA ACROSS 10,000+ REVIEWS
          </div>
          <div className="text-slate-400">
            Independent workplace intelligence aggregated across public sources
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: SEARCH SECTION (Light Background)
      ========================================================================= */}
      <section id="search" className="scroll-mt-20 py-20 md:py-24 px-6 bg-white text-slate-900 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-[40px] font-bold tracking-tight text-slate-900">
            What company are you curious about?
          </h2>

          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white rounded-full shadow-[0_8px_30px_rgba(15,23,42,0.08)] border border-slate-200 pl-5 pr-2 py-2 flex items-center gap-3 transition-all focus-within:ring-4 focus-within:ring-blue-500/15 focus-within:border-blue-500"
          >
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try Google, Microsoft, or Adobe..."
              className="flex-1 text-sm sm:text-[15px] text-slate-800 placeholder-slate-400 outline-none bg-transparent"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              Research
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {SEARCH_CHIPS.map((company) => (
              <button
                key={company}
                onClick={() => {
                  setSearchQuery(company);
                  navigate(`/explore?search=${encodeURIComponent(company)}`);
                }}
                className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 text-[13px] font-medium shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: "10 TABS" SECTION (Dark Navy Background)
      ========================================================================= */}
      <section
        ref={tabsSectionRef}
        className="py-24 md:py-28 px-6 bg-[#070B14] border-t border-white/5 text-slate-100 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.16em]">
                The problem
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-[1.15]">
                Researching a company
                <br />
                shouldn&apos;t mean opening 10
                <br />
                tabs.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed">
                Company reviews, salary data, interview experiences, and career signals are scattered
                across the internet. CompanyIQ brings them into one place.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] gap-x-10 gap-y-4 items-center">
              <div className="space-y-4">
                {SOURCE_CARDS.slice(0, 5).map((card, idx) => (
                  <div
                    key={card.name}
                    className={`max-w-[240px] ml-auto px-4 py-3 rounded-xl bg-[#121A2B] border border-white/10 shadow-lg transition-all duration-700 hover:-translate-y-0.5 hover:border-blue-400/40 ${
                      tabsConverged ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    } ${idx % 2 === 0 ? 'mr-6' : 'mr-0'}`}
                    style={{ transitionDelay: `${idx * 70}ms` }}
                  >
                    <p className="text-sm font-semibold text-white">{card.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                  </div>
                ))}
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute w-56 h-56 rounded-full bg-blue-500/25 blur-3xl animate-pulse-glow" />
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_60px_rgba(59,130,246,0.45)] flex flex-col items-center justify-center text-center px-5">
                  <span className="text-white font-bold text-lg tracking-tight">CompanyIQ</span>
                  <span className="text-[11px] text-blue-100 mt-1 leading-snug">One place to get clarity</span>
                </div>
              </div>

              <div className="space-y-4">
                {SOURCE_CARDS.slice(5).map((card, idx) => (
                  <div
                    key={card.name}
                    className={`max-w-[240px] px-4 py-3 rounded-xl bg-[#121A2B] border border-white/10 shadow-lg transition-all duration-700 hover:-translate-y-0.5 hover:border-blue-400/40 ${
                      tabsConverged ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    } ${idx % 2 === 0 ? 'ml-0' : 'ml-6'}`}
                    style={{ transitionDelay: `${(idx + 5) * 70}ms` }}
                  >
                    <p className="text-sm font-semibold text-white">{card.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:hidden space-y-8">
              <div className="relative flex items-center justify-center py-4">
                <div className="absolute w-48 h-48 rounded-full bg-blue-500/25 blur-3xl" />
                <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(59,130,246,0.4)] flex flex-col items-center justify-center text-center px-4">
                  <span className="text-white font-bold">CompanyIQ</span>
                  <span className="text-[11px] text-blue-100 mt-1">One place to get clarity</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SOURCE_CARDS.map((card) => (
                  <div key={card.name} className="px-3.5 py-3 rounded-xl bg-[#121A2B] border border-white/10">
                    <p className="text-sm font-semibold text-white">{card.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4B: INTERACTIVE FEATURE SHOWCASE (Reference Video Recreated)
      ========================================================================= */}
      <FeatureShowcase onExploreDemo={handleExploreWithDemo} />

      {/* =========================================================================
          SECTION 5: SEARCH → UNDERSTAND → COMPARE (Light Background)
      ========================================================================= */}
      <section
        id="how-it-works"
        ref={stepsSectionRef}
        className="scroll-mt-20 py-24 md:py-28 px-6 bg-white text-slate-900 border-t border-slate-100 relative"
      >
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-blue-600 text-[11px] font-semibold uppercase tracking-[0.16em]">
                How CompanyIQ works
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.15]">
                From a company name
                <br />
                to a clearer next step.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-slate-500 text-sm sm:text-[15px] leading-relaxed">
                CompanyIQ turns scattered company information into a clearer research flow.
              </p>
            </div>
          </div>

          {/* Three Process Step Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 01 */}
            <div
              className={`p-7 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5 transition-all duration-700 ${
                stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-base flex items-center justify-center border border-blue-100">
                01
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Search your shortlist.</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Start with the companies you are considering.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-400">
                  <Search size={14} className="text-slate-400" />
                  <span>Search companies</span>
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div
              className={`p-7 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5 transition-all duration-700 delay-150 ${
                stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-base flex items-center justify-center border border-indigo-100">
                02
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Understand the signals.</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  See what employees mention most — and where the evidence is thin.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                {[
                  ['Work culture', '88%'],
                  ['Career growth', '84%'],
                  ['Compensation', '90%'],
                  ['Work-life balance', '74%'],
                ].map(([label, width]) => (
                  <div key={label}>
                    <p className="text-[11px] font-medium text-slate-500 mb-1">{label}</p>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 03 */}
            <div
              className={`p-7 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5 transition-all duration-700 delay-300 ${
                stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 font-bold text-base flex items-center justify-center border border-purple-100">
                03
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Compare what matters.</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Put companies side by side before you decide.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2 text-[11px]">
                <div className="grid grid-cols-4 font-semibold text-slate-400 pb-1.5 border-b border-slate-200">
                  <span>Company</span>
                  <span className="text-center text-slate-700">Google</span>
                  <span className="text-center text-slate-700">Microsoft</span>
                  <span className="text-center text-slate-700">Adobe</span>
                </div>
                {[
                  ['Overall', '88%', '84%', '86%'],
                  ['Culture', '86%', '82%', '84%'],
                  ['Growth', '84%', '80%', '79%'],
                  ['Pay', '90%', '86%', '85%'],
                ].map((row) => (
                  <div key={row[0]} className="grid grid-cols-4 items-center text-slate-600 py-1">
                    <span>{row[0]}</span>
                    {row.slice(1).map((value) => (
                      <span key={value + row[0]} className="flex justify-center">
                        <span className="h-1.5 w-10 rounded-full bg-slate-200 overflow-hidden inline-block">
                          <span className="block h-full bg-blue-600 rounded-full" style={{ width: value }} />
                        </span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: AI INSIGHTS SECTION (Dark Navy Background)
      ========================================================================= */}
      <section
        id="ai-insights"
        className="scroll-mt-20 py-24 md:py-28 px-6 bg-[#070B14] border-t border-white/5 text-slate-100 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-7">
              <p className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.16em]">
                AI Insights
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.08]">
                Less noise.
                <br />
                <span className="text-slate-300">More nuance.</span>
              </h2>
              <p className="text-slate-400 text-[15px] leading-relaxed max-w-md">
                CompanyIQ summarizes recurring themes from employee feedback, while keeping the tradeoffs visible.
              </p>
              <div className="space-y-5 pt-1">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                    <Quote size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Grounded in real feedback</h4>
                    <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                      Themes are tied back to what employees actually mention.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                    <Scale size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Built to explain tradeoffs</h4>
                    <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                      Strengths and cautions stay visible together.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Designed for decisions</h4>
                    <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                      See what may matter before you accept an offer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#10182A] border border-white/10 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-blue-300 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    <Sparkles size={14} />
                    <span>AI Insight</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 text-[11px] font-medium border border-blue-400/20">
                    Grounded summary
                  </span>
                </div>
                <p className="text-white text-[15px] font-medium leading-snug">
                  &ldquo;What should I know about Google before accepting an offer?&rdquo;
                </p>
                <p className="text-[13px] text-slate-300 leading-relaxed">
                  Google&apos;s engineering culture remains highly autonomous with industry-leading tooling, peer expertise, and compensation. However, recent organization restructuring has slowed promotion velocity in non-core units, making team alignment critical.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[12px] font-semibold text-emerald-400">What stands out</p>
                    <ul className="space-y-1.5 text-[13px] text-slate-300">
                      <li className="flex items-start gap-2"><Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />Strong engineering culture</li>
                      <li className="flex items-start gap-2"><Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />Competitive compensation</li>
                      <li className="flex items-start gap-2"><Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />High learning opportunities</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] font-semibold text-amber-400">What to watch</p>
                    <ul className="space-y-1.5 text-[13px] text-slate-300">
                      <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />Reorganization impact varies by team</li>
                      <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />Promotion pace is inconsistent</li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-xl bg-blue-500/10 border border-blue-400/20 px-4 py-3 text-[13px] text-blue-100">
                  <span className="font-semibold text-white">For your priorities: </span>
                  Matches 92% of your learning and technical growth priorities.
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Synthesized across 12,450 reviews · Glassdoor, LinkedIn, Blind · Updated 2 days ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: COMPANY COMPARISON SECTION (Light Background)
      ========================================================================= */}
      <section
        id="compare"
        ref={compareSectionRef}
        className="scroll-mt-20 py-24 md:py-28 px-6 bg-white text-slate-900 border-t border-slate-100 relative"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-blue-600 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Compare
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.15]">
                Compare companies.
                <br />
                Not just ratings.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-slate-500 text-sm sm:text-[15px] leading-relaxed">
                See where companies differ across the categories that matter to your decision.
              </p>
            </div>
          </div>

          {/* Interactive Comparison Table Card */}
          <div
            className="rounded-2xl bg-white border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-x-auto"
            onMouseLeave={() => setHoveredCompany(null)}
          >
            {/* Table Header Row */}
            <div className="grid grid-cols-12 min-w-[720px] border-b border-slate-200 bg-slate-50/40 px-4 sm:px-6 py-5 items-center">
              <div className="col-span-3" />

              {/* Google Column Header */}
              <div
                onMouseEnter={() => setHoveredCompany('google')}
                className={`col-span-3 p-3 rounded-xl transition-all cursor-pointer ${
                  hoveredCompany === 'google'
                    ? 'bg-blue-50/80 shadow-xs border border-blue-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white p-1 shadow-xs flex items-center justify-center">
                    <span className="font-bold text-xs text-blue-600">G</span>
                  </div>
                  <span className="font-bold text-sm text-slate-900">Google</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">88</p>
              </div>

              {/* Microsoft Column Header */}
              <div
                onMouseEnter={() => setHoveredCompany('microsoft')}
                className={`col-span-3 p-3 rounded-xl transition-all cursor-pointer ${
                  hoveredCompany === 'microsoft'
                    ? 'bg-blue-50/80 shadow-xs border border-blue-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white p-1 shadow-xs flex items-center justify-center">
                    <span className="font-bold text-xs text-indigo-600">M</span>
                  </div>
                  <span className="font-bold text-sm text-slate-900">Microsoft</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">84</p>
              </div>

              {/* Adobe Column Header */}
              <div
                onMouseEnter={() => setHoveredCompany('adobe')}
                className={`col-span-3 p-3 rounded-xl transition-all cursor-pointer ${
                  hoveredCompany === 'adobe'
                    ? 'bg-blue-50/80 shadow-xs border border-blue-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white p-1 shadow-xs flex items-center justify-center">
                    <span className="font-bold text-xs text-red-600">A</span>
                  </div>
                  <span className="font-bold text-sm text-slate-900">Adobe</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">86</p>
              </div>
            </div>

            {COMPARE_ROWS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-12 min-w-[720px] px-4 sm:px-6 py-3.5 items-center border-b border-slate-100"
              >
                <div className="col-span-3 text-sm text-slate-600">{row.label}</div>
                {row.scores.map((score, scoreIndex) => (
                  <div key={row.label + scoreIndex} className="col-span-3 px-3">
                    <div className="h-1.5 w-full max-w-[140px] bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${signalBarClass(score)}`}
                        style={{ width: compareVisible ? `${score}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-wrap items-center gap-5 text-[12px] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="w-8 h-1.5 rounded-full bg-[#1D4ED8]" />
                Strong signal
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-8 h-1.5 rounded-full bg-[#60A5FA]" />
                Mixed signal
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-8 h-1.5 rounded-full bg-[#CBD5E1]" />
                Insufficient data
              </span>
            </div>
            <p className="px-4 sm:px-6 pb-5 text-[12px] text-slate-400">
              Scores shown are illustrative. CompanyIQ separates strong evidence from mixed or missing signals.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: CAREER DNA SECTION (Premium AI-Powered Redesign)
      ========================================================================= */}
      <CareerDNASection />

      {/* =========================================================================
          SECTION 9: TRANSPARENCY SECTION (Light Background)
      ========================================================================= */}
      <section
        id="transparency"
        className="scroll-mt-20 py-24 md:py-28 px-6 bg-white text-slate-900 border-t border-slate-100 relative"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-blue-600 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Why users can trust it
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                Confidence
                <br />
                needs context.
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm">
                CompanyIQ is built to show the limits of the evidence, not just the highlights.
              </p>
              <Link
                to="/sources"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 no-underline"
              >
                <span>Read our methodology</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {[
                {
                  icon: Database,
                  title: 'See where information comes from.',
                  body: 'Sources stay attached to the insight.',
                },
                {
                  icon: Info,
                  title: 'Understand the context around every rating.',
                  body: 'Sample size, recency, and confidence stay visible.',
                },
                {
                  icon: AlertTriangle,
                  title: 'Know when evidence is thin.',
                  body: 'Missing or conflicting signals are called out.',
                },
                {
                  icon: Sparkles,
                  title: 'Separate facts from AI interpretation.',
                  body: 'Summaries are labeled, and you can inspect the basis.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: FINAL CTA (Darkest Navy with Vibrant Blue Glow)
      ========================================================================= */}
      <section className="py-24 md:py-32 px-6 bg-[#070B18] text-center relative overflow-hidden border-t border-white/5">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[320px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, rgba(37, 99, 235, 0.08) 42%, transparent 70%)',
          }}
        />
        <div className="max-w-3xl mx-auto space-y-6 relative">
          <p className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.16em]">
            A clearer next step
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Research Smarter.
            <br />
            <span className="text-blue-500">Choose Better.</span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Start with one company, compare a shortlist, or build your Career DNA.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              Start Researching
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-3 rounded-lg bg-transparent hover:bg-white/5 text-white border border-slate-600 font-semibold text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              Browse Companies
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: FOOTER (Dark Navy Background)
      ========================================================================= */}
      <footer className="bg-[#070B14] border-t border-white/10 text-slate-400 py-14 px-6 text-sm">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
            <div className="col-span-2 md:col-span-4 space-y-3">
              <Link to="/" className="flex items-center gap-2.5 no-underline">
                <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <Layers size={15} />
                </div>
                <span className="font-bold text-base text-white">CompanyIQ</span>
              </Link>
              <p className="text-slate-400 leading-relaxed max-w-[220px] text-[13px]">
                Company research, grounded in evidence.
              </p>
            </div>
            <div className="md:col-span-2 space-y-3">
              <span className="font-semibold text-white block text-[13px]">Product</span>
              <ul className="space-y-2 text-[13px]">
                <li><Link to="/explore" className="hover:text-white">Explore</Link></li>
                <li><Link to="/compare" className="hover:text-white">Compare</Link></li>
                <li><Link to="/ask" className="hover:text-white">AI Insights</Link></li>
                <li><Link to="/career-dna" className="hover:text-white">Career DNA</Link></li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-3">
              <span className="font-semibold text-white block text-[13px]">Company</span>
              <ul className="space-y-2 text-[13px]">
                <li><a href="#transparency" className="hover:text-white">About</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How it works</a></li>
                <li><Link to="/sources" className="hover:text-white">Methodology</Link></li>
                <li><a href="#search" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-3">
              <span className="font-semibold text-white block text-[13px]">Legal</span>
              <ul className="space-y-2 text-[13px]">
                <li><Link to="/settings" className="hover:text-white">Privacy</Link></li>
                <li><Link to="/settings" className="hover:text-white">Terms</Link></li>
                <li><Link to="/settings" className="hover:text-white">AI limitations</Link></li>
                <li><Link to="/settings" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] text-slate-500">
            <div>© 2026 CompanyIQ. All rights reserved.</div>
            <div className="flex items-center gap-3">
              <Link to="/settings" className="hover:text-slate-300">Privacy</Link>
              <span>·</span>
              <Link to="/settings" className="hover:text-slate-300">Terms</Link>
              <span>·</span>
              <Link to="/settings" className="hover:text-slate-300">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal Integration for Sign In */}
      <AuthModal />
    </div>
  );
};
