import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';

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
  /** When provided, shows only this many rows with expand option */
  previewRows?: number;
}

export default function KeywordTable({
  keywords,
  domain = 'titantreasure.com',
  previewRows,
}: KeywordTableProps) {
  const [filter, setFilter] = useState<'all' | 'striking' | 'gains' | 'drops'>('all');
  const [expanded, setExpanded] = useState(!previewRows);

  // Null guard — filter out malformed rows
  const safe = keywords.filter(
    (k) => k && typeof k.keyword === 'string' && k.keyword.trim() !== ''
  );

  const filteredKeywords = safe.filter((k) => {
    if (filter === 'striking') {
      return k.striking_distance === 'YES' || (k.position >= 4 && k.position <= 20);
    }
    if (filter === 'gains') return (k.position_delta || 0) > 0;
    if (filter === 'drops') return (k.position_delta || 0) < 0;
    return true;
  });

  const displayRows =
    previewRows && !expanded
      ? filteredKeywords.slice(0, previewRows)
      : filteredKeywords;

  const filterOptions: { key: typeof filter; label: string }[] = [
    { key: 'all', label: `All (${safe.length})` },
    {
      key: 'striking',
      label: `Striking distance (${safe.filter((k) => k.striking_distance === 'YES' || (k.position >= 4 && k.position <= 20)).length})`,
    },
    {
      key: 'gains',
      label: `Gains (${safe.filter((k) => (k.position_delta || 0) > 0).length})`,
    },
    {
      key: 'drops',
      label: `Drops (${safe.filter((k) => (k.position_delta || 0) < 0).length})`,
    },
  ];

  if (safe.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600 italic">
          No keyword ranking data yet for {domain}. Data populates after the first ingestion run.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === opt.key
                ? 'bg-surface-raised text-white border border-border-strong'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="pb-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Keyword</th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Position</th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Change</th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Volume</th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">KD</th>
              <th className="pb-2 pl-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600 text-right">Traffic</th>
            </tr>
          </thead>
          <tbody>
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-sm text-slate-600 italic">
                  No keywords match this filter.
                </td>
              </tr>
            ) : (
              displayRows.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-2.5 pr-4">
                    <div className="font-medium text-slate-200">{item.keyword}</div>
                    {(item.striking_distance === 'YES' || (item.position >= 4 && item.position <= 20)) && (
                      <span className="text-[10px] text-amber-500 font-medium">Striking distance</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-white">
                    #{item.position}
                  </td>
                  <td className="py-2.5 px-4">
                    {(item.position_delta || 0) > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                        <ArrowUp className="h-3 w-3" />+{item.position_delta}
                      </span>
                    ) : (item.position_delta || 0) < 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                        <ArrowDown className="h-3 w-3" />{item.position_delta}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {item.search_volume ? item.search_volume.toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-xs font-semibold ${
                        item.keyword_difficulty > 60
                          ? 'text-rose-400'
                          : item.keyword_difficulty > 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.keyword_difficulty || '—'}
                    </span>
                  </td>
                  <td className="py-2.5 pl-4 text-slate-300 text-right">
                    {item.traffic ? item.traffic.toLocaleString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Expand/collapse */}
      {previewRows && filteredKeywords.length > previewRows && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Show fewer
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              View all {filteredKeywords.length} keywords
            </>
          )}
        </button>
      )}
    </div>
  );
}
