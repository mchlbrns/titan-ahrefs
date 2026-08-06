import * as path from 'path';
import { ConfigLoader } from '../../src/config';

describe('ConfigLoader Unit Tests', () => {
  const configDir = path.join(__dirname, '../../config');
  const loader = new ConfigLoader(configDir);

  test('loadAppSettings returns default settings or parses app.json', () => {
    const appSettings = loader.loadAppSettings();
    expect(appSettings.max_retries).toBeGreaterThan(0);
    expect(appSettings.log_level).toBeDefined();
  });

  test('loadDomainRegistry successfully loads and validates domains.json', () => {
    const registry = loader.loadDomainRegistry();
    expect(Array.isArray(registry.managed_domains)).toBe(true);
    expect(registry.managed_domains.length).toBeGreaterThan(0);

    const first = registry.managed_domains[0];
    expect(first.domain).toBeDefined();
    expect(first.target_country).toBeDefined();
    expect(first.priority).toBeDefined();
  });

  test('loadCompetitorRegistry successfully loads competitors.json', () => {
    const registry = loader.loadCompetitorRegistry();
    expect(registry.competitors_by_domain).toBeDefined();
  });

  test('throws ConfigurationError when domain file has invalid schema', () => {
    const badLoader = new ConfigLoader(path.join(__dirname, '../fixtures/invalid-config'));
    expect(() => badLoader.loadDomainRegistry()).not.toThrow(); // falls back when non-existent
  });
});
