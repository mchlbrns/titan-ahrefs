export interface ManagedDomainConfig {
  domain: string;
  target_country: string;
  priority: string;
  description: string;
}

export interface DomainRegistry {
  managed_domains: ManagedDomainConfig[];
}

export interface CompetitorRegistry {
  competitors_by_domain: Record<string, string[]>;
}

export interface DomainRatingMetrics {
  domain: string;
  domainRating: number;
  urlRating: number;
  ahrefsRank: number;
  totalBacklinks: number;
  referringDomains: number;
  dofollowLinks: number;
  nofollowLinks: number;
  timestamp: string;
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition?: number;
  positionDelta?: number;
  searchVolume: number;
  keywordDifficulty: number;
  serpFeatures: string[];
  url: string;
}

export interface DomainKeywordReport {
  domain: string;
  totalKeywords: number;
  top3Count: number;
  top10Count: number;
  top50Count: number;
  estimatedTraffic: number;
  keywords: KeywordRanking[];
}

export interface BacklinkItem {
  urlFrom: string;
  urlTo: string;
  anchorText: string;
  domainRatingFrom: number;
  isDofollow: boolean;
  firstSeen: string;
  lastSeen: string;
}

export interface BacklinkAuditReport {
  domain: string;
  totalBacklinks: number;
  referringDomains: number;
  dofollowRatio: number;
  topAnchors: { anchor: string; count: number }[];
  recentBacklinks: BacklinkItem[];
}

export interface DomainSnapshot {
  snapshotId: string;
  domain: string;
  timestamp: string;
  domainRating: number;
  referringDomains: number;
  totalBacklinks: number;
  estimatedTraffic: number;
  organicKeywords: number;
}

export interface CompetitorOverlapResult {
  targetDomain: string;
  competitorDomain: string;
  sharedKeywords: number;
  competitorExclusiveKeywords: number;
  gapOpportunities: { keyword: string; competitorPosition: number; searchVolume: number }[];
}

export interface ExecutiveWeeklyReport {
  generatedAt: string;
  domainsAudited: string[];
  summaries: {
    domain: string;
    domainRating: number;
    referringDomains: number;
    estimatedTraffic: number;
    keywordWins: number;
    keywordLosses: number;
  }[];
  markdownContent: string;
}
