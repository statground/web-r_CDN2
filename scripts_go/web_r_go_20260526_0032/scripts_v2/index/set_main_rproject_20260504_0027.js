let class_span_btn_default = "flex flex-row justify-center items-center w-fit h-[20px] px-1.5 rounded-xl";
const webr_status_badge_base = "inline-flex h-[24px] min-w-[44px] items-center justify-center rounded-md px-2 text-[12px] font-extrabold leading-none";
const webr_status_badge_tones = {
  new: "bg-red-50 text-red-600",
  secret: "bg-slate-100 text-slate-700",
  my: "bg-blue-50 text-blue-700"
};
function WebRStatusBadge(props) {
  return /* @__PURE__ */ React.createElement("span", { class: `${webr_status_badge_base} ${webr_status_badge_tones[props.tone] || webr_status_badge_tones.secret}` }, props.label);
}
function getIndexArticleHref(data) {
  const item = data || {};
  const uuid = item.uuid || item.uuid_article || "";
  const categoryUrl = item.category_url || item.article_category_url || "";
  const explicitUrl = item.url || item.article_url || "";
  if (explicitUrl && explicitUrl.indexOf("/webr/notebook/view/") === 0) {
    return explicitUrl;
  }
  if (categoryUrl === "notebook") {
    return "/webr/notebook/view/" + uuid + "/";
  }
  if (categoryUrl === "notice") {
    return "/intro/notice/read/" + uuid + "/";
  }
  if (categoryUrl === "visitor") {
    return "/community/visitor/read/" + uuid + "/";
  }
  if (categoryUrl === "rproject") {
    return "/community/rproject/read/" + uuid + "/";
  }
  if (categoryUrl === "rblogger" || categoryUrl === "free") {
    return "/community/read/" + uuid + "/";
  }
  if (explicitUrl) {
    return explicitUrl;
  }
  return "/community/read/" + uuid + "/";
}
function Span_btn_user(props) {
  const roles = {
    "\uAD00\uB9AC\uC790": "yellow",
    "\uAE30\uC5C5\uD68C\uC6D0": "red",
    "VIP\uD68C\uC6D0": "blue",
    "\uC815\uD68C\uC6D0": "green",
    "\uC900\uD68C\uC6D0": "gray"
  };
  const role = roles[props.role] || "gray";
  return /* @__PURE__ */ React.createElement("span", { class: `${class_span_btn_default} text-xs bg-${role}-100 text-${role}-800` }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/board_user.svg",
      class: "w-3 h-3 mr-1"
    }
  ), props.user_nickname);
}
function Span_btn_date(props) {
  return /* @__PURE__ */ React.createElement("span", { class: `${class_span_btn_default} text-xs bg-blue-100 text-blue-800` }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: `https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/calendar_${Number(
        props.date.split("-")[2].substr(0, 2)
      )}.svg`,
      class: "w-3 h-3 mr-1"
    }
  ), props.date);
}
function Span_btn_article_read(props) {
  return props.cnt_read > 0 && /* @__PURE__ */ React.createElement("span", { class: `${class_span_btn_default} text-xs bg-gray-100 text-blue-800` }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/eye.svg",
      class: "w-3 h-3 mr-1"
    }
  ), props.cnt_read.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
}
function Span_btn_article_comment(props) {
  return props.cnt_comment > 0 && /* @__PURE__ */ React.createElement("span", { class: `${class_span_btn_default} text-xs bg-purple-100 text-blue-800` }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/comment.svg",
      class: "w-3 h-3 mr-1"
    }
  ), props.cnt_comment.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
}
function Span_btn_article_new(props) {
  return props.toggle === 1 && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "new", label: "NEW" });
}
function Span_btn_article_secret(props) {
  return props.toggle === 1 && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "secret", label: "SECRET" });
}
function Span_btn_my_article(props) {
  return props.toggle === "writer" && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "my", label: "MY" });
}
function Div_main_header() {
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center text-center w-full" }, /* @__PURE__ */ React.createElement("h1", { class: "mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl" }, "\uC6F9\uC5D0\uC11C \uD558\uB294 ", /* @__PURE__ */ React.createElement("mark", { class: "px-2 text-white bg-blue-600 rounded" }, "R"), " \uD1B5\uACC4"), /* @__PURE__ */ React.createElement("p", { class: "text-base font-normal text-gray-500 md:text-lg lg:text-xl" }, '"\uC6F9\uC5D0\uC11C \uD558\uB294 R\uD1B5\uACC4"\uB294, \uD1B5\uACC4\uC5D0\uB294 \uAD00\uC2EC\uC774 \uC788\uC73C\uB098 R\uC744 \uC5B4\uB824\uC6CC\uD558\uB294 \uC5EC\uB7EC \uC5F0\uAD6C\uC790\uB4E4\uC744 \uC704\uD55C \uD504\uB85C\uC81D\uD2B8\uC785\uB2C8\uB2E4.', /* @__PURE__ */ React.createElement("br", null), "R\uC124\uCE58\uC5C6\uC774 \uD074\uB9AD\uB9CC\uC73C\uB85C \uC6F9\uC5D0 \uC788\uB294 \uC11C\uBC84\uB97C \uC774\uC6A9\uD558\uC5EC \uD1B5\uACC4\uBD84\uC11D\uC744 \uD558\uACE0 \uBCF4\uB2E4 R\uC744 \uC27D\uAC8C \uC0AC\uC6A9\uD558\uAE30 \uC704\uD55C \uD328\uD0A4\uC9C0 \uBC0F \uC571 \uACF5\uB3D9\uAC1C\uBC1C\uC744 \uBAA9\uD45C\uB85C \uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."));
}
const WEBR_HOME_ASSET_BASE = "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/";
function homeArray(data) {
  if (!data)
    return [];
  if (Array.isArray(data))
    return data.filter(Boolean);
  if (Array.isArray(data.items))
    return data.items.filter(Boolean);
  if (Array.isArray(data.data))
    return data.data.filter(Boolean);
  if (Array.isArray(data.results))
    return data.results.filter(Boolean);
  if (Array.isArray(data.rows))
    return data.rows.filter(Boolean);
  if (Array.isArray(data.workshops))
    return data.workshops.filter(Boolean);
  const values = Object.keys(data).map((key) => data[key]);
  const nested = values.find(Array.isArray);
  if (Array.isArray(nested))
    return nested.filter(Boolean);
  return values.filter((row) => row && typeof row === "object");
}
function homeShortText(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const limit = maxLength || 58;
  if (text.length <= limit)
    return text;
  return text.slice(0, Math.max(0, limit - 1)).trim() + "...";
}
function homeParseDate(value) {
  const text = String(value || "").trim();
  if (!text)
    return null;
  const normalized = text.indexOf("T") === -1 ? text.replace(" ", "T") : text;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime()))
    return null;
  return date;
}
function homeDateValue(item) {
  const keys = ["updated_at", "created_at", "published_at", "starts_at", "event_at", "date"];
  for (const key of keys) {
    const parsed = homeParseDate(item && item[key]);
    if (parsed)
      return parsed.getTime();
  }
  return 0;
}
function homeFormatDate(value) {
  const text = String(value || "").trim();
  const matched = text.match(/^\d{4}-\d{2}-\d{2}/);
  return matched ? matched[0] : "최근";
}
function homeRelativeTime(value) {
  const parsed = homeParseDate(value);
  if (!parsed)
    return homeFormatDate(value);
  const diffSeconds = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1e3));
  if (diffSeconds < 60)
    return "방금 전";
  if (diffSeconds < 3600)
    return Math.floor(diffSeconds / 60) + "분 전";
  if (diffSeconds < 86400)
    return Math.floor(diffSeconds / 3600) + "시간 전";
  return homeFormatDate(value);
}
function homePostJSON(url) {
  return fetch(url, { method: "POST" }).then((res) => {
    if (!res.ok)
      throw new Error("request failed");
    return res.json();
  }).catch(() => null);
}
function homeCategoryLabel(category) {
  const labels = {
    free: "커뮤니티",
    notebook: "Notebook",
    rproject: "R Project",
    rblogger: "R Blogger",
    rcommunity: "R Community",
    notice: "공지",
    visitor: "방명록",
    youtube: "YouTube"
  };
  return labels[category] || "업데이트";
}
function homeArticlePreview(row) {
  const category = row.category_url || row.article_category_url || row.category || "";
  return {
    title: homeShortText(row.title || row.article_title || row.name || "새 글", 60),
    meta: [homeCategoryLabel(category), homeFormatDate(row.created_at || row.published_at || row.updated_at)].filter(Boolean).join(" · "),
    href: getIndexArticleHref(row)
  };
}
function homeBookPreview(row) {
  const bookKey = row.board_url_sub || row.uuid_board_category || "";
  const href = bookKey ? "/book/" + String(bookKey).padStart(3, "0") + "/" : row.url || "/book/";
  return {
    title: homeShortText(row.title || row.book_title || "R 도서", 54),
    meta: [row.publisher, homeFormatDate(row.published_at || row.created_at)].filter(Boolean).join(" · ") || "도서",
    href,
    image: row.url_image || ""
  };
}
function homeWorkshopPreview(row) {
  const identifier = row.uuid || row.slug || row.board_key || "";
  return {
    title: homeShortText(row.title || row.name || "워크샵", 54),
    meta: [row.source_name || row.venue || "워크샵", homeFormatDate(row.starts_at || row.created_at)].filter(Boolean).join(" · "),
    href: identifier ? "/workshop/read/" + identifier + "/" : row.canonical_url || "/workshop/",
    image: row.cover_image_url || ""
  };
}
function homeActivityMessage(event, nickname) {
  const displayNickname = String(nickname || "회원").trim() || "회원";
  if (event === "회원가입")
    return displayNickname + "님이 가입하였습니다.";
  if (event === "접속중")
    return displayNickname + "님이 접속중입니다.";
  if (event === "댓글")
    return displayNickname + "님이 게시물에 댓글을 달았습니다.";
  if (event === "게시판 - youtube")
    return "새 YouTube 영상이 업로드되었습니다.";
  if (event === "게시판 - notice")
    return "새 공지사항이 등록되었습니다.";
  if (typeof event === "string" && event.startsWith("게시판 - "))
    return displayNickname + "님이 커뮤니티에 새 글을 게시하였습니다.";
  if (typeof event === "string" && event.startsWith("Web-R - ")) {
    const appName = event.replace("Web-R - ", "");
    return displayNickname + "님이 " + appName + "을(를) 실행하고 있습니다.";
  }
  return displayNickname + "님의 활동이 있습니다.";
}
function Div_home_service_hub() {
  const [homeState, setHomeState] = React.useState({
    loading: true,
    articles: [],
    events: [],
    books: [],
    workshops: [],
    youtube: []
  });
  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      homePostJSON("/ajax_index_board/"),
      homePostJSON("/ajax_index_event/"),
      homePostJSON("/book/ajax_get_book_list/"),
      homePostJSON("/workshop/ajax_list/"),
      homePostJSON("/ajax_index_youtube/")
    ]).then(([board, events, books, workshops, youtube]) => {
      if (!mounted)
        return;
      setHomeState({
        loading: false,
        articles: homeArray(board).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        events: homeArray(events).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        books: homeArray(books).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        workshops: homeArray(workshops && workshops.workshops ? workshops.workshops : workshops).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        youtube: homeArray(youtube).sort((a, b) => homeDateValue(b) - homeDateValue(a))
      });
    });
    return () => {
      mounted = false;
    };
  }, []);
  const rEcosystemPreviews = homeState.articles.filter((row) => ["rcommunity", "rproject", "rblogger"].includes(row.category_url || row.article_category_url || row.category || "")).slice(0, 3).map(homeArticlePreview);
  const communityPreviews = homeState.articles.filter((row) => ["free", "notebook", "visitor"].includes(row.category_url || row.article_category_url || row.category || "")).slice(0, 3).map(homeArticlePreview);
  const webRPreviews = homeState.events.filter((row) => String(row.event || "").startsWith("Web-R - ")).slice(0, 3).map((row) => ({
    title: homeShortText(homeActivityMessage(row.event, row.nickname), 60),
    meta: homeRelativeTime(row.created_at || row.updated_at),
    href: "/webr/2.0/"
  }));
  const bookPreviews = homeState.books.slice(0, 3).map(homeBookPreview);
  const workshopPreviews = homeState.workshops.slice(0, 2).map(homeWorkshopPreview);
  const youtubePreviews = homeState.youtube.slice(0, 1).map((row) => ({
    title: homeShortText(row.title || "YouTube 강의", 54),
    meta: "YouTube · " + homeFormatDate(row.created_at || row.published_at),
    href: row.uuid ? "/workshop/youtube/read/" + row.uuid + "/" : "/workshop/youtube/",
    image: row.youtube_thumbnail || ""
  }));
  const activityItems = homeState.events.filter((item) => {
    const nickname = String(item.nickname || "").trim();
    return nickname && !["탈퇴한 유저", "탈퇴한 회원", "Unknown", "unknown", "null", "None", "undefined"].includes(nickname);
  }).slice(0, 7);
  const services = [
    {
      title: "Web-R 접속",
      label: "실행과 분석",
      description: "브라우저에서 R 앱과 Notebook, Web-R 2.0 분석 도구로 바로 이어집니다.",
      href: "/webr/2.0/",
      icon: WEBR_HOME_ASSET_BASE + "images/webr/advanced_webR.png",
      accent: "border-blue-200 bg-blue-50 text-blue-700",
      previews: webRPreviews,
      links: [
        { title: "Web-R 2.0", href: "/webr/2.0/" },
        { title: "Notebook", href: "/webr/notebook/" }
      ]
    },
    {
      title: "R 에코시스템",
      label: "소식과 패키지",
      description: "R 공식 발표, 블로그, 저널, package news와 패키지 상세 정보를 한 흐름으로 봅니다.",
      href: "/r-ecosystem/",
      icon: WEBR_HOME_ASSET_BASE + "images/svg/R-packages.svg",
      accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
      previews: rEcosystemPreviews,
      links: [
        { title: "소식·글", href: "/r-ecosystem/" },
        { title: "패키지", href: "/r-ecosystem/packages/" }
      ]
    },
    {
      title: "커뮤니티",
      label: "게시판과 요약",
      description: "Web-R 게시판, R Community daily digest, Notebook 공개 글을 같은 읽기 흐름으로 모읍니다.",
      href: "/community/",
      icon: WEBR_HOME_ASSET_BASE + "images/svg/menu_free.svg",
      accent: "border-sky-200 bg-sky-50 text-sky-700",
      previews: communityPreviews,
      links: [
        { title: "커뮤니티", href: "/community/" },
        { title: "공지사항", href: "/intro/notice/" }
      ]
    },
    {
      title: "도서",
      label: "R 도서 허브",
      description: "R 언어와 통계 학습에 맞는 도서를 표지 중심 목록과 상세 화면으로 살펴봅니다.",
      href: "/book/",
      icon: WEBR_HOME_ASSET_BASE + "images/svg/menu_book.svg",
      accent: "border-amber-200 bg-amber-50 text-amber-700",
      previews: bookPreviews,
      links: [
        { title: "도서 허브", href: "/book/" }
      ]
    },
    {
      title: "워크샵",
      label: "강의와 행사",
      description: "Web-R 워크샵, R Project conference, YouTube 강의 콘텐츠를 행사 단위로 연결합니다.",
      href: "/workshop/",
      icon: WEBR_HOME_ASSET_BASE + "images/svg/menu_workshop.svg",
      accent: "border-indigo-200 bg-indigo-50 text-indigo-700",
      previews: workshopPreviews.concat(youtubePreviews).slice(0, 3),
      links: [
        { title: "워크샵", href: "/workshop/" },
        { title: "YouTube", href: "/workshop/youtube/" }
      ]
    }
  ];
  function PreviewSkeleton() {
    return /* @__PURE__ */ React.createElement("div", { class: "space-y-2" }, [0, 1].map((idx) => /* @__PURE__ */ React.createElement("div", { key: idx, class: "rounded-md bg-slate-100 p-2" }, /* @__PURE__ */ React.createElement("div", { class: "h-2.5 w-4/5 rounded-full bg-slate-300 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-2 h-2 w-2/5 rounded-full bg-slate-200 animate-pulse" }))));
  }
  function PreviewList(props) {
    const previews = props.items || [];
    if (homeState.loading)
      return /* @__PURE__ */ React.createElement(PreviewSkeleton, null);
    if (!previews.length)
      return /* @__PURE__ */ React.createElement("a", { href: props.href, class: "block rounded-md border border-dashed border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" }, "최근 업데이트 보러가기");
    return /* @__PURE__ */ React.createElement("div", { class: "space-y-2" }, previews.map((preview, idx) => /* @__PURE__ */ React.createElement("a", { key: preview.href + idx, href: preview.href || props.href, class: "group flex min-h-[48px] items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 hover:border-blue-200 hover:bg-blue-50" }, preview.image ? /* @__PURE__ */ React.createElement("img", { src: preview.image, alt: "", class: "mt-0.5 h-9 w-9 shrink-0 rounded object-cover", loading: "lazy" }) : /* @__PURE__ */ React.createElement("span", { class: "mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500 group-hover:animate-pulse" }), /* @__PURE__ */ React.createElement("span", { class: "min-w-0" }, /* @__PURE__ */ React.createElement("span", { class: "block truncate text-xs font-bold text-slate-800 group-hover:text-blue-700" }, preview.title), /* @__PURE__ */ React.createElement("span", { class: "mt-1 block truncate text-[11px] text-slate-500" }, preview.meta || "최근 업데이트")))));
  }
  function ActivityRail() {
    return /* @__PURE__ */ React.createElement("aside", { class: "rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-sm" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { class: "text-xs font-semibold text-blue-200" }, "Live Activity"), /* @__PURE__ */ React.createElement("h3", { class: "text-lg font-extrabold" }, "지금 이용 중인 흐름")), /* @__PURE__ */ React.createElement("span", { class: "relative flex h-3 w-3" }, /* @__PURE__ */ React.createElement("span", { class: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ React.createElement("span", { class: "relative inline-flex h-3 w-3 rounded-full bg-emerald-300" }))), /* @__PURE__ */ React.createElement("div", { class: "mt-4 space-y-3" }, homeState.loading ? [0, 1, 2, 3].map((idx) => /* @__PURE__ */ React.createElement("div", { key: idx, class: "rounded-md bg-white/10 p-3" }, /* @__PURE__ */ React.createElement("div", { class: "h-2.5 w-4/5 rounded-full bg-white/30 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-2 h-2 w-1/3 rounded-full bg-white/20 animate-pulse" }))) : activityItems.length ? activityItems.map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: item.uuid || item.created_at || idx, class: "group flex items-start gap-3 rounded-md bg-white/5 p-3 transition hover:bg-white/10" }, /* @__PURE__ */ React.createElement("span", { class: "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.12)] group-hover:animate-pulse" }), /* @__PURE__ */ React.createElement("span", { class: "min-w-0" }, /* @__PURE__ */ React.createElement("span", { class: "block text-sm font-semibold leading-5 text-white" }, homeShortText(homeActivityMessage(item.event, item.nickname), 66)), /* @__PURE__ */ React.createElement("span", { class: "mt-1 block text-xs text-slate-300" }, homeRelativeTime(item.created_at || item.updated_at))))) : /* @__PURE__ */ React.createElement("a", { href: "/community/", class: "block rounded-md bg-white/10 p-3 text-sm font-semibold text-slate-100 hover:bg-white/15" }, "최근 활동 보러가기")));
  }
  function ServiceCard(props) {
    const item = props.item;
    return /* @__PURE__ */ React.createElement(
      "article",
      {
        class: "flex min-h-[320px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { class: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { class: "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border " + item.accent }, /* @__PURE__ */ React.createElement("img", { src: item.icon, alt: "", class: "h-7 w-7 object-contain", loading: "lazy" })), /* @__PURE__ */ React.createElement("div", { class: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { class: "text-xs font-semibold uppercase text-slate-500" }, item.label), /* @__PURE__ */ React.createElement("h2", { class: "text-lg font-extrabold text-slate-950" }, item.title))), /* @__PURE__ */ React.createElement("p", { class: "mt-4 text-sm leading-6 text-slate-600" }, item.description), /* @__PURE__ */ React.createElement("div", { class: "mt-4 border-t border-slate-100 pt-3" }, /* @__PURE__ */ React.createElement("p", { class: "mb-2 text-xs font-extrabold text-slate-900" }, "최근 업데이트"), /* @__PURE__ */ React.createElement(PreviewList, { items: item.previews, href: item.href }))),
      /* @__PURE__ */ React.createElement("div", { class: "mt-5 flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("a", { href: item.href, class: "inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-blue-700" }, item.title, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, ">")), item.links.map((link) => /* @__PURE__ */ React.createElement("a", { key: link.href, href: link.href, class: "inline-flex h-8 items-center rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" }, link.title)))
    );
  }
  return /* @__PURE__ */ React.createElement("section", { class: "w-full max-w-7xl" }, /* @__PURE__ */ React.createElement("div", { class: "mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { class: "text-sm font-semibold text-blue-700" }, "Web-R Home"), /* @__PURE__ */ React.createElement("h2", { class: "text-2xl font-extrabold text-slate-950" }, "최근 업데이트로 보는 Web-R")), /* @__PURE__ */ React.createElement("p", { class: "text-sm text-slate-500" }, "접속, 에코시스템, 커뮤니티, 도서, 워크샵")), /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5" }, services.map((item) => /* @__PURE__ */ React.createElement(ServiceCard, { key: item.href, item }))), /* @__PURE__ */ React.createElement("div", { class: "mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_360px]" }, /* @__PURE__ */ React.createElement("div", { class: "rounded-lg border border-blue-100 bg-blue-50 p-4" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col gap-1 md:flex-row md:items-center md:justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { class: "text-xs font-semibold text-blue-700" }, "Recent Contents"), /* @__PURE__ */ React.createElement("h3", { class: "text-lg font-extrabold text-slate-950" }, "새로 올라온 내용을 영역별로 바로 확인하세요")), /* @__PURE__ */ React.createElement("a", { href: "/r-ecosystem/", class: "inline-flex h-9 w-fit items-center rounded-md border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-700 hover:bg-blue-100" }, "전체 흐름 보기")), /* @__PURE__ */ React.createElement("div", { class: "mt-3 grid grid-cols-1 gap-2 md:grid-cols-3" }, services.slice(0, 3).map((item) => /* @__PURE__ */ React.createElement("a", { key: "summary-" + item.href, href: item.href, class: "rounded-md bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:text-blue-700" }, /* @__PURE__ */ React.createElement("span", { class: "block text-xs text-slate-500" }, item.title), /* @__PURE__ */ React.createElement("span", { class: "mt-1 block truncate" }, item.previews && item.previews[0] ? item.previews[0].title : "최근 업데이트 확인"))))), /* @__PURE__ */ React.createElement(ActivityRail, null)));
}
function Div_home_update_dashboard() {
  const [homeState, setHomeState] = React.useState({
    loading: true,
    articles: [],
    events: [],
    books: [],
    workshops: [],
    youtube: [],
    packages: {}
  });
  const [activeLane, setActiveLane] = React.useState("all");
  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      homePostJSON("/ajax_index_board/"),
      homePostJSON("/ajax_index_event/"),
      homePostJSON("/book/ajax_get_book_list/"),
      homePostJSON("/workshop/ajax_list/"),
      homePostJSON("/ajax_index_youtube/"),
      homePostJSON("/ajax_index_packages/")
    ]).then(([board, events, books, workshops, youtube, packages]) => {
      if (!mounted)
        return;
      setHomeState({
        loading: false,
        articles: homeArray(board).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        events: homeArray(events).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        books: homeArray(books).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        workshops: homeArray(workshops && workshops.workshops ? workshops.workshops : workshops).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        youtube: homeArray(youtube).sort((a, b) => homeDateValue(b) - homeDateValue(a)),
        packages: packages || {}
      });
    });
    return () => {
      mounted = false;
    };
  }, []);
  function packageHref(row) {
    const name = row.package_name || row.PackageName || "";
    return name ? "/r-ecosystem/packages/" + encodeURIComponent(name) + "/" : "/r-ecosystem/packages/";
  }
  function packageTitle(row) {
    const name = row.package_name || row.PackageName || "R package";
    const version = row.latest_version || row.package_version || "";
    return version ? name + " " + version : name;
  }
  function packageMeta(row, fallback) {
    return [row.repository || "R Package", fallback || homeFormatDate(row.published_at || row.first_seen_at || row.last_observed_at)].filter(Boolean).join(" · ");
  }
  function packageNewsHref(row) {
    const readID = row.item_uuid || row.external_id || "";
    return readID ? "/r-ecosystem/packages/news/read/" + encodeURIComponent(readID) + "/" : "/r-ecosystem/packages/news/";
  }
  function feedItem(lane, source, row, title, meta, href, detail, sortValue) {
    return {
      lane,
      source,
      row,
      title: homeShortText(title, 84),
      meta,
      href,
      detail: homeShortText(detail, 118),
      sortValue: sortValue || homeDateValue(row)
    };
  }
  const categoryOf = (row) => row.category_url || row.article_category_url || row.category || "";
  const packagePublished = homeArray(homeState.packages.recent_published || homeState.packages.packages);
  const packageObserved = homeArray(homeState.packages.recent_observed);
  const packageNews = homeArray(homeState.packages.package_news);
  const feed = [];
  packagePublished.slice(0, 6).forEach((row) => {
    feed.push(feedItem("packages", "R 패키지", row, packageTitle(row), packageMeta(row, homeFormatDate(row.published_at || row.last_observed_at)), packageHref(row), row.title || row.description || "패키지 업데이트", homeDateValue({ published_at: row.published_at, last_observed_at: row.last_observed_at })));
  });
  packageObserved.slice(0, 4).forEach((row) => {
    feed.push(feedItem("packages", "R 패키지", row, packageTitle(row), packageMeta(row, "새 관측 " + homeFormatDate(row.first_seen_at || row.last_observed_at)), packageHref(row), row.title || row.description || "새로 관측된 패키지 신호", homeDateValue({ first_seen_at: row.first_seen_at, last_observed_at: row.last_observed_at })));
  });
  packageNews.slice(0, 5).forEach((row) => {
    feed.push(feedItem("packages", "패키지 소식", row, row.title || "Package news", [row.source_name || "Package news", homeFormatDate(row.published_at || row.collected_at)].filter(Boolean).join(" · "), packageNewsHref(row), row.summary || "", homeDateValue({ published_at: row.published_at, collected_at: row.collected_at })));
  });
  homeState.articles.filter((row) => categoryOf(row) === "rcommunity").slice(0, 7).forEach((row) => {
    feed.push(feedItem("rcommunity", "R Community", row, row.title || "R Community", [row.source_name || "R Community", homeFormatDate(row.created_at || row.published_at)].filter(Boolean).join(" · "), homeArticlePreview(row).href, row.summary || row.content || "", homeDateValue(row)));
  });
  homeState.articles.filter((row) => ["rproject", "rblogger"].includes(categoryOf(row))).slice(0, 6).forEach((row) => {
    feed.push(feedItem("ecosystem", homeCategoryLabel(categoryOf(row)), row, row.title || "R 에코시스템", [homeCategoryLabel(categoryOf(row)), homeFormatDate(row.created_at || row.published_at)].join(" · "), homeArticlePreview(row).href, row.summary || row.content || "", homeDateValue(row)));
  });
  homeState.articles.filter((row) => ["free", "notebook", "visitor"].includes(categoryOf(row))).slice(0, 6).forEach((row) => {
    feed.push(feedItem("community", homeCategoryLabel(categoryOf(row)), row, row.title || "커뮤니티", [homeCategoryLabel(categoryOf(row)), homeFormatDate(row.created_at || row.updated_at)].join(" · "), homeArticlePreview(row).href, row.summary || row.content || "", homeDateValue(row)));
  });
  homeState.books.slice(0, 5).forEach((row) => {
    const preview = homeBookPreview(row);
    feed.push(feedItem("books", "도서", row, preview.title, preview.meta, preview.href, row.description || row.contents || "", homeDateValue(row)));
  });
  homeState.workshops.slice(0, 4).forEach((row) => {
    const preview = homeWorkshopPreview(row);
    feed.push(feedItem("workshops", "워크샵", row, preview.title, preview.meta, preview.href, row.summary || row.description || "", homeDateValue({ starts_at: row.starts_at, created_at: row.created_at })));
  });
  homeState.youtube.slice(0, 2).forEach((row) => {
    feed.push(feedItem("workshops", "YouTube", row, row.title || "YouTube 강의", ["YouTube", homeFormatDate(row.created_at || row.published_at)].join(" · "), row.uuid ? "/workshop/youtube/read/" + row.uuid + "/" : "/workshop/youtube/", "", homeDateValue(row)));
  });
  homeState.events.filter((row) => String(row.event || "").startsWith("Web-R - ")).slice(0, 4).forEach((row) => {
    feed.push(feedItem("webr", "Web-R 실행", row, homeActivityMessage(row.event, row.nickname), homeRelativeTime(row.created_at || row.updated_at), "/webr/2.0/", "", homeDateValue(row)));
  });
  const dedupedFeed = [];
  const seen = /* @__PURE__ */ new Set();
  feed.sort((a, b) => b.sortValue - a.sortValue).forEach((item) => {
    const key = (item.href || "") + "|" + item.title;
    if (seen.has(key))
      return;
    seen.add(key);
    dedupedFeed.push(item);
  });
  const lanes = [
    { id: "all", label: "전체", href: "/" },
    { id: "packages", label: "R 패키지", href: "/r-ecosystem/packages/" },
    { id: "rcommunity", label: "R Community", href: "/community/" },
    { id: "ecosystem", label: "R 에코시스템", href: "/r-ecosystem/" },
    { id: "community", label: "커뮤니티", href: "/community/" },
    { id: "books", label: "도서", href: "/book/" },
    { id: "workshops", label: "워크샵", href: "/workshop/" },
    { id: "webr", label: "Web-R 실행", href: "/webr/2.0/" }
  ].map((lane) => Object.assign({}, lane, { count: lane.id === "all" ? dedupedFeed.length : dedupedFeed.filter((item) => item.lane === lane.id).length }));
  const activeItems = (activeLane === "all" ? dedupedFeed : dedupedFeed.filter((item) => item.lane === activeLane)).slice(0, 12);
  const activityItems = homeState.events.filter((item) => {
    const nickname = String(item.nickname || "").trim();
    return nickname && !["탈퇴한 유저", "탈퇴한 회원", "Unknown", "unknown", "null", "None", "undefined"].includes(nickname);
  }).slice(0, 6);
  const quickLinks = [
    { title: "Web-R", href: "/webr/2.0/", icon: WEBR_HOME_ASSET_BASE + "images/webr/advanced_webR.png", tone: "bg-blue-50 text-blue-700 border-blue-100" },
    { title: "패키지", href: "/r-ecosystem/packages/", icon: WEBR_HOME_ASSET_BASE + "images/svg/R-packages.svg", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { title: "R 에코", href: "/r-ecosystem/", icon: WEBR_HOME_ASSET_BASE + "images/svg/R-packages.svg", tone: "bg-cyan-50 text-cyan-700 border-cyan-100" },
    { title: "커뮤니티", href: "/community/", icon: WEBR_HOME_ASSET_BASE + "images/svg/menu_free.svg", tone: "bg-sky-50 text-sky-700 border-sky-100" },
    { title: "도서", href: "/book/", icon: WEBR_HOME_ASSET_BASE + "images/svg/menu_book.svg", tone: "bg-amber-50 text-amber-700 border-amber-100" },
    { title: "워크샵", href: "/workshop/", icon: WEBR_HOME_ASSET_BASE + "images/svg/menu_workshop.svg", tone: "bg-violet-50 text-violet-700 border-violet-100" }
  ];
  function DashboardSkeleton() {
    return /* @__PURE__ */ React.createElement("div", { class: "space-y-3" }, [0, 1, 2, 3, 4].map((idx) => /* @__PURE__ */ React.createElement("div", { key: idx, class: "rounded-lg border border-slate-100 bg-white p-4" }, /* @__PURE__ */ React.createElement("div", { class: "h-3 w-2/3 rounded-full bg-slate-300 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-3 h-2 w-4/5 rounded-full bg-slate-200 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-2 h-2 w-1/3 rounded-full bg-slate-200 animate-pulse" }))));
  }
  function FeedRow(props) {
    const item = props.item;
    return /* @__PURE__ */ React.createElement("a", { href: item.href, class: "group grid grid-cols-[108px_minmax(0,1fr)] gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 hover:bg-slate-50 md:grid-cols-[132px_minmax(0,1fr)_92px]" }, /* @__PURE__ */ React.createElement("span", { class: "inline-flex h-7 w-fit items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-extrabold text-slate-700 group-hover:border-blue-200 group-hover:text-blue-700" }, item.source), /* @__PURE__ */ React.createElement("span", { class: "min-w-0" }, /* @__PURE__ */ React.createElement("span", { class: "block truncate text-sm font-extrabold text-slate-950 group-hover:text-blue-700" }, item.title), item.detail ? /* @__PURE__ */ React.createElement("span", { class: "mt-1 block truncate text-sm text-slate-500" }, item.detail) : null, /* @__PURE__ */ React.createElement("span", { class: "mt-2 block text-xs font-semibold text-slate-400" }, item.meta)), /* @__PURE__ */ React.createElement("span", { class: "hidden self-center text-right text-xs font-bold text-blue-600 md:block" }, "열기"));
  }
  function LaneButton(props) {
    const lane = props.lane;
    const active = lane.id === activeLane;
    return /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setActiveLane(lane.id), class: (active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700") + " inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-extrabold" }, lane.label, /* @__PURE__ */ React.createElement("span", { class: (active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500") + " rounded px-1.5 text-[11px]" }, lane.count));
  }
  function LivePanel() {
    return /* @__PURE__ */ React.createElement("aside", { class: "rounded-lg border border-slate-200 bg-slate-950 p-4 text-white" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("h3", { class: "text-base font-extrabold" }, "지금 Web-R"), /* @__PURE__ */ React.createElement("span", { class: "relative flex h-3 w-3" }, /* @__PURE__ */ React.createElement("span", { class: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ React.createElement("span", { class: "relative inline-flex h-3 w-3 rounded-full bg-emerald-300" }))), /* @__PURE__ */ React.createElement("div", { class: "mt-4 space-y-3" }, activityItems.length ? activityItems.map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: item.uuid || item.created_at || idx, class: "rounded-md bg-white/5 p-3" }, /* @__PURE__ */ React.createElement("p", { class: "text-sm font-semibold leading-5" }, homeShortText(homeActivityMessage(item.event, item.nickname), 70)), /* @__PURE__ */ React.createElement("p", { class: "mt-1 text-xs text-slate-300" }, homeRelativeTime(item.created_at || item.updated_at)))) : /* @__PURE__ */ React.createElement("a", { href: "/community/", class: "block rounded-md bg-white/10 p-3 text-sm font-semibold text-slate-100 hover:bg-white/15" }, "최근 활동 보기")));
  }
  const metricRows = [
    { label: "R 패키지", value: lanes.find((lane) => lane.id === "packages").count, href: "/r-ecosystem/packages/" },
    { label: "R Community", value: lanes.find((lane) => lane.id === "rcommunity").count, href: "/community/" },
    { label: "워크샵", value: lanes.find((lane) => lane.id === "workshops").count, href: "/workshop/" }
  ];
  return /* @__PURE__ */ React.createElement("section", { class: "w-full max-w-7xl" }, /* @__PURE__ */ React.createElement("div", { class: "rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { class: "text-sm font-extrabold text-blue-700" }, "Web-R Update Board"), /* @__PURE__ */ React.createElement("h2", { class: "text-2xl font-extrabold text-slate-950" }, "최근에 바뀐 R 콘텐츠를 한 화면에서")), /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-3 gap-2 sm:grid-cols-6" }, quickLinks.map((link) => /* @__PURE__ */ React.createElement("a", { key: link.href, href: link.href, class: "flex h-[74px] flex-col items-center justify-center gap-1 rounded-lg border px-2 text-xs font-extrabold " + link.tone }, /* @__PURE__ */ React.createElement("img", { src: link.icon, alt: "", class: "h-6 w-6 object-contain", loading: "lazy" }), link.title))))), /* @__PURE__ */ React.createElement("div", { class: "mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]" }, /* @__PURE__ */ React.createElement("div", { class: "rounded-lg border border-slate-200 bg-slate-50" }, /* @__PURE__ */ React.createElement("div", { class: "border-b border-slate-200 p-4" }, /* @__PURE__ */ React.createElement("div", { class: "flex gap-2 overflow-x-auto pb-1" }, lanes.map((lane) => /* @__PURE__ */ React.createElement(LaneButton, { key: lane.id, lane })))), homeState.loading ? /* @__PURE__ */ React.createElement("div", { class: "p-4" }, /* @__PURE__ */ React.createElement(DashboardSkeleton, null)) : activeItems.length ? /* @__PURE__ */ React.createElement("div", { class: "bg-white" }, activeItems.map((item, idx) => /* @__PURE__ */ React.createElement(FeedRow, { key: item.href + item.title + idx, item }))) : /* @__PURE__ */ React.createElement("div", { class: "bg-white p-6 text-sm font-semibold text-slate-500" }, "표시할 최근 업데이트가 없습니다.")), /* @__PURE__ */ React.createElement("div", { class: "space-y-3" }, /* @__PURE__ */ React.createElement(LivePanel, null), /* @__PURE__ */ React.createElement("div", { class: "rounded-lg border border-slate-200 bg-white p-4" }, /* @__PURE__ */ React.createElement("h3", { class: "text-base font-extrabold text-slate-950" }, "업데이트 지표"), /* @__PURE__ */ React.createElement("div", { class: "mt-3 divide-y divide-slate-100" }, metricRows.map((row) => /* @__PURE__ */ React.createElement("a", { key: row.label, href: row.href, class: "flex items-center justify-between py-3 text-sm font-bold text-slate-700 hover:text-blue-700" }, /* @__PURE__ */ React.createElement("span", null, row.label), /* @__PURE__ */ React.createElement("span", { class: "rounded-md bg-slate-100 px-2 py-1 text-xs" }, row.value))))))));
}
function Div_main_statistics_skeleton() {
  function Div_Sub(props) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        class: "flex items-center w-full w-max-md p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow",
        role: "alert"
      },
      /* @__PURE__ */ React.createElement("img", { src: props.svg, class: "w-6 h-6" }),
      /* @__PURE__ */ React.createElement("div", { class: "pl-4 text-sm font-normal animate-pulse" }, /* @__PURE__ */ React.createElement("div", { class: "h-2.5 bg-gray-300 rounded-full w-full mb-2.5" }), /* @__PURE__ */ React.createElement("div", { class: "w-32 h-2 bg-gray-200 rounded-full" }))
    );
  }
  return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 gap-4 mx-auto md:grid-cols-3" }, /* @__PURE__ */ React.createElement(Div_Sub, { svg: "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/member.svg" }), /* @__PURE__ */ React.createElement(Div_Sub, { svg: "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/visitors.svg" }), /* @__PURE__ */ React.createElement(Div_Sub, { svg: "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/pageview.svg" }));
}
function Div_main_board_skeleton() {
  function Div_table_skeleton({ title, id, rows = 5 }) {
    const Row = () => /* @__PURE__ */ React.createElement("tr", { class: "bg-white border-b" }, /* @__PURE__ */ React.createElement("td", { class: "px-6 py-4" }, /* @__PURE__ */ React.createElement("div", { class: "h-2.5 bg-gray-300 rounded-full w-3/4 mb-2.5 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "h-2 bg-gray-200 rounded-full w-1/3 animate-pulse" })));
    return /* @__PURE__ */ React.createElement("div", { class: "w-full", id }, /* @__PURE__ */ React.createElement("h5", { class: "mb-2 text-xl pb-4 font-bold tracking-tight text-gray-900" }, title), /* @__PURE__ */ React.createElement("div", { class: "rounded-lg border bg-white" }, /* @__PURE__ */ React.createElement("table", { class: "w-full text-sm text-left text-gray-500" }, /* @__PURE__ */ React.createElement("thead", { class: "text-xs text-gray-700 uppercase bg-gray-50" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { class: "px-6 py-3" }))), /* @__PURE__ */ React.createElement("tbody", null, Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ React.createElement(Row, { key: i }))))));
  }
  function Div_card({ title, id, children }) {
    return /* @__PURE__ */ React.createElement("div", { class: "w-full rounded-lg border bg-white p-4", id }, /* @__PURE__ */ React.createElement("h6", { class: "mb-3 text-base font-semibold text-gray-900" }, title), children);
  }
  const Bullet = () => /* @__PURE__ */ React.createElement("div", { class: "flex items-center gap-3 py-2" }, /* @__PURE__ */ React.createElement("div", { class: "h-2.5 w-2.5 rounded-full bg-gray-300 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "h-2.5 bg-gray-300 rounded-full w-3/4 animate-pulse" }));
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-row pt-12 pb-12 justify-center", id: "div_board" }, /* @__PURE__ */ React.createElement("div", { class: "container mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 gap-6 md:grid-cols-4" }, /* @__PURE__ */ React.createElement("div", { class: "col-span-1 flex flex-col gap-6 md:col-span-3" }, /* @__PURE__ */ React.createElement(Div_table_skeleton, { title: "\uCEE4\uBBA4\uB2C8\uD2F0", id: "div_main_board_free", rows: 6 }), /* @__PURE__ */ React.createElement(Div_table_skeleton, { title: "\uCD5C\uADFC \uD65C\uB3D9", id: "div_main_new_members", rows: 6 })), /* @__PURE__ */ React.createElement("div", { class: "col-span-1 flex flex-col gap-6" }, /* @__PURE__ */ React.createElement(Div_card, { title: "\uACF5\uC9C0\uC0AC\uD56D", id: "div_main_board_notice" }, /* @__PURE__ */ React.createElement(Bullet, null), /* @__PURE__ */ React.createElement(Bullet, null), /* @__PURE__ */ React.createElement(Bullet, null)), /* @__PURE__ */ React.createElement(Div_card, { title: "\uC720\uD29C\uBE0C", id: "div_main_youtube" }, /* @__PURE__ */ React.createElement("div", { class: "w-full aspect-video rounded-md bg-gray-300 animate-pulse" }))))));
}
async function get_div_main_statistics() {
  function Div_sub(props) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        id: "toast-simple",
        class: "flex items-center w-full w-max-md p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow",
        role: "alert"
      },
      /* @__PURE__ */ React.createElement("img", { src: props.svg, class: "w-6 h-6" }),
      /* @__PURE__ */ React.createElement("div", { class: "pl-4 text-sm font-normal" }, /* @__PURE__ */ React.createElement("div", { class: "pl-4 text-md font-bold" }, props.title), /* @__PURE__ */ React.createElement("div", { class: "pl-4 text-sm font-normal" }, props.content.toLocaleString(), props.unit))
    );
  }
  function Div_result(props) {
    return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 gap-4 mx-auto md:grid-cols-3" }, /* @__PURE__ */ React.createElement(
      Div_sub,
      {
        title: "\uCD1D \uAC00\uC785\uC790 \uC218",
        content: props.data.cnt_member,
        unit: "\uBA85",
        svg: "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/member.svg"
      }
    ), /* @__PURE__ */ React.createElement(
      Div_sub,
      {
        title: "\uC624\uB298\uC758 \uBC29\uBB38\uC790 \uC218",
        content: props.data.cnt_visitor,
        unit: "\uBA85",
        svg: "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/visitors.svg"
      }
    ), /* @__PURE__ */ React.createElement(
      Div_sub,
      {
        title: "\uC624\uB298\uC758 \uD398\uC774\uC9C0 \uBDF0",
        content: props.data.cnt_pageview,
        unit: "\uAC74",
        svg: "https://cdn.jsdelivr.net/gh/statground/Statground_CDN/assets3/images/svg/pageview.svg"
      }
    ));
  }
  const data = await fetch("/ajax_index_statistics/", { method: "POST" }).then((res) => res.json()).then((res) => res);
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_result, { data }), document.getElementById("div_main_statistics"));
}
function get_book_list() {
  var API_URL = "/book/ajax_get_book_list/";
  var MOUNT_ID = "div_book_list";
  var ICONS = {
    kyobo: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/kyobobook2.png",
    yes24: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/yes24.png",
    ypbooks: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/ypbooks.png",
    coupang: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/coupang.png",
    leanpub: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/LeanPub.png",
    bookdown: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/bookdown.png",
    board: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/menu_free.svg",
    default_vendor: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/icon_default.png",
    default_cover: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/default_book.png"
  };
  function iconForSource(source) {
    var s = (source || "").toLowerCase();
    if (s.indexOf("\uAD50\uBCF4") > -1 || s.indexOf("kyobo") > -1)
      return ICONS.kyobo;
    if (s.indexOf("yes24") > -1)
      return ICONS.yes24;
    if (s.indexOf("\uC601\uD48D") > -1 || s.indexOf("ypbooks") > -1)
      return ICONS.ypbooks;
    if (s.indexOf("\uCFE0\uD321") > -1 || s.indexOf("coupang") > -1)
      return ICONS.coupang;
    if (s.indexOf("leanpub") > -1)
      return ICONS.leanpub;
    if (s.indexOf("bookdown") > -1)
      return ICONS.bookdown;
    return ICONS.default_vendor;
  }
  function pad3(v) {
    return (v == null ? "000" : String(v)).padStart(3, "0");
  }
  function normalizeRows(raw) {
    if (!raw)
      return [];
    if (Array.isArray(raw))
      return raw;
    if (Array.isArray(raw.data))
      return raw.data;
    if (Array.isArray(raw.results))
      return raw.results;
    if (Array.isArray(raw.rows))
      return raw.rows;
    var arr = Object.keys(raw).map(function(k) {
      return raw[k];
    });
    var nestedArr = arr.find(Array.isArray);
    return Array.isArray(nestedArr) ? nestedArr : arr;
  }
  var cls = {
    wrap: "w-full pt-4",
    navWrap: "relative",
    navBtnBase: "absolute z-10 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black text-white shadow",
    navBtnL: "left-2",
    navBtnR: "right-2",
    slider: "flex gap-3 overflow-x-scroll scroll-smooth pb-2 scrollbar-hide",
    card: "flex flex-col justify-start w-64 min-w-64 h-48 p-3 rounded-xl shadow bg-white border hover:border-gray-900",
    img: "w-full object-contain rounded-md border bg-white",
    title: "font-semibold leading-snug text-center",
    meta: "text-xs text-gray-500 text-center",
    vendors: "w-full justify-center gap-2 flex-wrap items-center"
  };
  function groupRows(raw) {
    var rows = normalizeRows(raw);
    var byBook = /* @__PURE__ */ new Map();
    rows.forEach(function(r) {
      if (!r)
        return;
      var key = r.uuid || r.title || "rnd-" + Math.random().toString(16).slice(2);
      if (!byBook.has(key)) {
        byBook.set(key, {
          uuid: r.uuid,
          uuid_board_category: r.uuid_board_category,
          title: r.title,
          publisher: r.publisher,
          published_at: r.published_at,
          url_image: r.url_image,
          randnum: r.randnum == null ? Math.random() : r.randnum,
          sources: {}
        });
      }
      var vendorName = r.marketplace != null && r.marketplace !== "" ? r.marketplace : r.source;
      if (vendorName && r.url) {
        var s = String(vendorName).trim();
        if (!byBook.get(key).sources[s])
          byBook.get(key).sources[s] = [];
        byBook.get(key).sources[s].push(r.url);
      }
    });
    return Array.from(byBook.values()).map(function(b) {
      var vendors = Object.entries(b.sources).map(function(_ref) {
        var source = _ref[0], urls = _ref[1];
        return { source, url: urls[Math.floor(Math.random() * urls.length)] };
      });
      return Object.assign({}, b, { vendors });
    }).sort(function(a, b) {
      return (a.randnum || 0) - (b.randnum || 0);
    });
  }
  function ChevronLeftSVG() {
    return React.createElement(
      "svg",
      { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": "true" },
      React.createElement("path", {
        d: "M15 6l-6 6 6 6",
        fill: "none",
        stroke: "white",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round"
      })
    );
  }
  function ChevronRightSVG() {
    return React.createElement(
      "svg",
      { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": "true" },
      React.createElement("path", {
        d: "M9 6l6 6-6 6",
        fill: "none",
        stroke: "white",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round"
      })
    );
  }
  function CardComp(props) {
    var b = props.b, idx = props.idx, activeIdx = props.activeIdx, setActiveIdx = props.setActiveIdx;
    var GAP_PX = 8, MIN_IMG = 60;
    var hasVendors = Array.isArray(b.vendors) && b.vendors.length > 0;
    var isOpen = activeIdx === idx && hasVendors;
    var cardRef = React.useRef(null);
    var titleRef = React.useRef(null);
    var metaRef = React.useRef(null);
    var vendorsRef = React.useRef(null);
    var _React$useState = React.useState(100), imgH = _React$useState[0], setImgH = _React$useState[1];
    function recalc() {
      if (!cardRef.current)
        return;
      var innerH = cardRef.current.clientHeight - 24;
      var titleH = titleRef.current ? titleRef.current.offsetHeight : 0;
      var metaH = metaRef.current ? metaRef.current.offsetHeight : 0;
      var vH = 0;
      if (isOpen && vendorsRef.current) {
        var prev = vendorsRef.current.style.display;
        vendorsRef.current.style.display = "flex";
        vH = vendorsRef.current.offsetHeight || 0;
        vendorsRef.current.style.display = prev;
      }
      var gaps = 2 + (isOpen ? 1 : 0);
      var leftover = innerH - (titleH + metaH + vH + gaps * GAP_PX);
      setImgH(Math.max(MIN_IMG, leftover - (isOpen ? 10 : 0)));
    }
    React.useLayoutEffect(recalc, [isOpen]);
    React.useEffect(function() {
      function onResize() {
        recalc();
      }
      window.addEventListener("resize", onResize);
      var t = setTimeout(recalc, 0);
      return function() {
        window.removeEventListener("resize", onResize);
        clearTimeout(t);
      };
    }, []);
    function onToggle() {
      setActiveIdx(function(p) {
        return p === idx ? null : idx;
      });
    }
    function onKey(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    }
    function goBoard(e) {
      e.stopPropagation();
      window.open("/book/" + pad3(b.uuid_board_category) + "/", "_self");
    }
    return React.createElement(
      "div",
      { ref: cardRef, className: cls.card, role: "button", tabIndex: 0, onClick: onToggle, onKeyDown: onKey },
      React.createElement("img", {
        className: cls.img,
        style: { height: imgH + "px" },
        src: b.url_image || ICONS.default_cover,
        alt: b.title || "book",
        loading: "lazy"
      }),
      React.createElement("div", { style: { height: GAP_PX + "px" } }),
      React.createElement("div", { ref: titleRef, className: cls.title }, b.title || ""),
      React.createElement("div", { style: { height: GAP_PX + "px" } }),
      React.createElement(
        "div",
        { ref: metaRef, className: cls.meta },
        b.publisher ? b.publisher : " ",
        b.published_at ? " \xB7 " + b.published_at : ""
      ),
      isOpen ? React.createElement("div", { style: { height: GAP_PX + "px" } }) : null,
      React.createElement(
        "div",
        {
          ref: vendorsRef,
          className: "purchase-buttons " + cls.vendors,
          style: { display: isOpen ? "flex" : "none" },
          onClick: function(e) {
            e.stopPropagation();
          }
        },
        (b.vendors || []).map(function(v, i) {
          return React.createElement(
            "a",
            { key: i, href: v.url, target: "_blank", rel: "noopener", title: v.source },
            React.createElement("img", {
              className: "h-6 w-auto",
              src: iconForSource(v.source),
              alt: v.source,
              loading: "lazy"
            })
          );
        }),
        React.createElement(
          "button",
          { onClick: goBoard, title: "\uAC8C\uC2DC\uD310", type: "button" },
          React.createElement("img", {
            className: "h-6 w-auto",
            src: ICONS.board,
            alt: "\uAC8C\uC2DC\uD310",
            loading: "lazy"
          })
        )
      )
    );
  }
  function DivBookList() {
    var _React$useState2 = React.useState([]), books = _React$useState2[0], setBooks = _React$useState2[1];
    var _React$useState3 = React.useState(null), activeIdx = _React$useState3[0], setActiveIdx = _React$useState3[1];
    React.useEffect(function() {
      fetch(API_URL).then(function(r) {
        if (!r.ok)
          throw new Error("HTTP " + r.status);
        return r.json();
      }).then(function(raw) {
        var grouped = groupRows(raw);
        setBooks(grouped);
      }).catch(function(err) {
        console.warn("book list fetch error:", err);
        setBooks([]);
      });
    }, []);
    React.useEffect(
      function() {
        var slider = document.getElementById("div_book_list_slider");
        if (!slider)
          return;
        function scrollByPage(d) {
          slider.scrollBy({ left: d * slider.offsetWidth, behavior: "smooth" });
        }
        var n = document.getElementById("div_book_list_next");
        var p = document.getElementById("div_book_list_prev");
        function next() {
          scrollByPage(1);
        }
        function prev() {
          scrollByPage(-1);
        }
        n && n.addEventListener("click", next);
        p && p.addEventListener("click", prev);
        function wheel(e) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            slider.scrollBy({ left: e.deltaY });
            e.preventDefault();
          }
        }
        slider.addEventListener("wheel", wheel, { passive: false });
        return function() {
          n && n.removeEventListener("click", next);
          p && p.removeEventListener("click", prev);
          slider.removeEventListener("wheel", wheel);
        };
      },
      [books.length]
    );
    return React.createElement(
      "div",
      { className: cls.wrap },
      React.createElement(
        "div",
        { className: cls.navWrap },
        React.createElement(
          "button",
          { id: "div_book_list_prev", className: cls.navBtnBase + " " + cls.navBtnL },
          React.createElement(ChevronLeftSVG)
        ),
        React.createElement(
          "button",
          { id: "div_book_list_next", className: cls.navBtnBase + " " + cls.navBtnR },
          React.createElement(ChevronRightSVG)
        ),
        React.createElement(
          "div",
          { id: "div_book_list_slider", className: cls.slider },
          books.map(function(b, idx) {
            return React.createElement(CardComp, {
              key: b.uuid || idx,
              b,
              idx,
              activeIdx,
              setActiveIdx
            });
          })
        )
      ),
      books.length === 0 ? React.createElement(
        "div",
        { className: "text-center text-sm text-gray-500 pt-2" },
        "\uD45C\uC2DC\uD560 \uCC45\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
      ) : null
    );
  }
  function mount() {
    var mountEl = document.getElementById(MOUNT_ID);
    if (!mountEl)
      return;
    if (typeof ReactDOM !== "undefined" && typeof ReactDOM.render === "function") {
      ReactDOM.render(React.createElement(DivBookList), mountEl);
      return;
    }
    if (typeof ReactDOM !== "undefined" && typeof ReactDOM.createRoot === "function") {
      if (!window.__webRBookListRoots) {
        window.__webRBookListRoots = /* @__PURE__ */ new WeakMap();
      }
      var root = window.__webRBookListRoots.get(mountEl);
      if (!root) {
        root = ReactDOM.createRoot(mountEl);
        window.__webRBookListRoots.set(mountEl, root);
      }
      root.render(React.createElement(DivBookList));
      return;
    }
    throw new Error("ReactDOM.render/createRoot \uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  mount();
}
window.get_book_list = get_book_list;
async function get_div_main_board() {
  function Div_new_article_list(props) {
    const cu = props.data.category_url;
    const href = getIndexArticleHref(props.data);
    let category_title = "\uCEE4\uBBA4\uB2C8\uD2F0";
    let category_title_color = " bg-blue-100 text-blue-700 border-blue-300";
    if (cu === "free") {
      category_title = "\uC790\uC720\uAC8C\uC2DC\uD310";
      category_title_color = " bg-blue-100 text-blue-700 border-blue-300";
    } else if (cu === "rblogger") {
      category_title = "R-Blogger";
      category_title_color = " bg-purple-100 text-purple-700 border-purple-300";
    } else if (cu === "rproject") {
      category_title = "R-Project (Official)";
      category_title_color = " bg-sky-100 text-sky-700 border-sky-300";
    } else if (cu === "notebook") {
      category_title = "Web-R Notebook";
      category_title_color = " bg-emerald-100 text-emerald-700 border-emerald-300";
    }
    return /* @__PURE__ */ React.createElement("div", { class: "bg-white w-full" }, /* @__PURE__ */ React.createElement(
      "a",
      {
        href,
        class: "flex flex-col px-6 py-4 space-y-1 cursor-pointer hover:bg-gray-50 rounded-lg mx-3 my-2"
      },
      /* @__PURE__ */ React.createElement("div", { class: "flex flex-row items-center space-x-2" }, /* @__PURE__ */ React.createElement(
        "span",
        {
          class: "px-2 py-0.5 border rounded-full text-xs font-semibold w-fit max-w-9/12" + category_title_color
        },
        category_title
      ), /* @__PURE__ */ React.createElement("span", { class: "font-bold text-sm truncate" }, props.data.title), /* @__PURE__ */ React.createElement(Span_btn_article_new, { toggle: props.data.is_new }), /* @__PURE__ */ React.createElement(Span_btn_article_secret, { toggle: props.data.is_secret }), /* @__PURE__ */ React.createElement(Span_btn_my_article, { toggle: props.data.check_reader })),
      /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center space-x-2" }, /* @__PURE__ */ React.createElement(
        Span_btn_user,
        {
          user_nickname: props.data.user_nickname,
          role: props.data.user_role
        }
      ), /* @__PURE__ */ React.createElement(Span_btn_date, { date: props.data.created_at }), /* @__PURE__ */ React.createElement(Span_btn_article_read, { cnt_read: props.data.cnt_read }), /* @__PURE__ */ React.createElement(Span_btn_article_comment, { cnt_comment: props.data.cnt_comment }))
    ));
  }
  function TabButton({ active, onClick, children }) {
    const base = "px-3 py-1.5 text-xs font-bold rounded-full transition-all select-none";
    const activeCls = " bg-blue-600 text-white shadow-sm";
    const inActiveCls = " bg-gray-100 text-gray-700 hover:bg-gray-200";
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick,
        class: base + (active ? activeCls : inActiveCls)
      },
      children
    );
  }
  function Col(props) {
    const [activeTab, setActiveTab] = React.useState("all");
    const arr = Object.keys(props.data || {}).map((k) => props.data[k]);
    const sortByCreatedAtDesc = (a, b) => {
      const da = new Date(String(a.created_at).replace(" ", "T"));
      const db = new Date(String(b.created_at).replace(" ", "T"));
      return db - da;
    };
    const freeList = arr.filter((x) => x.category_url === "free").sort(sortByCreatedAtDesc);
    const rbloggerList = arr.filter((x) => x.category_url === "rblogger").sort(sortByCreatedAtDesc);
    const rprojectList = arr.filter((x) => x.category_url === "rproject").sort(sortByCreatedAtDesc);
    const notebookList = arr.filter((x) => x.category_url === "notebook").sort(sortByCreatedAtDesc);
    const pick = [];
    if (freeList.length)
      pick.push(freeList[0]);
    if (rbloggerList.length)
      pick.push(rbloggerList[0]);
    if (rprojectList.length)
      pick.push(rprojectList[0]);
    if (notebookList.length)
      pick.push(notebookList[0]);
    const allList = pick.sort(sortByCreatedAtDesc);
    let current = allList;
    if (activeTab === "free")
      current = freeList;
    if (activeTab === "rblogger")
      current = rbloggerList;
    if (activeTab === "rproject")
      current = rprojectList;
    if (activeTab === "notebook")
      current = notebookList;
    return /* @__PURE__ */ React.createElement("div", { class: "w-full" }, /* @__PURE__ */ React.createElement("h5", { class: "mb-2 text-xl pb-4 font-bold tracking-tight text-gray-900" }, "\uCEE4\uBBA4\uB2C8\uD2F0"), /* @__PURE__ */ React.createElement("div", { class: "rounded-lg bg-white shadow-sm overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center gap-2 px-4 pt-4 pb-3 bg-white" }, /* @__PURE__ */ React.createElement(TabButton, { active: activeTab === "all", onClick: () => setActiveTab("all") }, "\uC804\uCCB4\uBCF4\uAE30"), /* @__PURE__ */ React.createElement(
      TabButton,
      {
        active: activeTab === "free",
        onClick: () => setActiveTab("free")
      },
      "\uC790\uC720\uAC8C\uC2DC\uD310"
    ), /* @__PURE__ */ React.createElement(
      TabButton,
      {
        active: activeTab === "rblogger",
        onClick: () => setActiveTab("rblogger")
      },
      "R-Blogger"
    ), /* @__PURE__ */ React.createElement(
      TabButton,
      {
        active: activeTab === "rproject",
        onClick: () => setActiveTab("rproject")
      },
      "R-Project (Official)"
    ), /* @__PURE__ */ React.createElement(
      TabButton,
      {
        active: activeTab === "notebook",
        onClick: () => setActiveTab("notebook")
      },
      "Web-R Notebook"
    )), /* @__PURE__ */ React.createElement("div", null, current.length > 0 ? current.map((article, idx) => /* @__PURE__ */ React.createElement(
      Div_new_article_list,
      {
        key: article.uuid || article.url || idx,
        data: article
      }
    )) : /* @__PURE__ */ React.createElement("div", { class: "px-6 py-6 text-sm text-gray-500" }, "\uD45C\uC2DC\uD560 \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."))));
  }
  const data = await fetch("/ajax_index_board/", { method: "POST" }).then((res) => res.json());
  ReactDOM.render(/* @__PURE__ */ React.createElement(Col, { data }), document.getElementById("div_main_board_free"));
}
async function get_div_main_board_notice() {
  function Div_new_notice_list(props) {
    let category_menu = "intro/";
    let category_url = "notice";
    return /* @__PURE__ */ React.createElement("div", { class: "bg-white w-full" }, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: "/" + category_menu + category_url + "/read/" + props.data.uuid + "/",
        class: "flex flex-col px-6 py-4 space-y-1 cursor-pointer hover:bg-gray-100 w-full"
      },
      /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-start items-center space-x-2" }, /* @__PURE__ */ React.createElement("span", { class: "font-bold text-sm w-fit max-w-9/12 truncate ..." }, props.data.title)),
      /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap justify-start items-center space-x-2" }, /* @__PURE__ */ React.createElement(Span_btn_date, { date: props.data.created_at }), /* @__PURE__ */ React.createElement(Span_btn_article_new, { toggle: props.data.is_new }), /* @__PURE__ */ React.createElement(Span_btn_article_secret, { toggle: props.data.is_secret }))
    ));
  }
  function Col(props) {
    const articleList = Object.keys(props.data).map((article, idx) => /* @__PURE__ */ React.createElement(Div_new_notice_list, { key: props.data[article] && props.data[article].uuid || idx, data: props.data[article] }));
    return /* @__PURE__ */ React.createElement("div", { class: "w-full" }, /* @__PURE__ */ React.createElement("h6", { class: "mb-3 text-base font-semibold text-gray-900" }, "\uACF5\uC9C0\uC0AC\uD56D"), /* @__PURE__ */ React.createElement("div", { class: "rounded-lg bg-white" }, articleList));
  }
  const data = await fetch("/ajax_index_notice/", { method: "POST" }).then((res) => res.json()).then((res) => res);
  ReactDOM.render(
    /* @__PURE__ */ React.createElement(Col, { data, title: "\uACF5\uC9C0\uC0AC\uD56D" }),
    document.getElementById("div_main_board_notice")
  );
}
async function get_div_main_youtube() {
  function Div_main_youtube(props) {
    const { uuid, title, youtube_thumbnail } = props.data;
    return /* @__PURE__ */ React.createElement("div", { class: "w-full" }, /* @__PURE__ */ React.createElement("h6", { class: "mb-3 text-base font-semibold text-gray-900" }, "\uC720\uD29C\uBE0C"), /* @__PURE__ */ React.createElement(
      "div",
      {
        class: "rounded-lg bg-white overflow-hidden cursor-pointer hover:bg-gray-50 transition",
        onClick: () => window.location.href = `/workshop/youtube/read/${uuid}/`
      },
      /* @__PURE__ */ React.createElement("div", { class: "flex flex-col items-center" }, /* @__PURE__ */ React.createElement("img", { src: youtube_thumbnail, alt: "YouTube Thumbnail", class: "w-full object-cover" }), /* @__PURE__ */ React.createElement("div", { class: "px-4 py-3 text-sm text-gray-800 text-center font-medium truncate w-full" }, title))
    ));
  }
  const data = await fetch("/ajax_index_youtube/", { method: "POST" }).then((res) => res.json()).catch((err) => {
    console.error("YouTube fetch error:", err);
    return null;
  });
  if (!data || !data[0])
    return;
  ReactDOM.render(
    /* @__PURE__ */ React.createElement(Div_main_youtube, { data: data[0] }),
    document.getElementById("div_main_youtube")
  );
}
async function get_div_main_new_event() {
  const BLOCKED_EVENT_NICKNAMES = /* @__PURE__ */ new Set(["\uD0C8\uD1F4\uD55C \uC720\uC800", "\uD0C8\uD1F4\uD55C \uD68C\uC6D0", "Unknown", "unknown", "null", "None", "undefined"]);
  function normalizeEventNickname(value) {
    if (value === void 0 || value === null)
      return "";
    return String(value).trim();
  }
  function isVisibleEventItem(item) {
    if (!item)
      return false;
    const nickname = normalizeEventNickname(item.nickname);
    if (!nickname || BLOCKED_EVENT_NICKNAMES.has(nickname))
      return false;
    return true;
  }
  function makeEventMessage(event, nickname) {
    switch (event) {
      case "\uD68C\uC6D0\uAC00\uC785":
        return `${nickname}\uB2D8\uC774 \uAC00\uC785\uD558\uC600\uC2B5\uB2C8\uB2E4.`;
      case "\uC811\uC18D\uC911":
        return `${nickname}\uB2D8\uC774 \uC811\uC18D\uC911\uC785\uB2C8\uB2E4.`;
      case "\uAC8C\uC2DC\uD310 - youtube":
        return `\uC720\uD29C\uBE0C\uC5D0 \uC0C8\uB85C\uC6B4 \uC601\uC0C1\uC774 \uC5C5\uB85C\uB4DC \uB418\uC5C8\uC2B5\uB2C8\uB2E4.`;
      case "\uAC8C\uC2DC\uD310 - notice":
        return `\uC0C8\uB85C\uC6B4 \uACF5\uC9C0\uC0AC\uD56D\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`;
      case "\uB313\uAE00":
        return `${nickname}\uB2D8\uC774 \uAC8C\uC2DC\uBB3C\uC5D0 \uB313\uAE00\uC744 \uB2EC\uC558\uC2B5\uB2C8\uB2E4`;
      default:
        if (typeof event === "string") {
          if (event.startsWith("\uAC8C\uC2DC\uD310 - ")) {
            return `${nickname}\uB2D8\uC774 \uCEE4\uBBA4\uB2C8\uD2F0\uC5D0 \uC0C8 \uAE00\uC744 \uAC8C\uC2DC\uD558\uC600\uC2B5\uB2C8\uB2E4.`;
          } else if (event.startsWith("Web-R - ")) {
            const appName = event.replace("Web-R - ", "");
            return `${nickname}\uB2D8\uC774 ${appName}\uC744(\uB97C) \uC2E4\uD589\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.`;
          }
        }
        return `${nickname}\uB2D8\uC758 \uD65C\uB3D9\uC774 \uC788\uC2B5\uB2C8\uB2E4.`;
    }
  }
  function Div_new_event_list(props) {
    const { event, created_at, nickname } = props.data || {};
    const displayNickname = normalizeEventNickname(nickname) || "\uD68C\uC6D0";
    const message = makeEventMessage(event, displayNickname);
    return /* @__PURE__ */ React.createElement("div", { class: "bg-white w-full border-b last:border-b-0 hover:bg-slate-50" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-start gap-3 px-6 py-4" }, /* @__PURE__ */ React.createElement("span", { class: "relative mt-1.5 flex h-3 w-3 shrink-0" }, /* @__PURE__ */ React.createElement("span", { class: "absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" }), /* @__PURE__ */ React.createElement("span", { class: "relative inline-flex h-3 w-3 rounded-full bg-blue-500" })), /* @__PURE__ */ React.createElement("div", { class: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { class: "truncate text-sm font-medium text-gray-800" }, message), /* @__PURE__ */ React.createElement("div", { class: "mt-2 flex flex-wrap items-center gap-2" }, created_at ? /* @__PURE__ */ React.createElement(Span_btn_date, { date: created_at }) : null, /* @__PURE__ */ React.createElement("span", { class: "inline-flex h-[22px] items-center rounded-md bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700" }, homeRelativeTime(created_at))))));
  }
  function Col(props) {
    var _a;
    const sortedData = Object.values(props.data || {}).filter(isVisibleEventItem).sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
    const items = sortedData.map((item, idx) => /* @__PURE__ */ React.createElement(Div_new_event_list, { key: item.uuid || item.created_at || idx, data: item }));
    return /* @__PURE__ */ React.createElement("div", { class: "w-full" }, /* @__PURE__ */ React.createElement("div", { class: "mb-2 flex items-center justify-between gap-3 pb-4" }, /* @__PURE__ */ React.createElement("h5", { class: "text-xl font-bold tracking-tight text-gray-900" }, (_a = props.title) != null ? _a : "\uCD5C\uADFC \uD65C\uB3D9"), /* @__PURE__ */ React.createElement("span", { class: "inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700" }, /* @__PURE__ */ React.createElement("span", { class: "h-2 w-2 animate-pulse rounded-full bg-blue-500" }), "\uC2E4\uC2DC\uAC04 \uC774\uC6A9 \uD750\uB984")), /* @__PURE__ */ React.createElement("div", { class: "rounded-lg border border-slate-100 bg-white overflow-hidden shadow-sm" }, items.length ? items : /* @__PURE__ */ React.createElement("a", { href: "/community/", class: "block px-6 py-5 text-sm font-semibold text-slate-600 hover:text-blue-700" }, "\uCD5C\uADFC \uD65C\uB3D9 \uBCF4\uB7EC\uAC00\uAE30")));
  }
  const data = await fetch("/ajax_index_event/", { method: "POST" }).then((res) => res.json()).catch((err) => {
    console.error("index_event fetch error:", err);
    return {};
  });
  ReactDOM.render(
    /* @__PURE__ */ React.createElement(Col, { data, title: "\uCD5C\uADFC \uD65C\uB3D9" }),
    document.getElementById("div_main_new_members")
  );
}
function waitForUtilityStyles() {
  if (typeof window.__webrWhenUtilityStylesReady === "function") {
    return window.__webrWhenUtilityStylesReady(7500);
  }
  if (window.__webrUtilityStylesReady) {
    return Promise.resolve();
  }
  return new Promise((resolve) => window.setTimeout(resolve, 2500));
}
function loadIndexContent() {
  get_div_main_statistics();
}
function set_main() {
  function Div_main() {
    return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-[25px] mt-[50px] px-[10px] py-[0px] md:px-[100px] md:py-[20px]" }, /* @__PURE__ */ React.createElement("div", { id: "div_main_header", class: "w-full" }), /* @__PURE__ */ React.createElement("div", { id: "div_home_service_hub", class: "w-full" }), /* @__PURE__ */ React.createElement("div", { id: "div_main_statistics", class: "w-full max-w-7xl" }));
  }
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main, null), document.getElementById("div_main"));
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_header, null), document.getElementById("div_main_header"));
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_home_update_dashboard, null), document.getElementById("div_home_service_hub"));
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_statistics_skeleton, null), document.getElementById("div_main_statistics"));
  waitForUtilityStyles().then(loadIndexContent);
}
window.set_main = set_main;
