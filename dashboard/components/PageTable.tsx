import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function PageTable({
  pages,
  domain = 'titantreasure.com',
  previewRows,
}: PageTableProps) {
  const [expanded, setExpanded] = useState(!previewRows);

  const displayRows =
    previewRows && !expanded ? pages.slice(0, previewRows) : pages;

  if (pages.length === 0) {
    return (
      <p className="text-sm text-slate-600 italic">
        No page performance data yet for {domain}. Populates after first ingestion.
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
                Page
              </th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Top keyword
              </th>
              <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600 text-right">
                Traffic
              </th>
              <th className="pb-2 pl-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600 text-right">
                Traffic share
              </th>
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
                  <td className="py-2.5 pr-4 max-w-xs">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-slate-200 hover:text-white transition-colors truncate"
                    >
                      <span className="truncate">{cleanUrl}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-slate-600 shrink-0" />
                    </a>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {p.top_keyword || '—'}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-white text-right">
                    {p.organic_traffic ? p.organic_traffic.toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 pl-4 text-slate-400 text-right">
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
              View all {pages.length} pages
            </>
          )}
        </button>
      )}
    </div>
  );
}
