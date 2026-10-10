(function () {
  'use strict';
  const t = source => window.WebRI18n?.t(source) || source;
  const label = (node, source) => { node.dataset.paymentLabel = source; node.textContent = t(source); return node; };
  const element = (tag, source) => source ? label(document.createElement(tag), source) : document.createElement(tag);
  const money = minor => (minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
  const kinds = { one_time: '단건 결제', subscription: '정기결제' };
  const statusNames = { NEW: '신규', COMPLETED: '완료', CREATED: '생성', APPROVED: '승인', PENDING: '대기', REVIEW_REQUIRED: '확인 필요', REFUNDED: '환불', REVERSED: '취소', FAILED: '실패', DENIED: '거절', DECLINED: '거절' };
  let closed = false;
  const active = new Set();
  const reports = new Set();
  const bootstrap = window.WEBR_ADMIN_SNAPSHOTS;
  const owner = bootstrap?.schema === 1 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bootstrap.owner || '') ? bootstrap.owner : '';
  function retire() {
    if (closed) return;
    closed = true;
    active.forEach(controller => controller.abort()); active.clear();
    reports.forEach(clear => clear()); reports.clear();
    document.getElementById('paypal-admin-orders')?.remove();
    if (window.WebRAdminSnapshots?.stop) window.WebRAdminSnapshots.stop();
    else document.getElementById('div_main')?.replaceChildren();
  }
  function authorized() {
    if (!closed && owner && window.WEBR_ADMIN_SNAPSHOTS === bootstrap && bootstrap.schema === 1 && bootstrap.owner === owner && document.getElementById('webr-admin-read-status')?.getAttribute('data-admin-read-state') !== 'denied') return true;
    retire(); return false;
  }
  window.addEventListener('webr:language-change', () => {
    if (!authorized()) return;
    document.querySelectorAll('#paypal-admin-orders [data-payment-label]').forEach(node => { node.textContent = t(node.dataset.paymentLabel); });
  });
  window.addEventListener('pagehide', retire, { once: true });
  window.addEventListener('pageshow', event => {
    if (event.persisted && !window.WebRAdminSnapshots) window.location.reload();
  });

  function mount() {
    const main = document.getElementById('div_main');
    if (!authorized() || !main || document.getElementById('paypal-admin-orders')) return;
    const panel = element('section');
    panel.id = 'paypal-admin-orders'; panel.dataset.webrUi = '';
    panel.style.cssText = 'margin:28px 0;padding:20px;border:1px solid #dbeafe;border-radius:12px;background:#fff;max-width:100%;';
    const heading = element('h2'); heading.textContent = 'PayPal · USD';
    const note = element('p', 'PayPal 단건 결제와 정기결제는 USD로 별도 집계합니다.');
    const dateNote = element('p', '단건은 회원 권한 반영일, 정기결제는 결제일 기준입니다. 완료일이 없는 내역은 생성일로 표시합니다.');
    dateNote.style.cssText = 'color:#64748b;font-size:13px;';
    const form = element('form'); form.style.cssText = 'display:flex;flex-wrap:wrap;align-items:end;gap:12px;margin:16px 0;';
    const from = element('input'), to = element('input'), environment = element('select');
    from.type = to.type = 'date'; from.required = to.required = true;
    const dateParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
    const routeMonth = location.pathname.match(/^\/admin\/balance_account\/(\d{4})\/(\d{1,2})\//);
    const year = routeMonth ? Number(routeMonth[1]) : Number(dateParts.find(p => p.type === 'year').value);
    const month = routeMonth ? Number(routeMonth[2]) : Number(dateParts.find(p => p.type === 'month').value);
    from.value = year + '-' + String(month).padStart(2, '0') + '-01';
    to.value = year + '-' + String(month).padStart(2, '0') + '-' + new Date(year, month, 0).getDate();
    [['live', '실제 결제'], ['sandbox', '테스트 결제']].forEach(([value, name]) => { const option = element('option', name); option.value = value; environment.append(option); });
    for (const [name, input] of [['시작일', from], ['종료일', to], ['환경', environment]]) {
      const wrapper = element('label'); wrapper.style.cssText = 'display:grid;gap:6px;'; wrapper.append(element('span', name), input); form.append(wrapper);
      input.style.cssText = 'padding:9px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;';
    }
    const submit = element('button', '조회'); submit.type = 'submit';
    submit.style.cssText = 'padding:10px 18px;border:0;border-radius:8px;background:#2563eb;color:white;'; form.append(submit);
    const state = element('p'); state.setAttribute('role', 'status'); state.setAttribute('aria-live', 'polite');
    const output = element('div'); output.style.overflowX = 'auto';
    panel.append(heading, note, dateNote, form, state, output); main.append(panel);
    let sequence = 0, displayedPage = 1, controller, lastReport = null, displayedScope = '';
    reports.add(() => { lastReport = null; displayedScope = ''; output.replaceChildren(); });
    window.addEventListener('webr:language-change', () => {
      if (authorized() && panel.isConnected && lastReport) render(lastReport);
    });

    function table(headers) {
      const result = element('table'); result.style.cssText = 'width:100%;font:13px system-ui;border-collapse:collapse;margin:12px 0;';
      const head = result.createTHead().insertRow();
      headers.forEach(source => { const cell = element('th', source); cell.scope = 'col'; cell.style.cssText = 'text-align:start;padding:10px;border-bottom:1px solid #e2e8f0;'; head.append(cell); });
      return result;
    }
    function cells(row, values) {
      values.forEach(value => { const cell = row.insertCell(); cell.textContent = value; cell.dataset.webrUserContent = ''; cell.style.cssText = 'padding:10px;border-bottom:1px solid #e2e8f0;overflow-wrap:anywhere;'; });
    }
    function render(report) {
      if (!authorized() || !panel.isConnected) return;
      const content = element('div');
      const period = element('p'); period.textContent = report.period.from + ' – ' + report.period.to + ' · ' + t(report.revenue ? '실제 결제' : '테스트 결제'); content.append(period);
      if (!report.revenue) content.append(element('p', '테스트 결제입니다. 실제 매출과 정산액에 포함되지 않습니다.'));
      const totals = table(['결제 방식', '완료 금액', '완료 건수', '권한 반영', '권한 확인 필요', '결제 확인 필요']);
      report.totals.forEach(row => cells(totals.insertRow(), [t(kinds[row.kind] || row.kind), money(row.completed_amount_minor), row.completed_count, row.membership_applied_count, row.membership_pending_count, row.review_count]));
      content.append(totals, element('p', 'PayPal 수수료와 실제 입금액은 아직 확인할 수 없습니다. 원화 정산의 수수료율을 적용하지 않습니다.'));
      const uncertain = report.totals.reduce((count, row) => count + row.unconfirmed_date_count, 0);
      if (uncertain) { const p = element('p', '완료일을 확인할 수 없는 내역이 있습니다.'); p.append(document.createTextNode(' (' + uncertain + ')')); content.append(p); }
      if (report.products.length) {
        content.append(element('h3', '상품별 완료 결제'));
        const products = table(['결제 방식', '상품', '완료 금액', '건수']);
        report.products.forEach(row => cells(products.insertRow(), [t(kinds[row.kind]), row.product_name || row.product_id, money(row.amount_minor), row.count])); content.append(products);
      }
      content.append(element('h3', '결제 내역'));
      if (!report.payments.length) content.append(element('p', '선택한 기간에 기록된 PayPal 결제가 없습니다.'));
      else {
        const payments = table(['일자', '결제 방식', '주문 번호', '계정', '상품', 'USD', '결제 상태', '회원 권한 반영']);
        report.payments.forEach(row => {
          const date = new Intl.DateTimeFormat(undefined, { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.confirmed_at || row.created_at));
          const basis = row.confirmed_at ? t(row.time_basis === 'membership_applied' ? '권한 반영일' : '결제일') : t('생성일');
          let grant = row.grant_status === 'applied' && row.granted ? t('반영됨') + (row.grant_role ? ' · ' + row.grant_role : '') : row.grant_status === 'canceled' ? t('취소됨') : t('미반영');
          if (row.review_required) grant += ' · ' + t('확인 필요');
          cells(payments.insertRow(), [date + ' · ' + basis, t(kinds[row.kind]) + (row.interval ? ' · ' + t(row.interval === 'month' ? '월간' : '연간') : ''), row.id, row.owner_id || t('확인 필요'), row.product_name || row.product_id, money(row.amount_minor), t(statusNames[row.status] || row.status), grant]);
        }); content.append(payments);
      }
      const navigation = element('div'); navigation.style.cssText = 'display:flex;gap:12px;align-items:center;';
      const previous = element('button', '이전'), next = element('button', '다음'); previous.type = next.type = 'button';
      const renderedPage = displayedPage;
      previous.disabled = renderedPage <= 1; next.disabled = !report.has_more;
      previous.addEventListener('click', () => load(renderedPage - 1)); next.addEventListener('click', () => load(renderedPage + 1));
      const count = element('span'); count.textContent = report.total.toLocaleString() + ' / ' + renderedPage;
      navigation.append(previous, count, next); content.append(navigation); output.replaceChildren(content);
    }
    async function load(page) {
      if (!authorized() || !panel.isConnected) return;
      controller?.abort(); controller = new AbortController(); active.add(controller);
      const ownController = controller, ownSequence = ++sequence;
      const query = new URLSearchParams({ from: from.value, to: to.value, environment: environment.value, page: String(page) });
      const scope = JSON.stringify([from.value, to.value, environment.value]);
      if (lastReport && scope !== displayedScope) { lastReport = null; output.replaceChildren(); }
      submit.disabled = true; panel.setAttribute('aria-busy', 'true'); label(state, 'PayPal 결제 내역을 불러오고 있습니다.');
      const timer = setTimeout(() => ownController.abort(), 7000);
      try {
        const response = await fetch('/api/paypal/admin/report/?' + query, { credentials: 'same-origin', cache: 'no-store', signal: ownController.signal });
        if (!authorized()) return;
        if (response.status === 401 || response.status === 403) { retire(); return; }
        const payload = await response.json();
        if (!response.ok || !payload.ok) throw Error();
        if (!authorized() || ownSequence !== sequence || ownController.signal.aborted || !panel.isConnected) return;
        const report = payload.data;
        if (!report?.period || ['from', 'to', 'environment'].some(key => report.period[key] !== query.get(key)) || report.period.page !== page || report.revenue !== (query.get('environment') === 'live') || !Array.isArray(report.totals) || !Array.isArray(report.products) || !Array.isArray(report.payments) || !Number.isSafeInteger(report.total) || report.total < 0 || typeof report.has_more !== 'boolean') throw Error();
        displayedPage = page; displayedScope = scope; lastReport = report;
        render(lastReport); label(state, 'PayPal 결제 내역을 확인했습니다.');
      } catch (error) {
        if (!authorized() || ownSequence !== sequence || !panel.isConnected) return;
        label(state, 'PayPal 결제 내역을 불러오지 못했습니다. 조회 버튼으로 다시 시도해 주세요.');
      } finally {
        clearTimeout(timer); active.delete(ownController);
        if (!closed && ownSequence === sequence && panel.isConnected) { submit.disabled = false; panel.setAttribute('aria-busy', 'false'); }
      }
    }
    form.addEventListener('submit', event => { event.preventDefault(); load(1); });
    load(1);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
  new MutationObserver(mount).observe(document.body, { childList: true, subtree: true });
})();
