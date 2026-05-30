(function () {
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
    template.content.querySelectorAll("script, style, iframe, object, embed").forEach(function (node) {
      node.remove();
    });
    template.content.querySelectorAll("*").forEach(function (node) {
      Array.from(node.attributes || []).forEach(function (attr) {
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
      placeholder: "내용을 입력해주세요.",
      restoreDraft: false,
      ribbonExpanded: false,
      height: "250px",
      timeoutMs: 15000,
    }, options || {});
    const wrapper = {
      host,
      instance: null,
      pendingHTML: typeof config.html === "string" ? config.html : "",
      getHTML: function () {
        if (this.instance && window.WebRSolidEditor) {
          return window.WebRSolidEditor.getHTML(this.instance);
        }
        const textarea = this.host.querySelector("textarea");
        return textarea ? textarea.value || "" : this.pendingHTML || "";
      },
      setHTML: function (html) {
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
      destroy: function () {
        if (this.instance && window.WebRSolidEditor) {
          window.WebRSolidEditor.destroy(this.instance);
        } else {
          this.host.innerHTML = "";
        }
      },
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

    window.WebRSolidEditor.mountHost(host, config).then(function (instance) {
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

  window.WebRSolidEdit = {
    sanitizeHTML,
    renderContent,
    mountEditor,
    getHTML,
    setHTML,
    isEmpty,
  };
})();
