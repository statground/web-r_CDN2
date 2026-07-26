(function installWebRHomeContentBalance202607260949(window, document) {
  "use strict";

  if (window.__webrHomeContentBalance202607260949Installed) {
    return;
  }
  window.__webrHomeContentBalance202607260949Installed = true;

  var previousSetMain = window.set_main;
  var endpoint = "/homepage/content-summary/";
  var latestPayload = null;
  var loading = false;
  var observer = null;
  var abortController = null;
  var refs = null;

  var contentSections = [
    {
      key: "rcommunity",
      label: "R Community",
      href: "/community/",
      empty: "R Community의 최신 요약을 확인하세요."
    },
    {
      key: "community",
      label: "커뮤니티",
      href: "/community/",
      empty: "커뮤니티의 최신 글을 확인하세요."
    },
    {
      key: "books",
      label: "도서",
      href: "/book/",
      empty: "새로 소개된 R 도서를 확인하세요."
    },
    {
      key: "packages",
      label: "R 패키지",
      href: "/r-ecosystem/packages/",
      empty: "최근 관측된 R 패키지를 확인하세요."
    },
    {
      key: "ecosystem",
      label: "R 에코시스템",
      href: "/r-ecosystem/",
      empty: "R 생태계의 최신 소식을 확인하세요."
    },
    {
      key: "workshops",
      label: "워크샵",
      href: "/workshop/",
      empty: "예정된 워크샵과 행사를 확인하세요."
    }
  ];

  var serviceLinks = [
    { label: "Web-R 2.0", href: "/webr/2.0/", state: "분석 도구 보기" },
    { label: "샘플 ROC", href: "/webr/roc-analysis/sample/", state: "로그인 없이 실행" },
    { label: "Notebook", href: "/webr/notebook/", state: "코드 작업 공간" },
    { label: "Classic", href: "/webr/", state: "기존 기능 유지" }
  ];

  function createElement(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = String(text);
    }
    return node;
  }

  function createLink(href, className, text) {
    var link = createElement("a", className, text);
    link.href = safeRelativeHref(href, "/");
    return link;
  }

  function cleanText(value, maxLength) {
    var text = String(value === undefined || value === null ? "" : value)
      .replace(/\s+/g, " ")
      .trim();
    if (maxLength && text.length > maxLength) {
      return text.slice(0, Math.max(1, maxLength - 1)).trimEnd() + "…";
    }
    return text;
  }

  function safeRelativeHref(value, fallback) {
    var candidate = cleanText(value, 2048);
    var safeFallback = fallback || "/";
    if (!candidate || candidate.indexOf("\\") >= 0 || candidate.indexOf("//") === 0) {
      return safeFallback;
    }
    try {
      var resolved = new URL(candidate, window.location.origin);
      if (resolved.origin !== window.location.origin || resolved.pathname.indexOf("/") !== 0) {
        return safeFallback;
      }
      return resolved.pathname + resolved.search + resolved.hash;
    } catch (error) {
      return safeFallback;
    }
  }

  function formatDate(value) {
    var raw = cleanText(value, 80);
    if (!raw) {
      return "";
    }
    var kstCalendarDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/);
    var hasExplicitZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
    if (kstCalendarDate && !hasExplicitZone) {
      return kstCalendarDate[1] + ". " + kstCalendarDate[2] + ". " + kstCalendarDate[3] + ".";
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
      }).format(parsed);
    } catch (error) {
      return "";
    }
  }

  function createSkeleton() {
    var wrapper = createElement("div", "webr-home-balance__skeleton");
    var lines = createElement("div", "webr-home-balance__skeleton-lines");
    for (var index = 0; index < 3; index += 1) {
      lines.appendChild(createElement("div", "webr-home-balance__skeleton-line"));
    }
    wrapper.appendChild(lines);
    return wrapper;
  }

  function createCard(definition) {
    var article = createElement("article", "webr-home-balance__card");
    article.dataset.section = definition.key;

    var header = createElement("div", "webr-home-balance__card-header");
    header.appendChild(createElement("span", "webr-home-balance__badge", definition.label));
    header.appendChild(createLink(definition.href, "webr-home-balance__more", "더 보기"));
    article.appendChild(header);

    var body = createElement("div", "webr-home-balance__card-body");
    body.appendChild(createSkeleton());
    article.appendChild(body);
    return { article: article, body: body };
  }

  function createSideCard(title, extraClass) {
    var card = createElement("aside", "webr-home-balance__side-card" + (extraClass ? " " + extraClass : ""));
    var header = createElement("div", "webr-home-balance__side-header");
    header.appendChild(createElement("h3", "webr-home-balance__side-title", title));
    card.appendChild(header);
    var body = createElement("div", "webr-home-balance__side-body");
    card.appendChild(body);
    return { card: card, header: header, body: body };
  }

  function createServiceStatusCard() {
    var statusCard = createSideCard("Web-R 현황");
    var list = createElement("ul", "webr-home-balance__service-list");
    serviceLinks.forEach(function appendService(service) {
      var item = createElement("li");
      var link = createLink(service.href, "webr-home-balance__service-link");
      link.appendChild(createElement("span", "webr-home-balance__service-name", service.label));
      link.appendChild(createElement("span", "webr-home-balance__service-state", service.state));
      item.appendChild(link);
      list.appendChild(item);
    });
    statusCard.body.appendChild(list);
    return statusCard.card;
  }

  function buildBalanceSection() {
    var section = createElement("section", "webr-home-balance");
    section.id = "webr-home-content-balance";
    section.dataset.webrHomeBalance = "20260726_0949";
    section.setAttribute("aria-labelledby", "webr-home-content-balance-title");
    section.setAttribute("aria-busy", "false");

    var header = createElement("div", "webr-home-balance__header");
    var heading = createElement("div");
    heading.appendChild(createElement("p", "webr-home-balance__eyebrow", "Web-R와 R 생태계"));
    var title = createElement("h2", "webr-home-balance__title", "새로 올라온 R 자료 모아보기");
    title.id = "webr-home-content-balance-title";
    heading.appendChild(title);
    heading.appendChild(createElement(
      "p",
      "webr-home-balance__description",
      "분석 도구와 함께 R Community, 커뮤니티, 도서, 패키지, 생태계 소식과 워크샵의 최신 흐름을 한곳에서 확인하세요."
    ));
    header.appendChild(heading);

    var refresh = createElement("button", "webr-home-balance__refresh", "최신 자료 새로고침");
    refresh.type = "button";
    refresh.dataset.webrHomeBalanceRefresh = "true";
    refresh.addEventListener("click", function refreshSummary() {
      loadSummary(true);
    });
    header.appendChild(refresh);
    section.appendChild(header);

    var quick = createElement("nav", "webr-home-balance__quick");
    quick.setAttribute("aria-label", "R 자료 바로가기");
    contentSections.forEach(function appendQuickLink(definition) {
      quick.appendChild(createLink(definition.href, "webr-home-balance__quick-link", definition.label));
    });
    section.appendChild(quick);

    var status = createElement("p", "webr-home-balance__status", "화면에 가까워지면 최신 자료를 한 번에 불러옵니다.");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    section.appendChild(status);

    var dashboard = createElement("div", "webr-home-balance__dashboard");
    var categories = createElement("div", "webr-home-balance__categories");
    var categoryBodies = {};
    contentSections.forEach(function appendCategory(definition) {
      var card = createCard(definition);
      categoryBodies[definition.key] = card.body;
      categories.appendChild(card.article);
    });
    dashboard.appendChild(categories);

    var side = createElement("div", "webr-home-balance__side");
    side.appendChild(createServiceStatusCard());

    var noticeCard = createSideCard("공지사항");
    var noticeMore = createLink("/intro/notice/", "webr-home-balance__more", "더 보기");
    noticeCard.header.appendChild(noticeMore);
    noticeCard.body.appendChild(createSkeleton());
    side.appendChild(noticeCard.card);

    var mediaCard = createSideCard("강의 · 유튜브");
    mediaCard.body.appendChild(createSkeleton());
    side.appendChild(mediaCard.card);

    var activityCard = createSideCard("지금 Web-R", "webr-home-balance__activity");
    activityCard.body.appendChild(createSkeleton());
    side.appendChild(activityCard.card);

    dashboard.appendChild(side);
    section.appendChild(dashboard);

    refs = {
      section: section,
      refresh: refresh,
      status: status,
      categoryBodies: categoryBodies,
      noticeBody: noticeCard.body,
      mediaBody: mediaCard.body,
      activityBody: activityCard.body
    };
    return section;
  }

  function normalizedItems(payload, key) {
    var sections = payload && payload.sections && typeof payload.sections === "object" ? payload.sections : {};
    var items = Array.isArray(sections[key]) ? sections[key] : [];
    return items.slice(0, 3).filter(function validItem(item) {
      return item && typeof item === "object" && cleanText(item.title, 180);
    });
  }

  function renderItems(target, items, definition) {
    target.replaceChildren();
    if (!items.length) {
      var empty = createLink(definition.href, "webr-home-balance__empty", definition.empty);
      target.appendChild(empty);
      return;
    }
    var list = createElement("ul", "webr-home-balance__list");
    items.forEach(function appendItem(item) {
      var row = createElement("li", "webr-home-balance__item");
      var link = createLink(item.href, "webr-home-balance__item-link");
      link.appendChild(createElement("p", "webr-home-balance__item-title", cleanText(item.title, 120)));
      var meta = [cleanText(item.kind, 36), formatDate(item.published_at)].filter(Boolean).join(" · ");
      if (meta) {
        link.appendChild(createElement("span", "webr-home-balance__item-meta", meta));
      }
      var summary = cleanText(item.summary, 120);
      if (summary) {
        link.appendChild(createElement("p", "webr-home-balance__item-summary", summary));
      }
      row.appendChild(link);
      list.appendChild(row);
    });
    target.appendChild(list);
  }

  function renderCompactItems(target, items, fallbackHref, emptyText) {
    target.replaceChildren();
    if (!items.length) {
      target.appendChild(createLink(fallbackHref, "webr-home-balance__compact-link", emptyText));
      return;
    }
    items.slice(0, 3).forEach(function appendCompact(item) {
      var label = cleanText(item.title, 95);
      var date = formatDate(item.published_at);
      target.appendChild(createLink(
        item.href || fallbackHref,
        "webr-home-balance__compact-link",
        date ? label + " · " + date : label
      ));
    });
  }

  function renderMedia(payload) {
    refs.mediaBody.replaceChildren();
    var groups = [
      {
        label: "R 강의",
        key: "lectures",
        href: "/workshop/lecture/",
        empty: "강의 전체 보기"
      },
      {
        label: "유튜브",
        key: "youtube",
        href: "/workshop/youtube/",
        empty: "유튜브 전체 보기"
      }
    ];
    groups.forEach(function appendGroup(group) {
      var wrapper = createElement("div", "webr-home-balance__media-group");
      wrapper.appendChild(createElement("p", "webr-home-balance__media-label", group.label));
      var list = createElement("div");
      renderCompactItems(list, normalizedItems(payload, group.key).slice(0, 2), group.href, group.empty);
      wrapper.appendChild(list);
      refs.mediaBody.appendChild(wrapper);
    });
  }

  function renderActivity(payload) {
    refs.activityBody.replaceChildren();
    var items = normalizedItems(payload, "activity");
    if (!items.length) {
      refs.activityBody.appendChild(createLink(
        "/webr/2.0/",
        "webr-home-balance__compact-link",
        "현재 이용할 수 있는 Web-R 기능 보기"
      ));
      return;
    }
    var list = createElement("ul", "webr-home-balance__activity-list");
    items.forEach(function appendActivity(item) {
      var row = createElement("li", "webr-home-balance__activity-item", cleanText(item.title, 110));
      var date = formatDate(item.published_at);
      if (date) {
        row.appendChild(createElement("span", "webr-home-balance__activity-time", date));
      }
      list.appendChild(row);
    });
    refs.activityBody.appendChild(list);
  }

  function renderPayload(payload) {
    if (!refs || !refs.section.isConnected) {
      latestPayload = payload;
      return;
    }
    contentSections.forEach(function renderContentSection(definition) {
      renderItems(refs.categoryBodies[definition.key], normalizedItems(payload, definition.key), definition);
    });
    renderCompactItems(
      refs.noticeBody,
      normalizedItems(payload, "notices"),
      "/intro/notice/",
      "공지사항 전체 보기"
    );
    renderMedia(payload);
    renderActivity(payload);
    refs.status.textContent = "최신 자료를 불러왔습니다. 각 카드를 선택하면 해당 Web-R 화면으로 이동합니다.";
    refs.section.dataset.webrHomeBalanceState = "ready";
  }

  function renderFailure() {
    if (!refs || !refs.section.isConnected) {
      return;
    }
    contentSections.forEach(function renderContentFallback(definition) {
      renderItems(refs.categoryBodies[definition.key], [], definition);
    });
    renderCompactItems(refs.noticeBody, [], "/intro/notice/", "공지사항 전체 보기");
    renderMedia({ sections: {} });
    renderActivity({ sections: {} });
    refs.status.textContent = "최신 자료를 불러오지 못했습니다. 바로가기와 각 메뉴는 정상적으로 이용할 수 있습니다.";
    refs.section.dataset.webrHomeBalanceState = "fallback";
  }

  function setLoadingState(nextLoading) {
    loading = nextLoading;
    if (!refs || !refs.section.isConnected) {
      return;
    }
    refs.refresh.disabled = nextLoading;
    refs.section.setAttribute("aria-busy", nextLoading ? "true" : "false");
    refs.refresh.textContent = nextLoading ? "최신 자료 불러오는 중" : "최신 자료 새로고침";
    if (nextLoading) {
      refs.status.textContent = "최신 R 자료와 Web-R 소식을 불러오고 있습니다.";
      refs.section.dataset.webrHomeBalanceState = "loading";
    }
  }

  function loadSummary(force) {
    if (loading || (latestPayload && !force)) {
      if (latestPayload) {
        renderPayload(latestPayload);
      }
      return;
    }
    setLoadingState(true);
    if (abortController) {
      abortController.abort();
    }
    abortController = typeof AbortController === "function" ? new AbortController() : null;
    var timeoutID = window.setTimeout(function abortSlowRequest() {
      if (abortController) {
        abortController.abort();
      }
    }, 12000);
    fetch(endpoint, {
      method: "GET",
      credentials: "same-origin",
      cache: force ? "reload" : "default",
      headers: { Accept: "application/json" },
      signal: abortController ? abortController.signal : undefined
    }).then(function parseResponse(response) {
      if (!response.ok) {
        throw new Error("summary unavailable");
      }
      return response.json();
    }).then(function acceptPayload(payload) {
      if (!payload || payload.ok !== true || !payload.sections) {
        throw new Error("summary incomplete");
      }
      latestPayload = payload;
      renderPayload(payload);
      document.dispatchEvent(new CustomEvent("webr:home-content-summary", {
        detail: { ok: true }
      }));
    }).catch(function handleFailure() {
      if (!latestPayload) {
        renderFailure();
      } else {
        renderPayload(latestPayload);
      }
      document.dispatchEvent(new CustomEvent("webr:home-content-summary", {
        detail: { ok: false }
      }));
    }).finally(function finishLoad() {
      window.clearTimeout(timeoutID);
      setLoadingState(false);
    });
  }

  function observeSection(section) {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (latestPayload) {
      renderPayload(latestPayload);
      return;
    }
    if (typeof IntersectionObserver !== "function") {
      refs.status.textContent = "최신 자료 새로고침 버튼을 누르면 한 번에 불러옵니다.";
      return;
    }
    observer = new IntersectionObserver(function onIntersection(entries) {
      if (!entries.some(function isVisible(entry) { return entry.isIntersecting; })) {
        return;
      }
      observer.disconnect();
      observer = null;
      loadSummary(false);
    }, { rootMargin: "420px 0px" });
    observer.observe(section);
  }

  function mountBalanceSection() {
    var heroSection = document.querySelector(
      '#div_main > main > section[aria-labelledby="webr-home-title"]'
    );
    if (!heroSection) {
      return;
    }
    var existing = document.getElementById("webr-home-content-balance");
    if (existing && existing.parentElement === heroSection) {
      return;
    }
    var section = buildBalanceSection();
    heroSection.appendChild(section);
    if (latestPayload) {
      renderPayload(latestPayload);
    } else {
      observeSection(section);
    }
  }

  function balancedSetMain() {
    if (typeof previousSetMain === "function") {
      previousSetMain.apply(window, arguments);
    }
    mountBalanceSection();
  }

  window.set_main = balancedSetMain;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountBalanceSection, { once: true });
  } else {
    mountBalanceSection();
  }
})(window, document);
