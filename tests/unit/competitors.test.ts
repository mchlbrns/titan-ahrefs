import { CompetitorAnalyzer } from '../../src/competitors';

describe('CompetitorAnalyzer Unit Tests', () => {
  test('analyzes competitor keyword overlap and gaps', async () => {
    const analyzer = new CompetitorAnalyzer();
    const result = await analyzer.analyzeCompetitorGap('red-engage.com', 'competitor-a.com');

    expect(result.targetDomain).toBe('red-engage.com');
    expect(result.competitorDomain).toBe('competitor-a.com');
    expect(result.sharedKeywords).toBeGreaterThan(0);
    expect(result.competitorExclusiveKeywords).toBeGreaterThan(0);
    expect(result.gapOpportunities.length).toBeGreaterThan(0);
  });
});
