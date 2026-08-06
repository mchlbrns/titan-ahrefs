import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';

interface PageItem {
  url: string;
  top_keyword?: string;
  organic_traffic: number;
  organic_keywords: number;
  traffic_share?: number | string;
}

interface PageTableProps {
  pages: PageItem[];
}

export default function PageTable({ pages }: PageTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          Top Performing Pages
        </h3>
        <p className="text-xs text-slate-400">Pages driving the highest share of organic search traffic.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Page URL</th>
              <th className="px-4 py-3">Top Keyword</th>
              <th className="px-4 py-3">Est. Traffic</th>
              <th className="px-4 py-3">Ranking Keywords</th>
              <th className="px-4 py-3 rounded-r-lg">Traffic Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No top pages recorded yet. Run initial ingestion to populate.
                </td>
              </tr>
            ) : (
              pages.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 font-medium hover:underline inline-flex items-center gap-1 max-w-[280px] truncate"
                    >
                      {p.url.replace(/^https?:\/\//, '')} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{p.top_keyword || 'N/A'}</td>
                  <td className="px-4 py-3 font-bold text-white">{p.organic_traffic.toLocaleString()}</td>
                  <td className="px-4 py-3">{p.organic_keywords.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                      {typeof p.traffic_share === 'number' ? (p.traffic_share * 100).toFixed(1) : p.traffic_share}%
                    </span>
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
