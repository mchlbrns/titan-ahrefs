import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function BacklinkTable({ backlinks, previewRows }: BacklinkTableProps) {
  const [expanded, setExpanded] = useState(!previewRows);

  const displayRows =
    previewRows && !expanded ? backlinks.slice(0, previewRows) : backlinks;

  if (backlinks.length === 0) {
    return (
      <p className="text-sm text-slate-600 italic">
        No referring domain data yet. Populates after first ingestion run.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="pb-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Referring domain
              </th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Anchor Text
              </th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                DR
              </th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Dofollow
              </th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Total links
              </th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                First seen
              </th>
              <th className="pb-2 pl-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Last seen
              </th>
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
                  <td className="py-2.5 pr-4">
                    <a
                      href={`https://${b.ref_domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
                    >
                      {b.ref_domain}
                      <ExternalLink className="h-2.5 w-2.5 text-slate-600 shrink-0" />
                    </a>
                    {statusUpper && statusUpper !== 'ACTIVE' && (
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
                  <td className="py-2.5 px-4 text-slate-400 max-w-[200px] truncate" title={b.anchor_text || b.ref_domain}>
                    {b.anchor_text || b.ref_domain}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-white">
                    {b.domain_rating || '—'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">
                    {b.dofollow_links ? b.dofollow_links.toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">
                    {b.total_links ? b.total_links.toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">
                    {b.first_seen ? b.first_seen.split('T')[0] : '—'}
                  </td>
                  <td className="py-2.5 pl-4 text-slate-500">
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
              View all {backlinks.length} referring domains
            </>
          )}
        </button>
      )}
    </div>
  );
}
