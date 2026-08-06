import React from 'react';

interface ApiUsagePillProps {
  monthlyUsed: number;
  monthlyLimit: number;
  usagePercent: string | number;
  resetDate?: string;
}

export default function ApiUsagePill({
  monthlyUsed,
  monthlyLimit,
  usagePercent,
  resetDate = 'Sept 4, 2026',
}: ApiUsagePillProps) {
  const pct =
    typeof usagePercent === 'string'
      ? parseFloat(usagePercent.replace('%', ''))
      : usagePercent;

  const isCritical = pct >= 80;
  const isWarning = pct >= 60 && pct < 80;

  const dotColor = isCritical
    ? 'bg-rose-400'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-emerald-400';

  const textColor = isCritical
    ? 'text-rose-300'
    : isWarning
    ? 'text-amber-300'
    : 'text-slate-400';

  const title = [
    `Ahrefs API usage: ${pct.toFixed(1)}%`,
    `${monthlyUsed.toLocaleString()} / ${monthlyLimit.toLocaleString()} units`,
    `Resets ${resetDate}`,
    isCritical ? '⚠ 80% cap reached — ingestion halted' : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 text-xs ${textColor} cursor-default`}
      aria-label={`API usage ${pct.toFixed(1)}%`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>API {pct.toFixed(1)}%</span>
    </span>
  );
}
