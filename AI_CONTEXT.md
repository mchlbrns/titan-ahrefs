# 📚 TITAN-AHREFS — AI CONTEXT & DEEP BUSINESS SPECIFICATION

This document provides complete business, architectural, and operational context for AI agents working within `titan-ahrefs`.

---

## 1. Project Purpose & Scope

`titan-ahrefs` is an independent SEO analytics, backlink auditing, SERP tracking, and executive reporting repository. It serves as an automated engine to query Ahrefs API v3, process organic domain performance data, log historical authority snapshots, and deliver actionable insights for managed web properties.

---

## 2. Managed Domain Portfolio

`titan-ahrefs` is strictly dedicated to the following **3 target domains exclusively**:

| Domain Name | Primary Niche / Focus | Priority | Target Region |
| :--- | :--- | :--- | :--- |
| **`red-engage.com`** | Affiliate & Traffic Engagement | Tier 1 | Global / US |
| **`heavengirlfriend.com`** | AI Dating & Niche Entertainment | Tier 1 | Global / US |
| **`hornycompanion.com`** | Niche Affiliate Companion Engine | Tier 1 | Global / US |

---

## 3. Standard Repository Structure & Specifications

| Asset | File Path | Purpose |
| :--- | :--- | :--- |
| **Executive Metadata** | [`PROJECT_METADATA.md`](./PROJECT_METADATA.md) | Client, business purpose, status, phase, and owner metadata. |
| **Workspace Metadata** | [`workspace.json`](./workspace.json) | Standardized metadata, managed domain scope, entry points, and environment dependencies. |
| **Agent Operational Protocol** | [`AGENTS.md`](./AGENTS.md) | Operational rules and agent onboarding for Claude, Codex, Antigravity, and Copilot. |
| **System Architecture** | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Component decomposition, data pipeline design, and historical metrics snapshot design. |
| **Domain Scope Specification** | [`docs/DOMAINS.md`](./docs/DOMAINS.md) | Target domain priorities and isolation policies. |
| **Workspace & API Integration** | [`docs/INTEGRATION.md`](./docs/INTEGRATION.md) | Workspace portfolio bridge and external Ahrefs API v3 integration details. |
| **Technical Implementation Plan** | [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) | Phased roadmap, modules, milestones, risks, and estimated timelines. |
| **Repository Memory** | [`memory/`](./memory/) | Repository-level technical decisions (`decisions.md`) and agent lessons (`lessons.md`). |

---

## 4. Configuration & Registry

Target domains and competitor lists are configured in JSON files inside `titan-ahrefs/config/`:

- **[`config/domains.json`](./config/domains.json)**: Registry of managed target domains, priorities, and descriptions.
- **[`config/competitors.json`](./config/competitors.json)**: Competitor mappings per target domain.

---

## 5. Environment Secrets (Expected)

| Variable | Required For | Location | Purpose |
| :--- | :--- | :--- | :--- |
| `AHREFS_API_KEY` | `titan-ahrefs` | `titan-ahrefs/.env.local` | Ahrefs API v3 authentication token |

---

## 6. Agent Instructions for `titan-ahrefs` Work

- When tasked with Ahrefs SEO monitoring, backlink audits, SERP rank tracking, or competitor analysis for `red-engage.com`, `heavengirlfriend.com`, or `hornycompanion.com`, operate within `titan-ahrefs/`.
- Review `PROJECT_METADATA.md` and `IMPLEMENTATION_PLAN.md` before initiating application code development in Phase 2.
- Do NOT import, reference, or leak Titan Treasure business logic, acquisition domain proxies, or sweepstakes rules into `titan-ahrefs`.
