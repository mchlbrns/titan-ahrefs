import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import SortFilterBar from './SortFilterBar';
import CompetitorEmptyState from './CompetitorEmptyState';

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
  onOpenConfig?: () => void;
}

type SortKey = 'competitor_domain' | 'competitor_dr' | 'overlap_keywords' | 'competitor_keywords' | 'competitor_traffic';
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

export default function CompetitorMatrix({
  primaryDomain,
  competitors,
  onOpenConfig,
}: CompetitorMatrixProps) {
  const [sortKey, setSortKey] = useState<SortKey>('overlap_keywords');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sortMode, setSortMode] = useState<string>('all');

  // ALL hooks must be called before any early return
  const sorted = useMemo(() => {
    const effectiveKey: SortKey =
      sortMode === 'dr'      ? 'competitor_dr' :
      sortMode === 'overlap' ? 'overlap_keywords' :
      sortMode === 'traffic' ? 'competitor_traffic' :
      sortKey;

    return [...competitors].sort((a, b) => {
      if (effectiveKey === 'competitor_domain') {
        return sortDir === 'asc'
          ? a.competitor_domain.localeCompare(b.competitor_domain)
          : b.competitor_domain.localeCompare(a.competitor_domain);
      }
      const av = a[effectiveKey] ?? 0;
      const bv = b[effectiveKey] ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [competitors, sortKey, sortDir, sortMode]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Early return AFTER all hooks
  if (competitors.length === 0) {
    return (
      <CompetitorEmptyState
        primaryDomain={primaryDomain}
        onOpenConfig={onOpenConfig ?? (() => {})}
      />
    );
  }

  const sortBarOptions = [
    { key: 'all',     label: `All (${competitors.length})`, icon: 'hot' as const },
    { key: 'dr',      label: 'By DR',                       icon: 'top' as const },
    { key: 'overlap', label: 'By Overlap',                  icon: 'new' as const },
    { key: 'traffic', label: 'By Traffic',                  icon: 'default' as const },
  ];

  return (
    <div className="space-y-2">
      <SortFilterBar
        options={sortBarOptions}
        activeSort={sortMode}
        onSort={setSortMode}
        resultCount={sorted.length}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <SortableHeader label="Competitor"   sortKey="competitor_domain"   activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="pr-4" />
              <SortableHeader label="DR"           sortKey="competitor_dr"       activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="Kw Overlap"   sortKey="overlap_keywords"    activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="Their Kws"    sortKey="competitor_keywords" activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="Est. Traffic" sortKey="competitor_traffic"  activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="pl-4 text-right" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, idx) => (
              <tr
                key={idx}
                className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <td className="py-2 pr-4 font-medium text-slate-200">
                  {c.competitor_domain}
                </td>
                <td className="py-2 px-4 font-bold text-white mono">
                  {c.competitor_dr || '—'}
                </td>
                <td className="py-2 px-4">
                  <span className="font-semibold text-amber-400">
                    {c.overlap_keywords ? c.overlap_keywords.toLocaleString() : '—'}
                  </span>
                </td>
                <td className="py-2 px-4 text-slate-400">
                  {c.competitor_keywords ? c.competitor_keywords.toLocaleString() : '—'}
                </td>
                <td className="py-2 pl-4 text-slate-300 text-right mono">
                  {c.competitor_traffic ? c.competitor_traffic.toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
