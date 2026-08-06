import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ExternalLink, Zap } from 'lucide-react';

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
}

export default function KeywordTable({ keywords }: KeywordTableProps) {
  const [filter, setFilter] = useState<'all' | 'striking' | 'gains' | 'drops'>('all');

  const filteredKeywords = keywords.filter((item) => {
    if (filter === 'striking') return item.position >= 4 && item.position <= 20;
    if (filter === 'gains') return (item.position_delta || 0) > 0;
    if (filter === 'drops') return (item.position_delta || 0) < 0;
    return true;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            Keyword Movements & SERP Positions
          </h3>
          <p className="text-xs text-slate-400">Track ranking deltas, volume, traffic share, and striking distance opportunities.</p>
        </div>

        <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700/50 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'all' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({keywords.length})
          </button>
          <button
            onClick={() => setFilter('striking')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
              filter === 'striking' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Zap className="h-3 w-3" /> Striking (4-20)
          </button>
          <button
            onClick={() => setFilter('gains')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'gains' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gains
          </button>
          <button
            onClick={() => setFilter('drops')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'drops' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
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
              <th className="px-4 py-3">Est. Traffic</th>
              <th className="px-4 py-3 rounded-r-lg">Target URL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No keywords match the selected filter.
                </td>
              </tr>
            ) : (
              filteredKeywords.map((item, idx) => {
                const delta = item.position_delta || 0;
                const isStriking = item.position >= 4 && item.position <= 20;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                      {item.keyword}
                      {isStriking && (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                          Striking
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">#{item.position}</td>
                    <td className="px-4 py-3">
                      {delta > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                          <ArrowUp className="h-3 w-3" /> +{delta}
                        </span>
                      )}
                      {delta < 0 && (
                        <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                          <ArrowDown className="h-3 w-3" /> {delta}
                        </span>
                      )}
                      {delta === 0 && <span className="text-slate-500">-</span>}
                    </td>
                    <td className="px-4 py-3">{item.search_volume.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        item.keyword_difficulty > 50 ? 'bg-rose-500/20 text-rose-300' :
                        item.keyword_difficulty > 20 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.keyword_difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{item.traffic.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center gap-1 max-w-[200px] truncate"
                        >
                          {item.url.replace(/^https?:\/\//, '')} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
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
