(function () {
  const STYLE_ID = "webr-admin-members-stable-bootstrap-20260620-1350";
  const MODE_ATTR = "data-webr-admin-members-mode";
  let postRenderScheduled = false;

  function renderAdminCheck(mount) {
    mount.innerHTML = [
      '<div class="mx-auto max-w-screen-xl px-6 py-8">',
      '<div class="flex w-full flex-col items-center justify-center gap-4 text-center text-slate-500">',
      '<span class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" aria-hidden="true"></span>',
      '<p>관리자 여부를 확인하고 있습니다.</p>',
      "</div>",
      "</div>"
    ].join("");
  }

  function renderAdminStop(mount) {
    mount.innerHTML = [
      '<div class="mx-auto max-w-screen-xl px-6 py-8">',
      '<div class="flex w-full flex-col items-center justify-center gap-4 text-center text-slate-500">',
      "<p>관리자를 위한 메뉴입니다.</p>",
      '<a href="/" class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">첫 화면으로</a>',
      "</div>",
      "</div>"
    ].join("");
  }

  function renderAdminError(mount) {
    mount.innerHTML = [
      '<div class="mx-auto max-w-screen-xl px-6 py-10 text-center text-sm font-medium text-slate-500">',
      "관리자 화면을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      "</div>"
    ].join("");
  }

  function currentMode() {
    const path = window.location.pathname || "";
    const sub = String(window.sub || "");
    return sub === "members_list" || path.indexOf("/admin/members/list/") === 0 ? "list" : "overview";
  }

  function isMembersPage() {
    const path = window.location.pathname || "";
    return path === "/admin/members" || path.indexOf("/admin/members/") === 0;
  }

  function setModeAttribute() {
    document.documentElement.setAttribute(MODE_ATTR, currentMode());
  }

  function functionText(fn) {
    try {
      return Function.prototype.toString.call(fn || "");
    } catch (error) {
      return "";
    }
  }

  function isBasePayloadRenderer(fn) {
    const text = functionText(fn);
    return text.indexOf("React.createElement(Div_main") >= 0 ||
      text.indexOf("draw_chart(data.list_role_monthly") >= 0;
  }

  function stableOperationMenu() {
    let menu = null;
    if (typeof window.WebRAdminOperationMenu === "function") menu = window.WebRAdminOperationMenu;
    else if (typeof window.Div_operation_menu === "function") menu = window.Div_operation_menu;
    else if (typeof Div_operation_menu === "function") menu = Div_operation_menu;
    if (!menu) return null;
    window.Div_operation_menu = menu;
    try {
      Div_operation_menu = menu;
    } catch (error) {
      // Some browsers can reject bare global rebinding; window binding still helps.
    }
    return menu;
  }

  function neutralizeBasePayloadRenderer() {
    try {
      if (typeof renderAdminMembersPayload !== "function") return;
      if (!isBasePayloadRenderer(renderAdminMembersPayload)) return;
      if (window.__webrAdminMembersBasePayloadRendererBlocked) return;
      window.__webrAdminMembersBasePayloadRendererBlocked = true;
      renderAdminMembersPayload = function () {};
    } catch (error) {
      // The stable renderer does not depend on the old payload renderer.
    }
  }

  function injectStableStyle() {
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
      "html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2)>[data-webr-members-card='admin'],html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2)>[data-webr-members-card='list']{display:none!important;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='joined']{order:1;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='status']{order:2;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='roles']{order:3;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='team']{order:4;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='joined_graph']{order:5;}",
      "html[" + MODE_ATTR + "='overview'] [data-webr-members-card='role_graph']{order:6;}",
      "html[" + MODE_ATTR + "='list'] .webr-admin-members-dashboard>div:nth-child(2){display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important;}",
      "html[" + MODE_ATTR + "='list'] .webr-admin-members-dashboard>div:nth-child(2)>[data-webr-members-card]:not([data-webr-members-card='list']){display:none!important;}",
      "@media (min-width:1024px){html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2){grid-template-columns:repeat(2,minmax(0,1fr))!important;}html[" + MODE_ATTR + "='overview'] [data-webr-members-card='joined_graph'],html[" + MODE_ATTR + "='overview'] [data-webr-members-card='role_graph']{grid-column:1/-1!important;}}",
      "@media (max-width:767px){.webr-admin-members-subtabs a{min-height:42px;font-size:.875rem;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function membersContentColumn() {
    const root = document.getElementById("div_main");
    const dashboard = root && root.querySelector(".webr-admin-members-dashboard");
    if (!dashboard || !dashboard.children || dashboard.children.length < 2) return null;
    return dashboard.children[1];
  }

  function ensureMembersSubTabs() {
    if (!isMembersPage()) return;
    injectStableStyle();
    const content = membersContentColumn();
    if (!content) return;
    let tabs = content.querySelector(":scope > .webr-admin-members-subtabs");
    if (!tabs) {
      tabs = document.createElement("nav");
      tabs.className = "webr-admin-members-subtabs";
      tabs.setAttribute("aria-label", "회원 관리 탭");
      content.insertBefore(tabs, content.firstChild);
    }
    const mode = currentMode();
    const html = [
      '<a href="/admin/members/"' + (mode === "overview" ? ' aria-current="page"' : "") + ">회원 현황</a>",
      '<a href="/admin/members/list/"' + (mode === "list" ? ' aria-current="page"' : "") + ">회원 목록</a>"
    ].join("");
    if (tabs.innerHTML !== html) tabs.innerHTML = html;
  }

  function setAttrIfChanged(node, name, value) {
    if (node && node.getAttribute(name) !== value) node.setAttribute(name, value);
  }

  function markCards() {
    const content = membersContentColumn();
    if (!content) return;
    Array.from(content.children || []).forEach(function (child) {
      if (!child || child.classList.contains("webr-admin-members-subtabs")) return;
      if (child.classList.contains("webr-admin-members-joined-graph-card")) {
        setAttrIfChanged(child, "data-webr-members-card", "joined_graph");
        return;
      }
      if (child.tagName !== "DIV") return;
      const text = (child.textContent || "").replace(/\s+/g, " ");
      let card = "";
      if (text.indexOf("가입자 수") >= 0 && text.indexOf("올해 가입자 수") >= 0) card = "joined";
      else if (text.indexOf("등급별 멤버 수") >= 0) card = "roles";
      else if (text.indexOf("관리자 계정") >= 0) card = "admin";
      else if (text.indexOf("팀 기준 회원 수") >= 0) card = "team";
      else if (text.indexOf("회원 상태") >= 0) card = "status";
      else if (text.indexOf("회원 목록") >= 0) card = "list";
      else if (child.querySelector("#div_statistics_graph")) card = "role_graph";
      if (card) setAttrIfChanged(child, "data-webr-members-card", card);
    });
  }

  function runPostRenderGuards() {
    stableOperationMenu();
    neutralizeBasePayloadRenderer();
    setModeAttribute();
    ensureMembersSubTabs();
    markCards();
  }

  function schedulePostRenderGuards() {
    if (postRenderScheduled) return;
    postRenderScheduled = true;
    window.requestAnimationFrame(function () {
      postRenderScheduled = false;
      runPostRenderGuards();
    });
  }

  function startPostRenderObserver() {
    const root = document.getElementById("div_main");
    if (!root || root.dataset.webrAdminMembersBootstrapObserver === "true") return;
    root.dataset.webrAdminMembersBootstrapObserver = "true";
    const observer = new MutationObserver(function () {
      schedulePostRenderGuards();
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  function mergeMembersData(prev, payload) {
    if (typeof adminMembersMergeData === "function") return adminMembersMergeData(prev || {}, payload || {});
    return Object.assign({}, prev || {}, payload || {});
  }

  function fetchMemberSection(section, body) {
    if (typeof adminMembersFetchSection === "function") return adminMembersFetchSection(section, body);
    const endpoints = {
      joined: "/admin/ajax_get_admin_members_joined/",
      roles: "/admin/ajax_get_admin_members_roles/",
      graph: "/admin/ajax_get_admin_members_graph/",
      list: "/admin/ajax_get_admin_members_list/"
    };
    const endpoint = endpoints[section];
    if (!endpoint) return Promise.resolve({});
    const options = { method: "POST", credentials: "same-origin" };
    if (body) options.body = body;
    return fetch(endpoint, options).then(function (res) { return res.json(); });
  }

  function fetchMemberSections(sections) {
    return Promise.all(sections.map(function (section) {
      return fetchMemberSection(section).catch(function (error) {
        console.error("admin members stable section failed", section, error);
        return {};
      });
    })).then(function (parts) {
      return parts.reduce(function (merged, payload) {
        return mergeMembersData(merged, payload || {});
      }, {});
    });
  }

  function renderMembers(data) {
    const mount = document.getElementById("div_main");
    if (!mount) return;
    if (typeof ReactDOM !== "object" && typeof ReactDOM !== "function") throw new Error("ReactDOM is not available");
    if (typeof React !== "object" && typeof React !== "function") throw new Error("React is not available");
    if (typeof AdminMembersManageMain !== "function") throw new Error("AdminMembersManageMain is not available");
    ReactDOM.render(React.createElement(AdminMembersManageMain, { data: data || {}, skipInitialLoad: true }), mount, function () {
      runPostRenderGuards();
      window.setTimeout(runPostRenderGuards, 50);
      window.setTimeout(runPostRenderGuards, 250);
    });
  }

  async function runStableMembersMain() {
    injectStableStyle();
    setModeAttribute();
    stableOperationMenu();
    neutralizeBasePayloadRenderer();
    startPostRenderObserver();
    if (typeof adminMembersInjectDashboardStyles === "function") adminMembersInjectDashboardStyles();
    const mount = document.getElementById("div_main");
    if (!mount) return;
    if (typeof Div_main_skeleton === "function") {
      ReactDOM.render(React.createElement(Div_main_skeleton, null), mount);
    }
    if (currentMode() === "list") {
      const listData = await fetchMemberSections(["list"]);
      window.__webrAdminMembersLastData = mergeMembersData(window.__webrAdminMembersLastData || {}, listData || {});
      renderMembers(window.__webrAdminMembersLastData || listData || {});
      return;
    }
    const fastData = await fetchMemberSections(["joined", "roles"]);
    window.__webrAdminMembersLastData = mergeMembersData(window.__webrAdminMembersLastData || {}, fastData || {});
    renderMembers(window.__webrAdminMembersLastData || fastData || {});
    fetchMemberSection("graph").then(function (graphData) {
      window.__webrAdminMembersLastData = mergeMembersData(window.__webrAdminMembersLastData || {}, graphData || {});
      renderMembers(window.__webrAdminMembersLastData || {});
    }).catch(function (error) {
      console.error("admin members stable graph failed", error);
    });
  }

  window.__webrAdminMembersBootstrapGuard = {
    ensureOperationMenu: stableOperationMenu,
    ensureSubTabs: ensureMembersSubTabs,
    markCards: markCards,
    neutralizeBasePayloadRenderer: neutralizeBasePayloadRenderer,
    runStableMembersMain: runStableMembersMain
  };

  window.set_main = async function set_main() {
    if (window.__webrAdminMembersStableMainRunning) return;
    if (window.__webrAdminMembersStableMainDone) {
      runPostRenderGuards();
      return;
    }
    window.__webrAdminMembersStableMainRunning = true;
    const mount = document.getElementById("div_main");
    if (!mount) {
      window.__webrAdminMembersStableMainRunning = false;
      return;
    }
    const username = window.gv_username || "";
    if (!username) {
      location.href = "/";
      window.__webrAdminMembersStableMainRunning = false;
      return;
    }
    renderAdminCheck(mount);
    try {
      const headerData = await fetch("/ajax_get_menu_header/", {
        method: "POST",
        credentials: "same-origin"
      }).then(function (res) {
        return res.json();
      });
      const role = headerData && headerData.role ? headerData.role : "";
      window.gv_role = role;
      if (role !== "관리자") {
        renderAdminStop(mount);
        return;
      }
      await runStableMembersMain();
      window.__webrAdminMembersStableMainDone = true;
    } catch (error) {
      console.error(error);
      renderAdminError(mount);
    } finally {
      window.__webrAdminMembersStableMainRunning = false;
    }
  };

  window.setTimeout(function () {
    const context = window.__webr_legacy_context__ || {};
    if (!context.call_set_main || !isMembersPage()) return;
    if (window.__webr_set_main_called__) window.set_main();
  }, 0);
})();
