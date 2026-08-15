(function () {
  var ADMIN_PAYMENTS_GUARD_CONTRACT = Object.freeze({
    auth: "SERVER_PAGE_AUTH_TRUSTED_NO_MENU_HEADER_FETCH",
    order: "AMOUNTS_FIRST_THEN_PRODUCTS_AND_GRAPH",
    retry: "BOUNDED_RETRY_MAX_3",
    failure: "INVALID_PAYLOAD_STAYS_SKELETON_OR_LAST_GOOD",
    missing: "MISSING_METRIC_IS_NOT_ZERO"
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

  function adminPaymentsGuardMetricPresent(count, key) {
    if (!adminPaymentsGuardObject(count) || !adminPaymentsGuardObject(count[key])) return false;
    if (!Object.prototype.hasOwnProperty.call(count[key], "0")) return false;
    var raw = count[key]["0"];
    if (raw === null || raw === "" || typeof raw === "boolean") return false;
    return Number.isFinite(Number(raw));
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
      return ADMIN_PAYMENTS_GUARD_AMOUNT_KEYS.every(function (key) {
        return adminPaymentsGuardMetricPresent(payload.count, key);
      });
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

  async function adminPaymentsGuardLoadSection(section) {
    var lastError = null;
    for (var attempt = 0; attempt < ADMIN_PAYMENTS_GUARD_MAX_ATTEMPTS; attempt += 1) {
      try {
        var payload = await adminPaymentsGuardFetchJSON(ADMIN_PAYMENTS_GUARD_ENDPOINTS[section]);
        if (!adminPaymentsGuardPayloadValid(section, payload)) {
          throw new Error("ADMIN_PAYMENTS_INVALID_" + section.toUpperCase() + "_PAYLOAD");
        }
        return payload;
      } catch (error) {
        lastError = error;
        if (attempt < ADMIN_PAYMENTS_GUARD_MAX_ATTEMPTS - 1) {
          await adminPaymentsGuardDelay(ADMIN_PAYMENTS_GUARD_RETRY_DELAYS_MS[attempt]);
        }
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
        if (!drawGraph || !adminPaymentsGuardState.loaded.graph || typeof draw_chart !== "function") return;
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

  async function adminPaymentsGuardTrySection(section) {
    try {
      var payload = await adminPaymentsGuardLoadSection(section);
      adminPaymentsGuardCommit(section, payload);
      return true;
    } catch (error) {
      adminPaymentsGuardState.delayed[section] = true;
      adminPaymentsGuardRenderDelayNotice();
      console.warn("admin payments guard kept " + (adminPaymentsGuardState.lastGood[section] ? "last-good" : "skeleton") + " for " + section);
      return false;
    }
  }

  async function adminPaymentsGuardGetMain() {
    if (adminPaymentsGuardState.loadPromise) return adminPaymentsGuardState.loadPromise;
    adminPaymentsGuardState.loadPromise = (async function () {
      adminPaymentsGuardRender(false);
      await adminPaymentsGuardTrySection("amounts");
      await Promise.all([
        adminPaymentsGuardTrySection("products"),
        adminPaymentsGuardTrySection("graph")
      ]);
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
