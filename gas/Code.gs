/**
 * Phase 2: Google Apps Script Backend — Ahrefs Ingestion Engine & REST API
 * Titan Workspace / Ahrefs API v3 Automated Reporting Engine
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
    "USAGE_SAFETY_CAP_PERCENT": "80"
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
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
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

  // Log API Usage
  logApiUsage(endpoint, parseInt(unitsCost, 10), parseInt(rowsCount, 10), statusCode === 200 ? "SUCCESS" : "ERROR (" + statusCode + ")");

  if (statusCode !== 200) {
    Logger.log("API Error on " + endpoint + ": " + response.getContentText());
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
    var monthlyLimit = 100000;
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
  var todayStr = startTime.toISOString().split("T")[0]; // YYYY-MM-DD
  var primaryDomain = SCRIPT_PROPERTIES.getProperty("PRIMARY_DOMAIN") || "titantreasure.com";
  var country = SCRIPT_PROPERTIES.getProperty("TARGET_COUNTRY") || "us";
  var unitsConsumedTotal = 0;

  Logger.log("🚀 Starting Ahrefs Ingestion Run: " + runId + " for domain: " + primaryDomain + " on date: " + todayStr);

  try {
    // 1. Subscription & Usage Safety Check
    var limitsData = callAhrefsApi("/subscription-info/limits-and-usage", {});
    if (limitsData && limitsData.limits) {
      var used = limitsData.limits.api_units_used || 0;
      var limit = limitsData.limits.api_units_limit || 100000;
      var percentUsed = (used / limit) * 100;
      var cap = parseFloat(SCRIPT_PROPERTIES.getProperty("USAGE_SAFETY_CAP_PERCENT") || "80");

      if (percentUsed >= cap) {
        throw new Error("🚨 Safety Stop: Monthly Ahrefs API usage is at " + percentUsed.toFixed(1) + "%, exceeding safety cap of " + cap + "%.");
      }
    }

    // 2. Domain Overview & DR Metrics (Date is required by Ahrefs v3)
    var drData = callAhrefsApi("/site-explorer/domain-rating", { "target": primaryDomain, "date": todayStr });
    var metricsData = callAhrefsApi("/site-explorer/metrics", { "target": primaryDomain, "country": country, "date": todayStr });
    var backlinksStats = callAhrefsApi("/site-explorer/backlinks-stats", { "target": primaryDomain, "date": todayStr });

    var dr = drData && drData.domain_rating ? drData.domain_rating.domain_rating : 0;
    var rank = drData && drData.domain_rating ? drData.domain_rating.ahrefs_rank : 0;
    var traffic = metricsData && metricsData.metrics ? metricsData.metrics.organic_traffic : 0;
    var keywordsCount = metricsData && metricsData.metrics ? metricsData.metrics.organic_keywords : 0;
    var organicCost = metricsData && metricsData.metrics ? metricsData.metrics.organic_cost : 0;
    var totalBacklinks = backlinksStats && backlinksStats.metrics ? backlinksStats.metrics.live : 0;
    var refDomains = backlinksStats && backlinksStats.metrics ? backlinksStats.metrics.refdomains : 0;
    var dofollowBacklinks = backlinksStats && backlinksStats.metrics ? backlinksStats.metrics.dofollow : 0;

    var domainSheet = ss.getSheetByName("domain_snapshots");
    domainSheet.appendRow([
      todayStr, primaryDomain, dr, rank, traffic, keywordsCount, organicCost,
      totalBacklinks, refDomains, dofollowBacklinks, new Date().toISOString()
    ]);

    // 3. Top Organic Keywords & Striking Distance Opportunities (Positions 4-20)
    var kwData = callAhrefsApi("/site-explorer/organic-keywords", {
      "target": primaryDomain,
      "country": country,
      "date": todayStr,
      "select": "keyword,position,previous_position,volume,difficulty,url,traffic",
      "limit": 100,
      "order_by": "traffic:desc"
    });

    var kwSheet = ss.getSheetByName("keyword_snapshots");
    if (kwData && kwData.keywords) {
      kwData.keywords.forEach(function(item) {
        var pos = item.position || 0;
        var prevPos = item.previous_position || pos;
        var delta = prevPos - pos; // positive means improved
        var strikingDistance = (pos >= 4 && pos <= 20) ? "YES" : "NO";

        kwSheet.appendRow([
          todayStr, primaryDomain, item.keyword, country, pos, prevPos,
          delta, item.volume || 0, item.difficulty || 0, item.url || "",
          item.traffic || 0, strikingDistance, new Date().toISOString()
        ]);
      });
    }

    // 4. Top Pages Performance
    var pageData = callAhrefsApi("/site-explorer/top-pages", {
      "target": primaryDomain,
      "country": country,
      "date": todayStr,
      "select": "url,top_keyword,traffic,keywords,traffic_share",
      "limit": 50
    });

    var pageSheet = ss.getSheetByName("page_snapshots");
    if (pageData && pageData.pages) {
      pageData.pages.forEach(function(p) {
        pageSheet.appendRow([
          todayStr, primaryDomain, p.url, p.top_keyword || "",
          p.traffic || 0, p.keywords || 0, (p.traffic_share || 0).toFixed(4),
          new Date().toISOString()
        ]);
      });
    }

    // 5. Dynamic Competitor Gap Matrix (Auto-discovers top 3 competitors)
    var compData = callAhrefsApi("/site-explorer/organic-competitors", {
      "target": primaryDomain,
      "country": country,
      "date": todayStr,
      "select": "competitor,overlap_keywords,competitor_keywords,competitor_traffic,domain_rating",
      "limit": 3
    });

    var compSheet = ss.getSheetByName("competitor_snapshots");
    var competitorsFound = 0;
    if (compData && compData.competitors) {
      competitorsFound = compData.competitors.length;
      compData.competitors.forEach(function(c) {
        compSheet.appendRow([
          todayStr, primaryDomain, c.competitor, c.overlap_keywords || 0,
          c.competitor_keywords || 0, c.competitor_traffic || 0,
          c.domain_rating || 0, new Date().toISOString()
        ]);
      });
    }

    // 6. Backlinks & Ref Domains Overview (select parameter required)
    var refData = callAhrefsApi("/site-explorer/refdomains", {
      "target": primaryDomain,
      "date": todayStr,
      "select": "domain,domain_rating,dofollow_links,total_links,first_seen",
      "limit": 50
    });

    var backlinkSheet = ss.getSheetByName("backlink_snapshots");
    if (refData && refData.refdomains) {
      refData.refdomains.forEach(function(r) {
        backlinkSheet.appendRow([
          todayStr, primaryDomain, r.domain || r.refdomain, r.domain_rating || 0,
          r.dofollow_links || 0, r.total_links || 0, r.first_seen || "",
          "ACTIVE", new Date().toISOString()
        ]);
      });
    }

    // Record Execution Run Summary
    var endTime = new Date();
    var durationSec = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    var runSheet = ss.getSheetByName("report_runs");
    runSheet.appendRow([
      runId, endTime.toISOString(), "SUCCESS", durationSec, primaryDomain,
      competitorsFound, unitsConsumedTotal, ""
    ]);

    Logger.log("✅ Ahrefs Ingestion completed successfully in " + durationSec + "s!");
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
 * Returns full JSON representation of the latest dataset from Google Sheets.
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
        "monthly_limit": latestApiLog ? latestApiLog.monthly_limit : 100000,
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
