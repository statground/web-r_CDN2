(function installWebRHomeIdentityPreserve202607251514(window, document) {
  "use strict";

  const stateKey = "__webrHomeIdentityPreserve202607251514";
  const currentState = window[stateKey];
  if (currentState && (currentState.installed || currentState.pending)) {
    return;
  }

  const state = currentState || { attempts: 0, installed: false, pending: false };
  window[stateKey] = state;

  const canonicalDescriptionLine1 = "\"웹에서 하는 R통계\"는, 통계에는 관심이 있으나 R을 어려워하는 여러 연구자들을 위한 프로젝트입니다.";
  const canonicalDescriptionLine2 = "R설치없이 클릭만으로 웹에 있는 서버를 이용하여 통계분석을 하고 보다 R을 쉽게 사용하기 위한 패키지 및 앱 공동개발을 목표로 하고 있습니다.";

  function preserveCanonicalHomeIdentity() {
    const title = document.getElementById("webr-home-title");
    if (!title) {
      return false;
    }

    const mark = document.createElement("span");
    mark.className = "mx-1 inline-flex min-h-[1.08em] min-w-[1.08em] items-center justify-center rounded-lg bg-blue-600 px-2 font-mono text-white shadow-sm";
    mark.textContent = "R";
    title.replaceChildren(
      document.createTextNode("웹에서 하는 "),
      mark,
      document.createTextNode(" 통계")
    );
    title.setAttribute("data-webr-home-identity", "preserved");

    const description = title.nextElementSibling;
    if (!description || description.tagName !== "P") {
      return false;
    }
    description.replaceChildren(
      document.createTextNode(canonicalDescriptionLine1),
      document.createElement("br"),
      document.createTextNode(canonicalDescriptionLine2)
    );
    description.setAttribute("data-webr-home-copy", "preserved");
    return true;
  }

  function install() {
    if (state.installed) {
      return;
    }
    if (typeof window.set_main !== "function") {
      state.attempts += 1;
      if (state.attempts < 20) {
        state.pending = true;
        window.setTimeout(function retryIdentityInstall() {
          state.pending = false;
          install();
        }, 50);
      }
      return;
    }

    const originalSetMain = window.set_main;
    window.set_main = function setMainWithCanonicalHomeIdentity() {
      const result = originalSetMain.apply(this, arguments);
      preserveCanonicalHomeIdentity();
      window.setTimeout(preserveCanonicalHomeIdentity, 0);
      return result;
    };
    window.__webrPreserveCanonicalHomeIdentity = preserveCanonicalHomeIdentity;
    state.pending = false;
    state.installed = true;
  }

  install();
})(window, document);
