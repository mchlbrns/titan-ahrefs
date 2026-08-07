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
    return (
      <span
        title="API telemetry unavailable"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-default"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
        <span>API Offline</span>
      </span>
    );
  }

  const pct =
    typeof usagePercent === 'string'
      ? parseFloat(usagePercent.replace('%', ''))
      : usagePercent;

  const isQuotaExceeded = pct >= 100;
  const isCritical = pct >= 80;
  const isWarning = pct >= 60 && pct < 80;

  const dotColor = isQuotaExceeded
    ? 'bg-rose-500 animate-pulse'
    : isCritical
    ? 'bg-rose-400'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-emerald-400';

  const textColor = isQuotaExceeded
    ? 'text-rose-300 font-semibold'
    : isCritical
    ? 'text-rose-300'
    : isWarning
    ? 'text-amber-300'
    : 'text-slate-400';

  const title = [
    `Ahrefs API usage: ${pct.toFixed(1)}%`,
    `${monthlyUsed.toLocaleString()} / ${monthlyLimit.toLocaleString()} units`,
    resetDate ? `Quota resets: ${resetDate}` : '',
    isQuotaExceeded ? '⚠ 100% quota cap reached — HTTP 403 Forbidden on live API' : (isCritical ? '⚠ 80% cap reached — ingestion halted' : ''),
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded ${isQuotaExceeded ? 'bg-rose-950/60 border border-rose-500/30' : ''} ${textColor} cursor-default`}
      aria-label={`API usage ${pct.toFixed(1)}%`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{isQuotaExceeded ? `API ${pct.toFixed(1)}% (Quota Exceeded)` : `API ${pct.toFixed(1)}%`}</span>
    </span>
  );
}
