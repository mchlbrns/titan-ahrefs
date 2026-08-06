# 📖 HOW TO USE TITAN-AHREFS — Step-by-Step Guide & Living Development Manual

Welcome to **`titan-ahrefs`**, the standalone Ahrefs SEO analytics engine, backlink monitor, SERP rank tracking system, and executive report generator within the `mchlbrns/titan-workspace` portfolio.

This guide provides **step-by-step operational instructions** for running audits, capturing historical snapshots, generating executive reports, and validating live Ahrefs API v3 integration. It also serves as a **living, self-learning manual** that documents workspace development progress and provides rules for maintaining documentation as new features are added.

---

## 🎯 Scope & Managed Domain Portfolio

`titan-ahrefs` is strictly dedicated to managing **3 target domains exclusively**:

| Domain | Primary Focus | Priority | Target Region |
|---|---|---|---|
| **`red-engage.com`** | Affiliate & Traffic Engagement | Tier 1 | Global / US |
| **`heavengirlfriend.com`** | AI Dating & Niche Entertainment | Tier 1 | Global / US |
| **`hornycompanion.com`** | Niche Affiliate Companion Engine | Tier 1 | Global / US |

> [!IMPORTANT]
> **Strict Domain Boundary**: `titan-ahrefs` operates independently of Titan Treasure (`titantreasure-marketing` & `titan-parasites`). Do NOT import or leak sweepstakes logic or external domain proxies into this repository.

---

## 🚀 Step 1: Initial Setup & Environment Configuration

### 1.1 Prerequisites
- **Node.js**: v20.0.0 or higher
- **Package Manager**: `npm` v10+
- **Ahrefs API v3 Key**: Active subscription bearer token with Site Explorer access

### 1.2 Environment File (`.env.local`)
Create or edit `.env.local` in the root of `titan-ahrefs/`:

```env
# Ahrefs API v3 Bearer Token
AHREFS_API_KEY=your_ahrefs_v3_api_key_here

# Ahrefs API Endpoint
AHREFS_API_BASE_URL=https://api.ahrefs.com/v3

# Mode Toggles (set to 'false' for production/live API execution)
MOCK_API_FALLBACK=false

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=pretty
```

> [!NOTE]
> If `AHREFS_API_KEY` is not set or `MOCK_API_FALLBACK=true`, the engine runs in **Mock/Simulated Mode**, returning mock data for testing without consuming API units.

### 1.3 Install Dependencies & Verify Build
Run the following commands in `titan-ahrefs/`:

```bash
# Install Node dependencies
npm install

# Run TypeScript type check
npm run typecheck

# Run test suite
npm test
```

---

## 💻 Step 2: Command Reference & Workflows

### 2.1 Available CLI Commands

| Command | Action | Output / Artifacts |
|---|---|---|
| `npm run usage:check` | Check Ahrefs API quota limits & consumed units | Console summary |
| `npm run audit:domains` | Run Domain Rating (DR), rank & backlink overview audit | Console output |
| `npm run fetch:keywords` | Fetch organic keyword positions, search volume & intent | Console output |
| `npm run fetch:toppages` | Fetch top performing URLs & organic traffic distribution | Console output |
| `npm run fetch:backlinks` | Audit backlink profile, referring domains & dofollow ratio | Console output |
| `npm run analyze:competitors` | Compare domain performance against configured competitors | Console output |
| `npm run snapshot:create` | Capture & persist normalized historical domain metrics | `snapshots/local/snap_*.json` |
| `npm run report:weekly` | Generate executive weekly SEO report (MD, JSON, HTML) | `reports/generated/weekly_seo_report_*` |
| `node scripts/evidence-run.mjs` | Execute live Ahrefs API v3 Pedro Evidence Run | `reports/evidence/pedro-evidence-*` |
| `npm run typecheck` | Validate TypeScript code without emitting JS | Code verification |
| `npm run lint` | Audit code quality with ESLint | Code quality check |
| `npm test` | Execute Jest unit, integration & CLI smoke test suite | Test verification |

---

## 🛠️ Step 3: Common Operational Workflows

### Workflow A: Checking Ahrefs API Quota & Usage
Before launching large audits, verify available API units:

```bash
npm run usage:check
```

**Expected Output:**
```text
💳 Ahrefs API v3 Subscription Limits & Usage:
   - Units Limit: 400,000
   - Units Consumed: 5,700
   - Units Remaining: 394,300
   - Quota Reset Date: 2026-09-04T00:00:00Z
   - API Key Status: ACTIVE
```

---

### Workflow B: Running Full SEO Audit across Managed Domains
Audit DR, organic traffic, backlinks, referring domains, and SEO Health Scores for all 3 target domains:

```bash
npm run audit:domains
```

---

### Workflow C: Capturing Normalized Historical Snapshots
Capture daily or weekly baseline metrics to enable trend comparison (`▲ UP`, `▼ DOWN`, `▬ STABLE`):

```bash
npm run snapshot:create
```
*Snapshots are saved to `snapshots/local/snap_<domain>_<timestamp>.json`.*

---

### Workflow D: Generating Executive Multi-Format Weekly Reports
Generate full Markdown, JSON, and styled HTML executive reports with trend comparisons and actionable SEO recommendations:

```bash
npm run report:weekly
```

**Generated Artifacts:**
- `reports/generated/weekly_seo_report_<date>.md`
- `reports/generated/weekly_seo_report_<date>.json`
- `reports/generated/weekly_seo_report_<date>.html`

---

### Workflow E: Executing Live Ahrefs API v3 Evidence Runs
To execute a live API validation run that bypasses mock fallbacks, logs sanitized headers, and captures live-tagged evidence:

```bash
node scripts/evidence-run.mjs
```

**Generated Artifacts:**
- `reports/evidence/pedro-evidence-<date>.json` (Full 40KB+ JSON evidence pack)
- `reports/evidence/pedro-evidence-<date>.md` (Human-readable markdown summary)
- `snapshots/live-evidence/snap_<domain>_live_<timestamp>.json` (Live snapshots)

---

## ⚙️ Step 4: Configuration & Customization

All workspace configurations live in the `config/` directory:

### 1. `config/domains.json` — Managed Domain Registry
Add or modify target domain settings:
```json
{
  "managed_domains": [
    {
      "domain": "red-engage.com",
      "priority": "Tier 1",
      "focus": "Affiliate & Traffic Engagement",
      "target_country": "us"
    }
  ]
}
```

### 2. `config/competitors.json` — Competitor Mapping
Map domain-specific competitors for keyword gap analysis:
```json
{
  "competitors_by_domain": {
    "red-engage.com": ["growthmarketingpro.com", "seodiscovery.com"],
    "heavengirlfriend.com": ["aigirlfriendmojo.com", "aixploria.com"],
    "hornycompanion.com": ["craveu.ai", "heyreal.ai", "nectar.ai"]
  }
}
```

### 3. `config/app.json` — System Defaults
Adjust retry logic, log level, and report formats:
```json
{
  "max_retries": 3,
  "retry_delay_ms": 500,
  "enable_html_reports": true,
  "log_level": "info",
  "reports_dir": "reports/generated"
}
```

---

## 🧠 Step 5: Living Self-Learning & Workspace Development Tracker

This document is designed to **self-learn and evolve** alongside the codebase. Whenever AI agents or developers introduce new features, endpoints, CLI scripts, or architectural changes, this document MUST be updated.

### 📜 Self-Learning Update Protocol for Agents & Developers

When completing any substantive work in `titan-ahrefs`:

1. **Check for New Features or Commands**: If a new script, CLI flag, or configuration option was added to `package.json` or `src/`, add it to the **CLI Commands Table** in Step 2.
2. **Update the Milestone & Progress Log**: Record completed milestones and technical updates in the **Development Progress Log** below.
3. **Persist Lessons in Repository Memory**: If a new operational edge case, bug workaround, or API behavior is discovered, append a reflection note to `memory/lessons.md` and `memory/decisions.md`.
4. **Synchronize Documentation**: Verify `README.md`, `HOW-TO-USE-THIS.md`, and `docs/` reflect the latest state before pushing commits.

---

### 📝 Development Progress & Milestone Log

| Date | Milestone / Technical Achievement | Status | Notes |
|---|---|---|---|
| **2026-08-06** | **Vercel Backend Server & Multi-Format API** | ✅ Complete | Created `api/report.ts`, `api/index.ts`, and `vercel.json`. Supports Vercel Serverless deployment, weekly crons, and live format toggles (Web Dashboard, CSV, PDF, Markdown, JSON). |
| **2026-08-06** | **Live Ahrefs API v3 Evidence Run (Pedro Compliance)** | ✅ Complete | 16/16 requirement checks passed with live `api.ahrefs.com` HTTP 200 responses. Generated `scripts/evidence-run.mjs` and live evidence packs. |
| **2026-08-06** | **v1.0.0 Production Release & Hardening** | ✅ Complete | Added exponential retry logic (`withRetry`), 0–100 SEO Health Score engine, HTML/MD/JSON reporting, structured logging (`Logger`), and full Jest test suite. |
| **2026-08-06** | **Repository Template & AI Context Setup** | ✅ Complete | Applied standardized workspace repository template (`AGENTS.md`, `AI_CONTEXT.md`, `PROJECT_METADATA.md`, `workspace.json`). |
| **Pending** | **Automated Multi-Run Snapshot Comparison** | ⏳ In Progress | Execute recurring weekly live snapshot runs to populate non-zero trend deltas (`drChange`, `trafficChange`). |

---

## ❓ Troubleshooting & FAQs

### Q1: Why does `npm run audit:domains` show `API Mode: MOCK / SIMULATED`?
**Answer:** Either `AHREFS_API_KEY` is missing in `.env.local` or `MOCK_API_FALLBACK=true`. Set `MOCK_API_FALLBACK=false` and verify your key is active.

### Q2: How do I force a live API evidence run without altering `.env.local`?
**Answer:** Run `node scripts/evidence-run.mjs`. This standalone runner programmatically sets `MOCK_API_FALLBACK=false` for the run.

### Q3: What happens if Ahrefs API returns HTTP 429 Rate Limits?
**Answer:** The `AhrefsClient` automatically handles rate limits using exponential backoff with jitter (`withRetry` in `src/utils/retry.ts`), attempting up to 3 retries.

---

*Independent workspace documentation maintained within `mchlbrns/titan-workspace`*
