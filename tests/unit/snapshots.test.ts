import * as fs from 'fs';
import * as path from 'path';
import { SnapshotStore } from '../../src/snapshots';
import { AhrefsClient } from '../../src/client';
import { ComparisonEngine } from '../../src/comparison';

describe('SnapshotStore Unit Tests', () => {
  const testStorageDir = path.join(__dirname, '../scratch/snapshots');
  const client = new AhrefsClient({ mockFallback: true });
  const comparisonEngine = new ComparisonEngine();

  afterEach(() => {
    if (fs.existsSync(testStorageDir)) {
      fs.rmSync(testStorageDir, { recursive: true, force: true });
    }
  });

  test('creates and persists snapshot to disk', async () => {
    const store = new SnapshotStore(testStorageDir, client);
    const snap = await store.createSnapshot('hornycompanion.com', [], { force: true });

    expect(snap.snapshotId).toContain('snap_hornycompanion_com');
    expect(snap.domain).toBe('hornycompanion.com');
    expect(snap.seoHealthScore).toBeDefined();

    const snapshots = store.getSnapshotsForDomain('hornycompanion.com');
    expect(snapshots.length).toBeGreaterThanOrEqual(1);
    expect(snapshots[0].snapshotId).toBe(snap.snapshotId);
  });

  test('compares snapshots accurately using ComparisonEngine', async () => {
    const store = new SnapshotStore(testStorageDir, client);

    const current = await store.createSnapshot('testdomain.com');
    const trend = comparisonEngine.compareSnapshots(current);

    expect(trend.trendDirection).toBe('NEW');
  });
});
