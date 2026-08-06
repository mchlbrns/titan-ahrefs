import { SeoHealthScore } from './health';

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

// Task 1: API Usage Monitoring
export interface ApiUsageLimits {
  unitsLimit: number;
  unitsConsumed: number;
  unitsRemaining: number;
  resetDate: string;
  apiKeyStatus: string;
}

export interface ApiRequestCostLog {
  endpoint: string;
  timestamp: string;
  unitsConsumed: number;
  estimatedCostUsd: number;
  success: boolean;
}

// Task 2: Domain Overview Collection
export interface DomainOverviewMetrics {
  domain: string;
  domainRating: number;
  urlRating: number;
  ahrefsRank: number;
  organicTraffic: number;
  trafficValue: number;
  rankingKeywords: number;
  totalBacklinks: number;
  referringDomains: number;
  dofollowBacklinks: number;
  dofollowRefdomains: number;
  nofollowLinks: number;
  timestamp: string;
  seoHealthScore?: SeoHealthScore;
}

// Legacy alias for backwards compatibility
export type DomainRatingMetrics = DomainOverviewMetrics;

// Task 3: Organic Keywords Collection
export interface OrganicKeywordItem {
  keyword: string;
  position: number;
  previousPosition?: number;
  positionChange: number;
  searchVolume: number;
  keywordDifficulty: number;
  estimatedTraffic: number;
  trafficChange: number;
  url: string;
  serpFeatures: string[];
  searchIntent: 'Informational' | 'Transactional' | 'Commercial' | 'Navigational' | 'Mixed';
}

// Legacy alias for backwards compatibility
export type KeywordRanking = OrganicKeywordItem & { positionDelta?: number };

export interface DomainKeywordReport {
  domain: string;
  totalKeywords: number;
  top3Count: number;
  top10Count: number;
  top50Count: number;
  estimatedTraffic: number;
  trafficValue?: number;
  keywords: OrganicKeywordItem[];
}

// Task 4: Top Pages Collection
export interface TopPageItem {
  url: string;
  organicTraffic: number;
  trafficChange: number;
  rankingKeywords: number;
  topKeyword: string;
  trafficValue: number;
}

export interface TopPagesReport {
  domain: string;
  totalPages: number;
  totalOrganicTraffic: number;
  totalTrafficValue: number;
  pages: TopPageItem[];
}

// Task 5: Competitor Collection
export interface CompetitorGapOpportunity {
  keyword: string;
  competitorPosition: number;
  searchVolume: number;
  keywordDifficulty?: number;
  searchIntent?: string;
}

export interface CompetitorMetrics {
  targetDomain: string;
  competitorDomain: string;
  domainRating: number;
  organicTraffic: number;
  trafficValue: number;
  sharedKeywords: number;
  competitorExclusiveKeywords: number;
  gapOpportunities: CompetitorGapOpportunity[];
}

// Legacy alias for backwards compatibility
export type CompetitorOverlapResult = CompetitorMetrics;

// Task 6: Backlink Collection
export interface BacklinkItem {
  urlFrom: string;
  urlTo: string;
  anchorText: string;
  domainRatingFrom: number;
  isDofollow: boolean;
  firstSeen: string;
  lastSeen: string;
  status?: 'LIVE' | 'LOST' | 'NEW';
}

export interface BacklinkAuditReport {
  domain: string;
  totalBacklinks: number;
  referringDomains: number;
  dofollowRatio: number;
  dofollowBacklinks?: number;
  dofollowRefdomains?: number;
  topAnchors: { anchor: string; count: number }[];
  recentBacklinks: BacklinkItem[];
  seoHealthScore?: SeoHealthScore;
}

// Task 7: Database Normalized Snapshots
export interface DomainSnapshot {
  snapshotId: string;
  domain: string;
  timestamp: string;
  overview: DomainOverviewMetrics;
  keywords: DomainKeywordReport;
  topPages: TopPagesReport;
  backlinks: BacklinkAuditReport;
  competitors: CompetitorMetrics[];
  domainRating: number;
  referringDomains: number;
  totalBacklinks: number;
  estimatedTraffic: number;
  organicKeywords: number;
  seoHealthScore?: SeoHealthScore;
}

// Task 8: Comparison Engine
export interface TrendComparison {
  previousTimestamp?: string;
  drChange: number;
  ahrefsRankChange: number;
  trafficChange: number;
  trafficValueChange: number;
  rankingKeywordsChange: number;
  referringDomainsChange: number;
  backlinksChange: number;
  dofollowRatioChange: number;
  healthScoreChange: number;
  trendDirection: 'UP' | 'DOWN' | 'STABLE' | 'NEW';
  topKeywordGainers: OrganicKeywordItem[];
  topKeywordLosers: OrganicKeywordItem[];
  newKeywords: OrganicKeywordItem[];
  lostKeywords: OrganicKeywordItem[];
  topPageGains: TopPageItem[];
  topPageDrops: TopPageItem[];
  newBacklinks: BacklinkItem[];
  lostBacklinks: BacklinkItem[];
}

// Task 9: Recommendation Engine & Reporting
export interface SeoRecommendation {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'AUTHORITY' | 'KEYWORDS' | 'TOP_PAGES' | 'BACKLINKS' | 'COMPETITORS';
  title: string;
  impact: string;
  recommendation: string;
  actionSteps: string[];
}

export interface ExecutiveSummaryItem {
  domain: string;
  domainRating: number;
  ahrefsRank: number;
  organicTraffic: number;
  trafficValue: number;
  referringDomains: number;
  totalBacklinks: number;
  keywordWins: number;
  keywordLosses: number;
  seoHealthScore?: SeoHealthScore;
  trend?: TrendComparison;
  recommendations: SeoRecommendation[];
}

export interface ExecutiveWeeklyReport {
  generatedAt: string;
  domainsAudited: string[];
  summaries: ExecutiveSummaryItem[];
  apiUsageSummary?: ApiUsageLimits;
  markdownContent: string;
  htmlContent?: string;
  jsonContent?: string;
  csvContent?: string;
}

export interface ReportOptions {
  outputDir?: string;
  enableHtml?: boolean;
  enableCsv?: boolean;
  includeHistoricalTrends?: boolean;
}

