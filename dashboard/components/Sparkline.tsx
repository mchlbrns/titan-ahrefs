import React from 'react';

interface SparklineProps {
  /** Array of numeric data points (min 2) */
  data: number[];
  /** Stroke color — defaults to #00D2FF */
  color?: string;
  /** Fill color under the line — defaults to derived from color at low opacity */
  fillColor?: string;
  width?: number;
  height?: number;
}

/**
 * Tiny inline SVG sparkline — Reddit post-activity graph style.
 * Renders a smooth polyline with a gradient fill beneath.
 */
export default function Sparkline({
  data,
  color = '#00D2FF',
  fillColor,
  width = 120,
  height = 32,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + ((1 - (v - min) / range) * (height - pad * 2));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = points.join(' ');

  // Close path for fill — go to bottom-right, bottom-left, back to start
  const lastX = (pad + width - pad).toFixed(1);
  const lastY = (height - pad).toFixed(1);
  const firstX = pad.toFixed(1);
  const fillPath = `M${points[0]} L${pathD.slice(pathD.indexOf(' ') + 1)} L${lastX},${lastY} L${firstX},${lastY} Z`;

  const gradientId = `spark-grad-${Math.random().toString(36).slice(2, 7)}`;

  // fillColor prop is reserved for future use; gradient uses color at low opacity
  void fillColor;

  const formattedTrend = data.map((n) => Math.round(n)).join(', ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="sparkline-wrap"
      style={{ display: 'block' }}
    >
      <title>Trend: {formattedTrend}</title>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <path d={fillPath} fill={`url(#${gradientId})`} />
      {/* Line */}
      <polyline
        points={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
      {/* Endpoint dot */}
      {(() => {
        const last = points[points.length - 1].split(',');
        return (
          <circle
            cx={last[0]}
            cy={last[1]}
            r="2.5"
            fill={color}
            opacity="0.9"
          />
        );
      })()}
    </svg>
  );
}
