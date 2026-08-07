import React, { ReactNode } from 'react';
import { ArrowRight, Clock } from 'lucide-react';

interface DataCardProps {
  /** Subreddit-style label e.g. "r/Keywords" */
  subreddit: string;
  /** Main card title e.g. "Keyword Movements — 4 entries" */
  title: string;
  /** Color variant for subreddit pill */
  accentColor?: 'cyan' | 'orange' | 'violet' | 'green';
  /** ISO timestamp of last data sync */
  lastSynced?: string | null;
  /** Optional count to append to title */
  count?: number;
  /** If provided, renders a "View Full Thread →" button */
  onViewAll?: () => void;
  viewAllLabel?: string;
  children: ReactNode;
  /** Extra class names for the outer wrapper */
  className?: string;
}

const accentMap: Record<string, { pill: string; dot: string }> = {
  cyan:   { pill: 'subreddit-pill',        dot: 'bg-neon-cyan' },
  orange: { pill: 'subreddit-pill orange', dot: 'bg-neon-orange' },
  violet: { pill: 'subreddit-pill violet', dot: 'bg-neon-violet' },
  green:  { pill: 'subreddit-pill green',  dot: 'bg-neon-green' },
};

function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

export default function DataCard({
  subreddit,
  title,
  accentColor = 'cyan',
  lastSynced,
  count,
  onViewAll,
  viewAllLabel = 'View Full Thread',
  children,
  className = '',
}: DataCardProps) {
  const accent = accentMap[accentColor] ?? accentMap.cyan;
  const relTime = lastSynced ? formatRelativeTime(lastSynced) : null;

  const displayTitle = count !== undefined
    ? `${title} — ${count} ${count === 1 ? 'entry' : 'entries'}`
    : title;

  return (
    <div className={`data-card ${className}`}>
      {/* ── Card header (Reddit "post title" row) ── */}
      <div className="data-card-header flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <span className={accent.pill}>{subreddit}</span>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-200">
            {displayTitle}
          </h2>
          {relTime && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0 ml-auto sm:ml-0">
              <Clock className="h-2.5 w-2.5" />
              {relTime}
            </span>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="view-thread-btn shrink-0 text-xs py-1 px-2.5 self-start sm:self-auto"
            aria-label={viewAllLabel}
          >
            <span>{viewAllLabel}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="data-card-body">
        {children}
      </div>
    </div>
  );
}
