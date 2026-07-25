(function (global) {
  "use strict";

  if (global.__webrMembershipPage202607251145) {
    return;
  }
  global.__webrMembershipPage202607251145 = true;
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
    className: "mb-8 w-full text-left"
  }, /*#__PURE__*/React.createElement("p", {
    className: "mb-2 text-sm font-bold uppercase tracking-widest text-blue-700"
  }, "Web-R 2.0 Membership"), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-extrabold leading-tight text-slate-950"
  }, "\uBD84\uC11D\uC744 \uB05D\uB0B4\uB294 \uB370 \uD544\uC694\uD55C \uAE30\uB2A5\uB9CC \uC120\uD0DD\uD558\uC138\uC694"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 max-w-3xl text-base leading-7 text-slate-600"
  }, "\uB85C\uADF8\uC778 \uC804\uC5D0\uB3C4 \uC81C\uACF5 \uBC94\uC704\uC640 \uACB0\uACFC \uD615\uD0DC\uB97C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uACB0\uC81C \uC0C1\uD488\uACFC \uAE08\uC561\uC740 \uC11C\uBC84\uC5D0\uC11C \uBD88\uB7EC\uC628 \uD604\uC7AC \uC0C1\uD488 \uC815\uBCF4\uB97C \uAE30\uC900\uC73C\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4."));
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
  const Comparison = () => /*#__PURE__*/React.createElement("section", {
    className: "mb-12 w-full",
    "aria-labelledby": "membership-comparison-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-5"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "membership-comparison-title",
    className: "text-2xl font-extrabold text-slate-950"
  }, "\uBB34\uB8CC \uD68C\uC6D0\uACFC \uC815\uD68C\uC6D0 \uBE44\uAD50"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-sm leading-6 text-slate-600"
  }, "\uBA3C\uC800 \uBD84\uC11D\uC744 \uCCB4\uD5D8\uD558\uACE0, \uC800\uC7A5\xB7\uC7AC\uC2E4\uD589\xB7\uB0B4\uBCF4\uB0B4\uAE30\uAC00 \uD544\uC694\uD560 \uB54C \uC815\uD68C\uC6D0\uC744 \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-4 md:grid-cols-2"
  }, /*#__PURE__*/React.createElement("article", {
    className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold text-slate-500"
  }, "\uBB34\uB8CC \uD68C\uC6D0"), /*#__PURE__*/React.createElement("h3", {
    className: "mt-2 text-xl font-extrabold text-slate-950"
  }, "\uB3C4\uAD6C\uC640 \uACB0\uACFC \uD615\uD0DC \uD655\uC778"), /*#__PURE__*/React.createElement("ul", {
    className: "mt-5 space-y-3 text-sm leading-6 text-slate-700"
  }, /*#__PURE__*/React.createElement("li", null, "\u2713 \uACF5\uAC1C \uC0D8\uD50C ROC \uBD84\uC11D \uC2E4\uD589"), /*#__PURE__*/React.createElement("li", null, "\u2713 \uBD84\uC11D \uB3C4\uAD6C\uC640 \uC785\uB825 \uBC29\uC2DD \uD655\uC778"), /*#__PURE__*/React.createElement("li", null, "\u2713 \uC800\uC7A5\xB7\uB0B4\uBCF4\uB0B4\uAE30 \uC804 \uACB0\uACFC \uBBF8\uB9AC\uBCF4\uAE30")), /*#__PURE__*/React.createElement("a", {
    href: "/webr/roc-analysis/sample/",
    className: "mt-6 inline-flex w-full items-center justify-center rounded-lg border border-blue-700 px-4 py-3 text-sm font-bold text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200"
  }, "\uC0D8\uD50C ROC \uBD84\uC11D\uD558\uAE30")), /*#__PURE__*/React.createElement("article", {
    className: "rounded-2xl border-2 border-blue-600 bg-blue-50 p-6 shadow-sm"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold text-blue-700"
  }, "\uC815\uD68C\uC6D0"), /*#__PURE__*/React.createElement("h3", {
    className: "mt-2 text-xl font-extrabold text-slate-950"
  }, "\uBD84\uC11D\uC744 \uC800\uC7A5\uD558\uACE0 \uC5C5\uBB34\uC5D0 \uD65C\uC6A9"), /*#__PURE__*/React.createElement("ul", {
    className: "mt-5 space-y-3 text-sm leading-6 text-slate-700"
  }, /*#__PURE__*/React.createElement("li", null, "\u2713 Web-R 2.0 \uC815\uD68C\uC6D0 \uBD84\uC11D \uB3C4\uAD6C \uC774\uC6A9"), /*#__PURE__*/React.createElement("li", null, "\u2713 \uD504\uB85C\uC81D\uD2B8\uBCC4 \uBD84\uC11D \uC800\uC7A5\xB7\uB2E4\uC2DC \uC5F4\uAE30\xB7\uC7AC\uC2E4\uD589"), /*#__PURE__*/React.createElement("li", null, "\u2713 \uC9C0\uC6D0\uB418\uB294 \uACB0\uACFC\uB97C Word\xB7Excel\xB7PDF\uB85C \uB0B4\uBCF4\uB0B4\uAE30")), /*#__PURE__*/React.createElement("a", {
    href: "#membership-products",
    className: "mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
  }, "\uD604\uC7AC \uC0C1\uD488 \uD655\uC778"))));
  const ResultExample = () => /*#__PURE__*/React.createElement("section", {
    className: "mb-12 w-full rounded-2xl bg-slate-950 p-6 text-white",
    "aria-labelledby": "membership-result-example-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-8 md:grid-cols-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold text-cyan-300"
  }, "\uC2E4\uC81C \uD654\uBA74\uC744 \uC774\uD574\uD558\uAE30 \uC704\uD55C \uACB0\uACFC \uC608\uC2DC"), /*#__PURE__*/React.createElement("h2", {
    id: "membership-result-example-title",
    className: "mt-2 text-2xl font-extrabold"
  }, "ROC \uBD84\uC11D \uACB0\uACFC \uC608\uC2DC"), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 text-sm leading-6 text-slate-300"
  }, "\uC608\uC2DC \uB370\uC774\uD130\uC758 AUC, \uCD5C\uC801 \uC808\uB2E8\uAC12, \uBBFC\uAC10\uB3C4\uC640 \uD2B9\uC774\uB3C4\uB97C \uD55C \uD654\uBA74\uC5D0\uC11C \uD655\uC778\uD569\uB2C8\uB2E4. \uC544\uB798 \uC218\uCE58\uB294 \uC0C1\uD488 \uC124\uBA85\uC6A9 \uC608\uC2DC\uC774\uBA70 \uACB0\uC81C \uACB0\uACFC\uB098 \uC131\uB2A5\uC744 \uBCF4\uC7A5\uD558\uB294 \uAC12\uC774 \uC544\uB2D9\uB2C8\uB2E4."), /*#__PURE__*/React.createElement("dl", {
    className: "mt-6 grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl bg-white/10 p-4"
  }, /*#__PURE__*/React.createElement("dt", {
    className: "text-xs text-slate-300"
  }, "AUC"), /*#__PURE__*/React.createElement("dd", {
    className: "mt-1 text-2xl font-extrabold"
  }, "0.84")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl bg-white/10 p-4"
  }, /*#__PURE__*/React.createElement("dt", {
    className: "text-xs text-slate-300"
  }, "\uCD5C\uC801 \uC808\uB2E8\uAC12"), /*#__PURE__*/React.createElement("dd", {
    className: "mt-1 text-2xl font-extrabold"
  }, "0.61")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl bg-white/10 p-4"
  }, /*#__PURE__*/React.createElement("dt", {
    className: "text-xs text-slate-300"
  }, "\uBBFC\uAC10\uB3C4"), /*#__PURE__*/React.createElement("dd", {
    className: "mt-1 text-2xl font-extrabold"
  }, "78%")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl bg-white/10 p-4"
  }, /*#__PURE__*/React.createElement("dt", {
    className: "text-xs text-slate-300"
  }, "\uD2B9\uC774\uB3C4"), /*#__PURE__*/React.createElement("dd", {
    className: "mt-1 text-2xl font-extrabold"
  }, "76%")))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col justify-center rounded-xl bg-white p-5 text-slate-950"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-extrabold"
  }, "\uC800\uC7A5\xB7\uC7AC\uC2E4\uD589\xB7\uB0B4\uBCF4\uB0B4\uAE30 \uC608\uC2DC"), /*#__PURE__*/React.createElement("ol", {
    className: "mt-4 space-y-3 text-sm leading-6 text-slate-700"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "1."), " \uBD84\uC11D\uC744 \uD504\uB85C\uC81D\uD2B8\uC5D0 \uC800\uC7A5"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "2."), " \uC800\uC7A5\uD55C \uC124\uC815\uC744 \uB2E4\uC2DC \uC5F4\uC5B4 \uC7AC\uC2E4\uD589"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "3."), " \uC9C0\uC6D0\uB418\uB294 \uD45C\uC640 \uBCF4\uACE0\uC11C\uB97C \uC5C5\uBB34 \uD615\uC2DD\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uAE30")), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 flex flex-wrap gap-2",
    "aria-label": "\uC9C0\uC6D0\uB418\uB294 \uACB0\uACFC \uB0B4\uBCF4\uB0B4\uAE30 \uD615\uC2DD \uC608\uC2DC"
  }, ["Word 예시", "Excel 예시", "PDF 예시"].map(label => /*#__PURE__*/React.createElement("span", {
    key: label,
    className: "rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
  }, label))))));
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
    }, money(displayAmount(selectedProduct)), "\uC6D0"))), /*#__PURE__*/React.createElement("div", {
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
  const ProductCard = ({
    product,
    tone,
    actionLabel
  }) => {
    const selected = selectedProduct && selectedProduct.uuid === product.uuid;
    const quantity = normalizeQuantity(product, isSeatPriced(product) ? teamQuantity : product.quantity || 1);
    const border = tone === "vip" ? "border-violet-300 bg-violet-50" : selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white";
    return /*#__PURE__*/React.createElement("article", {
      className: "flex h-full w-full flex-col rounded-2xl border p-6 shadow-sm " + border
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-extrabold text-slate-950"
    }, product.title), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-sm leading-6 text-slate-600"
    }, product.description), /*#__PURE__*/React.createElement("p", {
      className: "mt-5 text-2xl font-extrabold text-slate-950"
    }, "\uFFE6", money(product.unit_price || product.price), /*#__PURE__*/React.createElement("span", {
      className: "ml-1 text-sm font-normal text-slate-500"
    }, isSeatPriced(product) ? "/명/년" : "/년"))), (product.features || []).length > 0 && /*#__PURE__*/React.createElement("ul", {
      className: "mt-5 space-y-2 text-sm leading-6 text-slate-700",
      role: "list"
    }, product.features.map((feature, index) => /*#__PURE__*/React.createElement("li", {
      key: index
    }, "\u2713 ", feature))), isSeatPriced(product) && /*#__PURE__*/React.createElement("label", {
      className: "mt-5 block text-sm font-bold text-slate-700"
    }, "\uCD94\uAC00 \uD300\uC6D0 \uC218", /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      max: Math.max((product.max_quantity || 500) - 1, 0),
      value: Math.max(quantity - 1, 0),
      disabled: !isAuthenticated(),
      onChange: event => {
        selectedProduct = product;
        teamQuantity = normalizeQuantity(product, Math.floor(Number(event.target.value) || 0) + 1);
        updateProductQuery(product);
        renderMain();
      },
      className: "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-950 disabled:bg-slate-100"
    }), /*#__PURE__*/React.createElement("span", {
      className: "mt-2 block text-xs font-normal text-slate-500"
    }, "\uBCF8\uC778 \uD3EC\uD568 ", quantity, "\uC11D \xB7 \uCD1D ", money((Number(product.unit_price || product.price) || 0) * quantity), "\uC6D0")), /*#__PURE__*/React.createElement("div", {
      className: "mt-auto"
    }, /*#__PURE__*/React.createElement(ProductAction, {
      product: product,
      selected: selected,
      label: actionLabel
    })));
  };
  const ProductSection = () => {
    const regular = regularProducts();
    const team = teamProducts();
    return /*#__PURE__*/React.createElement("section", {
      id: "membership-products",
      className: "mb-12 w-full scroll-mt-8",
      "aria-labelledby": "membership-products-title"
    }, /*#__PURE__*/React.createElement("h2", {
      id: "membership-products-title",
      className: "text-2xl font-extrabold text-slate-950"
    }, "\uD604\uC7AC \uACB0\uC81C \uAC00\uB2A5\uD55C \uC0C1\uD488"), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-sm leading-6 text-slate-600"
    }, "\uAC00\uACA9\uACFC \uC774\uC6A9 \uAE30\uAC04\uC740 \uC544\uB798 \uC11C\uBC84 \uC0C1\uD488 \uC815\uBCF4 \uADF8\uB300\uB85C \uC801\uC6A9\uB429\uB2C8\uB2E4. \uC0C1\uD488\uC744 \uACE0\uB978 \uB4A4 \uACB0\uC81C \uC218\uB2E8\uC744 \uC120\uD0DD\uD558\uC138\uC694."), regular.length + team.length === 0 ? /*#__PURE__*/React.createElement("p", {
      className: "mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    }, "\uD604\uC7AC \uACB0\uC81C \uAC00\uB2A5\uD55C \uC77C\uBC18 \uC0C1\uD488\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.") : /*#__PURE__*/React.createElement(React.Fragment, null, regular.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
    }, regular.map(product => /*#__PURE__*/React.createElement(ProductCard, {
      key: product.uuid,
      product: product
    }))), team.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-8"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-lg font-extrabold text-slate-950"
    }, "\uAE30\uAD00\xB7\uD300 \uC774\uC6A9"), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
    }, team.map(product => /*#__PURE__*/React.createElement(ProductCard, {
      key: product.uuid,
      product: product,
      actionLabel: "\uD300 \uC0C1\uD488 \uC120\uD0DD"
    }))))));
  };
  const VIPSection = () => {
    const list = vipProducts();
    if (list.length === 0) return null;
    return /*#__PURE__*/React.createElement("section", {
      className: "mb-12 w-full rounded-2xl border border-violet-200 bg-violet-50 p-6",
      "aria-labelledby": "membership-vip-title"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-bold text-violet-700"
    }, "\uC77C\uBC18 \uC694\uAE08\uC81C\uC640 \uBCC4\uB3C4"), /*#__PURE__*/React.createElement("h2", {
      id: "membership-vip-title",
      className: "mt-2 text-2xl font-extrabold text-slate-950"
    }, "\uC804\uC6A9 \uC571 \uAD6C\uCD95 \uBB38\uC758"), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-sm leading-6 text-slate-700"
    }, "VIP \uC0C1\uD488\uC740 \uC804\uC6A9 \uBD84\uC11D \uD658\uACBD\uC774 \uD544\uC694\uD55C \uC774\uC6A9\uC790\uB97C \uC704\uD55C \uBCC4\uB3C4 \uC601\uC5ED\uC785\uB2C8\uB2E4. \uAE30\uC874 VIP \uACB0\uC81C \uC0C1\uD488\uC758 \uAC00\uACA9\xB7\uAD8C\uD55C\xB7\uC0C1\uD488 \uB370\uC774\uD130\uB294 \uBCC0\uACBD\uD558\uC9C0 \uC54A\uACE0 \uD604\uC7AC \uC815\uBCF4 \uADF8\uB300\uB85C \uD45C\uC2DC\uD569\uB2C8\uB2E4."), /*#__PURE__*/React.createElement("div", {
      className: "mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
    }, list.map(product => /*#__PURE__*/React.createElement(ProductCard, {
      key: product.uuid,
      product: product,
      tone: "vip",
      actionLabel: "VIP \uC0C1\uD488 \uC120\uD0DD"
    }))));
  };
  const ExperimentHold = () => {
    if (experimentsEnabled()) return null;
    return /*#__PURE__*/React.createElement("section", {
      className: "mb-12 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6",
      "aria-labelledby": "membership-experiment-title"
    }, /*#__PURE__*/React.createElement("h2", {
      id: "membership-experiment-title",
      className: "text-lg font-extrabold text-slate-950"
    }, "\uB2E8\uAE30 \uC774\uC6A9\uAD8C \uC6B4\uC601 \uACB0\uC815 \uB300\uAE30"), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-sm leading-6 text-slate-600"
    }, "7\uC77C \uCCB4\uD5D8\uACFC 30\uC77C \uC774\uC6A9\uAD8C\uC740 \uAC00\uACA9\xB7\uC81C\uACF5 \uBC94\uC704\xB7\uD658\uBD88 \uAE30\uC900\uC5D0 \uB300\uD55C \uC6B4\uC601 \uACB0\uC815 \uC804\uC785\uB2C8\uB2E4. \uD604\uC7AC feature flag\uAC00 \uAEBC\uC838 \uC788\uC5B4 \uACB0\uC81C\uD558\uAC70\uB098 \uC2E0\uCCAD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/React.createElement("div", {
      className: "mt-4 flex flex-wrap gap-2",
      "aria-label": "\uBE44\uD65C\uC131 \uB2E8\uAE30 \uC774\uC6A9\uAD8C"
    }, /*#__PURE__*/React.createElement("span", {
      className: "rounded-full bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
    }, "7\uC77C \uCCB4\uD5D8 \xB7 \uBE44\uD65C\uC131"), /*#__PURE__*/React.createElement("span", {
      className: "rounded-full bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
    }, "30\uC77C \uC774\uC6A9\uAD8C \xB7 \uBE44\uD65C\uC131")));
  };
  const FAQ = () => /*#__PURE__*/React.createElement("section", {
    className: "mb-12 w-full",
    "aria-labelledby": "membership-faq-title"
  }, /*#__PURE__*/React.createElement("h2", {
    id: "membership-faq-title",
    className: "text-2xl font-extrabold text-slate-950"
  }, "\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38"), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 space-y-3"
  }, /*#__PURE__*/React.createElement("details", {
    className: "rounded-xl border border-slate-200 bg-white p-5"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "cursor-pointer font-bold text-slate-950"
  }, "\uACB0\uC81C \uC804\uC5D0 \uBD84\uC11D \uACB0\uACFC\uB97C \uBCFC \uC218 \uC788\uB098\uC694?"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-sm leading-6 text-slate-600"
  }, "\uACF5\uAC1C \uC0D8\uD50C ROC \uBD84\uC11D\uC5D0\uC11C \uC785\uB825 \uD750\uB984\uACFC \uACB0\uACFC \uD615\uD0DC\uB97C \uBA3C\uC800 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")), /*#__PURE__*/React.createElement("details", {
    className: "rounded-xl border border-slate-200 bg-white p-5"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "cursor-pointer font-bold text-slate-950"
  }, "\uB85C\uADF8\uC778 \uC804\uC5D0 \uC0C1\uD488\uC744 \uC120\uD0DD\uD558\uBA74 \uC5B4\uB5BB\uAC8C \uB418\uB098\uC694?"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-sm leading-6 text-slate-600"
  }, "\uB85C\uADF8\uC778 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9\uD558\uBA70, \uB85C\uADF8\uC778 \uC644\uB8CC \uD6C4 \uC6D0\uB798 \uC120\uD0DD\uD55C \uC0C1\uD488\uC774 \uC790\uB3D9\uC73C\uB85C \uC120\uD0DD\uB41C \uBA64\uBC84\uC2ED \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uC635\uB2C8\uB2E4.")), /*#__PURE__*/React.createElement("details", {
    className: "rounded-xl border border-slate-200 bg-white p-5"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "cursor-pointer font-bold text-slate-950"
  }, "\uAC00\uC0C1\uACC4\uC88C \uACB0\uC81C\uB294 \uC989\uC2DC \uC644\uB8CC\uB418\uB098\uC694?"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-sm leading-6 text-slate-600"
  }, "\uAC00\uC0C1\uACC4\uC88C\uB294 \uC785\uAE08 \uC804\uAE4C\uC9C0 \u2018\uC785\uAE08 \uB300\uAE30\u2019\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4. \uC11C\uBC84\uC5D0\uC11C \uACB0\uC81C \uC644\uB8CC\uAC00 \uD655\uC778\uB418\uAE30 \uC804\uC5D0\uB294 \uBA64\uBC84\uC2ED \uC131\uACF5\uC73C\uB85C \uD45C\uC2DC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.")), /*#__PURE__*/React.createElement("details", {
    className: "rounded-xl border border-slate-200 bg-white p-5"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "cursor-pointer font-bold text-slate-950"
  }, "\uD658\uBD88 \uAE30\uC900\uC740 \uC5B4\uB514\uC5D0\uC11C \uD655\uC778\uD558\uB098\uC694?"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-sm leading-6 text-slate-600"
  }, "\uC784\uC758\uC758 \uAE30\uC900\uC744 \uC548\uB0B4\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uC801\uC6A9 \uC911\uC778 ", /*#__PURE__*/React.createElement("a", {
    href: "/intro/refund/",
    className: "font-bold text-blue-700 underline hover:text-blue-900"
  }, "\uD658\uBD88 \uC548\uB0B4"), "\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694."))));
  function Main() {
    return /*#__PURE__*/React.createElement("main", {
      className: "mx-auto w-full max-w-screen-xl px-4 py-8 md:px-6"
    }, /*#__PURE__*/React.createElement(PageHeader, null), /*#__PURE__*/React.createElement(StatusNotice, null), /*#__PURE__*/React.createElement(Comparison, null), /*#__PURE__*/React.createElement(ResultExample, null), /*#__PURE__*/React.createElement("div", {
      className: "mb-8 grid grid-cols-1 items-start gap-6 md:grid-cols-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-span-1 md:col-span-2"
    }, /*#__PURE__*/React.createElement(ProductSection, null)), /*#__PURE__*/React.createElement("div", {
      className: "order-first md:order-none"
    }, /*#__PURE__*/React.createElement(UserInfoPanel, null))), /*#__PURE__*/React.createElement(VIPSection, null), /*#__PURE__*/React.createElement(ExperimentHold, null), /*#__PURE__*/React.createElement(FAQ, null));
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
      const tossPayments = global.TossPayments(order.client_key);
      const options = {
        amount: Number(order.amount),
        orderId: order.orderID,
        orderName: order.product_name,
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
