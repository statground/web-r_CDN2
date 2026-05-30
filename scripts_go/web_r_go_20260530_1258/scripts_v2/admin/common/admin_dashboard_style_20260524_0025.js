(function () {
  function installChartHelper() {
    var dashboard = window.WebRAdminDashboard || {};
    if (dashboard.ensureECharts) {
      window.WebRAdminDashboard = dashboard;
      return;
    }
    function resizeChartWhenReady(chart, el) {
      if (!chart || !el) return;
      var attempts = 0;
      var resize = function () {
        attempts += 1;
        var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { width: el.offsetWidth, height: el.offsetHeight };
        if (rect.width > 0 && rect.height > 0) {
          chart.resize();
          return;
        }
        if (attempts < 24) {
          window.requestAnimationFrame(resize);
        }
      };
      window.requestAnimationFrame(resize);
      if (window.ResizeObserver && !el.__webrAdminChartResizeObserver) {
        el.__webrAdminChartResizeObserver = new ResizeObserver(function () {
          try { chart.resize(); } catch (err) {}
        });
        el.__webrAdminChartResizeObserver.observe(el);
      }
      if (!el.__webrAdminChartWindowResize) {
        el.__webrAdminChartWindowResize = function () {
          try { chart.resize(); } catch (err) {}
        };
        window.addEventListener("resize", el.__webrAdminChartWindowResize, { passive: true });
      }
    }
    function patchECharts() {
      if (!window.echarts || window.echarts.__webrAdminPatched) return !!window.echarts;
      var originalInit = window.echarts.init;
      window.echarts.init = function (el) {
        var chart = originalInit.apply(window.echarts, arguments);
        resizeChartWhenReady(chart, el);
        return chart;
      };
      window.echarts.__webrAdminPatched = true;
      return true;
    }
    dashboard.ensureECharts = function (callback) {
      var attempts = 0;
      var tick = function () {
        if (patchECharts()) {
          callback(window.echarts);
          return;
        }
        attempts += 1;
        if (attempts < 60) {
          window.setTimeout(tick, 50);
        }
      };
      tick();
    };
    dashboard.resizeChartWhenReady = resizeChartWhenReady;
    window.WebRAdminDashboard = dashboard;
    dashboard.ensureECharts(function () {});
  }
  installChartHelper();
  var match = window.location.pathname.match(/^\/admin\/([^/]+)\//);
  var sub = match ? match[1] : "";
  if (!sub && /^\/admin\/?$/.test(window.location.pathname || "")) {
    sub = "main";
  }
  var enabled = {
    main: true,
    active_users: true,
    webr: true,
    visitors: true,
    members: true,
    payments: true,
    balance_account: true,
    pipelines: true
  };
  if (!enabled[sub]) {
    return;
  }
  document.documentElement.setAttribute("data-webr-admin-dashboard", sub);
  if (document.getElementById("webr-admin-dashboard-shared-style")) {
    return;
  }
  var style = document.createElement("style");
  style.id = "webr-admin-dashboard-shared-style";
  style.textContent = `
    :root[data-webr-admin-dashboard] #div_main {
      width: 100%;
    }
    :root[data-webr-admin-dashboard] #div_main > div {
      background: #f8fafc;
      gap: 14px;
      justify-content: stretch !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      max-width: none !important;
      padding: 14px 12px !important;
      width: 100% !important;
    }
    :root[data-webr-admin-dashboard] #div_main > div.webr-admin-shell {
      max-width: none !important;
      width: 100% !important;
    }
    :root[data-webr-admin-dashboard] #div_main > div > div:first-child,
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) {
      max-width: none !important;
      min-width: 0;
      width: 100% !important;
    }
    @media (min-width: 768px) {
      :root[data-webr-admin-dashboard] #div_main > div {
        display: grid !important;
        align-items: start !important;
        grid-template-columns: minmax(220px, 260px) minmax(0, 1fr) !important;
        padding: 18px 32px !important;
      }
      :root[data-webr-admin-dashboard] #div_main > div > .webr-admin-menu,
      :root[data-webr-admin-dashboard] #div_main > div > nav.webr-admin-menu {
        grid-column: 1 / 2 !important;
        max-width: 260px !important;
        min-width: 0 !important;
        width: 100% !important;
      }
      :root[data-webr-admin-dashboard] #div_main > div > div:first-child {
        grid-column: 1 / 2 !important;
        max-width: 260px !important;
      }
      :root[data-webr-admin-dashboard] #div_main > div > div:first-child > div {
        width: 100% !important;
      }
      :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) {
        grid-column: 2 / 3 !important;
        width: 100% !important;
      }
    }
    @media (min-width: 1280px) {
      :root[data-webr-admin-dashboard] #div_main > div {
        padding-left: 48px !important;
        padding-right: 48px !important;
      }
    }
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) {
      align-items: stretch !important;
      display: grid !important;
      gap: 12px !important;
    }
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) > :not([hidden]) ~ :not([hidden]) {
      margin-top: 0 !important;
    }
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) > div {
      justify-self: stretch !important;
      max-width: none !important;
      min-width: 0;
      width: 100% !important;
    }
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) > div[class*="bg-white"][class*="border"] {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
    }
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) > div[class*="bg-white"][class*="border"] > div {
      background: #ffffff !important;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      border-radius: 12px !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
      height: 100%;
      padding: 14px !important;
      text-align: left !important;
    }
    :root[data-webr-admin-dashboard] #div_main h5,
    :root[data-webr-admin-dashboard] #div_main h5 span,
    :root[data-webr-admin-dashboard] #div_main p.text-2xl {
      color: #111827 !important;
      font-size: 0.95rem !important;
      font-weight: 800 !important;
      letter-spacing: 0 !important;
      line-height: 1.2 !important;
      margin: 0 0 12px !important;
      text-align: left !important;
    }
    :root[data-webr-admin-dashboard] #div_main dl {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) > div:nth-child(-n+2) dl.grid {
      align-items: stretch !important;
      display: grid !important;
      gap: 8px !important;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
      justify-content: stretch !important;
      padding: 0 !important;
      width: 100% !important;
    }
    :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) > div:nth-child(2) dl.grid {
      align-items: stretch !important;
      display: grid !important;
      gap: 10px !important;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
      justify-content: stretch !important;
      padding: 0 !important;
      width: 100% !important;
    }
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) > div:nth-child(-n+2) dl.grid > div,
    :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) > div:nth-child(2) dl.grid > div {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      min-width: 0;
      padding: 10px !important;
      text-align: left !important;
    }
    :root[data-webr-admin-dashboard] #div_main dl.grid > div[class*="flex"] {
      align-items: flex-start !important;
      justify-content: center !important;
    }
    :root[data-webr-admin-dashboard] #div_main dt {
      color: #020617 !important;
      font-size: clamp(1rem, 1.18vw, 1.22rem) !important;
      font-weight: 850 !important;
      letter-spacing: 0 !important;
      line-height: 1.08 !important;
      max-width: 100% !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
    }
    :root[data-webr-admin-dashboard] #div_main .text-4xl,
    :root[data-webr-admin-dashboard] #div_main dd.mt-3[class*="text-3xl"] {
      font-size: clamp(1.05rem, 1.28vw, 1.28rem) !important;
      letter-spacing: 0 !important;
      line-height: 1.08 !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
    }
    :root[data-webr-admin-dashboard] #div_main dd {
      color: #64748b !important;
      font-size: 0.78rem !important;
      line-height: 1.25 !important;
      margin-top: 4px !important;
      white-space: normal !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse {
      animation-duration: 1.5s;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse h5,
    :root[data-webr-admin-dashboard] #div_main .animate-pulse dt,
    :root[data-webr-admin-dashboard] #div_main .animate-pulse dd,
    :root[data-webr-admin-dashboard] #div_main .animate-pulse label,
    :root[data-webr-admin-dashboard] #div_main .animate-pulse p,
    :root[data-webr-admin-dashboard] #div_main .animate-pulse select,
    :root[data-webr-admin-dashboard] #div_main .animate-pulse button {
      background: #e5e7eb !important;
      border-color: #e5e7eb !important;
      border-radius: 999px !important;
      box-shadow: none !important;
      color: transparent !important;
      line-height: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
      text-shadow: none !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse h5,
    :root[data-webr-admin-dashboard] #div_main .animate-pulse h5 span {
      color: transparent !important;
      text-shadow: none !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse h5 {
      display: block !important;
      height: 18px !important;
      margin: 0 auto 18px !important;
      max-width: 220px !important;
      width: 42% !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse h5 span {
      background: transparent !important;
      display: inline !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse dt {
      display: block !important;
      height: 22px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      max-width: 160px !important;
      min-height: 0 !important;
      width: 68% !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse dd {
      display: block !important;
      height: 12px !important;
      margin: 9px auto 0 !important;
      max-width: 130px !important;
      min-height: 0 !important;
      width: 58% !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse label {
      display: block !important;
      height: 12px !important;
      margin: 0 0 8px !important;
      width: 58px !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse p {
      display: block !important;
      height: 12px !important;
      margin: 0 0 10px !important;
      max-width: 180px !important;
      width: 36% !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse select,
    :root[data-webr-admin-dashboard] #div_main .animate-pulse button {
      height: 38px !important;
      min-width: 96px !important;
      width: 112px !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="bg-gray-100"],
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="bg-gray-200"],
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="bg-gray-300"] {
      background: #e5e7eb !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="h-[350px]"] {
      height: 96px !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="h-56"],
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="h-64"],
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="h-72"],
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="h-80"] {
      height: 180px !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="divide-y"] {
      border-color: #e5e7eb !important;
      padding: 8px !important;
    }
    :root[data-webr-admin-dashboard] #div_main ul {
      border-color: #e2e8f0 !important;
    }
    :root[data-webr-admin-dashboard] #div_main li > div[id^="graph_tab_"] {
      border-radius: 8px 8px 0 0 !important;
      padding: 10px 16px !important;
    }
    :root[data-webr-admin-dashboard] #div_select {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
      justify-self: stretch !important;
      max-width: none !important;
      padding: 12px;
      width: 100% !important;
    }
    :root[data-webr-admin-dashboard] #div_select > div {
      flex-wrap: wrap;
      gap: 10px !important;
    }
    :root[data-webr-admin-dashboard] #div_statistics_graph {
      min-height: 420px;
    }
    :root[data-webr-admin-dashboard="active_users"] #div_main > div > div:nth-child(2) > div > div > dl > div[class*="md:grid-cols-5"] {
      gap: 8px !important;
      padding: 0 !important;
    }
    :root[data-webr-admin-dashboard="active_users"] #div_main > div > div:nth-child(2) > div > div > dl > div[class*="md:grid-cols-5"] > div {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 10px !important;
      text-align: left !important;
    }
    :root[data-webr-admin-dashboard="webr"] #div_main > div > div:nth-child(2) > div:nth-child(2) dl > div,
    :root[data-webr-admin-dashboard="payments"] #div_main > div > div:nth-child(2) > div:nth-child(2) dl > div {
      background: #f8fafc;
      border-color: #e5e7eb;
      border-radius: 10px;
      padding: 12px !important;
    }
    :root[data-webr-admin-dashboard="webr"] #div_main > div > div:nth-child(2) > div:nth-child(3) dl,
    :root[data-webr-admin-dashboard="payments"] #div_main > div > div:nth-child(2) > div:nth-child(2) dl {
      gap: 10px !important;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
      padding: 0 !important;
    }
    @media (min-width: 1024px) {
      :root[data-webr-admin-dashboard="webr"] #div_main > div > div:nth-child(2),
      :root[data-webr-admin-dashboard="payments"] #div_main > div > div:nth-child(2) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      :root[data-webr-admin-dashboard="webr"] #div_main > div > div:nth-child(2) > div:nth-child(n+3),
      :root[data-webr-admin-dashboard="payments"] #div_main > div > div:nth-child(2) > div:nth-child(n+3),
      :root[data-webr-admin-dashboard="active_users"] #div_main > div > div:nth-child(2) > div,
      :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) > div {
        grid-column: 1 / -1;
      }
      :root[data-webr-admin-dashboard="visitors"] #div_main > div > div:nth-child(2) {
        grid-template-columns: minmax(0, 1fr) !important;
      }
      :root[data-webr-admin-dashboard="visitors"] #div_main > div > div:nth-child(2) > div {
        grid-column: 1 / -1 !important;
      }
      :root[data-webr-admin-dashboard="balance_account"] #div_main > div {
        max-width: none !important;
        width: 100% !important;
      }
      :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) {
        justify-items: stretch !important;
        max-width: none !important;
        width: 100% !important;
      }
      :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) > div {
        justify-self: stretch !important;
        max-width: none !important;
        width: 100% !important;
      }
      :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) > div:nth-child(2) dl.grid {
        grid-template-columns: repeat(2, minmax(320px, 1fr)) !important;
      }
    }
    @media (min-width: 1536px) {
      :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) > div:nth-child(2) dl.grid {
        grid-template-columns: repeat(3, minmax(300px, 1fr)) !important;
      }
    }
  `;
  document.head.appendChild(style);

  var dashboard = window.WebRAdminDashboard || {};

  function resizeChartWhenReady(chart, el) {
    if (!chart || !el) return;
    var attempts = 0;
    var resize = function () {
      attempts += 1;
      var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { width: el.offsetWidth, height: el.offsetHeight };
      if (rect.width > 0 && rect.height > 0) {
        chart.resize();
        return;
      }
      if (attempts < 24) {
        window.requestAnimationFrame(resize);
      }
    };
    window.requestAnimationFrame(resize);
    if (window.ResizeObserver && !el.__webrAdminChartResizeObserver) {
      el.__webrAdminChartResizeObserver = new ResizeObserver(function () {
        try {
          chart.resize();
        } catch (err) {
          // Chart may already be disposed during React re-render.
        }
      });
      el.__webrAdminChartResizeObserver.observe(el);
    }
    if (!el.__webrAdminChartWindowResize) {
      el.__webrAdminChartWindowResize = function () {
        try {
          chart.resize();
        } catch (err) {
          // Chart may already be disposed during React re-render.
        }
      };
      window.addEventListener("resize", el.__webrAdminChartWindowResize, { passive: true });
    }
  }

  function patchECharts() {
    if (!window.echarts || window.echarts.__webrAdminPatched) return !!window.echarts;
    var originalInit = window.echarts.init;
    window.echarts.init = function (el) {
      var chart = originalInit.apply(window.echarts, arguments);
      resizeChartWhenReady(chart, el);
      return chart;
    };
    window.echarts.__webrAdminPatched = true;
    return true;
  }

  dashboard.ensureECharts = function (callback) {
    var attempts = 0;
    var tick = function () {
      if (patchECharts()) {
        callback(window.echarts);
        return;
      }
      attempts += 1;
      if (attempts < 60) {
        window.setTimeout(tick, 50);
      }
    };
    tick();
  };

  dashboard.resizeChartWhenReady = resizeChartWhenReady;
  window.WebRAdminDashboard = dashboard;
  dashboard.ensureECharts(function () {});
})();
