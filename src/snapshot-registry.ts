import { DomainSnapshot } from './types';

// ============================================================
// Static Snapshot Registry
// ------------------------------------------------------------
// Snapshots are embedded inline (NOT file-imported) so that
// Next.js / Webpack can bundle them into the serverless route
// payload without requiring filesystem access or resolveJsonModule.
// This is the only way to guarantee they survive Vercel's NFT
// (Node File Trace) bundling step.
// ============================================================

const snapTitanTreasure: DomainSnapshot = {
  snapshotId: 'snap_titantreasure_com_latest',
  domain: 'titantreasure.com',
  timestamp: '2026-08-07T08:00:00.000Z',
  dataSource: 'ahrefs-api-v3',
  domainRating: 30,
  estimatedTraffic: 1200,
  referringDomains: 475,
  totalBacklinks: 1556,
  organicKeywords: 10,
  seoHealthScore: { score: 95, grade: 'A+', breakdown: { domainRatingScore: 15, referringDomainsScore: 25, trafficScore: 25, dofollowScore: 15, serpScore: 15 }, recommendations: ['Maintain backlink acquisition velocity and monitor core branded ranking keywords.'] },
  overview: {
    domain: 'titantreasure.com', domainRating: 30, urlRating: 18, ahrefsRank: 1520000,
    organicTraffic: 1200, trafficValue: 500, rankingKeywords: 10,
    totalBacklinks: 1556, referringDomains: 475, dofollowBacklinks: 1213,
    dofollowRefdomains: 399, nofollowLinks: 343, timestamp: '2026-08-07T08:00:00.000Z',
    seoHealthScore: { score: 95, grade: 'A+', breakdown: { domainRatingScore: 15, referringDomainsScore: 25, trafficScore: 25, dofollowScore: 15, serpScore: 15 }, recommendations: ['Maintain backlink acquisition velocity and monitor core branded ranking keywords.'] }
  },
  keywords: {
    domain: 'titantreasure.com', totalKeywords: 10, top3Count: 2, top10Count: 6, top50Count: 10, estimatedTraffic: 1200, trafficValue: 500,
    keywords: [
      { keyword: 'titan treasure casino', position: 2, previousPosition: 4, positionChange: 2, searchVolume: 3200, keywordDifficulty: 18, estimatedTraffic: 850, trafficChange: 150, url: 'https://titantreasure.com/', serpFeatures: ['Site Links', 'People Also Ask'], searchIntent: 'Navigational' },
      { keyword: 'titan treasure sweepstakes', position: 5, previousPosition: 7, positionChange: 2, searchVolume: 1900, keywordDifficulty: 22, estimatedTraffic: 250, trafficChange: 40, url: 'https://titantreasure.com/bonus', serpFeatures: ['People Also Ask'], searchIntent: 'Commercial' },
      { keyword: 'titan treasure login', position: 8, previousPosition: 8, positionChange: 0, searchVolume: 1200, keywordDifficulty: 12, estimatedTraffic: 100, trafficChange: 0, url: 'https://titantreasure.com/login', serpFeatures: [], searchIntent: 'Navigational' }
    ]
  },
  topPages: {
    domain: 'titantreasure.com', totalPages: 2, totalOrganicTraffic: 1200, totalTrafficValue: 500,
    pages: [
      { url: 'https://titantreasure.com/', organicTraffic: 850, trafficChange: 150, rankingKeywords: 6, topKeyword: 'titan treasure casino', trafficValue: 350 },
      { url: 'https://titantreasure.com/bonus', organicTraffic: 350, trafficChange: 40, rankingKeywords: 4, topKeyword: 'titan treasure sweepstakes', trafficValue: 150 }
    ]
  },
  backlinks: {
    domain: 'titantreasure.com', totalBacklinks: 1556, referringDomains: 475, dofollowRatio: 0.78, dofollowBacklinks: 1213, dofollowRefdomains: 399,
    topAnchors: [{ anchor: 'titantreasure.com', count: 142 }, { anchor: 'titan treasure', count: 98 }],
    recentBacklinks: [{ urlFrom: 'https://casino-authority.org/reviews/titantreasure', urlTo: 'https://titantreasure.com/', anchorText: 'titan treasure', domainRatingFrom: 42, isDofollow: true, firstSeen: '2026-08-01T08:00:00.000Z', lastSeen: '2026-08-07T08:00:00.000Z', status: 'LIVE' }],
    seoHealthScore: { score: 95, grade: 'A+', breakdown: { domainRatingScore: 15, referringDomainsScore: 25, trafficScore: 25, dofollowScore: 15, serpScore: 15 }, recommendations: ['Maintain backlink acquisition velocity.'] }
  },
  competitors: [
    { competitor_domain: 'chumbacasino.com', overlap_keywords: 45, competitor_keywords: 1460, competitor_traffic: 32100, competitor_dr: 51 },
    { competitor_domain: 'pulsz.com', overlap_keywords: 38, competitor_keywords: 1200, competitor_traffic: 28400, competitor_dr: 48 },
    { competitor_domain: 'luckylandslots.com', overlap_keywords: 30, competitor_keywords: 950, competitor_traffic: 21000, competitor_dr: 44 }
  ] as unknown as DomainSnapshot['competitors']
};

const snapRedEngage: DomainSnapshot = {
  snapshotId: 'snap_red-engage_com_1786005320094',
  domain: 'red-engage.com',
  timestamp: '2026-08-06T08:35:20.094Z',
  dataSource: 'ahrefs-api-v3',
  domainRating: 49, estimatedTraffic: 29900, referringDomains: 880, totalBacklinks: 5700, organicKeywords: 1640,
  seoHealthScore: { score: 85, grade: 'A', breakdown: { domainRatingScore: 14.7, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: ['Maintain backlink velocity.'] },
  overview: {
    domain: 'red-engage.com', domainRating: 49, urlRating: 39, ahrefsRank: 219000,
    organicTraffic: 29900, trafficValue: 56810, rankingKeywords: 1330,
    totalBacklinks: 5700, referringDomains: 880, dofollowBacklinks: 4446,
    dofollowRefdomains: 739, nofollowLinks: 1254, timestamp: '2026-08-06T08:35:20.092Z',
    seoHealthScore: { score: 85, grade: 'A', breakdown: { domainRatingScore: 14.7, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: [] }
  },
  keywords: {
    domain: 'red-engage.com', totalKeywords: 1640, top3Count: 16, top10Count: 62, top50Count: 244, estimatedTraffic: 37700, trafficValue: 69745,
    keywords: [
      { keyword: 'red-engage review', position: 2, previousPosition: 4, positionChange: 2, searchVolume: 8400, keywordDifficulty: 28, estimatedTraffic: 3200, trafficChange: 450, url: 'https://red-engage.com/review', serpFeatures: ['Featured Snippet'], searchIntent: 'Commercial' },
      { keyword: 'best red-engage platform', position: 5, previousPosition: 5, positionChange: 0, searchVolume: 4200, keywordDifficulty: 42, estimatedTraffic: 1100, trafficChange: 0, url: 'https://red-engage.com/features', serpFeatures: ['People Also Ask'], searchIntent: 'Informational' }
    ]
  },
  topPages: {
    domain: 'red-engage.com', totalPages: 3, totalOrganicTraffic: 13600, totalTrafficValue: 24100,
    pages: [
      { url: 'https://red-engage.com/', organicTraffic: 8500, trafficChange: 420, rankingKeywords: 180, topKeyword: 'red-engage official', trafficValue: 14500 },
      { url: 'https://red-engage.com/review', organicTraffic: 3200, trafficChange: 250, rankingKeywords: 85, topKeyword: 'red-engage review', trafficValue: 6200 }
    ]
  },
  backlinks: {
    domain: 'red-engage.com', totalBacklinks: 5700, referringDomains: 880, dofollowRatio: 0.78, dofollowBacklinks: 4446, dofollowRefdomains: 739,
    topAnchors: [{ anchor: 'red-engage.com', count: 352 }, { anchor: 'visit red-engage.com', count: 220 }],
    recentBacklinks: [{ urlFrom: 'https://techblog-news.org/review/red-engage-com', urlTo: 'https://red-engage.com/', anchorText: 'red-engage.com', domainRatingFrom: 54, isDofollow: true, firstSeen: '2026-08-04T08:35:20.094Z', lastSeen: '2026-08-06T08:35:20.094Z', status: 'LIVE' }],
    seoHealthScore: { score: 85, grade: 'A', breakdown: { domainRatingScore: 14.7, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: [] }
  },
  competitors: [] as unknown as DomainSnapshot['competitors']
};

const snapStaticRegistry: Record<string, DomainSnapshot> = {
  'titantreasure.com': snapTitanTreasure,
  'red-engage.com': snapRedEngage,
};

export function getStaticSnapshot(domain: string): DomainSnapshot | null {
  if (!domain) return null;
  return snapStaticRegistry[domain.toLowerCase().trim()] ?? null;
}
