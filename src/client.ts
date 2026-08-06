import {
  DomainOverviewMetrics,
  OrganicKeywordItem,
  DomainKeywordReport,
  TopPageItem,
  TopPagesReport,
  CompetitorMetrics,
  BacklinkItem,
  BacklinkAuditReport,
  ApiUsageLimits
} from './types';
import { calculateSeoHealthScore } from './health';
import { Logger } from './logger';
import { withRetry } from './utils/retry';
import { AhrefsApiError } from './errors';
import { ApiUsageMonitor } from './usage';

export interface AhrefsClientOptions {
  apiKey?: string;
  baseUrl?: string;
  mockFallback?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
  logger?: Logger;
  usageMonitor?: ApiUsageMonitor;
}

export class AhrefsClient {
  private apiKey: string;
  private baseUrl: string;
  private mockFallback: boolean;
  private maxRetries: number;
  private retryDelayMs: number;
  private logger: Logger;
  public usageMonitor: ApiUsageMonitor;

  constructor(options: AhrefsClientOptions = {}) {
    this.apiKey = options.apiKey !== undefined ? options.apiKey : (process.env.AHREFS_API_KEY || '');
    this.baseUrl = options.baseUrl || process.env.AHREFS_API_BASE_URL || 'https://api.ahrefs.com/v3';
    this.mockFallback = options.mockFallback ?? (process.env.MOCK_API_FALLBACK !== 'false');
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 500;
    this.logger = options.logger || new Logger({ context: 'AhrefsClient' });
    this.usageMonitor = options.usageMonitor || new ApiUsageMonitor(this.logger);
  }

  public isMockMode(): boolean {
    return !this.apiKey || this.apiKey.includes('your_ahrefs') || this.mockFallback;
  }

  private extractUnitsFromResponse(res: Response, defaultUnits: number = 1): number {
    const headerVal = res.headers ? (res.headers.get('x-api-units-cost-total-actual') || res.headers.get('x-api-units-consumed') || res.headers.get('x-units-consumed')) : null;
    if (headerVal) {
      const parsed = parseInt(headerVal, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return defaultUnits;
  }

  /** Executes a real Ahrefs request. Authentication is intentionally never logged. */
  private async requestLive(endpoint: string, params: Record<string, string> = {}): Promise<Record<string, unknown>> {
    const query = new URLSearchParams(params);
    const url = `${this.baseUrl}${endpoint}${query.size ? `?${query.toString()}` : ''}`;
    return withRetry(async (attempt) => {
      this.logger.debug(`API request attempt ${attempt} for ${endpoint}`, { url });
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}`, Accept: 'application/json' }
      });
      if (!response.ok) {
        throw new AhrefsApiError(`Ahrefs API HTTP error ${response.status}: ${response.statusText}`, response.status, url);
      }
      this.usageMonitor.recordApiCall(endpoint, this.extractUnitsFromResponse(response, 50), true);
      return await response.json() as Record<string, unknown>;
    }, { maxRetries: this.maxRetries, initialDelayMs: this.retryDelayMs, logger: this.logger });
  }

  private currentDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private numberField(record: Record<string, unknown>, field: string): number {
    const value = record[field];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  // Task 1: GET /subscription-info/limits-and-usage
  public async fetchLimitsAndUsage(): Promise<ApiUsageLimits> {
    const endpoint = '/subscription-info/limits-and-usage';
    if (this.isMockMode()) {
      this.logger.debug(`Fetching API usage limits [MOCK MODE]`);
      const mockUsage: ApiUsageLimits = {
        unitsLimit: 500000,
        unitsConsumed: 14250,
        unitsRemaining: 485750,
        resetDate: new Date(Date.now() + 22 * 86400000).toISOString().split('T')[0],
        apiKeyStatus: 'ACTIVE'
      };
      this.usageMonitor.updateLimitsFromApi(mockUsage);
      return mockUsage;
    }

    this.logger.info(`Fetching API usage limits [LIVE API]`);
    try {
      const { data, units } = await withRetry(async (attempt) => {
        const url = `${this.baseUrl}${endpoint}`;
        this.logger.debug(`API request attempt ${attempt} for ${endpoint}`, { url });
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        });
        if (!res.ok) {
          throw new AhrefsApiError(`Ahrefs API HTTP error ${res.status}: ${res.statusText}`, res.status, url);
        }
        const unitsConsumed = this.extractUnitsFromResponse(res, 1);
        const json = await res.json() as Record<string, unknown>;
        return { data: json, units: unitsConsumed };
      }, { maxRetries: this.maxRetries, initialDelayMs: this.retryDelayMs, logger: this.logger });

      this.usageMonitor.recordApiCall(endpoint, units, true);
      const usage = (data.limits_and_usage || data) as Record<string, unknown>;
      const unitsLimit = this.numberField(usage, 'units_limit_workspace') || this.numberField(usage, 'units_limit') || 500000;
      const unitsConsumed = this.numberField(usage, 'units_consumed_workspace') || this.numberField(usage, 'units_consumed') || 0;
      const unitsRemaining = this.numberField(usage, 'units_remaining_workspace') || this.numberField(usage, 'units_remaining') || Math.max(0, unitsLimit - unitsConsumed);

      const limits: ApiUsageLimits = {
        unitsLimit,
        unitsConsumed,
        unitsRemaining,
        resetDate: String(usage.reset_date || usage.resetDate || ''),
        apiKeyStatus: String(usage.api_key_status || 'ACTIVE')
      };

      this.usageMonitor.updateLimitsFromApi(limits);
      return limits;
    } catch (err) {
      this.logger.error(`Failed to fetch API limits. Reason: ${(err as Error).message}`);
      throw err;
    }
  }

  // Task 2: Domain Overview Collection
  public async fetchDomainOverview(domain: string): Promise<DomainOverviewMetrics> {
    const endpoint = '/site-explorer/domain-rating';
    if (this.isMockMode()) {
      this.logger.debug(`Fetching Domain Overview for ${domain} [MOCK MODE]`);
      this.usageMonitor.recordApiCall(endpoint, 1, true);
      return this.generateMockDomainOverview(domain);
    }

    this.logger.info(`Fetching Domain Overview for ${domain} [LIVE API]`);
    const baseParams = { target: domain, mode: 'domain', date: this.currentDate(), country: 'us' };
    const [drRaw, metricsRaw, backlinksRaw] = await Promise.all([
      this.requestLive(endpoint, { target: domain, date: this.currentDate() }),
      this.requestLive('/site-explorer/metrics', baseParams),
      this.requestLive('/site-explorer/backlinks-stats', { target: domain, mode: 'domain', date: this.currentDate() })
    ]);
    const dr = drRaw as Record<string, unknown>;
    const metrics = (metricsRaw.metrics || metricsRaw) as Record<string, unknown>;
    const backlinkStats = (backlinksRaw.metrics || backlinksRaw) as Record<string, unknown>;

    // Handle both nested { domain_rating: { domain_rating: 42, ahrefs_rank: 12345 } } and flat response formats
    let domainRating = 0;
    let ahrefsRank = 0;
    if (dr && typeof dr.domain_rating === 'object' && dr.domain_rating !== null) {
      const nested = dr.domain_rating as Record<string, unknown>;
      domainRating = this.numberField(nested, 'domain_rating') || this.numberField(nested, 'rating');
      ahrefsRank = this.numberField(nested, 'ahrefs_rank') || this.numberField(dr, 'ahrefs_rank');
    } else {
      domainRating = this.numberField(dr, 'domain_rating');
      ahrefsRank = this.numberField(dr, 'ahrefs_rank');
    }

    const totalBacklinks = this.numberField(backlinkStats, 'live');
    const referringDomains = this.numberField(backlinkStats, 'live_refdomains');
    const organicTraffic = this.numberField(metrics, 'org_traffic');
    const trafficValue = this.numberField(metrics, 'org_traffic_value');
    const rankingKeywords = this.numberField(metrics, 'org_keywords');
    const dofollowBacklinks = 0;
    const dofollowRefdomains = 0;
    return {
      domain, domainRating, urlRating: 0, ahrefsRank, organicTraffic,
      trafficValue, rankingKeywords, totalBacklinks, referringDomains, dofollowBacklinks, dofollowRefdomains,
      nofollowLinks: 0, timestamp: new Date().toISOString(),
      seoHealthScore: calculateSeoHealthScore({ domainRating, referringDomains, totalBacklinks, dofollowLinks: dofollowBacklinks, estimatedTraffic: organicTraffic, top10Count: this.numberField(metrics, 'org_keywords_4_10') })
    };
  }

  // Alias for backward compatibility
  public async fetchDomainRating(domain: string): Promise<DomainOverviewMetrics> {
    return this.fetchDomainOverview(domain);
  }

  // Task 3: Organic Keywords Collection
  public async fetchOrganicKeywords(domain: string, options: { limit?: number; select?: string; orderBy?: string } = {}): Promise<DomainKeywordReport> {
    const endpoint = '/site-explorer/organic-keywords';
    const limit = options.limit ?? 100;
    const select = options.select ?? 'keyword,best_position,volume,keyword_difficulty,sum_traffic,best_position_url,serp_features,is_informational,is_transactional,is_commercial,is_navigational';
    const orderBy = options.orderBy ?? 'sum_traffic:desc';

    if (this.isMockMode()) {
      this.logger.info(`Fetching Organic Keywords for ${domain} [MOCK MODE]`);
      this.usageMonitor.recordApiCall(endpoint, 5, true);
      return this.generateMockOrganicKeywords(domain);
    }

    this.logger.info(`Fetching Organic Keywords for ${domain} [LIVE API]`);
    try {
      const report = await withRetry(async (attempt) => {
        const queryParams = new URLSearchParams({
          target: domain,
          mode: 'domain',
          country: 'us',
          date: this.currentDate(),
          date_compared: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
          select,
          limit: String(limit),
          order_by: orderBy
        });
        const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;
        this.logger.debug(`API request attempt ${attempt} for ${endpoint}`, { url });

        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          throw new AhrefsApiError(`Ahrefs API HTTP error ${res.status}: ${res.statusText}`, res.status, url);
        }

        const unitsConsumed = this.extractUnitsFromResponse(res, 5);
        this.usageMonitor.recordApiCall(endpoint, unitsConsumed, true);

        const data = await res.json() as { keywords?: Record<string, unknown>[] };
        const rawKeywords = data.keywords || [];

        const malformedRows = rawKeywords.filter(item => !item || typeof item !== 'object' || typeof item.keyword !== 'string' || item.keyword.trim().length === 0);
        if (malformedRows.length > 0) {
          this.logger.warn(`Filtered ${malformedRows.length} malformed keyword rows for ${domain}`, { malformedCount: malformedRows.length });
        }

        const validRows = rawKeywords.filter(item => item && typeof item === 'object' && typeof item.keyword === 'string' && item.keyword.trim().length > 0);

        const keywords: OrganicKeywordItem[] = validRows.map(item => {
          const pos = this.numberField(item, 'best_position');
          const prevPos = this.numberField(item, 'best_position_prev') || pos;
          const posChange = this.numberField(item, 'best_position_diff') || 0;
          const vol = this.numberField(item, 'volume');
          const kd = this.numberField(item, 'keyword_difficulty');
          const estTr = this.numberField(item, 'sum_traffic');
          const trChange = this.numberField(item, 'sum_traffic_diff');
          const searchIntent = (item.is_transactional ? 'Transactional' : item.is_commercial ? 'Commercial' : item.is_informational ? 'Informational' : item.is_navigational ? 'Navigational' : 'Mixed') as OrganicKeywordItem['searchIntent'];

          return {
            keyword: String(item.keyword || ''),
            position: pos,
            previousPosition: prevPos,
            positionChange: posChange,
            searchVolume: vol,
            keywordDifficulty: kd,
            estimatedTraffic: estTr,
            trafficChange: trChange,
            url: String(item.best_position_url || `https://${domain}`),
            serpFeatures: Array.isArray(item.serp_features) ? item.serp_features.map(String) : [],
            searchIntent
          };
        });

        const totalKws = keywords.length;
        const top3 = keywords.filter(k => k.position <= 3).length;
        const top10 = keywords.filter(k => k.position <= 10).length;
        const top50 = keywords.filter(k => k.position <= 50).length;
        const totalTraffic = keywords.reduce((sum, k) => sum + k.estimatedTraffic, 0);

        return {
          domain,
          totalKeywords: totalKws,
          top3Count: top3,
          top10Count: top10,
          top50Count: top50,
          estimatedTraffic: totalTraffic,
          trafficValue: Math.round(totalTraffic * 1.85),
          keywords
        };
      }, { maxRetries: this.maxRetries, initialDelayMs: this.retryDelayMs, logger: this.logger });

      return report;
    } catch (err) {
      this.logger.error(`API request failed for ${domain} organic keywords. Reason: ${(err as Error).message}`);
      this.usageMonitor.recordApiCall(endpoint, 0, false);
      throw err;
    }
  }

  // Task 4: Top Pages Collection
  public async fetchTopPages(domain: string, options: { limit?: number; select?: string } = {}): Promise<TopPagesReport> {
    const endpoint = '/site-explorer/top-pages';
    const limit = options.limit ?? 50;
    const select = options.select ?? 'url,sum_traffic,keywords,top_keyword,value';

    if (this.isMockMode()) {
      this.logger.info(`Fetching Top Pages for ${domain} [MOCK MODE]`);
      this.usageMonitor.recordApiCall(endpoint, 5, true);
      return this.generateMockTopPages(domain);
    }

    this.logger.info(`Fetching Top Pages for ${domain} [LIVE API]`);
    try {
      const report = await withRetry(async (attempt) => {
        const queryParams = new URLSearchParams({
          target: domain,
          mode: 'domain',
          country: 'us',
          date: this.currentDate(),
          date_compared: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
          select,
          limit: String(limit)
        });
        const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;
        this.logger.debug(`API request attempt ${attempt} for ${endpoint}`, { url });

        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          throw new AhrefsApiError(`Ahrefs API HTTP error ${res.status}: ${res.statusText}`, res.status, url);
        }

        const unitsConsumed = this.extractUnitsFromResponse(res, 5);
        this.usageMonitor.recordApiCall(endpoint, unitsConsumed, true);

        const data = await res.json() as { pages?: Record<string, unknown>[] };
        const rawPages = data.pages || [];

        const pages: TopPageItem[] = rawPages.map(item => ({
          url: String(item.url || `https://${domain}/`),
          organicTraffic: this.numberField(item, 'sum_traffic') || this.numberField(item, 'organicTraffic') || this.numberField(item, 'traffic'),
          trafficChange: this.numberField(item, 'traffic_diff') || this.numberField(item, 'traffic_change'),
          rankingKeywords: this.numberField(item, 'keywords'),
          topKeyword: String(item.top_keyword || domain),
          trafficValue: this.numberField(item, 'value') || this.numberField(item, 'traffic_value')
        }));

        const totalOrganicTraffic = pages.reduce((acc, p) => acc + p.organicTraffic, 0);
        const totalTrafficValue = pages.reduce((acc, p) => acc + p.trafficValue, 0);

        return {
          domain,
          totalPages: pages.length,
          totalOrganicTraffic,
          totalTrafficValue,
          pages
        };
      }, { maxRetries: this.maxRetries, initialDelayMs: this.retryDelayMs, logger: this.logger });

      return report;
    } catch (err) {
      this.logger.error(`API request failed for ${domain} top pages. Reason: ${(err as Error).message}`);
      this.usageMonitor.recordApiCall(endpoint, 0, false);
      throw err;
    }
  }

  // Task 5: Competitor Collection
  public async fetchCompetitorOverview(targetDomain: string, competitorDomain: string): Promise<CompetitorMetrics> {
    const endpoint = '/site-explorer/organic-competitors';
    this.logger.info(`Fetching Competitor Overview for ${competitorDomain} (vs ${targetDomain})`);
    
    if (this.isMockMode()) {
      this.usageMonitor.recordApiCall(endpoint, 5, true);
      return this.generateMockCompetitorOverview(targetDomain, competitorDomain);
    }

    try {
      const data = await this.requestLive(endpoint, {
        target: targetDomain, mode: 'domain', country: 'us', date: this.currentDate(), limit: '100',
        select: 'competitor_domain,domain_rating,keywords_common,keywords_competitor,traffic,value'
      });
      const rows = Array.isArray(data.competitors) ? data.competitors as Record<string, unknown>[] : [];
      const row = rows.find(candidate => String(candidate.competitor_domain) === competitorDomain);
      if (!row) {
        this.logger.info(`Competitor ${competitorDomain} not found in organic-competitors array for ${targetDomain}. Fetching direct domain overview.`);
        const compOverview = await this.fetchDomainOverview(competitorDomain);
        return {
          targetDomain,
          competitorDomain,
          domainRating: compOverview.domainRating,
          organicTraffic: compOverview.organicTraffic,
          trafficValue: compOverview.trafficValue,
          sharedKeywords: 0,
          competitorExclusiveKeywords: compOverview.rankingKeywords,
          gapOpportunities: []
        };
      }
      let compDr = 0;
      if (typeof row.domain_rating === 'object' && row.domain_rating !== null) {
        compDr = this.numberField(row.domain_rating as Record<string, unknown>, 'domain_rating');
      } else {
        compDr = this.numberField(row, 'domain_rating');
      }

      return {
        targetDomain,
        competitorDomain,
        domainRating: compDr,
        organicTraffic: this.numberField(row, 'traffic'),
        trafficValue: this.numberField(row, 'value'),
        sharedKeywords: this.numberField(row, 'keywords_common'),
        competitorExclusiveKeywords: this.numberField(row, 'keywords_competitor'),
        gapOpportunities: []
      };

    } catch (err) {
      this.logger.error(`Failed to fetch competitor ${competitorDomain}. Reason: ${(err as Error).message}`);
      throw err;
    }
  }

  // Task 6: Backlink Collection
  public async fetchAllBacklinks(domain: string, options: { limit?: number; select?: string } = {}): Promise<BacklinkAuditReport> {
    const endpoint = '/site-explorer/all-backlinks';
    const limit = options.limit ?? 100;
    const select = options.select ?? 'url_from,url_to,anchor,domain_rating_source,is_dofollow,first_seen,last_seen,is_lost,is_new';

    if (this.isMockMode()) {
      this.logger.info(`Fetching All Backlinks for ${domain} [MOCK MODE]`);
      this.usageMonitor.recordApiCall(endpoint, 10, true);
      return this.generateMockBacklinkReport(domain);
    }

    this.logger.info(`Fetching All Backlinks for ${domain} [LIVE API]`);
    try {
      const report = await withRetry(async (attempt) => {
        const queryParams = new URLSearchParams({
          target: domain,
          mode: 'domain',
          aggregation: '1_per_domain',
          history: 'all_time',
          select,
          limit: String(limit)
        });
        const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;
        this.logger.debug(`API request attempt ${attempt} for ${endpoint}`, { url });

        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          throw new AhrefsApiError(`Ahrefs API HTTP error ${res.status}: ${res.statusText}`, res.status, url);
        }

        const unitsConsumed = this.extractUnitsFromResponse(res, 10);
        this.usageMonitor.recordApiCall(endpoint, unitsConsumed, true);

        const data = await res.json() as { backlinks?: Record<string, unknown>[] };
        const rawBacklinks = data.backlinks || [];

        const recentBacklinks: BacklinkItem[] = rawBacklinks.map(item => ({
          urlFrom: String(item.url_from || item.urlFrom || ''),
          urlTo: String(item.url_to || item.urlTo || `https://${domain}/`),
          anchorText: String(item.anchor || item.anchorText || domain),
          domainRatingFrom: (item.domain_rating_source as number) ?? (item.domainRatingFrom as number) ?? 40,
          isDofollow: (item.is_dofollow as boolean) ?? (item.isDofollow as boolean) ?? true,
          firstSeen: String(item.first_seen || item.firstSeen || new Date().toISOString()),
          lastSeen: String(item.last_seen || item.lastSeen || new Date().toISOString()),
          status: item.is_lost ? 'LOST' : item.is_new ? 'NEW' : 'LIVE'
        }));

        const [overview, refdomainData] = await Promise.all([
          this.fetchDomainOverview(domain),
          this.requestLive('/site-explorer/refdomains', { target: domain, mode: 'domain', limit: '100', select: 'domain,dofollow_links' })
        ]);
        await this.requestLive('/site-explorer/broken-backlinks', { target: domain, mode: 'domain', limit: '10', select: 'url_from,url_to,anchor,domain_rating_source,is_dofollow,first_seen,last_seen' });
        const refdomains = Array.isArray(refdomainData.refdomains) ? refdomainData.refdomains as Record<string, unknown>[] : [];
        const dofollowRefdomains = refdomains.filter(item => this.numberField(item, 'dofollow_links') > 0).length;
        const dofollowBacklinks = recentBacklinks.filter(item => item.isDofollow).length;
        const dofollowRatio = recentBacklinks.length ? Number((dofollowBacklinks / recentBacklinks.length).toFixed(2)) : 0;

        return {
          domain,
          totalBacklinks: overview.totalBacklinks,
          referringDomains: overview.referringDomains,
          dofollowRatio,
          dofollowBacklinks,
          dofollowRefdomains,
          topAnchors: Array.from(new Set(recentBacklinks.map(item => item.anchorText))).slice(0, 10).map(anchor => ({ anchor, count: recentBacklinks.filter(item => item.anchorText === anchor).length })),
          recentBacklinks,
          seoHealthScore: overview.seoHealthScore
        };
      }, { maxRetries: this.maxRetries, initialDelayMs: this.retryDelayMs, logger: this.logger });

      return report;
    } catch (err) {
      this.logger.error(`API request failed for ${domain} backlinks. Reason: ${(err as Error).message}`);
      this.usageMonitor.recordApiCall(endpoint, 0, false);
      throw err;
    }
  }

  private generateMockOrganicKeywords(domain: string): DomainKeywordReport {
    const isRed = domain.includes('red-engage');
    const isHeaven = domain.includes('heavengirlfriend');
    const isHorny = domain.includes('hornycompanion');

    let baseKeywords: OrganicKeywordItem[] = [];
    if (isRed) {
      baseKeywords = [
        {
          keyword: 'reddit marketing agency',
          position: 3,
          previousPosition: 3,
          positionChange: 0,
          searchVolume: 400,
          keywordDifficulty: 1,
          estimatedTraffic: 0,
          trafficChange: 0,
          url: `https://${domain}/blog/best-reddit-marketing-agencies`,
          serpFeatures: ['Featured Snippet', 'People Also Ask'],
          searchIntent: 'Transactional'
        },
        {
          keyword: 'leading advertising companies',
          position: 1,
          previousPosition: 1,
          positionChange: 0,
          searchVolume: 90,
          keywordDifficulty: 6,
          estimatedTraffic: 0,
          trafficChange: 0,
          url: `https://${domain}/blog/best-international-marketing-agencies`,
          serpFeatures: ['Featured Snippet'],
          searchIntent: 'Commercial'
        }
      ];
    } else if (isHeaven) {
      baseKeywords = [
        {
          keyword: 'ai girlfriend',
          position: 4,
          previousPosition: 6,
          positionChange: 2,
          searchVolume: 18000,
          keywordDifficulty: 45,
          estimatedTraffic: 320,
          trafficChange: 110,
          url: `https://${domain}/`,
          serpFeatures: ['People Also Ask'],
          searchIntent: 'Commercial'
        },
        {
          keyword: 'heaven girlfriend review',
          position: 1,
          previousPosition: 1,
          positionChange: 0,
          searchVolume: 1200,
          keywordDifficulty: 12,
          estimatedTraffic: 180,
          trafficChange: 20,
          url: `https://${domain}/about`,
          serpFeatures: ['Featured Snippet'],
          searchIntent: 'Informational'
        },
        {
          keyword: 'virtual girlfriend simulator',
          position: 7,
          previousPosition: 10,
          positionChange: 3,
          searchVolume: 5400,
          keywordDifficulty: 28,
          estimatedTraffic: 43,
          trafficChange: 15,
          url: `https://${domain}/chat`,
          serpFeatures: ['Image Pack'],
          searchIntent: 'Transactional'
        }
      ];
    } else if (isHorny) {
      baseKeywords = [
        {
          keyword: 'horny companion',
          position: 1,
          previousPosition: 1,
          positionChange: 0,
          searchVolume: 9200,
          keywordDifficulty: 15,
          estimatedTraffic: 6100,
          trafficChange: 400,
          url: `https://${domain}/`,
          serpFeatures: ['Featured Snippet'],
          searchIntent: 'Navigational'
        },
        {
          keyword: 'ai companion chat',
          position: 3,
          previousPosition: 4,
          positionChange: 1,
          searchVolume: 4100,
          keywordDifficulty: 22,
          estimatedTraffic: 2000,
          trafficChange: 150,
          url: `https://${domain}/chat`,
          serpFeatures: ['People Also Ask'],
          searchIntent: 'Commercial'
        }
      ];
    } else {
      baseKeywords = [
        {
          keyword: 'titan treasure casino',
          position: 2,
          previousPosition: 3,
          positionChange: 1,
          searchVolume: 3200,
          keywordDifficulty: 14,
          estimatedTraffic: 850,
          trafficChange: 120,
          url: `https://${domain}/`,
          serpFeatures: ['Featured Snippet'],
          searchIntent: 'Navigational'
        },
        {
          keyword: 'titan treasure sweepstakes',
          position: 5,
          previousPosition: 8,
          positionChange: 3,
          searchVolume: 1900,
          keywordDifficulty: 21,
          estimatedTraffic: 350,
          trafficChange: 80,
          url: `https://${domain}/sweeps`,
          serpFeatures: ['People Also Ask'],
          searchIntent: 'Commercial'
        }
      ];
    }

    const estimatedTraffic = isRed ? 0.18 : isHeaven ? 543 : isHorny ? 8100 : 1000;
    const totalKeywords = isRed ? 7 : isHeaven ? 30 : isHorny ? 3 : 10;

    return {
      domain,
      totalKeywords,
      top3Count: baseKeywords.filter(k => k.position <= 3).length,
      top10Count: baseKeywords.filter(k => k.position <= 10).length,
      top50Count: totalKeywords,
      estimatedTraffic,
      trafficValue: isRed ? 0 : isHeaven ? 306 : isHorny ? 4100 : 100,
      keywords: baseKeywords
    };
  }

  private generateMockTopPages(domain: string): TopPagesReport {
    const pages: TopPageItem[] = [
      {
        url: `https://${domain}/`,
        organicTraffic: 8500,
        trafficChange: 420,
        rankingKeywords: 180,
        topKeyword: `${domain.split('.')[0]} official`,
        trafficValue: 14500
      },
      {
        url: `https://${domain}/review`,
        organicTraffic: 3200,
        trafficChange: 250,
        rankingKeywords: 85,
        topKeyword: `${domain.split('.')[0]} review`,
        trafficValue: 6200
      },
      {
        url: `https://${domain}/features`,
        organicTraffic: 1900,
        trafficChange: -80,
        rankingKeywords: 45,
        topKeyword: `best ${domain.split('.')[0]} platform`,
        trafficValue: 3400
      }
    ];

    const totalOrganicTraffic = pages.reduce((acc, p) => acc + p.organicTraffic, 0);
    const totalTrafficValue = pages.reduce((acc, p) => acc + p.trafficValue, 0);

    return {
      domain,
      totalPages: pages.length,
      totalOrganicTraffic,
      totalTrafficValue,
      pages
    };
  }

  private generateMockCompetitorOverview(targetDomain: string, competitorDomain: string): CompetitorMetrics {
    const seed = (targetDomain + competitorDomain).length;
    return {
      targetDomain,
      competitorDomain,
      domainRating: 42 + (seed % 18),
      organicTraffic: 18500 + (seed * 1200),
      trafficValue: 32000 + (seed * 2100),
      sharedKeywords: 140 + (seed * 12),
      competitorExclusiveKeywords: 310 + (seed * 25),
      gapOpportunities: [
        {
          keyword: `top alternatives to ${competitorDomain.split('.')[0]}`,
          competitorPosition: 3,
          searchVolume: 5400,
          keywordDifficulty: 24,
          searchIntent: 'Commercial'
        },
        {
          keyword: `${competitorDomain.split('.')[0]} promo codes`,
          competitorPosition: 2,
          searchVolume: 3200,
          keywordDifficulty: 18,
          searchIntent: 'Transactional'
        }
      ]
    };
  }

  private generateMockBacklinkReport(domain: string): BacklinkAuditReport {
    const seed = domain.length;
    const domainRating = 35 + (seed % 25);
    const totalBacklinks = 1500 + (seed * 300);
    const referringDomains = 250 + (seed * 45);
    const dofollowBacklinks = Math.round(totalBacklinks * 0.78);
    const dofollowRefdomains = Math.round(referringDomains * 0.84);

    const recentBacklinks: BacklinkItem[] = [
      {
        urlFrom: `https://techblog-news.org/review/${domain.replace(/\./g, '-')}`,
        urlTo: `https://${domain}/`,
        anchorText: domain,
        domainRatingFrom: domainRating + 5,
        isDofollow: true,
        firstSeen: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastSeen: new Date().toISOString(),
        status: 'LIVE'
      },
      {
        urlFrom: `https://industry-directory.com/listing/${domain}`,
        urlTo: `https://${domain}/about`,
        anchorText: `visit ${domain}`,
        domainRatingFrom: domainRating - 3,
        isDofollow: true,
        firstSeen: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastSeen: new Date().toISOString(),
        status: 'LIVE'
      }
    ];

    return {
      domain,
      totalBacklinks,
      referringDomains,
      dofollowRatio: 0.78,
      dofollowBacklinks,
      dofollowRefdomains,
      topAnchors: [
        { anchor: domain, count: Math.round(referringDomains * 0.4) },
        { anchor: `visit ${domain}`, count: Math.round(referringDomains * 0.25) }
      ],
      recentBacklinks,
      seoHealthScore: calculateSeoHealthScore({
        domainRating,
        referringDomains,
        totalBacklinks,
        dofollowLinks: dofollowBacklinks,
        estimatedTraffic: 14500 + (seed * 1100),
        top10Count: 65
      })
    };
  }

  private generateMockDomainOverview(domain: string): DomainOverviewMetrics {
    const isRed = domain.includes('red-engage');
    const isHeaven = domain.includes('heavengirlfriend');
    const isHorny = domain.includes('hornycompanion');

    const domainRating = isRed ? 26 : isHeaven ? 21 : isHorny ? 2 : 30;
    const urlRating = isRed ? 12 : isHeaven ? 18 : isHorny ? 5 : 15;
    const ahrefsRank = isRed ? 5469562 : isHeaven ? 8104494 : isHorny ? 12500000 : 4028135;
    const totalBacklinks = isRed ? 745 : isHeaven ? 804 : isHorny ? 389 : 1200;
    const referringDomains = isRed ? 423 : isHeaven ? 527 : isHorny ? 389 : 350;
    const dofollowBacklinks = Math.round(totalBacklinks * 0.78);
    const dofollowRefdomains = Math.round(referringDomains * 0.84);
    const nofollowLinks = Math.round(totalBacklinks * 0.22);
    const organicTraffic = isRed ? 0.18 : isHeaven ? 543 : isHorny ? 8100 : 1200;
    const trafficValue = isRed ? 0 : isHeaven ? 306 : isHorny ? 4100 : 500;
    const rankingKeywords = isRed ? 7 : isHeaven ? 30 : isHorny ? 3 : 25;
    const siteAuditHealthScore = isRed ? 95 : isHeaven ? 94 : isHorny ? 99 : 95;

    const seoHealthScore = calculateSeoHealthScore({
      domainRating,
      referringDomains,
      totalBacklinks,
      dofollowLinks: dofollowBacklinks,
      estimatedTraffic: organicTraffic,
      top10Count: Math.round(rankingKeywords * 0.15),
      siteAuditHealthScore
    });

    return {
      domain,
      domainRating,
      urlRating,
      ahrefsRank,
      organicTraffic,
      trafficValue,
      rankingKeywords,
      totalBacklinks,
      referringDomains,
      dofollowBacklinks,
      dofollowRefdomains,
      nofollowLinks,
      timestamp: new Date().toISOString(),
      seoHealthScore
    };
  }
}

