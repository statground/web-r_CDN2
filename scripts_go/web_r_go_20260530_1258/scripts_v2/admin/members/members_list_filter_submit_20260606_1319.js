(function () {
  function currentMode() {
    const path = window.location.pathname || "";
    const sub = String(window.sub || "");
    return sub === "members_list" || path.indexOf("/admin/members/list/") === 0 ? "list" : "overview";
  }

  function selectedContext() {
    const data = window.__webrAdminMembersLastData || {};
    return window.__webrAdminMembersContextOverride || data.member_context || "all";
  }

  function syncContextButtons(group) {
    if (!group) return;
    const selected = selectedContext();
    Array.from(group.querySelectorAll("button[data-context]")).forEach(function (button) {
      const pressed = button.getAttribute("data-context") === selected ? "true" : "false";
      if (button.getAttribute("aria-pressed") !== pressed) button.setAttribute("aria-pressed", pressed);
    });
  }

  function bindContextFilterSubmitOnly() {
    const root = document.getElementById("div_main");
    if (!root || root.dataset.webrMembersContextSubmitOnlyBound === "true") return;
    root.dataset.webrMembersContextSubmitOnlyBound = "true";
    root.addEventListener("click", function (event) {
      if (currentMode() !== "list") return;
      const button = event.target && event.target.closest ? event.target.closest(".webr-admin-members-context-filter button[data-context]") : null;
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      window.__webrAdminMembersContextOverride = button.getAttribute("data-context") || "all";
      syncContextButtons(button.closest(".webr-admin-members-context-filter"));
    }, true);
  }

  function startObserver() {
    const root = document.getElementById("div_main");
    if (!root || root.dataset.webrMembersContextSubmitOnlyObserver === "true") return;
    root.dataset.webrMembersContextSubmitOnlyObserver = "true";
    const observer = new MutationObserver(function () {
      bindContextFilterSubmitOnly();
      const group = root.querySelector(".webr-admin-members-context-filter");
      if (group) syncContextButtons(group);
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindContextFilterSubmitOnly();
      startObserver();
    });
  } else {
    bindContextFilterSubmitOnly();
    startObserver();
  }
})();
