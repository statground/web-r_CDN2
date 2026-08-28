(function installWebRHomeSummaryTerminalGuard202608282306(window, document) {
  "use strict";

  if (window.__webrHomeSummaryTerminalGuard202608282306Installed) {
    return;
  }
  window.__webrHomeSummaryTerminalGuard202608282306Installed = true;

  var summaryEndpointPath = "/homepage/content-summary/";
  var summaryCacheKey = "webr.home.public-summary.v1";
  var summaryCacheSchema = 1;
  var summaryCacheTTL = 6 * 60 * 60 * 1000;
  var summaryCacheMaxBytes = 96 * 1024;
  var summarySectionKeys = [
    "rcommunity",
    "community",
    "books",
    "packages",
    "ecosystem",
    "workshops",
    "notices",
    "lectures",
    "youtube",
    "activity"
  ];
  var summaryItemKeys = ["kind", "title", "summary", "published_at", "href", "image"];
  var placeholderSettleDelay = 2500;
  var noticeVisibleCharacterLimit = 28;
  var settleTimer = 0;
  var noticeObserver = null;
  var cachedSummary = readCachedSummary();
  var servedCachedSummary = false;
  var completeLiveSummarySeen = false;
  var originalFetch = null;
  var wrappedFetch = null;
  var categoryFallbacks = {
    rcommunity: { label: "R Community", href: "/community/r-community/" },
    community: { label: "커뮤니티", href: "/community/" },
    books: { label: "도서", href: "/book/" },
    packages: { label: "R 패키지", href: "/r-ecosystem/packages/" },
    ecosystem: { label: "R 에코시스템", href: "/r-ecosystem/" },
    workshops: { label: "워크샵", href: "/workshop/" }
  };

  function cleanBoundedText(value, limit) {
    var text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return text.slice(0, limit);
  }

  function normalizeSummaryItem(item) {
    if (!item || typeof item !== "object") {
      return null;
    }
    var title = cleanBoundedText(item.title, 200);
    if (!title) {
      return null;
    }
    var normalized = { title: title, is_new: item.is_new === true };
    summaryItemKeys.forEach(function copyAllowedItemField(key) {
      if (key === "title") {
        return;
      }
      var limit = key === "summary" ? 1000 : 2048;
      var value = cleanBoundedText(item[key], limit);
      if (value) {
        normalized[key] = value;
      }
    });
    return normalized;
  }

  function normalizeUsableStatistics(statistics) {
    if (!statistics || typeof statistics !== "object") {
      return null;
    }
    var member = Number(statistics.cnt_member);
    var visitor = Number(statistics.cnt_visitor);
    var pageview = Number(statistics.cnt_pageview);
    var trafficStatus = cleanBoundedText(statistics.traffic_status, 32).toLowerCase();
    if (
      !Number.isFinite(member) ||
      !Number.isFinite(visitor) ||
      !Number.isFinite(pageview) ||
      member <= 0
    ) {
      return null;
    }

    var normalized = {
      cnt_member: Math.floor(member),
      cnt_visitor: Math.floor(visitor),
      cnt_pageview: Math.floor(pageview)
    };

    if (!trafficStatus || trafficStatus === "available") {
      if (visitor < 0 || pageview < 0) {
        return null;
      }
      if (trafficStatus) {
        normalized.traffic_status = trafficStatus;
      }
    } else if (trafficStatus === "stale" || trafficStatus === "unavailable") {
      var hasLastKnownVisitor =
        statistics.last_known_visitor !== undefined &&
        statistics.last_known_visitor !== null &&
        statistics.last_known_visitor !== "";
      var hasLastKnownPageview =
        statistics.last_known_pageview !== undefined &&
        statistics.last_known_pageview !== null &&
        statistics.last_known_pageview !== "";
      var lastKnownVisitor = Number(statistics.last_known_visitor);
      var lastKnownPageview = Number(statistics.last_known_pageview);
      if (
        visitor !== -1 ||
        pageview !== -1 ||
        !hasLastKnownVisitor ||
        !hasLastKnownPageview ||
        !Number.isFinite(lastKnownVisitor) ||
        !Number.isFinite(lastKnownPageview) ||
        lastKnownVisitor < 0 ||
        lastKnownPageview < 0
      ) {
        return null;
      }
      normalized.traffic_status = trafficStatus;
      normalized.last_known_visitor = Math.floor(lastKnownVisitor);
      normalized.last_known_pageview = Math.floor(lastKnownPageview);
    } else {
      return null;
    }

    ["last_successful_at", "traffic_date", "traffic_generation"].forEach(
      function copyTrafficMetadata(key) {
        var value = cleanBoundedText(statistics[key], 160);
        if (value) {
          normalized[key] = value;
        }
      }
    );
    return normalized;
  }

  function normalizeSummary(payload, requireComplete) {
    var statistics = payload && normalizeUsableStatistics(payload.statistics);
    if (
      !payload ||
      payload.ok !== true ||
      !payload.sections ||
      typeof payload.sections !== "object" ||
      !payload.statistics ||
      typeof payload.statistics !== "object" ||
      (requireComplete && (payload.complete !== true || !statistics))
    ) {
      return null;
    }
    var normalized = {
      ok: true,
      complete: payload.complete === true && !!statistics,
      statistics: statistics || {
        cnt_member: -1,
        cnt_visitor: -1,
        cnt_pageview: -1
      },
      sections: {}
    };
    for (var sectionIndex = 0; sectionIndex < summarySectionKeys.length; sectionIndex += 1) {
      var sectionKey = summarySectionKeys[sectionIndex];
      if (!Array.isArray(payload.sections[sectionKey])) {
        return null;
      }
      normalized.sections[sectionKey] = payload.sections[sectionKey]
        .slice(0, 6)
        .map(normalizeSummaryItem)
        .filter(Boolean);
    }
    return normalized;
  }

  function readCachedSummary() {
    try {
      var raw = window.localStorage.getItem(summaryCacheKey);
      if (!raw || raw.length > summaryCacheMaxBytes) {
        return null;
      }
      var entry = JSON.parse(raw);
      var now = Date.now();
      if (
        !entry ||
        entry.schema !== summaryCacheSchema ||
        !Number.isFinite(entry.stored_at) ||
        entry.stored_at > now + 5 * 60 * 1000 ||
        now - entry.stored_at > summaryCacheTTL
      ) {
        window.localStorage.removeItem(summaryCacheKey);
        return null;
      }
      var normalized = normalizeSummary(entry.payload, true);
      if (!normalized) {
        window.localStorage.removeItem(summaryCacheKey);
        return null;
      }
      return normalized;
    } catch (error) {
      return null;
    }
  }

  function writeCachedSummary(payload) {
    var normalized = normalizeSummary(payload, true);
    if (!normalized) {
      return;
    }
    try {
      var raw = JSON.stringify({
        schema: summaryCacheSchema,
        stored_at: Date.now(),
        payload: normalized
      });
      if (raw.length <= summaryCacheMaxBytes) {
        window.localStorage.setItem(summaryCacheKey, raw);
        cachedSummary = normalized;
      }
    } catch (error) {
      // Storage is an optional continuity aid. A blocked or full store must not
      // stop the public homepage.
    }
  }

  function mergeWithCachedSummary(livePayload) {
    var liveStatistics = normalizeUsableStatistics(livePayload && livePayload.statistics);
    var live = normalizeSummary(livePayload, false);
    if (!live || !cachedSummary || live.complete === true) {
      return live;
    }
    summarySectionKeys.forEach(function retainLastGoodSection(key) {
      if (!live.sections[key].length && cachedSummary.sections[key].length) {
        live.sections[key] = cachedSummary.sections[key];
      }
    });
    if (!liveStatistics) {
      live.statistics = cachedSummary.statistics;
    }
    return live;
  }

  function isSummaryRequest(input, init) {
    try {
      var requestURL = new URL(
        input && typeof input === "object" && input.url ? input.url : String(input),
        window.location.origin
      );
      var method = cleanBoundedText(
        init && init.method
          ? init.method
          : input && typeof input === "object" && input.method
            ? input.method
            : "GET",
        16
      ).toUpperCase();
      return (
        requestURL.origin === window.location.origin &&
        requestURL.pathname === summaryEndpointPath &&
        method === "GET"
      );
    } catch (error) {
      return false;
    }
  }

  function cachedSummaryResponse() {
    var preview = normalizeSummary(cachedSummary, true);
    preview.complete = false;
    servedCachedSummary = true;
    return {
      ok: true,
      status: 200,
      json: function cachedSummaryJSON() {
        return Promise.resolve(preview).then(function markCachedSummaryVisible(payload) {
          window.setTimeout(markCachedPresentation, 0);
          return payload;
        });
      }
    };
  }

  function wrappedSummaryResponse(response) {
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      json: function normalizedSummaryJSON() {
        return response.json().then(function inspectPublicSummary(payload) {
          var normalized = mergeWithCachedSummary(payload);
          if (!normalized) {
            return payload;
          }
          if (normalized.complete === true) {
            completeLiveSummarySeen = true;
            writeCachedSummary(normalized);
          }
          return normalized;
        });
      }
    };
  }

  function installSummaryFetchCache() {
    if (wrappedFetch || typeof window.fetch !== "function") {
      return;
    }
    originalFetch = window.fetch.bind(window);
    wrappedFetch = function fetchWithPublicSummaryCache(input, init) {
      if (!isSummaryRequest(input, init)) {
        return originalFetch(input, init);
      }
      if (cachedSummary && !servedCachedSummary) {
        return Promise.resolve(cachedSummaryResponse());
      }
      return originalFetch(input, init).then(wrappedSummaryResponse);
    };
    window.fetch = wrappedFetch;
  }

  function restoreOriginalFetch() {
    if (originalFetch && window.fetch === wrappedFetch) {
      window.fetch = originalFetch;
    }
  }

  function fallbackLink(href, text) {
    var anchor = document.createElement("a");
    anchor.className = "webr-home-compact__empty";
    anchor.href = href;
    anchor.textContent = text;
    return anchor;
  }

  function replaceCategorySkeleton(card) {
    if (!card || !card.querySelector(".webr-home-compact__skeleton")) {
      return;
    }
    var body = card.querySelector(".webr-home-compact__category-body");
    var key = card.dataset.homeCategory || "";
    var fallback = categoryFallbacks[key];
    if (!body || !fallback) {
      return;
    }
    body.replaceChildren(fallbackLink(fallback.href, fallback.label + " 전체 보기"));
  }

  function replaceRailSkeleton(card) {
    if (!card || !card.querySelector(".webr-home-compact__skeleton")) {
      return;
    }
    var body = card.querySelector(".webr-home-compact__rail-body");
    var titleNode = card.querySelector(".webr-home-compact__rail-title");
    var title = titleNode ? titleNode.textContent.replace(/\s+/g, " ").trim() : "";
    if (!body) {
      return;
    }
    if (title === "공지사항") {
      body.replaceChildren(fallbackLink("/intro/notice/", "공지사항 전체 보기"));
      return;
    }
    if (title === "강의 / YouTube") {
      body.replaceChildren(fallbackLink("/workshop/", "강의와 YouTube 전체 보기"));
      return;
    }
    if (title === "지금 Web-R") {
      var message = document.createElement("p");
      message.className = "webr-home-compact__activity-empty";
      message.textContent = "최근 활동을 다시 확인하고 있습니다.";
      body.replaceChildren(message);
      return;
    }
    card.querySelectorAll(".webr-home-compact__skeleton").forEach(function removeUnknownSkeleton(node) {
      node.remove();
    });
  }

  function ensureNoticeTitleEllipsis(portal) {
    portal.querySelectorAll(".webr-home-compact__notice-title").forEach(function boundTitle(node) {
      var fullTitle = cleanBoundedText(
        node.dataset.fullTitle || node.title || node.textContent,
        200
      );
      if (!fullTitle) {
        return;
      }
      node.dataset.fullTitle = fullTitle;
      node.title = fullTitle;
      var visibleTitle = fullTitle.length > noticeVisibleCharacterLimit
        ? fullTitle.slice(0, noticeVisibleCharacterLimit - 1).trimEnd() + "…"
        : fullTitle;
      if (node.textContent !== visibleTitle) {
        node.textContent = visibleTitle;
      }
    });
  }

  function markCachedPresentation() {
    var portal = document.getElementById("webr-home-portal");
    if (!portal || !servedCachedSummary || completeLiveSummarySeen) {
      return;
    }
    portal.dataset.homeSummarySource = "cache";
    portal.setAttribute("aria-busy", "true");
    var status = portal.querySelector(".webr-home-compact__status");
    if (status) {
      status.textContent = "최근 저장 자료를 먼저 표시하고 최신 자료를 확인하고 있습니다.";
    }
    ensureNoticeTitleEllipsis(portal);
  }

  function observeNoticeTitles() {
    var portal = document.getElementById("webr-home-portal");
    if (!portal || typeof MutationObserver !== "function") {
      return;
    }
    if (noticeObserver) {
      noticeObserver.disconnect();
    }
    noticeObserver = new MutationObserver(function noticeContentChanged() {
      ensureNoticeTitleEllipsis(portal);
    });
    noticeObserver.observe(portal, { childList: true, subtree: true });
    ensureNoticeTitleEllipsis(portal);
  }

  function settleLongRunningPlaceholders() {
    settleTimer = 0;
    var portal = document.getElementById("webr-home-portal");
    if (!portal) {
      return;
    }
    ensureNoticeTitleEllipsis(portal);
    if (!portal.querySelector(".webr-home-compact__skeleton")) {
      return;
    }

    portal.querySelectorAll("[data-home-category]").forEach(replaceCategorySkeleton);
    portal.querySelectorAll(".webr-home-compact__rail-card").forEach(replaceRailSkeleton);
    portal.setAttribute("aria-busy", "true");
    portal.dataset.homeSummaryState = "refreshing";
    var status = portal.querySelector(".webr-home-compact__status");
    if (status) {
      status.textContent = "자료 응답이 지연되어 다시 시도하고 있습니다.";
    }
  }

  function schedulePlaceholderSettlement() {
    if (settleTimer) {
      window.clearTimeout(settleTimer);
    }
    settleTimer = window.setTimeout(settleLongRunningPlaceholders, placeholderSettleDelay);
  }

  document.addEventListener("webr:home-summary-ready", function summaryReady() {
    if (settleTimer) {
      window.clearTimeout(settleTimer);
      settleTimer = 0;
    }
    var portal = document.getElementById("webr-home-portal");
    if (portal) {
      ensureNoticeTitleEllipsis(portal);
      if (servedCachedSummary && !completeLiveSummarySeen) {
        portal.dataset.homeSummarySource = "cache";
        portal.setAttribute("aria-busy", "false");
        var status = portal.querySelector(".webr-home-compact__status");
        if (status) {
          status.textContent = "최근 저장 자료를 표시하고 있습니다. 최신화가 지연되고 있습니다.";
        }
      } else {
        delete portal.dataset.homeSummarySource;
      }
    }
    restoreOriginalFetch();
  });

  var originalSetMain = window.set_main;
  if (typeof originalSetMain === "function") {
    window.set_main = function setMainWithTerminalSummaryGuard() {
      installSummaryFetchCache();
      var result = originalSetMain.apply(this, arguments);
      observeNoticeTitles();
      schedulePlaceholderSettlement();
      return result;
    };
  }
})(window, document);
