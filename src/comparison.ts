import { DomainSnapshot, TrendComparison, OrganicKeywordItem, TopPageItem, BacklinkItem } from './types';
import { Logger } from './logger';

export class ComparisonEngine {
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ context: 'ComparisonEngine' });
  }

  public compareSnapshots(current: DomainSnapshot, previous?: DomainSnapshot): TrendComparison {
    if (!previous) {
      this.logger.info(`No previous snapshot found for ${current.domain}. Marking as NEW trend.`);
      return {
        drChange: 0,
        ahrefsRankChange: 0,
        trafficChange: 0,
        trafficValueChange: 0,
        rankingKeywordsChange: 0,
        referringDomainsChange: 0,
        backlinksChange: 0,
        dofollowRatioChange: 0,
        healthScoreChange: 0,
        trendDirection: 'NEW',
        topKeywordGainers: [],
        topKeywordLosers: [],
        newKeywords: [],
        lostKeywords: [],
        topPageGains: [],
        topPageDrops: [],
        newBacklinks: [],
        lostBacklinks: []
      };
    }

    const curOverview = current.overview || {
      domainRating: current.domainRating,
      ahrefsRank: 0,
      organicTraffic: current.estimatedTraffic,
      trafficValue: 0,
      rankingKeywords: current.organicKeywords,
      referringDomains: current.referringDomains,
      totalBacklinks: current.totalBacklinks,
      dofollowBacklinks: Math.round(current.totalBacklinks * 0.75)
    };

    const prevOverview = previous.overview || {
      domainRating: previous.domainRating,
      ahrefsRank: 0,
      organicTraffic: previous.estimatedTraffic,
      trafficValue: 0,
      rankingKeywords: previous.organicKeywords,
      referringDomains: previous.referringDomains,
      totalBacklinks: previous.totalBacklinks,
      dofollowBacklinks: Math.round(previous.totalBacklinks * 0.75)
    };

    const drChange = curOverview.domainRating - prevOverview.domainRating;
    const ahrefsRankChange = (prevOverview.ahrefsRank || 0) - (curOverview.ahrefsRank || 0); // Lower rank is better
    const trafficChange = curOverview.organicTraffic - prevOverview.organicTraffic;
    const trafficValueChange = (curOverview.trafficValue || 0) - (prevOverview.trafficValue || 0);
    const rankingKeywordsChange = curOverview.rankingKeywords - prevOverview.rankingKeywords;
    const referringDomainsChange = curOverview.referringDomains - prevOverview.referringDomains;
    const backlinksChange = curOverview.totalBacklinks - prevOverview.totalBacklinks;

    const curDofollowRatio = curOverview.totalBacklinks > 0 ? (curOverview.dofollowBacklinks / curOverview.totalBacklinks) : 0;
    const prevDofollowRatio = prevOverview.totalBacklinks > 0 ? (prevOverview.dofollowBacklinks / prevOverview.totalBacklinks) : 0;
    const dofollowRatioChange = Number((curDofollowRatio - prevDofollowRatio).toFixed(2));

    const curHealth = current.seoHealthScore?.score ?? 0;
    const prevHealth = previous.seoHealthScore?.score ?? 0;
    const healthScoreChange = curHealth - prevHealth;

    // Keyword comparisons
    const curKws = current.keywords?.keywords || [];
    const prevKwsMap = new Map((previous.keywords?.keywords || []).map(k => [k.keyword, k]));

    const topKeywordGainers: OrganicKeywordItem[] = curKws.filter(k => (k.positionChange || 0) > 0);
    const topKeywordLosers: OrganicKeywordItem[] = curKws.filter(k => (k.positionChange || 0) < 0);

    const newKeywords: OrganicKeywordItem[] = curKws.filter(k => !prevKwsMap.has(k.keyword));
    const curKwsMap = new Map(curKws.map(k => [k.keyword, k]));
    const lostKeywords: OrganicKeywordItem[] = (previous.keywords?.keywords || []).filter(k => !curKwsMap.has(k.keyword));

    // Top Pages comparisons
    const curPages = current.topPages?.pages || [];
    const topPageGains: TopPageItem[] = curPages.filter(p => p.trafficChange > 0);
    const topPageDrops: TopPageItem[] = curPages.filter(p => p.trafficChange < 0);

    // Backlink comparisons
    const curLinks = current.backlinks?.recentBacklinks || [];
    const prevLinksMap = new Set((previous.backlinks?.recentBacklinks || []).map(l => l.urlFrom));
    const newBacklinks: BacklinkItem[] = curLinks.filter(l => !prevLinksMap.has(l.urlFrom));
    const lostBacklinks: BacklinkItem[] = (previous.backlinks?.recentBacklinks || []).filter(l => l.status === 'LOST');

    let trendDirection: 'UP' | 'DOWN' | 'STABLE' | 'NEW' = 'STABLE';
    if (healthScoreChange > 0 || drChange > 0 || trafficChange > 0) {
      trendDirection = 'UP';
    } else if (healthScoreChange < 0 || drChange < 0 || trafficChange < 0) {
      trendDirection = 'DOWN';
    }

    this.logger.info(`Snapshot comparison completed for ${current.domain}`, {
      trendDirection,
      drChange,
      trafficChange,
      healthScoreChange
    });

    return {
      previousTimestamp: previous.timestamp,
      drChange,
      ahrefsRankChange,
      trafficChange,
      trafficValueChange,
      rankingKeywordsChange,
      referringDomainsChange,
      backlinksChange,
      dofollowRatioChange,
      healthScoreChange,
      trendDirection,
      topKeywordGainers,
      topKeywordLosers,
      newKeywords,
      lostKeywords,
      topPageGains,
      topPageDrops,
      newBacklinks,
      lostBacklinks
    };
  }
}
