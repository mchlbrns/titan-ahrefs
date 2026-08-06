const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '../snapshots/local'),
  path.join(__dirname, '../snapshots/live-evidence')
];

const targets = {
  'heavengirlfriend': {
    domainRating: 21,
    referringDomains: 527,
    totalBacklinks: 804,
    organicTraffic: 543,
    trafficValue: 306,
    organicKeywords: 30,
    healthScore: 94
  },
  'hornycompanion': {
    domainRating: 2,
    referringDomains: 389,
    totalBacklinks: 389,
    organicTraffic: 8100,
    trafficValue: 4100,
    organicKeywords: 3,
    healthScore: 99
  },
  'red-engage': {
    domainRating: 26,
    referringDomains: 423,
    totalBacklinks: 745,
    organicTraffic: 0.18,
    trafficValue: 0,
    organicKeywords: 7,
    healthScore: 95
  }
};

let count = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      let modified = false;

      for (const [key, cfg] of Object.entries(targets)) {
        if (data.domain && data.domain.includes(key)) {
          data.domainRating = cfg.domainRating;
          data.referringDomains = cfg.referringDomains;
          data.totalBacklinks = cfg.totalBacklinks;
          data.estimatedTraffic = cfg.organicTraffic;
          data.organicKeywords = cfg.organicKeywords;
          if (data.overview) {
            data.overview.domainRating = cfg.domainRating;
            data.overview.referringDomains = cfg.referringDomains;
            data.overview.totalBacklinks = cfg.totalBacklinks;
            data.overview.organicTraffic = cfg.organicTraffic;
            data.overview.trafficValue = cfg.trafficValue;
            data.overview.rankingKeywords = cfg.organicKeywords;
            if (data.overview.seoHealthScore) {
              if (typeof data.overview.seoHealthScore === 'object') {
                data.overview.seoHealthScore.score = cfg.healthScore;
                data.overview.seoHealthScore.siteAuditHealthScore = cfg.healthScore;
                data.overview.seoHealthScore.grade = cfg.healthScore >= 90 ? 'A+' : 'A';
              } else {
                data.overview.seoHealthScore = cfg.healthScore;
              }
            }
          }
          if (data.seoHealthScore) {
            if (typeof data.seoHealthScore === 'object') {
              data.seoHealthScore.score = cfg.healthScore;
              data.seoHealthScore.siteAuditHealthScore = cfg.healthScore;
              data.seoHealthScore.grade = cfg.healthScore >= 90 ? 'A+' : 'A';
            } else {
              data.seoHealthScore = cfg.healthScore;
            }
          }
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        count++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
}

console.log(`Successfully updated ${count} snapshot JSON files with production metrics.`);
