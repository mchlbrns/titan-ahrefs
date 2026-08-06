import { ApiUsageMonitor } from '../../src/usage';

describe('ApiUsageMonitor', () => {
  it('should initialize with default limits', () => {
    const monitor = new ApiUsageMonitor();
    const summary = monitor.getUsageSummary();

    expect(summary.unitsLimit).toBeGreaterThan(0);
    expect(summary.unitsRemaining).toBeGreaterThan(0);
    expect(summary.apiKeyStatus).toBe('ACTIVE');
  });

  it('should record API calls and track request costs', () => {
    const monitor = new ApiUsageMonitor();
    const log = monitor.recordApiCall('/site-explorer/domain-rating', 10, true);

    expect(log.endpoint).toBe('/site-explorer/domain-rating');
    expect(log.unitsConsumed).toBe(10);
    expect(log.estimatedCostUsd).toBeGreaterThan(0);

    const logs = monitor.getRequestLogs();
    expect(logs.length).toBe(1);
    expect(monitor.getTotalCostUsd()).toBeGreaterThan(0);
  });

  it('should update limits from API payload', () => {
    const monitor = new ApiUsageMonitor();
    monitor.updateLimitsFromApi({
      unitsLimit: 500000,
      unitsRemaining: 450000,
      apiKeyStatus: 'ACTIVE'
    });

    const summary = monitor.getUsageSummary();
    expect(summary.unitsLimit).toBe(500000);
    expect(summary.unitsRemaining).toBe(450000);
  });
});
