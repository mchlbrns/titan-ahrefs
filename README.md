# 📊 titan-ahrefs — Ahrefs SEO & Keyword Analytics Engine

`titan-ahrefs` is an independent, multi-domain Ahrefs analytics engine, backlink profile monitor, SERP rank tracking system, and automated report generator within the `mchlbrns/titan-workspace` portfolio.

> [!IMPORTANT]
> **Managed Domain Boundary**: This repository manages **EXCLUSIVELY** the following target domains:
> 1. `red-engage.com`
> 2. `heavengirlfriend.com`
> 3. `hornycompanion.com`
> 
> It operates independently of Titan Treasure (`titantreasure-marketing` & `titan-parasites`).

---

## 🎯 Repository Overview & Purpose

`titan-ahrefs` provides an automated, implementation-agnostic framework for:

1. **Ahrefs API v3 Integration**: Automated polling of Domain Rating (DR), URL Rating (UR), total backlinks, referring domains, organic keyword positions, and estimated traffic.
2. **Historical Metrics Snapshots**: Recording periodic snapshots for long-term trend analysis, authority growth velocity, and lost backlink alerts.
3. **Competitor SERP Analysis**: Keyword overlap analysis, competitor rank comparison, and SERP feature tracking across target niches.
4. **Weekly SEO Reporting**: Automated summary generation delivering weekly delta reports (keyword position wins/losses, new referring domains, traffic movement).

---

## 📁 Standard Repository Template Structure

This repository follows the **Titan Workspace Standard Repository Template**:

```
titan-ahrefs/
├── README.md               # Overview & documentation entry point
├── AGENTS.md               # Mandatory AI agent onboarding protocol & operational rules
├── AI_CONTEXT.md           # Deep business scope, managed domains & API specs
├── PROJECT_METADATA.md     # Executive summary, client, status & repository ownership
├── workspace.json          # Standardized AI workspace metadata & configuration
├── IMPLEMENTATION_PLAN.md  # Detailed technical implementation roadmap & milestones
├── docs/                   # System architecture, domain specs & integration guides
│   ├── ARCHITECTURE.md     # System architecture & component design
│   ├── DOMAINS.md          # Managed domain portfolio specification
│   └── INTEGRATION.md      # Workspace & Ahrefs API v3 integration guide
└── memory/                 # Persistent decisions, lessons & repo memory
    └── README.md
```

---

## 🔐 Environment Secrets (Expected)

```env
AHREFS_API_KEY=your_ahrefs_api_token
AHREFS_API_BASE_URL=https://api.ahrefs.com/v3
LOG_LEVEL=info
```

---

## 🚀 AI Agent Entry Points

- **Agent Rules & Directives**: See [`AGENTS.md`](./AGENTS.md).
- **Executive Metadata & Status**: See [`PROJECT_METADATA.md`](./PROJECT_METADATA.md).
- **Business Scope & Domain Specs**: See [`AI_CONTEXT.md`](./AI_CONTEXT.md).
- **Architecture & Data Flow**: See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
- **Future Implementation Roadmap**: See [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

---

*Independent project workspace managed within `mchlbrns/titan-workspace`*
