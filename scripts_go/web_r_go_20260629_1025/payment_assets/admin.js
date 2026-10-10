(function () {
  'use strict';
  const t = source => window.WebRI18n?.t(source) || source;
  const label = (node, source) => { node.dataset.paymentLabel = source; node.textContent = t(source); return node; };
  const element = (tag, source) => source ? label(document.createElement(tag), source) : document.createElement(tag);
  const money = minor => (minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
  const kinds = { one_time: '단건 결제', subscription: '정기결제' };
  const statusNames = { NEW: '신규', COMPLETED: '완료', CREATED: '생성', APPROVED: '승인', PENDING: '대기', REVIEW_REQUIRED: '확인 필요', REFUNDED: '환불', PARTIALLY_REFUNDED: '부분 환불', REVERSED: '취소', 'PAYMENT.SALE.REFUNDED': '환불', 'PAYMENT.SALE.REVERSED': '취소', FAILED: '실패', DENIED: '거절', DECLINED: '거절' };
  // Keep the stored handler status: one-time capture refunds are sticky
  // REVIEW_REQUIRED, while recurring webhooks retain PAYMENT.SALE.*.
  const storedRefund = row => ['REFUNDED', 'PARTIALLY_REFUNDED', 'REVERSED'].includes(row.status)
    || (row.kind === 'subscription' && ['PAYMENT.SALE.REFUNDED', 'PAYMENT.SALE.REVERSED'].includes(row.status))
    || (row.kind === 'one_time' && row.status === 'REVIEW_REQUIRED' && row.review_reason === 'refund_or_reversal');
  const refundLabel = row => row.status === 'REVIEW_REQUIRED'
    ? t('환불') + ' · ' + t('확인 필요') : t(statusNames[row.status] || row.status);
  let closed = false, retainedPanel = null, retainedFocus = null;
  const active = new Set();
  const reports = new Set();
  const bootstrap = window.WEBR_ADMIN_SNAPSHOTS;
  const owner = bootstrap?.schema === 1 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bootstrap.owner || '') ? bootstrap.owner : '';
  function retire() {
    if (closed) return;
    closed = true;
    active.forEach(controller => controller.abort()); active.clear();
    reports.forEach(clear => clear()); reports.clear();
    document.getElementById('paypal-admin-orders')?.remove(); retainedPanel = retainedFocus = null;
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
  document.addEventListener('focusin', event => {
    retainedFocus = retainedPanel?.contains(event.target) ? event.target : null;
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && !window.WebRAdminSnapshots) window.location.reload();
  });

  function mount() {
    const main = document.getElementById('div_main');
    if (!authorized() || !main) return;
    const contentRoot = main.querySelector('.webr-admin-firstview-content, .webr-admin-content, [data-admin-read-frame] > main') || main.querySelector(':scope > div > div:nth-child(2)');
    if (!contentRoot) return;
    // Mount directly inside the shared content column, including the first SSR
    // frame. Reuse this owner-scoped controller after a CSR frame replacement;
    // drafts, accepted page and in-flight reads must not restart on repaint.
    if (retainedPanel) {
      if (retainedPanel.parentElement !== contentRoot) {
        contentRoot.append(retainedPanel);
        retainedFocus?.focus({preventScroll: true});
      }
      return;
    }
    const panel = element('section');
    panel.id = 'paypal-admin-orders'; panel.dataset.webrUi = '';
    panel.className = 'webr-paypal-admin'; retainedPanel = panel;
    const heading = element('h2'); heading.textContent = 'PayPal · USD';
    const note = element('p', 'PayPal 단건 결제와 정기결제는 USD로 별도 집계합니다.');
    const dateNote = element('p', '완료 상태와 완료일이 확인된 결제만 집계합니다.');
    dateNote.className = 'webr-paypal-admin-note';
    const form = element('form'); form.className = 'webr-paypal-admin-filter';
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
      const wrapper = element('label'); wrapper.append(element('span', name), input); form.append(wrapper);
    }
    const submit = element('button', '조회'); submit.type = 'submit';
    form.append(submit);
    const state = element('p'); state.setAttribute('role', 'status'); state.setAttribute('aria-live', 'polite');
    const output = element('div'); output.style.overflowX = 'auto';
    panel.append(heading, note, dateNote, form, state, output); contentRoot.append(panel);
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
      const totals = element('div'); totals.className = 'webr-paypal-admin-totals';
      report.totals.forEach(row => {
        const card = element('section'); card.className = 'webr-paypal-admin-total';
        card.append(element('h3', kinds[row.kind] || row.kind));
        const amount = element('p'); amount.className = 'webr-paypal-admin-amount'; amount.textContent = money(row.completed_amount_minor);
        const metrics = element('dl');
        for (const [name, value] of [['완료 건수', row.completed_count], ['권한 반영', row.membership_applied_count], ['권한 확인 필요', row.membership_pending_count]]) {
          const metric = element('div'), val = element('dd'); val.textContent = value.toLocaleString(); metric.append(element('dt', name), val); metrics.append(metric);
        }
        card.append(amount, metrics); totals.append(card);
      });
      content.append(totals, element('p', 'PayPal 수수료와 실제 입금액은 아직 확인할 수 없습니다. 원화 정산의 수수료율을 적용하지 않습니다.'));
      const uncertain = report.totals.reduce((count, row) => count + (row.other_count || 0), 0);
      if (uncertain) {
        const diagnostic = element('details'); diagnostic.className = 'webr-paypal-admin-diagnostic';
        const summary = element('summary', '결제 확인 필요'); summary.append(document.createTextNode(' (' + uncertain + ')')); diagnostic.append(summary);
        report.totals.forEach(row => {
          const p = element('p'); p.textContent = t(kinds[row.kind]) + ': ' + (row.other_count || 0).toLocaleString();
          if (row.unconfirmed_date_count) p.append(document.createTextNode(' · ' + t('완료일을 확인할 수 없는 내역이 있습니다.') + ' (' + row.unconfirmed_date_count + ')'));
          if (row.refund_review_count) p.append(document.createTextNode(' · ' + t('환불') + ' / ' + t('확인 필요') + ' (' + row.refund_review_count + ')'));
          diagnostic.append(p);
        }); content.append(diagnostic);
      }
      if (report.products.length) {
        content.append(element('h3', '상품별 완료 결제'));
        const products = table(['결제 방식', '상품', '완료 금액', '건수']);
        report.products.forEach(row => cells(products.insertRow(), [t(kinds[row.kind]), row.product_name || row.product_id, money(row.amount_minor), row.count])); content.append(products);
      }
      content.append(element('h3', '결제 내역'));
      if (!report.payments.length) content.append(element('p', '선택한 기간에 완료된 PayPal 결제가 없습니다.'));
      else {
        const payments = table(['일자', '결제 방식', '주문 번호', '계정', '상품', 'USD', '결제 상태', '회원 권한 반영']);
        report.payments.forEach(row => {
          const date = new Intl.DateTimeFormat(undefined, { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.confirmed_at));
          const basis = t(row.time_basis === 'membership_applied' ? '권한 반영일' : '결제일');
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
      const count = element('span'); count.dataset.paypalPage = '';  count.textContent = report.total.toLocaleString() + ' / ' + renderedPage;
      navigation.append(previous, count, next); content.append(navigation);
      if (report.refunds?.length) {
        const section = element('section'); section.className = 'webr-paypal-admin-refunds';
        section.append(element('h3', '환불·취소 기록'), element('p', '아래 금액과 날짜는 원래 결제 기준입니다. 실제 환불일과 환불액은 확인할 수 없습니다.'));
        const refunds = table(['일자', '결제 방식', '주문 번호', '상품', 'USD', '결제 상태']);
        report.refunds.forEach(row => cells(refunds.insertRow(), [new Intl.DateTimeFormat(undefined, {timeZone: 'Asia/Seoul', dateStyle: 'short'}).format(new Date(row.confirmed_at)) + ' · ' + t(row.time_basis === 'membership_applied' ? '권한 반영일' : '결제일'), t(kinds[row.kind]), row.id, row.product_name || row.product_id, money(row.amount_minor), refundLabel(row)]));
        section.append(refunds); const count = element('p'); count.textContent = report.refunds.length + ' / ' + report.refund_total; section.append(count); content.append(section);
      }
      output.replaceChildren(content);
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
        const paidDate = row => typeof row.confirmed_at === 'string' && Number.isFinite(Date.parse(row.confirmed_at));
        if (report.payments.some(row => row.status !== 'COMPLETED' || row.review_required || !paidDate(row) || row.currency !== 'USD') || (report.refunds || []).some(row => !storedRefund(row) || !paidDate(row) || row.currency !== 'USD')) throw Error();
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
