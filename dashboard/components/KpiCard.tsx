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

  // Accent styling based on card title
  const accentClass = title.toLowerCase().includes('health')
    ? 'border-t-2 border-t-cyan-400/80 shadow-[0_-4px_16px_rgba(0,210,255,0.12)]'
    : title.toLowerCase().includes('domain rating')
    ? 'border-t-2 border-t-purple-500/80 shadow-[0_-4px_16px_rgba(139,92,246,0.12)]'
    : title.toLowerCase().includes('traffic')
    ? 'border-t-2 border-t-emerald-400/80 shadow-[0_-4px_16px_rgba(16,185,129,0.12)]'
    : title.toLowerCase().includes('referring')
    ? 'border-t-2 border-t-blue-400/80 shadow-[0_-4px_16px_rgba(59,130,246,0.12)]'
    : title.toLowerCase().includes('striking')
    ? 'border-t-2 border-t-amber-400/80 shadow-[0_-4px_16px_rgba(245,158,11,0.12)]'
    : 'border-t border-t-[rgba(255,255,255,0.08)]';

  const numValue = typeof value === 'number' ? value : parseFloat(String(value || '0'));
  const isHealthCard = title.toLowerCase().includes('health') && !isNaN(numValue);

  return (
    <div className={`kpi-card-wrap h-full flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700/80 ${accentClass}`}>
      <div>
        {/* Label */}
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
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
                    ? 'text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white'
                    : 'text-xl sm:text-2xl font-bold text-white'
                }
              >
                {displayValue}
              </span>

              {changePercent !== undefined && hasData && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs sm:text-sm font-bold ${
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
          <p className="text-[11px] text-slate-400 mt-1">{subText}</p>
        )}
      </div>

      {/* Health Score Gradient Progress Bar */}
      {isHealthCard && hasData && (
        <div className="mt-3 space-y-1">
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, numValue))}%` }}
            />
          </div>
        </div>
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
