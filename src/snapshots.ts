/**
 * Historical Metric Snapshots Engine for titan-ahrefs
 */

export interface DomainSnapshot {
  timestamp: string;
  domain: string;
  domainRating: number;
  urlRating: number;
  backlinks: number;
  referringDomains: number;
  organicKeywords: number;
  organicTraffic: number;
}

export function createSnapshot(domain: string): DomainSnapshot {
  const snapshot: DomainSnapshot = {
    timestamp: new Date().toISOString(),
    domain,
    domainRating: 0,
    urlRating: 0,
    backlinks: 0,
    referringDomains: 0,
    organicKeywords: 0,
    organicTraffic: 0,
  };
  console.log(`[Snapshots] Recorded historical snapshot for ${domain} at ${snapshot.timestamp}`);
  return snapshot;
}
