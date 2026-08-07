import { DomainSnapshot } from './types';
import snapTitanTreasure from '../snapshots/local/snap_titantreasure_com_latest.json';
import snapChumbaCasino from '../snapshots/local/snap_chumbacasino_com_1786005341313.json';
import snapHeavenGirlfriend from '../snapshots/local/snap_heavengirlfriend_com_1786005320094.json';
import snapHornyCompanion from '../snapshots/local/snap_hornycompanion_com_1786005320095.json';
import snapRedEngage from '../snapshots/local/snap_red-engage_com_1786005320094.json';

const staticSnapshotsMap: Record<string, DomainSnapshot> = {
  'titantreasure.com': snapTitanTreasure as unknown as DomainSnapshot,
  'chumbacasino.com': snapChumbaCasino as unknown as DomainSnapshot,
  'heavengirlfriend.com': snapHeavenGirlfriend as unknown as DomainSnapshot,
  'hornycompanion.com': snapHornyCompanion as unknown as DomainSnapshot,
  'red-engage.com': snapRedEngage as unknown as DomainSnapshot
};

export function getStaticSnapshot(domain: string): DomainSnapshot | null {
  if (!domain) return null;
  const normalized = domain.toLowerCase().trim();
  return staticSnapshotsMap[normalized] || null;
}
