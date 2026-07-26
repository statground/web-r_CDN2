(function installWebRFreeServerHeaderPatch202607261151(window, document) {
  "use strict";

  if (window.__webrFreeServerHeaderPatch202607261151Installed) {
    return;
  }
  window.__webrFreeServerHeaderPatch202607261151Installed = true;

  var observer = null;
  var disconnectTimer = null;

  function headerRoot() {
    return document.getElementById("div_header") || document.querySelector("header");
  }

  function replaceExactText(root, from, to) {
    if (!root || !document.createTreeWalker) {
      return;
    }
    var walker = document.createTreeWalker(root, window.NodeFilter.SHOW_TEXT);
    var node = walker.nextNode();
    while (node) {
      if (String(node.nodeValue || "").trim() === from) {
        node.nodeValue = String(node.nodeValue).replace(from, to);
      }
      node = walker.nextNode();
    }
  }

  function patchHeader() {
    var root = headerRoot();
    if (!root) {
      return false;
    }

    root.querySelectorAll('a[href="/webr/roc-analysis/sample/"]').forEach(function removeSampleLink(anchor) {
      var listItem = anchor.closest("li");
      if (listItem && root.contains(listItem)) {
        listItem.remove();
        return;
      }
      anchor.remove();
    });

    root.querySelectorAll('a[href="/webr/"]').forEach(function labelFreeServer(anchor) {
      replaceExactText(anchor, "Web-R Classic", "무료 서버 접속");
      replaceExactText(anchor, "기존 무료 Web-R 분석 환경으로 이동합니다.", "가입 여부와 무관하게 기존 Web-R 무료 서버를 확인합니다.");
    });
    root.dataset.webrFreeServerHeader = "20260726_1151";
    return true;
  }

  function observeHeader() {
    patchHeader();
    if (typeof MutationObserver !== "function") {
      return;
    }
    observer = new MutationObserver(function headerChanged() {
      patchHeader();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    disconnectTimer = window.setTimeout(function stopObserver() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }, 8000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeHeader, { once: true });
  } else {
    observeHeader();
  }

  window.addEventListener("pagehide", function cleanupHeaderPatch() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (disconnectTimer) {
      window.clearTimeout(disconnectTimer);
    }
  }, { once: true });
})(window, document);
