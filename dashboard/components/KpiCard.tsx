import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Sparkline from './Sparkline';

interface KpiCardProps {
  title: string;
  value: string | number;
  subText?: string;
  changePercent?: number;
  /** When false, renders "Not yet tracked" instead of the value */
  hasData?: boolean;
  /** Size variant — 'hero' uses display font, 'default' uses standard large */
  size?: 'hero' | 'default';
  /** Optional 7-point sparkline data array */
  sparklineData?: number[];
  /** Sparkline color override */
  sparklineColor?: string;
}

export default function KpiCard({
  title,
  value,
  subText,
  changePercent,
  hasData = true,
  size = 'default',
  sparklineData,
  sparklineColor,
}: KpiCardProps) {
  const isPositive = changePercent !== undefined && changePercent > 0;
  const isNegative = changePercent !== undefined && changePercent < 0;
  const isFlat = changePercent !== undefined && changePercent === 0;

  const displayValue =
    !hasData
      ? null
      : typeof value === 'number'
      ? value.toLocaleString()
      : value;

  // Auto-derive sparkline color from trend if not overridden
  const resolvedSparkColor = sparklineColor
    || (isPositive ? '#10B981' : isNegative ? '#F43F5E' : '#00D2FF');

  return (
    <div className="kpi-card-wrap h-full flex flex-col justify-between">
      {/* Label */}
      <p className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase mb-2">
        {title}
      </p>

      {/* Value + trend */}
      <div className="flex items-baseline gap-2.5">
        {!hasData ? (
          <span className="text-sm text-slate-700 italic">Not yet tracked</span>
        ) : (
          <>
            <span
              className={
                size === 'hero'
                  ? 'text-display text-white'
                  : 'text-display-sm text-white'
              }
            >
              {displayValue}
            </span>

            {changePercent !== undefined && hasData && (
              <span
                className={`inline-flex items-center gap-0.5 text-sm font-semibold ${
                  isPositive
                    ? 'text-emerald-400'
                    : isNegative
                    ? 'text-rose-400'
                    : 'text-slate-500'
                }`}
              >
                {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
                {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
                {isFlat && <Minus className="h-3.5 w-3.5" />}
                {isPositive ? '+' : ''}{Math.round(changePercent)}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Sub-text */}
      {subText && (
        <p className="text-[11px] text-slate-600 mt-1">{subText}</p>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length >= 2 && hasData && (
        <div className="mt-3">
          <Sparkline
            data={sparklineData}
            color={resolvedSparkColor}
            width={110}
            height={28}
          />
        </div>
      )}
    </div>
  );
}
