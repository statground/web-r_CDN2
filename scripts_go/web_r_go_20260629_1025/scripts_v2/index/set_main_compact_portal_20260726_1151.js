(function installWebRCompactPortal202607261151(window, document) {
  "use strict";

  if (window.__webrCompactPortal202607261151Installed) {
    return;
  }
  window.__webrCompactPortal202607261151Installed = true;

  var summaryEndpoint = "/homepage/content-summary/";
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
      label: "무료 서버 접속",
      description: "기존 Web-R 무료 분석 서버",
      href: "/webr/",
      tone: "blue"
    },
    {
      label: "정회원 서버",
      description: "정회원 전용 분석 환경",
      href: "/webr/member/",
      tone: "cyan"
    },
    {
      label: "Web-R 2.0",
      description: "새 분석 도구 모음",
      href: "/webr/2.0/",
      tone: "violet"
    },
    {
      label: "Web-R Notebook",
      description: "R 코드와 문서 작업 공간",
      href: "/webr/notebook/",
      tone: "emerald"
    }
  ];
  var refs = null;
  var summaryRequest = null;

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

  function relativeTime(value) {
    var raw = cleanText(value, 80);
    if (!raw) {
      return "";
    }
    var normalized = raw.indexOf("T") >= 0 ? raw : raw.replace(" ", "T") + "+09:00";
    var parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      return formatDate(raw);
    }
    var seconds = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000));
    if (seconds < 60) {
      return "방금 전";
    }
    if (seconds < 3600) {
      return Math.floor(seconds / 60) + "분 전";
    }
    if (seconds < 86400) {
      return Math.floor(seconds / 3600) + "시간 전";
    }
    if (seconds < 604800) {
      return Math.floor(seconds / 86400) + "일 전";
    }
    return formatDate(raw);
  }

  function numberText(value, unit) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return "집계 중";
    }
    return new Intl.NumberFormat("ko-KR").format(Math.floor(parsed)) + unit;
  }

  function newBadge() {
    var badge = element("span", "webr-home-compact__new", "NEW");
    badge.setAttribute("aria-label", "새 콘텐츠");
    return badge;
  }

  function skeleton(lines) {
    var wrapper = element("div", "webr-home-compact__skeleton");
    for (var index = 0; index < lines; index += 1) {
      wrapper.appendChild(element("span", "webr-home-compact__skeleton-line"));
    }
    return wrapper;
  }

  function productCard(item) {
    var card = link(item.href, "webr-home-compact__product-card webr-home-compact__product-card--" + item.tone);
    var title = element("strong", "webr-home-compact__product-title", item.label);
    var description = element("span", "webr-home-compact__product-description", item.description);
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
    var title = element("h1", "webr-home-compact__title", "웹에서 하는 R 통계");
    title.id = "webr-home-title";
    identity.appendChild(title);
    identity.appendChild(element(
      "p",
      "webr-home-compact__lead",
      "\"웹에서 하는 R통계\"는, 통계에는 관심이 있으나 R을 어려워하는 여러 연구자들을 위한 프로젝트입니다."
    ));
    identity.appendChild(element(
      "p",
      "webr-home-compact__lead",
      "R설치없이 클릭만으로 웹에 있는 서버를 이용하여 통계분석을 하고 보다 R을 쉽게 사용하기 위한 패키지 및 앱 공동개발을 목표로 하고 있습니다."
    ));

    var primaryActions = element("div", "webr-home-compact__actions");
    primaryActions.appendChild(link("/webr/", "webr-home-compact__button webr-home-compact__button--primary", "무료 서버 접속"));
    primaryActions.appendChild(link("/webr/2.0/", "webr-home-compact__button webr-home-compact__button--secondary", "Web-R 2.0"));
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
    header.appendChild(link(definition.href, "webr-home-compact__category-title", definition.label));
    header.appendChild(link(definition.href, "webr-home-compact__more", "더 보기"));
    card.appendChild(header);
    var body = element("div", "webr-home-compact__category-body");
    body.appendChild(skeleton(2));
    card.appendChild(body);
    return { card: card, body: body };
  }

  function railCard(title, href, className) {
    var card = element("section", "webr-home-compact__rail-card" + (className ? " " + className : ""));
    var header = element("div", "webr-home-compact__rail-header");
    header.appendChild(element("h3", "webr-home-compact__rail-title", title));
    if (href) {
      header.appendChild(link(href, "webr-home-compact__more", "더 보기"));
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
      var icon = element("span", "webr-home-compact__stat-icon", row.icon);
      icon.setAttribute("aria-hidden", "true");
      item.appendChild(icon);
      var copy = element("span", "webr-home-compact__stat-copy");
      copy.appendChild(element("span", "webr-home-compact__stat-label", row.label));
      var value = element("strong", "webr-home-compact__stat-value", "집계 중");
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
    copy.appendChild(element("p", "webr-home-compact__eyebrow", "R 자료와 Web-R 소식"));
    var title = element("h2", "webr-home-compact__section-title", "새로 올라온 R 자료 모아보기");
    title.id = "webr-home-portal-title";
    copy.appendChild(title);
    copy.appendChild(element("p", "webr-home-compact__section-description", "각 영역에서 가장 최근 자료 한 건만 빠르게 확인하세요."));
    heading.appendChild(copy);
    var status = element("p", "webr-home-compact__status", "최신 자료를 불러오고 있습니다.");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    heading.appendChild(status);
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
    media.body.appendChild(skeleton(2));
    rail.appendChild(media.card);

    var activity = railCard("지금 Web-R", "", "webr-home-compact__rail-card--activity");
    activity.body.appendChild(skeleton(3));
    rail.appendChild(activity.card);
    layout.appendChild(rail);
    section.appendChild(layout);

    refs = {
      section: section,
      status: status,
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

  function renderCategory(definition, item) {
    var body = refs.categoryBodies[definition.key];
    body.replaceChildren();
    if (!item) {
      body.appendChild(link(definition.href, "webr-home-compact__empty", definition.label + " 전체 보기"));
      return;
    }
    var anchor = link(item.href || definition.href, "webr-home-compact__article");
    var titleRow = element("span", "webr-home-compact__article-title-row");
    titleRow.appendChild(element("strong", "webr-home-compact__article-title", cleanText(item.title, 72)));
    if (item.is_new === true) {
      titleRow.appendChild(newBadge());
    }
    anchor.appendChild(titleRow);
    var meta = formatDate(item.published_at);
    if (meta) {
      anchor.appendChild(element("span", "webr-home-compact__article-meta", meta));
    }
    var summary = cleanText(item.summary, 88);
    if (summary) {
      anchor.appendChild(element("span", "webr-home-compact__article-summary", summary));
    }
    body.appendChild(anchor);
  }

  function renderStatistics(statistics) {
    var values = statistics && typeof statistics === "object" ? statistics : {};
    refs.statisticsBody.querySelectorAll("[data-stat-key]").forEach(function updateValue(node) {
      node.textContent = numberText(values[node.dataset.statKey], node.dataset.statUnit || "");
    });
  }

  function renderNotices(items) {
    refs.noticesBody.replaceChildren();
    var rows = items.slice(0, 3);
    if (!rows.length) {
      refs.noticesBody.appendChild(link("/intro/notice/", "webr-home-compact__empty", "공지사항 전체 보기"));
      return;
    }
    var list = element("div", "webr-home-compact__notice-list");
    rows.forEach(function appendNotice(item) {
      var anchor = link(item.href || "/intro/notice/", "webr-home-compact__notice");
      var titleRow = element("span", "webr-home-compact__notice-title-row");
      titleRow.appendChild(element("strong", "webr-home-compact__notice-title", cleanText(item.title, 76)));
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
    var youtube = normalizedItems(payload, "youtube");
    var candidates = [];
    lectures.forEach(function addLecture(item) {
      candidates.push({ type: "강의", root: "/workshop/lecture/", item: item });
    });
    youtube.forEach(function addYoutube(item) {
      candidates.push({ type: "YouTube", root: "/workshop/youtube/", item: item });
    });
    candidates.sort(function newestFirst(left, right) {
      return cleanText(right.item.published_at, 80).localeCompare(cleanText(left.item.published_at, 80));
    });
    return candidates[0] || null;
  }

  function renderMedia(payload) {
    refs.mediaBody.replaceChildren();
    var media = featuredMedia(payload);
    var existingMore = refs.mediaHeader.querySelector(".webr-home-compact__more");
    if (!media) {
      refs.mediaBody.appendChild(link("/workshop/", "webr-home-compact__empty", "강의와 YouTube 전체 보기"));
      return;
    }
    if (existingMore) {
      existingMore.href = media.root;
    }
    var anchor = link(media.item.href || media.root, "webr-home-compact__media");
    var imageURL = cleanText(media.item.image, 2048);
    if (imageURL.indexOf("https://") === 0) {
      var image = element("img", "webr-home-compact__media-image");
      image.src = imageURL;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      anchor.appendChild(image);
    } else {
      anchor.appendChild(element("span", "webr-home-compact__media-placeholder", media.type));
    }
    var type = element("span", "webr-home-compact__media-type", media.type);
    anchor.appendChild(type);
    var titleRow = element("span", "webr-home-compact__media-title-row");
    titleRow.appendChild(element("strong", "webr-home-compact__media-title", cleanText(media.item.title, 88)));
    if (media.item.is_new === true) {
      titleRow.appendChild(newBadge());
    }
    anchor.appendChild(titleRow);
    var date = formatDate(media.item.published_at);
    if (date) {
      anchor.appendChild(element("span", "webr-home-compact__media-date", date));
    }
    refs.mediaBody.appendChild(anchor);
  }

  function renderActivity(items) {
    refs.activityBody.replaceChildren();
    var rows = items.slice(0, 3);
    if (!rows.length) {
      refs.activityBody.appendChild(element("p", "webr-home-compact__activity-empty", "표시할 최근 활동이 없습니다."));
      return;
    }
    var list = element("div", "webr-home-compact__activity-list");
    rows.forEach(function appendActivity(item) {
      var row = element("div", "webr-home-compact__activity-item");
      row.appendChild(element("strong", "webr-home-compact__activity-title", cleanText(item.title, 100)));
      var time = relativeTime(item.published_at);
      if (time) {
        row.appendChild(element("span", "webr-home-compact__activity-time", time));
      }
      list.appendChild(row);
    });
    refs.activityBody.appendChild(list);
  }

  function renderSummary(payload) {
    categories.forEach(function renderOneCategory(definition) {
      renderCategory(definition, normalizedItems(payload, definition.key)[0] || null);
    });
    renderStatistics(payload.statistics);
    renderNotices(normalizedItems(payload, "notices"));
    renderMedia(payload);
    renderActivity(normalizedItems(payload, "activity"));
    refs.section.setAttribute("aria-busy", "false");
    refs.section.dataset.homeSummaryState = "ready";
    refs.status.textContent = "최신 자료";
  }

  function renderFallback() {
    categories.forEach(function renderFallbackCategory(definition) {
      renderCategory(definition, null);
    });
    renderStatistics({});
    renderNotices([]);
    renderMedia({ sections: {} });
    renderActivity([]);
    refs.section.setAttribute("aria-busy", "false");
    refs.section.dataset.homeSummaryState = "fallback";
    refs.status.textContent = "일부 자료 집계가 지연되고 있습니다.";
  }

  function loadSummary() {
    if (summaryRequest) {
      return summaryRequest;
    }
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeoutID = window.setTimeout(function abortSlowSummary() {
      if (controller) {
        controller.abort();
      }
    }, 12000);
    summaryRequest = fetch(summaryEndpoint, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined
    }).then(function parseResponse(response) {
      if (!response.ok) {
        throw new Error("homepage summary unavailable");
      }
      return response.json();
    }).then(function acceptSummary(payload) {
      if (!payload || payload.ok !== true || !payload.sections || !payload.statistics) {
        throw new Error("homepage summary incomplete");
      }
      renderSummary(payload);
      document.dispatchEvent(new CustomEvent("webr:home-summary-ready", { detail: { ok: true } }));
      return payload;
    }).catch(function summaryFailed() {
      renderFallback();
      document.dispatchEvent(new CustomEvent("webr:home-summary-ready", { detail: { ok: false } }));
      return null;
    }).finally(function summaryFinished() {
      window.clearTimeout(timeoutID);
    });
    return summaryRequest;
  }

  function setMain() {
    var root = document.getElementById("div_main");
    if (!root || root.dataset.webrCompactPortal === "20260726_1151") {
      return;
    }
    root.dataset.webrCompactPortal = "20260726_1151";
    root.replaceChildren();
    var main = element("main", "webr-home-compact");
    main.appendChild(heroSection());
    main.appendChild(portalSection());
    root.appendChild(main);
    loadSummary();
  }

  window.set_main = setMain;
})(window, document);
