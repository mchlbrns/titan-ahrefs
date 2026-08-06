import React from 'react';

interface ActionItem {
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface ActionChecklistProps {
  strikingCount: number;
  refDomainsCount: number;
  competitorsCount: number;
  /** When true, data has loaded but returned empty results */
  dataLoaded?: boolean;
  /** Live recommendations from Ahrefs seoHealthScore.recommendations */
  liveRecommendations?: string[];
  /** SEO health score from Ahrefs (0-100) */
  healthScore?: number;
  /** Health grade (A-F) */
  healthGrade?: string;
}

export default function ActionChecklist({
  strikingCount,
  refDomainsCount,
  competitorsCount,
  dataLoaded = false,
  liveRecommendations = [],
  healthScore,
  healthGrade,
}: ActionChecklistProps) {
  if (!dataLoaded) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Insights
        </h2>
        <p className="text-sm text-slate-600 italic">
          Insights populate after the first weekly data sync.
        </p>
      </div>
    );
  }

  // Build actions from live Ahrefs recommendations first
  const actions: ActionItem[] = [];

  // Add live Ahrefs recommendations
  if (liveRecommendations.length > 0) {
    liveRecommendations.forEach((rec, idx) => {
      actions.push({
        title: rec,
        category: 'Ahrefs AI Insight',
        priority: idx === 0 ? 'high' : idx === 1 ? 'high' : 'medium',
      });
    });
  }

  // Add computed action items from real data
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
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Insights
        </h2>
        <p className="text-sm text-slate-600 italic">
          No actionable signals detected this period.
        </p>
      </div>
    );
  }

  const priorityLabel: Record<ActionItem['priority'], string> = {
    high: 'High priority',
    medium: 'Medium priority',
    low: 'Low priority',
  };

  const priorityColor: Record<ActionItem['priority'], string> = {
    high: 'text-amber-400',
    medium: 'text-slate-400',
    low: 'text-slate-500',
  };

  const gradeColor =
    healthGrade === 'A' ? 'text-emerald-400' :
    healthGrade === 'B' ? 'text-green-400' :
    healthGrade === 'C' ? 'text-yellow-400' :
    healthGrade === 'D' ? 'text-orange-400' :
    'text-rose-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Insights &amp; Recommendations
        </h2>
        {healthScore !== undefined && (
          <span className={`text-xs font-semibold ${gradeColor}`}>
            SEO Grade: {healthGrade ?? '—'} ({healthScore}/100)
          </span>
        )}
      </div>
      <ul className="space-y-px">
        {actions.map((act, i) => (
          <li
            key={i}
            className="flex flex-col gap-1 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0"
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${priorityColor[act.priority]}`}
              >
                {priorityLabel[act.priority]} ·
              </span>
              <span className="text-xs text-slate-300 leading-relaxed">
                {act.title}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 pl-0">{act.category}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
