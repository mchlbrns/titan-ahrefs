'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle2 } from 'lucide-react';

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
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());

  if (!dataLoaded) {
    return (
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white tracking-wide">
          📋 SEO Action Plan
        </h2>
        <p className="text-xs text-slate-400 italic">
          Recommended tasks populate after the first weekly data sync.
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
        category: 'Recommendation',
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
        <h2 className="text-base font-bold text-white tracking-wide">
          📋 SEO Action Plan
        </h2>
        <p className="text-xs text-slate-400 italic">
          No actionable signals detected this period.
        </p>
      </div>
    );
  }

  const toggleTask = (index: number) => {
    setCompletedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const completedCount = completedIndices.size;
  const progressPercent = Math.round((completedCount / actions.length) * 100);

  const priorityBadge: Record<ActionItem['priority'], { label: string; style: string }> = {
    high: { label: '🔴 High Priority', style: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    medium: { label: '🟡 Medium Priority', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    low: { label: '🟢 Low Priority', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  };

  const gradeColor =
    healthGrade === 'A' ? 'text-emerald-400' :
    healthGrade === 'B' ? 'text-green-400' :
    healthGrade === 'C' ? 'text-yellow-400' :
    healthGrade === 'D' ? 'text-orange-400' :
    'text-rose-400';

  return (
    <div className="space-y-4">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
            📋 SEO Action Plan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recommended tasks to improve your website&apos;s Google rankings.
          </p>
        </div>

        {healthScore !== undefined && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 shrink-0 ${gradeColor}`}>
            SEO Grade: {healthGrade ?? '—'} ({healthScore}/100)
          </span>
        )}
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {completedCount} of {actions.length} Tasks Completed
          </span>
          <span className="text-emerald-400 font-mono font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Task List */}
      <ul className="space-y-2 pt-1">
        {actions.map((act, i) => {
          const isDone = completedIndices.has(i);
          const badge = priorityBadge[act.priority];

          return (
            <li
              key={i}
              onClick={() => toggleTask(i)}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                isDone
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : 'bg-slate-950/80 border-slate-800/80 hover:border-cyan-500/30'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTask(i);
                }}
                className="mt-0.5 text-slate-400 hover:text-cyan-400 shrink-0 transition-colors"
                aria-label={isDone ? 'Mark task as incomplete' : 'Mark task as complete'}
              >
                {isDone ? (
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.style}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    {act.category}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed transition-all ${
                    isDone ? 'text-slate-500 line-through' : 'text-slate-200'
                  }`}
                >
                  {act.title}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
