(function () {
  var ADMIN_BALANCE_GUARD_CONTRACT = Object.freeze({
    auth: "SERVER_PAGE_AUTH_TRUSTED_NO_MENU_HEADER_FETCH",
    retry: "BOUNDED_RETRY_MAX_3",
    failure: "INVALID_PAYLOAD_STAYS_SKELETON_OR_LAST_GOOD",
    zero: "ZERO_FALLBACK_IS_NOT_A_SETTLEMENT",
    partial: "ONLY_NONZERO_PARTIAL_MAY_RENDER"
  });
  var ADMIN_BALANCE_GUARD_MAX_ATTEMPTS = 3;
  var ADMIN_BALANCE_GUARD_RETRY_DELAYS_MS = [250, 750];
  var ADMIN_BALANCE_GUARD_REQUEST_TIMEOUT_MS = 35000;
  var ADMIN_BALANCE_GUARD_COUNT_KEYS = [
    "amt_total", "amt_tax", "amt_toss",
    "amt_statground", "amt_benefit_tax", "amt_result"
  ];
  var adminBalanceGuardState = window.__webrAdminBalanceGuardState || {
    lastGood: null,
    loadPromise: null,
    mainPromise: null
  };
  window.__webrAdminBalanceGuardState = adminBalanceGuardState;

  function adminBalanceGuardFlag(value) {
    if (value === true || value === 1) return true;
    var normalized = String(value == null ? "" : value).trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }

  function adminBalanceGuardObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function adminBalanceGuardMetric(count, key) {
    if (!adminBalanceGuardObject(count) || !adminBalanceGuardObject(count[key])) return null;
    if (!Object.prototype.hasOwnProperty.call(count[key], "0")) return null;
    var raw = count[key]["0"];
    if (raw === null || raw === "" || typeof raw === "boolean") return null;
    var parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function adminBalanceGuardPayloadPartial(payload) {
    return ["fallback", "partial"].some(function (key) {
      return adminBalanceGuardFlag(payload[key]);
    });
  }

  function adminBalanceGuardPayloadValid(payload) {
    if (!adminBalanceGuardObject(payload) || !adminBalanceGuardFlag(payload.ok)) return false;
    if (adminBalanceGuardFlag(payload.pending)) return false;
    var status = String(payload.status || payload.state || "").trim().toLowerCase();
    if (["failed", "failure", "error", "pending", "unavailable"].indexOf(status) >= 0) return false;
    if (!adminBalanceGuardObject(payload.count) || !adminBalanceGuardObject(payload.table)) return false;
    if (!ADMIN_BALANCE_GUARD_COUNT_KEYS.every(function (key) {
      return adminBalanceGuardMetric(payload.count, key) !== null;
    })) return false;
    var total = adminBalanceGuardMetric(payload.count, "amt_total");
    if (adminBalanceGuardPayloadPartial(payload) && total === 0) return false;
    return true;
  }

  function adminBalanceGuardDelay(delayMS) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, delayMS);
    });
  }

  function adminBalanceGuardFetchJSON() {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () {
      controller.abort();
    }, ADMIN_BALANCE_GUARD_REQUEST_TIMEOUT_MS) : null;
    var body = new URLSearchParams({
      year: String(window.year || ""),
      month: String(window.month || "")
    });
    return fetch("/admin/ajax_get_admin_balance_account/", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
        "Cache-Control": "no-cache"
      },
      body: body,
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      if (!response.ok) throw new Error("ADMIN_BALANCE_HTTP_FAILURE");
      return response.json();
    }).finally(function () {
      if (timer !== null) window.clearTimeout(timer);
    });
  }

  async function adminBalanceGuardLoad() {
    var lastError = null;
    for (var attempt = 0; attempt < ADMIN_BALANCE_GUARD_MAX_ATTEMPTS; attempt += 1) {
      try {
        var payload = await adminBalanceGuardFetchJSON();
        if (!adminBalanceGuardPayloadValid(payload)) throw new Error("ADMIN_BALANCE_INVALID_PAYLOAD");
        return payload;
      } catch (error) {
        lastError = error;
        if (attempt < ADMIN_BALANCE_GUARD_MAX_ATTEMPTS - 1) {
          await adminBalanceGuardDelay(ADMIN_BALANCE_GUARD_RETRY_DELAYS_MS[attempt]);
        }
      }
    }
    throw lastError || new Error("ADMIN_BALANCE_UNAVAILABLE");
  }

  function adminBalanceGuardSyncSelectors() {
    var selectYear = document.getElementById("sel_year");
    var selectMonth = document.getElementById("sel_momth");
    if (selectYear) {
      var currentYear = new Date().getFullYear();
      while (selectYear.firstChild) selectYear.removeChild(selectYear.firstChild);
      for (var optionYear = 2015; optionYear <= currentYear; optionYear += 1) {
        var option = document.createElement("option");
        option.text = String(optionYear);
        option.value = String(optionYear);
        selectYear.appendChild(option);
      }
      selectYear.value = String(window.year || currentYear);
    }
    if (selectMonth) selectMonth.value = String(window.month || (new Date().getMonth() + 1));
  }

  function adminBalanceGuardRender(payload) {
    var mount = document.getElementById("div_main");
    if (!mount || typeof React === "undefined" || typeof ReactDOM === "undefined" || typeof Div_main !== "function") return;
    ReactDOM.render(React.createElement(Div_main, { data: payload }), mount, adminBalanceGuardSyncSelectors);
  }

  function adminBalanceGuardRenderDelayNotice(show) {
    var mount = document.getElementById("div_main");
    if (!mount || !mount.parentNode) return;
    var notice = document.getElementById("webr-admin-balance-delay");
    if (!show) {
      if (notice) notice.remove();
      return;
    }
    if (notice) return;
    notice = document.createElement("div");
    notice.id = "webr-admin-balance-delay";
    notice.className = "mx-auto mt-4 max-w-screen-xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900";
    var message = document.createElement("span");
    message.textContent = "정산 집계가 지연되고 있습니다. 마지막 정상값 또는 로딩 화면을 유지합니다. ";
    var retry = document.createElement("button");
    retry.type = "button";
    retry.className = "font-semibold underline underline-offset-2";
    retry.textContent = "다시 시도";
    retry.addEventListener("click", function () { window.set_main(); });
    notice.appendChild(message);
    notice.appendChild(retry);
    mount.parentNode.insertBefore(notice, mount);
  }

  async function adminBalanceGuardGetMain() {
    if (adminBalanceGuardState.loadPromise) return adminBalanceGuardState.loadPromise;
    adminBalanceGuardState.loadPromise = (async function () {
      try {
        var payload = await adminBalanceGuardLoad();
        adminBalanceGuardState.lastGood = payload;
        adminBalanceGuardRenderDelayNotice(false);
        adminBalanceGuardRender(payload);
        return true;
      } catch (error) {
        adminBalanceGuardRenderDelayNotice(true);
        console.warn("admin balance guard kept " + (adminBalanceGuardState.lastGood ? "last-good" : "skeleton"));
        if (adminBalanceGuardState.lastGood) adminBalanceGuardRender(adminBalanceGuardState.lastGood);
        return false;
      }
    })();
    try {
      return await adminBalanceGuardState.loadPromise;
    } finally {
      adminBalanceGuardState.loadPromise = null;
    }
  }

  async function adminBalanceGuardSetMain() {
    if (adminBalanceGuardState.mainPromise) return adminBalanceGuardState.mainPromise;
    adminBalanceGuardState.mainPromise = (async function () {
      var mount = document.getElementById("div_main");
      if (!mount) return;
      if (adminBalanceGuardState.lastGood) {
        adminBalanceGuardRender(adminBalanceGuardState.lastGood);
      } else if (typeof React !== "undefined" && typeof ReactDOM !== "undefined" && typeof Div_main_skeleton === "function") {
        ReactDOM.render(React.createElement(Div_main_skeleton), mount);
      }
      await adminBalanceGuardGetMain();
    })();
    try {
      await adminBalanceGuardState.mainPromise;
    } finally {
      adminBalanceGuardState.mainPromise = null;
    }
  }

  window.WebRAdminBalanceReadGuard = Object.freeze({
    contract: ADMIN_BALANCE_GUARD_CONTRACT,
    payloadPartial: adminBalanceGuardPayloadPartial,
    payloadValid: adminBalanceGuardPayloadValid,
    load: adminBalanceGuardLoad,
    getMain: adminBalanceGuardGetMain
  });
  window.get_main = adminBalanceGuardGetMain;
  window.set_main = adminBalanceGuardSetMain;
  try { get_main = adminBalanceGuardGetMain; } catch (error) { /* window binding is sufficient */ }
  try { set_main = adminBalanceGuardSetMain; } catch (error) { /* window binding is sufficient */ }

  window.setTimeout(function () {
    if (window.__webr_set_main_called__) window.set_main();
  }, 0);
})();
