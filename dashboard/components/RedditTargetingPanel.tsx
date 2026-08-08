'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  Link,
  Globe,
  Search,
  Layers,
  Send,
  CheckCircle2,
  CheckSquare,
  Square,
  Trash2
} from 'lucide-react';

const QUEUE_STORAGE_KEY = 'titan_reddit_scrape_queue';

function getQueuedUrlsFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (saved) {
      const list = JSON.parse(saved) as Array<string | { thread_url: string }>;
      if (Array.isArray(list)) {
        return new Set(
          list.map(i => (typeof i === 'string' ? i : i.thread_url)).filter(Boolean)
        );
      }
    }
  } catch { /* ignore */ }
  return new Set();
}

function addUrlsToStorage(urls: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getQueuedUrlsFromStorage();
    urls.forEach(u => existing.add(u));
    // Persist as array of objects to match SimpleDashboard format
    const list = Array.from(existing).map(u => ({ thread_url: u }));
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

function removeUrlsFromStorage(urls: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getQueuedUrlsFromStorage();
    urls.forEach(u => existing.delete(u));
    const list = Array.from(existing).map(u => ({ thread_url: u }));
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

export interface TargetThread {
  id: string;
  url: string;
  title: string;
  subreddit: string;
  targetKeyword: string;
  searchVolume: number;
  estTraffic: number;
  keywordDifficulty: number;
  urlRating: number;
  scrapeStatus: 'Unscraped' | 'Queued' | 'Scraped';
}

interface RedditTargetingPanelProps {
  selectedDomain?: string;
}

type SearchMode = 'keyword' | 'subreddit' | 'combined';

const SOCIAL_CASINO_CONFIG = {
  label: 'US Social Sweepstakes Casino',
  defaultSub: 'ChumbaCasino',
  defaultKeyword: 'sweepstakes casino',
  presets: ['ChumbaCasino', 'sweepstakes', 'socialcasino', 'slots', 'onlinegambling'],
};

const DOMAIN_PRESETS: Record<string, { defaultSub: string; defaultKeyword?: string; presets: string[]; label: string }> = {
  'titantreasure.com': SOCIAL_CASINO_CONFIG,
  'betsweepsy.com': SOCIAL_CASINO_CONFIG,
  'luckytwogrands.com': SOCIAL_CASINO_CONFIG,
  'sweepsybet.com': SOCIAL_CASINO_CONFIG,
  'goldishsweeps.com': SOCIAL_CASINO_CONFIG,
  'luckierbety.com': SOCIAL_CASINO_CONFIG,
  'titantreasure.bet': SOCIAL_CASINO_CONFIG,
  'titantreasure.casino': SOCIAL_CASINO_CONFIG,
  'heavengirlfriend.com': {
    label: 'AI Companion & Gaming Platform',
    defaultSub: 'AICompanion',
    defaultKeyword: 'AI companion app',
    presets: ['AICompanion', 'SoulmateAI', 'CharacterAI', 'Replika', 'virtualgf'],
  },
  'hornycompanion.com': {
    label: 'Adult Entertainment Directory',
    defaultSub: 'AICompanion',
    defaultKeyword: 'virtual companion',
    presets: ['AICompanion', 'NSFWAI', 'virtualgf', 'CharacterAI', 'Replika'],
  },
  'red-engage.com': {
    label: 'Engagement & Content Platform',
    defaultSub: 'digitalmarketing',
    defaultKeyword: 'SEO automation',
    presets: ['digitalmarketing', 'SEO', 'contentmarketing', 'growthhacking', 'B2Bmarketing'],
  },
};

const DEFAULT_CONFIG = SOCIAL_CASINO_CONFIG;

const volumeColor = (v: number): string =>
  v >= 20000 ? 'text-rose-400' : v >= 10000 ? 'text-amber-400' : v >= 1000 ? 'text-emerald-400' : 'text-slate-500';

const kdColor = (d: number): string =>
  d > 60 ? 'text-rose-400' : d > 30 ? 'text-amber-400' : 'text-emerald-400';

export default function RedditTargetingPanel({ selectedDomain }: RedditTargetingPanelProps) {
  const activeDomain = selectedDomain || 'titantreasure.com';
  const domainConfig = DOMAIN_PRESETS[activeDomain] || DEFAULT_CONFIG;

  const [mode, setMode] = useState<SearchMode>('subreddit');
  // Live input state — updated on every keystroke, NOT wired to the fetch
  const [subredditInput, setSubredditInput] = useState(domainConfig.defaultSub);
  const [keywordInput, setKeywordInput] = useState(domainConfig.defaultKeyword || 'sweepstakes casino');
  const [minVolumeInput, setMinVolumeInput] = useState('500');

  // Committed search params — only updated when user explicitly submits the search
  const [committedParams, setCommittedParams] = useState({
    mode: 'subreddit' as SearchMode,
    subreddit: domainConfig.defaultSub,
    keyword: domainConfig.defaultKeyword || 'sweepstakes casino',
    minVolume: '500',
  });

  const [threads, setThreads] = useState<TargetThread[]>([]);
  const [selectedThreadIds, setSelectedThreadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [pushingIds, setPushingIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Tracks which thread URLs are queued — persisted to localStorage so both views stay in sync
  const [queuedUrls, setQueuedUrls] = useState<Set<string>>(() => getQueuedUrlsFromStorage());

  // Sync inputs AND committed params on domain change
  useEffect(() => {
    const config = DOMAIN_PRESETS[activeDomain] || DEFAULT_CONFIG;
    const newSub = config.defaultSub;
    const newKeyword = config.defaultKeyword || 'sweepstakes casino';
    setSubredditInput(newSub);
    setKeywordInput(newKeyword);
    setCommittedParams(prev => ({ ...prev, subreddit: newSub, keyword: newKeyword }));
  }, [activeDomain]);

  const fetchTargetThreads = useCallback(async () => {
    setLoading(true);
    setSelectedThreadIds(new Set());
    try {
      const queryParams = new URLSearchParams({
        mode: committedParams.mode,
        subreddit: committedParams.subreddit,
        keyword: committedParams.keyword,
        minVolume: committedParams.minVolume,
        limit: '50'
      });
      const res = await fetch(`/api/reddit-targeting/search?${queryParams.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Overlay persisted queue status so switching views doesn't reset button state
      const queued = getQueuedUrlsFromStorage();
      const rawThreads: TargetThread[] = Array.isArray(json.threads) ? json.threads : [];
      const overlaid = rawThreads.map(t =>
        queued.has(t.url) ? { ...t, scrapeStatus: 'Queued' as const } : t
      );
      setThreads(overlaid);
      setQueuedUrls(queued);
      setIsMockData(Boolean(json.isMockData));
      setQuotaExhausted(Boolean(json.quotaExhausted));
    } catch {
      setThreads([]);
      setIsMockData(true);
    } finally {
      setLoading(false);
    }
  }, [committedParams]);

  useEffect(() => {
    void fetchTargetThreads();
  }, [fetchTargetThreads]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Commit the current input values first, then the useEffect will trigger the fetch
    setCommittedParams({ mode, subreddit: subredditInput, keyword: keywordInput, minVolume: minVolumeInput });
  };

  const handleToggleSelectAll = () => {
    if (selectedThreadIds.size === threads.length) {
      setSelectedThreadIds(new Set());
    } else {
      setSelectedThreadIds(new Set(threads.map(t => t.id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedThreadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pushThreadsToScraper = async (threadsToPush: TargetThread[]) => {
    if (threadsToPush.length === 0) return;

    const idsToPush = new Set(threadsToPush.map(t => t.id));
    const urlsToPush = threadsToPush.map(t => t.url);
    setPushingIds(prev => new Set([...Array.from(prev), ...Array.from(idsToPush)]));

    // Optimistic UI + localStorage update so both views stay in sync immediately
    setThreads(prev =>
      prev.map(t => (idsToPush.has(t.id) ? { ...t, scrapeStatus: 'Queued' as const } : t))
    );
    setQueuedUrls(prev => {
      const next = new Set(prev);
      urlsToPush.forEach(u => next.add(u));
      return next;
    });
    addUrlsToStorage(urlsToPush);

    try {
      const payload = {
        event: 'reddit_scrape_requested',
        threads: threadsToPush.map(t => ({
          thread_url: t.url,
          target_keyword: t.targetKeyword,
          search_volume: t.searchVolume,
          est_traffic: t.estTraffic
        })),
        requested_at: new Date().toISOString()
      };

      const res = await fetch('/api/reddit-targeting/scrape-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setToastMessage(
          threadsToPush.length === 1
            ? 'Thread pushed to scraping queue successfully.'
            : `${threadsToPush.length} threads pushed to scraping queue successfully.`
        );
      } else {
        setToastMessage('Queued locally (API status pending).');
      }
    } catch {
      setToastMessage('Queued locally.');
    } finally {
      setPushingIds(prev => {
        const next = new Set(prev);
        idsToPush.forEach(id => next.delete(id));
        return next;
      });
      setSelectedThreadIds(prev => {
        const next = new Set(prev);
        idsToPush.forEach(id => next.delete(id));
        return next;
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const removeThreadFromScraper = async (thread: TargetThread) => {
    // Optimistic UI + localStorage removal
    setThreads(prev =>
      prev.map(t => t.id === thread.id ? { ...t, scrapeStatus: 'Unscraped' as const } : t)
    );
    setQueuedUrls(prev => {
      const next = new Set(prev);
      next.delete(thread.url);
      return next;
    });
    removeUrlsFromStorage([thread.url]);

    try {
      await fetch(`/api/reddit-targeting/scrape-queue?thread_url=${encodeURIComponent(thread.url)}`, {
        method: 'DELETE'
      });
    } catch { /* ignore – already removed from local state */ }
  };

  const totalEstTraffic = threads.reduce((acc, t) => acc + (t.estTraffic || 0), 0);
  const totalVolume = threads.reduce((acc, t) => acc + (t.searchVolume || 0), 0);

  return (
    <div className="space-y-4">
      {/* ── Toast Notification Banner ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-cyan-500 text-slate-950 font-bold px-4 py-3 shadow-2xl shadow-cyan-500/30 animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* ── Domain Context Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Target Domain Context</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {domainConfig.label}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">{activeDomain}</h2>
          </div>
        </div>
        <div className="text-xs text-slate-400 sm:text-right">
          Discovering high-traffic Reddit SERP threads for <strong className="text-cyan-300">{activeDomain}</strong>
        </div>
      </div>

      {/* ── Search Mode Controls (Modes A, B, C) ── */}
      <div className="data-card p-4 space-y-4">
        {/* Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mr-2">Search Strategy:</span>
          <button
            type="button"
            onClick={() => {
              setMode('subreddit');
              setCommittedParams({ mode: 'subreddit', subreddit: subredditInput, keyword: keywordInput, minVolume: minVolumeInput });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              mode === 'subreddit'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5 inline mr-1.5" />
            Subreddit-First (B)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('keyword');
              setCommittedParams({ mode: 'keyword', subreddit: subredditInput, keyword: keywordInput, minVolume: minVolumeInput });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              mode === 'keyword'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="h-3.5 w-3.5 inline mr-1.5" />
            Keyword-First (A)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('combined');
              setCommittedParams({ mode: 'combined', subreddit: subredditInput, keyword: keywordInput, minVolume: minVolumeInput });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              mode === 'combined'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Combined (C)
          </button>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(mode === 'subreddit' || mode === 'combined') && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Subreddit Name
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
                <span className="text-cyan-400 font-bold text-sm">r/</span>
                <input
                  type="text"
                  value={subredditInput}
                  onChange={(e) => setSubredditInput(e.target.value)}
                  placeholder={domainConfig.defaultSub}
                  className="w-full bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          {(mode === 'keyword' || mode === 'combined') && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Keyword
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="e.g. AI automation"
                  className="w-full bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Min Search Volume
            </label>
            <input
              type="number"
              value={minVolumeInput}
              onChange={(e) => setMinVolumeInput(e.target.value)}
              placeholder="500"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500/40"
            />
          </div>

          <div className="sm:col-span-3 flex justify-between items-center gap-2 pt-1">
            {mode === 'subreddit' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Presets:</span>
                {domainConfig.presets.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSubredditInput(s);
                      // Preset clicks immediately commit + search
                      setCommittedParams(prev => ({ ...prev, subreddit: s }));
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all ${
                      s.toLowerCase() === subredditInput.toLowerCase()
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    r/{s}
                  </button>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all"
            >
              <TrendingUp className="h-3.5 w-3.5" /> Execute Target Search
            </button>
          </div>
        </form>
      </div>

      {/* ── Quota Fallback Warning ── */}
      {isMockData && threads.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>
            <strong>Quota Fallback Active.</strong> Ahrefs API quota is currently locked. Displaying seeded target opportunities for{' '}
            <span className="font-semibold text-slate-100">
              {committedParams.mode === 'keyword'
                ? `"${committedParams.keyword}"`
                : committedParams.mode === 'combined'
                ? `r/${committedParams.subreddit} + "${committedParams.keyword}"`
                : `r/${committedParams.subreddit}`}
            </span> aligned with{' '}
            <span className="font-semibold text-cyan-300">{activeDomain}</span>.
          </p>
        </div>
      )}

      {/* ── KPI Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#1f2430] bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Discovered Threads</p>
          <p className="text-lg font-bold text-slate-100 mono mt-0.5">{threads.length}</p>
        </div>
        <div className="rounded-lg border border-[#1f2430] bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Selected Threads</p>
          <p className="text-lg font-bold text-cyan-400 mono mt-0.5">{selectedThreadIds.size}</p>
        </div>
        <div className="rounded-lg border border-[#1f2430] bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Est. Total Traffic</p>
          <p className="text-lg font-bold text-slate-100 mono mt-0.5">{totalEstTraffic.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-[#1f2430] bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total Target Volume</p>
          <p className="text-lg font-bold text-slate-100 mono mt-0.5">{totalVolume.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Target Opportunities Data Grid ── */}
      <div className="data-card">
        <div className="data-card-header flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="subreddit-pill">Target Opportunities Grid</span>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200">Google SERP Reddit Thread Targets</h3>
          </div>

          {/* Bulk Action Bar */}
          {selectedThreadIds.size > 0 && (
            <button
              onClick={() => {
                const selectedThreads = threads.filter(t => selectedThreadIds.has(t.id));
                void pushThreadsToScraper(selectedThreads);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              Bulk Push to Scraper ({selectedThreadIds.size})
            </button>
          )}
        </div>

        <div className="data-card-body">
          {loading ? (
            <p className="text-xs text-slate-500 italic py-6">Searching Reddit SERP targets...</p>
          ) : threads.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-3">
              {quotaExhausted ? (
                <>
                  <p className="text-sm font-semibold text-amber-400">⚠️ Ahrefs API Quota Exhausted</p>
                  {committedParams.mode === 'keyword' ? (
                    <>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        No seed data available for keyword <span className="font-mono text-slate-200">"{committedParams.keyword}"</span> while the API quota is locked.
                      </p>
                      <p className="text-xs text-slate-500">
                        Try keywords with available seed data:&nbsp;
                        <span className="text-cyan-400 font-medium">sweepstakes casino · ChumbaCasino strategy · social slots · no deposit bonus</span>
                      </p>
                    </>
                  ) : committedParams.mode === 'combined' ? (
                    <>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        No seed data available for query <span className="font-mono text-slate-200">r/{committedParams.subreddit} + "{committedParams.keyword}"</span> while the API quota is locked.
                      </p>
                      <p className="text-xs text-slate-500">
                        Use a preset or keyword with available seed data.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        No seed data available for <span className="font-mono text-slate-200">r/{committedParams.subreddit}</span> while the API quota is locked.
                        Only pre-verified subreddits have reference threads during the lockout period.
                      </p>
                      <p className="text-xs text-slate-500">
                        Use a preset with available data:&nbsp;
                        <span className="text-cyan-400 font-medium">r/ChumbaCasino · r/sweepstakes · r/slots · r/socialcasino · r/onlinegambling</span>
                      </p>
                    </>
                  )}
                  <p className="text-xs text-slate-600 italic">Live search resumes after API reset on 2026-09-04.</p>
                </>
              ) : (
                <p className="text-xs text-slate-500 italic">No threads returned for this query.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)] text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="pb-2.5 pl-3 pr-2 w-10">
                      <button onClick={handleToggleSelectAll} className="text-slate-400 hover:text-slate-200">
                        {selectedThreadIds.size === threads.length ? (
                          <CheckSquare className="h-4 w-4 text-cyan-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="pb-2.5 pr-4">Reddit Thread Title & URL</th>
                    <th className="pb-2.5 px-3">Target Keyword</th>
                    <th className="pb-2.5 px-3">Search Volume</th>
                    <th className="pb-2.5 px-3">Est. Google Traffic</th>
                    <th className="pb-2.5 px-3">KD</th>
                    <th className="pb-2.5 px-3">Scrape Status</th>
                    <th className="pb-2.5 pl-3 pr-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {threads.map((t) => {
                    const isSelected = selectedThreadIds.has(t.id);
                    const isPushing = pushingIds.has(t.id);

                    return (
                      <tr
                        key={t.id}
                        className={`border-b border-[rgba(255,255,255,0.03)] transition-colors ${
                          isSelected ? 'bg-cyan-500/10' : 'hover:bg-[rgba(255,255,255,0.02)]'
                        }`}
                      >
                        <td className="py-3 pl-3 pr-2">
                          <button onClick={() => handleToggleSelectRow(t.id)} className="text-slate-400 hover:text-slate-200">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-cyan-400" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 pr-4 max-w-[280px]">
                          <p className="font-semibold text-slate-200 truncate" title={t.title}>
                            {t.title}
                          </p>
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline truncate max-w-full mt-0.5"
                          >
                            <Link className="h-3 w-3 shrink-0" />
                            <span className="truncate">{t.url.replace('https://www.reddit.com', 'reddit')}</span>
                            <ArrowUpRight className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-200">
                          {t.targetKeyword}
                        </td>
                        <td className={`py-3 px-3 mono font-bold ${volumeColor(t.searchVolume)}`}>
                          {t.searchVolume ? t.searchVolume.toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-3 mono text-slate-300">
                          {t.estTraffic ? t.estTraffic.toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${kdColor(t.keywordDifficulty)}`}>
                            {t.keywordDifficulty || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {t.scrapeStatus === 'Queued' ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                              Queued
                            </span>
                          ) : t.scrapeStatus === 'Scraped' ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                              Scraped
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-400 rounded border border-slate-700">
                              Unscraped
                            </span>
                          )}
                        </td>
                        <td className="py-3 pl-3 pr-3 text-right">
                          {t.scrapeStatus === 'Queued' ? (
                            <button
                              onClick={() => void removeThreadFromScraper(t)}
                              className="group/btn inline-flex items-center justify-center gap-1 w-[148px] whitespace-nowrap overflow-hidden px-3 py-1 rounded text-[11px] font-semibold transition-all bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 hover:bg-rose-950/80 hover:border-rose-500/50 hover:text-rose-300"
                            >
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400 group-hover/btn:hidden" />
                              <Trash2 className="h-3 w-3 shrink-0 text-rose-300 hidden group-hover/btn:block" />
                              <span className="group-hover/btn:hidden">✓ Added to Queue</span>
                              <span className="hidden group-hover/btn:inline">Remove from Queue</span>
                            </button>
                          ) : (
                            <button
                              disabled={isPushing}
                              onClick={() => void pushThreadsToScraper([t])}
                              className="inline-flex items-center justify-center gap-1 w-[148px] whitespace-nowrap overflow-hidden px-3 py-1 rounded text-[11px] font-semibold transition-all bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
                            >
                              <Send className="h-3 w-3 shrink-0" />
                              <span>🎯 Target This Thread</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
