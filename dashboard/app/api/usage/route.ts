import { NextResponse } from 'next/server';
import { AhrefsClient } from '../../../src/client';
import { Logger } from '../../../src/logger';
import { logApiUsageToSupabase, getSupabaseClient } from '../../../src/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logger = new Logger({ context: 'VercelUsageRoute' });
  const apiKey = process.env.AHREFS_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_ahrefs')) {
    // Try reading last logged usage from Supabase
    try {
      const client = getSupabaseClient();
      if (client) {
        const { data } = await client.from('api_usage_logs').select('*').order('created_at', { ascending: false }).limit(1).single();
        if (data) {
          return NextResponse.json({
            status: 'SUCCESS',
            unitsLimit: data.units_limit,
            unitsConsumed: data.units_consumed,
            unitsRemaining: data.units_remaining,
            resetDate: data.reset_date,
            apiKeyStatus: data.api_key_status || 'ACTIVE'
          });
        }
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      status: 'OFFLINE',
      error: 'AHREFS_API_KEY is missing or invalid',
      unitsConsumed: 0,
      unitsLimit: 5000,
      unitsRemaining: 5000,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      apiKeyStatus: 'DEMO_MODE'
    }, { status: 200 });
  }

  try {
    const client = new AhrefsClient({ logger });
    const limits = await client.fetchLimitsAndUsage();
    
    // Asynchronously record usage telemetry in Supabase
    logApiUsageToSupabase({
      endpoint: '/subscription-info/limits-and-usage',
      unitsConsumed: limits.unitsConsumed,
      unitsLimit: limits.unitsLimit,
      unitsRemaining: limits.unitsRemaining,
      apiKeyStatus: limits.apiKeyStatus
    }).catch(() => null);

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
      unitsConsumed: 0,
      unitsLimit: 5000,
      unitsRemaining: 5000,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      apiKeyStatus: 'DEMO_MODE'
    }, { status: 200 });
  }
}
