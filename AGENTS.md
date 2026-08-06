# 🧠 TITAN-AHREFS — AGENT ONBOARDING & OPERATIONAL DIRECTIVE

Welcome to `titan-ahrefs`, the standalone Ahrefs SEO Analytics Engine repository within the `mchlbrns/titan-workspace` portfolio.

> [!IMPORTANT]
> **Strict Operational Boundary**:
> `titan-ahrefs` operates strictly on **3 independent managed domains**:
> 1. `red-engage.com`
> 2. `heavengirlfriend.com`
> 3. `hornycompanion.com`
> 
> Do **NOT** import, mix, or leak logic, business rules, sweepstakes scripts, or domain routing from Titan Treasure (`titan-parasites` or `titantreasure-marketing`).

---

## 1. Onboarding Checklist for Agents

When entering this repository:

1. **Read `AI_CONTEXT.md`**: Understand domain scope, API integrations, and reporting goals.
2. **Review `docs/ARCHITECTURE.md`**: Inspect module design, database schemas, and data pipelines.
3. **Inspect `workspace.json`**: Understand repository metadata, entry points, and environment requirements.
4. **Read `IMPLEMENTATION_PLAN.md`**: Review implementation milestones before creating application code.
5. **Verify Environment Variables**: Check `.env.local` for required `AHREFS_API_KEY`.

---

## 2. Core Repository Responsibilities

This repository is strictly responsible for:

- **Ahrefs API v3 Communications**: Standardized, rate-limited interaction with Ahrefs REST endpoints.
- **Domain Metrics Auditing**: Domain Rating (DR), URL Rating (UR), total backlinks, referring domains, organic keyword positions, and traffic estimates.
- **SERP & Keyword Tracking**: Tracking search engine positions and deltas for primary niche keywords.
- **Historical Snapshots**: Logging structured metric snapshots over time to track authority growth.
- **Competitor Analysis**: Identifying keyword gaps and SERP feature overlaps against competitors.
- **Executive Reporting**: Automated weekly Markdown and JSON report generation.

---

## 3. Mandatory Rules & Architectural Boundaries

- **No Application Code Execution Until Approval**: Follow `IMPLEMENTATION_PLAN.md` milestones.
- **Strict Domain Scoping**: Only perform audits and metrics logging for the 3 declared managed domains.
- **Implementation-Agnostic Governance**: Keep configuration formats standardized in `config/`.
- **Environment Isolation**: Never log API keys or secrets in output files or commits.

---

## 4. Quick Reference Links

- **Parent Workspace AGENTS Contract**: [`../AGENTS.md`](../AGENTS.md)
- **Parent Workspace Architecture Bridge**: [`../bridge.md`](../bridge.md)
- **Repository Implementation Plan**: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)
- **Domain Scope Document**: [`docs/DOMAINS.md`](./docs/DOMAINS.md)
