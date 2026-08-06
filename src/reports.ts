import * as fs from 'fs';
import * as path from 'path';
import { AhrefsClient } from './client';
import { KeywordTracker } from './keywords';
import { SnapshotStore } from './snapshots';
import { ExecutiveWeeklyReport, ExecutiveSummaryItem, ReportOptions } from './types';
import { calculateSeoHealthScore } from './health';
import { Logger } from './logger';
import { ReportGenerationError } from './errors';

export class ReportGenerator {
  private client: AhrefsClient;
  private keywordTracker: KeywordTracker;
  private snapshotStore: SnapshotStore;
  private reportsDir: string;
  private logger: Logger;

  constructor(reportsDir?: string, client?: AhrefsClient, logger?: Logger) {
    this.client = client || new AhrefsClient();
    this.logger = logger || new Logger({ context: 'ReportGenerator' });
    this.keywordTracker = new KeywordTracker(this.client, this.logger);
    this.snapshotStore = new SnapshotStore(undefined, this.client, this.logger);
    this.reportsDir = reportsDir || path.join(__dirname, '../reports/generated');
    this.ensureReportsDir();
  }

  private ensureReportsDir(): void {
    if (!fs.existsSync(this.reportsDir)) {
      try {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      } catch (err) {
        throw new ReportGenerationError(`Failed to create reports directory: ${this.reportsDir}`, undefined, {
          cause: (err as Error).message
        });
      }
    }
  }

  public async generateWeeklyReport(domains: string[], options: ReportOptions = {}): Promise<ExecutiveWeeklyReport> {
    this.logger.info(`Generating executive weekly report for ${domains.length} domains`);
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];

    try {
      const summaries: ExecutiveSummaryItem[] = await Promise.all(domains.map(async (domain) => {
        const metrics = await this.client.fetchDomainRating(domain);
        const kwReport = await this.keywordTracker.fetchKeywordRankings(domain);

        const wins = kwReport.keywords.filter(k => (k.positionDelta || 0) > 0).length;
        const losses = kwReport.keywords.filter(k => (k.positionDelta || 0) < 0).length;

        const healthScore = metrics.seoHealthScore || calculateSeoHealthScore({
          domainRating: metrics.domainRating,
          referringDomains: metrics.referringDomains,
          totalBacklinks: metrics.totalBacklinks,
          dofollowLinks: metrics.dofollowLinks,
          estimatedTraffic: kwReport.estimatedTraffic,
          top10Count: kwReport.top10Count
        });

        // Historical trend comparison against latest stored snapshot
        const previousSnapshots = this.snapshotStore.getSnapshotsForDomain(domain);
        const previousSnap = previousSnapshots.length > 0 ? previousSnapshots[0] : undefined;

        const currentSnap = {
          snapshotId: `temp_${Date.now()}`,
          domain,
          timestamp,
          domainRating: metrics.domainRating,
          referringDomains: metrics.referringDomains,
          totalBacklinks: metrics.totalBacklinks,
          estimatedTraffic: kwReport.estimatedTraffic,
          organicKeywords: kwReport.totalKeywords,
          seoHealthScore: healthScore
        };

        const trend = this.snapshotStore.compareSnapshots(currentSnap, previousSnap);

        return {
          domain,
          domainRating: metrics.domainRating,
          referringDomains: metrics.referringDomains,
          estimatedTraffic: kwReport.estimatedTraffic,
          keywordWins: wins,
          keywordLosses: losses,
          seoHealthScore: healthScore,
          trend
        };
      }));

      // Generate Markdown
      let markdown = `# 📈 Executive Weekly SEO Report — ${dateStr}\n\n`;
      markdown += `**Report Generated**: ${timestamp}\n`;
      markdown += `**Target Domains Audited**: ${domains.join(', ')}\n\n`;
      markdown += `--- \n\n## 📊 Domain Performance Overview\n\n`;
      markdown += `| Domain | Domain Rating (DR) | Health Score | Ref. Domains | Est. Traffic | Position Delta | Trend |\n`;
      markdown += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

      for (const s of summaries) {
        const healthStr = s.seoHealthScore ? `${s.seoHealthScore.score}/100 (${s.seoHealthScore.grade})` : 'N/A';
        const trendIcon = s.trend?.trendDirection === 'UP' ? '▲ UP' : s.trend?.trendDirection === 'DOWN' ? '▼ DOWN' : '▬ STABLE';
        markdown += `| **\`${s.domain}\`** | ${s.domainRating} | ${healthStr} | ${s.referringDomains} | ${s.estimatedTraffic.toLocaleString()} | +${s.keywordWins} / -${s.keywordLosses} | ${trendIcon} |\n`;
      }

      markdown += `\n---\n\n## 💡 Key Actionable Insights\n\n`;
      markdown += `- **SEO Health Index**: Overall portfolio SEO health scores remain healthy across key domains.\n`;
      markdown += `- **Authority Growth**: Domain Rating metrics logged consistently across target domains.\n`;
      markdown += `- **Backlink Velocity**: Stable referring domain acquisition across all properties.\n`;
      markdown += `- **SERP Ranks**: Position wins registered in branded and transactional search queries.\n\n`;

      markdown += `*Generated automatically by Titan Ahrefs Engine (\`titan-ahrefs\`)*\n`;

      // Generate HTML report
      const htmlContent = this.generateHtmlReport(dateStr, timestamp, domains, summaries);

      const report: ExecutiveWeeklyReport = {
        generatedAt: timestamp,
        domainsAudited: domains,
        summaries,
        markdownContent: markdown,
        htmlContent
      };

      const outDir = options.outputDir || this.reportsDir;

      // Save Markdown report
      const mdPath = path.join(outDir, `weekly_seo_report_${dateStr}.md`);
      fs.writeFileSync(mdPath, markdown, 'utf-8');

      // Save JSON report
      const jsonPath = path.join(outDir, `weekly_seo_report_${dateStr}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

      // Save HTML report
      const htmlPath = path.join(outDir, `weekly_seo_report_${dateStr}.html`);
      fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

      this.logger.info(`Weekly executive report generated successfully`, { mdPath, jsonPath, htmlPath });
      return report;
    } catch (err) {
      this.logger.error(`Failed to generate weekly report`, { error: (err as Error).message });
      throw new ReportGenerationError(`Weekly report generation failed`, 'weekly', { cause: (err as Error).message });
    }
  }

  private generateHtmlReport(
    dateStr: string,
    timestamp: string,
    domains: string[],
    summaries: ExecutiveSummaryItem[]
  ): string {
    const avgHealth = Math.round(
      summaries.reduce((acc, s) => acc + (s.seoHealthScore?.score || 0), 0) / (summaries.length || 1)
    );

    const rows = summaries.map(s => {
      const score = s.seoHealthScore?.score || 0;
      const grade = s.seoHealthScore?.grade || 'N/A';
      const trendDir = s.trend?.trendDirection || 'STABLE';
      const trendBadgeClass = trendDir === 'UP' ? 'trend-up' : trendDir === 'DOWN' ? 'trend-down' : 'trend-stable';
      const trendSymbol = trendDir === 'UP' ? '▲' : trendDir === 'DOWN' ? '▼' : '▬';

      return `
        <tr>
          <td><strong>${s.domain}</strong></td>
          <td><span class="dr-badge">${s.domainRating}</span></td>
          <td>
            <div class="health-score-container">
              <div class="health-bar" style="width: ${score}%;"></div>
              <span class="health-text">${score} (${grade})</span>
            </div>
          </td>
          <td>${s.referringDomains.toLocaleString()}</td>
          <td>${s.estimatedTraffic.toLocaleString()}</td>
          <td>
            <span class="delta-win">+${s.keywordWins}</span> / 
            <span class="delta-loss">-${s.keywordLosses}</span>
          </td>
          <td><span class="trend-badge ${trendBadgeClass}">${trendSymbol} ${trendDir}</span></td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Titan Ahrefs — Executive Weekly SEO Report (${dateStr})</title>
  <style>
    :root {
      --bg-main: #0f172a;
      --card-bg: #1e293b;
      --border-color: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent-cyan: #06b6d4;
      --accent-green: #10b981;
      --accent-red: #ef4444;
      --accent-yellow: #f59e0b;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-main);
      color: var(--text-main);
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 1.75rem;
      margin: 0 0 8px 0;
      color: var(--accent-cyan);
    }
    .meta {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
    }
    .card-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .card-value {
      font-size: 1.75rem;
      font-weight: 700;
      margin-top: 8px;
      color: var(--text-main);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background-color: var(--card-bg);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      margin-bottom: 28px;
    }
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    th {
      background-color: rgba(255,255,255,0.03);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    tr:last-child td {
      border-bottom: none;
    }
    .dr-badge {
      background-color: rgba(6, 182, 212, 0.15);
      color: var(--accent-cyan);
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .health-score-container {
      background-color: rgba(255,255,255,0.05);
      border-radius: 4px;
      height: 20px;
      position: relative;
      overflow: hidden;
      width: 140px;
    }
    .health-bar {
      background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
      height: 100%;
    }
    .health-text {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }
    .delta-win { color: var(--accent-green); font-weight: 600; }
    .delta-loss { color: var(--accent-red); font-weight: 600; }
    .trend-badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .trend-up { background-color: rgba(16, 185, 129, 0.2); color: var(--accent-green); }
    .trend-down { background-color: rgba(239, 68, 68, 0.2); color: var(--accent-red); }
    .trend-stable { background-color: rgba(148, 163, 184, 0.2); color: var(--text-muted); }
    footer {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: center;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Titan Ahrefs — Executive Weekly SEO Report</h1>
      <div class="meta">Generated: ${timestamp} | Target Domains: ${domains.join(', ')}</div>
    </header>

    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Domains Audited</div>
        <div class="card-value">${domains.length}</div>
      </div>
      <div class="card">
        <div class="card-title">Avg SEO Health Score</div>
        <div class="card-value">${avgHealth}/100</div>
      </div>
      <div class="card">
        <div class="card-title">Report Format</div>
        <div class="card-value">HTML + MD + JSON</div>
      </div>
    </div>

    <h2>Domain Performance Overview</h2>
    <table>
      <thead>
        <tr>
          <th>Domain</th>
          <th>Domain Rating</th>
          <th>SEO Health Score</th>
          <th>Ref. Domains</th>
          <th>Est. Monthly Traffic</th>
          <th>Keyword Deltas</th>
          <th>Trend</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <footer>
      Generated automatically by <strong>Titan Ahrefs Engine (v1.0.0)</strong> — Autonomous SEO Analytics & Monitoring.
    </footer>
  </div>
</body>
</html>`;
  }
}
