(function () {
  const ENDPOINT = "/admin/ajax_get_admin_member_payment_history/";
  const STYLE_ID = "webr-admin-member-payment-history-lazy-20260620-1220";
  let scheduled = false;

  function currentMode() {
    const path = window.location.pathname || "";
    const sub = String(window.sub || "");
    return sub === "members_list" || path.indexOf("/admin/members/list/") === 0 ? "list" : "overview";
  }

  function text(value) {
    if (value === null || value === void 0) return "";
    return String(value);
  }

  function normalized(value) {
    return text(value).trim().toLowerCase();
  }

  function number(value) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatNumber(value) {
    return number(value).toLocaleString("ko-KR");
  }

  function collection(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return Object.values(value);
    return [];
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".webr-admin-member-payment-history-detail{margin-top:.5rem;overflow-x:auto;border:1px solid #e2e8f0;border-radius:.375rem;}",
      ".webr-admin-member-payment-history-detail table{min-width:760px;width:100%;font-size:11px;text-align:left;}",
      ".webr-admin-member-payment-history-detail th{background:#f8fafc;color:#64748b;font-weight:700;}",
      ".webr-admin-member-payment-history-detail th,.webr-admin-member-payment-history-detail td{padding:.35rem .5rem;border-top:1px solid #f1f5f9;vertical-align:top;}",
      ".webr-admin-member-payment-history-detail thead th{border-top:0;}",
      ".webr-admin-member-payment-history-loading{display:inline-flex;align-items:center;gap:.35rem;color:#64748b;}",
      ".webr-admin-member-payment-history-loading::before{content:'';width:.7rem;height:.7rem;border-radius:999px;border:2px solid #cbd5e1;border-top-color:#2563eb;animation:webr-admin-member-payment-spin .8s linear infinite;}",
      "@keyframes webr-admin-member-payment-spin{to{transform:rotate(360deg);}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function currentMembers() {
    const data = window.__webrAdminMembersLastData || {};
    return collection(data.list_members);
  }

  function memberIdentity(member) {
    return {
      email: normalized(member && member.email),
      uuid: normalized(member && member.uuid)
    };
  }

  function findMemberByIdentity(identity) {
    const email = normalized(identity && identity.email);
    const uuid = normalized(identity && identity.uuid);
    if (!email && !uuid) return { email: "", uuid: "" };
    const matched = currentMembers().find(function (member) {
      const candidate = memberIdentity(member);
      return uuid && candidate.uuid === uuid || email && candidate.email === email;
    });
    if (matched) {
      const identityFromMember = memberIdentity(matched);
      return {
        email: identityFromMember.email || email,
        uuid: identityFromMember.uuid || uuid
      };
    }
    return { email: email, uuid: uuid };
  }

  function cellText(row, index) {
    if (!row || !row.children || !row.children[index]) return "";
    return text(row.children[index].textContent).trim();
  }

  function labeledValue(root, labelText) {
    if (!root) return "";
    const labels = Array.from(root.querySelectorAll("span"));
    for (const label of labels) {
      if (text(label.textContent).trim() !== labelText) continue;
      const parent = label.parentElement;
      if (!parent) continue;
      const valueNode = Array.from(parent.children || []).find(function (child) {
        return child !== label && child.tagName === "DIV";
      });
      return text(valueNode && valueNode.textContent).trim();
    }
    return "";
  }

  function identityFromRows(expandedRow) {
    const displayRow = expandedRow && expandedRow.previousElementSibling;
    const datasetIdentity = {
      email: normalized(displayRow && displayRow.dataset && displayRow.dataset.webrMemberEmail),
      uuid: normalized(displayRow && displayRow.dataset && displayRow.dataset.webrMemberUuid)
    };
    if (datasetIdentity.email || datasetIdentity.uuid) return findMemberByIdentity(datasetIdentity);
    const expandedDatasetIdentity = {
      email: normalized(expandedRow && expandedRow.dataset && expandedRow.dataset.webrMemberEmail),
      uuid: normalized(expandedRow && expandedRow.dataset && expandedRow.dataset.webrMemberUuid)
    };
    if (expandedDatasetIdentity.email || expandedDatasetIdentity.uuid) return findMemberByIdentity(expandedDatasetIdentity);
    const emailFromDetail = normalized(labeledValue(expandedRow, "이메일"));
    if (emailFromDetail) return findMemberByIdentity({ email: emailFromDetail });
    const emailFromCell = normalized(cellText(displayRow, 2));
    if (emailFromCell) return findMemberByIdentity({ email: emailFromCell });
    return { email: "", uuid: "" };
  }

  function paymentBlockFromExpandedRow(expandedRow) {
    if (!expandedRow || !expandedRow.previousElementSibling) return null;
    const candidates = expandedRow.querySelectorAll("td[colspan] div");
    for (const candidate of candidates) {
      const label = candidate.querySelector("span");
      if (label && text(label.textContent).trim() === "결제 이력") {
        return candidate;
      }
    }
    return null;
  }

  function annotateRows() {
    const membersByEmail = new Map();
    const membersByUUID = new Map();
    currentMembers().forEach(function (member) {
      const identity = memberIdentity(member);
      if (identity.email) membersByEmail.set(identity.email, identity);
      if (identity.uuid) membersByUUID.set(identity.uuid, identity);
    });
    const rows = Array.from(document.querySelectorAll("#div_main tbody > tr"));
    rows.forEach(function (row) {
      if (!row || row.querySelector("td[colspan]")) return;
      const email = normalized(cellText(row, 2));
      const identity = membersByEmail.get(email) || membersByUUID.get(normalized(row.dataset && row.dataset.webrMemberUuid));
      if (!identity) return;
      row.dataset.webrMemberEmail = identity.email;
      row.dataset.webrMemberUuid = identity.uuid;
      const expandedRow = row.nextElementSibling;
      if (expandedRow && expandedRow.querySelector("td[colspan]")) {
        expandedRow.dataset.webrMemberEmail = identity.email;
        expandedRow.dataset.webrMemberUuid = identity.uuid;
      }
    });
  }

  function resetBlock(block) {
    block.textContent = "";
    const label = document.createElement("span");
    label.className = "font-semibold text-slate-500";
    label.textContent = "결제 이력";
    block.appendChild(label);
    return block;
  }

  function appendSummary(block, payload) {
    const summary = document.createElement("div");
    summary.className = "mt-1 text-slate-800";
    const parts = [formatNumber(payload.payment_count) + "회"];
    if (number(payload.payment_amount_total) > 0) {
      parts.push("총 " + formatNumber(payload.payment_amount_total) + "원");
    }
    if (text(payload.payment_last_paid_at).trim()) {
      parts.push("최근 " + text(payload.payment_last_paid_at).trim());
    }
    summary.textContent = parts.join(" / ");
    block.appendChild(summary);
  }

  function appendEmpty(block, message, tone) {
    const empty = document.createElement("div");
    empty.className = "mt-2 " + (tone === "error" ? "text-rose-500" : "text-slate-400");
    empty.textContent = message;
    block.appendChild(empty);
  }

  function appendHistoryTable(block, rows) {
    const wrap = document.createElement("div");
    wrap.className = "webr-admin-member-payment-history-detail";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["결제일", "상품", "결제수단", "금액", "주문"].forEach(function (label) {
      const th = document.createElement("th");
      th.textContent = label;
      if (label === "금액") th.style.textAlign = "right";
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    rows.forEach(function (payment, index) {
      const tr = document.createElement("tr");
      tr.className = index === 0 ? "" : "border-t border-slate-100";
      [
        text(payment && payment.paid_at) || "-",
        text(payment && (payment.product_name || payment.product)) || "-",
        text(payment && payment.method) || "-",
        formatNumber(payment && payment.amount) + "원",
        text(payment && payment.order_id) || "-"
      ].forEach(function (value, col) {
        const td = document.createElement("td");
        td.textContent = value;
        if (col === 3) {
          td.style.textAlign = "right";
          td.style.whiteSpace = "nowrap";
        }
        if (col === 4) td.style.wordBreak = "break-all";
        if (col === 0) td.style.whiteSpace = "nowrap";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    block.appendChild(wrap);
  }

  function renderLoading(block) {
    resetBlock(block);
    const loading = document.createElement("div");
    loading.className = "webr-admin-member-payment-history-loading mt-2";
    loading.textContent = "결제 내역을 불러오는 중입니다.";
    block.appendChild(loading);
  }

  function renderPayload(block, payload) {
    resetBlock(block);
    if (!payload || payload.ok === false) {
      appendEmpty(block, text(payload && payload.error) || "결제 내역을 불러오지 못했습니다.", "error");
      return;
    }
    const rows = collection(payload.payment_history);
    appendSummary(block, payload);
    if (rows.length) {
      appendHistoryTable(block, rows);
      return;
    }
    appendEmpty(block, "결제 내역 없음");
  }

  async function fetchPaymentHistory(block, member) {
    const key = (member.uuid || "") + "|" + (member.email || "");
    if (!member.email && !member.uuid) {
      resetBlock(block);
      appendEmpty(block, "결제 내역을 불러올 회원 정보를 찾지 못했습니다.", "error");
      return;
    }
    if (block.dataset.webrPaymentHistoryKey === key && block.dataset.webrPaymentHistoryLoaded === "1") return;
    block.dataset.webrPaymentHistoryKey = key;
    block.dataset.webrPaymentHistoryLoaded = "0";
    renderLoading(block);
    const body = new URLSearchParams();
    if (member.uuid) body.set("uuid", member.uuid);
    if (member.email) body.set("email", member.email);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        credentials: "same-origin",
        body: body
      });
      const payload = await res.json();
      block.dataset.webrPaymentHistoryLoaded = "1";
      renderPayload(block, payload || {});
    } catch (error) {
      console.error(error);
      block.dataset.webrPaymentHistoryLoaded = "1";
      renderPayload(block, { ok: false, error: "결제 내역을 불러오지 못했습니다." });
    }
  }

  function enhanceExpandedRows() {
    if (currentMode() !== "list") return;
    injectStyle();
    annotateRows();
    const expandedRows = Array.from(document.querySelectorAll("#div_main tr.bg-slate-50"));
    expandedRows.forEach(function (expandedRow) {
      const block = paymentBlockFromExpandedRow(expandedRow);
      if (!block) return;
      const member = identityFromRows(expandedRow);
      fetchPaymentHistory(block, member);
    });
  }

  function scheduleEnhance(delay) {
    window.setTimeout(function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        enhanceExpandedRows();
      });
    }, delay || 0);
  }

  document.addEventListener("click", function (event) {
    const button = event.target && event.target.closest ? event.target.closest("button") : null;
    if (!button || text(button.textContent).trim() !== "상세") return;
    scheduleEnhance(0);
    scheduleEnhance(80);
  }, true);

  const observer = new MutationObserver(function () {
    scheduleEnhance(20);
  });

  function startObserver() {
    const root = document.getElementById("div_main") || document.body;
    observer.observe(root, { childList: true, subtree: true });
    scheduleEnhance(100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  } else {
    startObserver();
  }
})();
