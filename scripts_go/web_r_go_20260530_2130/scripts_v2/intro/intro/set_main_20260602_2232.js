(function() {
  const h = React.createElement;
  const statgroundAssetRoot = "https://cdn.jsdelivr.net/gh/statground/Statground_CDN@8caf42578ea00e7cf973e39acc1a42a4182c217a/assets3/images/member/";
  const people = [
    {
      name: "Jae-seong Yoo",
      role: "CEO",
      image: statgroundAssetRoot + "JaeseongYoo.jpg",
      url: "https://www.facebook.com/JSYoo86"
    },
    {
      name: "Jae-kwang Kim",
      role: "Technical Advisor",
      image: statgroundAssetRoot + "JaekwangKim.jpg",
      url: "https://www.facebook.com/profile.php?id=100013068106711"
    },
    {
      name: "Seung-sik Hwang",
      role: "Admin. of Community",
      image: statgroundAssetRoot + "SeungsikHwang.jpg",
      url: "https://www.facebook.com/seungsik.hwang"
    },
    {
      name: "Keon-Woong Moon",
      role: "Admin. of Web-R",
      image: statgroundAssetRoot + "KeonwoongMoon.jpg",
      url: "https://www.facebook.com/cardiomoon"
    }
  ];
  const storyBlocks = [
    {
      title: "IT 분야에는 다양한 커뮤니티가 있으며, 이것이 IT 분야의 발전을 선도하기도 합니다.",
      body: [
        "IT 관련 커뮤니티가 많은 이유는 컴퓨터가 널리 사용되기 때문이며, 컴퓨터를 직접 다루기 때문에 커뮤니티에 대한 접근성이 좋기 때문입니다.",
        "컴퓨터를 사용하는 사람들은 새로운 기술과 도구에 관심이 많고, 커뮤니티를 통해 새로운 정보를 얻거나 질문을 하며 서로의 이해를 넓혀 왔습니다."
      ]
    },
    {
      title: "통계 또한 다양한 분야에서 널리 사용됩니다. 그럼에도 불구하고, 파워풀한 커뮤니티가 부족했습니다.",
      body: [
        "통계를 공부하거나 사용하는 사람들이 서로 의견을 공유하고 정보를 교환할 수 있는 커뮤니티는 매우 유용합니다. 그러나 통계와 관련된 커뮤니티는 포털 카페, 게시판, SNS 그룹의 변화에 따라 흩어지거나 활동량이 줄어드는 한계를 겪었습니다.",
        "SNS 기반 그룹들이 속속 생기던 시기에도 대부분은 오래 지속되지 못했습니다. 통계마당은 그 흐름 속에서 살아남은 그룹 중 하나였지만, 그룹이라는 형식만으로는 더 넓게 확장하기 어렵다는 한계가 있었습니다."
      ]
    },
    {
      title: "커뮤니티는 단순한 소통 창구가 아니라 정보가 순환되고 발전을 만드는 원동력입니다.",
      body: [
        "통계마당 페이스북 그룹은 한국의 통계 관련 커뮤니티 중 가장 많은 멤버 수를 보유하게 되었습니다. 그 과정에서 여러 위기를 겪었고, 이를 넘어서기 위해서는 커뮤니티를 지속시키는 특별한 원동력이 필요하다는 것을 실감했습니다.",
        "이에 통계와 관련된 정보의 순환 창구를 주도적으로 만들고, 기여에 대한 적극적인 보상을 구상하며, 최종적으로 통계 전반의 발전을 도모하기 위해 통계마당을 사업화하기로 했습니다.",
        "통계마당은 통계학에 관련된 정보, 자료, 코드 등을 제공하면서 통계에 관심 있는 사람들이 서로 정보를 공유하고 지식을 쌓을 수 있는 공간을 만드는 것을 목표로 합니다."
      ]
    }
  ];
  function SectionHeader(props) {
    return h("div", { className: "mx-auto max-w-3xl text-center" }, h("p", { className: "text-sm font-semibold uppercase tracking-wide text-sky-700" }, props.kicker), h("h2", { className: "mt-2 text-3xl font-extrabold text-gray-950 md:text-4xl" }, props.title), props.description ? h("p", { className: "mt-4 text-base leading-7 text-gray-600 md:text-lg" }, props.description) : null);
  }
  function PersonCard(props) {
    const person = props.person;
    return h("a", { href: person.url, target: "_blank", rel: "noreferrer", className: "group flex min-h-[260px] flex-col items-center justify-start rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md" }, h("img", { src: person.image, alt: person.name, className: "h-32 w-32 rounded-full object-cover ring-4 ring-gray-100 group-hover:ring-sky-100" }), h("h3", { className: "mt-5 text-xl font-bold text-gray-950" }, person.name), h("p", { className: "mt-2 text-sm font-medium text-gray-500" }, person.role));
  }
  function StorySection() {
    return h("section", { className: "border-t border-gray-200 bg-white px-5 py-16 md:px-8 md:py-20" }, h("div", { className: "mx-auto max-w-5xl" }, h(SectionHeader, { kicker: "Story", title: "통계마당의 스토리", description: "통계와 데이터를 배우는 사람들이 더 오래 연결될 수 있도록, 커뮤니티를 서비스로 확장한 배경입니다." }), h("div", { className: "mt-12 space-y-8" }, storyBlocks.map((block) => h("article", { key: block.title, className: "rounded-lg border border-gray-200 bg-gray-50 p-6 md:p-8" }, h("h3", { className: "text-xl font-bold leading-8 text-gray-950 md:text-2xl" }, block.title), h("div", { className: "mt-5 space-y-4 text-base leading-8 text-gray-700" }, block.body.map((paragraph) => h("p", { key: paragraph }, paragraph))))))));
  }
  function PeopleSection() {
    return h("section", { className: "bg-white px-5 py-16 md:px-8 md:py-20" }, h("div", { className: "mx-auto max-w-6xl" }, h(SectionHeader, { kicker: "People", title: "만든 사람들", description: "통계마당과 Web-R의 시작을 함께 만든 사람들입니다." }), h("div", { className: "mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" }, people.map((person) => h(PersonCard, { key: "people-" + person.name, person })))));
  }
  function Div_main() {
    return h("main", { className: "w-full bg-white text-gray-950" }, h("section", { className: "px-5 pt-14 pb-12 md:px-8 md:pt-20" }, h("div", { className: "mx-auto max-w-6xl text-center" }, h("p", { className: "text-base font-semibold text-sky-700" }, "국내 최대의 데이터 커뮤니티"), h("h1", { className: "mt-3 text-4xl font-extrabold text-gray-950 md:text-6xl" }, "주식회사 통계마당"), h("p", { className: "mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600" }, "통계마당은 통계와 데이터를 배우고 쓰는 사람들이 서로의 지식과 경험을 나누며 더 멀리 갈 수 있도록 커뮤니티, 교육, 도구를 함께 만들어 온 회사입니다."))), h(StorySection, null), h(PeopleSection, null));
  }
  function set_main() {
    ReactDOM.render(h(Div_main, null), document.getElementById("div_main"));
  }
  window.set_main = set_main;
})();
