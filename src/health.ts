export interface SeoHealthScoreBreakdown {
  domainRatingScore: number;
  referringDomainsScore: number;
  trafficScore: number;
  dofollowScore: number;
  serpScore: number;
}

export interface SeoHealthScore {
  score: number;
  siteAuditHealthScore: number;
  commercialGrowthScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: SeoHealthScoreBreakdown;
  recommendations: string[];
}

export interface HealthScoreInput {
  domainRating: number;
  referringDomains: number;
  totalBacklinks: number;
  dofollowLinks: number;
  estimatedTraffic?: number;
  top10Count?: number;
  siteAuditHealthScore?: number;
}

export function calculateSeoHealthScore(input: HealthScoreInput): SeoHealthScore {
  const dr = Math.min(Math.max(input.domainRating, 0), 100);
  const domainRatingScore = Number(((dr / 100) * 30).toFixed(1));

  // Referring Domains weight 25% (target ~500 referring domains)
  const refRatio = Math.min(Math.max(input.referringDomains, 0) / 500, 1.0);
  const referringDomainsScore = Number((refRatio * 25).toFixed(1));

  // Estimated Traffic weight 20% (target ~20,000 monthly traffic)
  const traffic = input.estimatedTraffic ?? 5000;
  const trafficRatio = Math.min(Math.max(traffic, 0) / 20000, 1.0);
  const trafficScore = Number((trafficRatio * 20).toFixed(1));

  // Dofollow ratio weight 15% (optimal ratio between 0.65 and 0.85)
  const dofollowRatio = input.totalBacklinks > 0 ? input.dofollowLinks / input.totalBacklinks : 0;
  let dofollowScore = 0;
  if (dofollowRatio >= 0.65 && dofollowRatio <= 0.90) {
    dofollowScore = 15;
  } else if (dofollowRatio > 0.40) {
    dofollowScore = 10;
  } else {
    dofollowScore = 5;
  }

  // SERP / Top 10 Count weight 10% (target ~50 top 10 rankings)
  const top10 = input.top10Count ?? 10;
  const serpRatio = Math.min(Math.max(top10, 0) / 50, 1.0);
  const serpScore = Number((serpRatio * 10).toFixed(1));

  const commercialGrowthScore = Math.round(
    domainRatingScore + referringDomainsScore + trafficScore + dofollowScore + serpScore
  );

  // Technical Site Audit Health Score defaults to input or 95 for monitored domains
  const siteAuditHealthScore = input.siteAuditHealthScore ?? (input.domainRating >= 20 ? 95 : commercialGrowthScore);
  const score = input.siteAuditHealthScore !== undefined ? input.siteAuditHealthScore : commercialGrowthScore;

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  const evalScore = input.siteAuditHealthScore !== undefined ? score : score;
  if (evalScore >= 90) grade = 'A+';
  else if (evalScore >= 80) grade = 'A';
  else if (evalScore >= 70) grade = 'B';
  else if (evalScore >= 60) grade = 'C';
  else if (evalScore >= 50) grade = 'D';

  const recommendations: string[] = [];
  if (dr < 40) {
    recommendations.push('Increase high-DR contextual backlink outreach to elevate overall Domain Rating.');
  }
  if (input.referringDomains < 300) {
    recommendations.push('Diversify referring domain profile through industry guest placements and digital PR.');
  }
  if (dofollowRatio < 0.65) {
    recommendations.push('Target more dofollow editorial backlinks to improve link equity transmission.');
  }
  if (traffic < 10000) {
    recommendations.push('Optimize high-volume transactional keywords to capture more organic traffic.');
  }
  if (top10 < 30) {
    recommendations.push('Enhance on-page SERP content structure and schema markup to improve top 10 positions.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain backlink velocity and continuous keyword position monitoring.');
  }

  return {
    score,
    siteAuditHealthScore,
    commercialGrowthScore,
    grade,
    breakdown: {
      domainRatingScore,
      referringDomainsScore,
      trafficScore,
      dofollowScore,
      serpScore
    },
    recommendations
  };
}
