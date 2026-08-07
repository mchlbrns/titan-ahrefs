'use client';

import React, { useEffect, useState } from 'react';
import KpiCard from '@/components/KpiCard';
import ApiUsagePill from '@/components/ApiUsagePill';
import KeywordTable from '@/components/KeywordTable';
import PageTable from '@/components/PageTable';
import CompetitorMatrix from '@/components/CompetitorMatrix';
import BacklinkTable from '@/components/BacklinkTable';
import InsightThread from '@/components/InsightThread';
import DataCard from '@/components/DataCard';
import QuickStatsSidebar from '@/components/QuickStatsSidebar';
import ConfigModal from '@/components/ConfigModal';
import ExportMenu from '@/components/ExportMenu';
import {
  Settings,
  CheckCircle,
  Calendar,
  RefreshCw,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import DomainFavicon from '../components/DomainFavicon';
import DashboardSkeleton from '../components/DashboardSkeleton';

// ─── Types ───────────────────────────────────────────────────────────────────

interface KeywordItem {
  keyword: string;
  position: number;
  previous_position?: number;
  position_delta?: number;
  search_volume: number;
  keyword_difficulty: number;
  url: string;
  traffic: number;
  striking_distance?: string;
}

interface PageItem {
  url: string;
  top_keyword?: string;
  organic_traffic: number;
  organic_keywords: number;
  traffic_share?: number | string;
}

interface CompetitorItem {
  competitor_domain: string;
  overlap_keywords: number;
  competitor_keywords: number;
  competitor_traffic: number;
  competitor_dr: number;
}

interface BacklinkItem {
  ref_domain: string;
  domain_rating: number;
  dofollow_links: number;
  total_links: number;
  first_seen?: string;
  status?: string;
}

interface ApiResponseData {
  primary_domain: string;
  timestamp: string;
  dataSource?: string;
  ingestionError?: string | null;
  snapshotId?: string;
  supabaseSynced?: boolean;
  status: string;
  config?: {
    primary_domain: string;
    target_country: string;
    competitors: string[];
    report_frequency: string;
    comparison_period: string;
  };
  summary: {
    domain_rating: number;
    ahrefs_rank: number;
    organic_traffic: number;
    organic_traffic_prev?: number;
    traffic_delta_percent: number;
    organic_keywords: number;
    organic_cost: number;
    total_backlinks: number;
    ref_domains: number | string;
    dofollow_backlinks: number | string;
    striking_distance_count: number;
    healthScore?: number;
    health_score?: number;
    seoHealthScore?: { score: number };
  };
  keyword_tiers?: {
    top1_3: number;
    top4_10: number;
    top11_20: number;
    top21_50: number;
  };
  keywords: KeywordItem[];
  striking_distance?: KeywordItem[];
  pages: PageItem[];
  competitors: CompetitorItem[];
  backlinks: BacklinkItem[];
  api_usage: {
    monthly_used: number;
    monthly_limit: number;
    usage_percent: string | number;
  };
  latest_run?: Record<string, unknown>;
}

type Tab = 'overview' | 'keywords' | 'pages' | 'backlinks' | 'competitors' | 'insights';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hostnameFrom(url: unknown): string {
  try { return new URL(String(url)).hostname; } catch { return String(url || ''); }
}

/** Generate a stable 7-point sparkline from a scalar value + delta */
function generateSparkline(current: number, delta: number): number[] {
  const base = Math.max(1, current);
  const step = base * (delta / 700);
  return [
    base - step * 3,
    base - step * 2.1,
    base - step * 2.8,
    base - step * 1.5,
    base - step * 0.8,
    base - step * 0.3,
    base,
  ].map((v) => Math.max(0, v));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [domainOptions, setDomainOptions] = useState<string[]>(['titantreasure.com', 'red-engage.com']);
  const [selectedDomain, setSelectedDomain] = useState<string>('titantreasure.com');
  const [data, setData] = useState<ApiResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [processedKeywords, setProcessedKeywords] = useState<KeywordItem[]>([]);
  const [keywordFilterLabel, setKeywordFilterLabel] = useState<string>('All');

  const currentDomainRef = React.useRef<string>(selectedDomain);
  currentDomainRef.current = selectedDomain;

  const handleSelectDomain = (newDomain: string) => {
    setSelectedDomain(newDomain);
    if (typeof window !== 'undefined') {
      localStorage.setItem('titan_ahrefs_selected_domain', newDomain);
    }
  };

  const handleDomainsChange = (updatedDomains: string[]) => {
    setDomainOptions(updatedDomains);
    if (typeof window !== 'undefined') {
      localStorage.setItem('titan_ahrefs_managed_domains', JSON.stringify(updatedDomains));
    }
  };

  const [liveApiUsage, setLiveApiUsage] = useState<{
    monthly_used: number | null;
    monthly_limit: number | null;
    usage_percent: string | number | null;
    resetDate?: string | null;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDomain = localStorage.getItem('titan_ahrefs_selected_domain');
      if (savedDomain) setSelectedDomain(savedDomain);
      const savedDomains = localStorage.getItem('titan_ahrefs_managed_domains');
      if (savedDomains) {
        try {
          const parsed = JSON.parse(savedDomains);
          if (Array.isArray(parsed) && parsed.length > 0) handleDomainsChange(parsed);
        } catch { /* ignore */ }
      }
    }

    async function loadManagedDomains() {
      try {
        const res = await fetch('/api/domains');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.managed_domains)) {
            const domainList = json.managed_domains.map((d: { domain: string } | string) =>
              typeof d === 'string' ? d : d.domain
            );
            if (domainList.length > 0) handleDomainsChange(domainList);
          }
        }
      } catch (err) {
        console.warn('Could not load managed domains:', err);
      }
    }

    async function checkApiUsage() {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const json = await res.json();
          if (json.unitsLimit !== null && json.unitsLimit !== undefined) {
            setLiveApiUsage({
              monthly_used: json.unitsConsumed ?? 0,
              monthly_limit: json.unitsLimit ?? 400000,
              usage_percent: `${(((json.unitsConsumed ?? 0) / (json.unitsLimit || 1)) * 100).toFixed(2)}%`,
              resetDate: json.resetDate || '2026-09-04',
            });
          }
        }
      } catch { /* ignore */ }
    }

    loadManagedDomains();
    checkApiUsage();
  }, []);

  const fetchData = async (domainToFetch: string = selectedDomain, isRefreshAction: boolean = false) => {
    if (isRefreshAction) {
      setRefreshing(true);
    } else {
      // Check local storage cache for instant 0ms hydration
      const cacheKey = `titan_ahrefs_cache_${domainToFetch}`;
      let hasHydratedFromCache = false;
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === 'object') {
              setData(parsed);
              setLoading(false);
              hasHydratedFromCache = true;
            }
          } catch { /* ignore */ }
        }
      }
      if (!hasHydratedFromCache) {
        setLoading(true);
      }
    }
    setError(null);
    try {
      const refreshQuery = isRefreshAction ? '&refresh=true' : '';
      const apiUrl = `/api/report?format=json&domain=${encodeURIComponent(domainToFetch)}${refreshQuery}`;
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load live domain data`);
      const json: ApiResponseData = await res.json();
      if (currentDomainRef.current === domainToFetch) {
        setData(json);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`titan_ahrefs_cache_${domainToFetch}`, JSON.stringify(json));
          } catch { /* ignore */ }
        }
        if (isRefreshAction) {
          if (json.ingestionError) {
            setToast({
              message: `API quota exceeded — live data unavailable until ${liveApiUsage?.resetDate || 'the next billing cycle'}. Displaying most recent saved snapshot.`,
              type: 'error',
            });
          } else {
            setToast({
              message: `Data refreshed successfully for ${domainToFetch}. Dashboard is now showing the latest available data.`,
              type: 'success',
            });
          }
          setTimeout(() => setToast(null), 6000);
        }
      }
    } catch (err: unknown) {
      if (currentDomainRef.current === domainToFetch) {
        const msg = err instanceof Error ? err.message : 'Could not reach the Ahrefs report engine backend.';
        setError(msg);
      }
    } finally {
      if (currentDomainRef.current === domainToFetch) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchData(selectedDomain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDomain]);

  // ─── Derived values ──────────────────────────────────────────────────────

  const domain =
    selectedDomain ||
    data?.config?.primary_domain ||
    data?.primary_domain ||
    'titantreasure.com';

  const config = data?.config || {
    primary_domain: domain,
    target_country: 'us',
    competitors: ['chumbacasino.com', 'pulsz.com', 'luckylandslots.com'],
    report_frequency: 'Weekly',
    comparison_period: 'Previous 7 days',
  };

  const rawSummary =
    data?.summary ||
    (data as unknown as { summaries?: Record<string, unknown>[] })?.summaries?.find(
      (s: Record<string, unknown>) => s.domain === domain
    ) ||
    (data as unknown as { summaries?: Record<string, unknown>[] })?.summaries?.[0];

  const hasSnapshot = Boolean(rawSummary);

  const summary = rawSummary
    ? {
        domain_rating: rawSummary.domain_rating ?? rawSummary.domainRating ?? null,
        ahrefs_rank: rawSummary.ahrefs_rank ?? rawSummary.ahrefsRank ?? null,
        organic_traffic: rawSummary.organic_traffic ?? rawSummary.organicTraffic ?? null,
        organic_traffic_prev: rawSummary.organic_traffic_prev ?? 0,
        traffic_delta_percent: rawSummary.traffic_delta_percent ?? 0,
        organic_keywords: rawSummary.organic_keywords ?? rawSummary.keywordWins ?? 0,
        organic_cost: rawSummary.organic_cost ?? rawSummary.trafficValue ?? null,
        total_backlinks: rawSummary.total_backlinks ?? rawSummary.totalBacklinks ?? null,
        ref_domains: rawSummary.ref_domains ?? rawSummary.referringDomains ?? null,
        dofollow_backlinks: rawSummary.dofollow_backlinks ?? null,
        striking_distance_count: rawSummary.striking_distance_count ?? 0,
        healthScore:
          typeof rawSummary.healthScore === 'number'
            ? rawSummary.healthScore
            : typeof rawSummary.seoHealthScore === 'number'
            ? rawSummary.seoHealthScore
            : (rawSummary.seoHealthScore as { score?: number })?.score ?? null,
      }
    : undefined;

  const rawApiUsage =
    data?.api_usage ||
    (data as unknown as { apiUsageSummary?: { totalConsumed?: number; totalLimit?: number; usagePercent?: number } })?.apiUsageSummary;
  const apiUsage = liveApiUsage || (rawApiUsage
    ? {
        monthly_used: (rawApiUsage as Record<string, unknown>).monthly_used ?? (rawApiUsage as Record<string, unknown>).totalConsumed ?? null,
        monthly_limit: (rawApiUsage as Record<string, unknown>).monthly_limit ?? (rawApiUsage as Record<string, unknown>).totalLimit ?? null,
        usage_percent: (rawApiUsage as Record<string, unknown>).usage_percent ?? (rawApiUsage as Record<string, unknown>).usagePercent ?? null,
      }
    : { monthly_used: null, monthly_limit: null, usage_percent: null });

  const keywords: KeywordItem[] = (data?.keywords || []).filter(
    (k) => k && typeof k.keyword === 'string' && k.keyword.trim() !== ''
  );
  const pages: PageItem[] = data?.pages || [];
  const competitors: CompetitorItem[] = data?.competitors || [];

  const trendData = rawSummary
    ? (rawSummary as Record<string, unknown>).trend as Record<string, unknown> | undefined
    : undefined;
  const rawLostBacklinks = trendData && Array.isArray(trendData.lostBacklinks)
    ? (trendData.lostBacklinks as Record<string, unknown>[])
    : [];
  const rawNewBacklinks = trendData && Array.isArray(trendData.newBacklinks)
    ? (trendData.newBacklinks as Record<string, unknown>[])
    : [];

  const trendBacklinks: BacklinkItem[] = [
    ...rawLostBacklinks.map((b) => ({
      ref_domain: b.urlFrom ? hostnameFrom(b.urlFrom) : 'external-site.com',
      domain_rating: Number(b.domainRatingFrom || 0),
      dofollow_links: b.isDofollow ? 1 : 0,
      total_links: 1,
      first_seen: String(b.firstSeen || ''),
      status: 'LOST' as const,
    })),
    ...rawNewBacklinks.map((b) => ({
      ref_domain: b.urlFrom ? hostnameFrom(b.urlFrom) : 'external-site.com',
      domain_rating: Number(b.domainRatingFrom || 0),
      dofollow_links: b.isDofollow ? 1 : 0,
      total_links: 1,
      first_seen: String(b.firstSeen || ''),
      status: 'LIVE' as const,
    })),
  ];
  const backlinks: BacklinkItem[] =
    Array.isArray(data?.backlinks) && (data?.backlinks?.length ?? 0) > 0
      ? (data?.backlinks as BacklinkItem[])
      : trendBacklinks;

  const rawRefDomains = Number(summary?.ref_domains);
  const refDomainsCount =
    !isNaN(rawRefDomains) && rawRefDomains > 0 ? rawRefDomains : backlinks.length;

  const rawSummaryMap = rawSummary ? (rawSummary as Record<string, unknown>) : undefined;
  const seoHealthScoreObj = rawSummaryMap?.seoHealthScore || (data?.summary as Record<string, unknown>)?.seoHealthScore;
  const seoHealthScore =
    seoHealthScoreObj && typeof seoHealthScoreObj === 'object'
      ? (seoHealthScoreObj as Record<string, unknown>)
      : undefined;
  const rawSeoRecs = seoHealthScore?.recommendations;
  const rawDomainRecs = rawSummaryMap?.recommendations;
  const liveRecommendations: string[] = [
    ...(Array.isArray(rawSeoRecs) ? (rawSeoRecs as string[]) : []),
    ...(Array.isArray(rawDomainRecs) ? (rawDomainRecs as string[]) : []),
  ].filter((r, i, arr) => typeof r === 'string' && arr.indexOf(r) === i);
  const healthGrade = typeof seoHealthScore?.grade === 'string' ? seoHealthScore.grade : undefined;

  useEffect(() => {
    const ts = data?.timestamp || (data as unknown as Record<string, unknown>)?.generatedAt;
    if (ts && typeof ts === 'string') {
      try {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          setLastUpdated(
            d.toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          );
          return;
        }
      } catch { /* ignore */ }
    }
    setLastUpdated(null);
  }, [data?.timestamp, data]);

  // ─── Sparkline data ───────────────────────────────────────────────────────

  const trafficSparkline = summary?.organic_traffic
    ? generateSparkline(Number(summary.organic_traffic), Number(summary.traffic_delta_percent || 0))
    : undefined;

  const drSparkline = summary?.domain_rating
    ? [
        Number(summary.domain_rating) - 2,
        Number(summary.domain_rating) - 1.5,
        Number(summary.domain_rating) - 1,
        Number(summary.domain_rating) - 0.5,
        Number(summary.domain_rating) + 0.2,
        Number(summary.domain_rating) - 0.1,
        Number(summary.domain_rating),
      ]
    : undefined;

  // ─── Sidebar data ─────────────────────────────────────────────────────────

  const topBacklink = backlinks.length > 0
    ? backlinks.reduce((best, b) => (b.domain_rating > (best?.domain_rating ?? 0) ? b : best), backlinks[0])
    : null;

  const bestKeyword = keywords.length > 0
    ? keywords.reduce((best, k) => (k.traffic > (best?.traffic ?? 0) ? k : best), keywords[0])
    : null;

  const apiUsedPct = apiUsage.monthly_used !== null && apiUsage.monthly_limit
    ? (Number(apiUsage.monthly_used) / Number(apiUsage.monthly_limit)) * 100
    : null;

  // ─── Tabs config ─────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; count?: number; accent?: string }[] = [
    { id: 'overview',   label: 'Overview' },
    { id: 'keywords',   label: 'Keywords',    count: keywords.length },
    { id: 'pages',      label: 'Pages',       count: pages.length },
    { id: 'backlinks',  label: 'Backlinks',   count: backlinks.length },
    { id: 'competitors',label: 'Competitors', count: competitors.length },
    { id: 'insights',   label: 'Insights' },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  const usedPct = liveApiUsage?.monthly_used != null && liveApiUsage?.monthly_limit
    ? (liveApiUsage.monthly_used / liveApiUsage.monthly_limit) * 100
    : null;
  const isQuotaExceeded = usedPct !== null && usedPct >= 100;
  const isDisabled = loading || refreshing || isQuotaExceeded;
  const resetDate = liveApiUsage?.resetDate || '2026-09-04';

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-canvas)' }}>
      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center justify-between gap-4 rounded-xl px-5 py-3.5 shadow-float border transition-all animate-slide-up max-w-sm ${
          toast.type === 'error'
            ? 'bg-amber-950/80 border-amber-500/25 text-amber-200'
            : 'bg-emerald-950/80 border-emerald-500/25 text-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg shrink-0 ${toast.type === 'error' ? 'bg-amber-500/15' : 'bg-emerald-500/15'}`}>
              {toast.type === 'error'
                ? <AlertTriangle className="h-4 w-4 text-amber-400" />
                : <CheckCircle className="h-4 w-4 text-emerald-400" />
              }
            </div>
            <div>
              <p className="font-semibold text-xs">{toast.type === 'error' ? 'Update Unavailable' : 'Data Refreshed'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{toast.message}</p>
            </div>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-200 text-lg leading-none shrink-0">×</button>
        </div>
      )}

      {/* ── Max-width wrapper ─────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-5 pb-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex flex-col gap-2">
            {/* Domain switcher */}
            <div className="flex items-center gap-2.5">
              <DomainFavicon domain={selectedDomain} className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
              <select
                value={selectedDomain}
                onChange={(e) => handleSelectDomain(e.target.value)}
                className="domain-select w-full sm:w-auto text-sm sm:text-base"
                id="domain-switcher"
                aria-label="Select domain"
              >
                {domainOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 ml-0 sm:ml-8">
              {lastUpdated && (
                <span className="text-[10px] text-slate-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Synced {lastUpdated}
                </span>
              )}
              {!loading && data && (
                <ApiUsagePill
                  monthlyUsed={apiUsage.monthly_used}
                  monthlyLimit={apiUsage.monthly_limit}
                  usagePercent={apiUsage.usage_percent}
                />
              )}
              {!loading && data && (
                <span
                  title={`Ahrefs API Unit Reset Date: ${liveApiUsage?.resetDate || '2026-09-04'}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-purple-300 bg-purple-950/50 border border-purple-500/25 cursor-default"
                >
                  <Calendar className="h-2.5 w-2.5 text-purple-400" />
                  Resets {liveApiUsage?.resetDate || '2026-09-04'}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 sm:py-1.5 text-xs font-semibold text-slate-400 border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] transition-all w-full sm:w-auto"
              id="configure-button"
              aria-label="Open configuration modal"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Configure</span>
            </button>

            {/* Refresh button with quota lock */}
            <div className="relative group w-full sm:w-auto">
              <button
                onClick={() => !isQuotaExceeded && fetchData(selectedDomain, true)}
                disabled={isDisabled}
                title={isQuotaExceeded
                  ? `API quota exhausted — live refresh unavailable until ${resetDate}`
                  : 'Pull latest data from Ahrefs'
                }
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 sm:py-1.5 text-xs font-semibold border transition-all w-full sm:w-auto ${
                  isQuotaExceeded
                    ? 'bg-rose-950/40 border-rose-500/25 text-rose-400/70 cursor-not-allowed'
                    : 'text-slate-400 border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] cursor-pointer'
                } disabled:opacity-60`}
                id="refresh-button"
                aria-label={isQuotaExceeded ? 'Refresh locked — quota exhausted' : 'Refresh data'}
              >
                {isQuotaExceeded ? (
                  <><Lock className="h-3.5 w-3.5 shrink-0" /><span className="truncate">Locked</span></>
                ) : (
                  <>
                    <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="truncate">{refreshing ? 'Updating...' : 'Refresh'}</span>
                  </>
                )}
              </button>
              {/* Quota tooltip */}
              {isQuotaExceeded && (
                <div className="absolute right-0 top-full mt-2 z-50 hidden group-hover:flex w-60 flex-col gap-1 rounded-xl border border-rose-500/20 bg-slate-900/95 backdrop-blur-xl px-3.5 py-3 shadow-float text-[11px] pointer-events-none">
                  <p className="font-bold text-rose-300 flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Quota Exhausted
                  </p>
                  <p className="text-slate-400 leading-relaxed">Live data ingestion is locked until the API quota resets.</p>
                  <p className="text-slate-500 mt-0.5">
                    Resets on <span className="text-purple-300 font-semibold">{resetDate}</span>
                  </p>
                </div>
              )}
            </div>

            <ExportMenu
              domain={selectedDomain}
              activeTab={activeTab}
              summary={summary}
              keywords={processedKeywords.length > 0 ? processedKeywords : keywords}
              overviewKeywords={keywords.slice(0, 3)}
              pages={pages}
              backlinks={backlinks}
              competitors={competitors}
              liveRecommendations={liveRecommendations}
              healthScore={summary?.healthScore}
              healthGrade={healthGrade}
              keywordFilterLabel={keywordFilterLabel}
            />
          </div>
        </header>

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-xs text-rose-400">
            <strong>Backend error:</strong> {error}
          </div>
        )}

        {/* ── Loading state ─────────────────────────────────────────────────── */}
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="animate-fade-in space-y-6">
            {/* ── KPI Strip ───────────────────────────────────────────────── */}
            <section
              aria-label="Key performance indicators"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6"
            >
              <KpiCard
                title="SEO Health Score"
                value={summary?.healthScore !== null && summary?.healthScore !== undefined ? summary.healthScore : '—'}
                subText={
                  summary?.healthScore !== null && summary?.healthScore !== undefined
                    ? healthGrade ? `Grade ${healthGrade} · 0–100` : 'Health Rating (0–100)'
                    : 'Data Pending'
                }
                hasData={hasSnapshot && summary?.healthScore !== null && summary?.healthScore !== undefined}
                size="hero"
              />
              <KpiCard
                title="Domain Rating"
                value={summary?.domain_rating !== null && summary?.domain_rating !== undefined ? summary.domain_rating : '—'}
                subText={summary?.ahrefs_rank ? `Ahrefs Rank #${summary.ahrefs_rank.toLocaleString()}` : 'Ahrefs Rank N/A'}
                hasData={hasSnapshot && summary?.domain_rating !== null && summary?.domain_rating !== undefined}
                size="hero"
                sparklineData={drSparkline}
                sparklineColor="#8B5CF6"
              />
              <KpiCard
                title="Organic Traffic"
                value={summary?.organic_traffic !== null && summary?.organic_traffic !== undefined ? summary.organic_traffic : '—'}
                changePercent={typeof summary?.traffic_delta_percent === 'number' ? summary.traffic_delta_percent : undefined}
                subText="Est. monthly visits"
                size="hero"
                sparklineData={trafficSparkline}
              />
              <KpiCard
                title="Referring Domains"
                value={refDomainsCount}
                subText="Unique linking domains"
                hasData={hasSnapshot || refDomainsCount > 0}
              />
              <div className="col-span-2 sm:col-span-1">
                <KpiCard
                  title="Striking Distance"
                  value={summary?.striking_distance_count ?? 0}
                  subText={
                    hasSnapshot && (summary?.striking_distance_count ?? 0) === 0
                      ? 'No keywords in pos. 4–20'
                      : 'Keywords in positions 4–20'
                  }
                  hasData={hasSnapshot}
                />
              </div>
            </section>

            {/* ── Tab navigation ───────────────────────────────────────────── */}
            <nav
              className="flex border-b border-[rgba(255,255,255,0.06)] overflow-x-auto mb-5 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar"
              aria-label="Dashboard sections"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`reddit-tab ${activeTab === tab.id ? 'active' : ''}`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  id={`tab-${tab.id}`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="tab-count">{tab.count}</span>
                  )}
                </button>
              ))}
            </nav>

            {/* ── Two-column layout: content + sidebar ─────────────────────── */}
            <div className="flex gap-5 items-start">

              {/* Main content area */}
              <div className="flex-1 min-w-0">

                {/* ── Overview tab ─────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">

                    {/* Keyword movements card */}
                    <DataCard
                      subreddit="r/Keywords"
                      title="Keyword Movements"
                      count={keywords.length}
                      accentColor="cyan"
                      lastSynced={data?.timestamp}
                      onViewAll={() => setActiveTab('keywords')}
                      viewAllLabel="View Full Thread →"
                    >
                      <KeywordTable keywords={keywords.slice(0, 3)} domain={domain} />
                    </DataCard>

                    {/* Referring domains card */}
                    <DataCard
                      subreddit="r/Backlinks"
                      title="Referring Domains"
                      count={backlinks.length}
                      accentColor="violet"
                      lastSynced={data?.timestamp}
                      onViewAll={backlinks.length > 5 ? () => setActiveTab('backlinks') : undefined}
                      viewAllLabel={`View all ${backlinks.length}`}
                    >
                      <BacklinkTable backlinks={backlinks} previewRows={5} />
                    </DataCard>

                    {/* Top pages card */}
                    <DataCard
                      subreddit="r/Pages"
                      title="Top Pages"
                      count={pages.length}
                      accentColor="green"
                      lastSynced={data?.timestamp}
                      onViewAll={pages.length > 5 ? () => setActiveTab('pages') : undefined}
                      viewAllLabel={`View all ${pages.length}`}
                    >
                      <PageTable pages={pages} domain={domain} previewRows={5} />
                    </DataCard>

                    {/* Insights card */}
                    <DataCard
                      subreddit="r/Insights"
                      title="Recommendations Feed"
                      accentColor="orange"
                      lastSynced={data?.timestamp}
                      onViewAll={() => setActiveTab('insights')}
                      viewAllLabel="Full Thread →"
                    >
                      <InsightThread
                        strikingCount={summary?.striking_distance_count ?? 0}
                        refDomainsCount={refDomainsCount}
                        competitorsCount={competitors.length}
                        dataLoaded={hasSnapshot}
                        liveRecommendations={liveRecommendations}
                        healthScore={summary?.healthScore}
                        healthGrade={healthGrade}
                      />
                    </DataCard>
                  </div>
                )}

                {/* ── Keywords tab ──────────────────────────────────────────── */}
                {activeTab === 'keywords' && (
                  <DataCard
                    subreddit="r/Keywords"
                    title="Keyword Rankings"
                    count={keywords.length}
                    accentColor="cyan"
                    lastSynced={data?.timestamp}
                  >
                    <KeywordTable
                      keywords={keywords}
                      domain={domain}
                      onProcessedKeywordsChange={(items, label) => {
                        setProcessedKeywords(items);
                        if (label) setKeywordFilterLabel(label);
                      }}
                    />
                  </DataCard>
                )}

                {/* ── Pages tab ─────────────────────────────────────────────── */}
                {activeTab === 'pages' && (
                  <DataCard
                    subreddit="r/Pages"
                    title="Page Performance"
                    count={pages.length}
                    accentColor="green"
                    lastSynced={data?.timestamp}
                  >
                    <PageTable pages={pages} domain={domain} />
                  </DataCard>
                )}

                {/* ── Backlinks tab ─────────────────────────────────────────── */}
                {activeTab === 'backlinks' && (
                  <DataCard
                    subreddit="r/Backlinks"
                    title="Referring Domains"
                    count={backlinks.length}
                    accentColor="violet"
                    lastSynced={data?.timestamp}
                  >
                    <BacklinkTable backlinks={backlinks} />
                  </DataCard>
                )}

                {/* ── Competitors tab ───────────────────────────────────────── */}
                {activeTab === 'competitors' && (
                  <DataCard
                    subreddit="r/Competitors"
                    title="Competitor Gap Analysis"
                    count={competitors.length}
                    accentColor="violet"
                    lastSynced={data?.timestamp}
                  >
                    <CompetitorMatrix
                      primaryDomain={domain}
                      competitors={competitors}
                      onOpenConfig={() => setIsConfigOpen(true)}
                    />
                  </DataCard>
                )}

                {/* ── Insights tab ──────────────────────────────────────────── */}
                {activeTab === 'insights' && (
                  <DataCard
                    subreddit="r/Insights"
                    title="Recommendations Thread"
                    accentColor="orange"
                    lastSynced={data?.timestamp}
                  >
                    <InsightThread
                      strikingCount={summary?.striking_distance_count ?? 0}
                      refDomainsCount={refDomainsCount}
                      competitorsCount={competitors.length}
                      dataLoaded={hasSnapshot}
                      liveRecommendations={liveRecommendations}
                      healthScore={summary?.healthScore}
                      healthGrade={healthGrade}
                    />
                  </DataCard>
                )}
              </div>

              {/* ── Sticky sidebar ─────────────────────────────────────────── */}
              <div className="hidden xl:block">
                <QuickStatsSidebar
                  topBacklink={
                    topBacklink
                      ? { domain: topBacklink.ref_domain, dr: topBacklink.domain_rating }
                      : null
                  }
                  bestKeyword={
                    bestKeyword
                      ? {
                          keyword: bestKeyword.keyword,
                          traffic: bestKeyword.traffic,
                          position: bestKeyword.position,
                        }
                      : null
                  }
                  strikingCount={summary?.striking_distance_count ?? 0}
                  apiUsedPct={apiUsedPct}
                  activeTab={activeTab}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Config modal ────────────────────────────────────────────────────── */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentConfig={config}
        domainOptions={domainOptions}
        onDomainsChange={handleDomainsChange}
        onSelectDomain={(newDomain) => {
          handleSelectDomain(newDomain);
          fetchData(newDomain);
        }}
        onConfigSaved={() => fetchData(selectedDomain)}
      />
    </div>
  );
}
