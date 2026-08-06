import { BacklinkAuditor } from '../../src/backlinks';
import { AhrefsClient } from '../../src/client';

describe('BacklinkAuditor Unit Tests', () => {
  test('audits backlink profile and includes SEO health score', async () => {
    const client = new AhrefsClient({ mockFallback: true });
    const auditor = new BacklinkAuditor(client);

    const report = await auditor.auditBacklinkProfile('red-engage.com');

    expect(report.domain).toBe('red-engage.com');
    expect(report.totalBacklinks).toBeGreaterThan(0);
    expect(report.referringDomains).toBeGreaterThan(0);
    expect(report.dofollowRatio).toBeGreaterThan(0);
    expect(report.topAnchors.length).toBeGreaterThan(0);
    expect(report.recentBacklinks.length).toBeGreaterThan(0);
    expect(report.seoHealthScore).toBeDefined();
    expect(report.seoHealthScore?.score).toBeGreaterThanOrEqual(0);
  });
});
