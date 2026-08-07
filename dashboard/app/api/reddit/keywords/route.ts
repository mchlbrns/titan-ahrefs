import { NextResponse } from 'next/server';
import { AhrefsClient } from '@src/client';
import { Logger } from '@src/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subreddit = (searchParams.get('subreddit') || 'hiking').trim().replace(/^r\//, '');
  const minVolume = parseInt(searchParams.get('minVolume') || '500', 10);
  const maxPosition = parseInt(searchParams.get('maxPosition') || '20', 10);
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  const logger = new Logger({ context: 'RedditKeywordsRoute' });

  try {
    const client = new AhrefsClient({ logger, mockFallback: true });
    const report = await client.fetchRedditKeywords(subreddit, { minVolume, maxPosition, limit });

    if (report.keywords.length === 0) {
      return NextResponse.json({
        target: `reddit.com/r/${subreddit}`,
        totalKeywords: 6,
        top3Count: 1,
        top10Count: 5,
        keywords: [
          {
            keyword: `best ${subreddit} strategy`,
            position: 3,
            volume: 18500,
            keywordDifficulty: 24,
            traffic: 2400,
            searchIntent: 'Commercial'
          },
          {
            keyword: `${subreddit} step by step guide`,
            position: 5,
            volume: 12000,
            keywordDifficulty: 19,
            traffic: 1500,
            searchIntent: 'Informational'
          },
          {
            keyword: `buy ${subreddit} tools online`,
            position: 7,
            volume: 8900,
            keywordDifficulty: 31,
            traffic: 980,
            searchIntent: 'Transactional'
          },
          {
            keyword: `how to optimize ${subreddit}`,
            position: 8,
            volume: 6400,
            keywordDifficulty: 14,
            traffic: 720,
            searchIntent: 'Informational'
          },
          {
            keyword: `top rated ${subreddit} platform`,
            position: 10,
            volume: 4800,
            keywordDifficulty: 28,
            traffic: 450,
            searchIntent: 'Commercial'
          },
          {
            keyword: `${subreddit} community forum`,
            position: 14,
            volume: 3100,
            keywordDifficulty: 11,
            traffic: 210,
            searchIntent: 'Navigational'
          }
        ],
        timestamp: new Date().toISOString(),
        isMockData: true
      });
    }

    return NextResponse.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Reddit keywords';
    logger.error('Reddit keywords route error', { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
