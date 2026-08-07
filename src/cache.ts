import { Logger } from './logger';
import { DomainSnapshot } from './types';
import { getLatestSnapshotFromSupabase, saveSnapshotToSupabase } from './supabase';
import { SnapshotStore } from './snapshots';
import { getStaticSnapshot } from './snapshot-registry';

export interface CacheState {
  snapshot: DomainSnapshot | null;
  isStale: boolean;
  isMissing: boolean;
  ageMs: number;
}

export const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export class RequestDeduplicator {
  private static inFlightMap = new Map<string, Promise<unknown>>();

  public static async deduplicate<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    if (this.inFlightMap.has(key)) {
      return this.inFlightMap.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        return await fetchFn();
      } finally {
        this.inFlightMap.delete(key);
      }
    })();

    this.inFlightMap.set(key, promise);
    return promise;
  }
}


export class AhrefsCacheManager {


  private logger: Logger;
  private backgroundRevalidations = new Set<string>();

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ context: 'AhrefsCacheManager' });
  }

  /**
   * Checks Supabase for snapshot cache state with fallback to local SnapshotStore.
   */
  public async getCacheState(domain: string): Promise<CacheState> {
    try {
      let snapshot = await getLatestSnapshotFromSupabase(domain);
      if (!snapshot) {
        const snapshotStore = new SnapshotStore(undefined, undefined, this.logger);
        snapshot = (await snapshotStore.getLatestSnapshotForDomain(domain)) || getStaticSnapshot(domain);
      }



      if (!snapshot || !snapshot.timestamp) {
        return { snapshot: null, isStale: true, isMissing: true, ageMs: Infinity };
      }

      const snapshotTime = new Date(snapshot.timestamp).getTime();
      const ageMs = Date.now() - snapshotTime;
      const isStale = ageMs >= CACHE_TTL_MS;

      return {
        snapshot,
        isStale,
        isMissing: false,
        ageMs
      };
    } catch (err) {
      this.logger.warn(`Failed to retrieve cache state for ${domain}`, { error: (err as Error).message });
      return { snapshot: null, isStale: true, isMissing: true, ageMs: Infinity };
    }
  }


  /**
   * Non-blocking background revalidation of stale snapshots.
   */
  public triggerBackgroundRevalidate(domain: string, revalidateFn: () => Promise<DomainSnapshot | null>): void {
    if (this.backgroundRevalidations.has(domain)) {
      this.logger.debug(`Background revalidation already in progress for ${domain}`);
      return;
    }

    this.backgroundRevalidations.add(domain);
    this.logger.info(`Queued non-blocking background SWR revalidation for ${domain}`);

    setTimeout(() => {
      RequestDeduplicator.deduplicate(`revalidate_${domain}`, async () => {
        try {
          const freshSnapshot = await revalidateFn();
          if (freshSnapshot) {
            await saveSnapshotToSupabase(freshSnapshot);
            this.logger.info(`Background SWR revalidation completed and cached for ${domain}`);
          }
        } catch (err) {
          this.logger.warn(`Background SWR revalidation failed for ${domain}`, { error: (err as Error).message });
        } finally {
          this.backgroundRevalidations.delete(domain);
        }
      });
    }, 50);
  }
}
