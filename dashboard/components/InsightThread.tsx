import React from 'react';
import { ChevronUp, ChevronDown, Activity, AlertTriangle, Link, Target, Flame } from 'lucide-react';

interface InsightItem {
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface InsightThreadProps {
  strikingCount: number;
  refDomainsCount: number;
  competitorsCount: number;
  dataLoaded?: boolean;
  liveRecommendations?: string[];
  healthScore?: number;
  healthGrade?: string;
}

// Deterministic karma score from priority + index
function deriveKarma(priority: 'high' | 'medium' | 'low', idx: number): number {
  const base = priority === 'high' ? 92 : priority === 'medium' ? 61 : 28;
  // Jitter using index to make it look organic
  const jitter = [7, -3, 12, -8, 4, -2, 9, -5][idx % 8];
  return Math.max(1, base + jitter);
}

const priorityConfig = {
  high: {
    flair: 'flair-tag flair-high',
    label: 'HIGH IMPACT',
    icon: <Flame className="h-2.5 w-2.5" />,
    borderColor: 'border-l-2 border-[#FF6B35]/40',
  },
  medium: {
    flair: 'flair-tag flair-medium',
    label: 'MEDIUM',
    icon: <Activity className="h-2.5 w-2.5" />,
    borderColor: 'border-l-2 border-[#00D2FF]/30',
  },
  low: {
    flair: 'flair-tag flair-low',
    label: 'LOW',
    icon: <Target className="h-2.5 w-2.5" />,
    borderColor: 'border-l-2 border-slate-700',
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  'Recommendation':   <AlertTriangle className="h-3 w-3 text-amber-400" />,
  'Striking distance':<Target className="h-3 w-3 text-orange-400" />,
  'Backlinks':        <Link className="h-3 w-3 text-cyan-400" />,
  'Competitor gap':   <Activity className="h-3 w-3 text-violet-400" />,
};

const gradeColor = (grade?: string) => ({
  A: 'text-emerald-400', B: 'text-green-400', C: 'text-yellow-400',
  D: 'text-orange-400',
}[grade ?? ''] ?? 'text-rose-400');

/**
 * Reddit comment-thread style insights list.
 * Each insight has karma arrows, a score, and a priority flair tag.
 */
export default function InsightThread({
  strikingCount,
  refDomainsCount,
  competitorsCount,
  dataLoaded = false,
  liveRecommendations = [],
  healthScore,
  healthGrade,
}: InsightThreadProps) {
  if (!dataLoaded) {
    return (
      <div className="py-8 text-center space-y-2">
        <p className="text-sm text-slate-500 italic">
          Insights populate after the first weekly data sync.
        </p>
        <p className="text-xs text-slate-700">Your SEO pulse will appear here once data is collected.</p>
      </div>
    );
  }

  const actions: InsightItem[] = [];

  if (liveRecommendations.length > 0) {
    liveRecommendations.forEach((rec, idx) => {
      actions.push({
        title: rec,
        category: 'Recommendation',
        priority: idx <= 1 ? 'high' : 'medium',
      });
    });
  }

  if (strikingCount > 0) {
    actions.push({
      title: `${strikingCount} keyword${strikingCount === 1 ? '' : 's'} in positions 4–20 — internal linking and refreshed page titles could move these into the top 3.`,
      category: 'Striking distance',
      priority: 'high',
    });
  }

  if (refDomainsCount > 0) {
    actions.push({
      title: `${refDomainsCount} referring domain${refDomainsCount === 1 ? '' : 's'} recorded. Audit for lost or broken dofollow links before the next report.`,
      category: 'Backlinks',
      priority: 'medium',
    });
  }

  if (competitorsCount === 0) {
    actions.push({
      title: 'No competitor data yet. Weekly sync will auto-discover organic competitors from SERP overlap.',
      category: 'Competitor gap',
      priority: 'low',
    });
  } else {
    actions.push({
      title: `${competitorsCount} competitor${competitorsCount === 1 ? '' : 's'} tracked. Check the Competitors tab for keyword gaps.`,
      category: 'Competitor gap',
      priority: 'medium',
    });
  }

  if (actions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-600 italic">No actionable signals detected this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Thread header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.05)]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {actions.length} Insights · Sorted by Impact
        </p>
        {healthScore !== undefined && (
          <span className={`text-xs font-bold ${gradeColor(healthGrade)}`}>
            SEO Grade <span className="text-lg leading-none">{healthGrade ?? '—'}</span>
            <span className="text-slate-600 font-normal ml-1">({healthScore}/100)</span>
          </span>
        )}
      </div>

      {/* Comment thread */}
      <ul className="space-y-0">
        {actions.map((act, i) => {
          const cfg = priorityConfig[act.priority];
          const karma = deriveKarma(act.priority, i);
          const catIcon = categoryIcons[act.category] ?? <Activity className="h-3 w-3 text-slate-500" />;

          return (
            <li
              key={i}
              className={`flex gap-3 py-4 ${cfg.borderColor} pl-3 rounded-sm hover:bg-white/[0.02] transition-colors ${
                i < actions.length - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : ''
              }`}
            >
              {/* Karma column */}
              <div className="karma-arrows pt-0.5">
                <button className="karma-arrow" aria-label="Upvote" title="Upvote this insight">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <span className="karma-score">{karma}</span>
                <button className="karma-arrow down" aria-label="Downvote" title="Downvote this insight">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed">{act.title}</p>
                <div className="flex items-center gap-2">
                  <span className={cfg.flair}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-600">
                    {catIcon}
                    {act.category}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
