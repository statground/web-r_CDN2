let class_tab_active = "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active cursor-pointer";
let class_tab_inactive = "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 cursor-pointer";

function adminVisitorFormat(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed.toLocaleString("ko-KR") : "0";
}

function adminVisitorMetric(data, key) {
  return Number((((data || {}).count || {})[key] || {})["0"] || 0);
}

function adminVisitorPayloadFailed(payload) {
  return !payload || payload.ok === false || payload.pending === true;
}

function Div_operation_menu() {
  function Div_menu_button(props) {
    return React.createElement(
      "button",
      {
        type: "button",
        onClick: () => location.href = props.url,
        className: "py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
      },
      props.name
    );
  }
  const date = new Date();
  return React.createElement(
    "div",
    { className: "md:col-span-2 justify-center item-center" },
    React.createElement(
      "div",
      { className: "flex flex-row flex-wrap w-full md:flex-col md:w-48 item-center" },
      React.createElement(Div_menu_button, { name: "첫 화면", url: "/admin/" }),
      React.createElement(Div_menu_button, { name: "활성 사용자", url: "/admin/active_users/" }),
      React.createElement(Div_menu_button, { name: "Web-R 접속 현황", url: "/admin/webr/" }),
      React.createElement(Div_menu_button, { name: "방문 현황", url: "/admin/visitors/" }),
      React.createElement(Div_menu_button, { name: "회원 현황", url: "/admin/members/" }),
      React.createElement(Div_menu_button, { name: "결제 현황", url: "/admin/payments/" }),
      React.createElement(Div_menu_button, { name: "정산액 조회", url: "/admin/balance_account/" + date.getFullYear().toString() + "/" + (date.getMonth() + 1).toString() + "/" })
    )
  );
}

function Div_sub_title(props) {
  return React.createElement("h5", { className: "mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900" }, React.createElement("span", { className: "text-blue-600" }, props.title));
}

function Div_sub_card(props) {
  const subunit = props.subunit == null ? props.unit : props.subunit;
  return React.createElement(
    "div",
    { className: "flex flex-col justify-center items-center rounded-xl space-y-2 w-full p-6" },
    React.createElement("dt", { className: "mb-2 text-3xl md:text-3xl font-extrabold" }, adminVisitorFormat(props.value), props.unit || ""),
    React.createElement(
      "dd",
      { className: "text-gray-500" },
      props.title,
      props.subvalue != null ? React.createElement(React.Fragment, null, React.createElement("br"), React.createElement("span", { className: "text-xs" }, "(", props.subtitle, " : ", adminVisitorFormat(props.subvalue), subunit, ")")) : null
    )
  );
}

function Div_metric_group(props) {
  const innerClass = "p-4 bg-white rounded-lg md:p-8 text-center" + (props.loading ? " animate-pulse" : "");
  const children = props.loading ? Array.from({ length: 4 }).map(function (_, idx) {
    return React.createElement(
      "div",
      { key: idx, className: "flex flex-col justify-center items-center rounded-xl space-y-2 w-full p-6" },
      React.createElement("dt", null),
      React.createElement("dd", null)
    );
  }) : props.error ? React.createElement("div", { className: "md:col-span-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-sm font-medium text-amber-800" }, "일시적으로 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.") : props.children;
  return React.createElement(
    "div",
    { className: "w-full bg-white border border-gray-200 rounded-lg shadow" },
    React.createElement(
      "div",
      { className: innerClass },
      React.createElement(Div_sub_title, { title: props.title }),
      React.createElement(
        "dl",
        { className: "grid grid-cols-1 w-full md:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 md:p-8" },
        children
      )
    )
  );
}

function Div_graph_skeleton() {
  return React.createElement("div", { className: "w-full p-4 rounded animate-pulse md:p-6" }, React.createElement("div", { className: "flex items-baseline mt-4 space-x-6" }, React.createElement("div", { className: "w-full bg-gray-200 rounded-t-lg h-72" }), React.createElement("div", { className: "w-full h-56 bg-gray-200 rounded-t-lg" }), React.createElement("div", { className: "w-full bg-gray-200 rounded-t-lg h-72" })));
}

function Div_main(props) {
  const data = props.data || {};
  const loading = props.loading || {};
  const errors = props.errors || {};
  const countsLoading = !!loading.counts;
  const graphLoading = !!loading.graph;
  return React.createElement(
    "div",
    { className: "grid grid-cols-1 md:grid-cols-12 justify-center items-start w-full px-[10px] py-[20px] md:px-[100px]" },
    React.createElement("div", { className: "md:col-span-2 self-start" }, React.createElement(Div_operation_menu, null)),
    React.createElement(
      "div",
      { className: "md:col-span-10 justify-center item-center" },
      React.createElement(
        Div_metric_group,
        { title: "방문자 수", loading: countsLoading, error: errors.counts },
        React.createElement(Div_sub_card, { title: "총 방문자 수", value: adminVisitorMetric(data, "val_visitor_total"), unit: "명" }),
        React.createElement(Div_sub_card, { title: "올해 방문자 수", value: adminVisitorMetric(data, "val_visitor_yearly"), unit: "명" }),
        React.createElement(Div_sub_card, { title: "이번 달 방문자 수", value: adminVisitorMetric(data, "val_visitor_monthly"), unit: "명" }),
        React.createElement(Div_sub_card, { title: "오늘 방문자 수", value: adminVisitorMetric(data, "val_visitor_daily"), unit: "명" })
      ),
      React.createElement(
        Div_metric_group,
        { title: "페이지 뷰", loading: countsLoading, error: errors.counts },
        React.createElement(Div_sub_card, { title: "총 페이지 뷰", value: adminVisitorMetric(data, "val_pageview_total"), unit: "건" }),
        React.createElement(Div_sub_card, { title: "올해 페이지 뷰", value: adminVisitorMetric(data, "val_pageview_yearly"), unit: "건" }),
        React.createElement(Div_sub_card, { title: "이번 달 페이지 뷰", value: adminVisitorMetric(data, "val_pageview_monthly"), unit: "건" }),
        React.createElement(Div_sub_card, { title: "오늘 페이지 뷰", value: adminVisitorMetric(data, "val_pageview_daily"), unit: "건" })
      ),
      React.createElement(
        "div",
        { className: "w-full bg-white border border-gray-200 rounded-lg shadow" },
        React.createElement(
          "div",
          { className: "p-4 bg-white rounded-lg md:p-8 text-center" + (graphLoading ? " animate-pulse" : "") },
          graphLoading ? React.createElement(Div_graph_skeleton, null) : errors.graph ? React.createElement("div", { className: "rounded-lg border border-amber-200 bg-amber-50 px-4 py-12 text-sm font-medium text-amber-800 w-full" }, "방문 추이 데이터를 일시적으로 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.") : React.createElement(
            "dl",
            { className: "flex flex-col justify-center items-start w-full p-4 mx-auto text-gray-900" },
            React.createElement(
              "ul",
              { className: "flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 w-full" },
              React.createElement("li", { className: "me-2", onClick: () => draw_chart(data.list_daily || {}, "graph_tab_daily") }, React.createElement("div", { className: class_tab_inactive, id: "graph_tab_daily" }, "일")),
              React.createElement("li", { className: "me-2", onClick: () => draw_chart(data.list_monthly || {}, "graph_tab_monthly") }, React.createElement("div", { className: class_tab_active, id: "graph_tab_monthly" }, "월")),
              React.createElement("li", { className: "me-2", onClick: () => draw_chart(data.list_yearly || {}, "graph_tab_yearly") }, React.createElement("div", { className: class_tab_inactive, id: "graph_tab_yearly" }, "년"))
            ),
            React.createElement("div", { id: "div_statistics_graph", name: "div_statistics_graph", className: "w-full h-[500px] p-8" })
          )
        )
      )
    )
  );
}

const GRAPH_TAB_IDS = ["graph_tab_daily", "graph_tab_monthly", "graph_tab_yearly"];
function draw_chart(inputData, activeTabId) {
  GRAPH_TAB_IDS.forEach((id) => {
    const el2 = document.getElementById(id);
    if (el2)
      el2.className = id === activeTabId ? class_tab_active : class_tab_inactive;
  });
  const el = document.getElementById("div_statistics_graph");
  if (!el)
    return;
  if (!window.echarts) {
    if (window.WebRAdminDashboard && window.WebRAdminDashboard.ensureECharts) {
      window.WebRAdminDashboard.ensureECharts(function() {
        draw_chart(inputData, activeTabId);
      });
    }
    return;
  }
  const prev = echarts.getInstanceByDom(el);
  if (prev)
    prev.dispose();
  const chart = echarts.init(el, null, { renderer: "canvas" });
  const rows = Object.values(inputData || {}).sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  const categories = rows.map((d) => d.date);
  const visitors = rows.map((d) => Number(d.avg_visitor || d.cnt_visitor || 0));
  const pageviews = rows.map((d) => Number(d.cnt_pageview || 0));
  const zoomStart = categories.length > 45 ? Math.round((categories.length - 45) / categories.length * 100) : 0;
  const option = {
    title: { text: "방문 추이 그래프", left: "center", top: 0, textStyle: { fontSize: 24, fontWeight: "700" } },
    legend: { data: ["방문자 수", "페이지 뷰"], top: 36 },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    toolbox: { right: 10, feature: { dataZoom: { yAxisIndex: "none" }, restore: {}, saveAsImage: {} } },
    grid: { left: 60, right: 60, top: 80, bottom: 60 },
    xAxis: { type: "category", data: categories, axisLabel: { interval: "auto", hideOverlap: true } },
    yAxis: [
      { type: "value", name: "방문자 수" },
      { type: "value", name: "페이지 뷰" }
    ],
    dataZoom: [
      { type: "inside", xAxisIndex: 0, start: zoomStart, end: 100, zoomOnMouseWheel: true, moveOnMouseMove: true },
      { type: "slider", xAxisIndex: 0, start: zoomStart, end: 100 }
    ],
    series: [
      { name: "방문자 수", type: "bar", yAxisIndex: 0, data: visitors, barMaxWidth: 28 },
      { name: "페이지 뷰", type: "bar", yAxisIndex: 1, data: pageviews, barMaxWidth: 28 }
    ]
  };
  if (categories.length === 0) {
    option.graphic = {
      type: "text",
      left: "center",
      top: "middle",
      style: { text: "표시할 방문 데이터가 없습니다.", fill: "#64748b", fontSize: 14 }
    };
  }
  chart.setOption(option);
  requestAnimationFrame(() => chart.resize());
  if (window.__adminVisitorsChartResize) {
    window.removeEventListener("resize", window.__adminVisitorsChartResize);
  }
  window.__adminVisitorsChartResize = () => chart.resize();
  window.addEventListener("resize", window.__adminVisitorsChartResize, { passive: true });
}

async function get_main() {
  const mount = document.getElementById("div_main");
  let data = {};
  let loading = { counts: true, graph: true };
  let errors = {};
  const render = (drawGraph) => {
    ReactDOM.render(
      React.createElement(Div_main, { data, loading, errors }),
      mount,
      () => {
        if (drawGraph && !loading.graph && !errors.graph) {
          requestAnimationFrame(() => draw_chart(data.list_monthly || {}, "graph_tab_monthly"));
        }
      }
    );
  };
  const loadSection = (key, url) => fetch(url, { method: "POST", credentials: "same-origin" }).then((res) => res.json()).then((payload) => {
    if (adminVisitorPayloadFailed(payload)) {
      throw new Error(payload && payload.error ? payload.error : "admin visitors payload failed");
    }
    data = { ...data, ...(payload || {}) };
    loading = { ...loading, [key]: false };
    render(key === "graph");
  }).catch((error) => {
    console.error(error);
    errors = { ...errors, [key]: true };
    loading = { ...loading, [key]: false };
    render(key === "graph");
  });
  render(false);
  await Promise.all([
    loadSection("counts", "/admin/ajax_get_admin_visitors_counts/"),
    loadSection("graph", "/admin/ajax_get_admin_visitors_graph/")
  ]);
}

async function set_main() {
  function Div_check_admin() {
    return React.createElement("div", { className: "max-w-screen-xl px-6 py-8 mx-auto space-y-4 md" }, React.createElement("div", { className: "flex flex-col justify-center items-center w-full space-y-4" }, React.createElement("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" }), React.createElement("p", null, "관리자 여부를 확인하고 있습니다.")));
  }
  function Div_main_stop() {
    return React.createElement("div", { className: "max-w-screen-xl px-6 py-8 mx-auto space-y-4" }, React.createElement("div", { className: "flex flex-col justify-center items-center w-full space-y-4" }, React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/stop.svg", className: "size-16" }), React.createElement("p", null, "관리자를 위한 메뉴입니다."), React.createElement("a", { href: "/", className: "text-gray-900 text-center bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 w-[150px] focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100" }, "첫 화면으로")));
  }
  const username = window.gv_username || "";
  if (!username) {
    location.href = "/";
    return;
  }
  const mount = document.getElementById("div_main");
  ReactDOM.render(React.createElement(Div_check_admin, null), mount);
  try {
    const headerData = await fetch("/ajax_get_menu_header/", { method: "POST" }).then((res) => res.json());
    const role = headerData && headerData.role ? headerData.role : "";
    window.gv_role = role;
    if (role === "관리자") {
      await get_main();
    } else {
      ReactDOM.render(React.createElement(Div_main_stop, null), mount);
    }
  } catch (error) {
    console.error(error);
    ReactDOM.render(React.createElement(Div_main_stop, null), mount);
  }
}
