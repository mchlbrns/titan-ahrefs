import * as fs from 'fs';
import * as path from 'path';
import { AhrefsClient } from './client';
import { BacklinkAuditor } from './backlinks';
import { KeywordTracker } from './keywords';
import { SnapshotStore } from './snapshots';
import { CompetitorAnalyzer } from './competitors';
import { ReportGenerator } from './reports';
import { DomainRegistry, CompetitorRegistry } from './types';

function loadManagedDomains(): string[] {
  const configPath = path.join(__dirname, '../config/domains.json');
  if (!fs.existsSync(configPath)) {
    return ['red-engage.com', 'heavengirlfriend.com', 'hornycompanion.com'];
  }
  const content = fs.readFileSync(configPath, 'utf-8');
  const registry = JSON.parse(content) as DomainRegistry;
  return registry.managed_domains.map(d => d.domain);
}

function loadCompetitors(domain: string): string[] {
  const configPath = path.join(__dirname, '../config/competitors.json');
  if (!fs.existsSync(configPath)) return [];
  const content = fs.readFileSync(configPath, 'utf-8');
  const registry = JSON.parse(content) as CompetitorRegistry;
  return registry.competitors_by_domain[domain] || [];
}

async function main() {
  const command = process.argv[2] || 'audit:domains';
  const domains = loadManagedDomains();
  const client = new AhrefsClient();

  console.log(`\n==================================================`);
  console.log(`📊 Titan Ahrefs Engine — Executing: [${command}]`);
  console.log(`Target Domains (${domains.length}): ${domains.join(', ')}`);
  console.log(`API Mode: ${client.isMockMode() ? 'MOCK / SIMULATED' : 'LIVE AHREFS API v3'}`);
  console.log(`==================================================\n`);

  switch (command) {
    case 'audit:domains': {
      const auditor = new BacklinkAuditor(client);
      for (const domain of domains) {
        const audit = await auditor.auditBacklinkProfile(domain);
        console.log(`\n🔹 Domain: ${audit.domain}`);
        console.log(`   - Total Backlinks: ${audit.totalBacklinks.toLocaleString()}`);
        console.log(`   - Referring Domains: ${audit.referringDomains.toLocaleString()}`);
        console.log(`   - Dofollow Ratio: ${(audit.dofollowRatio * 100).toFixed(0)}%`);
        console.log(`   - Top Anchors: ${audit.topAnchors.map(a => `"${a.anchor}" (${a.count})`).join(', ')}`);
      }
      break;
    }

    case 'fetch:keywords': {
      const tracker = new KeywordTracker(client);
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
      const store = new SnapshotStore(undefined, client);
      for (const domain of domains) {
        const snapshot = await store.createSnapshot(domain);
        console.log(`\n📸 Snapshot Created for ${domain}:`);
        console.log(`   - Snapshot ID: ${snapshot.snapshotId}`);
        console.log(`   - DR: ${snapshot.domainRating} | RefDomains: ${snapshot.referringDomains} | Backlinks: ${snapshot.totalBacklinks} | Traffic: ${snapshot.estimatedTraffic}`);
      }
      break;
    }

    case 'analyze:competitors': {
      const analyzer = new CompetitorAnalyzer();
      for (const domain of domains) {
        const competitors = loadCompetitors(domain);
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
      const reporter = new ReportGenerator(undefined, client);
      const report = await reporter.generateWeeklyReport(domains);
      console.log(`\n📄 Weekly Executive Report Generated!`);
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
  console.error('Fatal error running Titan Ahrefs Engine:', err);
  process.exit(1);
});
