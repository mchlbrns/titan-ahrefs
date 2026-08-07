import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import SortFilterBar from './SortFilterBar';

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
  serpFeatures?: string[];
  intent?: string;
}

interface KeywordTableProps {
  keywords: KeywordItem[];
  domain?: string;
  /** When provided, shows only this many rows with expand option */
  previewRows?: number;
  /** Callback fired whenever keywords are filtered or sorted */
  onProcessedKeywordsChange?: (processed: KeywordItem[], filterLabel?: string) => void;
}

type SortKey = 'keyword' | 'position' | 'position_delta' | 'search_volume' | 'keyword_difficulty' | 'traffic';
type SortDir = 'asc' | 'desc';
type FilterMode = 'all' | 'striking' | 'gains' | 'drops';

function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  activeSortDir,
  onSort,
  className = '',
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  activeSortDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const isActive = activeSortKey === sortKey;
  return (
    <th
      className={`pb-2 text-[10px] font-semibold uppercase tracking-wider cursor-pointer select-none sortable-th transition-colors ${
        isActive ? 'text-[#00D2FF]' : 'text-slate-600'
      } ${className}`}
      onClick={() => onSort(sortKey)}
      aria-sort={isActive ? (activeSortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive
          ? activeSortDir === 'asc'
            ? <ChevronUp className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />
          : <ChevronsUpDown className="h-3 w-3 opacity-30" />
        }
      </span>
    </th>
  );
}

export default function KeywordTable({
  keywords,
  domain = 'titantreasure.com',
  previewRows,
  onProcessedKeywordsChange,
}: KeywordTableProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('traffic');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState(!previewRows);

  const safe = keywords.filter(
    (k) => k && typeof k.keyword === 'string' && k.keyword.trim() !== ''
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredKeywords = useMemo(() => {
    let result = safe.filter((k) => {
      if (filterMode === 'striking') return k.striking_distance === 'YES' || (k.position >= 4 && k.position <= 20);
      if (filterMode === 'gains') return (k.position_delta || 0) > 0;
      if (filterMode === 'drops') return (k.position_delta || 0) < 0;
      return true;
    });

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (k) =>
          k.keyword.toLowerCase().includes(q) ||
          k.url.toLowerCase().includes(q) ||
          (k.intent && k.intent.toLowerCase().includes(q))
      );
    }

    result = [...result].sort((a, b) => {
      let av = 0, bv = 0;
      if (sortKey === 'keyword') return sortDir === 'asc' ? a.keyword.localeCompare(b.keyword) : b.keyword.localeCompare(a.keyword);
      av = a[sortKey] ?? 0;
      bv = b[sortKey] ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return result;
  }, [safe, filterMode, searchQuery, sortKey, sortDir]);

  React.useEffect(() => {
    if (onProcessedKeywordsChange) {
      const labelMap: Record<FilterMode, string> = {
        all: 'All',
        striking: 'Striking Distance',
        gains: 'Gains',
        drops: 'Drops',
      };
      onProcessedKeywordsChange(filteredKeywords, labelMap[filterMode]);
    }
  }, [filteredKeywords, filterMode, onProcessedKeywordsChange]);

  const displayRows = previewRows && !expanded
    ? filteredKeywords.slice(0, previewRows)
    : filteredKeywords;

  const sortOptions = [
    { key: 'all',      label: `All (${safe.length})`,                                                                    icon: 'hot' as const },
    { key: 'striking', label: `Striking (${safe.filter((k) => k.striking_distance === 'YES' || (k.position >= 4 && k.position <= 20)).length})`, icon: 'top' as const },
    { key: 'gains',    label: `Gains (${safe.filter((k) => (k.position_delta || 0) > 0).length})`,                       icon: 'new' as const },
    { key: 'drops',    label: `Drops (${safe.filter((k) => (k.position_delta || 0) < 0).length})`,                       icon: 'default' as const },
  ];

  if (safe.length === 0) {
    return (
      <p className="text-xs text-slate-600 italic py-4">
        No keyword ranking data yet for {domain}. Data populates after the first ingestion run.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <SortFilterBar
        options={sortOptions}
        activeSort={filterMode}
        onSort={(k) => setFilterMode(k as FilterMode)}
        resultCount={filteredKeywords.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter keywords..."
      />

      {/* ── Mobile Card List View (< sm) ── */}
      <div className="space-y-2.5 sm:hidden">
        {filteredKeywords.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500 italic">No keywords match this filter.</p>
        ) : (
          displayRows.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-100 break-words leading-snug">
                    {item.keyword}
                  </div>
                  {(item.striking_distance === 'YES' || (item.position >= 4 && item.position <= 20)) && (
                    <span className="flair-tag flair-high text-[8px] mt-1 inline-block">⚡ Striking Distance</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                  <span className="font-bold text-xs text-cyan-300 mono">#{item.position}</span>
                  {(item.position_delta || 0) > 0 ? (
                    <span className="inline-flex items-center text-[10px] text-emerald-400 font-semibold">
                      <ArrowUp className="h-3 w-3" />+{item.position_delta}
                    </span>
                  ) : (item.position_delta || 0) < 0 ? (
                    <span className="inline-flex items-center text-[10px] text-rose-400 font-semibold">
                      <ArrowDown className="h-3 w-3" />{item.position_delta}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-[10px]">—</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50 text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Vol: <strong className="text-slate-200">{item.search_volume ? item.search_volume.toLocaleString() : '—'}</strong></span>
                  <span>KD: <strong className={item.keyword_difficulty > 60 ? 'text-rose-400' : item.keyword_difficulty > 30 ? 'text-amber-400' : 'text-emerald-400'}>{item.keyword_difficulty || '—'}</strong></span>
                </div>
                <div>
                  <span>Traffic: <strong className="text-cyan-300 font-mono">{item.traffic ? item.traffic.toLocaleString() : '—'}</strong></span>
                </div>
              </div>

              {item.serpFeatures && item.serpFeatures.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.serpFeatures.map((f, fIdx) => (
                    <span key={fIdx} className="px-1.5 py-0.5 text-[8px] font-medium bg-slate-800/80 text-cyan-300 rounded border border-cyan-500/20">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Desktop Table View (≥ sm) ── */}
      <div className="hidden sm:block overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs min-w-[620px]">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <SortableHeader label="Keyword"  sortKey="keyword"           activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="pr-4" />
              <SortableHeader label="Position" sortKey="position"          activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="Change"   sortKey="position_delta"    activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">SERP</th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Intent</th>
              <SortableHeader label="Volume"   sortKey="search_volume"     activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="KD"       sortKey="keyword_difficulty" activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="Traffic"  sortKey="traffic"           activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="pl-4 text-right" />
            </tr>
          </thead>
          <tbody>
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-sm text-slate-600 italic">
                  No keywords match this filter.
                </td>
              </tr>
            ) : (
              displayRows.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-2 pr-4">
                    <div className="font-medium text-slate-200 text-xs">{item.keyword}</div>
                    {(item.striking_distance === 'YES' || (item.position >= 4 && item.position <= 20)) && (
                      <span className="flair-tag flair-high text-[8px] mt-0.5">⚡ Striking</span>
                    )}
                  </td>
                  <td className="py-2 px-4 font-bold text-white mono">
                    #{item.position}
                  </td>
                  <td className="py-2 px-4">
                    {(item.position_delta || 0) > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                        <ArrowUp className="h-3 w-3" />+{item.position_delta}
                      </span>
                    ) : (item.position_delta || 0) < 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                        <ArrowDown className="h-3 w-3" />{item.position_delta}
                      </span>
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {item.serpFeatures && item.serpFeatures.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.serpFeatures.map((f, fIdx) => (
                          <span key={fIdx} className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-800 text-cyan-300 rounded border border-cyan-500/20">
                            {f}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-700 text-[10px]">Snippet</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-800/80 text-indigo-300 rounded border border-indigo-500/20">
                      {item.intent || 'Info'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-slate-400">
                    {item.search_volume ? item.search_volume.toLocaleString() : '—'}
                  </td>
                  <td className="py-2 px-4">
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
                  <td className="py-2 pl-4 text-slate-300 text-right font-medium mono">
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
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" />Show fewer</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" />View all {filteredKeywords.length} keywords</>
          )}
        </button>
      )}
    </div>
  );
}
