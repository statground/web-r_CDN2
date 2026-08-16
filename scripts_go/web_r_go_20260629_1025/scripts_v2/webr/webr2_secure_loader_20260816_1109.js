(function () {
  const BETA_LABEL = "Beta";
  const BETA_TEXT = "\uC774 \uC571\uC740 Beta \uBC84\uC804\uC73C\uB85C \uACC4\uC18D \uAC1C\uC120 \uC911\uC785\uB2C8\uB2E4. \uC911\uC694\uD55C \uC758\uC0AC\uACB0\uC815 \uC804\uC5D0\uB294 \uC6D0\uC790\uB8CC, \uD1B5\uACC4 \uAC00\uC815\uACFC \uBD84\uC11D \uBC29\uBC95\uC744 \uD568\uAED8 \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
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
      '<div class="rounded border border-slate-200 bg-white p-5 text-sm text-slate-600" role="status" aria-live="polite">',
      beta ? '<span class="mr-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold uppercase tracking-normal text-amber-700">Beta</span>' : "",
      escapeHTML(title || "Web-R 2.0"),
      ' \uB85C\uB4DC \uC911\uC785\uB2C8\uB2E4.',
      "</div></div></div>"
    ].join("");
  }

  function currentReturnPath() {
    const pathname = String(window.location && window.location.pathname || "/webr/2.0/");
    const search = String(window.location && window.location.search || "");
    if (pathname.charAt(0) !== "/" || pathname.indexOf("//") === 0 || pathname.indexOf("\\") !== -1) {
      return "/webr/2.0/";
    }
    return pathname + search;
  }

  function renderLoginRequired(title, beta) {
    const root = document.getElementById("div_main");
    if (!root) {
      return;
    }
    const next = encodeURIComponent(currentReturnPath());
    root.innerHTML = [
      '<div class="min-h-[calc(100vh-130px)] bg-slate-50">',
      '<div class="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 py-10">',
      '<section data-webr2-login-required="true" class="rounded-xl border border-blue-200 bg-white p-6 shadow-sm sm:p-8" role="region" aria-labelledby="webr2-login-required-title" aria-describedby="webr2-login-required-description" tabindex="-1">',
      '<div class="mb-4 flex flex-wrap items-center gap-2">',
      '<span class="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">\uB85C\uADF8\uC778 \uD6C4 \uC774\uC6A9</span>',
      beta ? '<span class="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase text-amber-700">Beta</span>' : "",
      "</div>",
      '<h1 id="webr2-login-required-title" class="text-3xl font-extrabold tracking-tight text-slate-950">', escapeHTML(title || "Web-R 2.0"), "</h1>",
      '<p id="webr2-login-required-description" class="mt-4 max-w-3xl text-base leading-7 text-slate-600">\uC571 \uC18C\uAC1C \uD654\uBA74\uC740 \uB204\uAD6C\uB098 \uC811\uADFC\uD560 \uC218 \uC788\uC9C0\uB9CC, \uC2E4\uC81C \uACC4\uC0B0\uACFC \uBD84\uC11D \uAE30\uB2A5\uC740 \uAC00\uC785 \uD6C4 \uB85C\uADF8\uC778\uD55C \uD68C\uC6D0\uC774 \uC774\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>',
      '<p class="mt-2 text-sm text-slate-500" role="status" aria-live="polite">\uB85C\uADF8\uC778\uD558\uAC70\uB098 \uD68C\uC6D0\uAC00\uC785\uD558\uBA74 \uD604\uC7AC \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uC640 \uC774\uC5B4\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>',
      '<div class="mt-6 flex flex-wrap gap-3">',
      '<a class="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500" href="/account/?next=', next, '">\uB85C\uADF8\uC778\uD558\uACE0 \uC774\uC6A9\uD558\uAE30</a>',
      '<a class="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500" href="/account/signup/?next=', next, '">\uD68C\uC6D0\uAC00\uC785</a>',
      '<a class="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500" href="/webr/2.0/">\uB2E4\uB978 \uC571 \uBCF4\uAE30</a>',
      "</div></section></div></div>"
    ].join("");
    const panel = root.querySelector("[data-webr2-login-required='true']");
    if (panel && typeof panel.focus === "function") {
      try {
        panel.focus({ preventScroll: true });
      } catch (_) {
        panel.focus();
      }
    }
  }

  function renderError(beta) {
    const root = document.getElementById("div_main");
    if (!root) {
      return;
    }
    root.innerHTML = [
      '<div class="min-h-[calc(100vh-130px)] bg-slate-50">',
      '<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8">',
      '<div class="rounded border border-rose-200 bg-white p-5 text-sm text-rose-700" role="alert">',
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
        const requestError = new Error("failed to load Web-R 2.0 app");
        requestError.status = response.status;
        requestError.loginRequired = false;
        if (response.status === 401) {
          try {
            const body = await response.text();
            if (body.length <= 2048) {
              const payload = JSON.parse(body);
              requestError.loginRequired = payload && payload.login_required === true;
            }
          } catch (_) {
            requestError.loginRequired = false;
          }
        }
        throw requestError;
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
    container.appendChild(notice);
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
      if (error && error.status === 401 && error.loginRequired === true) {
        renderLoginRequired(config.title, beta);
        if (window.console && window.console.info) {
          window.console.info("Web-R 2.0 login required");
        }
        return;
      }
      renderError(beta);
      if (window.console && window.console.warn) {
        window.console.warn(beta ? "Web-R 2.0 beta app load failed" : "Web-R 2.0 app load failed");
      }
    }
  }

  window.__webr2SecureSetMain = secureSetMain;
  window.set_main = secureSetMain;
})();
