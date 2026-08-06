'use client';

import React, { useEffect, useState } from 'react';
import KpiCard from '@/components/KpiCard';
import ApiUsageBar from '@/components/ApiUsageBar';
import KeywordTable from '@/components/KeywordTable';
import PageTable from '@/components/PageTable';
import CompetitorMatrix from '@/components/CompetitorMatrix';
import BacklinkTable from '@/components/BacklinkTable';
import ActionChecklist from '@/components/ActionChecklist';
import ConfigModal from '@/components/ConfigModal';
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
  Settings,
  Loader2,
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
    ref_domains: number;
    dofollow_backlinks: number;
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

export default function DashboardPage() {
  const [data, setData] = useState<ApiResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'pages' | 'competitors' | 'backlinks' | 'actions'>('overview');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

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

  const domain = data?.config?.primary_domain || data?.primary_domain || process.env.NEXT_PUBLIC_PRIMARY_DOMAIN || 'titantreasure.com';
  const config = data?.config || {
    primary_domain: domain,
    target_country: 'us',
    competitors: ['chumbacasino.com', 'pulsz.com', 'luckylandslots.com'],
    report_frequency: 'Weekly',
    comparison_period: 'Previous 7 days',
  };

  const summary = data?.summary || {
    domain_rating: 0,
    ahrefs_rank: 0,
    organic_traffic: 0,
    traffic_delta_percent: 0,
    organic_keywords: 0,
    organic_cost: 0,
    total_backlinks: 0,
    ref_domains: 0,
    dofollow_backlinks: 0,
    striking_distance_count: 0,
  };

  const apiUsage = data?.api_usage || {
    monthly_used: 0,
    monthly_limit: 400000,
    usage_percent: '0.00%',
  };

  // 100% LIVE REAL DATA ONLY — NO FAKE MOCK DATA FALLBACKS
  const keywords: KeywordItem[] = data?.keywords || [];
  const pages: PageItem[] = data?.pages || [];
  const competitors: CompetitorItem[] = data?.competitors || [];
  const backlinks: BacklinkItem[] = data?.backlinks || [];

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
                  Live Production Data
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Official Pedro Gomes Spec Compliant Ahrefs API v3 Automated SEO Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600/20 px-3.5 py-2 text-xs font-bold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-all"
          >
            <Settings className="h-3.5 w-3.5" /> Configure Engine & Domains
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <a
            href="https://docs.google.com/spreadsheets/d/1xZL--mAisI4qKM-dlsQ4ad6AxyCLh2eCwCsMCk_gizs/edit"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white border border-slate-700 hover:bg-slate-700 transition-all"
          >
            Open Sheets <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          ⚠️ <strong>Backend Error:</strong> {error}
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
          <TrendingUp className="h-4 w-4" /> Keyword Movements ({keywords.length})
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'pages' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" /> Page Performance ({pages.length})
        </button>
        <button
          onClick={() => setActiveTab('backlinks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'backlinks' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Link2 className="h-4 w-4" /> Backlink Audit ({backlinks.length})
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
            activeTab === 'competitors' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Competitors ({competitors.length})
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

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Fetching live Ahrefs API data from Google Sheets backend...</p>
        </div>
      ) : (
        <>
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
              value={summary.striking_distance_count || 0}
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
                <KeywordTable keywords={keywords} domain={domain} />
                <PageTable pages={pages} domain={domain} />
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
              <KeywordTable keywords={keywords} domain={domain} />
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-6">
              <PageTable pages={pages} domain={domain} />
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
        </>
      )}

      {/* Interactive Settings & Config Drawer Modal */}
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
