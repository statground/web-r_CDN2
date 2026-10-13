(function installWebRCompactPortal202610111930LaneStates(window, document) {
  "use strict";

  if (window.__webrCompactPortal202610111930LaneStatesInstalled) {
    return;
  }
  window.__webrCompactPortal202610111930LaneStatesInstalled = true;

  var summaryEndpoint = "/homepage/content-summary/";
  var noticeEndpoint = "/ajax_index_notice/";
  var categories = [
    { key: "rcommunity", label: "R Community", href: "/community/r-community/" },
    { key: "community", label: "커뮤니티", href: "/community/" },
    { key: "books", label: "도서", href: "/book/" },
    { key: "packages", label: "R 패키지", href: "/r-ecosystem/packages/" },
    { key: "ecosystem", label: "R 에코시스템", href: "/r-ecosystem/" },
    { key: "workshops", label: "워크샵", href: "/workshop/" }
  ];
  var productLinks = [
    {
      label: "Web-R 무료 서버",
      description: "기존 Web-R 무료 분석 서버",
      href: "/webr/",
      tone: "blue"
    },
    {
      label: "Web-R 정회원 서버",
      description: "정회원 전용 분석 환경",
      href: "/webr/member/",
      tone: "cyan"
    },
    {
      label: "Web-R Notebook",
      description: "R 코드와 문서 작업 공간",
      href: "/webr/notebook/",
      tone: "emerald"
    },
    {
      label: "Web-R 2.0 (beta)",
      description: "바로 쓰는 도구와 학습",
      href: "/webr/2.0/",
      tone: "violet"
    }
  ];
  var refs = null;
  var summaryRetryDelays = [900, 1800, 3000];
  var summaryQuickRecoveryDeadline = 0;
  var summaryRecoveryAttempt = 0;
  var summaryRecoveryEpoch = 0;
  var summarySeen = false;
  var summaryInitialDeadline = 0;
  var summaryInitialTimer = 0;
  var summaryInitialSettled = false;
  var pendingLaneTimer = 0;
  var summaryRecoveryTimer = 0;
  var summaryRecoveryController = null;
  var summaryRecoveryInFlight = false;
  var summaryRecoveryWanted = false;
  var summaryRecoverySuspended = false;
  var summaryRecoveryLastStarted = 0;
  var noticeRetryInFlight = false;
  var noticeRequest = null;
  var latestStatistics = null;
  var latestActivity = null;
  var activityTimeTimer = 0;
  var latestActivityUnavailable = false;

  function element(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = String(text);
    }
    return node;
  }

  // Scope the shared locale runtime to interface copy. Collected titles,
  // summaries, notice text and activity messages remain source content.
  function uiElement(tagName, className, text) {
    var node = element(tagName, className, text);
    node.setAttribute("data-webr-ui", "");
    return node;
  }

  var supportedSourceLanguages = new Set(["ko", "en", "ja", "zh-Hans", "zh-Hant", "es", "fr", "de", "pt-BR", "ru", "id", "vi", "th", "ms", "fil", "hi", "ar", "it", "nl", "pl", "sv", "tr", "uk"]);

  // The board and notice read models supply verified display languages. Other
  // collected sources have no trustworthy per-field language code; mark only
  // unambiguous Korean script and leave ambiguous text unspecified.
  function sourceText(tagName, className, text, displayLanguage) {
    var node = element(tagName, className, text);
    var value = String(text || "");
    if (supportedSourceLanguages.has(displayLanguage)) {
      node.lang = displayLanguage;
    } else if (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7a3]/.test(value) &&
        !/[\u0400-\u052f\u0600-\u08ff\u3040-\u30ff\u3400-\u9fff]/.test(value)) {
      node.lang = "ko";
    }
    return node;
  }

  function uiLink(href, className, text) {
    var node = link(href, className, text);
    node.setAttribute("data-webr-ui", "");
    return node;
  }

  function activeLanguage() {
    return window.WebRI18n && window.WebRI18n.language || document.documentElement.lang || "ko";
  }

  function uiText(value) {
    return window.WebRI18n && window.WebRI18n.t ? window.WebRI18n.t(value) : value;
  }

  function cleanText(value, limit) {
    var text = String(value === undefined || value === null ? "" : value)
      .replace(/\s+/g, " ")
      .trim();
    if (limit && text.length > limit) {
      return text.slice(0, Math.max(1, limit - 1)).trimEnd() + "…";
    }
    return text;
  }

  function safeHref(value, fallback) {
    var candidate = cleanText(value, 2048);
    var safeFallback = fallback || "/";
    if (!candidate || candidate.indexOf("\\") >= 0 || candidate.indexOf("//") === 0) {
      return safeFallback;
    }
    try {
      var parsed = new URL(candidate, window.location.origin);
      if (parsed.origin !== window.location.origin || parsed.pathname.indexOf("/") !== 0) {
        return safeFallback;
      }
      return parsed.pathname + parsed.search + parsed.hash;
    } catch (error) {
      return safeFallback;
    }
  }

  function safeImageURL(value) {
    var candidate = cleanText(value, 2048);
    if (!candidate) {
      return "";
    }
    try {
      var parsed = new URL(candidate);
      if (
        parsed.protocol !== "https:" ||
        !parsed.hostname ||
        parsed.username ||
        parsed.password
      ) {
        return "";
      }
      return parsed.href;
    } catch (error) {
      return "";
    }
  }

  function link(href, className, text) {
    var anchor = element("a", className, text);
    anchor.href = safeHref(href, "/");
    return anchor;
  }

  function formatDate(value) {
    var raw = cleanText(value, 80);
    if (!raw) {
      return "";
    }
    var dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/);
    if (dateOnly) {
      return dateOnly[1] + "-" + dateOnly[2] + "-" + dateOnly[3];
    }
    var parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(parsed).replace(/\.\s?/g, "-").replace(/-$/, "");
    } catch (error) {
      return "";
    }
  }

  function numberText(value, unit) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return "집계 중";
    }
    var language = activeLanguage();
    var suffix = uiText(unit);
    var space = language === "ko" || language === "ja" || language.indexOf("zh-") === 0 ? "" : " ";
    return new Intl.NumberFormat(language).format(Math.floor(parsed)) + (suffix ? space + suffix : "");
  }

  function newBadge() {
    var badge = element("span", "webr-home-compact__new", "NEW");
    badge.setAttribute("aria-label", "새 콘텐츠");
    return badge;
  }

  function skeleton(lines) {
    var wrapper = element("div", "webr-home-compact__skeleton");
    wrapper.setAttribute("aria-hidden", "true");
    for (var index = 0; index < lines; index += 1) {
      wrapper.appendChild(element("span", "webr-home-compact__skeleton-line"));
    }
    return wrapper;
  }

  function pendingCard(body, book) {
    body.setAttribute("aria-busy", "true");
    body.dataset.homePending = "true";
    var waiting = element("div", "webr-home-compact__pending-card" + (book ? " webr-home-compact__pending-card--book" : ""));
    waiting.setAttribute("role", "status");
    if (book) {
      var cover = element("span", "webr-home-compact__pending-cover");
      cover.setAttribute("aria-hidden", "true");
      waiting.appendChild(cover);
    }
    waiting.appendChild(skeleton(2));
    waiting.appendChild(uiElement("span", "webr-home-compact__sr-status", "자료를 불러오는 중입니다."));
    body.appendChild(waiting);
  }

  function unavailableCard(body, book, confirmed) {
    if (!confirmed && Date.now() < summaryQuickRecoveryDeadline) {
      pendingCard(body, book);
      schedulePendingLaneGrace();
      return;
    }
    body.setAttribute("aria-busy", "false");
    var failure = element("div", "webr-home-compact__lane-error");
    failure.setAttribute("role", "status");
    failure.appendChild(uiElement("p", "webr-home-compact__article-summary", "자료를 불러오지 못했습니다."));
    body.appendChild(failure);
  }

  function expirePendingLaneGrace() {
    pendingLaneTimer = 0;
    if (!refs || !summaryRecoveryVisible()) return;
    categories.forEach(function finishWaitingLane(definition) {
      if (refs.categoryBodies[definition.key].dataset.homePending === "true") {
        renderCategory(definition, null, true);
      }
    });
    if (refs.mediaBody.dataset.homePending === "true") {
      refs.mediaBody.replaceChildren();
      delete refs.mediaBody.dataset.homePending;
      unavailableCard(refs.mediaBody, false);
    }
  }

  function schedulePendingLaneGrace() {
    if (!refs || pendingLaneTimer || !summaryQuickRecoveryDeadline || !summaryRecoveryVisible() ||
        !refs.section.querySelector('[data-home-pending="true"]')) return;
    pendingLaneTimer = window.setTimeout(expirePendingLaneGrace,
      Math.max(0, summaryQuickRecoveryDeadline - Date.now()));
  }

  function productCard(item) {
    var card = link(item.href, "webr-home-compact__product-card webr-home-compact__product-card--" + item.tone);
    var title = uiElement("strong", "webr-home-compact__product-title", item.label);
    var description = uiElement("span", "webr-home-compact__product-description", item.description);
    var arrow = element("span", "webr-home-compact__product-arrow", "→");
    arrow.setAttribute("aria-hidden", "true");
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(arrow);
    return card;
  }

  function heroSection() {
    var section = element("section", "webr-home-compact__hero");
    section.setAttribute("aria-labelledby", "webr-home-title");

    var identity = element("div", "webr-home-compact__identity");
    identity.appendChild(element("p", "webr-home-compact__eyebrow", "Web-R"));
    var title = uiElement("h1", "webr-home-compact__title", "웹에서 하는 R 통계");
    title.id = "webr-home-title";
    identity.appendChild(title);
    identity.appendChild(uiElement(
      "p",
      "webr-home-compact__lead",
      "\"웹에서 하는 R통계\"는, 통계에는 관심이 있으나 R을 어려워하는 여러 연구자들을 위한 프로젝트입니다."
    ));
    identity.appendChild(uiElement(
      "p",
      "webr-home-compact__lead",
      "R설치없이 클릭만으로 웹에 있는 서버를 이용하여 통계분석을 하고 보다 R을 쉽게 사용하기 위한 패키지 및 앱 공동개발을 목표로 하고 있습니다."
    ));

    var primaryActions = element("div", "webr-home-compact__actions");
    primaryActions.appendChild(uiLink("/webr/", "webr-home-compact__button webr-home-compact__button--primary", "무료 서버 접속"));
    primaryActions.appendChild(uiLink("/webr/2.0/", "webr-home-compact__button webr-home-compact__button--secondary", "Web-R 2.0"));
    identity.appendChild(primaryActions);
    section.appendChild(identity);

    var productNav = element("nav", "webr-home-compact__products");
    productNav.setAttribute("aria-label", "Web-R 서비스 바로가기");
    productLinks.forEach(function appendProduct(item) {
      productNav.appendChild(productCard(item));
    });
    section.appendChild(productNav);
    return section;
  }

  function categoryCard(definition) {
    var card = element("article", "webr-home-compact__category");
    card.dataset.homeCategory = definition.key;
    var header = element("div", "webr-home-compact__category-header");
    header.appendChild(uiLink(definition.href, "webr-home-compact__category-title", definition.label));
    header.appendChild(uiLink(definition.href, "webr-home-compact__more", "더 보기"));
    card.appendChild(header);
    var body = element("div", "webr-home-compact__category-body");
    pendingCard(body, definition.key === "books");
    card.appendChild(body);
    return { card: card, body: body };
  }

  function railCard(title, href, className) {
    var card = element("section", "webr-home-compact__rail-card" + (className ? " " + className : ""));
    var header = element("div", "webr-home-compact__rail-header");
    header.appendChild(uiElement("h3", "webr-home-compact__rail-title", title));
    if (href) {
      header.appendChild(uiLink(href, "webr-home-compact__more", "더 보기"));
    }
    card.appendChild(header);
    var body = element("div", "webr-home-compact__rail-body");
    card.appendChild(body);
    return { card: card, body: body };
  }

  function statisticsPanel() {
    var panel = railCard("Web-R 현황", "", "webr-home-compact__rail-card--statistics");
    var rows = [
      { key: "cnt_member", label: "총 가입자 수", unit: "명", icon: "사람" },
      { key: "cnt_visitor", label: "오늘의 방문자 수", unit: "명", icon: "방문" },
      { key: "cnt_pageview", label: "오늘의 페이지 뷰", unit: "건", icon: "조회" }
    ];
    var list = element("div", "webr-home-compact__stats");
    rows.forEach(function appendRow(row) {
      var item = element("div", "webr-home-compact__stat");
      var icon = uiElement("span", "webr-home-compact__stat-icon", row.icon);
      icon.setAttribute("aria-hidden", "true");
      item.appendChild(icon);
      var copy = element("span", "webr-home-compact__stat-copy");
      copy.appendChild(uiElement("span", "webr-home-compact__stat-label", row.label));
      var value = uiElement("strong", "webr-home-compact__stat-value", "집계 중");
      value.dataset.statKey = row.key;
      value.dataset.statUnit = row.unit;
      copy.appendChild(value);
      item.appendChild(copy);
      list.appendChild(item);
    });
    panel.body.appendChild(list);
    return panel;
  }

  function portalSection() {
    var section = element("section", "webr-home-compact__portal");
    section.id = "webr-home-portal";
    section.setAttribute("aria-labelledby", "webr-home-portal-title");
    section.setAttribute("aria-busy", "true");

    var heading = element("div", "webr-home-compact__portal-heading");
    var copy = element("div");
    copy.appendChild(uiElement("p", "webr-home-compact__eyebrow", "R 자료와 Web-R 소식"));
    var title = uiElement("h2", "webr-home-compact__section-title", "새로 올라온 R 자료 모아보기");
    title.id = "webr-home-portal-title";
    copy.appendChild(title);
    copy.appendChild(uiElement("p", "webr-home-compact__section-description", "각 영역에서 가장 최근 자료 한 건만 빠르게 확인하세요."));
    heading.appendChild(copy);
    section.appendChild(heading);

    var layout = element("div", "webr-home-compact__portal-layout");
    var content = element("div", "webr-home-compact__category-grid");
    var categoryBodies = {};
    categories.forEach(function appendCategory(definition) {
      var built = categoryCard(definition);
      categoryBodies[definition.key] = built.body;
      content.appendChild(built.card);
    });
    layout.appendChild(content);

    var rail = element("aside", "webr-home-compact__rail");
    rail.setAttribute("aria-label", "Web-R 최신 현황");
    var statistics = statisticsPanel();
    rail.appendChild(statistics.card);

    var notices = railCard("공지사항", "/intro/notice/");
    notices.body.appendChild(skeleton(3));
    rail.appendChild(notices.card);

    var media = railCard("강의 / YouTube", "/workshop/");
    media.card.querySelector(".webr-home-compact__rail-title").replaceChildren(
      uiElement("span", "", "강의"), document.createTextNode(" / YouTube")
    );
    media.body.appendChild(skeleton(2));
    rail.appendChild(media.card);

    var activity = railCard("지금 Web-R", "", "webr-home-compact__rail-card--activity");
    activity.body.appendChild(skeleton(3));
    rail.appendChild(activity.card);
    layout.appendChild(rail);
    section.appendChild(layout);

    refs = {
      section: section,
      categoryBodies: categoryBodies,
      statisticsBody: statistics.body,
      noticesBody: notices.body,
      mediaBody: media.body,
      mediaHeader: media.card.querySelector(".webr-home-compact__rail-header"),
      activityBody: activity.body
    };
    return section;
  }

  function normalizedItems(payload, key) {
    var sections = payload && payload.sections && typeof payload.sections === "object" ? payload.sections : {};
    var rows = Array.isArray(sections[key]) ? sections[key] : [];
    return rows.filter(function validRow(row) {
      return row && typeof row === "object" && cleanText(row.title, 160);
    });
  }

  function sectionUnavailable(payload, key) {
    if (!payload || !payload.sections || !Array.isArray(payload.sections[key])) return true;
    var unavailable = payload.unavailable_sections;
    var stale = payload.stale_sections;
    return Array.isArray(unavailable)
      ? unavailable.indexOf(key) >= 0 || (Array.isArray(stale) && stale.indexOf(key) >= 0)
      : payload.complete !== true;
  }

  function currentBookItem(payload) {
    var revision = payload && payload.book_visibility_revision;
    var unavailable = payload && payload.unavailable_sections;
    if (
      typeof revision !== "string" || !revision.trim() || revision.length > 256 ||
      (Array.isArray(unavailable) && unavailable.indexOf("books") >= 0) ||
      (!Array.isArray(unavailable) && (!payload || payload.complete !== true))
    ) {
      return null;
    }
    var items = normalizedItems(payload, "books");
    if (items.length !== 1 || items[0].kind !== "book") {
      return null;
    }
    try {
      var href = new URL(items[0].href, window.location.origin);
      if (href.origin !== window.location.origin || !/^\/book\/d\/[^/]+\/$/.test(href.pathname)) {
        return null;
      }
    } catch (error) {
      return null;
    }
    return items[0];
  }

  function categoryPlaceholder(definition) {
    var placeholder = element(
      "span",
      "webr-home-compact__category-placeholder webr-home-compact__category-placeholder--" + definition.key,
      definition.key === "books" ? "도서" : "워크샵"
    );
    placeholder.setAttribute("aria-hidden", "true");
    return placeholder;
  }

  function categoryMedia(definition, item) {
    if (definition.key !== "books" && definition.key !== "workshops") {
      return null;
    }
    var frame = element(
      "span",
      "webr-home-compact__category-media webr-home-compact__category-media--" + definition.key
    );
    frame.setAttribute("aria-hidden", "true");
    var imageURL = safeImageURL(item.image);
    if (!imageURL) {
      frame.appendChild(categoryPlaceholder(definition));
      return frame;
    }
    var image = element(
      "img",
      "webr-home-compact__category-image webr-home-compact__category-image--" + definition.key
    );
    image.src = imageURL;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", function replaceBrokenCategoryImage() {
      frame.replaceChildren(categoryPlaceholder(definition));
    }, { once: true });
    frame.appendChild(image);
    return frame;
  }

  function renderCategory(definition, item, unavailable, confirmed) {
    var body = refs.categoryBodies[definition.key];
    body.replaceChildren();
    body.setAttribute("aria-busy", "false");
    delete body.dataset.homePending;
    if (!item) {
      if (unavailable) {
        unavailableCard(body, definition.key === "books", confirmed);
      }
      return;
    }
    var media = categoryMedia(definition, item);
    var anchor = link(
      item.href || definition.href,
      "webr-home-compact__article" + (media ? " webr-home-compact__article--with-media" : "")
    );
    var content = element("span", "webr-home-compact__article-content");
    if (media) {
      anchor.appendChild(media);
    }
    var titleRow = element("span", "webr-home-compact__article-title-row");
    titleRow.appendChild(sourceText("strong", "webr-home-compact__article-title", cleanText(item.title, 72), item.title_language));
    if (item.is_new === true) {
      titleRow.appendChild(newBadge());
    }
    content.appendChild(titleRow);
    var meta = formatDate(item.published_at);
    if (meta) {
      content.appendChild(element("span", "webr-home-compact__article-meta", meta));
    }
    var summary = cleanText(item.summary, 180);
    content.appendChild(summary
      ? sourceText("span", "webr-home-compact__article-summary", summary, item.summary_language)
      : uiElement("span", "webr-home-compact__article-summary", "최신 자료를 확인해 보세요."));
    anchor.appendChild(content);
    body.appendChild(anchor);
  }

  function renderStatistics(statistics) {
    var values = statistics && typeof statistics === "object" ? statistics : {};
    latestStatistics = values;
    var trafficStatus = cleanText(values.traffic_status, 32).toLowerCase();
    var trafficUnavailable = trafficStatus === "unavailable" || trafficStatus === "stale";
    refs.statisticsBody.querySelectorAll("[data-stat-key]").forEach(function updateValue(node) {
      var key = node.dataset.statKey;
      var isTrafficCounter = key === "cnt_visitor" || key === "cnt_pageview";
      if (trafficUnavailable && isTrafficCounter) {
        node.textContent = "집계 일시 중단";
        node.dataset.statStatus = trafficStatus;
        return;
      }
      node.textContent = numberText(values[key], node.dataset.statUnit || "");
      node.dataset.statStatus = "available";
    });
  }

  function noticeSummaryUnavailable(payload) {
    if (!payload || !payload.sections || !Array.isArray(payload.sections.notices)) {
      return true;
    }
    var unavailable = payload.unavailable_sections;
    var stale = payload.stale_sections;
    if (Array.isArray(unavailable)) {
      return unavailable.indexOf("notices") >= 0 ||
        (Array.isArray(stale) && stale.indexOf("notices") >= 0);
    }
    return payload.complete !== true;
  }

  function retryUnavailableNotices() {
    if (noticeRetryInFlight) {
      return;
    }
    noticeRetryInFlight = true;
    var button = refs.noticesBody.querySelector(".webr-home-compact__notice-retry");
    if (button) {
      button.disabled = true;
      button.textContent = "확인 중...";
    }
    requestNotices().then(function renderRetriedNotices(rows) {
      noticeRetryInFlight = false;
      renderNotices(rows, { sections: { notices: rows }, unavailable_sections: [] });
    }).catch(function keepNoticesUnavailable() {
      noticeRetryInFlight = false;
      renderNotices([], null);
    });
  }

  function requestNotices() {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeoutID = window.setTimeout(function abortSlowNotices() {
      if (controller) {
        controller.abort();
      }
    }, 20000);
    return fetch(noticeEndpoint + "?lang=" + encodeURIComponent(activeLanguage()), {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller ? controller.signal : undefined
    }).then(function parseNotices(response) {
      if (!response.ok) {
        throw new Error("notice authority unavailable");
      }
      return response.json();
    }).then(function normalizeNotices(payload) {
      if (!payload || typeof payload !== "object" || payload.ok === false) {
        throw new Error("notice authority unavailable");
      }
      return Object.keys(payload).filter(function isIndexedRow(key) {
        return /^[0-9]+$/.test(key);
      }).sort(function numericOrder(left, right) {
        return Number(left) - Number(right);
      }).map(function publicNotice(key) {
        var row = payload[key] || {};
        var id = cleanText(row.uuid, 64);
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          return null;
        }
        return {
          title: cleanText(row.title, 96),
          display_title_language: row.display_title_language,
          href: "/intro/notice/read/" + id + "/",
          published_at: row.created_at,
          is_new: row.is_new === true || row.is_new === 1
        };
      }).filter(function hasPublicTitle(row) {
        return row && row.title;
      });
    }).finally(function noticeFinished() {
      window.clearTimeout(timeoutID);
    });
  }

  function loadNotices() {
    if (noticeRequest) {
      return noticeRequest;
    }
    refs.noticesBody.replaceChildren(skeleton(3));
    noticeRequest = requestNotices().then(function showCurrentNotices(rows) {
      renderNotices(rows, { sections: { notices: rows }, unavailable_sections: [] });
      return rows;
    }).catch(function showUnavailableNotices() {
      renderNotices([], null);
      return null;
    }).finally(function allowNextNoticeRead() {
      noticeRequest = null;
    });
    return noticeRequest;
  }

  function renderNotices(items, payload) {
    refs.noticesBody.replaceChildren();
    var rows = items.slice(0, 3);
    if (!rows.length) {
      if (noticeSummaryUnavailable(payload)) {
        var unavailable = element("div", "webr-home-compact__notice-unavailable");
        unavailable.setAttribute("role", "status");
        unavailable.appendChild(uiElement("p", "", "공지사항을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요."));
        var actions = element("div", "webr-home-compact__notice-actions");
        actions.appendChild(uiLink("/intro/notice/", "webr-home-compact__notice-visit", "공지사항으로 이동"));
        unavailable.appendChild(actions);
        refs.noticesBody.appendChild(unavailable);
        return;
      }
      refs.noticesBody.appendChild(uiLink("/intro/notice/", "webr-home-compact__empty", "공지사항 전체 보기"));
      return;
    }
    var list = element("div", "webr-home-compact__notice-list");
    rows.forEach(function appendNotice(item) {
      var anchor = link(item.href || "/intro/notice/", "webr-home-compact__notice");
      var titleRow = element("span", "webr-home-compact__notice-title-row");
      titleRow.appendChild(sourceText("strong", "webr-home-compact__notice-title", cleanText(item.title, 76), item.display_title_language));
      if (item.is_new === true) {
        titleRow.appendChild(newBadge());
      }
      anchor.appendChild(titleRow);
      var date = formatDate(item.published_at);
      if (date) {
        anchor.appendChild(element("span", "webr-home-compact__notice-date", date));
      }
      list.appendChild(anchor);
    });
    refs.noticesBody.appendChild(list);
  }

  function featuredMedia(payload) {
    var lectures = normalizedItems(payload, "lectures");
    var youtube = normalizedItems(payload, "youtube").filter(function publicVideo(item) {
      var title = cleanText(item.title, 200);
      var availability = cleanText(item.availability || item.status, 32).toLowerCase();
      // These are collector fallback labels, not verified video metadata.
      return !/^youtube video\s+#?[a-z0-9_-]{11}$/i.test(title) &&
        !/^(private|deleted|unavailable) video$/i.test(title) &&
        item.active !== false && item.active !== 0 && item.active !== "0" &&
        ["inactive", "private", "deleted", "unavailable"].indexOf(availability) < 0;
    });
    var candidates = [];
    if (lectures.length) {
      candidates.push({ type: "강의", root: "/workshop/lecture/", item: lectures[0] });
    }
    if (youtube.length) {
      candidates.push({ type: "YouTube", root: "/workshop/youtube/", item: youtube[0] });
    }
    candidates.sort(function newestFirst(left, right) {
      return cleanText(right.item.published_at, 80).localeCompare(cleanText(left.item.published_at, 80));
    });
    return candidates;
  }

  function renderMedia(payload) {
    refs.mediaBody.replaceChildren();
    refs.mediaBody.setAttribute("aria-busy", "false");
    delete refs.mediaBody.dataset.homePending;
    var mediaItems = featuredMedia(payload);
    var existingMore = refs.mediaHeader.querySelector(".webr-home-compact__more");
    if (!mediaItems.length) {
      if (existingMore) existingMore.href = "/workshop/";
      if (sectionUnavailable(payload, "lectures") || sectionUnavailable(payload, "youtube")) {
        unavailableCard(refs.mediaBody, false, sectionConfirmedUnavailable(payload, "lectures") ||
          sectionConfirmedUnavailable(payload, "youtube"));
      }
      return;
    }
    if (existingMore) {
      existingMore.href = mediaItems.length === 1 ? mediaItems[0].root : "/workshop/";
    }
    var destination = refs.mediaBody;
    if (mediaItems.length > 1) {
      destination = element("div", "webr-home-compact__media-list--paired");
      refs.mediaBody.appendChild(destination);
    }
    mediaItems.forEach(function appendMedia(media) {
      var anchor = link(media.item.href || media.root, "webr-home-compact__media");
      var imageURL = safeImageURL(media.item.image);
      if (imageURL) {
        var image = element("img", "webr-home-compact__media-image");
        image.src = imageURL;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        anchor.appendChild(image);
      } else {
        anchor.appendChild(uiElement("span", "webr-home-compact__media-placeholder", media.type));
      }
      anchor.appendChild(uiElement("span", "webr-home-compact__media-type", media.type));
      var titleRow = element("span", "webr-home-compact__media-title-row");
      titleRow.appendChild(sourceText("strong", "webr-home-compact__media-title", cleanText(media.item.title, 88)));
      if (media.item.is_new === true) {
        titleRow.appendChild(newBadge());
      }
      anchor.appendChild(titleRow);
      var date = formatDate(media.item.published_at);
      if (date) {
        anchor.appendChild(element("span", "webr-home-compact__media-date", date));
      }
      destination.appendChild(anchor);
    });
  }

  function activityInstant(value) {
    var raw = cleanText(value, 80);
    var parts = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})?$/);
    if (!parts) return null;
    var clock = parts[2].split(":").map(Number);
    if (clock[0] > 23 || clock[1] > 59 || clock[2] > 59) return null;
    var day = new Date(parts[1] + "T00:00:00Z");
    if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== parts[1]) return null;
    var date = new Date(parts[1] + "T" + parts[2] + (parts[3] || "") + (parts[4] || "+09:00"));
    if (!Number.isFinite(date.getTime()) || date.getTime() > Date.now()) return null;
    return date;
  }

  function activityRelativeTime(date) {
    var seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    var unit = seconds >= 86400 ? "day" : seconds >= 3600 ? "hour" : seconds >= 60 ? "minute" : "second";
    var count = Math.floor(seconds / ({day:86400, hour:3600, minute:60, second:1}[unit]));
    try {
      return new Intl.RelativeTimeFormat(activeLanguage(), {numeric:"always"}).format(-count, unit);
    } catch (error) {
      return count + ({day:"일", hour:"시간", minute:"분", second:"초"}[unit]) + " 전";
    }
  }

  // Update display ages locally; this timer never reads logs or renews a cache.
  function updateActivityTimes() {
    if (!refs || document.hidden) return;
    refs.activityBody.querySelectorAll("time[datetime]").forEach(function update(node) {
      var date = activityInstant(node.getAttribute("datetime"));
      if (date) node.textContent = activityRelativeTime(date);
    });
  }

  function cancelActivityTimeTimer() {
    window.clearTimeout(activityTimeTimer);
    activityTimeTimer = 0;
  }

  function scheduleActivityTimes() {
    cancelActivityTimeTimer();
    if (summaryRecoverySuspended || document.hidden || !refs || !refs.activityBody.querySelector("time")) return;
    activityTimeTimer = window.setTimeout(function refreshActivityTimes() {
      activityTimeTimer = 0;
      updateActivityTimes();
      scheduleActivityTimes();
    }, 60000);
  }

  // Recognize only finite presentation templates. Cached copy keeps the
  // real action, href, source instant, ordering and original cache age.
  var activityCopyTemplates = [{"locale":"ko","visit":["{name}님이 Web-R에 방문했습니다.","한 이용자가 Web-R에 방문했습니다.","{name}님이 방문했습니다.","한 이용자가 방문했습니다."],"login":["{name}님이 로그인했습니다.","한 이용자가 로그인했습니다.","{name}님이 Web-R에 로그인했습니다.","한 이용자가 Web-R에 로그인했습니다."]},{"locale":"en","visit":["{name} visited Web-R.","A user visited Web-R.","{name} visited.","A user visited."],"login":["{name} signed in.","A user signed in.","{name} signed in to Web-R.","A user signed in to Web-R."]},{"locale":"ja","visit":["{name}さんがWeb-Rに訪れました。","ユーザーがWeb-Rに訪れました。","{name}さんが訪れました。","ユーザーが訪れました。"],"login":["{name}さんがログインしました。","ユーザーがログインしました。","{name}さんがWeb-Rにログインしました。","ユーザーがWeb-Rにログインしました。"]},{"locale":"zh-Hans","visit":["{name}访问了Web-R。","用户访问了Web-R。","{name}访问了网站。","一位用户访问了网站。"],"login":["{name}登录了。","一位用户登录了。","{name}登录了Web-R。","一位用户登录了Web-R。"]},{"locale":"zh-Hant","visit":["{name}造訪了Web-R。","一位用戶造訪了Web-R。","{name}造訪了網站。","一位用戶造訪了網站。"],"login":["{name}登入了。","一位用戶登入了。","{name}登入了Web-R。","一位用戶登入了Web-R。"]},{"locale":"es","visit":["{name} visitó Web-R.","Un usuario visitó Web-R.","{name} realizó una visita.","Un usuario realizó una visita."],"login":["{name} inició sesión.","Un usuario inició sesión.","{name} inició sesión en Web-R.","Un usuario inició sesión en Web-R."]},{"locale":"fr","visit":["{name} a visité Web-R.","Un utilisateur a visité Web-R.","{name} a effectué une visite.","Un utilisateur a effectué une visite."],"login":["{name} s’est connecté.","Un utilisateur s’est connecté.","{name} s’est connecté à Web-R.","Un utilisateur s’est connecté à Web-R."]},{"locale":"de","visit":["{name} hat Web-R besucht.","Ein Benutzer hat Web-R besucht.","{name} hat einen Besuch gemacht.","Ein Benutzer hat einen Besuch gemacht."],"login":["{name} hat sich angemeldet.","Ein Benutzer hat sich angemeldet.","{name} hat sich bei Web-R angemeldet.","Ein Benutzer hat sich bei Web-R angemeldet."]},{"locale":"pt-BR","visit":["{name} visitou o Web-R.","Um usuário visitou o Web-R.","{name} fez uma visita.","Um usuário fez uma visita."],"login":["{name} entrou na conta.","Um usuário entrou na conta.","{name} entrou na conta do Web-R.","Um usuário entrou na conta do Web-R."]},{"locale":"ru","visit":["{name} посетил Web-R.","Пользователь посетил Web-R.","{name} посетил сайт.","Пользователь посетил сайт."],"login":["{name} вошёл в аккаунт.","Пользователь вошёл в аккаунт.","{name} вошёл в Web-R.","Пользователь вошёл в Web-R."]},{"locale":"id","visit":["{name} mengunjungi Web-R.","Seorang pengguna mengunjungi Web-R.","{name} berkunjung.","Seorang pengguna berkunjung."],"login":["{name} masuk.","Seorang pengguna masuk.","{name} masuk ke Web-R.","Seorang pengguna masuk ke Web-R."]},{"locale":"vi","visit":["{name} đã ghé thăm Web-R.","Một người dùng đã ghé thăm Web-R.","{name} đã ghé thăm.","Một người dùng đã ghé thăm."],"login":["{name} đã đăng nhập.","Một người dùng đã đăng nhập.","{name} đã đăng nhập vào Web-R.","Một người dùng đã đăng nhập vào Web-R."]},{"locale":"th","visit":["{name} ได้เยี่ยมชม Web-R.","ผู้ใช้คนหนึ่งได้เยี่ยมชม Web-R.","{name} ได้เยี่ยมชมเว็บไซต์","ผู้ใช้คนหนึ่งได้เยี่ยมชมเว็บไซต์"],"login":["{name} เข้าสู่ระบบแล้ว","ผู้ใช้คนหนึ่งเข้าสู่ระบบแล้ว","{name} เข้าสู่ระบบ Web-R แล้ว","ผู้ใช้คนหนึ่งเข้าสู่ระบบ Web-R แล้ว"]},{"locale":"ms","visit":["{name} melawat Web-R.","Seorang pengguna melawat Web-R.","{name} membuat lawatan.","Seorang pengguna membuat lawatan."],"login":["{name} telah log masuk.","Seorang pengguna telah log masuk.","{name} telah log masuk ke Web-R.","Seorang pengguna telah log masuk ke Web-R."]},{"locale":"fil","visit":["{name} ay bumisita sa Web-R.","Isang gumagamit ang bumisita sa Web-R.","{name} ay bumisita.","Isang gumagamit ang bumisita."],"login":["{name} ay nag-sign in.","Isang gumagamit ang nag-sign in.","{name} ay nag-sign in sa Web-R.","Isang gumagamit ang nag-sign in sa Web-R."]},{"locale":"hi","visit":["{name} ने Web-R का दौरा किया।","एक उपयोगकर्ता ने Web-R का दौरा किया।","{name} ने साइट का दौरा किया।","एक उपयोगकर्ता ने साइट का दौरा किया।"],"login":["{name} ने लॉग इन किया।","एक उपयोगकर्ता ने लॉग इन किया।","{name} ने Web-R में लॉग इन किया।","एक उपयोगकर्ता ने Web-R में लॉग इन किया।"]},{"locale":"ar","visit":["{name} زار Web-R.","قام مستخدم بزيارة Web-R.","{name} زار الموقع.","قام مستخدم بزيارة الموقع."],"login":["{name} سجّل الدخول.","سجّل مستخدم الدخول.","{name} سجّل الدخول إلى Web-R.","سجّل مستخدم الدخول إلى Web-R."]},{"locale":"it","visit":["{name} ha visitato Web-R.","Un utente ha visitato Web-R.","{name} ha effettuato una visita.","Un utente ha effettuato una visita."],"login":["{name} ha effettuato l’accesso.","Un utente ha effettuato l’accesso.","{name} ha effettuato l’accesso a Web-R.","Un utente ha effettuato l’accesso a Web-R."]},{"locale":"nl","visit":["{name} heeft Web-R bezocht.","Een gebruiker heeft Web-R bezocht.","{name} heeft een bezoek gebracht.","Een gebruiker heeft een bezoek gebracht."],"login":["{name} heeft zich aangemeld.","Een gebruiker heeft zich aangemeld.","{name} heeft zich aangemeld bij Web-R.","Een gebruiker heeft zich aangemeld bij Web-R."]},{"locale":"pl","visit":["{name} odwiedził Web-R.","Użytkownik odwiedził Web-R.","{name} odwiedził stronę.","Użytkownik odwiedził stronę."],"login":["{name} zalogował się.","Użytkownik zalogował się.","{name} zalogował się do Web-R.","Użytkownik zalogował się do Web-R."]},{"locale":"sv","visit":["{name} besökte Web-R.","En användare besökte Web-R.","{name} gjorde ett besök.","En användare gjorde ett besök."],"login":["{name} loggade in.","En användare loggade in.","{name} loggade in på Web-R.","En användare loggade in på Web-R."]},{"locale":"tr","visit":["{name} Web-R'yi ziyaret etti.","Bir kullanıcı Web-R'yi ziyaret etti.","{name} ziyaret etti.","Bir kullanıcı ziyaret etti."],"login":["{name} oturum açtı.","Bir kullanıcı oturum açtı.","{name} Web-R oturumu açtı.","Bir kullanıcı Web-R oturumu açtı."]},{"locale":"uk","visit":["{name} відвідав Web-R.","Користувач відвідав Web-R.","{name} відвідав сайт.","Користувач відвідав сайт."],"login":["{name} увійшов в обліковий запис.","Користувач увійшов в обліковий запис.","{name} увійшов у Web-R.","Користувач увійшов у Web-R."]}];

  function activityMaskedName(name) {
    var characters = Array.from(name);
    return characters.length === 5 && characters.slice(1, 4).join("") === "***";
  }

  function activityPresentation(raw) {
    var title = cleanText(raw, 100);
    var named = title.match(/^(.{1,70})님이 (?:(?:Web-R|Statground|MirType)에 )?(로그인|방문)했습니다\.$/);
    var anonymous = title.match(/^한 이용자가 (?:(?:Web-R|Statground|MirType)에 )?(로그인|방문)했습니다\.$/);
    if (anonymous) return {key:"한 이용자가 Web-R에 " + anonymous[1] + "했습니다.", vars:{}};
    if (named && activityMaskedName(named[1])) return {key:"{name}님이 Web-R에 " + named[2] + "했습니다.", vars:{name:named[1]}};
    // Anonymous templates can share a named template's suffix ("A user ...").
    // Resolve exact anonymous copy first; never turn it into a made-up name.
    for (var copy of activityCopyTemplates) {
      for (var verb of ["visit", "login"]) {
        if (copy[verb].some(function isAnonymous(template) {
          return template.indexOf("{name}") < 0 && template === title;
        })) return {key:"한 이용자가 Web-R에 " + (verb === "visit" ? "방문" : "로그인") + "했습니다.", vars:{}};
      }
    }
    for (var i = 0; i < activityCopyTemplates.length; i += 1) {
      var row = activityCopyTemplates[i];
      for (var action of ["visit", "login"]) {
        for (var template of row[action]) {
          var parts = template.split("{name}");
          var key = action === "visit" ? "방문" : "로그인";
          if (parts.length === 1 && title === template) return {key:"한 이용자가 Web-R에 " + key + "했습니다.", vars:{}};
          if (parts.length === 2 && title.startsWith(parts[0]) && title.endsWith(parts[1])) {
            var name = title.slice(parts[0].length, title.length - parts[1].length);
            if (activityMaskedName(name)) return {key:"{name}님이 Web-R에 " + key + "했습니다.", vars:{name:name}};
          }
        }
      }
    }
    return {title:title};
  }

  function renderActivity(items, unavailable) {
    cancelActivityTimeTimer();
    refs.activityBody.replaceChildren();
    var rows = items.slice(0, 5);
    latestActivity = rows;
    latestActivityUnavailable = unavailable === true;
    if (!rows.length) {
      refs.activityBody.appendChild(uiElement("p", "webr-home-compact__activity-empty", unavailable ? "활동을 확인하지 못했습니다." : "표시할 최근 활동이 없습니다."));
      return;
    }
    var list = element("div", "webr-home-compact__activity-list");
    rows.forEach(function appendActivity(item) {
      var row = element("div", "webr-home-compact__activity-item");
      var presentation = activityPresentation(item.title);
      var title = presentation.title || (window.WebRI18n && window.WebRI18n.t
        ? window.WebRI18n.t(presentation.key, presentation.vars)
        : presentation.key.replace("{name}", presentation.vars.name || ""));
      var titleNode = element("strong", "webr-home-compact__activity-title", title);
      if (presentation.key) {
        titleNode.setAttribute("data-webr-i18n", presentation.key);
        titleNode.setAttribute("data-webr-i18n-vars", JSON.stringify(presentation.vars));
      }
      row.appendChild(titleNode);
      var date = activityInstant(item.published_at);
      if (date) {
        var timeNode = element("time", "webr-home-compact__activity-time", activityRelativeTime(date));
        timeNode.dateTime = date.toISOString();
        timeNode.lang = activeLanguage();
        row.appendChild(timeNode);
      }
      list.appendChild(row);
    });
    refs.activityBody.appendChild(list);
    scheduleActivityTimes();
  }

  function renderSummary(payload) {
    categories.forEach(function renderOneCategory(definition) {
      var item = definition.key === "books"
        ? currentBookItem(payload)
        : normalizedItems(payload, definition.key)[0] || null;
      renderCategory(definition, item, sectionUnavailable(payload, definition.key) ||
        (definition.key === "books" && !item && normalizedItems(payload, "books").length > 0),
        sectionConfirmedUnavailable(payload, definition.key));
    });
    renderStatistics(payload.statistics);
    // Notices have a separate current-state request. A homepage summary may
    // outlive a withdrawn notice and cannot authorize this card.
    renderMedia(payload);
    renderActivity(normalizedItems(payload, "activity"), Array.isArray(payload.unavailable_sections) && payload.unavailable_sections.indexOf("activity") >= 0);
    if (!summaryNeedsRecovery(payload)) {
      refs.section.setAttribute("aria-busy", "false");
      refs.section.dataset.homeSummaryState = "ready";
    } else {
      refs.section.setAttribute("aria-busy", "true");
      refs.section.dataset.homeSummaryState = "refreshing";
    }
  }

  // A fresh explicit fence/failure is different from an unfinished source.
  function sectionConfirmedUnavailable(payload, key) {
    return !!payload && Array.isArray(payload.unavailable_sections) &&
      payload.unavailable_sections.indexOf(key) >= 0 && !!payload.section_states &&
      payload.section_states[key] === "closed";
  }

  function summaryHasConfirmedUnavailable(payload) {
    return categories.some(function confirmed(definition) {
      return sectionConfirmedUnavailable(payload, definition.key);
    }) || sectionConfirmedUnavailable(payload, "lectures") || sectionConfirmedUnavailable(payload, "youtube");
  }

  function settleConfirmedPendingLanes() {
    categories.forEach(function settle(definition) {
      var body = refs.categoryBodies[definition.key];
      if (body.dataset.homePending !== "true") return;
      renderCategory(definition, null, true, true);
    });
    if (refs.mediaBody.dataset.homePending === "true") {
      refs.mediaBody.replaceChildren();
      delete refs.mediaBody.dataset.homePending;
      unavailableCard(refs.mediaBody, false, true);
    }
  }

  function summaryHasCurrentResources(payload) {
    return featuredMedia(payload).length > 0 || categories.some(function hasCategory(definition) {
      return definition.key === "books" ? !!currentBookItem(payload)
        : normalizedItems(payload, definition.key).length > 0;
    });
  }

  function withinInitialSummaryGrace() {
    return !summaryInitialSettled && Date.now() < summaryInitialDeadline;
  }

  function settleInitialSummaryGrace() {
    summaryInitialSettled = true;
    if (summaryInitialTimer) window.clearTimeout(summaryInitialTimer);
    summaryInitialTimer = 0;
  }

  function expireInitialSummaryGrace() {
    summaryInitialTimer = 0;
    if (summaryInitialSettled || !summaryRecoveryVisible()) return;
    settleInitialSummaryGrace();
    renderFallback();
    document.dispatchEvent(new CustomEvent("webr:home-summary-ready", {
      detail: { ok: false, complete: false }
    }));
  }

  function scheduleInitialSummaryGrace() {
    if (summaryInitialSettled || summaryInitialTimer || !summaryInitialDeadline || !summaryRecoveryVisible()) return;
    summaryInitialTimer = window.setTimeout(expireInitialSummaryGrace,
      Math.max(0, summaryInitialDeadline - Date.now()));
  }

  function settlePartialSummary() {
    refs.section.setAttribute("aria-busy", "false");
    refs.section.dataset.homeSummaryState = "partial";
  }

  function renderFallback(confirmed) {
    categories.forEach(function renderFallbackCategory(definition) {
      renderCategory(definition, null, true, confirmed);
    });
    // Notices have their own current-state request and are unaffected by a
    // summary timeout. Its loader owns loading, errors and visible rows.
    renderMedia({ sections: {}, unavailable_sections: ["lectures", "youtube"],
      section_states: confirmed ? {lectures: "closed", youtube: "closed"} : {} });
    renderActivity([], true);
    refs.section.setAttribute("aria-busy", "false");
    refs.section.dataset.homeSummaryState = "fallback";
  }

  function requestSummary(externalController) {
    var controller = externalController || (typeof AbortController === "function" ? new AbortController() : null);
    var timeoutID;
    var request = fetch(summaryEndpoint + "?lang=" + encodeURIComponent(activeLanguage()), {
      method: "GET", credentials: "same-origin", cache: "no-store",
      headers: { Accept: "application/json" }, signal: controller ? controller.signal : undefined
    }).then(function parseResponse(response) {
      if (!response.ok) {
        var failure = new Error("homepage summary unavailable");
        failure.confirmedUnavailable = response.status >= 400;
        failure.terminalDenial = response.status === 401 || response.status === 403;
        throw failure;
      }
      return response.json();
    }).then(function validateSummary(payload) {
      if (!payload || payload.ok !== true || !payload.sections || !payload.statistics) {
        throw new Error("homepage summary incomplete");
      }
      return payload;
    });
    return Promise.race([
      request,
      new Promise(function boundSummaryRead(_, reject) {
        timeoutID = window.setTimeout(function abortSlowSummary() {
          if (controller) controller.abort();
          reject(new Error("homepage summary timed out"));
        }, 12000);
      })
    ]).finally(function summaryFinished() { window.clearTimeout(timeoutID); });
  }

  function summaryNeedsRecovery(payload) {
    if (!payload || payload.complete !== true) return true;
    if ((payload.unavailable_sections !== undefined &&
        (!Array.isArray(payload.unavailable_sections) || payload.unavailable_sections.length)) ||
        (payload.stale_sections !== undefined &&
        (!Array.isArray(payload.stale_sections) || payload.stale_sections.length))) return true;
    // A malformed Book row cannot turn completion into a visibility grant.
    return normalizedItems(payload, "books").length > 0 && !currentBookItem(payload);
  }

  function summaryRecoveryVisible() {
    return !summaryRecoverySuspended && document.hidden !== true && document.visibilityState !== "hidden";
  }

  function cancelSummaryRecoveryWork() {
    ++summaryRecoveryEpoch;
    if (summaryRecoveryTimer) {
      window.clearTimeout(summaryRecoveryTimer);
      summaryRecoveryTimer = 0;
    }
    if (summaryRecoveryController) summaryRecoveryController.abort();
    if (summaryInitialTimer) window.clearTimeout(summaryInitialTimer);
    summaryInitialTimer = 0;
    if (pendingLaneTimer) window.clearTimeout(pendingLaneTimer);
    pendingLaneTimer = 0;
  }

  function scheduleSummaryRecovery(interval) {
    scheduleInitialSummaryGrace();
    schedulePendingLaneGrace();
    if (!summaryRecoveryWanted || !summaryRecoveryVisible() || summaryRecoveryTimer || summaryRecoveryInFlight) return;
    var elapsed = summaryRecoveryLastStarted ? Math.max(0, Date.now() - summaryRecoveryLastStarted) : 0;
    var delay = summaryRecoveryLastStarted ? Math.max(0, interval - elapsed) : interval;
    summaryRecoveryTimer = window.setTimeout(retryUnavailableSummary, delay);
  }

  function retryUnavailableSummary() {
    if (summaryRecoveryTimer) window.clearTimeout(summaryRecoveryTimer);
    summaryRecoveryTimer = 0;
    if (!summaryRecoveryVisible() || summaryRecoveryInFlight) return;
    summaryRecoveryWanted = true;
    summaryRecoveryInFlight = true;
    summaryRecoveryLastStarted = Date.now();
    var epoch = summaryRecoveryEpoch;
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    summaryRecoveryController = controller;
    requestSummary(controller).then(function acceptCurrentSummary(payload) {
      if (epoch !== summaryRecoveryEpoch || !summaryRecoveryVisible()) return;
      // Every lane is rendered from this current same-origin response. Notice
      // visibility remains on its own endpoint; no saved Book/video replay.
      summaryRecoveryWanted = summaryNeedsRecovery(payload);
      if (summaryRecoveryWanted && !summaryHasCurrentResources(payload) && !summaryHasConfirmedUnavailable(payload) && withinInitialSummaryGrace()) {
        renderStatistics(payload.statistics);
        return;
      }
      settleInitialSummaryGrace();
      renderSummary(payload);
      summarySeen = true;
      if (summaryRecoveryWanted) settlePartialSummary();
      document.dispatchEvent(new CustomEvent("webr:home-summary-ready", {
        detail: { ok: true, complete: !summaryRecoveryWanted }
      }));
    }).catch(function retainHealthySections(error) {
      if (epoch !== summaryRecoveryEpoch || !summaryRecoveryVisible()) return;
      summaryRecoveryWanted = !error || error.terminalDenial !== true;
      var confirmed = !!error && error.confirmedUnavailable === true;
      if (!confirmed && withinInitialSummaryGrace()) return;
      settleInitialSummaryGrace();
      if (!summarySeen || error && error.terminalDenial === true) renderFallback(confirmed);
      else {
        if (confirmed) settleConfirmedPendingLanes();
        settlePartialSummary();
      }
      document.dispatchEvent(new CustomEvent("webr:home-summary-ready", {
        detail: { ok: false, complete: false }
      }));
    }).finally(function finishSummaryRecovery() {
      summaryRecoveryController = null;
      summaryRecoveryInFlight = false;
      if (refs) refs.section.querySelectorAll(".webr-home-compact__lane-retry").forEach(function enableRetry(button) { button.disabled = false; });
      var interval = summaryRetryDelays[summaryRecoveryAttempt++];
      if (!interval) {
        // Prepared sources can finish after the first few quick reads. Keep
        // this initial window bounded, then return to the normal backoff.
        interval = Date.now() < summaryQuickRecoveryDeadline
          ? 3000 + Math.floor(Math.random() * 1000)
          : 15000 + Math.floor(Math.random() * 5000);
      }
      scheduleSummaryRecovery(epoch === summaryRecoveryEpoch ? interval : 0);
    });
  }

  function loadSummary() {
    summaryInitialDeadline = Date.now() + 12000;
    summaryQuickRecoveryDeadline = Date.now() + 30000;
    summaryRecoveryWanted = true;
    scheduleSummaryRecovery(0);
  }

  function setMain() {
    var root = document.getElementById("div_main");
    if (!root || root.dataset.webrCompactPortal === "20261011_1930_lane_states") {
      return;
    }
    root.dataset.webrCompactPortal = "20261011_1930_lane_states";
    root.replaceChildren();
    var main = element("main", "webr-home-compact");
    main.appendChild(heroSection());
    main.appendChild(portalSection());
    root.appendChild(main);
    loadNotices();
    loadSummary();
  }

  document.addEventListener("visibilitychange", function updateSummaryRecoveryVisibility() {
    if (summaryRecoveryVisible()) {
      updateActivityTimes();
      scheduleActivityTimes();
      scheduleSummaryRecovery(0);
    } else {
      cancelActivityTimeTimer();
      cancelSummaryRecoveryWork();
    }
  });
  window.addEventListener("pagehide", function suspendSummaryRecovery() {
    summaryRecoverySuspended = true;
    cancelActivityTimeTimer();
    cancelSummaryRecoveryWork();
  });
  window.addEventListener("pageshow", function resumeSummaryRecovery() {
    summaryRecoverySuspended = false;
    updateActivityTimes();
    scheduleActivityTimes();
    scheduleSummaryRecovery(0);
  });

  window.addEventListener("webr:language-change", function relocalizeNumbersAndTimes() {
    if (!refs) return;
    if (latestStatistics) renderStatistics(latestStatistics);
    if (latestActivity) renderActivity(latestActivity, latestActivityUnavailable);
  });

  window.set_main = setMain;
})(window, document);
