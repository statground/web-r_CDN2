(function () {
  const BETA_LABEL = "Beta";
  const BETA_TEXT = "\uC774 \uD398\uC774\uC9C0\uC640 Web-R 2.0 \uC571\uC740 \uBAA8\uB450 beta \uBC84\uC804\uC785\uB2C8\uB2E4. \uBD84\uC11D \uACB0\uACFC\uB294 \uAC80\uD1A0\uC6A9\uC73C\uB85C \uC0AC\uC6A9\uD558\uACE0, \uC911\uC694\uD55C \uC758\uC0AC\uACB0\uC815 \uC804\uC5D0\uB294 \uC6D0\uC790\uB8CC\uC640 \uD1B5\uACC4 \uAC00\uC815\uC744 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
  const state = {
    appSetMain: null,
    loadPromise: null
  };

  function getConfig() {
    if (window.WEBR2_SECURE_APP && window.WEBR2_SECURE_APP.key) {
      return window.WEBR2_SECURE_APP;
    }
    if (typeof WEBR2_SECURE_APP !== "undefined" && WEBR2_SECURE_APP && WEBR2_SECURE_APP.key) {
      return WEBR2_SECURE_APP;
    }
    if (window.WEBR2_SERVICE && window.WEBR2_SERVICE.key) {
      return window.WEBR2_SERVICE;
    }
    if (typeof WEBR2_SERVICE !== "undefined" && WEBR2_SERVICE && WEBR2_SERVICE.key) {
      return WEBR2_SERVICE;
    }
    return {};
  }

  function assetURL(config) {
    const key = String(config.key || "").trim();
    const direct = String(config.asset || "").trim();
    const version = String(config.version || "20260523_1309").trim();
    const url = direct || "/webr/2.0/assets/" + encodeURIComponent(key) + "/payload";
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "v=" + encodeURIComponent(version);
  }

  function isBetaEnabled(config) {
    if (config && config.beta === false) {
      return false;
    }
    return true;
  }

  function renderLoading(title, beta) {
    const root = document.getElementById("div_main");
    if (!root) {
      return;
    }
    root.innerHTML = [
      '<div class="min-h-[calc(100vh-130px)] bg-slate-50">',
      '<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8">',
      '<div class="rounded border border-slate-200 bg-white p-5 text-sm text-slate-600">',
      beta ? '<span class="mr-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold uppercase tracking-normal text-amber-700">Beta</span>' : "",
      escapeHTML(title || "Web-R 2.0"),
      ' \uB85C\uB4DC \uC911\uC785\uB2C8\uB2E4.',
      "</div></div></div>"
    ].join("");
  }

  function renderError(beta) {
    const root = document.getElementById("div_main");
    if (!root) {
      return;
    }
    root.innerHTML = [
      '<div class="min-h-[calc(100vh-130px)] bg-slate-50">',
      '<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8">',
      '<div class="rounded border border-rose-200 bg-white p-5 text-sm text-rose-700">',
      beta ? "\uC77C\uC2DC\uC801\uC73C\uB85C Web-R 2.0 beta \uC571\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694." : "\uC77C\uC2DC\uC801\uC73C\uB85C Web-R 2.0 \uC571\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
      "</div></div></div>"
    ].join("");
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  async function loadEncryptedApp() {
    if (state.appSetMain) {
      return state.appSetMain;
    }
    if (state.loadPromise) {
      return state.loadPromise;
    }
    state.loadPromise = (async function () {
      const config = getConfig();
      if (!config.key) {
        throw new Error("missing Web-R 2.0 app key");
      }
      const response = await fetch(assetURL(config), {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Accept": "application/javascript" }
      });
      if (!response.ok) {
        throw new Error("failed to load Web-R 2.0 app");
      }
      const source = await response.text();
      const previousSetMain = window.set_main;
      const factory = new Function("window", "document", "React", "ReactDOM", source + "\n; return (typeof set_main === 'function' ? set_main : window.set_main);");
      const nextSetMain = factory(window, document, window.React, window.ReactDOM);
      if (typeof nextSetMain !== "function") {
        throw new Error("Web-R 2.0 app entrypoint is missing");
      }
      if (previousSetMain === window.set_main) {
        window.set_main = secureSetMain;
      }
      state.appSetMain = nextSetMain;
      return nextSetMain;
    })();
    return state.loadPromise;
  }

  function injectBetaNotice() {
    const root = document.getElementById("div_main");
    if (!root || root.querySelector("[data-webr2-beta-notice='true']")) {
      return;
    }
    const container = root.querySelector(".mx-auto") || root.firstElementChild || root;
    const notice = document.createElement("div");
    notice.setAttribute("data-webr2-beta-notice", "true");
    notice.className = "rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900";
    notice.innerHTML = '<span class="mr-2 inline-flex rounded border border-amber-300 bg-white px-2 py-0.5 text-xs font-bold uppercase text-amber-700">' + BETA_LABEL + "</span>" + BETA_TEXT;
    if (container.firstChild) {
      container.insertBefore(notice, container.firstChild);
    } else {
      container.appendChild(notice);
    }
    addBetaBadges(root);
  }

  function addBetaBadges(root) {
    const targets = [];
    root.querySelectorAll("h1").forEach(function (heading) {
      targets.push(heading);
    });
    if (targets.length === 0) {
      const firstTitle = root.querySelector("[class*='text-'][class*='font-bold']");
      if (firstTitle) {
        targets.push(firstTitle);
      }
    }
    root.querySelectorAll("a[href^='/webr/'] h2, a[href^=\"/webr/\"] [class*='text-xl'][class*='font-bold']").forEach(function (heading) {
      targets.push(heading);
    });
    targets.forEach(function (heading) {
      if (heading.querySelector && heading.querySelector("[data-webr2-beta-badge='true']")) {
        return;
      }
      const text = (heading.textContent || "").trim();
      if (!text || text.toLowerCase().indexOf("beta") !== -1) {
        return;
      }
      const badge = document.createElement("span");
      badge.setAttribute("data-webr2-beta-badge", "true");
      badge.className = "ml-2 inline-flex align-middle rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold uppercase text-amber-700";
      badge.textContent = BETA_LABEL;
      heading.appendChild(badge);
    });
  }

  function scheduleBetaNotice() {
    const run = function () {
      injectBetaNotice();
      window.setTimeout(injectBetaNotice, 120);
      window.setTimeout(injectBetaNotice, 500);
    };
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(run);
    } else {
      window.setTimeout(run, 0);
    }
  }

  async function secureSetMain() {
    const config = getConfig();
    const beta = isBetaEnabled(config);
    renderLoading(config.title, beta);
    try {
      const appSetMain = await loadEncryptedApp();
      await appSetMain();
      if (beta) {
        scheduleBetaNotice();
      }
    } catch (error) {
      renderError(beta);
      if (window.console && window.console.warn) {
        window.console.warn(beta ? "Web-R 2.0 beta app load failed" : "Web-R 2.0 app load failed");
      }
    }
  }

  window.__webr2SecureSetMain = secureSetMain;
  window.set_main = secureSetMain;
})();
