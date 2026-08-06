import * as fs from 'fs';
import * as path from 'path';
import { AhrefsClient } from './client';
import { DomainSnapshot, DomainRatingMetrics, TrendComparison } from './types';
import { KeywordTracker } from './keywords';
import { calculateSeoHealthScore } from './health';
import { Logger } from './logger';
import { SnapshotError } from './errors';

export class SnapshotStore {
  private client: AhrefsClient;
  private keywordTracker: KeywordTracker;
  private storageDir: string;
  private logger: Logger;

  constructor(storageDir?: string, client?: AhrefsClient, logger?: Logger) {
    this.client = client || new AhrefsClient();
    this.keywordTracker = new KeywordTracker(this.client);
    this.storageDir = storageDir || path.join(__dirname, '../snapshots/local');
    this.logger = logger || new Logger({ context: 'SnapshotStore' });
    this.ensureStorageDir();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      try {
        fs.mkdirSync(this.storageDir, { recursive: true });
      } catch (err) {
        throw new SnapshotError(`Failed to create snapshot storage directory: ${this.storageDir}`, undefined, {
          cause: (err as Error).message
        });
      }
    }
  }

  public async createSnapshot(domain: string): Promise<DomainSnapshot> {
    this.logger.info(`Creating snapshot for domain: ${domain}`);
    try {
      const metrics: DomainRatingMetrics = await this.client.fetchDomainRating(domain);
      const keywordsReport = await this.keywordTracker.fetchKeywordRankings(domain);

      const healthScore = metrics.seoHealthScore || calculateSeoHealthScore({
        domainRating: metrics.domainRating,
        referringDomains: metrics.referringDomains,
        totalBacklinks: metrics.totalBacklinks,
        dofollowLinks: metrics.dofollowLinks,
        estimatedTraffic: keywordsReport.estimatedTraffic,
        top10Count: keywordsReport.top10Count
      });

      const snapshot: DomainSnapshot = {
        snapshotId: `snap_${domain.replace(/\./g, '_')}_${Date.now()}`,
        domain,
        timestamp: new Date().toISOString(),
        domainRating: metrics.domainRating,
        referringDomains: metrics.referringDomains,
        totalBacklinks: metrics.totalBacklinks,
        estimatedTraffic: keywordsReport.estimatedTraffic,
        organicKeywords: keywordsReport.totalKeywords,
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

  public compareSnapshots(current: DomainSnapshot, previous?: DomainSnapshot): TrendComparison {
    if (!previous) {
      return {
        drChange: 0,
        trafficChange: 0,
        referringDomainsChange: 0,
        healthScoreChange: 0,
        trendDirection: 'NEW'
      };
    }

    const drChange = current.domainRating - previous.domainRating;
    const trafficChange = current.estimatedTraffic - previous.estimatedTraffic;
    const referringDomainsChange = current.referringDomains - previous.referringDomains;
    const currentHealth = current.seoHealthScore?.score ?? 0;
    const prevHealth = previous.seoHealthScore?.score ?? 0;
    const healthScoreChange = currentHealth - prevHealth;

    let trendDirection: 'UP' | 'DOWN' | 'STABLE' | 'NEW' = 'STABLE';
    if (healthScoreChange > 0 || drChange > 0 || trafficChange > 0) {
      trendDirection = 'UP';
    } else if (healthScoreChange < 0 || drChange < 0 || trafficChange < 0) {
      trendDirection = 'DOWN';
    }

    return {
      previousTimestamp: previous.timestamp,
      drChange,
      trafficChange,
      referringDomainsChange,
      healthScoreChange,
      trendDirection
    };
  }
}
