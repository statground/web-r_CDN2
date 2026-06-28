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

  function resetPending(trigger) {
    if (!trigger) {
      return;
    }
    trigger.dataset.webrPending = "0";
    trigger.removeAttribute("aria-busy");
    trigger.classList.remove("opacity-75", "cursor-wait");

    if (trigger.tagName === "BUTTON") {
      trigger.disabled = false;
    }

    var label = trigger.querySelector("[data-webr-pending-label]");
    if (label && label.dataset.defaultText) {
      label.textContent = label.dataset.defaultText;
    }

    var spinner = trigger.querySelector("[data-webr-pending-spinner]");
    if (spinner) {
      spinner.classList.add("hidden");
      spinner.classList.remove("inline-block");
    }
  }

  function submitFormNormally(form) {
    if (!form) {
      return;
    }
    if (typeof form.submit === "function") {
      form.submit();
      return;
    }
    HTMLFormElement.prototype.submit.call(form);
  }

  function parseJSON(text) {
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  function removeBookCard(card) {
    if (!card) {
      return;
    }
    card.style.transition = "opacity 160ms ease, transform 160ms ease";
    card.style.opacity = "0";
    card.style.transform = "scale(0.98)";
    window.setTimeout(function () {
      card.remove();
    }, 170);
  }

  function submitRemoveCardForm(form, trigger) {
    if (!window.fetch || !window.FormData) {
      return false;
    }

    var formData = new FormData(form);
    var action = form.getAttribute("action") || window.location.href;
    var method = (form.getAttribute("method") || "POST").toUpperCase();
    var card = form.closest("[data-webr-book-card]");

    window.fetch(action, {
      method: method,
      body: formData,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "fetch"
      }
    }).then(function (response) {
      return response.text().then(function (text) {
        return {
          ok: response.ok,
          data: parseJSON(text)
        };
      });
    }).then(function (result) {
      if (!result.data) {
        submitFormNormally(form);
        return;
      }
      if (!result.ok || result.data.ok !== true) {
        resetPending(trigger);
        window.alert(result.data.error || "요청을 처리하지 못했습니다.");
        return;
      }
      removeBookCard(card);
    }).catch(function () {
      resetPending(trigger);
      submitFormNormally(form);
    });

    return true;
  }

  function bindPendingForms(root) {
    (root || document).querySelectorAll("form[data-webr-pending-form]").forEach(function (form) {
      if (form.dataset.webrPendingBound === "1") {
        return;
      }
      form.dataset.webrPendingBound = "1";
      form.addEventListener("submit", function (event) {
        var trigger = form.querySelector("[data-webr-pending-trigger]");
        if (form.hasAttribute("data-webr-remove-card-form")) {
          event.preventDefault();
          if (!markPending(trigger)) {
            return;
          }
          if (!submitRemoveCardForm(form, trigger)) {
            submitFormNormally(form);
          }
          return;
        }
        markPending(trigger);
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
        if (!markPending(link)) {
          return;
        }
        if (String(link.getAttribute("target") || "").toLowerCase() === "_blank") {
          window.setTimeout(function () {
            resetPending(link);
          }, 2500);
        }
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
