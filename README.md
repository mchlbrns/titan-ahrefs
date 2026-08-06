# 📊 titan-ahrefs — Ahrefs SEO & Keyword Analytics Engine

`titan-ahrefs` is an independent, multi-domain Ahrefs analytics engine, backlink profile monitor, SERP tracking system, and automated reporting tool.

> [!IMPORTANT]
> **Domain Scope**: This repository manages **EXCLUSIVELY** the following target domains:
> 1. `red-engage.com`
> 2. `heavengirlfriend.com`
> 3. `hornycompanion.com`
> 
> It operates independently of any other projects within the parent workspace.

---

## 🎯 Core Features & Capabilities

1. **Ahrefs API v3 Integration**: Automated extraction of Domain Rating (DR), URL Rating (UR), total backlinks, referring domains, organic keyword positions, and estimated organic traffic.
2. **Historical Metrics Snapshots**: Daily/weekly snapshots stored for trend analysis, historical DR growth tracking, and lost backlink alerts.
3. **Competitor SERP Analysis**: Keyword overlap analysis, competitor rank comparison, and SERP feature tracking across target niches.
4. **Weekly SEO Reporting**: Automated summary generation delivering weekly delta reports (keyword position wins/losses, new referring domains, traffic movement).

---

## 📁 Repository Topology

```
titan-ahrefs/
├── AI_CONTEXT.md           # Independent AI agent context & guidance
├── README.md               # Overview & quickstart documentation
├── package.json            # Node.js dependencies & CLI scripts
├── .env.local.example      # Required environment variable template
├── config/
│   ├── domains.json        # Target domain registry & metadata
│   └── competitors.json    # Tracked competitor domain list
├── src/
│   ├── client.ts           # Ahrefs API v3 client wrapper
│   ├── keywords.ts         # Keyword rank & SERP position tracker
│   ├── backlinks.ts        # Backlink profile & domain authority auditor
│   ├── snapshots.ts        # Historical metric recorder & database logger
│   ├── competitors.ts      # Competitor overlap & keyword gap analyzer
│   └── reports.ts          # Weekly SEO report generator
└── reports/                # Output directory for generated weekly markdown reports
```

---

## 🚀 Quickstart & Commands

```bash
# Install dependencies
npm install

# Audit authority & backlink profiles for target domains
npm run audit:domains

# Fetch active keyword ranks & SERP positions
npm run fetch:keywords

# Run competitor gap analysis
npm run analyze:competitors

# Take historical metrics snapshot
npm run snapshot:create

# Generate weekly executive SEO report
npm run report:weekly
```

---

## 🔐 Environment Variables

Ensure `.env.local` contains valid Ahrefs API credentials:

```env
AHREFS_API_KEY=your_ahrefs_api_token
```

---

*Independent project workspace managed within `mchlbrns/titan-workspace`*
