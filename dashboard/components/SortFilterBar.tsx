import React from 'react';
import { Flame, Zap, TrendingUp, ArrowDownUp } from 'lucide-react';

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
}

const iconMap = {
  hot:     <Flame className="h-3 w-3" />,
  new:     <Zap className="h-3 w-3" />,
  top:     <TrendingUp className="h-3 w-3" />,
  default: <ArrowDownUp className="h-3 w-3" />,
};

/**
 * Reddit-style "Hot / New / Top" horizontal sort/filter bar.
 * Renders as scrollable pill row above data tables.
 */
export default function SortFilterBar({
  options,
  activeSort,
  onSort,
  resultCount,
}: SortFilterBarProps) {
  return (
    <div className="sort-bar">
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
      {resultCount !== undefined && (
        <span className="ml-auto text-[10px] text-slate-600 shrink-0 pr-1">
          {resultCount.toLocaleString()} results
        </span>
      )}
    </div>
  );
}
