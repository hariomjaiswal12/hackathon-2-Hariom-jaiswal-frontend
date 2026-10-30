import React, { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TiltedGridHeroImage {
  src: string;
  alt?: string;
}

export interface TiltedGridHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  images: TiltedGridHeroImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: number;
  curve?: number;
  fade?: number;
  children?: React.ReactNode;
  className?: string;
}

const SLICES_PER_TILE = 16;
const MAGNIFICATION = 1.6;
const FIELD_OF_DEPTH = 55;

function arc(curveRad: number): number {
  return (MAGNIFICATION - 1 + Math.cos(curveRad)) / (2 * MAGNIFICATION * Math.sin(curveRad));
}

interface LayoutMeasurements {
  columns: number;
  sweep: number;
  unit: number;
  limit: number;
}

function measure(
  width: number,
  height: number,
  tileHeight: number,
  aspectRatio: number,
  gap: number,
  curveRad: number
): LayoutMeasurements {
  const q = Math.min((tileHeight / 100) * height, ((FIELD_OF_DEPTH / 100) * width) / aspectRatio);
  const Z = width * arc(curveRad);

  if (!(q > 0) || !(Z > 0)) {
    return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  }

  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const p = toDeg(q / Z);
  const angularStep = (aspectRatio + gap / 100) * p;
  const maxSpan = toDeg(curveRad) + (aspectRatio * p) / 2;
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * maxSpan) / angularStep)));
  const round = (val: number) => +val.toFixed(4);
  const sweep = round((columns * angularStep) / 2);

  return {
    columns,
    sweep,
    unit: round(p),
    limit: round(Math.min(sweep, maxSpan)),
  };
}

export const TiltedGridHero: React.FC<TiltedGridHeroProps> = ({
  images,
  speed = 4,
  tileHeight = 30,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  style,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const animKeyframesId = `tgh-anim-${rawId}`;
  const tileClassName = `tgh-tile-${rawId}`;

  const curveRad = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;
  const [layout, setLayout] = useState<LayoutMeasurements | null>(null);
  const [iterationOffsets, setIterationOffsets] = useState<Record<number, number>>({});

  // Responsive ResizeObserver for precise container measurements
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const calculated = measure(width, height, tileHeight, aspectRatio, gap, curveRad);

      setLayout((prev) =>
        prev?.columns === calculated.columns &&
        prev.sweep === calculated.sweep &&
        prev.unit === calculated.unit
          ? prev
          : calculated
      );
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [tileHeight, aspectRatio, gap, curveRad]);

  // Image preloading for ultra-smooth rendering
  useEffect(() => {
    if (!images || images.length === 0) return;
    for (const img of images) {
      if (img?.src) {
        const imageObj = new Image();
        imageObj.src = img.src;
      }
    }
  }, [images]);

  const { columns, sweep, unit, limit } =
    layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, curveRad);

  const calcUnit = (multiplier: number) =>
    `calc(${+multiplier.toFixed(4)} * min(${tileHeight}cqh, ${+(FIELD_OF_DEPTH / aspectRatio).toFixed(4)}cqw))`;

  const zDistanceOffset = 100 * arc(curveRad);
  const zOffsetCqw = `${+zDistanceOffset.toFixed(3)}cqw`;

  const turn = (deg: number) =>
    `translateZ(${zOffsetCqw}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${zOffsetCqw})`;

  const boundaryThreshold = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);

  const keyframesCss = `
    @keyframes ${animKeyframesId} {
      from { transform: ${turn(-sweep)}; }
      to { transform: ${turn(sweep)}; }
      0%, ${boundaryThreshold}%, ${100 - boundaryThreshold}%, 100% {
        visibility: hidden;
      }
      ${boundaryThreshold + 0.001}%, ${100 - boundaryThreshold - 0.001}% {
        visibility: visible;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .${tileClassName} {
        animation-play-state: paused !important;
      }
    }
  `;

  const sliceWidth = aspectRatio / SLICES_PER_TILE;
  const cycleDuration = columns * speed;
  const gradientMask = `linear-gradient(90deg, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ containerType: 'size' as any, ...style }}
      {...rest}
    >
      <style>{keyframesCss}</style>

      {/* 3D Cylindrical Perspective Carousel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: layout ? 1 : 0,
          perspective: `${+(zDistanceOffset * MAGNIFICATION).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: gradientMask,
          WebkitMaskImage: gradientMask,
        }}
      >
        {Array.from({ length: columns }, (_, colIdx) => {
          const reverseColIdx = columns - 1 - colIdx;
          const currentImgOffset =
            (iterationOffsets[colIdx] ?? reverseColIdx) % Math.max(images.length, 1);
          const imgData = images[currentImgOffset];

          return (
            <div
              key={colIdx}
              className={cn(tileClassName, 'absolute')}
              style={{
                left: `calc(50% - ${calcUnit(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${calcUnit(0.5)})`,
                width: calcUnit(aspectRatio),
                height: calcUnit(1),
                transformStyle: 'preserve-3d',
                animation: `${animKeyframesId} ${cycleDuration}s linear ${-colIdx * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                const completedCycles = Math.round(e.elapsedTime / cycleDuration);
                setIterationOffsets((prev) => {
                  const targetIndex = completedCycles * columns + reverseColIdx;
                  return prev[colIdx] === targetIndex
                    ? prev
                    : { ...prev, [colIdx]: targetIndex };
                });
              }}
            >
              {/* 16 vertical strips forming the smooth cylindrical curvature */}
              {Array.from({ length: SLICES_PER_TILE }, (_, sliceIdx) => (
                <div
                  key={sliceIdx}
                  className={cn(
                    'absolute top-0 overflow-hidden bg-slate-900/60 shadow-lg',
                    sliceIdx === 0 && 'rounded-l-xl',
                    sliceIdx === SLICES_PER_TILE - 1 && 'rounded-r-xl'
                  )}
                  style={{
                    left: calcUnit((aspectRatio - sliceWidth) / 2),
                    width:
                      sliceIdx === SLICES_PER_TILE - 1
                        ? calcUnit(sliceWidth)
                        : `calc(${calcUnit(sliceWidth)} + 1px)`,
                    height: calcUnit(1),
                    transform: turn(
                      (aspectRatio / 2 - (sliceIdx + 0.5) * sliceWidth) * unit
                    ),
                  }}
                >
                  {imgData && (
                    <img
                      src={imgData.src}
                      alt={sliceIdx === 0 ? imgData.alt ?? '' : ''}
                      draggable={false}
                      className="absolute top-0 max-w-none object-cover select-none pointer-events-none"
                      style={{
                        left: calcUnit(-sliceIdx * sliceWidth),
                        width: calcUnit(aspectRatio),
                        height: calcUnit(1),
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Hero Children (Heading, Content, CTAs) Rendered On Top */}
      {children}
    </div>
  );
};

export default TiltedGridHero;

