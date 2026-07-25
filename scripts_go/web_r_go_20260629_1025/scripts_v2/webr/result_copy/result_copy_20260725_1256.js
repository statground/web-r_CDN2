(function installWebRResultCopy202607251256(window, document) {
  "use strict";

  if (!window || !document || window.__webrResultCopy202607251256) {
    return;
  }
  window.__webrResultCopy202607251256 = true;

  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        if (!document.execCommand("copy")) {
          throw new Error("copy_not_supported");
        }
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
      }
    });
  }

  function tableAsTSV(table) {
    return Array.prototype.map.call(table.querySelectorAll("tr"), function (row) {
      return Array.prototype.map.call(row.querySelectorAll("th,td"), function (cell) {
        return String(cell.textContent || "").replace(/\s+/g, " ").trim();
      }).join("\t");
    }).filter(Boolean).join("\n");
  }

  function serializeSVG(svg) {
    var clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  }

  function svgAsPNGBlob(svg) {
    return new Promise(function (resolve, reject) {
      var source = serializeSVG(svg);
      var blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      var objectURL = URL.createObjectURL(blob);
      var image = new Image();
      image.onload = function () {
        try {
          var box = svg.viewBox && svg.viewBox.baseVal;
          var width = Math.max(1, Math.round((box && box.width) || svg.clientWidth || 640));
          var height = Math.max(1, Math.round((box && box.height) || svg.clientHeight || 440));
          var canvas = document.createElement("canvas");
          canvas.width = width * 2;
          canvas.height = height * 2;
          var context = canvas.getContext("2d");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(function (png) {
            URL.revokeObjectURL(objectURL);
            if (png) {
              resolve(png);
            } else {
              reject(new Error("png_conversion_failed"));
            }
          }, "image/png");
        } catch (error) {
          URL.revokeObjectURL(objectURL);
          reject(error);
        }
      };
      image.onerror = function () {
        URL.revokeObjectURL(objectURL);
        reject(new Error("svg_load_failed"));
      };
      image.src = objectURL;
    });
  }

  function copySVG(svg) {
    if (navigator.clipboard && typeof navigator.clipboard.write === "function" && window.ClipboardItem) {
      return svgAsPNGBlob(svg).then(function (png) {
        var item = {};
        item["image/png"] = png;
        return navigator.clipboard.write([new window.ClipboardItem(item)]);
      }).catch(function () {
        return copyText(serializeSVG(svg));
      });
    }
    return copyText(serializeSVG(svg));
  }

  function announce(button, message, failed) {
    var statusID = button.getAttribute("aria-describedby");
    var status = statusID ? document.getElementById(statusID) : null;
    if (status) {
      status.textContent = message;
      status.dataset.state = failed ? "failed" : "success";
    }
  }

  function recordCopy() {
    if (!window.fetch) {
      return;
    }
    window.fetch("/analytics/product-event/", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "export_clicked",
        tool_code: "roc_sample",
        analysis_type: "roc",
        product_area: "export",
        result_status: "success"
      })
    }).catch(function () {});
  }

  function handleCopy(button) {
    var selector = button.getAttribute("data-webr-copy-target");
    var kind = button.getAttribute("data-webr-copy-kind");
    var target = selector ? document.querySelector(selector) : null;
    if (!target) {
      announce(button, "복사할 결과를 찾지 못했습니다.", true);
      return;
    }

    var operation;
    if (kind === "table" && target.tagName === "TABLE") {
      operation = copyText(tableAsTSV(target));
    } else if (kind === "svg" && target.tagName.toLowerCase() === "svg") {
      operation = copySVG(target);
    } else {
      operation = copyText(String(target.textContent || "").trim());
    }
    operation.then(function () {
      announce(button, kind === "svg" ? "그래프를 복사했습니다." : "결과를 복사했습니다.", false);
      recordCopy();
    }).catch(function () {
      announce(button, "브라우저에서 복사를 허용한 뒤 다시 시도해 주세요.", true);
    });
  }

  function initialize() {
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest("[data-webr-copy-target]");
      if (!button) {
        return;
      }
      event.preventDefault();
      handleCopy(button);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})(window, document);
