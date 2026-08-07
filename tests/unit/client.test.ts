import { AhrefsClient } from '../../src/client';

describe('AhrefsClient Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('isMockMode returns true when API key is missing or default', () => {
    const client = new AhrefsClient({ apiKey: '' });
    expect(client.isMockMode()).toBe(true);

    const clientWithPlaceholder = new AhrefsClient({ apiKey: 'your_ahrefs_api_key' });
    expect(clientWithPlaceholder.isMockMode()).toBe(true);
  });

  test('isMockMode returns false when live API key is set and mockFallback is false', () => {
    const client = new AhrefsClient({ apiKey: 'live_sec_key_12345', mockFallback: false });
    expect(client.isMockMode()).toBe(false);
  });

  test('fetchDomainRating generates mock domain rating in mock mode', async () => {
    const client = new AhrefsClient({ mockFallback: true });
    const res = await client.fetchDomainRating('red-engage.com');

    expect(res.domain).toBe('red-engage.com');
    expect(res.domainRating).toBeGreaterThan(0);
    expect(res.referringDomains).toBeGreaterThan(0);
    expect(res.totalBacklinks).toBeGreaterThan(0);
    expect(res.seoHealthScore).toBeDefined();
    expect(res.seoHealthScore?.score).toBeGreaterThanOrEqual(0);
    expect(res.seoHealthScore?.score).toBeLessThanOrEqual(100);
  });

  test('fetchDomainRating handles live API success response', async () => {
    const mockFetch = jest.fn().mockImplementation((url: string) => Promise.resolve({
      ok: true,
      headers: new Headers(),
      json: async () => url.includes('domain-rating') ? { domain_rating: 65, ahrefs_rank: 50000 } :
        url.includes('metrics') ? { metrics: { org_traffic: 15000, org_keywords: 480 } } :
        { metrics: { live: 5000, live_refdomains: 800 } }
    }));
    global.fetch = mockFetch;

    const client = new AhrefsClient({ apiKey: 'real_api_key', mockFallback: false });
    const res = await client.fetchDomainRating('red-engage.com');

    expect(res.domain).toBe('red-engage.com');
    expect(res.domainRating).toBe(65);
    expect(res.urlRating).toBe(0);
    expect(res.totalBacklinks).toBe(5000);
    expect(res.referringDomains).toBe(800);
  });

  test('fetchDomainRating fails closed on API error in live mode', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    global.fetch = mockFetch;

    const client = new AhrefsClient({ apiKey: 'real_api_key', mockFallback: false, maxRetries: 0 });
    await expect(client.fetchDomainRating('red-engage.com')).rejects.toThrow('Ahrefs API HTTP error 500');
  });

  test('fetchRedditThreads parses live API top-pages response', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({
        pages: [
          { url: 'https://reddit.com/r/hiking/comments/abc', top_keyword: 'best hiking boots', top_keyword_volume: 24000, sum_traffic: 1200, ur: 30, keywords: 40 },
          { url: 'https://reddit.com/r/hiking/comments/def', top_keyword: 'what to bring on a day hike', top_keyword_volume: 9000, sum_traffic: 800, ur: 22, keywords: 30 }
        ]
      })
    });
    global.fetch = mockFetch;

    const client = new AhrefsClient({ apiKey: 'real_api_key', mockFallback: false });
    const res = await client.fetchRedditThreads('hiking', { minVolume: 1000 });

    expect(res.target).toBe('reddit.com/r/hiking');
    expect(res.totalThreads).toBe(2);
    expect(res.threads[0].topKeywordVolume).toBe(24000);
    expect(res.threads[0].urlRating).toBe(30);
    expect(res.totalTraffic).toBe(2000);
    expect(mockFetch.mock.calls[0][0]).toContain('/site-explorer/top-pages');
  });

  test('fetchRedditThreads fails closed returning empty report on API error', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests' });
    global.fetch = mockFetch;

    const client = new AhrefsClient({ apiKey: 'real_api_key', mockFallback: false, maxRetries: 0 });
    const res = await client.fetchRedditThreads('hiking');

    expect(res.totalThreads).toBe(0);
    expect(res.threads).toEqual([]);
  });

  test('fetchRedditKeywords parses live organic-keywords response and derives intent', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({
        keywords: [
          { keyword: 'best hiking boots', best_position: 4, volume: 24000, keyword_difficulty: 38, sum_traffic: 1200, is_transactional: true, is_commercial: false, is_informational: false, is_navigational: false },
          { keyword: 'hike length calculator', best_position: 9, volume: 9000, keyword_difficulty: 15, sum_traffic: 500, is_transactional: false, is_commercial: false, is_informational: true, is_navigational: false }
        ]
      })
    });
    global.fetch = mockFetch;

    const client = new AhrefsClient({ apiKey: 'real_api_key', mockFallback: false });
    const res = await client.fetchRedditKeywords('hiking', { minVolume: 500, maxPosition: 12 });

    expect(res.target).toBe('reddit.com/r/hiking');
    expect(res.totalKeywords).toBe(2);
    expect(res.top3Count).toBe(0);
    expect(res.top10Count).toBe(2);
    expect(res.keywords[0].searchIntent).toBe('Transactional');
    expect(res.keywords[1].searchIntent).toBe('Informational');
    expect(mockFetch.mock.calls[0][0]).toContain('/site-explorer/organic-keywords');
  });

  test('fetchRedditKeywords fails closed returning empty report on API error', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: false, status: 402, statusText: 'Payment Required' });
    global.fetch = mockFetch;

    const client = new AhrefsClient({ apiKey: 'real_api_key', mockFallback: false, maxRetries: 0 });
    const res = await client.fetchRedditKeywords('hiking');

    expect(res.totalKeywords).toBe(0);
    expect(res.keywords).toEqual([]);
  });
});
