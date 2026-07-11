let class_span_btn_default = "flex flex-row justify-center items-center w-fit h-[20px] px-1.5 rounded-xl";
const webr_status_badge_base = "inline-flex h-[24px] min-w-[44px] items-center justify-center rounded-md px-2 text-[12px] font-extrabold leading-none";
const webr_status_badge_tones = {
  new: "bg-red-50 text-red-600",
  secret: "bg-slate-100 text-slate-700",
  my: "bg-blue-50 text-blue-700",
  active: "bg-blue-50 text-blue-700",
  upcoming: "bg-emerald-50 text-emerald-700",
  ended: "bg-slate-100 text-slate-600"
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
function homeCurrentWebRCDN2Base() {
  const scriptURL = typeof document !== "undefined" && document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  const match = scriptURL.match(/gh\/statground\/web-r_CDN2@([^/,]+)\//);
  return match ? "https://cdn.jsdelivr.net/gh/statground/web-r_CDN2@" + match[1] + "/" : "";
}
const WEBR_HOME_CDN2_BASE = homeCurrentWebRCDN2Base();
function homeSvgDataURI(svg) {
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}
const WEBR_HOME_CONFERENCE_FALLBACK_IMAGE = homeSvgDataURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img"><rect width="640" height="360" fill="#eff6ff"/><path d="M0 278C92 236 174 246 260 284c104 46 214 40 380-28v104H0Z" fill="#bfdbfe"/><circle cx="500" cy="108" r="74" fill="#fff" opacity=".95"/><circle cx="500" cy="108" r="49" fill="#2563eb"/><text x="500" y="130" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="56" font-weight="800" fill="#fff">R</text><text x="44" y="76" font-family="Arial,Helvetica,sans-serif" font-size="36" font-weight="800" fill="#0f172a">R Conference</text><text x="44" y="120" font-family="Arial,Helvetica,sans-serif" font-size="23" font-weight="700" fill="#2563eb">useR! and R community events</text><text x="44" y="164" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="600" fill="#475569">Conference schedules, talks, and community updates</text><g transform="translate(48 216)" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="132" height="86" rx="14" fill="#fff" stroke="#bfdbfe" stroke-width="3"/><path d="M28 58V34M60 58V24M92 58V40" stroke="#2563eb" stroke-width="8"/><path d="M24 66h84" stroke="#94a3b8" stroke-width="4"/></g><g transform="translate(220 216)" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="132" height="86" rx="14" fill="#fff" stroke="#c7d2fe" stroke-width="3"/><path d="M28 50c18-24 58-24 76 0" stroke="#4f46e5" stroke-width="7"/><path d="M40 64c12-12 40-12 52 0" stroke="#60a5fa" stroke-width="7"/><circle cx="66" cy="30" r="8" fill="#4f46e5" stroke="none"/></g></svg>');
const WEBR_HOME_WORKSHOP_FALLBACK_IMAGE = homeSvgDataURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img"><rect width="640" height="360" fill="#f8fafc"/><rect width="640" height="92" fill="#1d4ed8"/><rect x="448" width="192" height="360" fill="#dbeafe"/><circle cx="512" cy="112" r="72" fill="#fff" opacity=".95"/><circle cx="512" cy="112" r="50" fill="#2563eb"/><text x="512" y="134" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="56" font-weight="800" fill="#fff">R</text><text x="44" y="58" font-family="Arial,Helvetica,sans-serif" font-size="31" font-weight="800" fill="#fff">Web-R Workshop</text><text x="44" y="142" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="800" fill="#0f172a">R learning event</text><text x="44" y="180" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700" fill="#475569">Talks, practice sessions, and seminars</text><g transform="translate(48 230)" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="112" height="72" rx="12" fill="#fff" stroke="#bfdbfe" stroke-width="3"/><path d="M24 48V30M52 48V20M80 48V36" stroke="#2563eb" stroke-width="8"/><path d="M20 54h72" stroke="#94a3b8" stroke-width="4"/></g><g transform="translate(192 230)" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="112" height="72" rx="12" fill="#fff" stroke="#bbf7d0" stroke-width="3"/><path d="M26 46l18-18 18 10 24-26" stroke="#16a34a" stroke-width="7"/></g></svg>');
function homeNormalizeWorkshopImageURL(value) {
  const raw = String(value || "").trim();
  if (!raw)
    return "";
  if (raw.indexOf("r_conference_fallback_20260526.svg") >= 0)
    return WEBR_HOME_CONFERENCE_FALLBACK_IMAGE;
  if (raw.indexOf("r_workshop_fallback_20260526.svg") >= 0)
    return WEBR_HOME_WORKSHOP_FALLBACK_IMAGE;
  return raw;
}
function homeWorkshopFallbackImage(row) {
  const text = String([row && row.source_id, row && row.source_name, row && row.title].join(" ")).toLowerCase();
  return text.indexOf("posit") >= 0 ? WEBR_HOME_WORKSHOP_FALLBACK_IMAGE : WEBR_HOME_CONFERENCE_FALLBACK_IMAGE;
}
function homeWorkshopImage(row) {
  return homeNormalizeWorkshopImageURL(row && (row.cover_image_url || row.image || row.url_image || row.thumbnail_url || row.thumbnail || row.youtube_thumbnail)) || homeWorkshopFallbackImage(row);
}
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
function homeShuffleCopy(values) {
  const list = Array.isArray(values) ? values.slice() : [];
  for (let idx = list.length - 1; idx > 0; idx -= 1) {
    const swapIdx = Math.floor(Math.random() * (idx + 1));
    const tmp = list[idx];
    list[idx] = list[swapIdx];
    list[swapIdx] = tmp;
  }
  return list;
}
function homeShortText(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const limit = maxLength || 58;
  if (text.length <= limit)
    return text;
  return text.slice(0, Math.max(0, limit - 1)).trim() + "...";
}
function homePlainText(value) {
  const text = String(value || "");
  if (!text)
    return "";
  const withoutTags = text.replace(/<[^>]*>/g, " ");
  const textarea = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (textarea) {
    textarea.innerHTML = withoutTags;
    return textarea.value.replace(/\s+/g, " ").trim();
  }
  return withoutTags.replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
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
  const keys = ["latest_activity_at", "last_updated_at", "updated_at", "created_at", "published_at", "pub_date", "source_updated_at", "source_collected_at", "source_fetched_at", "starts_at", "event_at", "sort_key", "date"];
  for (const key of keys) {
    const parsed = homeParseDate(item && item[key]);
    if (parsed)
      return parsed.getTime();
  }
  return 0;
}
function homeExplicitNew(row) {
  if (!row)
    return false;
  const value = row.is_new != null ? row.is_new : row.isNew;
  if (value === true || value === 1)
    return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }
  return false;
}
function homeRecentWithin(value, hours) {
  const parsed = homeParseDate(value);
  if (!parsed || !hours)
    return false;
  return parsed.getTime() >= Date.now() - hours * 60 * 60 * 1e3;
}
function homeRecentAny(row, keys, hours) {
  return keys.some((key) => homeRecentWithin(row && row[key], hours));
}
// Version the browser cache whenever the per-section completeness contract
// changes. This prevents a partial payload saved during a DB recovery from
// hiding one homepage lane for the full stale window.
const WEBR_HOME_PAYLOAD_CACHE_PREFIX = "webr.home.payload.v2.";
const WEBR_HOME_PAYLOAD_CACHE_TTL = 6 * 60 * 60 * 1e3;
function homePayloadCacheKey(url) {
  return WEBR_HOME_PAYLOAD_CACHE_PREFIX + String(url || "").replace(/[^a-z0-9_/-]+/gi, "_");
}
function homeStatisticsLooksUsable(value) {
  if (!value || typeof value !== "object" || value.ok === false || value.pending === true)
    return false;
  return ["cnt_member", "cnt_visitor", "cnt_pageview"].every((key) => Number(value[key]) > 0);
}
function homePayloadLooksUsable(url, value) {
  if (!value || typeof value !== "object" || value.ok === false)
    return false;
  const textURL = String(url || "");
  if (textURL.indexOf("ajax_index_board") >= 0) {
    const rows = homeArray(value);
    const categories = new Set(rows.map((row) => String(row && (row.category_url || row.article_category_url || row.category) || "").trim().toLowerCase()));
    const hasRCommunity = categories.has("rcommunity");
    const hasLocalCommunity = ["free", "visitor", "notebook", "rblogger", "rproject"].some((category) => categories.has(category));
    return hasRCommunity && hasLocalCommunity;
  }
  if (textURL.indexOf("ajax_index_event") >= 0) {
    return homeArray(value).some((row) => {
      const nickname = String(row && row.nickname || "").trim();
      return nickname && !["탈퇴한 유저", "탈퇴한 회원", "Unknown", "unknown", "null", "None", "undefined"].includes(nickname);
    });
  }
  if (textURL.indexOf("ajax_index_notice") >= 0 || textURL.indexOf("ajax_index_youtube") >= 0 || textURL.indexOf("ajax_index_lecture") >= 0) {
    return homeArray(value).some((row) => row && (row.title || row.name || row.uuid));
  }
  if (textURL.indexOf("ajax_index_packages") >= 0) {
    return homeArray(value.recent_published || value.packages).length > 0 || homeArray(value.recent_observed).length > 0 || homeArray(value.package_news).length > 0;
  }
  if (textURL.indexOf("ajax_index_statistics") >= 0) {
    return homeStatisticsLooksUsable(value);
  }
  if (textURL.indexOf("ajax_index_books") >= 0) {
    return homeArray(value.books || value).length > 0;
  }
  if (textURL.indexOf("ajax_index_r_ecosystem") >= 0) {
    return homeArray(value.items || value).length > 0;
  }
  if (textURL.indexOf("workshop/ajax_list") >= 0) {
    return homeArray(value.workshops || value).length > 0;
  }
  if (textURL.indexOf("ajax_index_lecture") >= 0) {
    return homeArray(value).length > 0;
  }
  return homeArray(value).length > 0;
}
function homeReadCachedPayload(url) {
  try {
    if (typeof window === "undefined" || !window.localStorage)
      return null;
    const raw = window.localStorage.getItem(homePayloadCacheKey(url));
    if (!raw)
      return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - Number(parsed.savedAt || 0) > WEBR_HOME_PAYLOAD_CACHE_TTL)
      return null;
    if (!homePayloadLooksUsable(url, parsed.value))
      return null;
    return parsed.value;
  } catch (_error) {
    return null;
  }
}
function homeWriteCachedPayload(url, value) {
  try {
    if (typeof window === "undefined" || !window.localStorage || !homePayloadLooksUsable(url, value))
      return;
    window.localStorage.setItem(homePayloadCacheKey(url), JSON.stringify({ savedAt: Date.now(), value }));
  } catch (_error) {
  }
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
function homePostJSON(url, timeoutMs) {
  const fetchJSON = (waitMs) => {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    let timer = null;
    const fetchOptions = { method: "POST" };
    if (controller)
      fetchOptions.signal = controller.signal;
    const request = fetch(url, fetchOptions).then((res) => {
      if (!res.ok)
        throw new Error("request failed");
      return res.json();
    }).catch(() => null);
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => {
        if (controller)
          controller.abort();
        resolve(null);
      }, waitMs);
    });
    return Promise.race([request, timeout]).then((value) => {
      if (timer)
        clearTimeout(timer);
      return value;
    }, () => {
      if (timer)
        clearTimeout(timer);
      return null;
    });
  };
  const firstWaitMs = timeoutMs || 12e3;
  const retryWaitMs = Math.max(22e3, firstWaitMs + 8e3);
  const cached = homeReadCachedPayload(url);
  return fetchJSON(firstWaitMs).then((value) => {
    if (homePayloadLooksUsable(url, value)) {
      homeWriteCachedPayload(url, value);
      return value;
    }
    if (cached) {
      fetchJSON(retryWaitMs).then((retryValue) => {
        if (homePayloadLooksUsable(url, retryValue)) {
          homeWriteCachedPayload(url, retryValue);
        }
      });
      return cached;
    }
    return fetchJSON(retryWaitMs).then((retryValue) => {
      if (homePayloadLooksUsable(url, retryValue)) {
        homeWriteCachedPayload(url, retryValue);
        return retryValue;
      }
      return cached || retryValue || value || null;
    });
  });
}
function homeWorkshopStatus(row) {
  const now = Date.now();
  const statusText = String(row && row.status || "").trim().toLowerCase();
  const start = homeParseDate(row && (row.starts_at || row.event_at || row.date));
  const end = homeParseDate(row && row.ends_at);
  if (["closed", "ended", "finished", "completed", "cancelled", "canceled", "archived", "inactive"].includes(statusText))
    return { rank: 2, label: "\uC885\uB8CC", tone: "ended" };
  if (end && end.getTime() < now)
    return { rank: 2, label: "\uC885\uB8CC", tone: "ended" };
  const implicitEnd = !end && start ? new Date(start.getTime()) : null;
  if (implicitEnd)
    implicitEnd.setHours(23, 59, 59, 999);
  const effectiveEnd = end || implicitEnd;
  if (effectiveEnd && effectiveEnd.getTime() < now)
    return { rank: 2, label: "\uC885\uB8CC", tone: "ended" };
  if (start && start.getTime() <= now && (!effectiveEnd || effectiveEnd.getTime() >= now))
    return { rank: 0, label: "\uC9C4\uD589\uC911", tone: "active" };
  if (start && start.getTime() > now)
    return { rank: 0, label: "\uC608\uC815", tone: "upcoming" };
  const text = [row && row.title, row && row.summary, row && row.description, row && row.canonical_url].join(" ");
  const yearMatch = text.match(/\b([12][0-9]{3})\b/);
  const currentYear = new Date().getFullYear();
  if (yearMatch && Number(yearMatch[1]) >= currentYear)
    return { rank: 0, label: "\uC608\uC815", tone: "upcoming" };
  if (homeRecentAny(row || {}, ["published_at", "created_at", "updated_at"], 24 * 90))
    return { rank: 0, label: "\uC608\uC815", tone: "upcoming" };
  return { rank: 2, label: "\uC885\uB8CC", tone: "ended" };
}
function homeWorkshopBadge(row) {
  const status = homeWorkshopStatus(row);
  return { label: status.label, tone: status.tone };
}
function homeWorkshopSelection(rows) {
  const decorated = homeArray(rows).map((row) => ({ row, status: homeWorkshopStatus(row) }));
  const openItems = decorated.filter((item) => item.status.rank === 0).map((item) => item.row);
  const endedItems = decorated.filter((item) => item.status.rank !== 0).map((item) => item.row).sort((a, b) => homeDateValue(b) - homeDateValue(a));
  if (openItems.length >= 3)
    return homeShuffleCopy(openItems).slice(0, 3);
  return openItems.concat(endedItems).slice(0, 3);
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
    title: homeShortText(homePlainText(row.title || row.article_title || row.name || "새 글"), 60),
    meta: [homeCategoryLabel(category), homeFormatDate(row.created_at || row.published_at || row.updated_at)].filter(Boolean).join(" · "),
    href: getIndexArticleHref(row)
  };
}
function homeBookPreview(row) {
  const bookKey = row.board_url_sub || row.uuid_board_category || "";
  const href = row.href || (bookKey ? "/book/" + String(bookKey).padStart(3, "0") + "/" : row.url || "/book/");
  return {
    title: homeShortText(homePlainText(row.title || row.book_title || "R 도서"), 54),
    meta: [homePlainText(row.publisher), homeFormatDate(row.pub_date || row.published_at || row.source_updated_at || row.created_at)].filter(Boolean).join(" · ") || "도서",
    href,
    image: row.image || row.url_image || ""
  };
}
function homeWorkshopPreview(row) {
  const identifier = row.uuid || row.slug || row.board_key || "";
  const image = homeWorkshopImage(row);
  return {
    title: homeShortText(row.title || row.name || "워크샵", 54),
    meta: [row.source_name || row.venue || "워크샵", homeFormatDate(row.starts_at || row.created_at)].filter(Boolean).join(" · "),
    href: identifier ? "/workshop/read/" + identifier + "/" : row.canonical_url || "/workshop/",
    image
  };
}
function homeLecturePreview(row) {
  const courseID = row.course_id || row.CourseID || "";
  const href = row.href || (courseID ? "/workshop/lecture/" + encodeURIComponent(courseID) + "/" : "/workshop/lecture/");
  return {
    title: homeShortText(homePlainText(row.title || "R 강의"), 70),
    meta: [homePlainText(row.instructor_names || row.category_main_title || row.provider_name || "강의"), homeFormatDate(row.latest_activity_at || row.published_at || row.last_updated_at || row.source_fetched_at)].filter(Boolean).join(" · "),
    href,
    image: row.thumbnail_url || row.thumbnail || row.image || row.url_image || WEBR_HOME_WORKSHOP_FALLBACK_IMAGE,
    isNew: homeRecentAny(row, ["latest_activity_at", "published_at", "last_updated_at", "source_fetched_at"], 24 * 14),
    fallbackLabel: "강의"
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
  const webRMessage = homeWebRActivityMessage(event, displayNickname);
  if (webRMessage)
    return webRMessage;
  return displayNickname + "님의 활동이 있습니다.";
}
function homeWebRActivityMessage(event, nickname) {
  if (typeof event !== "string")
    return "";
  const prefixes = ["Web-R 2.0 - ", "Web-R Notebook - ", "Web-R - "];
  for (const prefix of prefixes) {
    if (!event.startsWith(prefix))
      continue;
    const product = prefix.slice(0, -3);
    const appName = event.slice(prefix.length).trim();
    if (product === "Web-R Notebook") {
      if (appName === "Notebook 실행")
        return nickname + "님이 Web-R Notebook을 실행하고 있습니다.";
      if (appName === "Notebook 공유 보기")
        return nickname + "님이 Web-R Notebook 공유 화면을 보고 있습니다.";
      if (appName === "새 Notebook")
        return nickname + "님이 새 Web-R Notebook을 만들고 있습니다.";
      return nickname + "님이 Web-R Notebook을 사용하고 있습니다.";
    }
    if (appName)
      return nickname + "님이 " + product + "에서 " + appName + "을(를) 실행하고 있습니다.";
    return nickname + "님이 " + product + "을(를) 실행하고 있습니다.";
  }
  return "";
}
function Div_home_update_dashboard() {
  const [homeState, setHomeState] = React.useState({
    loading: {
      board: true,
      events: true,
      books: true,
      ecosystem: true,
      notice: true,
      workshops: true,
      youtube: true,
      lectures: true,
      packages: true,
      statistics: true
    },
    articles: [],
    events: [],
    books: [],
    ecosystem: [],
    notices: [],
    workshops: [],
    youtube: [],
    lectures: [],
    packages: {},
    statistics: {}
  });
  const [isWebRMenuOpen, setIsWebRMenuOpen] = React.useState(false);
  const webRMenuRef = React.useRef(null);
  const randomizedCategoryOrder = React.useMemo(() => homeShuffleCopy(["packages", "rcommunity", "community", "ecosystem", "books"]).concat(["workshops"]), []);
  React.useEffect(() => {
    if (!isWebRMenuOpen)
      return;
    function handlePointerDown(event) {
      if (webRMenuRef.current && !webRMenuRef.current.contains(event.target)) {
        setIsWebRMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape")
        setIsWebRMenuOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isWebRMenuOpen]);
  React.useEffect(() => {
    let mounted = true;
    function finishSlice(loadingKey, patch) {
      if (!mounted)
        return;
      setHomeState((prev) => Object.assign({}, prev, patch, {
        loading: Object.assign({}, prev.loading, { [loadingKey]: false })
      }));
    }
    homePostJSON("/ajax_index_board/").then((board) => {
      finishSlice("board", { articles: homeArray(board).sort((a, b) => homeDateValue(b) - homeDateValue(a)) });
    });
    homePostJSON("/ajax_index_event/").then((events) => {
      finishSlice("events", { events: homeArray(events).sort((a, b) => homeDateValue(b) - homeDateValue(a)) });
    });
    homePostJSON("/ajax_index_books/").then((books) => {
      finishSlice("books", { books: homeArray(books && books.books ? books.books : books).sort((a, b) => homeDateValue(b) - homeDateValue(a)) });
    });
    homePostJSON("/ajax_index_r_ecosystem/").then((ecosystem) => {
      finishSlice("ecosystem", { ecosystem: homeArray(ecosystem && ecosystem.items ? ecosystem.items : ecosystem).sort((a, b) => homeDateValue(b) - homeDateValue(a)) });
    });
    homePostJSON("/ajax_index_notice/").then((notices) => {
      finishSlice("notice", { notices: homeArray(notices).sort((a, b) => homeDateValue(b) - homeDateValue(a)) });
    });
    homePostJSON("/workshop/ajax_list/").then((workshops) => {
      finishSlice("workshops", { workshops: homeArray(workshops && workshops.workshops ? workshops.workshops : workshops).sort((a, b) => homeDateValue(b) - homeDateValue(a)) });
    });
    homePostJSON("/ajax_index_youtube/").then((youtube) => {
      finishSlice("youtube", { youtube: homeArray(youtube).sort((a, b) => homeDateValue(b) - homeDateValue(a)) });
    });
    homePostJSON("/ajax_index_lecture/").then((lectures) => {
      finishSlice("lectures", { lectures: homeArray(lectures).sort((a, b) => homeDateValue(b) - homeDateValue(a)) });
    });
    homePostJSON("/ajax_index_packages/").then((packages) => {
      finishSlice("packages", { packages: packages || {} });
    });
    homePostJSON("/ajax_index_statistics/").then((statistics) => {
      if (homeStatisticsLooksUsable(statistics)) {
        finishSlice("statistics", { statistics });
        return;
      }
      // An unavailable counter must display the neutral '-' state instead of
      // leaving the loading skeleton on screen forever.
      finishSlice("statistics", { statistics: {} });
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
  function feedItem(lane, source, row, title, meta, href, detail, sortValue, image, isNew, badge) {
    return {
      lane,
      source,
      row,
      title: homeShortText(homePlainText(title), 84),
      meta,
      href,
      detail: homeShortText(homePlainText(detail), 118),
      image: image || "",
      sortValue: sortValue || homeDateValue(row),
      isNew: typeof isNew === "boolean" ? isNew : homeExplicitNew(row),
      badge: badge || null
    };
  }
  const categoryOf = (row) => row.category_url || row.article_category_url || row.category || "";
  const packagePublished = homeArray(homeState.packages.recent_published || homeState.packages.packages);
  const packageObserved = homeArray(homeState.packages.recent_observed);
  const packageNews = homeArray(homeState.packages.package_news);
  const feed = [];
  packagePublished.slice(0, 6).forEach((row) => {
    feed.push(feedItem("packages", "R 패키지", row, packageTitle(row), packageMeta(row, homeFormatDate(row.published_at || row.last_observed_at)), packageHref(row), row.title || row.description || "패키지 업데이트", homeDateValue({ published_at: row.published_at, last_observed_at: row.last_observed_at }), "", false));
  });
  packageObserved.slice(0, 4).forEach((row) => {
    feed.push(feedItem("packages", "R 패키지", row, packageTitle(row), packageMeta(row, "새 관측 " + homeFormatDate(row.first_seen_at || row.last_observed_at)), packageHref(row), row.title || row.description || "새로 관측된 패키지 신호", homeDateValue({ first_seen_at: row.first_seen_at, last_observed_at: row.last_observed_at }), "", false));
  });
  packageNews.slice(0, 5).forEach((row) => {
    feed.push(feedItem("packages", "패키지 소식", row, row.title || "Package news", [row.source_name || "Package news", homeFormatDate(row.published_at || row.collected_at)].filter(Boolean).join(" · "), packageNewsHref(row), row.summary || "", homeDateValue({ published_at: row.published_at, collected_at: row.collected_at }), "", homeRecentAny(row, ["published_at", "collected_at"], 24)));
  });
  const randomBooks = React.useMemo(() => {
    const seenBooks = /* @__PURE__ */ new Set();
    const list = [];
    homeState.books.forEach((row) => {
      const signature = [
        homePlainText(row.title || row.book_title || ""),
        homePlainText(row.publisher || ""),
        homePlainText(row.description || row.contents || "")
      ].join("|").replace(/\s+/g, " ").trim().toLowerCase();
      const key = signature || String(row.isbn || row.href || row.url || row.image || row.url_image || "").trim();
      if (key && seenBooks.has(key))
        return;
      if (key)
        seenBooks.add(key);
      list.push(row);
    });
    for (let idx = list.length - 1; idx > 0; idx -= 1) {
      const swapIdx = Math.floor(Math.random() * (idx + 1));
      const tmp = list[idx];
      list[idx] = list[swapIdx];
      list[swapIdx] = tmp;
    }
    return list.slice(0, 3);
  }, [homeState.books]);
  homeState.articles.filter((row) => categoryOf(row) === "rcommunity").slice(0, 7).forEach((row) => {
    feed.push(feedItem("rcommunity", "R Community", row, row.title || "R Community", [row.source_name || "R Community", homeFormatDate(row.created_at || row.published_at)].filter(Boolean).join(" · "), homeArticlePreview(row).href, row.summary || row.content || "", homeDateValue(row), "", homeExplicitNew(row)));
  });
  homeState.ecosystem.slice(0, 8).forEach((row) => {
    feed.push(feedItem("ecosystem", row.source || row.kind || "R 에코시스템", row, row.title || "R 에코시스템", [row.source_meta || row.source || row.kind || "R 에코시스템", homeFormatDate(row.published_at || row.created_at)].filter(Boolean).join(" · "), row.href || "/r-ecosystem/", row.summary || row.content || "", homeDateValue(row), "", homeRecentAny(row, ["published_at", "created_at"], 24)));
  });
  homeState.articles.filter((row) => ["free", "notebook", "visitor"].includes(categoryOf(row))).slice(0, 6).forEach((row) => {
    feed.push(feedItem("community", homeCategoryLabel(categoryOf(row)), row, row.title || "커뮤니티", [homeCategoryLabel(categoryOf(row)), homeFormatDate(row.created_at || row.updated_at)].join(" · "), homeArticlePreview(row).href, row.summary || row.content || "", homeDateValue(row), "", homeExplicitNew(row)));
  });
  randomBooks.forEach((row) => {
    const preview = homeBookPreview(row);
    feed.push(feedItem("books", "도서", row, preview.title, preview.meta, preview.href, row.description || row.contents || "", homeDateValue(row), preview.image));
  });
  homeWorkshopSelection(homeState.workshops).forEach((row) => {
    const preview = homeWorkshopPreview(row);
    feed.push(feedItem("workshops", "워크샵", row, preview.title, preview.meta, preview.href, row.summary || row.description || "", homeDateValue({ starts_at: row.starts_at, created_at: row.created_at, published_at: row.published_at }), preview.image, false, homeWorkshopBadge(row)));
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
  const CATEGORY_ITEM_LIMIT = 3;
  const categoryDefs = [
    { id: "packages", label: "R 패키지", href: "/r-ecosystem/packages/", tone: "border-emerald-200 bg-emerald-50 text-emerald-700", loading: homeState.loading.packages },
    { id: "rcommunity", label: "R Community", href: "/community/", tone: "border-blue-200 bg-blue-50 text-blue-700", loading: homeState.loading.board },
    { id: "ecosystem", label: "R 에코시스템", href: "/r-ecosystem/", tone: "border-cyan-200 bg-cyan-50 text-cyan-700", loading: homeState.loading.ecosystem },
    { id: "community", label: "커뮤니티", href: "/community/", tone: "border-sky-200 bg-sky-50 text-sky-700", loading: homeState.loading.board },
    { id: "books", label: "도서", href: "/book/", tone: "border-amber-200 bg-amber-50 text-amber-700", loading: homeState.loading.books },
    { id: "workshops", label: "워크샵", href: "/workshop/", tone: "border-indigo-200 bg-indigo-50 text-indigo-700", loading: homeState.loading.workshops }
  ];
  const categoryDefMap = categoryDefs.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {});
  const categories = randomizedCategoryOrder.map((sectionID) => categoryDefMap[sectionID]).filter(Boolean).map((section) => {
    const items = dedupedFeed.filter((item) => item.lane === section.id);
    return Object.assign({}, section, {
      total: items.length,
      items: items.slice(0, CATEGORY_ITEM_LIMIT)
    });
  });
  const activityItems = homeState.events.filter((item) => {
    const nickname = String(item.nickname || "").trim();
    return nickname && !["탈퇴한 유저", "탈퇴한 회원", "Unknown", "unknown", "null", "None", "undefined"].includes(nickname);
  }).slice(0, 3);
  const noticeItems = homeState.notices.slice(0, 3).map((row) => {
    const preview = homeArticlePreview(row);
    return {
      title: preview.title,
      href: preview.href,
      meta: homeFormatDate(row.created_at || row.published_at || row.updated_at),
      isNew: homeExplicitNew(row)
    };
  });
  const randomYoutube = React.useMemo(() => {
    const list = homeState.youtube.filter((row) => row && (row.uuid || row.title || row.youtube_thumbnail));
    if (!list.length)
      return null;
    return list[Math.floor(Math.random() * list.length)];
  }, [homeState.youtube]);
  const randomLecture = React.useMemo(() => {
    const list = homeState.lectures.filter((row) => row && (row.course_id || row.href || row.title || row.thumbnail_url));
    if (!list.length)
      return null;
    return list[Math.floor(Math.random() * list.length)];
  }, [homeState.lectures]);
  const learningPanelPreference = React.useMemo(() => Math.random() < 0.5 ? "youtube" : "lecture", []);
  function homeYoutubePreview(row) {
    const href = row && row.uuid ? "/workshop/youtube/read/" + row.uuid + "/" : "/workshop/youtube/";
    return {
      title: homeShortText(homePlainText(row && row.title || "YouTube 강의"), 70),
      meta: homeFormatDate(row && (row.created_at || row.published_at || row.youtube_publish_date)),
      href,
      image: row ? row.youtube_thumbnail || row.thumbnail_url || row.thumbnail || row.image || row.url_image || "" : "",
      isNew: homeExplicitNew(row),
      fallbackLabel: "YouTube"
    };
  }
  const featuredLearning = React.useMemo(() => {
    const youtube = randomYoutube ? { type: "youtube", item: homeYoutubePreview(randomYoutube) } : null;
    const lecture = randomLecture ? { type: "lecture", item: homeLecturePreview(randomLecture) } : null;
    if (learningPanelPreference === "lecture") {
      if (lecture || homeState.loading.lectures)
        return lecture || { type: "lecture", item: null };
      return youtube || { type: "lecture", item: null };
    }
    if (youtube || homeState.loading.youtube)
      return youtube || { type: "youtube", item: null };
    return lecture || youtube || { type: learningPanelPreference, item: null };
  }, [learningPanelPreference, randomYoutube, randomLecture, homeState.loading.lectures, homeState.loading.youtube]);
  const quickLinks = [
    { title: "Web-R", href: "/webr/", icon: "webr", tone: "bg-blue-50 text-blue-700 border-blue-100" },
    { title: "패키지", href: "/r-ecosystem/packages/", icon: "package", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { title: "R 에코", href: "/r-ecosystem/", icon: "ecosystem", tone: "bg-cyan-50 text-cyan-700 border-cyan-100" },
    { title: "커뮤니티", href: "/community/", icon: "community", tone: "bg-sky-50 text-sky-700 border-sky-100" },
    { title: "도서", href: "/book/", icon: "book", tone: "bg-amber-50 text-amber-700 border-amber-100" },
    { title: "워크샵", href: "/workshop/", icon: "workshop", tone: "bg-violet-50 text-violet-700 border-violet-100" }
  ];
  const webROptions = [
    { title: "Web-R 무료 서버", href: "/webr/", desc: "기본 서버로 접속" },
    { title: "Web-R 정회원 서버", href: "/webr/member/", desc: "정회원 전용 서버" },
    { title: "Web-R 2.0", href: "/webr/2.0/", desc: "새 앱 실행 환경" },
    { title: "Web-R Notebook", href: "/webr/notebook/", desc: "노트북 목록" }
  ];
  function QuickIcon(props) {
    const icon = props.icon;
    if (icon === "webr")
      return /* @__PURE__ */ React.createElement("span", { class: "flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-base font-black text-white" }, "R");
    const common = { className: "h-7 w-7", viewBox: "0 0 28 28", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
    if (icon === "package")
      return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("path", { d: "M6 9.5 14 5l8 4.5-8 4.5L6 9.5Z" }), /* @__PURE__ */ React.createElement("path", { d: "M6 9.5v9L14 23l8-4.5v-9" }), /* @__PURE__ */ React.createElement("path", { d: "M14 14v9" }));
    if (icon === "ecosystem")
      return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("path", { d: "M6 20V8" }), /* @__PURE__ */ React.createElement("path", { d: "M6 20h16" }), /* @__PURE__ */ React.createElement("path", { d: "m8 17 4-5 4 3 5-7" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "1.5", fill: "currentColor", stroke: "none" }));
    if (icon === "community")
      return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("path", { d: "M7 10.5a5 5 0 0 1 5-5h4a5 5 0 0 1 0 10h-2l-4 3v-3H7a5 5 0 0 1 0-5Z" }), /* @__PURE__ */ React.createElement("path", { d: "M18 15.5v2.5l3 2.5v-2.5h.5a4 4 0 0 0 1-7.9" }));
    if (icon === "book")
      return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("path", { d: "M7 5h8a4 4 0 0 1 4 4v14H9a2 2 0 0 1-2-2V5Z" }), /* @__PURE__ */ React.createElement("path", { d: "M10 5v16" }), /* @__PURE__ */ React.createElement("path", { d: "M12 9h4" }));
    return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "7", width: "18", height: "13", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M10 23h8" }), /* @__PURE__ */ React.createElement("path", { d: "M14 20v3" }), /* @__PURE__ */ React.createElement("path", { d: "m10 12 3 3 5-6" }));
  }
  function QuickLink(props) {
    const link = props.link;
    const tileClass = "flex h-[74px] flex-col items-center justify-center gap-1 rounded-lg border px-2 text-xs font-extrabold " + link.tone;
    if (link.icon !== "webr") {
      return /* @__PURE__ */ React.createElement("a", { href: link.href, class: tileClass }, /* @__PURE__ */ React.createElement(QuickIcon, { icon: link.icon }), link.title);
    }
    return /* @__PURE__ */ React.createElement("div", { ref: webRMenuRef, class: "relative w-full" }, /* @__PURE__ */ React.createElement("button", {
      type: "button",
      class: tileClass + " w-full",
      "aria-haspopup": "menu",
      "aria-expanded": isWebRMenuOpen ? "true" : "false",
      onClick: () => setIsWebRMenuOpen((open) => !open)
    }, /* @__PURE__ */ React.createElement(QuickIcon, { icon: link.icon }), link.title), isWebRMenuOpen ? /* @__PURE__ */ React.createElement("div", { class: "absolute left-0 top-full z-30 mt-2 w-56 rounded-lg border border-blue-100 bg-white p-2 text-left shadow-lg", role: "menu" }, /* @__PURE__ */ React.createElement("span", { class: "absolute -top-1 left-8 h-3 w-3 rotate-45 border-l border-t border-blue-100 bg-white" }), webROptions.map((option) => /* @__PURE__ */ React.createElement("a", { key: option.href, href: option.href, class: "relative block rounded-md px-3 py-2 hover:bg-blue-50", role: "menuitem" }, /* @__PURE__ */ React.createElement("span", { class: "block text-sm font-extrabold text-slate-950" }, option.title), /* @__PURE__ */ React.createElement("span", { class: "mt-0.5 block text-xs font-semibold text-slate-500" }, option.desc)))) : null);
  }
  function DashboardSkeleton() {
    return /* @__PURE__ */ React.createElement("div", { class: "space-y-3" }, [0, 1, 2].map((idx) => /* @__PURE__ */ React.createElement("div", { key: idx, class: "rounded-md border border-slate-100 bg-white p-3" }, /* @__PURE__ */ React.createElement("div", { class: "h-3 w-2/3 rounded-full bg-slate-300 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-3 h-2 w-4/5 rounded-full bg-slate-200 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-2 h-2 w-1/3 rounded-full bg-slate-200 animate-pulse" }))));
  }
  function FeedRow(props) {
    const item = props.item;
    const isLandscapeImage = item.lane === "workshops";
    const imageClass = isLandscapeImage ? "h-20 w-28 shrink-0 rounded border border-slate-200 bg-slate-100 object-cover" : "h-20 w-14 shrink-0 rounded border border-slate-200 bg-slate-100 object-cover";
    const badge = item.badge || (item.isNew ? { tone: "new", label: "NEW" } : null);
    const shouldRenderImage = !!item.image;
    return /* @__PURE__ */ React.createElement("a", { href: item.href, class: "group block border-t border-slate-100 px-4 py-3 first:border-t-0 hover:bg-slate-50" }, /* @__PURE__ */ React.createElement("span", { class: "flex items-start gap-3" }, shouldRenderImage ? /* @__PURE__ */ React.createElement("img", { src: item.image, alt: "", class: imageClass, loading: "lazy", onError: (event) => {
      const node = event.currentTarget;
      if (item.lane === "workshops" && node.dataset.webrFallbackApplied !== "1") {
        node.dataset.webrFallbackApplied = "1";
        node.src = WEBR_HOME_CONFERENCE_FALLBACK_IMAGE;
        return;
      }
      node.style.display = "none";
    } }) : null, /* @__PURE__ */ React.createElement("span", { class: "flex min-w-0 flex-1 items-start gap-3" }, /* @__PURE__ */ React.createElement("span", { class: "min-w-0" }, /* @__PURE__ */ React.createElement("span", { class: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { class: "min-w-0 text-sm font-extrabold leading-5 text-slate-950 group-hover:text-blue-700" }, item.title), badge ? /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: badge.tone, label: badge.label }) : null), item.detail ? /* @__PURE__ */ React.createElement("span", { class: "mt-1 block truncate text-sm text-slate-500" }, item.detail) : null, /* @__PURE__ */ React.createElement("span", { class: "mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400" }, /* @__PURE__ */ React.createElement("span", { class: "rounded border border-slate-200 bg-white px-1.5 py-0.5 text-slate-600" }, item.source), /* @__PURE__ */ React.createElement("span", null, item.meta))))));
  }
  function CategorySection(props) {
    const section = props.section;
    return /* @__PURE__ */ React.createElement("article", { class: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { class: "inline-flex h-7 items-center rounded-md border px-2 text-xs font-extrabold " + section.tone }, section.label)), /* @__PURE__ */ React.createElement("a", { href: section.href, class: "shrink-0 text-xs font-extrabold text-blue-700 hover:text-blue-900" }, "더 보기")), section.loading && !section.items.length ? /* @__PURE__ */ React.createElement("div", { class: "p-4" }, /* @__PURE__ */ React.createElement(DashboardSkeleton, null)) : section.items.length ? /* @__PURE__ */ React.createElement("div", { class: "bg-white" }, section.items.map((item, idx) => /* @__PURE__ */ React.createElement(FeedRow, { key: section.id + item.href + item.title + idx, item }))) : /* @__PURE__ */ React.createElement("a", { href: section.href, class: "block px-4 py-5 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-blue-700" }, "최근 항목 확인하기"));
  }
  function NoticePanel() {
    return /* @__PURE__ */ React.createElement("aside", { class: "rounded-lg border border-slate-100 bg-slate-50/80 p-4 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("h3", { class: "text-base font-extrabold text-slate-950" }, "공지사항"), /* @__PURE__ */ React.createElement("a", { href: "/intro/notice/", class: "text-xs font-extrabold text-blue-700 hover:text-blue-900" }, "더 보기")), /* @__PURE__ */ React.createElement("div", { class: "mt-3 space-y-2" }, homeState.loading.notice && !noticeItems.length ? [0, 1, 2].map((idx) => /* @__PURE__ */ React.createElement("div", { key: idx, class: "rounded-md border border-slate-100 bg-white p-3" }, /* @__PURE__ */ React.createElement("div", { class: "h-3 w-4/5 rounded-full bg-slate-300 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-2 h-2 w-1/3 rounded-full bg-slate-200 animate-pulse" }))) : noticeItems.length ? noticeItems.map((item, idx) => /* @__PURE__ */ React.createElement("a", { key: item.href + item.title + idx, href: item.href, class: "block rounded-md border border-slate-100 bg-white px-3 py-2 hover:border-blue-200 hover:bg-blue-50" }, /* @__PURE__ */ React.createElement("span", { class: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { class: "min-w-0 truncate text-sm font-extrabold text-slate-950" }, item.title), item.isNew ? /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "new", label: "NEW" }) : null), /* @__PURE__ */ React.createElement("span", { class: "mt-1 block text-xs font-semibold text-slate-400" }, item.meta || "공지사항"))) : /* @__PURE__ */ React.createElement("a", { href: "/intro/notice/", class: "block rounded-md border border-dashed border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" }, "공지사항 보기")));
  }
  function LearningMediaPanel() {
    const media = featuredLearning.item;
    const isLecture = featuredLearning.type === "lecture";
    const title = isLecture ? "강의" : "YouTube";
    const moreHref = isLecture ? "/workshop/lecture/" : "/workshop/youtube/";
    const loading = isLecture ? homeState.loading.lectures : homeState.loading.youtube;
    return /* @__PURE__ */ React.createElement("aside", { class: "overflow-hidden rounded-lg border border-slate-100 bg-slate-50/80 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center justify-between gap-3 px-4 py-3" }, /* @__PURE__ */ React.createElement("h3", { class: "text-base font-extrabold text-slate-950" }, title), /* @__PURE__ */ React.createElement("a", { href: moreHref, class: "text-xs font-extrabold text-blue-700 hover:text-blue-900" }, "더 보기")), loading && !media ? /* @__PURE__ */ React.createElement("div", { class: "px-4 pb-4" }, /* @__PURE__ */ React.createElement("div", { class: "aspect-video rounded-md bg-white animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-3 h-3 w-4/5 rounded-full bg-slate-300 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-2 h-2 w-1/3 rounded-full bg-slate-200 animate-pulse" })) : media ? /* @__PURE__ */ React.createElement("a", { href: media.href || moreHref, class: "block px-4 pb-4 hover:bg-white/70" }, media.image ? /* @__PURE__ */ React.createElement("img", { src: media.image, alt: "", class: "aspect-video w-full rounded-md border border-slate-200 bg-white object-cover", loading: "lazy", onError: (event) => {
      event.currentTarget.style.display = "none";
    } }) : /* @__PURE__ */ React.createElement("div", { class: "flex aspect-video w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-sm font-extrabold text-slate-500" }, media.fallbackLabel || title), /* @__PURE__ */ React.createElement("span", { class: "mt-3 flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { class: "text-sm font-extrabold leading-5 text-slate-950" }, media.title || title), media.isNew ? /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "new", label: "NEW" }) : null), /* @__PURE__ */ React.createElement("span", { class: "mt-1 block text-xs font-semibold text-slate-400" }, media.meta || "최근")) : /* @__PURE__ */ React.createElement("a", { href: moreHref, class: "mx-4 mb-4 block rounded-md border border-dashed border-slate-200 px-3 py-3 text-sm font-semibold text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" }, title + " 보기"));
  }
  function LivePanel() {
    return /* @__PURE__ */ React.createElement("aside", { class: "rounded-lg border border-slate-200 bg-slate-950 p-4 text-white" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("h3", { class: "text-base font-extrabold" }, "지금 Web-R"), /* @__PURE__ */ React.createElement("span", { class: "relative flex h-3 w-3" }, /* @__PURE__ */ React.createElement("span", { class: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ React.createElement("span", { class: "relative inline-flex h-3 w-3 rounded-full bg-emerald-300" }))), /* @__PURE__ */ React.createElement("div", { class: "mt-4 space-y-3" }, homeState.loading.events && !activityItems.length ? [0, 1, 2].map((idx) => /* @__PURE__ */ React.createElement("div", { key: idx, class: "rounded-md bg-white/5 p-3" }, /* @__PURE__ */ React.createElement("div", { class: "h-3 w-5/6 rounded-full bg-white/30 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { class: "mt-2 h-2 w-1/3 rounded-full bg-white/20 animate-pulse" }))) : activityItems.length ? activityItems.map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: item.uuid || item.created_at || idx, class: "rounded-md bg-white/5 p-3" }, /* @__PURE__ */ React.createElement("p", { class: "text-sm font-semibold leading-5" }, homeShortText(homeActivityMessage(item.event, item.nickname), 70)), /* @__PURE__ */ React.createElement("p", { class: "mt-1 text-xs text-slate-300" }, homeRelativeTime(item.created_at || item.updated_at)))) : /* @__PURE__ */ React.createElement("a", { href: "/community/", class: "block rounded-md bg-white/10 p-3 text-sm font-semibold text-slate-100 hover:bg-white/15" }, "최근 활동 보기")));
  }
  function formattedStat(value, unit) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toLocaleString() + unit : "-";
  }
  function StatIcon(props) {
    const common = { className: "h-8 w-8 shrink-0 text-cyan-600", viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: "2.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
    if (props.icon === "member") {
      return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "11", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M5.5 25a6.5 6.5 0 0 1 13 0" }), /* @__PURE__ */ React.createElement("circle", { cx: "22", cy: "12.5", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M19.5 22.5a5.5 5.5 0 0 1 7 2.5" }));
    }
    if (props.icon === "pageview") {
      return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("path", { d: "M4.5 16s4.2-7 11.5-7 11.5 7 11.5 7-4.2 7-11.5 7-11.5-7-11.5-7Z" }), /* @__PURE__ */ React.createElement("circle", { cx: "16", cy: "16", r: "3.8" }), /* @__PURE__ */ React.createElement("path", { d: "M22.5 6.5 25 4" }), /* @__PURE__ */ React.createElement("path", { d: "M9.5 25.5 7 28" }));
    }
    return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("path", { d: "M8 25V8" }), /* @__PURE__ */ React.createElement("path", { d: "M8 8l7-3.5v23L8 25Z" }), /* @__PURE__ */ React.createElement("path", { d: "M18 8h4.5A2.5 2.5 0 0 1 25 10.5v11A2.5 2.5 0 0 1 22.5 24H18" }), /* @__PURE__ */ React.createElement("path", { d: "M20.5 16h7" }), /* @__PURE__ */ React.createElement("path", { d: "m25 13.5 2.5 2.5-2.5 2.5" }));
  }
  function StatPanel() {
    const rows = [
      { label: "총 가입자 수", value: homeState.statistics.cnt_member, unit: "명", icon: "member" },
      { label: "오늘의 방문자 수", value: homeState.statistics.cnt_visitor, unit: "명", icon: "visitors" },
      { label: "오늘의 페이지 뷰", value: homeState.statistics.cnt_pageview, unit: "건", icon: "pageview" }
    ];
    return /* @__PURE__ */ React.createElement("aside", { class: "rounded-lg border border-slate-100 bg-slate-50/80 p-4 shadow-sm" }, /* @__PURE__ */ React.createElement("h3", { class: "text-base font-extrabold text-slate-950" }, "Web-R 현황"), /* @__PURE__ */ React.createElement("div", { class: "mt-3 grid grid-cols-1 gap-2" }, rows.map((row) => /* @__PURE__ */ React.createElement("div", { key: row.label, class: "flex min-h-[72px] items-center gap-3 rounded-md border border-slate-100 bg-white px-3 py-2" }, /* @__PURE__ */ React.createElement(StatIcon, { icon: row.icon }), /* @__PURE__ */ React.createElement("span", { class: "min-w-0" }, /* @__PURE__ */ React.createElement("span", { class: "block text-xs font-bold text-slate-500" }, row.label), homeState.loading.statistics ? /* @__PURE__ */ React.createElement("span", { class: "mt-2 block h-5 w-24 rounded-full bg-slate-300 animate-pulse" }) : /* @__PURE__ */ React.createElement("span", { class: "mt-1 block text-xl font-extrabold text-slate-950" }, formattedStat(row.value, row.unit)))))));
  }
  return /* @__PURE__ */ React.createElement("section", { class: "mx-auto w-full max-w-[1360px]" }, /* @__PURE__ */ React.createElement("div", { class: "rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" }, /* @__PURE__ */ React.createElement("div", { class: "max-w-2xl" }, /* @__PURE__ */ React.createElement("p", { class: "text-sm font-extrabold text-blue-700" }, "Web-R 브리핑"), /* @__PURE__ */ React.createElement("h2", { class: "text-2xl font-extrabold text-slate-950" }, "새로 올라온 R 자료 모아보기"), /* @__PURE__ */ React.createElement("p", { class: "mt-2 text-sm leading-6 text-slate-500" }, "패키지, R Community, 도서, 워크샵의 최근 항목을 영역별로 확인하세요.")), /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-3 gap-2 sm:grid-cols-6" }, quickLinks.map((link) => /* @__PURE__ */ React.createElement(QuickLink, { key: link.href, link }))))), /* @__PURE__ */ React.createElement("div", { class: "mt-3 grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_320px]" }, /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 gap-3 xl:grid-cols-2" }, categories.map((section) => /* @__PURE__ */ React.createElement(CategorySection, { key: section.id, section }))), /* @__PURE__ */ React.createElement("div", { class: "space-y-3" }, /* @__PURE__ */ React.createElement(StatPanel, null), /* @__PURE__ */ React.createElement(NoticePanel, null), /* @__PURE__ */ React.createElement(LearningMediaPanel, null), /* @__PURE__ */ React.createElement(LivePanel, null))));
}
function InlineStatisticIcon(props) {
  const common = { className: "h-8 w-8 shrink-0 text-cyan-600", viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: "2.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  if (props.icon === "member") {
    return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "11", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M5.5 25a6.5 6.5 0 0 1 13 0" }), /* @__PURE__ */ React.createElement("circle", { cx: "22", cy: "12.5", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M19.5 22.5a5.5 5.5 0 0 1 7 2.5" }));
  }
  if (props.icon === "pageview") {
    return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("path", { d: "M4.5 16s4.2-7 11.5-7 11.5 7 11.5 7-4.2 7-11.5 7-11.5-7-11.5-7Z" }), /* @__PURE__ */ React.createElement("circle", { cx: "16", cy: "16", r: "3.8" }), /* @__PURE__ */ React.createElement("path", { d: "M22.5 6.5 25 4" }), /* @__PURE__ */ React.createElement("path", { d: "M9.5 25.5 7 28" }));
  }
  return /* @__PURE__ */ React.createElement("svg", common, /* @__PURE__ */ React.createElement("path", { d: "M8 25V8" }), /* @__PURE__ */ React.createElement("path", { d: "M8 8l7-3.5v23L8 25Z" }), /* @__PURE__ */ React.createElement("path", { d: "M18 8h4.5A2.5 2.5 0 0 1 25 10.5v11A2.5 2.5 0 0 1 22.5 24H18" }), /* @__PURE__ */ React.createElement("path", { d: "M20.5 16h7" }), /* @__PURE__ */ React.createElement("path", { d: "m25 13.5 2.5 2.5-2.5 2.5" }));
}
function Div_main_statistics_skeleton() {
  function Div_Sub(props) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        class: "flex items-center w-full w-max-md p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow",
        role: "alert"
      },
      /* @__PURE__ */ React.createElement(InlineStatisticIcon, { icon: props.icon }),
      /* @__PURE__ */ React.createElement("div", { class: "pl-4 text-sm font-normal animate-pulse" }, /* @__PURE__ */ React.createElement("div", { class: "h-2.5 bg-gray-300 rounded-full w-full mb-2.5" }), /* @__PURE__ */ React.createElement("div", { class: "w-32 h-2 bg-gray-200 rounded-full" }))
    );
  }
  return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 gap-4 mx-auto md:grid-cols-3" }, /* @__PURE__ */ React.createElement(Div_Sub, { icon: "member" }), /* @__PURE__ */ React.createElement(Div_Sub, { icon: "visitors" }), /* @__PURE__ */ React.createElement(Div_Sub, { icon: "pageview" }));
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
      /* @__PURE__ */ React.createElement(InlineStatisticIcon, { icon: props.icon }),
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
        icon: "member"
      }
    ), /* @__PURE__ */ React.createElement(
      Div_sub,
      {
        title: "\uC624\uB298\uC758 \uBC29\uBB38\uC790 \uC218",
        content: props.data.cnt_visitor,
        unit: "\uBA85",
        icon: "visitors"
      }
    ), /* @__PURE__ */ React.createElement(
      Div_sub,
      {
        title: "\uC624\uB298\uC758 \uD398\uC774\uC9C0 \uBDF0",
        content: props.data.cnt_pageview,
        unit: "\uAC74",
        icon: "pageview"
      }
    ));
  }
  const data = await homePostJSON("/ajax_index_statistics/");
  if (!homeStatisticsLooksUsable(data))
    return;
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
    const webRMessage = makeWebRServiceEventMessage(event, nickname);
    if (webRMessage) {
      return webRMessage;
    }
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
          }
        }
        return `${nickname}\uB2D8\uC758 \uD65C\uB3D9\uC774 \uC788\uC2B5\uB2C8\uB2E4.`;
    }
  }
  function makeWebRServiceEventMessage(event, nickname) {
    if (typeof event !== "string") {
      return "";
    }
    const prefixes = ["Web-R 2.0 - ", "Web-R Notebook - ", "Web-R - "];
    for (const prefix of prefixes) {
      if (!event.startsWith(prefix)) {
        continue;
      }
      const product = prefix.slice(0, -3);
      const appName = event.slice(prefix.length).trim();
      if (product === "Web-R Notebook") {
        if (appName === "Notebook 실행") {
          return `${nickname}님이 Web-R Notebook을 실행하고 있습니다.`;
        }
        if (appName === "Notebook 공유 보기") {
          return `${nickname}님이 Web-R Notebook 공유 화면을 보고 있습니다.`;
        }
        if (appName === "새 Notebook") {
          return `${nickname}님이 새 Web-R Notebook을 만들고 있습니다.`;
        }
        return `${nickname}님이 Web-R Notebook을 사용하고 있습니다.`;
      }
      if (appName) {
        return `${nickname}님이 ${product}에서 ${appName}을(를) 실행하고 있습니다.`;
      }
      return `${nickname}님이 ${product}을(를) 실행하고 있습니다.`;
    }
    return "";
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
}
function set_main() {
  function Div_main() {
    return /* @__PURE__ */ React.createElement("div", { class: "mx-auto mt-[50px] flex w-full flex-col items-center justify-center space-y-[25px] px-4 py-[0px] md:px-8 md:py-[20px] xl:px-12" }, /* @__PURE__ */ React.createElement("div", { id: "div_main_header", class: "mx-auto w-full max-w-[1360px]" }), /* @__PURE__ */ React.createElement("div", { id: "div_home_service_hub", class: "mx-auto w-full max-w-[1360px]" }));
  }
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main, null), document.getElementById("div_main"));
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_header, null), document.getElementById("div_main_header"));
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_home_update_dashboard, null), document.getElementById("div_home_service_hub"));
  waitForUtilityStyles().then(loadIndexContent);
}
window.set_main = set_main;
