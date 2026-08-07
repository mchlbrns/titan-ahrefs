import { NextResponse } from 'next/server';
import { AhrefsClient } from '../../../src/client';
import { Logger } from '../../../src/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logger = new Logger({ context: 'VercelUsageRoute' });
  const apiKey = process.env.AHREFS_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_ahrefs')) {
    return NextResponse.json({
      status: 'OFFLINE',
      error: 'AHREFS_API_KEY is missing or invalid',
      unitsConsumed: null,
      unitsLimit: null,
      unitsRemaining: null,
      resetDate: null,
      apiKeyStatus: 'UNAUTHENTICATED'
    }, { status: 200 });
  }

  try {
    const client = new AhrefsClient({ logger });
    const limits = await client.fetchLimitsAndUsage();
    return NextResponse.json({
      status: 'SUCCESS',
      unitsLimit: limits.unitsLimit,
      unitsConsumed: limits.unitsConsumed,
      unitsRemaining: limits.unitsRemaining,
      resetDate: limits.resetDate,
      apiKeyStatus: limits.apiKeyStatus
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch subscription limits from Ahrefs API';
    logger.error('Ahrefs subscription limits fetch failed', { error: message });
    return NextResponse.json({
      status: 'OFFLINE',
      error: message,
      unitsConsumed: null,
      unitsLimit: null,
      unitsRemaining: null,
      resetDate: null,
      apiKeyStatus: 'ERROR'
    }, { status: 200 });
  }
}
