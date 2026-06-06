(function () {
  const STYLE_ID = "webr-admin-members-graph-fix-style-20260606-1158";
  const MODE_ATTR = "data-webr-admin-members-mode";
  const ROLE_GRAPH_CLASS = "webr-admin-members-role-graph-card";
  const JOINED_GRAPH_CLASS = "webr-admin-members-joined-graph-card";
  const ACTIVE_TAB_CLASS = "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active cursor-pointer";
  const INACTIVE_TAB_CLASS = "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 cursor-pointer";
  const GRAPH_TAB_IDS = ["graph_tab_daily", "graph_tab_monthly", "graph_tab_yearly"];
  const ROLE_ORDER = ["준회원", "정회원", "VIP회원", "팀/정회원", "팀/VIP회원", "기관/팀 회원"];
  const ROLE_COLORS = {
    "준회원": "#94a3b8",
    "정회원": "#2563eb",
    "VIP회원": "#7c3aed",
    "팀/정회원": "#0f766e",
    "팀/VIP회원": "#db2777",
    "기관/팀 회원": "#0891b2"
  };

  let scheduled = false;

  function currentMode() {
    const path = window.location.pathname || "";
    const sub = String(window.sub || "");
    return sub === "members_list" || path.indexOf("/admin/members/list/") === 0 ? "list" : "overview";
  }

  function contentColumn() {
    const root = document.getElementById("div_main");
    const dashboard = root && root.querySelector(".webr-admin-members-dashboard");
    if (!dashboard || !dashboard.children || dashboard.children.length < 2) return null;
    return dashboard.children[1];
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2){display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important;align-items:stretch!important;}",
      "@media (min-width:1024px){html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2){grid-template-columns:repeat(2,minmax(0,1fr))!important;}}",
      "html[" + MODE_ATTR + "='overview'] ." + JOINED_GRAPH_CLASS + ",html[" + MODE_ATTR + "='overview'] ." + ROLE_GRAPH_CLASS + ",html[" + MODE_ATTR + "='overview'] [data-webr-members-card='joined_graph'],html[" + MODE_ATTR + "='overview'] [data-webr-members-card='role_graph']{grid-column:1/-1!important;width:100%!important;max-width:none!important;min-width:0!important;}",
      "html[" + MODE_ATTR + "='overview'] ." + JOINED_GRAPH_CLASS + "{order:5!important;}",
      "html[" + MODE_ATTR + "='overview'] ." + ROLE_GRAPH_CLASS + "{order:6!important;}",
      "html[" + MODE_ATTR + "='overview'] ." + ROLE_GRAPH_CLASS + ">div{width:100%!important;text-align:left!important;}",
      "html[" + MODE_ATTR + "='overview'] ." + ROLE_GRAPH_CLASS + " dl{width:100%!important;max-width:none!important;margin:0!important;}",
      ".webr-admin-members-role-graph-heading{margin:0 0 .75rem;color:#111827;font-size:1rem;font-weight:850;line-height:1.2;text-align:left;}",
      "#div_statistics_graph{width:100%!important;min-height:500px!important;}",
      "@media (max-width:767px){#div_statistics_graph{min-height:360px!important;padding:.5rem!important;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function setModeAttribute() {
    document.documentElement.setAttribute(MODE_ATTR, currentMode());
  }

  function setPriorityStyle(node, name, value) {
    if (node && node.style.getPropertyValue(name) !== value) {
      node.style.setProperty(name, value, "important");
    }
  }

  function forceFullRow(card, name, className, order) {
    if (!card) return;
    if (!card.classList.contains(className)) card.classList.add(className);
    if (card.getAttribute("data-webr-members-card") !== name) card.setAttribute("data-webr-members-card", name);
    setPriorityStyle(card, "grid-column", "1 / -1");
    setPriorityStyle(card, "width", "100%");
    setPriorityStyle(card, "max-width", "none");
    setPriorityStyle(card, "min-width", "0px");
    setPriorityStyle(card, "align-self", "stretch");
    setPriorityStyle(card, "order", String(order));
  }

  function findRoleGraphCard(content) {
    if (!content) return null;
    const graphEl = content.querySelector("#div_statistics_graph");
    if (!graphEl) return null;
    let node = graphEl;
    while (node && node.parentElement !== content) node = node.parentElement;
    return node && node.parentElement === content ? node : null;
  }

  function ensureRoleHeading(roleCard) {
    if (!roleCard || roleCard.querySelector(".webr-admin-members-role-graph-heading")) return;
    const body = roleCard.firstElementChild || roleCard;
    const tabs = body.querySelector("ul");
    const heading = document.createElement("h5");
    heading.className = "webr-admin-members-role-graph-heading";
    heading.textContent = "등급별 회원 수 추이";
    if (tabs && tabs.parentElement) tabs.parentElement.insertBefore(heading, tabs);
    else body.insertBefore(heading, body.firstChild);
  }

  function ensureGraphRows() {
    if (currentMode() !== "overview") return;
    const content = contentColumn();
    if (!content) return;
    const joinedCard = content.querySelector(":scope > ." + JOINED_GRAPH_CLASS + ",:scope > [data-webr-members-card='joined_graph']");
    const roleCard = findRoleGraphCard(content);
    if (joinedCard) forceFullRow(joinedCard, "joined_graph", JOINED_GRAPH_CLASS, 5);
    if (roleCard) {
      forceFullRow(roleCard, "role_graph", ROLE_GRAPH_CLASS, 6);
      ensureRoleHeading(roleCard);
      if (joinedCard && joinedCard.nextElementSibling !== roleCard) {
        content.insertBefore(joinedCard, roleCard);
      }
    }
  }

  function periodFromTab(activeTabId) {
    if (activeTabId === "graph_tab_daily") return "daily";
    if (activeTabId === "graph_tab_yearly") return "yearly";
    return "monthly";
  }

  function tabFromPeriod(period) {
    if (period === "daily") return "graph_tab_daily";
    if (period === "yearly") return "graph_tab_yearly";
    return "graph_tab_monthly";
  }

  function roleGraphKey(period) {
    if (period === "daily") return "list_role_daily";
    if (period === "yearly") return "list_role_yearly";
    return "list_role_monthly";
  }

  function roleRows(period) {
    const data = window.__webrAdminMembersLastData || {};
    return Object.values(data[roleGraphKey(period)] || {}).map(function (row) {
      const date = String(row && (row.date ?? row.period ?? row.dt ?? row.DATE) || "").trim();
      const role = String(row && (row.role ?? row.role_name ?? row.name ?? row.ROLE) || "").trim();
      const cnt = Number(row && (row.cnt ?? row.count ?? row.CNT ?? row.value)) || 0;
      const paymentCnt = Number(row && (row.payment_cnt ?? row.payment_count ?? row.payments ?? row.PAYMENT_CNT)) || 0;
      return { date: date, role: role, cnt: cnt, paymentCnt: paymentCnt };
    }).filter(function (row) {
      return row.date && row.role;
    }).sort(function (a, b) {
      const dateOrder = String(a.date).localeCompare(String(b.date));
      if (dateOrder !== 0) return dateOrder;
      return roleSort(a.role) - roleSort(b.role) || String(a.role).localeCompare(String(b.role));
    });
  }

  function roleSort(role) {
    const index = ROLE_ORDER.indexOf(role);
    return index >= 0 ? index : ROLE_ORDER.length + 1;
  }

  function parsePeriod(value, period) {
    const parts = String(value || "").split("-").map(function (part) { return Number(part); });
    if (period === "yearly") return new Date(parts[0] || 1970, 0, 1);
    if (period === "monthly") return new Date(parts[0] || 1970, (parts[1] || 1) - 1, 1);
    return new Date(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1);
  }

  function formatPeriod(date, period) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    if (period === "yearly") return String(year);
    if (period === "monthly") return year + "-" + month;
    return year + "-" + month + "-" + String(date.getDate()).padStart(2, "0");
  }

  function incrementPeriod(date, period) {
    if (period === "yearly") date.setFullYear(date.getFullYear() + 1);
    else if (period === "monthly") date.setMonth(date.getMonth() + 1);
    else date.setDate(date.getDate() + 1);
  }

  function categoriesFromRows(rows, period) {
    if (!rows.length) return [];
    const fallback = Array.from(new Set(rows.map(function (row) { return row.date; }))).sort();
    const start = parsePeriod(fallback[0], period);
    const end = parsePeriod(fallback[fallback.length - 1], period);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return fallback;
    const categories = [];
    for (const cursor = new Date(start); cursor <= end; incrementPeriod(cursor, period)) {
      categories.push(formatPeriod(cursor, period));
      if (categories.length > 5000) return fallback;
    }
    return categories;
  }

  function setRoleTabState(period) {
    const activeTabId = tabFromPeriod(period);
    GRAPH_TAB_IDS.forEach(function (id) {
      const tab = document.getElementById(id);
      if (!tab) return;
      tab.className = id === activeTabId ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS;
      tab.setAttribute("aria-selected", id === activeTabId ? "true" : "false");
    });
  }

  function whenEChartsReady(callback, attempt) {
    attempt = attempt || 0;
    if (window.echarts || attempt >= 30) {
      callback();
      return;
    }
    window.setTimeout(function () {
      whenEChartsReady(callback, attempt + 1);
    }, 120);
  }

  function drawRoleGraph(period, force) {
    if (currentMode() !== "overview") return;
    period = period === "daily" || period === "yearly" ? period : "monthly";
    ensureGraphRows();
    const el = document.getElementById("div_statistics_graph");
    if (!el) return;
    setRoleTabState(period);
    const version = String(Number(window.__webrAdminMembersDataVersion) || 0);
    const key = period + "|" + version;
    if (!force && el.dataset.webrRoleRenderedKey === key) return;
    el.dataset.webrRoleRenderedKey = key;
    whenEChartsReady(function () {
      if (!window.echarts) {
        el.innerHTML = '<div class="flex h-full items-center justify-center text-sm text-slate-500">차트 라이브러리를 불러오지 못했습니다.</div>';
        return;
      }
      const rows = roleRows(period);
      const categories = categoriesFromRows(rows, period);
      const roleSet = new Set(rows.map(function (row) { return row.role; }));
      const roles = Array.from(roleSet).sort(function (a, b) {
        return roleSort(a) - roleSort(b) || String(a).localeCompare(String(b));
      });
      const countMap = new Map();
      const paymentMap = new Map();
      rows.forEach(function (row) {
        countMap.set(row.date + "\n" + row.role, row.cnt);
        if (row.paymentCnt > 0 || !paymentMap.has(row.date)) {
          paymentMap.set(row.date, Math.max(Number(paymentMap.get(row.date)) || 0, row.paymentCnt || 0));
        }
      });
      const paymentData = categories.map(function (date) { return Number(paymentMap.get(date)) || 0; });
      const hasPaymentLine = paymentData.some(function (value) { return value > 0; });
      const prev = echarts.getInstanceByDom(el);
      if (prev) prev.dispose();
      const chart = echarts.init(el, null, { renderer: "canvas" });
      const series = roles.map(function (role) {
        return {
          name: role,
          type: "bar",
          stack: "members",
          emphasis: { focus: "series" },
          data: categories.map(function (date) { return Number(countMap.get(date + "\n" + role)) || 0; }),
          itemStyle: { color: ROLE_COLORS[role] || "#64748b" }
        };
      });
      if (hasPaymentLine) {
        series.push({
          name: "결제 건수",
          type: "line",
          yAxisIndex: 1,
          data: paymentData,
          smooth: true,
          symbolSize: 5,
          lineStyle: { width: 2, color: "#f97316" },
          itemStyle: { color: "#f97316" }
        });
      }
      const option = {
        title: { text: "등급별 회원 수 추이", left: "center", top: 0, textStyle: { fontSize: 24, fontWeight: "700" } },
        legend: { data: roles.concat(hasPaymentLine ? ["결제 건수"] : []), top: 38 },
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        toolbox: { right: 10, feature: { dataZoom: { yAxisIndex: "none" }, restore: {}, saveAsImage: {} } },
        grid: { left: 60, right: hasPaymentLine ? 80 : 60, top: 92, bottom: 62 },
        xAxis: { type: "category", data: categories, axisLabel: { interval: "auto", hideOverlap: true } },
        yAxis: hasPaymentLine ? [
          { type: "value", name: "회원 수" },
          { type: "value", name: "결제 건수", minInterval: 1 }
        ] : [{ type: "value", name: "회원 수" }],
        dataZoom: [{ type: "inside", xAxisIndex: 0, start: 0, end: 100 }, { type: "slider", xAxisIndex: 0, start: 0, end: 100 }],
        series: series
      };
      if (!categories.length) {
        option.graphic = { type: "text", left: "center", top: "middle", style: { text: "표시할 등급별 회원 데이터가 없습니다.", fill: "#64748b", fontSize: 14 } };
      }
      chart.setOption(option, true);
      requestAnimationFrame(function () { chart.resize(); });
      if (window.__webrAdminMembersRoleChartResize) {
        window.removeEventListener("resize", window.__webrAdminMembersRoleChartResize);
      }
      window.__webrAdminMembersRoleChartResize = function () { chart.resize(); };
      window.addEventListener("resize", window.__webrAdminMembersRoleChartResize, { passive: true });
      if (el.offsetWidth === 0 || el.offsetHeight === 0) {
        const ro = new ResizeObserver(function () {
          if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            ro.disconnect();
            chart.resize();
          }
        });
        ro.observe(el);
      }
    });
  }

  function bindRoleTabs() {
    const roleCard = findRoleGraphCard(contentColumn());
    if (!roleCard || roleCard.dataset.webrRoleTabsBound === "true") return;
    roleCard.dataset.webrRoleTabsBound = "true";
    roleCard.addEventListener("click", function (event) {
      const tab = event.target && event.target.closest ? event.target.closest("#graph_tab_daily,#graph_tab_monthly,#graph_tab_yearly") : null;
      if (!tab) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      drawRoleGraph(periodFromTab(tab.id), true);
    }, true);
  }

  function enhance(force) {
    injectStyle();
    setModeAttribute();
    ensureGraphRows();
    bindRoleTabs();
    drawRoleGraph((window.__webrAdminMembersRolePeriod || "monthly"), !!force);
  }

  function scheduleEnhance(force) {
    if (force) {
      window.__webrAdminMembersGraphFixForce = true;
    }
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      const shouldForce = !!window.__webrAdminMembersGraphFixForce;
      window.__webrAdminMembersGraphFixForce = false;
      enhance(shouldForce);
    });
  }

  if (typeof draw_chart === "function" && !window.__webrAdminMembersRoleGraphFixed) {
    window.__webrAdminMembersRoleGraphFixed = true;
    draw_chart = function (_inputData, activeTabId) {
      const period = periodFromTab(activeTabId);
      window.__webrAdminMembersRolePeriod = period;
      scheduleEnhance(true);
    };
  }

  if (typeof adminMembersFetchSection === "function" && !window.__webrAdminMembersGraphFixFetchWrapped) {
    const originalFetchSection = adminMembersFetchSection;
    window.__webrAdminMembersGraphFixFetchWrapped = true;
    adminMembersFetchSection = function (section, body) {
      return originalFetchSection(section, body).then(function (payload) {
        if (section === "graph" || section === "joined" || section === "roles") scheduleEnhance(section === "graph");
        return payload;
      });
    };
  }

  function startObserver() {
    const root = document.getElementById("div_main");
    if (!root || root.dataset.webrMembersGraphFixObserver === "true") return;
    root.dataset.webrMembersGraphFixObserver = "true";
    const observer = new MutationObserver(function () {
      scheduleEnhance(false);
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      startObserver();
      scheduleEnhance(true);
    });
  } else {
    startObserver();
    scheduleEnhance(true);
  }
})();
