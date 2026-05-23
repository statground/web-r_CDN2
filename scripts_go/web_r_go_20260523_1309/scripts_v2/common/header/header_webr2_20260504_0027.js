const h = React.createElement;

const WEBR_CDN = "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/";
const COMMON_CDN = "https://cdn.jsdelivr.net/gh/statground/Common_CDN/";

function currentWebRCDN2Base() {
  const fallback = "https://cdn.jsdelivr.net/gh/statground/web-r_CDN2@9391ee2fceef526234f9c21cb907dc01f3249339/";
  const scriptURL = typeof document !== "undefined" && document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  const match = scriptURL.match(/gh\/statground\/web-r_CDN2@([^/,]+)\//);
  return match ? "https://cdn.jsdelivr.net/gh/statground/web-r_CDN2@" + match[1] + "/" : fallback;
}

const WEBR_CDN2 = currentWebRCDN2Base();

const socialLinks = [
  ["Facebook Group", "https://www.facebook.com/groups/statground", COMMON_CDN + "images/svg/footer_facebook_group.svg"],
  ["Facebook Page", "https://www.facebook.com/Statground", COMMON_CDN + "images/svg/footer_facebook_page.svg"],
  ["Twitter", "https://twitter.com/Statground1", COMMON_CDN + "images/svg/footer_twitter_x.svg"],
  ["Instagram", "https://www.instagram.com/statground/", COMMON_CDN + "images/svg/footer_instagram.svg"],
  ["LinkedIn", "https://www.linkedin.com/company/82371650/", COMMON_CDN + "images/svg/footer_linkedin.svg"],
  ["Threads", "https://www.threads.net/@statground", COMMON_CDN + "images/svg/footer_threads.svg"]
];

const MENU_SECTIONS = {
  webr: {
    title: "Web-R 접속",
    icon: "r-logo",
    image: WEBR_CDN2 + "images/svg/R_logo.svg",
    items: [
      { href: "/webr/", title: "무료 서버 접속", description: "가입 여부와 무관하게 기본 Web-R 서버에 접속합니다.", icon: "r-logo-dark", image: WEBR_CDN2 + "images/svg/R_logo_black.svg" },
      { href: "/webr/member/", title: "정회원 서버 접속", description: "정회원 전용 서버와 분석 환경으로 이동합니다.", icon: "r-logo", image: WEBR_CDN2 + "images/svg/R_logo.svg" },
      { href: "/webr/2.0/", title: "Web-R 2.0", description: "메타분석, ROC, 표본수 계산 등 새 Web-R 앱 모음입니다.", icon: "webr2", image: WEBR_CDN2 + "images/svg/R_Logo_20.svg" },
      { href: "/webr/notebook/", title: "Web-R Notebook", description: "분석 노트북을 만들고 실행하고 공유합니다.", icon: "notebook", image: WEBR_CDN2 + "images/svg/menu_webr_notebook2.svg" }
    ]
  },
  r_ecosystem: {
    title: "R 에코시스템",
    icon: "category",
    image: WEBR_CDN2 + "images/svg/category.svg",
    items: [
      { href: "/r-ecosystem/", title: "소식·글", description: "공식 발표, 블로그·해설, 저널·뉴스레터를 모아 봅니다.", icon: "notice", image: WEBR_CDN2 + "images/svg/menu_notice.svg" },
      { href: "/r-ecosystem/packages/", title: "패키지", description: "CRAN, Bioconductor, R-universe 패키지와 dependency 신호를 탐색합니다.", icon: "package", image: WEBR_CDN2 + "images/svg/R-packages.svg" }
    ]
  },
  community: {
    title: "커뮤니티",
    directHref: "/community/",
    icon: "community",
    image: WEBR_CDN2 + "images/svg/menu_free.svg",
    items: [
      { href: "/community/", title: "Web-R 커뮤니티", description: "Web-R 이용자 게시판과 자유게시판으로 이동합니다.", icon: "community", image: WEBR_CDN2 + "images/svg/menu_free.svg" },
      { href: "/community/r-community/", title: "R 커뮤니티", description: "Reddit, Posit Community, Stack Overflow 등 외부 R 커뮤니티 글을 봅니다.", icon: "category", image: WEBR_CDN2 + "images/svg/category.svg" }
    ]
  },
  book: {
    title: "도서",
    icon: "book",
    image: WEBR_CDN2 + "images/svg/menu_book.svg",
    hub: { href: "/book/", title: "R 도서 허브", description: "R 관련 도서, 번역서와 학습 자료를 한곳에서 탐색합니다.", icon: "book-hub", image: WEBR_CDN2 + "images/svg/menu_book.svg" },
    items: [
      { href: "/book/001/", title: "의학논문 작성을 위한 R통계와 그래프", description: "의학 논문 작성과 R 그래프 실습 자료입니다.", icon: "book", image: WEBR_CDN + "images/book/book_001.jpg" },
      { href: "/book/002/", title: "R을 이용한 조건부과정분석", description: "조건부과정분석 예제와 보조 자료입니다.", icon: "book", image: WEBR_CDN + "images/book/book_002.jpg" },
      { href: "/book/003/", title: "웹에서 클릭만으로 하는 R통계분석", description: "Web-R 기반 통계분석 실습 도서입니다.", icon: "book", image: WEBR_CDN + "images/book/book_003.jpg" },
      { href: "/book/004/", title: "Learning ggplot2 Using Shiny App", description: "ggplot2 학습과 Shiny 예제를 함께 봅니다.", icon: "book", image: WEBR_CDN + "images/book/book_004.jpg" },
      { href: "/book/005/", title: "일반화가법모형 소개", description: "GAM 분석 예제와 설명 자료입니다.", icon: "book", image: WEBR_CDN + "images/book/book_005.jpg" },
      { href: "/book/006/", title: "밑바닥부터 시작하는 ROC 커브 분석", description: "ROC 커브 분석 실습 자료입니다.", icon: "book", image: WEBR_CDN + "images/book/book_006.jpg" },
      { href: "/book/007/", title: "웹R을 이용한 통계분석", description: "웹R 기반 통계분석 예제입니다.", icon: "book", image: WEBR_CDN + "images/book/book_007.jpg" },
      { href: "/book/008/", title: "의료인을 위한 R 생존분석", description: "의료 연구 생존분석 실습 자료입니다.", icon: "book", image: WEBR_CDN + "images/book/book_008.jpg" }
    ]
  },
  workshop: {
    title: "워크샵",
    icon: "workshop",
    image: WEBR_CDN2 + "images/svg/menu_workshop.svg",
    items: [
      { href: "/workshop/youtube/", title: "유튜브", description: "Web-R 공식 영상과 관련 자료를 봅니다.", icon: "youtube", image: WEBR_CDN2 + "images/svg/menu_youtube.svg" },
      { href: "/workshop/", title: "워크샵", description: "워크샵 안내와 강의 자료로 이동합니다.", icon: "workshop", image: WEBR_CDN2 + "images/svg/menu_workshop.svg" }
    ]
  },
  intro: {
    title: "Web-R 소개",
    icon: "intro",
    image: WEBR_CDN2 + "images/svg/menu_notice.svg",
    items: [
      { href: "/intro/notice/", title: "공지사항", description: "서비스 공지와 업데이트 안내를 확인합니다.", icon: "notice", image: WEBR_CDN2 + "images/svg/menu_notice.svg" },
      { href: "/intro/membership/", title: "정회원 가입", description: "정회원과 기관/팀 회원 상품을 확인합니다.", icon: "membership", image: WEBR_CDN2 + "images/svg/menu_membership.svg" },
      { href: "/intro/", title: "회사 소개", description: "Web-R과 통계마당 소개 페이지입니다.", icon: "company", image: WEBR_CDN2 + "images/svg/R_logo_gray.svg" },
      { href: "/intro/terms/", title: "이용 약관", description: "서비스 이용 약관으로 이동합니다.", icon: "terms", image: WEBR_CDN2 + "images/svg/menu_notice.svg" },
      { href: "/intro/privates/", title: "개인정보 보호 방침", description: "개인정보 처리 기준을 확인합니다.", icon: "privacy", image: WEBR_CDN2 + "images/svg/category.svg" },
      { href: "/intro/refund/", title: "환불 규정", description: "환불 및 결제 취소 기준을 확인합니다.", icon: "refund", image: WEBR_CDN2 + "images/svg/menu_membership.svg" }
    ]
  }
};

const MENUS = Object.keys(MENU_SECTIONS);
const MenuState = {
  hamburger: false,
  sections: MENUS.reduce(function(acc, id) {
    acc[id] = false;
    return acc;
  }, {})
};

const CLASS_PC_OPEN = "hidden bg-white border-b border-gray-200 shadow-sm md:block";
const CLASS_MOBILE_OPEN = "flex flex-col space-y-3 border-t border-gray-200 bg-white px-6 py-4 md:hidden";
const CLASS_HIDDEN = "hidden";

function getMenuSection(id) {
  return MENU_SECTIONS[id];
}

function closeAllMenus() {
  MENUS.forEach(function(menu) {
    MenuState.sections[menu] = false;
    const pc = document.getElementById("div_megamenu_" + menu);
    const mobile = document.getElementById("div_menu_mobile_" + menu);
    if (pc) pc.className = CLASS_HIDDEN;
    if (mobile) mobile.className = CLASS_HIDDEN;
  });
}

function click_dropdown(id) {
  if (!id) {
    closeAllMenus();
    return;
  }
  MENUS.forEach(function(menu) {
    const willOpen = id === menu && !MenuState.sections[menu];
    MenuState.sections[menu] = willOpen;
    const pc = document.getElementById("div_megamenu_" + menu);
    const mobile = document.getElementById("div_menu_mobile_" + menu);
    if (pc) pc.className = willOpen ? CLASS_PC_OPEN : CLASS_HIDDEN;
    if (mobile) mobile.className = willOpen ? CLASS_MOBILE_OPEN : CLASS_HIDDEN;
  });
}

function click_hamburger() {
  const menuMobile = document.getElementById("div_menu_mobile");
  MenuState.hamburger = !MenuState.hamburger;
  if (menuMobile) {
    menuMobile.className = MenuState.hamburger
      ? CLASS_MOBILE_OPEN
      : "hidden";
  }
}

function isLoginInterstitialPath(path) {
  return path === "/account/" || path === "/account/signup/" || path === "/account/welcome/" ||
    path === "/account/logout/" || path.indexOf("/account/ajax_") === 0;
}

function currentPageLoginURL() {
  const path = window.location.pathname || "/";
  if (isLoginInterstitialPath(path)) {
    return "/account/";
  }
  return "/account/?next=" + encodeURIComponent(path + window.location.search);
}

function ChevronIcon(props) {
  const className = props && props.className ? props.className : "h-4 w-4";
  return h("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" },
    h("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" })
  );
}

function DownIcon() {
  return h("svg", { className: "ml-1 h-4 w-4", fill: "currentColor", viewBox: "0 0 20 20", "aria-hidden": "true" },
    h("path", { fillRule: "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", clipRule: "evenodd" })
  );
}

function HamburgerIcon() {
  return h("svg", { className: "h-6 w-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" },
    h("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 6h16M4 12h16M4 18h16" })
  );
}

function MenuIcon(props) {
  const icon = props && props.icon ? props.icon : "category";
  const className = props && props.className ? props.className : "h-6 w-6";
  if (icon === "r-logo" || icon === "r-logo-dark") {
    const letterColor = icon === "r-logo-dark" ? "#111827" : "#2563eb";
    return h("svg", { className, viewBox: "0 0 32 32", fill: "none", "aria-hidden": "true" },
      h("ellipse", { cx: "15.5", cy: "16", rx: "13", ry: "8", fill: "#e5e7eb", stroke: "#94a3b8", strokeWidth: "2" }),
      h("text", { x: "11", y: "21", fill: letterColor, fontFamily: "Arial, sans-serif", fontSize: "16", fontWeight: "900" }, "R")
    );
  }
  if (icon === "webr2") {
    return h("svg", { className, viewBox: "0 0 32 32", fill: "none", "aria-hidden": "true" },
      h("rect", { x: "4", y: "5", width: "24", height: "20", rx: "4", fill: "#dbeafe", stroke: "#2563eb", strokeWidth: "2" }),
      h("path", { d: "M9 12h4M9 17h7M19 12h4M20 18l2 2 3-5", stroke: "#1d4ed8", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }),
      h("path", { d: "M10 27h12", stroke: "#2563eb", strokeLinecap: "round", strokeWidth: "2" })
    );
  }
  const base = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "aria-hidden": "true" };
  const stroke = { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" };
  if (icon === "notice" || icon === "intro") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M4 13v-2a2 2 0 012-2h2l8-4v14l-8-4H6a2 2 0 01-2-2z" })),
      h("path", Object.assign({}, stroke, { d: "M18 10a4 4 0 010 4M8 15l1 4" }))
    );
  }
  if (icon === "package") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" })),
      h("path", Object.assign({}, stroke, { d: "M4.5 7.5L12 12l7.5-4.5M12 12v9" }))
    );
  }
  if (icon === "community") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M7 8h10M7 12h6" })),
      h("path", Object.assign({}, stroke, { d: "M5 18l-2 3V5a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5z" }))
    );
  }
  if (icon === "book" || icon === "book-hub") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M5 4h10a4 4 0 014 4v12H9a4 4 0 00-4 4V4z" })),
      h("path", Object.assign({}, stroke, { d: "M5 20h10a4 4 0 014 4M9 8h6M9 12h5" }))
    );
  }
  if (icon === "workshop") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M4 5h16v10H4zM8 21l4-6 4 6M9 9h6" }))
    );
  }
  if (icon === "youtube") {
    return h("svg", base,
      h("rect", { x: "3", y: "6", width: "18", height: "12", rx: "3", stroke: "currentColor", strokeWidth: "2" }),
      h("path", Object.assign({}, stroke, { d: "M10 9.5l5 2.5-5 2.5v-5z" }))
    );
  }
  if (icon === "notebook") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M7 3h9l3 3v15H7a2 2 0 01-2-2V5a2 2 0 012-2z" })),
      h("path", Object.assign({}, stroke, { d: "M15 3v4h4M8 11h8M8 15h6" }))
    );
  }
  if (icon === "membership") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M12 3l2.7 5.5 6.1.9-4.4 4.2 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.2 6.1-.9L12 3z" }))
    );
  }
  if (icon === "company") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M4 21h16M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16M9 8h2M13 8h2M9 12h2M13 12h2M10 21v-4h4v4" }))
    );
  }
  if (icon === "terms") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2z" })),
      h("path", Object.assign({}, stroke, { d: "M14 3v6h5M8 13h8M8 17h6" }))
    );
  }
  if (icon === "privacy") {
    return h("svg", base,
      h("path", Object.assign({}, stroke, { d: "M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4z" })),
      h("path", Object.assign({}, stroke, { d: "M9 12l2 2 4-5" }))
    );
  }
  if (icon === "refund") {
    return h("svg", base,
      h("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "2" }),
      h("path", Object.assign({}, stroke, { d: "M3 10h18M8 15h4M17 14l-2 2 2 2" }))
    );
  }
  return h("svg", base,
    h("path", Object.assign({}, stroke, { d: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" }))
  );
}

function iconToneClass(icon) {
  const tones = {
    "r-logo": "text-blue-600",
    "r-logo-dark": "text-gray-950",
    webr2: "text-sky-600",
    notebook: "text-amber-500",
    package: "text-emerald-600",
    community: "text-amber-600",
    book: "text-sky-600",
    "book-hub": "text-blue-600",
    workshop: "text-orange-500",
    youtube: "text-red-600",
    membership: "text-amber-600",
    privacy: "text-indigo-600",
    refund: "text-emerald-600",
    company: "text-slate-600",
    terms: "text-slate-600",
    notice: "text-blue-600",
    intro: "text-blue-600",
    category: "text-slate-500"
  };
  return tones[icon] || "text-slate-500";
}

function MenuIconBadge(props) {
  const icon = props.icon || "category";
  const className = props.className || "h-6 w-6";
  return h("span", { className: "inline-flex shrink-0 items-center justify-center " + iconToneClass(icon) },
    h(MenuIcon, { icon, className })
  );
}

function MenuImageIcon(props) {
  const icon = props.icon || "category";
  const image = props.image || "";
  const className = props.className || "h-6 w-6";
  const imageClassName = props.imageClassName || className + " shrink-0 object-contain";
  const fallbackClassName = (image ? "hidden " : "flex ") + "shrink-0 items-center justify-center " + iconToneClass(icon);
  return h("span", { className: "inline-flex shrink-0 items-center justify-center" },
    image ? h("img", {
      src: image,
      className: imageClassName,
      alt: "",
      onError: function(event) {
        event.currentTarget.style.display = "none";
        const fallback = event.currentTarget.parentNode ? event.currentTarget.parentNode.querySelector("[data-menu-icon-fallback='true']") : null;
        if (fallback) {
          fallback.classList.remove("hidden");
          fallback.classList.add("flex");
        }
      }
    }) : null,
    h("span", { "data-menu-icon-fallback": "true", className: fallbackClassName },
      h(MenuIcon, { icon, className })
    )
  );
}

function UserCircleIcon() {
  return h("svg", { className: "h-4 w-4 text-gray-500 transition group-hover:text-blue-700 group-focus-visible:text-blue-700", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" },
    h("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" }),
    h("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4.5 20.25a7.5 7.5 0 0115 0" })
  );
}

function UtilityLink(props) {
  return h("a", {
    href: props.href,
    target: props.target || undefined,
    rel: props.target ? "noopener noreferrer" : undefined,
    title: props.title || undefined,
    "aria-label": props["aria-label"] || undefined,
    className: props.className || "inline-flex min-h-[32px] items-center whitespace-nowrap px-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:underline"
  }, props.children);
}

function SocialIcon(props) {
  return h("a", {
    href: props.url,
    title: props.name,
    "aria-label": props.name,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-blue-700"
  }, h("img", { src: props.icon, className: "h-4 w-4", alt: "" }));
}

function MembershipPromptBubble() {
  return h("span", { className: "relative ml-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold leading-4 text-amber-800 shadow-sm" },
    h("span", { className: "absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-amber-200 bg-amber-100", "aria-hidden": "true" }),
    h("span", { className: "relative" }, "정회원 가입")
  );
}

function AccountLinks(props) {
  const data = props.data || {};
  const name = data.name || window.gv_username || "";
  const role = data.role || window.gv_role || "";
  const isLoggedIn = name !== "";
  if (!isLoggedIn) {
    return h("div", { className: "flex flex-row flex-wrap items-center gap-1" },
      h(UtilityLink, { href: currentPageLoginURL(), className: "inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50" }, "로그인"),
      h("span", { className: "h-5 w-px bg-gray-200", "aria-hidden": "true" }),
      h(UtilityLink, { href: "/account/signup/", className: "inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-700" }, "회원 가입")
    );
  }
  const teamMenu = data.team_menu || data.teamMenu || null;
  const showTeamMenu = teamMenu && teamMenu.visible !== false && teamMenu.href;
  return h("div", { className: "flex flex-row flex-wrap items-center gap-1" },
    h(UtilityLink, {
      href: "/account/myinfo/profile/",
      title: "내 정보 수정",
      "aria-label": name + " 내 정보 수정",
      className: "group relative inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    },
      h(UserCircleIcon),
      h("span", null, name),
      h("span", { className: "pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-950 px-2 py-1 text-xs font-semibold text-white shadow-lg group-hover:block group-focus-within:block" }, "내 정보 수정")),
    role ? h(UtilityLink, {
      href: "/intro/membership/",
      title: role === "준회원" ? "정회원 가입 안내" : undefined,
      className: `inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-semibold ${role === "준회원" ? "text-amber-700 hover:bg-amber-50" : "text-blue-700 hover:bg-blue-50"}`
    }, role, role === "준회원" ? h(MembershipPromptBubble) : null) : null,
    showTeamMenu ? h(UtilityLink, { href: teamMenu.href, className: "inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50" }, teamMenu.label || "팀 관리") : null,
    role === "관리자" ? h(UtilityLink, { href: "/admin/", className: "inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-700" }, "Admin Page") : null,
    h("span", { className: "h-5 w-px bg-gray-200", "aria-hidden": "true" }),
    h(UtilityLink, { href: "/account/logout/", className: "inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-700" }, "로그아웃")
  );
}

function AccountBar(props) {
  const data = props.data || {};
  return h("div", { className: "flex w-full flex-row flex-wrap items-center justify-start gap-2 text-sm md:justify-end" },
    h(AccountLinks, { data })
  );
}

function ExternalBar() {
  return h("div", { className: "flex w-full flex-row flex-wrap items-center justify-end gap-2 text-sm" },
    h(UtilityLink, { href: "https://www.statground.net", target: "_blank" }, "통계마당"),
    h(UtilityLink, { href: "https://cafe.daum.net/biometrika", target: "_blank" }, "Biometrika"),
    h("span", { className: "mx-1 h-5 w-px bg-gray-200", "aria-hidden": "true" }),
    h("div", { className: "flex flex-row flex-wrap items-center gap-1" },
      socialLinks.map(function(item) {
        return h(SocialIcon, { key: item[0], name: item[0], url: item[1], icon: item[2] });
      })
    )
  );
}

async function get_menu_header() {
  const mount = document.getElementById("div_menu_sub_header");
  if (!mount) return;
  const data = await fetch("/ajax_get_menu_header/", { method: "POST", credentials: "same-origin" })
    .then(function(res) { return res.json(); })
    .catch(function() { return { role: "", name: "" }; });
  window.gv_role = data.role || "";
  ReactDOM.render(h(AccountBar, { data }), mount);
}

function splitColumns(items, count) {
  const columns = Array.from({ length: count }, function() { return []; });
  items.forEach(function(item, index) {
    columns[index % count].push(item);
  });
  return columns;
}

function MenuTitleStrip(props) {
  return h("div", { className: "flex flex-row items-center justify-center border-b border-gray-300 bg-gray-100 py-1 shadow-sm" },
    h("p", { className: "text-xs text-gray-700" }, props.title)
  );
}

function MenuArtwork(props) {
  const item = props.item || {};
  const icon = item.icon || "category";
  const imageClassName = props.imageClassName || "h-20 w-32 max-w-full object-scale-down";
  const iconClassName = props.iconClassName || "h-12 w-12";
  const fallbackClassName = (item.image ? "hidden " : "flex ") + "items-center justify-center";
  return h("span", { className: props.className || "mb-2 flex h-20 w-32 items-center justify-center" },
    item.image ? h("img", {
      src: item.image,
      className: imageClassName,
      alt: "",
      onError: function(event) {
        event.currentTarget.style.display = "none";
        const fallback = event.currentTarget.parentNode ? event.currentTarget.parentNode.querySelector("[data-menu-icon-fallback='true']") : null;
        if (fallback) {
          fallback.classList.remove("hidden");
          fallback.classList.add("flex");
        }
      }
    }) : null,
    h("span", { "data-menu-icon-fallback": "true", className: fallbackClassName },
      h(MenuIconBadge, { icon, className: iconClassName })
    )
  );
}

function ImageTile(props) {
  const item = props.item;
  return h("li", { className: "flex w-full" },
    h("a", {
      href: item.href,
      className: "flex min-h-[150px] w-full flex-col items-center justify-center rounded-lg px-4 py-3 text-center text-sm font-medium text-gray-700 hover:border hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
    },
      h(MenuArtwork, { item }),
      h("span", null, item.title)
    )
  );
}

function MegaFeaturePanel(props) {
  const hub = props.section.hub;
  if (!hub) return null;
  return h("aside", { className: "border-t border-gray-200 p-3 md:border-t-0" },
    h(MenuImageIcon, { icon: hub.icon, image: hub.image, className: "mb-2 h-8 w-8", imageClassName: "mb-2 h-8 w-8 object-contain" }),
    h("h3", { className: "mb-2 text-base font-semibold text-gray-900" }, hub.title),
    h("p", { className: "mb-3 text-sm leading-6 text-gray-500" }, hub.description),
    h("a", {
      href: hub.href,
      className: "inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
    }, "바로가기 →")
  );
}

function ImageMegaMenu(props) {
  const section = getMenuSection(props.id);
  const hasFeature = !!section.hub;
  const columns = splitColumns(section.items, props.id === "workshop" ? 2 : hasFeature ? 3 : 4);
  const gridClass = props.id === "workshop"
    ? "mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 py-4 text-sm text-gray-600 md:grid-cols-2 md:px-10"
    : "mx-auto grid max-w-screen-xl grid-cols-1 gap-6 px-6 py-4 text-sm text-gray-600 md:grid-cols-4 md:px-4";
  return h("nav", { id: "div_megamenu_" + props.id, className: "hidden", "aria-label": section.title + " 하위 메뉴" },
    h("div", { className: gridClass },
      columns.map(function(column, index) {
        return h("ul", { key: props.id + "-image-col-" + index, className: "space-y-3" },
          column.map(function(item) {
            return h(ImageTile, { key: item.href, item });
          })
        );
      }),
      hasFeature ? h(MegaFeaturePanel, { section }) : null
    ),
    h(MenuTitleStrip, { title: section.title })
  );
}

function LegacyIntroMenu() {
  const section = getMenuSection("intro");
  const notice = section.items[0];
  const membership = section.items[1];
  const policyLinks = section.items.slice(3);
  function TextLink(props) {
    return h("li", { className: "flex w-full justify-center" },
      h("a", {
        href: props.item.href,
        className: "w-full px-4 py-2 text-center text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
      }, props.item.title)
    );
  }
  return h("nav", { id: "div_megamenu_intro", className: "hidden", "aria-label": "Web-R 소개 하위 메뉴" },
    h("div", { className: "mx-auto grid max-w-screen-xl grid-cols-1 gap-6 px-6 py-4 text-sm text-gray-600 md:grid-cols-3 md:px-4" },
      h("ul", { className: "space-y-3" }, h(ImageTile, { item: notice })),
      h("ul", { className: "space-y-3" }, h(ImageTile, { item: membership })),
      h("ul", { className: "flex flex-col items-center py-4" }, policyLinks.map(function(item) {
        return h(TextLink, { key: item.href, item });
      }))
    ),
    h(MenuTitleStrip, { title: "Web-R 소개" })
  );
}

function MegaItem(props) {
  const item = props.item;
  return h("li", null,
    h("a", {
      href: item.href,
      className: "flex min-h-[92px] gap-3 rounded-lg p-3 text-gray-900 hover:bg-gray-50 hover:text-blue-700"
    },
      h(MenuImageIcon, { icon: item.icon, image: item.image, className: "mt-0.5 h-7 w-7", imageClassName: "mt-0.5 h-7 w-7 rounded object-contain" }),
      h("span", { className: "min-w-0" },
        h("span", { className: "block text-base font-semibold leading-6" }, item.title),
        h("span", { className: "mt-1 block text-sm font-normal leading-6 text-gray-500" }, item.description)
      )
    )
  );
}

function MegaMenu(props) {
  if ((getMenuSection(props.id) || {}).directHref) {
    return null;
  }
  if (props.id === "webr" || props.id === "book" || props.id === "workshop") {
    return h(ImageMegaMenu, { id: props.id });
  }
  if (props.id === "intro") {
    return h(LegacyIntroMenu, null);
  }
  const section = getMenuSection(props.id);
  const hasHub = !!section.hub;
  const columnCount = hasHub ? 3 : Math.min(3, Math.max(1, section.items.length));
  const columns = splitColumns(section.items, columnCount);
  let gridClass = "mx-auto grid max-w-screen-xl grid-cols-1 gap-6 px-6 py-7 text-gray-900 md:grid-cols-4 md:px-4";
  if (!hasHub && columnCount === 2) {
    gridClass = "mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 py-7 text-gray-900 md:grid-cols-2 md:px-4";
  } else if (!hasHub) {
    gridClass = "mx-auto grid max-w-screen-lg grid-cols-1 gap-6 px-6 py-7 text-gray-900 md:grid-cols-3 md:px-4";
  }
  return h("nav", { id: "div_megamenu_" + props.id, className: "hidden", "aria-label": section.title + " 하위 메뉴" },
    h("div", { className: gridClass },
      columns.map(function(column, index) {
        return h("ul", { key: props.id + "-col-" + index, className: "space-y-1" },
          column.map(function(item) {
            return h(MegaItem, { key: item.href, item });
          })
        );
      }),
      hasHub ? h(MegaFeaturePanel, { section }) : null
    )
  );
}

function DesktopNavItem(props) {
  const section = getMenuSection(props.id);
  if (section.directHref) {
    return h("a", {
      href: section.directHref,
      className: "inline-flex items-center whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900 hover:text-blue-700"
    }, section.title);
  }
  return h("span", {
    className: "inline-flex cursor-pointer items-center whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900 hover:text-blue-700",
    onClick: function() { click_dropdown(props.id); },
    role: "button",
    tabIndex: "0",
    onKeyDown: function(event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        click_dropdown(props.id);
      }
    }
  }, section.title, h(DownIcon, null));
}

function MobileMenuItem(props) {
  const section = getMenuSection(props.id);
  if (section.directHref) {
    return h("a", {
      href: section.directHref,
      className: "flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold text-gray-900 hover:bg-blue-50"
    },
      h("span", { className: "inline-flex items-center gap-2" },
        h(MenuImageIcon, { icon: section.icon, image: section.image, className: "h-5 w-5" }),
        section.title
      )
    );
  }
  const [open, setOpen] = React.useState(false);
  const hub = section.hub || null;
  return h("div", { className: "w-full" },
    h("button", {
      type: "button",
      className: "flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold text-gray-900 hover:bg-blue-50",
      "aria-expanded": open ? "true" : "false",
      "aria-controls": "div_menu_mobile_" + props.id,
      onClick: function() { setOpen(!open); }
    },
      h("span", { className: "inline-flex items-center gap-2" },
        h(MenuImageIcon, { icon: section.icon, image: section.image, className: "h-5 w-5" }),
        section.title
      ),
      h(DownIcon, null)
    ),
    h("div", { id: "div_menu_mobile_" + props.id, className: open ? "block" : "hidden" },
      h("div", { className: "space-y-1 px-5 pb-2" },
        hub ? h("a", {
          href: hub.href,
          className: "mb-2 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        },
          h(MenuImageIcon, { icon: hub.icon, image: hub.image, className: "mt-0.5 h-7 w-7", imageClassName: "mt-0.5 h-7 w-7 object-contain" }),
          h("span", { className: "min-w-0" },
            h("span", { className: "block font-bold text-slate-950" }, hub.title),
            hub.description ? h("span", { className: "mt-1 block text-xs leading-5 text-slate-500" }, hub.description) : null
          )
        ) : null,
        section.items.map(function(item) {
          return h("a", {
            key: item.href,
            href: item.href,
            className: "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-700"
          },
            h(MenuImageIcon, { icon: item.icon, image: item.image, className: "h-6 w-6", imageClassName: "h-6 w-6 rounded object-contain" }),
            h("span", { className: "min-w-0" }, item.title)
          );
        })
      )
    )
  );
}

function Div_menu() {
  return h("header", { className: "webr-flowbite-header bg-white text-gray-900 shadow-md" },
    h("nav", { className: "border-b border-gray-200 bg-white" },
      h("div", { className: "mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6" },
        h("a", { href: "/", className: "flex items-center" },
          h("img", { src: WEBR_CDN + "images/logo/logo.png", className: "mr-3 h-10 object-scale-down", alt: "Statground Logo" })
        ),
        h("div", { id: "div_menu_external_header", className: "hidden min-w-0 flex-1 justify-end md:flex" },
          h(ExternalBar, null)
        ),
        h("button", {
          type: "button",
          className: "inline-flex rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden",
          "aria-label": "Open main menu",
          "aria-controls": "div_menu_mobile",
          "aria-expanded": MenuState.hamburger ? "true" : "false",
          onClick: click_hamburger
        }, h(HamburgerIcon, null))
      )
    ),
    h("nav", { className: "border-b border-gray-200 bg-white" },
      h("div", { className: "mx-auto flex max-w-screen-xl flex-col items-stretch gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-8 md:px-6 md:py-4" },
        h("div", { className: "hidden flex-row flex-wrap items-center gap-7 md:flex" },
          MENUS.map(function(id) {
            return h(DesktopNavItem, { key: id, id });
          })
        ),
        h("div", { id: "div_menu_sub_header", className: "flex min-w-0 justify-start md:min-w-[280px] md:flex-1 md:justify-end" },
          h(AccountBar, { data: { name: window.gv_username || "", role: window.gv_role || "" } })
        )
      ),
      h("div", { id: "div_menu_mobile", className: "hidden" },
        MENUS.map(function(id) {
          return h(MobileMenuItem, { key: "mobile-" + id, id });
        }),
        h("div", { className: "block border-t border-gray-200 px-3 pt-3 md:hidden" },
          h(ExternalBar, null)
        )
      )
    ),
    MENUS.map(function(id) {
      return h(MegaMenu, { key: "mega-" + id, id });
    })
  );
}

window.WebRMenu = {
  Div_menu,
  get_menu_header,
  click_dropdown
};
