import React from 'react';
import { Cpu, AlertTriangle } from 'lucide-react';

interface ApiUsageBarProps {
  monthlyUsed: number;
  monthlyLimit: number;
  usagePercent: string | number;
}

export default function ApiUsageBar({
  monthlyUsed,
  monthlyLimit,
  usagePercent,
}: ApiUsageBarProps) {
  const numericPercent = typeof usagePercent === 'string'
    ? parseFloat(usagePercent.replace('%', ''))
    : usagePercent;

  const isWarning = numericPercent >= 70 && numericPercent < 80;
  const isCritical = numericPercent >= 80;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Ahrefs API Unit Consumption</h3>
        </div>
        {isCritical && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5" /> 80% Safety Cap Reached
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Units Used: <strong className="text-white">{monthlyUsed.toLocaleString()}</strong></span>
        <span>Monthly Allowance: <strong className="text-white">{monthlyLimit.toLocaleString()}</strong></span>
      </div>

      <div className="mt-2 h-3.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCritical
              ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
              : isWarning
              ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
          }`}
          style={{ width: `${Math.min(numericPercent, 100)}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>0%</span>
        <span className="font-semibold text-cyan-400">{numericPercent.toFixed(1)}% Consumed</span>
        <span>100%</span>
      </div>
    </div>
  );
}
