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

function generateMockThreads(mode: string, keyword: string, subreddit: string): TargetThreadItem[] {
  const cleanKw = keyword.trim() || 'AI companion';
  const cleanSub = subreddit.trim().replace(/^r\//, '') || 'AICompanion';

  if (mode === 'keyword') {
    return [
      {
        id: `kw_1_${cleanKw}`,
        url: `https://www.reddit.com/r/technology/comments/18x9k2/best_${cleanKw.replace(/\s+/g, '_')}_guide_2026/`,
        title: `Comprehensive Guide: Best ${cleanKw} Solutions in 2026`,
        subreddit: 'technology',
        targetKeyword: cleanKw,
        searchVolume: 24500,
        estTraffic: 7200,
        keywordDifficulty: 28,
        urlRating: 42,
        scrapeStatus: 'Unscraped'
      },
      {
        id: `kw_2_${cleanKw}`,
        url: `https://www.reddit.com/r/SaaS/comments/19a1m4/top_rated_${cleanKw.replace(/\s+/g, '_')}_tools/`,
        title: `Top Rated ${cleanKw} Platforms Compared`,
        subreddit: 'SaaS',
        targetKeyword: `best ${cleanKw} app`,
        searchVolume: 18200,
        estTraffic: 4800,
        keywordDifficulty: 22,
        urlRating: 35,
        scrapeStatus: 'Unscraped'
      },
      {
        id: `kw_3_${cleanKw}`,
        url: `https://www.reddit.com/r/digitalmarketing/comments/17y4n8/how_to_optimize_${cleanKw.replace(/\s+/g, '_')}/`,
        title: `How to Optimize ${cleanKw} for Organic Growth`,
        subreddit: 'digitalmarketing',
        targetKeyword: `${cleanKw} tutorial`,
        searchVolume: 12000,
        estTraffic: 3100,
        keywordDifficulty: 19,
        urlRating: 29,
        scrapeStatus: 'Unscraped'
      },
      {
        id: `kw_4_${cleanKw}`,
        url: `https://www.reddit.com/r/SEO/comments/16z3p9/${cleanKw.replace(/\s+/g, '_')}_mistakes_to_avoid/`,
        title: `Common ${cleanKw} Mistakes & Misconceptions`,
        subreddit: 'SEO',
        targetKeyword: `${cleanKw} platform`,
        searchVolume: 8900,
        estTraffic: 1900,
        keywordDifficulty: 15,
        urlRating: 24,
        scrapeStatus: 'Unscraped'
      }
    ];
  }

  if (mode === 'subreddit') {
    return [
      {
        id: `sub_1_${cleanSub}`,
        url: `https://www.reddit.com/r/${cleanSub}/comments/18x9k2/top_ranking_discussion_in_${cleanSub}/`,
        title: `Top Ranking Community Discussion: ${cleanSub} Trends`,
        subreddit: cleanSub,
        targetKeyword: `best ${cleanSub} strategy`,
        searchVolume: 28000,
        estTraffic: 8400,
        keywordDifficulty: 32,
        urlRating: 38,
        scrapeStatus: 'Unscraped'
      },
      {
        id: `sub_2_${cleanSub}`,
        url: `https://www.reddit.com/r/${cleanSub}/comments/19a1m4/beginner_guide_to_${cleanSub}/`,
        title: `Beginner's Guide to ${cleanSub} in 2026`,
        subreddit: cleanSub,
        targetKeyword: `${cleanSub} for beginners`,
        searchVolume: 14500,
        estTraffic: 4200,
        keywordDifficulty: 24,
        urlRating: 31,
        scrapeStatus: 'Unscraped'
      },
      {
        id: `sub_3_${cleanSub}`,
        url: `https://www.reddit.com/r/${cleanSub}/comments/17y4n8/essential_${cleanSub}_tools_and_setup/`,
        title: `Essential ${cleanSub} Tools & Setup Guide`,
        subreddit: cleanSub,
        targetKeyword: `top ${cleanSub} tools`,
        searchVolume: 9200,
        estTraffic: 2900,
        keywordDifficulty: 18,
        urlRating: 25,
        scrapeStatus: 'Unscraped'
      }
    ];
  }

  // Combined Mode
  return [
    {
      id: `comb_1_${cleanSub}_${cleanKw}`,
      url: `https://www.reddit.com/r/${cleanSub}/comments/18x9k2/${cleanKw.replace(/\s+/g, '_')}_in_${cleanSub}/`,
      title: `Deep Dive: ${cleanKw} inside r/${cleanSub}`,
      subreddit: cleanSub,
      targetKeyword: `${cleanKw} in r/${cleanSub}`,
      searchVolume: 19500,
      estTraffic: 6100,
      keywordDifficulty: 26,
      urlRating: 36,
      scrapeStatus: 'Unscraped'
    },
    {
      id: `comb_2_${cleanSub}_${cleanKw}`,
      url: `https://www.reddit.com/r/${cleanSub}/comments/19a1m4/best_${cleanKw.replace(/\s+/g, '_')}_tactics/`,
      title: `Best ${cleanKw} Tactics Recommended by r/${cleanSub} Users`,
      subreddit: cleanSub,
      targetKeyword: `best ${cleanKw} ${cleanSub}`,
      searchVolume: 11400,
      estTraffic: 3500,
      keywordDifficulty: 21,
      urlRating: 28,
      scrapeStatus: 'Unscraped'
    }
  ];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'subreddit'; // 'keyword' | 'subreddit' | 'combined'
  const keyword = (searchParams.get('keyword') || '').trim();
  const subreddit = (searchParams.get('subreddit') || '').trim().replace(/^r\//, '');
  const minVolume = parseInt(searchParams.get('minVolume') || '500', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const logger = new Logger({ context: 'RedditTargetingSearchRoute' });

  try {
    const client = new AhrefsClient({ logger, mockFallback: true });

    let target = 'reddit.com';
    if (mode === 'subreddit' || (mode === 'combined' && subreddit)) {
      target = `reddit.com/r/${subreddit || 'AICompanion'}`;
    }

    const report = await client.fetchRedditThreads(subreddit || 'AICompanion', { minVolume, limit });

    if (report.threads.length === 0) {
      const mockThreads = generateMockThreads(mode, keyword, subreddit);
      return NextResponse.json({
        mode,
        target,
        keyword,
        subreddit,
        totalThreads: mockThreads.length,
        threads: mockThreads,
        timestamp: new Date().toISOString(),
        isMockData: true
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
      scrapeStatus: 'Unscraped'
    }));

    return NextResponse.json({
      mode,
      target,
      keyword,
      subreddit,
      totalThreads: targetThreads.length,
      threads: targetThreads,
      timestamp: new Date().toISOString(),
      isMockData: false
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to execute Reddit targeting search';
    logger.error('Reddit targeting search route error', { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
