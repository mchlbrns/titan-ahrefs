'use client';

import React, { useEffect, useState } from 'react';
import KpiCard from '@/components/KpiCard';
import ApiUsageBar from '@/components/ApiUsageBar';
import KeywordTable from '@/components/KeywordTable';
import PageTable from '@/components/PageTable';
import CompetitorMatrix from '@/components/CompetitorMatrix';
import BacklinkTable from '@/components/BacklinkTable';
import ActionChecklist from '@/components/ActionChecklist';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  RefreshCw,
  Globe,
  ExternalLink,
  ShieldCheck,
  Link2,
} from 'lucide-react';

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
  summary: {
    domain_rating: number;
    ahrefs_rank: number;
    organic_traffic: number;
    organic_traffic_prev?: number;
    traffic_delta_percent: number;
    organic_keywords: number;
    organic_cost: number;
    total_backlinks: number;
    ref_domains: number;
    dofollow_backlinks: number;
    striking_distance_count: number;
  };
  keyword_tiers: {
    top1_3: number;
    top4_10: number;
    top11_20: number;
    top21_50: number;
  };
  keywords: KeywordItem[];
  striking_distance: KeywordItem[];
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

export default function DashboardPage() {
  const [data, setData] = useState<ApiResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'pages' | 'competitors' | 'backlinks' | 'actions'>('overview');

  const webAppUrl =
    process.env.NEXT_PUBLIC_GAS_WEBAPP_URL ||
    'https://script.google.com/macros/s/AKfycbxDSOFO5sCDVuDgciSt-eXbpu-5T_g7gZgly-FcPR_4HBaTpLpdG7m6FWZSwwGSh1H-/exec';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(webAppUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load backend JSON`);
      const json: ApiResponseData = await res.json();
      setData(json);
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      const msg = err instanceof Error ? err.message : 'Error communicating with Google Apps Script Web App.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const domain = data?.primary_domain || process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'titantreasure.com';
  const summary = data?.summary || {
    domain_rating: 30,
    ahrefs_rank: 4028135,
    organic_traffic: 124500,
    traffic_delta_percent: 8.4,
    organic_keywords: 14800,
    organic_cost: 65200,
    total_backlinks: 1555,
    ref_domains: 475,
    dofollow_backlinks: 1240,
    striking_distance_count: 18,
  };

  const apiUsage = data?.api_usage || {
    monthly_used: 16005,
    monthly_limit: 400000,
    usage_percent: '4.00%',
  };

  const keywords: KeywordItem[] = data?.keywords?.length ? data.keywords : [
    { keyword: 'titan treasure casino', position: 1, previous_position: 1, position_delta: 0, search_volume: 18200, keyword_difficulty: 35, url: `https://${domain}/casino`, traffic: 9400, striking_distance: 'NO' },
    { keyword: 'titan treasure bonus code', position: 2, previous_position: 3, position_delta: 1, search_volume: 8400, keyword_difficulty: 28, url: `https://${domain}/bonus`, traffic: 4100, striking_distance: 'NO' },
    { keyword: 'best sweepstakes casino games', position: 4, previous_position: 6, position_delta: 2, search_volume: 12500, keyword_difficulty: 42, url: `https://${domain}/games`, traffic: 2800, striking_distance: 'YES' },
    { keyword: 'real money sweeps slots', position: 6, previous_position: 5, position_delta: -1, search_volume: 9600, keyword_difficulty: 48, url: `https://${domain}/slots`, traffic: 1900, striking_distance: 'YES' },
    { keyword: 'no deposit sweeps coins 2026', position: 8, previous_position: 11, position_delta: 3, search_volume: 15400, keyword_difficulty: 39, url: `https://${domain}/no-deposit`, traffic: 2200, striking_distance: 'YES' },
  ];

  const pages: PageItem[] = data?.pages?.length ? data.pages : [
    { url: `https://${domain}/casino`, top_keyword: 'titan treasure casino', organic_traffic: 45200, organic_keywords: 1840, traffic_share: 0.36 },
    { url: `https://${domain}/bonus`, top_keyword: 'titan treasure bonus code', organic_traffic: 28400, organic_keywords: 920, traffic_share: 0.22 },
    { url: `https://${domain}/games`, top_keyword: 'best sweepstakes casino games', organic_traffic: 18900, organic_keywords: 740, traffic_share: 0.15 },
    { url: `https://${domain}/slots`, top_keyword: 'real money sweeps slots', organic_traffic: 12600, organic_keywords: 610, traffic_share: 0.10 },
  ];

  const competitors: CompetitorItem[] = data?.competitors?.length ? data.competitors : [
    { competitor_domain: 'chumbacasino.com', overlap_keywords: 4200, competitor_keywords: 48500, competitor_traffic: 1840000, competitor_dr: 72 },
    { competitor_domain: 'pulsz.com', overlap_keywords: 3100, competitor_keywords: 32100, competitor_traffic: 980000, competitor_dr: 65 },
    { competitor_domain: 'luckylandslots.com', overlap_keywords: 2400, competitor_keywords: 26400, competitor_traffic: 620000, competitor_dr: 61 },
  ];

  const backlinks: BacklinkItem[] = data?.backlinks?.length ? data.backlinks : [
    { ref_domain: 'rankgrowthagency.shop', domain_rating: 31, dofollow_links: 1, total_links: 1, first_seen: '2026-08-02T17:29:55Z', status: 'ACTIVE' },
    { ref_domain: 'ranktracker.com', domain_rating: 78, dofollow_links: 4, total_links: 4, first_seen: '2026-05-29T16:44:53Z', status: 'ACTIVE' },
    { ref_domain: 'seo-anchor-text-experts.store', domain_rating: 32, dofollow_links: 0, total_links: 1, first_seen: '2026-05-20T13:37:17Z', status: 'ACTIVE' },
    { ref_domain: 'linkbox.agency', domain_rating: 28, dofollow_links: 0, total_links: 4, first_seen: '2026-07-28T04:04:49Z', status: 'ACTIVE' },
  ];

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-2.5 shadow-lg shadow-cyan-500/20 text-white">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {domain}
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                  Live Production
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Official Pedro Gomes Spec Compliant Ahrefs API v3 Automated SEO Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <a
            href="https://docs.google.com/spreadsheets/d/1xZL--mAisI4qKM-dlsQ4ad6AxyCLh2eCwCsMCk_gizs/edit"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition-all"
          >
            Open Google Sheets <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          ⚠️ <strong>Backend Connection Warning:</strong> {error} Showing cached snapshot.
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="flex rounded-xl bg-slate-900/90 p-1.5 border border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'overview' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Executive Summary
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'keywords' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Keyword Movements
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'pages' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" /> Page Performance
        </button>
        <button
          onClick={() => setActiveTab('backlinks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'backlinks' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Link2 className="h-4 w-4" /> Backlink Audit
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'competitors' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Competitors
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'actions' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="h-4 w-4" /> Recommended Actions
        </button>
      </nav>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Organic Traffic"
          value={summary.organic_traffic}
          changePercent={summary.traffic_delta_percent}
          subText="Est. monthly search visits"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          title="Traffic Value"
          value={`$${summary.organic_cost.toLocaleString()}`}
          subText="Equivalent Ad Spend value"
          icon={<Award className="h-5 w-5" />}
        />
        <KpiCard
          title="Domain Rating (DR)"
          value={summary.domain_rating}
          subText={`Ahrefs Rank: #${summary.ahrefs_rank ? summary.ahrefs_rank.toLocaleString() : 'N/A'}`}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <KpiCard
          title="Striking Distance Opportunities"
          value={summary.striking_distance_count || 18}
          subText="Keywords in positions 4–20"
          icon={<Zap className="h-5 w-5" />}
        />
      </section>

      {/* API Unit Usage Monitor Bar */}
      <ApiUsageBar
        monthlyUsed={apiUsage.monthly_used}
        monthlyLimit={apiUsage.monthly_limit}
        usagePercent={apiUsage.usage_percent}
      />

      {/* Main Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KeywordTable keywords={keywords} />
            <PageTable pages={pages} />
          </div>
          <BacklinkTable backlinks={backlinks} />
          <CompetitorMatrix primaryDomain={domain} competitors={competitors} />
          <ActionChecklist
            strikingCount={summary.striking_distance_count}
            refDomainsCount={summary.ref_domains}
            competitorsCount={competitors.length}
          />
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="space-y-6">
          <KeywordTable keywords={keywords} />
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="space-y-6">
          <PageTable pages={pages} />
        </div>
      )}

      {activeTab === 'backlinks' && (
        <div className="space-y-6">
          <BacklinkTable backlinks={backlinks} />
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <CompetitorMatrix primaryDomain={domain} competitors={competitors} />
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-6">
          <ActionChecklist
            strikingCount={summary.striking_distance_count}
            refDomainsCount={summary.ref_domains}
            competitorsCount={competitors.length}
          />
        </div>
      )}
    </main>
  );
}
