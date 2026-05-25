const AccountTeamPage = (() => {
  const h = React.createElement;
  const state = { loading: true, data: null, email: "", name: "", busy: "", message: "" };
  const text = (value) => String(value == null ? "" : value).trim();
  const menuGroups = [
    {
      key: "view",
      title: "보기",
      open: true,
      items: [
        { key: "overview", label: "내 정보 보기", href: "/account/myinfo/overview/" },
        { key: "articles", label: "내가 쓴 글", href: "/account/myinfo/articles/" },
        { key: "comments", label: "내가 쓴 댓글", href: "/account/myinfo/comments/" },
        { key: "payments", label: "결제 내역", href: "/account/myinfo/payments/" },
        { key: "connection", label: "계정 활동", href: "/account/myinfo/connection/" },
        { key: "team", label: "기관/팀 관리", href: "/account/team/" }
      ]
    },
    {
      key: "change",
      title: "변경",
      open: false,
      items: [
        { key: "email", label: "이메일 변경", href: "/account/myinfo/email/" },
        { key: "password", label: "비밀번호 변경", href: "/account/myinfo/password/" },
        { key: "profile", label: "개인정보 변경", href: "/account/myinfo/profile/" },
        { key: "google", label: "Google 연동", href: "/account/myinfo/google/" }
      ]
    }
  ];
  function setState(next) {
    Object.assign(state, next || {});
    render();
  }
  function statCard(label, value) {
    return h("div", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm" },
      h("div", { className: "text-sm font-semibold text-slate-500" }, label),
      h("div", { className: "mt-2 text-2xl font-bold text-slate-950" }, value));
  }
  function notice(message) {
    return h("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800" }, message);
  }
  function AccountSidebar() {
    const [openGroups, setOpenGroups] = React.useState(() => Object.fromEntries(menuGroups.map((group) => [group.key, group.open])));
    const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    return h("aside", { className: "sticky top-6 h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:static" },
      h("nav", { id: "myinfo-account-menu", className: "space-y-3" },
        menuGroups.map((group) => h("section", { key: group.key, className: "space-y-2" },
          h("button", {
            type: "button",
            className: `flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-bold transition ${openGroups[group.key] ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`,
            "aria-expanded": !!openGroups[group.key],
            "aria-controls": `myinfo-menu-group-${group.key}`,
            onClick: () => toggleGroup(group.key)
          },
            h("span", null, group.title),
            h("span", { "aria-hidden": "true" }, openGroups[group.key] ? "-" : "+")),
          h("div", { id: `myinfo-menu-group-${group.key}`, className: `${openGroups[group.key] ? "block" : "hidden"} space-y-1` },
            group.items.map((item) => {
              const selected = item.key === "team";
              return h("a", {
                key: item.key,
                href: item.href,
                "aria-current": selected ? "page" : void 0,
                className: `block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${selected ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"}`
              }, item.label);
            }))))));
  }
  function pageTitle(data) {
    if (!data || state.loading) return "기관/팀 관리";
    return data.can_manage ? "기관/팀 관리" : "기관/팀 현황";
  }
  function pageDescription(data) {
    if (!data || state.loading) return "기관/팀 회원의 좌석과 팀원을 관리합니다.";
    return data.can_manage ? "기관/팀 회원의 좌석과 팀원을 관리합니다." : "소속 팀의 좌석과 팀원 현황을 확인합니다.";
  }
  function PageFrame({ data, children }) {
    return h("main", { className: "mx-auto w-full max-w-[1480px] px-4 py-10 text-slate-950 sm:px-6 lg:px-8" },
      h("header", { className: "mb-10" },
        h("h1", { className: "text-3xl font-bold tracking-normal text-slate-950" }, pageTitle(data)),
        h("p", { className: "mt-3 text-base text-slate-500" }, pageDescription(data))),
      h("div", { className: "grid grid-cols-1 gap-7 lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]" },
        h(AccountSidebar),
        h("div", { className: "min-w-0" }, children)));
  }
  async function fetchJSON(url, options) {
    const res = await fetch(url, options || {});
    return res.json();
  }
  async function load() {
    setState({ loading: true, message: "" });
    try {
      const data = await fetchJSON("/account/ajax_get_team/");
      setState({ loading: false, data, name: data && data.team ? text(data.team.name) : "" });
    } catch (err) {
      setState({ loading: false, data: { ok: false, error: err && err.message ? err.message : "팀 정보를 불러올 수 없습니다." } });
    }
  }
  async function addMember(event) {
    event.preventDefault();
    const email = text(state.email).toLowerCase();
    if (!email) {
      setState({ message: "추가할 팀원 이메일을 입력해주세요." });
      return;
    }
    setState({ busy: "add", message: "" });
    try {
      const form = new FormData();
      form.append("email", email);
      const data = await fetchJSON("/account/ajax_add_team_member/", { method: "POST", body: form });
      if (!data.ok) {
        setState({ busy: "", message: data.error || "팀원을 추가할 수 없습니다." });
        return;
      }
      setState({ busy: "", email: "", data, message: "팀원을 추가했습니다." });
    } catch (err) {
      setState({ busy: "", message: err && err.message ? err.message : "팀원을 추가할 수 없습니다." });
    }
  }
  async function updateTeam(event) {
    event.preventDefault();
    setState({ busy: "name", message: "" });
    try {
      const form = new FormData();
      form.append("name", text(state.name));
      const data = await fetchJSON("/account/ajax_update_team/", { method: "POST", body: form });
      if (!data.ok) {
        setState({ busy: "", message: data.error || "팀 이름을 저장할 수 없습니다." });
        return;
      }
      setState({ busy: "", data, name: data && data.team ? text(data.team.name) : "", message: "팀 이름을 저장했습니다." });
    } catch (err) {
      setState({ busy: "", message: err && err.message ? err.message : "팀 이름을 저장할 수 없습니다." });
    }
  }
  async function removeMember(member) {
    const uuid = text(member && member.uuid);
    if (!uuid || !window.confirm("이 팀원을 해제할까요?")) return;
    setState({ busy: uuid, message: "" });
    try {
      const form = new FormData();
      form.append("member_uuid", uuid);
      const data = await fetchJSON("/account/ajax_remove_team_member/", { method: "POST", body: form });
      if (!data.ok) {
        setState({ busy: "", message: data.error || "팀원을 해제할 수 없습니다." });
        return;
      }
      setState({ busy: "", data, message: "팀원을 해제했습니다." });
    } catch (err) {
      setState({ busy: "", message: err && err.message ? err.message : "팀원을 해제할 수 없습니다." });
    }
  }
  function teamTable(members, options) {
    const rows = Array.isArray(members) ? members : [];
    const canManage = !options || options.canManage !== false;
    return h("div", { className: "overflow-x-auto rounded-lg border border-slate-200 bg-white" },
      h("table", { className: "min-w-full text-left text-sm text-slate-700" },
        h("thead", { className: "border-b bg-slate-50 text-xs font-bold uppercase tracking-normal text-slate-500" },
          h("tr", null,
            h("th", { className: "px-4 py-3" }, "이메일"),
            h("th", { className: "px-4 py-3" }, "닉네임"),
            h("th", { className: "px-4 py-3" }, "이름"),
            h("th", { className: "px-4 py-3" }, "만료일"),
            h("th", { className: "px-4 py-3" }, "추가일"),
            canManage ? h("th", { className: "px-4 py-3 text-right" }, "관리") : null)),
        h("tbody", null,
          rows.length === 0 ? h("tr", null, h("td", { className: "px-4 py-8 text-center text-slate-400", colSpan: canManage ? 6 : 5 }, "등록된 팀원이 없습니다.")) : null,
          rows.map((member) => h("tr", { key: member.membership_uuid || member.uuid, className: "border-b last:border-0 hover:bg-slate-50" },
            h("td", { className: "px-4 py-3 font-semibold text-slate-950" }, member.email || "-"),
            h("td", { className: "px-4 py-3" }, member.nickname || "-"),
            h("td", { className: "px-4 py-3" }, member.realname || "-"),
            h("td", { className: "px-4 py-3 whitespace-nowrap" }, member.expired_at || "-"),
            h("td", { className: "px-4 py-3 whitespace-nowrap" }, member.joined_at || "-"),
            canManage ? h("td", { className: "px-4 py-3 text-right" },
              h("button", {
                type: "button",
                disabled: state.busy === member.uuid,
                onClick: () => removeMember(member),
                className: "rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              }, state.busy === member.uuid ? "해제 중" : "해제")) : null)))));
  }
  function SummaryView({ data }) {
    const team = data.team || {};
    const owner = data.owner || {};
    return h("div", { className: "space-y-6" },
      h("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5" },
        statCard("전체 좌석", team.seat_limit || 0),
        statCard("사용 좌석", `${team.seat_used || 0} (팀장 포함)`),
        statCard("남은 좌석", team.remaining || 0),
        statCard("팀원 등급", team.member_role_name || "정회원"),
        statCard("만료일", team.expires_at || "-")),
      h("div", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm" },
        h("div", { className: "text-sm font-semibold text-slate-500" }, "팀장"),
        h("div", { className: "mt-2 text-lg font-bold text-slate-950" }, owner.nickname || owner.email || "-"),
        h("p", { className: "mt-2 text-sm text-slate-500" }, data.message || "팀원 계정은 팀 현황을 볼 수 있습니다.")),
      teamTable(data.members, { canManage: false }));
  }
  function ManageView({ data }) {
    const team = data.team || {};
    return h("div", { className: "space-y-6" },
      h("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5" },
        statCard("전체 좌석", team.seat_limit || 0),
        statCard("사용 좌석", `${team.seat_used || 0} (본인 포함)`),
        statCard("남은 좌석", team.remaining || 0),
        statCard("팀원 등급", team.member_role_name || "정회원"),
        statCard("만료일", team.expires_at || "-")),
      h("form", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", onSubmit: updateTeam },
        h("label", { className: "mb-2 block text-sm font-bold text-slate-700" }, "팀 이름"),
        h("div", { className: "flex gap-2 sm:flex-col" },
          h("input", {
            type: "text",
            maxLength: 150,
            value: state.name,
            onChange: (event) => setState({ name: event.target.value }),
            className: "min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950"
          }),
          h("button", {
            type: "submit",
            disabled: state.busy === "name",
            className: "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          }, state.busy === "name" ? "저장 중" : "저장"))),
      h("form", { className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm", onSubmit: addMember },
        h("label", { className: "mb-2 block text-sm font-bold text-slate-700" }, "팀원 이메일"),
        h("div", { className: "flex gap-2 sm:flex-col" },
          h("input", {
            type: "email",
            value: state.email,
            onChange: (event) => setState({ email: event.target.value }),
            className: "min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950",
            placeholder: "member@example.com"
          }),
          h("button", {
            type: "submit",
            disabled: state.busy === "add",
            className: "rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          }, state.busy === "add" ? "추가 중" : "팀원 추가")),
        state.message ? h("p", { className: "mt-3 text-sm font-semibold text-blue-700" }, state.message) : null),
      teamTable(data.members, { canManage: true }));
  }
  function App() {
    const data = state.data || {};
    if (state.loading) {
      return h(PageFrame, { data },
        h("div", { className: "rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm" }, "불러오는 중입니다."));
    }
    return h(PageFrame, { data },
      !data.ok ? notice(data.error || "팀 정보를 불러올 수 없습니다.") : data.can_manage ? h(ManageView, { data }) : data.team ? h(SummaryView, { data }) : notice(data.message || "기관/팀 회원 계정만 팀원을 관리할 수 있습니다."));
  }
  function render() {
    const container = document.getElementById("div_main");
    if (!container) return;
    ReactDOM.render(h(App), container);
  }
  return { set_main: load };
})();
function set_main() {
  AccountTeamPage.set_main();
}
