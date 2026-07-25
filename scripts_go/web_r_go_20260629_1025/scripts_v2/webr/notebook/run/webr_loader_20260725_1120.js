(function () {
  "use strict";

  if (window.__webrRuntimeLoader202607251120Installed) {
    return;
  }
  window.__webrRuntimeLoader202607251120Installed = true;

  var runtimePromise = null;
  var moduleURL = "https://webr.r-wasm.org/v0.4.3/webr.mjs";

  function timeoutAfter(timeoutMs) {
    return new Promise(function (_, reject) {
      window.setTimeout(function () {
        reject(new Error("WEBR_MODULE_TIMEOUT"));
      }, timeoutMs);
    });
  }

  window.__webrLoadRuntime = function (options) {
    options = options || {};
    var timeoutMs = Math.max(5000, Number(options.timeoutMs) || 45000);
    var onStage = typeof options.onStage === "function" ? options.onStage : function () {};

    if (window.WebR) {
      onStage("module_ready");
      return Promise.resolve(window.WebR);
    }
    if (runtimePromise) return runtimePromise;

    onStage("module_loading");
    runtimePromise = Promise.race([
      import(moduleURL),
      timeoutAfter(timeoutMs)
    ]).then(function (module) {
      if (!module || typeof module.WebR !== "function") {
        throw new Error("WEBR_MODULE_INVALID");
      }
      window.WebR = module.WebR;
      onStage("module_ready");
      return module.WebR;
    }).catch(function (error) {
      runtimePromise = null;
      onStage("module_failed");
      throw error;
    });
    return runtimePromise;
  };

  window.__webrResetRuntimeLoader = function () {
    runtimePromise = null;
  };
})();
