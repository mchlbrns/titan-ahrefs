import React, { useState } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, ExternalLink, HelpCircle } from 'lucide-react';

interface KeywordItem {
  keyword: string;
  position: number;
  previous_position?: number;
  position_delta?: number;
  search_volume: number;
  keyword_difficulty: number;
  url: string;
  traffic: number;
  striking_distance?: string;
}

interface KeywordTableProps {
  keywords: KeywordItem[];
  domain?: string;
}

export default function KeywordTable({ keywords, domain = 'titantreasure.com' }: KeywordTableProps) {
  const [filter, setFilter] = useState<'all' | 'striking' | 'gains' | 'drops'>('all');

  const filteredKeywords = keywords.filter((k) => {
    if (filter === 'striking') return k.position >= 4 && k.position <= 20;
    if (filter === 'gains') return (k.position_delta || 0) > 0;
    if (filter === 'drops') return (k.position_delta || 0) < 0;
    return true;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Keyword Movements & SERP Positions
          </h3>
          <p className="text-xs text-slate-400">
            Track ranking deltas, volume, traffic share, and striking distance opportunities.
          </p>
        </div>

        {/* Filter Pill Buttons */}
        <div className="flex rounded-lg bg-slate-800 p-1 text-xs border border-slate-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              filter === 'all' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({keywords.length})
          </button>
          <button
            onClick={() => setFilter('striking')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              filter === 'striking' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⭐ Striking (4–20)
          </button>
          <button
            onClick={() => setFilter('gains')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              filter === 'gains' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gains
          </button>
          <button
            onClick={() => setFilter('drops')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              filter === 'drops' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Drops
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Keyword</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Delta</th>
              <th className="px-4 py-3">Volume</th>
              <th className="px-4 py-3">KD</th>
              <th className="px-4 py-3 rounded-r-lg">Est. Traffic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <HelpCircle className="h-8 w-8 text-slate-500" />
                    <p className="font-semibold text-slate-300">No organic keyword data recorded yet for {domain}</p>
                    <p className="text-xs text-slate-500 max-w-md">
                      Ahrefs v3 API currently reports 0 organic keywords indexed for this domain. Use the <strong>Configure Engine & Domains</strong> button above to test another domain (e.g. <code>chumbacasino.com</code>) or submit sitemaps to Google Search Console to gain search rankings.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredKeywords.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span>{item.keyword}</span>
                      {item.striking_distance === 'YES' || (item.position >= 4 && item.position <= 20) ? (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                          Striking
                        </span>
                      ) : null}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400/80 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {item.url.replace(/^https?:\/\//, '')} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">#{item.position}</td>
                  <td className="px-4 py-3">
                    {item.position_delta && item.position_delta > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                        <ArrowUp className="h-3 w-3" /> +{item.position_delta}
                      </span>
                    ) : item.position_delta && item.position_delta < 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                        <ArrowDown className="h-3 w-3" /> {item.position_delta}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{item.search_volume ? item.search_volume.toLocaleString() : 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${
                        item.keyword_difficulty > 60
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : item.keyword_difficulty > 30
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.keyword_difficulty || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-200">
                    {item.traffic ? item.traffic.toLocaleString() : 0}
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
