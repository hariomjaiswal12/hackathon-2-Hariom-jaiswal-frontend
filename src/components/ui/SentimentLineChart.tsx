import React from 'react';

interface SentimentLineChartProps {
  className?: string;
  height?: number;
}

export const SentimentLineChart: React.FC<SentimentLineChartProps> = ({
  className = '',
  height = 160,
}) => {
  // Data points for 2024, 2025, 2026 (percentage 0-100)
  // Positive: starts around 65 -> 60 -> 72
  // Neutral: starts around 20 -> 25 -> 18
  // Negative: starts around 15 -> 15 -> 10
  const points = {
    positive: [
      { year: '2024', x: 40, y: 55 },
      { year: '2025', x: 140, y: 65 },
      { year: '2026', x: 240, y: 40 },
    ],
    neutral: [
      { year: '2024', x: 40, y: 95 },
      { year: '2025', x: 140, y: 80 },
      { year: '2026', x: 240, y: 105 },
    ],
    negative: [
      { year: '2024', x: 40, y: 120 },
      { year: '2025', x: 140, y: 110 },
      { year: '2026', x: 240, y: 125 },
    ],
  };

  const toPath = (arr: { x: number; y: number }[]) =>
    `M ${arr[0].x} ${arr[0].y} Q ${(arr[0].x + arr[1].x) / 2} ${(arr[0].y + arr[1].y) / 2 - 5}, ${arr[1].x} ${arr[1].y} T ${arr[2].x} ${arr[2].y}`;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="none">
          {/* Horizontal grid lines */}
          <line x1="20" y1="35" x2="260" y2="35" stroke="#F1F5F9" strokeWidth="1" className="stroke-[#F1F5F9] dark:stroke-[#1E293B]" />
          <line x1="20" y1="75" x2="260" y2="75" stroke="#F1F5F9" strokeWidth="1" className="stroke-[#F1F5F9] dark:stroke-[#1E293B]" />
          <line x1="20" y1="115" x2="260" y2="115" stroke="#F1F5F9" strokeWidth="1" className="stroke-[#F1F5F9] dark:stroke-[#1E293B]" />
          <line x1="20" y1="135" x2="260" y2="135" stroke="#E2E8F0" strokeWidth="1" className="stroke-[#E2E8F0] dark:stroke-[#26324A]" />

          {/* Paths */}
          {/* Positive line */}
          <path
            d={toPath(points.positive)}
            fill="none"
            stroke="#177454"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-[#177454] dark:stroke-[#22C55E]"
          />
          {/* Neutral line */}
          <path
            d={toPath(points.neutral)}
            fill="none"
            stroke="#5A6A85"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-[#5A6A85] dark:stroke-[#94A3B8]"
          />
          {/* Negative line */}
          <path
            d={toPath(points.negative)}
            fill="none"
            stroke="#9A6417"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-[#9A6417] dark:stroke-[#F59E0B]"
          />

          {/* Data point dots */}
          {points.positive.map((p, i) => (
            <circle key={`pos-${i}`} cx={p.x} cy={p.y} r="3" fill="#177454" className="fill-[#177454] dark:fill-[#22C55E]" />
          ))}
          {points.neutral.map((p, i) => (
            <circle key={`neu-${i}`} cx={p.x} cy={p.y} r="3" fill="#5A6A85" className="fill-[#5A6A85] dark:fill-[#94A3B8]" />
          ))}
          {points.negative.map((p, i) => (
            <circle key={`neg-${i}`} cx={p.x} cy={p.y} r="3" fill="#9A6417" className="fill-[#9A6417] dark:fill-[#F59E0B]" />
          ))}

          {/* Year X labels */}
          <text x="40" y="146" textAnchor="middle" fontSize="10" fill="#64748B" className="fill-[#64748B] dark:fill-[#94A3B8]">2024</text>
          <text x="140" y="146" textAnchor="middle" fontSize="10" fill="#64748B" className="fill-[#64748B] dark:fill-[#94A3B8]">2025</text>
          <text x="240" y="146" textAnchor="middle" fontSize="10" fill="#64748B" className="fill-[#64748B] dark:fill-[#94A3B8]">2026</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-[11px] text-[#5A6A85] dark:text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#177454] dark:bg-[#22C55E]" />
          <span>Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5A6A85] dark:bg-[#94A3B8]" />
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9A6417] dark:bg-[#F59E0B]" />
          <span>Negative</span>
        </div>
      </div>
    </div>
  );
};

