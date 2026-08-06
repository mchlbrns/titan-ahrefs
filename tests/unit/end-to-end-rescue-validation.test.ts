import { AhrefsClient } from '../../src/client';
import { CompetitorAnalyzer } from '../../src/competitors';
import { RecommendationEngine } from '../../src/recommendations';
import { SnapshotStore } from '../../src/snapshots';
import { ComparisonEngine } from '../../src/comparison';
import { ReportGenerator } from '../../src/reports';

describe('ULTIMATE DEPLOYMENT RESCUE — End-to-End Validation Suite', () => {
  let client: AhrefsClient;
  let competitorAnalyzer: CompetitorAnalyzer;
  let recEngine: RecommendationEngine;
  let comparisonEngine: ComparisonEngine;

  beforeEach(() => {
    client = new AhrefsClient();
    competitorAnalyzer = new CompetitorAnalyzer(client);
    recEngine = new RecommendationEngine();
    comparisonEngine = new ComparisonEngine();
  });

  test('Priority 2.1: Usage Stats Parser parses units_limit_workspace correctly', async () => {
    const limits = await client.fetchLimitsAndUsage();
    expect(limits.unitsLimit).toBeGreaterThan(0);
    expect(limits.unitsConsumed).toBeGreaterThanOrEqual(0);
    expect(limits.unitsRemaining).toBeGreaterThanOrEqual(0);
    expect(limits.apiKeyStatus).toBe('ACTIVE');
  });

  test('Priority 2.2: Domain Rating Parser handles nested and flat payload structures', async () => {
    const overview = await client.fetchDomainOverview('chumbacasino.com');
    expect(typeof overview.domainRating).toBe('number');
    expect(overview.domainRating).toBeGreaterThan(0);
    expect(typeof overview.ahrefsRank).toBe('number');
  });

  test('Priority 2.3: Organic Keywords filter malformed rows cleanly', async () => {
    const report = await client.fetchOrganicKeywords('chumbacasino.com');
    expect(report.domain).toBe('chumbacasino.com');
    expect(Array.isArray(report.keywords)).toBe(true);
    for (const kw of report.keywords) {
      expect(typeof kw.keyword).toBe('string');
      expect(kw.keyword.length).toBeGreaterThan(0);
    }
  });

  test('Priority 4: Competitor Discovery Matrix populates DR, overlap, and traffic', async () => {
    const competitors = ['chumbacasino.com', 'pulsz.com', 'luckylandslots.com'];
    for (const comp of competitors) {
      const compOverview = await competitorAnalyzer.analyzeCompetitorGap('titantreasure.com', comp);
      expect(compOverview.targetDomain).toBe('titantreasure.com');
      expect(compOverview.competitorDomain).toBe(comp);
      expect(compOverview.domainRating).toBeGreaterThan(0);
      expect(compOverview.organicTraffic).toBeGreaterThan(0);
    }
  });

  test('Priority 5: Real Traffic Domain (chumbacasino.com) produces non-zero results', async () => {
    const [overview, keywords, topPages] = await Promise.all([
      client.fetchDomainOverview('chumbacasino.com'),
      client.fetchOrganicKeywords('chumbacasino.com'),
      client.fetchTopPages('chumbacasino.com')
    ]);

    expect(overview.domainRating).toBeGreaterThan(0);
    expect(overview.organicTraffic).toBeGreaterThan(0);
    expect(keywords.totalKeywords).toBeGreaterThan(0);
    expect(topPages.totalPages).toBeGreaterThan(0);
  });

  test('Priority 7: Snapshot Store and Week-over-Week Comparison produce actual deltas', async () => {
    const mockClient = new AhrefsClient();
    const snapStore = new SnapshotStore(undefined, mockClient);

    const prevSnap = await snapStore.createSnapshot('chumbacasino.com');
    prevSnap.timestamp = new Date(Date.now() - 7 * 86400000).toISOString();
    prevSnap.domainRating = 50;
    prevSnap.estimatedTraffic = 10000;
    if (prevSnap.overview) {
      prevSnap.overview.domainRating = 50;
      prevSnap.overview.organicTraffic = 10000;
    }

    const curSnap = await snapStore.createSnapshot('chumbacasino.com');
    curSnap.timestamp = new Date().toISOString();
    curSnap.domainRating = 52;
    curSnap.estimatedTraffic = 12500;
    if (curSnap.overview) {
      curSnap.overview.domainRating = 52;
      curSnap.overview.organicTraffic = 12500;
    }

    const trend = comparisonEngine.compareSnapshots(curSnap, prevSnap);
    expect(trend.trendDirection).toBe('UP');
    expect(trend.drChange).toBe(2);
    expect(trend.trafficChange).toBe(2500);
  });


});
