import React from 'react';
import { Cpu, AlertTriangle, ShieldCheck, Clock, Key } from 'lucide-react';

interface ApiUsageBarProps {
  monthlyUsed: number;
  monthlyLimit: number;
  usagePercent: string | number;
  resetDate?: string;
  expirationDate?: string;
}

export default function ApiUsageBar({
  monthlyUsed,
  monthlyLimit,
  usagePercent,
  resetDate = 'Sept 4, 2026',
  expirationDate = 'Aug 6, 2027',
}: ApiUsageBarProps) {
  const numericPercent = typeof usagePercent === 'string'
    ? parseFloat(usagePercent.replace('%', ''))
    : usagePercent;

  const isWarning = numericPercent >= 70 && numericPercent < 80;
  const isCritical = numericPercent >= 80;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Ahrefs API v3 Unit Allowance & Monitoring
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                Standard Plan
              </span>
            </h3>
            <p className="text-xs text-slate-400">Zero unit cost for subscription checks; Header tracking on every request.</p>
          </div>
        </div>

        {isCritical ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-md border border-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5" /> 80% Safety Cap Reached (Ingestion Halted)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" /> Safety Controls Active
          </span>
        )}
      </div>

      {/* Usage Progress Meter */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Units Consumed: <strong className="text-white">{monthlyUsed.toLocaleString()}</strong></span>
          <span>Monthly Allowance: <strong className="text-white">{monthlyLimit.toLocaleString()}</strong></span>
        </div>

        <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5 border border-slate-700/50">
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

        <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
          <span>0%</span>
          <span className="font-bold text-cyan-400">{numericPercent.toFixed(1)}% Consumed</span>
          <span>100%</span>
        </div>
      </div>

      {/* Metadata Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <span>Usage Reset Date: <strong className="text-white">{resetDate}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Key className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <span>API Key Expiration: <strong className="text-white">{expirationDate}</strong></span>
        </div>
      </div>
    </div>
  );
}
