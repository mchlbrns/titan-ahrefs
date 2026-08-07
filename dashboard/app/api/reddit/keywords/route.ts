import { NextResponse } from 'next/server';
import { AhrefsClient } from '@src/client';
import { Logger } from '@src/logger';

export const dynamic = 'force-dynamic';

function getSampleKeywords(subreddit: string) {
  const s = subreddit.toLowerCase();
  if (['aicompanion', 'soulmateai', 'characterai', 'replika', 'virtualgf', 'nsfwai'].some(k => s.includes(k))) {
    return [
      {
        keyword: 'best ai companion app',
        position: 2,
        volume: 28500,
        keywordDifficulty: 24,
        traffic: 3400,
        searchIntent: 'Commercial'
      },
      {
        keyword: 'character ai alternative',
        position: 3,
        volume: 45000,
        keywordDifficulty: 38,
        traffic: 5200,
        searchIntent: 'Commercial'
      },
      {
        keyword: 'virtual girlfriend app free',
        position: 5,
        volume: 18200,
        keywordDifficulty: 29,
        traffic: 2100,
        searchIntent: 'Transactional'
      },
      {
        keyword: 'ai chatbot girlfriend online',
        position: 7,
        volume: 12500,
        keywordDifficulty: 21,
        traffic: 1400,
        searchIntent: 'Transactional'
      },
      {
        keyword: 'top ai companion chat',
        position: 9,
        volume: 8900,
        keywordDifficulty: 16,
        traffic: 950,
        searchIntent: 'Informational'
      }
    ];
  }

  if (['digitalmarketing', 'seo', 'contentmarketing', 'growthhacking', 'b2bmarketing'].some(k => s.includes(k))) {
    return [
      {
        keyword: 'best seo strategy for platforms',
        position: 3,
        volume: 24000,
        keywordDifficulty: 24,
        traffic: 2400,
        searchIntent: 'Commercial'
      },
      {
        keyword: 'organic traffic growth tactics',
        position: 5,
        volume: 16500,
        keywordDifficulty: 19,
        traffic: 1500,
        searchIntent: 'Informational'
      },
      {
        keyword: 'content engagement optimization',
        position: 7,
        volume: 11200,
        keywordDifficulty: 31,
        traffic: 980,
        searchIntent: 'Commercial'
      },
      {
        keyword: 'growth hacking platforms',
        position: 9,
        volume: 7800,
        keywordDifficulty: 14,
        traffic: 720,
        searchIntent: 'Informational'
      }
    ];
  }

  return [
    {
      keyword: `best ${subreddit} platform`,
      position: 3,
      volume: 18500,
      keywordDifficulty: 24,
      traffic: 2400,
      searchIntent: 'Commercial'
    },
    {
      keyword: `${subreddit} growth tactics`,
      position: 5,
      volume: 12000,
      keywordDifficulty: 19,
      traffic: 1500,
      searchIntent: 'Informational'
    }
  ];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subreddit = (searchParams.get('subreddit') || 'AICompanion').trim().replace(/^r\//, '');
  const minVolume = parseInt(searchParams.get('minVolume') || '500', 10);
  const maxPosition = parseInt(searchParams.get('maxPosition') || '20', 10);
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  const logger = new Logger({ context: 'RedditKeywordsRoute' });

  try {
    const client = new AhrefsClient({ logger, mockFallback: true });
    const report = await client.fetchRedditKeywords(subreddit, { minVolume, maxPosition, limit });

    if (report.keywords.length === 0) {
      const sampleKeywords = getSampleKeywords(subreddit);
      return NextResponse.json({
        target: `reddit.com/r/${subreddit}`,
        totalKeywords: sampleKeywords.length,
        top3Count: sampleKeywords.filter(k => k.position <= 3).length,
        top10Count: sampleKeywords.filter(k => k.position <= 10).length,
        keywords: sampleKeywords,
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
