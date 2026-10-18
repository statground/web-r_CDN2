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
        var amount = track.offsetWidth || track.clientWidth || 0;
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

  var bookRecoveryOwner = null;
  var bookRecoveryPageRetired = false;
  var bookRecoveryWindow = 45000;
  var bookRecoveryMaxAttempts = 8;

  function bookRecoveryRoot() {
    if (!/^\/book\/?$/.test(window.location.pathname)) {
      return null;
    }
    var main = document.getElementById("div_main");
    return main && main.querySelector("[data-webr-book-hub][data-webr-book-retry]");
  }

  function bookRecoveryCurrent(owner) {
    return owner === bookRecoveryOwner && !owner.stopped && !bookRecoveryPageRetired &&
      owner.route === window.location.pathname + window.location.search && owner.root === bookRecoveryRoot();
  }

  function stopBookRecovery(owner, showStatus) {
    if (!owner) return;
    owner.stopped = true;
    owner.generation += 1;
    window.clearTimeout(owner.timer);
    window.clearTimeout(owner.deadline);
    owner.timer = null;
    if (owner.request) owner.request.cancel();
    if (showStatus && owner.root.isConnected && owner.route === window.location.pathname + window.location.search) {
      owner.root.setAttribute("aria-busy", "false");
      owner.root.setAttribute("data-webr-book-recovery-state", "stopped");
      var status = owner.root.querySelector('[role="status"]');
      if (status) status.textContent = "R 도서 목록을 현재 확인할 수 없습니다.";
    }
  }

  function scheduleBookRecovery(delay) {
    var root = bookRecoveryRoot();
    if (bookRecoveryPageRetired || document.hidden || !root) {
      if (!root) stopBookRecovery(bookRecoveryOwner, false);
      return;
    }
    var route = window.location.pathname + window.location.search;
    if (!bookRecoveryOwner || bookRecoveryOwner.root !== root || bookRecoveryOwner.route !== route) {
      stopBookRecovery(bookRecoveryOwner, false);
      var owner = { root: root, route: route, started: Date.now(), attempts: 0, generation: 0,
        stopped: false, request: null, timer: null, deadline: null };
      bookRecoveryOwner = owner;
      owner.deadline = window.setTimeout(function () { stopBookRecovery(owner, true); }, bookRecoveryWindow);
    }
    var current = bookRecoveryOwner;
    if (current.stopped || current.timer !== null || current.request) return;
    var remaining = bookRecoveryWindow - (Date.now() - current.started);
    if (remaining <= 0 || current.attempts >= bookRecoveryMaxAttempts) {
      stopBookRecovery(current, true);
      return;
    }
    current.timer = window.setTimeout(function () { runBookRecovery(current); }, Math.min(delay, remaining));
  }

  function runBookRecovery(owner) {
    owner.timer = null;
    if (!bookRecoveryCurrent(owner) || owner.request || document.hidden) {
      return;
    }
    var remaining = bookRecoveryWindow - (Date.now() - owner.started);
    if (remaining <= 0 || owner.attempts >= bookRecoveryMaxAttempts) {
      stopBookRecovery(owner, true);
      return;
    }
    var url = new URL(window.location.href);
    url.searchParams.set("fragment", "content");
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var request = { generation: owner.generation, timeout: null, cancel: null };
    var timeout = new Promise(function (_resolve, reject) {
      request.cancel = function () {
        if (controller) controller.abort();
        reject(new Error("Book fragment timed out or retired"));
      };
      request.timeout = window.setTimeout(request.cancel, Math.min(45000, remaining));
    });
    owner.request = request;
    owner.attempts += 1;
    var options = {
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Accept": "text/html", "X-Requested-With": "fetch" }
    };
    if (controller) {
      options.signal = controller.signal;
    }
    var content = Promise.resolve().then(function () {
      return window.fetch(url.toString(), options);
    }).then(function (response) {
      if (!response.ok) {
        var error = new Error("Book fragment unavailable");
        error.terminal = response.status >= 400 && response.status < 500 && response.status !== 429;
        throw error;
      }
      return response.text();
    });
    Promise.race([content, timeout]).then(function (html) {
      if (!bookRecoveryCurrent(owner) || document.hidden || request.generation !== owner.generation) {
        return;
      }
      var fragment = new DOMParser().parseFromString(html, "text/html");
      var refreshed = fragment.querySelector("[data-webr-book-hub]");
      if (!refreshed || refreshed.hasAttribute("data-webr-book-retry")) {
        throw new Error("Book authority still unavailable");
      }
      stopBookRecovery(owner, false);
      owner.root.replaceWith(refreshed);
      bind(refreshed);
    }).catch(function (error) {
      if (bookRecoveryCurrent(owner) && request.generation === owner.generation && error.terminal) {
        stopBookRecovery(owner, true);
      }
    }).finally(function () {
      window.clearTimeout(request.timeout);
      if (owner.request === request) owner.request = null;
      if (!bookRecoveryCurrent(owner)) return;
      if (owner.attempts >= bookRecoveryMaxAttempts || Date.now() - owner.started >= bookRecoveryWindow) {
        stopBookRecovery(owner, true);
      } else {
        scheduleBookRecovery(Math.min(15000, 2000 * Math.pow(2, Math.min(owner.attempts, 3))));
      }
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      var owner = bookRecoveryOwner;
      if (owner) {
        window.clearTimeout(owner.timer);
        owner.timer = null;
        owner.generation += 1;
        if (owner.request) owner.request.cancel();
      }
    } else {
      scheduleBookRecovery(0);
    }
  });

  window.addEventListener("pagehide", function () {
    bookRecoveryPageRetired = true;
    stopBookRecovery(bookRecoveryOwner, false);
  });
  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    bookRecoveryPageRetired = false;
    bookRecoveryOwner = null;
    scheduleBookRecovery(2000);
  });
  window.addEventListener("popstate", function () {
    stopBookRecovery(bookRecoveryOwner, false);
    bookRecoveryOwner = null;
    scheduleBookRecovery(2000);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bind(document);
      scheduleBookRecovery(2000);
    });
  } else {
    bind(document);
    scheduleBookRecovery(2000);
  }

  document.addEventListener("htmx:afterSwap", function (event) {
    bind(event.target || document);
    scheduleBookRecovery(2000);
  });
})();
