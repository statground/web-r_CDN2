let class_tab_active = "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active cursor-pointer";
let class_tab_inactive = "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 cursor-pointer";
function adminActiveUsersPayloadFailed(payload) {
  return !payload || payload.ok === false || payload.pending === true || payload.fallback === true;
}
function renderActiveUsersEmptyState(message) {
  message = message || "\uD45C\uC2DC\uD560 \uD65C\uB3D9 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.";
  ["kpi_visit_val", "kpi_signup_val", "kpi_login_val", "kpi_board_val", "kpi_app_val", "kpi_app_webr_val", "kpi_app_webr2_val", "kpi_app_notebook_val", "kpi_payment_val", "kpi_cum_signup_val"].forEach(function(id) {
    const el = document.getElementById(id);
    if (el)
      el.innerText = "-";
  });
  ["kpi_cr1", "kpi_cr2", "kpi_cr3", "kpi_cr4", "kpi_cr5"].forEach(function(id) {
    const el = document.getElementById(id);
    if (el)
      el.innerText = "-";
  });
  if (typeof ACTIVE_USERS_CHART_IDS !== "undefined") {
    ACTIVE_USERS_CHART_IDS.forEach(function(id) {
      const el = document.getElementById(id);
      if (!el)
        return;
      prepareActiveUsersChartNode(el, id);
      try {
        if (window.echarts && typeof window.echarts.getInstanceByDom === "function") {
          const chart = window.echarts.getInstanceByDom(el);
          if (chart)
            chart.dispose();
        }
      } catch (err) {
      }
      el.innerHTML = '<div class="flex h-full w-full items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-8 text-sm font-medium text-amber-800">' + message + "</div>";
    });
  }
}
function Div_operation_menu() {
  function Div_menu_button(props) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => location.href = props.url,
        class: "py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200\n						focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
      },
      props.name
    );
  }
  var date = /* @__PURE__ */ new Date();
  return /* @__PURE__ */ React.createElement("div", { class: "md:col-span-2 justify-center item-center" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-row flex-wrap w-full md:flex-col md:w-48 item-center" }, /* @__PURE__ */ React.createElement(Div_menu_button, { name: "\uCCAB \uD654\uBA74", url: "/admin/" }), /* @__PURE__ */ React.createElement(Div_menu_button, { name: "\uD65C\uC131 \uC0AC\uC6A9\uC790", url: "/admin/active_users/" }), /* @__PURE__ */ React.createElement(Div_menu_button, { name: "Web-R \uC811\uC18D \uD604\uD669", url: "/admin/webr/" }), /* @__PURE__ */ React.createElement(Div_menu_button, { name: "\uBC29\uBB38 \uD604\uD669", url: "/admin/visitors/" }), /* @__PURE__ */ React.createElement(Div_menu_button, { name: "\uD68C\uC6D0 \uD604\uD669", url: "/admin/members/" }), /* @__PURE__ */ React.createElement(Div_menu_button, { name: "\uACB0\uC81C \uD604\uD669", url: "/admin/payments/" }), /* @__PURE__ */ React.createElement(Div_menu_button, { name: "\uC815\uC0B0\uC561 \uC870\uD68C", url: "/admin/balance_account/" + date.getFullYear().toString() + "/" + (date.getMonth() + 1).toString() + "/" })));
}
function Div_sub_title(props) {
  return /* @__PURE__ */ React.createElement("h5", { class: "mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900" }, /* @__PURE__ */ React.createElement("span", { class: "text-blue-600" }, props.title));
}
function Div_main_skeleton(props) {
  return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 md:grid-cols-12 justify-center item-center w-full px-[10px] py-[20px] md:px-[100px]" }, /* @__PURE__ */ React.createElement(Div_operation_menu, null), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-10 flex flex-col space-y-8" }, Array.from({ length: 4 }).map((_, idx) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: idx,
      className: "w-full bg-white border border-gray-200 rounded-lg shadow animate-pulse"
    },
    /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("div", { className: "h-6 w-40 bg-gray-200 rounded mb-6" }), /* @__PURE__ */ React.createElement("div", { className: "h-[350px] w-full bg-gray-100 rounded" }))
  ))));
}
function Div_main(props) {
  const data = props.data || {};
  const getSortedRows = (list) => {
    const arr = Array.isArray(list) ? list.slice() : Object.values(list || {});
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    return arr;
  };
  const dailyRows = getSortedRows(data.list_daily);
  const monthlyRows = getSortedRows(data.list_monthly);
  const yearlyRows = getSortedRows(data.list_yearly);
  const totalRows = getSortedRows(data.list_total);
  const [activeTab, setActiveTab] = React.useState("monthly");
  const [excludeVisitorFlow, setExcludeVisitorFlow] = React.useState(false);
  const [selectedDates, setSelectedDates] = React.useState(() => ({
    daily: dailyRows.length ? dailyRows[dailyRows.length - 1].date : "",
    monthly: monthlyRows.length ? monthlyRows[monthlyRows.length - 1].date : "",
    yearly: yearlyRows.length ? yearlyRows[yearlyRows.length - 1].date : ""
  }));
  const tabIdMap = {
    daily: "graph_tab_daily",
    monthly: "graph_tab_monthly",
    yearly: "graph_tab_yearly",
    total: "graph_tab_total"
  };
  const getActiveRows = () => {
    if (activeTab === "daily") {
      if (!dailyRows.length)
        return [];
      const sel = selectedDates.daily || dailyRows[dailyRows.length - 1].date;
      return dailyRows.filter((r) => r.date <= sel);
    }
    if (activeTab === "monthly") {
      if (!monthlyRows.length)
        return [];
      const sel = selectedDates.monthly || monthlyRows[monthlyRows.length - 1].date;
      return monthlyRows.filter((r) => r.date <= sel);
    }
    if (activeTab === "yearly") {
      if (!yearlyRows.length)
        return [];
      const sel = selectedDates.yearly || yearlyRows[yearlyRows.length - 1].date;
      return yearlyRows.filter((r) => r.date <= sel);
    }
    return totalRows;
  };
  React.useEffect(() => {
    const rows = getActiveRows();
    scheduleActiveUsersChart(rows, tabIdMap[activeTab], { excludeVisitorFlow });
  }, [activeTab, selectedDates, data, excludeVisitorFlow]);
  const classCard = "w-full bg-white border border-gray-200 rounded-lg shadow";
  const classWrap = "p-4 bg-white rounded-lg md:p-8 text-center";
  const Kpi = ({ title, idVal, unit, subTop, subBottom, idRate }) => /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl font-extrabold" }, /* @__PURE__ */ React.createElement("span", { id: idVal }, "0"), unit || "\uBA85"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-xl font-semibold" }, title), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-500 text-sm leading-snug text-center" }, subTop && /* @__PURE__ */ React.createElement(React.Fragment, null, subTop, /* @__PURE__ */ React.createElement("br", null)), subBottom, idRate && /* @__PURE__ */ React.createElement(React.Fragment, null, " ", /* @__PURE__ */ React.createElement("span", { id: idRate }, "0.0%"))));
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };
  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDates((prev) => {
      const next = { ...prev };
      if (activeTab === "daily") {
        next.daily = value;
      } else if (activeTab === "monthly") {
        next.monthly = value;
      } else if (activeTab === "yearly") {
        next.yearly = value;
      }
      return next;
    });
  };
  let currentValue = "";
  let minValue = "";
  let maxValue = "";
  if (activeTab === "daily") {
    currentValue = selectedDates.daily || (dailyRows.length ? dailyRows[dailyRows.length - 1].date : "");
    minValue = dailyRows.length ? dailyRows[0].date : "";
    maxValue = dailyRows.length ? dailyRows[dailyRows.length - 1].date : "";
  } else if (activeTab === "monthly") {
    currentValue = selectedDates.monthly || (monthlyRows.length ? monthlyRows[monthlyRows.length - 1].date : "");
    minValue = monthlyRows.length ? monthlyRows[0].date : "";
    maxValue = monthlyRows.length ? monthlyRows[monthlyRows.length - 1].date : "";
  } else if (activeTab === "yearly") {
    currentValue = selectedDates.yearly || (yearlyRows.length ? yearlyRows[yearlyRows.length - 1].date : "");
    minValue = yearlyRows.length ? yearlyRows[0].date : "";
    maxValue = yearlyRows.length ? yearlyRows[yearlyRows.length - 1].date : "";
  }
  return /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-12 justify-center items-top w-full px-[10px] py-[20px] md:px-[100px]" }, /* @__PURE__ */ React.createElement(Div_operation_menu, null), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-10 justify-center items-center" }, /* @__PURE__ */ React.createElement("div", { className: classCard }, /* @__PURE__ */ React.createElement("div", { className: classWrap }, /* @__PURE__ */ React.createElement("dl", { className: "flex flex-col justify-center items-start w-full p-4 mx-auto text-gray-900" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between w-full mb-4 gap-3" }, /* @__PURE__ */ React.createElement("ul", { className: "flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 flex-1" }, /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => handleTabClick("daily") }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: activeTab === "daily" ? class_tab_active : class_tab_inactive,
      id: "graph_tab_daily"
    },
    "\uC77C"
  )), /* @__PURE__ */ React.createElement(
    "li",
    {
      className: "me-2",
      onClick: () => handleTabClick("monthly")
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: activeTab === "monthly" ? class_tab_active : class_tab_inactive,
        id: "graph_tab_monthly"
      },
      "\uC6D4"
    )
  ), /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => handleTabClick("yearly") }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: activeTab === "yearly" ? class_tab_active : class_tab_inactive,
      id: "graph_tab_yearly"
    },
    "\uB144"
  )), /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => handleTabClick("total") }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: activeTab === "total" ? class_tab_active : class_tab_inactive,
      id: "graph_tab_total"
    },
    "\uC804\uCCB4"
  ))), activeTab !== "total" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm text-gray-700" }, /* @__PURE__ */ React.createElement("span", null, activeTab === "daily" ? "\uB0A0\uC9DC \uC120\uD0DD" : activeTab === "monthly" ? "\uB144\uC6D4 \uC120\uD0DD" : "\uC5F0\uB3C4 \uC120\uD0DD", ":"), activeTab === "daily" && /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      className: "border border-gray-300 rounded-lg p-2 text-sm",
      min: minValue,
      max: maxValue,
      value: currentValue,
      onChange: handleDateChange
    }
  ), activeTab === "monthly" && /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "month",
      className: "border border-gray-300 rounded-lg p-2 text-sm",
      min: minValue,
      max: maxValue,
      value: currentValue,
      onChange: handleDateChange
    }
  ), activeTab === "yearly" && /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "border border-gray-300 rounded-lg p-2 w-24 text-sm",
      min: minValue || void 0,
      max: maxValue || void 0,
      value: currentValue,
      onChange: handleDateChange
    }
  ))), /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uD65C\uB3D9 \uC804\uD658 \uC694\uC57D" }), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-8 md:grid-cols-6 p-4 w-full" }, /* @__PURE__ */ React.createElement(
    Kpi,
    {
      title: "\uBC29\uBB38\uC790",
      idVal: "kpi_visit_val",
      subTop: "",
      subBottom: "(\uCD5C\uC0C1\uB2E8 \uBAA8\uC218)",
      idRate: ""
    }
  ), /* @__PURE__ */ React.createElement(
    Kpi,
    {
      title: "\uC571 \uC0AC\uC6A9",
      idVal: "kpi_app_val",
      subTop: /* @__PURE__ */ React.createElement("span", { className: "text-xs leading-snug" }, "Web-R ", /* @__PURE__ */ React.createElement("span", { id: "kpi_app_webr_val" }, "0"), "\uBA85 \u00B7 Web-R 2.0 ", /* @__PURE__ */ React.createElement("span", { id: "kpi_app_webr2_val" }, "0"), "\uBA85", /* @__PURE__ */ React.createElement("br", null), "Notebook ", /* @__PURE__ */ React.createElement("span", { id: "kpi_app_notebook_val" }, "0"), "\uBA85"),
      subBottom: "\uBC29\uBB38\u2192\uC571 \uC804\uD658:",
      idRate: "kpi_cr4"
    }
  ), /* @__PURE__ */ React.createElement(
    Kpi,
    {
      title: "\uAC00\uC785\uC790",
      idVal: "kpi_signup_val",
      subTop: /* @__PURE__ */ React.createElement(React.Fragment, null, "(\uB204\uC801", " ", /* @__PURE__ */ React.createElement("span", { id: "kpi_cum_signup_val" }, "0"), "\uBA85)"),
      subBottom: "\uBC29\uBB38\u2192\uAC00\uC785 \uC804\uD658:",
      idRate: "kpi_cr1"
    }
  ), /* @__PURE__ */ React.createElement(
    Kpi,
    {
      title: "\uB85C\uADF8\uC778",
      idVal: "kpi_login_val",
      subTop: "",
      subBottom: "\uAC00\uC785\u2192\uB85C\uADF8\uC778 \uC804\uD658:",
      idRate: "kpi_cr2"
    }
  ), /* @__PURE__ */ React.createElement(
    Kpi,
    {
      title: "\uACB0\uC81C",
      idVal: "kpi_payment_val",
      unit: "\uAC74",
      subTop: "",
      subBottom: "\uB85C\uADF8\uC778\u2192\uACB0\uC81C \uC804\uD658:",
      idRate: "kpi_cr5"
    }
	  ), /* @__PURE__ */ React.createElement(
	    Kpi,
	    {
	      title: "\uAC8C\uC2DC\uD310 \uC774\uC6A9",
	      idVal: "kpi_board_val",
	      subTop: "",
	      subBottom: "\uB85C\uADF8\uC778\u2192\uAC8C\uC2DC\uD310 \uC804\uD658:",
	      idRate: "kpi_cr3"
	    }
	  )), /* @__PURE__ */ React.createElement("div", { className: "w-full mt-6 space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-end gap-2 px-2" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium shadow-sm" }, /* @__PURE__ */ React.createElement(
	    "button",
	    {
	      type: "button",
	      className: !excludeVisitorFlow ? "rounded-md bg-blue-600 px-3 py-1.5 text-white" : "rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100",
	      onClick: () => setExcludeVisitorFlow(false)
	    },
	    "\uBC29\uBB38\uC790 \uD3EC\uD568"
	  ), /* @__PURE__ */ React.createElement(
	    "button",
	    {
	      type: "button",
	      className: excludeVisitorFlow ? "rounded-md bg-blue-600 px-3 py-1.5 text-white" : "rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100",
	      onClick: () => setExcludeVisitorFlow(true)
	    },
	    "\uBC29\uBB38\uC790 \uC81C\uC678"
	  ))), /* @__PURE__ */ React.createElement("div", { id: "div_funnel_graph", className: "w-full h-[420px] min-h-[420px] p-2", style: { height: "420px", minHeight: "420px" } }), /* @__PURE__ */ React.createElement("div", { id: "div_conv_graph", className: "w-full h-[380px] min-h-[380px] p-2", style: { height: "380px", minHeight: "380px" } }), /* @__PURE__ */ React.createElement("div", { id: "div_trend_graph", className: "w-full h-[420px] min-h-[420px] p-2", style: { height: "420px", minHeight: "420px" } })))))));
}
const GRAPH_TAB_IDS = [
  "graph_tab_daily",
  "graph_tab_monthly",
  "graph_tab_yearly",
  "graph_tab_total"
];
const ACTIVE_USERS_CHART_IDS = [
  "div_funnel_graph",
  "div_conv_graph",
  "div_trend_graph"
];
const ACTIVE_USERS_CHART_HEIGHTS = {
  div_funnel_graph: 420,
  div_conv_graph: 380,
  div_trend_graph: 420
};
let activeUsersChartDrawToken = 0;
let activeUsersChartRetryTimer = null;
let activeUsersChartObserver = null;
function prepareActiveUsersChartNode(el, id) {
  if (!el)
    return;
  const h = ACTIVE_USERS_CHART_HEIGHTS[id] || 380;
  el.style.height = h + "px";
  el.style.minHeight = h + "px";
  el.style.width = "100%";
  el.style.position = "relative";
}
function activeUsersChartsReady() {
  return ACTIVE_USERS_CHART_IDS.every(function(id) {
    const el = document.getElementById(id);
    if (!el)
      return false;
    prepareActiveUsersChartNode(el, id);
    const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : {
      width: el.offsetWidth,
      height: el.offsetHeight
    };
    return rect.width > 24 && rect.height > 24;
  });
}
function scheduleActiveUsersChart(inputData, activeTabId, chartOptions) {
  chartOptions = chartOptions || {};
  const token = ++activeUsersChartDrawToken;
  if (activeUsersChartRetryTimer) {
    window.clearTimeout(activeUsersChartRetryTimer);
    activeUsersChartRetryTimer = null;
  }
  if (!normalizeActiveUsersRows(inputData).length) {
    draw_chart(inputData, activeTabId, token, chartOptions);
    return;
  }
  const tick = function(attempt) {
    window.requestAnimationFrame(function() {
      if (token !== activeUsersChartDrawToken)
        return;
      ACTIVE_USERS_CHART_IDS.forEach(function(id) {
        prepareActiveUsersChartNode(document.getElementById(id), id);
      });
      if (activeUsersChartsReady() && window.echarts) {
        draw_chart(inputData, activeTabId, token, chartOptions);
        return;
      }
      if (!window.echarts && attempt === 0 && window.WebRAdminDashboard && window.WebRAdminDashboard.ensureECharts) {
        window.WebRAdminDashboard.ensureECharts(function() {
          if (token === activeUsersChartDrawToken) {
            tick(attempt + 1);
          }
        });
      }
      if (attempt < 120) {
        activeUsersChartRetryTimer = window.setTimeout(function() {
          tick(attempt + 1);
        }, 50);
      } else {
        renderActiveUsersFallbackCharts(inputData, activeTabId, chartOptions);
      }
    });
  };
  installActiveUsersChartObservers(inputData, activeTabId, chartOptions);
  tick(0);
}
function installActiveUsersChartObservers(inputData, activeTabId, chartOptions) {
  if (!window.ResizeObserver)
    return;
  if (activeUsersChartObserver) {
    try {
      activeUsersChartObserver.disconnect();
    } catch (err) {
    }
  }
  let resizeTimer = null;
  const token = activeUsersChartDrawToken;
  activeUsersChartObserver = new ResizeObserver(function() {
    if (token !== activeUsersChartDrawToken)
      return;
    if (resizeTimer)
      window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function() {
      if (token !== activeUsersChartDrawToken)
        return;
      if (!activeUsersChartsReady())
        return;
      if (window.echarts) {
        draw_chart(inputData, activeTabId, token, chartOptions || {});
      }
    }, 120);
  });
  ACTIVE_USERS_CHART_IDS.forEach(function(id) {
    const el = document.getElementById(id);
    if (el)
      activeUsersChartObserver.observe(el);
  });
}
function normalizeActiveUsersRows(inputData) {
  let rows;
  if (Array.isArray(inputData)) {
    rows = inputData.slice();
  } else {
    rows = Object.values(inputData || {});
  }
  rows.sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  return rows;
}
function buildActiveUsersMetrics(inputData, activeTabId) {
  const rows = normalizeActiveUsersRows(inputData);
  const n = function(x) {
    return +x || 0;
  };
  const rate = function(a, b) {
    return b > 0 ? (+a || 0) / (+b || 0) * 100 : 0;
  };
  const last = rows[rows.length - 1] || {};
  const isMonthly = activeTabId === "graph_tab_monthly" || last.type === "monthly";
  let cumSignup;
  if (typeof last.cum_signup !== "undefined") {
    cumSignup = n(last.cum_signup);
  } else {
    cumSignup = rows.reduce(function(sum, r) {
      return sum + n(r.cnt_signup);
    }, 0);
  }
  let cumVisit = 0;
  if (isMonthly) {
    cumVisit = rows.reduce(function(sum, r) {
      return sum + n(r.cnt_visit);
    }, 0);
  }
  const visit = n(last.cnt_visit);
  const signup = n(last.cnt_signup);
  const login = n(last.cnt_login);
  const board = n(last.cnt_board);
  const app = n(last.cnt_app);
  const appWebR = n(last.cnt_app_webr);
  const appWebR2 = n(last.cnt_app_webr2);
  const appNotebook = n(last.cnt_app_notebook);
  const hasAppSplit = ["cnt_app_webr", "cnt_app_webr2", "cnt_app_notebook"].some(function(key) {
    return typeof last[key] !== "undefined";
  });
  const payment = n(last.cnt_payment);
  const cr1 = rate(signup, visit);
  const cr2 = rate(login, signup);
  const cr3 = rate(board, login);
  const cr4 = rate(app, visit);
  const cr5 = rate(payment, login);
  return { rows, n, rate, last, isMonthly, cumSignup, cumVisit, visit, signup, login, board, app, appWebR, appWebR2, appNotebook, hasAppSplit, payment, cr1, cr2, cr3, cr4, cr5 };
}
function activeUsersStepItems(m) {
  return [
    { name: "\uBC29\uBB38\u2192\uC571", value: m.cr4, numeratorLabel: "\uC571 \uC0AC\uC6A9", numerator: m.app, numeratorUnit: "\uBA85", denominatorLabel: "\uBC29\uBB38\uC790", denominator: m.visit, denominatorUnit: "\uBA85" },
    { name: "\uBC29\uBB38\u2192\uAC00\uC785", value: m.cr1, numeratorLabel: "\uAC00\uC785\uC790", numerator: m.signup, numeratorUnit: "\uBA85", denominatorLabel: "\uBC29\uBB38\uC790", denominator: m.visit, denominatorUnit: "\uBA85" },
    { name: "\uAC00\uC785\u2192\uB85C\uADF8\uC778", value: m.cr2, numeratorLabel: "\uB85C\uADF8\uC778", numerator: m.login, numeratorUnit: "\uBA85", denominatorLabel: "\uAC00\uC785\uC790", denominator: m.signup, denominatorUnit: "\uBA85" },
    { name: "\uB85C\uADF8\uC778\u2192\uACB0\uC81C", value: m.cr5, numeratorLabel: "\uACB0\uC81C", numerator: m.payment, numeratorUnit: "\uAC74", denominatorLabel: "\uB85C\uADF8\uC778", denominator: m.login, denominatorUnit: "\uBA85" },
    { name: "\uB85C\uADF8\uC778\u2192\uAC8C\uC2DC\uD310", value: m.cr3, numeratorLabel: "\uAC8C\uC2DC\uD310 \uC774\uC6A9", numerator: m.board, numeratorUnit: "\uBA85", denominatorLabel: "\uB85C\uADF8\uC778", denominator: m.login, denominatorUnit: "\uBA85" }
  ];
}
function activeUsersTrendItems(m) {
  const appItems = activeUsersAppSplitItems(m, true);
  return [
    { name: "\uBC29\uBB38", value: m.visit, unit: "\uBA85" },
    ...appItems,
    { name: "\uAC00\uC785", value: m.signup, unit: "\uBA85" },
    { name: "\uB85C\uADF8\uC778", value: m.login, unit: "\uBA85" },
    { name: "\uACB0\uC81C", value: m.payment, unit: "\uAC74" },
    { name: "\uAC8C\uC2DC\uD310", value: m.board, unit: "\uBA85" }
  ];
}
function activeUsersAppSplitItems(m, includeZero) {
  const splitItems = [
    { key: "app_webr", name: "Web-R", value: m.appWebR, unit: "\uBA85", order: 20 },
    { key: "app_webr2", name: "Web-R 2.0", value: m.appWebR2, unit: "\uBA85", order: 21 },
    { key: "app_notebook", name: "Web-R Notebook", value: m.appNotebook, unit: "\uBA85", order: 22 }
  ];
  if (!m.hasAppSplit) {
    return [{ key: "app", name: "\uC571 \uC0AC\uC6A9", value: m.app, unit: "\uBA85", order: 20 }];
  }
  if (includeZero) {
    return splitItems;
  }
  const positives = splitItems.filter(function(item) {
    return (+item.value || 0) > 0;
  });
  if (positives.length) {
    return positives;
  }
  return (+m.app || 0) > 0 ? [{ key: "app", name: "\uC571 \uC0AC\uC6A9", value: m.app, unit: "\uBA85", order: 20 }] : [];
}
function activeUsersFlowItems(m, chartOptions) {
  const items = [
    { key: "visit", name: "\uBC29\uBB38\uC790", value: m.visit, unit: "\uBA85", order: 10 },
    ...activeUsersAppSplitItems(m, false),
    { key: "signup", name: "\uAC00\uC785\uC790", value: m.signup, unit: "\uBA85", order: 30 },
    { key: "login", name: "\uB85C\uADF8\uC778", value: m.login, unit: "\uBA85", order: 40 },
    { key: "board", name: "\uAC8C\uC2DC\uD310 \uC774\uC6A9", value: m.board, unit: "\uBA85", order: 50 },
    { key: "payment", name: "\uACB0\uC81C", value: m.payment, unit: "\uAC74", order: 60 }
  ];
  const filteredItems = chartOptions && chartOptions.excludeVisitorFlow ? items.filter(function(item) {
    return item.key !== "visit";
  }) : items;
  filteredItems.sort(function(a, b) {
    const av = +a.value || 0;
    const bv = +b.value || 0;
    if (bv !== av) {
      return bv - av;
    }
    return a.order - b.order;
  });
  return filteredItems;
}
function renderActiveUsersFallbackCharts(inputData, activeTabId, chartOptions) {
  const m = buildActiveUsersMetrics(inputData, activeTabId);
  const fmt = function(x) {
    return (+x || 0).toLocaleString();
  };
  const pct = function(x) {
    return (isNaN(x) ? 0 : x).toFixed(1) + "%";
  };
  const steps = activeUsersStepItems(m);
  const flowItems = activeUsersFlowItems(m, chartOptions || {});
  const flow = document.getElementById("div_funnel_graph");
  if (flow) {
    prepareActiveUsersChartNode(flow, "div_funnel_graph");
    flow.innerHTML = '<div class="h-full w-full rounded-lg border border-slate-200 bg-slate-50 p-5 text-slate-900">' +
      '<div class="mb-5 text-center text-base font-bold">활동 전환 순서도</div>' +
      '<div class="flex h-[320px] flex-wrap items-center justify-center gap-3">' +
      flowItems.map(function(item, idx) {
        const arrow = idx < flowItems.length - 1 ? '<div class="hidden text-xl font-bold text-slate-300 md:block">→</div>' : '';
        return '<div class="flex min-w-[128px] flex-col items-center justify-center rounded-lg bg-white p-4 shadow-sm"><div class="text-sm text-slate-500">' + item.name + '</div><div class="text-2xl font-extrabold">' + fmt(item.value) + item.unit + '</div></div>' + arrow;
      }).join("") +
      '</div>' +
      '</div>';
  }
  const conv = document.getElementById("div_conv_graph");
  if (conv) {
    prepareActiveUsersChartNode(conv, "div_conv_graph");
    const maxValue = Math.max.apply(null, steps.map(function(item) {
      return isNaN(item.value) ? 0 : item.value;
    }).concat([1]));
    conv.innerHTML = '<div class="h-full w-full rounded-lg border border-slate-200 bg-white p-5"><div class="mb-5 text-center text-base font-bold">단계별 전환율(전환 관계 기준)</div>' + steps.map(function(item) {
      const value = isNaN(item.value) ? 0 : item.value;
      const width = Math.max(2, value / maxValue * 100);
      return '<div class="mb-4"><div class="mb-1 flex items-center justify-between text-sm"><span>' + item.name + '</span><strong>' + pct(value) + '</strong></div><div class="h-3 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-blue-500" style="width:' + width.toFixed(1) + '%"></div></div><div class="mt-1 text-xs text-slate-500">' + item.numeratorLabel + ' ' + fmt(item.numerator) + item.numeratorUnit + ' / ' + item.denominatorLabel + ' ' + fmt(item.denominator) + item.denominatorUnit + '</div></div>';
    }).join("") + '</div>';
  }
  const trend = document.getElementById("div_trend_graph");
  if (trend) {
    prepareActiveUsersChartNode(trend, "div_trend_graph");
    trend.innerHTML = '<div class="h-full w-full rounded-lg border border-slate-200 bg-white p-5"><div class="mb-5 text-center text-base font-bold">활동 추이(전환 순서 기준)</div><div class="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">' +
      activeUsersTrendItems(m).map(function(item) {
        return '<div class="rounded-lg bg-slate-50 p-3 text-center"><div class="text-xs text-slate-500">' + item.name + '</div><div class="text-lg font-extrabold">' + fmt(item.value) + item.unit + '</div></div>';
      }).join("") + '</div></div>';
  }
}
function draw_chart(inputData, activeTabId, drawToken, chartOptions) {
  chartOptions = chartOptions || {};
  if (drawToken && drawToken !== activeUsersChartDrawToken)
    return;
  GRAPH_TAB_IDS.forEach(function(id) {
    const el = document.getElementById(id);
    if (!el)
      return;
    el.className = id === activeTabId ? class_tab_active : class_tab_inactive;
  });
  if (!normalizeActiveUsersRows(inputData).length) {
    renderActiveUsersEmptyState();
    return;
  }
  if (!window.echarts) {
    if (window.WebRAdminDashboard && window.WebRAdminDashboard.ensureECharts) {
      window.WebRAdminDashboard.ensureECharts(function() {
        scheduleActiveUsersChart(inputData, activeTabId, chartOptions);
      });
    } else {
      window.setTimeout(function() {
        scheduleActiveUsersChart(inputData, activeTabId, chartOptions);
      }, 50);
    }
    return;
  }
  let rows;
  if (Array.isArray(inputData)) {
    rows = inputData.slice();
  } else {
    rows = Object.values(inputData || {});
  }
  rows.sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  const n = function(x) {
    return +x || 0;
  };
  const fmt = function(x) {
    return n(x).toLocaleString();
  };
  const rate = function(a, b) {
    return b > 0 ? (+a || 0) / (+b || 0) * 100 : 0;
  };
  if (!rows.length) {
    renderActiveUsersEmptyState();
    return;
  }
  const last = rows[rows.length - 1] || {};
  const isMonthly = activeTabId === "graph_tab_monthly" || last.type === "monthly";
  let cumSignup;
  if (typeof last.cum_signup !== "undefined") {
    cumSignup = n(last.cum_signup);
  } else {
    cumSignup = rows.reduce(function(sum, r) {
      return sum + n(r.cnt_signup);
    }, 0);
  }
  let cumVisit = 0;
  if (isMonthly) {
    cumVisit = rows.reduce(function(sum, r) {
      return sum + n(r.cnt_visit);
    }, 0);
  }
  const visit = n(last.cnt_visit);
  const signup = n(last.cnt_signup);
  const login = n(last.cnt_login);
  const board = n(last.cnt_board);
  const app = n(last.cnt_app);
  const appWebR = n(last.cnt_app_webr);
  const appWebR2 = n(last.cnt_app_webr2);
  const appNotebook = n(last.cnt_app_notebook);
  const hasAppSplit = ["cnt_app_webr", "cnt_app_webr2", "cnt_app_notebook"].some(function(key) {
    return typeof last[key] !== "undefined";
  });
  const payment = n(last.cnt_payment);
  let cr1, cr2, cr3, cr4, cr5;
  cr1 = rate(signup, visit);
  cr2 = rate(login, signup);
  cr3 = rate(board, login);
  cr4 = rate(app, visit);
  cr5 = rate(payment, login);
  const setText = function(id, val) {
    const el = document.getElementById(id);
    if (el)
      el.innerText = val;
  };
  setText("kpi_cum_signup_val", fmt(cumSignup));
  setText("kpi_visit_val", fmt(visit));
  setText("kpi_signup_val", fmt(signup));
  setText("kpi_login_val", fmt(login));
  setText("kpi_board_val", fmt(board));
  setText("kpi_app_val", fmt(app));
  setText("kpi_app_webr_val", fmt(appWebR));
  setText("kpi_app_webr2_val", fmt(appWebR2));
  setText("kpi_app_notebook_val", fmt(appNotebook));
  setText("kpi_payment_val", fmt(payment));
  setText("kpi_cr1", (isNaN(cr1) ? 0 : cr1).toFixed(1) + "%");
  setText("kpi_cr2", (isNaN(cr2) ? 0 : cr2).toFixed(1) + "%");
  setText("kpi_cr3", (isNaN(cr3) ? 0 : cr3).toFixed(1) + "%");
  setText("kpi_cr4", (isNaN(cr4) ? 0 : cr4).toFixed(1) + "%");
  setText("kpi_cr5", (isNaN(cr5) ? 0 : cr5).toFixed(1) + "%");
  const metric = { rows, n, rate, last, isMonthly, cumSignup, cumVisit, visit, signup, login, board, app, appWebR, appWebR2, appNotebook, hasAppSplit, payment, cr1, cr2, cr3, cr4, cr5 };
  const stepItems = activeUsersStepItems(metric);
  const flowItems = activeUsersFlowItems(metric, chartOptions);
  const flowUnitByName = flowItems.reduce(function(acc, item) {
    acc[item.name] = item.unit;
    return acc;
  }, {});
  const ensureChart = function(domId) {
    const el = document.getElementById(domId);
    if (!el)
      return null;
    prepareActiveUsersChartNode(el, domId);
    try {
      const prev = echarts.getInstanceByDom(el);
      if (prev)
        prev.dispose();
      el.innerHTML = "";
      return echarts.init(el, null, { renderer: "canvas" });
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  const chartFunnel = ensureChart("div_funnel_graph");
  if (chartFunnel) {
    try {
      chartFunnel.setOption({
      title: {
        text: "\uD65C\uB3D9 \uC804\uD658 \uC21C\uC11C\uB3C4",
        left: "center",
        top: 10
      },
      tooltip: {
        trigger: "item",
        formatter: function(p) {
          if (p.dataType === "edge") {
            const edgeValue = typeof p.data.actualValue !== "undefined" ? p.data.actualValue : p.data.value;
            return p.data.source + "\u2192" + p.data.target + ": " + (+edgeValue || 0).toLocaleString() + (flowUnitByName[p.data.target] || "\uBA85");
          }
          return p.name + ": " + fmt((flowItems.find(function(item) {
            return item.name === p.name;
          }) || {}).value || 0) + (flowUnitByName[p.name] || "\uBA85");
        }
      },
      series: [
        {
          type: "sankey",
          top: 80,
          bottom: 30,
          left: "6%",
          right: "8%",
          nodeGap: 18,
          nodeWidth: 18,
          layoutIterations: 0,
          emphasis: { focus: "adjacency" },
          label: {
            color: "#0f172a",
            fontWeight: 700
          },
          lineStyle: {
            color: "gradient",
            curveness: 0.48,
            opacity: 0.35
          },
          data: flowItems.map(function(item) {
            return { name: item.name, value: item.value };
          }),
          links: flowItems.slice(1).map(function(item, idx) {
            const actualValue = +item.value || 0;
            return { source: flowItems[idx].name, target: item.name, value: Math.max(1, actualValue), actualValue };
          })
        }
      ]
      });
    } catch (err) {
      console.error(err);
      renderActiveUsersFallbackCharts(inputData, activeTabId, chartOptions);
    }
  } else {
    renderActiveUsersFallbackCharts(inputData, activeTabId, chartOptions);
  }
  const chartConv = ensureChart("div_conv_graph");
  if (chartConv) {
    const cats = stepItems.map(function(item) {
      return item.name;
    });
    const vals = stepItems.map(function(item) {
      const v = isNaN(item.value) ? 0 : item.value;
      return +v.toFixed(1);
    });
    const maxRate = Math.max.apply(null, [0].concat(vals));
    const yMax = Math.max(100, Math.ceil(maxRate / 10) * 10);
    try {
      chartConv.setOption({
      title: {
        text: "\uB2E8\uACC4\uBCC4 \uC804\uD658\uC728(\uC804\uD658 \uAD00\uACC4 \uAE30\uC900)",
        left: "center",
        top: 10
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: function(params) {
          const p = Array.isArray(params) ? params[0] : params;
          const item = stepItems[p && typeof p.dataIndex !== "undefined" ? p.dataIndex : 0] || stepItems[0];
          if (!item)
            return "";
          const value = isNaN(item.value) ? 0 : item.value;
          return item.name + ": " + value.toFixed(1) + "%<br/>" + item.numeratorLabel + " " + fmt(item.numerator) + item.numeratorUnit + " / " + item.denominatorLabel + " " + fmt(item.denominator) + item.denominatorUnit;
        }
      },
      grid: {
        top: 80,
        left: 60,
        right: 30,
        bottom: 40
      },
      xAxis: {
        type: "category",
        data: cats,
        axisLabel: { interval: 0 }
      },
      yAxis: {
        type: "value",
        max: yMax,
        axisLabel: { formatter: "{value}%" }
      },
      series: [
        {
          type: "bar",
          data: vals,
          barMaxWidth: 32,
          label: {
            show: true,
            position: "top",
            formatter: "{c}%"
          }
        }
      ]
      });
    } catch (err) {
      console.error(err);
      renderActiveUsersFallbackCharts(inputData, activeTabId, chartOptions);
    }
  } else {
    renderActiveUsersFallbackCharts(inputData, activeTabId, chartOptions);
  }
  const chartTrend = ensureChart("div_trend_graph");
  if (chartTrend) {
    const labels = rows.map(function(r) {
      return r.date;
    });
    const sVisit = rows.map(function(r) {
      return n(r.cnt_visit);
    });
    const sSignup = rows.map(function(r) {
      return n(r.cnt_signup);
    });
    const sLogin = rows.map(function(r) {
      return n(r.cnt_login);
    });
    const sBoard = rows.map(function(r) {
      return n(r.cnt_board);
    });
    const sApp = rows.map(function(r) {
      return n(r.cnt_app);
    });
    const sAppWebR = rows.map(function(r) {
      return n(r.cnt_app_webr);
    });
    const sAppWebR2 = rows.map(function(r) {
      return n(r.cnt_app_webr2);
    });
    const sAppNotebook = rows.map(function(r) {
      return n(r.cnt_app_notebook);
    });
    const sPayment = rows.map(function(r) {
      return n(r.cnt_payment);
    });
    const hasAppSplitRows = rows.some(function(r) {
      return typeof r.cnt_app_webr !== "undefined" || typeof r.cnt_app_webr2 !== "undefined" || typeof r.cnt_app_notebook !== "undefined";
    });
    const appTrendSeries = hasAppSplitRows ? [
      { name: "Web-R", unit: "\uBA85", data: sAppWebR },
      { name: "Web-R 2.0", unit: "\uBA85", data: sAppWebR2 },
      { name: "Web-R Notebook", unit: "\uBA85", data: sAppNotebook }
    ] : [
      { name: "\uC571", unit: "\uBA85", data: sApp }
    ];
    const trendSeries = [
      { name: "\uBC29\uBB38", unit: "\uBA85", data: sVisit },
      ...appTrendSeries,
      { name: "\uAC00\uC785", unit: "\uBA85", data: sSignup },
      { name: "\uB85C\uADF8\uC778", unit: "\uBA85", data: sLogin },
      { name: "\uACB0\uC81C", unit: "\uAC74", data: sPayment },
      { name: "\uAC8C\uC2DC\uD310", unit: "\uBA85", data: sBoard }
    ];
    try {
      chartTrend.setOption({
      title: {
        text: "\uD65C\uB3D9 \uCD94\uC774(\uC804\uD658 \uC21C\uC11C \uAE30\uC900)",
        left: "center",
        top: 10
      },
      tooltip: {
        trigger: "axis",
        formatter: function(params) {
          if (!Array.isArray(params) || !params.length)
            return "";
          const valuesByName = {};
          params.forEach(function(p) {
            valuesByName[p.seriesName] = p;
          });
          const dateLabel = params[0].axisValue || "";
          return [dateLabel].concat(trendSeries.map(function(item) {
            const p = valuesByName[item.name];
            const value = p ? p.value : 0;
            const marker = p ? p.marker : "";
            return marker + item.name + ": " + fmt(value) + item.unit;
          })).join("<br/>");
        }
      },
      legend: {
        top: 40,
	        data: trendSeries.map(function(item) {
	          return item.name;
	        })
      },
      grid: {
        top: 90,
        left: 60,
        right: 70,
        bottom: 40
      },
      xAxis: {
        type: "category",
        data: labels
      },
      yAxis: [
        {
          type: "value",
          name: "\uBC29\uBB38\uC790",
          axisLabel: {
            formatter: function(value) {
              return fmt(value);
            }
          }
        },
        {
          type: "value",
          name: "\uD65C\uB3D9",
          axisLabel: {
            formatter: function(value) {
              return fmt(value);
            }
          }
        }
      ],
      dataZoom: [
        { type: "inside" },
        { type: "slider" }
      ],
      series: trendSeries.map(function(item) {
        return { name: item.name, type: "line", yAxisIndex: item.name === "\uBC29\uBB38" ? 0 : 1, data: item.data, smooth: true, symbolSize: 6 };
      })
      });
    } catch (err) {
      console.error(err);
      renderActiveUsersFallbackCharts(inputData, activeTabId, chartOptions);
    }
  } else {
    renderActiveUsersFallbackCharts(inputData, activeTabId, chartOptions);
  }
  const onResize = function() {
    [chartFunnel, chartConv, chartTrend].forEach(function(c) {
      if (c)
        c.resize();
    });
  };
  if (window.__adminActiveUsersChartResize) {
    window.removeEventListener("resize", window.__adminActiveUsersChartResize);
  }
  window.__adminActiveUsersChartResize = onResize;
  window.addEventListener("resize", onResize, { passive: true });
  window.requestAnimationFrame(onResize);
}
async function get_main() {
  const mount = document.getElementById("div_main");
  let data = {};
  let didRender = false;
  const render = function() {
    didRender = true;
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main, { data }), mount);
  };
  const loadPeriod = function(period) {
    const body = new URLSearchParams();
    body.set("period", period);
    return fetch("/admin/ajax_get_admin_active_users_period/", {
      method: "POST",
      credentials: "same-origin",
      body
    }).then(function(r) {
      return r.json();
    }).then(function(payload) {
      if (adminActiveUsersPayloadFailed(payload)) {
        throw new Error(payload && payload.error ? payload.error : "admin active-users payload failed");
      }
      data = { ...data, ...(payload || {}) };
      render();
    }).catch(function(e) {
      console.error(e);
      data = { ...data, __activeUsersError: true };
      render();
    });
  };
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_skeleton, { period: "loading" }), mount);
  await loadPeriod("monthly");
  await Promise.allSettled(["daily", "yearly", "total"].map(loadPeriod));
}
async function set_main() {
  function Div_check_admin() {
    return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-xl px-6 py-8 mx-auto space-y-4 md" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", class: "w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), /* @__PURE__ */ React.createElement("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentFill" })), /* @__PURE__ */ React.createElement("p", null, "\uAD00\uB9AC\uC790 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.")));
  }
  function Div_main_stop() {
    return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-xl px-6 py-8 mx-auto space-y-4" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/stop.svg", class: "size-16" }), /* @__PURE__ */ React.createElement("p", null, "\uAD00\uB9AC\uC790\uB97C \uC704\uD55C \uBA54\uB274\uC785\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement(
      "a",
      {
        href: "/",
        class: "text-gray-900 text-center bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 w-[150px]\n							  focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
      },
      "\uCCAB \uD654\uBA74\uC73C\uB85C"
    )));
  }
  const username = window.gv_username || "";
  if (!username) {
    location.href = "/";
    return;
  }
  const mount = document.getElementById("div_main");
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_check_admin, null), mount);
  try {
    const headerData = await fetch("/ajax_get_menu_header/", { method: "POST" }).then((res) => res.json());
    const role = headerData && headerData.role ? headerData.role : "";
    window.gv_role = role;
    if (role === "\uAD00\uB9AC\uC790") {
      await get_main();
    } else {
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_stop, null), mount);
    }
  } catch (error) {
    console.error(error);
    mount.innerHTML = '<div class="text-center text-gray-500 py-10">\uAD00\uB9AC\uC790 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.</div>';
  }
}
