(function () {
  const STYLE_ID = "webr-admin-members-split-style-20260606-0407";
  const MODE_ATTR = "data-webr-admin-members-mode";
  const OVERVIEW_SECTIONS = ["joined", "roles", "graph"];
  const LIST_SECTIONS = ["list"];

  function currentMode() {
    const path = window.location.pathname || "";
    const sub = String(window.sub || "");
    return sub === "members_list" || path.indexOf("/admin/members/list/") === 0 ? "list" : "overview";
  }

  function modeSections() {
    return currentMode() === "list" ? LIST_SECTIONS : OVERVIEW_SECTIONS;
  }

  function injectSplitStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".webr-admin-members-subtabs{display:flex;flex-wrap:wrap;gap:.5rem;max-width:1480px;margin:1rem auto 0;padding:0 2rem;}",
      ".webr-admin-members-subtabs a{display:inline-flex;min-height:38px;align-items:center;justify-content:center;border:1px solid #cbd5e1;border-radius:.5rem;background:#fff;padding:.55rem .9rem;font-size:.875rem;font-weight:800;color:#334155;text-decoration:none;}",
      ".webr-admin-members-subtabs a:hover{background:#f1f5f9;color:#0f172a;}",
      ".webr-admin-members-subtabs a[aria-current='page']{border-color:#2563eb;background:#eff6ff;color:#1d4ed8;}",
      "html[" + MODE_ATTR + "='overview'] .webr-admin-members-dashboard>div:nth-child(2)>div:last-child{display:none!important;}",
      "html[" + MODE_ATTR + "='list'] .webr-admin-members-dashboard>div:nth-child(2)>div:not(:last-child){display:none!important;}",
      "@media (max-width:768px){.webr-admin-members-subtabs{padding:0 1rem;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function setModeAttribute() {
    document.documentElement.setAttribute(MODE_ATTR, currentMode());
  }

  function ensureSubTabs() {
    const root = document.getElementById("div_main");
    if (!root) return;
    const dashboard = root.querySelector(".webr-admin-members-dashboard");
    if (!dashboard) return;
    let tabs = root.querySelector(".webr-admin-members-subtabs");
    if (!tabs) {
      tabs = document.createElement("nav");
      tabs.className = "webr-admin-members-subtabs";
      tabs.setAttribute("aria-label", "회원 관리 탭");
      root.insertBefore(tabs, dashboard);
    }
    const mode = currentMode();
    tabs.innerHTML = [
      '<a href="/admin/members/"' + (mode === "overview" ? ' aria-current="page"' : "") + ">회원 현황</a>",
      '<a href="/admin/members/list/"' + (mode === "list" ? ' aria-current="page"' : "") + ">회원 목록</a>"
    ].join("");
  }

  function startSubTabObserver() {
    const root = document.getElementById("div_main");
    if (!root || root.dataset.webrMembersSplitObserver === "true") return;
    root.dataset.webrMembersSplitObserver = "true";
    const observer = new MutationObserver(function () {
      window.requestAnimationFrame(ensureSubTabs);
    });
    observer.observe(root, { childList: true, subtree: false });
  }

  if (typeof adminMembersFetchSection === "function" && !window.__webrAdminMembersSplitFetchWrapped) {
    const originalFetchSection = adminMembersFetchSection;
    window.__webrAdminMembersSplitFetchWrapped = true;
    adminMembersFetchSection = function (section, body) {
      const mode = currentMode();
      if (mode === "overview" && section === "list") {
        return Promise.resolve({});
      }
      if (mode === "list" && section !== "list") {
        return Promise.resolve({});
      }
      return originalFetchSection(section, body);
    };
  }

  get_main = async function () {
    injectSplitStyle();
    setModeAttribute();
    startSubTabObserver();

    const mount = document.getElementById("div_main");
    if (!mount) return;
    if (typeof Div_main_skeleton === "function") {
      ReactDOM.render(React.createElement(Div_main_skeleton, null), mount);
      ensureSubTabs();
    }

    const sections = modeSections();
    const parts = await Promise.all(sections.map(function (section) {
      return adminMembersFetchSection(section).catch(function (error) {
        console.error("admin members split section failed", section, error);
        return {};
      });
    }));
    const data = parts.reduce(function (merged, payload) {
      return adminMembersMergeData(merged, payload || {});
    }, {});
    ReactDOM.render(React.createElement(AdminMembersManageMain, { data: data, skipInitialLoad: true }), mount);
    ensureSubTabs();
  };
})();
