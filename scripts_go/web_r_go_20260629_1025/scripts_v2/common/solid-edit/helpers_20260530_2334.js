(function() {
  const STYLE_ID = "webr-solid-content-viewer-style";
  function injectViewerStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .webr-solid-content-viewer {
        color: #0f172a;
        font-size: 1.0625rem;
        line-height: 1.85;
        word-break: keep-all;
        overflow-wrap: anywhere;
      }
      .webr-solid-content-viewer > *:first-child {
        margin-top: 0 !important;
      }
      .webr-solid-content-viewer p {
        margin: 0.65rem 0;
      }
      .webr-solid-content-viewer section {
        margin-top: 2rem;
      }
      .webr-solid-content-viewer section:first-child {
        margin-top: 0;
      }
      .webr-solid-content-viewer h2 {
        margin: 2.25rem 0 0.9rem;
        padding-left: 0.85rem;
        border-left: 4px solid #2563eb;
        color: #0f172a;
        font-size: 1.35rem;
        font-weight: 800;
        line-height: 1.35;
      }
      .webr-solid-content-viewer h3 {
        margin: 1.45rem 0 0.55rem;
        color: #1e3a8a;
        font-size: 1.08rem;
        font-weight: 800;
        line-height: 1.4;
      }
      .webr-solid-content-viewer strong {
        color: #0f172a;
        font-weight: 800;
      }
      .webr-solid-content-viewer ul,
      .webr-solid-content-viewer ol {
        margin: 0.75rem 0 1.25rem;
        padding-left: 1.45rem;
      }
      .webr-solid-content-viewer ul {
        list-style: disc;
      }
      .webr-solid-content-viewer ol {
        list-style: decimal;
      }
      .webr-solid-content-viewer li {
        margin: 0.45rem 0;
        padding-left: 0.1rem;
      }
      .webr-solid-content-viewer hr {
        margin: 2rem 0;
        border: 0;
        border-top: 1px solid #dbe4f0;
      }
      .webr-solid-content-viewer blockquote {
        margin: 1.25rem 0;
        padding: 0.9rem 1rem;
        border-left: 4px solid #38bdf8;
        border-radius: 0.5rem;
        background: #f0f9ff;
        color: #164e63;
        font-weight: 600;
      }
      .webr-solid-content-viewer a {
        color: #1d4ed8;
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 0.18em;
      }
      @media (max-width: 640px) {
        .webr-solid-content-viewer {
          font-size: 1rem;
          line-height: 1.75;
        }
        .webr-solid-content-viewer h2 {
          font-size: 1.18rem;
        }
      }
    `;
    document.head.appendChild(style);
  }
  function sanitizeHTML(html) {
    const source = String(html || "");
    const template = document.createElement("template");
    template.innerHTML = source;
    template.content.querySelectorAll("script, style, iframe, object, embed").forEach(function(node) {
      node.remove();
    });
    template.content.querySelectorAll("*").forEach(function(node) {
      Array.from(node.attributes || []).forEach(function(attr) {
        const name = attr.name.toLowerCase();
        const value = String(attr.value || "").trim().toLowerCase();
        if (name.indexOf("on") === 0 || value.indexOf("javascript:") === 0) {
          node.removeAttribute(attr.name);
        }
      });
    });
    return template.innerHTML;
  }
  function renderContent(target, html) {
    if (!target) {
      return null;
    }
    injectViewerStyles();
    target.innerHTML = sanitizeHTML(html);
    target.classList.add("webr-solid-content-viewer");
    return target;
  }
  function mountEditor(target, options) {
    const host = target || document.createElement("div");
    const config = Object.assign({
      html: "",
      placeholder: "\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
      restoreDraft: false,
      ribbonExpanded: false,
      height: "250px",
      timeoutMs: 15e3
    }, options || {});
    const wrapper = {
      host,
      instance: null,
      pendingHTML: typeof config.html === "string" ? config.html : "",
      getHTML: function() {
        if (this.instance && window.WebRSolidEditor) {
          return window.WebRSolidEditor.getHTML(this.instance);
        }
        const textarea = this.host.querySelector("textarea");
        return textarea ? textarea.value || "" : this.pendingHTML || "";
      },
      setHTML: function(html) {
        this.pendingHTML = String(html || "");
        if (this.instance && window.WebRSolidEditor) {
          window.WebRSolidEditor.setHTML(this.instance, this.pendingHTML);
          return;
        }
        const textarea = this.host.querySelector("textarea");
        if (textarea) {
          textarea.value = this.pendingHTML;
        }
      },
      destroy: function() {
        if (this.instance && window.WebRSolidEditor) {
          window.WebRSolidEditor.destroy(this.instance);
        } else {
          this.host.innerHTML = "";
        }
      }
    };
    if (!window.WebRSolidEditor || typeof window.WebRSolidEditor.mountHost !== "function") {
      const textarea = document.createElement("textarea");
      textarea.className = "webr-solid-editor-fallback";
      textarea.rows = 10;
      textarea.value = wrapper.pendingHTML;
      host.innerHTML = "";
      host.appendChild(textarea);
      return wrapper;
    }
    window.WebRSolidEditor.mountHost(host, config).then(function(instance) {
      wrapper.instance = instance;
      if (wrapper.pendingHTML) {
        wrapper.setHTML(wrapper.pendingHTML);
      }
    });
    return wrapper;
  }
  function getHTML(editor) {
    return editor && typeof editor.getHTML === "function" ? editor.getHTML() : "";
  }
  function setHTML(editor, html) {
    if (editor && typeof editor.setHTML === "function") {
      editor.setHTML(html);
    }
  }
  function isEmpty(html) {
    if (window.WebRSolidEditor && typeof window.WebRSolidEditor.isEmpty === "function") {
      return window.WebRSolidEditor.isEmpty(html);
    }
    return String(html || "").replace(/<[^>]*>/g, "").trim() === "";
  }
  const EDITOR_CORE_URL = "https://cdn.jsdelivr.net/gh/statground/solid-edit@ba2b1a6097fa2c677d9a51499a9a5e332afe4fb5/versions/0.0.4/editor.js";
  const EDITOR_CORE_SRI = "sha384-o1lxhgutT7T8DymtCkYZMTZogs02eQQ49iziFUhnjFTwe4XR8OWMyrzZAvy9wS7Q";
  let editorAssetsFlight = null;
  function exactKeys(value, keys) {
    return !!value && typeof value === "object" && !Array.isArray(value) &&
      Object.keys(value).sort().join("|") === keys.slice().sort().join("|");
  }
  function readEditorAssets() {
    const value = window.WEBR_SOLID_EDIT_READ_ASSETS;
    if (!exactKeys(value, ["version", "commit", "core", "host"]) || value.version !== 1 ||
        typeof value.commit !== "string" || !/^[0-9a-f]{40}$/.test(value.commit) ||
        !exactKeys(value.core, ["src", "integrity"]) || !exactKeys(value.host, ["src", "integrity"]) ||
        value.core.src !== EDITOR_CORE_URL || value.core.integrity !== EDITOR_CORE_SRI ||
        typeof value.host.integrity !== "string" || !/^sha256-[A-Za-z0-9+/]{43}=$/.test(value.host.integrity)) return null;
    const path = "scripts_go/web_r_go_20260629_1025/scripts_v2/common/solid-edit/host_20260530_1745.js";
    if (value.host.src !== "https://cdn.jsdelivr.net/gh/statground/web-r_CDN2@" + value.commit + "/" + path &&
        value.host.src !== "/_webr/assets/" + value.commit + "/" + path) return null;
    return {core: {src: value.core.src, integrity: value.core.integrity},
      host: {src: value.host.src, integrity: value.host.integrity}};
  }
  function editorAssetsReady() {
    return !!window.WebRSolidEditor && typeof window.WebRSolidEditor.mountHost === "function" &&
      (typeof window.mountContentEditor === "function" || typeof window.mountStatkissContentEditor === "function" ||
        typeof window.mountEmbeddedContentEditor === "function");
  }
  function ensureEditorAssets(options) {
    if (editorAssetsReady()) return Promise.resolve(true);
    const assets = readEditorAssets();
    const deadline = options && options.deadline;
    if (!assets || !Number.isFinite(deadline) || deadline <= Date.now() || deadline > Date.now() + 15000) return Promise.resolve(false);
    if (!editorAssetsFlight) {
      editorAssetsFlight = new Promise(function(resolve) {
        let done = false;
        const timer = setTimeout(() => finish(false), Math.max(0, deadline - Date.now()));
        function finish(result) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve(result === true);
        }
        function load(asset, next) {
          if (done || Date.now() >= deadline) { finish(false); return; }
          const script = document.createElement("script");
          script.src = asset.src;
          script.integrity = asset.integrity;
          script.crossOrigin = "anonymous";
          script.async = true;
          const context = document.getElementById("webr-legacy-context");
          if (context && context.nonce) script.nonce = context.nonce;
          // Existing global CDN fallback retains SRI/CORS/nonce when replacing
          // a failed pinned CDN2 node with its exact same-origin mirror.
          script.onload = function() { if (!done) next(); };
          script.onerror = function() {
            const fallback = typeof window.__webrCDNFallbackURL === "function" && window.__webrCDNFallbackURL(this.src);
            if (!fallback) finish(false);
          };
          document.head.appendChild(script);
        }
        load(assets.core, () => load(assets.host, () => finish(editorAssetsReady())));
      });
    }
    // Coalesced work has one original deadline; a later caller cannot renew it.
    return new Promise(function(resolve) {
      const timer = setTimeout(() => resolve(false), Math.max(0, deadline - Date.now()));
      editorAssetsFlight.then(result => { clearTimeout(timer); resolve(Date.now() < deadline && result); });
    });
  }
  window.WebRSolidEdit = {
    ensureEditorAssets,
    sanitizeHTML,
    renderContent,
    mountEditor,
    getHTML,
    setHTML,
    isEmpty
  };
})();
