(function (global) {
  "use strict";

  if (global.__webrMembershipPage202608072129) {
    return;
  }
  global.__webrMembershipPage202608072129 = true;
  let userinfo = null;
  let products = [];
  let selectedProduct = null;
  let teamQuantity = 1;
  let busyKey = "";
  let checkoutState = "idle";
  let pageMessage = "";
  const money = value => (Number(value) || 0).toLocaleString("ko-KR");
  const cleanRole = role => String(role || "").replace(/\s+/g, "");
  const paidRoles = ["정회원", "VIP회원", "기관회원", "기관/팀회원", "기업회원"];
  const noExpiryRoles = ["준회원", "게스트", "관리자"];
  const safeProductIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const membership = () => userinfo && userinfo.membership ? userinfo.membership : {};
  function globals() {
    const value = global.__webr_globals__;
    return value && typeof value === "object" ? value : {};
  }
  function experimentsEnabled() {
    return globals().product_experiments === true;
  }
  function canSelectProduct() {
    return userinfo != null && cleanRole(userinfo.role) !== "관리자";
  }
  function isAuthenticated() {
    return userinfo != null;
  }
  function isSafeProductID(value) {
    return safeProductIDPattern.test(String(value || ""));
  }
  function getQueryValue(name) {
    try {
      return new URL(global.location.href).searchParams.get(name) || "";
    } catch (_error) {
      return "";
    }
  }
  function globalValue(name) {
    if (typeof global[name] === "undefined" || global[name] == null) return "";
    const value = String(global[name]);
    return value.includes("{{") ? "" : value;
  }
  function loginURL(product) {
    if (!product || !isSafeProductID(product.uuid)) return "/account/";
    const next = "/intro/membership/?product=" + encodeURIComponent(product.uuid);
    return "/account/?" + new URLSearchParams({
      next: next
    }).toString();
  }
  function updateProductQuery(product) {
    if (!product || !isSafeProductID(product.uuid) || !global.history || !global.history.replaceState) return;
    const url = new URL(global.location.href);
    url.searchParams.set("product", product.uuid);
    global.history.replaceState({}, "", url.pathname + "?" + url.searchParams.toString() + url.hash);
  }
  function parseDateTime(value) {
    if (!value) return null;
    const text = String(value).trim();
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0));
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  function formatDateTime(date) {
    const pad = value => String(value).padStart(2, "0");
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
  }
  function expectedExpiredAt(product) {
    const grantDays = Number(product && product.grant_days) || 365;
    const now = new Date();
    const current = parseDateTime(userinfo && userinfo.expired_at);
    const role = cleanRole(userinfo && userinfo.role);
    const base = paidRoles.includes(role) && current && current.getTime() >= now.getTime() ? current : now;
    const next = new Date(base.getTime());
    next.setDate(next.getDate() + grantDays);
    return next;
  }
  function isSeatPriced(product) {
    return !!(product && product.seat_priced);
  }
  function isVIPProduct(product) {
    return cleanRole(product && product.title).includes("VIP") || cleanRole(product && product.team_member_role).includes("VIP");
  }
  function isExperimentalProduct(product) {
    const grantDays = Number(product && product.grant_days) || 0;
    return grantDays === 7 || grantDays === 30;
  }
  function normalizeQuantity(product, value) {
    const min = Number(product && product.min_quantity) || 1;
    const max = Number(product && product.max_quantity) || 500;
    const parsed = Math.floor(Number(value) || min);
    return Math.max(min, Math.min(max, parsed));
  }
  function displayAmount(product) {
    if (!product) return 0;
    if (!isSeatPriced(product)) return Number(product.price) || 0;
    return (Number(product.unit_price || product.price) || 0) * normalizeQuantity(product, teamQuantity);
  }
  function testPaymentMode(order) {
    const clientKey = String(order && order.client_key || "");
    const mId = String(order && order.mId || "");
    return Boolean(order && order.test_mode) || clientKey.startsWith("test_") || /_test$/i.test(mId);
  }
  function tossPaymentsForOrder(order) {
    const clientKey = String(order && order.client_key || "");
    if (!clientKey) throw new Error("missing_client_key");
    if (testPaymentMode(order) && !clientKey.startsWith("test_")) {
      throw new Error("test_key_mismatch");
    }
    if (testPaymentMode(order)) {
      return global.TossPayments(clientKey, {
        clientUrl: "https://payment-gateway-sandbox.tosspayments.com"
      });
    }
    return global.TossPayments(clientKey);
  }
  function tossOrderName(order) {
    const name = String(order && order.product_name || "");
    if (!testPaymentMode(order) || name.startsWith("[테스트]")) return name;
    return "[테스트] " + name;
  }
  function membershipSortRank(product) {
    const title = cleanRole(product && product.title);
    if (title === "정회원") return 10;
    if (isExperimentalProduct(product)) return 15;
    if (isVIPProduct(product)) return 80;
    if (isSeatPriced(product)) return 90;
    return 50;
  }
  function sortProducts(list) {
    return [...(Array.isArray(list) ? list : [])].sort((left, right) => {
      const rankDiff = membershipSortRank(left) - membershipSortRank(right);
      if (rankDiff !== 0) return rankDiff;
      return String(left.title || "").localeCompare(String(right.title || ""), "ko-KR", {
        numeric: true,
        sensitivity: "base"
      });
    });
  }
  function purchasableProducts() {
    return products.filter(product => experimentsEnabled() || !isExperimentalProduct(product));
  }
  function regularProducts() {
    return purchasableProducts().filter(product => !isSeatPriced(product) && !isVIPProduct(product));
  }
  function teamProducts() {
    return purchasableProducts().filter(product => isSeatPriced(product) && !isVIPProduct(product));
  }
  function vipProducts() {
    return purchasableProducts().filter(isVIPProduct);
  }
  function seatProducts() {
    return purchasableProducts().filter(isSeatPriced).sort((left, right) => Number(isVIPProduct(left)) - Number(isVIPProduct(right)));
  }
  function selectedTeamProduct() {
    const list = seatProducts();
    if (selectedProduct && isSeatPriced(selectedProduct)) return selectedProduct;
    return list[0] || null;
  }
  function teamOptionLabel(product) {
    return isVIPProduct(product) ? "VIP회원 팀" : "정회원 팀";
  }
  function membershipPolicyLines(product) {
    if (!userinfo || !product) return [];
    const info = membership();
    const lines = [];
    const pausedDays = Number(info.paused_personal_days || 0) || Math.floor(Number(info.paused_personal_seconds || 0) / 86400);
    const personalRole = String(info.personal_role || "").trim();
    const personalExpires = String(info.personal_expired_at || "").trim();
    if (isSeatPriced(product)) {
      lines.push("개인 정회원/VIP 잔여일은 팀 권한 사용 중 보존됩니다.");
    } else if (String(info.context || "").toLowerCase() === "team") {
      lines.push("팀 소속 중 개인권을 결제하면 개인 권한으로 전환하거나 팀에서 나온 뒤 소진됩니다.");
    }
    if (pausedDays > 0) {
      lines.push("현재 보존 중인 개인권 잔여일: " + pausedDays.toLocaleString("ko-KR") + "일");
    } else if (personalRole && personalRole !== "준회원" && personalExpires) {
      lines.push("현재 개인권: " + personalRole + " / " + personalExpires);
    }
    return lines;
  }
  function safeMessage(fallback) {
    return String(fallback || "일시적으로 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  async function fetchJSON(url, options) {
    const response = await fetch(url, Object.assign({
      credentials: "same-origin"
    }, options || {}));
    let data = {};
    try {
      data = await response.json();
    } catch (_error) {
      data = {};
    }
    if (!response.ok) {
      throw new Error("request_failed");
    }
    return data;
  }
  const PageHeader = () => /*#__PURE__*/React.createElement("header", {
    className: "mb-8 flex w-full flex-row items-end justify-start text-left"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "mb-4 mr-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "underline decoration-blue-400 decoration-8 underline-offset-4"
  }, "\uC815\uD68C\uC6D0 \uAC00\uC785")));
  const Loading = ({
    text
  }) => /*#__PURE__*/React.createElement("div", {
    className: "flex w-full flex-col items-center justify-center py-16 text-slate-600",
    role: "status",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("p", null, text || "불러오는 중입니다."));
  const StatusNotice = () => {
    if (!pageMessage && checkoutState === "idle") return null;
    const statusText = checkoutState === "starting" ? "안전한 결제창을 준비하고 있습니다. 버튼을 다시 누르지 마세요." : pageMessage;
    const color = checkoutState === "failed" || checkoutState === "canceled" ? "border-red-200 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-800";
    return /*#__PURE__*/React.createElement("div", {
      className: "mb-6 w-full rounded-xl border px-4 py-3 text-sm font-semibold " + color,
      role: "status",
      "aria-live": "polite"
    }, statusText);
  };
  const PaymentButtons = () => {
    if (!userinfo) return /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-slate-600"
    }, "\uC0C1\uD488\uC744 \uC120\uD0DD\uD558\uB824\uBA74 \uBA3C\uC800 \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.");
    if (!canSelectProduct()) return /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-slate-500"
    }, "\uAD00\uB9AC\uC790 \uACC4\uC815\uC740 \uBA64\uBC84\uC2ED \uACB0\uC81C\uAC00 \uD544\uC694\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    if (!selectedProduct) return /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-slate-600"
    }, "\uC544\uB798\uC5D0\uC11C \uACB0\uC81C\uD560 \uC0C1\uD488\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
    const buttonClass = "w-full rounded-lg bg-blue-700 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60";
    return /*#__PURE__*/React.createElement("div", {
      className: "flex w-full flex-col items-center justify-center space-y-2",
      "aria-label": "\uACB0\uC81C \uC218\uB2E8"
    }, ["카드", "가상계좌", "계좌이체"].map(method => /*#__PURE__*/React.createElement("button", {
      key: method,
      type: "button",
      className: buttonClass,
      disabled: busyKey !== "",
      "aria-disabled": busyKey !== "",
      onClick: () => requestOrder(selectedProduct, method)
    }, busyKey === method ? "결제 준비 중…" : method + (method === "카드" ? "결제" : " 결제"))));
  };
  const UserInfoPanel = () => {
    if (!userinfo) {
      return /*#__PURE__*/React.createElement("aside", {
        className: "w-full rounded-2xl border border-slate-200 bg-slate-50 p-6",
        "aria-labelledby": "membership-login-guide"
      }, /*#__PURE__*/React.createElement("h2", {
        id: "membership-login-guide",
        className: "text-lg font-extrabold text-slate-950"
      }, "\uB85C\uADF8\uC778 \uD6C4 \uACB0\uC81C\uB97C \uC774\uC5B4\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4"), /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-sm leading-6 text-slate-600"
      }, "\uC0C1\uD488 \uCE74\uB4DC\uB97C \uB204\uB974\uBA74 \uB85C\uADF8\uC778 \uD6C4 \uAC19\uC740 \uC0C1\uD488\uC774 \uC790\uB3D9\uC73C\uB85C \uC120\uD0DD\uB429\uB2C8\uB2E4."), selectedProduct && /*#__PURE__*/React.createElement("a", {
        href: loginURL(selectedProduct),
        className: "mt-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
      }, selectedProduct.title, " \uC120\uD0DD \uC774\uC5B4\uAC00\uAE30"));
    }
    const role = cleanRole(userinfo.role);
    const showCurrentExpiry = !noExpiryRoles.includes(role) && userinfo.expired_at;
    const nextExpiry = selectedProduct ? formatDateTime(expectedExpiredAt(selectedProduct)) : "";
    const policyLines = membershipPolicyLines(selectedProduct);
    return /*#__PURE__*/React.createElement("aside", {
      className: "w-full rounded-2xl border border-blue-200 bg-blue-50 p-6",
      "aria-labelledby": "membership-user-summary"
    }, /*#__PURE__*/React.createElement("h2", {
      id: "membership-user-summary",
      className: "text-lg font-extrabold text-slate-950"
    }, "\uB0B4 \uBA64\uBC84\uC2ED\uACFC \uACB0\uC81C"), /*#__PURE__*/React.createElement("dl", {
      className: "mt-4 space-y-2 text-sm text-slate-700"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uACC4\uC815: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, userinfo.email)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uD604\uC7AC \uB4F1\uAE09: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, userinfo.role)), showCurrentExpiry && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uD604\uC7AC \uB9CC\uB8CC\uC77C: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, userinfo.expired_at)), selectedProduct && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uC120\uD0DD \uC0C1\uD488: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline text-blue-800"
    }, selectedProduct.title)), selectedProduct && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uC608\uC0C1 \uB9CC\uB8CC\uC77C: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, nextExpiry)), selectedProduct && isSeatPriced(selectedProduct) && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uC804\uCCB4 \uC88C\uC11D: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, normalizeQuantity(selectedProduct, teamQuantity), "\uC11D")), selectedProduct && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uC608\uC0C1 \uACB0\uC81C \uAE08\uC561: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, money(displayAmount(selectedProduct)), "\uC6D0"))), policyLines.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-4 w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-left"
    }, policyLines.map(line => /*#__PURE__*/React.createElement("p", {
      key: line,
      className: "text-xs font-semibold leading-5 text-indigo-800"
    }, line))), /*#__PURE__*/React.createElement("div", {
      className: "mt-5"
    }, /*#__PURE__*/React.createElement(PaymentButtons, null)));
  };
  const ProductAction = ({
    product,
    selected,
    label
  }) => {
    if (!isAuthenticated()) {
      return /*#__PURE__*/React.createElement("a", {
        href: loginURL(product),
        className: "mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
      }, "\uB85C\uADF8\uC778 \uD6C4 ", label || "선택");
    }
    const disabled = !canSelectProduct();
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: disabled,
      "aria-disabled": disabled,
      onClick: () => selectProduct(product),
      className: disabled ? "mt-6 w-full cursor-not-allowed rounded-lg bg-slate-400 px-5 py-3 text-sm font-bold text-white opacity-60" : "mt-6 w-full rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
    }, selected ? "선택됨" : label || "이 상품 선택");
  };
  const MembershipProductCard = ({
    product,
    cardType
  }) => {
    if (!product) return null;
    const selected = selectedProduct && selectedProduct.uuid === product.uuid;
    return /*#__PURE__*/React.createElement("article", {
      className: "mx-auto flex h-full w-full max-w-lg flex-col rounded-lg border bg-white p-6 text-center text-gray-900 shadow " + (selected ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100"),
      "data-membership-card": cardType
    }, /*#__PURE__*/React.createElement("h2", {
      className: "mb-4 text-2xl font-semibold"
    }, product.title), /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-light leading-6 text-gray-500"
    }, product.description), /*#__PURE__*/React.createElement("div", {
      className: "my-8 flex items-baseline justify-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mr-2 text-2xl font-extrabold"
    }, "\uFFE6", money(product.price)), /*#__PURE__*/React.createElement("span", {
      className: "text-gray-500"
    }, "/\uB144")), (product.features || []).length > 0 && /*#__PURE__*/React.createElement("ul", {
      className: "mb-8 space-y-4 text-left text-sm leading-6",
      role: "list"
    }, product.features.map((feature, index) => /*#__PURE__*/React.createElement("li", {
      key: index,
      className: "flex items-start space-x-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-green-600",
      "aria-hidden": "true"
    }, "\u2713"), /*#__PURE__*/React.createElement("span", null, feature)))), /*#__PURE__*/React.createElement("div", {
      className: "mt-auto"
    }, /*#__PURE__*/React.createElement(ProductAction, {
      product: product,
      selected: selected,
      label: "\uC120\uD0DD"
    })));
  };
  const TeamMembershipCard = () => {
    const options = seatProducts();
    const product = selectedTeamProduct();
    if (!product) return null;
    const selected = selectedProduct && isSeatPriced(selectedProduct);
    const quantity = normalizeQuantity(product, teamQuantity);
    const extraMembers = Math.max(quantity - 1, 0);
    const inputDisabled = isAuthenticated() && !canSelectProduct();
    return /*#__PURE__*/React.createElement("article", {
      className: "mx-auto flex h-full w-full max-w-lg flex-col rounded-lg border bg-white p-6 text-center text-gray-900 shadow " + (selected ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100"),
      "data-membership-card": "team"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "mb-4 text-2xl font-semibold"
    }, "\uAE30\uAD00/\uD300 \uD68C\uC6D0"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-light leading-6 text-gray-500"
    }, product.description), /*#__PURE__*/React.createElement("div", {
      className: "my-8 flex items-baseline justify-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mr-2 text-2xl font-extrabold"
    }, "\uFFE6", money(product.unit_price || product.price)), /*#__PURE__*/React.createElement("span", {
      className: "text-gray-500"
    }, "/\uBA85/\uB144")), /*#__PURE__*/React.createElement("fieldset", {
      className: "mb-6 flex w-full flex-col gap-2 text-left text-sm font-semibold text-slate-700",
      "aria-label": "\uAE30\uAD00/\uD300 \uD68C\uC6D0 \uB4F1\uAE09"
    }, /*#__PURE__*/React.createElement("legend", {
      className: "mb-1"
    }, "\uD300\uC6D0 \uB4F1\uAE09"), options.map(option => /*#__PURE__*/React.createElement("label", {
      key: option.uuid,
      className: "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 " + (product.uuid === option.uuid ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700")
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "team_member_role",
      checked: product.uuid === option.uuid,
      disabled: inputDisabled,
      onChange: () => selectProduct(option),
      className: "h-4 w-4"
    }), /*#__PURE__*/React.createElement("span", null, teamOptionLabel(option)), /*#__PURE__*/React.createElement("span", {
      className: "ml-auto text-xs font-normal text-slate-500"
    }, "\uFFE6", money(option.unit_price || option.price), "/\uBA85")))), /*#__PURE__*/React.createElement("label", {
      className: "mb-6 flex w-full flex-col items-start gap-2 text-left text-sm font-semibold text-slate-700"
    }, "\uCD94\uAC00 \uD300\uC6D0 \uC218", /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      max: Math.max((product.max_quantity || 500) - 1, 0),
      value: extraMembers,
      disabled: !canSelectProduct(),
      onChange: event => {
        selectedProduct = product;
        teamQuantity = normalizeQuantity(product, Math.floor(Number(event.target.value) || 0) + 1);
        pageMessage = "";
        checkoutState = "idle";
        updateProductQuery(product);
        renderMain();
      },
      className: "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-950 disabled:bg-slate-100"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-normal text-slate-500"
    }, "\uBCF8\uC778 \uD3EC\uD568 \uC804\uCCB4 ", quantity, "\uC11D \xB7 \uCD1D ", money((Number(product.unit_price || product.price) || 0) * quantity), "\uC6D0")), (product.features || []).length > 0 && /*#__PURE__*/React.createElement("ul", {
      className: "mb-8 space-y-4 text-left text-sm leading-6",
      role: "list"
    }, product.features.map((feature, index) => /*#__PURE__*/React.createElement("li", {
      key: index,
      className: "flex items-start space-x-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-green-600",
      "aria-hidden": "true"
    }, "\u2713"), /*#__PURE__*/React.createElement("span", null, feature)))), /*#__PURE__*/React.createElement("div", {
      className: "mt-auto"
    }, /*#__PURE__*/React.createElement(ProductAction, {
      product: product,
      selected: selected,
      label: "\uC120\uD0DD"
    })));
  };
  function Main() {
    const regular = regularProducts()[0] || null;
    const vip = vipProducts().find(product => !isSeatPriced(product)) || null;
    const hasProducts = Boolean(regular || vip || seatProducts().length > 0);
    return /*#__PURE__*/React.createElement("main", {
      className: "mx-auto flex w-full max-w-screen-xl flex-col items-center justify-center px-6 py-8 md:px-20"
    }, /*#__PURE__*/React.createElement(PageHeader, null), /*#__PURE__*/React.createElement(StatusNotice, null), hasProducts ? /*#__PURE__*/React.createElement("div", {
      id: "membership-product-grid",
      className: "grid w-full grid-cols-1 items-stretch justify-center gap-4 md:grid-cols-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex w-full flex-col"
    }, /*#__PURE__*/React.createElement(UserInfoPanel, null)), /*#__PURE__*/React.createElement(MembershipProductCard, {
      product: regular,
      cardType: "regular"
    }), /*#__PURE__*/React.createElement(MembershipProductCard, {
      product: vip,
      cardType: "vip"
    }), /*#__PURE__*/React.createElement(TeamMembershipCard, null)) : /*#__PURE__*/React.createElement("p", {
      className: "w-full rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900"
    }, "\uD604\uC7AC \uACB0\uC81C \uAC00\uB2A5\uD55C \uBA64\uBC84\uC2ED \uC0C1\uD488\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."));
  }
  function renderMain() {
    const mount = document.getElementById("div_main");
    if (!mount || !global.ReactDOM) return;
    global.ReactDOM.render(/*#__PURE__*/React.createElement(Main, null), mount);
  }
  function selectProduct(product) {
    if (!product || !isSafeProductID(product.uuid)) {
      pageMessage = "선택할 수 없는 상품입니다.";
      checkoutState = "failed";
      renderMain();
      return;
    }
    if (!isAuthenticated()) {
      global.location.assign(loginURL(product));
      return;
    }
    if (!canSelectProduct()) return;
    selectedProduct = product;
    pageMessage = "";
    checkoutState = "idle";
    if (isSeatPriced(product)) {
      teamQuantity = normalizeQuantity(product, teamQuantity || product.quantity || 1);
    }
    updateProductQuery(product);
    renderMain();
  }
  async function loadMain() {
    const mount = document.getElementById("div_main");
    if (!mount || !global.ReactDOM) return;
    global.ReactDOM.render(/*#__PURE__*/React.createElement(Loading, {
      text: "\uBA64\uBC84\uC2ED \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4."
    }), mount);
    pageMessage = "";
    checkoutState = "idle";
    try {
      const productData = await fetchJSON("/ajax_membership_products/", {
        method: "POST"
      });
      if (productData.error) {
        throw new Error("product_error");
      }
      products = sortProducts(productData.products);
    } catch (_error) {
      products = [];
      pageMessage = safeMessage("상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      checkoutState = "failed";
    }
    if (String(global.gv_username || "") !== "") {
      try {
        const accountData = await fetchJSON("/account/ajax_get_userinfo/", {
          method: "POST"
        });
        if (accountData && !accountData.error) {
          userinfo = accountData;
        }
      } catch (_error) {
        userinfo = null;
        pageMessage = safeMessage("회원 정보를 불러오지 못했습니다. 다시 로그인해 주세요.");
        checkoutState = "failed";
      }
    }
    const requestedProductID = getQueryValue("product");
    if (isSafeProductID(requestedProductID)) {
      const requested = products.find(product => String(product.uuid || "").toLowerCase() === requestedProductID.toLowerCase());
      const allowed = requested && (experimentsEnabled() || !isExperimentalProduct(requested));
      if (allowed) {
        selectedProduct = requested;
        if (isSeatPriced(requested)) {
          teamQuantity = normalizeQuantity(requested, requested.quantity || 1);
        }
      }
    }
    renderMain();
  }
  async function requestOrder(product, method) {
    if (busyKey !== "") return;
    if (!product || !isSafeProductID(product.uuid) || !["카드", "가상계좌", "계좌이체"].includes(method)) {
      pageMessage = "결제 상품 또는 결제 수단을 다시 확인해 주세요.";
      checkoutState = "failed";
      renderMain();
      return;
    }
    if (!isAuthenticated()) {
      global.location.assign(loginURL(product));
      return;
    }
    busyKey = method;
    checkoutState = "starting";
    pageMessage = "";
    renderMain();
    try {
      const resultURL = global.location.origin + "/intro/membership/result/";
      const query = new URLSearchParams({
        product_id: product.uuid,
        type: "membership",
        method: method,
        quantity: isSeatPriced(product) ? String(normalizeQuantity(product, teamQuantity)) : "1"
      });
      const order = await fetchJSON("/ajax_request_order_id/?" + query.toString(), {
        method: "POST"
      });
      if (order.error || !order.orderID || !order.client_key) {
        throw new Error("order_rejected");
      }
      const tossPayments = tossPaymentsForOrder(order);
      const options = {
        amount: Number(order.amount),
        orderId: order.orderID,
        orderName: tossOrderName(order),
        customerName: userinfo.realname || userinfo.name,
        customerEmail: userinfo.email,
        successUrl: resultURL,
        failUrl: resultURL
      };
      if (method === "가상계좌") {
        options.validHours = 24;
        options.cashReceipt = {
          type: "소득공제"
        };
      }
      if (method === "계좌이체" || method === "가상계좌") {
        options.windowTarget = "iframe";
      }
      await tossPayments.requestPayment(method, options);
    } catch (error) {
      const code = String(error && error.code || "").toUpperCase();
      const canceled = code.includes("CANCEL") || code === "USER_CANCEL";
      checkoutState = canceled ? "canceled" : "failed";
      pageMessage = canceled ? "결제가 취소되었습니다. 상품을 다시 확인한 뒤 재시도할 수 있습니다." : safeMessage("결제를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      busyKey = "";
      renderMain();
    }
  }
  const ResultShell = ({
    children,
    state
  }) => {
    const titles = {
      starting: "결제 검증 중",
      success: "결제 완료",
      waiting: "입금 대기",
      failed: "결제 실패",
      canceled: "결제 취소"
    };
    return /*#__PURE__*/React.createElement("main", {
      className: "mx-auto flex w-full max-w-screen-sm flex-col items-center justify-center px-4 py-10 md:px-6"
    }, /*#__PURE__*/React.createElement("header", {
      className: "mb-6 w-full text-center"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-bold text-blue-700"
    }, "Web-R 2.0 Membership"), /*#__PURE__*/React.createElement("h1", {
      className: "mt-2 text-2xl font-extrabold text-slate-950"
    }, titles[state] || "결제 결과"), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-sm text-slate-600"
    }, state === "starting" ? "서버에서 결제 상태를 확인하고 있습니다." : "서버에서 확인된 결제 상태입니다.")), children);
  };
  const ResultDetail = ({
    result
  }) => {
    const colors = {
      success: "border-green-300 bg-green-50 text-green-800",
      waiting: "border-blue-300 bg-blue-50 text-blue-800",
      failed: "border-red-300 bg-red-50 text-red-800",
      canceled: "border-amber-300 bg-amber-50 text-amber-900"
    };
    return /*#__PURE__*/React.createElement(ResultShell, {
      state: result.type
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-full rounded-2xl border p-6 " + (colors[result.type] || colors.failed),
      role: "status",
      "aria-live": "polite"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-xl font-extrabold"
    }, result.label), /*#__PURE__*/React.createElement("dl", {
      className: "mt-5 space-y-2 text-sm"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uACB0\uC81C \uC0C1\uD488: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, result.productName || "-")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uACB0\uC81C \uAE08\uC561: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, money(result.amount), "\uC6D0")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uC8FC\uBB38 \uBC88\uD638: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline break-all"
    }, result.orderId || "-")), result.email && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uACB0\uC81C \uACC4\uC815: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, result.email)), result.method && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", {
      className: "inline font-bold"
    }, "\uACB0\uC81C \uBC29\uBC95: "), /*#__PURE__*/React.createElement("dd", {
      className: "inline"
    }, result.method))), result.message && /*#__PURE__*/React.createElement("p", {
      className: "mt-4 text-sm"
    }, result.message), result.receiptUrl && result.type === "success" && /*#__PURE__*/React.createElement("a", {
      href: result.receiptUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "mt-5 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
    }, "\uC601\uC218\uC99D \uBCF4\uAE30"), result.type !== "success" && /*#__PURE__*/React.createElement("a", {
      href: "/intro/membership/",
      className: "mt-5 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
    }, "\uBA64\uBC84\uC2ED \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30")), result.type === "waiting" && /*#__PURE__*/React.createElement("p", {
      className: "mt-4 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
    }, "\uC785\uAE08 \uB300\uAE30\uB294 \uBA64\uBC84\uC2ED \uC131\uACF5\uC774 \uC544\uB2D9\uB2C8\uB2E4. \uC11C\uBC84\uAC00 \uC2E4\uC81C \uC785\uAE08 \uC644\uB8CC\uB97C \uD655\uC778\uD55C \uB4A4\uC5D0\uB9CC \uC774\uC6A9 \uAD8C\uD55C\uC774 \uBC18\uC601\uB429\uB2C8\uB2E4."));
  };
  function normalizeResult(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const log = source.log && typeof source.log === "object" ? source.log : {};
    const request = log.request_order_id && typeof log.request_order_id === "object" ? log.request_order_id : {};
    const webhookData = log.webhook && log.webhook.data && typeof log.webhook.data === "object" ? log.webhook.data : {};
    const finish = log.finish_order_id && typeof log.finish_order_id === "object" ? log.finish_order_id : webhookData;
    const status = String(source.status || finish.status || log.status || "ABORTED").toUpperCase();
    const code = String(source.code || finish.code || "").toUpperCase();
    let type = "failed";
    if (!source.error && status === "DONE") {
      type = "success";
    } else if (!source.error && status === "WAITING_FOR_DEPOSIT") {
      type = "waiting";
    } else if (status.includes("CANCEL") || code.includes("CANCEL") || code === "USER_CANCEL") {
      type = "canceled";
    }
    const labels = {
      success: "결제 완료",
      waiting: "입금 대기",
      failed: "결제 실패",
      canceled: "결제 취소"
    };
    return {
      type: type,
      label: labels[type],
      productName: log.product_name || request.product_name || finish.orderName || "[상품명 없음]",
      amount: source.amount || finish.totalAmount || log.amount || request.amount || globalValue("amount") || getQueryValue("amount"),
      orderId: source.orderID || source.orderId || finish.orderId || getQueryValue("orderId") || getQueryValue("orderID"),
      email: log.email || request.email || finish.customerEmail || "",
      method: finish.method || log.payment_method || request.payment_method || "",
      receiptUrl: finish.receipt && finish.receipt.url || finish.card && finish.card.receiptUrl || "",
      message: type === "success" ? "" : type === "waiting" ? "입금이 확인될 때까지 기다려 주세요." : type === "canceled" ? "결제가 취소되었습니다." : safeMessage("결제를 완료하지 못했습니다. 다시 시도해 주세요.")
    };
  }
  function initialFailureResult(orderId, amount, failCode, failMessage) {
    const code = String(failCode || "").toUpperCase();
    const message = String(failMessage || "");
    const canceled = code.includes("CANCEL") || code === "USER_CANCEL" || /취소|cancel/i.test(message);
    return {
      type: canceled ? "canceled" : "failed",
      label: canceled ? "결제 취소" : "결제 실패",
      productName: "[상품명 없음]",
      amount: amount,
      orderId: orderId,
      message: canceled ? "결제가 취소되었습니다." : safeMessage("결제가 완료되지 않았습니다.")
    };
  }
  async function loadResult() {
    const mount = document.getElementById("div_main");
    if (!mount || !global.ReactDOM) return;
    global.ReactDOM.render(/*#__PURE__*/React.createElement(ResultShell, {
      state: "starting"
    }, /*#__PURE__*/React.createElement(Loading, {
      text: "\uC11C\uBC84\uC5D0\uC11C \uACB0\uC81C \uACB0\uACFC\uB97C \uAC80\uC99D\uD558\uB294 \uC911\uC785\uB2C8\uB2E4."
    })), mount);
    const paymentKey = globalValue("payment_key") || getQueryValue("paymentKey") || getQueryValue("payment_key");
    const orderId = globalValue("orderID") || getQueryValue("orderId") || getQueryValue("orderID");
    const amount = globalValue("amount") || getQueryValue("amount");
    const failMessage = globalValue("message") || getQueryValue("message");
    const failCode = globalValue("code") || getQueryValue("code");
    if (!paymentKey) {
      global.ReactDOM.render(/*#__PURE__*/React.createElement(ResultDetail, {
        result: initialFailureResult(orderId, amount, failCode, failMessage)
      }), mount);
      return;
    }
    try {
      const query = new URLSearchParams({
        paymentKey: paymentKey,
        orderID: orderId,
        amount: amount
      });
      const raw = await fetchJSON("/ajax_finish_order_id/?" + query.toString(), {
        method: "POST"
      });
      global.ReactDOM.render(/*#__PURE__*/React.createElement(ResultDetail, {
        result: normalizeResult(raw)
      }), mount);
    } catch (_error) {
      global.ReactDOM.render(/*#__PURE__*/React.createElement(ResultDetail, {
        result: {
          type: "failed",
          label: "결제 확인 실패",
          productName: "[확인 필요]",
          amount: amount,
          orderId: orderId,
          message: safeMessage("결제 상태를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.")
        }
      }), mount);
    }
  }
  global.set_main = function () {
    const currentMode = String(typeof global.mode === "undefined" ? "" : global.mode || "").trim().toLowerCase();
    if (currentMode === "result") {
      loadResult();
    } else {
      loadMain();
    }
  };
})(window);
