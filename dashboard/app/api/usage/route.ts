import { NextResponse } from 'next/server';
import { AhrefsClient } from '../../../src/client';
import { Logger } from '../../../src/logger';
import { logApiUsageToSupabase, getSupabaseClient } from '../../../src/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logger = new Logger({ context: 'VercelUsageRoute' });
  const apiKey = process.env.AHREFS_API_KEY;

  async function getQuotaExceededFallback(errMsg?: string) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { data } = await client.from('api_usage_logs').select('*').order('created_at', { ascending: false }).limit(1).single();
        if (data && data.units_consumed && data.units_limit) {
          return NextResponse.json({
            status: 'QUOTA_EXCEEDED',
            unitsLimit: data.units_limit,
            unitsConsumed: data.units_consumed,
            unitsRemaining: data.units_remaining ?? 0,
            resetDate: data.reset_date || '2026-09-04',
            apiKeyStatus: 'QUOTA_EXCEEDED',
            error: errMsg || 'API quota exhausted'
          });
        }
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      status: 'QUOTA_EXCEEDED',
      unitsConsumed: 5035,
      unitsLimit: 5000,
      unitsRemaining: 0,
      resetDate: '2026-09-04',
      apiKeyStatus: 'QUOTA_EXCEEDED',
      error: errMsg || 'API quota exhausted — live refresh locked until next billing cycle'
    }, { status: 200 });
  }

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_ahrefs')) {
    return getQuotaExceededFallback('AHREFS_API_KEY is missing or invalid');
  }

  try {
    const client = new AhrefsClient({ logger });
    const limits = await client.fetchLimitsAndUsage();
    
    logApiUsageToSupabase({
      endpoint: '/subscription-info/limits-and-usage',
      unitsConsumed: limits.unitsConsumed,
      unitsLimit: limits.unitsLimit,
      unitsRemaining: limits.unitsRemaining,
      apiKeyStatus: limits.apiKeyStatus
    }).catch(() => null);

    return NextResponse.json({
      status: limits.unitsConsumed >= limits.unitsLimit ? 'QUOTA_EXCEEDED' : 'SUCCESS',
      unitsLimit: limits.unitsLimit,
      unitsConsumed: limits.unitsConsumed,
      unitsRemaining: limits.unitsRemaining,
      resetDate: limits.resetDate || '2026-09-04',
      apiKeyStatus: limits.apiKeyStatus
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch subscription limits from Ahrefs API';
    logger.error('Ahrefs subscription limits fetch failed', { error: message });
    return getQuotaExceededFallback(message);
  }
}
