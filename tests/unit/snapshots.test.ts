import * as fs from 'fs';
import * as path from 'path';
import { SnapshotStore } from '../../src/snapshots';
import { AhrefsClient } from '../../src/client';
import { DomainSnapshot } from '../../src/types';

describe('SnapshotStore Unit Tests', () => {
  const testStorageDir = path.join(__dirname, '../scratch/snapshots');
  const client = new AhrefsClient({ mockFallback: true });

  afterEach(() => {
    if (fs.existsSync(testStorageDir)) {
      fs.rmSync(testStorageDir, { recursive: true, force: true });
    }
  });

  test('creates and persists snapshot to disk', async () => {
    const store = new SnapshotStore(testStorageDir, client);
    const snap = await store.createSnapshot('hornycompanion.com');

    expect(snap.snapshotId).toContain('snap_hornycompanion_com');
    expect(snap.domain).toBe('hornycompanion.com');
    expect(snap.seoHealthScore).toBeDefined();

    const snapshots = store.getSnapshotsForDomain('hornycompanion.com');
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].snapshotId).toBe(snap.snapshotId);
  });

  test('compares snapshots accurately to derive trend deltas', () => {
    const store = new SnapshotStore(testStorageDir, client);

    const current: DomainSnapshot = {
      snapshotId: 'snap_2',
      domain: 'test.com',
      timestamp: new Date().toISOString(),
      domainRating: 50,
      referringDomains: 400,
      totalBacklinks: 2000,
      estimatedTraffic: 15000,
      organicKeywords: 500,
      seoHealthScore: {
        score: 80,
        grade: 'A',
        breakdown: { domainRatingScore: 15, referringDomainsScore: 20, trafficScore: 15, dofollowScore: 15, serpScore: 15 },
        recommendations: []
      }
    };

    const previous: DomainSnapshot = {
      snapshotId: 'snap_1',
      domain: 'test.com',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      domainRating: 45,
      referringDomains: 350,
      totalBacklinks: 1800,
      estimatedTraffic: 12000,
      organicKeywords: 450,
      seoHealthScore: {
        score: 75,
        grade: 'B',
        breakdown: { domainRatingScore: 13, referringDomainsScore: 18, trafficScore: 12, dofollowScore: 15, serpScore: 17 },
        recommendations: []
      }
    };

    const trend = store.compareSnapshots(current, previous);
    expect(trend.drChange).toBe(5);
    expect(trend.trafficChange).toBe(3000);
    expect(trend.referringDomainsChange).toBe(50);
    expect(trend.healthScoreChange).toBe(5);
    expect(trend.trendDirection).toBe('UP');
  });
});
