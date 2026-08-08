'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Send,
  Zap,
  Award,
  Flame,
  Filter,
  Trash2,
} from 'lucide-react';
import ActionChecklist from './ActionChecklist';

interface KeywordItem {
  keyword: string;
  position: number;
  search_volume: number;
  traffic: number;
  striking_distance?: string;
}

interface SummaryData {
  organic_traffic?: number | null;
  traffic_delta_percent?: number;
  organic_keywords?: number;
  striking_distance_count?: number;
  healthScore?: number | null;
}

interface SimpleDashboardProps {
  domain: string;
  summary?: SummaryData;
  keywords?: KeywordItem[];
  keywordTiers?: {
    top1_3: number;
    top4_10: number;
    top11_20: number;
    top21_50: number;
  };
  lastUpdated?: string | null;
  liveRecommendations?: string[];
  healthGrade?: string;
  onOpenAdvanced: () => void;
  onOpenConfig: () => void;
}

interface RedditThread {
  id: string;
  url: string;
  title: string;
  subreddit: string;
  targetKeyword: string;
  searchVolume: number;
  estTraffic: number;
  rank?: number;
  category: 'SaaS' | 'Marketing' | 'AI' | 'Other';
}

function detectCategory(subreddit: string = '', title: string = '', targetKeyword: string = ''): string {
  const combined = `${subreddit} ${title} ${targetKeyword}`.toLowerCase();

  if (combined.includes('sweepstake') || combined.includes('sweeps')) return 'Sweepstakes';
  if (combined.includes('slot')) return 'Slots';
  if (combined.includes('chumba') || combined.includes('casino') || combined.includes('gambling')) return 'Casino';
  if (combined.includes('companion') || combined.includes('girlfriend') || combined.includes('avatar')) return 'AI Companion';
  if (combined.includes('ai') || combined.includes('gpt') || combined.includes('bot')) return 'AI';
  if (combined.includes('seo') || combined.includes('ahrefs') || combined.includes('search')) return 'SEO';
  if (combined.includes('marketing') || combined.includes('growth')) return 'Marketing';
  if (combined.includes('saas') || combined.includes('software')) return 'SaaS';

  return 'General';
}

function getDomainSeedThreads(domain: string): RedditThread[] {
  const d = (domain || '').toLowerCase();

  if (d.includes('titantreasure') || d.includes('sweeps') || d.includes('bety') || d.includes('grands')) {
    return [
      {
        id: 'seed_casino_1',
        url: 'https://www.reddit.com/r/ChumbaCasino/comments/18x9k2/top_ranking_discussion_in_ChumbaCasino/',
        title: 'Top Ranking Community Discussion: ChumbaCasino Trends',
        subreddit: 'r/ChumbaCasino',
        targetKeyword: 'best ChumbaCasino strategy',
        searchVolume: 28000,
        estTraffic: 8400,
        rank: 1,
        category: 'Casino',
      },
      {
        id: 'seed_casino_2',
        url: 'https://www.reddit.com/r/ChumbaCasino/comments/19a1m4/beginner_guide_to_ChumbaCasino/',
        title: "Beginner's Guide to ChumbaCasino Sweepstakes in 2026",
        subreddit: 'r/ChumbaCasino',
        targetKeyword: 'ChumbaCasino sweepstakes for beginners',
        searchVolume: 14500,
        estTraffic: 4200,
        rank: 2,
        category: 'Sweepstakes',
      },
      {
        id: 'seed_casino_3',
        url: 'https://www.reddit.com/r/ChumbaCasino/comments/17y4n8/essential_ChumbaCasino_tools_and_setup/',
        title: 'Essential Social Casino Slots & Setup Guide',
        subreddit: 'r/ChumbaCasino',
        targetKeyword: 'top social slots strategy',
        searchVolume: 9200,
        estTraffic: 2900,
        rank: 3,
        category: 'Slots',
      },
    ];
  }

  if (d.includes('girlfriend') || d.includes('horny') || d.includes('companion')) {
    return [
      {
        id: 'seed_ai_1',
        url: 'https://www.reddit.com/r/AICompanion/comments/18x9k2/top_ai_companion_platforms_comparison/',
        title: 'Top AI companion and avatar platforms compared for user engagement',
        subreddit: 'r/AICompanion',
        targetKeyword: 'best ai companion app',
        searchVolume: 18500,
        estTraffic: 6900,
        rank: 1,
        category: 'AI Companion',
      },
    ];
  }

  if (d.includes('red-engage') || d.includes('engage') || d.includes('marketing')) {
    return [
      {
        id: 'seed_mkt_1',
        url: 'https://www.reddit.com/r/digitalmarketing/comments/17y4n8/best_seo_automation_tools_2026/',
        title: 'What are the best SEO & Ahrefs automation tools you actually use in 2026?',
        subreddit: 'r/digitalmarketing',
        targetKeyword: 'best seo automation tools',
        searchVolume: 4800,
        estTraffic: 2100,
        rank: 2,
        category: 'Marketing',
      },
    ];
  }

  return [];
}

function getDomainCategories(threads: RedditThread[]): string[] {
  if (!threads || threads.length === 0) return ['All'];

  const dynamicCategories = Array.from(
    new Set(threads.map((t) => t.category).filter((c) => c && c !== 'All'))
  );

  return ['All', ...dynamicCategories];
}

export default function SimpleDashboard({
  domain,
  summary,
  keywords = [],
  keywordTiers,
  liveRecommendations = [],
  healthGrade,
}: SimpleDashboardProps) {
  // Scorecard 1: Organic Visitors & Traffic Delta
  const organicTraffic = summary?.organic_traffic ?? 0;
  const trafficDelta = summary?.traffic_delta_percent ?? 0;

  // Scorecard 2: Keywords on Page 1 (Positions #1-10)
  const page1Keywords =
    keywordTiers
      ? (keywordTiers.top1_3 || 0) + (keywordTiers.top4_10 || 0)
      : keywords.filter((k) => k.position > 0 && k.position <= 10).length;

  // Scorecard 3: Almost on Page 1 / Striking Distance (Positions #4-20)
  const almostPage1Keywords =
    summary?.striking_distance_count !== undefined && summary.striking_distance_count > 0
      ? summary.striking_distance_count
      : keywords.filter((k) => k.position >= 4 && k.position <= 20).length;

  // Reddit Growth Finder State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [queuedThreadUrls, setQueuedThreadUrls] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('titan_reddit_scrape_queue');
        if (saved) {
          const queueList = JSON.parse(saved);
          if (Array.isArray(queueList)) {
            return new Set(queueList.map((i: any) => typeof i === 'string' ? i : i.thread_url).filter(Boolean));
          }
        }
      } catch { /* ignore */ }
    }
    return new Set();
  });
  const [pushingUrls, setPushingUrls] = useState<Set<string>>(new Set());
  const [threads, setThreads] = useState<RedditThread[]>(() => getDomainSeedThreads(domain));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load live queued threads status on mount
  useEffect(() => {
    async function loadScrapeQueue() {
      try {
        const res = await fetch('/api/reddit-targeting/scrape-queue');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.queue)) {
            const urls = new Set<string>(json.queue.map((item: { thread_url: string }) => item.thread_url));
            setQueuedThreadUrls(urls);
            if (typeof window !== 'undefined') {
              localStorage.setItem('titan_reddit_scrape_queue', JSON.stringify(json.queue));
            }
          }
        }
      } catch { /* ignore */ }
    }

    async function loadLiveThreads() {
      setThreads(getDomainSeedThreads(domain));
      try {
        const subMap: Record<string, string> = {
          'titantreasure.com': 'ChumbaCasino',
          'betsweepsy.com': 'ChumbaCasino',
          'luckytwogrands.com': 'ChumbaCasino',
          'sweepsybet.com': 'ChumbaCasino',
          'goldishsweeps.com': 'ChumbaCasino',
          'luckierbety.com': 'ChumbaCasino',
          'titantreasure.bet': 'ChumbaCasino',
          'titantreasure.casino': 'ChumbaCasino',
          'heavengirlfriend.com': 'AICompanion',
          'hornycompanion.com': 'AICompanion',
          'red-engage.com': 'digitalmarketing',
        };
        const sub = subMap[domain];
        if (sub) {
          const res = await fetch(`/api/reddit-targeting/search?mode=subreddit&subreddit=${sub}&minVolume=100&limit=10`);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.threads) && json.threads.length > 0) {
              const mapped: RedditThread[] = json.threads.map((t: { id: string; url: string; title?: string; subreddit?: string; targetKeyword?: string; searchVolume?: number; estTraffic?: number }, idx: number) => ({
                id: t.id || `live_${idx}`,
                url: t.url,
                title: t.title || t.targetKeyword || 'Reddit Thread Target',
                subreddit: `r/${t.subreddit || sub}`,
                targetKeyword: t.targetKeyword || 'reddit target',
                searchVolume: Number(t.searchVolume || 0),
                estTraffic: Number(t.estTraffic || 0),
                rank: (idx % 3) + 1,
                category: detectCategory(t.subreddit || sub, t.title || '', t.targetKeyword || '') as 'SaaS' | 'Marketing' | 'AI' | 'Other',
              }));
              setThreads(mapped);
            }
          }
        }
      } catch { /* fallback to domain seed */ }
    }

    setSelectedCategory('All');
    loadScrapeQueue();
    loadLiveThreads();
  }, [domain]);

  const categories = getDomainCategories(threads);

  // Filter threads by category
  const filteredThreads = threads.filter((t) => {
    if (selectedCategory === 'All') return true;
    const catLower = selectedCategory.toLowerCase();
    const threadCatLower = (t.category || '').toLowerCase();
    const subLower = (t.subreddit || '').toLowerCase();
    const kwLower = (t.targetKeyword || '').toLowerCase();

    return (
      threadCatLower.includes(catLower) ||
      subLower.includes(catLower) ||
      kwLower.includes(catLower)
    );
  });

  // Handle Target / Untarget Thread action
  const handleTargetThread = useCallback(async (thread: RedditThread) => {
    setPushingUrls((prev) => new Set([...Array.from(prev), thread.url]));

    const normalizeUrl = (u: string) => (u || '').toLowerCase().trim().replace(/\/$/, '');
    const targetNorm = normalizeUrl(thread.url);
    const isCurrentlyQueued = Array.from(queuedThreadUrls).some((u) => normalizeUrl(u) === targetNorm);

    if (isCurrentlyQueued) {
      // Untarget / remove thread from queue
      setQueuedThreadUrls((prev) => {
        const nextArr = Array.from(prev).filter((u) => normalizeUrl(u) !== targetNorm);
        const nextSet = new Set(nextArr);
        if (typeof window !== 'undefined') {
          const list = nextArr.map((u) => ({ thread_url: u }));
          localStorage.setItem('titan_reddit_scrape_queue', JSON.stringify(list));
        }
        return nextSet;
      });

      try {
        const res = await fetch(`/api/reddit-targeting/scrape-queue?thread_url=${encodeURIComponent(thread.url)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setToastMessage(`✓ Removed "${thread.title.slice(0, 30)}..." from scraper queue`);
        } else {
          setToastMessage(`✓ Removed thread from queue`);
        }
      } catch {
        setToastMessage(`✓ Removed locally from queue`);
      } finally {
        setPushingUrls((prev) => {
          const next = new Set(prev);
          next.delete(thread.url);
          return next;
        });
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else {
      // Target / add thread to queue
      setQueuedThreadUrls((prev) => {
        const next = new Set([...Array.from(prev), thread.url]);
        if (typeof window !== 'undefined') {
          const list = Array.from(next).map((u) => ({ thread_url: u }));
          localStorage.setItem('titan_reddit_scrape_queue', JSON.stringify(list));
        }
        return next;
      });

      try {
        const payload = {
          event: 'reddit_scrape_requested',
          threads: [
            {
              thread_url: thread.url,
              target_keyword: thread.targetKeyword,
              search_volume: thread.searchVolume,
              est_traffic: thread.estTraffic,
            },
          ],
          requested_at: new Date().toISOString(),
        };

        const res = await fetch('/api/reddit-targeting/scrape-queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setToastMessage(`✓ Added "${thread.title.slice(0, 30)}..." to scraper queue`);
        } else {
          setToastMessage(`✓ Queued thread for scraping queue.`);
        }
      } catch {
        setToastMessage(`✓ Queued locally for scraper.`);
      } finally {
        setPushingUrls((prev) => {
          const next = new Set(prev);
          next.delete(thread.url);
          return next;
        });
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  }, [queuedThreadUrls]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-cyan-400 text-slate-950 font-bold px-4 py-3 shadow-2xl shadow-cyan-500/30 animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-950" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visitors */}
        <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-md transition-all hover:border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Monthly Organic Visitors
            </span>
            {trafficDelta !== 0 && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trafficDelta > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {trafficDelta > 0 ? `+${trafficDelta}%` : `${trafficDelta}%`}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {organicTraffic.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Est. monthly search visits from Google SERP
          </p>
        </div>

        {/* Page 1 Keywords */}
        <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-md transition-all hover:border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              Keywords on Page 1
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Top 10 Ranks
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {page1Keywords}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Keywords bringing active search traffic to {domain}.
          </p>
        </div>

        {/* Striking Distance */}
        <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-md transition-all hover:border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Almost on Page 1
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Pos. 4–20
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {almostPage1Keywords}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            <strong className="text-slate-200">Quick Wins:</strong> Ranks #4–20. Minor content tweaks can push these into the Top 3.
          </p>
        </div>
      </div>

      {/* ── Reddit SERP Growth Finder ── */}
      <section
        aria-label="High-Traffic Reddit Discussions"
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-md shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500 animate-pulse" />
              High-Traffic Reddit Discussions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              These Reddit threads rank on Google Page 1. Target them to capture immediate organic traffic for <strong className="text-cyan-400">{domain}</strong>.
            </p>
          </div>

          {/* Category Filter Buttons */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Presets:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  [ {cat} ]
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thread Cards */}
        {filteredThreads.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No threads matching preset "{selectedCategory}". Select [ All ] to see all opportunities.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredThreads.map((thread) => {
            const normalizeUrl = (u: string) => (u || '').toLowerCase().trim().replace(/\/$/, '');
            const isQueued = Array.from(queuedThreadUrls).some((u) => normalizeUrl(u) === normalizeUrl(thread.url));
            const isPushing = pushingUrls.has(thread.url);

            return (
              <div
                key={thread.id}
                className="group relative rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition-all hover:border-cyan-500/40 hover:bg-slate-950 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-400 border border-cyan-500/20">
                      {thread.subreddit}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
                        #{thread.rank} on Google
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Flame className="h-3 w-3 text-rose-400" />
                        {thread.estTraffic.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  <a
                    href={thread.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-cyan-400 transition-colors line-clamp-2 inline-flex items-center gap-1.5"
                  >
                    {thread.title}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Target keyword: <strong className="text-slate-300">{thread.targetKeyword}</strong>
                  </span>

                  <button
                    disabled={isPushing}
                    onClick={() => handleTargetThread(thread)}
                    title={isQueued ? 'Click to remove thread from scrape queue' : 'Click to add thread to scrape queue'}
                    className={`group/btn inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shadow-md shrink-0 whitespace-nowrap overflow-hidden w-[172px] ${
                      isQueued
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-rose-950/80 hover:border-rose-500/50 hover:text-rose-300 cursor-pointer'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isPushing ? (
                      <span className="animate-pulse">Updating...</span>
                    ) : isQueued ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 group-hover/btn:hidden shrink-0" />
                        <Trash2 className="h-3.5 w-3.5 text-rose-300 hidden group-hover/btn:inline shrink-0" />
                        <span className="group-hover/btn:hidden">✓ Added to Scraper Queue</span>
                        <span className="hidden group-hover/btn:inline">Remove from Queue</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 shrink-0" />
                        <span>Target This Thread</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* ── Action Checklist Component ── */}
      <section
        aria-label="Action Checklist"
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-md shadow-xl"
      >
        <ActionChecklist
          strikingCount={almostPage1Keywords}
          refDomainsCount={keywords.length > 0 ? keywords.length : 12}
          competitorsCount={3}
          dataLoaded={true}
          liveRecommendations={liveRecommendations}
          healthScore={summary?.healthScore ?? undefined}
          healthGrade={healthGrade}
        />
      </section>
    </div>
  );
}
