# 📚 TITAN-AHREFS — AI CONTEXT & DEEP BUSINESS SPECIFICATION

This document provides complete business, architectural, and operational context for AI agents working within `titan-ahrefs`.

---

## 1. Project Purpose & Scope

`titan-ahrefs` is an independent SEO analytics, backlink auditing, SERP tracking, and executive reporting repository. It serves as an automated engine to query Ahrefs API v3, process organic domain performance data, log historical authority snapshots, and deliver actionable insights for managed web properties.

---

## 2. Managed Domain Portfolio

`titan-ahrefs` is strictly dedicated to the following **3 target domains**:

| Domain Name | Primary Niche / Focus | Priority | Target Region |
| :--- | :--- | :--- | :--- |
| **`red-engage.com`** | Affiliate & Traffic Engagement | Tier 1 | Global / US |
| **`heavengirlfriend.com`** | AI Dating & Niche Entertainment | Tier 1 | Global / US |
| **`hornycompanion.com`** | Niche Affiliate & Companion Engine | Tier 1 | Global / US |

> [!NOTE]
> `titan-ahrefs` is completely decoupled from `titantreasure.com` and its associated acquisition domains (`betsweepsy.com`, `luckytwogrands.com`, etc.).

---

## 3. High-Level System Responsibilities

1. **Ahrefs API v3 Engine Integration**:
   - Authenticates via Bearer API keys.
   - Respects rate limits, quota caps, and exponential backoff retries.
   - Provides structured JSON responses for downstream snapshot processing.

2. **Metrics & Authority Monitoring**:
   - **Domain Authority**: Domain Rating (DR), URL Rating (UR), Ahrefs Rank (AR).
   - **Backlink Profile**: Total backlinks, dofollow/nofollow breakdown, referring domains, referring subnets, anchor text distribution.
   - **Keywords & SERPs**: Organic keyword rankings, position movement (wins/losses), SERP feature presence (snippets, image packs, local packs).

3. **Historical Snapshots & Analytics**:
   - Periodic snapshot recording into time-series logs.
   - Calculation of weekly/monthly deltas (DR growth velocity, backlink loss alerts).

4. **Competitor SERP & Keyword Gap Analysis**:
   - Overlap matrices identifying keywords competitors rank for that target domains do not.
   - SERP difficulty scoring and backlink gap identification.

5. **Automated Weekly Reporting**:
   - Markdown executive reports generated for stakeholder review.
   - Structured JSON summaries for automated metric dashboards.

---

## 4. Environment Dependencies & Secrets

```env
# Required Primary Ahrefs API Token
AHREFS_API_KEY=your_ahrefs_v3_api_key_here

# Optional Configurations
AHREFS_API_BASE_URL=https://api.ahrefs.com/v3
LOG_LEVEL=info
```

---

## 5. Navigation & Cross-References

- **Parent Workspace Matrix**: [`../bridge.md`](../bridge.md)
- **Repository Onboarding Protocol**: [`AGENTS.md`](./AGENTS.md)
- **System Architecture Document**: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- **Technical Implementation Roadmap**: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)
