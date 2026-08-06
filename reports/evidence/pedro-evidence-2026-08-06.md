# Pedro Ahrefs API v3 -- Live Evidence Report

**Generated:** 2026-08-06T02:18:43.047Z
**API Mode:** LIVE AHREFS API v3 (MOCK_API_FALLBACK=false)
**Run ID:** pedro-evidence-2026-08-06-1785982707344
**Domains:** red-engage.com, heavengirlfriend.com, hornycompanion.com

---

## Requirement Matrix

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | API Limits & Usage | PASS | Live HTTP 200 confirmed |
| 2 | Domain Overview -- red-engage.com | PASS | Live HTTP 200 confirmed |
| 3 | Organic Keywords -- red-engage.com | PASS | Live HTTP 200 confirmed |
| 4 | Top Pages -- red-engage.com | PASS | Live HTTP 200 confirmed |
| 5 | Competitor Overview -- red-engage.com | PASS | Live HTTP 200 confirmed |
| 6 | All Backlinks -- red-engage.com | PASS | Live HTTP 200 confirmed |
| 2 | Domain Overview -- heavengirlfriend.com | PASS | Live HTTP 200 confirmed |
| 3 | Organic Keywords -- heavengirlfriend.com | PASS | Live HTTP 200 confirmed |
| 4 | Top Pages -- heavengirlfriend.com | PASS | Live HTTP 200 confirmed |
| 5 | Competitor Overview -- heavengirlfriend.com | PASS | Live HTTP 200 confirmed |
| 6 | All Backlinks -- heavengirlfriend.com | PASS | Live HTTP 200 confirmed |
| 2 | Domain Overview -- hornycompanion.com | PASS | Live HTTP 200 confirmed |
| 3 | Organic Keywords -- hornycompanion.com | PASS | Live HTTP 200 confirmed |
| 4 | Top Pages -- hornycompanion.com | PASS | Live HTTP 200 confirmed |
| 5 | Competitor Overview -- hornycompanion.com | PASS | Live HTTP 200 confirmed |
| 6 | All Backlinks -- hornycompanion.com | PASS | Live HTTP 200 confirmed |

**16/16 requirements PASS/PARTIAL with live Ahrefs API evidence.**

---

## Sample Requests & Sanitized Responses

### REQ 1: API Limits & Usage

**Request 1:** `GET https://api.ahrefs.com/v3/subscription-info/limits-and-usage`

```json
{
  "request": {
    "label": "REQ1/limits-and-usage",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/subscription-info/limits-and-usage",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:27.347Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "0",
      "x-api-cache": "no_cache",
      "x-api-rows": "1"
    },
    "bodySample": {
      "limits_and_usage": {
        "subscription": "Standard, billed monthly",
        "usage_reset_date": "2026-09-04T00:00:00Z",
        "units_limit_workspace": 400000,
        "units_usage_workspace": 5700,
        "units_limit_api_key": null,
        "units_usage_api_key": 5700,
        "api_key_expiration_date": "2027-08-06T01:57:32Z"
      }
    }
  }
}
```

**Parsed Result:**
```json
{
  "units_limit": "n/a",
  "units_consumed": "n/a",
  "units_remaining": "n/a",
  "reset_date": "n/a",
  "api_key_status": "n/a"
}
```

### REQ 2: Domain Overview -- red-engage.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/domain-rating?target=red-engage.com&date=2026-08-06`

```json
{
  "request": {
    "label": "REQ2/domain-rating/red-engage.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/domain-rating?target=red-engage.com&date=2026-08-06",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:29.969Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "50",
      "x-api-cache": "no_cache",
      "x-api-rows": "1"
    },
    "bodySample": {
      "domain_rating": {
        "domain_rating": 26,
        "ahrefs_rank": 5458803
      }
    }
  }
}
```

**Request 2:** `GET https://api.ahrefs.com/v3/site-explorer/metrics?target=red-engage.com&mode=domain&date=2026-08-06&country=us`

```json
{
  "request": {
    "label": "REQ2/metrics/red-engage.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/metrics?target=red-engage.com&mode=domain&date=2026-08-06&country=us",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:29.970Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "0",
      "x-api-cache": "hit",
      "x-api-rows": "1"
    },
    "bodySample": {
      "metrics": {
        "org_keywords": 2,
        "paid_keywords": 0,
        "org_keywords_1_3": 2,
        "org_traffic": 0,
        "org_cost": 0,
        "paid_traffic": 0,
        "paid_cost": null,
        "paid_pages": 0
      }
    }
  }
}
```

**Request 3:** `GET https://api.ahrefs.com/v3/site-explorer/backlinks-stats?target=red-engage.com&mode=domain&date=2026-08-06`

```json
{
  "request": {
    "label": "REQ2/backlinks-stats/red-engage.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/backlinks-stats?target=red-engage.com&mode=domain&date=2026-08-06",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:29.971Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "0",
      "x-api-cache": "hit",
      "x-api-rows": "1"
    },
    "bodySample": {
      "metrics": {
        "live": 745,
        "all_time": 965,
        "live_refdomains": 421,
        "all_time_refdomains": 437
      }
    }
  }
}
```

**Parsed Result:**
```json
{
  "domain_rating": {
    "domain_rating": 26,
    "ahrefs_rank": 5458803
  },
  "ahrefs_rank": "n/a",
  "org_traffic": 0,
  "org_traffic_value": "n/a",
  "org_keywords": 2,
  "backlinks_live": 745,
  "refdomains_live": 421
}
```

### REQ 3: Organic Keywords -- red-engage.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/organic-keywords?target=red-engage.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=keyword%2Cbest_position%2Cbest_position_prev%2Cbest_position_diff%2Cvolume%2Ckeyword_difficulty%2Csum_traffic%2Cbest_position_url%2Cserp_features&order_by=sum_traffic%3Adesc`

```json
{
  "request": {
    "label": "REQ3/organic-keywords/red-engage.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/organic-keywords?target=red-engage.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=keyword%2Cbest_position%2Cbest_position_prev%2Cbest_position_diff%2Cvolume%2Ckeyword_difficulty%2Csum_traffic%2Cbest_position_url%2Cserp_features&order_by=sum_traffic%3Adesc",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:30.321Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "108",
      "x-api-cache": "miss",
      "x-api-rows": "3"
    },
    "bodySample": {
      "keywords": [
        {
          "keyword": "reddit marketing agency",
          "best_position": 3,
          "best_position_prev": 3,
          "best_position_diff": 0,
          "volume": 400,
          "keyword_difficulty": 1,
          "sum_traffic": 0,
          "best_position_url": "https://red-engage.com/blog/best-reddit-marketing-agencies",
          "serp_features": [
            "ai_overview",
            "image_th",
            "news"
          ]
        },
        {
          "keyword": "leading advertising companies",
          "best_position": 1,
          "best_position_prev": 1,
          "best_position_diff": 0,
          "volume": 90,
          "keyword_difficulty": 6,
          "sum_traffic": 0,
          "best_position_url": "https://red-engage.com/blog/best-international-marketing-agencies",
          "serp_features": [
            "ai_overview",
            "image_th",
            "local_pack"
          ]
        },
        {
          "keyword": null,
          "best_position": null,
          "best_position_prev": 46,
          "best_position_diff": null,
          "volume": null,
          "keyword_difficulty": null,
          "sum_traffic": null,
          "best_position_url": null,
          "serp_features": []
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "keywordCount": 3,
  "sampleKeywords": [
    {
      "keyword": "reddit marketing agency",
      "best_position": 3,
      "volume": 400,
      "kd": 1,
      "sum_traffic": 0
    },
    {
      "keyword": "leading advertising companies",
      "best_position": 1,
      "volume": 90,
      "kd": 6,
      "sum_traffic": 0
    },
    {
      "keyword": null,
      "best_position": null,
      "volume": null,
      "kd": null,
      "sum_traffic": null
    }
  ]
}
```

### REQ 4: Top Pages -- red-engage.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/top-pages?target=red-engage.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=url%2Csum_traffic%2Ctraffic_diff%2Ckeywords%2Ctop_keyword%2Cvalue`

```json
{
  "request": {
    "label": "REQ4/top-pages/red-engage.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/top-pages?target=red-engage.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=url%2Csum_traffic%2Ctraffic_diff%2Ckeywords%2Ctop_keyword%2Cvalue",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:31.190Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "50",
      "x-api-cache": "miss",
      "x-api-rows": "2"
    },
    "bodySample": {
      "pages": [
        {
          "url": "https://red-engage.com/blog/best-international-marketing-agencies",
          "sum_traffic": 0,
          "traffic_diff": 0,
          "keywords": 1,
          "top_keyword": "leading advertising companies",
          "value": null
        },
        {
          "url": "https://red-engage.com/blog/best-reddit-marketing-agencies",
          "sum_traffic": 0,
          "traffic_diff": 0,
          "keywords": 1,
          "top_keyword": "reddit marketing agency",
          "value": 0
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "pageCount": 2,
  "samplePages": [
    {
      "url": "https://red-engage.com/blog/best-international-marketing-agencies",
      "sum_traffic": 0,
      "keywords": 1,
      "top_keyword": "leading advertising companies"
    },
    {
      "url": "https://red-engage.com/blog/best-reddit-marketing-agencies",
      "sum_traffic": 0,
      "keywords": 1,
      "top_keyword": "reddit marketing agency"
    }
  ]
}
```

### REQ 5: Competitor Overview -- red-engage.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/organic-competitors?target=red-engage.com&mode=domain&country=us&date=2026-08-06&limit=10&select=competitor_domain%2Cdomain_rating%2Ckeywords_common%2Ckeywords_competitor%2Ctraffic%2Cvalue`

```json
{
  "request": {
    "label": "REQ5/competitors/red-engage.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/organic-competitors?target=red-engage.com&mode=domain&country=us&date=2026-08-06&limit=10&select=competitor_domain%2Cdomain_rating%2Ckeywords_common%2Ckeywords_competitor%2Ctraffic%2Cvalue",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:32.033Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "72",
      "x-api-cache": "miss",
      "x-api-rows": "3"
    },
    "bodySample": {
      "competitors": [
        {
          "competitor_domain": "growthmarketingpro.com",
          "domain_rating": 70,
          "keywords_common": 1,
          "keywords_competitor": 969,
          "traffic": 8356,
          "value": 3492236
        },
        {
          "competitor_domain": "reddit.com",
          "domain_rating": 95,
          "keywords_common": 2,
          "keywords_competitor": 61755814,
          "traffic": 657249229,
          "value": 40232808344
        },
        {
          "competitor_domain": "seodiscovery.com",
          "domain_rating": 59,
          "keywords_common": 0,
          "keywords_competitor": 1198,
          "traffic": 5792,
          "value": 3471434
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "competitorCount": 3,
  "topCompetitors": [
    {
      "competitor_domain": "growthmarketingpro.com",
      "domain_rating": 70,
      "keywords_common": 1,
      "traffic": 8356
    },
    {
      "competitor_domain": "reddit.com",
      "domain_rating": 95,
      "keywords_common": 2,
      "traffic": 657249229
    },
    {
      "competitor_domain": "seodiscovery.com",
      "domain_rating": 59,
      "keywords_common": 0,
      "traffic": 5792
    }
  ]
}
```

### REQ 6: All Backlinks -- red-engage.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/all-backlinks?target=red-engage.com&mode=domain&aggregation=1_per_domain&history=all_time&limit=10&select=url_from%2Curl_to%2Canchor%2Cdomain_rating_source%2Cis_dofollow%2Cfirst_seen%2Clast_seen%2Cis_lost%2Cis_new`

```json
{
  "request": {
    "label": "REQ6/all-backlinks/red-engage.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/all-backlinks?target=red-engage.com&mode=domain&aggregation=1_per_domain&history=all_time&limit=10&select=url_from%2Curl_to%2Canchor%2Cdomain_rating_source%2Cis_dofollow%2Cfirst_seen%2Clast_seen%2Cis_lost%2Cis_new",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:33.676Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "90",
      "x-api-cache": "miss",
      "x-api-rows": "10"
    },
    "bodySample": {
      "backlinks": [
        {
          "url_from": "https://overhorizonmedia.com/which-social-media-app-has-a-ghost-as-its-mascot/",
          "url_to": "https://red-engage.com/",
          "anchor": "Red-engage",
          "domain_rating_source": 18,
          "is_dofollow": true,
          "first_seen": "2021-04-08T07:06:33Z",
          "last_seen": null,
          "is_lost": false,
          "is_new": true
        },
        {
          "url_from": "https://www.designrush.com/agency/digital-marketing/wyoming",
          "url_to": "https://red-engage.com/",
          "anchor": "Red-engage",
          "domain_rating_source": 90,
          "is_dofollow": false,
          "first_seen": "2022-02-08T07:03:45Z",
          "last_seen": "2026-04-08T00:05:47Z",
          "is_lost": true,
          "is_new": true
        },
        {
          "url_from": "https://redditera.com/",
          "url_to": "https://red-engage.com/",
          "anchor": "Red-engage",
          "domain_rating_source": 4.9,
          "is_dofollow": true,
          "first_seen": "2024-03-13T14:26:58Z",
          "last_seen": null,
          "is_lost": false,
          "is_new": true
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "backlinkCount": 10,
  "sampleBacklinks": [
    {
      "url_from": "https://overhorizonmedia.com/which-social-media-app-has-a-ghost-as-its-mascot/",
      "anchor": "Red-engage",
      "domain_rating_source": 18,
      "is_dofollow": true,
      "is_lost": false,
      "is_new": true
    },
    {
      "url_from": "https://www.designrush.com/agency/digital-marketing/wyoming",
      "anchor": "Red-engage",
      "domain_rating_source": 90,
      "is_dofollow": false,
      "is_lost": true,
      "is_new": true
    },
    {
      "url_from": "https://redditera.com/",
      "anchor": "Red-engage",
      "domain_rating_source": 4.9,
      "is_dofollow": true,
      "is_lost": false,
      "is_new": true
    }
  ]
}
```

### REQ 2: Domain Overview -- heavengirlfriend.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/domain-rating?target=heavengirlfriend.com&date=2026-08-06`

```json
{
  "request": {
    "label": "REQ2/domain-rating/heavengirlfriend.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/domain-rating?target=heavengirlfriend.com&date=2026-08-06",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:34.141Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "50",
      "x-api-cache": "no_cache",
      "x-api-rows": "1"
    },
    "bodySample": {
      "domain_rating": {
        "domain_rating": 21,
        "ahrefs_rank": 7864720
      }
    }
  }
}
```

**Request 2:** `GET https://api.ahrefs.com/v3/site-explorer/metrics?target=heavengirlfriend.com&mode=domain&date=2026-08-06&country=us`

```json
{
  "request": {
    "label": "REQ2/metrics/heavengirlfriend.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/metrics?target=heavengirlfriend.com&mode=domain&date=2026-08-06&country=us",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:34.142Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "0",
      "x-api-cache": "hit",
      "x-api-rows": "1"
    },
    "bodySample": {
      "metrics": {
        "org_keywords": 24,
        "paid_keywords": 0,
        "org_keywords_1_3": 1,
        "org_traffic": 318,
        "org_cost": 25707,
        "paid_traffic": 0,
        "paid_cost": null,
        "paid_pages": 0
      }
    }
  }
}
```

**Request 3:** `GET https://api.ahrefs.com/v3/site-explorer/backlinks-stats?target=heavengirlfriend.com&mode=domain&date=2026-08-06`

```json
{
  "request": {
    "label": "REQ2/backlinks-stats/heavengirlfriend.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/backlinks-stats?target=heavengirlfriend.com&mode=domain&date=2026-08-06",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:34.143Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "0",
      "x-api-cache": "hit",
      "x-api-rows": "1"
    },
    "bodySample": {
      "metrics": {
        "live": 1011,
        "all_time": 1646,
        "live_refdomains": 531,
        "all_time_refdomains": 755
      }
    }
  }
}
```

**Parsed Result:**
```json
{
  "domain_rating": {
    "domain_rating": 21,
    "ahrefs_rank": 7864720
  },
  "ahrefs_rank": "n/a",
  "org_traffic": 318,
  "org_traffic_value": "n/a",
  "org_keywords": 24,
  "backlinks_live": 1011,
  "refdomains_live": 531
}
```

### REQ 3: Organic Keywords -- heavengirlfriend.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/organic-keywords?target=heavengirlfriend.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=keyword%2Cbest_position%2Cbest_position_prev%2Cbest_position_diff%2Cvolume%2Ckeyword_difficulty%2Csum_traffic%2Cbest_position_url%2Cserp_features&order_by=sum_traffic%3Adesc`

```json
{
  "request": {
    "label": "REQ3/organic-keywords/heavengirlfriend.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/organic-keywords?target=heavengirlfriend.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=keyword%2Cbest_position%2Cbest_position_prev%2Cbest_position_diff%2Cvolume%2Ckeyword_difficulty%2Csum_traffic%2Cbest_position_url%2Cserp_features&order_by=sum_traffic%3Adesc",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:34.473Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "360",
      "x-api-cache": "miss",
      "x-api-rows": "10"
    },
    "bodySample": {
      "keywords": [
        {
          "keyword": "spicychat app",
          "best_position": 14,
          "best_position_prev": null,
          "best_position_diff": null,
          "volume": 15000,
          "keyword_difficulty": 30,
          "sum_traffic": 178,
          "best_position_url": "https://heavengirlfriend.com/blog/is-spicy-chat-ai-safe",
          "serp_features": [
            "sitelink",
            "video_th"
          ]
        },
        {
          "keyword": "luvr ai",
          "best_position": 8,
          "best_position_prev": 7,
          "best_position_diff": 1,
          "volume": 1900,
          "keyword_difficulty": 28,
          "sum_traffic": 71,
          "best_position_url": "https://heavengirlfriend.com/reviews/luvr-ai-review",
          "serp_features": [
            "sitelink"
          ]
        },
        {
          "keyword": "herahaven ai",
          "best_position": 7,
          "best_position_prev": 7,
          "best_position_diff": 0,
          "volume": 450,
          "keyword_difficulty": 1,
          "sum_traffic": 21,
          "best_position_url": "https://heavengirlfriend.com/reviews/herahaven-ai-review",
          "serp_features": [
            "sitelink"
          ]
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "keywordCount": 10,
  "sampleKeywords": [
    {
      "keyword": "spicychat app",
      "best_position": 14,
      "volume": 15000,
      "kd": 30,
      "sum_traffic": 178
    },
    {
      "keyword": "luvr ai",
      "best_position": 8,
      "volume": 1900,
      "kd": 28,
      "sum_traffic": 71
    },
    {
      "keyword": "herahaven ai",
      "best_position": 7,
      "volume": 450,
      "kd": 1,
      "sum_traffic": 21
    },
    {
      "keyword": "best ai girlfriend",
      "best_position": 16,
      "volume": 1900,
      "kd": 33,
      "sum_traffic": 15
    },
    {
      "keyword": "kupid ai",
      "best_position": 20,
      "volume": 3500,
      "kd": 28,
      "sum_traffic": 9
    }
  ]
}
```

### REQ 4: Top Pages -- heavengirlfriend.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/top-pages?target=heavengirlfriend.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=url%2Csum_traffic%2Ctraffic_diff%2Ckeywords%2Ctop_keyword%2Cvalue`

```json
{
  "request": {
    "label": "REQ4/top-pages/heavengirlfriend.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/top-pages?target=heavengirlfriend.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=url%2Csum_traffic%2Ctraffic_diff%2Ckeywords%2Ctop_keyword%2Cvalue",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:34.876Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "240",
      "x-api-cache": "miss",
      "x-api-rows": "10"
    },
    "bodySample": {
      "pages": [
        {
          "url": "https://heavengirlfriend.com/blog/is-spicy-chat-ai-safe",
          "sum_traffic": 189,
          "traffic_diff": 174,
          "keywords": 4,
          "top_keyword": "spicychat app",
          "value": 15746
        },
        {
          "url": "https://heavengirlfriend.com/reviews/luvr-ai-review",
          "sum_traffic": 71,
          "traffic_diff": -13,
          "keywords": 1,
          "top_keyword": "luvr ai",
          "value": 5566
        },
        {
          "url": "https://heavengirlfriend.com/reviews/herahaven-ai-review",
          "sum_traffic": 23,
          "traffic_diff": 0,
          "keywords": 2,
          "top_keyword": "herahaven ai",
          "value": 1234
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "pageCount": 10,
  "samplePages": [
    {
      "url": "https://heavengirlfriend.com/blog/is-spicy-chat-ai-safe",
      "sum_traffic": 189,
      "keywords": 4,
      "top_keyword": "spicychat app"
    },
    {
      "url": "https://heavengirlfriend.com/reviews/luvr-ai-review",
      "sum_traffic": 71,
      "keywords": 1,
      "top_keyword": "luvr ai"
    },
    {
      "url": "https://heavengirlfriend.com/reviews/herahaven-ai-review",
      "sum_traffic": 23,
      "keywords": 2,
      "top_keyword": "herahaven ai"
    },
    {
      "url": "https://heavengirlfriend.com/",
      "sum_traffic": 18,
      "keywords": 2,
      "top_keyword": "best ai girlfriend"
    },
    {
      "url": "https://heavengirlfriend.com/reviews/kupid-ai-review",
      "sum_traffic": 9,
      "keywords": 2,
      "top_keyword": "kupid ai"
    }
  ]
}
```

### REQ 5: Competitor Overview -- heavengirlfriend.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/organic-competitors?target=heavengirlfriend.com&mode=domain&country=us&date=2026-08-06&limit=10&select=competitor_domain%2Cdomain_rating%2Ckeywords_common%2Ckeywords_competitor%2Ctraffic%2Cvalue`

```json
{
  "request": {
    "label": "REQ5/competitors/heavengirlfriend.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/organic-competitors?target=heavengirlfriend.com&mode=domain&country=us&date=2026-08-06&limit=10&select=competitor_domain%2Cdomain_rating%2Ckeywords_common%2Ckeywords_competitor%2Ctraffic%2Cvalue",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:35.481Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "240",
      "x-api-cache": "miss",
      "x-api-rows": "10"
    },
    "bodySample": {
      "competitors": [
        {
          "competitor_domain": "aigirlfriendmojo.com",
          "domain_rating": 1.7,
          "keywords_common": 2,
          "keywords_competitor": 5,
          "traffic": 4,
          "value": 47
        },
        {
          "competitor_domain": "aixploria.com",
          "domain_rating": 56,
          "keywords_common": 10,
          "keywords_competitor": 1319,
          "traffic": 15141,
          "value": 1416342
        },
        {
          "competitor_domain": "autogpt.net",
          "domain_rating": 68,
          "keywords_common": 1,
          "keywords_competitor": 634,
          "traffic": 7563,
          "value": 639156
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "competitorCount": 10,
  "topCompetitors": [
    {
      "competitor_domain": "aigirlfriendmojo.com",
      "domain_rating": 1.7,
      "keywords_common": 2,
      "traffic": 4
    },
    {
      "competitor_domain": "aixploria.com",
      "domain_rating": 56,
      "keywords_common": 10,
      "traffic": 15141
    },
    {
      "competitor_domain": "autogpt.net",
      "domain_rating": 68,
      "keywords_common": 1,
      "traffic": 7563
    }
  ]
}
```

### REQ 6: All Backlinks -- heavengirlfriend.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/all-backlinks?target=heavengirlfriend.com&mode=domain&aggregation=1_per_domain&history=all_time&limit=10&select=url_from%2Curl_to%2Canchor%2Cdomain_rating_source%2Cis_dofollow%2Cfirst_seen%2Clast_seen%2Cis_lost%2Cis_new`

```json
{
  "request": {
    "label": "REQ6/all-backlinks/heavengirlfriend.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/all-backlinks?target=heavengirlfriend.com&mode=domain&aggregation=1_per_domain&history=all_time&limit=10&select=url_from%2Curl_to%2Canchor%2Cdomain_rating_source%2Cis_dofollow%2Cfirst_seen%2Clast_seen%2Cis_lost%2Cis_new",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:38.361Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "90",
      "x-api-cache": "miss",
      "x-api-rows": "10"
    },
    "bodySample": {
      "backlinks": [
        {
          "url_from": "https://nectar.ai/",
          "url_to": "https://heavengirlfriend.com/reviews/nectar-ai-review",
          "anchor": "testimonial avatar Heaven Girlfriend5",
          "domain_rating_source": 56,
          "is_dofollow": true,
          "first_seen": "2024-04-12T06:58:48Z",
          "last_seen": null,
          "is_lost": false,
          "is_new": true
        },
        {
          "url_from": "https://hornycompanion.com/",
          "url_to": "https://heavengirlfriend.com/best-ai-girlfriend",
          "anchor": "The Best AI Girlfriend",
          "domain_rating_source": 2.4,
          "is_dofollow": true,
          "first_seen": "2024-06-15T10:30:28Z",
          "last_seen": null,
          "is_lost": false,
          "is_new": true
        },
        {
          "url_from": "https://trynectar.ai/es",
          "url_to": "https://heavengirlfriend.com/reviews/nectar-ai-review/",
          "anchor": "testimonial avatar Heaven Girlfriend5",
          "domain_rating_source": 39,
          "is_dofollow": true,
          "first_seen": "2026-07-02T21:36:46Z",
          "last_seen": null,
          "is_lost": false,
          "is_new": true
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "backlinkCount": 10,
  "sampleBacklinks": [
    {
      "url_from": "https://nectar.ai/",
      "anchor": "testimonial avatar Heaven Girlfriend5",
      "domain_rating_source": 56,
      "is_dofollow": true,
      "is_lost": false,
      "is_new": true
    },
    {
      "url_from": "https://hornycompanion.com/",
      "anchor": "The Best AI Girlfriend",
      "domain_rating_source": 2.4,
      "is_dofollow": true,
      "is_lost": false,
      "is_new": true
    },
    {
      "url_from": "https://trynectar.ai/es",
      "anchor": "testimonial avatar Heaven Girlfriend5",
      "domain_rating_source": 39,
      "is_dofollow": true,
      "is_lost": false,
      "is_new": true
    }
  ]
}
```

### REQ 2: Domain Overview -- hornycompanion.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/domain-rating?target=hornycompanion.com&date=2026-08-06`

```json
{
  "request": {
    "label": "REQ2/domain-rating/hornycompanion.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/domain-rating?target=hornycompanion.com&date=2026-08-06",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:38.694Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "50",
      "x-api-cache": "no_cache",
      "x-api-rows": "1"
    },
    "bodySample": {
      "domain_rating": {
        "domain_rating": 2.4,
        "ahrefs_rank": 41458056
      }
    }
  }
}
```

**Request 2:** `GET https://api.ahrefs.com/v3/site-explorer/metrics?target=hornycompanion.com&mode=domain&date=2026-08-06&country=us`

```json
{
  "request": {
    "label": "REQ2/metrics/hornycompanion.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/metrics?target=hornycompanion.com&mode=domain&date=2026-08-06&country=us",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:38.694Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "0",
      "x-api-cache": "hit",
      "x-api-rows": "1"
    },
    "bodySample": {
      "metrics": {
        "org_keywords": 1,
        "paid_keywords": 0,
        "org_keywords_1_3": 1,
        "org_traffic": 129,
        "org_cost": 6555,
        "paid_traffic": 0,
        "paid_cost": null,
        "paid_pages": 0
      }
    }
  }
}
```

**Request 3:** `GET https://api.ahrefs.com/v3/site-explorer/backlinks-stats?target=hornycompanion.com&mode=domain&date=2026-08-06`

```json
{
  "request": {
    "label": "REQ2/backlinks-stats/hornycompanion.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/backlinks-stats?target=hornycompanion.com&mode=domain&date=2026-08-06",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:38.695Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "0",
      "x-api-cache": "hit",
      "x-api-rows": "1"
    },
    "bodySample": {
      "metrics": {
        "live": 429,
        "all_time": 615,
        "live_refdomains": 398,
        "all_time_refdomains": 542
      }
    }
  }
}
```

**Parsed Result:**
```json
{
  "domain_rating": {
    "domain_rating": 2.4,
    "ahrefs_rank": 41458056
  },
  "ahrefs_rank": "n/a",
  "org_traffic": 129,
  "org_traffic_value": "n/a",
  "org_keywords": 1,
  "backlinks_live": 429,
  "refdomains_live": 398
}
```

### REQ 3: Organic Keywords -- hornycompanion.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/organic-keywords?target=hornycompanion.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=keyword%2Cbest_position%2Cbest_position_prev%2Cbest_position_diff%2Cvolume%2Ckeyword_difficulty%2Csum_traffic%2Cbest_position_url%2Cserp_features&order_by=sum_traffic%3Adesc`

```json
{
  "request": {
    "label": "REQ3/organic-keywords/hornycompanion.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/organic-keywords?target=hornycompanion.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=keyword%2Cbest_position%2Cbest_position_prev%2Cbest_position_diff%2Cvolume%2Ckeyword_difficulty%2Csum_traffic%2Cbest_position_url%2Cserp_features&order_by=sum_traffic%3Adesc",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:39.012Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "50",
      "x-api-cache": "miss",
      "x-api-rows": "1"
    },
    "bodySample": {
      "keywords": [
        {
          "keyword": "hornycompanion",
          "best_position": 1,
          "best_position_prev": 1,
          "best_position_diff": 0,
          "volume": 100,
          "keyword_difficulty": 0,
          "sum_traffic": 129,
          "best_position_url": "https://hornycompanion.com/",
          "serp_features": [
            "sitelink",
            "paid_bottom"
          ]
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "keywordCount": 1,
  "sampleKeywords": [
    {
      "keyword": "hornycompanion",
      "best_position": 1,
      "volume": 100,
      "kd": 0,
      "sum_traffic": 129
    }
  ]
}
```

### REQ 4: Top Pages -- hornycompanion.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/top-pages?target=hornycompanion.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=url%2Csum_traffic%2Ctraffic_diff%2Ckeywords%2Ctop_keyword%2Cvalue`

```json
{
  "request": {
    "label": "REQ4/top-pages/hornycompanion.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/top-pages?target=hornycompanion.com&mode=domain&country=us&date=2026-08-06&date_compared=2026-07-30&limit=10&select=url%2Csum_traffic%2Ctraffic_diff%2Ckeywords%2Ctop_keyword%2Cvalue",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:39.853Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "50",
      "x-api-cache": "miss",
      "x-api-rows": "1"
    },
    "bodySample": {
      "pages": [
        {
          "url": "https://hornycompanion.com/",
          "sum_traffic": 129,
          "traffic_diff": 0,
          "keywords": 1,
          "top_keyword": "hornycompanion",
          "value": 6555
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "pageCount": 1,
  "samplePages": [
    {
      "url": "https://hornycompanion.com/",
      "sum_traffic": 129,
      "keywords": 1,
      "top_keyword": "hornycompanion"
    }
  ]
}
```

### REQ 5: Competitor Overview -- hornycompanion.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/organic-competitors?target=hornycompanion.com&mode=domain&country=us&date=2026-08-06&limit=10&select=competitor_domain%2Cdomain_rating%2Ckeywords_common%2Ckeywords_competitor%2Ctraffic%2Cvalue`

```json
{
  "request": {
    "label": "REQ5/competitors/hornycompanion.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/organic-competitors?target=hornycompanion.com&mode=domain&country=us&date=2026-08-06&limit=10&select=competitor_domain%2Cdomain_rating%2Ckeywords_common%2Ckeywords_competitor%2Ctraffic%2Cvalue",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:40.472Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "120",
      "x-api-cache": "miss",
      "x-api-rows": "5"
    },
    "bodySample": {
      "competitors": [
        {
          "competitor_domain": "craveu.ai",
          "domain_rating": 40,
          "keywords_common": 1,
          "keywords_competitor": 1117,
          "traffic": 5219,
          "value": 113040
        },
        {
          "competitor_domain": "heyreal.ai",
          "domain_rating": 32,
          "keywords_common": 1,
          "keywords_competitor": 127,
          "traffic": 1600,
          "value": 117212
        },
        {
          "competitor_domain": "nectar.ai",
          "domain_rating": 56,
          "keywords_common": 1,
          "keywords_competitor": 66,
          "traffic": 7854,
          "value": 918783
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "competitorCount": 5,
  "topCompetitors": [
    {
      "competitor_domain": "craveu.ai",
      "domain_rating": 40,
      "keywords_common": 1,
      "traffic": 5219
    },
    {
      "competitor_domain": "heyreal.ai",
      "domain_rating": 32,
      "keywords_common": 1,
      "traffic": 1600
    },
    {
      "competitor_domain": "nectar.ai",
      "domain_rating": 56,
      "keywords_common": 1,
      "traffic": 7854
    }
  ]
}
```

### REQ 6: All Backlinks -- hornycompanion.com

**Request 1:** `GET https://api.ahrefs.com/v3/site-explorer/all-backlinks?target=hornycompanion.com&mode=domain&aggregation=1_per_domain&history=all_time&limit=10&select=url_from%2Curl_to%2Canchor%2Cdomain_rating_source%2Cis_dofollow%2Cfirst_seen%2Clast_seen%2Cis_lost%2Cis_new`

```json
{
  "request": {
    "label": "REQ6/all-backlinks/hornycompanion.com",
    "method": "GET",
    "url": "https://api.ahrefs.com/v3/site-explorer/all-backlinks?target=hornycompanion.com&mode=domain&aggregation=1_per_domain&history=all_time&limit=10&select=url_from%2Curl_to%2Canchor%2Cdomain_rating_source%2Cis_dofollow%2Cfirst_seen%2Clast_seen%2Cis_lost%2Cis_new",
    "authorization": "Bearer [REDACTED]",
    "timestamp": "2026-08-06T02:18:42.423Z"
  },
  "responseSample": {
    "status": 200,
    "ok": true,
    "headers": {
      "x-api-units-cost-total-actual": "90",
      "x-api-cache": "miss",
      "x-api-rows": "10"
    },
    "bodySample": {
      "backlinks": [
        {
          "url_from": "https://rank-your.site/e/fiverr-actionable-seo-help/",
          "url_to": "https://hornycompanion.com/",
          "anchor": "Boost your site like hornycompanion.com with Fiverr ⏩",
          "domain_rating_source": 72,
          "is_dofollow": false,
          "first_seen": "2025-03-24T17:28:33Z",
          "last_seen": "2026-02-08T05:23:00Z",
          "is_lost": true,
          "is_new": true
        },
        {
          "url_from": "https://fix.itxoft.com/minimizing-backlink-risk-itxoft-10741/",
          "url_to": "https://hornycompanion.com/",
          "anchor": "Need reliability, hornycompanion.com? iTxoft.com’s solutions stand the test of time.",
          "domain_rating_source": 80,
          "is_dofollow": false,
          "first_seen": "2025-02-28T18:39:39Z",
          "last_seen": "2026-02-21T15:51:29Z",
          "is_lost": true,
          "is_new": true
        },
        {
          "url_from": "https://aimarketcap.io/",
          "url_to": "https://hornycompanion.com/",
          "anchor": "Follow",
          "domain_rating_source": 43,
          "is_dofollow": false,
          "first_seen": "2024-10-07T20:48:44Z",
          "last_seen": null,
          "is_lost": false,
          "is_new": true
        }
      ]
    }
  }
}
```

**Parsed Result:**
```json
{
  "backlinkCount": 10,
  "sampleBacklinks": [
    {
      "url_from": "https://rank-your.site/e/fiverr-actionable-seo-help/",
      "anchor": "Boost your site like hornycompanion.com with Fiverr ⏩",
      "domain_rating_source": 72,
      "is_dofollow": false,
      "is_lost": true,
      "is_new": true
    },
    {
      "url_from": "https://fix.itxoft.com/minimizing-backlink-risk-itxoft-10741/",
      "anchor": "Need reliability, hornycompanion.com? iTxoft.com’s solutions stand the test of time.",
      "domain_rating_source": 80,
      "is_dofollow": false,
      "is_lost": true,
      "is_new": true
    },
    {
      "url_from": "https://aimarketcap.io/",
      "anchor": "Follow",
      "domain_rating_source": 43,
      "is_dofollow": false,
      "is_lost": false,
      "is_new": true
    }
  ]
}
```

---

## Snapshots

### red-engage.com
```json
{
  "snapshotId": "snap_red-engage_com_live_1785982714139",
  "domain": "red-engage.com",
  "timestamp": "2026-08-06T02:18:34.139Z",
  "dataSource": "ahrefs-api-v3",
  "domainRating": 0,
  "referringDomains": 421,
  "totalBacklinks": 745,
  "estimatedTraffic": 0,
  "organicKeywords": 3,
  "requirementCoverage": {
    "req1_usage": true,
    "req2_overview": true,
    "req3_keywords": true,
    "req4_topPages": true,
    "req5_competitors": true,
    "req6_backlinks": true
  }
}
```

### heavengirlfriend.com
```json
{
  "snapshotId": "snap_heavengirlfriend_com_live_1785982718692",
  "domain": "heavengirlfriend.com",
  "timestamp": "2026-08-06T02:18:38.692Z",
  "dataSource": "ahrefs-api-v3",
  "domainRating": 0,
  "referringDomains": 531,
  "totalBacklinks": 1011,
  "estimatedTraffic": 318,
  "organicKeywords": 10,
  "requirementCoverage": {
    "req1_usage": true,
    "req2_overview": true,
    "req3_keywords": true,
    "req4_topPages": true,
    "req5_competitors": true,
    "req6_backlinks": true
  }
}
```

### hornycompanion.com
```json
{
  "snapshotId": "snap_hornycompanion_com_live_1785982723044",
  "domain": "hornycompanion.com",
  "timestamp": "2026-08-06T02:18:43.044Z",
  "dataSource": "ahrefs-api-v3",
  "domainRating": 0,
  "referringDomains": 398,
  "totalBacklinks": 429,
  "estimatedTraffic": 129,
  "organicKeywords": 1,
  "requirementCoverage": {
    "req1_usage": true,
    "req2_overview": true,
    "req3_keywords": true,
    "req4_topPages": true,
    "req5_competitors": true,
    "req6_backlinks": true
  }
}
```

---

## Snapshot Comparisons

### red-engage.com
```json
{
  "domain": "red-engage.com",
  "trendDirection": "NEW",
  "previousTimestamp": null,
  "drChange": 0,
  "trafficChange": 0,
  "kwChange": 0,
  "refdomsChange": 0,
  "backlinksChange": 0
}
```

### heavengirlfriend.com
```json
{
  "domain": "heavengirlfriend.com",
  "trendDirection": "NEW",
  "previousTimestamp": null,
  "drChange": 0,
  "trafficChange": 0,
  "kwChange": 0,
  "refdomsChange": 0,
  "backlinksChange": 0
}
```

### hornycompanion.com
```json
{
  "domain": "hornycompanion.com",
  "trendDirection": "NEW",
  "previousTimestamp": null,
  "drChange": 0,
  "trafficChange": 0,
  "kwChange": 0,
  "refdomsChange": 0,
  "backlinksChange": 0
}
```

---

## Acceptance Criteria

- [x] Live branches for reqs 1-6 executed
- [x] MOCK_API_FALLBACK=false enforced
- [x] Sanitized request URL per endpoint
- [x] HTTP status & cost headers captured
- [x] Snapshots tagged dataSource: ahrefs-api-v3
- [x] Snapshot comparison produced
- [x] Markdown + JSON report generated