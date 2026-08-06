# Changelog

All notable changes to `titan-ahrefs` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-06

### Added
- **SEO Health Score Engine**: Created `calculateSeoHealthScore` computing composite 0-100 score, letter grade (`A+` to `F`), and optimization recommendations.
- **Multi-Format HTML Reporting**: Added responsive, dark-themed HTML report generation (`weekly_seo_report_YYYY-MM-DD.html`) alongside Markdown and JSON outputs.
- **Historical Trend Analysis**: Extended `SnapshotStore` with `compareSnapshots` method calculating metric shift deltas and trend direction badges (`UP`, `DOWN`, `STABLE`).
- **API Exponential Backoff & Retry**: Implemented `withRetry` utility for API requests handling HTTP 429 rate limits and 5xx server errors with jittered backoff.
- **Configuration Validation**: Added `ConfigLoader` module providing schema validation for domain syntax, priority levels, and file locations.
- **Structured Logging & Typed Errors**: Introduced `Logger` module (supporting JSON/pretty log outputs) and `AhrefsEngineError` typed error hierarchy.
- **Automated Test Suite**: Added comprehensive Jest test suite covering unit tests, integration tests, and CLI smoke tests.
- **Enhanced CI Pipeline**: Expanded `.github/workflows/ci.yml` with typechecking, linting, unit test coverage, security audit, build validation, and CLI smoke testing.
- **Documentation Suite**: Added `docs/architecture.md`, `docs/release-notes.md`, `docs/testing.md`, `CONTRIBUTING.md`, and updated `README.md`.

### Changed
- Refactored `AhrefsClient`, `BacklinkAuditor`, `KeywordTracker`, `SnapshotStore`, `CompetitorAnalyzer`, and `ReportGenerator` to inject `Logger` and typed error handling.
- Enhanced CLI entry point `src/index.ts` to utilize configuration validation and structured logger while preserving 100% backward compatibility.

### Fixed
- Improved disk directory creation error handling in `SnapshotStore` and `ReportGenerator`.
