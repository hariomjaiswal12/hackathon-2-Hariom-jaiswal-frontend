import React, { useEffect, useRef, useState, useCallback, useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HalftoneWordmarkFooterProps {
  wordmark?: string;
  label?: string;
  meta?: string;
  preset?: 'night' | 'day' | 'cyber' | string;
  interactive?: boolean;
  backToTop?: boolean;
  dotGap?: number;
  radius?: number;
  grain?: number;
  fontWeight?: number | string;
  className?: string;
  palette?: {
    background?: string;
    ink?: string;
    warm?: string;
    text?: string;
    muted?: string;
    border?: string;
  };
}

interface Particle {
  x0: number;
  y0: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  heat: number; // 0 (ink) -> 1 (warm cyan)
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  strength: number;
}

const PRESET_PALETTES = {
  night: {
    background: '#080D1A',
    ink: '#E5EEFF',
    warm: '#22D3EE',
    text: '#F8FAFC',
    muted: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.08)',
  },
  cyber: {
    background: '#050811',
    ink: '#38BDF8',
    warm: '#06B6D4',
    text: '#F8FAFC',
    muted: '#64748B',
    border: 'rgba(56, 189, 248, 0.15)',
  },
  day: {
    background: '#F8FAFC',
    ink: '#0F172A',
    warm: '#0284C7',
    text: '#0F172A',
    muted: '#64748B',
    border: 'rgba(0, 0, 0, 0.08)',
  },
};

// Helper: parse hex or rgb string into [r, g, b]
function parseColor(str: string): [number, number, number] {
  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  const match = str.match(/\d+/g);
  if (match && match.length >= 3) {
    return [parseInt(match[0], 10), parseInt(match[1], 10), parseInt(match[2], 10)];
  }
  return [229, 238, 255]; // fallback
}

export function HalftoneWordmarkFooter({
  wordmark = 'companyiq',
  label = 'CompanyIQ',
  meta = 'AI-powered company intelligence | Research smarter. Decide better.',
  preset = 'night',
  interactive = true,
  backToTop = true,
  dotGap = 5,
  radius = 95,
  grain = 0.25,
  fontWeight = 800,
  className,
  palette: customPalette,
}: HalftoneWordmarkFooterProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const grainFilterId = useId();

  // Selected palette
  const activePreset = PRESET_PALETTES[preset as keyof typeof PRESET_PALETTES] || PRESET_PALETTES.night;
  const palette = {
    background: customPalette?.background || activePreset.background,
    ink: customPalette?.ink || activePreset.ink,
    warm: customPalette?.warm || activePreset.warm,
    text: customPalette?.text || activePreset.text,
    muted: customPalette?.muted || activePreset.muted,
    border: customPalette?.border || activePreset.border,
  };

  const inkRGB = useRef<[number, number, number]>(parseColor(palette.ink));
  const warmRGB = useRef<[number, number, number]>(parseColor(palette.warm));

  useEffect(() => {
    inkRGB.current = parseColor(palette.ink);
    warmRGB.current = parseColor(palette.warm);
  }, [palette.ink, palette.warm]);

  // Pointer state
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  // Shockwaves array
  const shockwavesRef = useRef<Shockwave[]>([]);

  // Smooth scroll back to top handler
  const handleBackToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }, []);

  // Main canvas animation and physics engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!canvas || !canvasContainer) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animFrameId: number;
    let particles: Particle[] = [];
    // Start visible so dots are never blank
    let isVisible = true;
    let prefersReducedMotion = false;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Build particle halftone grid
    const initParticles = () => {
      const rect = canvasContainer.getBoundingClientRect();
      const rawWidth = rect.width || canvasContainer.clientWidth || window.innerWidth || 1200;
      const rawHeight = rect.height || canvasContainer.clientHeight || 280;

      const intWidth = Math.max(Math.floor(rawWidth), 320);
      const intHeight = Math.max(Math.floor(rawHeight), 180);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(intWidth * dpr);
      canvas.height = Math.floor(intHeight * dpr);
      canvas.style.width = `${intWidth}px`;
      canvas.style.height = `${intHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Create offscreen canvas to render bold wordmark text
      const offscreen = document.createElement('canvas');
      offscreen.width = intWidth;
      offscreen.height = intHeight;
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      // Calculate responsive font size to span almost the entire footer width (~92%), bounded by canvas height
      const targetWidth = intWidth * 0.92;
      const maxFontByHeight = Math.floor(intHeight * 0.68);
      let fontSize = Math.min(Math.floor(intWidth * 0.20), maxFontByHeight);
      const fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      offCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      let textMetrics = offCtx.measureText(wordmark);
      if (textMetrics.width > 0) {
        fontSize = Math.floor(fontSize * (targetWidth / textMetrics.width));
        // Clamp min and max font size so letters never clip vertically or horizontally
        fontSize = Math.min(fontSize, maxFontByHeight);
        fontSize = Math.max(fontSize, 32);
        offCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      }

      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';

      // Centered vertically in the canvas so all letters & descenders are prominent
      const centerY = Math.floor(intHeight * 0.50);
      const centerX = Math.floor(intWidth / 2);

      offCtx.fillText(wordmark, centerX, centerY);

      // Sample pixels
      const imgData = offCtx.getImageData(0, 0, intWidth, intHeight);
      const data = imgData.data;

      particles = [];
      const effectiveDotGap = intWidth < 640 ? Math.max(dotGap, 4.5) : dotGap;

      for (let y = 0; y < intHeight; y += effectiveDotGap) {
        for (let x = 0; x < intWidth; x += effectiveDotGap) {
          const py = Math.floor(y);
          const px = Math.floor(x);
          const index = (py * intWidth + px) * 4;
          const alpha = data[index + 3];

          // If pixel has text alpha
          if (alpha > 30) {
            const alphaRatio = alpha / 255;
            // Radius based on alpha/brightness
            const baseRadius = Math.max(1.15, effectiveDotGap * 0.38 * alphaRatio);

            particles.push({
              x0: px,
              y0: py,
              x: px,
              y: py,
              vx: 0,
              vy: 0,
              baseRadius,
              heat: 0,
            });
          }
        }
      }

      // Safeguard: if for any reason particles array is empty, retry safely
      if (particles.length === 0) {
        setTimeout(() => {
          initParticles();
          render();
        }, 60);
      }
    };

    initParticles();

    // Physics & render loop
    const spring = 0.085;
    const friction = 0.82;
    const repulsionRadius = radius;
    const repulsionRadiusSq = radius * radius;

    const render = () => {
      const rect = canvasContainer.getBoundingClientRect();
      const width = rect.width || canvas.width;
      const height = rect.height || canvas.height;

      ctx.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const hasPointer = interactive && pointer.active && !prefersReducedMotion;
      const shockwaves = shockwavesRef.current;

      // Update shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        if (sw.radius > sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      const [inkR, inkG, inkB] = inkRGB.current;
      const [warmR, warmG, warmB] = warmRGB.current;

      // Single pass over particles for high 60fps performance
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // 1. Mouse repulsion
          if (hasPointer) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < repulsionRadiusSq && distSq > 0.1) {
              const dist = Math.sqrt(distSq);
              const norm = 1 - dist / repulsionRadius;
              const force = norm * norm * 6.5;
              const angle = Math.atan2(dy, dx);

              p.vx += Math.cos(angle) * force * 1.6;
              p.vy += Math.sin(angle) * force * 1.6;
              p.heat = Math.min(1.0, p.heat + norm * 0.7);
            }
          }

          // 2. Shockwave ripple impulse
          for (let s = 0; s < shockwaves.length; s++) {
            const sw = shockwaves[s];
            const dx = p.x - sw.x;
            const dy = p.y - sw.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const diff = Math.abs(dist - sw.radius);

            if (diff < 32) {
              const waveNorm = 1 - diff / 32;
              const lifeFactor = 1 - sw.radius / sw.maxRadius;
              const impulse = waveNorm * lifeFactor * sw.strength;
              const angle = Math.atan2(dy, dx);

              p.vx += Math.cos(angle) * impulse * 1.8;
              p.vy += Math.sin(angle) * impulse * 1.8;
              p.heat = Math.min(1.0, p.heat + waveNorm * lifeFactor);
            }
          }

          // 3. Spring physics back to home position (x0, y0)
          p.vx += (p.x0 - p.x) * spring;
          p.vy += (p.y0 - p.y) * spring;
          p.vx *= friction;
          p.vy *= friction;
          p.x += p.vx;
          p.y += p.vy;

          // 4. Heat decay
          p.heat *= 0.94;
        }

        // Color interpolation between ink and warm cyan
        const h = p.heat;
        const r = Math.round(inkR + (warmR - inkR) * h);
        const g = Math.round(inkG + (warmG - inkG) * h);
        const b = Math.round(inkB + (warmB - inkB) * h);
        const curRadius = p.baseRadius * (1 + h * 0.4);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isVisible) {
        animFrameId = requestAnimationFrame(render);
      }
    };

    // Draw initial frame immediately so canvas is NEVER blank
    render();

    // Re-initialize once document web fonts are loaded
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        initParticles();
        render();
      });
    }

    // Safety re-checks after layout reflow
    const safetyTimer1 = setTimeout(() => {
      initParticles();
      render();
    }, 120);
    const safetyTimer2 = setTimeout(() => {
      initParticles();
      render();
    }, 450);

    // IntersectionObserver to pause loop when offscreen (with 350px rootMargin so it activates early)
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const nextVisible = entry ? entry.isIntersecting : true;
        if (nextVisible && !isVisible) {
          isVisible = true;
          cancelAnimationFrame(animFrameId);
          animFrameId = requestAnimationFrame(render);
        } else if (!nextVisible) {
          isVisible = false;
          cancelAnimationFrame(animFrameId);
        }
      },
      { threshold: 0, rootMargin: '350px' }
    );

    observer.observe(canvasContainer);

    // Resize observer
    let resizeTimer: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initParticles();
        render();
      }, 100);
    });

    resizeObserver.observe(canvasContainer);

    // Event listeners for pointer & click
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
      if (!isVisible) {
        isVisible = true;
        animFrameId = requestAnimationFrame(render);
      }
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const handleCanvasClick = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const maxDim = Math.max(rect.width, rect.height);

      shockwavesRef.current.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: maxDim * 1.1,
        speed: 13,
        strength: 9,
      });

      if (!isVisible) {
        isVisible = true;
        animFrameId = requestAnimationFrame(render);
      }
    };

    // Touch events for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        pointerRef.current = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
          active: true,
        };
      }
    };

    const handleTouchEnd = () => {
      pointerRef.current.active = false;
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearTimeout(resizeTimer);
      clearTimeout(safetyTimer1);
      clearTimeout(safetyTimer2);
      observer.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [wordmark, dotGap, radius, fontWeight, interactive]);

  return (
    <footer
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden border-t selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors',
        className
      )}
      style={{
        backgroundColor: palette.background,
        borderColor: palette.border,
        color: palette.text,
      }}
    >
      {/* SVG Grain Filter Definition */}
      <svg className="sr-only" aria-hidden="true">
        <filter id={grainFilterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
      </svg>

      {/* Subtle Ambient Glow Behind Footer */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, rgba(37, 99, 235, 0.15) 45%, transparent 75%)',
        }}
      />

      {/* TOP AREA: Brand Header & Structured 3-Column Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 md:pt-16 pb-8">
        {/* Header Bar: Brand, Tagline, & Back to Top */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white no-underline group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 group-hover:bg-blue-500 transition-transform">
                <Layers size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">{label}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles size={10} /> Intelligence OS
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              {meta}
            </p>
          </div>

          {backToTop && (
            <button
              onClick={handleBackToTop}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group active:scale-95"
              aria-label="Back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp size={13} className="text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* 3 Structured Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10 py-8">
          {/* Column 1: EXPLORE */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Explore
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/explore" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  Explore Companies
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  Company Profiles
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  Compare Companies
                </Link>
              </li>
              <li>
                <Link to="/ask" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  AI Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: PLATFORM */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Platform
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/career-dna" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  Career DNA
                </Link>
              </li>
              <li>
                <Link to="/career-fit" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  Career Fit
                </Link>
              </li>
              <li>
                <Link to="/what-if" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  What-If Simulator
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Company
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#transparency" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  About CompanyIQ
                </a>
              </li>
              <li>
                <Link to="/settings" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-cyan-300 transition-colors inline-block py-0.5">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-row: Copyright & Live Operational Status */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 CompanyIQ. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400">Halftone Physics Engine v2.4</span>
          </div>
        </div>
      </div>

      {/* GIANT HALFTONE WORDMARK CANVAS CONTAINER */}
      <div
        ref={canvasContainerRef}
        className="relative w-full h-[180px] sm:h-[220px] md:h-[270px] lg:h-[310px] overflow-hidden cursor-crosshair select-none"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Screen Reader accessible text */}
        <span className="sr-only">CompanyIQ Wordmark</span>

        {/* Canvas for halftone dots */}
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="CompanyIQ Interactive Halftone Wordmark"
          className="w-full h-full block"
        />

        {/* Interactive hint on hover/view */}
        <div className="absolute top-2.5 right-6 pointer-events-none hidden sm:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500/70 bg-white/[0.02] px-2.5 py-1 rounded-full border border-white/[0.05]">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping"></span>
          Move pointer / click to shockwave
        </div>

        {/* Print-grain Texture Overlay */}
        {grain > 0 && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              opacity: grain,
              filter: `url(#${grainFilterId})`,
            }}
          />
        )}

        {/* Bottom subtle gradient fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${palette.background} 0%, transparent 100%)`,
          }}
        />
      </div>
    </footer>
  );
}
