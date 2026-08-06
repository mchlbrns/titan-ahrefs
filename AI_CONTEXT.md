# 🧠 TITAN-AHREFS — AI Agent Context & Execution Contract

This document provides the mandatory AI context, domain rules, architecture, and reporting specifications for operating within the `titan-ahrefs` repository.

---

## 1. Managed Scope & Project Isolation

> [!IMPORTANT]
> **Strict Domain Boundary**: `titan-ahrefs` is an **independent project** dedicated strictly to the following 3 domains:
> 
> 1. **`red-engage.com`**
> 2. **`heavengirlfriend.com`**
> 3. **`hornycompanion.com`**
> 
> AI agents operating in this repository MUST NOT inherit business rules, domain routing, or context from other projects in the parent workspace.

---

## 2. Core Operational Modules

### A. Ahrefs API Integration (`src/client.ts`)
- Interface with Ahrefs REST API v3 using `AHREFS_API_KEY`.
- Fetch domain metrics (DR, UR, backlinks, referring domains, organic traffic, organic keywords).
- Enforce rate-limiting and backoff logic to prevent quota exhaustion.

### B. Keyword & SERP Tracking (`src/keywords.ts`)
- Monitor primary & secondary keyword rankings across target search engines.
- Track SERP features (featured snippets, image packs, site links).
- Calculate position movements (rank gains, rank drops, new entering keywords).

### C. Backlink & Authority Audits (`src/backlinks.ts`)
- Audit new vs. lost backlinks for each managed domain.
- Monitor dofollow/nofollow ratios, anchor text distributions, and domain rating velocity.

### D. Historical Snapshots (`src/snapshots.ts`)
- Capture structured JSON snapshots of domain health metrics at periodic intervals.
- Store snapshots under `snapshots/` or local database log for trend plotting.

### E. Competitor Gap Analysis (`src/competitors.ts`)
- Benchmark managed domains against key niche competitors defined in `config/competitors.json`.
- Identify keyword gaps (keywords competitors rank for that target domains do not).

### F. Weekly Executive Reports (`src/reports.ts`)
- Aggregate weekly deltas (DR changes, keyword movement, backlink additions).
- Output Markdown & JSON executive summaries to `reports/` for stakeholder review.

---

## 3. Domain Registry Reference (`config/domains.json`)

```json
{
  "domains": [
    {
      "name": "red-engage.com",
      "target_country": "us",
      "primary_niche": "engagement & content platform"
    },
    {
      "name": "heavengirlfriend.com",
      "target_country": "us",
      "primary_niche": "AI companion & entertainment"
    },
    {
      "name": "hornycompanion.com",
      "target_country": "us",
      "primary_niche": "companion & discovery platform"
    }
  ]
}
```

---

## 4. Agent Guidelines

1. **Modularity**: Keep API clients, data transformers, and reporting scripts cleanly separated in `src/`.
2. **Data Integrity**: Validate API responses before logging snapshots.
3. **No Domain Leakage**: Never inject external domain names or unrelated project business logic into configuration or reports.
