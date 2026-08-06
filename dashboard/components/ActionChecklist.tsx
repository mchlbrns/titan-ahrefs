import React from 'react';
import { CheckCircle2, Zap, Sparkles } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  category: 'Striking Distance' | 'Backlinks' | 'Competitor Gap' | 'Content';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
}

interface ActionChecklistProps {
  strikingCount: number;
  refDomainsCount: number;
  competitorsCount: number;
}

export default function ActionChecklist({
  strikingCount,
  refDomainsCount,
  competitorsCount,
}: ActionChecklistProps) {
  const validStrikingCount = typeof strikingCount === 'number' ? strikingCount : 0;
  const validRefDomains = typeof refDomainsCount === 'number' ? refDomainsCount : 0;
  const validCompetitors = typeof competitorsCount === 'number' ? competitorsCount : 0;

  const actions: ActionItem[] = [
    {
      id: 'action-1',
      title: validStrikingCount > 0
        ? `Optimize ${validStrikingCount} "Striking Distance" keywords (positions 4–20) with internal links and refreshed headers.`
        : 'Striking Distance audit complete — 0 keywords currently in positions 4–20. Publish targeted seed content to build momentum.',
      category: 'Striking Distance',
      priority: validStrikingCount > 0 ? 'HIGH' : 'LOW',
      impact: validStrikingCount > 0 ? '+15-35% Traffic Gain' : 'Awaiting Opportunities',
    },
    {
      id: 'action-2',
      title: validRefDomains > 0
        ? `Run a backlink audit on ${validRefDomains} referring domains to identify lost or broken dofollow links.`
        : 'Run a foundational link outreach campaign to acquire initial referring domain authority.',
      category: 'Backlinks',
      priority: 'HIGH',
      impact: 'Preserve Domain Authority',
    },
    {
      id: 'action-3',
      title: validCompetitors > 0
        ? `Analyze content overlap against top ${validCompetitors} target competitors to capture high-volume missing terms.`
        : 'Configure target competitors to enable automated SERP gap discovery.',
      category: 'Competitor Gap',
      priority: 'MEDIUM',
      impact: '+20% Keyword Coverage',
    },
    {
      id: 'action-4',
      title: 'Add structured schema markup (FAQ/Article) to top performing pages to increase SERP CTR.',
      category: 'Content',
      priority: 'MEDIUM',
      impact: '+5-10% Click-Through Rate',
    },
  ];


  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Prioritized Action Checklist (Quick Wins)
          </h3>
          <p className="text-xs text-slate-400">
            Auto-generated SEO optimization tasks derived from live data deltas.
          </p>
        </div>
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
          {actions.length} Recommended Actions
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((act) => (
          <div
            key={act.id}
            className="flex items-start justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white">{act.title}</h4>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-medium text-slate-300 border border-slate-700">
                    {act.category}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-bold ${
                      act.priority === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {act.priority} PRIORITY
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0 pl-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <Zap className="h-3 w-3" /> {act.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
