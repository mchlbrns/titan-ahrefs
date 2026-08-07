'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, AlertTriangle, Lock, ArrowUpRight, Link, Globe } from 'lucide-react';

interface RedditThread {
  url: string;
  topKeyword: string;
  topKeywordVolume: number;
  organicTraffic: number;
  urlRating: number;
  rankingKeywords: number;
  traffic?: number;
  keywordsCount?: number;
}

interface RedditKeyword {
  keyword: string;
  position: number;
  searchVolume: number;
  keywordDifficulty: number;
  estimatedTraffic: number;
  searchIntent: string;
  volume?: number;
  traffic?: number;
}

interface RedditTargetingPanelProps {
  selectedDomain?: string;
}

const DOMAIN_PRESETS: Record<string, { defaultSub: string; presets: string[]; label: string }> = {
  'heavengirlfriend.com': {
    label: 'AI Companion & Gaming Platform',
    defaultSub: 'AICompanion',
    presets: ['AICompanion', 'SoulmateAI', 'CharacterAI', 'Replika', 'virtualgf'],
  },
  'hornycompanion.com': {
    label: 'Adult Entertainment Directory',
    defaultSub: 'AICompanion',
    presets: ['AICompanion', 'NSFWAI', 'virtualgf', 'CharacterAI', 'Replika'],
  },
  'red-engage.com': {
    label: 'Engagement & Content Platform',
    defaultSub: 'digitalmarketing',
    presets: ['digitalmarketing', 'SEO', 'contentmarketing', 'growthhacking', 'B2Bmarketing'],
  },
};

const DEFAULT_CONFIG = {
  label: 'Managed Portfolio Target',
  defaultSub: 'AICompanion',
  presets: ['AICompanion', 'digitalmarketing', 'SEO', 'CharacterAI'],
};

const volumeColor = (v: number): string =>
  v >= 20000 ? 'text-rose-400' : v >= 10000 ? 'text-amber-400' : v >= 1000 ? 'text-emerald-400' : 'text-slate-500';

const kdColor = (d: number): string =>
  d > 60 ? 'text-rose-400' : d > 30 ? 'text-amber-400' : 'text-emerald-400';

export default function RedditTargetingPanel({ selectedDomain }: RedditTargetingPanelProps) {
  const activeDomain = selectedDomain || 'red-engage.com';
  const domainConfig = DOMAIN_PRESETS[activeDomain] || DEFAULT_CONFIG;

  const [subreddit, setSubreddit] = useState(domainConfig.defaultSub);
  const [input, setInput] = useState(domainConfig.defaultSub);
  const [threads, setThreads] = useState<RedditThread[]>([]);
  const [keywords, setKeywords] = useState<RedditKeyword[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [isMockThreads, setIsMockThreads] = useState(false);
  const [isMockKeywords, setIsMockKeywords] = useState(false);

  // Sync subreddit presets when selected domain changes
  useEffect(() => {
    const config = DOMAIN_PRESETS[activeDomain] || DEFAULT_CONFIG;
    setSubreddit(config.defaultSub);
    setInput(config.defaultSub);
  }, [activeDomain]);

  const fetchThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const res = await fetch(
        `/api/reddit/threads?subreddit=${encodeURIComponent(subreddit)}&minVolume=1000&limit=50`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setThreads(Array.isArray(json.threads) ? json.threads : []);
      setIsMockThreads(Boolean(json.isMockData));
    } catch {
      setThreads([]);
      setIsMockThreads(true);
    } finally {
      setLoadingThreads(false);
    }
  }, [subreddit]);

  const fetchKeywords = useCallback(async () => {
    setLoadingKeywords(true);
    try {
      const res = await fetch(
        `/api/reddit/keywords?subreddit=${encodeURIComponent(subreddit)}&minVolume=500&maxPosition=20&limit=100`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setKeywords(Array.isArray(json.keywords) ? json.keywords : []);
      setIsMockKeywords(Boolean(json.isMockData));
    } catch {
      setKeywords([]);
      setIsMockKeywords(true);
    } finally {
      setLoadingKeywords(false);
    }
  }, [subreddit]);

  useEffect(() => {
    void fetchThreads();
    void fetchKeywords();
  }, [fetchThreads, fetchKeywords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.trim().replace(/^r\//, '').replace(/\s+/g, '').toLowerCase();
    if (!clean) return;
    setSubreddit(clean);
  };

  const threadVol = (t: RedditThread) => Number(t.topKeywordVolume) || 0;
  const threadTraffic = (t: RedditThread) => Number(t.organicTraffic || t.traffic) || 0;
  const kwVol = (k: RedditKeyword) => Number(k.searchVolume ?? k.volume) || 0;
  const kwTraffic = (k: RedditKeyword) => Number(k.estimatedTraffic ?? k.traffic) || 0;

  const totalThreadTraffic = threads.reduce((acc, t) => acc + threadTraffic(t), 0);
  const topKeyword = keywords.length > 0 ? keywords[0] : null;

  return (
    <div className="space-y-4">
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
          Analyzing Reddit organic opportunities for <strong className="text-cyan-300">{activeDomain}</strong>
        </div>
      </div>

      {/* ── Subreddit search & presets ── */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 px-1">
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <div className="flex-1">
              <label htmlFor="subreddit-input" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Subreddit for {activeDomain}
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 focus-within:border-cyan-500/40 transition-colors">
                <span className="text-cyan-400 font-bold text-sm shrink-0">r/</span>
                <input
                  id="subreddit-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={domainConfig.defaultSub}
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                />
              </div>
            </div>
            <button
              type="submit"
              className="self-end inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all whitespace-nowrap"
            >
              <TrendingUp className="h-3.5 w-3.5" /> Analyze Subreddit
            </button>
          </form>
        </div>

        {/* ── Niche Presets ── */}
        <div className="flex items-center gap-2 flex-wrap px-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Niche Suggestions:</span>
          {domainConfig.presets.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); setSubreddit(s); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                s.toLowerCase() === subreddit.toLowerCase()
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              r/{s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Quota warning ── */}
      {(isMockThreads || isMockKeywords) && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>
            <strong>Quota Fallback Active.</strong> Ahrefs API limit reached. Showing tailored niche sample targeting data for{' '}
            <span className="font-semibold text-slate-100">r/{subreddit}</span> aligned with{' '}
            <span className="font-semibold text-cyan-300">{activeDomain}</span>. Live stream will re-engage upon key refresh.
          </p>
        </div>
      )}

      {/* ── KPI mini-strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#1f2430] bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Threads</p>
          <p className="text-lg font-bold text-slate-100 mono mt-0.5">{threads.length}</p>
        </div>
        <div className="rounded-lg border border-[#1f2430] bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Target Keywords</p>
          <p className="text-lg font-bold text-slate-100 mono mt-0.5">{keywords.length}</p>
        </div>
        <div className="rounded-lg border border-[#1f2430] bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Est. Thread Traffic</p>
          <p className="text-lg font-bold text-slate-100 mono mt-0.5">{totalThreadTraffic.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-[#1f2430] bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Top KW Volume</p>
          <p className={`text-lg font-bold mono mt-0.5 ${topKeyword ? volumeColor(kwVol(topKeyword)) : 'text-slate-600'}`}>
            {topKeyword ? kwVol(topKeyword).toLocaleString() : '—'}
          </p>
        </div>
      </div>

      {/* ── Threads card ── */}
      <div className="data-card">
        <div className="data-card-header flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="subreddit-pill">r/{subreddit}</span>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200">Top Ranking Threads on Google</h3>
          </div>
          {isMockThreads && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400/80">
              <Lock className="h-3 w-3" /> sample mode
            </span>
          )}
        </div>
        <div className="data-card-body">
          {loadingThreads ? (
            <p className="text-xs text-slate-500 italic py-4">Analyzing r/{subreddit} threads...</p>
          ) : threads.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No threads returned for r/{subreddit}.</p>
          ) : (
            <div className="space-y-2">
              {threads.map((t, idx) => (
                <a
                  key={idx}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-800/70 bg-slate-900/40 hover:bg-slate-900/70 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-600">{String(idx + 1).padStart(2, '0')}</span>
                      <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                        {t.topKeyword}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-slate-500">
                      <Link className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[280px]">{t.url.replace('https://reddit.com', 'reddit')}</span>
                      <span className="text-slate-600">·</span>
                      <span>UR <strong className={t.urlRating >= 20 ? 'text-cyan-300' : 'text-slate-300'}>{t.urlRating}</strong></span>
                      <span className="text-slate-600">·</span>
                      <span>ranks {t.rankingKeywords || t.keywordsCount || 0} kws</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold mono ${volumeColor(threadVol(t))}`}>
                      {threadVol(t) ? threadVol(t).toLocaleString() : '—'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{threadTraffic(t) ? threadTraffic(t).toLocaleString() : ''} trf</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0 self-center" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Keywords card ── */}
      <div className="data-card">
        <div className="data-card-header flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="subreddit-pill violet">r/{subreddit}</span>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200">Target Keywords (Positions 1–20)</h3>
          </div>
          {isMockKeywords && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400/80">
              <Lock className="h-3 w-3" /> sample mode
            </span>
          )}
        </div>
        <div className="data-card-body">
          {loadingKeywords ? (
            <p className="text-xs text-slate-500 italic py-4">Fetching target keywords…</p>
          ) : keywords.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No keywords for r/{subreddit}.</p>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="pb-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Keyword</th>
                    <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Pos</th>
                    <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Volume</th>
                    <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">KD</th>
                    <th className="pb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Intent</th>
                    <th className="pb-2 pl-4 text-[10px] font-semibold uppercase tracking-wider text-slate-600 text-right">Traffic</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((k, idx) => (
                    <tr key={idx} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-slate-200">{k.keyword}</div>
                      </td>
                      <td className="py-2 px-4 font-bold text-cyan-300 mono">#{k.position}</td>
                      <td className={`py-2 px-4 mono ${volumeColor(kwVol(k))}`}>
                        {kwVol(k).toLocaleString()}
                      </td>
                      <td className="py-2 px-4">
                        <span className={`text-xs font-semibold ${kdColor(k.keywordDifficulty)}`}>{k.keywordDifficulty || '—'}</span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-800/80 text-indigo-300 rounded border border-indigo-500/20">
                          {k.searchIntent || 'Mixed'}
                        </span>
                      </td>
                      <td className="py-2 pl-4 text-right text-slate-300 font-medium mono">
                        {kwTraffic(k).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
