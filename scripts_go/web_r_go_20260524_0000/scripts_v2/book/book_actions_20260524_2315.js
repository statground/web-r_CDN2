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

  function submitterForEvent(form, event) {
    if (event && event.submitter && event.submitter.matches("[data-webr-pending-trigger]")) {
      return event.submitter;
    }
    return form.querySelector("[data-webr-pending-trigger]");
  }

  function preserveSubmitterValue(form, submitter) {
    if (!form || !submitter || !submitter.name) {
      return;
    }
    var field = form.querySelector('input[type="hidden"][data-webr-submitter-value="' + submitter.name + '"]');
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = submitter.name;
      field.setAttribute("data-webr-submitter-value", submitter.name);
      form.appendChild(field);
    }
    field.value = submitter.value || "";
  }

  function bindPendingForms(root) {
    (root || document).querySelectorAll("form[data-webr-pending-form]").forEach(function (form) {
      if (form.dataset.webrPendingBound === "1") {
        return;
      }
      form.dataset.webrPendingBound = "1";
      form.addEventListener("submit", function (event) {
        var trigger = submitterForEvent(form, event);
        preserveSubmitterValue(form, trigger);
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

  function bindBookCarousels(root) {
    (root || document).querySelectorAll("[data-webr-book-carousel]").forEach(function (carousel) {
      if (carousel.dataset.webrCarouselBound === "1") {
        return;
      }
      var track = carousel.querySelector("[data-webr-book-carousel-track]");
      var prev = carousel.querySelector("[data-webr-book-carousel-prev]");
      var next = carousel.querySelector("[data-webr-book-carousel-next]");
      if (!track) {
        return;
      }
      carousel.dataset.webrCarouselBound = "1";
      function scrollBy(direction) {
        var amount = Math.max(260, Math.floor(track.clientWidth * 0.8));
        track.scrollBy({ left: amount * direction, behavior: "smooth" });
      }
      if (prev) {
        prev.addEventListener("click", function () { scrollBy(-1); });
      }
      if (next) {
        next.addEventListener("click", function () { scrollBy(1); });
      }
    });
  }

  function bindCheckAll(root) {
    (root || document).querySelectorAll("[data-webr-check-all]").forEach(function (checkbox) {
      if (checkbox.dataset.webrCheckAllBound === "1") {
        return;
      }
      checkbox.dataset.webrCheckAllBound = "1";
      checkbox.addEventListener("change", function () {
        var selector = checkbox.getAttribute("data-webr-check-all") || "";
        var scope = selector ? document.querySelector(selector) : checkbox.closest("form");
        if (!scope) {
          return;
        }
        scope.querySelectorAll('input[type="checkbox"][name="isbn"]').forEach(function (item) {
          item.checked = checkbox.checked;
        });
      });
    });
  }

  function bind(root) {
    bindPendingForms(root);
    bindPendingLinks(root);
    bindBookCarousels(root);
    bindCheckAll(root);
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
