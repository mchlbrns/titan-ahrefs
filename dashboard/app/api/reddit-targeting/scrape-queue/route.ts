import { NextResponse } from 'next/server';
import { Logger } from '@src/logger';
import { saveRedditQueueToSupabase, getRedditQueueFromSupabase } from '@src/supabase';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const dynamic = 'force-dynamic';

export interface ScrapeQueueItem {
  thread_url: string;
  target_keyword: string;
  search_volume: number;
  est_traffic: number;
  queued_at: string;
  status: 'Queued' | 'Scraped';
}

function getQueueFilePath(): string {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'scraping_queue.json');
  }
  const dir = path.join(process.cwd(), 'snapshots/local');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      return path.join(os.tmpdir(), 'scraping_queue.json');
    }
  }
  return path.join(dir, 'scraping_queue.json');
}

function readQueue(): ScrapeQueueItem[] {
  const filePath = getQueueFilePath();
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as ScrapeQueueItem[];
    } catch {
      return [];
    }
  }
  return [];
}

function saveQueue(queue: ScrapeQueueItem[]): void {
  const filePath = getQueueFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(queue, null, 2), 'utf-8');
  } catch { /* ignore */ }
}

export async function GET() {
  let queue = await getRedditQueueFromSupabase();
  if (!queue || queue.length === 0) {
    queue = readQueue();
  }
  return NextResponse.json({
    totalQueued: queue.length,
    queue
  });
}

export async function POST(req: Request) {
  const logger = new Logger({ context: 'RedditScrapeQueueRoute' });

  try {
    const body = await req.json() as {
      event?: string;
      threads?: Array<{
        thread_url: string;
        target_keyword?: string;
        search_volume?: number;
        est_traffic?: number;
      }>;
      requested_at?: string;
    };

    if (!body.threads || !Array.isArray(body.threads) || body.threads.length === 0) {
      return NextResponse.json({ error: 'Payload must contain a non-empty threads array' }, { status: 400 });
    }

    const requestedAt = body.requested_at || new Date().toISOString();
    const currentQueue = readQueue();

    const newItems: ScrapeQueueItem[] = body.threads.map(t => ({
      thread_url: t.thread_url,
      target_keyword: t.target_keyword || '',
      search_volume: Number(t.search_volume ?? 0),
      est_traffic: Number(t.est_traffic ?? 0),
      queued_at: requestedAt,
      status: 'Queued'
    }));

    // Deduplicate queue by thread_url
    const urlSet = new Set(currentQueue.map(i => i.thread_url));
    const addedItems: ScrapeQueueItem[] = [];

    for (const item of newItems) {
      if (!urlSet.has(item.thread_url)) {
        urlSet.add(item.thread_url);
        currentQueue.push(item);
        addedItems.push(item);
        // Persist to Supabase asynchronously
        saveRedditQueueToSupabase(item).catch(() => null);
      }
    }

    saveQueue(currentQueue);

    logger.info(`Queued ${addedItems.length} Reddit threads for scraping queue payload event: ${body.event || 'reddit_scrape_requested'}`);

    return NextResponse.json({
      success: true,
      event: body.event || 'reddit_scrape_requested',
      addedCount: addedItems.length,
      totalQueued: currentQueue.length,
      requestedAt,
      queuedThreads: addedItems
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to queue Reddit threads for scraping';
    logger.error('Scrape queue route error', { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
