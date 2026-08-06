import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subText?: string;
  changePercent?: number;
  /** When false, renders "Not yet tracked" instead of the value */
  hasData?: boolean;
  /** Size variant — 'hero' uses display font, 'default' uses standard large */
  size?: 'hero' | 'default';
}

export default function KpiCard({
  title,
  value,
  subText,
  changePercent,
  hasData = true,
  size = 'default',
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

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {title}
      </p>

      {/* Value + trend */}
      <div className="flex items-baseline gap-3">
        {!hasData ? (
          <span className="text-sm text-slate-600 italic">Not yet tracked</span>
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
        <p className="text-xs text-slate-500">{subText}</p>
      )}
    </div>
  );
}
