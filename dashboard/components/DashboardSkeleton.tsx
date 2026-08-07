import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard">
      {/* ── 5 KPI Card Skeleton Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`p-4 sm:p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 ${
              i === 4 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <div className="h-3 w-24 bg-slate-800/80 rounded" />
            <div className="h-8 w-16 bg-slate-800/90 rounded" />
            <div className="h-2.5 w-28 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* ── Tabs & Sub-bar Skeleton ── */}
      <div className="flex items-center gap-4 pb-2 border-b border-slate-800/60">
        <div className="h-7 w-20 bg-slate-800/80 rounded-lg" />
        <div className="h-7 w-24 bg-slate-800/50 rounded-lg" />
        <div className="h-7 w-20 bg-slate-800/50 rounded-lg" />
        <div className="h-7 w-24 bg-slate-800/50 rounded-lg" />
      </div>

      {/* ── Main Layout Skeleton (Table + Sidebar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table skeleton */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 bg-slate-800/80 rounded" />
              <div className="h-7 w-28 bg-slate-800/60 rounded-lg" />
            </div>
            <div className="space-y-3 pt-2">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-10 w-full bg-slate-800/40 rounded-lg flex items-center justify-between px-4">
                  <div className="h-3 w-36 bg-slate-800/70 rounded" />
                  <div className="h-3 w-12 bg-slate-800/70 rounded" />
                  <div className="h-3 w-16 bg-slate-800/70 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="h-4 w-28 bg-slate-800/80 rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, k) => (
                <div key={k} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/50 space-y-2">
                  <div className="h-3 w-full bg-slate-800/70 rounded" />
                  <div className="h-2.5 w-2/3 bg-slate-800/50 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
