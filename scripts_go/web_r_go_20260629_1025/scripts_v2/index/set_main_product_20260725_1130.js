(function installWebRProductHome202607251130(window, document) {
  "use strict";

  if (window.__webrProductHome202607251130Installed) {
    return;
  }
  window.__webrProductHome202607251130Installed = true;

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const h = React.createElement;
  const primaryButtonClass = "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 min-[520px]:w-auto";
  const secondaryButtonClass = "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-extrabold text-slate-800 transition hover:border-blue-300 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 min-[520px]:w-auto";
  const textLinkClass = "inline-flex min-h-[44px] items-center rounded-lg px-2 py-2 font-bold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300";

  const fallbackROCResult = {
    sample_id: "demo_v1",
    observation_count: 16,
    positive_count: 8,
    negative_count: 8,
    auc: 0.828125,
    optimal_threshold: 0.67,
    sensitivity: 0.625,
    specificity: 0.875,
    interpretation: "이 내장 샘플에서는 두 집단을 잘 구분합니다.",
    points: [
      { false_positive_rate: 0, sensitivity: 0 },
      { false_positive_rate: 0, sensitivity: 0.125 },
      { false_positive_rate: 0, sensitivity: 0.25 },
      { false_positive_rate: 0, sensitivity: 0.375 },
      { false_positive_rate: 0.125, sensitivity: 0.375 },
      { false_positive_rate: 0.125, sensitivity: 0.5 },
      { false_positive_rate: 0.125, sensitivity: 0.625 },
      { false_positive_rate: 0.25, sensitivity: 0.625 },
      { false_positive_rate: 0.25, sensitivity: 0.75 },
      { false_positive_rate: 0.375, sensitivity: 0.75 },
      { false_positive_rate: 0.375, sensitivity: 0.875 },
      { false_positive_rate: 0.5, sensitivity: 0.875 },
      { false_positive_rate: 0.5, sensitivity: 1 },
      { false_positive_rate: 0.625, sensitivity: 1 },
      { false_positive_rate: 0.75, sensitivity: 1 },
      { false_positive_rate: 0.875, sensitivity: 1 },
      { false_positive_rate: 1, sensitivity: 1 }
    ]
  };

  const analysisTools = [
    {
      name: "ROC 분석",
      description: "AUC, 민감도, 특이도와 최적 임계값을 곡선과 표로 확인합니다.",
      href: "/webr/roc-analysis/",
      badge: "샘플 체험",
      tone: "blue"
    },
    {
      name: "생존분석",
      description: "시간-사건 자료의 생존곡선과 군 간 차이를 분석합니다.",
      href: "/webr/survival-psm/",
      badge: "Web-R 2.0",
      tone: "emerald"
    },
    {
      name: "성향점수 매칭",
      description: "관찰 자료의 공변량 균형을 점검하고 매칭 결과를 비교합니다.",
      href: "/webr/propensity-score-matching/",
      badge: "Web-R 2.0",
      tone: "violet"
    },
    {
      name: "메타분석",
      description: "여러 연구의 효과크기와 이질성을 한 화면에서 검토합니다.",
      href: "/webr/meta-analysis/",
      badge: "Web-R 2.0",
      tone: "cyan"
    },
    {
      name: "조건부 과정 분석",
      description: "매개·조절 효과가 포함된 연구 가설을 단계별로 분석합니다.",
      href: "/webr/conditional-process/",
      badge: "Web-R 2.0",
      tone: "amber"
    },
    {
      name: "표본수 계산",
      description: "연구 설계에 필요한 표본수와 검정력 조건을 확인합니다.",
      href: "/webr/sample-size/",
      badge: "Web-R 2.0",
      tone: "rose"
    }
  ];

  const productRoles = [
    {
      title: "Web-R 2.0",
      eyebrow: "권장 분석 제품",
      description: "브라우저에서 분석을 시작하고 결과를 확인하는 기본 경로입니다.",
      href: "/webr/2.0/",
      link: "분석 도구 전체 보기"
    },
    {
      title: "Web-R Classic",
      eyebrow: "기존 기능",
      description: "기존 분석 앱을 계속 사용해야 하는 사용자를 위한 호환 경로입니다.",
      href: "/webr/",
      link: "Classic 열기"
    },
    {
      title: "정회원 서버",
      eyebrow: "회원 전용 환경",
      description: "현재 이용 권한에 따라 제공되는 정회원용 분석 서버입니다.",
      href: "/webr/member/",
      link: "정회원 서버 확인"
    },
    {
      title: "Web-R Notebook",
      eyebrow: "코드 기반 작업",
      description: "R 코드를 직접 실행하고 분석 과정을 기록하는 작업 공간입니다.",
      href: "/webr/notebook/",
      link: "Notebook 열기"
    }
  ];

  const faqs = [
    {
      question: "설치해야 할 프로그램이 있나요?",
      answer: "샘플 ROC 분석은 설치와 로그인 없이 브라우저에서 바로 실행됩니다. 정식 도구별 요구 사항은 각 분석 화면에서 안내합니다."
    },
    {
      question: "샘플 체험에서 제 데이터가 전송되나요?",
      answer: "아닙니다. 공개 체험은 Web-R에 포함된 고정 샘플만 서버에서 계산하며 파일 업로드를 받지 않습니다."
    },
    {
      question: "무료와 정회원 기능은 어떻게 다른가요?",
      answer: "무료 사용자는 공개 샘플과 결과 미리보기를 사용할 수 있습니다. 프로젝트 저장, 다시 열기와 결과 내보내기는 로그인 및 이용 권한에 따라 제공됩니다."
    },
    {
      question: "기존 Web-R 기능은 없어졌나요?",
      answer: "아닙니다. Web-R 2.0을 권장 경로로 안내하되 Classic, 정회원 서버와 Notebook 링크를 함께 유지합니다."
    }
  ];

  function formatNumber(value, digits) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "—";
    }
    return number.toFixed(digits);
  }

  function toneClasses(tone) {
    const classes = {
      blue: "bg-blue-50 text-blue-700 ring-blue-100",
      emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      violet: "bg-violet-50 text-violet-700 ring-violet-100",
      cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
      amber: "bg-amber-50 text-amber-800 ring-amber-100",
      rose: "bg-rose-50 text-rose-700 ring-rose-100"
    };
    return classes[tone] || classes.blue;
  }

  function SectionHeading(props) {
    return h("div", { className: "max-w-3xl" },
      props.eyebrow ? h("p", { className: "mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700" }, props.eyebrow) : null,
      h("h2", { id: props.id, className: "text-2xl font-black tracking-tight text-slate-950 min-[768px]:text-3xl" }, props.title),
      props.description ? h("p", { className: "mt-3 text-sm leading-7 text-slate-600 min-[768px]:text-base" }, props.description) : null
    );
  }

  function ROCChart(props) {
    const result = props.result || fallbackROCResult;
    const points = Array.isArray(result.points) && result.points.length ? result.points : fallbackROCResult.points;
    const polyline = points.map(function pointToCoordinate(point) {
      const fpr = Math.min(1, Math.max(0, Number(point.false_positive_rate) || 0));
      const sensitivity = Math.min(1, Math.max(0, Number(point.sensitivity) || 0));
      return (42 + fpr * 276).toFixed(1) + "," + (278 - sensitivity * 236).toFixed(1);
    }).join(" ");

    return h("svg", {
      viewBox: "0 0 360 320",
      role: "img",
      "aria-labelledby": "webr-home-roc-title webr-home-roc-description",
      className: "h-auto w-full"
    },
    h("title", { id: "webr-home-roc-title" }, "내장 샘플 ROC 곡선"),
    h("desc", { id: "webr-home-roc-description" },
      "서버에서 계산한 내장 샘플의 ROC 곡선입니다. AUC는 " + formatNumber(result.auc, 3) +
      ", 최적 임계값은 " + formatNumber(result.optimal_threshold, 2) + "입니다."
    ),
    h("rect", { x: "0", y: "0", width: "360", height: "320", rx: "18", fill: "#f8fafc" }),
    h("line", { x1: "42", y1: "278", x2: "318", y2: "278", stroke: "#94a3b8", strokeWidth: "1.5" }),
    h("line", { x1: "42", y1: "278", x2: "42", y2: "42", stroke: "#94a3b8", strokeWidth: "1.5" }),
    h("line", { x1: "42", y1: "278", x2: "318", y2: "42", stroke: "#cbd5e1", strokeWidth: "2", strokeDasharray: "7 7" }),
    h("polyline", {
      points: polyline,
      fill: "none",
      stroke: "#2563eb",
      strokeWidth: "5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }),
    h("circle", { cx: "76.5", cy: "130.5", r: "7", fill: "#f59e0b", stroke: "#ffffff", strokeWidth: "3" }),
    h("text", { x: "180", y: "309", textAnchor: "middle", fill: "#475569", fontSize: "12", fontWeight: "700" }, "위양성률"),
    h("text", { x: "14", y: "160", textAnchor: "middle", fill: "#475569", fontSize: "12", fontWeight: "700", transform: "rotate(-90 14 160)" }, "민감도"),
    h("text", { x: "50", y: "58", fill: "#1e40af", fontSize: "14", fontWeight: "800" }, "ROC"),
    h("text", { x: "50", y: "78", fill: "#475569", fontSize: "12", fontWeight: "700" }, "AUC " + formatNumber(result.auc, 3))
    );
  }

  function ResultMetric(props) {
    return h("div", { className: "rounded-xl border border-slate-200 bg-white px-3 py-3" },
      h("dt", { className: "text-[11px] font-bold text-slate-500" }, props.label),
      h("dd", { className: "mt-1 text-lg font-black text-slate-950" }, props.value)
    );
  }

  function ROCResultPreview() {
    const result = fallbackROCResult;
    const statusText = "고정 샘플 결과 예시";

    return h("article", { className: "overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]" },
      h("div", { className: "flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 min-[520px]:px-5" },
        h("div", { className: "flex items-center gap-2" },
          h("span", { className: "h-2.5 w-2.5 rounded-full bg-emerald-500", "aria-hidden": "true" }),
          h("span", { className: "text-xs font-extrabold text-slate-700" }, statusText)
        ),
        h("span", { className: "rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700" }, "ROC 샘플")
      ),
      h("div", { className: "grid gap-4 p-4 min-[520px]:p-5 min-[900px]:grid-cols-[minmax(0,1.05fr)_minmax(220px,.95fr)]" },
        h("div", null,
          h(ROCChart, { result: result }),
          h("p", { className: "mt-2 text-xs leading-5 text-slate-500" }, "점선은 무작위 분류 기준이며, 주황색 점은 Youden 지수가 가장 큰 임계값입니다.")
        ),
        h("div", { className: "flex flex-col justify-center" },
          h("h2", { className: "text-lg font-black text-slate-950" }, "논문·보고서용 결과를 한눈에"),
          h("p", { className: "mt-2 text-sm leading-6 text-slate-600" }, result.interpretation),
          h("dl", { className: "mt-4 grid grid-cols-2 gap-2", "aria-label": "ROC 샘플 핵심 결과" },
            h(ResultMetric, { label: "AUC", value: formatNumber(result.auc, 3) }),
            h(ResultMetric, { label: "최적 임계값", value: formatNumber(result.optimal_threshold, 2) }),
            h(ResultMetric, { label: "민감도", value: formatNumber(Number(result.sensitivity) * 100, 1) + "%" }),
            h(ResultMetric, { label: "특이도", value: formatNumber(Number(result.specificity) * 100, 1) + "%" })
          ),
          h("div", { className: "mt-4 overflow-x-auto rounded-xl border border-slate-200" },
            h("table", { className: "w-full min-w-[310px] text-left text-xs" },
              h("caption", { className: "sr-only" }, "샘플 ROC 결과 요약"),
              h("thead", { className: "bg-slate-50 text-slate-600" },
                h("tr", null,
                  h("th", { scope: "col", className: "px-3 py-2 font-extrabold" }, "표본"),
                  h("th", { scope: "col", className: "px-3 py-2 font-extrabold" }, "양성"),
                  h("th", { scope: "col", className: "px-3 py-2 font-extrabold" }, "음성")
                )
              ),
              h("tbody", { className: "text-slate-800" },
                h("tr", null,
                  h("td", { className: "px-3 py-2 font-bold" }, String(result.observation_count)),
                  h("td", { className: "px-3 py-2" }, String(result.positive_count)),
                  h("td", { className: "px-3 py-2" }, String(result.negative_count))
                )
              )
            )
          )
        )
      ),
      h("div", { className: "border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600 min-[520px]:px-5", role: "status", "aria-live": "polite" },
        "전체 샘플 체험에서 같은 고정 데이터를 직접 실행해 결과를 확인할 수 있습니다."
      )
    );
  }

  function HeroSection() {
    return h("section", {
      className: "relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-blue-50 via-white to-white",
      "aria-labelledby": "webr-home-title"
    },
    h("div", { className: "absolute -right-24 -top-32 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl", "aria-hidden": "true" }),
    h("div", { className: "relative mx-auto grid w-full max-w-[1240px] gap-9 px-4 pb-12 pt-9 min-[520px]:px-6 min-[768px]:pb-16 min-[768px]:pt-14 min-[1100px]:grid-cols-[minmax(0,.9fr)_minmax(520px,1.1fr)] min-[1100px]:items-center min-[1100px]:gap-12 min-[1100px]:px-8" },
      h("div", null,
        h("p", { className: "inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-extrabold text-blue-800" },
          h("span", { className: "h-2 w-2 rounded-full bg-blue-600", "aria-hidden": "true" }),
          "Web-R 2.0 · 권장 분석 제품"
        ),
        h("h1", { id: "webr-home-title", className: "mt-5 text-[2.15rem] font-black leading-[1.13] tracking-[-0.045em] text-slate-950 min-[520px]:text-5xl min-[1100px]:text-[3.65rem]" },
          "설치 없이, 연구 데이터를 ",
          h("span", { className: "text-blue-700" }, "바로 분석하세요")
        ),
        h("p", { className: "mt-5 max-w-2xl text-base leading-8 text-slate-600 min-[768px]:text-lg" },
          "ROC·생존분석·성향점수 매칭·메타분석을 브라우저에서 실행하고 논문과 보고서에 사용할 결과를 만드세요."
        ),
        h("div", { className: "mt-7 flex flex-col gap-3 min-[520px]:flex-row" },
          h("a", { href: "/webr/roc-analysis/sample/", className: primaryButtonClass }, "샘플 데이터로 1분 체험"),
          h("a", { href: "#analysis-tools", className: secondaryButtonClass }, "분석 도구 둘러보기")
        ),
        h("ul", { className: "mt-6 grid gap-2 text-sm font-semibold text-slate-600 min-[520px]:grid-cols-3", "aria-label": "샘플 체험 특징" },
          ["로그인 없이 실행", "R 설치 불필요", "파일 업로드 없음"].map(function renderHeroFact(label) {
            return h("li", { key: label, className: "flex items-center gap-2" },
              h("span", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700", "aria-hidden": "true" }, "✓"),
              label
            );
          })
        )
      ),
      h(ROCResultPreview)
    ));
  }

  function ToolCard(props) {
    const tool = props.tool;
    return h("article", { className: "group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md" },
      h("div", { className: "flex items-start justify-between gap-3" },
        h("span", { className: "inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ring-inset " + toneClasses(tool.tone) }, tool.badge),
        h("span", { className: "text-xl text-slate-300 transition group-hover:text-blue-600", "aria-hidden": "true" }, "↗")
      ),
      h("h3", { className: "mt-4 text-lg font-black text-slate-950" }, tool.name),
      h("p", { className: "mt-2 flex-1 text-sm leading-6 text-slate-600" }, tool.description),
      h("a", { href: tool.href, className: textLinkClass + " mt-3 -ml-2", "aria-label": tool.name + " 열기" }, "분석 열기", h("span", { className: "ml-1", "aria-hidden": "true" }, "→"))
    );
  }

  function ToolsSection() {
    return h("section", { id: "analysis-tools", className: "scroll-mt-24 bg-white py-14 min-[768px]:py-20", "aria-labelledby": "analysis-tools-title" },
      h("div", { className: "mx-auto w-full max-w-[1240px] px-4 min-[520px]:px-6 min-[1100px]:px-8" },
        h(SectionHeading, {
          eyebrow: "대표 분석 도구",
          id: "analysis-tools-title",
          title: "연구 질문에 맞는 분석부터 시작하세요",
          description: "자주 쓰는 분석을 먼저 배치했습니다. 각 화면에서 필요한 입력과 결과 항목을 확인할 수 있습니다."
        }),
        h("div", { className: "mt-8 grid gap-4 min-[600px]:grid-cols-2 min-[1050px]:grid-cols-3" },
          analysisTools.map(function renderTool(tool) {
            return h(ToolCard, { key: tool.name, tool: tool });
          })
        ),
        h("div", { className: "mt-7" },
          h("a", { href: "/webr/2.0/", className: secondaryButtonClass }, "Web-R 2.0 분석 도구 전체 보기")
        )
      )
    );
  }

  function ExperienceSection() {
    const steps = [
      ["1", "샘플 불러오기", "Web-R가 준비한 고정 ROC 데이터를 사용합니다."],
      ["2", "서버에서 계산", "WebR 런타임 다운로드 없이 즉시 분석합니다."],
      ["3", "결과 확인", "곡선, 핵심 수치와 해석을 한 화면에서 봅니다."]
    ];
    return h("section", { className: "bg-slate-950 py-14 text-white min-[768px]:py-20", "aria-labelledby": "sample-experience-title" },
      h("div", { className: "mx-auto grid w-full max-w-[1240px] gap-9 px-4 min-[520px]:px-6 min-[900px]:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] min-[900px]:items-center min-[1100px]:px-8" },
        h("div", null,
          h("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-300" }, "1분 샘플 체험"),
          h("h2", { id: "sample-experience-title", className: "mt-2 text-3xl font-black tracking-tight min-[768px]:text-4xl" }, "가입 전에 결과까지 확인하세요"),
          h("p", { className: "mt-4 text-sm leading-7 text-slate-300 min-[768px]:text-base" }, "분석이 나에게 맞는지 먼저 확인한 뒤, 내 데이터 분석과 저장이 필요할 때 로그인할 수 있습니다."),
          h("a", { href: "/webr/roc-analysis/sample/", className: primaryButtonClass + " mt-6" }, "샘플 ROC 분석 실행")
        ),
        h("ol", { className: "grid gap-3", "aria-label": "샘플 분석 세 단계" },
          steps.map(function renderStep(step) {
            return h("li", { key: step[0], className: "grid grid-cols-[44px_1fr] gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4" },
              h("span", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-black", "aria-hidden": "true" }, step[0]),
              h("div", null,
                h("h3", { className: "font-extrabold text-white" }, step[1]),
                h("p", { className: "mt-1 text-sm leading-6 text-slate-300" }, step[2])
              )
            );
          })
        )
      )
    );
  }

  function DeliverablesAndComparison() {
    const freeFeatures = ["공개 샘플 데이터 분석", "ROC 곡선과 핵심 수치", "분석 방법·해석 미리보기"];
    const memberFeatures = ["샘플 결과를 프로젝트에 저장", "저장 결과 다시 열기·같은 설정 재실행", "Word·Excel·PDF 내보내기"];

    function FeatureList(props) {
      return h("ul", { className: "mt-5 space-y-3 text-sm text-slate-700" },
        props.items.map(function renderFeature(item) {
          return h("li", { key: item, className: "flex items-start gap-2" },
            h("span", { className: "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-black text-emerald-700", "aria-hidden": "true" }, "✓"),
            h("span", null, item)
          );
        })
      );
    }

    return h("section", { className: "bg-slate-50 py-14 min-[768px]:py-20", "aria-labelledby": "webr-results-title" },
      h("div", { className: "mx-auto w-full max-w-[1240px] px-4 min-[520px]:px-6 min-[1100px]:px-8" },
        h(SectionHeading, {
          eyebrow: "결과물과 이용 범위",
          id: "webr-results-title",
          title: "실행에서 끝나지 않고, 연구 결과로 이어집니다",
          description: "무료 체험과 로그인 후 제공되는 기능을 구분해 필요한 시점에 다음 단계로 이동할 수 있습니다."
        }),
        h("div", { className: "mt-8 grid gap-5 min-[900px]:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]" },
          h("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-[768px]:p-7" },
            h("div", { className: "flex flex-wrap items-center justify-between gap-3" },
              h("div", null,
                h("p", { className: "text-xs font-extrabold text-blue-700" }, "결과 예시"),
                h("h3", { className: "mt-1 text-xl font-black text-slate-950" }, "표·그래프·해석을 함께 확인")
              ),
              h("div", { className: "flex gap-2", "aria-label": "지원 예정 결과 형식" },
                ["Word", "Excel", "PDF"].map(function renderFormat(format) {
                  return h("span", { key: format, className: "rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-700" }, format);
                })
              )
            ),
            h("div", { className: "mt-5 overflow-x-auto rounded-xl border border-slate-200" },
              h("table", { className: "w-full min-w-[520px] text-left text-sm" },
                h("caption", { className: "sr-only" }, "ROC 분석 결과 예시"),
                h("thead", { className: "bg-slate-50 text-slate-600" },
                  h("tr", null,
                    ["결과 항목", "추정값", "해석"].map(function renderHeader(label) {
                      return h("th", { key: label, scope: "col", className: "px-4 py-3 font-extrabold" }, label);
                    })
                  )
                ),
                h("tbody", { className: "divide-y divide-slate-100 text-slate-700" },
                  h("tr", null,
                    h("th", { scope: "row", className: "px-4 py-3 font-extrabold text-slate-900" }, "AUC"),
                    h("td", { className: "px-4 py-3 font-mono font-bold" }, "0.828"),
                    h("td", { className: "px-4 py-3" }, "내장 샘플에서 두 집단을 잘 구분")
                  ),
                  h("tr", null,
                    h("th", { scope: "row", className: "px-4 py-3 font-extrabold text-slate-900" }, "최적 임계값"),
                    h("td", { className: "px-4 py-3 font-mono font-bold" }, "0.67"),
                    h("td", { className: "px-4 py-3" }, "Youden 지수가 가장 큰 지점")
                  )
                )
              )
            ),
            h("p", { className: "mt-4 text-xs leading-5 text-slate-500" }, "실제 연구에서는 연구 목적, 표본 설계와 위양성·위음성 비용을 함께 검토해야 합니다.")
          ),
          h("div", { className: "grid gap-4 min-[600px]:grid-cols-2 min-[900px]:grid-cols-1" },
            h("article", { className: "rounded-2xl border border-slate-200 bg-white p-5" },
              h("p", { className: "text-xs font-extrabold text-slate-500" }, "무료"),
              h("h3", { className: "mt-1 text-xl font-black text-slate-950" }, "먼저 직접 확인"),
              h(FeatureList, { items: freeFeatures }),
              h("a", { href: "/webr/roc-analysis/sample/", className: textLinkClass + " mt-4 -ml-2" }, "무료 샘플 실행", h("span", { className: "ml-1", "aria-hidden": "true" }, "→"))
            ),
            h("article", { className: "rounded-2xl border-2 border-blue-200 bg-blue-50 p-5" },
              h("p", { className: "text-xs font-extrabold text-blue-700" }, "로그인·이용 권한"),
              h("h3", { className: "mt-1 text-xl font-black text-slate-950" }, "내 연구를 이어서 관리"),
              h(FeatureList, { items: memberFeatures }),
              h("a", { href: "/intro/membership/", className: textLinkClass + " mt-4 -ml-2" }, "무료·정회원 기능 비교", h("span", { className: "ml-1", "aria-hidden": "true" }, "→"))
            )
          )
        )
      )
    );
  }

  function TrustSection() {
    const trustItems = [
      ["계산 경로", "공개 샘플은 브라우저 런타임을 내려받지 않고 Web-R 서버에서 계산합니다."],
      ["결과 근거", "ROC 곡선과 AUC, Youden 지수 기준 임계값을 수치와 함께 제공합니다."],
      ["데이터 처리", "샘플 체험은 고정 데이터만 사용하며 개인 파일을 업로드하지 않습니다."],
      ["지원 경로", "문의, 이용약관, 개인정보 처리와 장애 안내를 공식 페이지에서 확인할 수 있습니다."]
    ];
    return h("section", { className: "bg-white py-14 min-[768px]:py-20", "aria-labelledby": "webr-trust-title" },
      h("div", { className: "mx-auto w-full max-w-[1240px] px-4 min-[520px]:px-6 min-[1100px]:px-8" },
        h(SectionHeading, {
          eyebrow: "신뢰할 수 있는 정보",
          id: "webr-trust-title",
          title: "확인할 수 있는 기준만 안내합니다",
          description: "정의가 불분명한 방문자 수나 과장된 이용자 수 대신 계산 방식과 데이터 처리 범위를 분명히 표시합니다."
        }),
        h("dl", { className: "mt-8 grid gap-4 min-[600px]:grid-cols-2" },
          trustItems.map(function renderTrust(item) {
            return h("div", { key: item[0], className: "rounded-2xl border border-slate-200 bg-slate-50 p-5" },
              h("dt", { className: "font-black text-slate-950" }, item[0]),
              h("dd", { className: "mt-2 text-sm leading-6 text-slate-600" }, item[1])
            );
          })
        ),
        h("div", { className: "mt-6 flex flex-wrap gap-2" },
          h("a", { href: "/intro/privates/", className: textLinkClass }, "개인정보 처리방침"),
          h("a", { href: "/intro/terms/", className: textLinkClass }, "이용약관"),
          h("a", { href: "/intro/notice/", className: textLinkClass }, "공지·장애 안내")
        )
      )
    );
  }

  function FAQSection() {
    return h("section", { className: "border-y border-slate-200 bg-slate-50 py-14 min-[768px]:py-20", "aria-labelledby": "webr-faq-title" },
      h("div", { className: "mx-auto w-full max-w-[960px] px-4 min-[520px]:px-6" },
        h(SectionHeading, {
          eyebrow: "FAQ",
          id: "webr-faq-title",
          title: "시작하기 전에 많이 묻는 질문"
        }),
        h("div", { className: "mt-7 space-y-3" },
          faqs.map(function renderFAQ(item) {
            return h("details", { key: item.question, className: "group rounded-2xl border border-slate-200 bg-white p-5 open:border-blue-200" },
              h("summary", { className: "flex min-h-[32px] cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-slate-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300" },
                item.question,
                h("span", { className: "text-xl text-blue-700 transition group-open:rotate-45", "aria-hidden": "true" }, "+")
              ),
              h("p", { className: "mt-3 pr-8 text-sm leading-7 text-slate-600" }, item.answer)
            );
          })
        )
      )
    );
  }

  function ProductPathsAndContent() {
    const contentLinks = [
      ["/r-ecosystem/", "R 에코시스템", "패키지와 R 생태계 소식"],
      ["/community/", "커뮤니티", "질문과 사용 경험 공유"],
      ["/book/", "R 도서", "분석 학습 자료와 도서"],
      ["/workshop/", "워크숍", "강의와 실습 일정"]
    ];
    return h("section", { className: "bg-white py-14 min-[768px]:py-20", "aria-labelledby": "webr-product-paths-title" },
      h("div", { className: "mx-auto w-full max-w-[1240px] px-4 min-[520px]:px-6 min-[1100px]:px-8" },
        h(SectionHeading, {
          eyebrow: "제품 경로",
          id: "webr-product-paths-title",
          title: "필요한 작업 방식으로 이동하세요",
          description: "새 분석은 Web-R 2.0에서 시작하고, 기존 기능과 코드 작업은 각 전용 경로를 이용할 수 있습니다."
        }),
        h("div", { className: "mt-8 grid gap-4 min-[600px]:grid-cols-2 min-[1050px]:grid-cols-4" },
          productRoles.map(function renderRole(role, index) {
            return h("article", { key: role.title, className: index === 0 ? "rounded-2xl border-2 border-blue-300 bg-blue-50 p-5" : "rounded-2xl border border-slate-200 bg-white p-5" },
              h("p", { className: index === 0 ? "text-xs font-extrabold text-blue-700" : "text-xs font-extrabold text-slate-500" }, role.eyebrow),
              h("h3", { className: "mt-1 text-lg font-black text-slate-950" }, role.title),
              h("p", { className: "mt-2 text-sm leading-6 text-slate-600" }, role.description),
              h("a", { href: role.href, className: textLinkClass + " mt-3 -ml-2" }, role.link, h("span", { className: "ml-1", "aria-hidden": "true" }, "→"))
            );
          })
        ),
        h("div", { className: "mt-12 border-t border-slate-200 pt-9" },
          h("div", { className: "flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-end min-[768px]:justify-between" },
            h("div", null,
              h("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500" }, "R 콘텐츠 허브"),
              h("h2", { className: "mt-2 text-2xl font-black text-slate-950" }, "분석 다음에 필요한 자료")
            ),
            h("p", { className: "max-w-xl text-sm leading-6 text-slate-600" }, "제품 사용을 돕는 패키지, 질문, 도서와 워크숍은 분석 제품 아래에서 이어집니다.")
          ),
          h("nav", { className: "mt-6 grid gap-3 min-[600px]:grid-cols-2 min-[1050px]:grid-cols-4", "aria-label": "R 콘텐츠 허브" },
            contentLinks.map(function renderContent(link) {
              return h("a", { key: link[0], href: link[0], className: "rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300" },
                h("span", { className: "block font-black text-slate-950" }, link[1]),
                h("span", { className: "mt-1 block text-sm leading-6 text-slate-600" }, link[2])
              );
            })
          )
        )
      )
    );
  }

  function ProductHome() {
    return h("main", { className: "w-full bg-white text-slate-800" },
      h(HeroSection),
      h(ToolsSection),
      h(ExperienceSection),
      h(DeliverablesAndComparison),
      h(TrustSection),
      h(FAQSection),
      h(ProductPathsAndContent)
    );
  }

  function setMain() {
    const mount = document.getElementById("div_main");
    if (!mount) {
      return;
    }
    ReactDOM.render(h(ProductHome), mount);
  }

  window.set_main = setMain;
})(window, document);
