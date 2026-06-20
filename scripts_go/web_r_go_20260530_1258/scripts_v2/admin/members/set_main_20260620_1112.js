(function () {
  function renderAdminCheck(mount) {
    mount.innerHTML = [
      '<div class="mx-auto max-w-screen-xl px-6 py-8">',
      '<div class="flex w-full flex-col items-center justify-center gap-4 text-center text-slate-500">',
      '<span class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" aria-hidden="true"></span>',
      '<p>관리자 여부를 확인하고 있습니다.</p>',
      "</div>",
      "</div>"
    ].join("");
  }

  function renderAdminStop(mount) {
    mount.innerHTML = [
      '<div class="mx-auto max-w-screen-xl px-6 py-8">',
      '<div class="flex w-full flex-col items-center justify-center gap-4 text-center text-slate-500">',
      "<p>관리자를 위한 메뉴입니다.</p>",
      '<a href="/" class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">첫 화면으로</a>',
      "</div>",
      "</div>"
    ].join("");
  }

  function renderAdminError(mount) {
    mount.innerHTML = [
      '<div class="mx-auto max-w-screen-xl px-6 py-10 text-center text-sm font-medium text-slate-500">',
      "관리자 화면을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      "</div>"
    ].join("");
  }

  function waitForGetMain(attempt) {
    attempt = attempt || 0;
    if (typeof window.get_main === "function") {
      return Promise.resolve(window.get_main);
    }
    if (attempt >= 40) {
      return Promise.reject(new Error("admin members get_main is not registered"));
    }
    return new Promise(function (resolve, reject) {
      window.setTimeout(function () {
        waitForGetMain(attempt + 1).then(resolve, reject);
      }, 25);
    });
  }

  window.set_main = async function set_main() {
    const mount = document.getElementById("div_main");
    if (!mount) return;
    const username = window.gv_username || "";
    if (!username) {
      location.href = "/";
      return;
    }
    renderAdminCheck(mount);
    try {
      const headerData = await fetch("/ajax_get_menu_header/", {
        method: "POST",
        credentials: "same-origin"
      }).then(function (res) {
        return res.json();
      });
      const role = headerData && headerData.role ? headerData.role : "";
      window.gv_role = role;
      if (role !== "관리자") {
        renderAdminStop(mount);
        return;
      }
      const runMembersMain = await waitForGetMain(0);
      await runMembersMain();
    } catch (error) {
      console.error(error);
      renderAdminError(mount);
    }
  };
})();
