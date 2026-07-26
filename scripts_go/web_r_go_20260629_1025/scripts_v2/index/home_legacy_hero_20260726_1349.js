(function installWebRLegacyHero202607261349(window, document) {
  "use strict";

  if (window.__webrLegacyHero202607261349Installed) {
    return;
  }
  window.__webrLegacyHero202607261349Installed = true;

  var canonicalDescriptionLine1 =
    "\"웹에서 하는 R통계\"는, 통계에는 관심이 있으나 R을 어려워하는 여러 연구자들을 위한 프로젝트입니다.";
  var canonicalDescriptionLine2 =
    "R설치없이 클릭만으로 웹에 있는 서버를 이용하여 통계분석을 하고 보다 R을 쉽게 사용하기 위한 패키지 및 앱 공동개발을 목표로 하고 있습니다.";

  function applyLegacyHero() {
    var hero = document.querySelector(".webr-home-compact__hero");
    var identity = hero && hero.querySelector(".webr-home-compact__identity");
    var title = identity && identity.querySelector("#webr-home-title");
    if (!hero || !identity || !title) {
      return false;
    }
    if (hero.dataset.webrLegacyHero === "20260726_1349") {
      return true;
    }

    var mark = document.createElement("mark");
    mark.className =
      "webr-home-compact__title-mark px-2 text-white bg-blue-600 rounded";
    mark.textContent = "R";
    title.className =
      "webr-home-compact__title mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl";
    title.replaceChildren(
      document.createTextNode("웹에서 하는 "),
      mark,
      document.createTextNode(" 통계")
    );

    var description = identity.querySelector(".webr-home-compact__lead");
    if (description) {
      description.className =
        "webr-home-compact__lead text-base font-normal text-gray-500 md:text-lg lg:text-xl";
      description.replaceChildren(
        document.createTextNode(canonicalDescriptionLine1),
        document.createElement("br"),
        document.createTextNode(canonicalDescriptionLine2)
      );
    }

    identity.querySelectorAll(".webr-home-compact__lead").forEach(function removeDuplicateLead(node) {
      if (node !== description) {
        node.remove();
      }
    });
    var eyebrow = identity.querySelector(".webr-home-compact__eyebrow");
    if (eyebrow) {
      eyebrow.remove();
    }
    var actions = identity.querySelector(".webr-home-compact__actions");
    if (actions) {
      actions.remove();
    }

    hero.dataset.webrLegacyHero = "20260726_1349";
    return true;
  }

  var originalSetMain = window.set_main;
  if (typeof originalSetMain === "function") {
    window.set_main = function setMainWithLegacyHero() {
      var result = originalSetMain.apply(this, arguments);
      applyLegacyHero();
      return result;
    };
  }

  window.__webrApplyLegacyHero = applyLegacyHero;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLegacyHero, { once: true });
  } else {
    applyLegacyHero();
  }
})(window, document);
