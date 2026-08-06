import { ComparisonEngine } from '../../src/comparison';
import { DomainSnapshot } from '../../src/types';

describe('ComparisonEngine', () => {
  const engine = new ComparisonEngine();

  const currentSnap: DomainSnapshot = {
    snapshotId: 'snap_curr',
    domain: 'example.com',
    timestamp: '2026-08-06T00:00:00Z',
    domainRating: 50,
    referringDomains: 300,
    totalBacklinks: 1500,
    estimatedTraffic: 20000,
    organicKeywords: 500,
    overview: {
      domain: 'example.com',
      domainRating: 50,
      urlRating: 30,
      ahrefsRank: 100000,
      organicTraffic: 20000,
      trafficValue: 35000,
      rankingKeywords: 500,
      totalBacklinks: 1500,
      referringDomains: 300,
      dofollowBacklinks: 1200,
      dofollowRefdomains: 250,
      nofollowLinks: 300,
      timestamp: '2026-08-06T00:00:00Z'
    },
    keywords: {
      domain: 'example.com',
      totalKeywords: 500,
      top3Count: 15,
      top10Count: 50,
      top50Count: 250,
      estimatedTraffic: 20000,
      keywords: [
        {
          keyword: 'example kw',
          position: 3,
          previousPosition: 5,
          positionChange: 2,
          searchVolume: 5000,
          keywordDifficulty: 20,
          estimatedTraffic: 2000,
          trafficChange: 300,
          url: 'https://example.com',
          serpFeatures: [],
          searchIntent: 'Informational'
        }
      ]
    },
    topPages: {
      domain: 'example.com',
      totalPages: 1,
      totalOrganicTraffic: 20000,
      totalTrafficValue: 35000,
      pages: [
        {
          url: 'https://example.com/',
          organicTraffic: 20000,
          trafficChange: 1000,
          rankingKeywords: 500,
          topKeyword: 'example kw',
          trafficValue: 35000
        }
      ]
    },
    backlinks: {
      domain: 'example.com',
      totalBacklinks: 1500,
      referringDomains: 300,
      dofollowRatio: 0.80,
      topAnchors: [],
      recentBacklinks: []
    },
    competitors: [],
    seoHealthScore: {
      score: 85,
      grade: 'A',
      breakdown: { domainRatingScore: 15, referringDomainsScore: 20, trafficScore: 15, dofollowScore: 15, serpScore: 10 },
      recommendations: []
    }
  };

  const prevSnap: DomainSnapshot = {
    ...currentSnap,
    snapshotId: 'snap_prev',
    timestamp: '2026-07-30T00:00:00Z',
    domainRating: 48,
    referringDomains: 280,
    estimatedTraffic: 18000,
    overview: {
      ...currentSnap.overview,
      domainRating: 48,
      referringDomains: 280,
      organicTraffic: 18000
    },
    seoHealthScore: {
      score: 80,
      grade: 'B',
      breakdown: { domainRatingScore: 13, referringDomainsScore: 18, trafficScore: 12, dofollowScore: 15, serpScore: 10 },
      recommendations: []
    }
  };

  it('should mark snapshot as NEW when previous is undefined', () => {
    const comparison = engine.compareSnapshots(currentSnap);
    expect(comparison.trendDirection).toBe('NEW');
  });

  it('should calculate deltas correctly against previous snapshot', () => {
    const comparison = engine.compareSnapshots(currentSnap, prevSnap);
    expect(comparison.drChange).toBe(2);
    expect(comparison.trafficChange).toBe(2000);
    expect(comparison.referringDomainsChange).toBe(20);
    expect(comparison.healthScoreChange).toBe(5);
    expect(comparison.trendDirection).toBe('UP');
  });
});
