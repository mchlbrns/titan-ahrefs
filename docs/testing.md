# 🧪 Testing & Quality Assurance Guide — titan-ahrefs

## Overview

`titan-ahrefs` incorporates a comprehensive testing strategy combining unit tests, integration tests, CLI smoke tests, typechecking, and linting to ensure production reliability.

---

## Test Execution Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all Jest unit and integration tests |
| `npm run test:coverage` | Run test suite and generate code coverage report |
| `npm run typecheck` | Run TypeScript strict typecheck (`tsc --noEmit`) |
| `npm run lint` | Run ESLint code quality checks |
| `npm run build` | Validate production TypeScript compilation (`dist/`) |

---

## Test Hierarchy

### 1. Unit Tests (`tests/unit/`)
- `client.test.ts`: Ahrefs API requests, mock fallback, status error handling.
- `retry.test.ts`: Exponential backoff timing, attempt limits, status code retry filters.
- `config.test.ts`: Configuration loading, fallback, schema validation.
- `health.test.ts`: SEO Health Score algorithm weighting, grade thresholds, edge cases.
- `logger.test.ts`: Log level filtering, JSON serialization, pretty output formatting.
- `backlinks.test.ts`: Dofollow ratios, anchor text distribution auditing.
- `keywords.test.ts`: Organic position deltas and traffic calculations.
- `snapshots.test.ts`: Snapshot creation, disk persistence, sorting, and delta comparisons.
- `competitors.test.ts`: Keyword gap calculations and competitor overlap metrics.
- `reports.test.ts`: Markdown, JSON, and HTML report output generation.

### 2. CLI Integration Smoke Tests (`tests/cli/smoke.test.ts`)
Executes CLI commands (`audit:domains`, `fetch:keywords`, `snapshot:create`, `analyze:competitors`, `report:weekly`) via `tsx`, verifying exit codes and expected outputs.

---

## Target Code Coverage Thresholds

Jest enforces the following code coverage minimums:
- **Statements**: ≥ 75%
- **Branches**: ≥ 70%
- **Functions**: ≥ 70%
- **Lines**: ≥ 75%
