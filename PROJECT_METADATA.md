# 📋 PROJECT METADATA — titan-ahrefs

`PROJECT_METADATA.md` is the human-readable equivalent of `workspace.json`, providing a standardized executive snapshot of repository ownership, business goals, status, and responsibilities.

---

## 1. Executive Summary

| Attribute | Details |
| :--- | :--- |
| **Project Name** | Titan Ahrefs SEO Analytics Engine (`titan-ahrefs`) |
| **Client / Sponsor** | Internal Workspace Engineering & Growth Operations |
| **Business Purpose** | Standalone Ahrefs API v3 SEO analytics engine, backlink monitor, SERP rank tracker, historical snapshot logger, and executive report generator for independent managed target web properties. |
| **Current Phase** | Phase 2 — Application Implementation Complete |
| **Status** | Active & Production-Ready |
| **Repository Owner** | Technical Lead & Workspace Architect |

---

## 2. Managed Domains Scope

`titan-ahrefs` is strictly dedicated to the following **3 target domains exclusively**:

1. **`red-engage.com`** (Affiliate & Traffic Engagement Portal)
2. **`heavengirlfriend.com`** (AI Dating & Niche Entertainment)
3. **`hornycompanion.com`** (Niche Affiliate Companion Engine)

> [!NOTE]
> `titan-ahrefs` operates independently of Titan Treasure destination platforms and acquisition domains.

---

## 3. Core Repository Responsibilities

- **API Layer**: Standardized, rate-limited integration with Ahrefs API v3 REST endpoints.
- **Authority Tracking**: Domain Rating (DR), URL Rating (UR), and Ahrefs Rank (AR) auditing.
- **Backlink Auditing**: Monitoring new vs. lost backlinks, dofollow/nofollow ratios, and anchor text distribution.
- **SERP Position Tracking**: Monitoring organic keyword positions, position deltas, and SERP features.
- **Historical Snapshots**: Recording periodic metric snapshots into time-series stores.
- **Competitor Analysis**: Identifying rank gaps and competitor keyword overlaps.
- **Executive Reporting**: Automated weekly Markdown and JSON summary generation.

---

## 4. Dependencies

- **Parent Workspace**: `mchlbrns/titan-workspace`
- **External API**: Ahrefs API v3 REST endpoints (`AHREFS_API_KEY`)
- **Upstream Repositories**: None (Completely independent project within workspace portfolio)

---

## 5. Next Milestone

- **Milestone**: Phase 2 — Application Implementation Approval
- **Next Deliverables**: Implementation of `src/client.ts`, `src/keywords.ts`, `src/backlinks.ts`, `src/snapshots.ts`, `src/competitors.ts`, `src/reports.ts`, `package.json`, and environment setup (`.gitignore`, `.github/`).
