let class_tab_active = "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active cursor-pointer";
let class_tab_inactive = "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 cursor-pointer";
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
function Div_sub_card_skeleton(props) {
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col items-center justify-center" }, /* @__PURE__ */ React.createElement("dt", { class: "text-3xl font-extrabold" }, /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-300 rounded-full w-48 mb-4" })), /* @__PURE__ */ React.createElement("dd", { class: "font-light text-gray-500" }, props.title));
}
function Div_table_skeleton() {
  function Div_row() {
    return /* @__PURE__ */ React.createElement("div", { class: "flex items-center justify-between w-full" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { class: "h-2.5 bg-gray-300 rounded-full w-24 mb-2.5" }), /* @__PURE__ */ React.createElement("div", { class: "w-32 h-2 bg-gray-200 rounded-full" })), /* @__PURE__ */ React.createElement("div", { class: "h-2.5 bg-gray-300 rounded-full w-12" }));
  }
  return /* @__PURE__ */ React.createElement("div", { role: "status", class: "w-full p-4 space-y-4 divide-y divide-gray-200 rounded animate-pulse md:p-6" }, /* @__PURE__ */ React.createElement(Div_row, null), /* @__PURE__ */ React.createElement(Div_row, null), /* @__PURE__ */ React.createElement(Div_row, null), /* @__PURE__ */ React.createElement(Div_row, null), /* @__PURE__ */ React.createElement(Div_row, null));
}
function Div_graph_skeleton() {
  return /* @__PURE__ */ React.createElement("div", { class: "w-full p-4 rounded animate-pulse md:p-6" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-baseline mt-4 space-x-6" }, /* @__PURE__ */ React.createElement("div", { class: "w-full bg-gray-200 rounded-t-lg h-72" }), /* @__PURE__ */ React.createElement("div", { class: "w-full h-56 bg-gray-200 rounded-t-lg" }), /* @__PURE__ */ React.createElement("div", { class: "w-full bg-gray-200 rounded-t-lg h-72" }), /* @__PURE__ */ React.createElement("div", { class: "w-full h-64 bg-gray-200 rounded-t-lg" }), /* @__PURE__ */ React.createElement("div", { class: "w-full bg-gray-200 rounded-t-lg h-80" }), /* @__PURE__ */ React.createElement("div", { class: "w-full bg-gray-200 rounded-t-lg h-72" }), /* @__PURE__ */ React.createElement("div", { class: "w-full bg-gray-200 rounded-t-lg h-80" })));
}
function Div_main_skeleton(props) {
  return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 md:grid-cols-12 justify-center item-center w-full px-[10px] py-[20px] md:px-[100px]" }, /* @__PURE__ */ React.createElement(Div_operation_menu, null), /* @__PURE__ */ React.createElement("div", { class: "md:col-span-10 justify-center item-center" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      id: "div_statistics_amount",
      name: "div_statistics_amount",
      class: "w-full bg-white border border-gray-200 rounded-lg shadow"
    },
    /* @__PURE__ */ React.createElement("div", { class: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement("dl", { class: "grid grid-cols-1 w-full md:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uCD1D \uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uC62C\uD574 \uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uC774\uBC88 \uB2EC \uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uC624\uB298 \uACB0\uC81C\uC561" })))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      id: "div_statistics_payment",
      name: "div_statistics_payment",
      class: "w-full bg-white border border-gray-200 rounded-lg shadow"
    },
    /* @__PURE__ */ React.createElement("div", { class: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uACB0\uC81C \uD56D\uBAA9" }), /* @__PURE__ */ React.createElement("dl", { class: "grid grid-cols-1 w-full md:grid-cols-2 gap-8 p-4 mx-auto text-gray-900 md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uD68C\uC6D0 \uC5C5\uADF8\uB808\uC774\uB4DC \uACB0\uC81C" }), /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uC138\uBBF8\uB098 \uACB0\uC81C" })))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      id: "div_statistics_graph",
      name: "div_statistics_graph",
      class: "w-full bg-white border border-gray-200 rounded-lg shadow"
    },
    /* @__PURE__ */ React.createElement("div", { class: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uACB0\uC81C \uCD94\uC774 \uADF8\uB798\uD504" }), /* @__PURE__ */ React.createElement("dl", { class: "flex flex-row justify-center items-center w-full p-4 mx-auto text-gray-900" }, /* @__PURE__ */ React.createElement(Div_graph_skeleton, null)))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      id: "div_statistics_table",
      name: "div_statistics_table",
      class: "w-full bg-white border border-gray-200 rounded-lg shadow"
    },
    /* @__PURE__ */ React.createElement("div", { class: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uACB0\uC81C \uBAA9\uB85D" }), /* @__PURE__ */ React.createElement("dl", { class: "flex flex-row justify-center items-center w-full p-4 mx-auto text-gray-900" }, /* @__PURE__ */ React.createElement(Div_table_skeleton, null)))
  )));
}
function Div_main(props) {
  const h = React.createElement;
  const data = props.data || {};
  const loaded = props.loaded || {};
  const count = data.count || {};
  const fmt = (value) => {
    const n = value === void 0 || value === null || value === "" ? 0 : value;
    return n.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  };
  const countValue = (key) => count[key] && count[key]["0"] != null ? count[key]["0"] : 0;
  const list_product_membership = Object.values(data.list_product || {}).filter((x) => x.product === "webr");
  const list_product_workshop = Object.values(data.list_product || {}).filter((x) => x.product === "seminar");
  function Div_payment_list({ data: data2, title }) {
    const payment_list = Object.keys(data2).map((k) => h("div", { className: "flex flex-row justify-between items-center w-full", key: k }, h("p", null, data2[k].product_name), h("p", null, fmt(data2[k].amt), "\uC6D0 ", "(", fmt(data2[k].cnt), "\uAC74)")));
    return h("div", { className: "flex flex-col justify-center items-center rounded-xl border border-gray-200 space-y-4 w-full p-8" }, h("p", { className: "font-extrabold underline" }, title), payment_list.length > 0 ? payment_list : h("p", { className: "text-gray-400" }, "\uD45C\uC2DC\uD560 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."));
  }
  function Div_sub_title2(props2) {
    return h("div", { className: "w-full flex justify-center items-center" }, h("p", { className: "text-2xl font-extrabold" }, props2.title));
  }
  function Div_sub_card(props2) {
    const unit = props2.unit ? props2.unit : "";
    const subunit = props2.subunit ? props2.subunit : "";
    return h("div", { className: "flex flex-col justify-center items-center rounded-xl space-y-2 w-full p-6" }, h("dt", { className: "mb-2 text-3xl md:text-3xl font-extrabold" }, fmt(props2.value), unit), h("dd", { className: "text-gray-500" }, props2.title, h("br", null), h("span", { className: "text-xs" }, "(", props2.subtitle, " : ", fmt(props2.subvalue), subunit, ")")));
  }
  function AmountBody() {
    if (!loaded.amounts) {
      return h("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, h(Div_sub_title2, { title: "\uACB0\uC81C\uC561" }), h("dl", { className: "grid grid-cols-1 w-full md:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 md:p-8" }, h(Div_sub_card_skeleton, { title: "\uCD1D \uACB0\uC81C\uC561" }), h(Div_sub_card_skeleton, { title: "\uC62C\uD574 \uACB0\uC81C\uC561" }), h(Div_sub_card_skeleton, { title: "\uC774\uBC88 \uB2EC \uACB0\uC81C\uC561" }), h(Div_sub_card_skeleton, { title: "\uC624\uB298 \uACB0\uC81C\uC561" })));
    }
    return h("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center" }, h(Div_sub_title2, { title: "\uACB0\uC81C\uC561" }), h("dl", { className: "grid grid-cols-1 w-full md:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 md:p-8" }, h(Div_sub_card, { title: "\uCD1D \uACB0\uC81C\uC561", value: countValue("sum_amount_total"), unit: "\uC6D0", subtitle: "\uCD1D \uACB0\uC81C \uAC74 \uC218", subvalue: countValue("cnt_amount_total"), subunit: "\uAC74" }), h(Div_sub_card, { title: "\uC62C\uD574 \uACB0\uC81C\uC561", value: countValue("sum_amount_yearly"), unit: "\uC6D0", subtitle: "\uC62C\uD574 \uACB0\uC81C \uAC74 \uC218", subvalue: countValue("cnt_amount_yearly"), subunit: "\uAC74" }), h(Div_sub_card, { title: "\uC774\uBC88 \uB2EC \uACB0\uC81C\uC561", value: countValue("sum_amount_monthly"), unit: "\uC6D0", subtitle: "\uC774\uBC88 \uB2EC \uACB0\uC81C \uAC74 \uC218", subvalue: countValue("cnt_amount_monthly"), subunit: "\uAC74" }), h(Div_sub_card, { title: "\uC624\uB298 \uACB0\uC81C\uC561", value: countValue("sum_amount_daily"), unit: "\uC6D0", subtitle: "\uC624\uB298 \uACB0\uC81C \uAC74 \uC218", subvalue: countValue("cnt_amount_daily"), subunit: "\uAC74" })));
  }
  function ProductsBody() {
    if (!loaded.products) {
      return h("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, h(Div_sub_title2, { title: "\uACB0\uC81C \uD56D\uBAA9" }), h("dl", { className: "grid grid-cols-1 w-full md:grid-cols-2 gap-8 p-4 mx-auto text-gray-900 md:p-8" }, h(Div_sub_card_skeleton, { title: "\uD68C\uC6D0 \uC5C5\uADF8\uB808\uC774\uB4DC \uACB0\uC81C" }), h(Div_sub_card_skeleton, { title: "\uC138\uBBF8\uB098 \uACB0\uC81C" })));
    }
    return h("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center" }, h(Div_sub_title2, { title: "\uACB0\uC81C \uD56D\uBAA9" }), h("p", null, "(\uC774\uBC88 \uB2EC \uAE30\uC900)"), h("dl", { className: "grid grid-cols-1 md:grid-cols-2 justify-center items-start w-full gap-4 p-4 mx-auto text-gray-900" }, h(Div_payment_list, { data: list_product_membership, title: "\uD68C\uC6D0 \uB4F1\uAE09 \uC5C5\uADF8\uB808\uC774\uB4DC \uACB0\uC81C" }), h(Div_payment_list, { data: list_product_workshop, title: "\uC6CC\uD06C\uC0F5 \uACB0\uC81C" })));
  }
  function GraphBody() {
    if (!loaded.graph) {
      return h("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, h(Div_sub_title2, { title: "\uACB0\uC81C \uCD94\uC774 \uADF8\uB798\uD504" }), h("dl", { className: "flex flex-row justify-center items-center w-full p-4 mx-auto text-gray-900" }, h(Div_graph_skeleton, null)));
    }
    return h("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center" }, h("dl", { className: "flex flex-col justify-center items-start w-full p-4 mx-auto text-gray-900" }, h("ul", { className: "flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 w-full" }, h("li", { className: "me-2", onClick: () => draw_chart(data.list_daily, "graph_tab_daily") }, h("div", { className: class_tab_inactive, id: "graph_tab_daily" }, "\uC77C")), h("li", { className: "me-2", onClick: () => draw_chart(data.list_monthly, "graph_tab_monthly") }, h("div", { className: class_tab_active, id: "graph_tab_monthly" }, "\uC6D4")), h("li", { className: "me-2", onClick: () => draw_chart(data.list_yearly, "graph_tab_yearly") }, h("div", { className: class_tab_inactive, id: "graph_tab_yearly" }, "\uB144"))), h("div", { id: "div_statistics_graph", name: "div_statistics_graph", className: "w-full h-[500px] p-8" })));
  }
  return h("div", { className: "grid grid-cols-1 md:grid-cols-12 justify-center items-start w-full px-[10px] py-[20px] md:px-[100px]" }, h("div", { className: "md:col-span-2 self-start" }, h(Div_operation_menu, null)), h("div", { className: "md:col-span-10 justify-center item-center" }, h("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, h(AmountBody, null)), h("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, h(ProductsBody, null)), h("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, h(GraphBody, null))));
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
  const rows = Object.values(inputData || {}).sort((a, b) => new Date(a.date) - new Date(b.date));
  const categories = rows.map((d) => d.date);
  const amounts = rows.map((d) => d.amt || 0);
  const counts = rows.map((d) => d.cnt || 0);
  const option = {
    title: { text: "\uACB0\uC81C \uCD94\uC774 \uADF8\uB798\uD504", left: "center", top: 0, textStyle: { fontSize: 24, fontWeight: "700" } },
    legend: { data: ["\uACB0\uC81C\uC561", "\uACB0\uC81C \uAC74 \uC218"], top: 36 },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    toolbox: { right: 10, feature: { dataZoom: { yAxisIndex: "none" }, restore: {}, saveAsImage: {} } },
    grid: { left: 60, right: 60, top: 80, bottom: 60 },
    xAxis: { type: "category", data: categories, axisLabel: { interval: "auto" } },
    yAxis: [
      { type: "value", name: "\uACB0\uC81C\uC561" },
      { type: "value", name: "\uACB0\uC81C \uAC74 \uC218" }
    ],
    dataZoom: [
      { type: "inside", xAxisIndex: 0, zoomOnMouseWheel: true, moveOnMouseMove: true },
      { type: "slider", xAxisIndex: 0 }
    ],
    series: [
      { name: "\uACB0\uC81C\uC561", type: "bar", yAxisIndex: 0, data: amounts, barMaxWidth: 28 },
      { name: "\uACB0\uC81C \uAC74 \uC218", type: "bar", yAxisIndex: 1, data: counts, barMaxWidth: 28 }
    ]
  };
  chart.setOption(option);
  requestAnimationFrame(() => chart.resize());
  window.addEventListener("resize", () => chart.resize(), { passive: true });
  if (el.offsetWidth === 0 || el.offsetHeight === 0) {
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        ro.disconnect();
        chart.resize();
      }
    });
    ro.observe(el);
  }
}
async function get_main() {
  const mount = document.getElementById("div_main");
  let data = {};
  let loaded = { amounts: false, products: false, graph: false };
  let graphReady = false;
  const render = function(drawGraph) {
    const shouldDrawGraph = drawGraph || graphReady;
    ReactDOM.render(
      /* @__PURE__ */ React.createElement(Div_main, { data, loaded }),
      mount,
      () => {
        if (loaded.graph && shouldDrawGraph) {
          requestAnimationFrame(() => {
            draw_chart(data.list_monthly, "graph_tab_monthly");
          });
        }
      }
    );
  };
  const loadSection = function(key, url, drawGraph) {
    return fetch(url, { method: "POST", credentials: "same-origin" }).then((res) => res.json()).then((payload) => {
      data = { ...data, ...(payload || {}) };
      loaded = { ...loaded, [key]: true };
      graphReady = graphReady || drawGraph;
      render(drawGraph);
    }).catch((error) => {
      console.error(error);
      loaded = { ...loaded, [key]: true };
      render(false);
    });
  };
  render(false);
  await Promise.allSettled([
    loadSection("amounts", "/admin/ajax_get_admin_payments_amounts/", false),
    loadSection("products", "/admin/ajax_get_admin_payments_products/", false),
    loadSection("graph", "/admin/ajax_get_admin_payments_graph/", true)
  ]);
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

/* Immutable full asset: pinned legacy base above, guarded loader below. */
(function () {
  var ADMIN_PAYMENTS_GUARD_CONTRACT = Object.freeze({
    auth: "SERVER_PAGE_AUTH_TRUSTED_NO_MENU_HEADER_FETCH",
    order: "AMOUNTS_FIRST_THEN_PRODUCTS_AND_GRAPH",
    retry: "BOUNDED_RETRY_MAX_3",
    failure: "INVALID_PAYLOAD_STAYS_SKELETON_OR_LAST_GOOD",
    missing: "MISSING_METRIC_IS_NOT_ZERO",
    zero: "COMPLETE_ALL_ZERO_AMOUNTS_REJECTED"
  });
  var ADMIN_PAYMENTS_GUARD_MAX_ATTEMPTS = 3;
  var ADMIN_PAYMENTS_GUARD_RETRY_DELAYS_MS = [250, 750];
  var ADMIN_PAYMENTS_GUARD_REQUEST_TIMEOUT_MS = 30000;
  var ADMIN_PAYMENTS_GUARD_ENDPOINTS = Object.freeze({
    amounts: "/admin/ajax_get_admin_payments_amounts/",
    products: "/admin/ajax_get_admin_payments_products/",
    graph: "/admin/ajax_get_admin_payments_graph/"
  });
  var ADMIN_PAYMENTS_GUARD_AMOUNT_KEYS = [
    "sum_amount_total", "cnt_amount_total",
    "sum_amount_yearly", "cnt_amount_yearly",
    "sum_amount_monthly", "cnt_amount_monthly",
    "sum_amount_daily", "cnt_amount_daily"
  ];
  var adminPaymentsGuardState = window.__webrAdminPaymentsGuardState || {
    data: {},
    loaded: { amounts: false, products: false, graph: false },
    lastGood: {},
    delayed: {},
    loadPromise: null,
    mainPromise: null
  };
  window.__webrAdminPaymentsGuardState = adminPaymentsGuardState;

  function adminPaymentsGuardFlag(value) {
    if (value === true || value === 1) return true;
    var normalized = String(value == null ? "" : value).trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }

  function adminPaymentsGuardObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function adminPaymentsGuardIndexed(value) {
    return adminPaymentsGuardObject(value) || Array.isArray(value);
  }

  function adminPaymentsGuardMetric(count, key) {
    if (!adminPaymentsGuardObject(count) || !adminPaymentsGuardObject(count[key])) return null;
    if (!Object.prototype.hasOwnProperty.call(count[key], "0")) return null;
    var raw = count[key]["0"];
    if (raw === null || raw === "" || typeof raw === "boolean") return null;
    var parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function adminPaymentsGuardMetricPresent(count, key) {
    return adminPaymentsGuardMetric(count, key) !== null;
  }

  function adminPaymentsGuardAmountsAllZero(payload) {
    return ADMIN_PAYMENTS_GUARD_AMOUNT_KEYS.every(function (key) {
      return adminPaymentsGuardMetric(payload.count, key) === 0;
    });
  }

  function adminPaymentsGuardPayloadUnavailable(payload) {
    if (!adminPaymentsGuardObject(payload)) return true;
    if (!adminPaymentsGuardFlag(payload.ok)) return true;
    var failed = ["pending", "fallback", "partial"].some(function (key) {
      return adminPaymentsGuardFlag(payload[key]);
    });
    if (failed) return true;
    var status = String(payload.status || payload.state || "").trim().toLowerCase();
    return ["failed", "failure", "error", "pending", "fallback", "unavailable"].indexOf(status) >= 0;
  }

  function adminPaymentsGuardPayloadValid(section, payload) {
    if (adminPaymentsGuardPayloadUnavailable(payload)) return false;
    if (section === "amounts") {
      var complete = ADMIN_PAYMENTS_GUARD_AMOUNT_KEYS.every(function (key) {
        return adminPaymentsGuardMetricPresent(payload.count, key);
      });
      return complete && !adminPaymentsGuardAmountsAllZero(payload);
    }
    if (section === "products") return adminPaymentsGuardIndexed(payload.list_product);
    if (section === "graph") {
      return adminPaymentsGuardIndexed(payload.list_daily) &&
        adminPaymentsGuardIndexed(payload.list_monthly) &&
        adminPaymentsGuardIndexed(payload.list_yearly);
    }
    return false;
  }

  function adminPaymentsGuardDelay(delayMS) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, delayMS);
    });
  }

  function adminPaymentsGuardFetchJSON(url) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () {
      controller.abort();
    }, ADMIN_PAYMENTS_GUARD_REQUEST_TIMEOUT_MS) : null;
    return fetch(url, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      if (!response.ok) throw new Error("ADMIN_PAYMENTS_HTTP_FAILURE");
      return response.json();
    }).finally(function () {
      if (timer !== null) window.clearTimeout(timer);
    });
  }

  async function adminPaymentsGuardLoadSection(section, attemptCount, attemptOffset) {
    var totalAttempts = Number.isFinite(Number(attemptCount))
      ? Math.max(1, Math.min(ADMIN_PAYMENTS_GUARD_MAX_ATTEMPTS, Number(attemptCount)))
      : ADMIN_PAYMENTS_GUARD_MAX_ATTEMPTS;
    var offset = Number.isFinite(Number(attemptOffset)) ? Math.max(0, Number(attemptOffset)) : 0;
    var lastError = null;
    for (var localAttempt = 0; localAttempt < totalAttempts; localAttempt += 1) {
      var globalAttempt = offset + localAttempt;
      if (globalAttempt > 0) {
        var delayIndex = Math.min(globalAttempt - 1, ADMIN_PAYMENTS_GUARD_RETRY_DELAYS_MS.length - 1);
        await adminPaymentsGuardDelay(ADMIN_PAYMENTS_GUARD_RETRY_DELAYS_MS[delayIndex]);
      }
      try {
        var payload = await adminPaymentsGuardFetchJSON(ADMIN_PAYMENTS_GUARD_ENDPOINTS[section]);
        if (!adminPaymentsGuardPayloadValid(section, payload)) {
          throw new Error("ADMIN_PAYMENTS_INVALID_" + section.toUpperCase() + "_PAYLOAD");
        }
        return payload;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("ADMIN_PAYMENTS_SECTION_UNAVAILABLE");
  }

  function adminPaymentsGuardRender(drawGraph) {
    var mount = document.getElementById("div_main");
    if (!mount || typeof React === "undefined" || typeof ReactDOM === "undefined" || typeof Div_main !== "function") return;
    ReactDOM.render(
      React.createElement(Div_main, { data: adminPaymentsGuardState.data, loaded: adminPaymentsGuardState.loaded }),
      mount,
      function () {
        if (!adminPaymentsGuardState.loaded.graph || typeof draw_chart !== "function") return;
        window.requestAnimationFrame(function () {
          draw_chart(adminPaymentsGuardState.data.list_monthly || {}, "graph_tab_monthly");
        });
      }
    );
  }

  function adminPaymentsGuardRenderDelayNotice() {
    var mount = document.getElementById("div_main");
    if (!mount || !mount.parentNode) return;
    var notice = document.getElementById("webr-admin-payments-delay");
    var delayed = Object.keys(adminPaymentsGuardState.delayed).some(function (key) {
      return adminPaymentsGuardState.delayed[key];
    });
    if (!delayed) {
      if (notice) notice.remove();
      return;
    }
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "webr-admin-payments-delay";
      notice.className = "mx-auto mt-4 max-w-screen-xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900";
      var message = document.createElement("span");
      message.textContent = "일부 결제 집계가 지연되고 있습니다. 마지막 정상값 또는 로딩 화면을 유지합니다. ";
      var retry = document.createElement("button");
      retry.type = "button";
      retry.className = "font-semibold underline underline-offset-2";
      retry.textContent = "다시 시도";
      retry.addEventListener("click", function () { window.set_main(); });
      notice.appendChild(message);
      notice.appendChild(retry);
      mount.parentNode.insertBefore(notice, mount);
    }
  }

  function adminPaymentsGuardCommit(section, payload) {
    adminPaymentsGuardState.lastGood[section] = payload;
    adminPaymentsGuardState.data = Object.assign({}, adminPaymentsGuardState.data, payload);
    adminPaymentsGuardState.loaded = Object.assign({}, adminPaymentsGuardState.loaded, (function () {
      var next = {};
      next[section] = true;
      return next;
    })());
    adminPaymentsGuardState.delayed[section] = false;
    adminPaymentsGuardRenderDelayNotice();
    adminPaymentsGuardRender(section === "graph");
  }

  async function adminPaymentsGuardTrySection(section, attemptCount, attemptOffset, deferFailure) {
    try {
      var payload = await adminPaymentsGuardLoadSection(section, attemptCount, attemptOffset);
      adminPaymentsGuardCommit(section, payload);
      return true;
    } catch (error) {
      if (!deferFailure) {
        adminPaymentsGuardState.delayed[section] = true;
        adminPaymentsGuardRenderDelayNotice();
        console.warn("admin payments guard kept " + (adminPaymentsGuardState.lastGood[section] ? "last-good" : "skeleton") + " for " + section);
      }
      return false;
    }
  }

  async function adminPaymentsGuardGetMain() {
    if (adminPaymentsGuardState.loadPromise) return adminPaymentsGuardState.loadPromise;
    adminPaymentsGuardState.loadPromise = (async function () {
      adminPaymentsGuardRender(false);
      var amountsLoaded = await adminPaymentsGuardTrySection("amounts", 1, 0, true);
      var parallelLoads = [
        adminPaymentsGuardTrySection("products", 3, 0, false),
        adminPaymentsGuardTrySection("graph", 3, 0, false)
      ];
      if (!amountsLoaded) {
        parallelLoads.unshift(adminPaymentsGuardTrySection("amounts", 2, 1, false));
      }
      await Promise.all(parallelLoads);
    })();
    try {
      await adminPaymentsGuardState.loadPromise;
    } finally {
      adminPaymentsGuardState.loadPromise = null;
    }
  }

  async function adminPaymentsGuardSetMain() {
    if (adminPaymentsGuardState.mainPromise) return adminPaymentsGuardState.mainPromise;
    adminPaymentsGuardState.mainPromise = (async function () {
      var mount = document.getElementById("div_main");
      if (!mount) return;
      var hasLastGood = Object.keys(adminPaymentsGuardState.lastGood).length > 0;
      if (!hasLastGood && typeof React !== "undefined" && typeof ReactDOM !== "undefined" && typeof Div_main_skeleton === "function") {
        ReactDOM.render(React.createElement(Div_main_skeleton), mount);
      }
      await adminPaymentsGuardGetMain();
    })();
    try {
      await adminPaymentsGuardState.mainPromise;
    } finally {
      adminPaymentsGuardState.mainPromise = null;
    }
  }

  window.WebRAdminPaymentsReadGuard = Object.freeze({
    contract: ADMIN_PAYMENTS_GUARD_CONTRACT,
    payloadUnavailable: adminPaymentsGuardPayloadUnavailable,
    payloadValid: adminPaymentsGuardPayloadValid,
    loadSection: adminPaymentsGuardLoadSection,
    getMain: adminPaymentsGuardGetMain
  });
  window.get_main = adminPaymentsGuardGetMain;
  window.set_main = adminPaymentsGuardSetMain;
  try { get_main = adminPaymentsGuardGetMain; } catch (error) { /* window binding is sufficient */ }
  try { set_main = adminPaymentsGuardSetMain; } catch (error) { /* window binding is sufficient */ }

  window.setTimeout(function () {
    if (window.__webr_set_main_called__) window.set_main();
  }, 0);
})();
