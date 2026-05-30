(function () {
  if (window.__webrBookActionsLoaded) {
    return;
  }
  window.__webrBookActionsLoaded = true;

  function markPending(trigger) {
    if (!trigger || trigger.dataset.webrPending === "1") {
      return false;
    }
    trigger.dataset.webrPending = "1";
    trigger.setAttribute("aria-busy", "true");
    trigger.classList.add("opacity-75", "cursor-wait");

    if (trigger.tagName === "BUTTON") {
      trigger.disabled = true;
    }

    var pendingText = trigger.getAttribute("data-pending-text") || "";
    var label = trigger.querySelector("[data-webr-pending-label]");
    if (label && pendingText) {
      if (!label.dataset.defaultText) {
        label.dataset.defaultText = label.textContent || "";
      }
      label.textContent = pendingText;
    }

    var spinner = trigger.querySelector("[data-webr-pending-spinner]");
    if (spinner) {
      spinner.classList.remove("hidden");
      spinner.classList.add("inline-block");
    }
    return true;
  }

  function bindPendingForms(root) {
    (root || document).querySelectorAll("form[data-webr-pending-form]").forEach(function (form) {
      if (form.dataset.webrPendingBound === "1") {
        return;
      }
      form.dataset.webrPendingBound = "1";
      form.addEventListener("submit", function () {
        markPending(form.querySelector("[data-webr-pending-trigger]"));
      });
    });
  }

  function bindPendingLinks(root) {
    (root || document).querySelectorAll("a[data-webr-pending-link]").forEach(function (link) {
      if (link.dataset.webrPendingBound === "1") {
        return;
      }
      link.dataset.webrPendingBound = "1";
      link.addEventListener("click", function (event) {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        markPending(link);
      });
    });
  }

  function bind(root) {
    bindPendingForms(root);
    bindPendingLinks(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bind(document);
    });
  } else {
    bind(document);
  }

  document.addEventListener("htmx:afterSwap", function (event) {
    bind(event.target || document);
  });
})();
