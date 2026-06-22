(function () {
  if (window.__webrAdminMembersNoJoinedRoleFallbackGuard) return;
  window.__webrAdminMembersNoJoinedRoleFallbackGuard = true;

  function periodFromTab(activeTabId) {
    if (activeTabId === "graph_tab_daily") return "daily";
    if (activeTabId === "graph_tab_yearly") return "yearly";
    return "monthly";
  }

  function roleKey(period) {
    if (period === "daily") return "list_role_daily";
    if (period === "yearly") return "list_role_yearly";
    return "list_role_monthly";
  }

  function rowsOf(data) {
    return Object.values(data || {});
  }

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function hasRoleRows(data) {
    return rowsOf(data).some(function (row) {
      return text(row && (row.role || row.role_name || row.name || row.ROLE));
    });
  }

  function hasJoinedOnlyRows(data) {
    const rows = rowsOf(data);
    if (!rows.length) return false;
    return rows.some(function (row) {
      return text(row && (row.date || row.period || row.dt || row.DATE));
    }) && !hasRoleRows(data);
  }

  function roleDataFor(activeTabId) {
    const lastData = window.__webrAdminMembersLastData || {};
    return lastData[roleKey(periodFromTab(activeTabId))] || {};
  }

  function wrapDrawChart() {
    if (typeof draw_chart !== "function" || window.__webrAdminMembersNoJoinedRoleFallbackWrapped) return;
    const previous = draw_chart;
    window.__webrAdminMembersNoJoinedRoleFallbackWrapped = true;
    draw_chart = function (inputData, activeTabId) {
      const roleData = roleDataFor(activeTabId);
      if (hasRoleRows(roleData)) {
        return previous(roleData, activeTabId);
      }
      if (hasJoinedOnlyRows(inputData)) {
        return previous({}, activeTabId);
      }
      return previous(inputData, activeTabId);
    };
  }

  wrapDrawChart();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wrapDrawChart);
  } else {
    window.setTimeout(wrapDrawChart, 0);
  }
})();
