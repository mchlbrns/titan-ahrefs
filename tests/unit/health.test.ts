import { calculateSeoHealthScore } from '../../src/health';

describe('SEO Health Score Engine Unit Tests', () => {
  test('calculates correct score and grade for high authority domain', () => {
    const health = calculateSeoHealthScore({
      domainRating: 85,
      referringDomains: 600,
      totalBacklinks: 10000,
      dofollowLinks: 7500,
      estimatedTraffic: 25000,
      top10Count: 60
    });

    expect(health.score).toBeGreaterThanOrEqual(85);
    expect(['A+', 'A']).toContain(health.grade);
    expect(health.breakdown.domainRatingScore).toBe(25.5);
    expect(health.breakdown.referringDomainsScore).toBe(25);
    expect(health.breakdown.trafficScore).toBe(20);
    expect(health.breakdown.dofollowScore).toBe(15);
    expect(health.breakdown.serpScore).toBe(10);
    expect(health.recommendations.length).toBeGreaterThan(0);
  });

  test('calculates score and recommendations for lower authority domain', () => {
    const health = calculateSeoHealthScore({
      domainRating: 20,
      referringDomains: 50,
      totalBacklinks: 200,
      dofollowLinks: 50,
      estimatedTraffic: 500,
      top10Count: 5
    });

    expect(health.score).toBeLessThan(70);
    expect(['C', 'D', 'F']).toContain(health.grade);
    expect(health.recommendations.length).toBeGreaterThanOrEqual(3);
  });

  test('handles zero backlinks without dividing by zero', () => {
    const health = calculateSeoHealthScore({
      domainRating: 0,
      referringDomains: 0,
      totalBacklinks: 0,
      dofollowLinks: 0
    });

    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.breakdown.dofollowScore).toBe(5);
    expect(health.grade).toBe('F');
  });
});
