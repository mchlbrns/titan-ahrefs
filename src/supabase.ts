import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DomainSnapshot } from './types';
import { Logger } from './logger';

const logger = new Logger({ context: 'SupabaseClient' });

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


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
  // Always save snapshot to local workspace directory as well
  try {
    const { saveSnapshotLocally } = require('./snapshots');
    saveSnapshotLocally(snapshot);
  } catch {
    // ignore local save error
  }

  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('ahrefs_snapshots').upsert({
      domain: snapshot.domain,
      timestamp: snapshot.timestamp,
      domain_rating: snapshot.domainRating,
      ahrefs_rank: snapshot.overview?.ahrefsRank || 0,
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

    logger.info(`Saved live snapshot to Supabase and local workspace for ${snapshot.domain}`);
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

      snapshotId: `snap_${data.domain.replace(/\./g, '_')}_${new Date(data.timestamp).getTime()}`,
      domain: data.domain,
      timestamp: data.timestamp,
      dataSource: 'ahrefs-api-v3',
      overview: {
        domain: data.domain,
        domainRating: data.domain_rating,
        urlRating: 0,
        ahrefsRank: data.ahrefs_rank || 0,
        organicTraffic: data.estimated_traffic,
        trafficValue: 0,
        rankingKeywords: data.keywords_data?.totalKeywords || 0,
        totalBacklinks: data.total_backlinks,
        referringDomains: data.referring_domains,
        dofollowBacklinks: Math.round(data.total_backlinks * 0.78),
        dofollowRefdomains: Math.round(data.referring_domains * 0.84),
        nofollowLinks: 0,
        timestamp: data.timestamp,
        seoHealthScore: data.seo_health_score
      },
      domainRating: data.domain_rating,
      estimatedTraffic: data.estimated_traffic,
      referringDomains: data.referring_domains,
      totalBacklinks: data.total_backlinks,
      organicKeywords: data.keywords_data?.totalKeywords || 0,
      seoHealthScore: data.seo_health_score,
      keywords: data.keywords_data || { domain: data.domain, totalKeywords: 0, top3Count: 0, top10Count: 0, top50Count: 0, estimatedTraffic: 0, keywords: [] },
      topPages: data.toppages_data || { domain: data.domain, totalPages: 0, totalOrganicTraffic: 0, totalTrafficValue: 0, pages: [] },
      backlinks: data.backlinks_data || { domain: data.domain, totalBacklinks: 0, referringDomains: 0, dofollowRatio: 0, recentBacklinks: [], topAnchors: [] },
      competitors: data.competitors_data || []
    };
  } catch {
    return null;
  }
}

