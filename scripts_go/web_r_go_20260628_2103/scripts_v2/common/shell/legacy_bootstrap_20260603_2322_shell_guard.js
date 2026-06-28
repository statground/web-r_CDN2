(function() {
  function shouldCallSetMain() {
    const context = window.__webr_legacy_context__ || {};
    return !!context.call_set_main;
  }

  function callSafely(label, fn) {
    try {
      return fn();
    } catch (err) {
      console.error("legacy shell " + label + " failed", err);
      return null;
    }
  }

  function renderShellOnce() {
    if (window.__webr_legacy_shell_rendered__) {
      return;
    }

    const menu = document.getElementById("div_menu");
    if (menu && typeof Div_menu === "function") {
      callSafely("menu render", function() {
        ReactDOM.render(React.createElement(Div_menu), menu);
      });
    }

    if (typeof data_footer === "object" && data_footer !== null) {
      data_footer.administrator = "Web-R \uC6B4\uC601\uC790: \uBB38\uAC74\uC6C5";
    }

    const footer = document.getElementById("div_footer");
    if (footer && typeof set_footer === "function") {
      callSafely("footer render", function() {
        set_footer();
      });
    }

    if (typeof get_menu_header === "function") {
      callSafely("account header render", function() {
        const result = get_menu_header();
        if (result && typeof result.catch === "function") {
          result.catch(function(err) {
            console.error("legacy shell account header failed", err);
          });
        }
      });
    }

    window.__webr_legacy_shell_rendered__ = true;
  }

  function hasAnyShellRenderer() {
    return typeof Div_menu === "function" ||
      typeof set_footer === "function" ||
      typeof get_menu_header === "function";
  }

  function boot(attempt) {
    const needsShell = document.getElementById("div_menu") || document.getElementById("div_footer");
    if (needsShell && !hasAnyShellRenderer() && attempt <= 200) {
      window.setTimeout(function() {
        boot(attempt + 1);
      }, 25);
      return;
    }
    if (needsShell && !hasAnyShellRenderer()) {
      console.error("legacy shell bootstrap timeout");
    }

    renderShellOnce();

    if (shouldCallSetMain() && typeof set_main !== "function") {
      if (attempt > 200) {
        console.error("legacy set_main bootstrap timeout");
        return;
      }
      window.setTimeout(function() {
        boot(attempt + 1);
      }, 25);
      return;
    }
    if (shouldCallSetMain() && !window.__webr_set_main_called__) {
      window.__webr_set_main_called__ = true;
      callSafely("set_main", function() {
        set_main();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      boot(0);
    });
  } else {
    boot(0);
  }
})();
