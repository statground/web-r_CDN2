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
function paymentText(value) {
  if (value === void 0 || value === null)
    return "";
  return String(value);
}
function paymentNumber(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
function formatPaymentAmount(value) {
  return paymentNumber(value).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
function paymentRowsFromData(data) {
  return Object.values((data && (data.list_payers || data.list_payments)) || {}).map((row) => row || {});
}
function paymentProductOptionRows(data) {
  return Object.values((data && data.product_options) || {}).filter((row) => {
    const item = row || {};
    return paymentText(item.product_name).trim() || paymentText(item.product).trim();
  });
}
function paymentSearchHaystack(row) {
  return [
    row.email,
    row.username,
    row.phone,
    row.product_name,
    row.order_id,
    row.uuid_user,
    row.status,
    row.method,
    row.paid_at
  ].map(paymentText).join(" ").toLowerCase();
}
function Div_payer_table(props) {
  const initialRows = React.useMemo(() => paymentRowsFromData(props.data), [props.data]);
  const initialTotal = paymentNumber(props.data && props.data.payer_total) || initialRows.length;
  const initialProductOptions = React.useMemo(() => paymentProductOptionRows(props.data), [props.data]);
  const pageSize = 5;
  const [search, setSearch] = React.useState("");
  const [product, setProduct] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState(initialRows);
  const [total, setTotal] = React.useState(initialTotal);
  const [productOptions, setProductOptions] = React.useState(initialProductOptions);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");
  React.useEffect(() => {
    const rawQuery = search.trim();
    let canceled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const body = new URLSearchParams();
        body.set("q", rawQuery);
        body.set("product", product);
        body.set("page", String(page));
        body.set("page_size", String(pageSize));
        const result = await fetch("/admin/ajax_search_admin_payments/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body
        }).then((res) => res.json());
        if (!canceled) {
          const nextRows = paymentRowsFromData(result);
          const nextTotal = paymentNumber(result && result.total);
          setRows(nextRows);
          setTotal(nextTotal);
          setProductOptions(paymentProductOptionRows(result));
          setMessage("");
        }
      } catch (error) {
        if (!canceled) {
          setRows([]);
          setTotal(0);
          setMessage("\uACB0\uC81C\uC790 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
        }
      } finally {
        if (!canceled)
          setLoading(false);
      }
    }, 200);
    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [search, product, page]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startNo = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endNo = total === 0 ? 0 : Math.min(total, (page - 1) * pageSize + rows.length);
  const countText = loading ? "\uBD88\uB7EC\uC624\uB294 \uC911" : startNo.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + "-" + endNo.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + " / " + total.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + "\uAC74";
  const tableRows = rows.length > 0 ? rows.map((row, index) => {
    const payerName = paymentText(row.username).trim() || "-";
    const email = paymentText(row.email).trim();
    const orderID = paymentText(row.order_id).trim();
    return /* @__PURE__ */ React.createElement("tr", { key: orderID || index, className: "hover:bg-gray-50" }, /* @__PURE__ */ React.createElement("td", { className: "whitespace-nowrap px-4 py-3 text-gray-700" }, paymentText(row.paid_at) || "-"), /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-gray-900" }, payerName), email ? /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-xs text-gray-500" }, email) : null), /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3 text-gray-700" }, paymentText(row.product_name) || "-"), /* @__PURE__ */ React.createElement("td", { className: "whitespace-nowrap px-4 py-3 text-right font-bold text-gray-900" }, formatPaymentAmount(row.amount), "원"), /* @__PURE__ */ React.createElement("td", { className: "whitespace-nowrap px-4 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700" }, paymentText(row.status) || "DONE")), /* @__PURE__ */ React.createElement("td", { className: "whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500" }, orderID || "-"));
  }) : /* @__PURE__ */ React.createElement(
    "tr",
    null,
    /* @__PURE__ */ React.createElement("td", { colSpan: 6, className: "px-4 py-10 text-center text-sm text-gray-500" }, "표시할 결제자가 없습니다.")
  );
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "w-full bg-white border border-gray-200 rounded-lg shadow" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "p-4 bg-white rounded-lg md:p-8" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-left" },
          /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-extrabold text-gray-900" }, "\uACB0\uC81C\uC790 \uBAA9\uB85D"),
          /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, countText)
        ),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "grid w-full grid-cols-1 gap-2 md:w-[34rem] md:grid-cols-2" },
          /* @__PURE__ */ React.createElement(
            "select",
            {
              value: product,
              onChange: (event) => {
                setProduct(event.target.value);
                setPage(1);
              },
              className: "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            },
            /* @__PURE__ */ React.createElement("option", { value: "" }, "\uC804\uCCB4 product"),
            productOptions.map((row, index) => {
              const item = row || {};
              const productName = paymentText(item.product_name).trim();
              const productGroup = paymentText(item.product).trim();
              const value = productName ? "name:" + productName : "group:" + productGroup;
              const label = productName && productGroup && productName !== productGroup ? productName + " (" + productGroup + ")" : productName || productGroup;
              return /* @__PURE__ */ React.createElement("option", { key: value + "-" + index, value }, label);
            })
          ),
          /* @__PURE__ */ React.createElement("input", {
            type: "search",
            value: search,
            onChange: (event) => {
              setSearch(event.target.value);
              setPage(1);
            },
            placeholder: "\uC774\uBA54\uC77C, \uC774\uB984, \uC8FC\uBB38\uBC88\uD638 \uAC80\uC0C9",
            className: "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          })
        )
      ),
      message ? /* @__PURE__ */ React.createElement("p", { className: "mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700" }, message) : null,
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "mt-4 overflow-x-auto rounded-lg border border-gray-200" },
        /* @__PURE__ */ React.createElement(
          "table",
          { className: "min-w-full divide-y divide-gray-200 text-left text-sm" },
          /* @__PURE__ */ React.createElement(
            "thead",
            { className: "bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500" },
            /* @__PURE__ */ React.createElement(
              "tr",
              null,
              /* @__PURE__ */ React.createElement("th", { className: "px-4 py-3" }, "결제일"),
              /* @__PURE__ */ React.createElement("th", { className: "px-4 py-3" }, "결제자"),
              /* @__PURE__ */ React.createElement("th", { className: "px-4 py-3" }, "상품"),
              /* @__PURE__ */ React.createElement("th", { className: "px-4 py-3 text-right" }, "결제액"),
              /* @__PURE__ */ React.createElement("th", { className: "px-4 py-3" }, "상태"),
              /* @__PURE__ */ React.createElement("th", { className: "px-4 py-3" }, "주문번호")
            )
          ),
          /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-gray-100 bg-white" }, tableRows)
        )
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" },
        /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-500" }, countText),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "flex items-center justify-end gap-2" },
          /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              disabled: loading || page <= 1,
              onClick: () => setPage((value) => Math.max(1, value - 1)),
              className: "h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            },
            "\uC774\uC804"
          ),
          /* @__PURE__ */ React.createElement("span", { className: "min-w-[5rem] text-center text-sm font-bold text-gray-700" }, page, " / ", totalPages),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              disabled: loading || page >= totalPages,
              onClick: () => setPage((value) => value + 1),
              className: "h-9 rounded-lg border border-gray-300 px-3 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            },
            "\uB2E4\uC74C"
          )
        )
      )
    )
  );
}
function fetchPaymentCard(url) {
  return fetch(url, { method: "POST" }).then((res) => {
    if (!res.ok)
      throw new Error("request failed");
    return res.json();
  });
}
function paymentObjectValues(data, key) {
  return Object.values((data && data[key]) || {});
}
function paymentMetricMapValue(count, key) {
  const bucket = count && count[key] ? count[key] : {};
  return paymentNumber(bucket["0"]);
}
function Div_card_error(props) {
  return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center" }, /* @__PURE__ */ React.createElement(Div_sub_title2, { title: props.title }), /* @__PURE__ */ React.createElement("p", { className: "mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700" }, "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.")));
}
function Div_sub_title2(props) {
  return /* @__PURE__ */ React.createElement("div", { className: "w-full flex justify-center items-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-extrabold" }, props.title));
}
function Div_sub_card(props) {
  let value = props.value;
  let subvalue = props.subvalue;
  const unit = props.unit ? props.unit : "";
  const subunit = props.subunit ? props.subunit : "";
  if (value === void 0 || value === null || value === "")
    value = 0;
  if (subvalue === void 0 || subvalue === null || subvalue === "")
    subvalue = 0;
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col justify-center items-center rounded-xl space-y-2 w-full p-6" }, /* @__PURE__ */ React.createElement("dt", { className: "mb-2 text-3xl md:text-3xl font-extrabold" }, value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), unit), /* @__PURE__ */ React.createElement("dd", { className: "text-gray-500" }, props.title, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, "(", props.subtitle, " : ", subvalue.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), subunit, ")")));
}
function Div_payment_list({ data, title }) {
  const rows = Array.isArray(data) ? data : Object.values(data || {});
  const payment_list = rows.map((row, index) => /* @__PURE__ */ React.createElement("div", { className: "flex flex-row justify-between items-center w-full gap-4", key: paymentText(row.product_name) + "-" + index }, /* @__PURE__ */ React.createElement("p", { className: "text-left" }, paymentText(row.product_name) || "-"), /* @__PURE__ */ React.createElement("p", { className: "whitespace-nowrap" }, formatPaymentAmount(row.amt), "\uC6D0", " ", "(", formatPaymentAmount(row.cnt), "\uAC74)")));
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col justify-center items-center rounded-xl border border-gray-200 space-y-4 w-full p-8" }, /* @__PURE__ */ React.createElement("p", { className: "font-extrabold underline" }, title), payment_list.length > 0 ? payment_list : /* @__PURE__ */ React.createElement("p", { className: "text-gray-400" }, "\uD45C\uC2DC\uD560 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."));
}
function Div_amount_card() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    let canceled = false;
    fetchPaymentCard("/admin/ajax_get_admin_payments_amounts/").then((result) => {
      if (!canceled)
        setData(result || {});
    }).catch(() => {
      if (!canceled)
        setError(true);
    });
    return () => {
      canceled = true;
    };
  }, []);
  if (error)
    return /* @__PURE__ */ React.createElement(Div_card_error, { title: "\uACB0\uC81C\uC561" });
  if (!data)
    return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement("dl", { className: "grid grid-cols-1 w-full md:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uCD1D \uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uC62C\uD574 \uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uC774\uBC88 \uB2EC \uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uC624\uB298 \uACB0\uC81C\uC561" }))));
  const count = data.count || {};
  return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center" }, /* @__PURE__ */ React.createElement(Div_sub_title2, { title: "\uACB0\uC81C\uC561" }), /* @__PURE__ */ React.createElement("dl", { className: "grid grid-cols-1 w-full md:grid-cols-4 gap-8 p-4 mx-auto text-gray-900 md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uCD1D \uACB0\uC81C\uC561", value: paymentMetricMapValue(count, "sum_amount_total"), unit: "\uC6D0", subtitle: "\uCD1D \uACB0\uC81C \uAC74 \uC218", subvalue: paymentMetricMapValue(count, "cnt_amount_total"), subunit: "\uAC74" }), /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uC62C\uD574 \uACB0\uC81C\uC561", value: paymentMetricMapValue(count, "sum_amount_yearly"), unit: "\uC6D0", subtitle: "\uC62C\uD574 \uACB0\uC81C \uAC74 \uC218", subvalue: paymentMetricMapValue(count, "cnt_amount_yearly"), subunit: "\uAC74" }), /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uC774\uBC88 \uB2EC \uACB0\uC81C\uC561", value: paymentMetricMapValue(count, "sum_amount_monthly"), unit: "\uC6D0", subtitle: "\uC774\uBC88 \uB2EC \uACB0\uC81C \uAC74 \uC218", subvalue: paymentMetricMapValue(count, "cnt_amount_monthly"), subunit: "\uAC74" }), /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uC624\uB298 \uACB0\uC81C\uC561", value: paymentMetricMapValue(count, "sum_amount_daily"), unit: "\uC6D0", subtitle: "\uC624\uB298 \uACB0\uC81C \uAC74 \uC218", subvalue: paymentMetricMapValue(count, "cnt_amount_daily"), subunit: "\uAC74" }))));
}
function Div_product_card() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    let canceled = false;
    fetchPaymentCard("/admin/ajax_get_admin_payments_products/").then((result) => {
      if (!canceled)
        setData(result || {});
    }).catch(() => {
      if (!canceled)
        setError(true);
    });
    return () => {
      canceled = true;
    };
  }, []);
  if (error)
    return /* @__PURE__ */ React.createElement(Div_card_error, { title: "\uACB0\uC81C \uD56D\uBAA9" });
  if (!data)
    return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uACB0\uC81C \uD56D\uBAA9" }), /* @__PURE__ */ React.createElement("dl", { className: "grid grid-cols-1 w-full md:grid-cols-2 gap-8 p-4 mx-auto text-gray-900 md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uD68C\uC6D0 \uC5C5\uADF8\uB808\uC774\uB4DC \uACB0\uC81C" }), /* @__PURE__ */ React.createElement(Div_sub_card_skeleton, { title: "\uC138\uBBF8\uB098 \uACB0\uC81C" }))));
  const listProduct = paymentObjectValues(data, "list_product");
  const list_product_membership = listProduct.filter((x) => x.product === "webr");
  const list_product_workshop = listProduct.filter((x) => x.product === "seminar");
  return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center" }, /* @__PURE__ */ React.createElement(Div_sub_title2, { title: "\uACB0\uC81C \uD56D\uBAA9" }), /* @__PURE__ */ React.createElement("p", null, "(\uC774\uBC88 \uB2EC \uAE30\uC900)"), /* @__PURE__ */ React.createElement("dl", { className: "grid grid-cols-1 md:grid-cols-2 justify-center items-start w-full gap-4 p-4 mx-auto text-gray-900" }, /* @__PURE__ */ React.createElement(Div_payment_list, { data: list_product_membership, title: "\uD68C\uC6D0 \uB4F1\uAE09 \uC5C5\uADF8\uB808\uC774\uB4DC \uACB0\uC81C" }), /* @__PURE__ */ React.createElement(Div_payment_list, { data: list_product_workshop, title: "\uC6CC\uD06C\uC0F5 \uACB0\uC81C" }))));
}
function Div_graph_card() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("graph_tab_monthly");
  React.useEffect(() => {
    let canceled = false;
    fetchPaymentCard("/admin/ajax_get_admin_payments_graph/").then((result) => {
      if (!canceled)
        setData(result || {});
    }).catch(() => {
      if (!canceled)
        setError(true);
    });
    return () => {
      canceled = true;
    };
  }, []);
  React.useEffect(() => {
    if (data)
      requestAnimationFrame(() => draw_chart(data.list_monthly, "graph_tab_monthly"));
  }, [data]);
  if (error)
    return /* @__PURE__ */ React.createElement(Div_card_error, { title: "\uACB0\uC81C \uCD94\uC774 \uADF8\uB798\uD504" });
  if (!data)
    return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center animate-pulse" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uACB0\uC81C \uCD94\uC774 \uADF8\uB798\uD504" }), /* @__PURE__ */ React.createElement("dl", { className: "flex flex-row justify-center items-center w-full p-4 mx-auto text-gray-900" }, /* @__PURE__ */ React.createElement(Div_graph_skeleton, null))));
  const drawGraph = (rows, tabID) => {
    setActiveTab(tabID);
    requestAnimationFrame(() => draw_chart(rows, tabID));
  };
  return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white border border-gray-200 rounded-lg shadow" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-white rounded-lg md:p-8 text-center" }, /* @__PURE__ */ React.createElement("dl", { className: "flex flex-col justify-center items-start w-full p-4 mx-auto text-gray-900" }, /* @__PURE__ */ React.createElement("ul", { className: "flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 w-full" }, /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => drawGraph(data.list_daily, "graph_tab_daily") }, /* @__PURE__ */ React.createElement("div", { className: activeTab === "graph_tab_daily" ? class_tab_active : class_tab_inactive, id: "graph_tab_daily" }, "\uC77C")), /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => drawGraph(data.list_monthly, "graph_tab_monthly") }, /* @__PURE__ */ React.createElement("div", { className: activeTab === "graph_tab_monthly" ? class_tab_active : class_tab_inactive, id: "graph_tab_monthly" }, "\uC6D4")), /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => drawGraph(data.list_yearly, "graph_tab_yearly") }, /* @__PURE__ */ React.createElement("div", { className: activeTab === "graph_tab_yearly" ? class_tab_active : class_tab_inactive, id: "graph_tab_yearly" }, "\uB144"))), /* @__PURE__ */ React.createElement("div", { id: "div_statistics_graph", name: "div_statistics_graph", className: "w-full h-[500px] p-8" }))));
}
function Div_main() {
  return /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-12 justify-center items-start w-full px-[10px] py-[20px] md:px-[100px]" }, /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2 self-start" }, /* @__PURE__ */ React.createElement(Div_operation_menu, null)), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-10 justify-center item-center" }, /* @__PURE__ */ React.createElement(Div_amount_card, null), /* @__PURE__ */ React.createElement(Div_product_card, null), /* @__PURE__ */ React.createElement(Div_graph_card, null), /* @__PURE__ */ React.createElement(Div_payer_table, { data: {} })));
}
const GRAPH_TAB_IDS = ["graph_tab_daily", "graph_tab_monthly", "graph_tab_yearly"];
function paymentChartNumber(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
function paymentChartRows(inputData) {
  return Object.values(inputData || {}).map((row) => {
    const date = row && row.date ? String(row.date) : "";
    return {
      date,
      amt: paymentChartNumber(row && (row.amt ?? row.amount ?? row.sum_amount ?? row.sum)),
      cnt: paymentChartNumber(row && (row.cnt ?? row.count ?? row.cnt_amount))
    };
  }).filter((row) => row.date).sort((a, b) => new Date(a.date) - new Date(b.date));
}
function renderPaymentChartEmpty(el, text) {
  el.innerHTML = '<div class="flex h-full min-h-[320px] w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">' + text + "</div>";
}
function draw_chart(inputData, activeTabId, attempt) {
  attempt = attempt || 0;
  GRAPH_TAB_IDS.forEach((id) => {
    const el2 = document.getElementById(id);
    if (el2)
      el2.className = id === activeTabId ? class_tab_active : class_tab_inactive;
  });
  const el = document.getElementById("div_statistics_graph");
  if (!el)
    return;
  if (typeof echarts === "undefined") {
    renderPaymentChartEmpty(el, "\uCC28\uD2B8 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.");
    if (attempt < 20) {
      setTimeout(() => draw_chart(inputData, activeTabId, attempt + 1), 150);
    }
    return;
  }
  const rows = paymentChartRows(inputData);
  if (!rows.length) {
    const prev2 = echarts.getInstanceByDom(el);
    if (prev2)
      prev2.dispose();
    renderPaymentChartEmpty(el, "\uD45C\uC2DC\uD560 \uACB0\uC81C \uCD94\uC774 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
    return;
  }
  if ((el.offsetWidth === 0 || el.offsetHeight === 0) && attempt < 12) {
    requestAnimationFrame(() => draw_chart(inputData, activeTabId, attempt + 1));
    return;
  }
  const prev = echarts.getInstanceByDom(el);
  if (prev)
    prev.dispose();
  el.innerHTML = "";
  const chart = echarts.init(el, null, { renderer: "canvas" });
  const categories = rows.map((d) => d.date);
  const amounts = rows.map((d) => d.amt);
  const counts = rows.map((d) => d.cnt);
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
  const resizeChart = () => chart.resize();
  requestAnimationFrame(resizeChart);
  setTimeout(resizeChart, 80);
  window.addEventListener("resize", resizeChart, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        resizeChart();
        ro.disconnect();
      }
    });
    ro.observe(el);
  }
}
async function get_main() {
  ReactDOM.render(
    /* @__PURE__ */ React.createElement(Div_main, null),
    document.getElementById("div_main")
  );
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
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_skeleton, null), mount);
      await get_main();
    } else {
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_stop, null), mount);
    }
  } catch (error) {
    console.error(error);
    mount.innerHTML = '<div class="text-center text-gray-500 py-10">\uAD00\uB9AC\uC790 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.</div>';
  }
}
