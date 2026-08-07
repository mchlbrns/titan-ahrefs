import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import SortFilterBar from './SortFilterBar';
import DomainFavicon from './DomainFavicon';

interface BacklinkItem {
  ref_domain: string;
  domain_rating: number;
  dofollow_links: number;
  total_links: number;
  first_seen?: string;
  last_seen?: string;
  anchor_text?: string;
  status?: string;
}

interface BacklinkTableProps {
  backlinks: BacklinkItem[];
  /** When provided, shows only this many rows with expand option */
  previewRows?: number;
}

type SortKey = 'domain_rating' | 'dofollow_links' | 'total_links' | 'first_seen' | 'ref_domain';
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

export default function BacklinkTable({ backlinks, previewRows }: BacklinkTableProps) {
  const [expanded, setExpanded] = useState(!previewRows);
  const [sortKey, setSortKey] = useState<SortKey>('domain_rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'lost' | 'live'>('all');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedFiltered = useMemo(() => {
    let result = backlinks.filter((b) => {
      if (statusFilter === 'all') return true;
      const s = (b.status || '').toUpperCase();
      if (statusFilter === 'new') return s === 'NEW';
      if (statusFilter === 'lost') return s === 'LOST';
      if (statusFilter === 'live') return s === 'LIVE' || s === 'ACTIVE' || s === '';
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortKey === 'ref_domain') {
        return sortDir === 'asc'
          ? a.ref_domain.localeCompare(b.ref_domain)
          : b.ref_domain.localeCompare(a.ref_domain);
      }
      if (sortKey === 'first_seen') {
        const ta = a.first_seen ? new Date(a.first_seen).getTime() : 0;
        const tb = b.first_seen ? new Date(b.first_seen).getTime() : 0;
        return sortDir === 'asc' ? ta - tb : tb - ta;
      }
      const av = (a[sortKey] as number) ?? 0;
      const bv = (b[sortKey] as number) ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return result;
  }, [backlinks, sortKey, sortDir, statusFilter]);

  const displayRows = previewRows && !expanded ? sortedFiltered.slice(0, previewRows) : sortedFiltered;

  const countByStatus = (s: string) =>
    backlinks.filter((b) => {
      const status = (b.status || '').toUpperCase();
      if (s === 'new') return status === 'NEW';
      if (s === 'lost') return status === 'LOST';
      if (s === 'live') return status === 'LIVE' || status === 'ACTIVE' || status === '';
      return true;
    }).length;

  const sortBarOptions = [
    { key: 'all',  label: `All (${backlinks.length})`, icon: 'hot' as const },
    { key: 'new',  label: `New (${countByStatus('new')})`,  icon: 'new' as const },
    { key: 'lost', label: `Lost (${countByStatus('lost')})`, icon: 'default' as const },
    { key: 'live', label: `Live (${countByStatus('live')})`, icon: 'top' as const },
  ];

  if (backlinks.length === 0) {
    return (
      <p className="text-xs text-slate-600 italic py-4">
        No referring domain data yet. Populates after first ingestion run.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <SortFilterBar
        options={sortBarOptions}
        activeSort={statusFilter}
        onSort={(k) => setStatusFilter(k as typeof statusFilter)}
        resultCount={sortedFiltered.length}
      />

      {/* ── Mobile Card List View (< sm) ── */}
      <div className="space-y-2.5 sm:hidden">
        {displayRows.map((b, idx) => {
          const statusUpper = (b.status || '').toUpperCase();
          return (
            <div key={idx} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={`https://${b.ref_domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-xs text-slate-100 hover:text-cyan-300 break-all"
                  >
                    <DomainFavicon domain={b.ref_domain} className="h-3.5 w-3.5 shrink-0" />
                    <span>{b.ref_domain}</span>
                    <ExternalLink className="h-3 w-3 text-slate-500 shrink-0" />
                  </a>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={b.anchor_text || b.ref_domain}>
                    Anchor: <span className="text-slate-300 font-medium">{b.anchor_text || b.ref_domain}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 font-bold text-xs mono border border-slate-800">
                    DR {b.domain_rating || '—'}
                  </span>
                  {statusUpper && statusUpper !== 'ACTIVE' && statusUpper !== 'LIVE' && (
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                        statusUpper === 'NEW'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                          : statusUpper === 'LOST'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                          : statusUpper === 'BROKEN'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                          : 'bg-slate-500/15 text-slate-400 border-slate-500/40'
                      }`}
                    >
                      {statusUpper}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/50">
                <span>Dofollow: <strong className="text-slate-200">{b.dofollow_links ? b.dofollow_links.toLocaleString() : '—'}</strong></span>
                <span>Total: <strong className="text-slate-200">{b.total_links ? b.total_links.toLocaleString() : '—'}</strong></span>
                <span>First Seen: <strong className="text-slate-400 font-mono">{b.first_seen ? b.first_seen.split('T')[0] : '—'}</strong></span>
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
              <SortableHeader label="Referring Domain" sortKey="ref_domain"    activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="pr-4" />
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Anchor</th>
              <SortableHeader label="DR"              sortKey="domain_rating"  activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="Dofollow"        sortKey="dofollow_links" activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="Total"           sortKey="total_links"    activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <SortableHeader label="First Seen"      sortKey="first_seen"     activeSortKey={sortKey} activeSortDir={sortDir} onSort={handleSort} className="px-4" />
              <th className="pb-2 pl-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((b, idx) => {
              const statusUpper = (b.status || '').toUpperCase();
              return (
                <tr
                  key={idx}
                  className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-2 pr-4">
                    <a
                      href={`https://${b.ref_domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
                    >
                      <DomainFavicon domain={b.ref_domain} className="h-3.5 w-3.5 shrink-0" />
                      <span>{b.ref_domain}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-slate-600 shrink-0" />
                    </a>
                    {statusUpper && statusUpper !== 'ACTIVE' && statusUpper !== 'LIVE' && (
                      <span
                        className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          statusUpper === 'NEW'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                            : statusUpper === 'LOST'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                            : statusUpper === 'BROKEN'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                            : 'bg-slate-500/15 text-slate-400 border-slate-500/40'
                        }`}
                      >
                        {statusUpper}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-slate-400 max-w-[180px] truncate" title={b.anchor_text || b.ref_domain}>
                    {b.anchor_text || b.ref_domain}
                  </td>
                  <td className="py-2 px-4 font-bold text-white mono">
                    {b.domain_rating || '—'}
                  </td>
                  <td className="py-2 px-4 text-slate-300">
                    {b.dofollow_links ? b.dofollow_links.toLocaleString() : '—'}
                  </td>
                  <td className="py-2 px-4 text-slate-500">
                    {b.total_links ? b.total_links.toLocaleString() : '—'}
                  </td>
                  <td className="py-2 px-4 text-slate-500 mono">
                    {b.first_seen ? b.first_seen.split('T')[0] : '—'}
                  </td>
                  <td className="py-2 pl-4 text-slate-500 mono">
                    {b.last_seen ? b.last_seen.split('T')[0] : b.first_seen ? b.first_seen.split('T')[0] : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewRows && backlinks.length > previewRows && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" />Show fewer</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" />View all {backlinks.length} referring domains</>
          )}
        </button>
      )}
    </div>
  );
}
