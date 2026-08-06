import React from 'react';
import { Award, ExternalLink, HelpCircle } from 'lucide-react';

interface PageItem {
  url: string;
  top_keyword?: string;
  organic_traffic: number;
  organic_keywords: number;
  traffic_share?: number | string;
}

interface PageTableProps {
  pages: PageItem[];
  domain?: string;
}

export default function PageTable({ pages, domain = 'titantreasure.com' }: PageTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-cyan-400" />
            Top Performing Pages
          </h3>
          <p className="text-xs text-slate-400">Pages driving the highest share of organic search traffic.</p>
        </div>
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
          {pages.length} Pages Tracked
        </span>
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
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <HelpCircle className="h-8 w-8 text-slate-500" />
                    <p className="font-semibold text-slate-300">No page performance records yet for {domain}</p>
                    <p className="text-xs text-slate-500 max-w-md">
                      Top page metrics will automatically populate as search engines index your pages and record organic search visits.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pages.map((p, idx) => {
                const shareNum = typeof p.traffic_share === 'number'
                  ? p.traffic_share * 100
                  : parseFloat(String(p.traffic_share || '0')) * 100;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {p.url.replace(/^https?:\/\//, '')} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.top_keyword || '-'}</td>
                    <td className="px-4 py-3 font-bold text-white">
                      {p.organic_traffic ? p.organic_traffic.toLocaleString() : 0}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {p.organic_keywords ? p.organic_keywords.toLocaleString() : 0}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">
                      {isNaN(shareNum) ? '0.0%' : `${shareNum.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
