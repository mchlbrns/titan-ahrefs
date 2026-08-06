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
});
