/**
 * Phase 2: Google Apps Script Backend — Ahrefs Ingestion Engine & REST API
 * Titan Workspace / Ahrefs API v3 Automated Reporting Engine
 * Fully Compliant with Pedro Gomes Specifications
 */

// Global Config & Property Keys
var SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

/**
 * Utility to initialize or update Script Properties.
 * Run this function once in Apps Script Editor to set your API Key & configurations.
 */
function setupScriptProperties() {
  SCRIPT_PROPERTIES.setProperties({
    "AHREFS_API_KEY": "teokh6Tg1kJUbVJ_1Bs0ZsmbWDMSeONatsf_iXN1",
    "PRIMARY_DOMAIN": "titantreasure.com",
    "TARGET_COUNTRY": "us",
    "USAGE_SAFETY_CAP_PERCENT": "80",
    "COMPETITOR_1": "chumbacasino.com",
    "COMPETITOR_2": "pulsz.com",
    "COMPETITOR_3": "luckylandslots.com"
  });
  Logger.log("✅ Script properties configured successfully!");
}

/**
 * Ahrefs API v3 Fetcher Helper with Header Unit Logging & Safety Safeguard
 */
function callAhrefsApi(endpoint, queryParams) {
  var apiKey = SCRIPT_PROPERTIES.getProperty("AHREFS_API_KEY");
  if (!apiKey) {
    throw new Error("AHREFS_API_KEY is not set in Script Properties.");
  }

  var baseUrl = "https://api.ahrefs.com/v3" + endpoint;
  var queryString = "";
  if (queryParams && Object.keys(queryParams).length > 0) {
    var parts = [];
    for (var key in queryParams) {
      if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== "") {
        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(queryParams[key]));
      }
    }
    queryString = "?" + parts.join("&");
  }

  var url = baseUrl + queryString;
  var options = {
    "method": "get",
    "headers": {
      "Authorization": "Bearer " + apiKey,
      "Accept": "application/json"
    },
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(url, options);
  var statusCode = response.getResponseCode();
  var headers = response.getAllHeaders();
  
  // Extract Ahrefs Header Unit Costs
  var unitsCost = headers["x-api-units-cost-total"] || headers["X-Api-Units-Cost-Total"] || 0;
  var rowsCount = headers["x-api-rows"] || headers["X-Api-Rows"] || 0;

  // Log API Usage Header Metadata
  logApiUsage(endpoint, parseInt(unitsCost, 10), parseInt(rowsCount, 10), statusCode === 200 ? "SUCCESS" : "ERROR (" + statusCode + ")");

  if (statusCode !== 200) {
    Logger.log("API Response Error on " + endpoint + " (" + statusCode + "): " + response.getContentText());
    return null;
  }

  return JSON.parse(response.getContentText());
}

/**
 * Logs API unit usage to the `api_usage_logs` tab
 */
function logApiUsage(endpoint, unitsCost, rowsCount, status) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("api_usage_logs");
    if (!sheet) return;

    var timestamp = new Date().toISOString();
    var monthlyUsed = unitsCost;
    var monthlyLimit = 400000; // Standard plan allowance
    var usagePercent = ((monthlyUsed / monthlyLimit) * 100).toFixed(2);

    sheet.appendRow([
      timestamp,
      endpoint,
      unitsCost,
      rowsCount,
      monthlyUsed,
      monthlyLimit,
      usagePercent + "%",
      status
    ]);
  } catch (e) {
    Logger.log("Failed to log API usage: " + e.toString());
  }
}

/**
 * MAIN INGESTION FUNCTION
 * Executed weekly or on demand to poll Ahrefs v3 and append snapshots to Google Sheets.
 */
function runAhrefsIngestion() {
  var startTime = new Date();
  var runId = "RUN_" + startTime.getTime();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var now = new Date();
  var todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  
  // Calculate date 7 days ago for weekly comparison
  var date7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  var comparedDateStr = date7DaysAgo.toISOString().split("T")[0];

  var primaryDomain = SCRIPT_PROPERTIES.getProperty("PRIMARY_DOMAIN") || "titantreasure.com";
  var country = SCRIPT_PROPERTIES.getProperty("TARGET_COUNTRY") || "us";
  var unitsConsumedTotal = 0;

  Logger.log("🚀 Starting Ahrefs Ingestion Run: " + runId + " for domain: " + primaryDomain + " (Date: " + todayStr + ", Compare: " + comparedDateStr + ")");

  try {
    // 1. Subscription & Usage Safety Check (GET /subscription-info/limits-and-usage - 0 units cost)
    var limitsData = callAhrefsApi("/subscription-info/limits-and-usage", {});
    if (limitsData && limitsData.limits_and_usage) {
      var used = limitsData.limits_and_usage.units_usage_workspace || 0;
      var limit = limitsData.limits_and_usage.units_limit_workspace || 400000;
      var percentUsed = (used / limit) * 100;
      var cap = parseFloat(SCRIPT_PROPERTIES.getProperty("USAGE_SAFETY_CAP_PERCENT") || "80");

      if (percentUsed >= cap) {
        throw new Error("🚨 Safety Stop: Monthly Ahrefs API usage is at " + percentUsed.toFixed(1) + "%, exceeding safety cap of " + cap + "%.");
      }
      Logger.log("ℹ️ Ahrefs Plan: " + limitsData.limits_and_usage.subscription + " | Units Used: " + used + " / " + limit + " (" + percentUsed.toFixed(1) + "%)");
    }

    // 2. Domain Overview & DR Metrics
    var drData = callAhrefsApi("/site-explorer/domain-rating", { "target": primaryDomain, "date": todayStr });
    var metricsData = callAhrefsApi("/site-explorer/metrics", { "target": primaryDomain, "date": todayStr, "mode": "subdomains" });
    var backlinksStats = callAhrefsApi("/site-explorer/backlinks-stats", { "target": primaryDomain, "date": todayStr, "mode": "subdomains" });

    var dr = drData && drData.domain_rating ? drData.domain_rating.domain_rating : 0;
    var rank = drData && drData.domain_rating ? drData.domain_rating.ahrefs_rank : 0;
    var traffic = metricsData && metricsData.metrics ? (metricsData.metrics.org_traffic || metricsData.metrics.organic_traffic || 0) : 0;
    var keywordsCount = metricsData && metricsData.metrics ? (metricsData.metrics.org_keywords || metricsData.metrics.organic_keywords || 0) : 0;
    var organicCost = metricsData && metricsData.metrics ? (metricsData.metrics.org_cost || metricsData.metrics.organic_cost || 0) : 0;
    var totalBacklinks = backlinksStats && backlinksStats.metrics ? backlinksStats.metrics.live : 0;
    var refDomains = backlinksStats && backlinksStats.metrics ? backlinksStats.metrics.live_refdomains : 0;
    var dofollowBacklinks = backlinksStats && backlinksStats.metrics ? backlinksStats.metrics.live : 0;

    var domainSheet = ss.getSheetByName("domain_snapshots");
    domainSheet.appendRow([
      todayStr, primaryDomain, dr, rank, traffic, keywordsCount, organicCost,
      totalBacklinks, refDomains, dofollowBacklinks, new Date().toISOString()
    ]);
    Logger.log("✅ Appended domain overview metrics for " + primaryDomain + " (DR: " + dr + ", Traffic: " + traffic + ")");

    // 3. Top Organic Keywords & Striking Distance Opportunities (Positions 4-20)
    // Uses date_compared=7 days ago to calculate weekly position movement
    var kwData = callAhrefsApi("/site-explorer/organic-keywords", {
      "target": primaryDomain,
      "mode": "subdomains",
      "country": country,
      "date": todayStr,
      "date_compared": comparedDateStr,
      "select": "keyword,best_position,volume,keyword_difficulty,best_position_url,sum_traffic",
      "limit": 100,
      "order_by": "sum_traffic:desc"
    });

    var kwSheet = ss.getSheetByName("keyword_snapshots");
    var kwCount = 0;
    if (kwData && kwData.keywords) {
      kwCount = kwData.keywords.length;
      kwData.keywords.forEach(function(item) {
        var pos = item.best_position || 0;
        var prevPos = item.prev_best_position || pos;
        var delta = prevPos - pos;
        var strikingDistance = (pos >= 4 && pos <= 20) ? "YES" : "NO";

        kwSheet.appendRow([
          todayStr, primaryDomain, item.keyword, country, pos, prevPos,
          delta, item.volume || 0, item.keyword_difficulty || 0, item.best_position_url || "",
          item.sum_traffic || 0, strikingDistance, new Date().toISOString()
        ]);
      });
    }
    Logger.log("✅ Appended " + kwCount + " keywords to keyword_snapshots");

    // 4. Top Pages Performance (GET /site-explorer/top-pages)
    var pageData = callAhrefsApi("/site-explorer/top-pages", {
      "target": primaryDomain,
      "mode": "subdomains",
      "country": country,
      "date": todayStr,
      "select": "url,top_keyword,sum_traffic,keywords",
      "limit": 50
    });

    var pageSheet = ss.getSheetByName("page_snapshots");
    var pageCount = 0;
    if (pageData && pageData.pages) {
      pageCount = pageData.pages.length;
      pageData.pages.forEach(function(p) {
        var pageTraffic = p.sum_traffic || 0;
        var trafficShare = traffic > 0 ? (pageTraffic / traffic).toFixed(4) : 0;
        pageSheet.appendRow([
          todayStr, primaryDomain, p.url, p.top_keyword || "",
          pageTraffic, p.keywords || 0, trafficShare,
          new Date().toISOString()
        ]);
      });
    }
    Logger.log("✅ Appended " + pageCount + " pages to page_snapshots");

    // 5. Dynamic & Configured Competitor Gap Matrix (GET /site-explorer/organic-competitors)
    var compData = callAhrefsApi("/site-explorer/organic-competitors", {
      "target": primaryDomain,
      "mode": "subdomains",
      "country": country,
      "date": todayStr,
      "select": "competitor_domain,keywords_common,keywords_competitor,traffic,domain_rating",
      "limit": 5
    });

    var compSheet = ss.getSheetByName("competitor_snapshots");
    var competitorsFound = 0;
    if (compData && compData.competitors) {
      competitorsFound = compData.competitors.length;
      compData.competitors.forEach(function(c) {
        compSheet.appendRow([
          todayStr, primaryDomain, c.competitor_domain, c.keywords_common || 0,
          c.keywords_competitor || 0, c.traffic || 0,
          c.domain_rating || 0, new Date().toISOString()
        ]);
      });
    }
    Logger.log("✅ Appended " + competitorsFound + " competitors to competitor_snapshots");

    // 6. Backlinks & Referring Domains (GET /site-explorer/refdomains)
    var refData = callAhrefsApi("/site-explorer/refdomains", {
      "target": primaryDomain,
      "mode": "subdomains",
      "date": todayStr,
      "select": "domain,domain_rating,dofollow_links,links_to_target,first_seen",
      "limit": 50
    });

    var backlinkSheet = ss.getSheetByName("backlink_snapshots");
    var refCount = 0;
    if (refData && refData.refdomains) {
      refCount = refData.refdomains.length;
      refData.refdomains.forEach(function(r) {
        backlinkSheet.appendRow([
          todayStr, primaryDomain, r.domain, r.domain_rating || 0,
          r.dofollow_links || 0, r.links_to_target || 0, r.first_seen || "",
          "ACTIVE", new Date().toISOString()
        ]);
      });
    }
    Logger.log("✅ Appended " + refCount + " referring domains to backlink_snapshots");

    // Record Execution Run Summary
    var endTime = new Date();
    var durationSec = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    var runSheet = ss.getSheetByName("report_runs");
    runSheet.appendRow([
      runId, endTime.toISOString(), "SUCCESS", durationSec, primaryDomain,
      competitorsFound, unitsConsumedTotal, ""
    ]);

    Logger.log("🎉 Ahrefs Ingestion completed successfully in " + durationSec + "s!");
  } catch (err) {
    var errTime = new Date();
    var durationErrSec = Math.round((errTime.getTime() - startTime.getTime()) / 1000);
    var runSheetErr = ss.getSheetByName("report_runs");
    if (runSheetErr) {
      runSheetErr.appendRow([
        runId, errTime.toISOString(), "FAILED", durationErrSec, primaryDomain,
        0, unitsConsumedTotal, err.toString()
      ]);
    }
    Logger.log("❌ Ingestion Run Failed: " + err.toString());
  }
}

/**
 * REST API ENDPOINT FOR NEXT.JS FRONTEND DASHBOARD (doGet)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    function getSheetObjects(sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return [];
      var headers = data[0];
      var rows = [];
      for (var i = 1; i < data.length; i++) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = data[i][j];
        }
        rows.push(obj);
      }
      return rows;
    }

    var domainSnapshots = getSheetObjects("domain_snapshots");
    var keywordSnapshots = getSheetObjects("keyword_snapshots");
    var pageSnapshots = getSheetObjects("page_snapshots");
    var competitorSnapshots = getSheetObjects("competitor_snapshots");
    var backlinkSnapshots = getSheetObjects("backlink_snapshots");
    var apiLogs = getSheetObjects("api_usage_logs");
    var reportRuns = getSheetObjects("report_runs");

    var latestDomain = domainSnapshots.length > 0 ? domainSnapshots[domainSnapshots.length - 1] : null;
    var prevDomain = domainSnapshots.length > 1 ? domainSnapshots[domainSnapshots.length - 2] : null;

    var strikingDistanceKw = keywordSnapshots.filter(function(k) {
      return k.striking_distance === "YES" || (k.position >= 4 && k.position <= 20);
    });

    var tier1_3 = keywordSnapshots.filter(function(k) { return k.position >= 1 && k.position <= 3; }).length;
    var tier4_10 = keywordSnapshots.filter(function(k) { return k.position >= 4 && k.position <= 10; }).length;
    var tier11_20 = keywordSnapshots.filter(function(k) { return k.position >= 11 && k.position <= 20; }).length;
    var tier21_50 = keywordSnapshots.filter(function(k) { return k.position >= 21 && k.position <= 50; }).length;

    var latestApiLog = apiLogs.length > 0 ? apiLogs[apiLogs.length - 1] : null;

    var responsePayload = {
      "status": "success",
      "timestamp": new Date().toISOString(),
      "primary_domain": SCRIPT_PROPERTIES.getProperty("PRIMARY_DOMAIN") || "titantreasure.com",
      "summary": {
        "domain_rating": latestDomain ? latestDomain.domain_rating : 0,
        "ahrefs_rank": latestDomain ? latestDomain.ahrefs_rank : 0,
        "organic_traffic": latestDomain ? latestDomain.organic_traffic : 0,
        "organic_traffic_prev": prevDomain ? prevDomain.organic_traffic : 0,
        "traffic_delta_percent": (prevDomain && prevDomain.organic_traffic > 0) 
          ? (((latestDomain.organic_traffic - prevDomain.organic_traffic) / prevDomain.organic_traffic) * 100).toFixed(2)
          : 0,
        "organic_keywords": latestDomain ? latestDomain.organic_keywords : 0,
        "organic_cost": latestDomain ? latestDomain.organic_cost : 0,
        "total_backlinks": latestDomain ? latestDomain.total_backlinks : 0,
        "ref_domains": latestDomain ? latestDomain.ref_domains : 0,
        "dofollow_backlinks": latestDomain ? latestDomain.dofollow_backlinks : 0,
        "striking_distance_count": strikingDistanceKw.length
      },
      "keyword_tiers": {
        "top1_3": tier1_3,
        "top4_10": tier4_10,
        "top11_20": tier11_20,
        "top21_50": tier21_50
      },
      "keywords": keywordSnapshots.slice(-100),
      "striking_distance": strikingDistanceKw.slice(-30),
      "pages": pageSnapshots.slice(-50),
      "competitors": competitorSnapshots.slice(-10),
      "backlinks": backlinkSnapshots.slice(-50),
      "api_usage": {
        "monthly_used": latestApiLog ? latestApiLog.monthly_used : 0,
        "monthly_limit": latestApiLog ? latestApiLog.monthly_limit : 400000,
        "usage_percent": latestApiLog ? latestApiLog.usage_percent : "0%"
      },
      "latest_run": reportRuns.length > 0 ? reportRuns[reportRuns.length - 1] : null
    };

    return ContentService
      .createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        "status": "error",
        "message": err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
