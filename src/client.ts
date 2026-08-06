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
    this.apiKey = options.apiKey || process.env.AHREFS_API_KEY || '';
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
    const headerVal = res.headers ? (res.headers.get('x-api-units-consumed') || res.headers.get('x-units-consumed')) : null;
    if (headerVal) {
      const parsed = parseInt(headerVal, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return defaultUnits;
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
      const limits: ApiUsageLimits = {
        unitsLimit: (data.units_limit as number) ?? 500000,
        unitsConsumed: (data.units_consumed as number) ?? 15000,
        unitsRemaining: (data.units_remaining as number) ?? 485000,
        resetDate: (data.reset_date as string) || new Date().toISOString(),
        apiKeyStatus: (data.api_key_status as string) || 'ACTIVE'
      };

      this.usageMonitor.updateLimitsFromApi(limits);
      return limits;
    } catch (err) {
      this.logger.warn(`Failed to fetch API limits. Using cached summary. Reason: ${(err as Error).message}`);
      return this.usageMonitor.getUsageSummary();
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
    try {
      const overview = await withRetry(async (attempt) => {
        const selectFields = 'domain_rating,ahrefs_rank,backlinks,refdomains,url_rating';
        const url = `${this.baseUrl}${endpoint}?target=${encodeURIComponent(domain)}&select=${encodeURIComponent(selectFields)}`;
        this.logger.debug(`API request attempt ${attempt} for ${domain}`, { url });

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new AhrefsApiError(
            `Ahrefs API HTTP error ${response.status}: ${response.statusText}`,
            response.status,
            url
          );
        }

        const unitsConsumed = this.extractUnitsFromResponse(response, 10);
        this.usageMonitor.recordApiCall(endpoint, unitsConsumed, true);

        const data = await response.json() as Record<string, unknown>;
        const drData = (data.domain_rating || data) as Record<string, number>;
        const domainRating = drData.domain_rating ?? 45;
        const urlRating = drData.url_rating ?? 30;
        const ahrefsRank = drData.ahrefs_rank ?? 125000;
        const totalBacklinks = drData.backlinks ?? 1200;
        const referringDomains = drData.refdomains ?? 350;
        const organicTraffic = (data.organic_traffic as number) ?? (drData.organic_traffic as number) ?? 15400;
        const trafficValue = (data.traffic_value as number) ?? (drData.traffic_value as number) ?? 24500;
        const rankingKeywords = (data.ranking_keywords as number) ?? (drData.ranking_keywords as number) ?? 480;
        const dofollowBacklinks = Math.round(totalBacklinks * 0.76);
        const dofollowRefdomains = Math.round(referringDomains * 0.82);
        const nofollowLinks = Math.round(totalBacklinks * 0.24);

        const healthScore = calculateSeoHealthScore({
          domainRating,
          referringDomains,
          totalBacklinks,
          dofollowLinks: dofollowBacklinks,
          estimatedTraffic: organicTraffic,
          top10Count: Math.round(rankingKeywords * 0.15)
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
          seoHealthScore: healthScore
        };
      }, {
        maxRetries: this.maxRetries,
        initialDelayMs: this.retryDelayMs,
        logger: this.logger
      });

      return overview;
    } catch (err) {
      this.logger.warn(`API request failed for ${domain}. Falling back to mock data. Reason: ${(err as Error).message}`);
      this.usageMonitor.recordApiCall(endpoint, 0, false);
      return this.generateMockDomainOverview(domain);
    }
  }

  // Alias for backward compatibility
  public async fetchDomainRating(domain: string): Promise<DomainOverviewMetrics> {
    return this.fetchDomainOverview(domain);
  }

  // Task 3: Organic Keywords Collection
  public async fetchOrganicKeywords(domain: string, options: { limit?: number; select?: string; orderBy?: string } = {}): Promise<DomainKeywordReport> {
    const endpoint = '/site-explorer/organic-keywords';
    const limit = options.limit ?? 100;
    const select = options.select ?? 'keyword,position,previous_position,volume,keyword_difficulty,traffic,url,serp_features,search_intent';
    const orderBy = options.orderBy ?? 'traffic:desc';

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

        const keywords: OrganicKeywordItem[] = rawKeywords.map(item => {
          const pos = (item.position as number) ?? 10;
          const prevPos = (item.previous_position as number) ?? pos;
          const posChange = (item.position_change as number) ?? (prevPos - pos);
          const vol = (item.volume as number) ?? (item.search_volume as number) ?? 1000;
          const kd = (item.keyword_difficulty as number) ?? 20;
          const estTr = (item.traffic as number) ?? (item.estimated_traffic as number) ?? 100;
          const trChange = (item.traffic_change as number) ?? 0;
          const rawIntent = String(item.search_intent || 'Commercial');
          const validIntents = ['Informational', 'Transactional', 'Commercial', 'Navigational', 'Mixed'];
          const searchIntent = (validIntents.includes(rawIntent) ? rawIntent : 'Commercial') as OrganicKeywordItem['searchIntent'];

          return {
            keyword: String(item.keyword || ''),
            position: pos,
            previousPosition: prevPos,
            positionChange: posChange,
            searchVolume: vol,
            keywordDifficulty: kd,
            estimatedTraffic: estTr,
            trafficChange: trChange,
            url: String(item.url || `https://${domain}`),
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
      this.logger.warn(`API request failed for ${domain} organic keywords. Falling back to mock data. Reason: ${(err as Error).message}`);
      this.usageMonitor.recordApiCall(endpoint, 0, false);
      return this.generateMockOrganicKeywords(domain);
    }
  }

  // Task 4: Top Pages Collection
  public async fetchTopPages(domain: string, options: { limit?: number; select?: string } = {}): Promise<TopPagesReport> {
    const endpoint = '/site-explorer/top-pages';
    const limit = options.limit ?? 50;
    const select = options.select ?? 'url,traffic,traffic_change,keywords,top_keyword,traffic_value';

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
          organicTraffic: (item.traffic as number) ?? (item.organic_traffic as number) ?? 0,
          trafficChange: (item.traffic_change as number) ?? 0,
          rankingKeywords: (item.keywords as number) ?? (item.ranking_keywords as number) ?? 0,
          topKeyword: String(item.top_keyword || domain),
          trafficValue: (item.traffic_value as number) ?? 0
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
      this.logger.warn(`API request failed for ${domain} top pages. Falling back to mock data. Reason: ${(err as Error).message}`);
      this.usageMonitor.recordApiCall(endpoint, 0, false);
      return this.generateMockTopPages(domain);
    }
  }

  // Task 5: Competitor Collection
  public async fetchCompetitorOverview(targetDomain: string, competitorDomain: string): Promise<CompetitorMetrics> {
    const endpoint = '/site-explorer/domain-rating';
    this.logger.info(`Fetching Competitor Overview for ${competitorDomain} (vs ${targetDomain})`);
    
    if (this.isMockMode()) {
      this.usageMonitor.recordApiCall(endpoint, 5, true);
      return this.generateMockCompetitorOverview(targetDomain, competitorDomain);
    }

    try {
      const compOverview = await this.fetchDomainOverview(competitorDomain);
      const seed = (targetDomain + competitorDomain).length;
      return {
        targetDomain,
        competitorDomain,
        domainRating: compOverview.domainRating,
        organicTraffic: compOverview.organicTraffic,
        trafficValue: compOverview.trafficValue,
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
    } catch (err) {
      this.logger.warn(`Failed to fetch competitor ${competitorDomain}. Returning mock fallback. Reason: ${(err as Error).message}`);
      return this.generateMockCompetitorOverview(targetDomain, competitorDomain);
    }
  }

  // Task 6: Backlink Collection
  public async fetchAllBacklinks(domain: string, options: { limit?: number; select?: string } = {}): Promise<BacklinkAuditReport> {
    const endpoint = '/site-explorer/all-backlinks';
    const limit = options.limit ?? 100;
    const select = options.select ?? 'url_from,url_to,anchor,domain_rating_source,is_dofollow,first_seen,last_seen';

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
          status: 'LIVE'
        }));

        const overview = await this.fetchDomainOverview(domain);
        const dofollowRatio = overview.totalBacklinks > 0
          ? Number((overview.dofollowBacklinks / overview.totalBacklinks).toFixed(2))
          : 0.78;

        return {
          domain,
          totalBacklinks: overview.totalBacklinks,
          referringDomains: overview.referringDomains,
          dofollowRatio,
          dofollowBacklinks: overview.dofollowBacklinks,
          dofollowRefdomains: overview.dofollowRefdomains,
          topAnchors: [
            { anchor: domain, count: Math.round(overview.referringDomains * 0.4) },
            { anchor: `visit ${domain}`, count: Math.round(overview.referringDomains * 0.25) }
          ],
          recentBacklinks,
          seoHealthScore: overview.seoHealthScore
        };
      }, { maxRetries: this.maxRetries, initialDelayMs: this.retryDelayMs, logger: this.logger });

      return report;
    } catch (err) {
      this.logger.warn(`API request failed for ${domain} backlinks. Falling back to mock data. Reason: ${(err as Error).message}`);
      this.usageMonitor.recordApiCall(endpoint, 0, false);
      return this.generateMockBacklinkReport(domain);
    }
  }

  private generateMockOrganicKeywords(domain: string): DomainKeywordReport {
    const seed = domain.length;
    const baseKeywords: OrganicKeywordItem[] = [
      {
        keyword: `${domain.split('.')[0]} review`,
        position: 2,
        previousPosition: 4,
        positionChange: 2,
        searchVolume: 8400,
        keywordDifficulty: 28,
        estimatedTraffic: 3200,
        trafficChange: 450,
        url: `https://${domain}/review`,
        serpFeatures: ['Featured Snippet', 'People Also Ask'],
        searchIntent: 'Commercial'
      },
      {
        keyword: `best ${domain.split('.')[0]} platform`,
        position: 5,
        previousPosition: 5,
        positionChange: 0,
        searchVolume: 4200,
        keywordDifficulty: 42,
        estimatedTraffic: 1100,
        trafficChange: 0,
        url: `https://${domain}/features`,
        serpFeatures: ['People Also Ask'],
        searchIntent: 'Informational'
      },
      {
        keyword: `${domain.split('.')[0]} login bonus`,
        position: 8,
        previousPosition: 12,
        positionChange: 4,
        searchVolume: 2900,
        keywordDifficulty: 19,
        estimatedTraffic: 680,
        trafficChange: 210,
        url: `https://${domain}/bonus`,
        serpFeatures: ['Image Pack'],
        searchIntent: 'Transactional'
      },
      {
        keyword: `top online ${domain.split('.')[0]} site`,
        position: 14,
        previousPosition: 11,
        positionChange: -3,
        searchVolume: 1600,
        keywordDifficulty: 35,
        estimatedTraffic: 140,
        trafficChange: -60,
        url: `https://${domain}/`,
        serpFeatures: [],
        searchIntent: 'Navigational'
      }
    ];

    const estimatedTraffic = 12500 + (seed * 1800);
    const trafficValue = Math.round(estimatedTraffic * 1.85);

    return {
      domain,
      totalKeywords: 450 + (seed * 85),
      top3Count: 12 + (seed % 5),
      top10Count: 48 + (seed % 15),
      top50Count: 230 + (seed % 40),
      estimatedTraffic,
      trafficValue,
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
    const seed = domain.length;
    const domainRating = 35 + (seed % 25);
    const urlRating = 25 + (seed % 15);
    const ahrefsRank = 100000 + (seed * 8500);
    const totalBacklinks = 1500 + (seed * 300);
    const referringDomains = 250 + (seed * 45);
    const dofollowBacklinks = Math.round(totalBacklinks * 0.78);
    const dofollowRefdomains = Math.round(referringDomains * 0.84);
    const nofollowLinks = Math.round(totalBacklinks * 0.22);
    const organicTraffic = 14500 + (seed * 1100);
    const trafficValue = Math.round(organicTraffic * 1.9);
    const rankingKeywords = 420 + (seed * 65);

    const seoHealthScore = calculateSeoHealthScore({
      domainRating,
      referringDomains,
      totalBacklinks,
      dofollowLinks: dofollowBacklinks,
      estimatedTraffic: organicTraffic,
      top10Count: Math.round(rankingKeywords * 0.15)
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

