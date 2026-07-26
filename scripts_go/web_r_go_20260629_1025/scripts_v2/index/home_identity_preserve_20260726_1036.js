(function installWebRHomeIdentityPreserve202607261036(window, document) {
  "use strict";

  var stateKey = "__webrHomeIdentityPreserve202607261036";
  var existingState = window[stateKey];
  if (existingState && existingState.installed) {
    if (typeof window.__webrPreserveCanonicalHomeIdentity === "function") {
      window.__webrPreserveCanonicalHomeIdentity();
    }
    return;
  }

  var state = existingState || {
    attempts: 0,
    installed: false,
    retryID: 0
  };
  window[stateKey] = state;

  var canonicalDescriptionLine1 =
    "\"웹에서 하는 R통계\"는, 통계에는 관심이 있으나 R을 어려워하는 여러 연구자들을 위한 프로젝트입니다.";
  var canonicalDescriptionLine2 =
    "R설치없이 클릭만으로 웹에 있는 서버를 이용하여 통계분석을 하고 보다 R을 쉽게 사용하기 위한 패키지 및 앱 공동개발을 목표로 하고 있습니다.";

  function preserveCanonicalHomeIdentity() {
    var title = document.getElementById("webr-home-title");
    if (!title) {
      return false;
    }

    if (title.getAttribute("data-webr-home-identity") !== "preserved") {
      var mark = document.createElement("span");
      mark.className =
        "mx-1 inline-flex min-h-[1.08em] min-w-[1.08em] items-center justify-center rounded-lg bg-blue-600 px-2 font-mono text-white shadow-sm";
      mark.textContent = "R";
      title.replaceChildren(
        document.createTextNode("웹에서 하는 "),
        mark,
        document.createTextNode(" 통계")
      );
      title.setAttribute("data-webr-home-identity", "preserved");
    }

    var description = title.nextElementSibling;
    if (!description || description.tagName !== "P") {
      return false;
    }
    if (description.getAttribute("data-webr-home-copy") !== "preserved") {
      description.replaceChildren(
        document.createTextNode(canonicalDescriptionLine1),
        document.createElement("br"),
        document.createTextNode(canonicalDescriptionLine2)
      );
      description.setAttribute("data-webr-home-copy", "preserved");
    }
    return true;
  }

  function preserveAfterRender() {
    preserveCanonicalHomeIdentity();
    window.setTimeout(preserveCanonicalHomeIdentity, 0);
    window.setTimeout(preserveCanonicalHomeIdentity, 80);
    window.setTimeout(preserveCanonicalHomeIdentity, 320);
  }

  function install() {
    if (state.installed) {
      preserveAfterRender();
      return;
    }
    if (typeof window.set_main !== "function") {
      state.attempts += 1;
      if (state.attempts < 40) {
        window.clearTimeout(state.retryID);
        state.retryID = window.setTimeout(install, 50);
      }
      return;
    }

    var originalSetMain = window.set_main;
    window.set_main = function setMainWithCanonicalHomeIdentity() {
      var result = originalSetMain.apply(this, arguments);
      preserveAfterRender();
      return result;
    };
    window.__webrPreserveCanonicalHomeIdentity = preserveCanonicalHomeIdentity;
    state.installed = true;
    preserveAfterRender();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", preserveAfterRender, { once: true });
  }
  install();
})(window, document);
