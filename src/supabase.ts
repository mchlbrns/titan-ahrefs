import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DomainSnapshot } from './types';
import { Logger } from './logger';

const logger = new Logger({ context: 'SupabaseClient' });

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    logger.debug('Supabase environment variables not set (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    return null;
  }

  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (err) {
    logger.warn('Failed to initialize Supabase client', { error: (err as Error).message });
    return null;
  }
}

export async function saveSnapshotToSupabase(snapshot: DomainSnapshot): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('ahrefs_snapshots').upsert({
      domain: snapshot.domain,
      timestamp: snapshot.timestamp,
      domain_rating: snapshot.domainRating,
      ahrefs_rank: snapshot.ahrefsRank,
      estimated_traffic: snapshot.estimatedTraffic,
      referring_domains: snapshot.referringDomains,
      total_backlinks: snapshot.totalBacklinks,
      seo_health_score: snapshot.seoHealthScore,
      keywords_data: snapshot.keywords,
      toppages_data: snapshot.topPages,
      backlinks_data: snapshot.backlinks,
      competitors_data: snapshot.competitors,
      updated_at: new Date().toISOString()
    }, { onConflict: 'domain,timestamp' });

    if (error) {
      logger.warn(`Supabase snapshot save warning for ${snapshot.domain}`, { message: error.message });
      return false;
    }

    logger.info(`Saved live snapshot to Supabase for ${snapshot.domain}`);
    return true;
  } catch (err) {
    logger.warn(`Error saving snapshot to Supabase for ${snapshot.domain}`, { error: (err as Error).message });
    return false;
  }
}

export async function getLatestSnapshotFromSupabase(domain: string): Promise<DomainSnapshot | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('ahrefs_snapshots')
      .select('*')
      .eq('domain', domain)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      domain: data.domain,
      timestamp: data.timestamp,
      domainRating: data.domain_rating,
      ahrefsRank: data.ahrefs_rank,
      estimatedTraffic: data.estimated_traffic,
      referringDomains: data.referring_domains,
      totalBacklinks: data.total_backlinks,
      seoHealthScore: data.seo_health_score,
      keywords: data.keywords_data,
      topPages: data.toppages_data,
      backlinks: data.backlinks_data,
      competitors: data.competitors_data
    };
  } catch {
    return null;
  }
}
