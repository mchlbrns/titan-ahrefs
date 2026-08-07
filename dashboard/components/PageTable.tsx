import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import SortFilterBar from './SortFilterBar';
import DomainFavicon from './DomainFavicon';

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
  /** When provided, shows only this many rows with expand option */
  previewRows?: number;
}

type SortKey = 'organic_traffic' | 'organic_keywords' | 'traffic_share' | 'url';
type SortDir = 'asc' | 'desc';

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

export default function PageTable({
  pages,
  domain = 'titantreasure.com',
  previewRows,
}: PageTableProps) {
  const [expanded, setExpanded] = useState(!previewRows);
  const [sortKey, setSortKey] = useState<SortKey>('organic_traffic');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sortMode, setSortMode] = useState<'traffic' | 'keywords' | 'share' | 'all'>('all');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedPages = useMemo(() => {
    const result = [...pages];
    const effectiveKey: SortKey =
      sortMode === 'traffic' ? 'organic_traffic' :
      sortMode === 'keywords' ? 'organic_keywords' :
      sortMode === 'share' ? 'traffic_share' :
      sortKey;

    result.sort((a, b) => {
      if (effectiveKey === 'url') {
        return sortDir === 'asc' ? a.url.localeCompare(b.url) : b.url.localeCompare(a.url);
      }
      if (effectiveKey === 'traffic_share') {
        const av = typeof a.traffic_share === 'number' ? a.traffic_share : parseFloat(String(a.traffic_share || '0'));
        const bv = typeof b.traffic_share === 'number' ? b.traffic_share : parseFloat(String(b.traffic_share || '0'));
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const av = (a[effectiveKey] as number) ?? 0;
      const bv = (b[effectiveKey] as number) ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return result;
  }, [pages, sortKey, sortDir, sortMode]);

  const displayRows = previewRows && !expanded ? sortedPages.slice(0, previewRows) : sortedPages;

  const sortBarOptions = [
    { key: 'all',      label: 'All Pages',     icon: 'hot' as const },
    { key: 'traffic',  label: 'By Traffic',    icon: 'top' as const },
    { key: 'keywords', label: 'By Keywords',   icon: 'new' as const },
    { key: 'share',    label: 'By Share',      icon: 'default' as const },
  ];

  if (pages.length === 0) {
    return (
      <p className="text-xs text-slate-600 italic py-4">
        No page performance data yet for {domain}. Populates after first ingestion.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <SortFilterBar
        options={sortBarOptions}
        activeSort={sortMode}
        onSort={(k) => setSortMode(k as typeof sortMode)}
        resultCount={sortedPages.length}
      />

      {/* ── Mobile Card List View (< sm) ── */}
      <div className="space-y-2.5 sm:hidden">
        {displayRows.map((p, idx) => {
          const shareNum =
            typeof p.traffic_share === 'number'
              ? p.traffic_share * 100
              : parseFloat(String(p.traffic_share || '0')) * 100;
          const cleanUrl = p.url.replace(/^https?:\/\//, '');

          return (
            <div key={idx} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-xs text-slate-100 hover:text-cyan-300 break-all"
                  >
                    <DomainFavicon domain={cleanUrl} className="h-4.5 w-4.5 shrink-0" />
                    <span>{cleanUrl}</span>
                    <ExternalLink className="h-3 w-3 text-slate-500 shrink-0" />
                  </a>
                  {p.top_keyword && (
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Top Kw: <span className="text-slate-300 font-medium">{p.top_keyword}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/50">
                <span>Organic Traffic: <strong className="text-cyan-300 font-mono text-xs">{p.organic_traffic ? p.organic_traffic.toLocaleString() : '—'}</strong></span>
                <span>Keywords: <strong className="text-slate-200">{p.organic_keywords ? p.organic_keywords.toLocaleString() : '—'}</strong></span>
                <span>Share: <strong className="text-slate-300">{isNaN(shareNum) || shareNum === 0 ? '—' : `${shareNum.toFixed(1)}%`}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop Table View (≥ sm) ── */}
      <div className="hidden sm:block overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs min-w-[550px]">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <SortableHeader label="Page"         sortKey="url"             activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="pr-4" />
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Top Keyword</th>
              <SortableHeader label="Traffic"      sortKey="organic_traffic" activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4 text-right" />
              <SortableHeader label="Keywords"     sortKey="organic_keywords" activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4 text-right" />
              <SortableHeader label="Traffic Share" sortKey="traffic_share"  activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="pl-4 text-right" />
            </tr>
          </thead>
          <tbody>
            {displayRows.map((p, idx) => {
              const shareNum =
                typeof p.traffic_share === 'number'
                  ? p.traffic_share * 100
                  : parseFloat(String(p.traffic_share || '0')) * 100;

              const cleanUrl = p.url.replace(/^https?:\/\//, '');

              return (
                <tr
                  key={idx}
                  className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-2 pr-4 max-w-xs">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors truncate max-w-full"
                    >
                      <DomainFavicon domain={cleanUrl} className="h-4.5 w-4.5 shrink-0" />
                      <span className="truncate">{cleanUrl}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-slate-600 shrink-0" />
                    </a>
                  </td>
                  <td className="py-2 px-4 text-slate-500 max-w-[160px] truncate" title={p.top_keyword || ''}>
                    {p.top_keyword || '—'}
                  </td>
                  <td className="py-2 px-4 font-bold text-white text-right mono">
                    {p.organic_traffic ? p.organic_traffic.toLocaleString() : '—'}
                  </td>
                  <td className="py-2 px-4 text-slate-400 text-right">
                    {p.organic_keywords ? p.organic_keywords.toLocaleString() : '—'}
                  </td>
                  <td className="py-2 pl-4 text-slate-500 text-right">
                    {isNaN(shareNum) || shareNum === 0 ? '—' : `${shareNum.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewRows && pages.length > previewRows && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" />Show fewer</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" />View all {pages.length} pages</>
          )}
        </button>
      )}
    </div>
  );
}
