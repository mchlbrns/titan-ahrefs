import * as fs from 'fs';
import * as path from 'path';
import { AhrefsClient } from './client';
import { DomainSnapshot, DomainRatingMetrics } from './types';
import { KeywordTracker } from './keywords';

export class SnapshotStore {
  private client: AhrefsClient;
  private keywordTracker: KeywordTracker;
  private storageDir: string;

  constructor(storageDir?: string, client?: AhrefsClient) {
    this.client = client || new AhrefsClient();
    this.keywordTracker = new KeywordTracker(this.client);
    this.storageDir = storageDir || path.join(__dirname, '../snapshots/local');
    this.ensureStorageDir();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  public async createSnapshot(domain: string): Promise<DomainSnapshot> {
    const metrics: DomainRatingMetrics = await this.client.fetchDomainRating(domain);
    const keywordsReport = await this.keywordTracker.fetchKeywordRankings(domain);

    const snapshot: DomainSnapshot = {
      snapshotId: `snap_${domain.replace(/\./g, '_')}_${Date.now()}`,
      domain,
      timestamp: new Date().toISOString(),
      domainRating: metrics.domainRating,
      referringDomains: metrics.referringDomains,
      totalBacklinks: metrics.totalBacklinks,
      estimatedTraffic: keywordsReport.estimatedTraffic,
      organicKeywords: keywordsReport.totalKeywords
    };

    const filePath = path.join(this.storageDir, `${snapshot.snapshotId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');

    return snapshot;
  }

  public getSnapshotsForDomain(domain: string): DomainSnapshot[] {
    this.ensureStorageDir();
    const files = fs.readdirSync(this.storageDir).filter(f => f.startsWith(`snap_${domain.replace(/\./g, '_')}`) && f.endsWith('.json'));

    return files.map(file => {
      const content = fs.readFileSync(path.join(this.storageDir, file), 'utf-8');
      return JSON.parse(content) as DomainSnapshot;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
