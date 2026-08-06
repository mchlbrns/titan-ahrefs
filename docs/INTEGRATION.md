# 🔌 INTEGRATION GUIDE — titan-ahrefs

This document details how `titan-ahrefs` integrates within the parent workspace portfolio and with external Ahrefs API endpoints.

---

## 1. Parent Workspace Integration (`mchlbrns/titan-workspace`)

- **Submodule Path**: `titan-ahrefs/`
- **Submodule Protocol**: Linked via `.gitmodules` in workspace root.
- **Shared Memory & State**: `titan-ahrefs` reports session progress to `memory/state/current.json` and updates `memory/lessons.md` upon completing analytics tasks.
- **Cross-Repo References**: Defined in `bridge.md` in workspace root.

---

## 2. External Integration — Ahrefs API v3

- **Endpoint**: `https://api.ahrefs.com/v3/`
- **Authentication Header**: `Authorization: Bearer <AHREFS_API_KEY>`
- **Core API Endpoints Handled**:
  - `GET /site-explorer/domain-rating` — Domain Rating (DR) and Ahrefs Rank (AR)
  - `GET /site-explorer/all-backlinks` — Backlinks and referring domain breakdown
  - `GET /site-explorer/organic-keywords` — Keyword rankings and estimated traffic
  - `GET /site-explorer/refdomains` — Unique referring domains and domain ratings
