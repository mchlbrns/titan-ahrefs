# 📦 Release Notes — titan-ahrefs v1.0.0

**Release Date**: August 6, 2026  
**Status**: Production-Ready Release Candidate (v1.0.0)

---

## 🌟 Major Highlights

### 1. SEO Health Score Engine
Introduced `calculateSeoHealthScore` computing a composite 0–100 score and letter grade (`A+` through `F`) derived from Domain Rating (30%), Referring Domains (25%), Organic Traffic (20%), Dofollow Ratio (15%), and Top 10 Ranks (10%). Includes automated actionable optimization recommendations.

### 2. Multi-Format HTML Reporting
Executive weekly reports now output responsive, modern HTML reports (`weekly_seo_report_YYYY-MM-DD.html`) alongside Markdown and JSON formats, featuring dark theme styling, visual health progress bars, and trend badges.

### 3. Historical Trend Analysis
`SnapshotStore` now calculates snapshot deltas (`drChange`, `trafficChange`, `referringDomainsChange`, `healthScoreChange`) and assigns overall trend direction indicators (`▲ UP`, `▼ DOWN`, `▬ STABLE`, `NEW`).

### 4. Exponential Backoff & Retry
Added `withRetry` utility for API requests with jittered exponential backoff for handling HTTP 429 rate limits and 5xx server errors.

### 5. Configuration Validation & Structured Logging
Implemented runtime schema validation (`ConfigLoader`) and structured logging (`Logger`) supporting JSON and human-readable output across configurable log levels (`LOG_LEVEL`).

### 6. Expanded Automated Test Suite & CI/CD
Added a complete Jest test suite covering unit tests, integration tests, and CLI smoke tests. Expanded GitHub Actions workflow with linting, typechecking, coverage, security audits, build validation, and smoke tests.

---

## 🔄 CLI Command Matrix

All existing CLI commands are preserved with 100% backward compatibility:

| Command | Action | Output Format |
|---|---|---|
| `npm run audit:domains` | Audit backlink profiles & DR | Console |
| `npm run fetch:keywords` | Fetch organic keyword ranks | Console |
| `npm run snapshot:create` | Persist snapshot JSON artifact | `snapshots/local/` |
| `npm run analyze:competitors` | Compute keyword overlap & gaps | Console |
| `npm run report:weekly` | Generate executive weekly report | MD + JSON + HTML |

---

## 🔒 Verification & Compliance

- **TypeScript**: 0 errors (`strict: true`)
- **ESLint**: 0 errors
- **Tests**: 100% passing
- **CI Pipeline**: Fully green
