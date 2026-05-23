(function () {
  var match = window.location.pathname.match(/^\/admin\/([^/]+)\//);
  var sub = match ? match[1] : "";
  var enabled = {
    active_users: true,
    webr: true,
    visitors: true,
    payments: true,
    balance_account: true
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
    :root[data-webr-admin-dashboard] #div_main > div {
      background: #f8fafc;
      gap: 14px;
      padding: 14px 12px !important;
    }
    @media (min-width: 768px) {
      :root[data-webr-admin-dashboard] #div_main > div {
        padding: 18px 32px !important;
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
      min-width: 0;
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
    :root[data-webr-admin-dashboard] #div_main > div > div:nth-child(2) > div:nth-child(-n+2) dl.grid,
    :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) > div:nth-child(2) dl.grid {
      align-items: stretch !important;
      display: grid !important;
      gap: 8px !important;
      grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)) !important;
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
    :root[data-webr-admin-dashboard] #div_main dt {
      color: #020617 !important;
      font-size: 1.28rem !important;
      font-weight: 850 !important;
      letter-spacing: 0 !important;
      line-height: 1.08 !important;
      white-space: normal !important;
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
    :root[data-webr-admin-dashboard] #div_main .animate-pulse h5 span {
      color: #111827 !important;
    }
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="bg-gray-100"],
    :root[data-webr-admin-dashboard] #div_main .animate-pulse [class*="bg-gray-200"] {
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
      padding: 12px;
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
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
      padding: 0 !important;
    }
    @media (min-width: 1024px) {
      :root[data-webr-admin-dashboard="visitors"] #div_main > div > div:nth-child(2),
      :root[data-webr-admin-dashboard="webr"] #div_main > div > div:nth-child(2),
      :root[data-webr-admin-dashboard="payments"] #div_main > div > div:nth-child(2) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      :root[data-webr-admin-dashboard="visitors"] #div_main > div > div:nth-child(2) > div:nth-child(n+3),
      :root[data-webr-admin-dashboard="webr"] #div_main > div > div:nth-child(2) > div:nth-child(n+3),
      :root[data-webr-admin-dashboard="payments"] #div_main > div > div:nth-child(2) > div:nth-child(n+3),
      :root[data-webr-admin-dashboard="active_users"] #div_main > div > div:nth-child(2) > div,
      :root[data-webr-admin-dashboard="balance_account"] #div_main > div > div:nth-child(2) > div {
        grid-column: 1 / -1;
      }
    }
  `;
  document.head.appendChild(style);
})();
