const WEBR_CDN2_BASE = (() => {
  const src = (document.currentScript && document.currentScript.src) || "";
  const match = src.match(/^(https:\/\/cdn\.jsdelivr\.net\/gh\/statground\/web-r_CDN2@[^/]+\/)/);
  return match ? match[1] : "https://cdn.jsdelivr.net/gh/statground/web-r_CDN2@562e30e7111c9c448980268bd3d9c6de07badca0/";
})();

function set_main() {
  const h = React.createElement;
  const companyFacts = [
    ["상호", "주식회사 통계마당"],
    ["대표", "유재성"],
    ["개인정보보호책임자", "유재성"],
    ["사업자등록번호", "795-88-02574"],
    ["통신판매업신고번호", "2024-서울강남-06145"],
    ["주소", "서울특별시 강남구 테헤란로70길 12, 402-106A호"],
    ["대표전화", "0507-1300-9704"],
    ["문의", "cs@statground.net"]
  ];
  const services = [
    ["Web-R", "브라우저 기반 R 실행 환경과 분석 도구를 제공합니다.", "/webr/"],
    ["R ecosystem", "R 패키지, 뉴스, 커뮤니티 흐름을 탐색할 수 있게 정리합니다.", "/r-ecosystem/"],
    ["커뮤니티", "공지, 자유글, Notebook 공유, R 커뮤니티 소식을 제공합니다.", "/community/"],
    ["도서", "R과 통계 관련 도서를 선별하고 구매 경로를 안내합니다.", "/book/"]
  ];
  const links = [
    ["통계마당", "https://www.statground.net"],
    ["통계마당 페이스북 그룹", "https://www.facebook.com/groups/statground"],
    ["Futuredu", "https://www.futuredu.kr"],
    ["문의 메일", "mailto:cs@statground.net"]
  ];

  function FactTable() {
    return h("dl", { className: "grid grid-cols-1 gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white md:grid-cols-2" },
      companyFacts.map(([label, value]) => h("div", { key: label, className: "grid grid-cols-[120px_1fr] border-b border-gray-100 px-5 py-4 last:border-b-0 md:border-r md:[&:nth-child(even)]:border-r-0" },
        h("dt", { className: "text-sm font-semibold text-gray-500" }, label),
        h("dd", { className: "text-sm font-semibold text-gray-900" }, value)
      ))
    );
  }

  function ServiceCard({ title, desc, href }) {
    return h("a", { href, className: "flex h-full flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:bg-blue-50" },
      h("span", { className: "text-base font-extrabold text-gray-900" }, title),
      h("span", { className: "mt-3 text-sm leading-6 text-gray-600" }, desc)
    );
  }

  function ExternalLink({ title, href }) {
    return h("a", { href, target: href.startsWith("mailto:") ? "_self" : "_blank", rel: "noopener noreferrer", className: "inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50" }, title);
  }

  function DivMain() {
    return h("main", { className: "mx-auto flex w-full max-w-screen-lg flex-col gap-8 px-6 py-10 md:px-8" },
      h("section", { className: "flex flex-col gap-6 border-b border-gray-200 pb-8 md:flex-row md:items-center md:justify-between" },
        h("div", { className: "max-w-2xl" },
          h(Div_page_header, { title: "회사 소개", subtitle: "주식회사 통계마당" }),
          h("p", { className: "text-base leading-8 text-gray-700" }, "주식회사 통계마당은 Web-R을 중심으로 통계 분석, R 생태계 정보, 교육 콘텐츠, 커뮤니티 서비스를 운영합니다.")
        ),
        h("img", { src: WEBR_CDN2_BASE + "images/logo/logo.png", alt: "Statground", className: "h-14 w-auto object-contain" })
      ),
      h("section", { className: "space-y-4" },
        h("h2", { className: "text-xl font-extrabold text-gray-900" }, "회사 정보"),
        h(FactTable, null)
      ),
      h("section", { className: "space-y-4" },
        h("h2", { className: "text-xl font-extrabold text-gray-900" }, "운영 서비스"),
        h("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2" },
          services.map(([title, desc, href]) => h(ServiceCard, { key: title, title, desc, href }))
        )
      ),
      h("section", { className: "space-y-4" },
        h("h2", { className: "text-xl font-extrabold text-gray-900" }, "연결 채널"),
        h("div", { className: "flex flex-wrap gap-3" },
          links.map(([title, href]) => h(ExternalLink, { key: title, title, href }))
        )
      )
    );
  }

  ReactDOM.render(h(DivMain), document.getElementById("div_main"));
}

window.set_main = set_main;
