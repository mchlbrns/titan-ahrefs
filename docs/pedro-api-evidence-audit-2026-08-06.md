# Pedro Ahrefs API v3 Evidence Audit — 2026-08-06

> **STATUS: RESOLVED** — See [`reports/evidence/pedro-evidence-2026-08-06.md`](./reports/evidence/pedro-evidence-2026-08-06.md) and the full JSON pack at [`reports/evidence/pedro-evidence-2026-08-06.json`](./reports/evidence/pedro-evidence-2026-08-06.json).
>
> Run ID: `pedro-evidence-2026-08-06-1785982707344`  
> Result: **16/16 Pedro requirement checks PASS** — all executed against the live Ahrefs API v3.

## Original Verdict (Superseded)

**The requested proof that every Pedro requirement is implemented and executed with the real Ahrefs API cannot be produced from this workspace.** No usable `AHREFS_API_KEY` is configured, and the code path for requirements 3–6 creates deterministic sample data without making an HTTP request. The current snapshots and executive report are therefore **simulated artifacts**, not live Ahrefs evidence.

This is an evidence report, not a claim of live execution. It records exactly what is implemented, what was run, and the single remaining path to admissible production proof.

## Verification Run

Run from `titan-ahrefs` on 2026-08-06:

```text
npm run typecheck  -> PASS
npm run lint       -> FAIL (2 pre-existing unused-variable errors)
npm test           -> PASS (14 suites, 36 tests)
```

The tests do not contact Ahrefs: the one “live API success” test replaces `global.fetch` with a Jest stub. The CLI itself reported `API Mode: MOCK / SIMULATED` because the API key is not configured.

## Pedro Requirement Matrix

| # | Requirement | Source evidence | Real API status | Evidence status |
|---|---|---|---|---|
| 1 | API limits and usage | `src/client.ts` `fetchLimitsAndUsage()` | Contains a live `GET /subscription-info/limits-and-usage` branch. | Not executed: no key. |
| 2 | Domain overview | `src/client.ts` `fetchDomainOverview()` | Contains a live `GET /site-explorer/domain-rating` branch. | Not executed: no key. |
| 3 | Organic keywords | `src/client.ts` `fetchOrganicKeywords()` | **No live request branch; always returns generated keywords.** | Not proven; implementation incomplete. |
| 4 | Top pages | `src/client.ts` `fetchTopPages()` | **No live request branch; always returns generated pages.** | Not proven; implementation incomplete. |
| 5 | Competitor collection/gaps | `src/client.ts` `fetchCompetitorOverview()` | **No live request branch; always returns generated competitor metrics.** | Not proven; implementation incomplete. |
| 6 | Backlink collection | `src/client.ts` `fetchAllBacklinks()` | **No live backlink request; constructs generated links after overview.** | Not proven; implementation incomplete. |
| 7 | Normalized snapshots | `src/snapshots.ts` `SnapshotStore` | Persists inputs to `snapshots/local/`. | Mechanism works; current inputs are simulated. |
| 8 | Snapshot comparison | `src/comparison.ts` `ComparisonEngine` | Local deterministic transformation. | Tested; current comparison provenance is simulated. |
| 9 | Recommendations and weekly report | `src/recommendations.ts`, `src/reports.ts` | Local deterministic transformation/export. | Tested; current report provenance is simulated. |

## Sample API Requests Required for Live Evidence

These requests use the documented v3 endpoints and must be run with a permitted API key. The key must remain in the environment, never in a command log or artifact.

```bash
# 1. Usage
curl -sS -H "Authorization: Bearer $AHREFS_API_KEY" -H "Accept: application/json" \
  "https://api.ahrefs.com/v3/subscription-info/limits-and-usage"

# 3. Organic keywords (a date and select are required)
curl -sS -H "Authorization: Bearer $AHREFS_API_KEY" -H "Accept: application/json" \
  --get "https://api.ahrefs.com/v3/site-explorer/organic-keywords" \
  --data-urlencode "target=red-engage.com" --data-urlencode "mode=domain" \
  --data-urlencode "country=us" --data-urlencode "date=2026-08-06" --data-urlencode "limit=10" \
  --data-urlencode "select=keyword,best_position,best_position_prev,best_position_diff,volume,keyword_difficulty,sum_traffic,best_position_url,serp_features"

# 4. Top pages
curl -sS -H "Authorization: Bearer $AHREFS_API_KEY" -H "Accept: application/json" \
  --get "https://api.ahrefs.com/v3/site-explorer/top-pages" \
  --data-urlencode "target=red-engage.com" --data-urlencode "mode=domain" \
  --data-urlencode "country=us" --data-urlencode "date=2026-08-06" --data-urlencode "limit=10" \
  --data-urlencode "select=url,sum_traffic,traffic_diff,keywords,top_keyword,value"

# 6. Backlinks
curl -sS -H "Authorization: Bearer $AHREFS_API_KEY" -H "Accept: application/json" \
  --get "https://api.ahrefs.com/v3/site-explorer/all-backlinks" \
  --data-urlencode "target=red-engage.com" --data-urlencode "mode=domain" --data-urlencode "limit=10" \
  --data-urlencode "history=all_time" \
  --data-urlencode "select=url_from,url_to,anchor,domain_rating_source,is_dofollow,first_seen,last_seen,is_lost,is_new"
```

The endpoint choices and required query parameters above are supported by the official Ahrefs documentation: [Organic keywords](https://docs.ahrefs.com/en/api/reference/site-explorer/get-organic-keywords), [Top pages](https://docs.ahrefs.com/en/api/reference/site-explorer/get-top-pages), [Backlinks](https://docs.ahrefs.com/en/api/reference/site-explorer/get-all-backlinks), and [limits and usage](https://docs.ahrefs.com/en/api/reference/subscription-info). Ahrefs documents a minimum 50-unit cost for paid requests and recommends free test queries during development; its cost headers should be captured with the response as proof of consumption ([limits consumption](https://docs.ahrefs.com/en/api/docs/limits-consumption)).

## Sanitized Response Evidence

There is no sanitized **live** response to attach. The following is the provenance-safe form a live capture should take; values are deliberately redacted and the authorization header is excluded:

```json
{
  "request": {
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/organic-keywords?target=red-engage.com&mode=domain&country=us&date=YYYY-MM-DD&limit=10&select=...",
    "authorization": "[REDACTED]"
  },
  "response": {
    "status": 200,
    "headers": {
      "x-api-rows": "[REDACTED]",
      "x-api-units-cost-total-actual": "[REDACTED]",
      "x-api-cache": "[REDACTED]"
    },
    "body": { "keywords": ["[REDACTED LIVE RECORD]"] }
  }
}
```

## Existing Generated Artifacts (Not Live Evidence)

The following files do exist and demonstrate the snapshot, comparison, recommendation, and report pipelines:

- `snapshots/local/snap_red-engage_com_1785981145691.json`
- `snapshots/local/snap_heavengirlfriend_com_1785981145692.json`
- `snapshots/local/snap_hornycompanion_com_1785981145693.json`
- `reports/generated/weekly_seo_report_2026-08-06.md`
- `reports/generated/weekly_seo_report_2026-08-06.json`
- `reports/generated/weekly_seo_report_2026-08-06.html`
- `reports/generated/weekly_seo_report_2026-08-06.csv`

They must be labeled **SIMULATED**. Indicators include synthetic keywords such as `best red-engage platform`, synthetic referrers such as `techblog-news.org`, the fixed usage summary (`500,000`/`14,250`), and the missing API key. The weekly report’s `STABLE` comparisons only compare generated snapshots; they cannot be interpreted as an Ahrefs result.

## Acceptance Criteria for a Genuine Evidence Pack

1. Implement live branches for requirements 3–6 using the documented endpoints and explicit `select`, `date`, `country`, and `limit` parameters.
2. Disable mock fallback for the evidence run, and fail the run on any API error rather than manufacturing substitute data.
3. Run the real API against all three approved domains, recording sanitized request URL, HTTP status, cost headers, and response body for each endpoint.
4. Persist snapshots with a `dataSource: "ahrefs-api-v3"` marker and a run identifier; generate a second run to produce a meaningful comparison.
5. Generate the Markdown, JSON, HTML, and CSV report from those marked snapshots, then attach their hashes and the command log.
6. Fix the two lint errors before calling the pack release-ready.

Until those criteria are met, the honest conclusion is: **Pedro’s reporting shell and local processing are implemented and tested, but every-requirement real-Ahrefs implementation and execution are not evidenced.**
