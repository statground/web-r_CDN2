(function () {
  const h = React.createElement;
  const STATUS_META = {
    success: { label: "성공", className: "webr-pipeline-status-success", color: "#059669" },
    failure: { label: "실패", className: "webr-pipeline-status-failed", color: "#dc2626" },
    failed: { label: "실패", className: "webr-pipeline-status-failed", color: "#dc2626" },
    cancelled: { label: "취소", className: "webr-pipeline-status-failed", color: "#dc2626" },
    timed_out: { label: "시간 초과", className: "webr-pipeline-status-failed", color: "#dc2626" },
    action_required: { label: "확인 필요", className: "webr-pipeline-status-failed", color: "#dc2626" },
    in_progress: { label: "진행중", className: "webr-pipeline-status-running", color: "#2563eb" },
    running: { label: "진행중", className: "webr-pipeline-status-running", color: "#2563eb" },
    queued: { label: "대기", className: "webr-pipeline-status-running", color: "#2563eb" },
    pending: { label: "대기", className: "webr-pipeline-status-pending", color: "#d97706" },
    requested: { label: "대기", className: "webr-pipeline-status-pending", color: "#d97706" },
    skipped: { label: "건너뜀", className: "webr-pipeline-status-skipped", color: "#64748b" },
    neutral: { label: "완료", className: "webr-pipeline-status-success", color: "#059669" },
    unknown: { label: "미확인", className: "webr-pipeline-status-pending", color: "#d97706" }
  };

  function statusMeta(status) {
    return STATUS_META[String(status || "").toLowerCase()] || STATUS_META.unknown;
  }

  function formatNumber(value) {
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString("ko-KR");
  }

  function formatDuration(seconds) {
    const sec = Number(seconds || 0);
    if (!Number.isFinite(sec) || sec <= 0) return "-";
    const minutes = Math.floor(sec / 60);
    const rest = Math.floor(sec % 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const min = minutes % 60;
      return hours + "시간 " + min + "분";
    }
    return minutes ? minutes + "분 " + rest + "초" : rest + "초";
  }

  function shortSha(value) {
    const text = String(value || "");
    return text.length > 10 ? text.slice(0, 10) : text;
  }

  function compactTime(value) {
    const text = String(value || "").trim();
    const match = text.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?/);
    if (match) return match[1].slice(5) + " " + match[2];
    return text || "-";
  }

  function stepWindow(steps) {
    const rows = Array.isArray(steps) ? steps : [];
    const started = rows.map(function (step) { return step.started_at || ""; }).find(Boolean) || "";
    const completed = rows.slice().reverse().map(function (step) { return step.completed_at || ""; }).find(Boolean) || "";
    if (started && completed) return compactTime(started) + " -> " + compactTime(completed);
    if (started) return compactTime(started) + " 시작";
    if (completed) return compactTime(completed) + " 완료";
    return "";
  }

  function installStyle() {
    if (document.getElementById("webr-admin-pipelines-style-20260529")) return;
    const style = document.createElement("style");
    style.id = "webr-admin-pipelines-style-20260529";
    style.textContent = [
      "#div_main .webr-admin-pipeline-shell.webr-admin-shell{display:grid!important;grid-template-columns:260px minmax(0,1fr)!important;align-items:start!important;gap:18px!important;max-width:none!important;width:100%!important;margin:0!important;padding:24px 32px!important;background:#f8fafc;color:#0f172a;}",
      "#div_main .webr-admin-pipeline-shell>.webr-admin-menu{grid-column:1/2!important;max-width:260px!important;width:260px!important;min-width:0!important;position:sticky!important;top:86px!important;align-self:start!important;}",
      "#div_main .webr-admin-pipeline-shell>.webr-pipeline-main{grid-column:2/3!important;display:grid!important;gap:14px!important;min-width:0!important;width:100%!important;max-width:none!important;}",
      "#div_main .webr-admin-pipeline-shell .webr-admin-menu-list{display:flex!important;flex-direction:column!important;gap:8px!important;width:100%!important;}",
      "#div_main .webr-admin-pipeline-shell .webr-admin-accordion{width:100%!important;}",
      "#div_main .webr-admin-pipeline-shell .webr-admin-tab{width:100%!important;margin:0!important;}",
      "#div_main .webr-pipeline-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:16px 18px;}",
      "#div_main .webr-pipeline-title{margin:0;color:#0f172a;font-size:1.18rem;font-weight:850;letter-spacing:0;line-height:1.2;}",
      "#div_main .webr-pipeline-subtitle{margin:4px 0 0;color:#64748b;font-size:.78rem;line-height:1.35;}",
      "#div_main .webr-pipeline-refresh{display:inline-flex;align-items:center;justify-content:center;min-height:38px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:0 14px;color:#0f172a;font-size:.83rem;font-weight:800;}",
      "#div_main .webr-pipeline-refresh:hover{background:#f8fafc;}",
      "#div_main .webr-pipeline-segments{display:flex;flex-wrap:wrap;gap:6px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;padding:6px;}",
      "#div_main .webr-pipeline-segment{min-height:34px;border:0;border-radius:6px;background:transparent;padding:0 12px;color:#475569;font-size:.8rem;font-weight:800;}",
      "#div_main .webr-pipeline-segment-active{background:#0f172a;color:#fff;box-shadow:0 1px 2px rgba(15,23,42,.1);}",
      "#div_main .webr-pipeline-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;}",
      "#div_main .webr-pipeline-kpi{border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:8px;background:#fff;padding:14px;min-width:0;}",
      "#div_main .webr-pipeline-kpi:nth-child(2){border-left-color:#059669;}#div_main .webr-pipeline-kpi:nth-child(3){border-left-color:#d97706;}#div_main .webr-pipeline-kpi:nth-child(4){border-left-color:#dc2626;}",
      "#div_main .webr-pipeline-kpi-label{color:#64748b;font-size:.76rem;font-weight:800;line-height:1.2;}",
      "#div_main .webr-pipeline-kpi-value{margin-top:5px;color:#020617;font-size:1.45rem;font-weight:900;letter-spacing:0;line-height:1;}",
      "#div_main .webr-pipeline-grid{display:grid;grid-template-columns:minmax(560px,1.34fr) minmax(360px,.66fr);gap:14px;}",
      "#div_main .webr-pipeline-panel{border:1px solid #e2e8f0;border-radius:8px;background:#fff;min-width:0;padding:16px;}",
      "#div_main .webr-pipeline-panel-title{margin:0 0 12px;color:#0f172a;font-size:1rem;font-weight:850;letter-spacing:0;line-height:1.2;}",
      "#div_main .webr-pipeline-list{display:grid;gap:10px;}",
      "#div_main .webr-pipeline-run{border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:12px;min-width:0;}",
      "#div_main .webr-pipeline-run-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0;}",
      "#div_main .webr-pipeline-run-name{margin:0;color:#0f172a;font-size:.88rem;font-weight:850;line-height:1.25;word-break:keep-all;}",
      "#div_main .webr-pipeline-run-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;color:#64748b;font-size:.74rem;line-height:1.25;}",
      "#div_main .webr-pipeline-badge{display:inline-flex;align-items:center;justify-content:center;min-height:24px;border-radius:999px;padding:0 9px;font-size:.72rem;font-weight:850;white-space:nowrap;}",
      "#div_main .webr-pipeline-status-success{background:#dcfce7;color:#166534;}#div_main .webr-pipeline-status-failed{background:#fee2e2;color:#991b1b;}#div_main .webr-pipeline-status-running{background:#dbeafe;color:#1d4ed8;}#div_main .webr-pipeline-status-pending{background:#fef3c7;color:#92400e;}#div_main .webr-pipeline-status-skipped{background:#f1f5f9;color:#475569;}",
      "#div_main .webr-pipeline-dag{display:grid;gap:8px;margin-top:12px;}",
      "#div_main .webr-pipeline-stage-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px;}",
      "#div_main .webr-pipeline-stage{position:relative;min-height:72px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;padding:9px;}",
      "#div_main .webr-pipeline-stage:before{content:\"\";position:absolute;left:9px;top:9px;width:8px;height:8px;border-radius:999px;background:#94a3b8;}",
      "#div_main .webr-pipeline-stage-success:before{background:#059669;}#div_main .webr-pipeline-stage-failed:before{background:#dc2626;}#div_main .webr-pipeline-stage-running:before{background:#2563eb;}#div_main .webr-pipeline-stage-pending:before{background:#d97706;}#div_main .webr-pipeline-stage-skipped:before{background:#64748b;}",
      "#div_main .webr-pipeline-stage-label{padding-left:15px;color:#0f172a;font-size:.78rem;font-weight:850;line-height:1.2;word-break:keep-all;}",
      "#div_main .webr-pipeline-stage-sub{margin-top:8px;color:#64748b;font-size:.7rem;line-height:1.25;}",
      "#div_main .webr-pipeline-stage-time{margin-top:5px;color:#334155;font-size:.7rem;font-weight:750;line-height:1.25;}",
      "#div_main .webr-pipeline-chart{height:320px;width:100%;}",
      "#div_main .webr-pipeline-table-wrap{overflow:auto;border:1px solid #e2e8f0;border-radius:8px;}",
      "#div_main .webr-pipeline-table{width:100%;border-collapse:collapse;min-width:760px;}",
      "#div_main .webr-pipeline-table th{background:#f8fafc;color:#475569;font-size:.74rem;font-weight:850;text-align:left;padding:11px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap;}",
      "#div_main .webr-pipeline-table td{color:#0f172a;font-size:.78rem;line-height:1.35;padding:11px 12px;border-bottom:1px solid #f1f5f9;vertical-align:top;}",
      "#div_main .webr-pipeline-output-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:10px;}",
      "#div_main .webr-pipeline-output{border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:11px;min-width:0;}",
      "#div_main .webr-pipeline-output-title{display:block;color:#0f172a;font-size:.82rem;font-weight:850;line-height:1.32;text-decoration:none;word-break:keep-all;}",
      "#div_main .webr-pipeline-output-title:hover{color:#2563eb;}",
      "#div_main .webr-pipeline-output-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;color:#64748b;font-size:.72rem;line-height:1.25;}",
      "#div_main .webr-pipeline-empty{display:flex;min-height:96px;align-items:center;justify-content:center;border:1px dashed #cbd5e1;border-radius:8px;background:#f8fafc;color:#64748b;font-size:.8rem;font-weight:700;text-align:center;}",
      "@keyframes webrPipelineSkeletonPulse{0%,100%{opacity:1;}50%{opacity:.48;}}",
      "#div_main .webr-pipeline-skeleton{display:grid;gap:14px;min-width:0;}",
      "#div_main .webr-pipeline-skel-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:16px 18px;}",
      "#div_main .webr-pipeline-skel-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;}",
      "#div_main .webr-pipeline-skel-grid{display:grid;grid-template-columns:minmax(560px,1.34fr) minmax(360px,.66fr);gap:14px;}",
      "#div_main .webr-pipeline-skel-line,#div_main .webr-pipeline-skel-card,#div_main .webr-pipeline-skel-panel{animation:webrPipelineSkeletonPulse 1.45s ease-in-out infinite;background:#e5e7eb;box-shadow:none;}",
      "#div_main .webr-pipeline-skel-line{height:14px;border-radius:999px;margin:10px 0;}",
      "#div_main .webr-pipeline-skel-card{height:92px;border-radius:8px;}",
      "#div_main .webr-pipeline-skel-panel{height:260px;border-radius:8px;}",
      "@media (max-width:1180px){#div_main .webr-pipeline-grid{grid-template-columns:1fr;}#div_main .webr-pipeline-kpis{grid-template-columns:repeat(2,minmax(0,1fr));}}",
      "@media (max-width:1180px){#div_main .webr-pipeline-skel-grid{grid-template-columns:1fr;}#div_main .webr-pipeline-skel-kpis{grid-template-columns:repeat(2,minmax(0,1fr));}}",
      "@media (max-width:900px){#div_main .webr-admin-pipeline-shell.webr-admin-shell{grid-template-columns:1fr!important;padding:16px!important;}#div_main .webr-admin-pipeline-shell>.webr-admin-menu,#div_main .webr-admin-pipeline-shell>.webr-pipeline-main{grid-column:1/2!important;width:100%!important;max-width:none!important;position:static!important;}#div_main .webr-pipeline-toolbar,#div_main .webr-pipeline-skel-toolbar{align-items:stretch;flex-direction:column;}#div_main .webr-pipeline-refresh{width:100%;}}",
      "@media (max-width:640px){#div_main .webr-pipeline-kpis,#div_main .webr-pipeline-skel-kpis{grid-template-columns:1fr;}#div_main .webr-pipeline-output-grid{grid-template-columns:1fr;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function FallbackMenu() {
    const date = new Date();
    const items = [
      ["첫 화면", "/admin/"],
      ["활성 사용자", "/admin/active_users/"],
      ["Web-R 접속 현황", "/admin/webr/"],
      ["방문 현황", "/admin/visitors/"],
      ["회원 현황", "/admin/members/"],
      ["결제 현황", "/admin/payments/"],
      ["정산액 조회", "/admin/balance_account/" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/"],
      ["데이터 파이프라인", "/admin/pipelines/"]
    ];
    return h("nav", { className: "webr-admin-menu" },
      h("div", { className: "webr-admin-menu-list" }, items.map(function (item) {
        return h("button", { key: item[1], type: "button", className: "webr-admin-tab" + (item[1] === "/admin/pipelines/" ? " webr-admin-tab-active" : ""), onClick: function () { location.href = item[1]; } }, item[0]);
      }))
    );
  }

  function AdminMenu() {
    const Menu = window.Div_operation_menu || window.WebRAdminOperationMenu || FallbackMenu;
    return h(Menu, null);
  }

  function StatusBadge(props) {
    const meta = statusMeta(props.status);
    return h("span", { className: "webr-pipeline-badge " + meta.className }, props.label || meta.label);
  }

  function Kpi(props) {
    return h("div", { className: "webr-pipeline-kpi" },
      h("div", { className: "webr-pipeline-kpi-label" }, props.label),
      h("div", { className: "webr-pipeline-kpi-value" }, props.value),
      props.sub ? h("div", { className: "webr-pipeline-subtitle" }, props.sub) : null
    );
  }

  function Segments(props) {
    return h("div", { className: "webr-pipeline-segments" }, props.items.map(function (item) {
      const active = props.value === item.key;
      return h("button", {
        key: item.key,
        type: "button",
        className: "webr-pipeline-segment" + (active ? " webr-pipeline-segment-active" : ""),
        onClick: function () { props.onChange(item.key); }
      }, item.label);
    }));
  }

  function StageGrid(props) {
    const stages = props.stages || [];
    if (!stages.length) {
      return h("div", { className: "webr-pipeline-empty" }, "단계 정보를 불러오지 못했습니다.");
    }
    return h("div", { className: "webr-pipeline-dag" },
      h("div", { className: "webr-pipeline-stage-row" }, stages.map(function (stage) {
        const meta = statusMeta(stage.status);
        const steps = Array.isArray(stage.steps) ? stage.steps : [];
        const duration = steps.reduce(function (sum, step) { return sum + Number(step.duration_seconds || 0); }, 0);
        const windowText = stepWindow(steps);
        return h("div", { key: stage.key, className: "webr-pipeline-stage " + meta.className.replace("status", "stage") },
          h("div", { className: "webr-pipeline-stage-label" }, stage.label),
          h("div", { className: "webr-pipeline-stage-sub" }, meta.label, steps.length ? " · " + steps.length + " step" : "", duration ? " · " + formatDuration(duration) : ""),
          windowText ? h("div", { className: "webr-pipeline-stage-time" }, windowText) : null
        );
      }))
    );
  }

  function PipelineRun(props) {
    const pipeline = props.pipeline;
    return h("article", { className: "webr-pipeline-run" },
      h("div", { className: "webr-pipeline-run-head" },
        h("div", { style: { minWidth: 0 } },
          h("h3", { className: "webr-pipeline-run-name" }, pipeline.label),
          h("div", { className: "webr-pipeline-run-meta" },
            h("span", null, pipeline.repo_label),
            h("span", null, "#" + (pipeline.run_number || "-")),
            h("span", null, compactTime(pipeline.started_at || pipeline.created_at)),
            pipeline.duration_seconds ? h("span", null, formatDuration(pipeline.duration_seconds)) : null,
            pipeline.head_sha ? h("span", null, shortSha(pipeline.head_sha)) : null
          )
        ),
        h(StatusBadge, { status: pipeline.status })
      ),
      h(StageGrid, { stages: pipeline.stages || [] }),
      pipeline.run_url ? h("div", { className: "webr-pipeline-run-meta" },
        h("a", { href: pipeline.run_url, target: "_blank", rel: "noopener noreferrer", className: "text-blue-700 font-bold" }, "GitHub Actions")
      ) : null
    );
  }

  function DurationChart(props) {
    React.useEffect(function () {
      const node = document.getElementById("webr-pipeline-duration-chart");
      if (!node || !window.echarts) return undefined;
      const chart = window.echarts.init(node);
      const rows = (props.runs || []).slice(0, 12).reverse();
      chart.setOption({
        grid: { left: 52, right: 24, top: 28, bottom: 78 },
        tooltip: {
          trigger: "axis",
          formatter: function (items) {
            const item = items && items[0] ? items[0] : {};
            const row = rows[item.dataIndex] || {};
            return [
              row.pipeline_label || "",
              "Run #" + (row.run_number || "-"),
              statusMeta(row.status).label,
              formatDuration(row.duration_seconds)
            ].join("<br/>");
          }
        },
        xAxis: {
          type: "category",
          data: rows.map(function (row) { return row.repo_label.replace("Statground_Data_", "") + " #" + row.run_number; }),
          axisLabel: { interval: 0, rotate: 30, color: "#475569", fontSize: 11 }
        },
        yAxis: {
          type: "value",
          name: "분",
          axisLabel: { color: "#475569", formatter: function (value) { return Math.round(value / 60); } },
          splitLine: { lineStyle: { color: "#e2e8f0" } }
        },
        series: [{
          type: "bar",
          data: rows.map(function (row) { return Number(row.duration_seconds || 0); }),
          barMaxWidth: 34,
          itemStyle: {
            color: function (params) {
              return statusMeta((rows[params.dataIndex] || {}).status).color;
            },
            borderRadius: [6, 6, 0, 0]
          }
        }]
      });
      function resize() { chart.resize(); }
      window.addEventListener("resize", resize);
      return function () {
        window.removeEventListener("resize", resize);
        chart.dispose();
      };
    }, [props.runs]);
    return h("div", { id: "webr-pipeline-duration-chart", className: "webr-pipeline-chart" });
  }

  function SourceTable(props) {
    const rows = props.rows || [];
    if (!rows.length) return h("div", { className: "webr-pipeline-empty" }, props.empty || "표시할 출처가 없습니다.");
    return h("div", { className: "webr-pipeline-table-wrap" },
      h("table", { className: "webr-pipeline-table" },
        h("thead", null, h("tr", null, props.columns.map(function (column) {
          return h("th", { key: column.key }, column.label);
        }))),
        h("tbody", null, rows.map(function (row, index) {
          return h("tr", { key: index }, props.columns.map(function (column) {
            return h("td", { key: column.key }, column.render ? column.render(row) : String(row[column.key] || "-"));
          }));
        }))
      )
    );
  }

  function OutputCard(props) {
    const item = props.item || {};
    const title = item.title || item.source_name || item.isbn || item.release_scope || "제목 없음";
    const href = item.url || item.canonical_url || item.link || item.base_url || "";
    const body = h(React.Fragment, null,
      href ? h("a", { className: "webr-pipeline-output-title", href: href, target: href.indexOf("http") === 0 ? "_blank" : undefined, rel: href.indexOf("http") === 0 ? "noopener noreferrer" : undefined }, title) : h("span", { className: "webr-pipeline-output-title" }, title),
      h("div", { className: "webr-pipeline-output-meta" }, props.meta(item).map(function (value, index) {
        return value ? h("span", { key: index }, value) : null;
      }))
    );
    return h("article", { className: "webr-pipeline-output" }, body);
  }

  function OutputSection(props) {
    const rows = props.rows || [];
    return h("section", { className: "webr-pipeline-panel" },
      h("h3", { className: "webr-pipeline-panel-title" }, props.title),
      rows.length ? h("div", { className: "webr-pipeline-output-grid" }, rows.slice(0, props.limit || 12).map(function (item, index) {
        return h(OutputCard, { key: index, item: item, meta: props.meta });
      })) : h("div", { className: "webr-pipeline-empty" }, "표시할 결과물이 없습니다.")
    );
  }

  function SourcesView(props) {
    const groups = props.data.source_groups || {};
    const rRows = groups.r_project || [];
    const bookRows = groups.naver_book || [];
    const cdnRows = groups.cdn_release || [];
    return h("div", { className: "webr-pipeline-list" },
      h("section", { className: "webr-pipeline-panel" },
        h("h3", { className: "webr-pipeline-panel-title" }, "R Project 출처"),
        h(SourceTable, {
          rows: rRows,
          columns: [
            { key: "source_name", label: "출처", render: function (row) { return row.source_name || row.source_id || "-"; } },
            { key: "source_type", label: "유형" },
            { key: "platform", label: "플랫폼" },
            { key: "item_count", label: "누적", render: function (row) { return formatNumber(row.item_count); } },
            { key: "item_count_24h", label: "24시간", render: function (row) { return formatNumber(row.item_count_24h); } },
            { key: "latest_ingested_at", label: "최근 반영" }
          ]
        })
      ),
      h("section", { className: "webr-pipeline-panel" },
        h("h3", { className: "webr-pipeline-panel-title" }, "NAVER Book 출처"),
        h(SourceTable, {
          rows: bookRows,
          columns: [
            { key: "search_mode", label: "모드" },
            { key: "search_query", label: "검색어" },
            { key: "search_sort", label: "정렬" },
            { key: "fetched_count", label: "확인", render: function (row) { return formatNumber(row.fetched_count); } },
            { key: "error_count", label: "오류", render: function (row) { return formatNumber(row.error_count); } },
            { key: "latest_ingested_at", label: "최근 반영" }
          ]
        })
      ),
      h("section", { className: "webr-pipeline-panel" },
        h("h3", { className: "webr-pipeline-panel-title" }, "CDN release"),
        h(SourceTable, {
          rows: cdnRows,
          columns: [
            { key: "release_scope", label: "scope" },
            { key: "cdn_repo", label: "repo" },
            { key: "item_count", label: "items", render: function (row) { return formatNumber(row.item_count); } },
            { key: "commit_sha", label: "commit", render: function (row) { return shortSha(row.commit_sha); } },
            { key: "published_at", label: "게시" }
          ]
        })
      )
    );
  }

  function OutputsView(props) {
    const outputs = props.data.outputs || {};
    return h("div", { className: "webr-pipeline-list" },
      h(OutputSection, { title: "R ecosystem 게시물", rows: outputs.r_posts || [], meta: function (item) { return [item.source_name, item.source_type, item.ingested_at]; } }),
      h(OutputSection, { title: "커뮤니티 요약", rows: outputs.digests || [], meta: function (item) { return [item.source_name, "items " + formatNumber(item.item_count), item.updated_at]; } }),
      h(OutputSection, { title: "Web-R Notebook", rows: outputs.notebooks || [], meta: function (item) { return [item.created_at, item.share ? "공개" : "비공개"]; } }),
      h(OutputSection, { title: "NAVER 확인 도서", rows: outputs.naver_books || [], meta: function (item) { return [item.author, item.publisher, item.search_mode, item.updated_at]; } }),
      h(OutputSection, { title: "Web-R R 도서 카탈로그", rows: outputs.r_book_catalog || [], meta: function (item) { return [item.author, item.publisher, item.source_kind, item.source_ingested_at]; } }),
      h(OutputSection, { title: "CDN 배치 결과", rows: outputs.cdn_releases || [], meta: function (item) { return [item.cdn_repo, shortSha(item.commit_sha), "items " + formatNumber(item.item_count), item.published_at]; } })
    );
  }

  function Overview(props) {
    const data = props.data;
    const pipelines = data.pipelines || [];
    return h("div", { className: "webr-pipeline-grid" },
      h("section", { className: "webr-pipeline-panel" },
        h("h2", { className: "webr-pipeline-panel-title" }, "Pipeline DAG"),
        h("div", { className: "webr-pipeline-list" }, pipelines.map(function (pipeline) {
          return h(PipelineRun, { key: pipeline.key, pipeline: pipeline });
        }))
      ),
      h("section", { className: "webr-pipeline-panel" },
        h("h2", { className: "webr-pipeline-panel-title" }, "최근 실행 시간"),
        h(DurationChart, { runs: data.recent_runs || [] }),
        h(SourceTable, {
          rows: (data.recent_runs || []).slice(0, 8),
          empty: "최근 실행 이력이 없습니다.",
          columns: [
            { key: "pipeline_label", label: "workflow" },
            { key: "status", label: "상태", render: function (row) { return h(StatusBadge, { status: row.status }); } },
            { key: "duration_seconds", label: "시간", render: function (row) { return formatDuration(row.duration_seconds); } },
            { key: "started_at", label: "시작", render: function (row) { return compactTime(row.started_at); } },
            { key: "updated_at", label: "종료", render: function (row) { return compactTime(row.updated_at); } }
          ]
        })
      )
    );
  }

  function HistoryView(props) {
    const rows = props.data.recent_runs || [];
    const byPipeline = {};
    rows.forEach(function (row) {
      const key = row.pipeline_key || row.pipeline_label || "unknown";
      if (!byPipeline[key]) byPipeline[key] = [];
      byPipeline[key].push(row);
    });
    const pipelineOrder = (props.data.pipelines || []).map(function (pipeline) { return pipeline.key; });
    Object.keys(byPipeline).forEach(function (key) {
      if (pipelineOrder.indexOf(key) < 0) pipelineOrder.push(key);
    });
    if (!rows.length) {
      return h("section", { className: "webr-pipeline-panel" },
        h("h2", { className: "webr-pipeline-panel-title" }, "이전 실행 이력"),
        h("div", { className: "webr-pipeline-empty" }, "최근 실행 이력이 없습니다.")
      );
    }
    return h("div", { className: "webr-pipeline-list" }, pipelineOrder.map(function (key) {
      const group = byPipeline[key] || [];
      if (!group.length) return null;
      const first = group[0] || {};
      return h("section", { key: key, className: "webr-pipeline-panel" },
        h("h2", { className: "webr-pipeline-panel-title" }, first.pipeline_label || key),
        h(SourceTable, {
          rows: group,
          columns: [
            { key: "status", label: "상태", render: function (row) { return h(StatusBadge, { status: row.status }); } },
            { key: "run_number", label: "run", render: function (row) {
              const label = "#" + (row.run_number || "-");
              return row.run_url ? h("a", { href: row.run_url, target: "_blank", rel: "noopener noreferrer", className: "text-blue-700 font-bold" }, label) : label;
            } },
            { key: "event", label: "event" },
            { key: "started_at", label: "시작", render: function (row) { return compactTime(row.started_at); } },
            { key: "updated_at", label: "종료/갱신", render: function (row) { return compactTime(row.updated_at); } },
            { key: "duration_seconds", label: "소요", render: function (row) { return formatDuration(row.duration_seconds); } },
            { key: "repo_label", label: "repo" }
          ]
        })
      );
    }));
  }

  function LoadingView() {
    return h("div", { className: "webr-admin-shell webr-admin-pipeline-shell" },
      h(AdminMenu, null),
      h("main", { className: "webr-pipeline-main" },
        h("div", { className: "webr-pipeline-skeleton", role: "status", "aria-label": "데이터 파이프라인을 불러오고 있습니다." },
          h("div", { className: "webr-pipeline-skel-toolbar" },
            h("div", { className: "webr-pipeline-skel-line", style: { margin: 0, width: "28%" } }),
            h("div", { className: "webr-pipeline-skel-line", style: { margin: 0, width: "96px" } })
          ),
          h("div", { className: "webr-pipeline-skel-kpis" },
            Array.from({ length: 4 }).map(function (_, idx) {
              return h("div", { key: idx, className: "webr-pipeline-skel-card" });
            })
          ),
          h("div", { className: "webr-pipeline-skel-grid" },
            h("div", { className: "webr-pipeline-skel-panel" }),
            h("div", { className: "webr-pipeline-skel-panel" })
          ),
          h("div", { className: "webr-pipeline-skel-panel", style: { height: "180px" } })
        )
      )
    );
  }

  function AdminPipelinesApp() {
    const [data, setData] = React.useState(null);
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [tab, setTab] = React.useState("overview");

    const load = React.useCallback(function () {
      setLoading(true);
      setError("");
      fetch("/admin/ajax_get_admin_pipelines/", { method: "POST", credentials: "same-origin" })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (!json || json.ok === false) throw new Error("load_failed");
          setData(json);
        })
        .catch(function () {
          setError("파이프라인 현황을 불러오지 못했습니다.");
        })
        .finally(function () {
          setLoading(false);
        });
    }, []);

    React.useEffect(function () {
      load();
    }, [load]);

    if (loading && !data) return h(LoadingView, null);
    const summary = data && data.summary ? data.summary : {};
    const sourceLabel = data && data.snapshot_source === "cdn2" ? "CDN2 snapshot" : "live";
    return h("div", { className: "webr-admin-shell webr-admin-pipeline-shell" },
      h(AdminMenu, null),
      h("main", { className: "webr-pipeline-main" },
        h("header", { className: "webr-pipeline-toolbar" },
          h("div", null,
            h("h1", { className: "webr-pipeline-title" }, "데이터 파이프라인"),
            h("p", { className: "webr-pipeline-subtitle" }, data ? "마지막 갱신 " + (data.generated_at || "-") + " · " + sourceLabel : "")
          ),
          h("button", { type: "button", className: "webr-pipeline-refresh", onClick: load, disabled: loading }, loading ? "갱신 중" : "새로고침")
        ),
        error ? h("div", { className: "webr-pipeline-empty" }, error) : null,
        h("section", { className: "webr-pipeline-kpis" },
          h(Kpi, { label: "Pipeline", value: formatNumber(summary.pipeline_count) }),
          h(Kpi, { label: "성공", value: formatNumber(summary.success_count) }),
          h(Kpi, { label: "진행중", value: formatNumber(summary.running_count) }),
          h(Kpi, { label: "실패/확인", value: formatNumber(Number(summary.failed_count || 0) + Number(summary.unknown_count || 0)), sub: summary.warning_count ? "partial " + summary.warning_count : "" })
        ),
        h(Segments, {
          value: tab,
          onChange: setTab,
          items: [
            { key: "overview", label: "전체" },
            { key: "sources", label: "출처" },
            { key: "outputs", label: "결과물" },
            { key: "history", label: "이력" }
          ]
        }),
        data ? (tab === "sources" ? h(SourcesView, { data: data }) : tab === "outputs" ? h(OutputsView, { data: data }) : tab === "history" ? h(HistoryView, { data: data }) : h(Overview, { data: data })) : null
      )
    );
  }

  function DivCheckAdmin() {
    return h("div", { className: "min-h-[60vh] w-full px-6 py-8 flex items-center justify-center" },
      h("div", { className: "flex flex-col justify-center items-center w-full space-y-4 text-center" },
        h("div", { className: "h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" }),
        h("p", null, "관리자 여부를 확인하고 있습니다.")
      )
    );
  }

  function DivStop() {
    return h("div", { className: "max-w-screen-xl px-6 py-8 mx-auto space-y-4" },
      h("div", { className: "flex flex-col justify-center items-center w-full space-y-4" },
        h("p", null, "관리자를 위한 메뉴입니다."),
        h("a", { href: "/", className: "text-gray-900 text-center bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 w-[150px] focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100" }, "첫 화면으로")
      )
    );
  }

  window.set_main = async function set_main() {
    installStyle();
    const username = window.gv_username || "";
    if (!username) {
      location.href = "/";
      return;
    }
    const mount = document.getElementById("div_main");
    ReactDOM.render(h(DivCheckAdmin, null), mount);
    try {
      const headerData = await fetch("/ajax_get_menu_header/", { method: "POST", credentials: "same-origin" }).then(function (res) { return res.json(); });
      const role = headerData && headerData.role ? headerData.role : "";
      window.gv_role = role;
      if (role === "관리자") {
        ReactDOM.render(h(AdminPipelinesApp, null), mount);
      } else {
        ReactDOM.render(h(DivStop, null), mount);
      }
    } catch (error) {
      mount.innerHTML = '<div class="text-center text-gray-500 py-10">관리자 여부를 확인하는 중 오류가 발생했습니다.</div>';
    }
  };
})();
