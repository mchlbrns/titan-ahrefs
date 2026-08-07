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

import { saveSnapshotToSupabase, getLatestSnapshotFromSupabase } from './supabase';
import { getStaticSnapshot } from './snapshot-registry';


import { CACHE_TTL_MS, SNAPSHOT_INTERVAL_DAYS } from './cache';

export interface CreateSnapshotOptions {
  force?: boolean;
}

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

  public async createSnapshot(domain: string, competitorDomains: string[] = [], options: CreateSnapshotOptions = {}): Promise<DomainSnapshot> {
    // 0. Quota Safeguard: Check if a recent snapshot exists in Supabase or local store (Weekly frequency limit: 7 days)
    if (!options.force) {
      const existingSnapshot = await this.getLatestSnapshotForDomain(domain);
      if (existingSnapshot && existingSnapshot.timestamp) {
        const ageMs = Date.now() - new Date(existingSnapshot.timestamp).getTime();
        if (ageMs < CACHE_TTL_MS) {
          const ageDays = (ageMs / (1000 * 60 * 60 * 24)).toFixed(1);
          this.logger.info(`[QUOTA SAFEGUARD] Snapshot for ${domain} was created ${ageDays} days ago. Weekly threshold is ${SNAPSHOT_INTERVAL_DAYS} days. Serving cached snapshot to protect Ahrefs API quota.`);
          return existingSnapshot;
        }
      }
    }

    this.logger.info(`Creating normalized live snapshot for domain: ${domain} (force: ${options.force ?? false})`);
    try {
      const overview: DomainOverviewMetrics = await this.client.fetchDomainOverview(domain);
      const keywords: DomainKeywordReport = await this.client.fetchOrganicKeywords(domain);
      const topPages: TopPagesReport = await this.client.fetchTopPages(domain);
      const backlinks: BacklinkAuditReport = await this.client.fetchAllBacklinks(domain);

      const competitorMetricsList: CompetitorMetrics[] = [];
      for (const comp of competitorDomains) {
        try {
          const compMetrics = await this.client.fetchCompetitorOverview(domain, comp);
          competitorMetricsList.push(compMetrics);
        } catch (compErr) {
          this.logger.warn(`Failed to include competitor ${comp} in snapshot for ${domain}`, { error: (compErr as Error).message });
        }
      }

      const healthScore = calculateSeoHealthScore({
        domainRating: overview.domainRating,
        referringDomains: overview.referringDomains,
        totalBacklinks: overview.totalBacklinks,
        dofollowLinks: overview.dofollowBacklinks,
        estimatedTraffic: overview.organicTraffic,
        top10Count: keywords.top10Count
      });

      const snapshot: DomainSnapshot = {
        snapshotId: `snap_${domain.replace(/\./g, '_')}_${Date.now()}`,
        domain,
        timestamp: new Date().toISOString(),
        dataSource: 'ahrefs-api-v3',

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
      try {
        fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
      } catch {
        // Disk write fallback
      }

      // Persist authentic snapshot to Supabase
      saveSnapshotToSupabase(snapshot).catch(() => null);

      this.logger.info(`Snapshot persisted for ${domain}`, { snapshotId: snapshot.snapshotId, filePath });
      return snapshot;
    } catch (err) {
      this.logger.warn(`Live Ahrefs fetch failed for ${domain}: ${(err as Error).message}. Attempting fallback to latest cached snapshot.`);
      const cachedFallback = await this.getLatestSnapshotForDomain(domain);
      if (cachedFallback) {
        this.logger.info(`[QUOTA SAFEGUARD FALLBACK] Successfully served cached snapshot for ${domain}`);
        return cachedFallback;
      }
      this.logger.error(`Failed to create snapshot and no cached fallback exists for ${domain}`, { error: (err as Error).message });
      throw new SnapshotError(`Snapshot creation failed for ${domain}`, domain, { cause: (err as Error).message });
    }
  }


  public getSnapshotsForDomain(domain: string): DomainSnapshot[] {
    this.ensureStorageDir();
    try {
      const prefix = `snap_${domain.replace(/\./g, '_')}`;
      const searchDirs = Array.from(new Set([
        this.storageDir,
        path.join(process.cwd(), 'snapshots/local'),
        path.join(process.cwd(), 'snapshots/live-evidence'),
        path.join(__dirname, '../snapshots/local'),
        path.join(__dirname, '../snapshots/live-evidence'),
        path.join(__dirname, '../../snapshots/local'),
        path.join(__dirname, '../../snapshots/live-evidence')
      ])).filter(d => fs.existsSync(d));

      const foundSnapshots: DomainSnapshot[] = [];
      for (const dir of searchDirs) {
        try {
          const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.json'));
          for (const file of files) {
            const content = fs.readFileSync(path.join(dir, file), 'utf-8');
            foundSnapshots.push(JSON.parse(content) as DomainSnapshot);
          }
        } catch {
          // ignore unreadable directory
        }
      }

      return foundSnapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      this.logger.warn(`Could not read snapshots for ${domain}`, { error: (err as Error).message });
      return [];
    }
  }


  public async getLatestSnapshotForDomain(domain: string): Promise<DomainSnapshot | undefined> {


    const snapshots = this.getSnapshotsForDomain(domain);
    if (snapshots.length > 0) {
      return snapshots[0];
    }

    // Try to fetch from Supabase
    const remoteSnapshot = await getLatestSnapshotFromSupabase(domain);
    if (remoteSnapshot) return remoteSnapshot;

    // Static bundled snapshot fallback for Vercel Serverless
    const staticSnapshot = getStaticSnapshot(domain);
    if (staticSnapshot) return staticSnapshot;

    return undefined;
  }

}

