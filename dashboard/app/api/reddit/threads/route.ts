import { NextResponse } from 'next/server';
import { AhrefsClient } from '@src/client';
import { Logger } from '@src/logger';

export const dynamic = 'force-dynamic';

function getSampleThreads(subreddit: string) {
  const s = subreddit.toLowerCase();
  if (['aicompanion', 'soulmateai', 'characterai', 'replika', 'virtualgf', 'nsfwai'].some(k => s.includes(k))) {
    return [
      {
        url: `https://reddit.com/r/${subreddit}/comments/18x9k2/best_ai_companion_apps_2026_guide`,
        topKeyword: 'best ai companion app',
        topKeywordVolume: 28500,
        traffic: 8400,
        urlRating: 34,
        keywordsCount: 142
      },
      {
        url: `https://reddit.com/r/${subreddit}/comments/19a1m4/character_ai_alternatives_no_filter`,
        topKeyword: 'character ai alternative',
        topKeywordVolume: 45000,
        traffic: 12200,
        urlRating: 41,
        keywordsCount: 210
      },
      {
        url: `https://reddit.com/r/${subreddit}/comments/17y4n8/virtual_girlfriend_app_comparison`,
        topKeyword: 'virtual girlfriend app free',
        topKeywordVolume: 18200,
        traffic: 5100,
        urlRating: 28,
        keywordsCount: 95
      },
      {
        url: `https://reddit.com/r/${subreddit}/comments/16z3p9/top_rated_ai_chat_platforms_review`,
        topKeyword: 'ai chatbot girlfriend online',
        topKeywordVolume: 12500,
        traffic: 3400,
        urlRating: 22,
        keywordsCount: 68
      },
      {
        url: `https://reddit.com/r/${subreddit}/comments/15k8r2/replika_vs_soulmate_vs_heavengirlfriend`,
        topKeyword: 'top ai companion chat',
        topKeywordVolume: 8900,
        traffic: 2100,
        urlRating: 19,
        keywordsCount: 44
      }
    ];
  }

  if (['digitalmarketing', 'seo', 'contentmarketing', 'growthhacking', 'b2bmarketing'].some(k => s.includes(k))) {
    return [
      {
        url: `https://reddit.com/r/${subreddit}/comments/18x9k2/best_seo_strategies_for_content_platforms`,
        topKeyword: 'best seo strategy for platforms',
        topKeywordVolume: 24000,
        traffic: 7200,
        urlRating: 36,
        keywordsCount: 130
      },
      {
        url: `https://reddit.com/r/${subreddit}/comments/19a1m4/organic_traffic_growth_tactics_2026`,
        topKeyword: 'organic traffic growth tactics',
        topKeywordVolume: 16500,
        traffic: 4800,
        urlRating: 29,
        keywordsCount: 98
      },
      {
        url: `https://reddit.com/r/${subreddit}/comments/17y4n8/content_engagement_optimization_guide`,
        topKeyword: 'content engagement optimization',
        topKeywordVolume: 11200,
        traffic: 3200,
        urlRating: 25,
        keywordsCount: 74
      },
      {
        url: `https://reddit.com/r/${subreddit}/comments/16z3p9/growth_hacking_tools_for_acquisitions`,
        topKeyword: 'growth hacking platforms',
        topKeywordVolume: 7800,
        traffic: 2100,
        urlRating: 20,
        keywordsCount: 52
      }
    ];
  }

  return [
    {
      url: `https://reddit.com/r/${subreddit}/comments/18x9k2/best_${subreddit}_strategies_2026`,
      topKeyword: `best ${subreddit} platform`,
      topKeywordVolume: 18500,
      traffic: 5400,
      urlRating: 30,
      keywordsCount: 95
    },
    {
      url: `https://reddit.com/r/${subreddit}/comments/19a1m4/${subreddit}_optimization_guide`,
      topKeyword: `${subreddit} growth tactics`,
      topKeywordVolume: 12000,
      traffic: 3600,
      urlRating: 24,
      keywordsCount: 68
    }
  ];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subreddit = (searchParams.get('subreddit') || 'AICompanion').trim().replace(/^r\//, '');
  const minVolume = parseInt(searchParams.get('minVolume') || '1000', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const logger = new Logger({ context: 'RedditThreadsRoute' });

  try {
    const client = new AhrefsClient({ logger, mockFallback: true });
    const report = await client.fetchRedditThreads(subreddit, { minVolume, limit });

    if (report.threads.length === 0) {
      const sampleThreads = getSampleThreads(subreddit);
      const totalTraffic = sampleThreads.reduce((acc, t) => acc + (t.traffic || 0), 0);
      return NextResponse.json({
        target: `reddit.com/r/${subreddit}`,
        totalThreads: sampleThreads.length,
        totalTraffic,
        threads: sampleThreads,
        timestamp: new Date().toISOString(),
        isMockData: true
      });
    }

    return NextResponse.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Reddit threads';
    logger.error('Reddit threads route error', { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
