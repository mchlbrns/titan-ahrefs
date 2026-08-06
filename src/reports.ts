import * as fs from 'fs';
import * as path from 'path';
import { AhrefsClient } from './client';
import { SnapshotStore } from './snapshots';
import { ComparisonEngine } from './comparison';
import { RecommendationEngine } from './recommendations';
import {
  ExecutiveWeeklyReport,
  ExecutiveSummaryItem,
  ReportOptions,
  DomainSnapshot,
  ApiUsageLimits,
  SeoRecommendation
} from './types';
import { calculateSeoHealthScore } from './health';
import { Logger } from './logger';
import { ReportGenerationError } from './errors';

export class ReportGenerator {
  private client: AhrefsClient;
  private snapshotStore: SnapshotStore;
  private comparisonEngine: ComparisonEngine;
  private recommendationEngine: RecommendationEngine;
  private reportsDir: string;
  private logger: Logger;

  constructor(reportsDir?: string, client?: AhrefsClient, logger?: Logger) {
    this.client = client || new AhrefsClient();
    this.logger = logger || new Logger({ context: 'ReportGenerator' });
    this.snapshotStore = new SnapshotStore(undefined, this.client, this.logger);
    this.comparisonEngine = new ComparisonEngine(this.logger);
    this.recommendationEngine = new RecommendationEngine(this.logger);
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
      // 1. Fetch API usage limits & cost tracking
      let apiUsageSummary: ApiUsageLimits | undefined;
      try {
        apiUsageSummary = await this.client.fetchLimitsAndUsage();
      } catch (e) {
        this.logger.warn(`Could not fetch API limits during report generation: ${(e as Error).message}`);
      }

      // 2. Audit each domain resiliently (continue even if one endpoint fails)
      const summaries: ExecutiveSummaryItem[] = await Promise.all(domains.map(async (domain) => {
        let snapshot: DomainSnapshot;
        try {
          snapshot = await this.snapshotStore.createSnapshot(domain);
        } catch (err) {
          this.logger.warn(`Snapshot creation failed for ${domain}. Generating fallback snapshot data.`);
          const overview = await this.client.fetchDomainOverview(domain);
          const keywords = await this.client.fetchOrganicKeywords(domain);
          const topPages = await this.client.fetchTopPages(domain);
          const backlinks = await this.client.fetchAllBacklinks(domain);
          snapshot = {
            snapshotId: `snap_fallback_${domain.replace(/\./g, '_')}_${Date.now()}`,
            domain,
            timestamp,
            overview,
            keywords,
            topPages,
            backlinks,
            competitors: [],
            domainRating: overview.domainRating,
            referringDomains: overview.referringDomains,
            totalBacklinks: overview.totalBacklinks,
            estimatedTraffic: overview.organicTraffic,
            organicKeywords: keywords.totalKeywords,
            seoHealthScore: overview.seoHealthScore
          };
        }

        const previousSnapshots = this.snapshotStore.getSnapshotsForDomain(domain);
        const previousSnap = previousSnapshots.length > 1 ? previousSnapshots[1] : undefined;
        const trend = this.comparisonEngine.compareSnapshots(snapshot, previousSnap);
        const recommendations = this.recommendationEngine.generateRecommendations(snapshot, trend);

        const kwList = snapshot.keywords?.keywords || [];
        const wins = kwList.filter(k => (k.positionChange || 0) > 0).length;
        const losses = kwList.filter(k => (k.positionChange || 0) < 0).length;

        return {
          domain,
          domainRating: snapshot.overview?.domainRating ?? snapshot.domainRating,
          ahrefsRank: snapshot.overview?.ahrefsRank ?? 0,
          organicTraffic: snapshot.overview?.organicTraffic ?? snapshot.estimatedTraffic,
          trafficValue: snapshot.overview?.trafficValue ?? 0,
          referringDomains: snapshot.overview?.referringDomains ?? snapshot.referringDomains,
          totalBacklinks: snapshot.overview?.totalBacklinks ?? snapshot.totalBacklinks,
          keywordWins: wins,
          keywordLosses: losses,
          seoHealthScore: snapshot.seoHealthScore || calculateSeoHealthScore({
            domainRating: snapshot.domainRating,
            referringDomains: snapshot.referringDomains,
            totalBacklinks: snapshot.totalBacklinks,
            dofollowLinks: snapshot.overview?.dofollowBacklinks || Math.round(snapshot.totalBacklinks * 0.75)
          }),
          trend,
          recommendations
        };
      }));

      // 3. Build Markdown Report
      const markdownContent = this.generateMarkdownReport(dateStr, timestamp, domains, summaries, apiUsageSummary);

      // 4. Build HTML Report
      const htmlContent = this.generateHtmlReport(dateStr, timestamp, domains, summaries, apiUsageSummary);

      // 5. Build CSV Report
      const csvContent = this.generateCsvReport(summaries);

      const report: ExecutiveWeeklyReport = {
        generatedAt: timestamp,
        domainsAudited: domains,
        summaries,
        apiUsageSummary,
        markdownContent,
        htmlContent,
        jsonContent: '', // Filled below
        csvContent
      };
      report.jsonContent = JSON.stringify(report, null, 2);

      const outDir = options.outputDir || this.reportsDir;

      // Save output files
      fs.writeFileSync(path.join(outDir, `weekly_seo_report_${dateStr}.md`), markdownContent, 'utf-8');
      fs.writeFileSync(path.join(outDir, `weekly_seo_report_${dateStr}.json`), report.jsonContent, 'utf-8');
      fs.writeFileSync(path.join(outDir, `weekly_seo_report_${dateStr}.html`), htmlContent, 'utf-8');
      fs.writeFileSync(path.join(outDir, `weekly_seo_report_${dateStr}.csv`), csvContent, 'utf-8');

      this.logger.info(`Weekly executive report successfully exported to ${outDir}`);
      return report;
    } catch (err) {
      this.logger.error(`Failed to generate weekly report`, { error: (err as Error).message });
      throw new ReportGenerationError(`Weekly report generation failed`, 'weekly', { cause: (err as Error).message });
    }
  }

  private generateMarkdownReport(
    dateStr: string,
    timestamp: string,
    domains: string[],
    summaries: ExecutiveSummaryItem[],
    apiUsage?: ApiUsageLimits
  ): string {
    let md = `# 📈 Executive Weekly SEO & Ahrefs API Report — ${dateStr}\n\n`;
    md += `**Report Generated**: ${timestamp}\n`;
    md += `**Target Domains Audited**: ${domains.join(', ')}\n\n`;

    if (apiUsage) {
      md += `### 💳 Ahrefs API v3 Usage & Cost Summary\n`;
      md += `- **Units Remaining**: ${apiUsage.unitsRemaining.toLocaleString()} / ${apiUsage.unitsLimit.toLocaleString()}\n`;
      md += `- **Units Consumed**: ${apiUsage.unitsConsumed.toLocaleString()}\n`;
      md += `- **Quota Reset Date**: ${apiUsage.resetDate}\n`;
      md += `- **API Key Status**: \`${apiUsage.apiKeyStatus}\`\n\n`;
    }

    md += `--- \n\n## 📊 1. Portfolio Domain Performance Overview\n\n`;
    md += `| Domain | DR | Health | Rank | Est. Traffic | Traffic Value | Ref. Domains | Keyword Deltas | Trend |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const s of summaries) {
      const healthStr = s.seoHealthScore ? `${s.seoHealthScore.score}/100 (${s.seoHealthScore.grade})` : 'N/A';
      const trendIcon = s.trend?.trendDirection === 'UP' ? '▲ UP' : s.trend?.trendDirection === 'DOWN' ? '▼ DOWN' : '▬ STABLE';
      md += `| **\`${s.domain}\`** | ${s.domainRating} | ${healthStr} | #${s.ahrefsRank.toLocaleString()} | ${s.organicTraffic.toLocaleString()} | $${s.trafficValue.toLocaleString()} | ${s.referringDomains.toLocaleString()} | +${s.keywordWins} / -${s.keywordLosses} | ${trendIcon} |\n`;
    }

    md += `\n---\n\n## 🎯 2. Strategic Prioritized SEO Recommendations\n\n`;
    for (const s of summaries) {
      md += `### Domain: \`${s.domain}\`\n`;
      if (s.recommendations.length === 0) {
        md += `*No high-priority issues detected. Maintain current SEO cadence.*\n\n`;
      } else {
        for (const rec of s.recommendations) {
          const badge = rec.priority === 'HIGH' ? '🔴 HIGH' : rec.priority === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW';
          md += `#### [${badge}] ${rec.title}\n`;
          md += `- **Category**: \`${rec.category}\` | **Impact**: ${rec.impact}\n`;
          md += `- **Rationale**: ${rec.recommendation}\n`;
          md += `- **Action Steps**:\n`;
          for (const step of rec.actionSteps) {
            md += `  1. ${step}\n`;
          }
          md += `\n`;
        }
      }
    }

    md += `---\n\n*Generated automatically by Pedro's Ahrefs API v3 Reporting Engine (\`titan-ahrefs\`)*\n`;
    return md;
  }

  private generateHtmlReport(
    dateStr: string,
    timestamp: string,
    domains: string[],
    summaries: ExecutiveSummaryItem[],
    apiUsage?: ApiUsageLimits
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
          <td>${s.organicTraffic.toLocaleString()}</td>
          <td>$${s.trafficValue.toLocaleString()}</td>
          <td>${s.referringDomains.toLocaleString()}</td>
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
  <title>Pedro's Ahrefs API v3 — Executive Report (${dateStr})</title>
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
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg-main); color: var(--text-main); margin: 0; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px; }
    h1 { font-size: 1.75rem; margin: 0 0 8px 0; color: var(--accent-cyan); }
    .meta { font-size: 0.875rem; color: var(--text-muted); }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; }
    .card-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .card-value { font-size: 1.75rem; font-weight: 700; margin-top: 8px; color: var(--text-main); }
    table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); margin-bottom: 28px; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
    th { background: rgba(255,255,255,0.03); font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
    .dr-badge { background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); padding: 4px 8px; border-radius: 4px; font-weight: 600; }
    .health-score-container { background: rgba(255,255,255,0.05); border-radius: 4px; height: 20px; position: relative; overflow: hidden; width: 140px; }
    .health-bar { background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green)); height: 100%; }
    .health-text { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff; }
    .delta-win { color: var(--accent-green); font-weight: 600; }
    .delta-loss { color: var(--accent-red); font-weight: 600; }
    .trend-badge { padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .trend-up { background: rgba(16, 185, 129, 0.2); color: var(--accent-green); }
    .trend-down { background: rgba(239, 68, 68, 0.2); color: var(--accent-red); }
    .trend-stable { background: rgba(148, 163, 184, 0.2); color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Pedro's Ahrefs API v3 Executive SEO Report</h1>
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
        <div class="card-title">API Units Remaining</div>
        <div class="card-value">${apiUsage ? apiUsage.unitsRemaining.toLocaleString() : 'N/A'}</div>
      </div>
    </div>

    <h2>Domain Performance Overview</h2>
    <table>
      <thead>
        <tr>
          <th>Domain</th>
          <th>Domain Rating</th>
          <th>SEO Health Score</th>
          <th>Est. Traffic</th>
          <th>Traffic Value</th>
          <th>Ref. Domains</th>
          <th>Keyword Deltas</th>
          <th>Trend</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  }

  private generateCsvReport(summaries: ExecutiveSummaryItem[]): string {
    const headers = ['Domain', 'DomainRating', 'AhrefsRank', 'OrganicTraffic', 'TrafficValue', 'ReferringDomains', 'TotalBacklinks', 'KeywordWins', 'KeywordLosses', 'HealthScore', 'Trend'];
    const rows = summaries.map(s => [
      s.domain,
      s.domainRating,
      s.ahrefsRank,
      s.organicTraffic,
      s.trafficValue,
      s.referringDomains,
      s.totalBacklinks,
      s.keywordWins,
      s.keywordLosses,
      s.seoHealthScore?.score ?? '',
      s.trend?.trendDirection ?? 'STABLE'
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}
