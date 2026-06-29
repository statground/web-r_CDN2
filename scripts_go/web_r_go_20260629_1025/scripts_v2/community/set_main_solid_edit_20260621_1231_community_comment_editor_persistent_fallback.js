const COMMUNITY_FILE_DELETE_CLASS = "rounded-lg hover:bg-red-100 cursor-pointer";
const COMMUNITY_COMMENT_FILE_DELETE_CLASS = "size-4 min-size-4 max-size-4 rounded-lg hover:bg-red-100 cursor-pointer";
const COMMUNITY_PAGE_SIZE = 10;
const COMMUNITY_CARD_PAGE_SIZE = 5;
const COMMUNITY_PAGE_CACHE_TTL_MS = 9e4;
const COMMUNITY_TABBED_URLS = ["all", "free", "rcommunity", "notebook", "mine", "commented"];
const COMMUNITY_BOARD_CARD_KEYS = ["free", "notebook", "rcommunity"];
let header_title = "";
let header_subtitle = "\uCEE4\uBBA4\uB2C8\uD2F0";
const communityArticlePageCache = {};
const communityArticlePrefetching = {};
const communityState = {
  page_num: 1,
  article_counter: 0,
  toggle_page: false,
  toggle_click_submit: false,
  articleData: null,
  commentData: null,
  commentUpper: [],
  articleEditor: null,
  commentEditors: {},
  articleFile: null,
  articleFiles: [],
  commentFiles: {},
  listScrollBound: false,
  searchText: "",
  searchScope: "title",
  sourceGroup: "",
  cardPages: { free: 1, notebook: 1, rcommunity: 1 },
  cardCounters: { free: 0, notebook: 0, rcommunity: 0 }
};
function getCommunityMode() {
  if (typeof mode === "undefined" || mode == null || mode === "None") {
    return "";
  }
  return String(mode).trim().toLowerCase();
}
function normalizeCommunityRoute() {
  if (typeof sub === "undefined") {
    sub = "";
  }
  if (sub == null || sub === "None" || String(sub).trim().toLowerCase() === "undefined" || String(sub).trim().toLowerCase() === "null") {
    sub = "";
  }
  if (typeof orderID !== "undefined" && (orderID === "None" || orderID === "")) {
    orderID = null;
  }
  if (typeof url === "undefined" || url == null || url === "None" || url === "") {
    url = "free";
  }
  try {
    const pathname = window.location && window.location.pathname ? window.location.pathname : "";
    const query = new URLSearchParams(window.location && window.location.search ? window.location.search : "");
    if (pathname === "/community" || pathname === "/community/") {
      url = "all";
    }
    const initialSourceGroup = normalizeRCommunitySourceGroup(query.get("source_group") || query.get("source_filter") || sourceTypeToRCommunitySourceGroup(query.get("source_type") || ""));
    if (initialSourceGroup) {
      url = "rcommunity";
      communityState.sourceGroup = initialSourceGroup;
    }
    communityState.searchScope = normalizeCommunitySearchScope(query.get("search_scope") || query.get("scope") || communityState.searchScope);
    communityState.searchText = String(query.get("q") || query.get("search") || "").trim();
  } catch (e) {
  }
  header_title = getCommunityHeaderTitle(url);
  header_subtitle = "\uCEE4\uBBA4\uB2C8\uD2F0";
  init_url = getCommunityBaseUrl(url);
}
function getCommunityBaseUrl(boardUrl) {
  if (boardUrl == null || boardUrl === "" || boardUrl === "None" || boardUrl === "all" || boardUrl === "free" || boardUrl === "mine" || boardUrl === "commented") {
    return "/community/";
  }
  return "/community/" + boardUrl + "/";
}
function syncCommunityReadContext(article) {
  const rawCategory = String(article && (article.category_url || article.article_category_url) || "").trim().toLowerCase();
  const knownCategory = ["free", "visitor", "rblogger", "rproject", "rcommunity", "notebook"].includes(rawCategory) ? rawCategory : "free";
  url = knownCategory;
  sub = "";
  if (typeof window !== "undefined") {
    window.url = knownCategory;
    window.sub = "";
  }
  header_title = getCommunityHeaderTitle(knownCategory);
  init_url = getCommunityBaseUrl(knownCategory);
}
function getCommunityHeaderTitle(boardUrl) {
  if (boardUrl === "all") {
    return "\uCEE4\uBBA4\uB2C8\uD2F0";
  }
  if (boardUrl === "free") {
    return "\uC790\uC720 \uAC8C\uC2DC\uD310 / \uBB3B\uACE0 \uB2F5\uD558\uAE30";
  }
  if (boardUrl === "rblogger") {
    return "R-Blogger";
  }
  if (boardUrl === "rproject") {
    return "R-Project (Official)";
  }
  if (boardUrl === "notebook") {
    return "Web-R Notebook";
  }
  if (boardUrl === "rcommunity") {
    return "R Community";
  }
  if (boardUrl === "mine") {
    return "\uB0B4\uAC00 \uC4F4 \uAE00";
  }
  if (boardUrl === "commented") {
    return "\uB0B4\uAC00 \uB313\uAE00\uC744 \uC4F4 \uAE00";
  }
  if (boardUrl === "visitor") {
    return "\uAC00\uC785 \uC778\uC0AC / \uBC29\uBA85\uB85D";
  }
  return "\uCEE4\uBBA4\uB2C8\uD2F0";
}
function isTabbedCommunityUrl(boardUrl = url) {
  return COMMUNITY_TABBED_URLS.includes(boardUrl);
}
function getSidebarTag() {
  return normalizedCommunityTag();
}
function resetListPagination() {
  communityState.page_num = 1;
  communityState.article_counter = 0;
  communityState.toggle_page = false;
  communityState.cardPages = { free: 1, notebook: 1, rcommunity: 1 };
  communityState.cardCounters = { free: 0, notebook: 0, rcommunity: 0 };
}
function resetEditorState() {
  communityState.toggle_click_submit = false;
  communityState.articleEditor = null;
  communityState.articleData = null;
  communityState.articleFile = null;
  communityState.articleFiles = [];
  communityState.commentEditors = {};
  communityState.commentFiles = {};
  communityState.commentData = null;
  communityState.commentUpper = [];
}
function getEditorPlugins() {
  return [];
}
function createArticleEditorFallback(textarea) {
  return {
    getHTML: () => textarea ? textarea.value : "",
    setHTML: (html) => {
      if (textarea) {
        textarea.value = html || "";
      }
    }
  };
}
function createArticleEditorFallbackInHost(host, initialHTML = "") {
  if (!host) {
    return null;
  }
  host.innerHTML = "";
  const textarea = document.createElement("textarea");
  textarea.id = "txt_content";
  textarea.name = "txt_content";
  textarea.className = "w-full min-h-[500px] rounded-lg border border-gray-300 p-4 text-sm";
  textarea.setAttribute("rows", "18");
  textarea.setAttribute("placeholder", "\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
  textarea.value = initialHTML || "";
  host.appendChild(textarea);
  return createArticleEditorFallback(textarea);
}
function getArticleStorageKey() {
  const board = typeof url === "undefined" || url == null || url === "" || url === "None" ? "free" : url;
  const currentMode = getCommunityMode() || "write";
  const articleID = typeof orderID === "undefined" || orderID == null || orderID === "" || orderID === "None" ? "new" : orderID;
  return ["web-r", "community", board, currentMode, articleID].join(":");
}
async function mountSolidArticleEditor(initialHTML = null) {
  const host = document.getElementById("div_editor");
  if (!host) {
    return null;
  }
  const editorOptions = {
    placeholder: "\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
    storageKey: getArticleStorageKey(),
    textareaID: "txt_content",
    textareaName: "txt_content",
    restoreDraft: getCommunityMode() !== "edit",
    ribbonExpanded: false
  };
  if (typeof initialHTML === "string") {
    editorOptions.html = initialHTML;
  }
  if (window.WebRSolidEditor && typeof window.WebRSolidEditor.mountHost === "function") {
    return await window.WebRSolidEditor.mountHost(host, editorOptions);
  }
  return createArticleEditorFallbackInHost(host, typeof initialHTML === "string" ? initialHTML : "");
}
function getArticleEditorHTML() {
  const currentEditor = communityState.articleEditor;
  if (window.WebRSolidEditor && typeof window.WebRSolidEditor.getHTML === "function") {
    return window.WebRSolidEditor.getHTML(currentEditor);
  }
  if (!currentEditor) {
    const textarea2 = document.getElementById("txt_content");
    return textarea2 ? textarea2.value : "";
  }
  if (typeof currentEditor.__hostMirrorNow === "function") {
    return currentEditor.__hostMirrorNow(true);
  }
  if (typeof currentEditor.getHTML === "function") {
    return currentEditor.getHTML();
  }
  const textarea = document.getElementById("txt_content");
  return textarea ? textarea.value : "";
}
function setArticleEditorHTML(html) {
  const currentEditor = communityState.articleEditor;
  if (window.WebRSolidEditor && typeof window.WebRSolidEditor.setHTML === "function") {
    if (window.WebRSolidEditor.setHTML(currentEditor, html)) {
      return;
    }
  }
  if (currentEditor && typeof currentEditor.setHTML === "function") {
    currentEditor.setHTML(html || "");
    if (typeof currentEditor.__hostMirrorNow === "function") {
      currentEditor.__hostMirrorNow(true);
    }
    return;
  }
  const textarea = document.getElementById("txt_content");
  if (textarea) {
    textarea.value = html || "";
  }
}
function isArticleContentEmpty(html) {
  if (window.WebRSolidEditor && typeof window.WebRSolidEditor.isEmpty === "function") {
    return window.WebRSolidEditor.isEmpty(html);
  }
  const raw = String(html || "").trim();
  if (!raw) {
    return true;
  }
  if (/<(img|video|audio|iframe|table|pre|code|figure|hr|math|svg)\b/i.test(raw)) {
    return false;
  }
  return raw.replace(/<br\s*\/?>/gi, "").replace(/&nbsp;/gi, " ").replace(/<[^>]*>/g, "").trim() === "";
}
function getFileHref(raw) {
  raw = String(raw || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const normalizedPath = raw.startsWith("/") ? raw : "/" + raw;
  return window.location.protocol + "//" + window.location.host + normalizedPath;
}
function normalizeAttachmentList(data) {
  const fromArray = Array.isArray(data && data.attachments) ? data.attachments : [];
  const attachments = fromArray.map((item) => {
    const fileURL = item.file_url || item.url_file || "";
    const fileName = item.file_name || item.origin_file_name || fileURL;
    return {
      uuid: item.uuid || "",
      file_url: fileURL,
      url_file: fileURL,
      file_name: fileName,
      origin_file_name: fileName
    };
  }).filter((item) => item.file_url || item.file_name);
  if (attachments.length === 0 && data && data.file_url) {
    attachments.push({
      uuid: data.uuid_file || "",
      file_url: data.file_url,
      url_file: data.file_url,
      file_name: data.file_name || data.file_url,
      origin_file_name: data.file_name || data.file_url
    });
  }
  return attachments;
}
function queuedArticleFiles() {
  return communityState.articleFiles || [];
}
function queuedCommentFiles(commentId) {
  const key = commentId == null ? "new" : String(commentId);
  return communityState.commentFiles && communityState.commentFiles[key] || [];
}
function appendQueuedFiles(currentFiles, fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  const next = currentFiles ? currentFiles.slice() : [];
  files.forEach((file) => {
    const duplicate = next.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified);
    if (!duplicate) {
      next.push(file);
    }
  });
  return next;
}
function queueArticleFiles(fileList) {
  communityState.articleFiles = appendQueuedFiles(queuedArticleFiles(), fileList);
  communityState.articleFile = null;
  renderArticleAttachmentControl();
}
function queueCommentFiles(commentId, fileList) {
  const key = commentId == null ? "new" : String(commentId);
  communityState.commentFiles[key] = appendQueuedFiles(queuedCommentFiles(key), fileList);
  renderCommentAttachmentControl(key);
}
function removeQueuedArticleFile(index) {
  communityState.articleFiles = queuedArticleFiles().filter((_, i) => i !== index);
  renderArticleAttachmentControl();
}
function removeQueuedCommentFile(commentId, index) {
  const key = commentId == null ? "new" : String(commentId);
  communityState.commentFiles[key] = queuedCommentFiles(key).filter((_, i) => i !== index);
  renderCommentAttachmentControl(key);
}
function clearQueuedArticleFiles() {
  communityState.articleFiles = [];
  communityState.articleFile = null;
  renderArticleAttachmentControl();
}
function clearQueuedCommentFiles(commentId) {
  const key = commentId == null ? "new" : String(commentId);
  communityState.commentFiles[key] = [];
  renderCommentAttachmentControl(key);
}
function AttachmentDropZone(props) {
  const target = props.target || "article";
  const commentId = props.commentId == null ? "new" : String(props.commentId);
  const inputId = target === "article" ? "id_file_upload" : "id_file_upload_" + commentId;
  const files = target === "article" ? queuedArticleFiles() : queuedCommentFiles(commentId);
  const existing = props.existing || [];
  const compact = !!props.compact;
  const onFiles = (fileList) => {
    if (target === "article") {
      queueArticleFiles(fileList);
    } else {
      queueCommentFiles(commentId, fileList);
    }
  };
  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onFiles(event.dataTransfer ? event.dataTransfer.files : []);
  };
  const onDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const onRemove = (index) => {
    if (target === "article") {
      removeQueuedArticleFile(index);
    } else {
      removeQueuedCommentFile(commentId, index);
    }
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      class: (compact ? "p-3" : "p-4") + " w-full rounded-lg border border-dashed border-blue-300 bg-blue-50/40",
      onDrop,
      onDragOver
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "file",
        name: inputId,
        id: inputId,
        accept: "*",
        class: "hidden",
        multiple: true,
        onChange: (event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { class: "flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between" }, /* @__PURE__ */ React.createElement("div", { class: "text-sm text-gray-700" }, /* @__PURE__ */ React.createElement("p", { class: "font-semibold" }, "\uD30C\uC77C\uC744 \uB04C\uC5B4\uB2E4 \uB193\uAC70\uB098 \uC120\uD0DD\uD574\uC8FC\uC138\uC694."), /* @__PURE__ */ React.createElement("p", { class: "text-xs text-gray-500" }, "\uC5EC\uB7EC \uD30C\uC77C\uC744 \uD55C \uBC88\uC5D0 \uCCA8\uBD80\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        class: "flex flex-row justify-center items-center py-1.5 px-4 text-white bg-blue-700 font-medium rounded-lg text-center text-sm w-fit hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300",
        onClick: () => {
          const input = document.getElementById(inputId);
          if (input)
            input.click();
        }
      },
      /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/file_upload.svg", class: "w-4 h-4 mr-2" }),
      "\uD30C\uC77C \uC120\uD0DD"
    )),
    existing.length > 0 && /* @__PURE__ */ React.createElement("div", { class: "mt-3 space-y-1" }, existing.map((file, index) => /* @__PURE__ */ React.createElement(
      "a",
      {
        key: "existing_" + index,
        href: getFileHref(file.file_url || file.url_file),
        target: "_blank",
        class: "block w-fit text-xs text-gray-600 hover:underline"
      },
      "\uAE30\uC874 \uCCA8\uBD80: ",
      file.file_name || file.origin_file_name || file.file_url
    ))),
    files.length > 0 && /* @__PURE__ */ React.createElement("div", { class: "mt-3 flex flex-col gap-2" }, files.map((file, index) => /* @__PURE__ */ React.createElement("div", { key: file.name + "_" + index, class: "flex flex-row justify-between items-center gap-2 rounded-md bg-white border border-blue-100 px-3 py-2 text-sm" }, /* @__PURE__ */ React.createElement("span", { class: "truncate" }, file.name), /* @__PURE__ */ React.createElement("button", { type: "button", class: "text-xs text-red-600 hover:underline", onClick: () => onRemove(index) }, "\uC0AD\uC81C"))))
  );
}
function renderArticleAttachmentControl() {
  const host = document.getElementById("div_article_file_control");
  if (!host) {
    return;
  }
  const existing = communityState.articleData ? normalizeAttachmentList(communityState.articleData) : [];
  ReactDOM.render(/* @__PURE__ */ React.createElement(AttachmentDropZone, { target: "article", existing }), host);
}
function renderCommentAttachmentControl(commentId) {
  const key = commentId == null ? "new" : String(commentId);
  ["div_comment_file_control_" + key, "div_comment_edit_file_control_" + key].forEach((hostID) => {
    const host = document.getElementById(hostID);
    if (!host) {
      return;
    }
    ReactDOM.render(/* @__PURE__ */ React.createElement(AttachmentDropZone, { target: "comment", commentId: key, compact: true }), host);
  });
}
async function uploadQueuedFiles(files, options = {}) {
  const uploadFiles = Array.from(files || []).filter(Boolean);
  for (let index = 0; index < uploadFiles.length; index += 1) {
    const formData = new FormData();
    formData.append("file_input", uploadFiles[index]);
    formData.append("host", window.location.href.toString());
    formData.append("note", options.note || "Article");
    formData.append("active", 1);
    formData.append("attachment_scope", options.scope || "");
    formData.append("attachment_order", index);
    if (options.articleUUID) {
      formData.append("uuid_article", options.articleUUID);
    }
    if (options.commentUUID) {
      formData.append("uuid_comment", options.commentUUID);
    }
    const result = await fetch("/blank/ajax_file_upload/", {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: formData
    }).then((res) => res.json());
    if (result && result.error) {
      throw new Error(result.error);
    }
  }
}
function createCommentEditorFallbackInHost(host, commentId, initialHTML = "") {
  if (!host) {
    return null;
  }
  host.classList.add("webr-comment-editor-host");
  host.innerHTML = "";
  const textarea = document.createElement("textarea");
  textarea.id = "txt_content_comment_" + commentId;
  textarea.name = "txt_content_comment_" + commentId;
  textarea.className = "w-full min-h-[220px] rounded-lg border border-gray-300 p-3 text-sm";
  textarea.setAttribute("rows", "8");
  textarea.setAttribute("placeholder", "\uB313\uAE00\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
  textarea.value = initialHTML || "";
  host.appendChild(textarea);
  return createArticleEditorFallback(textarea);
}
function commentEditorHostHasInput(host, requireVisible = true) {
  if (!host) {
    return false;
  }
  const candidates = Array.from(host.querySelectorAll("textarea, [contenteditable='true'], [role='textbox'], .ProseMirror"));
  if (!requireVisible) {
    return candidates.length > 0;
  }
  return candidates.some((element) => {
    const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
    if (style && (style.display === "none" || style.visibility === "hidden")) {
      return false;
    }
    const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
    return !rect || rect.width > 20 && rect.height > 40;
  });
}
function recoverCommentEditorIfMissing(commentId, hostID = null, initialHTML = "") {
  const key = commentId == null ? "new" : String(commentId);
  const defaultHostID = key === "new" ? "div_community_read_comment_new_form" : "div_community_read_comment_new_" + key + "_form";
  const host = document.getElementById(hostID || defaultHostID);
  if (!host || commentEditorHostHasInput(host)) {
    return null;
  }
  return createCommentEditorFallbackInHost(host, key, initialHTML || "");
}
function ensureCommentEditorInput(commentId, hostID = null, initialHTML = "") {
  const key = commentId == null ? "new" : String(commentId);
  const defaultHostID = key === "new" ? "div_community_read_comment_new_form" : "div_community_read_comment_new_" + key + "_form";
  const host = document.getElementById(hostID || defaultHostID);
  if (!host) {
    return null;
  }
  if (commentEditorHostHasInput(host)) {
    return communityState.commentEditors[key] || null;
  }
  const fallback = createCommentEditorFallbackInHost(host, key, initialHTML || "");
  if (fallback) {
    communityState.commentEditors[key] = fallback;
  }
  return fallback;
}
function scheduleCommentEditorRecovery(commentId, hostID = null, initialHTML = "") {
  const key = commentId == null ? "new" : String(commentId);
  const recover = () => {
    ensureCommentEditorInput(key, hostID, initialHTML);
  };
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(recover);
  }
  [40, 120, 300, 600, 1200, 2400].forEach((delay) => setTimeout(recover, delay));
  const startedAt = Date.now();
  const intervalID = setInterval(() => {
    recover();
    if (Date.now() - startedAt > 4e3) {
      clearInterval(intervalID);
    }
  }, 250);
}
function getCommentStorageKey(commentId) {
  const board = typeof url === "undefined" || url == null || url === "" || url === "None" ? "free" : url;
  const articleID = typeof orderID === "undefined" || orderID == null || orderID === "" || orderID === "None" ? "new" : orderID;
  return ["web-r", "community", board, "comment", articleID, commentId || "new"].join(":");
}
async function mountSolidCommentEditor(commentId, initialHTML = "", hostID = null) {
  const key = commentId == null ? "new" : String(commentId);
  const defaultHostID = key === "new" ? "div_community_read_comment_new_form" : "div_community_read_comment_new_" + key + "_form";
  const host = document.getElementById(hostID || defaultHostID);
  if (!host) {
    return null;
  }
  const textareaID = "txt_content_comment_" + key;
  const editorOptions = {
    placeholder: "\uB313\uAE00\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
    storageKey: getCommentStorageKey(key),
    textareaID,
    textareaName: textareaID,
    restoreDraft: !hostID,
    ribbonExpanded: false,
    minHeight: "220px"
  };
  if (typeof initialHTML === "string") {
    editorOptions.html = initialHTML;
  }
  ensureCommentEditorInput(key, hostID, initialHTML || "");
  if (window.WebRSolidEditor && typeof window.WebRSolidEditor.mountHost === "function") {
    try {
      const solidHost = document.createElement("div");
      solidHost.className = "w-full";
      const mounted = await window.WebRSolidEditor.mountHost(solidHost, editorOptions);
      if (mounted && commentEditorHostHasInput(solidHost, false)) {
        host.innerHTML = "";
        solidHost.classList.forEach((className) => host.classList.add(className));
        host.classList.add("webr-comment-editor-host");
        while (solidHost.firstChild) {
          host.appendChild(solidHost.firstChild);
        }
        scheduleCommentEditorRecovery(key, hostID, initialHTML || "");
        return mounted;
      }
    } catch (error) {
      console.error("[mountSolidCommentEditor] solid editor mount failed", error);
    }
  }
  scheduleCommentEditorRecovery(key, hostID, initialHTML || "");
  return ensureCommentEditorInput(key, hostID, initialHTML || "") || createCommentEditorFallbackInHost(host, key, initialHTML || "");
}
function getCommentEditorHTML(currentEditor) {
  if (currentEditor && window.WebRSolidEditor && typeof window.WebRSolidEditor.getHTML === "function") {
    const html = window.WebRSolidEditor.getHTML(currentEditor);
    if (typeof html === "string") {
      return html;
    }
  }
  if (currentEditor && typeof currentEditor.__hostMirrorNow === "function") {
    return currentEditor.__hostMirrorNow(true);
  }
  if (currentEditor && typeof currentEditor.getHTML === "function") {
    return currentEditor.getHTML();
  }
  const textarea = document.querySelector("textarea[id^='txt_content_comment_']");
  if (textarea) {
    return textarea.value || "";
  }
  return "";
}
function setCommentEditorHTML(currentEditor, html) {
  if (window.WebRSolidEditor && typeof window.WebRSolidEditor.setHTML === "function") {
    if (window.WebRSolidEditor.setHTML(currentEditor, html)) {
      return;
    }
  }
  if (currentEditor && typeof currentEditor.setHTML === "function") {
    currentEditor.setHTML(html || "");
  }
}
function isCommentContentEmpty(html) {
  return isArticleContentEmpty(html);
}
async function compressImage(blob, maxWidth = 1200, maxHeight = 1200, quality = 0.8, maxSizeKB = 500) {
  let currentQuality = quality;
  let dataUrl = await _compressImageOnce(blob, maxWidth, maxHeight, currentQuality);
  const calcSizeKB = (base64) => {
    const commaIndex = base64.indexOf(",");
    const base64Str = commaIndex >= 0 ? base64.substring(commaIndex + 1) : base64;
    const byteLength = Math.ceil(base64Str.length * 3 / 4);
    return byteLength / 1024;
  };
  let sizeKB = calcSizeKB(dataUrl);
  while (sizeKB > maxSizeKB && currentQuality > 0.3) {
    currentQuality = parseFloat((currentQuality - 0.1).toFixed(2));
    if (currentQuality <= 0.3) {
      currentQuality = 0.3;
    }
    dataUrl = await _compressImageOnce(blob, maxWidth, maxHeight, currentQuality);
    sizeKB = calcSizeKB(dataUrl);
  }
  return dataUrl;
}
function _compressImageOnce(blob, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          let width = img.width;
          let height = img.height;
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio, 1);
          const targetWidth = Math.round(width * ratio);
          const targetHeight = Math.round(height * ratio);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          let mimeType = blob.type;
          if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
            mimeType = "image/jpeg";
          }
          if (mimeType === "image/png") {
            resolve(canvas.toDataURL("image/png"));
          } else {
            resolve(canvas.toDataURL("image/jpeg", quality));
          }
        };
        img.onerror = function(err) {
          reject(err);
        };
        img.src = e.target.result;
      };
      reader.onerror = function(err) {
        reject(err);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      reject(err);
    }
  });
}
const class_span_btn_default = "flex flex-row justify-center items-center w-fit h-[20px] px-1.5 rounded-xl";
const webr_status_badge_base = "inline-flex h-[24px] min-w-[44px] items-center justify-center rounded-md px-2 text-[12px] font-extrabold leading-none";
const webr_status_badge_tones = {
  new: "bg-red-50 text-red-600",
  secret: "bg-slate-100 text-slate-700",
  my: "bg-blue-50 text-blue-700"
};
function WebRStatusBadge(props) {
  return /* @__PURE__ */ React.createElement("span", { class: `${webr_status_badge_base} ${webr_status_badge_tones[props.tone] || webr_status_badge_tones.secret}` }, props.label);
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
  return /* @__PURE__ */ React.createElement("span", { class: `${class_span_btn_default} text-xs bg-${role}-100 text-${role}-800` }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/board_user.svg", class: "w-3 h-3 mr-1" }), props.user_nickname);
}
function Span_btn_date(props) {
  return /* @__PURE__ */ React.createElement("span", { class: `${class_span_btn_default} text-xs bg-blue-100 text-blue-800` }, /* @__PURE__ */ React.createElement("img", { src: `https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/calendar_${Number(props.date.split("-")[2].substr(0, 2))}.svg`, class: "w-3 h-3 mr-1" }), props.date);
}
function Span_btn_article_read(props) {
  return props.cnt_read > 0 && /* @__PURE__ */ React.createElement("span", { class: `${class_span_btn_default} text-xs bg-gray-100 text-blue-800` }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/eye.svg", class: "w-3 h-3 mr-1" }), props.cnt_read.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
}
function Span_btn_article_comment(props) {
  return props.cnt_comment > 0 && /* @__PURE__ */ React.createElement("span", { class: `${class_span_btn_default} text-xs bg-purple-100 text-blue-800` }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/comment.svg", class: "w-3 h-3 mr-1" }), props.cnt_comment.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
}
function Span_btn_article_new(props) {
  return props.toggle === 1 && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "new", label: "NEW" });
}
function Span_btn_article_secret(props) {
  return props.toggle === 1 && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "secret", label: "SECRET" });
}
function Span_btn_comment_secret(props) {
  return props.toggle === 1 && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "secret", label: "SECRET" });
}
function Span_btn_my_article(props) {
  return props.toggle === "writer" && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "my", label: "MY" });
}
function Span_btn_my_comment(props) {
  return props.toggle === "writer" && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "my", label: "MY" });
}
function Div_box_header(props) {
  return /* @__PURE__ */ React.createElement("div", { class: "flex w-full items-center justify-between gap-2 border-b border-slate-200 pb-2" }, /* @__PURE__ */ React.createElement("p", { class: "text-base font-bold text-slate-950" }, props.title), props.count != null && /* @__PURE__ */ React.createElement("span", { class: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600" }, props.count));
}
function Div_sidelist_skeleton(props) {
  return /* @__PURE__ */ React.createElement("div", { id: props.id, class: "w-full" }, /* @__PURE__ */ React.createElement("div", { class: SIDEBAR_CARD_CLASS }, /* @__PURE__ */ React.createElement(Div_box_header, { title: props.title }), /* @__PURE__ */ React.createElement("div", { class: "space-y-3 animate-pulse" }, /* @__PURE__ */ React.createElement("div", { class: "h-4 bg-slate-200 rounded-full w-11/12" }), /* @__PURE__ */ React.createElement("div", { class: "h-3 bg-slate-100 rounded-full w-8/12" }), /* @__PURE__ */ React.createElement("div", { class: "h-4 bg-slate-200 rounded-full w-10/12" }), /* @__PURE__ */ React.createElement("div", { class: "h-3 bg-slate-100 rounded-full w-7/12" }))));
}
function Div_article_list_skeleton() {
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-2 animate-pulse" }, /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }), /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }), /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }), /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }), /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }));
}
function TabButton({ active, onClick, children }) {
  const base = "px-3 py-1.5 text-xs font-bold rounded-full transition-all select-none";
  const activeCls = " bg-blue-600 text-white shadow-sm";
  const inActiveCls = " bg-gray-100 text-gray-700 hover:bg-gray-200";
  return /* @__PURE__ */ React.createElement("button", { type: "button", onClick, class: base + (active ? activeCls : inActiveCls) }, children);
}
function DivBoardTabs() {
  if (!isTabbedCommunityUrl(url)) {
    return null;
  }
  const activeTab = isTabbedCommunityUrl(url) ? url : "all";
  return /* @__PURE__ */ React.createElement("div", { class: "flex w-full flex-col gap-2 pt-2 lg:flex-row lg:items-center lg:justify-between" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement(TabButton, { active: activeTab === "all", onClick: () => handleChangeTab("all") }, "\uC804\uCCB4\uBCF4\uAE30"), /* @__PURE__ */ React.createElement(TabButton, { active: activeTab === "free", onClick: () => handleChangeTab("free") }, "\uC790\uC720\uAC8C\uC2DC\uD310"), /* @__PURE__ */ React.createElement(TabButton, { active: activeTab === "rcommunity", onClick: () => handleChangeTab("rcommunity") }, "R Community"), /* @__PURE__ */ React.createElement(TabButton, { active: activeTab === "notebook", onClick: () => handleChangeTab("notebook") }, "Web-R Notebook")), /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center justify-start gap-2 lg:justify-end" }, /* @__PURE__ */ React.createElement(TabButton, { active: activeTab === "mine", onClick: () => handleChangeTab("mine") }, "\uB0B4\uAC00 \uC4F4 \uAE00"), /* @__PURE__ */ React.createElement(TabButton, { active: activeTab === "commented", onClick: () => handleChangeTab("commented") }, "\uB0B4\uAC00 \uB313\uAE00\uC744 \uC4F4 \uAE00")));
}
const SIDEBAR_CARD_CLASS = "flex h-full min-h-[220px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm";
function stripHTMLText(raw) {
  return String(raw || "").replace(/<[^>]*>?/g, " ").replace(/\s+/g, " ").trim();
}
function cleanBoardTitle(raw) {
  return String(raw || "").replace(/\uFFFD+/g, "").replace(/\s+/g, " ").trim();
}
function compactDate(raw) {
  const value = String(raw || "").replace("T", " ").trim();
  if (!value) {
    return "";
  }
  return value.length > 16 ? value.slice(0, 16) : value;
}
function numberText(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) {
    return "";
  }
  return n.toLocaleString("ko-KR");
}
function communityCategoryInfo(categoryUrl) {
  const cu = String(categoryUrl || "").trim().toLowerCase();
  const map = {
    free: ["\uC790\uC720\uAC8C\uC2DC\uD310", "bg-blue-50 text-blue-700 border-blue-200"],
    visitor: ["\uBC29\uBA85\uB85D", "bg-orange-50 text-orange-700 border-orange-200"],
    rblogger: ["R-Blogger", "bg-violet-50 text-violet-700 border-violet-200"],
    rproject: ["R-Project", "bg-sky-50 text-sky-700 border-sky-200"],
    notebook: ["Notebook", "bg-emerald-50 text-emerald-700 border-emerald-200"],
    rcommunity: ["R Community", "bg-teal-50 text-teal-700 border-teal-200"]
  };
  const picked = map[cu] || ["\uCEE4\uBBA4\uB2C8\uD2F0", "bg-slate-50 text-slate-700 border-slate-200"];
  return { label: picked[0], className: picked[1], categoryUrl: cu };
}
function rCommunitySourceLabel(article) {
  if (!article || String(article.category_url || "").trim().toLowerCase() !== "rcommunity") {
    return "";
  }
  const sourceName = String(article.source_name || "").trim();
  const sourceID = String(article.source_id || "").trim();
  const sourceType = String(article.source_type || "").trim().toLowerCase();
  const platform = String(article.platform || "").trim().toLowerCase();
  const raw = (sourceName || platform || sourceType).toLowerCase();
  const mastodonTagMatch = sourceName.match(/^Mastodon\s+(#[A-Za-z0-9_]+)\s*@\s*([A-Za-z0-9.-]+)$/i);
  if (mastodonTagMatch) {
    return `${mastodonTagMatch[1]} @ ${mastodonTagMatch[2]}`;
  }
  const fediverseGroupMatch = sourceName.match(/\b([A-Za-z0-9_]+@[A-Za-z0-9.-]+)\b/);
  if (fediverseGroupMatch) {
    return fediverseGroupMatch[1];
  }
  if (raw.includes("stack overflow") || platform.includes("stackoverflow")) {
    return "Stack Overflow";
  }
  if (raw.includes("posit")) {
    return "Posit";
  }
  if (raw.includes("tidytuesday")) {
    return "#TidyTuesday";
  }
  if (raw.includes("r/rstudio")) {
    return "r/RStudio";
  }
  if (raw.includes("r/rprogramming")) {
    return "r/rprogramming";
  }
  const subredditMatch = `${sourceName} ${sourceID}`.match(/\br\/[A-Za-z0-9_]+\b/);
  if (subredditMatch) {
    return subredditMatch[0];
  }
  if (raw.includes("reddit") || raw.startsWith("r/")) {
    return "Reddit";
  }
  if (raw.includes("rstats@") || raw.includes("mastodon") || sourceType === "fediverse_group" || sourceType === "social_tag") {
    return "#rstats";
  }
  if (sourceType === "community_forum") {
    return "\uD3EC\uB7FC";
  }
  if (sourceType === "qna_feed") {
    return "Q&A";
  }
  return "";
}
function RCommunitySourceChip(props) {
  const label = rCommunitySourceLabel(props.article);
  if (!label) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("span", { class: "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600" }, label);
}
function communityNotebookViewHref(href) {
  try {
    const url = new URL(href, location.origin);
    if (url.origin === location.origin && url.pathname.indexOf("/webr/notebook/view/") === 0) {
      if (!url.searchParams.has("from")) {
        url.searchParams.set("from", "community");
      }
      return url.pathname + url.search + url.hash;
    }
  } catch (e) {
  }
  return href;
}
function articleHrefFromData(data) {
  if (!data) {
    return "/community/";
  }
  const uuid = String(data.uuid || data.uuid_article || "").trim();
  const cu = String(data.category_url || data.article_category_url || "free").trim().toLowerCase();
  if ((cu === "notebook" || cu === "rcommunity") && data.url) {
    return cu === "notebook" ? communityNotebookViewHref(data.url) : data.url;
  }
  if (uuid === "") {
    return "/community/";
  }
  if (cu && cu !== "free" && cu !== "all") {
    return "/community/" + cu + "/read/" + uuid + "/";
  }
  return "/community/read/" + uuid + "/";
}
function normalizedCommunityTag() {
  const raw = typeof window.url === "undefined" || window.url == null ? "all" : String(window.url).trim();
  if (raw === "" || raw === "None" || raw.toLowerCase() === "undefined" || raw.toLowerCase() === "null") {
    return "all";
  }
  return raw;
}
function normalizedCommunityTagSub() {
  const raw = typeof window.sub === "undefined" || window.sub == null ? "" : String(window.sub).trim();
  if (raw === "" || raw === "None" || raw.toLowerCase() === "undefined" || raw.toLowerCase() === "null") {
    return "";
  }
  return raw;
}
function normalizeCommunitySearchScope(value) {
  const key = String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (key === "content" || key === "all" || key === "body" || key === "title-content" || key === "title+content") {
    return "content";
  }
  return "title";
}
function communitySearchScope() {
  communityState.searchScope = normalizeCommunitySearchScope(communityState.searchScope);
  return communityState.searchScope;
}
function normalizeRCommunitySourceGroup(value) {
  const key = String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (key === "reddit") {
    return "reddit";
  }
  if (key === "stack" || key === "stack-overflow" || key === "stackoverflow") {
    return "stackoverflow";
  }
  if (key === "posit" || key === "posit-community") {
    return "posit";
  }
  if (key === "mastodon" || key === "fediverse" || key === "rstats" || key === "social-tag") {
    return "mastodon";
  }
  return "";
}
function sourceTypeToRCommunitySourceGroup(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "qna_feed") {
    return "stackoverflow";
  }
  if (key === "social_tag" || key === "fediverse_group") {
    return "mastodon";
  }
  return "";
}
function communitySourceGroup() {
  if (normalizedCommunityTag() !== "rcommunity") {
    return "";
  }
  communityState.sourceGroup = normalizeRCommunitySourceGroup(communityState.sourceGroup);
  return communityState.sourceGroup;
}
function communitySearchText() {
  const input = document.getElementById("txt_search");
  const value = input ? input.value.trim() : String(communityState.searchText || "").trim();
  communityState.searchText = value;
  return value;
}
function communityArticlePageCacheKey(page, searchText) {
  const viewer = [
    typeof gv_username === "undefined" || gv_username == null ? "" : String(gv_username),
    typeof window === "undefined" || window.gv_role == null ? "" : String(window.gv_role)
  ].join(":");
  return [normalizedCommunityTag(), normalizedCommunityTagSub(), String(searchText || "").trim(), communitySearchScope(), communitySourceGroup(), viewer, String(page || 1)].join("|");
}
function readCommunityArticlePageCache(page, searchText) {
  const key = communityArticlePageCacheKey(page, searchText);
  const cached = communityArticlePageCache[key];
  if (!cached || Date.now() - cached.at > COMMUNITY_PAGE_CACHE_TTL_MS) {
    delete communityArticlePageCache[key];
    return null;
  }
  return cached.data;
}
function writeCommunityArticlePageCache(page, searchText, data) {
  communityArticlePageCache[communityArticlePageCacheKey(page, searchText)] = { at: Date.now(), data };
}
function buildCommunityArticleListForm(page, searchText) {
  const requestData = new FormData();
  requestData.append("tag", normalizedCommunityTag());
  const tagSub = normalizedCommunityTagSub();
  if (tagSub !== "") {
    requestData.append("tag_sub", tagSub);
  }
  if (String(searchText || "").trim() !== "") {
    requestData.append("txt_search", String(searchText || "").trim());
    requestData.append("search_scope", communitySearchScope());
  }
  const sourceGroup = communitySourceGroup();
  if (sourceGroup) {
    requestData.append("source_group", sourceGroup);
  }
  requestData.append("page", page);
  return requestData;
}
async function fetchCommunityArticlePage(page, searchText) {
  const data = await fetch("/blank/ajax_board/get_article_list/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: buildCommunityArticleListForm(page, searchText)
  }).then((res) => res.json());
  writeCommunityArticlePageCache(page, searchText, data);
  return data;
}
function prefetchCommunityArticlePages(currentPage, totalPages, searchText) {
  const activeTag = normalizedCommunityTag();
  if (activeTag === "mine" || activeTag === "commented") {
    return;
  }
  const pages = [];
  const addPage = (page) => {
    const n = Number(page);
    if (!Number.isFinite(n) || n < 1 || n > totalPages || n === currentPage || pages.includes(n)) {
      return;
    }
    if (readCommunityArticlePageCache(n, searchText)) {
      return;
    }
    pages.push(n);
  };
  addPage(currentPage + 1);
  addPage(currentPage + 2);
  addPage(currentPage - 1);
  addPage(1);
  pages.slice(0, 3).forEach((page) => {
    const key = communityArticlePageCacheKey(page, searchText);
    if (communityArticlePrefetching[key]) {
      return;
    }
    communityArticlePrefetching[key] = true;
    window.setTimeout(() => {
      fetchCommunityArticlePage(page, searchText).catch(() => null).finally(() => {
        delete communityArticlePrefetching[key];
      });
    }, 80);
  });
}
function latestArticleMetaParts(article) {
  const parts = [];
  const author = article.user_nickname || "\uC791\uC131\uC790";
  parts.push(author);
  const date = compactDate(article.created_at);
  if (date) {
    parts.push(date);
  }
  const readText = numberText(article.cnt_read);
  if (readText) {
    parts.push("\uC870\uD68C " + readText);
  }
  const commentText = numberText(article.cnt_comment);
  if (commentText) {
    parts.push("\uB313\uAE00 " + commentText);
  }
  return parts;
}
function LatestArticleItem(props) {
  const article = props.data || {};
  const info = communityCategoryInfo(article.category_url);
  const meta = latestArticleMetaParts(article);
  const title = cleanBoardTitle(article.title) || "\uC81C\uBAA9 \uC5C6\uC74C";
  const linkProps = { href: articleHrefFromData(article) };
  return /* @__PURE__ */ React.createElement("a", { ...linkProps, class: "group block w-full rounded-lg border border-transparent px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/70" }, /* @__PURE__ */ React.createElement("div", { class: "mb-1 flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { class: "rounded-full border px-2 py-0.5 text-xs font-semibold " + info.className }, info.label), /* @__PURE__ */ React.createElement(RCommunitySourceChip, { article }), article.check_reader === "writer" && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "my", label: "MY" }), article.is_new === 1 && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "new", label: "NEW" })), /* @__PURE__ */ React.createElement("p", { class: "whitespace-normal break-keep text-base font-bold leading-6 text-slate-950 group-hover:text-blue-800" }, title), /* @__PURE__ */ React.createElement("div", { class: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500" }, meta.map((part, index) => /* @__PURE__ */ React.createElement("span", { key: "latest_meta_" + index }, part))));
}
function PaginationButton(props) {
  const disabled = !!props.disabled;
  const active = !!props.active;
  const base = "inline-flex min-w-9 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition";
  const cls = disabled ? " cursor-not-allowed bg-slate-100 text-slate-400" : active ? " bg-blue-600 text-white shadow-sm" : " bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-blue-50 hover:text-blue-700";
  return /* @__PURE__ */ React.createElement("button", { type: "button", disabled, onClick: disabled ? void 0 : props.onClick, class: base + cls }, props.children);
}
function ArticlePagination(props) {
  const totalCount = Number(props.totalCount || 0);
  const currentPage = Math.max(1, Number(props.currentPage || 1));
  const pageSize = Math.max(1, Number(props.pageSize || COMMUNITY_PAGE_SIZE));
  const onPageChange = typeof props.onPageChange === "function" ? props.onPageChange : goToArticlePage;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) {
    return null;
  }
  const pages = [];
  const addPage = (page) => {
    if (page >= 1 && page <= totalPages && !pages.includes(page)) {
      pages.push(page);
    }
  };
  addPage(1);
  addPage(currentPage - 1);
  addPage(currentPage);
  addPage(currentPage + 1);
  addPage(totalPages);
  pages.sort((a, b) => a - b);
  const nodes = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) {
      nodes.push(/* @__PURE__ */ React.createElement("span", { key: "gap_" + page, class: "px-1 text-sm text-slate-400" }, "..."));
    }
    nodes.push(/* @__PURE__ */ React.createElement(PaginationButton, { key: "page_" + page, active: page === currentPage, onClick: () => onPageChange(page) }, page));
  });
  return /* @__PURE__ */ React.createElement("nav", { class: "flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4" }, /* @__PURE__ */ React.createElement("p", { class: "text-sm text-slate-500" }, "\uCD1D ", totalCount.toLocaleString("ko-KR"), "\uAC74 / ", currentPage.toLocaleString("ko-KR"), " / ", totalPages.toLocaleString("ko-KR"), "\uD398\uC774\uC9C0"), /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement(PaginationButton, { disabled: currentPage <= 1, onClick: () => onPageChange(currentPage - 1) }, "\uC774\uC804"), nodes, /* @__PURE__ */ React.createElement(PaginationButton, { disabled: currentPage >= totalPages, onClick: () => onPageChange(currentPage + 1) }, "\uB2E4\uC74C")));
}
function SidebarCard(props) {
  const items = Object.values(props.data || {}).filter(Boolean);
  return /* @__PURE__ */ React.createElement("div", { class: SIDEBAR_CARD_CLASS }, /* @__PURE__ */ React.createElement(Div_box_header, { title: props.title, count: items.length > 0 ? items.length : null }), items.length === 0 ? /* @__PURE__ */ React.createElement("div", { class: "flex min-h-[120px] items-center justify-center text-center text-sm text-slate-500" }, props.empty || "\uD45C\uC2DC\uD560 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.") : /* @__PURE__ */ React.createElement("div", { class: "mt-3 flex flex-col gap-2" }, items.map((item, index) => props.renderItem(item, index))));
}
function SidebarArticleItem(props) {
  const article = props.data || {};
  const info = communityCategoryInfo(article.category_url);
  const readText = numberText(article.cnt_read);
  const commentText = numberText(article.cnt_comment);
  const title = cleanBoardTitle(article.title) || "\uC81C\uBAA9 \uC5C6\uC74C";
  return /* @__PURE__ */ React.createElement("a", { href: articleHrefFromData(article), class: "group block rounded-md border border-transparent px-2 py-2 transition hover:border-blue-200 hover:bg-blue-50/60" }, /* @__PURE__ */ React.createElement("div", { class: "mb-1 flex min-w-0 flex-wrap items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { class: "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4 " + info.className }, info.label), /* @__PURE__ */ React.createElement(RCommunitySourceChip, { article }), article.check_reader === "writer" && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "my", label: "MY" }), article.is_new === 1 && /* @__PURE__ */ React.createElement(WebRStatusBadge, { tone: "new", label: "NEW" })), /* @__PURE__ */ React.createElement("p", { class: "truncate text-sm font-semibold leading-5 text-slate-950 group-hover:text-blue-800" }, title), /* @__PURE__ */ React.createElement("div", { class: "mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500" }, /* @__PURE__ */ React.createElement("span", { class: "max-w-[9rem] truncate font-medium text-slate-700" }, article.user_nickname || "\uC791\uC131\uC790"), compactDate(article.created_at) && /* @__PURE__ */ React.createElement("span", null, compactDate(article.created_at)), readText && /* @__PURE__ */ React.createElement("span", null, "\uC870\uD68C ", readText), commentText && /* @__PURE__ */ React.createElement("span", null, "\uB313\uAE00 ", commentText)));
}
function SidebarCommentItem(props) {
  const comment = props.data || {};
  const href = articleHrefFromData({ uuid: comment.uuid_article, category_url: comment.article_category_url, url: comment.article_url });
  const content = stripHTMLText(comment.content) || "\uB313\uAE00 \uB0B4\uC6A9";
  const articleTitle = cleanBoardTitle(comment.article_title) || "\uC6D0\uAE00";
  return /* @__PURE__ */ React.createElement("a", { href, class: "group block rounded-md border border-transparent px-2 py-2 transition hover:border-blue-200 hover:bg-blue-50/60" }, /* @__PURE__ */ React.createElement("p", { class: "truncate text-sm font-semibold leading-5 text-slate-950 group-hover:text-blue-800" }, content), /* @__PURE__ */ React.createElement("p", { class: "mt-1 truncate rounded bg-slate-50 px-2 py-1 text-xs text-slate-500" }, "\uC6D0\uAE00: ", articleTitle), /* @__PURE__ */ React.createElement("div", { class: "mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500" }, /* @__PURE__ */ React.createElement("span", { class: "max-w-[9rem] truncate font-medium text-slate-700" }, comment.user_nickname || "\uC791\uC131\uC790"), compactDate(comment.created_at) && /* @__PURE__ */ React.createElement("span", null, compactDate(comment.created_at))));
}
function indexedRowsFromArray(rows) {
  const out = {};
  rows.filter(Boolean).forEach((row, index) => {
    out[index] = row;
  });
  return out;
}
function filterIndexedRows(data, searchText, searchScope = communitySearchScope()) {
  const needle = String(searchText || "").trim().toLowerCase();
  if (!needle) {
    return data || {};
  }
  return indexedRowsFromArray(Object.values(data || {}).filter((row) => {
    const values = [row.title];
    if (normalizeCommunitySearchScope(searchScope) === "content") {
      values.push(row.content, row.description);
    }
    const haystack = values.map((value) => String(value || "")).join(" ").toLowerCase();
    return haystack.includes(needle);
  }));
}
function commentsToCommentedArticleRows(data, searchText, searchScope = communitySearchScope()) {
  const needle = String(searchText || "").trim().toLowerCase();
  const rows = [];
  const seen = {};
  Object.values(data || {}).filter(Boolean).forEach((comment) => {
    const uuid = String(comment.uuid_article || "").trim();
    const title = cleanBoardTitle(comment.article_title) || "\uC6D0\uAE00";
    const key = uuid || title;
    if (!key || seen[key]) {
      return;
    }
    const values = [title];
    if (normalizeCommunitySearchScope(searchScope) === "content") {
      values.push(stripHTMLText(comment.content));
    }
    const haystack = values.map((value) => String(value || "")).join(" ").toLowerCase();
    if (needle && !haystack.includes(needle)) {
      return;
    }
    seen[key] = true;
    rows.push({
      uuid,
      category_url: comment.article_category_url || "free",
      title,
      user_nickname: "\uB0B4 \uB313\uAE00",
      created_at: comment.created_at,
      cnt_read: 0,
      cnt_comment: 0,
      is_new: 0,
      check_reader: "user"
    });
  });
  return indexedRowsFromArray(rows);
}
function Div_new_article_list(props) {
  const cu = props.data.category_url;
  let href = "/community/read/" + props.data.uuid + "/";
  if (cu === "visitor") {
    href = "/community/visitor/read/" + props.data.uuid + "/";
  } else if (cu === "rproject") {
    href = "/community/rproject/read/" + props.data.uuid + "/";
  } else if (cu === "notebook" && props.data.url) {
    href = props.data.url;
  } else if (cu === "rcommunity" && props.data.url) {
    href = props.data.url;
  }
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
  } else if (cu === "rcommunity") {
    category_title = "R Community";
    category_title_color = " bg-teal-100 text-teal-700 border-teal-300";
  } else if (cu === "visitor") {
    category_title = "\uBC29\uBA85\uB85D";
    category_title_color = " bg-orange-100 text-orange-700 border-orange-300";
  }
  const linkProps = { href };
  return /* @__PURE__ */ React.createElement("div", { class: "bg-white w-full" }, /* @__PURE__ */ React.createElement("a", { ...linkProps, class: "flex w-full flex-col px-6 py-4 space-y-1 cursor-pointer hover:bg-gray-50 rounded-lg mx-3 my-2" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { class: "flex-shrink-0 whitespace-nowrap px-2 py-0.5 border rounded-full text-xs font-semibold" + category_title_color }, category_title), /* @__PURE__ */ React.createElement(RCommunitySourceChip, { article: props.data }), /* @__PURE__ */ React.createElement("span", { class: "font-bold text-sm whitespace-normal break-keep" }, cleanBoardTitle(props.data.title) || "\uC81C\uBAA9 \uC5C6\uC74C"), /* @__PURE__ */ React.createElement("div", { class: "flex-shrink-0 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Span_btn_article_new, { toggle: props.data.is_new }), /* @__PURE__ */ React.createElement(Span_btn_article_secret, { toggle: props.data.is_secret }), /* @__PURE__ */ React.createElement(Span_btn_my_article, { toggle: props.data.check_reader }))), /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center space-x-2" }, /* @__PURE__ */ React.createElement(Span_btn_user, { user_nickname: props.data.user_nickname, role: props.data.user_role }), /* @__PURE__ */ React.createElement(Span_btn_date, { date: props.data.created_at }), /* @__PURE__ */ React.createElement(Span_btn_article_read, { cnt_read: props.data.cnt_read }), /* @__PURE__ */ React.createElement(Span_btn_article_comment, { cnt_comment: props.data.cnt_comment }))));
}
function Div_new_comment(props) {
  return /* @__PURE__ */ React.createElement(SidebarCommentItem, { data: props.data });
}
function Div_sidebar_notice(props) {
  return /* @__PURE__ */ React.createElement("div", { class: SIDEBAR_CARD_CLASS }, /* @__PURE__ */ React.createElement(Div_box_header, { title: props.title }), /* @__PURE__ */ React.createElement("div", { class: "flex min-h-[120px] items-center justify-center text-center text-sm text-slate-500" }, props.message));
}
async function get_article_famous_list() {
  function Div_article_list(props) {
    return /* @__PURE__ */ React.createElement(SidebarCard, { title: "\uCD5C\uC2E0 \uC778\uAE30 \uAE00", data: props.data, renderItem: (article) => /* @__PURE__ */ React.createElement(SidebarArticleItem, { key: article.id || article.uuid, data: article }) });
  }
  const request_data = new FormData();
  request_data.append("tag", getSidebarTag());
  const data = await fetch("/blank/ajax_board/get_article_famous_list/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: request_data
  }).then((res) => res.json());
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_list, { data }), document.getElementById("div_article_famous_list"));
}
async function get_my_article_list() {
  if (!gv_username) {
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_sidebar_notice, { title: "\uB0B4\uAC00 \uC4F4 \uAE00", message: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4." }), document.getElementById("div_my_article_list"));
    return;
  }
  function Div_article_list(props) {
    return /* @__PURE__ */ React.createElement(SidebarCard, { title: "\uB0B4\uAC00 \uC4F4 \uAE00", data: props.data, renderItem: (article) => /* @__PURE__ */ React.createElement(SidebarArticleItem, { key: article.id || article.uuid, data: article }) });
  }
  const request_data = new FormData();
  request_data.append("tag", getSidebarTag());
  const data = await fetch("/blank/ajax_board/get_my_article_list/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: request_data
  }).then((res) => res.json());
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_list, { data }), document.getElementById("div_my_article_list"));
}
async function get_my_comment_list() {
  if (!gv_username) {
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_sidebar_notice, { title: "\uB0B4\uAC00 \uC4F4 \uB313\uAE00", message: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4." }), document.getElementById("div_my_comment_list"));
    return;
  }
  function Div_comment_list(props) {
    return /* @__PURE__ */ React.createElement(SidebarCard, { title: "\uB0B4\uAC00 \uC4F4 \uB313\uAE00", data: props.data, renderItem: (comment) => /* @__PURE__ */ React.createElement(SidebarCommentItem, { key: comment.id || comment.uuid, data: comment }) });
  }
  const request_data = new FormData();
  request_data.append("tag", getSidebarTag());
  const data = await fetch("/blank/ajax_board/get_my_comment_list/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: request_data
  }).then((res) => res.json());
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_comment_list, { data }), document.getElementById("div_my_comment_list"));
}
async function get_new_comment_list() {
  function Div_comment_list(props) {
    return /* @__PURE__ */ React.createElement(SidebarCard, { title: "\uCD5C\uC2E0 \uB313\uAE00", data: props.data, renderItem: (comment) => /* @__PURE__ */ React.createElement(SidebarCommentItem, { key: comment.id || comment.uuid, data: comment }) });
  }
  const request_data = new FormData();
  request_data.append("tag", getSidebarTag());
  const data = await fetch("/blank/ajax_board/get_new_comment_list/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: request_data
  }).then((res) => res.json());
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_comment_list, { data }), document.getElementById("div_new_comment_list"));
}
function refreshSidebarWidgets() {
  get_article_famous_list();
  get_new_comment_list();
}
const R_COMMUNITY_SOURCE_FILTERS = [
  ["", "\uC804\uCCB4 \uCD9C\uCC98"],
  ["reddit", "Reddit"],
  ["stackoverflow", "Stack Overflow"],
  ["posit", "Posit"],
  ["mastodon", "Mastodon"]
];
function SourceFilterButton({ value, label }) {
  const active = communitySourceGroup() === normalizeRCommunitySourceGroup(value);
  const cls = active ? "border-blue-500 bg-blue-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50";
  return /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => handleChangeRCommunitySource(value), class: "rounded-full border px-3 py-1.5 text-xs font-bold transition " + cls }, label);
}
function RCommunitySourceFilters() {
  if (normalizedCommunityTag() !== "rcommunity") {
    return null;
  }
  return /* @__PURE__ */ React.createElement("div", { class: "flex w-full flex-wrap items-center gap-2 rounded-lg border border-teal-100 bg-teal-50/70 px-3 py-2" }, R_COMMUNITY_SOURCE_FILTERS.map(([value, label]) => /* @__PURE__ */ React.createElement(SourceFilterButton, { key: value || "all", value, label })));
}
function SearchScopeOption({ value, label }) {
  const checked = communitySearchScope() === normalizeCommunitySearchScope(value);
  return /* @__PURE__ */ React.createElement("label", { class: "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50" }, /* @__PURE__ */ React.createElement("input", { type: "radio", name: "community_search_scope", value, checked, onChange: () => handleSearchScopeChange(value), class: "h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-blue-500" }), label);
}
function SearchScopeOptions() {
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement(SearchScopeOption, { value: "title", label: "\uC81C\uBAA9\uB9CC" }), /* @__PURE__ */ React.createElement(SearchScopeOption, { value: "content", label: "\uC81C\uBAA9+\uB0B4\uC6A9" }));
}
function DivCommunityTopTools() {
  return /* @__PURE__ */ React.createElement("div", { class: "w-full border border-gray-200 rounded-xl p-4 bg-white space-y-4" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement(DivBoardTabs, null), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => gv_username === "" ? alert("\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.") : location.href = init_url + "write/",
      class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
    },
    "\uAE00\uC4F0\uAE30"
  )), /* @__PURE__ */ React.createElement(RCommunitySourceFilters, null), /* @__PURE__ */ React.createElement("form", { class: "flex flex-col gap-2", onSubmit: (event) => {
    event.preventDefault();
    click_btn_search();
  } }, /* @__PURE__ */ React.createElement(SearchScopeOptions, null), /* @__PURE__ */ React.createElement("div", { class: "flex flex-col gap-2 md:flex-row md:items-stretch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      id: "txt_search",
      defaultValue: communityState.searchText,
      onChange: (event) => {
        communityState.searchText = event.currentTarget.value;
      },
      class: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full min-w-0 md:w-auto md:flex-1 p-2.5 focus:ring-blue-500 focus:border-blue-500",
      placeholder: "\uCEE4\uBBA4\uB2C8\uD2F0 \uAE00 \uAC80\uC0C9"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      class: "w-full shrink-0 whitespace-nowrap text-white bg-gradient-to-r from-cyan-500 to-blue-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 md:w-auto"
    },
    "\uAC80\uC0C9"
  ))));
}
function DivCommunityWidgetHeader() {
  return /* @__PURE__ */ React.createElement("div", { class: "grid w-full grid-cols-1 items-stretch gap-3 lg:grid-cols-2" }, /* @__PURE__ */ React.createElement(Div_sidelist_skeleton, { id: "div_article_famous_list", title: "\uCD5C\uADFC \uC778\uAE30 \uAE00" }), /* @__PURE__ */ React.createElement(Div_sidelist_skeleton, { id: "div_new_comment_list", title: "\uCD5C\uADFC \uB313\uAE00" }));
}
function communityCardDefinitions() {
  return [
    { tag: "free", title: "\uC790\uC720\uAC8C\uC2DC\uD310", empty: "\uC790\uC720\uAC8C\uC2DC\uD310\uC5D0 \uD45C\uC2DC\uD560 \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." },
    { tag: "notebook", title: "Web-R Notebook", empty: "Web-R Notebook\uC5D0 \uD45C\uC2DC\uD560 \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." },
    { tag: "rcommunity", title: "R Community", empty: "R Community\uC5D0 \uD45C\uC2DC\uD560 \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }
  ];
}
function isCommunityCardMode() {
  const activeTag = normalizedCommunityTag();
  return activeTag === "all" || COMMUNITY_BOARD_CARD_KEYS.includes(activeTag);
}
function activeCommunityCardDefinitions() {
  const activeTag = normalizedCommunityTag();
  const defs = communityCardDefinitions();
  if (COMMUNITY_BOARD_CARD_KEYS.includes(activeTag)) {
    return defs.filter((def) => def.tag === activeTag);
  }
  return defs;
}
function CommunityCardSkeleton(props) {
  return /* @__PURE__ */ React.createElement("div", { id: "div_community_card_" + props.tag, class: "w-full" }, /* @__PURE__ */ React.createElement(CommunityCardSkeletonBody, { tag: props.tag, title: props.title }));
}
function CommunityCardSkeletonBody(props) {
  return /* @__PURE__ */ React.createElement("section", { class: "flex min-h-[420px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm" }, /* @__PURE__ */ React.createElement(Div_box_header, { title: props.title }), /* @__PURE__ */ React.createElement("div", { class: "mt-4 flex flex-col gap-3 animate-pulse" }, [0, 1, 2, 3, 4].map((index) => /* @__PURE__ */ React.createElement("div", { key: "card_skeleton_" + props.tag + "_" + index, class: "rounded-lg border border-slate-100 p-3" }, /* @__PURE__ */ React.createElement("div", { class: "mb-2 h-3 w-20 rounded-full bg-slate-100" }), /* @__PURE__ */ React.createElement("div", { class: "h-4 w-11/12 rounded-full bg-slate-200" }), /* @__PURE__ */ React.createElement("div", { class: "mt-2 h-3 w-7/12 rounded-full bg-slate-100" })))));
}
function CommunityCardShell() {
  const cards = activeCommunityCardDefinitions();
  const single = cards.length === 1;
  return /* @__PURE__ */ React.createElement("div", { id: "div_community_cards", class: "grid w-full grid-cols-1 gap-4 " + (single ? "xl:grid-cols-1" : "xl:grid-cols-3") }, cards.map((card) => /* @__PURE__ */ React.createElement(CommunityCardSkeleton, { key: card.tag, tag: card.tag, title: card.title })));
}
function CommunityBoardCard(props) {
  const def = props.def;
  const data = props.data || {};
  const items = Object.values(data.list || {}).filter(Boolean);
  const totalCount = data.count ? Number(data.count.cnt || 0) : 0;
  const currentPage = Math.max(1, Number(communityState.cardPages[def.tag] || 1));
  if (def.tag) {
    communityState.cardCounters[def.tag] = totalCount;
  }
  return /* @__PURE__ */ React.createElement("section", { class: "flex min-h-[420px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm" }, /* @__PURE__ */ React.createElement(Div_box_header, { title: def.title, count: totalCount > 0 ? totalCount.toLocaleString("ko-KR") : null }), items.length === 0 ? /* @__PURE__ */ React.createElement("div", { class: "flex min-h-[220px] flex-1 items-center justify-center rounded-lg bg-slate-50 px-4 text-center text-sm text-slate-500" }, def.empty) : /* @__PURE__ */ React.createElement("div", { class: "flex flex-1 flex-col justify-start divide-y divide-slate-100" }, items.map((article, index) => /* @__PURE__ */ React.createElement(LatestArticleItem, { key: article.uuid || article.id || def.tag + "_" + index, data: article }))), /* @__PURE__ */ React.createElement("div", { class: "mt-4" }, /* @__PURE__ */ React.createElement(ArticlePagination, { currentPage, totalCount, pageSize: COMMUNITY_CARD_PAGE_SIZE, onPageChange: (page) => goToCommunityCardPage(def.tag, page) })));
}
function ListMain() {
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center py-8 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: header_title, subtitle: header_subtitle }), /* @__PURE__ */ React.createElement("div", { id: "div_community_list", class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement(DivCommunityTopTools, null), isCommunityCardMode() ? /* @__PURE__ */ React.createElement(CommunityCardShell, null) : /* @__PURE__ */ React.createElement("div", { id: "div_article_list", class: "w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center border border-gray-300 rounded-xl space-y-4 w-full p-8" }, /* @__PURE__ */ React.createElement(Div_box_header, { title: "\uCD5C\uC2E0 \uAE00" }))), /* @__PURE__ */ React.createElement(DivCommunityWidgetHeader, null)));
}
function renderListPageShell() {
  ReactDOM.render(/* @__PURE__ */ React.createElement(ListMain, null), document.getElementById("div_main"));
}
function buildCommunityCardForm(tag, page) {
  const requestData = new FormData();
  requestData.append("tag", tag);
  requestData.append("page", page);
  requestData.append("page_size", COMMUNITY_CARD_PAGE_SIZE);
  const searchText = communitySearchText();
  if (searchText !== "") {
    requestData.append("txt_search", searchText);
    requestData.append("search_scope", communitySearchScope());
  }
  if (tag === "rcommunity") {
    const sourceGroup = communitySourceGroup();
    if (sourceGroup) {
      requestData.append("source_group", sourceGroup);
    }
  }
  return requestData;
}
async function fetchCommunityCardData(tag, page) {
  try {
    const data = await fetch("/blank/ajax_board/get_article_list/", {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: buildCommunityCardForm(tag, page)
    }).then((res) => res.json());
    return data || { count: { cnt: 0 }, list: {} };
  } catch (error) {
    console.error("[fetchCommunityCardData] failed", tag, error);
    return { count: { cnt: 0 }, list: {} };
  }
}
async function loadCommunityBoardCard(def, page) {
  const cardPage = Math.max(1, Number(page || 1));
  communityState.cardPages[def.tag] = cardPage;
  const target = document.getElementById("div_community_card_" + def.tag);
  if (target) {
    ReactDOM.render(/* @__PURE__ */ React.createElement(CommunityCardSkeletonBody, { tag: def.tag, title: def.title }), target);
  }
  const data = await fetchCommunityCardData(def.tag, cardPage);
  const totalPages = Math.max(1, Math.ceil(Number(data && data.count ? data.count.cnt || 0 : 0) / COMMUNITY_CARD_PAGE_SIZE));
  if (Object.keys(data.list || {}).length === 0 && cardPage > totalPages) {
    return loadCommunityBoardCard(def, totalPages);
  }
  const host = document.getElementById("div_community_card_" + def.tag);
  if (host) {
    ReactDOM.render(/* @__PURE__ */ React.createElement(CommunityBoardCard, { def, data }), host);
  }
}
async function getCommunityBoardCards() {
  const cards = activeCommunityCardDefinitions();
  await Promise.all(cards.map((def) => loadCommunityBoardCard(def, communityState.cardPages[def.tag] || 1)));
}
async function goToCommunityCardPage(tag, page) {
  const def = communityCardDefinitions().find((item) => item.tag === tag);
  if (!def) {
    return;
  }
  await loadCommunityBoardCard(def, page);
  const target = document.getElementById("div_community_card_" + tag);
  if (target && typeof target.scrollIntoView === "function") {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
async function get_article_list(loadMode, requestedPage = 1) {
  function ArticleList(props) {
    const article_list = Object.keys(props.data || {}).map((key) => /* @__PURE__ */ React.createElement(LatestArticleItem, { key, data: props.data[key] }));
    const listContent = article_list.length === 0 ? /* @__PURE__ */ React.createElement("div", { class: "flex min-h-[160px] items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500" }, "\uD45C\uC2DC\uD560 \uCD5C\uC2E0 \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.") : /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-start w-full divide-y divide-slate-100" }, article_list);
    if (!props.isMain) {
      return listContent;
    }
    return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center border border-gray-300 rounded-xl space-y-4 w-full p-8" }, /* @__PURE__ */ React.createElement(Div_box_header, { title: props.title || "\uCD5C\uC2E0 \uAE00", count: communityState.article_counter > 0 ? communityState.article_counter.toLocaleString("ko-KR") : null }), listContent, props.paginate !== false && /* @__PURE__ */ React.createElement(ArticlePagination, { currentPage: communityState.page_num, totalCount: communityState.article_counter }));
  }
  communityState.toggle_page = true;
  const request_data = new FormData();
  const activeTag = normalizedCommunityTag();
  const privateFilter = activeTag === "mine" || activeTag === "commented";
  request_data.append("tag", privateFilter ? "all" : activeTag);
  const tagSub = privateFilter ? "" : normalizedCommunityTagSub();
  if (tagSub !== "") {
    request_data.append("tag_sub", tagSub);
  }
  const replaceMainList = loadMode === "init" || loadMode === "search" || loadMode === "page";
  if (replaceMainList) {
    const nextPage = Number(requestedPage);
    communityState.page_num = Number.isFinite(nextPage) && nextPage > 0 ? Math.floor(nextPage) : 1;
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_list_skeleton, null), document.getElementById("div_article_list"));
  } else {
    communityState.page_num += 1;
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_list_skeleton, null), document.getElementById(`div_article_list_${communityState.page_num}`));
  }
  const searchText = communitySearchText();
  if (searchText !== "") {
    request_data.append("txt_search", searchText);
    request_data.append("search_scope", communitySearchScope());
  }
  const sourceGroup = communitySourceGroup();
  if (sourceGroup) {
    request_data.append("source_group", sourceGroup);
  }
  if (privateFilter) {
    const targetId = replaceMainList ? "div_article_list" : `div_article_list_${communityState.page_num}`;
    if (!gv_username) {
      communityState.article_counter = 0;
      ReactDOM.render(/* @__PURE__ */ React.createElement("div", { class: "flex min-h-[180px] w-full items-center justify-center rounded-xl border border-gray-300 bg-white p-8 text-sm text-slate-500" }, "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4."), document.getElementById(targetId));
      communityState.toggle_page = false;
      return;
    }
    const endpoint = activeTag === "mine" ? "/blank/ajax_board/get_my_article_list/" : "/blank/ajax_board/get_my_comment_list/";
    const privateData = await fetch(endpoint, {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: request_data
    }).then((res) => res.json());
    const listData = activeTag === "mine" ? filterIndexedRows(privateData, searchText, communitySearchScope()) : commentsToCommentedArticleRows(privateData, searchText, communitySearchScope());
    communityState.article_counter = Object.keys(listData).length;
    ReactDOM.render(
      /* @__PURE__ */ React.createElement(ArticleList, { data: listData, isMain: true, title: activeTag === "mine" ? "\uB0B4\uAC00 \uC4F4 \uAE00" : "\uB0B4\uAC00 \uB313\uAE00\uC744 \uC4F4 \uAE00", paginate: false }),
      document.getElementById(targetId)
    );
    communityState.toggle_page = false;
    return;
  }
  request_data.append("page", communityState.page_num);
  const targetId = replaceMainList ? "div_article_list" : `div_article_list_${communityState.page_num}`;
  const cachedData = replaceMainList ? readCommunityArticlePageCache(communityState.page_num, searchText) : null;
  if (cachedData) {
    communityState.article_counter = cachedData["count"] ? cachedData["count"].cnt : 0;
    const totalPages = Math.max(1, Math.ceil(Number(communityState.article_counter || 0) / COMMUNITY_PAGE_SIZE));
    const listData = cachedData && cachedData.list ? cachedData.list : {};
    if (replaceMainList && Object.keys(listData).length === 0 && communityState.page_num > totalPages) {
      await get_article_list("page", totalPages);
      return;
    }
    ReactDOM.render(
      /* @__PURE__ */ React.createElement(ArticleList, { data: listData, isMain: replaceMainList }),
      document.getElementById(targetId)
    );
    communityState.toggle_page = false;
    prefetchCommunityArticlePages(communityState.page_num, totalPages, searchText);
    return;
  }
  const data = await fetch("/blank/ajax_board/get_article_list/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: request_data
  }).then((res) => res.json());
  if (replaceMainList) {
    writeCommunityArticlePageCache(communityState.page_num, searchText, data);
  }
  communityState.article_counter = data["count"] ? data["count"].cnt : 0;
  const totalPages = Math.max(1, Math.ceil(Number(communityState.article_counter || 0) / COMMUNITY_PAGE_SIZE));
  const listData = data && data.list ? data.list : {};
  if (replaceMainList && Object.keys(listData).length === 0 && communityState.page_num > totalPages) {
    await get_article_list("page", totalPages);
    return;
  }
  ReactDOM.render(
    /* @__PURE__ */ React.createElement(ArticleList, { data: listData, isMain: replaceMainList }),
    document.getElementById(targetId)
  );
  communityState.toggle_page = false;
  prefetchCommunityArticlePages(communityState.page_num, totalPages, searchText);
}
async function goToArticlePage(page) {
  const nextPage = Math.max(1, Number(page || 1));
  await get_article_list("page", nextPage);
  const target = document.getElementById("div_article_list");
  if (target && typeof target.scrollIntoView === "function") {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
async function click_btn_search() {
  const search_text = communitySearchText();
  if (!search_text) {
    alert("\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD558\uC138\uC694.");
    return;
  }
  resetListPagination();
  renderListPageShell();
  if (isCommunityCardMode()) {
    await getCommunityBoardCards();
  } else {
    await get_article_list("search");
  }
}
async function handleSearchScopeChange(value) {
  communityState.searchScope = normalizeCommunitySearchScope(value);
  const searchText = communitySearchText();
  renderListPageShell();
  if (searchText) {
    resetListPagination();
    if (isCommunityCardMode()) {
      await getCommunityBoardCards();
    } else {
      await get_article_list("search");
    }
  }
}
async function handleChangeRCommunitySource(value) {
  url = "rcommunity";
  sub = "";
  init_url = getCommunityBaseUrl("rcommunity");
  header_title = getCommunityHeaderTitle("rcommunity");
  communityState.sourceGroup = normalizeRCommunitySourceGroup(value);
  resetListPagination();
  renderListPageShell();
  const listPromise = getCommunityBoardCards();
  refreshSidebarWidgets();
  await listPromise;
}
async function handleChangeTab(tab) {
  if (!isTabbedCommunityUrl(tab)) {
    tab = "all";
  }
  url = tab;
  sub = "";
  if (tab !== "rcommunity") {
    communityState.sourceGroup = "";
  }
  init_url = getCommunityBaseUrl(tab);
  header_title = getCommunityHeaderTitle(tab);
  resetListPagination();
  renderListPageShell();
  const listPromise = isCommunityCardMode() ? getCommunityBoardCards() : get_article_list("init");
  refreshSidebarWidgets();
  await listPromise;
}
function ensureListScrollListener() {
  communityState.listScrollBound = true;
}
async function set_main_list() {
  resetListPagination();
  renderListPageShell();
  const listPromise = isCommunityCardMode() ? getCommunityBoardCards() : get_article_list("init");
  refreshSidebarWidgets();
  await listPromise;
}
function Div_article_read_buttons(props) {
  const btnClass = "font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full";
  const writeBtn = `text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 ${btnClass} hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300`;
  const listBtn = `text-gray-900 bg-white border border-gray-900 ${btnClass} focus:outline-none hover:bg-gray-300 focus:ring-4 focus:ring-gray-100`;
  const editBtn = `text-green-700 border border-green-700 ${btnClass} py-1 hover:text-white hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300`;
  const deleteBtn = `text-red-700 border border-red-700 ${btnClass} py-1 hover:text-white hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300`;
  const blockBtn = `text-slate-700 border border-slate-700 ${btnClass} py-1 hover:text-white hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300`;
  const showBlockAuthor = canAdminBlockAuthor(props.data);
  const adminGridClass = showBlockAuthor ? "grid grid-cols-1 sm:grid-cols-3 justify-center items-center gap-2 w-full" : "grid grid-cols-2 justify-center items-center gap-2 w-full";
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-2" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center space-y-2 w-full" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => gv_username ? location.href = init_url + "write/" : alert("\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4."), class: writeBtn }, "\uC0C8 \uAE00 \uC4F0\uAE30"), /* @__PURE__ */ React.createElement("a", { href: init_url, class: listBtn }, "\uBAA9\uB85D\uC73C\uB85C")), props.data.check_reader !== "user" && /* @__PURE__ */ React.createElement("div", { class: adminGridClass }, /* @__PURE__ */ React.createElement("button", { onClick: () => location.href = init_url + "edit/" + orderID + "/", class: editBtn }, "\uC218\uC815"), /* @__PURE__ */ React.createElement("button", { onClick: click_btn_delete, class: deleteBtn }, "\uC0AD\uC81C"), showBlockAuthor && /* @__PURE__ */ React.createElement("button", { onClick: () => adminBlockAuthor("article", orderID, props.data.user_nickname || "\uC791\uC131\uC790"), class: blockBtn }, "\uC791\uC131\uC790 \uCC28\uB2E8")));
}
function Div_article_read_header(props) {
  const title = cleanBoardTitle(props.data.title) || "\uC81C\uBAA9 \uC5C6\uC74C";
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-start py-4 border-t border-b border-gray-200 w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-start items-end w-full" }, /* @__PURE__ */ React.createElement("span", { class: "flex flex-row justify-start items-center text-lg font-extrabold w-full space-x-2" }, title, /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement(Span_btn_article_new, { toggle: props.data.is_new }), /* @__PURE__ */ React.createElement(Span_btn_article_secret, { toggle: props.data.is_secret }), /* @__PURE__ */ React.createElement(Span_btn_my_article, { toggle: props.data.check_reader }))), /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-end items-center w-full" }, /* @__PURE__ */ React.createElement("span", { class: "flex flex-row justify-end items-center text-md font-normal w-full space-x-2" }, /* @__PURE__ */ React.createElement(Span_btn_user, { user_nickname: props.data.user_nickname, role: props.data.user_role }), /* @__PURE__ */ React.createElement(Span_btn_date, { date: props.data.created_at }), /* @__PURE__ */ React.createElement(Span_btn_article_read, { cnt_read: props.data.cnt_read }), /* @__PURE__ */ React.createElement(Span_btn_article_comment, { cnt_comment: props.data.cnt_comment }))));
}
function Div_article_read_file() {
  const data = communityState.articleData;
  if (!data)
    return null;
  const isExternalSource = data.category_url === "rblogger" || data.category_url === "rproject";
  const hasUrl = !!data.url;
  const attachments = normalizeAttachmentList(data);
  const hasFile = attachments.length > 0;
  if (data.is_secret === 1 && data.check_reader !== "admin" && data.check_reader !== "writer") {
    return null;
  }
  if (isExternalSource && !hasUrl) {
    return null;
  }
  if (!isExternalSource && !hasFile) {
    return null;
  }
  if (isExternalSource) {
    return /* @__PURE__ */ React.createElement("section", { class: "bg-white py-8 lg:py-16 antialiased" }, /* @__PURE__ */ React.createElement("div", { class: "w-full mx-auto px-4 space-y-2" }, /* @__PURE__ */ React.createElement("div", { class: "flex justify-between items-center mb-6" }, /* @__PURE__ */ React.createElement("h2", { class: "text-md lg:text-lg font-bold text-gray-900" }, "\uC6D0\uBB38 \uB9C1\uD06C")), /* @__PURE__ */ React.createElement("form", { class: "mb-3" }, /* @__PURE__ */ React.createElement("div", { class: "w-full bg-gray-50 rounded-lg border border-gray-200" })), /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-start items-start w-full" }, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: data.url,
        target: "_blank",
        rel: "noopener noreferrer",
        class: "text-blue-600 underline break-all text-md cursor-pointer hover:text-blue-800 hover:bg-gray-50 px-1 py-0.5 rounded"
      },
      data.url
    ))));
  }
  return /* @__PURE__ */ React.createElement("section", { class: "bg-white py-8 lg:py-16 antialiased" }, /* @__PURE__ */ React.createElement("div", { class: "w-full mx-auto px-4 space-y-2" }, /* @__PURE__ */ React.createElement("div", { class: "flex justify-between items-center mb-6" }, /* @__PURE__ */ React.createElement("h2", { class: "text-md lg:text-lg font-bold text-gray-900" }, "\uCCA8\uBD80\uD30C\uC77C")), /* @__PURE__ */ React.createElement("form", { class: "mb-3" }, /* @__PURE__ */ React.createElement("div", { class: "w-full bg-gray-50 rounded-lg border border-gray-200" })), /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-start items-start w-full gap-2" }, attachments.map((file, index) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: "article_file_" + index,
      href: getFileHref(file.file_url || file.url_file),
      target: "_blank",
      class: "flex flex-row justify-end items-center text-md font-normal w-fit space-x-2 cursor-pointer hover:bg-gray-100"
    },
    file.file_name || file.origin_file_name || file.file_url
  )))));
}
function ReadMain() {
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center py-8 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: header_title, subtitle: header_subtitle }), /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement("div", { id: "div_article_read_buttons", class: "w-full max-w-5xl flex justify-end" }), /* @__PURE__ */ React.createElement("div", { class: "w-full max-w-5xl" }, /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_community_read_header" }, /* @__PURE__ */ React.createElement("div", { class: "w-full h-12 bg-gray-300 mb-4 animate-pulse" })), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_community_read_content" }, /* @__PURE__ */ React.createElement("div", { class: "w-full h-48 bg-gray-300 mb-4 animate-pulse" })), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_community_read_file" }, /* @__PURE__ */ React.createElement("div", { class: "w-full h-12 bg-gray-300 mb-4 animate-pulse" })), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_community_read_comment" }, /* @__PURE__ */ React.createElement("div", { class: "w-full h-24 bg-gray-300 animate-pulse" })))));
}
function renderReadPageShell() {
  ReactDOM.render(/* @__PURE__ */ React.createElement(ReadMain, null), document.getElementById("div_main"));
}
function set_article() {
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_read_header, { data: communityState.articleData }), document.getElementById("div_community_read_header"));
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_read_buttons, { data: communityState.articleData }), document.getElementById("div_article_read_buttons"));
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_read_file, null), document.getElementById("div_community_read_file"));
  const contentEl = document.querySelector("#div_community_read_content");
  WebRSolidEdit.renderContent(contentEl, communityState.articleData.content);
  if (contentEl) {
    const categoryURL = String(communityState.articleData && communityState.articleData.category_url || "").trim().toLowerCase();
    contentEl.classList.toggle("webr-rcommunity-digest-viewer", categoryURL === "rcommunity");
  }
}
async function get_read_article(loadMode) {
  const request_data = new FormData();
  request_data.append("orderID", orderID);
  try {
    const res = await fetch("/blank/ajax_board/get_read_article/", {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: request_data
    });
    if (!res.ok) {
      throw new Error(`get_read_article HTTP error: ${res.status}`);
    }
    communityState.articleData = await res.json();
    syncCommunityReadContext(communityState.articleData);
    if (loadMode === "init") {
      set_article();
    }
    get_read_article_comment(orderID);
    let normalizedCategory = null;
    if (communityState.articleData && typeof communityState.articleData.category_url === "string") {
      normalizedCategory = communityState.articleData.category_url.trim().toLowerCase();
    }
    if (normalizedCategory === "rblogger") {
      refresh_article_rblogger(orderID);
    }
  } catch (err) {
    console.error("[get_read_article] fetch or JSON error:", err);
  }
}
async function refresh_article_rblogger(articleId) {
  const request_data = new FormData();
  request_data.append("uuid", articleId);
  try {
    const res = await fetch("/blank/ajax_board/refresh_article_rblogger/", {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: request_data
    });
    if (!res.ok) {
      throw new Error(`refresh_article_rblogger HTTP error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("[refresh_article_rblogger] error:", err);
    return null;
  }
}
async function click_btn_delete() {
  if (!confirm("\uC815\uB9D0\uB85C \uC0AD\uC81C\uD560\uAE4C\uC694?")) {
    return;
  }
  const request_data = new FormData();
  request_data.append("uuid", orderID);
  await fetch("/blank/ajax_board/delete_article/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: request_data
  }).then((res) => res.json());
  location.href = init_url;
}
function isAdminViewer() {
  return !!window.gv_is_admin || String(window.gv_role || "").trim() === "\uAD00\uB9AC\uC790";
}
function isBotAuthor(data) {
  const role = String(data && (data.user_role || data.role || data.role_name) || "").trim().toLowerCase();
  const kind = String(data && (data.special_account_kind || data.user_special_account_kind) || "").trim().toLowerCase();
  return role === "bot" || role === "\uBD07" || kind === "bot" || kind === "bot_team" || kind === "internal_bot";
}
function canAdminBlockAuthor(data) {
  return isAdminViewer() && !!data && !isBotAuthor(data);
}
async function adminBlockAuthor(scope, uuid, label) {
  const targetLabel = label || "\uC791\uC131\uC790";
  if (!isAdminViewer()) {
    alert("\uAD00\uB9AC\uC790\uB9CC \uCC98\uB9AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    return;
  }
  if (!uuid) {
    alert("\uCC28\uB2E8\uD560 \uB300\uC0C1\uC744 \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    return;
  }
  if (!confirm(`${targetLabel}\uB2D8\uC744 \uCC28\uB2E8\uD560\uAE4C\uC694?`)) {
    return;
  }
  const requestData = new FormData();
  requestData.append("scope", scope);
  requestData.append("uuid", uuid);
  try {
    const result = await fetch("/blank/ajax_board/admin_block_author/", {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: requestData
    }).then((res) => res.json());
    if (!result || result.checker !== "SUCCESS") {
      alert(result && result.error ? result.error : "\uC791\uC131\uC790 \uCC28\uB2E8\uC744 \uCC98\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      return;
    }
    alert("\uC791\uC131\uC790\uB97C \uCC28\uB2E8\uD588\uC2B5\uB2C8\uB2E4.");
    if (scope === "comment") {
      await get_read_article_comment(orderID);
    } else {
      location.href = init_url;
    }
  } catch (err) {
    console.error("[adminBlockAuthor] error:", err);
    alert("\uC791\uC131\uC790 \uCC28\uB2E8\uC744 \uCC98\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
  }
}
function Div_btn_comment_editor_footer_button(props) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: props.function,
      class: "flex flex-row justify-center items-center text-white bg-gradient-to-r from-cyan-500 to-blue-500 font-medium rounded-lg text-sm px-5 py-1 text-center hover:bg-gradient-to-bl hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-cyan-300"
    },
    "\uB4F1\uB85D"
  );
}
function Div_btn_comment_editor_footer_button_loading() {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: true,
      "aria-busy": "true",
      class: "flex flex-row justify-center items-center text-white bg-gradient-to-r from-cyan-500 to-blue-500 font-medium rounded-lg text-sm px-5 py-1 text-center hover:bg-gradient-to-bl hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-cyan-300 cursor-not-allowed"
    },
    /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", role: "status", class: "inline w-4 h-4 mr-2 text-white animate-spin", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z", fill: "#E5E7EB" }), /* @__PURE__ */ React.createElement("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentColor" })),
    "\uB4F1\uB85D"
  );
}
function Div_btn_comment_footer(props) {
  return /* @__PURE__ */ React.createElement("button", { type: "button", class: "flex justify-center items-center text-sm text-gray-500 hover:underline font-medium", onClick: props.function }, props.url_image && /* @__PURE__ */ React.createElement("img", { src: props.url_image, class: "w-4 h-4 mr-2" }), props.text);
}
function Div_btn_comment_footer_loading(props) {
  return /* @__PURE__ */ React.createElement("button", { type: "button", class: "flex justify-center items-center text-sm text-gray-400 font-medium cursor-not-allowed" }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", class: "inline w-4 h-4 text-gray-200 animate-spin mr-2", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z", fill: "#E5E7EB" }), /* @__PURE__ */ React.createElement("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentColor" })), props.text);
}
function Div_comment_button_list(props) {
  const { data, depth, loading } = props;
  const isDepth1 = depth === 1;
  const ButtonComp = loading ? Div_btn_comment_footer_loading : Div_btn_comment_footer;
  const showBlockAuthor = data && data.active === 1 && canAdminBlockAuthor(data);
  return /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap items-center gap-x-4 gap-y-2" }, isDepth1 && !loading && gv_username !== "" && /* @__PURE__ */ React.createElement(ButtonComp, { text: "\uB300\uB313\uAE00", function: () => click_btn_reply_comment(data.uuid), url_image: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/comment_re_reply.svg" }), data && data.check_comment_reader !== "user" && data.active === 1 && /* @__PURE__ */ React.createElement(
    ButtonComp,
    {
      text: "\uC218\uC815",
      function: !loading ? () => click_btn_edit_comment(data.uuid) : void 0,
      url_image: !loading ? "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/comment_modify.svg" : null
    }
  ), data && data.check_comment_reader !== "user" && data.active === 1 && /* @__PURE__ */ React.createElement(
    ButtonComp,
    {
      text: "\uC0AD\uC81C",
      function: !loading ? () => comment_action("delete", data.uuid) : void 0,
      url_image: !loading ? "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/comment_delete.svg" : null
    }
  ), showBlockAuthor && /* @__PURE__ */ React.createElement(
    ButtonComp,
    {
      text: "\uC791\uC131\uC790 \uCC28\uB2E8",
      function: !loading ? () => adminBlockAuthor("comment", data.uuid, data.user_nickname || "\uC791\uC131\uC790") : void 0,
      url_image: null
    }
  ));
}
function Div_comment_form(props) {
  const isNewComment = props.uuid_comment == null;
  const commentId = isNewComment ? "new" : props.uuid_comment;
  return /* @__PURE__ */ React.createElement("div", { class: props.class }, /* @__PURE__ */ React.createElement("p", { class: "flex flex-row underline" }, props.title), /* @__PURE__ */ React.createElement("div", { id: "div_community_read_comment_new_" + (isNewComment ? "form" : commentId + "_form"), class: "w-full" }, /* @__PURE__ */ React.createElement("textarea", { id: "txt_content_comment_" + commentId, name: "txt_content_comment_" + commentId, class: "w-full min-h-[220px] rounded-lg border border-gray-300 p-3 text-sm", rows: "8", placeholder: "\uB313\uAE00\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694." })), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_comment_editor_footer_button_" + commentId }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-between items-center w-full space-x-2 space-y-2" }, /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_comment_file_control_" + commentId }, /* @__PURE__ */ React.createElement(AttachmentDropZone, { target: "comment", commentId, compact: true })), /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-end items-center w-full space-x-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      id: "chk_secret_" + commentId,
      type: "checkbox",
      value: "",
      class: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
    }
  ), /* @__PURE__ */ React.createElement("label", { for: "chk_secret_" + commentId, class: "ms-2 text-sm font-medium text-gray-900" }, /* @__PURE__ */ React.createElement("p", null, "\uBE44\uBC00 \uB313\uAE00", /* @__PURE__ */ React.createElement("span", null, "\uB85C \uC791\uC131\uD558\uAE30 (\uBCF8\uC778\uACFC \uAE00 \uC791\uC131\uC790, \uAD00\uB9AC\uC790\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.)"))), /* @__PURE__ */ React.createElement("div", { class: "w-fit", id: "btn_comment_editor_footer_button" + (isNewComment ? "" : "_" + commentId) }, /* @__PURE__ */ React.createElement(Div_btn_comment_editor_footer_button, { uuid_comment: commentId, function: () => comment_action("submit", commentId) }))))));
}
function Div_article_read_comment(props) {
  function Div_comment_header(propsHeader) {
    return /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-start items-center space-x-2" }, /* @__PURE__ */ React.createElement(Span_btn_user, { user_nickname: propsHeader.data.user_nickname, role: propsHeader.data.user_role }), /* @__PURE__ */ React.createElement(Span_btn_date, { date: propsHeader.data.created_at }), /* @__PURE__ */ React.createElement(Span_btn_comment_secret, { toggle: propsHeader.data.is_secret }), /* @__PURE__ */ React.createElement(Span_btn_my_comment, { toggle: propsHeader.data.check_comment_reader }));
  }
  function Div_comment(propsComment) {
    const isDepth2 = propsComment.depth === 2;
    const depthValue = isDepth2 ? 2 : 1;
    const bgColorClass = propsComment.data.user_writer == 1 ? isDepth2 ? "bg-blue-100 border border-blue-700" : "bg-blue-50" : isDepth2 ? "bg-gray-50" : "bg-white";
    const comment_depth2_list = !isDepth2 && Object.keys(propsComment.data.rereply || {}).map((key) => /* @__PURE__ */ React.createElement(Div_comment, { key: propsComment.data.rereply[key].uuid, data: propsComment.data.rereply[key], depth: 2 }));
    const attachments = normalizeAttachmentList(propsComment.data);
    return /* @__PURE__ */ React.createElement("article", { class: "px-6 py-3 " + (isDepth2 ? "ml-4 " : "") + "text-base " + bgColorClass + " rounded-xl w-full space-y-2" }, /* @__PURE__ */ React.createElement("div", { class: "flex justify-between items-center space-x-2" }, /* @__PURE__ */ React.createElement(Div_comment_header, { data: propsComment.data })), /* @__PURE__ */ React.createElement("div", { class: "text-gray-500", id: "div_comment_" + propsComment.data.uuid }), attachments.length > 0 && /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-start items-start gap-1 text-sm" }, attachments.map((file, index) => /* @__PURE__ */ React.createElement("div", { key: "comment_file_" + propsComment.data.uuid + "_" + index, class: "flex flex-row justify-start items-center space-x-2" }, /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "stroke-width": "1.8", stroke: "currentColor", class: "w-4 h-4 text-gray-600" }, /* @__PURE__ */ React.createElement("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l5 5v12a2 2 0 01-2 2z" })), /* @__PURE__ */ React.createElement("a", { href: getFileHref(file.file_url || file.url_file), target: "_blank", class: "hover:underline" }, file.file_name || file.origin_file_name || file.file_url)))), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_comment_footer_" + propsComment.data.uuid }, /* @__PURE__ */ React.createElement(Div_comment_button_list, { data: propsComment.data, depth: depthValue, loading: false })), comment_depth2_list, !isDepth2 && /* @__PURE__ */ React.createElement("div", { id: "div_community_read_comment_new_" + propsComment.data.uuid, class: "hidden" }, /* @__PURE__ */ React.createElement(Div_comment_form, { title: "\uB300\uB313\uAE00 \uC4F0\uAE30", class: "mt-4 p-4 bg-white rounded-lg w-full space-y-2", uuid_comment: propsComment.data.uuid })));
  }
  const commentRows = Object.values(props.data || {}).filter((comment) => comment && Number(comment.active == null ? 1 : comment.active) === 1);
  const comment_list = commentRows.map((comment) => /* @__PURE__ */ React.createElement(Div_comment, { key: comment.uuid, data: comment, depth: 1, is_secret: props.is_secret, check_reader: props.check_reader }));
  return /* @__PURE__ */ React.createElement("section", { class: "bg-white py-8 lg:py-16 antialiased" }, /* @__PURE__ */ React.createElement("div", { class: "w-full mx-auto px-4 space-y-2" }, /* @__PURE__ */ React.createElement("div", { class: "flex justify-between items-center mb-6" }, /* @__PURE__ */ React.createElement("h2", { class: "text-lg lg:text-2xl font-bold text-gray-900" }, "\uB313\uAE00 (", commentRows.length, ")")), /* @__PURE__ */ React.createElement("form", { class: "mb-6" }, /* @__PURE__ */ React.createElement("div", { class: "mb-4 w-full bg-gray-50 rounded-lg border border-gray-200" }, /* @__PURE__ */ React.createElement("div", { id: "div_comment_new", class: "w-full" }))), /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-end w-full space-y-0" }, comment_list), gv_username !== "" && /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-center items-center p-6 text-base bg-gray-100 rounded-xl w-full", id: "div_community_read_comment_new" }, /* @__PURE__ */ React.createElement(Div_comment_form, { title: "\uB313\uAE00 \uC4F0\uAE30", class: "w-full space-y-2", uuid_comment: null }))));
}
function click_btn_reply_comment(uuid_comment) {
  (communityState.commentUpper || []).forEach((c) => {
    const el = document.getElementById("div_community_read_comment_new_" + c.uuid);
    if (!el)
      return;
    if (c.uuid === uuid_comment) {
      el.className = "mt-4 p-4 bg-white rounded-lg w-full space-y-2";
    } else {
      el.className = "hidden";
    }
  });
}
async function click_btn_edit_comment(uuid_comment) {
  function Div_comment_editor_form(props) {
    return /* @__PURE__ */ React.createElement("div", { class: "w-full" }, /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_comment_editor_main_" + props.uuid_comment }), /* @__PURE__ */ React.createElement("div", { class: "w-full mt-2", id: "div_comment_edit_file_control_" + props.uuid_comment }, /* @__PURE__ */ React.createElement(AttachmentDropZone, { target: "comment", commentId: props.uuid_comment, compact: true })), /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-end items-center w-full space-x-2 mt-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "chk_secret_" + props.uuid_comment,
        type: "checkbox",
        value: "",
        class: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
      }
    ), /* @__PURE__ */ React.createElement("label", { for: "chk_secret_" + props.uuid_comment, class: "ms-2 text-sm font-medium text-gray-900" }, "\uBE44\uBC00 \uB313\uAE00\uB85C \uC791\uC131\uD558\uAE30 (\uBCF8\uC778\uACFC \uAE00 \uC791\uC131\uC790, \uAD00\uB9AC\uC790\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.)"), /* @__PURE__ */ React.createElement("div", { class: "w-fit", id: "btn_comment_editor_footer_button_" + props.uuid_comment }, /* @__PURE__ */ React.createElement(Div_btn_comment_editor_footer_button, { uuid_comment: props.uuid_comment, function: () => comment_action("edit", props.uuid_comment) }))));
  }
  const target = Object.values(communityState.commentData || {}).find((item) => item.uuid === uuid_comment);
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_comment_editor_form, { uuid_comment }), document.getElementById("div_comment_" + uuid_comment));
  communityState.commentEditors[uuid_comment] = await mountSolidCommentEditor(uuid_comment, target ? target.content || "" : "", "div_comment_editor_main_" + uuid_comment);
  if (target) {
    setCommentEditorHTML(communityState.commentEditors[uuid_comment], target.content || "");
    const secretEl = document.getElementById("chk_secret_" + uuid_comment);
    if (secretEl) {
      secretEl.checked = target.is_secret == 1;
    }
  }
}
function restoreCommentActionButtons(uuid_comment, isUpper, target) {
  const footerEl = document.getElementById("div_comment_footer_" + uuid_comment);
  if (!footerEl) {
    return;
  }
  ReactDOM.render(
    /* @__PURE__ */ React.createElement(Div_comment_button_list, { data: target || { active: 1, check_comment_reader: "" }, depth: isUpper ? 1 : 2, loading: false }),
    footerEl
  );
}
async function removeCommentTreeFromView(uuid_comment) {
  const removeIDs = new Set([uuid_comment]);
  let changed = true;
  while (changed) {
    changed = false;
    Object.values(communityState.commentData || {}).filter(Boolean).forEach((comment) => {
      if (comment.uuid && comment.uuid_upper && removeIDs.has(comment.uuid_upper) && !removeIDs.has(comment.uuid)) {
        removeIDs.add(comment.uuid);
        changed = true;
      }
    });
  }
  const rows = Object.values(communityState.commentData || {}).filter((comment) => comment && !removeIDs.has(comment.uuid));
  communityState.commentData = indexedRowsFromArray(rows);
  await set_comment();
}
async function upsertCommentFromMutationResponse(comment) {
  if (!comment || !comment.uuid) {
    return;
  }
  const rows = Object.values(communityState.commentData || {}).filter((item) => item && item.uuid !== comment.uuid);
  rows.push({
    active: 1,
    visible: 1,
    attachments: [],
    rereply: {},
    ...comment,
    __optimistic: true,
    __optimisticAt: Date.now()
  });
  communityState.commentData = indexedRowsFromArray(rows);
  await set_comment();
}
function mergeOptimisticComments(responseData) {
  const serverRows = Object.values(responseData || {}).filter(Boolean);
  const serverIDs = new Set(serverRows.map((item) => item && item.uuid).filter(Boolean));
  const now = Date.now();
  const optimisticRows = Object.values(communityState.commentData || {}).filter((item) => {
    if (!item || !item.uuid || !item.__optimistic) {
      return false;
    }
    if (serverIDs.has(item.uuid)) {
      return false;
    }
    const age = now - Number(item.__optimisticAt || 0);
    return age >= 0 && age < 6e4;
  });
  if (optimisticRows.length === 0) {
    return responseData || {};
  }
  return indexedRowsFromArray(serverRows.concat(optimisticRows));
}
function refreshCommentsQuietly() {
  get_read_article_comment(orderID).catch((error) => {
    console.error("[refreshCommentsQuietly] failed", error);
  });
}
async function comment_action(action, uuid_comment) {
  const isNew = uuid_comment === "new";
  if (action === "delete") {
    if (!confirm("\uC815\uB9D0\uB85C \uC0AD\uC81C\uD560\uAE4C\uC694?")) {
      return;
    }
    const isUpper = (communityState.commentUpper || []).map((item) => item.uuid).includes(uuid_comment);
    const target = Object.values(communityState.commentData || {}).find((item) => item.uuid === uuid_comment);
    ReactDOM.render(
      /* @__PURE__ */ React.createElement(Div_comment_button_list, { data: target || { active: 1, check_comment_reader: "" }, depth: isUpper ? 1 : 2, loading: true }),
      document.getElementById("div_comment_footer_" + uuid_comment)
    );
    const request_data2 = new FormData();
    request_data2.append("uuid", uuid_comment);
    try {
      const responseData = await fetch("/blank/ajax_board/delete_comment/", {
        method: "POST",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        body: request_data2
      }).then((res) => res.json());
      if (!responseData || responseData.error || responseData.checker === "ERROR") {
        alert(responseData && responseData.error ? responseData.error : "\uB313\uAE00\uC744 \uC0AD\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
        restoreCommentActionButtons(uuid_comment, isUpper, target);
        return;
      }
      await removeCommentTreeFromView(uuid_comment);
      refreshCommentsQuietly();
    } catch (error) {
      console.error("[comment_action:delete] failed", error);
      alert("\uB313\uAE00\uC744 \uC0AD\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
      restoreCommentActionButtons(uuid_comment, isUpper, target);
    }
    return;
  }
  const editorKey = isNew ? "new" : uuid_comment;
  const currentEditor = communityState.commentEditors[editorKey];
  if (!currentEditor) {
    alert("\uC5D0\uB514\uD130\uAC00 \uCD08\uAE30\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C\uACE0\uCE68 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.");
    return;
  }
  const txt_content = getCommentEditorHTML(currentEditor);
  const chk_id = isNew ? "chk_secret_new" : "chk_secret_" + uuid_comment;
  const secretEl = document.getElementById(chk_id);
  const chk_secret = secretEl ? secretEl.checked : false;
  if (isCommentContentEmpty(txt_content)) {
    alert("\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
    return;
  }
  const btnId = isNew ? "btn_comment_editor_footer_button" : "btn_comment_editor_footer_button_" + uuid_comment;
  const btnEl = document.getElementById(btnId);
  if (btnEl) {
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_btn_comment_editor_footer_button_loading, null), btnEl);
  }
  const request_data = new FormData();
  let requestUrl = "";
  if (action === "submit") {
    requestUrl = "/blank/ajax_board/insert_comment/";
    request_data.append("uuid_article", orderID);
    if (!isNew) {
      request_data.append("uuid_comment", uuid_comment);
    }
  } else if (action === "edit") {
    requestUrl = "/blank/ajax_board/update_comment/";
    request_data.append("uuid_comment", uuid_comment);
  } else {
    console.error("Unknown comment_action:", action);
    return;
  }
  request_data.append("txt_content", txt_content);
  request_data.append("chk_secret", chk_secret);
  try {
    const responseData = await fetch(requestUrl, {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: request_data
    }).then((res) => res.json());
    if (!responseData || responseData.error || responseData.checker === "ERROR") {
      alert(responseData && responseData.error ? responseData.error : "\uB313\uAE00\uC744 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      return;
    }
    const savedCommentUUID = responseData && responseData.uuid ? responseData.uuid : uuid_comment;
    if (responseData && responseData.comment) {
      await upsertCommentFromMutationResponse(responseData.comment);
    }
    const queuedFiles = queuedCommentFiles(uuid_comment);
    await uploadQueuedFiles(queuedFiles, {
      note: "Comment",
      scope: "comment",
      articleUUID: orderID,
      commentUUID: savedCommentUUID
    });
    clearQueuedCommentFiles(uuid_comment);
    refreshCommentsQuietly();
  } catch (error) {
    console.error("[comment_action] failed", error);
    alert("\uB313\uAE00\uC744 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
  } finally {
    const btnElAfter = document.getElementById(btnId);
    if (btnElAfter) {
      ReactDOM.render(
        /* @__PURE__ */ React.createElement(Div_btn_comment_editor_footer_button, { uuid_comment, function: () => comment_action(action, uuid_comment) }),
        btnElAfter
      );
    }
  }
}
async function comment_file_action(action, uuid_comment) {
  if (action === "delete") {
    clearQueuedCommentFiles(uuid_comment);
    return;
  }
  if (action === "upload") {
    const inputEl = document.getElementById("id_file_upload_" + uuid_comment);
    if (!inputEl || !inputEl.files || !inputEl.files[0]) {
      return;
    }
    queueCommentFiles(uuid_comment, inputEl.files);
    inputEl.value = "";
  }
}
async function get_read_article_comment(orderID_param) {
  const request_data = new FormData();
  request_data.append("orderID", orderID_param);
  const responseData = await fetch("/blank/ajax_board/get_read_article_comment/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: request_data
  }).then((res) => res.json());
  if (!responseData || responseData.error || responseData.checker === "ERROR") {
    console.error("[get_read_article_comment] failed", responseData);
    return;
  }
  communityState.commentData = mergeOptimisticComments(responseData);
  await set_comment();
}
async function set_comment() {
  if (!communityState.commentData) {
    const container = document.getElementById("div_community_read_comment");
    if (container) {
      container.innerHTML = `<div class="w-full py-4 text-sm text-gray-500">\uC544\uC9C1 \uB4F1\uB85D\uB41C \uB313\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>`;
    }
    return;
  }
  const allComments = Object.values(communityState.commentData).filter((c) => c && Number(c.active == null ? 1 : c.active) === 1);
  communityState.commentUpper = allComments.filter((item) => !item.uuid_upper);
  const list_comment = communityState.commentUpper.map((comment) => ({
    ...comment,
    rereply: allComments.filter((item) => item.uuid_upper === comment.uuid)
  }));
  const commentContainer = document.getElementById("div_community_read_comment");
  if (!commentContainer) {
    return;
  }
  let uuid_article = null;
  let is_secret = 0;
  let check_reader = "guest";
  if (communityState.articleData) {
    uuid_article = communityState.articleData.uuid;
    is_secret = communityState.articleData.is_secret;
    check_reader = communityState.articleData.check_reader;
  }
  ReactDOM.render(
    /* @__PURE__ */ React.createElement(Div_article_read_comment, { data: list_comment, uuid_article, is_secret, check_reader }),
    commentContainer
  );
  allComments.forEach((comment) => {
    if (!comment || !comment.uuid)
      return;
    const el = document.querySelector("#div_comment_" + comment.uuid);
    if (!el)
      return;
    WebRSolidEdit.renderContent(el, comment.content || "");
  });
  communityState.commentEditors = {};
  const newFormEl = document.querySelector("#div_community_read_comment_new_form");
  if (newFormEl) {
    communityState.commentEditors["new"] = await mountSolidCommentEditor("new", "");
    setCommentEditorHTML(communityState.commentEditors["new"], "");
  }
  for (const comment of communityState.commentUpper) {
    if (!comment || !comment.uuid)
      continue;
    const replyEl = document.querySelector("#div_community_read_comment_new_" + comment.uuid + "_form");
    if (!replyEl)
      continue;
    communityState.commentEditors[comment.uuid] = await mountSolidCommentEditor(comment.uuid, "");
    setCommentEditorHTML(communityState.commentEditors[comment.uuid], "");
  }
}
async function set_main_read() {
  resetEditorState();
  renderReadPageShell();
  await get_read_article("init");
}
function Div_main() {
  return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-2xl px-4 py-8 mx-auto space-y-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { id: "div_title", class: "w-full" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
      id: "txt_title",
      name: "txt_title",
      class: "w-full h-[48px] rounded-lg resize-none scroll-hide text-start text-[14px] font-[500] border-gray-500 focus:ring-gray-700 focus:border-gray-700"
    }
  )), /* @__PURE__ */ React.createElement("div", { id: "div_checker", class: "flex flex-row justify-end items-center w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center mb-4" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      id: "chk_secret",
      type: "checkbox",
      value: "",
      class: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
    }
  ), /* @__PURE__ */ React.createElement("label", { for: "chk_secret", class: "ms-2 text-sm font-medium text-gray-900" }, "\uBE44\uBC00\uAE00\uB85C \uC791\uC131\uD558\uAE30 (\uBCF8\uC778\uACFC \uAD00\uB9AC\uC790\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.)"))), /* @__PURE__ */ React.createElement("div", { id: "div_editor", class: "webr-solid-editor-shell w-full" }), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_article_file_control" }, /* @__PURE__ */ React.createElement(AttachmentDropZone, { target: "article", existing: communityState.articleData ? normalizeAttachmentList(communityState.articleData) : [] })), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_button_list" }, /* @__PURE__ */ React.createElement(Div_button, null)));
}
function Div_button() {
  return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-2 justify-center items-center gap-2 w-full" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => click_btn_submit(),
      class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
    },
    "\uC644\uB8CC"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: init_url,
      class: "text-gray-900 text-center bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
    },
    "\uBAA9\uB85D\uC73C\uB85C"
  ));
}
function Div_button_loading() {
  return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-2 justify-center items-center gap-2 w-full" }, /* @__PURE__ */ React.createElement("button", { type: "button", class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full cursor-not-allowed hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300" }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", role: "status", class: "inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), /* @__PURE__ */ React.createElement("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "#1C64F2" })), "\uC644\uB8CC"), /* @__PURE__ */ React.createElement("button", { type: "button", class: "text-gray-900 bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 cursor-not-allowed focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100" }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", role: "status", class: "inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), /* @__PURE__ */ React.createElement("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "#1C64F2" })), "\uBAA9\uB85D\uC73C\uB85C"));
}
async function check_file_upload() {
  const inputEl = document.getElementById("id_file_upload");
  if (!inputEl || !inputEl.files || !inputEl.files[0]) {
    return;
  }
  queueArticleFiles(inputEl.files);
  inputEl.value = "";
}
function click_delete_file() {
  clearQueuedArticleFiles();
}
async function mountArticleEditor(initialHTML = null) {
  communityState.articleEditor = await mountSolidArticleEditor(initialHTML);
  return communityState.articleEditor;
}
function Div_check_writer() {
  return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-2xl px-4 py-8 mx-auto space-y-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", class: "w-8 h-8 animate-spin text-gray-200 fill-blue-600", viewBox: "0 0 100 101" }, /* @__PURE__ */ React.createElement("circle", { cx: "50", cy: "50", r: "45", stroke: "currentColor", "stroke-width": "10", fill: "none" }), /* @__PURE__ */ React.createElement("path", { d: "M95 50a45 45 0 0 1-45 45", stroke: "currentColor", "stroke-width": "10" })), /* @__PURE__ */ React.createElement("p", null, "\uC791\uC131\uC790 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.")));
}
function Div_main_stop() {
  return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-2xl px-4 py-8 mx-auto space-y-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/stop.svg", class: "size-16" }), /* @__PURE__ */ React.createElement("p", null, "\uC791\uC131\uC790\uB9CC \uAE00\uC744 \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: init_url,
      class: "text-gray-900 text-center bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 w-[150px] focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
    },
    "\uBAA9\uB85D\uC73C\uB85C"
  )));
}
async function submit_write() {
  const txt_title = document.getElementById("txt_title").value.trim();
  const txt_content = getArticleEditorHTML();
  const chk_secret = document.getElementById("chk_secret").checked;
  if (communityState.toggle_click_submit) {
    return;
  }
  communityState.toggle_click_submit = true;
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button_loading, null), document.getElementById("div_button_list"));
  if (txt_title == null || txt_title === "") {
    alert("\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
  } else if (isArticleContentEmpty(txt_content)) {
    alert("\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
  } else {
    const request_data = new FormData();
    request_data.append("tag", url);
    request_data.append("tag_sub", sub);
    request_data.append("txt_title", txt_title);
    request_data.append("txt_content", txt_content);
    request_data.append("chk_secret", chk_secret);
    const data = await fetch("/blank/ajax_board/insert_article/", {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: request_data
    }).then((res) => res.json());
    if (data && data.error) {
      alert(data.error);
      communityState.toggle_click_submit = false;
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button, null), document.getElementById("div_button_list"));
      return;
    }
    try {
      await uploadQueuedFiles(queuedArticleFiles(), {
        note: "Article",
        scope: "article",
        articleUUID: data.uuid
      });
    } catch (error) {
      alert("\uAC8C\uC2DC\uAE00\uC740 \uC800\uC7A5\uB418\uC5C8\uC9C0\uB9CC \uD30C\uC77C \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: " + error.message);
    }
    location.href = init_url + "read/" + data.uuid + "/";
  }
  communityState.toggle_click_submit = false;
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button, null), document.getElementById("div_button_list"));
}
async function submit_edit() {
  const txt_title = document.getElementById("txt_title").value.trim();
  const txt_content = getArticleEditorHTML();
  const chk_secret = document.getElementById("chk_secret").checked;
  if (communityState.toggle_click_submit) {
    return;
  }
  communityState.toggle_click_submit = true;
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button_loading, null), document.getElementById("div_button_list"));
  if (txt_title == null || txt_title === "") {
    alert("\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
  } else if (isArticleContentEmpty(txt_content)) {
    alert("\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
  } else {
    const request_data = new FormData();
    request_data.append("tag", url);
    request_data.append("tag_sub", sub);
    request_data.append("uuid_article", orderID);
    request_data.append("txt_title", txt_title);
    request_data.append("txt_content", txt_content);
    request_data.append("chk_secret", chk_secret);
    if (communityState.articleData && communityState.articleData.file_url != null) {
      request_data.append("attached_file", communityState.articleData.file_url);
    }
    const response_data = await fetch("/blank/ajax_board/update_article/", {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: request_data
    }).then((res) => res.json());
    if (response_data && response_data.error) {
      alert(response_data.error);
      communityState.toggle_click_submit = false;
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button, null), document.getElementById("div_button_list"));
      return;
    }
    try {
      await uploadQueuedFiles(queuedArticleFiles(), {
        note: "Article",
        scope: "article",
        articleUUID: response_data.uuid || orderID
      });
    } catch (error) {
      alert("\uAC8C\uC2DC\uAE00\uC740 \uC800\uC7A5\uB418\uC5C8\uC9C0\uB9CC \uD30C\uC77C \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: " + error.message);
    }
    location.href = init_url + "read/" + response_data.uuid + "/";
  }
  communityState.toggle_click_submit = false;
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button, null), document.getElementById("div_button_list"));
}
async function click_btn_submit() {
  if (getCommunityMode() === "edit") {
    return submit_edit();
  }
  return submit_write();
}
async function set_main_write() {
  resetEditorState();
  if (gv_username !== "") {
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main, null), document.getElementById("div_main"));
    await mountArticleEditor();
  } else {
    location.href = init_url;
  }
}
async function set_main_edit() {
  resetEditorState();
  if (!gv_username) {
    location.href = init_url;
    return;
  }
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_check_writer, null), document.getElementById("div_main"));
  const fd = new FormData();
  fd.append("orderID", orderID);
  communityState.articleData = await fetch("/blank/ajax_board/get_read_article/", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: fd
  }).then((res) => res.json());
  if (communityState.articleData.check_reader === "user") {
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_stop, null), document.getElementById("div_main"));
    return;
  }
  ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main, null), document.getElementById("div_main"));
  document.getElementById("txt_title").value = communityState.articleData.title;
  await mountArticleEditor(communityState.articleData.content || "");
  setArticleEditorHTML(communityState.articleData.content);
  document.getElementById("chk_secret").checked = communityState.articleData.is_secret == 1;
  renderArticleAttachmentControl();
}
async function set_main() {
  normalizeCommunityRoute();
  if (getCommunityMode() === "read") {
    await set_main_read();
  } else if (getCommunityMode() === "write") {
    await set_main_write();
  } else if (getCommunityMode() === "edit") {
    await set_main_edit();
  } else {
    await set_main_list();
  }
}
window.set_main = set_main;
window.check_file_upload = check_file_upload;
window.click_btn_search = click_btn_search;
window.handleChangeTab = handleChangeTab;
window.goToArticlePage = goToArticlePage;
window.click_btn_delete = click_btn_delete;
window.click_btn_reply_comment = click_btn_reply_comment;
window.click_btn_edit_comment = click_btn_edit_comment;
window.comment_action = comment_action;
window.comment_file_action = comment_file_action;
window.click_delete_file = click_delete_file;
window.click_btn_submit = click_btn_submit;
