import React from 'react';
import { Users, Shield, Target } from 'lucide-react';

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
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-400" />
          Competitor Benchmarking Gap Matrix
        </h3>
        <p className="text-xs text-slate-400">
          Auto-discovered top organic SERP competitors for <strong className="text-white">{primaryDomain}</strong>.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Competitor Domain</th>
              <th className="px-4 py-3">Domain Rating (DR)</th>
              <th className="px-4 py-3">Keyword Overlap</th>
              <th className="px-4 py-3">Total Keywords</th>
              <th className="px-4 py-3 rounded-r-lg">Est. Organic Traffic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {competitors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No competitors discovered yet. Automatic competitor discovery runs during weekly ingestion.
                </td>
              </tr>
            ) : (
              competitors.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-cyan-400" />
                    {c.competitor_domain}
                  </td>
                  <td className="px-4 py-3 font-bold text-cyan-400">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 border border-slate-700">
                      <Shield className="h-3 w-3 text-cyan-400" /> {c.competitor_dr}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-amber-400">
                    {c.overlap_keywords.toLocaleString()} kw
                  </td>
                  <td className="px-4 py-3">{c.competitor_keywords.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-white">
                    {c.competitor_traffic.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
