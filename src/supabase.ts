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


    const dbTimestamp = data.updated_at || data.created_at || data.timestamp;

    return {
      snapshotId: `snap_${data.domain.replace(/\./g, '_')}_${new Date(dbTimestamp).getTime()}`,
      domain: data.domain,
      timestamp: dbTimestamp,
      dataSource: 'supabase-db-snapshot',
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
        timestamp: dbTimestamp,
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

export async function getManagedDomainsFromSupabase(): Promise<{ domain: string; target_country?: string; priority?: string; description?: string }[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('managed_domains')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return null;
    return data.map(row => ({
      domain: row.domain,
      target_country: row.target_country || 'us',
      priority: row.priority || 'high',
      description: row.description || 'Managed Domain'
    }));
  } catch {
    return null;
  }
}

export async function addManagedDomainToSupabase(domainObj: { domain: string; target_country?: string; priority?: string; description?: string }): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('managed_domains').upsert({
      domain: domainObj.domain.toLowerCase().trim(),
      target_country: domainObj.target_country || 'us',
      priority: domainObj.priority || 'high',
      description: domainObj.description || 'Added via Dashboard UI',
      updated_at: new Date().toISOString()
    }, { onConflict: 'domain' });

    return !error;
  } catch {
    return false;
  }
}

export async function deleteManagedDomainFromSupabase(domain: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('managed_domains')
      .delete()
      .eq('domain', domain.toLowerCase().trim());

    return !error;
  } catch {
    return false;
  }
}

export async function getCompetitorsFromSupabase(primaryDomain: string): Promise<string[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('competitor_registry')
      .select('competitor_domain')
      .eq('primary_domain', primaryDomain.toLowerCase().trim());

    if (error || !data || data.length === 0) return null;
    return data.map(row => row.competitor_domain);
  } catch {
    return null;
  }
}

export async function logApiUsageToSupabase(log: { endpoint: string; unitsConsumed: number; unitsLimit?: number; unitsRemaining?: number; apiKeyStatus?: string }): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('api_usage_logs').insert({
      endpoint: log.endpoint,
      units_consumed: log.unitsConsumed,
      units_limit: log.unitsLimit ?? 5000,
      units_remaining: log.unitsRemaining ?? 5000,
      api_key_status: log.apiKeyStatus || 'ACTIVE',
      created_at: new Date().toISOString()
    });
    return !error;
  } catch {
    return false;
  }
}

export async function saveExecutiveReportToSupabase(report: { reportTitle?: string; domainsAudited: string[]; executiveSummary: unknown; markdownContent: string; htmlContent?: string }): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('executive_reports').insert({
      report_title: report.reportTitle || 'Ahrefs Weekly Executive SEO Briefing',
      domains_audited: report.domainsAudited,
      executive_summary: report.executiveSummary,
      markdown_content: report.markdownContent,
      html_content: report.htmlContent || null,
      created_at: new Date().toISOString()
    });
    return !error;
  } catch {
    return false;
  }
}

