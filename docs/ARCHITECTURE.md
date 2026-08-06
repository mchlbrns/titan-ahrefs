# 🏗️ SYSTEM ARCHITECTURE — titan-ahrefs

## 1. Architectural Overview

`titan-ahrefs` is designed as a modular, decoupled SEO analytics processing system. It extracts organic SEO performance metrics from Ahrefs API v3, transforms raw payloads into structured data models, records historical snapshots, and renders executive delta reports.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TITAN-AHREFS ENGINE                           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │     Ahrefs API v3 Client     │
                      │  (Rate Limit & Auth Layer)   │
                      └──────────────┬───────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Domain Metrics  │         │ SERP & Keyword  │         │ Backlink Audit  │
│  (DR, UR, AR)   │         │ (Ranks, Deltas) │         │ (Dofollow/Lost) │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │  Snapshot & Aggregator Engine│
                      └──────────────┬───────────────┘
                                     │
                      ┌──────────────┴──────────────┐
                      ▼                             ▼
         ┌──────────────────────────┐  ┌──────────────────────────┐
         │ Executive Report Generator│  │ Competitor Gap Engine    │
         │  (Markdown & JSON output)│  │ (Overlap & Opportunity)  │
         └──────────────────────────┘  └──────────────────────────┘
```

---

## 2. Planned Module Decomposition

1. **API Communications Layer (`AhrefsClient`)**:
   - Manages Bearer token headers and rate-limiting throttling (requests per second / quota headers).
   - Wraps core Ahrefs API v3 endpoints: `/domain-rating`, `/backlinks`, `/refdomains`, `/organic-keywords`.

2. **Metrics & Authority Aggregator (`MetricsAuditor`)**:
   - Normalizes raw Ahrefs metric schemas into domain performance summaries.
   - Computes anchor text distribution and dofollow vs. nofollow link ratios.

3. **SERP & Rank Tracking (`KeywordTracker`)**:
   - Tracks ranking target keywords and maps positional movements over 7-day/30-day windows.
   - Identifies SERP feature presence (Featured Snippets, People Also Ask, Video/Image Carousels).

4. **Historical Snapshot Engine (`SnapshotStore`)**:
   - Persists structured periodic snapshots (JSON/SQLite format).
   - Generates delta metrics (DR velocity, lost link alerts).

5. **Executive Reporter (`ReportGenerator`)**:
   - Formats comprehensive weekly summary reports in Markdown and JSON formats.

---

## 3. Data Integrity & Operational Boundaries

- **Stateless API Interaction**: All queries to external APIs are stateless; cached data is stored locally in snapshots.
- **Fail-Safe Processing**: API failure on one domain does not stop processing for remaining managed domains.
