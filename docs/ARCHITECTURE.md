# 🏛️ Architecture & System Design — titan-ahrefs v1.0

## 1. Executive Summary

`titan-ahrefs` is a standalone, production-ready SEO analytics engine, backlink profile monitor, SERP rank tracker, and historical snapshot logger. It provides automated monitoring for independent target domains (`red-engage.com`, `heavengirlfriend.com`, `hornycompanion.com`).

The system is designed following **Clean Architecture principles** with strict separation of concerns, structured logging, typed domain models, configuration validation, exponential backoff retries, and multi-format reporting (Markdown, JSON, HTML).

---

## 2. Component Hierarchy

```
                               ┌─────────────────────────┐
                               │   CLI Entry Point       │
                               │   (src/index.ts)        │
                               └────────────┬────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           ▼                                ▼                                ▼
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│    ConfigLoader     │          │       Logger        │          │ calculateSeoHealth  │
│   (src/config.ts)   │          │   (src/logger.ts)   │          │   (src/health.ts)   │
└─────────────────────┘          └─────────────────────┘          └─────────────────────┘
           │                                │                                │
           └────────────────────────────────┼────────────────────────────────┘
                                            │
    ┌──────────────────────┬────────────────┴──────────────────────┬──────────────────────┐
    ▼                      ▼                                       ▼                      ▼
┌───────────────────┐ ┌───────────────────┐               ┌───────────────────┐ ┌───────────────────┐
│  BacklinkAuditor  │ │  KeywordTracker   │               │   SnapshotStore   │ │ CompetitorAnalyzer│
│(src/backlinks.ts) │ │(src/keywords.ts)  │               │ (src/snapshots.ts)│ │(src/competitors)  │
└─────────┬─────────┘ └─────────┬─────────┘               └─────────┬─────────┘ └─────────┬─────────┘
          │                     │                                   │                     │
          └─────────────────────┴─────────────────┬─────────────────┴─────────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │     AhrefsClient      │
                                      │    (src/client.ts)    │
                                      └───────────┬───────────┘
                                                  │ (Exponential Backoff via withRetry)
                                                  ▼
                                      ┌───────────────────────┐
                                      │   Ahrefs API v3 /     │
                                      │     Mock Fallback     │
                                      └───────────────────────┘
```

---

## 3. Core Modules & Responsibilities

### 3.1 `src/client.ts` — Ahrefs API Client
- Handles authentication against Ahrefs API v3 (`Authorization: Bearer <token>`).
- Encapsulates live HTTP request handling and automatic mock fallback mode (`isMockMode()`).
- Integrates `withRetry` for automatic exponential backoff on HTTP 429 (rate limits) and 5xx errors.
- Attaches computed `seoHealthScore` to domain metrics.

### 3.2 `src/health.ts` — SEO Health Score Engine
Computes a composite 0–100 SEO Health Score and letter grade (`A+` to `F`) based on weighted components:
- **Domain Rating (DR)** (30% weight)
- **Referring Domains** (25% weight)
- **Estimated Monthly Traffic** (20% weight)
- **Dofollow Ratio** (15% weight)
- **Top 10 Keyword Positions** (10% weight)
Provides contextual optimization recommendations.

### 3.3 `src/snapshots.ts` — Historical Snapshot Store
- Persists domain snapshots as structured JSON artifacts in `snapshots/local/`.
- Provides snapshot delta comparison logic (`compareSnapshots`) computing metric shifts (`drChange`, `trafficChange`, `referringDomainsChange`, `healthScoreChange`, `trendDirection`).

### 3.4 `src/reports.ts` — Executive Report Generator
- Synthesizes domain audit metrics, organic keyword ranks, SEO Health Scores, and historical trend deltas into executive reports.
- Generates 3 report outputs simultaneously:
  1. Markdown (`weekly_seo_report_YYYY-MM-DD.md`)
  2. JSON (`weekly_seo_report_YYYY-MM-DD.json`)
  3. Styled Responsive HTML (`weekly_seo_report_YYYY-MM-DD.html`)

### 3.5 `src/config.ts` — Configuration Loader & Validator
- Loads and validates configuration files (`config/domains.json`, `config/competitors.json`, `config/app.json`).
- Validates domain syntax, country codes, priorities, and default fallback options.

### 3.6 `src/logger.ts` & `src/errors.ts` — Logging & Error Standard
- Provides structured loggers supporting JSON and pretty console formatting across 4 log levels (`debug`, `info`, `warn`, `error`).
- Defines typed error hierarchy (`AhrefsEngineError`, `AhrefsApiError`, `ConfigurationError`, `SnapshotError`, `ReportGenerationError`).

---

## 4. Design Patterns & Principles

1. **Dependency Injection**: Services receive client instances, loggers, and stores in constructors, enabling independent unit testing and mocking.
2. **Graceful Degradation**: If Ahrefs API credentials are omitted or fail, the system smoothly falls back to mock simulation mode without crashing.
3. **Immutability & Strict Typing**: TypeScript strict mode (`strict: true`) is enforced across all domain models and functions.
