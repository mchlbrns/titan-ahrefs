import { AhrefsClient } from '../../src/client';
import { ApiUsageMonitor } from '../../src/usage';
import { SnapshotStore } from '../../src/snapshots';
import { ComparisonEngine } from '../../src/comparison';
import { RecommendationEngine } from '../../src/recommendations';
import { ReportGenerator } from '../../src/reports';
import { ConfigLoader } from '../../src/config';
import { withRetry } from '../../src/utils/retry';
import { DomainSnapshot } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('Ahrefs API v3 Reporting Engine Compliance & Validation Suite', () => {
  const originalEnv = process.env;
  const testOutputDir = path.join(__dirname, '../scratch/validation_reports');
  const testSnapshotDir = path.join(__dirname, '../scratch/validation_snapshots');

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    if (!fs.existsSync(testOutputDir)) fs.mkdirSync(testOutputDir, { recursive: true });
    if (!fs.existsSync(testSnapshotDir)) fs.mkdirSync(testSnapshotDir, { recursive: true });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // Task 1, 2, 3, 4 & 5: Live API Endpoint, Query Parameters, Select, Limits & Normalization
  test('Task 1-5: Validates official Ahrefs API v3 endpoints, request parameters, select fields, limits, and normalization', async () => {
    const interceptedRequests: { url: string; headers: Record<string, string> }[] = [];

    global.fetch = jest.fn().mockImplementation(async (urlStr: string, options: RequestInit) => {
      const url = new URL(urlStr);
      interceptedRequests.push({
        url: urlStr,
        headers: (options.headers || {}) as Record<string, string>
      });

      // Route mock responses based on endpoint path
      if (url.pathname.includes('/subscription-info/limits-and-usage')) {
        return {
          ok: true,
          headers: new Headers({ 'x-api-units-consumed': '1' }),
          json: async () => ({
            units_limit: 1000000,
            units_consumed: 25000,
            units_remaining: 975000,
            reset_date: '2026-09-01',
            api_key_status: 'ACTIVE'
          })
        };
      }

      if (url.pathname.includes('/site-explorer/domain-rating')) {
        return {
          ok: true,
          headers: new Headers({ 'x-api-units-consumed': '10' }),
          json: async () => ({
            domain_rating: {
              domain_rating: 62,
              ahrefs_rank: 45000,
              backlinks: 8500,
              refdomains: 620,
              url_rating: 38,
              organic_traffic: 24000,
              traffic_value: 38000,
              ranking_keywords: 920
            }
          })
        };
      }

      if (url.pathname.includes('/site-explorer/organic-keywords')) {
        return {
          ok: true,
          headers: new Headers({ 'x-api-units-consumed': '5' }),
          json: async () => ({
            keywords: [
              {
                keyword: 'red engage review',
                position: 1,
                previous_position: 3,
                position_change: 2,
                volume: 9500,
                keyword_difficulty: 25,
                traffic: 3400,
                traffic_change: 500,
                url: 'https://red-engage.com/review',
                serp_features: ['Featured Snippet'],
                search_intent: 'Commercial'
              }
            ]
          })
        };
      }

      if (url.pathname.includes('/site-explorer/top-pages')) {
        return {
          ok: true,
          headers: new Headers({ 'x-api-units-consumed': '5' }),
          json: async () => ({
            pages: [
              {
                url: 'https://red-engage.com/',
                traffic: 12000,
                traffic_change: 600,
                keywords: 250,
                top_keyword: 'red engage',
                traffic_value: 22000
              }
            ]
          })
        };
      }

      if (url.pathname.includes('/site-explorer/all-backlinks')) {
        return {
          ok: true,
          headers: new Headers({ 'x-api-units-consumed': '10' }),
          json: async () => ({
            backlinks: [
              {
                url_from: 'https://techportal.org/article',
                url_to: 'https://red-engage.com/',
                anchor: 'red engage portal',
                domain_rating_source: 70,
                is_dofollow: true,
                first_seen: '2026-01-01T00:00:00Z',
                last_seen: '2026-08-01T00:00:00Z'
              }
            ]
          })
        };
      }

      throw new Error(`Unexpected endpoint URL: ${urlStr}`);
    });

    const client = new AhrefsClient({ apiKey: 'ahrefs_live_test_token_123', mockFallback: false });

    // 1. Fetch Limits & Usage
    const limits = await client.fetchLimitsAndUsage();
    expect(limits.unitsLimit).toBe(1000000);
    expect(limits.unitsConsumed).toBe(25000);

    // 2. Fetch Domain Overview
    const overview = await client.fetchDomainOverview('red-engage.com');
    expect(overview.domain).toBe('red-engage.com');
    expect(overview.domainRating).toBe(62);
    expect(overview.ahrefsRank).toBe(45000);
    expect(overview.organicTraffic).toBe(24000);

    // 3. Fetch Organic Keywords with select & limit
    const kwReport = await client.fetchOrganicKeywords('red-engage.com', { limit: 10, select: 'keyword,position,volume,traffic' });
    expect(kwReport.keywords.length).toBe(1);
    expect(kwReport.keywords[0].keyword).toBe('red engage review');
    expect(kwReport.keywords[0].positionChange).toBe(2);

    // 4. Fetch Top Pages
    const topPages = await client.fetchTopPages('red-engage.com', { limit: 5 });
    expect(topPages.pages.length).toBe(1);
    expect(topPages.pages[0].organicTraffic).toBe(12000);

    // 5. Fetch Backlinks
    const backlinks = await client.fetchAllBacklinks('red-engage.com');
    expect(backlinks.recentBacklinks.length).toBe(1);
    expect(backlinks.recentBacklinks[0].urlFrom).toBe('https://techportal.org/article');

    // Parameter & Header Verification
    const kwReq = interceptedRequests.find(r => r.url.includes('/organic-keywords'));
    expect(kwReq).toBeDefined();
    const parsedKwUrl = new URL(kwReq!.url);
    expect(parsedKwUrl.searchParams.get('target')).toBe('red-engage.com');
    expect(parsedKwUrl.searchParams.get('select')).toBe('keyword,position,volume,traffic');
    expect(parsedKwUrl.searchParams.get('limit')).toBe('10');
  });

  // Task 6: Normalized Snapshot Generation
  test('Task 6: Validates database normalized snapshot creation and local persistence', async () => {
    const client = new AhrefsClient({ mockFallback: true });
    const store = new SnapshotStore(testSnapshotDir, client);

    const snapshot = await store.createSnapshot('heavengirlfriend.com', ['competitor-a.com']);
    expect(snapshot.snapshotId).toContain('snap_heavengirlfriend_com');
    expect(snapshot.domain).toBe('heavengirlfriend.com');
    expect(snapshot.domainRating).toBeGreaterThan(0);
    expect(snapshot.seoHealthScore).toBeDefined();
    expect(snapshot.seoHealthScore?.score).toBeGreaterThanOrEqual(0);

    const retrieved = store.getLatestSnapshotForDomain('heavengirlfriend.com');
    expect(retrieved).toBeDefined();
    expect(retrieved?.snapshotId).toBe(snapshot.snapshotId);
  });

  // Task 7: Comparison Engine Calculations
  test('Task 7: Validates trend comparison engine calculation logic', () => {
    const engine = new ComparisonEngine();
    const mockOverview = (dr: number, traffic: number) => ({
      domain: 'hornycompanion.com',
      domainRating: dr,
      urlRating: 30,
      ahrefsRank: 100000,
      organicTraffic: traffic,
      trafficValue: 20000,
      rankingKeywords: 500,
      totalBacklinks: 1000,
      referringDomains: 200,
      dofollowBacklinks: 750,
      dofollowRefdomains: 170,
      nofollowLinks: 250,
      timestamp: new Date().toISOString()
    });

    const current: DomainSnapshot = {
      snapshotId: 'snap_cur',
      domain: 'hornycompanion.com',
      timestamp: '2026-08-05T00:00:00Z',
      overview: mockOverview(50, 15000),
      keywords: { domain: 'hornycompanion.com', totalKeywords: 500, top3Count: 10, top10Count: 40, top50Count: 200, estimatedTraffic: 15000, keywords: [] },
      topPages: { domain: 'hornycompanion.com', totalPages: 3, totalOrganicTraffic: 15000, totalTrafficValue: 20000, pages: [] },
      backlinks: { domain: 'hornycompanion.com', totalBacklinks: 1000, referringDomains: 200, dofollowRatio: 0.75, topAnchors: [], recentBacklinks: [] },
      competitors: [],
      domainRating: 50,
      referringDomains: 200,
      totalBacklinks: 1000,
      estimatedTraffic: 15000,
      organicKeywords: 500,
      seoHealthScore: {
        score: 80,
        grade: 'A',
        breakdown: { domainRatingScore: 24, referringDomainsScore: 20, trafficScore: 16, dofollowScore: 12, serpScore: 8 },
        recommendations: []
      }
    };

    const previous: DomainSnapshot = {
      ...current,
      snapshotId: 'snap_prev',
      timestamp: '2026-07-29T00:00:00Z',
      overview: mockOverview(48, 12000),
      domainRating: 48,
      estimatedTraffic: 12000,
      seoHealthScore: {
        score: 75,
        grade: 'B',
        breakdown: { domainRatingScore: 22, referringDomainsScore: 18, trafficScore: 15, dofollowScore: 12, serpScore: 8 },
        recommendations: []
      }
    };

    const trend = engine.compareSnapshots(current, previous);
    expect(trend.drChange).toBe(2);
    expect(trend.trafficChange).toBe(3000);
    expect(trend.healthScoreChange).toBe(5);
    expect(trend.trendDirection).toBe('UP');
  });

  // Task 8: Recommendation Engine Outputs
  test('Task 8: Validates strategic SEO recommendation generation rules', () => {
    const engine = new RecommendationEngine();
    const snapshot: DomainSnapshot = {
      snapshotId: 'snap_rec_test',
      domain: 'red-engage.com',
      timestamp: new Date().toISOString(),
      overview: {
        domain: 'red-engage.com',
        domainRating: 40,
        urlRating: 25,
        ahrefsRank: 150000,
        organicTraffic: 10000,
        trafficValue: 15000,
        rankingKeywords: 300,
        totalBacklinks: 2000,
        referringDomains: 150,
        dofollowBacklinks: 1000,
        dofollowRefdomains: 100,
        nofollowLinks: 1000,
        timestamp: new Date().toISOString()
      },
      keywords: {
        domain: 'red-engage.com',
        totalKeywords: 300,
        top3Count: 5,
        top10Count: 25,
        top50Count: 150,
        estimatedTraffic: 10000,
        keywords: [
          {
            keyword: 'striking distance kw',
            position: 5,
            positionChange: 1,
            searchVolume: 5000,
            keywordDifficulty: 30,
            estimatedTraffic: 1200,
            trafficChange: 100,
            url: 'https://red-engage.com/page',
            serpFeatures: ['People Also Ask'],
            searchIntent: 'Commercial'
          }
        ]
      },
      topPages: { domain: 'red-engage.com', totalPages: 1, totalOrganicTraffic: 10000, totalTrafficValue: 15000, pages: [] },
      backlinks: {
        domain: 'red-engage.com',
        totalBacklinks: 2000,
        referringDomains: 150,
        dofollowRatio: 0.50, // Low ratio (<70%) -> triggers HIGH priority rec
        topAnchors: [],
        recentBacklinks: []
      },
      competitors: [],
      domainRating: 40,
      referringDomains: 150,
      totalBacklinks: 2000,
      estimatedTraffic: 10000,
      organicKeywords: 300
    };

    const recs = engine.generateRecommendations(snapshot);
    expect(recs.length).toBeGreaterThan(0);
    const lowDofollowRec = recs.find(r => r.category === 'BACKLINKS');
    expect(lowDofollowRec).toBeDefined();
    expect(lowDofollowRec?.priority).toBe('HIGH');
  });

  // Task 9: Executive Reporting (HTML, MD, JSON, CSV)
  test('Task 9: Validates 4-format executive report generation', async () => {
    const client = new AhrefsClient({ mockFallback: true });
    const reporter = new ReportGenerator(testOutputDir, client);

    const report = await reporter.generateWeeklyReport(['red-engage.com', 'heavengirlfriend.com'], {
      outputDir: testOutputDir,
      enableHtml: true
    });

    expect(report.generatedAt).toBeDefined();
    expect(report.domainsAudited.length).toBe(2);
    expect(report.markdownContent).toContain('# 📈 Executive Weekly SEO & Ahrefs API Report');
    expect(report.htmlContent).toContain("Pedro's Ahrefs API v3 — Executive Report");
    expect(report.jsonContent).toContain('domainsAudited');
    expect(report.csvContent).toContain('Domain,DomainRating,AhrefsRank');

    const files = fs.readdirSync(testOutputDir);
    expect(files.some(f => f.endsWith('.md'))).toBe(true);
    expect(files.some(f => f.endsWith('.html'))).toBe(true);
    expect(files.some(f => f.endsWith('.json'))).toBe(true);
    expect(files.some(f => f.endsWith('.csv'))).toBe(true);
  });

  // Task 10: API Usage Logging using Response Headers
  test('Task 10: Validates API usage unit extraction from HTTP response headers', async () => {
    const monitor = new ApiUsageMonitor();
    const mockHeaders = new Headers({ 'x-api-units-consumed': '42' });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: mockHeaders,
      json: async () => ({ domain_rating: { domain_rating: 55 } })
    });

    const client = new AhrefsClient({ apiKey: 'live_key', mockFallback: false, usageMonitor: monitor });
    await client.fetchDomainOverview('red-engage.com');

    const logs = monitor.getRequestLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].unitsConsumed).toBe(42);
  });

  // Task 11: Retry and Backoff Behavior
  test('Task 11: Validates exponential backoff and retry behavior on HTTP 429 & 500 errors', async () => {
    let callCount = 0;
    const retryableFn = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error('Ahrefs API HTTP error 429: Too Many Requests');
      }
      return 'SUCCESS';
    });

    const result = await withRetry(retryableFn, { maxRetries: 3, initialDelayMs: 10 });
    expect(result).toBe('SUCCESS');
    expect(callCount).toBe(3);
  });

  // Task 12: Partial Failure Resilience
  test('Task 12: Validates partial report generation when an individual domain or endpoint fails', async () => {
    const client = new AhrefsClient({ mockFallback: true });
    jest.spyOn(client, 'fetchDomainOverview').mockImplementation(async (domain: string) => {
      if (domain === 'failing-domain.com') {
        throw new Error('Network timeout for domain');
      }
      return client['generateMockDomainOverview'](domain);
    });

    const reporter = new ReportGenerator(testOutputDir, client);
    const report = await reporter.generateWeeklyReport(['red-engage.com', 'failing-domain.com'], { outputDir: testOutputDir });

    expect(report.summaries.length).toBe(2);
    const failingSummary = report.summaries.find(s => s.domain === 'failing-domain.com');
    expect(failingSummary).toBeDefined();
    expect(failingSummary?.domain).toBe('failing-domain.com');
    expect(failingSummary?.domainRating).toBeDefined();
  });

  // Task 13: Multi-Domain Configuration
  test('Task 13: Validates multi-domain registry configuration loading', () => {
    const loader = new ConfigLoader();
    const registry = loader.loadDomainRegistry();

    expect(registry.managed_domains.length).toBe(3);
    const domains = registry.managed_domains.map(d => d.domain);
    expect(domains).toContain('red-engage.com');
    expect(domains).toContain('heavengirlfriend.com');
    expect(domains).toContain('hornycompanion.com');

    const compRegistry = loader.loadCompetitorRegistry();
    expect(compRegistry.competitors_by_domain).toBeDefined();
  });
});
