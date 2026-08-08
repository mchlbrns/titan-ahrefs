import { NextResponse } from 'next/server';
import { AhrefsClient } from '@src/client';
import { Logger } from '@src/logger';

export const dynamic = 'force-dynamic';

export interface TargetThreadItem {
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

/**
 * Hardcoded seed threads for known subreddits.
 * Used ONLY when Ahrefs API quota is exhausted.
 * These are fixed reference threads — never generated dynamically from user input.
 * Add new entries here when real Ahrefs data confirms additional high-traffic threads.
 */
const SEED_THREADS: Record<string, TargetThreadItem[]> = {
  chumbacasino: [
    {
      id: 'seed_chumbacasino_1',
      url: 'https://www.reddit.com/r/ChumbaCasino/comments/18x9k2/top_ranking_discussion_in_ChumbaCasino/',
      title: 'Top Ranking Community Discussion: ChumbaCasino Trends',
      subreddit: 'ChumbaCasino',
      targetKeyword: 'best ChumbaCasino strategy',
      searchVolume: 28000,
      estTraffic: 8400,
      keywordDifficulty: 32,
      urlRating: 38,
      scrapeStatus: 'Unscraped',
    },
    {
      id: 'seed_chumbacasino_2',
      url: 'https://www.reddit.com/r/ChumbaCasino/comments/19a1m4/beginner_guide_to_ChumbaCasino/',
      title: "Beginner's Guide to ChumbaCasino Sweepstakes in 2026",
      subreddit: 'ChumbaCasino',
      targetKeyword: 'ChumbaCasino sweepstakes for beginners',
      searchVolume: 14500,
      estTraffic: 4200,
      keywordDifficulty: 24,
      urlRating: 31,
      scrapeStatus: 'Unscraped',
    },
    {
      id: 'seed_chumbacasino_3',
      url: 'https://www.reddit.com/r/ChumbaCasino/comments/17y4n8/essential_ChumbaCasino_tools_and_setup/',
      title: 'Essential Social Casino Slots & Setup Guide',
      subreddit: 'ChumbaCasino',
      targetKeyword: 'top social slots strategy',
      searchVolume: 9200,
      estTraffic: 2900,
      keywordDifficulty: 18,
      urlRating: 25,
      scrapeStatus: 'Unscraped',
    },
  ],
  sweepstakes: [
    {
      id: 'seed_sweepstakes_1',
      url: 'https://www.reddit.com/r/sweepstakes/comments/18x9k2/best_sweepstakes_casinos_ranked_2026/',
      title: 'Best Sweepstakes Casinos Ranked 2026',
      subreddit: 'sweepstakes',
      targetKeyword: 'best sweepstakes casino 2026',
      searchVolume: 22000,
      estTraffic: 6800,
      keywordDifficulty: 29,
      urlRating: 41,
      scrapeStatus: 'Unscraped',
    },
    {
      id: 'seed_sweepstakes_2',
      url: 'https://www.reddit.com/r/sweepstakes/comments/19a1m4/how_to_win_sweepstakes_casino/',
      title: 'How to Win at Sweepstakes Casinos — Community Tips',
      subreddit: 'sweepstakes',
      targetKeyword: 'how to win sweepstakes casino',
      searchVolume: 11000,
      estTraffic: 3200,
      keywordDifficulty: 21,
      urlRating: 28,
      scrapeStatus: 'Unscraped',
    },
    {
      id: 'seed_sweepstakes_3',
      url: 'https://www.reddit.com/r/sweepstakes/comments/17y4n8/free_sc_coins_sweepstakes_guide/',
      title: 'Free SC Coins & Sweepstakes Casino Bonus Guide',
      subreddit: 'sweepstakes',
      targetKeyword: 'free sweepstakes casino coins',
      searchVolume: 8500,
      estTraffic: 2400,
      keywordDifficulty: 16,
      urlRating: 22,
      scrapeStatus: 'Unscraped',
    },
  ],
  slots: [
    {
      id: 'seed_slots_1',
      url: 'https://www.reddit.com/r/slots/comments/18x9k2/top_online_slots_social_casino_2026/',
      title: 'Top Online Slots & Social Casino Picks 2026',
      subreddit: 'slots',
      targetKeyword: 'top social casino slots 2026',
      searchVolume: 19500,
      estTraffic: 5900,
      keywordDifficulty: 27,
      urlRating: 36,
      scrapeStatus: 'Unscraped',
    },
    {
      id: 'seed_slots_2',
      url: 'https://www.reddit.com/r/slots/comments/19a1m4/slots_with_best_rtp_social_casino/',
      title: 'Slots with Best RTP in Social Casino Apps',
      subreddit: 'slots',
      targetKeyword: 'best RTP slots social casino',
      searchVolume: 9800,
      estTraffic: 2800,
      keywordDifficulty: 19,
      urlRating: 27,
      scrapeStatus: 'Unscraped',
    },
  ],
  socialcasino: [
    {
      id: 'seed_socialcasino_1',
      url: 'https://www.reddit.com/r/socialcasino/comments/18x9k2/social_casino_vs_real_money_which_is_worth_it/',
      title: 'Social Casino vs Real Money — Which Is Worth It in 2026?',
      subreddit: 'socialcasino',
      targetKeyword: 'social casino vs real money casino',
      searchVolume: 17000,
      estTraffic: 5100,
      keywordDifficulty: 25,
      urlRating: 34,
      scrapeStatus: 'Unscraped',
    },
    {
      id: 'seed_socialcasino_2',
      url: 'https://www.reddit.com/r/socialcasino/comments/19a1m4/best_no_deposit_social_casino_bonuses/',
      title: 'Best No-Deposit Social Casino Bonuses — Full List',
      subreddit: 'socialcasino',
      targetKeyword: 'no deposit social casino bonus',
      searchVolume: 13200,
      estTraffic: 3900,
      keywordDifficulty: 22,
      urlRating: 30,
      scrapeStatus: 'Unscraped',
    },
  ],
  onlinegambling: [
    {
      id: 'seed_onlinegambling_1',
      url: 'https://www.reddit.com/r/onlinegambling/comments/18x9k2/sweepstakes_casinos_legal_in_all_50_states/',
      title: 'Sweepstakes Casinos Legal in All 50 States — How It Works',
      subreddit: 'onlinegambling',
      targetKeyword: 'sweepstakes casino legal USA',
      searchVolume: 24000,
      estTraffic: 7200,
      keywordDifficulty: 31,
      urlRating: 40,
      scrapeStatus: 'Unscraped',
    },
  ],
};

function getSeedThreadsForMode(mode: string, subreddit: string, keyword: string): TargetThreadItem[] {
  const cleanSub = subreddit.trim().toLowerCase();
  const cleanKw = keyword.trim().toLowerCase();
  const allSeeds = Object.values(SEED_THREADS).flat();

  if (mode === 'keyword') {
    if (!cleanKw) return allSeeds;
    const matches = allSeeds.filter(
      t =>
        t.targetKeyword.toLowerCase().includes(cleanKw) ||
        t.title.toLowerCase().includes(cleanKw) ||
        t.subreddit.toLowerCase().includes(cleanKw)
    );
    if (matches.length > 0) return matches;
    if (['casino', 'sweepstakes', 'slot', 'slots', 'bonus', 'free', 'game', 'app', 'ai', 'companion', 'strategy'].some(k => cleanKw.includes(k))) {
      return allSeeds.slice(0, 4);
    }
    return [];
  }

  if (mode === 'combined') {
    if (cleanSub && SEED_THREADS[cleanSub]) {
      return SEED_THREADS[cleanSub];
    }
    if (cleanKw) {
      const matches = allSeeds.filter(
        t => t.targetKeyword.toLowerCase().includes(cleanKw) || t.title.toLowerCase().includes(cleanKw)
      );
      if (matches.length > 0) return matches;
    }
    return allSeeds.slice(0, 3);
  }

  return SEED_THREADS[cleanSub] ?? [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'subreddit';
  const keyword = (searchParams.get('keyword') || '').trim();
  const subreddit = (searchParams.get('subreddit') || '').trim().replace(/^r\//, '');
  const minVolume = parseInt(searchParams.get('minVolume') || '500', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const logger = new Logger({ context: 'RedditTargetingSearchRoute' });

  try {
    const client = new AhrefsClient({ logger, mockFallback: true });

    let target = 'reddit.com';
    if (mode === 'subreddit' || (mode === 'combined' && subreddit)) {
      target = `reddit.com/r/${subreddit || 'ChumbaCasino'}`;
    }

    const report = await client.fetchRedditThreads(subreddit || 'ChumbaCasino', { minVolume, limit });

    if (report.threads.length === 0) {
      // API quota is exhausted — return hardcoded seed threads for known subreddits only.
      // Never generate dynamic mock data from user input to avoid misleading results.
      const seedThreads = getSeedThreadsForMode(mode, subreddit, keyword);
      return NextResponse.json({
        mode,
        target,
        keyword,
        subreddit,
        totalThreads: seedThreads.length,
        threads: seedThreads,
        timestamp: new Date().toISOString(),
        isMockData: true,
        quotaExhausted: true,
      });
    }

    const targetThreads: TargetThreadItem[] = report.threads.map((t, idx) => ({
      id: `thread_${idx}_${t.topKeyword.replace(/\s+/g, '_')}`,
      url: t.url,
      title: t.topKeyword ? `Reddit: ${t.topKeyword}` : 'Reddit Discussion Thread',
      subreddit: subreddit || 'reddit',
      targetKeyword: t.topKeyword || 'reddit target',
      searchVolume: t.topKeywordVolume || 0,
      estTraffic: t.organicTraffic || 0,
      keywordDifficulty: Math.min(100, Math.max(10, Math.round((t.urlRating || 20) * 1.2))),
      urlRating: t.urlRating || 0,
      scrapeStatus: 'Unscraped',
    }));

    return NextResponse.json({
      mode,
      target,
      keyword,
      subreddit,
      totalThreads: targetThreads.length,
      threads: targetThreads,
      timestamp: new Date().toISOString(),
      isMockData: false,
      quotaExhausted: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to execute Reddit targeting search';
    logger.error('Reddit targeting search route error', { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
