import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface PolaroidSlide {
  image?: string;
  title?: string;
  caption?: string;
  alt?: string;
  note?: string;
}

export interface PolaroidLineCarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  slides: PolaroidSlide[];
  height?: string;
  cardWidth?: number;
  sag?: number;
  swing?: number;
  autoplay?: number;
  string?: string;
  background?: string;
  ink?: string;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

// Math & Physics Helpers
function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

// Parabolic sag equation for hanging string: y = topY + 4 * sag * t * (1 - t)
function getSagY(x: number, width: number, topY: number, sag: number): number {
  const t = clamp(x / width, 0, 1);
  return topY + 4 * sag * t * (1 - t);
}

// Damped harmonic spring physics for position
function springStep(pos: number, vel: number, target: number, dt: number, k = 70): [number, number] {
  const c = 2 * Math.sqrt(k); // critical damping
  const accel = k * (target - pos) - c * vel;
  const newVel = vel + accel * dt;
  return [pos + newVel * dt, newVel];
}

// Pendulum angular swinging physics
function pendulumStep(
  angle: number,
  angularVel: number,
  force: number,
  dt: number,
  swing: number
): [number, number] {
  const torque = -38 * angle - 4.2 * angularVel + force * 0.0034 * swing;
  const newVel = angularVel + torque * dt;
  const newAngle = clamp(angle + newVel * dt, -0.6, 0.6);
  return [newAngle, newVel];
}

function getClosestIndex(pos: number, stepWidth: number, totalCount: number): number {
  return clamp(Math.round(pos / stepWidth), 0, Math.max(0, totalCount - 1));
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : String(num);
}

const CAROUSEL_STYLES = `
.pl-root {
  position: relative;
  width: 100%;
  min-height: 520px;
  overflow: hidden;
  background: var(--pl-bg, transparent);
  color: var(--pl-ink, #F8FAFC);
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
  outline: none;
  border: none;
  cursor: grab;
  mask-image: linear-gradient(90deg, transparent 0%, #000 3%, #000 97%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 3%, #000 97%, transparent 100%);
}
.pl-root[data-drag="1"] {
  cursor: grabbing;
}
.pl-root:focus,
.pl-root:focus-visible {
  outline: none;
  box-shadow: none;
}
.pl-string {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.65));
}
.pl-card {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--pl-cw, 340px);
  transform-origin: 50% 0;
  will-change: transform;
  cursor: inherit;
}
.pl-print {
  margin-top: 10px;
  background: #FDFBF7;
  padding: 13px 13px 8px;
  border-radius: 6px;
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.45), 0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12);
  transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), filter 0.5s ease, box-shadow 0.5s ease, opacity 0.5s ease;
}
.pl-card[data-on="0"] .pl-print {
  transform: scale(0.88);
  filter: saturate(0.6) brightness(0.82);
  opacity: 0.72;
}
.pl-card[data-on="1"] .pl-print {
  transform: scale(1.05);
  box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.6), 0 35px 80px -15px rgba(37, 99, 235, 0.45), 0 0 0 2px rgba(96, 165, 250, 0.4);
  filter: saturate(1.05) brightness(1.02);
  opacity: 1;
}
.pl-shot {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
  background: #0B1120;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.pl-shot img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
.pl-note {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  font: italic 600 16px/1.1 ui-serif, Georgia, Cambria, 'Times New Roman', serif;
  color: #0F172A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}
.pl-peg {
  position: absolute;
  left: 50%;
  top: 0;
  width: 13px;
  height: 30px;
  margin-left: -6.5px;
  border-radius: 3px;
  background: linear-gradient(90deg, #9C7142 0%, #D4AF7A 35%, #F0D5AA 50%, #C49A62 70%, #8A5D32 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.4);
  z-index: 20;
}
.pl-peg::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 10px;
  width: 2.5px;
  height: 9px;
  background: rgba(45, 30, 15, 0.75);
  border-radius: 1px;
}
.pl-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 28px clamp(16px, 4vw, 56px) 20px;
  background: linear-gradient(to top, rgba(7, 11, 20, 0.95) 0%, rgba(7, 11, 20, 0.7) 60%, transparent 100%);
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 24px);
  cursor: default;
  z-index: 30;
}
.pl-cap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  padding-bottom: 0.15em;
}
.pl-cap > * {
  display: block;
  animation: pl-in 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.pl-title {
  font: 800 clamp(19px, 2.4vw, 26px)/1.2 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.02em;
}
.pl-sub {
  margin-top: 4px;
  font: 400 clamp(13px, 1.3vw, 15px)/1.5 ui-sans-serif, system-ui, sans-serif;
  color: #94A3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pl-count {
  font: 600 13px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.14em;
  color: #64748B;
  background: rgba(15, 23, 42, 0.8);
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid rgba(71, 85, 105, 0.5);
  backdrop-filter: blur(8px);
}
.pl-count b {
  color: #38BDF8;
  font-weight: 700;
}
.pl-btn {
  appearance: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(71, 85, 105, 0.6);
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  color: #E2E8F0;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}
.pl-btn:hover {
  background: #2563EB;
  border-color: #3B82F6;
  color: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}
.pl-btn:active {
  transform: translateY(0);
}
.pl-btn:focus-visible {
  outline: 2px solid #38BDF8;
  outline-offset: 2px;
}
.pl-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@keyframes pl-in {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pl-cap > * {
    animation: none;
  }
  .pl-print {
    transition: none;
  }
}
`;

export const PolaroidLineCarousel: React.FC<PolaroidLineCarouselProps> = ({
  slides,
  height = '100%',
  cardWidth = 340,
  sag = 52,
  swing = 1,
  autoplay = 4500,
  string = '#94A3B8',
  background = 'transparent',
  ink = '#F8FAFC',
  onChange,
  className,
  style,
  ariaLabel = 'CompanyIQ Platform Insights Carousel',
  ...rest
}) => {
  const totalCount = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [viewport, setViewport] = useState({ w: 1200, h: 560, cw: cardWidth });

  const rootRef = useRef<HTMLDivElement>(null);
  const stringPathRef = useRef<SVGPathElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Animation physics state ref
  const animState = useRef({
    off: 0,
    vel: 0,
    target: 0,
    a: [] as number[], // angle per card
    w: [] as number[], // angular velocity per card
  });

  const dragPointer = useRef<{
    x: number;
    off: number;
    lx: number;
    lt: number;
    v: number;
    moved: boolean;
  } | null>(null);

  const lastInteractionTime = useRef(0);
  const activeIndexRef = useRef(0);
  const paramsRef = useRef({ sag, swing });
  paramsRef.current = { sag, swing };

  // Spacing between cards along the hanging line
  const stepWidth = viewport.cw * 1.1;

  // Jump to specific slide index
  const goToIndex = useCallback(
    (index: number) => {
      animState.current.target = clamp(index, 0, totalCount - 1) * stepWidth;
    },
    [totalCount, stepWidth]
  );

  // ResizeObserver for responsive width & height
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const calculatedCw = Math.round(
        Math.max(160, Math.min(cardWidth, rect.width * 0.38, rect.height * 0.62))
      );
      setViewport({ w: rect.width, h: rect.height, cw: calculatedCw });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [cardWidth]);

  // Keep target aligned on step width change
  useEffect(() => {
    animState.current.target = activeIndexRef.current * stepWidth;
    animState.current.off = activeIndexRef.current * stepWidth;
  }, [stepWidth]);

  // Trigger onChange callback
  useEffect(() => {
    onChange?.(activeIndex);
  }, [activeIndex, onChange]);

  // Main RAF Physics Animation Loop
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isVisible = true;
    let rafId = 0;
    let lastTime = performance.now();
    const state = animState.current;

    const tick = (now: number) => {
      rafId = 0;
      if (!isVisible) return;

      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      const { w: width, h: height, cw } = viewport;
      const topY = Math.max(34, height * 0.15);
      const drag = dragPointer.current;

      let speedForce: number;
      if (drag && drag.moved) {
        speedForce = drag.v * 1000;
      } else {
        const prevOff = state.off;
        [state.off, state.vel] = springStep(state.off, state.vel, state.target, dt);
        speedForce = -(state.off - prevOff) / Math.max(dt, 0.001);
      }

      const { sag: currentSag, swing: currentSwing } = paramsRef.current;
      const effectiveSwing = prefersReducedMotion ? 0 : currentSwing;
      const closestIdx = getClosestIndex(state.off, stepWidth, totalCount);

      // Position each hanging polaroid card
      for (let i = 0; i < totalCount; i++) {
        const cardEl = cardRefs.current[i];
        if (!cardEl) continue;

        const cardX = width / 2 + i * stepWidth - state.off;

        // Culling offscreen cards
        if (cardX < -cw * 1.5 || cardX > width + cw * 1.5) {
          cardEl.style.visibility = 'hidden';
          continue;
        }
        cardEl.style.visibility = 'visible';

        // Angular swinging pendulum calculation
        let angle = state.a[i] || 0;
        let angularVel = state.w[i] || 0;
        [angle, angularVel] = pendulumStep(angle, angularVel, speedForce, dt, effectiveSwing);

        // Subtle ambient natural breathing sway
        if (effectiveSwing > 0) {
          angle += Math.sin(now / 1300 + i * 1.7) * 0.0009 * effectiveSwing;
        }

        state.a[i] = angle;
        state.w[i] = angularVel;

        const cardY = getSagY(cardX, width, topY, currentSag) - 6;
        cardEl.style.transform = `translate(${(cardX - cw / 2).toFixed(1)}px, ${cardY.toFixed(
          1
        )}px) rotate(${angle.toFixed(4)}rad)`;
        cardEl.style.zIndex = String(i === closestIdx ? totalCount + 2 : totalCount - Math.abs(i - closestIdx));
      }

      // Update curved hanging string SVG path (Quadratic Bezier)
      if (stringPathRef.current) {
        stringPathRef.current.setAttribute(
          'd',
          `M0 ${topY} Q${width / 2} ${topY + 2 * currentSag} ${width} ${topY}`
        );
      }

      // Sync active index change
      if (closestIdx !== activeIndexRef.current) {
        activeIndexRef.current = closestIdx;
        setActiveIndex(closestIdx);
      }

      rafId = requestAnimationFrame(tick);
    };

    // Pause physics calculations when scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    });

    observer.observe(el);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [viewport, stepWidth, totalCount]);

  // Autoplay progression timer
  useEffect(() => {
    if (!autoplay || totalCount < 2) return;

    const timer = window.setInterval(() => {
      if (
        document.hidden ||
        dragPointer.current ||
        performance.now() - lastInteractionTime.current < autoplay
      ) {
        return;
      }
      goToIndex(activeIndexRef.current >= totalCount - 1 ? 0 : activeIndexRef.current + 1);
    }, autoplay);

    return () => window.clearInterval(timer);
  }, [autoplay, totalCount, goToIndex]);

  // Drag & Pointer interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.pl-bar')) return;

    lastInteractionTime.current = performance.now();
    dragPointer.current = {
      x: e.clientX,
      off: animState.current.off,
      lx: e.clientX,
      lt: e.timeStamp,
      v: 0,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragPointer.current;
    if (!drag) return;

    const deltaX = e.clientX - drag.x;
    if (!drag.moved && Math.abs(deltaX) > 5) {
      drag.moved = true;
      setIsDragging(true);
      rootRef.current?.setPointerCapture(e.pointerId);
    }

    if (!drag.moved) return;

    const dt = Math.max(1, e.timeStamp - drag.lt);
    drag.v = 0.7 * ((e.clientX - drag.lx) / dt) + 0.3 * drag.v;
    drag.lx = e.clientX;
    drag.lt = e.timeStamp;

    const maxOffset = (totalCount - 1) * stepWidth;
    let newOffset = drag.off - deltaX;

    // Elastic overscroll dampening
    if (newOffset < 0) newOffset *= 0.35;
    if (newOffset > maxOffset) newOffset = maxOffset + (newOffset - maxOffset) * 0.35;

    animState.current.off = newOffset;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const drag = dragPointer.current;
    dragPointer.current = null;
    lastInteractionTime.current = performance.now();

    if (!drag) return;

    if (drag.moved) {
      setIsDragging(false);
      animState.current.vel = -drag.v * 1000;
      goToIndex(getClosestIndex(animState.current.off - drag.v * 180, stepWidth, totalCount));
      return;
    }

    // Direct click on card
    const targetCard = (e.target as HTMLElement).closest('[data-i]');
    if (targetCard) {
      goToIndex(Number(targetCard.getAttribute('data-i')));
    }
  };

  const stepNav = (direction: number) => {
    lastInteractionTime.current = performance.now();
    goToIndex(clamp(activeIndexRef.current + direction, 0, totalCount - 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      stepNav(1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      stepNav(-1);
      e.preventDefault();
    }
  };

  const activeSlide = slides[activeIndex] || {};

  return (
    <div
      ref={rootRef}
      className={cn('pl-root relative', className)}
      style={{
        height,
        ['--pl-bg' as any]: background,
        ['--pl-ink' as any]: ink,
        ['--pl-cw' as any]: `${viewport.cw}px`,
        ...style,
      }}
      data-drag={isDragging ? '1' : '0'}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      {...rest}
    >
      <style>{CAROUSEL_STYLES}</style>

      {/* Hanging Curved String SVG */}
      <svg className="pl-string" aria-hidden="true">
        <path
          ref={stringPathRef}
          fill="none"
          stroke={string}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Hanging Polaroid Cards */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="pl-card"
          data-i={i}
          data-on={i === activeIndex ? '1' : '0'}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          aria-hidden={i === activeIndex ? undefined : true}
        >
          <div className="pl-print">
            <div className="pl-shot">
              {slide.image && (
                <img
                  src={slide.image}
                  alt={slide.alt || slide.title || ''}
                  draggable={false}
                  loading={i < 4 ? 'eager' : 'lazy'}
                />
              )}
            </div>
            <div className="pl-note">{slide.note || slide.title || ''}</div>
          </div>
          {/* Wooden Peg / Clip with realistic wood gradient & metal pin */}
          <div className="pl-peg" />
        </div>
      ))}

      {/* Bottom Control Bar with Subtle Gradient Backdrop */}
      <div className="pl-bar">
        {/* Active Slide Title and Subtitle */}
        <div className="pl-cap" key={activeIndex} aria-hidden="true">
          {activeSlide.title && <span className="pl-title">{activeSlide.title}</span>}
          {activeSlide.caption && <span className="pl-sub">{activeSlide.caption}</span>}
        </div>

        {/* Monospace Slide Counter: e.g. 01 / 09 */}
        <span className="pl-count" aria-hidden="true">
          <b>{padZero(activeIndex + 1)}</b> / {padZero(totalCount)}
        </span>

        {/* Previous Circular Button */}
        <button
          type="button"
          className="pl-btn"
          aria-label="Previous platform slide"
          onClick={() => stepNav(-1)}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Next Circular Button */}
        <button
          type="button"
          className="pl-btn"
          aria-label="Next platform slide"
          onClick={() => stepNav(1)}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Screen Reader Announcements */}
      <div className="pl-sr" aria-live="polite">
        Platform slide {activeIndex + 1} of {totalCount}
        {activeSlide.title ? `: ${activeSlide.title}` : ''}
      </div>
    </div>
  );
};

export default PolaroidLineCarousel;
