import * as fs from 'fs';
import * as path from 'path';
import { ReportGenerator } from '../../src/reports';
import { AhrefsClient } from '../../src/client';

describe('ReportGenerator Unit Tests', () => {
  const testReportsDir = path.join(__dirname, '../scratch/reports');
  const client = new AhrefsClient({ mockFallback: true });

  afterEach(() => {
    if (fs.existsSync(testReportsDir)) {
      fs.rmSync(testReportsDir, { recursive: true, force: true });
    }
  });

  test('generates Markdown, JSON, and HTML reports', async () => {
    const generator = new ReportGenerator(testReportsDir, client);
    const domains = ['red-engage.com', 'heavengirlfriend.com'];

    const report = await generator.generateWeeklyReport(domains);

    expect(report.domainsAudited).toEqual(domains);
    expect(report.summaries.length).toBe(2);
    expect(report.markdownContent).toContain('Executive Weekly SEO');
    expect(report.htmlContent).toContain('<!DOCTYPE html>');
    expect(report.htmlContent).toContain('Executive SEO Report');

    const files = fs.readdirSync(testReportsDir);
    expect(files.some(f => f.endsWith('.md'))).toBe(true);
    expect(files.some(f => f.endsWith('.json'))).toBe(true);
    expect(files.some(f => f.endsWith('.html'))).toBe(true);
  });
});
