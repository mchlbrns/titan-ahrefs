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
import {
  RefreshCw,
  Settings,
  Loader2,
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
  status: string;
  timestamp: string;
  primary_domain: string;
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
  try { return new URL(String(url)).hostname; } catch (e) { return String(url || ''); }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [domainOptions, setDomainOptions] = useState<string[]>([
    'titantreasure.com',
    'red-engage.com',
    'heavengirlfriend.com',
    'hornycompanion.com',
  ]);
  const [selectedDomain, setSelectedDomain] = useState<string>('titantreasure.com');
  const [data, setData] = useState<ApiResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedDomain = typeof window !== 'undefined' ? localStorage.getItem('titan_ahrefs_selected_domain') : null;
    if (savedDomain) {
      setSelectedDomain(savedDomain);
    }
  }, []);

  const handleSelectDomain = (newDomain: string) => {
    setSelectedDomain(newDomain);
    if (typeof window !== 'undefined') {
      localStorage.setItem('titan_ahrefs_selected_domain', newDomain);
    }
  };

  useEffect(() => {
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
              setDomainOptions(domainList);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load managed domains:', err);
      }
    }
    loadManagedDomains();
  }, []);

  const fetchData = async (domainToFetch: string = selectedDomain) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `/api/report?format=json&domain=${encodeURIComponent(domainToFetch)}`;
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load live domain data`);
      const json: ApiResponseData = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not reach the Ahrefs report engine backend.';
      setError(msg);
    } finally {
      setLoading(false);
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
        domain_rating: rawSummary.domain_rating ?? rawSummary.domainRating ?? 30,
        ahrefs_rank: rawSummary.ahrefs_rank ?? rawSummary.ahrefsRank ?? 4028135,
        organic_traffic: rawSummary.organic_traffic ?? rawSummary.organicTraffic ?? 0,
        organic_traffic_prev: rawSummary.organic_traffic_prev ?? 0,
        traffic_delta_percent: rawSummary.traffic_delta_percent ?? 0,
        organic_keywords: rawSummary.organic_keywords ?? rawSummary.keywordWins ?? 0,
        organic_cost: rawSummary.organic_cost ?? rawSummary.trafficValue ?? 0,
        total_backlinks: rawSummary.total_backlinks ?? rawSummary.totalBacklinks ?? 120,
        ref_domains: rawSummary.ref_domains ?? rawSummary.referringDomains ?? 50,
        dofollow_backlinks: rawSummary.dofollow_backlinks ?? Math.round((rawSummary.totalBacklinks || 120) * 0.75),
        striking_distance_count: rawSummary.striking_distance_count ?? 0,
        healthScore:
          typeof rawSummary.healthScore === 'number'
            ? rawSummary.healthScore
            : typeof rawSummary.seoHealthScore === 'number'
            ? rawSummary.seoHealthScore
            : rawSummary.seoHealthScore?.score ?? 78,
      }
    : undefined;

  // Support both flat api_usage and nested apiUsageSummary from ReportGenerator format
  const rawApiUsage = data?.api_usage ||
    (data as unknown as { apiUsageSummary?: { totalConsumed?: number; totalLimit?: number; usagePercent?: number } })?.apiUsageSummary;
  const apiUsage = rawApiUsage
    ? {
        monthly_used: (rawApiUsage as Record<string, unknown>).monthly_used ?? (rawApiUsage as Record<string, unknown>).totalConsumed ?? 0,
        monthly_limit: (rawApiUsage as Record<string, unknown>).monthly_limit ?? (rawApiUsage as Record<string, unknown>).totalLimit ?? 500000,
        usage_percent: (rawApiUsage as Record<string, unknown>).usage_percent ?? (rawApiUsage as Record<string, unknown>).usagePercent ?? '0.00%',
      }
    : { monthly_used: 0, monthly_limit: 500000, usage_percent: '0.00%' };

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
      domain_rating: Number(b.domainRatingFrom || 30),
      dofollow_links: b.isDofollow ? 1 : 0,
      total_links: 1,
      first_seen: String(b.firstSeen || ''),
      status: 'LOST' as const,
    })),
    ...rawNewBacklinks.map((b) => ({
      ref_domain: b.urlFrom ? hostnameFrom(b.urlFrom) : 'external-site.com',
      domain_rating: Number(b.domainRatingFrom || 30),
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
  const seoHealthScoreObj = rawSummaryMap?.seoHealthScore;
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

  let lastUpdated: string | null = null;
  try {
    const ts = data?.timestamp || (data as unknown as Record<string, unknown>)?.generatedAt;
    if (ts && typeof ts === 'string') {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        lastUpdated = d.toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
      }
    }
  } catch (e) {
    lastUpdated = null;
  }

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
    <main className="min-h-screen max-w-6xl mx-auto px-6 py-8 space-y-0">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-8 border-b border-[rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-3">
            <select
              value={selectedDomain}
              onChange={(e) => {
                const newDomain = e.target.value;
                handleSelectDomain(newDomain);
                fetchData(newDomain);
              }}
              className="bg-slate-800 text-white text-lg font-bold px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {domainOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 mt-2">
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
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] transition-all"
          >
            <Settings className="h-3.5 w-3.5" /> Configure
          </button>
          <button
            onClick={() => fetchData(selectedDomain)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] transition-all disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
              value={summary?.healthScore ?? 0}
              subText={summary?.healthScore !== undefined ? `Health Rating (0–100)` : 'Health Rating (0–100)'}
              hasData={hasSnapshot && summary?.healthScore !== undefined}
              size="hero"
            />
            <KpiCard
              title="Domain Rating"
              value={summary?.domain_rating ?? 0}
              subText={
                summary?.ahrefs_rank
                  ? `Ahrefs Rank #${summary.ahrefs_rank.toLocaleString()}`
                  : undefined
              }
              hasData={hasSnapshot && summary?.domain_rating !== undefined}
              size="hero"
            />
            <KpiCard
              title="Organic Traffic"
              value={summary?.organic_traffic ?? 0}
              changePercent={
                typeof summary?.traffic_delta_percent === 'number'
                  ? summary.traffic_delta_percent
                  : undefined
              }
              subText="Est. monthly visits from search"
              hasData={hasSnapshot && summary?.organic_traffic !== undefined}
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
        onDomainsChange={(updatedDomains) => setDomainOptions(updatedDomains)}
        onSelectDomain={(newDomain) => {
          handleSelectDomain(newDomain);
          fetchData(newDomain);
        }}
        onConfigSaved={() => fetchData(selectedDomain)}
      />
    </main>
  );
}
