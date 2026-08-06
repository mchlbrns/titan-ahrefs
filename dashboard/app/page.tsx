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
  ExternalLink,
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<ApiResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  const webAppUrl =
    process.env.NEXT_PUBLIC_GAS_WEBAPP_URL ||
    'https://script.google.com/macros/s/AKfycbxDSOFO5sCDVuDgciSt-eXbpu-5T_g7gZgly-FcPR_4HBaTpLpdG7m6FWZSwwGSh1H-/exec';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(webAppUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load backend data`);
      const json: ApiResponseData = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not reach the Google Apps Script backend.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Derived values ─────────────────────────────────────────────────────

  const domain =
    data?.config?.primary_domain ||
    data?.primary_domain ||
    process.env.NEXT_PUBLIC_PRIMARY_DOMAIN ||
    'titantreasure.com';

  const config = data?.config || {
    primary_domain: domain,
    target_country: 'us',
    competitors: ['chumbacasino.com', 'pulsz.com', 'luckylandslots.com'],
    report_frequency: 'Weekly',
    comparison_period: 'Previous 7 days',
  };

  // Distinguish "no snapshot yet" from a loaded 0
  const hasSnapshot = Boolean(data?.summary);
  const summary = data?.summary;

  const apiUsage = data?.api_usage || {
    monthly_used: 0,
    monthly_limit: 400000,
    usage_percent: '0.00%',
  };

  // Null-safe filtered arrays
  const keywords: KeywordItem[] = (data?.keywords || []).filter(
    (k) => k && typeof k.keyword === 'string' && k.keyword.trim() !== ''
  );
  const pages: PageItem[] = data?.pages || [];
  const competitors: CompetitorItem[] = data?.competitors || [];
  const backlinks: BacklinkItem[] = data?.backlinks || [];

  const rawRefDomains = Number(summary?.ref_domains);
  const refDomainsCount =
    !isNaN(rawRefDomains) && rawRefDomains > 0
      ? rawRefDomains
      : backlinks.length;

  const lastUpdated = data?.timestamp
    ? new Date(data.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

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
          <h1 className="text-xl font-bold tracking-tight text-white">{domain}</h1>
          <div className="flex items-center gap-3 mt-1">
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
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] transition-all disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a
            href="https://docs.google.com/spreadsheets/d/1xZL--mAisI4qKM-dlsQ4ad6AxyCLh2eCwCsMCk_gizs/edit"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] transition-all"
          >
            Sheets <ExternalLink className="h-3 w-3" />
          </a>
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
          <section className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 border-b border-[rgba(255,255,255,0.06)]">
            <KpiCard
              title="Domain Rating"
              value={summary?.domain_rating ?? 0}
              subText={
                summary?.ahrefs_rank
                  ? `Ahrefs Rank #${summary.ahrefs_rank.toLocaleString()}`
                  : undefined
              }
              hasData={hasSnapshot && (summary?.domain_rating ?? 0) > 0}
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
              hasData={hasSnapshot && (summary?.organic_traffic ?? 0) > 0}
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
              />
            )}
          </div>
        </>
      )}

      {/* ── Config modal ────────────────────────────────────────────────── */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        webAppUrl={webAppUrl}
        currentConfig={config}
        onConfigSaved={fetchData}
      />
    </main>
  );
}
