import { AhrefsClient } from './client';
import { BacklinkAuditor } from './backlinks';
import { KeywordTracker } from './keywords';
import { SnapshotStore } from './snapshots';
import { CompetitorAnalyzer } from './competitors';
import { ReportGenerator } from './reports';
import { ConfigLoader } from './config';
import { Logger } from './logger';
import { AhrefsEngineError } from './errors';

async function main() {
  const logger = new Logger({ context: 'TitanAhrefsCLI' });
  const configLoader = new ConfigLoader(undefined, logger);
  const appSettings = configLoader.loadAppSettings();

  const command = process.argv[2] || 'audit:domains';
  const domainRegistry = configLoader.loadDomainRegistry();
  const domains = domainRegistry.managed_domains.map(d => d.domain);
  const competitorRegistry = configLoader.loadCompetitorRegistry();

  const client = new AhrefsClient({
    maxRetries: appSettings.max_retries,
    retryDelayMs: appSettings.retry_delay_ms,
    logger
  });

  console.log(`\n==================================================`);
  console.log(`📊 Titan Ahrefs Engine v1.0 — Executing: [${command}]`);
  console.log(`Target Domains (${domains.length}): ${domains.join(', ')}`);
  console.log(`API Mode: ${client.isMockMode() ? 'MOCK / SIMULATED' : 'LIVE AHREFS API v3'}`);
  console.log(`==================================================\n`);

  switch (command) {
    case 'audit:domains': {
      const auditor = new BacklinkAuditor(client, logger);
      for (const domain of domains) {
        const audit = await auditor.auditBacklinkProfile(domain);
        console.log(`\n🔹 Domain: ${audit.domain}`);
        console.log(`   - Domain Rating (DR): ${audit.totalBacklinks > 0 ? audit.recentBacklinks[0]?.domainRatingFrom ?? 'N/A' : 'N/A'}`);
        console.log(`   - SEO Health Score: ${audit.seoHealthScore?.score ?? 'N/A'}/100 (${audit.seoHealthScore?.grade ?? 'N/A'})`);
        console.log(`   - Total Backlinks: ${audit.totalBacklinks.toLocaleString()}`);
        console.log(`   - Referring Domains: ${audit.referringDomains.toLocaleString()}`);
        console.log(`   - Dofollow Ratio: ${(audit.dofollowRatio * 100).toFixed(0)}%`);
        console.log(`   - Top Anchors: ${audit.topAnchors.map(a => `"${a.anchor}" (${a.count})`).join(', ')}`);
      }
      break;
    }

    case 'fetch:keywords': {
      const tracker = new KeywordTracker(client, logger);
      for (const domain of domains) {
        const kwReport = await tracker.fetchKeywordRankings(domain);
        console.log(`\n🔹 Domain: ${kwReport.domain}`);
        console.log(`   - Total Organic Keywords: ${kwReport.totalKeywords.toLocaleString()}`);
        console.log(`   - Est. Monthly Traffic: ${kwReport.estimatedTraffic.toLocaleString()}`);
        console.log(`   - Top Keywords:`);
        for (const kw of kwReport.keywords) {
          const deltaStr = (kw.positionDelta || 0) > 0 ? `(+${kw.positionDelta})` : (kw.positionDelta || 0) < 0 ? `(${kw.positionDelta})` : '(0)';
          console.log(`     * "${kw.keyword}": Pos #${kw.position} ${deltaStr} | Vol: ${kw.searchVolume.toLocaleString()} | KD: ${kw.keywordDifficulty}`);
        }
      }
      break;
    }

    case 'snapshot:create': {
      const store = new SnapshotStore(undefined, client, logger);
      for (const domain of domains) {
        const snapshot = await store.createSnapshot(domain);
        console.log(`\n📸 Snapshot Created for ${domain}:`);
        console.log(`   - Snapshot ID: ${snapshot.snapshotId}`);
        console.log(`   - DR: ${snapshot.domainRating} | Health Score: ${snapshot.seoHealthScore?.score ?? 'N/A'}/100 | RefDomains: ${snapshot.referringDomains} | Backlinks: ${snapshot.totalBacklinks} | Traffic: ${snapshot.estimatedTraffic}`);
      }
      break;
    }

    case 'analyze:competitors': {
      const analyzer = new CompetitorAnalyzer(logger);
      for (const domain of domains) {
        const competitors = competitorRegistry.competitors_by_domain[domain] || [];
        const compTarget = competitors.length > 0 ? competitors[0] : 'competitor-sample.com';
        const gap = await analyzer.analyzeCompetitorGap(domain, compTarget);
        console.log(`\n⚔️ Competitor Analysis [${domain} vs ${compTarget}]:`);
        console.log(`   - Shared Keywords: ${gap.sharedKeywords}`);
        console.log(`   - Competitor Exclusive Keywords: ${gap.competitorExclusiveKeywords}`);
        console.log(`   - Gap Opportunities:`);
        for (const o of gap.gapOpportunities) {
          console.log(`     * "${o.keyword}" (Comp Pos #${o.competitorPosition}, Vol: ${o.searchVolume})`);
        }
      }
      break;
    }

    case 'report:weekly': {
      const reporter = new ReportGenerator(undefined, client, logger);
      const report = await reporter.generateWeeklyReport(domains, {
        enableHtml: appSettings.enable_html_reports
      });
      console.log(`\n📄 Weekly Executive Report Generated (Markdown, JSON, and HTML)!`);
      console.log(report.markdownContent);
      break;
    }

    default: {
      console.log(`Unknown command: ${command}`);
      console.log(`Available commands: audit:domains, fetch:keywords, snapshot:create, analyze:competitors, report:weekly`);
    }
  }
}

main().catch(err => {
  if (err instanceof AhrefsEngineError) {
    console.error(`Fatal Titan Ahrefs Engine Error [${err.code}]:`, err.message, err.details || '');
  } else {
    console.error('Fatal error running Titan Ahrefs Engine:', err);
  }
  process.exit(1);
});
