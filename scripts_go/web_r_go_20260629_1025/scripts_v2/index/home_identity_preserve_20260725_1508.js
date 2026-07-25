(function installWebRHomeIdentityPreserve202607251508(window, document) {
  "use strict";

  if (window.__webrHomeIdentityPreserve202607251508Installed) {
    return;
  }
  window.__webrHomeIdentityPreserve202607251508Installed = true;

  const originalSetMain = window.set_main;
  if (typeof originalSetMain !== "function") {
    return;
  }

  const canonicalTitleBefore = "웹에서 하는 ";
  const canonicalTitleMark = "R";
  const canonicalTitleAfter = " 통계";
  const canonicalDescriptionLine1 = "\"웹에서 하는 R통계\"는, 통계에는 관심이 있으나 R을 어려워하는 여러 연구자들을 위한 프로젝트입니다.";
  const canonicalDescriptionLine2 = "R설치없이 클릭만으로 웹에 있는 서버를 이용하여 통계분석을 하고 보다 R을 쉽게 사용하기 위한 패키지 및 앱 공동개발을 목표로 하고 있습니다.";

  function preserveCanonicalHomeIdentity() {
    const title = document.getElementById("webr-home-title");
    if (!title) {
      return;
    }

    const mark = document.createElement("span");
    mark.className = "mx-1 inline-flex min-h-[1.08em] min-w-[1.08em] items-center justify-center rounded-lg bg-blue-600 px-2 font-mono text-white shadow-sm";
    mark.textContent = canonicalTitleMark;
    title.replaceChildren(
      document.createTextNode(canonicalTitleBefore),
      mark,
      document.createTextNode(canonicalTitleAfter)
    );
    title.setAttribute("data-webr-home-identity", "preserved");

    const description = title.parentElement
      ? title.parentElement.querySelector("p.mt-5")
      : null;
    if (!description) {
      return;
    }
    description.replaceChildren(
      document.createTextNode(canonicalDescriptionLine1),
      document.createElement("br"),
      document.createTextNode(canonicalDescriptionLine2)
    );
    description.setAttribute("data-webr-home-copy", "preserved");
  }

  window.set_main = function setMainWithCanonicalHomeIdentity() {
    const result = originalSetMain.apply(this, arguments);
    preserveCanonicalHomeIdentity();
    return result;
  };
  window.__webrPreserveCanonicalHomeIdentity = preserveCanonicalHomeIdentity;
})(window, document);
