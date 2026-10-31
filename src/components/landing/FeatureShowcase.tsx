import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Search,
  Building2,
  Dna,
  CheckCircle2,
  Sliders,
  Scale,
  Bot,
  Briefcase,
  Users,
  Newspaper,
  Play,
  Pause,
} from 'lucide-react';

export interface FeatureSlide {
  id: string;
  number: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaRoute: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FEATURE_SLIDES: FeatureSlide[] = [
  {
    id: 'intelligence',
    number: '01',
    category: 'Company Intelligence',
    title: 'Company Intelligence',
    subtitle: 'Unified Corporate Discovery & Analytics',
    description:
      'Explore companies through unified intelligence and detailed company information.',
    image: '/images/features/01-company-intelligence.png',
    ctaText: 'Explore Companies',
    ctaRoute: '/explore',
    tagline: 'Search & Directory',
    icon: Search,
  },
  {
    id: 'profiles',
    number: '02',
    category: 'Company Profiles',
    title: 'Company Profiles',
    subtitle: 'Structured Overview & Leadership',
    description:
      'Understand each organization through structured company profiles and insights.',
    image: '/images/features/02-company-profiles.png',
    ctaText: 'View Company Profiles',
    ctaRoute: '/company/google',
    tagline: 'Deep Profiles',
    icon: Building2,
  },
  {
    id: 'career-dna',
    number: '03',
    category: 'Career DNA',
    title: 'Career DNA',
    subtitle: 'Personalized Work & Salary Priorities',
    description:
      'Build your personal career profile around the priorities that matter to you.',
    image: '/images/features/03-career-dna.png',
    ctaText: 'Build Career DNA',
    ctaRoute: '/career-dna',
    tagline: 'Personal Blueprint',
    icon: Dna,
  },
  {
    id: 'career-fit',
    number: '04',
    category: 'Career Fit',
    title: 'Career Fit',
    subtitle: 'Evidence-Based Match Scoring',
    description:
      'Discover how well a company aligns with your career goals.',
    image: '/images/features/04-career-fit.png',
    ctaText: 'Calculate Career Fit',
    ctaRoute: '/career-fit',
    tagline: 'Role Compatibility',
    icon: CheckCircle2,
  },
  {
    id: 'what-if',
    number: '05',
    category: 'What-If Simulator',
    title: 'What-If Simulator',
    subtitle: 'Interactive Career Trade-off Engine',
    description:
      'Explore career decisions and understand the trade-offs before making your next move.',
    image: '/images/features/05-what-if-simulator.png',
    ctaText: 'Launch Simulator',
    ctaRoute: '/what-if',
    tagline: 'Scenario Modeler',
    icon: Sliders,
  },
  {
    id: 'compare',
    number: '06',
    category: 'Company Comparison',
    title: 'Company Comparison',
    subtitle: 'Side-by-Side Head-to-Head Showdown',
    description:
      'Compare companies side by side to make more informed decisions.',
    image: '/images/features/06-company-comparison.png',
    ctaText: 'Compare Companies',
    ctaRoute: '/compare',
    tagline: 'Head-to-Head',
    icon: Scale,
  },
  {
    id: 'ai-insights',
    number: '07',
    category: 'AI Insights',
    title: 'AI Insights',
    subtitle: 'Grounded Assistant & Synthesis',
    description:
      'Turn complex company information into clear and actionable insights.',
    image: '/images/features/07-ai-insights.png',
    ctaText: 'Ask AI Assistant',
    ctaRoute: '/ask',
    tagline: 'Verified AI',
    icon: Bot,
  },
  {
    id: 'salary-intelligence',
    number: '08',
    category: 'Salary & Job Intelligence',
    title: 'Salary & Job Intelligence',
    subtitle: 'Live ATS Feeds & Compensation Analytics',
    description:
      'Explore compensation trends and discover opportunities that match your goals.',
    image: '/images/features/08-salary-intelligence.png',
    ctaText: 'Explore Openings',
    ctaRoute: '/company/google',
    tagline: 'ATS Openings',
    icon: Briefcase,
  },
  {
    id: 'reviews-workplace',
    number: '09',
    category: 'Reviews & Workplace Insights',
    title: 'Reviews & Workplace Insights',
    subtitle: 'Employee Feedback & Cultural Signals',
    description:
      'Understand workplace experiences and company culture through employee feedback.',
    image: '/images/features/09-reviews-workplace.png',
    ctaText: 'Explore Workplace',
    ctaRoute: '/review-insights',
    tagline: 'Work Culture',
    icon: Users,
  },
  {
    id: 'news-updates',
    number: '10',
    category: 'Company News & Updates',
    title: 'Company News & Updates',
    subtitle: 'Verified Timeline & Milestones',
    description:
      'Stay informed about important company developments and business updates.',
    image: '/images/features/10-company-news.png',
    ctaText: 'Track Company News',
    ctaRoute: '/company/google',
    tagline: 'Timelines & Updates',
    icon: Newspaper,
  },
];

interface FeatureShowcaseProps {
  onExploreDemo?: () => void;
}

const AUTOPLAY_DURATION = 5000; // 5 seconds per slide
const GAP_PX = 14; // gap between preview cards in px

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ onExploreDemo }) => {
  const navigate = useNavigate();
  const totalSlides = FEATURE_SLIDES.length;

  // Track buffer for infinite continuous sliding without jumps
  const EXTENDED_TRACK = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => FEATURE_SLIDES[i % totalSlides]);
  }, [totalSlides]);

  // Step counter: increments monotonically so the rail always slides smoothly forward
  const [step, setStep] = useState(10);
  const [prevStep, setPrevStep] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  // Playback & Interaction States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(true); // Default true so it starts immediately
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Measured width of the right-side preview container for pixel-perfect card sliding
  const [railWidth, setRailWidth] = useState(380);

  const showcaseRef = useRef<HTMLDivElement>(null);
  const railContainerRef = useRef<HTMLDivElement>(null);
  const mobileRailRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const interactionCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived slide indices
  const currentIndex = ((step % totalSlides) + totalSlides) % totalSlides;
  const prevIndex =
    prevStep !== null ? ((prevStep % totalSlides) + totalSlides) % totalSlides : null;

  const currentSlide = FEATURE_SLIDES[currentIndex];
  const CurrentIcon = currentSlide.icon;

  // Measure rail container width dynamically
  useEffect(() => {
    if (!railContainerRef.current) return;
    const updateWidth = () => {
      if (railContainerRef.current) {
        const w = railContainerRef.current.getBoundingClientRect().width;
        if (w > 0) setRailWidth(w);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(railContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute card dimensions: exactly 3 preview cards visible at once
  const cardWidth = Math.max(80, (railWidth - 2 * GAP_PX) / 3);
  const stepDistance = (railWidth + GAP_PX) / 3;

  // Interaction cooldown: gives user 3.5s of focused viewing before resuming autoplay
  const triggerInteraction = useCallback(() => {
    setIsInteracting(true);
    setProgress(0);
    if (interactionCooldownRef.current) {
      clearTimeout(interactionCooldownRef.current);
    }
    interactionCooldownRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3500);
  }, []);

  // Slide navigation handlers
  const handleNext = useCallback(() => {
    setPrevStep(step);
    setStep((prev) => prev + 1);
    setProgress(0);
    setIsFading(true);
    const timer = setTimeout(() => {
      setIsFading(false);
      setPrevStep(null);
    }, 600);
    return () => clearTimeout(timer);
  }, [step]);

  const handlePrev = useCallback(() => {
    setPrevStep(step);
    setStep((prev) => prev - 1);
    setProgress(0);
    setIsFading(true);
    const timer = setTimeout(() => {
      setIsFading(false);
      setPrevStep(null);
    }, 600);
    return () => clearTimeout(timer);
  }, [step]);

  const handleSelectOffset = useCallback(
    (offset: number) => {
      triggerInteraction();
      setPrevStep(step);
      setStep((prev) => prev + offset);
      setProgress(0);
      setIsFading(true);
      const timer = setTimeout(() => {
        setIsFading(false);
        setPrevStep(null);
      }, 600);
      return () => clearTimeout(timer);
    },
    [step, triggerInteraction]
  );

  const handleSelectIndex = useCallback(
    (targetIdx: number) => {
      triggerInteraction();
      const diff = (targetIdx - currentIndex + totalSlides) % totalSlides;
      if (diff === 0) return;
      setPrevStep(step);
      setStep((prev) => prev + diff);
      setProgress(0);
      setIsFading(true);
      const timer = setTimeout(() => {
        setIsFading(false);
        setPrevStep(null);
      }, 600);
      return () => clearTimeout(timer);
    },
    [currentIndex, totalSlides, step, triggerInteraction]
  );

  // Normalize step counter silently when it grows large to maintain infinite rotation
  useEffect(() => {
    if (step >= 45 || step <= 5) {
      const normalized = (step % totalSlides) + 15;
      setIsJumping(true);
      setStep(normalized);
      const timer = setTimeout(() => setIsJumping(false), 50);
      return () => clearTimeout(timer);
    }
  }, [step, totalSlides]);

  // Preload upcoming images for zero-lag transitions
  useEffect(() => {
    const nextIdx1 = (currentIndex + 1) % totalSlides;
    const nextIdx2 = (currentIndex + 2) % totalSlides;
    const img1 = new Image();
    img1.src = FEATURE_SLIDES[nextIdx1].image;
    const img2 = new Image();
    img2.src = FEATURE_SLIDES[nextIdx2].image;
  }, [currentIndex, totalSlides]);

  // Viewport Observer: Autoplay runs when showcase is in view
  useEffect(() => {
    if (!showcaseRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(showcaseRef.current);
    return () => observer.disconnect();
  }, []);

  // Respect user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsPlaying(false);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Main Autoplay Timer with high-accuracy Date.now() synchronization
  useEffect(() => {
    if (!isPlaying || !isVisible || isHovered || isInteracting) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      return;
    }

    const startTime = Date.now() - (progress / 100) * AUTOPLAY_DURATION;

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / AUTOPLAY_DURATION) * 100);
      setProgress(pct);

      if (elapsed >= AUTOPLAY_DURATION) {
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        setProgress(0);
        handleNext();
      }
    }, 35);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [isPlaying, isVisible, isHovered, isInteracting, handleNext, step]);

  // Center active mobile thumbnail into view
  useEffect(() => {
    if (!mobileRailRef.current) return;
    const activeBtn = mobileRailRef.current.children[currentIndex] as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex]);

  // Keyboard navigation when in viewport
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showcaseRef.current) return;
      const rect = showcaseRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerInteraction();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerInteraction();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, triggerInteraction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (interactionCooldownRef.current) clearTimeout(interactionCooldownRef.current);
    };
  }, []);

  // CTA navigation handler
  const handleCtaClick = () => {
    if (currentSlide.ctaRoute.startsWith('/company/') && onExploreDemo) {
      onExploreDemo();
    } else {
      navigate(currentSlide.ctaRoute);
    }
  };

  return (
    <section
      ref={showcaseRef}
      id="feature-showcase"
      aria-label="CompanyIQ Interactive Feature Showcase"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="scroll-mt-24 relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#070B14] text-slate-100 overflow-hidden border-t border-white/5 select-none"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/5 blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6 sm:space-y-8 lg:space-y-10">
        {/* =========================================================================
            HEADER & TOP NAVIGATION CONTROLS
        ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-1">
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Interactive Feature Showcase</span>
              {isPlaying && isVisible && !isHovered && !isInteracting && (
                <span className="ml-1 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-normal lowercase tracking-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  live auto-play
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              Experience CompanyIQ in Action
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Explore 10 powerful capability modules engineered to turn fragmented web data into unified, empirical company clarity.
            </p>
          </div>

          {/* Top-Right Navigation Controls (Exact Screenshot Style + Live Progress) */}
          <div className="flex items-center gap-3 sm:gap-4 self-start md:self-end">
            {/* Slide counter indicator with synchronized progress fill */}
            <div className="relative overflow-hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md shadow-sm">
              {/* Background progress fill */}
              <div
                className="absolute inset-0 bg-blue-500/15 pointer-events-none transition-none"
                style={{ width: `${progress}%` }}
              />
              {/* Bottom border progress line */}
              <div
                className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 pointer-events-none transition-none shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                style={{ width: `${progress}%` }}
              />
              <span className="relative z-10 font-bold text-white tracking-wider">
                {currentSlide.number}
              </span>
              <span className="relative z-10 text-slate-500 font-normal">/</span>
              <span className="relative z-10 text-slate-400">
                {totalSlides.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => {
                triggerInteraction();
                setIsPlaying((prev) => !prev);
              }}
              aria-label={isPlaying ? 'Pause automatic presentation' : 'Play automatic presentation'}
              title={isPlaying ? 'Pause autoplay' : 'Resume autoplay'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-sm hover:border-white/20"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-blue-400" />
              ) : (
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 translate-x-0.5" />
              )}
            </button>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerInteraction();
                  handlePrev();
                }}
                aria-label="Previous feature slide"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-sm hover:border-white/20"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerInteraction();
                  handleNext();
                }}
                aria-label="Next feature slide"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-sm hover:border-white/20"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN SHOWCASE ROW (EXACT SCREENSHOT RATIOS & SYNCHRONIZED SLIDING TRACK)
            Desktop: Large Landscape Left (~66%) + 3 Continuously Sliding Cards Right (~34%)
        ========================================================================= */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch min-h-[260px] sm:min-h-[360px] md:min-h-[440px] lg:h-[500px] xl:h-[540px]">
            {/* Left: Main Large Landscape Visual Panel (~66% width on lg) */}
            <div className="lg:col-span-8 relative group">
              <div className="relative w-full h-full min-h-[240px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0c111d] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-end">
                {/* Previous Slide Image (stays behind for flicker-free crossfade) */}
                {prevIndex !== null && (
                  <img
                    src={FEATURE_SLIDES[prevIndex].image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    aria-hidden="true"
                  />
                )}

                {/* Current Slide Image (fades in smoothly with subtle zoom) */}
                <img
                  key={currentSlide.id}
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-out ${
                    isFading ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
                  }`}
                  loading="eager"
                />

                {/* Subtle bottom-only gradient protection for badge legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070B14]/85 via-transparent to-transparent pointer-events-none" />

                {/* Ambient Highlight Border on Active Panel */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-blue-400/20 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />

                {/* Category Badge on Bottom-Left of Main Visual (Exact Reference Style) */}
                <div className="relative z-10 p-4 sm:p-6 lg:p-7">
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-xl">
                    <CurrentIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                    <span className="text-xs sm:text-sm font-semibold tracking-wide text-white">
                      {currentSlide.category}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Exactly 3 Visible Vertical Preview Cards with Smooth Continuous Movement */}
            <div
              ref={railContainerRef}
              className="hidden lg:block lg:col-span-4 relative h-full overflow-hidden rounded-2xl"
            >
              <div
                className="flex gap-3.5 h-full"
                style={{
                  transform: `translateX(-${(step + 1) * stepDistance}px)`,
                  transition: isJumping
                    ? 'none'
                    : 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {EXTENDED_TRACK.map((slide, i) => {
                  const isUpNext = i === step + 1;
                  return (
                    <button
                      key={`rail-${i}`}
                      type="button"
                      onClick={() => {
                        const offset = i - (step + 1) + 1;
                        handleSelectOffset(offset);
                      }}
                      aria-label={`Switch to ${slide.title}`}
                      style={{
                        width: `${cardWidth}px`,
                        flexShrink: 0,
                      }}
                      className={`relative group h-full rounded-2xl overflow-hidden bg-[#0c111d] border transition-all duration-300 hover:scale-[1.02] active:scale-98 cursor-pointer shadow-md text-left flex flex-col justify-end p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        isUpNext
                          ? 'border-blue-400/90 shadow-[0_0_24px_rgba(59,130,246,0.35)] ring-1 ring-blue-500/50'
                          : 'border-white/10 hover:border-blue-400/60'
                      }`}
                    >
                      {/* Thumbnail Image - High Visibility */}
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                        loading="lazy"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070B14]/90 via-[#070B14]/30 to-transparent group-hover:from-[#070B14]/75 transition-colors duration-300" />

                      {/* Highlight outline */}
                      <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-blue-400/40 transition-colors pointer-events-none" />

                      {/* "UP NEXT" illuminated pill on the first upcoming card */}
                      {isUpNext && (
                        <div className="absolute top-3 left-3 z-20">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/90 backdrop-blur-xs text-[9px] font-bold text-white tracking-wider uppercase shadow-xs">
                            UP NEXT
                          </span>
                        </div>
                      )}

                      {/* Thumbnail Content with glass pill at Bottom */}
                      <div className="relative z-10 bg-black/60 backdrop-blur-xs p-2 sm:p-2.5 rounded-xl border border-white/10 space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 tracking-wider">
                          <span>{slide.number}</span>
                        </div>
                        <p className="text-xs font-semibold text-white line-clamp-1 leading-snug group-hover:text-blue-200 transition-colors">
                          {slide.title}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {slide.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Horizontal Thumbnails Rail (below main visual on < lg) */}
          <div
            ref={mobileRailRef}
            className="lg:hidden mt-3 sm:mt-4 overflow-x-auto pb-2 scrollbar-none flex gap-2.5 sm:gap-3 snap-x snap-mandatory"
          >
            {FEATURE_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => handleSelectIndex(idx)}
                  className={`relative flex-shrink-0 w-32 sm:w-40 h-24 sm:h-28 rounded-xl overflow-hidden border snap-start text-left p-2.5 flex flex-col justify-end transition-all cursor-pointer ${
                    isActive
                      ? 'border-blue-400 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/25 scale-[1.02]'
                      : 'border-white/10 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold text-blue-400">{slide.number}</span>
                    <p className="text-xs font-semibold text-white truncate">{slide.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            CONTENT & INTERACTIVE CTA ROW (BELOW VISUAL)
            Left: Feature Details & Description
            Right: Prominent Working CTA Button
        ========================================================================= */}
        <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
          <div
            className={`space-y-1 sm:space-y-1.5 max-w-3xl transition-all duration-500 ease-out ${
              isFading ? 'opacity-40 translate-y-1' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">
                {currentSlide.number} — {currentSlide.category}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-medium">{currentSlide.subtitle}</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
              {currentSlide.title}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm md:text-[15px] leading-relaxed">
              {currentSlide.description}
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-center flex-shrink-0">
            <button
              type="button"
              onClick={handleCtaClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>{currentSlide.ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* 10-Dot Progress Bar with Active Fill */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1 sm:pt-2">
          {FEATURE_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleSelectIndex(idx)}
                aria-label={`Go to feature ${slide.number}: ${slide.title}`}
                className={`transition-all duration-300 cursor-pointer h-2 rounded-full overflow-hidden ${
                  isActive
                    ? 'w-10 sm:w-12 bg-white/10 ring-1 ring-blue-500/40 shadow-xs'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              >
                {isActive && (
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full transition-none"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
