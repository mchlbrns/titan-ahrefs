# 📊 titan-ahrefs — Standalone Ahrefs SEO & Keyword Analytics Engine (v1.0.0)

`titan-ahrefs` is an independent, multi-domain Ahrefs analytics engine, backlink profile monitor, SERP rank tracking system, and automated report generator within the `mchlbrns/titan-workspace` portfolio.

> [!IMPORTANT]
> **Managed Domain Scope**: This repository manages **EXCLUSIVELY** the following target domains:
> 1. `red-engage.com`
> 2. `heavengirlfriend.com`
> 3. `hornycompanion.com`
> 
> It operates independently of Titan Treasure (`titantreasure-marketing` & `titan-parasites`).

---

## 🎯 Key Features (v1.0.0 Production Release)

1. **Ahrefs API v3 Integration**: Automated polling of Domain Rating (DR), URL Rating (UR), total backlinks, referring domains, organic keyword positions, and estimated traffic.
2. **Exponential Backoff & Retry**: Built-in `withRetry` logic with jittered backoff for HTTP 429 rate limits and 5xx API errors.
3. **SEO Health Score Engine**: Composite 0–100 SEO Health Score and letter grade (`A+` to `F`) with actionable recommendations.
4. **Historical Snapshots & Trend Comparisons**: Automated persistence in `snapshots/local/` and delta trend tracking (`▲ UP`, `▼ DOWN`, `▬ STABLE`).
5. **Multi-Format HTML/MD/JSON Reporting**: Generates styled HTML executive reports alongside Markdown and JSON artifacts in `reports/generated/`.
6. **Configuration Validation & Structured Logging**: Schema validation via `ConfigLoader` and structured logging (`Logger`) supporting JSON and pretty formats.
7. **Comprehensive Test Suite & CI/CD**: Complete Jest unit, integration, and CLI smoke tests enforced via GitHub Actions.

---

## 🚀 CLI Commands & Quickstart

### Available Scripts

| Command | Action | Output Artifacts |
|---|---|---|
| `npm run audit:domains` | Audit backlink profiles & DR | Console Output |
| `npm run fetch:keywords` | Fetch organic keyword rankings & traffic | Console Output |
| `npm run snapshot:create` | Capture & persist domain metrics snapshot | `snapshots/local/snap_*.json` |
| `npm run analyze:competitors` | Analyze keyword gap & SERP overlap | Console Output |
| `npm run report:weekly` | Generate executive weekly report | MD + JSON + HTML in `reports/generated/` |
| `npm run typecheck` | Run TypeScript strict typecheck | Code Verification |
| `npm run lint` | Run ESLint code quality audit | Code Quality |
| `npm test` | Run Jest test suite | Unit/CLI Smoke Verification |

---

## ⚙️ Configuration Specs

- `config/domains.json`: List of managed domains with target country, priority, and description.
- `config/competitors.json`: Competitor mapping per domain.
- `config/app.json`: System defaults for retries, delays, report output directory, log level, and HTML toggle.

---

## 🔐 Environment Variables

```env
AHREFS_API_KEY=your_ahrefs_api_token
AHREFS_API_BASE_URL=https://api.ahrefs.com/v3
MOCK_API_FALLBACK=true
LOG_LEVEL=info
LOG_FORMAT=pretty
```

---

## 📁 Repository Structure

```
titan-ahrefs/
├── .github/workflows/ci.yml # Expanded GitHub Actions workflow
├── config/                 # Domain, competitor, and app configuration files
├── docs/                   # System architecture, testing, and release notes
│   ├── architecture.md
│   ├── release-notes.md
│   └── testing.md
├── reports/generated/      # Generated MD, JSON, and HTML executive reports
├── snapshots/local/        # Historical snapshot JSON store
├── src/                    # Production TypeScript engine code
│   ├── backlinks.ts
│   ├── client.ts
│   ├── competitors.ts
│   ├── config.ts
│   ├── errors.ts
│   ├── health.ts
│   ├── index.ts
│   ├── keywords.ts
│   ├── logger.ts
│   ├── reports.ts
│   ├── snapshots.ts
│   ├── types.ts
│   └── utils/retry.ts
├── tests/                  # Unit, integration, and CLI smoke test suite
├── CHANGELOG.md
├── CONTRIBUTING.md
└── README.md
```

---

*Independent project workspace managed within `mchlbrns/titan-workspace`*
