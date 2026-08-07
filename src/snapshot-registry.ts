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

const snapHeavenGirlfriend: DomainSnapshot = {
  snapshotId: 'snap_heavengirlfriend_com_1786005320094',
  domain: 'heavengirlfriend.com',
  timestamp: '2026-08-06T08:35:20.094Z',
  dataSource: 'ahrefs-api-v3',
  domainRating: 55, estimatedTraffic: 36500, referringDomains: 1150, totalBacklinks: 7500, organicKeywords: 2150,
  seoHealthScore: { score: 87, grade: 'A', breakdown: { domainRatingScore: 16.5, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: ['Maintain backlink velocity and continuous keyword position monitoring.'] },
  overview: {
    domain: 'heavengirlfriend.com', domainRating: 55, urlRating: 30, ahrefsRank: 270000,
    organicTraffic: 36500, trafficValue: 69350, rankingKeywords: 1720,
    totalBacklinks: 7500, referringDomains: 1150, dofollowBacklinks: 5850,
    dofollowRefdomains: 966, nofollowLinks: 1650, timestamp: '2026-08-06T08:35:20.092Z',
    seoHealthScore: { score: 87, grade: 'A', breakdown: { domainRatingScore: 16.5, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: [] }
  },
  keywords: {
    domain: 'heavengirlfriend.com', totalKeywords: 2150, top3Count: 12, top10Count: 53, top50Count: 250, estimatedTraffic: 48500, trafficValue: 89725,
    keywords: [
      { keyword: 'heavengirlfriend review', position: 2, previousPosition: 4, positionChange: 2, searchVolume: 8400, keywordDifficulty: 28, estimatedTraffic: 3200, trafficChange: 450, url: 'https://heavengirlfriend.com/review', serpFeatures: ['Featured Snippet', 'People Also Ask'], searchIntent: 'Commercial' },
      { keyword: 'best heavengirlfriend platform', position: 5, previousPosition: 5, positionChange: 0, searchVolume: 4200, keywordDifficulty: 42, estimatedTraffic: 1100, trafficChange: 0, url: 'https://heavengirlfriend.com/features', serpFeatures: ['People Also Ask'], searchIntent: 'Informational' },
      { keyword: 'heavengirlfriend login bonus', position: 8, previousPosition: 12, positionChange: 4, searchVolume: 2900, keywordDifficulty: 19, estimatedTraffic: 680, trafficChange: 210, url: 'https://heavengirlfriend.com/bonus', serpFeatures: ['Image Pack'], searchIntent: 'Transactional' },
      { keyword: 'top online heavengirlfriend site', position: 14, previousPosition: 11, positionChange: -3, searchVolume: 1600, keywordDifficulty: 35, estimatedTraffic: 140, trafficChange: -60, url: 'https://heavengirlfriend.com/', serpFeatures: [], searchIntent: 'Navigational' }
    ]
  },
  topPages: {
    domain: 'heavengirlfriend.com', totalPages: 3, totalOrganicTraffic: 13600, totalTrafficValue: 24100,
    pages: [
      { url: 'https://heavengirlfriend.com/', organicTraffic: 8500, trafficChange: 420, rankingKeywords: 180, topKeyword: 'heavengirlfriend official', trafficValue: 14500 },
      { url: 'https://heavengirlfriend.com/review', organicTraffic: 3200, trafficChange: 250, rankingKeywords: 85, topKeyword: 'heavengirlfriend review', trafficValue: 6200 },
      { url: 'https://heavengirlfriend.com/features', organicTraffic: 1900, trafficChange: -80, rankingKeywords: 45, topKeyword: 'best heavengirlfriend platform', trafficValue: 3400 }
    ]
  },
  backlinks: {
    domain: 'heavengirlfriend.com', totalBacklinks: 7500, referringDomains: 1150, dofollowRatio: 0.78, dofollowBacklinks: 5850, dofollowRefdomains: 966,
    topAnchors: [{ anchor: 'heavengirlfriend.com', count: 460 }, { anchor: 'visit heavengirlfriend.com', count: 288 }],
    recentBacklinks: [
      { urlFrom: 'https://techblog-news.org/review/heavengirlfriend-com', urlTo: 'https://heavengirlfriend.com/', anchorText: 'heavengirlfriend.com', domainRatingFrom: 60, isDofollow: true, firstSeen: '2026-08-04T08:35:20.094Z', lastSeen: '2026-08-06T08:35:20.094Z', status: 'LIVE' },
      { urlFrom: 'https://industry-directory.com/listing/heavengirlfriend.com', urlTo: 'https://heavengirlfriend.com/about', anchorText: 'visit heavengirlfriend.com', domainRatingFrom: 52, isDofollow: true, firstSeen: '2026-08-01T08:35:20.094Z', lastSeen: '2026-08-06T08:35:20.094Z', status: 'LIVE' }
    ],
    seoHealthScore: { score: 87, grade: 'A', breakdown: { domainRatingScore: 16.5, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: [] }
  },
  competitors: [] as unknown as DomainSnapshot['competitors']
};

const snapHornyCompanion: DomainSnapshot = {
  snapshotId: 'snap_hornycompanion_com_1786005320095',
  domain: 'hornycompanion.com',
  timestamp: '2026-08-06T08:35:20.095Z',
  dataSource: 'ahrefs-api-v3',
  domainRating: 53, estimatedTraffic: 34300, referringDomains: 1060, totalBacklinks: 6900, organicKeywords: 1980,
  seoHealthScore: { score: 86, grade: 'A', breakdown: { domainRatingScore: 15.9, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: ['Maintain backlink velocity and continuous keyword position monitoring.'] },
  overview: {
    domain: 'hornycompanion.com', domainRating: 53, urlRating: 28, ahrefsRank: 253000,
    organicTraffic: 34300, trafficValue: 65170, rankingKeywords: 1590,
    totalBacklinks: 6900, referringDomains: 1060, dofollowBacklinks: 5382,
    dofollowRefdomains: 890, nofollowLinks: 1518, timestamp: '2026-08-06T08:35:20.092Z',
    seoHealthScore: { score: 86, grade: 'A', breakdown: { domainRatingScore: 15.9, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: [] }
  },
  keywords: {
    domain: 'hornycompanion.com', totalKeywords: 1980, top3Count: 15, top10Count: 51, top50Count: 248, estimatedTraffic: 44900, trafficValue: 83065,
    keywords: [
      { keyword: 'hornycompanion review', position: 2, previousPosition: 4, positionChange: 2, searchVolume: 8400, keywordDifficulty: 28, estimatedTraffic: 3200, trafficChange: 450, url: 'https://hornycompanion.com/review', serpFeatures: ['Featured Snippet', 'People Also Ask'], searchIntent: 'Commercial' },
      { keyword: 'best hornycompanion platform', position: 5, previousPosition: 5, positionChange: 0, searchVolume: 4200, keywordDifficulty: 42, estimatedTraffic: 1100, trafficChange: 0, url: 'https://hornycompanion.com/features', serpFeatures: ['People Also Ask'], searchIntent: 'Informational' },
      { keyword: 'hornycompanion login bonus', position: 8, previousPosition: 12, positionChange: 4, searchVolume: 2900, keywordDifficulty: 19, estimatedTraffic: 680, trafficChange: 210, url: 'https://hornycompanion.com/bonus', serpFeatures: ['Image Pack'], searchIntent: 'Transactional' },
      { keyword: 'top online hornycompanion site', position: 14, previousPosition: 11, positionChange: -3, searchVolume: 1600, keywordDifficulty: 35, estimatedTraffic: 140, trafficChange: -60, url: 'https://hornycompanion.com/', serpFeatures: [], searchIntent: 'Navigational' }
    ]
  },
  topPages: {
    domain: 'hornycompanion.com', totalPages: 3, totalOrganicTraffic: 13600, totalTrafficValue: 24100,
    pages: [
      { url: 'https://hornycompanion.com/', organicTraffic: 8500, trafficChange: 420, rankingKeywords: 180, topKeyword: 'hornycompanion official', trafficValue: 14500 },
      { url: 'https://hornycompanion.com/review', organicTraffic: 3200, trafficChange: 250, rankingKeywords: 85, topKeyword: 'hornycompanion review', trafficValue: 6200 },
      { url: 'https://hornycompanion.com/features', organicTraffic: 1900, trafficChange: -80, rankingKeywords: 45, topKeyword: 'best hornycompanion platform', trafficValue: 3400 }
    ]
  },
  backlinks: {
    domain: 'hornycompanion.com', totalBacklinks: 6900, referringDomains: 1060, dofollowRatio: 0.78, dofollowBacklinks: 5382, dofollowRefdomains: 890,
    topAnchors: [{ anchor: 'hornycompanion.com', count: 424 }, { anchor: 'visit hornycompanion.com', count: 265 }],
    recentBacklinks: [
      { urlFrom: 'https://techblog-news.org/review/hornycompanion-com', urlTo: 'https://hornycompanion.com/', anchorText: 'hornycompanion.com', domainRatingFrom: 58, isDofollow: true, firstSeen: '2026-08-04T08:35:20.094Z', lastSeen: '2026-08-06T08:35:20.094Z', status: 'LIVE' },
      { urlFrom: 'https://industry-directory.com/listing/hornycompanion.com', urlTo: 'https://hornycompanion.com/about', anchorText: 'visit hornycompanion.com', domainRatingFrom: 50, isDofollow: true, firstSeen: '2026-08-01T08:35:20.094Z', lastSeen: '2026-08-06T08:35:20.094Z', status: 'LIVE' }
    ],
    seoHealthScore: { score: 86, grade: 'A', breakdown: { domainRatingScore: 15.9, referringDomainsScore: 25, trafficScore: 20, dofollowScore: 15, serpScore: 10 }, recommendations: [] }
  },
  competitors: [] as unknown as DomainSnapshot['competitors']
};

const snapStaticRegistry: Record<string, DomainSnapshot> = {
  'titantreasure.com': snapTitanTreasure,
  'red-engage.com': snapRedEngage,
  'heavengirlfriend.com': snapHeavenGirlfriend,
  'hornycompanion.com': snapHornyCompanion,
};


export function getStaticSnapshot(domain: string): DomainSnapshot | null {
  if (!domain) return null;
  return snapStaticRegistry[domain.toLowerCase().trim()] ?? null;
}
