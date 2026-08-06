import * as fs from 'fs';
import * as path from 'path';
import { AhrefsClient } from './client';
import {
  DomainSnapshot,
  DomainOverviewMetrics,
  DomainKeywordReport,
  TopPagesReport,
  BacklinkAuditReport,
  CompetitorMetrics
} from './types';
import { calculateSeoHealthScore } from './health';
import { Logger } from './logger';
import { SnapshotError } from './errors';

import * as os from 'os';

export class SnapshotStore {
  private client: AhrefsClient;
  private storageDir: string;
  private logger: Logger;

  constructor(storageDir?: string, client?: AhrefsClient, logger?: Logger) {
    this.client = client || new AhrefsClient();
    this.storageDir = storageDir || (process.env.VERCEL ? path.join(os.tmpdir(), 'snapshots') : path.join(__dirname, '../snapshots/local'));
    this.logger = logger || new Logger({ context: 'SnapshotStore' });
    this.ensureStorageDir();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      try {
        fs.mkdirSync(this.storageDir, { recursive: true });
      } catch {
        this.storageDir = path.join(os.tmpdir(), 'snapshots');
        try {
          if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
          }
        } catch (tmpErr) {
          this.logger.warn(`Could not create snapshot storage directory: ${this.storageDir}`, { error: (tmpErr as Error).message });
        }
      }
    }
  }

  public async createSnapshot(domain: string, competitorDomains: string[] = []): Promise<DomainSnapshot> {
    this.logger.info(`Creating normalized snapshot for domain: ${domain}`);
    try {
      const overview: DomainOverviewMetrics = await this.client.fetchDomainOverview(domain);
      const keywords: DomainKeywordReport = await this.client.fetchOrganicKeywords(domain);
      const topPages: TopPagesReport = await this.client.fetchTopPages(domain);
      const backlinks: BacklinkAuditReport = await this.client.fetchAllBacklinks(domain);

      const competitorMetricsList: CompetitorMetrics[] = await Promise.all(
        competitorDomains.map(comp => this.client.fetchCompetitorOverview(domain, comp))
      );

      const healthScore = overview.seoHealthScore || calculateSeoHealthScore({
        domainRating: overview.domainRating,
        referringDomains: overview.referringDomains,
        totalBacklinks: overview.totalBacklinks,
        dofollowLinks: overview.dofollowBacklinks,
        estimatedTraffic: overview.organicTraffic,
        top10Count: keywords.top10Count
      });

      const timestamp = new Date().toISOString();
      const snapshotId = `snap_${domain.replace(/\./g, '_')}_${Date.now()}`;

      const snapshot: DomainSnapshot = {
        snapshotId,
        domain,
        timestamp,
        dataSource: this.client.isMockMode() ? 'mock' : 'ahrefs-api-v3',
        overview,
        keywords,
        topPages,
        backlinks,
        competitors: competitorMetricsList,
        domainRating: overview.domainRating,
        referringDomains: overview.referringDomains,
        totalBacklinks: overview.totalBacklinks,
        estimatedTraffic: overview.organicTraffic,
        organicKeywords: keywords.totalKeywords,
        seoHealthScore: healthScore
      };

      const filePath = path.join(this.storageDir, `${snapshot.snapshotId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');

      this.logger.info(`Snapshot persisted for ${domain}`, { snapshotId: snapshot.snapshotId, filePath });
      return snapshot;
    } catch (err) {
      this.logger.error(`Failed to create snapshot for ${domain}`, { error: (err as Error).message });
      throw new SnapshotError(`Snapshot creation failed for ${domain}`, domain, { cause: (err as Error).message });
    }
  }

  public getSnapshotsForDomain(domain: string): DomainSnapshot[] {
    this.ensureStorageDir();
    try {
      const prefix = `snap_${domain.replace(/\./g, '_')}`;
      const files = fs.readdirSync(this.storageDir)
        .filter(f => f.startsWith(prefix) && f.endsWith('.json'));

      return files.map(file => {
        const content = fs.readFileSync(path.join(this.storageDir, file), 'utf-8');
        return JSON.parse(content) as DomainSnapshot;
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      this.logger.warn(`Could not read snapshots for ${domain}`, { error: (err as Error).message });
      return [];
    }
  }

  public getLatestSnapshotForDomain(domain: string): DomainSnapshot | undefined {
    const snapshots = this.getSnapshotsForDomain(domain);
    if (snapshots.length > 0) {
      return snapshots[0];
    }
    try {
      const clientAny = this.client as unknown as Record<string, (d: string) => unknown>;
      const overview = clientAny.generateMockDomainOverview?.(domain) as DomainOverviewMetrics | undefined;
      const keywords = clientAny.generateMockOrganicKeywords?.(domain) as DomainKeywordReport | undefined;
      const topPages = clientAny.generateMockTopPages?.(domain) as TopPagesReport | undefined;
      const backlinks = clientAny.generateMockBacklinkReport?.(domain) as BacklinkAuditReport | undefined;

      if (overview) {
        return {
          snapshotId: `snap_fallback_${domain.replace(/\./g, '_')}`,
          domain,
          timestamp: new Date().toISOString(),
          dataSource: 'mock',
          overview,
          keywords: keywords || { domain, totalKeywords: 0, top3Count: 0, top10Count: 0, top50Count: 0, estimatedTraffic: 0, keywords: [] },
          topPages: topPages || { domain, totalPages: 0, totalOrganicTraffic: 0, totalTrafficValue: 0, pages: [] },
          backlinks: backlinks || { domain, totalBacklinks: 0, referringDomains: 0, dofollowRatio: 0, recentBacklinks: [], topAnchors: [] },
          competitors: [],
          domainRating: overview.domainRating,
          referringDomains: overview.referringDomains,
          totalBacklinks: overview.totalBacklinks,
          estimatedTraffic: overview.organicTraffic,
          organicKeywords: keywords?.totalKeywords || overview.rankingKeywords,
          seoHealthScore: overview.seoHealthScore
        };
      }
    } catch {
      // Fallback silently if generation fails
    }
    return undefined;
  }
}
