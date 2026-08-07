import { CompetitorAnalyzer } from '../../src/competitors';
import { AhrefsClient } from '../../src/client';

describe('CompetitorAnalyzer Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.AHREFS_API_KEY;
    delete process.env.MOCK_API_FALLBACK;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('analyzes competitor keyword overlap and gaps', async () => {
    const client = new AhrefsClient({ mockFallback: true });
    const analyzer = new CompetitorAnalyzer(client);
    const result = await analyzer.analyzeCompetitorGap('red-engage.com', 'competitor-a.com');

    expect(result.targetDomain).toBe('red-engage.com');
    expect(result.competitorDomain).toBe('competitor-a.com');
    expect(result.sharedKeywords).toBeGreaterThan(0);
    expect(result.competitorExclusiveKeywords).toBeGreaterThan(0);
    expect(result.domainRating).toBeGreaterThan(0);
  });
});
