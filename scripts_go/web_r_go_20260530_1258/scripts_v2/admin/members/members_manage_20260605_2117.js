function adminMemberText(value) {
  if (value === null || value === void 0)
    return "";
  return String(value);
}
function adminMemberNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
function adminMemberDateOnly(value) {
  const text = adminMemberText(value).trim();
  return text.length >= 10 ? text.slice(0, 10) : "";
}
function adminMemberFormatNumber(value) {
  return adminMemberNumber(value).toLocaleString("ko-KR");
}
function adminMembersInjectDashboardStyles() {
  if (document.getElementById("webr-admin-members-dashboard-style"))
    return;
  const style = document.createElement("style");
  style.id = "webr-admin-members-dashboard-style";
  style.textContent = `
    .webr-admin-members-dashboard {
      background: #f8fafc;
      box-sizing: border-box;
      column-gap: clamp(8px, 1.1vw, 18px);
      display: grid !important;
      grid-template-columns: minmax(176px, 232px) minmax(0, 1fr) !important;
      margin: 0 auto;
      max-width: calc(100vw - 12px);
      overflow-x: hidden;
      padding-left: clamp(8px, 1.4vw, 24px) !important;
      padding-right: clamp(8px, 1.4vw, 24px) !important;
      width: 100%;
    }
    .webr-admin-members-dashboard > div:first-child {
      grid-column: 1;
      min-width: 0;
      width: 100%;
    }
    .webr-admin-members-dashboard > div:first-child > div {
      width: 100% !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) {
      grid-column: 2;
      min-width: 0;
    }
    .webr-admin-members-dashboard > div:nth-child(2) {
      display: grid;
      gap: 12px;
      align-items: stretch;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > :not([hidden]) ~ :not([hidden]) {
      margin-top: 0 !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(-n+4) {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(-n+4) > div {
      background: #ffffff !important;
      border: 1px solid #e2e8f0;
      border-radius: 12px !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
      height: 100%;
      padding: 14px !important;
      text-align: left !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(1) > div {
      background: #f8fbff !important;
      border-left: 4px solid #2563eb;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(2) > div {
      border-left: 4px solid #0891b2;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(3) > div {
      border-left: 4px solid #059669;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(4) > div {
      border-left: 4px solid #f97316;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(-n+4) h5 {
      color: #111827 !important;
      font-size: 0.95rem !important;
      font-weight: 800 !important;
      line-height: 1.2 !important;
      margin: 0 0 12px !important;
      text-align: left !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(-n+4) dl {
      align-items: stretch !important;
      display: grid !important;
      gap: 8px !important;
      justify-content: stretch !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(1) dl {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(n+2):nth-child(-n+4) dl {
      grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)) !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(-n+4) dl > div {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      flex: 1 1 110px !important;
      min-width: 0 !important;
      padding: 9px 10px !important;
      text-align: left !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(1) dl > div:first-child {
      background: #eff6ff;
      border-color: #bfdbfe;
      grid-column: 1 / -1;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(-n+4) dt {
      color: #020617 !important;
      font-size: 1.35rem !important;
      font-weight: 850 !important;
      letter-spacing: 0 !important;
      line-height: 1.05 !important;
      white-space: normal !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(1) dl > div:first-child dt {
      font-size: 1.9rem !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(-n+4) dd {
      color: #64748b !important;
      font-size: 0.78rem !important;
      line-height: 1.25 !important;
      margin-top: 3px !important;
      white-space: normal !important;
    }
    .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(n+5) {
      grid-column: 1 / -1;
    }
    @media (min-width: 1024px) {
      .webr-admin-members-dashboard > div:nth-child(2) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (min-width: 1280px) {
      .webr-admin-members-dashboard > div:nth-child(2) {
        grid-template-columns: minmax(340px, 1.15fr) minmax(240px, 0.9fr) minmax(240px, 0.9fr);
      }
      .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(1) {
        grid-column: 1;
        grid-row: 1 / span 2;
      }
      .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(2) {
        grid-column: 2 / 4;
        grid-row: 1;
      }
      .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(3) {
        grid-column: 2;
        grid-row: 2;
      }
      .webr-admin-members-dashboard > div:nth-child(2) > div:nth-child(4) {
        grid-column: 3;
        grid-row: 2;
      }
    }
    @media (max-width: 767px) {
      .webr-admin-members-dashboard {
        grid-template-columns: minmax(0, 1fr) !important;
      }
      .webr-admin-members-dashboard > div:first-child,
      .webr-admin-members-dashboard > div:nth-child(2) {
        grid-column: 1;
      }
    }
    .webr-admin-members-dashboard table {
      table-layout: fixed;
      width: 100%;
    }
    .webr-admin-members-dashboard table td,
    .webr-admin-members-dashboard table th {
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: top;
    }
    .webr-admin-members-dashboard table th:nth-child(3),
    .webr-admin-members-dashboard table td:nth-child(3) {
      width: 260px;
      overflow: visible;
      text-overflow: clip;
      white-space: normal !important;
      word-break: break-all;
    }
    .webr-admin-members-dashboard table tbody td[colspan] {
      display: table-cell !important;
    }
    .webr-admin-members-dashboard table th:nth-child(1),
    .webr-admin-members-dashboard table td:nth-child(1) {
      width: 48px;
    }
    .webr-admin-members-dashboard table th:nth-child(5),
    .webr-admin-members-dashboard table td:nth-child(5) {
      width: 15%;
    }
    .webr-admin-members-dashboard table th:nth-child(6),
    .webr-admin-members-dashboard table td:nth-child(6) {
      width: 24%;
    }
    .webr-admin-members-dashboard table th:nth-child(9),
    .webr-admin-members-dashboard table td:nth-child(9) {
      width: 152px;
    }
    @media (max-width: 1279px) {
      .webr-admin-members-dashboard table th:nth-child(1),
      .webr-admin-members-dashboard table td:nth-child(1),
      .webr-admin-members-dashboard table th:nth-child(2),
      .webr-admin-members-dashboard table td:nth-child(2),
      .webr-admin-members-dashboard table th:nth-child(7),
      .webr-admin-members-dashboard table td:nth-child(7) {
        display: none;
      }
    }
    @media (max-width: 1023px) {
      .webr-admin-members-dashboard table th:nth-child(3),
      .webr-admin-members-dashboard table td:nth-child(3) {
        display: none;
      }
    }
    @media (max-width: 767px) {
      .webr-admin-members-dashboard table th:nth-child(4),
      .webr-admin-members-dashboard table td:nth-child(4),
      .webr-admin-members-dashboard table th:nth-child(8),
      .webr-admin-members-dashboard table td:nth-child(8) {
        display: none;
      }
      .webr-admin-members-dashboard table th:nth-child(5),
      .webr-admin-members-dashboard table td:nth-child(5) {
        width: 32%;
      }
      .webr-admin-members-dashboard table th:nth-child(6),
      .webr-admin-members-dashboard table td:nth-child(6) {
        width: 40%;
      }
      .webr-admin-members-dashboard table th:nth-child(9),
      .webr-admin-members-dashboard table td:nth-child(9) {
        width: 96px;
        white-space: normal !important;
      }
      .webr-admin-members-dashboard table td:nth-child(9) button {
        display: block;
        margin: 2px 0 0 auto !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
      }
      .webr-admin-members-dashboard table td:nth-child(9) span {
        display: block;
        margin: 2px 0 0 auto !important;
      }
    }
    .webr-admin-members-dashboard table tbody td[colspan] {
      display: table-cell !important;
    }
  `;
  document.head.appendChild(style);
}
function adminMemberMetric(data, key) {
  return adminMemberNumber((((data || {}).count_joined || {})[key] || {})["0"]);
}
function adminMemberRoleRequiresExpiry(roleMetaByName, roleName) {
  const role = adminMemberText(roleName).trim();
  return adminMemberNumber((roleMetaByName[role] || {}).requires_expiry) === 1;
}
function adminMemberDefaultExpiry() {
  const now = /* @__PURE__ */ new Date();
  const next = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function adminMemberRoleBadgeClass(roleName) {
  return "border-slate-200 bg-slate-50 text-slate-700";
}
function adminMemberStatusBadgeClass(member) {
  if (adminMemberNumber(member.blocked) === 1)
    return "border-rose-200 bg-rose-50 text-rose-700";
  if (adminMemberNumber(member.is_active) === 0)
    return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}
function adminMemberStatusText(member) {
  if (adminMemberNumber(member.blocked) === 1)
    return "\uCC28\uB2E8";
  if (adminMemberNumber(member.is_active) === 0)
    return "\uBE44\uD65C\uC131";
  return "\uC815\uC0C1";
}
function adminMemberDisplayRole(member) {
  return adminMemberText((member || {}).effective_role_name || (member || {}).role || (member || {}).role_name).trim();
}
function adminMemberContextType(member) {
  const context = adminMemberText((member || {}).membership_context_type).trim().toLowerCase();
  return context;
}
function adminMemberContextLabel(member) {
  const context = adminMemberContextType(member);
  if (context === "team")
    return "\uD300 \uAD8C\uD55C \uC0AC\uC6A9\uC911";
  if (context === "personal")
    return "\uAC1C\uC778 \uAD8C\uD55C \uC0AC\uC6A9\uC911";
  return "";
}
function adminMemberContextShortLabel(member) {
  const context = adminMemberContextType(member);
  if (context === "team")
    return "\uD300";
  if (context === "personal")
    return "\uAC1C\uC778";
  return "";
}
function adminMemberContextBadgeClass(member) {
  const context = adminMemberContextType(member);
  if (context === "team")
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  if (context === "personal")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}
function adminMemberEntitlementLines(member) {
  const lines = [];
  const pausedDays = adminMemberNumber((member || {}).paused_personal_days) || Math.floor(adminMemberNumber((member || {}).paused_personal_seconds) / 86400);
  const personalRole = adminMemberText((member || {}).active_personal_role_name).trim();
  const personalExpires = adminMemberDateOnly((member || {}).active_personal_expired_at);
  if (pausedDays > 0)
    lines.push("\uAC1C\uC778\uAD8C \uBCF4\uC874 " + adminMemberFormatNumber(pausedDays) + "\uC77C");
  if (personalRole && personalExpires)
    lines.push("\uAC1C\uC778\uAD8C " + personalRole + " " + personalExpires);
  return lines;
}
function adminMemberCollection(value) {
  if (!value)
    return [];
  if (Array.isArray(value))
    return value;
  if (typeof value === "object")
    return Object.values(value);
  return [];
}
function adminMemberPaymentHistory(member) {
  return adminMemberCollection((member || {}).payment_history);
}
function adminMemberPaymentCount(member) {
  const count = adminMemberNumber((member || {}).payment_count);
  return count || adminMemberPaymentHistory(member).length;
}
function adminMemberPaymentSummary(member) {
  const count = adminMemberPaymentCount(member);
  const total = adminMemberNumber((member || {}).payment_amount_total);
  const lastPaidAt = adminMemberText((member || {}).payment_last_paid_at).trim();
  const parts = [`${adminMemberFormatNumber(count)}\uD68C`];
  if (total > 0)
    parts.push(`\uCD1D ${adminMemberFormatNumber(total)}\uC6D0`);
  if (lastPaidAt)
    parts.push(`\uCD5C\uADFC ${lastPaidAt}`);
  return parts.join(" / ");
}
function adminMemberAuthLabel(member) {
  const label = adminMemberText((member || {}).auth_provider_label).trim();
  if (label)
    return label;
  if (adminMemberNumber((member || {}).google_connected) === 1)
    return "Google \uC5F0\uB3D9";
  return "\uC774\uBA54\uC77C";
}
function adminMemberCSVCell(value) {
  const text = adminMemberText(value).replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${text}"`;
}
function adminMemberDownloadCSV(rows) {
  const header = [
    "No",
    "\uAC00\uC785\uC77C",
    "\uC774\uBA54\uC77C",
    "\uB2C9\uB124\uC784",
    "\uC774\uB984",
    "\uB4F1\uAE09",
    "\uAD8C\uD55C \uC0AC\uC6A9",
    "\uB9CC\uB8CC\uC77C",
    "\uC0C1\uD0DC",
    "Google \uC5F0\uB3D9",
    "Google \uC774\uBA54\uC77C",
    "\uACB0\uC81C \uD69F\uC218",
    "\uACB0\uC81C \uAE08\uC561",
    "\uCD5C\uADFC \uACB0\uC81C\uC77C"
  ];
  const body = rows.map((member, idx) => [
    idx + 1,
    member.date_joined,
    member.email,
    member.nickname,
    member.realname,
    adminMemberDisplayRole(member),
    adminMemberContextLabel(member),
    adminMemberDateOnly(member.expired_at),
    adminMemberStatusText(member),
    adminMemberAuthLabel(member),
    member.google_email,
    adminMemberPaymentCount(member),
    adminMemberNumber(member.payment_amount_total),
    member.payment_last_paid_at
  ].map(adminMemberCSVCell).join(","));
  const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const blob = new Blob(["\uFEFF" + [header.map(adminMemberCSVCell).join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `webr_members_${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}
function adminMemberIsBot(member) {
  return adminMemberText((member || {}).role_name || (member || {}).role).trim().toLowerCase() === "bot";
}
function adminMemberSortValue(member, key, idx) {
  switch (key) {
    case "no":
      return idx;
    case "date_joined":
      return Date.parse(adminMemberText(member.date_joined).replace(" ", "T")) || 0;
    case "email":
      return adminMemberText(member.email).toLowerCase();
    case "nickname":
      return adminMemberText(member.nickname).toLowerCase();
    case "realname":
      return adminMemberText(member.realname).toLowerCase();
    case "role":
      return adminMemberDisplayRole(member).toLowerCase();
    case "membership_context":
      return adminMemberContextLabel(member).toLowerCase();
    case "expired_at":
      return Date.parse(adminMemberText(member.expired_at).replace(" ", "T")) || 0;
    case "status":
      return adminMemberStatusText(member);
    case "email_subscription":
      return adminMemberNumber(member.email_subscription);
    case "gender":
      return adminMemberText(member.gender).toLowerCase();
    default:
      return "";
  }
}
function adminMemberCompareValues(left, right) {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return adminMemberText(left).localeCompare(adminMemberText(right), "ko-KR", { numeric: true, sensitivity: "base" });
}
const ADMIN_MEMBER_SECTION_ENDPOINTS = {
  joined: "/admin/ajax_get_admin_members_joined/",
  roles: "/admin/ajax_get_admin_members_roles/",
  graph: "/admin/ajax_get_admin_members_graph/",
  list: "/admin/ajax_get_admin_members_list/"
};
const ADMIN_MEMBER_SECTION_NAMES = Object.keys(ADMIN_MEMBER_SECTION_ENDPOINTS);
const ADMIN_MEMBER_LIST_MIN_SPINNER_MS = 250;
function adminMembersMergeData(prev, payload) {
  return { ...(prev || {}), ...(payload || {}) };
}
function adminMembersDelayListSpinner(promise) {
  return Promise.all([
    Promise.resolve(promise),
    new Promise((resolve) => setTimeout(resolve, ADMIN_MEMBER_LIST_MIN_SPINNER_MS))
  ]).then(([value]) => value);
}
function adminMembersFetchSection(section, body) {
  const endpoint = ADMIN_MEMBER_SECTION_ENDPOINTS[section];
  if (!endpoint)
    return Promise.resolve({});
  const options = { method: "POST", credentials: "same-origin" };
  if (body)
    options.body = body;
  return fetch(endpoint, options).then((res) => res.json());
}
function AdminMembersManageMain(props) {
  const [data, setData] = React.useState(props.data || {});
  const [search, setSearch] = React.useState("");
  const [searchDraft, setSearchDraft] = React.useState("");
  const [roleFilters, setRoleFilters] = React.useState([]);
  const [statusFilters, setStatusFilters] = React.useState([]);
  const [contextFilter, setContextFilter] = React.useState("all");
  const [paymentFilter, setPaymentFilter] = React.useState("all");
  const [sortState, setSortState] = React.useState({ key: "date_joined", direction: "desc" });
  const [editingUUID, setEditingUUID] = React.useState("");
  const [expandedUUID, setExpandedUUID] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDraft, setCreateDraft] = React.useState({
    email: "",
    password: "",
    nickname: "",
    realname: "",
    gender: "",
    role_name: "",
    membership_expires_at: "",
    blocked: false,
    email_subscription: true
  });
  const [drafts, setDrafts] = React.useState({});
  const [savingUUID, setSavingUUID] = React.useState("");
  const [deletingUUID, setDeletingUUID] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [loadingSections, setLoadingSections] = React.useState({});
  const [sectionErrors, setSectionErrors] = React.useState({});
  const [pendingPage, setPendingPage] = React.useState(0);
  const [pendingSearch, setPendingSearch] = React.useState(false);
  const pageSize = 20;
  function roleParam(values) {
    return (values || []).join(",");
  }
  function statusParam(values) {
    return (values || []).join(",");
  }
  function listRequestBody(patch) {
    patch = patch || {};
    const nextPage = patch.page != null ? patch.page : adminMemberNumber((data || {}).member_page) || 1;
    const nextSort = patch.sortState || sortState;
    const body = new URLSearchParams();
    body.set("page", String(Math.max(1, adminMemberNumber(nextPage) || 1)));
    body.set("page_size", String(pageSize));
    body.set("search", patch.search != null ? adminMemberText(patch.search) : search);
    body.set("role", roleParam(patch.roleFilters != null ? patch.roleFilters : roleFilters));
    body.set("status", statusParam(patch.statusFilters != null ? patch.statusFilters : statusFilters));
    body.set("context", patch.contextFilter != null ? patch.contextFilter : contextFilter);
    body.set("payment", patch.paymentFilter != null ? patch.paymentFilter : paymentFilter);
    body.set("sort_key", nextSort.key || "date_joined");
    body.set("sort_dir", nextSort.direction || "desc");
    body.set("include_counts", patch.includeCounts === false ? "0" : "1");
    return body;
  }
  const loadMemberSections = (sections, listPatch) => {
    const selectedSections = sections && sections.length ? sections : ADMIN_MEMBER_SECTION_NAMES;
    setLoadingSections((prev) => {
      const next = { ...prev };
      selectedSections.forEach((section) => {
        next[section] = true;
      });
      return next;
    });
    setSectionErrors((prev) => {
      const next = { ...prev };
      selectedSections.forEach((section) => {
        delete next[section];
      });
      return next;
    });
    return Promise.all(selectedSections.map((section) => adminMembersFetchSection(section, section === "list" ? listRequestBody(listPatch) : null).then((payload) => {
      setData((prev) => adminMembersMergeData(prev, payload || {}));
      setLoadingSections((prev) => ({ ...prev, [section]: false }));
      return payload || {};
    }).catch((error) => {
      console.error(error);
      setLoadingSections((prev) => ({ ...prev, [section]: false }));
      setSectionErrors((prev) => ({ ...prev, [section]: true }));
      return {};
    }))).then((parts) => parts.reduce((merged, payload) => adminMembersMergeData(merged, payload), {}));
  };
  const membersRaw = React.useMemo(() => Object.values((data || {}).list_members || {}), [data]);
  const roleRows = React.useMemo(() => Object.values((data || {}).role_options || {}).filter((row) => adminMemberText(row && row.name).trim()), [data]);
  const roleMetaByName = React.useMemo(() => {
    const meta = {};
    roleRows.forEach((row) => {
      const name = adminMemberText(row && row.name).trim();
      if (name)
        meta[name] = row;
    });
    return meta;
  }, [roleRows]);
  const editableRoles = React.useMemo(() => roleRows.map((row) => adminMemberText(row.name).trim()).filter(Boolean), [roleRows]);
  const roleCounts = React.useMemo(() => Object.values((data || {}).count_role || {}).filter((row) => adminMemberText(row && row.name).trim()), [data]);
  const adminRoleCounts = React.useMemo(() => Object.values((data || {}).count_admin_role || (data || {}).count_internal_role || {}).filter((row) => adminMemberText(row && row.name).trim()), [data]);
  const teamRoleCounts = React.useMemo(() => Object.values((data || {}).count_team_role || {}).filter((row) => adminMemberText(row && row.name).trim()), [data]);
  const teamCountedTotal = adminMemberNumber((((data || {}).count_team_member_total || {})["0"]));
  const filterCounts = React.useMemo(() => (data || {}).member_filter_counts || {}, [data]);
  const knownTotalRows = adminMemberNumber((data || {}).member_total) || membersRaw.length;
  function memberFilterCount(group, key, fallback) {
    const bucket = filterCounts && filterCounts[group] || {};
    if (Object.prototype.hasOwnProperty.call(bucket, key))
      return adminMemberNumber(bucket[key]);
    return adminMemberNumber(fallback);
  }
  const contextCounts = React.useMemo(() => {
    return {
      all: memberFilterCount("context", "all", knownTotalRows),
      personal: memberFilterCount("context", "personal", 0),
      team: memberFilterCount("context", "team", 0)
    };
  }, [filterCounts, knownTotalRows]);
  const contextFilterOptions = React.useMemo(() => [
    { value: "all", label: "\uC804\uCCB4", count: contextCounts.all },
    { value: "personal", label: "\uAC1C\uC778", count: contextCounts.personal },
    { value: "team", label: "\uD300", count: contextCounts.team }
  ], [contextCounts]);
  const paymentCounts = React.useMemo(() => {
    return {
      all: memberFilterCount("payment", "all", knownTotalRows),
      has_payment: memberFilterCount("payment", "has_payment", 0)
    };
  }, [filterCounts, knownTotalRows]);
  const paymentFilterOptions = React.useMemo(() => [
    { value: "all", label: "\uC804\uCCB4", count: paymentCounts.all },
    { value: "has_payment", label: "\uACB0\uC81C \uC774\uB825 \uC788\uC74C", count: paymentCounts.has_payment }
  ], [paymentCounts]);
  const memberRoleOptions = React.useMemo(() => roleCounts.map((row) => adminMemberText(row && row.name).trim()).filter(Boolean), [roleCounts]);
  const memberRoleFilterOptions = React.useMemo(() => memberRoleOptions.map((role) => ({
    value: role,
    count: memberFilterCount("role", role, 0)
  })), [memberRoleOptions, filterCounts]);
  const statusCounts = React.useMemo(() => Object.values((data || {}).count_status || {}), [data]);
  const statusFilterOptions = React.useMemo(() => [
    { value: "active", label: "\uC815\uC0C1", count: memberFilterCount("status", "active", 0) },
    { value: "blocked", label: "\uCC28\uB2E8", count: memberFilterCount("status", "blocked", 0) },
    { value: "inactive", label: "\uBE44\uD65C\uC131", count: memberFilterCount("status", "inactive", 0) }
  ], [filterCounts]);
  const filteredMembers = membersRaw;
  const sortedMembers = membersRaw;
  React.useEffect(() => {
    if (props.skipInitialLoad)
      return;
    loadMemberSections(ADMIN_MEMBER_SECTION_NAMES);
  }, [props.skipInitialLoad]);
  React.useEffect(() => {
    requestAnimationFrame(() => {
      if (typeof draw_chart === "function")
        draw_chart((data || {}).list_role_monthly || (data || {}).list_monthly || {}, "graph_tab_monthly");
    });
  }, [data]);
  const totalRows = knownTotalRows || sortedMembers.length;
  const totalPages = Math.max(1, adminMemberNumber((data || {}).member_total_pages) || Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(Math.max(1, adminMemberNumber((data || {}).member_page) || 1), totalPages);
  const startIdx = totalRows > 0 ? (currentPage - 1) * pageSize : 0;
  const pagedMembers = sortedMembers;
  function downloadFilteredMembers() {
    adminMemberDownloadCSV(sortedMembers);
  }
  const listLoading = !!loadingSections.list;
  const tableLoading = listLoading || pendingPage > 0 || pendingSearch;
  const anyLoading = Object.values(loadingSections).some(Boolean);
  const sectionErrorCount = Object.keys(sectionErrors).length;
  function reloadMembers() {
    return loadMemberSections(ADMIN_MEMBER_SECTION_NAMES, { page: currentPage });
  }
  function goToMemberPage(page) {
    if (listLoading || pendingPage)
      return;
    setPendingPage(page);
    adminMembersDelayListSpinner(loadMemberSections(["list"], { page, includeCounts: false })).finally(() => setPendingPage(0));
  }
  function renderPageButton(label, page, disabled) {
    const spinning = pendingPage > 0 && pendingPage === page;
    return /* @__PURE__ */ React.createElement("button", { type: "button", className: "inline-flex min-h-[32px] min-w-[68px] items-center justify-center gap-2 rounded border px-3 py-1 disabled:opacity-50", onClick: () => goToMemberPage(page), disabled: disabled || listLoading || pendingPage !== 0 }, spinning ? /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600", "aria-hidden": "true" }) : null, /* @__PURE__ */ React.createElement("span", null, label));
  }
  function applyMemberSearch(valueOverride) {
    if (listLoading || pendingPage || pendingSearch)
      return;
    const value = valueOverride != null ? adminMemberText(valueOverride) : searchDraft;
    setSearch(value);
    setExpandedUUID("");
    setEditingUUID("");
    setPendingSearch(true);
    adminMembersDelayListSpinner(loadMemberSections(["list"], {
      page: 1,
      search: value,
      roleFilters,
      statusFilters,
      contextFilter,
      paymentFilter,
      includeCounts: true
    })).finally(() => setPendingSearch(false));
  }
  function beginEdit(member) {
    const uuid = adminMemberText(member.uuid);
    const role = adminMemberText(member.role_name || member.role).trim() || (editableRoles[0] || "");
    const requiresExpiry = adminMemberRoleRequiresExpiry(roleMetaByName, role);
    setMessage("");
    setEditingUUID(uuid);
    setDrafts((prev) => ({
      ...prev,
      [uuid]: {
        role_name: role,
        blocked: adminMemberNumber(member.blocked) === 1,
        membership_expires_at: adminMemberDateOnly(member.expired_at) || (requiresExpiry ? adminMemberDefaultExpiry() : "")
      }
    }));
  }
  function updateDraft(uuid, patch) {
    setDrafts((prev) => {
      const current = prev[uuid] || {};
      const next = { ...current, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "role_name")) {
        if (adminMemberRoleRequiresExpiry(roleMetaByName, next.role_name) && !next.membership_expires_at) {
          next.membership_expires_at = adminMemberDefaultExpiry();
        }
        if (!adminMemberRoleRequiresExpiry(roleMetaByName, next.role_name)) {
          next.membership_expires_at = "";
        }
      }
      return { ...prev, [uuid]: next };
    });
  }
  function defaultCreateDraft() {
    const role = editableRoles[0] || "";
    const requiresExpiry = adminMemberRoleRequiresExpiry(roleMetaByName, role);
    return {
      email: "",
      password: "",
      nickname: "",
      realname: "",
      gender: "",
      role_name: role,
      membership_expires_at: requiresExpiry ? adminMemberDefaultExpiry() : "",
      blocked: false,
      email_subscription: true
    };
  }
  function beginCreate() {
    setMessage("");
    setEditingUUID("");
    setCreateDraft(defaultCreateDraft());
    setCreateOpen(true);
  }
  function updateCreateDraft(patch) {
    setCreateDraft((prev) => {
      const next = { ...prev, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "role_name")) {
        if (adminMemberRoleRequiresExpiry(roleMetaByName, next.role_name) && !next.membership_expires_at) {
          next.membership_expires_at = adminMemberDefaultExpiry();
        }
        if (!adminMemberRoleRequiresExpiry(roleMetaByName, next.role_name)) {
          next.membership_expires_at = "";
        }
      }
      return next;
    });
  }
  function toggleRoleFilter(role) {
    setRoleFilters((prev) => {
      const next = prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role];
      return next;
    });
  }
  function toggleStatusFilter(status) {
    setStatusFilters((prev) => {
      const next = prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status];
      return next;
    });
  }
  async function createMember() {
    const draft = createDraft || {};
    if (!adminMemberText(draft.email).trim() || !adminMemberText(draft.password) || !adminMemberText(draft.nickname).trim()) {
      setMessage("\uC774\uBA54\uC77C, \uBE44\uBC00\uBC88\uD638, \uB2C9\uB124\uC784\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");
      return;
    }
    if (!adminMemberText(draft.role_name).trim()) {
      setMessage("\uC0DD\uC131\uD560 \uD68C\uC6D0 \uB4F1\uAE09\uC744 \uC120\uD0DD\uD574\uC57C \uD569\uB2C8\uB2E4.");
      return;
    }
    if (adminMemberRoleRequiresExpiry(roleMetaByName, draft.role_name) && !adminMemberDateOnly(draft.membership_expires_at)) {
      setMessage("\uC120\uD0DD\uD55C \uD68C\uC6D0 \uB4F1\uAE09\uC740 \uB9CC\uB8CC\uC77C\uC744 \uC120\uD0DD\uD574\uC57C \uD569\uB2C8\uB2E4.");
      return;
    }
    setCreating(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("email", adminMemberText(draft.email).trim());
      form.append("password", adminMemberText(draft.password));
      form.append("nickname", adminMemberText(draft.nickname).trim());
      form.append("realname", adminMemberText(draft.realname).trim());
      form.append("gender", adminMemberText(draft.gender).trim());
      form.append("role_name", adminMemberText(draft.role_name).trim());
      form.append("blocked", draft.blocked ? "1" : "0");
      form.append("email_subscription", draft.email_subscription ? "1" : "0");
      form.append("membership_expires_at", adminMemberDateOnly(draft.membership_expires_at));
      const res = await fetch("/admin/ajax_create_admin_member/", {
        method: "POST",
        credentials: "same-origin",
        body: form
      });
      const payload = await res.json();
      if (!payload || payload.ok === false)
        throw new Error(payload && payload.error || "\uD68C\uC6D0 \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
      await reloadMembers();
      setCreateOpen(false);
      setCreateDraft(defaultCreateDraft());
      setMessage("\uD68C\uC6D0\uC774 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    } catch (error) {
      console.error(error);
      setMessage(error && error.message ? error.message : "\uD68C\uC6D0 \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
    } finally {
      setCreating(false);
    }
  }
  async function saveMember(member) {
    const uuid = adminMemberText(member.uuid);
    const draft = drafts[uuid] || {};
    if (!uuid)
      return;
    if (!adminMemberText(draft.role_name).trim()) {
      setMessage("\uBCC0\uACBD\uD560 \uD68C\uC6D0 \uB4F1\uAE09\uC744 \uC120\uD0DD\uD574\uC57C \uD569\uB2C8\uB2E4.");
      return;
    }
    if (adminMemberRoleRequiresExpiry(roleMetaByName, draft.role_name) && !adminMemberDateOnly(draft.membership_expires_at)) {
      setMessage("\uC120\uD0DD\uD55C \uD68C\uC6D0 \uB4F1\uAE09\uC740 \uB9CC\uB8CC\uC77C\uC744 \uC120\uD0DD\uD574\uC57C \uD569\uB2C8\uB2E4.");
      return;
    }
    setSavingUUID(uuid);
    setMessage("");
    try {
      const form = new FormData();
      form.append("uuid", uuid);
      form.append("role_name", adminMemberText(draft.role_name).trim());
      form.append("blocked", draft.blocked ? "1" : "0");
      form.append("membership_expires_at", adminMemberDateOnly(draft.membership_expires_at));
      const res = await fetch("/admin/ajax_update_admin_member/", {
        method: "POST",
        credentials: "same-origin",
        body: form
      });
      const payload = await res.json();
      if (!payload || payload.ok === false)
        throw new Error(payload && payload.error || "\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
      await reloadMembers();
      setEditingUUID("");
      setMessage("\uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    } catch (error) {
      console.error(error);
      setMessage(error && error.message ? error.message : "\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
    } finally {
      setSavingUUID("");
    }
  }
  async function deleteMember(member) {
    const uuid = adminMemberText(member.uuid);
    if (!uuid || !adminMemberIsBot(member))
      return;
    if (!window.confirm("Bot \uACC4\uC815\uC744 \uC0AD\uC81C \uCC98\uB9AC\uD560\uAE4C\uC694? \uC791\uC131\uC790 \uC774\uB825\uC744 \uBCF4\uC874\uD558\uAE30 \uC704\uD574 \uBE44\uD65C\uC131/\uCC28\uB2E8 \uC0C1\uD0DC\uB85C \uC804\uD658\uB429\uB2C8\uB2E4."))
      return;
    setDeletingUUID(uuid);
    setMessage("");
    try {
      const form = new FormData();
      form.append("uuid", uuid);
      const res = await fetch("/admin/ajax_delete_admin_member/", {
        method: "POST",
        credentials: "same-origin",
        body: form
      });
      const payload = await res.json();
      if (!payload || payload.ok === false)
        throw new Error(payload && payload.error || "\uC0AD\uC81C \uCC98\uB9AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
      await reloadMembers();
      setEditingUUID("");
      setMessage("Bot \uACC4\uC815\uC774 \uC0AD\uC81C \uCC98\uB9AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    } catch (error) {
      console.error(error);
      setMessage(error && error.message ? error.message : "\uC0AD\uC81C \uCC98\uB9AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
    } finally {
      setDeletingUUID("");
    }
  }
  function renderRoleCountCard(row, idx) {
    const title = adminMemberText(row && row.name) || "-";
    const count = adminMemberNumber(row && row.cnt);
    const teamCount = adminMemberNumber(row && row.team_counted_member_cnt);
    const showTeamCount = title === "\uC815\uD68C\uC6D0" || title === "VIP\uD68C\uC6D0";
    return /* @__PURE__ */ React.createElement("div", { key: `${title}_${idx}`, className: "basis-[220px] shrink-0 text-center" }, /* @__PURE__ */ React.createElement(Div_sub_card, { title, value: count, unit: "\uBA85", subtitle: showTeamCount ? "\uD300 \uBC18\uC601" : null, subvalue: showTeamCount ? teamCount : null, subunit: showTeamCount ? "\uBA85" : null }));
  }
  function renderTeamRoleCountCard(row, idx) {
    const title = adminMemberText(row && row.name) || "-";
    const count = adminMemberNumber(row && row.cnt);
    const teamCount = adminMemberNumber(row && row.team_count);
    return /* @__PURE__ */ React.createElement("div", { key: `team_${title}_${idx}`, className: "basis-[220px] shrink-0 text-center" }, /* @__PURE__ */ React.createElement(Div_sub_card, { title, value: count, unit: "\uBA85", subtitle: "\uD300 \uC218", subvalue: teamCount, subunit: "\uD300" }));
  }
  function renderStatusCountCard(row, idx) {
    const title = adminMemberText(row && row.name) || "-";
    const count = adminMemberNumber(row && row.cnt);
    return /* @__PURE__ */ React.createElement("div", { key: `status_${title}_${idx}`, className: "basis-[220px] shrink-0 text-center" }, /* @__PURE__ */ React.createElement(Div_sub_card, { title, value: count, unit: "\uBA85" }));
  }
  function toggleSort(key) {
    setSortState((prev) => {
      const next = {
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
      };
      loadMemberSections(["list"], { page: 1, sortState: next });
      return next;
    });
  }
  function renderSortHeader(label, key, alignClass) {
    const active = sortState.key === key;
    const icon = active ? sortState.direction === "asc" ? "\u25B2" : "\u25BC" : "\u2195";
    const headerClass = alignClass || "";
    const justifyClass = headerClass.includes("text-right") ? "justify-end" : "justify-start";
    return /* @__PURE__ */ React.createElement("th", { className: "px-2 py-2 whitespace-nowrap " + headerClass, "aria-sort": active ? sortState.direction === "asc" ? "ascending" : "descending" : "none" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "inline-flex w-full items-center gap-1 font-semibold hover:text-blue-700 " + justifyClass,
        onClick: () => toggleSort(key)
      },
      /* @__PURE__ */ React.createElement("span", null, label),
      /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400" }, icon)
    ));
  }
  function renderFilterGroup(label, children) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-w-0 space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-slate-600" }, label), /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-wrap items-center gap-2" }, children));
  }
  function renderCreatePanel() {
    if (!createOpen)
      return null;
    const roleSelectOptions = editableRoles;
    const paidRole = adminMemberRoleRequiresExpiry(roleMetaByName, createDraft.role_name);
    return /* @__PURE__ */ React.createElement("div", { className: "mb-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end" }, /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uC774\uBA54\uC77C"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm",
        disabled: creating,
        value: createDraft.email,
        onChange: (event) => updateCreateDraft({ email: event.target.value })
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uC784\uC2DC \uBE44\uBC00\uBC88\uD638"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm",
        disabled: creating,
        value: createDraft.password,
        onChange: (event) => updateCreateDraft({ password: event.target.value })
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uB2C9\uB124\uC784"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm",
        disabled: creating,
        value: createDraft.nickname,
        onChange: (event) => updateCreateDraft({ nickname: event.target.value })
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uC774\uB984"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm",
        disabled: creating,
        value: createDraft.realname,
        onChange: (event) => updateCreateDraft({ realname: event.target.value })
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uC131\uBCC4"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm",
        disabled: creating,
        value: createDraft.gender,
        onChange: (event) => updateCreateDraft({ gender: event.target.value })
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uD68C\uC6D0 \uB4F1\uAE09"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm",
        disabled: creating || roleSelectOptions.length === 0,
        value: createDraft.role_name,
        onChange: (event) => updateCreateDraft({ role_name: event.target.value })
      },
      roleSelectOptions.map((role) => /* @__PURE__ */ React.createElement("option", { key: role, value: role }, role))
    )), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uB9CC\uB8CC\uC77C"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100",
        disabled: !paidRole || creating,
        value: paidRole ? createDraft.membership_expires_at || adminMemberDefaultExpiry() : "",
        onChange: (event) => updateCreateDraft({ membership_expires_at: event.target.value })
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 lg:col-span-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        className: "rounded border-slate-300",
        disabled: creating,
        checked: !!createDraft.email_subscription,
        onChange: (event) => updateCreateDraft({ email_subscription: event.target.checked })
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-slate-700" }, "\uBA54\uC77C\uC218\uC2E0")), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 lg:col-span-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        className: "rounded border-slate-300 text-rose-600",
        disabled: creating,
        checked: !!createDraft.blocked,
        onChange: (event) => updateCreateDraft({ blocked: event.target.checked })
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-slate-700" }, "\uD68C\uC6D0 \uCC28\uB2E8")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-end gap-2 lg:col-span-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100",
        disabled: creating,
        onClick: () => setCreateOpen(false)
      },
      "\uCDE8\uC18C"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50",
        disabled: creating || roleSelectOptions.length === 0,
        onClick: createMember
      },
      creating ? "\uC0DD\uC131 \uC911" : "\uC0DD\uC131"
    ))));
  }
  function renderEditor(member) {
    const uuid = adminMemberText(member.uuid);
    const draft = drafts[uuid] || {};
    const lockedAdmin = adminMemberNumber(member.is_staff) === 1 || adminMemberNumber(member.is_superuser) === 1;
    const paidRole = adminMemberRoleRequiresExpiry(roleMetaByName, draft.role_name);
    const currentRole = adminMemberText(draft.role_name || member.role_name || member.role).trim();
    const roleSelectOptions = lockedAdmin ? [currentRole].filter(Boolean) : editableRoles;
    if (editingUUID !== uuid)
      return null;
    return /* @__PURE__ */ React.createElement("tr", { className: "border-b bg-slate-50" }, /* @__PURE__ */ React.createElement("td", { colSpan: "9", className: "px-4 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end" }, /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uD68C\uC6D0 \uB4F1\uAE09"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm",
        disabled: lockedAdmin || savingUUID === uuid || roleSelectOptions.length === 0,
        value: currentRole,
        onChange: (event) => updateDraft(uuid, { role_name: event.target.value })
      },
      roleSelectOptions.map((role) => /* @__PURE__ */ React.createElement("option", { key: role, value: role }, role))
    )), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col gap-1 lg:col-span-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-slate-600" }, "\uB9CC\uB8CC\uC77C"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        className: "w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100",
        disabled: !paidRole || lockedAdmin || savingUUID === uuid,
        value: paidRole ? draft.membership_expires_at || adminMemberDefaultExpiry() : "",
        onChange: (event) => updateDraft(uuid, { membership_expires_at: event.target.value })
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 lg:col-span-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        className: "rounded border-slate-300 text-rose-600",
        disabled: lockedAdmin || savingUUID === uuid,
        checked: !!draft.blocked,
        onChange: (event) => updateDraft(uuid, { blocked: event.target.checked })
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-slate-700" }, "\uD68C\uC6D0 \uCC28\uB2E8")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-end gap-2 lg:col-span-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100",
        disabled: savingUUID === uuid,
        onClick: () => setEditingUUID("")
      },
      "\uCDE8\uC18C"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50",
        disabled: lockedAdmin || savingUUID === uuid,
        onClick: () => saveMember(member)
      },
      savingUUID === uuid ? "\uC800\uC7A5 \uC911" : "\uC800\uC7A5"
    )))));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "webr-admin-members-dashboard grid w-full grid-cols-1 md:grid-cols-12 justify-center px-3 py-4 md:px-8 xl:px-12" }, /* @__PURE__ */ React.createElement(Div_operation_menu, null), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-10 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-full rounded-lg border border-gray-200 bg-white shadow" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg bg-white p-4 text-center md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uAC00\uC785\uC790 \uC218" }), /* @__PURE__ */ React.createElement("dl", { className: "mx-auto grid w-full grid-cols-1 gap-8 p-4 text-gray-900 md:grid-cols-4 md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uCD1D \uAC00\uC785\uC790 \uC218", value: adminMemberMetric(data, "val_member_total"), unit: "\uBA85" }), /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uC62C\uD574 \uAC00\uC785\uC790 \uC218", value: adminMemberMetric(data, "val_member_yearly"), unit: "\uBA85", subtitle: "\uC791\uB144", subvalue: adminMemberMetric(data, "val_member_yearly_last") }), /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uC774\uBC88 \uB2EC \uAC00\uC785\uC790 \uC218", value: adminMemberMetric(data, "val_member_monthly"), unit: "\uBA85", subtitle: "\uC9C0\uB09C \uB2EC", subvalue: adminMemberMetric(data, "val_member_monthly_last") }), /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uC624\uB298 \uAC00\uC785\uC790 \uC218", value: adminMemberMetric(data, "val_member_daily"), unit: "\uBA85", subtitle: "\uC5B4\uC81C", subvalue: adminMemberMetric(data, "val_member_daily_last") })))), /* @__PURE__ */ React.createElement("div", { className: "w-full rounded-lg border border-gray-200 bg-white shadow" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg bg-white p-4 text-center md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uB4F1\uAE09\uBCC4 \uBA64\uBC84 \uC218" }), /* @__PURE__ */ React.createElement("dl", { className: "mx-auto flex w-full flex-wrap justify-center gap-x-16 gap-y-8 p-4 text-gray-900 md:gap-x-8 md:p-8" }, roleCounts.map(renderRoleCountCard)))), /* @__PURE__ */ React.createElement("div", { className: "w-full rounded-lg border border-gray-200 bg-white shadow" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg bg-white p-4 text-center md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uAD00\uB9AC\uC790 \uACC4\uC815" }), /* @__PURE__ */ React.createElement("dl", { className: "mx-auto flex w-full flex-wrap justify-center gap-x-16 gap-y-8 p-4 text-gray-900 md:gap-x-8 md:p-8" }, adminRoleCounts.map(renderRoleCountCard)))), /* @__PURE__ */ React.createElement("div", { className: "w-full rounded-lg border border-gray-200 bg-white shadow" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg bg-white p-4 text-center md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uD300 \uAE30\uC900 \uD68C\uC6D0 \uC218" }), /* @__PURE__ */ React.createElement("dl", { className: "mx-auto flex w-full flex-wrap justify-center gap-x-16 gap-y-8 p-4 text-gray-900 md:gap-x-8 md:p-8" }, /* @__PURE__ */ React.createElement("div", { className: "basis-[220px] shrink-0 text-center" }, /* @__PURE__ */ React.createElement(Div_sub_card, { title: "\uD300 \uC18C\uC18D \uD569\uACC4", value: teamCountedTotal, unit: "\uBA85" })), teamRoleCounts.map(renderTeamRoleCountCard)))), /* @__PURE__ */ React.createElement("div", { className: "w-full rounded-lg border border-gray-200 bg-white shadow" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg bg-white p-4 text-center md:p-8" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uD68C\uC6D0 \uC0C1\uD0DC" }), /* @__PURE__ */ React.createElement("dl", { className: "mx-auto flex w-full flex-wrap justify-center gap-x-16 gap-y-8 p-4 text-gray-900 md:gap-x-8 md:p-8" }, statusCounts.map(renderStatusCountCard)))), /* @__PURE__ */ React.createElement("div", { className: "w-full rounded-lg border border-gray-200 bg-white shadow" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg bg-white p-4 text-center md:p-8" }, /* @__PURE__ */ React.createElement("dl", { className: "mx-auto flex w-full flex-col items-start justify-center p-4 text-gray-900" }, /* @__PURE__ */ React.createElement("ul", { className: "flex w-full flex-wrap border-b border-gray-200 text-center text-sm font-medium text-gray-500" }, /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => draw_chart((data || {}).list_role_daily || (data || {}).list_daily || {}, "graph_tab_daily") }, /* @__PURE__ */ React.createElement("div", { className: class_tab_inactive, id: "graph_tab_daily" }, "\uC77C")), /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => draw_chart((data || {}).list_role_monthly || (data || {}).list_monthly || {}, "graph_tab_monthly") }, /* @__PURE__ */ React.createElement("div", { className: class_tab_active, id: "graph_tab_monthly" }, "\uC6D4")), /* @__PURE__ */ React.createElement("li", { className: "me-2", onClick: () => draw_chart((data || {}).list_role_yearly || (data || {}).list_yearly || {}, "graph_tab_yearly") }, /* @__PURE__ */ React.createElement("div", { className: class_tab_inactive, id: "graph_tab_yearly" }, "\uB144"))), /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-left text-xs font-medium text-slate-500" }, "\uC77C/\uC6D4/\uB144 \uD1B5\uACC4\uB294 \uAC01 \uAE30\uAC04\uC758 \uB9C8\uC9C0\uB9C9 \uC2DC\uC810 \uAE30\uC900\uC785\uB2C8\uB2E4. \uB2F9\uC6D4 \uAC12\uC740 \uC6D4\uB9D0 \uC804\uC5D0 \uB9CC\uB8CC\uB418\uB294 \uC720\uB8CC\uAD8C\uC744 \uC81C\uC678\uD558\uBBC0\uB85C \uC0C1\uB2E8\uC758 \uD604\uC7AC \uB4F1\uAE09 \uC218\uC640 \uB2E4\uB97C \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { id: "div_statistics_graph", className: "h-[500px] w-full p-8" })))), /* @__PURE__ */ React.createElement("div", { className: "w-full rounded-lg border border-gray-200 bg-white shadow" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg bg-white p-4 md:p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between" }, /* @__PURE__ */ React.createElement(Div_sub_title, { title: "\uD68C\uC6D0 \uBAA9\uB85D" }), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-end gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm text-slate-500" }, "\uCD1D ", adminMemberFormatNumber(totalRows), "\uBA85 \uC911 ", pagedMembers.length > 0 ? `${adminMemberFormatNumber(startIdx + 1)}-${adminMemberFormatNumber(startIdx + pagedMembers.length)}` : 0, "\uBA85 \uD45C\uC2DC"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700",
      onClick: () => createOpen ? setCreateOpen(false) : beginCreate()
    },
    createOpen ? "\uCD94\uAC00 \uB2EB\uAE30" : "\uD68C\uC6D0 \uCD94\uAC00"
  ))), renderCreatePanel(), /* @__PURE__ */ React.createElement("div", { className: "mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm" }, /* @__PURE__ */ React.createElement("h3", { className: "mb-3 text-sm font-bold text-slate-800" }, "\uD68C\uC6D0 \uAC80\uC0C9"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-full md:max-w-[560px]" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "min-h-[40px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
      placeholder: "\uC774\uBA54\uC77C / \uB2C9\uB124\uC784 / \uC774\uB984 \uAC80\uC0C9",
      value: searchDraft,
      onChange: (event) => setSearchDraft(event.target.value),
      onKeyDown: (event) => {
        if (event.key !== "Enter")
          return;
        applyMemberSearch(event.currentTarget.value);
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, paymentFilterOptions.map((option) => /* @__PURE__ */ React.createElement("button", { key: option.value, type: "button", "aria-pressed": paymentFilter === option.value, className: "inline-flex min-h-[36px] items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-semibold " + (paymentFilter === option.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"), onClick: () => {
    setPaymentFilter(option.value);
  } }, /* @__PURE__ */ React.createElement("span", null, option.label), /* @__PURE__ */ React.createElement("span", { className: "rounded bg-white/70 px-1.5 py-0.5 text-[11px] text-slate-500" }, adminMemberFormatNumber(option.count))))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "inline-flex min-h-[36px] items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100", onClick: downloadFilteredMembers }, "\uBAA9\uB85D \uB2E4\uC6B4\uB85C\uB4DC")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-slate-50 p-3 xl:grid-cols-[1.05fr_1fr_1fr]" }, renderFilterGroup("\uAD8C\uD55C \uC0AC\uC6A9", contextFilterOptions.map((option) => /* @__PURE__ */ React.createElement("button", { key: option.value, type: "button", "aria-pressed": contextFilter === option.value, className: "inline-flex min-h-[38px] items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-semibold " + (contextFilter === option.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"), onClick: () => {
    setContextFilter(option.value);
  } }, /* @__PURE__ */ React.createElement("span", null, option.label), /* @__PURE__ */ React.createElement("span", { className: "rounded bg-white/70 px-1.5 py-0.5 text-[11px] text-slate-500" }, adminMemberFormatNumber(option.count))))), renderFilterGroup("\uB4F1\uAE09", [/* @__PURE__ */ React.createElement("label", { key: "__all_roles", className: "inline-flex min-h-[38px] items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", className: "rounded border-slate-300", checked: roleFilters.length === 0, onChange: () => {
    setRoleFilters([]);
  } }), /* @__PURE__ */ React.createElement("span", null, "\uC804\uCCB4 ", adminMemberFormatNumber(memberFilterCount("role", "all", totalRows)))), ...memberRoleFilterOptions.map((role) => /* @__PURE__ */ React.createElement("label", { key: role.value, className: "inline-flex min-h-[38px] items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", className: "rounded border-slate-300", checked: roleFilters.includes(role.value), onChange: () => toggleRoleFilter(role.value) }), /* @__PURE__ */ React.createElement("span", null, role.value, " ", adminMemberFormatNumber(role.count))))]), renderFilterGroup("\uC0C1\uD0DC", [/* @__PURE__ */ React.createElement("label", { key: "__all_status", className: "inline-flex min-h-[38px] items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", className: "rounded border-slate-300", checked: statusFilters.length === 0, onChange: () => {
    setStatusFilters([]);
  } }), /* @__PURE__ */ React.createElement("span", null, "\uC804\uCCB4 ", adminMemberFormatNumber(memberFilterCount("status", "all", totalRows)))), ...statusFilterOptions.map((status) => /* @__PURE__ */ React.createElement("label", { key: status.value, className: "inline-flex min-h-[38px] items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", className: "rounded border-slate-300", checked: statusFilters.includes(status.value), onChange: () => toggleStatusFilter(status.value) }), /* @__PURE__ */ React.createElement("span", null, status.label, " ", adminMemberFormatNumber(status.count))))])), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "inline-flex min-h-[40px] min-w-[96px] items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50", disabled: listLoading || pendingPage !== 0 || pendingSearch, onClick: () => applyMemberSearch() }, pendingSearch ? /* @__PURE__ */ React.createElement("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-white", "aria-hidden": "true" }) : null, /* @__PURE__ */ React.createElement("span", null, "\uAC80\uC0C9"))), message ? /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-blue-700" }, message) : null, anyLoading ? /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-slate-500" }, "\uD68C\uC6D0 \uB370\uC774\uD130\uB97C \uC139\uC158\uBCC4\uB85C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.") : null, sectionErrorCount > 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium text-rose-600" }, "\uC77C\uBD80 \uC139\uC158\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.") : null)), /* @__PURE__ */ React.createElement("div", { className: "w-full overflow-x-hidden" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs text-gray-600 md:text-sm" }, /* @__PURE__ */ React.createElement("thead", { className: "border-b bg-gray-50" }, /* @__PURE__ */ React.createElement("tr", null, renderSortHeader("No", "no"), renderSortHeader("\uAC00\uC785\uC77C", "date_joined"), renderSortHeader("\uC774\uBA54\uC77C", "email"), renderSortHeader("\uB2C9\uB124\uC784", "nickname"), renderSortHeader("\uC774\uB984", "realname"), renderSortHeader("\uB4F1\uAE09/\uAD8C\uD55C", "role"), renderSortHeader("\uB9CC\uB8CC\uC77C", "expired_at"), renderSortHeader("\uC0C1\uD0DC", "status"), /* @__PURE__ */ React.createElement("th", { className: "px-2 py-2 text-right whitespace-nowrap" }, "\uAD00\uB9AC"))), /* @__PURE__ */ React.createElement("tbody", null, tableLoading ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "9", className: "px-3 py-6 text-center text-gray-400" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("span", null, "\uD68C\uC6D0 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.")))) : pagedMembers.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "9", className: "px-3 py-6 text-center text-gray-400" }, "\uC870\uAC74\uC5D0 \uD574\uB2F9\uD558\uB294 \uD68C\uC6D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.")) : null, !tableLoading && pagedMembers.map((member, idx) => {
    const rowUUID = adminMemberText(member.uuid);
    const displayRole = adminMemberDisplayRole(member);
    const teamLabel = adminMemberText(member.team_role_label).trim();
    const contextLabel = adminMemberContextLabel(member);
    const entitlementLines = adminMemberEntitlementLines(member);
    const paymentCount = adminMemberPaymentCount(member);
    const paymentHistory = adminMemberPaymentHistory(member);
    const authLabel = adminMemberAuthLabel(member);
    const googleEmail = adminMemberText(member.google_email).trim();
    const deletedBot = adminMemberIsBot(member) && adminMemberNumber(member.is_active) === 0 && adminMemberNumber(member.blocked) === 1;
    const canDeleteBot = adminMemberIsBot(member) && !deletedBot && adminMemberNumber(member.is_staff) !== 1 && adminMemberNumber(member.is_superuser) !== 1;
    const expanded = expandedUUID === rowUUID;
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: member.uuid || member.email || idx }, /* @__PURE__ */ React.createElement("tr", { className: "border-b hover:bg-gray-50" }, /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2" }, startIdx + idx + 1), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2 whitespace-nowrap" }, member.date_joined), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2 whitespace-normal break-all" }, member.email), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2 whitespace-nowrap" }, member.nickname), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2 whitespace-nowrap" }, member.realname), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2 whitespace-normal" }, /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-wrap items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold " + adminMemberRoleBadgeClass(displayRole) }, displayRole || "-"), contextLabel ? /* @__PURE__ */ React.createElement("span", { title: contextLabel, className: "inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold " + adminMemberContextBadgeClass(member) }, adminMemberContextShortLabel(member)) : null, paymentCount > 0 ? /* @__PURE__ */ React.createElement("span", { className: "inline-flex w-fit rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-700" }, "\uACB0\uC81C ", adminMemberFormatNumber(paymentCount), "\uD68C") : null, teamLabel ? /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-medium text-slate-500" }, teamLabel) : null, entitlementLines.map((line) => /* @__PURE__ */ React.createElement("span", { key: line, className: "rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500" }, line)))), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2 whitespace-nowrap" }, adminMemberDateOnly(member.expired_at) || "-"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2 whitespace-nowrap" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold " + adminMemberStatusBadgeClass(member) }, adminMemberStatusText(member))), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-2 text-right whitespace-nowrap" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50", onClick: () => setExpandedUUID(expanded ? "" : rowUUID) }, expanded ? "\uC811\uAE30" : "\uC0C1\uC138"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "ml-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50", disabled: deletingUUID === rowUUID, onClick: () => editingUUID === rowUUID ? setEditingUUID("") : beginEdit(member) }, editingUUID === rowUUID ? "\uB2EB\uAE30" : "\uD3B8\uC9D1"), canDeleteBot ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "ml-2 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50", disabled: deletingUUID === rowUUID, onClick: () => deleteMember(member) }, deletingUUID === rowUUID ? "\uC0AD\uC81C \uC911" : "\uC0AD\uC81C") : null, deletedBot ? /* @__PURE__ */ React.createElement("span", { className: "ml-2 text-xs font-semibold text-slate-400" }, "\uC0AD\uC81C\uB428") : null)), expanded ? /* @__PURE__ */ React.createElement("tr", { className: "border-b bg-slate-50" }, /* @__PURE__ */ React.createElement("td", { colSpan: "9", className: "px-3 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-2 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-600 md:grid-cols-3 xl:grid-cols-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uAC00\uC785\uC77C"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, member.date_joined || "-")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uC774\uBA54\uC77C"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 break-all text-slate-800" }, member.email || "-")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uB85C\uADF8\uC778/\uC5F0\uB3D9"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 break-all text-slate-800" }, authLabel, googleEmail ? ` / ${googleEmail}` : "")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uB2C9\uB124\uC784"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, member.nickname || "-")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uB9CC\uB8CC\uC77C"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, adminMemberDateOnly(member.expired_at) || "-")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uC0C1\uD0DC"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, adminMemberStatusText(member))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uBA54\uC77C\uC218\uC2E0"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, adminMemberNumber(member.email_subscription) === 1 ? "Y" : "N")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uC131\uBCC4"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, member.gender || "-")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uAD8C\uD55C \uC0C1\uC138"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, contextLabel || "-")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uBCF4\uC874/\uAC1C\uC778\uAD8C"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, entitlementLines.length ? entitlementLines.join(" / ") : "-")), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-3 xl:col-span-5" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-500" }, "\uACB0\uC81C \uC774\uB825"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-slate-800" }, adminMemberPaymentSummary(member)), paymentHistory.length ? /* @__PURE__ */ React.createElement("div", { className: "mt-2 overflow-x-auto rounded-md border border-slate-200" }, /* @__PURE__ */ React.createElement("table", { className: "min-w-full text-left text-[11px]" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-50 text-slate-500" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "px-2 py-1" }, "\uACB0\uC81C\uC77C"), /* @__PURE__ */ React.createElement("th", { className: "px-2 py-1" }, "\uC0C1\uD488"), /* @__PURE__ */ React.createElement("th", { className: "px-2 py-1 text-right" }, "\uAE08\uC561"), /* @__PURE__ */ React.createElement("th", { className: "px-2 py-1" }, "\uC8FC\uBB38"))), /* @__PURE__ */ React.createElement("tbody", null, paymentHistory.map((payment, pidx) => /* @__PURE__ */ React.createElement("tr", { key: `${payment && payment.order_id || pidx}`, className: "border-t border-slate-100" }, /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 whitespace-nowrap" }, adminMemberText(payment && payment.paid_at) || "-"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1" }, adminMemberText(payment && (payment.product_name || payment.product)) || "-"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-right whitespace-nowrap" }, adminMemberFormatNumber(payment && payment.amount), "\uC6D0"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 break-all" }, adminMemberText(payment && payment.order_id) || "-")))))) : /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-slate-400" }, "\uACB0\uC81C \uB0B4\uC5ED \uC5C6\uC74C"))))) : null, renderEditor(member));
	  })))), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex items-center justify-between text-xs md:text-sm" }, /* @__PURE__ */ React.createElement("div", null, "\uD398\uC774\uC9C0 ", currentPage, " / ", totalPages), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, renderPageButton("\uC774\uC804", currentPage - 1, currentPage <= 1), renderPageButton("\uB2E4\uC74C", currentPage + 1, currentPage >= totalPages)))))));
  }
get_main = async function() {
  adminMembersInjectDashboardStyles();
  const mount = document.getElementById("div_main");
  if (typeof Div_main_skeleton === "function") {
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_skeleton, null), mount);
  }
  const parts = await Promise.all(ADMIN_MEMBER_SECTION_NAMES.map((section) => adminMembersFetchSection(section).catch((error) => {
    console.error(error);
    return {};
  })));
  const data = parts.reduce((merged, payload) => adminMembersMergeData(merged, payload), {});
  ReactDOM.render(/* @__PURE__ */ React.createElement(AdminMembersManageMain, { data, skipInitialLoad: true }), mount);
};
