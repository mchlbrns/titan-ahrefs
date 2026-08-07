import React from 'react';
import { Flame, Zap, TrendingUp, ArrowDownUp, Search, X } from 'lucide-react';

export interface SortOption {
  key: string;
  label: string;
  icon?: 'hot' | 'new' | 'top' | 'default';
}

interface SortFilterBarProps {
  options: SortOption[];
  activeSort: string;
  onSort: (key: string) => void;
  /** Optional right-aligned label e.g. "12 results" */
  resultCount?: number;
  /** Optional live search query state */
  searchQuery?: string;
  /** Optional search query handler */
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

const iconMap = {
  hot:     <Flame className="h-3 w-3" />,
  new:     <Zap className="h-3 w-3" />,
  top:     <TrendingUp className="h-3 w-3" />,
  default: <ArrowDownUp className="h-3 w-3" />,
};

/**
 * Reddit-style "Hot / New / Top" horizontal sort/filter bar with live search.
 */
export default function SortFilterBar({
  options,
  activeSort,
  onSort,
  resultCount,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
}: SortFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2">
      {/* Pills container */}
      <div className="sort-bar overflow-x-auto no-scrollbar py-0.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSort(opt.key)}
            className={`sort-pill ${activeSort === opt.key ? 'active' : ''}`}
            aria-pressed={activeSort === opt.key}
          >
            {opt.icon && opt.icon !== 'default' && iconMap[opt.icon]}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Right section: Search input + result count */}
      <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
        {onSearchChange && (
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 text-xs"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {resultCount !== undefined && (
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 px-1 whitespace-nowrap">
            {resultCount.toLocaleString()} results
          </span>
        )}
      </div>
    </div>
  );
}
