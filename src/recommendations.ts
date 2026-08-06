import { DomainSnapshot, TrendComparison, SeoRecommendation } from './types';
import { Logger } from './logger';

export class RecommendationEngine {
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ context: 'RecommendationEngine' });
  }

  public generateRecommendations(snapshot: DomainSnapshot, trend?: TrendComparison): SeoRecommendation[] {
    this.logger.info(`Generating strategic SEO recommendations for ${snapshot.domain}`);
    const recs: SeoRecommendation[] = [];
    const domain = snapshot.domain;
    const backlinks = snapshot.backlinks;
    const competitors = snapshot.competitors || [];

    // Rule 1: High Priority - Negative Traffic or DR Drop
    if (trend && (trend.trafficChange < 0 || trend.drChange < 0)) {
      recs.push({
        id: `rec_traffic_recovery_${Date.now()}`,
        priority: 'HIGH',
        category: 'AUTHORITY',
        title: `Address Organic Traffic Drop (-${Math.abs(trend.trafficChange).toLocaleString()} visits)`,
        impact: 'High Impact — Reclaim Lost Organic Search Market Share',
        recommendation: `Organic traffic or DR decreased since last snapshot for ${domain}. Conduct a technical SEO and content freshness audit on top falling pages immediately.`,
        actionSteps: [
          'Audit top pages experiencing traffic drops in Google Search Console & Ahrefs',
          'Refresh outdated content, update stats, and optimize on-page header tags',
          'Verify no broken internal links or canonical tags were introduced'
        ]
      });
    }

    // Rule 2: High Priority - Low Dofollow Link Ratio (<70%)
    if (backlinks && backlinks.dofollowRatio < 0.70) {
      recs.push({
        id: `rec_dofollow_ratio_${Date.now()}`,
        priority: 'HIGH',
        category: 'BACKLINKS',
        title: `Improve Low Dofollow Link Ratio (${(backlinks.dofollowRatio * 100).toFixed(0)}%)`,
        impact: 'High Impact — Maximize PageRank / Link Equity Transfer',
        recommendation: `Only ${(backlinks.dofollowRatio * 100).toFixed(0)}% of total backlinks are dofollow. Expand link building outreach to authoritative industry media for contextual dofollow backlinks.`,
        actionSteps: [
          'Launch digital PR and guest expert outreach campaigns',
          'Target niche publications with DR 40+ for contextual follow links',
          'Reclaim unlinked brand mentions across industry portals'
        ]
      });
    }

    // Rule 3: Medium Priority - Competitor SERP Gap Opportunities
    for (const comp of competitors) {
      if (comp.gapOpportunities && comp.gapOpportunities.length > 0) {
        const topGap = comp.gapOpportunities[0];
        recs.push({
          id: `rec_competitor_gap_${comp.competitorDomain}_${Date.now()}`,
          priority: 'MEDIUM',
          category: 'COMPETITORS',
          title: `Capitalize on Content Gap vs ${comp.competitorDomain}`,
          impact: 'Medium Impact — Capture High Intent Search Demand',
          recommendation: `${comp.competitorDomain} currently ranks #${topGap.competitorPosition} for "${topGap.keyword}" (Vol: ${topGap.searchVolume.toLocaleString()}) where ${domain} is absent.`,
          actionSteps: [
            `Publish a comprehensive guide targeted at "${topGap.keyword}"`,
            'Ensure page includes detailed subheadings, comparison tables, and FAQ schemas',
            'Build 3-5 high-DR internal links pointing to the new content'
          ]
        });
      }
    }

    // Rule 4: Medium Priority - Keywords in Positions #4-#10 (Striking Distance)
    const keywords = snapshot.keywords?.keywords || [];
    const strikingDistance = keywords.filter(k => k.position >= 4 && k.position <= 10);
    if (strikingDistance.length > 0) {
      const topKw = strikingDistance[0];
      recs.push({
        id: `rec_striking_distance_${Date.now()}`,
        priority: 'MEDIUM',
        category: 'KEYWORDS',
        title: `Push Striking Distance Keyword "${topKw.keyword}" to Top 3`,
        impact: 'Medium Impact — Significant CTR & Traffic Uplift',
        recommendation: `"${topKw.keyword}" currently ranks #${topKw.position} (Search Volume: ${topKw.searchVolume.toLocaleString()}). A targeted push can move it into the top 3 results.`,
        actionSteps: [
          `Enhance search intent alignment for URL ${topKw.url}`,
          'Add rich snippet schema markup (FAQ, Review, or HowTo)',
          'Pass internal link equity from top performing pages'
        ]
      });
    }

    // Rule 5: Low Priority - SERP Feature Opportunities
    const featuredSnippetOpps = keywords.filter(k => k.serpFeatures && k.serpFeatures.includes('People Also Ask'));
    if (featuredSnippetOpps.length > 0) {
      recs.push({
        id: `rec_serp_features_${Date.now()}`,
        priority: 'LOW',
        category: 'TOP_PAGES',
        title: 'Optimize Content for People Also Ask & Featured Snippets',
        impact: 'Low to Medium Impact — Increase SERP Real Estate Visibility',
        recommendation: `${featuredSnippetOpps.length} target keywords feature PAA blocks on SERP. Format content headings directly as concise questions and 50-word answers.`,
        actionSteps: [
          'Add structured H2/H3 question headers matching exact PAA queries',
          'Use bulleted lists and concise definition paragraphs under subheadings'
        ]
      });
    }

    this.logger.info(`Generated ${recs.length} actionable SEO recommendations for ${domain}`);
    return recs;
  }
}
