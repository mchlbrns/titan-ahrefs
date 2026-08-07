import React from 'react';
import { TrendingUp, Link2, Target, BarChart3 } from 'lucide-react';

interface SidebarData {
  topBacklink?: { domain: string; dr: number } | null;
  bestKeyword?: { keyword: string; traffic: number; position: number } | null;
  strikingCount?: number;
  apiUsedPct?: number | null;
  activeTab?: string;
}

interface QuickStatsSidebarProps extends SidebarData {
  className?: string;
}

function StatRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
      <div className="mt-0.5 shrink-0 opacity-60">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-slate-200 truncate">{value}</p>
        {sub && <p className="text-[10px] text-slate-600">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBar({ percent, color = '#00D2FF' }: { percent: number; color?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const isHigh = clamped >= 90;
  const barColor = isHigh ? '#F43F5E' : color;
  return (
    <div className="mt-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, background: barColor }}
      />
    </div>
  );
}

export default function QuickStatsSidebar({
  topBacklink,
  bestKeyword,
  strikingCount = 0,
  apiUsedPct,
  activeTab,
  className = '',
}: QuickStatsSidebarProps) {
  const tabLabel = activeTab
    ? { overview: 'All', keywords: 'Keywords', pages: 'Pages', backlinks: 'Backlinks', competitors: 'Competitors', insights: 'Insights' }[activeTab] ?? 'All'
    : 'All';

  return (
    <aside
      className={`sidebar-widget w-56 flex-shrink-0 self-start sticky top-6 ${className}`}
      aria-label="Quick stats sidebar"
    >
      <div className="sidebar-widget-header">
        📊 Quick Stats · {tabLabel}
      </div>
      <div className="sidebar-widget-body space-y-0">
        {topBacklink ? (
          <StatRow
            icon={<Link2 className="h-3.5 w-3.5 text-cyan-400" />}
            label="Top Referring Domain"
            value={topBacklink.domain}
            sub={`DR ${topBacklink.dr}`}
          />
        ) : (
          <StatRow
            icon={<Link2 className="h-3.5 w-3.5 text-slate-600" />}
            label="Top Referring Domain"
            value="No data yet"
          />
        )}

        {bestKeyword ? (
          <StatRow
            icon={<TrendingUp className="h-3.5 w-3.5 text-green-400" />}
            label="Best Keyword"
            value={bestKeyword.keyword}
            sub={`#${bestKeyword.position} · ${bestKeyword.traffic.toLocaleString()} traffic`}
          />
        ) : (
          <StatRow
            icon={<TrendingUp className="h-3.5 w-3.5 text-slate-600" />}
            label="Best Keyword"
            value="No data yet"
          />
        )}

        <div className="py-2.5 border-b border-[rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-2.5">
            <Target className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">Striking Distance</p>
              <div className="flex items-baseline gap-1">
                <p className="text-xs font-semibold text-slate-200">{strikingCount}</p>
                <p className="text-[10px] text-slate-600">keywords pos. 4–20</p>
              </div>
              {strikingCount > 0 && (
                <MiniBar percent={Math.min(100, strikingCount * 12)} color="#FF6B35" />
              )}
            </div>
          </div>
        </div>

        {apiUsedPct !== null && apiUsedPct !== undefined && (
          <div className="py-2.5">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">API Quota</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-xs font-semibold ${apiUsedPct >= 90 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {Number(apiUsedPct).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-600">used</p>
                </div>
                <MiniBar percent={Number(apiUsedPct)} color="#8B5CF6" />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
