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
    return snapshots.length > 0 ? snapshots[0] : undefined;
  }
}
