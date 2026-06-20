(function () {
  const SUBTAB_STYLE_ID = "webr-admin-members-bootstrap-subtabs-20260620-1304";
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
    return path.indexOf("/admin/members/") === 0;
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

  function membersMainCandidate() {
    stableOperationMenu();
    let fn = null;
    if (typeof window.get_main === "function") fn = window.get_main;
    else if (typeof get_main === "function") fn = get_main;
    if (!fn) return null;
    window.get_main = fn;
    try {
      get_main = fn;
    } catch (error) {
      // Keep the window binding even if the legacy bare symbol cannot be rebound.
    }
    return fn;
  }

  function waitForMembersMain(attempt) {
    attempt = attempt || 0;
    const fn = membersMainCandidate();
    if (fn) return Promise.resolve(fn);
    if (attempt >= 80) {
      return Promise.reject(new Error("admin members get_main is not registered"));
    }
    return new Promise(function (resolve, reject) {
      window.setTimeout(function () {
        waitForMembersMain(attempt + 1).then(resolve, reject);
      }, 25);
    });
  }

  function ensureSubTabStyle() {
    if (document.getElementById(SUBTAB_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = SUBTAB_STYLE_ID;
    style.textContent = [
      ".webr-admin-members-subtabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;grid-column:1/-1;width:100%;margin:0 0 .75rem;border:1px solid #cbd5e1;border-radius:.5rem;overflow:hidden;background:#fff;}",
      ".webr-admin-members-subtabs a{display:flex;min-height:46px;align-items:center;justify-content:center;border:0;border-right:1px solid #cbd5e1;background:#fff;padding:.65rem .9rem;font-size:.95rem;font-weight:850;color:#334155;text-decoration:none;}",
      ".webr-admin-members-subtabs a:last-child{border-right:0;}",
      ".webr-admin-members-subtabs a:hover{background:#f8fafc;color:#0f172a;}",
      ".webr-admin-members-subtabs a[aria-current='page']{background:#eff6ff;color:#1d4ed8;box-shadow:inset 0 0 0 1px #2563eb;}",
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
    ensureSubTabStyle();
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

  function runPostRenderGuards() {
    stableOperationMenu();
    ensureMembersSubTabs();
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

  window.__webrAdminMembersBootstrapGuard = {
    ensureOperationMenu: stableOperationMenu,
    ensureSubTabs: ensureMembersSubTabs,
    membersMainCandidate: membersMainCandidate
  };

  window.set_main = async function set_main() {
    const mount = document.getElementById("div_main");
    if (!mount) return;
    const username = window.gv_username || "";
    if (!username) {
      location.href = "/";
      return;
    }
    stableOperationMenu();
    startPostRenderObserver();
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
      const runMembersMain = await waitForMembersMain(0);
      await runMembersMain();
      runPostRenderGuards();
      window.setTimeout(runPostRenderGuards, 100);
      window.setTimeout(runPostRenderGuards, 500);
    } catch (error) {
      console.error(error);
      renderAdminError(mount);
    }
  };
})();
