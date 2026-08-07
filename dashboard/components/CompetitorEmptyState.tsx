import React from 'react';
import { Settings, Plus } from 'lucide-react';

interface CompetitorEmptyStateProps {
  primaryDomain: string;
  onOpenConfig: () => void;
}

/**
 * "Dead Subreddit" inspired empty state for the Competitors tab.
 * Rendered when no competitor data exists yet.
 */
export default function CompetitorEmptyState({
  primaryDomain,
  onOpenConfig,
}: CompetitorEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
      {/* Abstract SVG mascot — geometric Snoo-like figure */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
      >
        {/* Head / body orb */}
        <circle cx="60" cy="48" r="30" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="1.5" />
        {/* Face frown / empty expression */}
        <circle cx="51" cy="44" r="3" fill="rgba(139,92,246,0.4)" />
        <circle cx="69" cy="44" r="3" fill="rgba(139,92,246,0.4)" />
        <path d="M51 55 Q60 50 69 55" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Antenna */}
        <line x1="60" y1="18" x2="60" y2="10" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="60" cy="8" r="3" fill="rgba(139,92,246,0.25)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
        {/* Ears */}
        <ellipse cx="32" cy="44" rx="6" ry="8" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
        <ellipse cx="88" cy="44" rx="6" ry="8" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
        {/* Body */}
        <ellipse cx="60" cy="88" rx="22" ry="14" fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.15)" strokeWidth="1" />
        {/* Scattered dots = missing data metaphor */}
        <circle cx="20" cy="90" r="2" fill="rgba(139,92,246,0.15)" />
        <circle cx="100" cy="85" r="2.5" fill="rgba(139,92,246,0.12)" />
        <circle cx="14" cy="70" r="1.5" fill="rgba(139,92,246,0.1)" />
        <circle cx="106" cy="70" r="1.5" fill="rgba(139,92,246,0.1)" />
        <circle cx="30" cy="108" r="2" fill="rgba(139,92,246,0.08)" />
        <circle cx="90" cy="110" r="2" fill="rgba(139,92,246,0.08)" />
      </svg>

      {/* Subreddit label */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500">
          r/Competitors
        </p>
        <h3 className="text-xl font-bold text-slate-200 tracking-tight">
          This community is empty.
        </h3>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          No competitor data yet for{' '}
          <span className="text-slate-400 font-medium">{primaryDomain}</span>.
          Be the first to add a competitor in Configure — or wait for the weekly
          SERP overlap sync.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onOpenConfig}
          className="empty-state-cta"
          id="competitor-empty-state-cta"
        >
          <Plus className="h-4 w-4" />
          Add a Competitor
        </button>
        <button
          onClick={onOpenConfig}
          className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          Open Configure Modal
        </button>
      </div>

      {/* Fine print */}
      <p className="text-[10px] text-slate-700 max-w-xs leading-relaxed">
        Competitors are tracked weekly via Ahrefs SERP overlap analysis.
        Data appears automatically after the next scheduled sync.
      </p>
    </div>
  );
}
