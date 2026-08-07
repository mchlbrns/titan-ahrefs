'use client';

import React, { useEffect, useState } from 'react';
import KpiCard from '@/components/KpiCard';
import ApiUsagePill from '@/components/ApiUsagePill';
import KeywordTable from '@/components/KeywordTable';
import PageTable from '@/components/PageTable';
import CompetitorMatrix from '@/components/CompetitorMatrix';
import BacklinkTable from '@/components/BacklinkTable';
import ActionChecklist from '@/components/ActionChecklist';
import ConfigModal from '@/components/ConfigModal';
import ExportMenu from '@/components/ExportMenu';
import {
  Settings,
  Loader2,
  CheckCircle,
  Calendar,
  RefreshCw,
  Lock,
  AlertTriangle,
} from 'lucide-react';

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

  const [liveApiUsage, setLiveApiUsage] = useState<{ monthly_used: number | null; monthly_limit: number | null; usage_percent: string | number | null; resetDate?: string | null } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDomain = localStorage.getItem('titan_ahrefs_selected_domain');
      if (savedDomain) {
        setSelectedDomain(savedDomain);
      }
      const savedDomains = localStorage.getItem('titan_ahrefs_managed_domains');
      if (savedDomains) {
        try {
          const parsed = JSON.parse(savedDomains);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDomainOptions(parsed);
          }
        } catch {
          // ignore error
        }
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
            if (domainList.length > 0) {
              handleDomainsChange(domainList);
            }
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
              resetDate: json.resetDate || '2026-09-04'
            });
          }
        }
      } catch {
        // ignore
      }
    }

    loadManagedDomains();
    checkApiUsage();
  }, []);


  const fetchData = async (domainToFetch: string = selectedDomain, isRefreshAction: boolean = false) => {
    if (isRefreshAction) {
      setRefreshing(true);
    } else if (!data) {
      setLoading(true);
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
        if (isRefreshAction) {
          if (json.ingestionError) {
            setToast({
              message: `API quota exceeded — live data unavailable until ${liveApiUsage?.resetDate || 'the next billing cycle'}. Displaying most recent saved snapshot.`,
              type: 'error'
            });
          } else {
            setToast({
              message: `Data refreshed successfully for ${domainToFetch}. Dashboard is now showing the latest available data.`,
              type: 'success'
            });
          }
          setTimeout(() => setToast(null), 6000);
        }
      }
    } catch (err: unknown) {
      if (currentDomainRef.current === domainToFetch) {
        const msg =
          err instanceof Error ? err.message : 'Could not reach the Ahrefs report engine backend.';
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
  }, [selectedDomain]);

  // ─── Derived values ─────────────────────────────────────────────────────

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

  // Distinguish "no snapshot yet" from a loaded 0
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

  // Support both flat api_usage and nested apiUsageSummary from ReportGenerator format
  const rawApiUsage = data?.api_usage ||
    (data as unknown as { apiUsageSummary?: { totalConsumed?: number; totalLimit?: number; usagePercent?: number } })?.apiUsageSummary;
  const apiUsage = liveApiUsage || (rawApiUsage
    ? {
        monthly_used: (rawApiUsage as Record<string, unknown>).monthly_used ?? (rawApiUsage as Record<string, unknown>).totalConsumed ?? null,
        monthly_limit: (rawApiUsage as Record<string, unknown>).monthly_limit ?? (rawApiUsage as Record<string, unknown>).totalLimit ?? null,
        usage_percent: (rawApiUsage as Record<string, unknown>).usage_percent ?? (rawApiUsage as Record<string, unknown>).usagePercent ?? null,
      }
    : { monthly_used: null, monthly_limit: null, usage_percent: null });

  // Null-safe filtered arrays — support both flat and summaries format
  const keywords: KeywordItem[] = (data?.keywords || []).filter(
    (k) => k && typeof k.keyword === 'string' && k.keyword.trim() !== ''
  );
  const pages: PageItem[] = data?.pages || [];
  const competitors: CompetitorItem[] = data?.competitors || [];

  // Extract backlinks: prefer flat format, fallback to trend arrays in summaries format
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
  const backlinks: BacklinkItem[] = Array.isArray(data?.backlinks) && (data?.backlinks?.length ?? 0) > 0
    ? (data?.backlinks as BacklinkItem[])
    : trendBacklinks;

  const rawRefDomains = Number(summary?.ref_domains);
  const refDomainsCount =
    !isNaN(rawRefDomains) && rawRefDomains > 0
      ? rawRefDomains
      : backlinks.length;

  // Extract live recommendations and health grade from rawSummary
  const rawSummaryMap = rawSummary ? (rawSummary as Record<string, unknown>) : undefined;
  const seoHealthScoreObj = rawSummaryMap?.seoHealthScore || (data?.summary as Record<string, unknown>)?.seoHealthScore;
  const seoHealthScore = seoHealthScoreObj && typeof seoHealthScoreObj === 'object'
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
      } catch {
        // ignore
      }
    }
    setLastUpdated(null);
  }, [data?.timestamp]);

  // ─── Tabs config ────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'keywords', label: 'Keywords', count: keywords.length },
    { id: 'pages', label: 'Pages', count: pages.length },
    { id: 'backlinks', label: 'Backlinks', count: backlinks.length },
    { id: 'competitors', label: 'Competitors', count: competitors.length },
    { id: 'insights', label: 'Insights' },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-6 py-8 space-y-0 relative">
      {/* ── Toast notification banner ───────────────────────────────────── */}
      {toast && (
        <div className={`mb-5 flex items-center justify-between gap-4 rounded-xl px-5 py-3.5 shadow-2xl backdrop-blur-md border transition-all animate-in fade-in slide-in-from-top-3 duration-300 ${
          toast.type === 'error'
            ? 'bg-amber-950/70 border-amber-500/25 text-amber-200'
            : 'bg-emerald-950/70 border-emerald-500/25 text-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg shrink-0 ${
              toast.type === 'error' ? 'bg-amber-500/15' : 'bg-emerald-500/15'
            }`}>
              {toast.type === 'error'
                ? <AlertTriangle className="h-4 w-4 text-amber-400" />
                : <CheckCircle className="h-4 w-4 text-emerald-400" />
              }
            </div>
            <div>
              <p className="font-medium text-xs">{toast.type === 'error' ? 'Update Unavailable' : 'Data Refreshed'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{toast.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-slate-200 transition-colors text-lg leading-none shrink-0"
          >×</button>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-8 border-b border-[rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-3">
            <select
              value={selectedDomain}
              onChange={(e) => handleSelectDomain(e.target.value)}
              className="bg-slate-800 text-white text-lg font-bold px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {domainOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {lastUpdated && (
              <p className="text-xs text-slate-500">Updated {lastUpdated}</p>
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
                title={`Ahrefs API Unit Reset Date: ${liveApiUsage?.resetDate || apiUsage.reset_date || '2026-09-04'}\nNext automated live ingestion cycle: ${liveApiUsage?.resetDate || apiUsage.reset_date || '2026-09-04'}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-medium text-purple-300 bg-purple-950/60 border border-purple-500/30 cursor-default"
              >
                <Calendar className="h-3 w-3 text-purple-400 shrink-0" />
                <span>API Refresh: {liveApiUsage?.resetDate || apiUsage.reset_date || '2026-09-04'}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] transition-all duration-200"
          >
            <Settings className="h-3.5 w-3.5" /> Configure
          </button>
          {(() => {
            const usedPct = liveApiUsage?.monthly_used != null && liveApiUsage?.monthly_limit
              ? (liveApiUsage.monthly_used / liveApiUsage.monthly_limit) * 100
              : null;
            const isQuotaExceeded = usedPct !== null && usedPct >= 100;
            const isDisabled = loading || refreshing || isQuotaExceeded;
            const resetDate = liveApiUsage?.resetDate || '2026-09-04';
            return (
              <div className="relative group">
                <button
                  onClick={() => !isQuotaExceeded && fetchData(selectedDomain, true)}
                  disabled={isDisabled}
                  title={isQuotaExceeded ? `API quota exhausted — live refresh unavailable until ${resetDate}` : 'Pull latest data from Ahrefs'}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all duration-200 ${
                    isQuotaExceeded
                      ? 'bg-rose-950/40 border-rose-500/25 text-rose-400/70 cursor-not-allowed'
                      : 'text-slate-400 border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] cursor-pointer'
                  } disabled:opacity-60`}
                >
                  {isQuotaExceeded ? (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Refresh Locked</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
                    </>
                  )}
                </button>
                {isQuotaExceeded && (
                  <div className="absolute right-0 top-full mt-2 z-50 hidden group-hover:flex w-56 flex-col gap-1 rounded-xl border border-rose-500/20 bg-slate-900/95 backdrop-blur-xl px-3.5 py-3 shadow-2xl text-[11px] pointer-events-none">
                    <p className="font-semibold text-rose-300">Quota Exhausted</p>
                    <p className="text-slate-400 leading-relaxed">Live data ingestion is locked until the API quota resets.</p>
                    <p className="text-slate-500 mt-0.5">Resets on <span className="text-purple-300 font-medium">{resetDate}</span></p>
                  </div>
                )}
              </div>
            );
          })()}
          <ExportMenu domain={selectedDomain} />
        </div>
      </header>

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-xs text-rose-400">
          <strong>Backend error:</strong> {error}
        </div>
      )}

      {/* ── Loading state ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      ) : (
        <>
          {/* ── Hero metrics ─────────────────────────────────────────────── */}
          <section className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-6 border-b border-[rgba(255,255,255,0.06)]">
            <KpiCard
              title="SEO Health Score"
              value={summary?.healthScore !== null && summary?.healthScore !== undefined ? summary.healthScore : '—'}
              subText={
                summary?.healthScore !== null && summary?.healthScore !== undefined
                  ? healthGrade
                    ? `Grade ${healthGrade} — Health Rating (0–100)`
                    : 'Health Rating (0–100)'
                  : 'Data Pending'
              }
              hasData={hasSnapshot && summary?.healthScore !== null && summary?.healthScore !== undefined}
              size="hero"
            />
            <KpiCard
              title="Domain Rating"
              value={summary?.domain_rating !== null && summary?.domain_rating !== undefined ? summary.domain_rating : '—'}
              subText={
                summary?.ahrefs_rank
                  ? `Ahrefs Rank #${summary.ahrefs_rank.toLocaleString()}`
                  : 'Ahrefs Rank N/A'
              }
              hasData={hasSnapshot && summary?.domain_rating !== null && summary?.domain_rating !== undefined}
              size="hero"
            />
            <KpiCard
              title="Organic Traffic"
              value={summary?.organic_traffic !== null && summary?.organic_traffic !== undefined ? summary.organic_traffic : '—'}
              changePercent={
                typeof summary?.traffic_delta_percent === 'number'
                  ? summary.traffic_delta_percent
                  : undefined
              }
              subText="Est. monthly visits from search"
              size="hero"
            />
            <KpiCard
              title="Referring Domains"


              value={refDomainsCount}
              subText="Unique domains linking to site"
              hasData={hasSnapshot || refDomainsCount > 0}
            />
            <KpiCard
              title="Striking Distance"
              value={summary?.striking_distance_count ?? 0}
              subText={
                hasSnapshot && (summary?.striking_distance_count ?? 0) === 0
                  ? 'No keywords in positions 4–20 yet'
                  : 'Keywords in positions 4–20'
              }
              hasData={hasSnapshot}
            />
          </section>

          {/* ── Navigation tabs ──────────────────────────────────────────── */}
          <nav
            className="flex gap-0 border-b border-[rgba(255,255,255,0.06)] overflow-x-auto"
            aria-label="Dashboard sections"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 text-[10px] text-slate-600">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* ── Tab content ──────────────────────────────────────────────── */}
          <div className="py-8">

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-10">

                {/* Keyword summary */}
                <section>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white">Keyword movements</h2>
                    {keywords.length > 5 && (
                      <button
                        onClick={() => setActiveTab('keywords')}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        View all {keywords.length} →
                      </button>
                    )}
                  </div>
                  <KeywordTable keywords={keywords} domain={domain} previewRows={5} />
                </section>

                <div className="section-rule" />

                {/* Backlink summary */}
                <section>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white">Referring domains</h2>
                    {backlinks.length > 5 && (
                      <button
                        onClick={() => setActiveTab('backlinks')}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        View all {backlinks.length} →
                      </button>
                    )}
                  </div>
                  <BacklinkTable backlinks={backlinks} previewRows={5} />
                </section>

                <div className="section-rule" />

                {/* Top pages summary */}
                <section>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white">Top pages</h2>
                    {pages.length > 5 && (
                      <button
                        onClick={() => setActiveTab('pages')}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        View all {pages.length} →
                      </button>
                    )}
                  </div>
                  <PageTable pages={pages} domain={domain} previewRows={5} />
                </section>

                <div className="section-rule" />

                {/* Insights */}
                <section>
                  <ActionChecklist
                    strikingCount={summary?.striking_distance_count ?? 0}
                    refDomainsCount={refDomainsCount}
                    competitorsCount={competitors.length}
                    dataLoaded={hasSnapshot}
                    liveRecommendations={liveRecommendations}
                    healthScore={summary?.healthScore}
                    healthGrade={healthGrade}
                  />
                </section>
              </div>
            )}

            {/* Keywords tab */}
            {activeTab === 'keywords' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white">Keyword rankings</h2>
                <KeywordTable keywords={keywords} domain={domain} />
              </div>
            )}

            {/* Pages tab */}
            {activeTab === 'pages' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white">Page performance</h2>
                <PageTable pages={pages} domain={domain} />
              </div>
            )}

            {/* Backlinks tab */}
            {activeTab === 'backlinks' && (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold text-white">Referring domains</h2>
                  {backlinks.length > 0 && (
                    <span className="text-xs text-slate-500">{backlinks.length} domains</span>
                  )}
                </div>
                <BacklinkTable backlinks={backlinks} />
              </div>
            )}

            {/* Competitors tab */}
            {activeTab === 'competitors' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white">Competitor gap</h2>
                <CompetitorMatrix primaryDomain={domain} competitors={competitors} />
              </div>
            )}

            {/* Insights tab */}
            {activeTab === 'insights' && (
              <ActionChecklist
                strikingCount={summary?.striking_distance_count ?? 0}
                refDomainsCount={refDomainsCount}
                competitorsCount={competitors.length}
                dataLoaded={hasSnapshot}
                liveRecommendations={liveRecommendations}
                healthScore={summary?.healthScore}
                healthGrade={healthGrade}
              />
            )}
          </div>
        </>
      )}

      {/* ── Config modal ────────────────────────────────────────────────── */}
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
    </main>
  );
}
