import { KeywordTracker } from '../../src/keywords';
import { AhrefsClient } from '../../src/client';

describe('KeywordTracker Unit Tests', () => {
  test('fetches organic keyword rankings and traffic estimates', async () => {
    const client = new AhrefsClient({ mockFallback: true });
    const tracker = new KeywordTracker(client);

    const report = await tracker.fetchKeywordRankings('heavengirlfriend.com');

    expect(report.domain).toBe('heavengirlfriend.com');
    expect(report.totalKeywords).toBeGreaterThan(0);
    expect(report.estimatedTraffic).toBeGreaterThan(0);
    expect(report.keywords.length).toBeGreaterThan(0);

    const firstKw = report.keywords[0];
    expect(firstKw.keyword).toBeDefined();
    expect(firstKw.position).toBeGreaterThan(0);
    expect(firstKw.searchVolume).toBeGreaterThan(0);
  });
});
