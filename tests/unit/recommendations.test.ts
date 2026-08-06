import { RecommendationEngine } from '../../src/recommendations';
import { DomainSnapshot } from '../../src/types';

describe('RecommendationEngine', () => {
  const engine = new RecommendationEngine();

  const mockSnapshot: DomainSnapshot = {
    snapshotId: 'snap_test',
    domain: 'testdomain.com',
    timestamp: new Date().toISOString(),
    domainRating: 40,
    referringDomains: 200,
    totalBacklinks: 1000,
    estimatedTraffic: 10000,
    organicKeywords: 300,
    overview: {
      domain: 'testdomain.com',
      domainRating: 40,
      urlRating: 25,
      ahrefsRank: 150000,
      organicTraffic: 10000,
      trafficValue: 15000,
      rankingKeywords: 300,
      totalBacklinks: 1000,
      referringDomains: 200,
      dofollowBacklinks: 600, // 60% dofollow ratio
      dofollowRefdomains: 150,
      nofollowLinks: 400,
      timestamp: new Date().toISOString()
    },
    keywords: {
      domain: 'testdomain.com',
      totalKeywords: 300,
      top3Count: 5,
      top10Count: 20,
      top50Count: 150,
      estimatedTraffic: 10000,
      keywords: [
        {
          keyword: 'striking kw',
          position: 5,
          previousPosition: 7,
          positionChange: 2,
          searchVolume: 4000,
          keywordDifficulty: 25,
          estimatedTraffic: 1200,
          trafficChange: 300,
          url: 'https://testdomain.com/page',
          serpFeatures: ['People Also Ask'],
          searchIntent: 'Commercial'
        }
      ]
    },
    topPages: {
      domain: 'testdomain.com',
      totalPages: 1,
      totalOrganicTraffic: 10000,
      totalTrafficValue: 15000,
      pages: []
    },
    backlinks: {
      domain: 'testdomain.com',
      totalBacklinks: 1000,
      referringDomains: 200,
      dofollowRatio: 0.60,
      topAnchors: [],
      recentBacklinks: []
    },
    competitors: [
      {
        targetDomain: 'testdomain.com',
        competitorDomain: 'rival.com',
        domainRating: 55,
        organicTraffic: 25000,
        trafficValue: 40000,
        sharedKeywords: 100,
        competitorExclusiveKeywords: 200,
        gapOpportunities: [
          {
            keyword: 'rival best keyword',
            competitorPosition: 2,
            searchVolume: 6000
          }
        ]
      }
    ]
  };

  it('should generate prioritized recommendations based on snapshot data', () => {
    const recs = engine.generateRecommendations(mockSnapshot);
    expect(recs.length).toBeGreaterThan(0);

    const highRecs = recs.filter(r => r.priority === 'HIGH');
    expect(highRecs.length).toBeGreaterThan(0);
    expect(highRecs[0].category).toBe('BACKLINKS');
  });
});
