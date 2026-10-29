import React from 'react';

interface RadarChartProps {
  data: {
    label: string;
    value: number; // 0-100
  }[];
  size?: number;
  className?: string;
  fillColor?: string;
  strokeColor?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 280,
  className = '',
  fillColor = 'rgba(117, 71, 203, 0.12)',
  strokeColor = '#7547CB',
}) => {
  const center = size / 2;
  const radius = size * 0.38;
  const numPoints = data.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  const getCoordinates = (index: number, val: number) => {
    // Start from top (-PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = (val / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Polygon path for user values
  const polygonPoints = data
    .map((item, i) => {
      const { x, y } = getCoordinates(i, item.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric polygons */}
        {gridLevels.map((lvl, lvlIdx) => {
          const points = data
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl * 100);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={`grid-${lvlIdx}`}
              points={points}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1"
              className="stroke-[#E2E8F0] dark:stroke-[#26324A]"
            />
          );
        })}

        {/* Radial Axis Lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth="1"
              className="stroke-[#E2E8F0] dark:stroke-[#26324A]"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
          className="transition-all duration-700 ease-out"
        />

        {/* Data vertices */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, item.value);
          return (
            <circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r="3.5"
              fill={strokeColor}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="stroke-white dark:stroke-[#0F172A]"
            />
          );
        })}

        {/* Axis Labels */}
        {data.map((item, i) => {
          // Push labels slightly outside
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <text
              key={`lbl-${i}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="11"
              fontWeight="500"
              fill="#5A6A85"
              className="fill-[#5A6A85] dark:fill-[#94A3B8]"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

