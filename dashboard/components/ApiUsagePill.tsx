import React from 'react';

interface ApiUsagePillProps {
  monthlyUsed: number | null;
  monthlyLimit: number | null;
  usagePercent: string | number | null;
  resetDate?: string | null;
}

export default function ApiUsagePill({
  monthlyUsed,
  monthlyLimit,
  usagePercent,
  resetDate,
}: ApiUsagePillProps) {
  if (monthlyUsed === null || monthlyLimit === null || usagePercent === null) {
    return null; // Hide entirely instead of showing "API Offline"
  }

  const pct =
    typeof usagePercent === 'string'
      ? parseFloat(usagePercent.replace('%', ''))
      : usagePercent;

  const isQuotaExceeded = pct >= 100;
  const isCritical = pct >= 80;
  const isWarning = pct >= 60 && pct < 80;

  // Dot indicator
  const dotColor = isQuotaExceeded
    ? 'bg-rose-500 animate-pulse'
    : isCritical
    ? 'bg-rose-400'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-emerald-400';

  // Container styles
  const containerClass = isQuotaExceeded
    ? 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
    : isCritical
    ? 'bg-rose-950/30 border border-rose-500/20 text-rose-300'
    : isWarning
    ? 'text-amber-300'
    : 'text-slate-400';

  // Friendly label
  const label = isQuotaExceeded
    ? `Quota Limit Reached`
    : `API ${pct.toFixed(1)}%`;

  // Detailed tooltip
  const usedFmt = monthlyUsed.toLocaleString();
  const limitFmt = monthlyLimit.toLocaleString();
  const tooltip = [
    `Monthly usage: ${usedFmt} / ${limitFmt} units (${pct.toFixed(1)}%)`,
    resetDate ? `Quota resets: ${resetDate}` : '',
    isQuotaExceeded
      ? 'Live data refresh is unavailable — quota is 100% consumed.'
      : isCritical
      ? 'Approaching quota limit — monitor usage closely.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded cursor-default ${containerClass}`}
      aria-label={label}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{label}</span>
    </span>
  );
}
