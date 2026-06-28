(function() {
  const h = React.createElement;
  const commonAssetRoot = "https://cdn.jsdelivr.net/gh/statground/Common_CDN@84fbbb6c8633af05c3f0b8a63e470782817ffff9/images/";
  const memberAssetRoot = commonAssetRoot + "member/";
  const partnershipAssetRoot = commonAssetRoot + "partnership/";
  const clientAssetRoot = commonAssetRoot + "client/";
  const people = [
    { name: "Jae-seong Yoo", role: "CEO", image: memberAssetRoot + "JaeseongYoo.jpg", url: "https://www.facebook.com/JSYoo86" },
    { name: "Jae-kwang Kim", role: "Technical Advisor", image: memberAssetRoot + "JaekwangKim.jpg", url: "https://www.facebook.com/profile.php?id=100013068106711" },
    { name: "Seung-sik Hwang", role: "Admin. of Community", image: memberAssetRoot + "SeungsikHwang.jpg", url: "https://www.facebook.com/seungsik.hwang" },
    { name: "Keon-Woong Moon", role: "Admin. of Web-R", image: memberAssetRoot + "KeonwoongMoon.jpg", url: "https://www.facebook.com/cardiomoon" }
  ];
  const partnerships = [
    { name: "(주)KB국민카드", image: partnershipAssetRoot + "kbkookmincard.jpg", url: "https://card.kbcard.com/" },
    { name: "슬기로운 통계생활", image: partnershipAssetRoot + "statisticsplaybook.jpg", url: "https://statisticsplaybook.com/" },
    { name: "(주)인사이트마이닝", image: partnershipAssetRoot + "insightmining.jpg", url: "http://insightmining.co.kr/" },
    { name: "(사)AI프렌즈학회", image: partnershipAssetRoot + "aifrenz.jpg", url: "https://aifrenz.notion.site/" },
    { name: "Korean International Statistical Society", image: partnershipAssetRoot + "kiss.jpg", url: "https://statkiss.org/" },
    { name: "Korea Startup Forum", image: partnershipAssetRoot + "koreastartupforum.jpg", url: "https://kstartupforum.org/" },
    { name: "경북대학교 컴퓨터학부", image: partnershipAssetRoot + "knuit.jpg", url: "https://computer.knu.ac.kr/" },
    { name: "세종과학예술영재학교", image: partnershipAssetRoot + "sasa.jpg", url: "https://sasa.sjeduhs.kr/" },
    { name: "소셜러스(주)", image: partnershipAssetRoot + "socialerus.jpg", url: "https://socialerus.com/" }
  ];
  const clients = [
    { name: "(주)바이풀디자인", image: clientAssetRoot + "by_fulldesign.jpg" },
    { name: "한국환경연구원", image: clientAssetRoot + "kei.jpg" },
    { name: "고려대학교", image: clientAssetRoot + "koreauniv.jpg" },
    { name: "성신여자대학교", image: clientAssetRoot + "sungshinuniv.jpg" },
    { name: "단국대학교천안캠퍼스", image: clientAssetRoot + "dankookuniv.jpg" },
    { name: "한국에너지기술연구원", image: clientAssetRoot + "kier.jpg" },
    { name: "충북대학교", image: clientAssetRoot + "chungbukuniv.jpg" },
    { name: "양산부산대학교병원", image: clientAssetRoot + "pnuyangsan.jpg" },
    { name: "전남대학교병원", image: clientAssetRoot + "chonnamunivhospital.jpg" },
    { name: "나무인텔리전스(주)", image: clientAssetRoot + "namu.jpg" },
    { name: "서울특별시 광역치매센터", image: clientAssetRoot + "seoulnid.jpg" },
    { name: "서울아산병원", image: clientAssetRoot + "asan.jpg" },
    { name: "조선대학교", image: clientAssetRoot + "chosun2.jpg" },
    { name: "(주)LG CNS", image: clientAssetRoot + "LGCNS.jpg" },
    { name: "(주)이랜서", image: clientAssetRoot + "elancer.jpg" },
    { name: "(주)매크로비전", image: clientAssetRoot + "macrovision.jpg" },
    { name: "JK통계컨설팅", image: clientAssetRoot + "jk.jpg" },
    { name: "(주)DS이노베이션", image: clientAssetRoot + "dsinnovation.jpg" },
    { name: "광주과학고등학교", image: clientAssetRoot + "gwangjuscienceacademy.jpg" },
    { name: "한국원자력의학원", image: clientAssetRoot + "kirams.jpg" },
    { name: "인천과학예술영재학교", image: clientAssetRoot + "icehs.jpg" },
    { name: "삼성전자(주)", image: clientAssetRoot + "samsungelec.jpg" },
    { name: "디티에쓰아이(주)", image: clientAssetRoot + "dtsi.jpg" },
    { name: "(주)타임게이트", image: clientAssetRoot + "timegate.jpg" },
    { name: "(주)일도씨", image: clientAssetRoot + "1dossi.jpg" },
    { name: "부산대학교", image: clientAssetRoot + "pusanuniv.jpg" },
    { name: "(주)씨인플러스", image: clientAssetRoot + "CInPlus.jpg" },
    { name: "(주)이마트", image: clientAssetRoot + "emart.jpg" }
  ];
  function shuffleItems(items) {
    const shuffled = items.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const current = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = current;
    }
    return shuffled;
  }
  const logoRailItems = shuffleItems(partnerships.concat(clients));
  const scrollingLogoItems = logoRailItems.concat(logoRailItems);
  const storyBlocks = [
    {
      title: "2013년 4월, 통계마당은 커뮤니티로 시작했습니다.",
      body: [
        "IT 분야에서는 다양한 커뮤니티가 새로운 기술과 도구의 확산을 이끌어 왔습니다. 통계와 데이터 분야에도 지식을 묻고 답하며 함께 성장할 수 있는 공간이 필요했습니다.",
        "통계마당은 그런 필요에서 출발했습니다. 통계와 데이터를 공부하거나 현장에서 활용하는 사람들이 자료, 코드, 경험을 나누는 커뮤니티로 시작했고, 지금도 그 흐름을 중요한 기반으로 유지하고 있습니다."
      ]
    },
    {
      title: "커뮤니티를 오래 지속하기 위해 더 넓은 구조가 필요했습니다.",
      body: [
        "통계 관련 커뮤니티는 포털 카페, 게시판, SNS 그룹의 변화에 따라 흩어지거나 활동량이 줄어드는 일을 반복해 왔습니다. 통계마당 역시 여러 변화를 겪었지만, 한국의 통계 관련 커뮤니티 중 가장 많은 멤버가 모인 공간으로 성장했습니다.",
        "그 과정에서 커뮤니티가 단순한 소통 창구를 넘어 정보가 순환되고 새로운 시도가 이어지는 기반이 되려면, 지속 가능한 운영 구조와 더 넓은 서비스가 필요하다는 것을 확인했습니다."
      ]
    },
    {
      title: "2021년 12월, 커뮤니티는 회사의 형태로 확장되었습니다.",
      body: [
        "통계마당은 2021년 12월 주식회사 통계마당으로 전환했습니다. 이는 기존 커뮤니티를 대체하기 위한 변화가 아니라, 커뮤니티를 더 오래 유지하고 통계·데이터 생태계에 필요한 서비스를 꾸준히 만들기 위한 선택이었습니다.",
        "현재 통계마당은 커뮤니티 운영을 이어가면서 교육, 분석, Web-R, 데이터 기반 콘텐츠와 도구 등 통계와 데이터에 관련된 여러 서비스를 개발하고 있습니다.",
        "앞으로도 통계와 데이터에 관심 있는 사람들이 서로 배우고, 실제 문제를 해결하고, 더 나은 도구를 함께 만들어 갈 수 있는 장을 넓혀 가겠습니다."
      ]
    }
  ];
  function ensureLogoRailStyles() {
    if (document.getElementById("webr-intro-logo-rail-style")) return;
    const style = document.createElement("style");
    style.id = "webr-intro-logo-rail-style";
    style.textContent = [
      "@keyframes webrIntroLogoRail {",
      "  from { transform: translate3d(0, 0, 0); }",
      "  to { transform: translate3d(-50%, 0, 0); }",
      "}",
      ".webr-intro-logo-rail {",
      "  overflow: hidden;",
      "  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);",
      "  mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);",
      "}",
      ".webr-intro-logo-rail-track {",
      "  display: flex;",
      "  width: max-content;",
      "  gap: 1rem;",
      "  animation: webrIntroLogoRail 130s linear infinite;",
      "  will-change: transform;",
      "}",
      ".webr-intro-logo-rail:hover .webr-intro-logo-rail-track {",
      "  animation-play-state: paused;",
      "}",
      "@media (prefers-reduced-motion: reduce) {",
      "  .webr-intro-logo-rail {",
      "    overflow-x: auto;",
      "    -webkit-mask-image: none;",
      "    mask-image: none;",
      "  }",
      "  .webr-intro-logo-rail-track {",
      "    animation: none;",
      "  }",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function SectionHeader(props) {
    return h("div", { className: "mx-auto max-w-3xl text-center" }, h("p", { className: "text-sm font-semibold uppercase tracking-wide text-sky-700" }, props.kicker), h("h2", { className: "mt-2 text-3xl font-extrabold text-gray-950 md:text-4xl" }, props.title), props.description ? h("p", { className: "mt-4 text-base leading-7 text-gray-600 md:text-lg" }, props.description) : null);
  }
  function PersonCard(props) {
    const person = props.person;
    return h("a", { href: person.url, target: "_blank", rel: "noreferrer", className: "group flex min-h-[260px] flex-col items-center justify-start rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md" }, h("img", { src: person.image, alt: person.name, className: "h-32 w-32 rounded-full object-cover ring-4 ring-gray-100 group-hover:ring-sky-100" }), h("h3", { className: "mt-5 text-xl font-bold text-gray-950" }, person.name), h("p", { className: "mt-2 text-sm font-medium text-gray-500" }, person.role));
  }
  function StorySection() {
    return h("section", { className: "border-t border-gray-200 bg-white px-5 py-16 md:px-8 md:py-20" }, h("div", { className: "mx-auto max-w-5xl" }, h(SectionHeader, { kicker: "Story", title: "통계마당의 스토리", description: "2013년 4월의 커뮤니티에서 시작해, 지금의 통계·데이터 서비스 회사로 확장되어 온 이야기입니다." }), h("div", { className: "mt-12 space-y-8" }, storyBlocks.map((block) => h("article", { key: block.title, className: "rounded-lg border border-gray-200 bg-gray-50 p-6 md:p-8" }, h("h3", { className: "text-xl font-bold leading-8 text-gray-950 md:text-2xl" }, block.title), h("div", { className: "mt-5 space-y-4 text-base leading-8 text-gray-700" }, block.body.map((paragraph) => h("p", { key: paragraph }, paragraph))))))));
  }
  function PeopleSection() {
    return h("section", { className: "bg-white px-5 py-16 md:px-8 md:py-20" }, h("div", { className: "mx-auto max-w-6xl" }, h(SectionHeader, { kicker: "People", title: "만든 사람들", description: "통계마당과 Web-R의 시작을 함께 만든 사람들입니다." }), h("div", { className: "mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" }, people.map((person) => h(PersonCard, { key: "people-" + person.name, person })))));
  }
  function LogoRailCard(props) {
    const item = props.item;
    const content = h("div", { className: "flex h-32 w-44 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-center shadow-sm transition hover:border-sky-300 hover:shadow-md md:w-48", title: item.name }, h("div", { className: "flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-gray-50" }, item.image ? h("img", { src: item.image, alt: item.name, className: "max-h-16 w-full object-contain" }) : h("span", { className: "text-base font-extrabold text-gray-800" }, item.name)), h("span", { className: "mt-3 max-w-full truncate text-xs font-bold leading-5 text-gray-700" }, item.name));
    if (item.url) {
      return h("a", { href: item.url, target: "_blank", rel: "noreferrer", className: "block shrink-0" }, content);
    }
    return h("div", { className: "shrink-0" }, content);
  }
  function LogoRailSection() {
    return h("section", { className: "border-t border-gray-200 bg-gray-50 px-5 py-16 md:px-8 md:py-20" }, h("div", { className: "mx-auto max-w-7xl" }, h(SectionHeader, { kicker: "Network", title: "함께한 파트너와 클라이언트", description: "통계마당의 교육, 분석, 플랫폼 경험이 닿았던 기업과 기관입니다." }), h("div", { className: "webr-intro-logo-rail mt-10" }, h("div", { className: "webr-intro-logo-rail-track py-2", "aria-label": "파트너와 클라이언트 로고" }, scrollingLogoItems.map((item, index) => h(LogoRailCard, { key: "logo-rail-" + index + "-" + item.name, item }))))));
  }
  function Div_main() {
    return h("main", { className: "w-full bg-white text-gray-950" }, h("section", { className: "px-5 pt-14 pb-12 md:px-8 md:pt-20" }, h("div", { className: "mx-auto max-w-6xl text-center" }, h("p", { className: "text-base font-semibold text-sky-700" }, "커뮤니티에서 출발한 통계·데이터 서비스 회사"), h("h1", { className: "mt-3 text-4xl font-extrabold text-gray-950 md:text-6xl" }, "주식회사 통계마당"), h("p", { className: "mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600" }, "통계마당은 2013년 4월 통계와 데이터를 공부하고 활용하는 사람들이 모인 커뮤니티로 시작했습니다. 2021년 12월 주식회사 통계마당으로 전환한 뒤에도 커뮤니티를 꾸준히 유지하며, 통계·데이터 교육, 분석, Web-R 같은 서비스를 개발해 나가고 있습니다."))), h(StorySection, null), h(PeopleSection, null), h(LogoRailSection, null));
  }
  function set_main() {
    ensureLogoRailStyles();
    ReactDOM.render(h(Div_main, null), document.getElementById("div_main"));
  }
  window.set_main = set_main;
})();
