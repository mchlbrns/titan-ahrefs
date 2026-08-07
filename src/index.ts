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
  console.log(`📊 Pedro's Ahrefs API v3 Reporting Engine — Executing: [${command}]`);
  console.log(`Target Domains (${domains.length}): ${domains.join(', ')}`);
  console.log(`API Mode: ${client.isMockMode() ? 'MOCK / SIMULATED' : 'LIVE AHREFS API v3'}`);
  console.log(`==================================================\n`);

  switch (command) {
    case 'usage:check': {
      const usage = await client.fetchLimitsAndUsage();
      console.log(`\n💳 Ahrefs API v3 Subscription Limits & Usage:`);
      console.log(`   - Units Limit: ${usage.unitsLimit.toLocaleString()}`);
      console.log(`   - Units Consumed: ${usage.unitsConsumed.toLocaleString()}`);
      console.log(`   - Units Remaining: ${usage.unitsRemaining.toLocaleString()}`);
      console.log(`   - Quota Reset Date: ${usage.resetDate}`);
      console.log(`   - API Key Status: ${usage.apiKeyStatus}`);
      break;
    }

    case 'audit:domains': {
      const store = new SnapshotStore(undefined, client, logger);
      for (const domain of domains) {
        let overview;
        try {
          overview = await client.fetchDomainOverview(domain);
        } catch (err) {
          logger.warn(`Live domain audit failed for ${domain}: ${(err as Error).message}. Falling back to cached snapshot overview.`);
          const snapshot = await store.getLatestSnapshotForDomain(domain);
          overview = snapshot?.overview || {
            domain,
            domainRating: snapshot?.domainRating || 0,
            urlRating: 0,
            ahrefsRank: 0,
            organicTraffic: snapshot?.estimatedTraffic || 0,
            trafficValue: 0,
            rankingKeywords: snapshot?.organicKeywords || 0,
            totalBacklinks: snapshot?.totalBacklinks || 0,
            referringDomains: snapshot?.referringDomains || 0,
            dofollowBacklinks: 0,
            dofollowRefdomains: 0,
            nofollowLinks: 0,
            timestamp: new Date().toISOString(),
            seoHealthScore: snapshot?.seoHealthScore
          };
        }
        console.log(`\n🔹 Domain Overview: ${overview.domain}`);
        console.log(`   - Domain Rating (DR): ${overview.domainRating}`);
        console.log(`   - Ahrefs Rank: #${overview.ahrefsRank.toLocaleString()}`);
        console.log(`   - Organic Traffic: ${overview.organicTraffic.toLocaleString()}`);
        console.log(`   - Traffic Value: $${overview.trafficValue.toLocaleString()}`);
        console.log(`   - Ranking Keywords: ${overview.rankingKeywords.toLocaleString()}`);
        console.log(`   - Total Backlinks: ${overview.totalBacklinks.toLocaleString()}`);
        console.log(`   - Referring Domains: ${overview.referringDomains.toLocaleString()}`);
        console.log(`   - Dofollow Backlinks: ${overview.dofollowBacklinks.toLocaleString()} | Dofollow RefDomains: ${overview.dofollowRefdomains.toLocaleString()}`);
        console.log(`   - SEO Health Score: ${overview.seoHealthScore?.score ?? 'N/A'}/100 (${overview.seoHealthScore?.grade ?? 'N/A'})`);
      }
      break;
    }


    case 'fetch:keywords': {
      const tracker = new KeywordTracker(client, logger);
      for (const domain of domains) {
        const kwReport = await tracker.fetchKeywordRankings(domain);
        console.log(`\n🔹 Organic Keywords: ${kwReport.domain}`);
        console.log(`   - Total Organic Keywords: ${kwReport.totalKeywords.toLocaleString()}`);
        console.log(`   - Est. Monthly Traffic: ${kwReport.estimatedTraffic.toLocaleString()}`);
        console.log(`   - Top Keywords:`);
        for (const kw of kwReport.keywords) {
          const deltaStr = (kw.positionChange || 0) > 0 ? `(+${kw.positionChange})` : (kw.positionChange || 0) < 0 ? `(${kw.positionChange})` : '(0)';
          console.log(`     * "${kw.keyword}": Pos #${kw.position} ${deltaStr} | Vol: ${kw.searchVolume.toLocaleString()} | KD: ${kw.keywordDifficulty} | Intent: ${kw.searchIntent}`);
        }
      }
      break;
    }

    case 'fetch:toppages': {
      for (const domain of domains) {
        const topPages = await client.fetchTopPages(domain);
        console.log(`\n🔹 Top Pages: ${topPages.domain}`);
        console.log(`   - Total Pages Analyzed: ${topPages.totalPages}`);
        console.log(`   - Total Organic Traffic: ${topPages.totalOrganicTraffic.toLocaleString()}`);
        console.log(`   - Total Traffic Value: $${topPages.totalTrafficValue.toLocaleString()}`);
        for (const page of topPages.pages) {
          console.log(`     * ${page.url} | Traffic: ${page.organicTraffic.toLocaleString()} (+${page.trafficChange}) | Value: $${page.trafficValue.toLocaleString()} | Top KW: "${page.topKeyword}"`);
        }
      }
      break;
    }

    case 'fetch:backlinks': {
      const auditor = new BacklinkAuditor(client, logger);
      for (const domain of domains) {
        const audit = await auditor.auditBacklinkProfile(domain);
        console.log(`\n🔹 Backlinks Profile: ${audit.domain}`);
        console.log(`   - Total Backlinks: ${audit.totalBacklinks.toLocaleString()}`);
        console.log(`   - Referring Domains: ${audit.referringDomains.toLocaleString()}`);
        console.log(`   - Dofollow Ratio: ${(audit.dofollowRatio * 100).toFixed(0)}%`);
        console.log(`   - Top Anchors: ${audit.topAnchors.map(a => `"${a.anchor}" (${a.count})`).join(', ')}`);
      }
      break;
    }

    case 'analyze:competitors': {
      const analyzer = new CompetitorAnalyzer(client, logger);
      for (const domain of domains) {
        const competitors = competitorRegistry.competitors_by_domain[domain] || [];
        if (competitors.length === 0) {
          console.log(`\n⚠️ Competitor Analysis [${domain}]: skipped; no configured competitor.`);
          continue;
        }
        const compTarget = competitors[0];
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

    case 'snapshot:create': {
      const force = process.argv.includes('--force');
      const store = new SnapshotStore(undefined, client, logger);
      for (const domain of domains) {
        const competitors = competitorRegistry.competitors_by_domain[domain] || [];
        const snapshot = await store.createSnapshot(domain, competitors, { force });
        console.log(`\n📸 Normalized Snapshot Ready for ${domain}:`);
        console.log(`   - Snapshot ID: ${snapshot.snapshotId}`);
        console.log(`   - DR: ${snapshot.domainRating} | Health Score: ${snapshot.seoHealthScore?.score ?? 'N/A'}/100 | RefDomains: ${snapshot.referringDomains} | Backlinks: ${snapshot.totalBacklinks} | Traffic: ${snapshot.estimatedTraffic}`);
      }
      break;
    }

    case 'reddit:threads': {
      const subreddit = process.argv[3];
      if (!subreddit) {
        console.log(`\n⚠️ Usage: reddit:threads <subreddit> [minVolume] [limit]`);
        console.log(`   Example: npm run reddit:threads hiking 1000 50`);
        break;
      }
      const minVolume = parseInt(process.argv[4] || '0', 10);
      const limit = parseInt(process.argv[5] || '100', 10);
      const rep = await client.fetchRedditThreads(subreddit, { minVolume, limit });
      console.log(`\n🔴 Reddit Threads: r/${subreddit} (${rep.target})`);
      console.log(`   - Total Threads: ${rep.totalThreads} | Total Est. Traffic: ${rep.totalTraffic.toLocaleString()}`);
      for (const t of rep.threads) {
        console.log(`     * ${t.url}\n       Top KW: "${t.topKeyword}" (Vol ${t.topKeywordVolume.toLocaleString()}, UR ${t.urlRating}) | Traffic ${t.organicTraffic.toLocaleString()} | Ranks ${t.rankingKeywords} keywords`);
      }
      break;
    }

    case 'reddit:keywords': {
      const subreddit = process.argv[3];
      if (!subreddit) {
        console.log(`\n⚠️ Usage: reddit:keywords <subreddit> [minVolume] [maxPosition] [limit]`);
        console.log(`   Example: npm run reddit:keywords hiking 500 10 200`);
        break;
      }
      const minVolume = parseInt(process.argv[4] || '0', 10);
      const maxPosition = parseInt(process.argv[5] || '20', 10);
      const limit = parseInt(process.argv[6] || '100', 10);
      const rep = await client.fetchRedditKeywords(subreddit, { minVolume, maxPosition, limit });
      console.log(`\n🔴 Reddit Target Keywords: r/${subreddit} (${rep.target})`);
      console.log(`   - Total Keywords: ${rep.totalKeywords} | Top 3: ${rep.top3Count} | Top 10: ${rep.top10Count}`);
      for (const k of rep.keywords) {
        console.log(`     * "${k.keyword}": Pos #${k.position} | Vol: ${k.searchVolume.toLocaleString()} | KD: ${k.keywordDifficulty} | Intent: ${k.searchIntent}`);
      }
      break;
    }

    case 'report:weekly': {
      const reporter = new ReportGenerator(undefined, client, logger);
      const report = await reporter.generateWeeklyReport(domains, {
        enableHtml: appSettings.enable_html_reports
      });
      console.log(`\n📄 Pedro's Executive Weekly SEO Report Generated Successfully!`);
      console.log(report.markdownContent);
      break;
    }

    default: {
      console.log(`Unknown command: ${command}`);
      console.log(`Available commands: usage:check, audit:domains, fetch:keywords, fetch:toppages, fetch:backlinks, analyze:competitors, snapshot:create, reddit:threads, reddit:keywords, report:weekly`);
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
