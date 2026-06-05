(function () {
  const STYLE_ID = "webr-admin-members-split-style-20260606-0438";
  const MODE_ATTR = "data-webr-admin-members-mode";
  const OVERVIEW_URL = "/admin/ajax_get_admin_members_overview/";
  const LIST_SECTIONS = ["list"];
  const CONTEXT_OPTIONS = [
    { value: "all", label: "전체" },
    { value: "personal", label: "개인" },
    { value: "team", label: "팀" },
    { value: "tester_team", label: "테스트 팀" },
    { value: "admin_team", label: "관리자 팀" },
    { value: "bot_team", label: "Bot 팀" }
  ];

  function currentMode() {
    const path = window.location.pathname || "";
    const sub = String(window.sub || "");
    return sub === "members_list" || path.indexOf("/admin/members/list/") === 0 ? "list" : "overview";
  }

  function captureMembersData(payload) {
    if (!payload || typeof payload !== "object") return;
    if (typeof adminMembersMergeData === "function") {
      window.__webrAdminMembersLastData = adminMembersMergeData(window.__webrAdminMembersLastData || {}, payload);
    } else {
      window.__webrAdminMembersLastData = Object.assign({}, window.__webrAdminMembersLastData || {}, payload);
    }
  }

  function injectSplitStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".webr-admin-members-subtabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;grid-column:1/-1;width:100%;margin:0 0 .75rem;border:1px solid #cbd5e1;border-radius:.5rem;overflow:hidden;background:#fff;}",
      ".webr-admin-members-subtabs a{display:flex;min-height:46px;align-items:center;justify-content:center;border:0;border-right:1px solid #cbd5e1;background:#fff;padding:.65rem .9rem;font-size:.95rem;font-weight:850;color:#334155;text-decoration:none;}",
      ".webr-admin-members-subtabs a:last-child{border-right:0;}",
      ".webr-admin-members-subtabs a:hover{background:#f8fafc;color:#0f172a;}",
      ".webr-admin-members-subtabs a[aria-current='page']{background:#eff6ff;color:#1d4ed8;box-shadow:inset 0 0 0 1px #2563eb;}",
      "html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2){display:grid!important;grid-template-columns:minmax(0,1fr);gap:12px!important;align-items:stretch;}",
      "html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2)>[data-webr-members-card]{grid-column:auto!important;grid-row:auto!important;margin:0!important;}",
      "html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2)>[data-webr-members-card='admin'],html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2)>[data-webr-members-card='list']{display:none!important;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='joined']{order:1;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='status']{order:2;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='roles']{order:3;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='team']{order:4;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='joined_graph']{order:5;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='role_graph']{order:6;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='joined_graph'],html[" + MODE_ATTR + "='overview'] [data-webr-members-card='role_graph']{grid-column:1/-1!important;}",
      "@media (min-width:1024px){html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2){grid-template-columns:repeat(2,minmax(0,1fr))!important;}html[" + MODE_ATTR + "='overview'] [data-webr-members-card='joined_graph'],html[" + MODE_ATTR + "='overview'] [data-webr-members-card='role_graph']{grid-column:1/-1!important;}}",
      "html[" + MODE_ATTR + "='list'] .webr-admin-members-dashboard>div:nth-child(2){display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important;}",
      "html[" + MODE_ATTR + "='list'] .webr-admin-members-dashboard>div:nth-child(2)>[data-webr-members-card]:not([data-webr-members-card='list']){display:none!important;}",
      ".webr-admin-members-joined-graph-card{width:100%;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.06);}",
      ".webr-admin-members-joined-graph-card>div{padding:1rem;text-align:left;}",
      ".webr-admin-members-joined-graph-card h5{margin:0 0 .75rem;color:#111827;font-size:1rem;font-weight:850;line-height:1.2;}",
      ".webr-admin-members-graph-tabs{display:flex;flex-wrap:wrap;width:100%;border-bottom:1px solid #e5e7eb;font-size:.875rem;font-weight:700;color:#64748b;}",
      ".webr-admin-members-graph-tabs button{border:0;background:transparent;padding:.75rem 1rem;cursor:pointer;color:inherit;}",
      ".webr-admin-members-graph-tabs button[aria-pressed='true']{border-bottom:2px solid #2563eb;color:#1d4ed8;background:#eff6ff;}",
      "#div_statistics_joined_graph{height:420px;width:100%;padding:1rem;}",
      ".webr-admin-members-context-filter{display:flex;min-width:0;flex-wrap:wrap;align-items:center;gap:.5rem;}",
      ".webr-admin-members-context-filter button{display:inline-flex;min-height:38px;align-items:center;justify-content:center;gap:.5rem;white-space:nowrap;border:1px solid #e2e8f0;border-radius:.375rem;background:#fff;padding:.375rem .75rem;font-size:.875rem;font-weight:700;color:#334155;}",
      ".webr-admin-members-context-filter button[aria-pressed='true']{border-color:#2563eb;background:#eff6ff;color:#1d4ed8;}",
      ".webr-admin-members-context-filter .count{border-radius:.25rem;background:rgba(255,255,255,.75);padding:.125rem .375rem;font-size:.7rem;color:#64748b;}",
      "@media (max-width:767px){.webr-admin-members-subtabs a{min-height:42px;font-size:.875rem;}#div_statistics_joined_graph{height:340px;padding:.5rem;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function setModeAttribute() {
    document.documentElement.setAttribute(MODE_ATTR, currentMode());
  }

  function contentColumn() {
    const root = document.getElementById("div_main");
    const dashboard = root && root.querySelector(".webr-admin-members-dashboard");
    if (!dashboard || !dashboard.children || dashboard.children.length < 2) return null;
    return dashboard.children[1];
  }

  function ensureSubTabs() {
    const content = contentColumn();
    if (!content) return;
    let tabs = content.querySelector(":scope > .webr-admin-members-subtabs");
    if (!tabs) {
      tabs = document.createElement("nav");
      tabs.className = "webr-admin-members-subtabs";
      tabs.setAttribute("aria-label", "회원 관리 탭");
      content.insertBefore(tabs, content.firstChild);
    }
    const mode = currentMode();
    tabs.innerHTML = [
      '<a href="/admin/members/"' + (mode === "overview" ? ' aria-current="page"' : "") + ">회원 현황</a>",
      '<a href="/admin/members/list/"' + (mode === "list" ? ' aria-current="page"' : "") + ">회원 목록</a>"
    ].join("");
  }

  function markCards() {
    const content = contentColumn();
    if (!content) return;
    Array.from(content.children || []).forEach(function (child) {
      if (!child || child.classList.contains("webr-admin-members-subtabs")) return;
      if (child.classList.contains("webr-admin-members-joined-graph-card")) {
        child.setAttribute("data-webr-members-card", "joined_graph");
        return;
      }
      if (child.tagName !== "DIV") return;
      const text = (child.textContent || "").replace(/\s+/g, " ");
      if (text.indexOf("가입자 수") >= 0 && text.indexOf("올해 가입자 수") >= 0) child.setAttribute("data-webr-members-card", "joined");
      else if (text.indexOf("등급별 멤버 수") >= 0) child.setAttribute("data-webr-members-card", "roles");
      else if (text.indexOf("관리자 계정") >= 0) child.setAttribute("data-webr-members-card", "admin");
      else if (text.indexOf("팀 기준 회원 수") >= 0) child.setAttribute("data-webr-members-card", "team");
      else if (text.indexOf("회원 상태") >= 0) child.setAttribute("data-webr-members-card", "status");
      else if (text.indexOf("회원 목록") >= 0) child.setAttribute("data-webr-members-card", "list");
      else if (child.querySelector("#div_statistics_graph")) child.setAttribute("data-webr-members-card", "role_graph");
    });
  }

  function ensureJoinedGraphCard() {
    if (currentMode() !== "overview") return;
    const content = contentColumn();
    if (!content) return;
    markCards();
    let card = content.querySelector(":scope > .webr-admin-members-joined-graph-card");
    const roleGraph = content.querySelector(":scope > [data-webr-members-card='role_graph']");
    if (!card) {
      card = document.createElement("section");
      card.className = "webr-admin-members-joined-graph-card";
      card.setAttribute("data-webr-members-card", "joined_graph");
      card.innerHTML = [
        "<div>",
        "<h5>가입자 수 추이</h5>",
        '<div class="webr-admin-members-graph-tabs" aria-label="가입자 수 추이 기간">',
        '<button type="button" data-period="daily">일</button>',
        '<button type="button" data-period="monthly" aria-pressed="true">월</button>',
        '<button type="button" data-period="yearly">년</button>',
        "</div>",
        '<div id="div_statistics_joined_graph"></div>',
        "</div>"
      ].join("");
      if (roleGraph) content.insertBefore(card, roleGraph);
      else content.appendChild(card);
      card.addEventListener("click", function (event) {
        const button = event.target && event.target.closest ? event.target.closest("button[data-period]") : null;
        if (!button) return;
        drawJoinedGraph(button.getAttribute("data-period") || "monthly");
      });
    }
    requestAnimationFrame(function () {
      drawJoinedGraph(card.getAttribute("data-active-period") || "monthly");
    });
  }

  function normalRows(inputData) {
    return Object.values(inputData || {}).map(function (row) {
      const date = String(row && (row.date ?? row.period ?? row.dt ?? row.DATE) || "").trim();
      const cnt = Number(row && (row.cnt ?? row.count ?? row.CNT ?? row.value)) || 0;
      return { date: date, cnt: cnt };
    }).filter(function (row) {
      return row.date;
    }).sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
  }

  function graphKey(period) {
    if (period === "daily") return "list_daily";
    if (period === "yearly") return "list_yearly";
    return "list_monthly";
  }

  function drawJoinedGraph(period) {
    const card = document.querySelector(".webr-admin-members-joined-graph-card");
    const el = document.getElementById("div_statistics_joined_graph");
    if (!card || !el) return;
    period = period === "daily" || period === "yearly" ? period : "monthly";
    card.setAttribute("data-active-period", period);
    Array.from(card.querySelectorAll("button[data-period]")).forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-period") === period ? "true" : "false");
    });
    if (!window.echarts) {
      el.innerHTML = '<div class="flex h-full items-center justify-center text-sm text-slate-500">차트 라이브러리를 불러오지 못했습니다.</div>';
      return;
    }
    const data = window.__webrAdminMembersLastData || {};
    const rows = normalRows(data[graphKey(period)]);
    const prev = echarts.getInstanceByDom(el);
    if (prev) prev.dispose();
    const chart = echarts.init(el, null, { renderer: "canvas" });
    const categories = rows.map(function (row) { return row.date; });
    const values = rows.map(function (row) { return row.cnt; });
    const option = {
      title: { text: "가입자 수 추이", left: "center", top: 0, textStyle: { fontSize: 22, fontWeight: "700" } },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      toolbox: { right: 10, feature: { dataZoom: { yAxisIndex: "none" }, restore: {}, saveAsImage: {} } },
      grid: { left: 60, right: 60, top: 72, bottom: 58 },
      xAxis: { type: "category", data: categories, axisLabel: { interval: "auto", hideOverlap: true } },
      yAxis: { type: "value", name: "가입자 수" },
      dataZoom: [{ type: "inside", xAxisIndex: 0, start: 0, end: 100 }, { type: "slider", xAxisIndex: 0, start: 0, end: 100 }],
      series: [{ name: "가입자 수", type: "bar", data: values, barMaxWidth: 28, itemStyle: { color: "#2563eb" } }]
    };
    if (categories.length === 0) {
      option.graphic = { type: "text", left: "center", top: "middle", style: { text: "표시할 가입자 데이터가 없습니다.", fill: "#64748b", fontSize: 14 } };
    }
    chart.setOption(option);
    requestAnimationFrame(function () { chart.resize(); });
  }

  function formatNumber(value) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0";
  }

  function contextCounts() {
    const data = window.__webrAdminMembersLastData || {};
    return ((data.member_filter_counts || {}).context || {});
  }

  function activeContext() {
    const data = window.__webrAdminMembersLastData || {};
    return window.__webrAdminMembersContextOverride || data.member_context || "all";
  }

  function findFilterGroup(label) {
    const root = document.getElementById("div_main");
    if (!root) return null;
    const labels = Array.from(root.querySelectorAll("div"));
    for (const node of labels) {
      if ((node.textContent || "").trim() === label && node.parentElement) return node.parentElement;
    }
    return null;
  }

  function findSearchButton() {
    const root = document.getElementById("div_main");
    if (!root) return null;
    return Array.from(root.querySelectorAll("button")).find(function (button) {
      return (button.textContent || "").trim() === "검색";
    }) || null;
  }

  function ensureContextFilter() {
    if (currentMode() !== "list") return;
    const group = findFilterGroup("권한 사용");
    if (!group) return;
    const original = group.children && group.children.length > 1 ? group.children[1] : null;
    if (original && !original.classList.contains("webr-admin-members-context-filter")) original.style.display = "none";
    let custom = group.querySelector(":scope > .webr-admin-members-context-filter");
    if (!custom) {
      custom = document.createElement("div");
      custom.className = "webr-admin-members-context-filter";
      group.appendChild(custom);
    }
    const counts = contextCounts();
    const selected = activeContext();
    custom.innerHTML = CONTEXT_OPTIONS.map(function (option) {
      const pressed = selected === option.value ? ' aria-pressed="true"' : ' aria-pressed="false"';
      return '<button type="button" data-context="' + option.value + '"' + pressed + "><span>" + option.label + '</span><span class="count">' + formatNumber(counts[option.value]) + "</span></button>";
    }).join("");
  }

  function bindContextFilter() {
    const root = document.getElementById("div_main");
    if (!root || root.dataset.webrMembersContextFilterBound === "true") return;
    root.dataset.webrMembersContextFilterBound = "true";
    root.addEventListener("click", function (event) {
      const button = event.target && event.target.closest ? event.target.closest(".webr-admin-members-context-filter button[data-context]") : null;
      if (!button) return;
      window.__webrAdminMembersContextOverride = button.getAttribute("data-context") || "all";
      ensureContextFilter();
      const search = findSearchButton();
      if (search) search.click();
    });
  }

  function setChartZoomAllPeriods() {
    if (window.__webrAdminMembersChartZoomAllPeriods) return;
    window.__webrAdminMembersChartZoomAllPeriods = true;
    if (typeof chartZoomStart === "function") {
      window.__webrAdminMembersOriginalChartZoomStart = chartZoomStart;
      chartZoomStart = function () { return 0; };
    }
  }

  function rewriteListBody(section, body) {
    if (section !== "list" || !window.__webrAdminMembersContextOverride) return body;
    let params;
    if (body instanceof URLSearchParams) params = new URLSearchParams(body.toString());
    else params = new URLSearchParams();
    params.set("context", window.__webrAdminMembersContextOverride || "all");
    return params;
  }

  function enhanceMembersUI() {
    injectSplitStyle();
    setModeAttribute();
    setChartZoomAllPeriods();
    ensureSubTabs();
    markCards();
    ensureJoinedGraphCard();
    ensureContextFilter();
    bindContextFilter();
  }

  function startSubTabObserver() {
    const root = document.getElementById("div_main");
    if (!root || root.dataset.webrMembersSplitObserver === "true") return;
    root.dataset.webrMembersSplitObserver = "true";
    const observer = new MutationObserver(function () {
      window.requestAnimationFrame(enhanceMembersUI);
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  if (typeof adminMembersFetchSection === "function" && !window.__webrAdminMembersSplitFetchWrapped) {
    const originalFetchSection = adminMembersFetchSection;
    window.__webrAdminMembersSplitFetchWrapped = true;
    adminMembersFetchSection = function (section, body) {
      const mode = currentMode();
      if (mode === "overview" && section === "list") return Promise.resolve({});
      if (mode === "list" && LIST_SECTIONS.indexOf(section) < 0) return Promise.resolve({});
      return originalFetchSection(section, rewriteListBody(section, body)).then(function (payload) {
        captureMembersData(payload || {});
        window.requestAnimationFrame(enhanceMembersUI);
        return payload || {};
      });
    };
  }

  async function fetchOverviewPayload() {
    const res = await fetch(OVERVIEW_URL, { method: "POST", credentials: "same-origin" });
    return res.json();
  }

  get_main = async function () {
    injectSplitStyle();
    setModeAttribute();
    setChartZoomAllPeriods();
    startSubTabObserver();

    const mount = document.getElementById("div_main");
    if (!mount) return;
    if (typeof Div_main_skeleton === "function") {
      ReactDOM.render(React.createElement(Div_main_skeleton, null), mount);
      enhanceMembersUI();
    }

    let data = {};
    if (currentMode() === "overview") {
      data = await fetchOverviewPayload().catch(function (error) {
        console.error("admin members overview failed", error);
        return {};
      });
    } else {
      data = await adminMembersFetchSection("list").catch(function (error) {
        console.error("admin members list failed", error);
        return {};
      });
    }
    captureMembersData(data || {});
    ReactDOM.render(React.createElement(AdminMembersManageMain, { data: data || {}, skipInitialLoad: true }), mount);
    enhanceMembersUI();
  };
})();
