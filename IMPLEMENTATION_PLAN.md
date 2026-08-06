# 🗺️ IMPLEMENTATION PLAN — titan-ahrefs Engine

This document provides the complete implementation roadmap for the `titan-ahrefs` engine. **No application code should be created until this plan is formally approved.**

---

## 1. Project Overview

`titan-ahrefs` is an independent Ahrefs API v3 SEO analytics engine designed to automate domain rating auditing, keyword ranking tracking, SERP gap analysis, historical snapshot logging, and weekly executive reporting for managed domains (`red-engage.com`, `heavengirlfriend.com`, `hornycompanion.com`).

---

## 2. Architecture & Data Flow

```
[ Ahrefs API v3 ] ──(HTTPS/Bearer)──► [ AhrefsClient ]
                                           │
                                           ▼
                                  [ MetricsAuditor ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                [ SnapshotStore ]                    [ ReportGenerator ]
             (Historical SQLite/JSON)               (Weekly Markdown & JSON)
```

---

## 3. Suggested Tech Stack

- **Runtime**: Node.js v20+ / TypeScript 5+
- **HTTP Client**: Axios or native `fetch` with custom retry middleware
- **Data Storage**: Local JSON snapshot store / SQLite time-series storage
- **CLI & Scripting**: `tsx` / `commander` for command-line entry points
- **Formatting**: `prettier` / `eslint`

---

## 4. Proposed Core Modules

1. `src/client.ts`: Ahrefs API v3 client wrapper handling rate limits, error retries, and endpoint mapping.
2. `src/keywords.ts`: Keyword rank fetcher, position tracking, and delta calculation.
3. `src/backlinks.ts`: Backlink profile auditor, referring domain breakdown, and anchor distribution analyzer.
4. `src/snapshots.ts`: Periodic metric snapshot recorder and time-series query engine.
5. `src/competitors.ts`: Competitor keyword overlap and SERP gap analysis.
6. `src/reports.ts`: Weekly markdown and JSON report generator.

---

## 5. Implementation Milestones

| Milestone | Target Deliverable | Description |
| :--- | :--- | :--- |
| **Milestone 1** | Module Setup & Dependencies | Initialize `package.json`, TypeScript config, `.env.local.example`. |
| **Milestone 2** | Ahrefs API v3 Core Client | Implement rate-limited HTTP wrapper for Ahrefs endpoints with auth retries. |
| **Milestone 3** | Domain & Backlink Auditor | Implement DR, UR, referring domain, and backlink fetchers. |
| **Milestone 4** | SERP & Keyword Tracker | Implement keyword position tracking and SERP feature delta tracker. |
| **Milestone 5** | Snapshot Store | Implement local snapshot database logging and historical trend queries. |
| **Milestone 6** | Executive Reporter & CLI | Build CLI commands (`npm run audit:domains`, `npm run report:weekly`). |

---

## 6. Risks & Mitigation Strategies

- **API Rate Limits / Quota Exceeded**: Implement client-side throttling and exponential backoff.
- **API Secret Leakage**: Enforce strict `.env.local` exclusion via `.gitignore` and CI scan workflows.
- **Ahrefs Endpoint Breaking Changes**: Abstract endpoint mappings behind typed interface wrappers.

---

## 7. Dependencies

- **External**: Ahrefs API v3 access key (`AHREFS_API_KEY`).
- **Internal**: Workspace portfolio coordination via `mchlbrns/titan-workspace`.

---

## 8. Estimated Timeline & Backlog

- **Milestone 1–2**: 1 Day
- **Milestone 3–4**: 2 Days
- **Milestone 5–6**: 2 Days
- **Total Duration**: ~5 Days

---

## 9. Future Tasks

- Integration with Webhook notification alerts for backlink loss.
- Automated Slack / Telegram executive reporting dispatch.
