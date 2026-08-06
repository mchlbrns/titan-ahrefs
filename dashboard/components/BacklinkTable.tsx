import React from 'react';
import { ExternalLink, Link2, Shield, Calendar } from 'lucide-react';

interface BacklinkItem {
  ref_domain: string;
  domain_rating: number;
  dofollow_links: number;
  total_links: number;
  first_seen?: string;
  status?: string;
}

interface BacklinkTableProps {
  backlinks: BacklinkItem[];
}

export default function BacklinkTable({ backlinks }: BacklinkTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Link2 className="h-5 w-5 text-cyan-400" />
            Backlinks & Referring Domains Audit
          </h3>
          <p className="text-xs text-slate-400">
            Top referring domains, authority scores (DR), dofollow counts, and first-seen dates.
          </p>
        </div>
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
          {backlinks.length} Active Domains
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Referring Domain</th>
              <th className="px-4 py-3">Domain Rating (DR)</th>
              <th className="px-4 py-3">Dofollow Links</th>
              <th className="px-4 py-3">Total Links</th>
              <th className="px-4 py-3">First Seen</th>
              <th className="px-4 py-3 rounded-r-lg">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {backlinks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No backlink records available. Run ingestion to populate.
                </td>
              </tr>
            ) : (
              backlinks.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">
                    <a
                      href={`https://${b.ref_domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      {b.ref_domain} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 font-bold text-cyan-400 border border-slate-700">
                      <Shield className="h-3 w-3" /> {b.domain_rating || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-400">
                    {b.dofollow_links ? b.dofollow_links.toLocaleString() : 0}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {b.total_links ? b.total_links.toLocaleString() : 1}
                  </td>
                  <td className="px-4 py-3 text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    {b.first_seen ? b.first_seen.split('T')[0] : 'Recent'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      {b.status || 'ACTIVE'}
                    </span>
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
