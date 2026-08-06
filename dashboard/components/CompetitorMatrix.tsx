import React from 'react';

interface CompetitorItem {
  competitor_domain: string;
  overlap_keywords: number;
  competitor_keywords: number;
  competitor_traffic: number;
  competitor_dr: number;
}

interface CompetitorMatrixProps {
  primaryDomain: string;
  competitors: CompetitorItem[];
}

export default function CompetitorMatrix({
  primaryDomain,
  competitors,
}: CompetitorMatrixProps) {
  if (competitors.length === 0) {
    return (
      <p className="text-sm text-slate-600 italic">
        Competitor data will populate after the next weekly sync for{' '}
        <span className="text-slate-500 not-italic">{primaryDomain}</span>.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.06)]">
            <th className="pb-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Competitor
            </th>
            <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              DR
            </th>
            <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Keyword overlap
            </th>
            <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Their keywords
            </th>
            <th className="pb-2 pl-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600 text-right">
              Est. traffic
            </th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, idx) => (
            <tr
              key={idx}
              className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <td className="py-2.5 pr-4 font-medium text-slate-200">
                {c.competitor_domain}
              </td>
              <td className="py-2.5 px-4 font-semibold text-white">
                {c.competitor_dr || '—'}
              </td>
              <td className="py-2.5 px-4 text-amber-400 font-medium">
                {c.overlap_keywords ? c.overlap_keywords.toLocaleString() : '—'}
              </td>
              <td className="py-2.5 px-4 text-slate-400">
                {c.competitor_keywords ? c.competitor_keywords.toLocaleString() : '—'}
              </td>
              <td className="py-2.5 pl-4 text-slate-300 text-right">
                {c.competitor_traffic ? c.competitor_traffic.toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
