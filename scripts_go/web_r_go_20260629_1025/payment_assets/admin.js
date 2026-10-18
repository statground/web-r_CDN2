(function (window, document) {
  'use strict';
  if (window.WebRPaymentWorkspace) return;
  const endpoint = '/admin/ajax_get_admin_payment_workspace/';
  // Leave room for bounded session checks before and after each source read.
  const requestBudgets = {KRW: 12000, USD: 12000};
  const currencies = ['KRW', 'USD'];
  const sourceStates = ['complete', 'partial', 'unavailable', 'filtered'];
  const fields = ['from', 'to', 'environment', 'provider', 'currency', 'status', 'page', 'page_size', 'section', 'cursor'];
  const t = source => window.WebRI18n?.t(source) || source;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  const decimal = value => typeof value === 'number' && Number.isFinite(value) || typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value);
  const minor = value => Number.isSafeInteger(value) || typeof value === 'string' && /^-?\d+$/.test(value);
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
  const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const kstDay = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  let instance = null;

  function label(node, source) {
    node.dataset.paymentLabel = source;
    node.textContent = t(source);
    return node;
  }
  function node(tag, className, source) {
    const result = document.createElement(tag);
    if (className) result.className = className;
    return source == null ? result : label(result, source);
  }
  function literal(tag, className, value) {
    const result = node(tag, className);
    result.textContent = String(value ?? ''); result.dataset.webrUserContent = '';
    return result;
  }
  function decimalText(value, minimum = 0) {
    if (!decimal(value)) return t('확인되지 않음');
    const text = String(value), negative = text[0] === '-';
    const parts = text.replace(/^-/, '').split('.');
    const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const fraction = (parts[1] || '').padEnd(minimum, '0');
    return (negative ? '−' : '') + whole + (fraction ? '.' + fraction : '');
  }
  function money(value, currency, isMinor = true) {
    if (value == null || !currencies.includes(currency) || !(isMinor ? minor(value) : decimal(value))) return t('확인되지 않음');
    let amount = String(value);
    if (isMinor && currency === 'USD') {
      const negative = amount[0] === '-';
      amount = amount.replace(/^-/, '').padStart(3, '0');
      amount = (negative ? '-' : '') + amount.slice(0, -2) + '.' + amount.slice(-2);
    }
    return decimalText(amount, currency === 'USD' ? 2 : 0) + ' ' + currency;
  }
  function metricValid(value) {
    if (value === null) return true;
    return object(value) && (value.completed_amount_minor == null || minor(value.completed_amount_minor)) &&
      ['completed_count', 'membership_applied_count', 'membership_pending_count', 'membership_unknown_count', 'review_count', 'refund_review_count', 'unconfirmed_date_count', 'other_count']
        .every(key => value[key] == null || integer(value[key]));
  }
  function sameScope(actual, expected) {
    return object(actual) && fields.every(key => actual[key] === expected[key]);
  }
  function validate(payload, expected, section, owner) {
    if (!object(payload) || payload.schema !== 'webr.admin.payments.v1' || payload.ok !== true ||
        typeof payload.complete !== 'boolean' || !sameScope(payload.scope, expected) ||
        payload.admin_snapshot_owner !== owner || payload.admin_snapshot_date !== kstDay() ||
        !object(payload.sources) || !currencies.every(c => object(payload.sources[c]) && sourceStates.includes(payload.sources[c].state) &&
          ['complete', 'unavailable', 'filtered', 'environment_required', 'not_requested'].includes(payload.sources[c].summary_state) &&
          ['complete', 'unavailable', 'filtered', 'not_requested'].includes(payload.sources[c].ledger_state) && typeof payload.sources[c].revenue === 'boolean')) return false;
    if (section === 'overview') {
      if (!object(payload.overview) || !object(payload.breakdown) || !object(payload.windows) || !Array.isArray(payload.products)) return false;
      if (!object(payload.ledger) || payload.ledger.state !== 'not_requested' || !Array.isArray(payload.ledger.rows) || payload.ledger.rows.length ||
          !(payload.ledger.total === null || integer(payload.ledger.total)) || !(payload.ledger.has_more === null || typeof payload.ledger.has_more === 'boolean') || payload.ledger.next_cursor !== null) return false;
      if (['all', 'unknown'].includes(expected.environment) && (currencies.some(c => payload.overview[c] !== null || payload.breakdown[c] !== null || payload.windows[c] !== null) || payload.products.length)) return false;
      return currencies.every(c => metricValid(payload.overview[c]) && (payload.breakdown[c] == null || object(payload.breakdown[c]) &&
        payload.breakdown[c].basis === (c === 'KRW' ? 'legacy_krw_formula' : 'not_recorded') &&
        ['amt_total', 'amt_tax', 'amt_toss', 'amt_statground', 'amt_benefit_tax', 'amt_result'].every(key => payload.breakdown[c][key] === null || c === 'KRW' && decimal(payload.breakdown[c][key]))) &&
        (payload.windows[c] == null || object(payload.windows[c]) && ['all', 'year', 'month', 'today'].every(key => metricValid(payload.windows[c][key])))) &&
        payload.products.every(row => object(row) && row.currency === expected.currency && row.provider === (row.currency === 'KRW' ? 'toss' : 'paypal') &&
          row.environment === expected.environment && minor(row.completed_amount_minor) && integer(row.completed_count));
    }
    if (section === 'timeline') return Array.isArray(payload.timeline) && (!['all', 'unknown'].includes(expected.environment) || payload.timeline.length === 0) && payload.timeline.every(row => object(row) && validDate(row.date) &&
      currencies.every(c => row[c] === null || object(row[c]) && minor(row[c].amount_minor) && integer(row[c].count)));
    if (!object(payload.ledger) || !['complete', 'partial', 'unavailable', 'filtered'].includes(payload.ledger.state) ||
        !Array.isArray(payload.ledger.rows) || payload.ledger.rows.length > expected.page_size ||
        !(payload.ledger.total === null || integer(payload.ledger.total)) || !(payload.ledger.has_more === null || typeof payload.ledger.has_more === 'boolean') ||
        !(payload.ledger.next_cursor === null || typeof payload.ledger.next_cursor === 'string' && payload.ledger.next_cursor.length > 0 && payload.ledger.next_cursor.length <= 4096) ||
        (payload.ledger.has_more === true && (!payload.ledger.next_cursor || payload.ledger.next_cursor === expected.cursor)) ||
        (payload.ledger.has_more !== true && payload.ledger.next_cursor !== null)) return false;
    return payload.ledger.rows.every(row => object(row) && ['one_time', 'subscription'].includes(row.kind) && ['toss', 'paypal'].includes(row.provider) && row.currency === expected.currency && row.provider === (row.currency === 'KRW' ? 'toss' : 'paypal') &&
      ['live', 'sandbox', 'unknown'].includes(row.environment) && (expected.environment === 'all' || row.environment === expected.environment) && typeof row.id === 'string' && typeof row.status === 'string' &&
      (row.amount_minor === null || minor(row.amount_minor)) && (row.confirmed_at === null || timestamp(row.confirmed_at)) &&
      (row.created_at === null || timestamp(row.created_at)) && timestamp(row.activity_at) && typeof row.review_required === 'boolean' && (row.granted === null || typeof row.granted === 'boolean') && row.classification === expected.status &&
      (expected.status !== 'completed' || row.status === (row.provider === 'paypal' ? 'COMPLETED' : row.kind === 'subscription' ? 'paid' : 'DONE') && !row.review_required && timestamp(row.confirmed_at)));
  }

  function installStyle() {
    if (document.getElementById('webr-payment-workspace-style')) return;
    if (document.getElementById('webr-admin-dashboard-shared-style')?.textContent.includes('.webr-payment-workspace')) return;
    const style = node('style');
    style.id = 'webr-payment-workspace-style';
    const nonce = document.querySelector('script[nonce]')?.nonce;
    if (nonce) style.nonce = nonce;
    style.textContent = `
#div_main .webr-payment-workspace{min-width:0;color:#172033;font:14px/1.55 system-ui,sans-serif;--pw-line:#e2e8f0;--pw-muted:#64748b}
.webr-payment-workspace *{box-sizing:border-box}.webr-payment-workspace h1,.webr-payment-workspace h2,.webr-payment-workspace h3,.webr-payment-workspace p{margin:0}
.webr-payment-workspace .pw-header{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1.25rem}.webr-payment-workspace h1{font-size:1.7rem;letter-spacing:-.045em;line-height:1.3;font-weight:800}.webr-payment-workspace .pw-eyebrow{color:#0f766e;font-size:.7rem;letter-spacing:.12em;font-weight:800;margin-bottom:.4rem}
.webr-payment-workspace .pw-muted{color:var(--pw-muted);font-size:.8rem}.webr-payment-workspace .pw-switch{display:flex;gap:.25rem;padding:.25rem;border:1px solid var(--pw-line);border-radius:.65rem;background:#fff}.webr-payment-workspace .pw-switch a{padding:.45rem .65rem;border-radius:.4rem;white-space:nowrap;color:#64748b;text-decoration:none;font-weight:700}.webr-payment-workspace .pw-switch [aria-current=page]{background:#eef2f6;color:#0f172a}
.webr-payment-workspace .pw-filter{display:flex;flex-wrap:wrap;align-items:end;gap:.65rem;padding:1rem;border:1px solid var(--pw-line);border-radius:.8rem;background:#fff;margin-bottom:1rem}.webr-payment-workspace label{display:grid;gap:.3rem;min-width:0;flex:1 1 112px;color:#475569;font-size:.75rem;font-weight:700}.webr-payment-workspace input,.webr-payment-workspace select,.webr-payment-workspace button,.webr-payment-workspace .pw-static-control{font:inherit;min-height:40px;padding:.5rem .65rem;border:1px solid #cbd5e1;border-radius:.45rem;background:#fff;color:#172033;max-width:100%}.webr-payment-workspace .pw-static-control{display:flex;align-items:center}.webr-payment-workspace button{cursor:pointer;font-weight:700}.webr-payment-workspace button[type=submit]{background:#0f172a;color:#fff;border-color:#0f172a;min-width:78px}.webr-payment-workspace button:disabled{opacity:.45;cursor:default}.webr-payment-workspace :is(a,button,input,select,summary):focus-visible{outline:3px solid #2dd4bf;outline-offset:3px}
.webr-payment-workspace .pw-overview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}.webr-payment-workspace .pw-card,.webr-payment-workspace .pw-panel{min-width:0;border:1px solid var(--pw-line);border-radius:.75rem;background:#fff;padding:1rem}.webr-payment-workspace .pw-card h3{font-size:.75rem;color:#64748b;font-weight:600;margin-bottom:.65rem}.webr-payment-workspace .pw-currency-line{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem;padding:.2rem 0}.webr-payment-workspace .pw-currency-line small{color:#64748b;font-size:.65rem;font-weight:700}.webr-payment-workspace .pw-currency-line strong{font-size:1.12rem;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.webr-payment-workspace .pw-panel{margin-top:1rem}.webr-payment-workspace h2{font-size:.95rem;font-weight:800}.webr-payment-workspace .pw-panel-head{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:.75rem}.webr-payment-workspace .pw-status{font-size:.75rem;color:#64748b;min-height:1.2em;margin:.5rem 0}.webr-payment-workspace [data-state=unavailable]>.pw-status{color:#b45309}.webr-payment-workspace details{margin-top:.75rem}.webr-payment-workspace summary{cursor:pointer;font-size:.8rem;font-weight:700;color:#475569;padding:.45rem 0}
.webr-payment-workspace .pw-scroll{max-width:100%;overflow:auto}.webr-payment-workspace table{width:100%;border-collapse:collapse;text-align:start;font-size:.77rem}.webr-payment-workspace th{padding:.7rem .6rem;border-block:1px solid var(--pw-line);color:#64748b;font-weight:600;background:#f8fafc;white-space:nowrap}.webr-payment-workspace td{padding:.8rem .6rem;border-bottom:1px solid #f1f5f9;vertical-align:top;overflow-wrap:anywhere}.webr-payment-workspace th:first-child,.webr-payment-workspace td:first-child{padding-inline-start:0}.webr-payment-workspace .pw-ledger{min-width:740px}.webr-payment-workspace .pw-products{min-width:600px}.webr-payment-workspace .pw-badge{display:inline-block;padding:.15rem .4rem;border:1px solid #e2e8f0;border-radius:.3rem;color:#475569;background:#f8fafc;font-size:.65rem;white-space:nowrap;margin:.1rem .25rem .1rem 0}.webr-payment-workspace .pw-live{color:#0f766e;background:#f0fdfa;border-color:#ccfbf1}.webr-payment-workspace .pw-warning{color:#92400e;background:#fffbeb;border-color:#fef3c7}.webr-payment-workspace .pw-amount{font-weight:800;white-space:nowrap;font-variant-numeric:tabular-nums}.webr-payment-workspace .pw-pager{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem}.webr-payment-workspace .pw-pager>div{display:flex;gap:.4rem}.webr-payment-workspace .pw-pager>div>div{display:flex;align-items:center;flex-wrap:wrap;gap:.25rem}.webr-payment-workspace .pw-empty{padding:1.25rem 0;color:#64748b;font-size:.8rem}
.webr-payment-workspace .pw-timeline-row{display:grid;grid-template-columns:85px minmax(0,1fr) minmax(0,1fr);gap:1rem;align-items:center;padding:.45rem 0;border-top:1px solid #f1f5f9;font-size:.75rem}.webr-payment-workspace .pw-track{display:grid;gap:.2rem}.webr-payment-workspace .pw-track i{height:4px;max-width:100%;background:#0f766e;border-radius:4px;display:block}.webr-payment-workspace .pw-track[data-currency=USD] i{background:#64748b}.webr-payment-workspace .pw-track span{font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.webr-payment-workspace [aria-busy=true]>.pw-status:before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#0f766e;margin-inline-end:.4rem;animation:pw-pulse 1s ease-in-out infinite alternate}@keyframes pw-pulse{to{opacity:.25}}@media(prefers-reduced-motion:reduce){.webr-payment-workspace [aria-busy=true]>.pw-status:before{animation:none}}
@media(max-width:1100px){.webr-payment-workspace .pw-overview{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.webr-payment-workspace .pw-header{display:block}.webr-payment-workspace .pw-switch{width:max-content;margin-top:.8rem}.webr-payment-workspace h1{font-size:1.45rem}.webr-payment-workspace .pw-filter{padding:.8rem;gap:.5rem}.webr-payment-workspace label{flex-basis:42%}.webr-payment-workspace .pw-card,.webr-payment-workspace .pw-panel{padding:.85rem}.webr-payment-workspace .pw-currency-line{display:block}.webr-payment-workspace .pw-currency-line strong{display:block;font-size:1rem}.webr-payment-workspace .pw-timeline-row{grid-template-columns:70px minmax(0,1fr) minmax(0,1fr);gap:.6rem}.webr-payment-workspace .pw-pager{flex-direction:column;align-items:stretch}.webr-payment-workspace .pw-pager>div{flex-wrap:wrap;justify-content:space-between}}
`;
    document.head.append(style);
  }

  function mount() {
    if (instance) return instance;
    const path = location.pathname;
    const balance = /^\/admin\/balance_account\/(?:\d{4}\/\d{1,2}\/)?$/.test(path);
    if (!balance && path !== '/admin/payments/') return null;
    const bootstrap = window.WEBR_ADMIN_SNAPSHOTS;
    const owner = bootstrap?.schema === 1 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bootstrap.owner || '') ? bootstrap.owner : '';
    const main = document.getElementById('div_main');
    const target = main?.querySelector('.webr-admin-firstview-content, .webr-admin-content, [data-admin-read-frame] > main');
    if (!owner || window.gv_is_admin !== true || !target) return null;
    const root = node('section', 'webr-payment-workspace');
    root.id = 'webr-payment-workspace';
    const active = new Set();
    const panels = {};
    let closed = false, epoch = 0, scope = null;
    function authorized() {
      if (!closed && window.WEBR_ADMIN_SNAPSHOTS === bootstrap && bootstrap.owner === owner && window.gv_is_admin === true &&
          window.gv_role === '관리자' && location.pathname === path && root.isConnected &&
          document.getElementById('webr-admin-read-status')?.getAttribute('data-admin-read-state') !== 'denied') return true;
      retire(); return false;
    }
    function retire() {
      if (closed) return;
      closed = true; ++epoch; clearInterval(ownerTimer);
      active.forEach(controller => controller.abort()); active.clear();
      Object.values(panels).forEach(panel => { panel.data = null; panel.reports = {}; panel.cursors = {KRW: [''], USD: ['']}; panel.body.replaceChildren(); });
      root.replaceChildren(node('p', 'pw-empty', '관리자 권한을 다시 확인해 주세요.'));
      if (window.WebRAdminSnapshots?.stop) window.WebRAdminSnapshots.stop();
    }
    installStyle();
    const header = node('header', 'pw-header'), heading = node('div');
    heading.append(node('p', 'pw-eyebrow', '결제 관리'), node('h1', '', balance ? '정산액 조회' : '결제 현황'),
      node('p', 'pw-muted', '결제 수단과 통화를 한 화면에서 확인합니다. 금액은 통화별로 구분합니다.'));
    const tabs = node('nav', 'pw-switch'); tabs.setAttribute('aria-label', t('결제 메뉴'));
    for (const [href, title, selected] of [['/admin/payments/', '결제 현황', !balance], ['/admin/balance_account/', '정산액 조회', balance]]) {
      const a = node('a', '', title); a.href = href; if (selected) a.setAttribute('aria-current', 'page'); tabs.append(a);
    }
    header.append(heading, tabs); root.append(header);
    const form = node('form', 'pw-filter'), inputs = {};
    function field(name, title, type, options) {
      const wrap = node('label'), input = node(options ? 'select' : 'input');
      wrap.append(node('span', '', title)); input.name = name;
      if (options) for (const [value, text] of options) { const option = node('option', '', text); option.value = value; input.append(option); }
      else { input.type = type; input.required = true; }
      wrap.append(input); form.append(wrap); inputs[name] = input; return input;
    }
    const dateParts = kstDay().slice(0, 7).split('-');
    const match = path.match(/^\/admin\/balance_account\/(\d{4})\/(\d{1,2})\//);
    const month = (match ? match[1] + '-' + match[2].padStart(2, '0') : dateParts.join('-'));
    const periodEnd = value => value + '-' + new Date(Date.UTC(Number(value.slice(0, 4)), Number(value.slice(5, 7)), 0)).getUTCDate();
    if (balance) { const input = field('month', '정산 월', 'month'); input.value = month; input.min = '2015-01'; input.max = dateParts[0] + '-12'; }
    else { field('from', '시작일', 'date').value = month + '-01'; field('to', '종료일', 'date').value = periodEnd(month); }
    field('provider', '결제 수단', '', [['all', '전체 수단'], ['toss', 'Toss'], ['paypal', 'PayPal']]);
    field('currency', '통화', '', [['all', '전체 통화'], ['KRW', 'KRW'], ['USD', 'USD']]);
    field('environment', '환경', '', [['live', '실제 결제'], ['sandbox', '테스트 결제'], ['all', '전체 환경'], ['unknown', '환경 미확인']]);
    field('status', '원장 구분', '', [['completed', '완료 결제'], ['refund', '환불·취소'], ['diagnostic', '대기·확인 필요']]);
    const submit = node('button', '', '적용'); submit.type = 'submit'; form.append(submit); root.append(form);
    const scopeNote = node('p', 'pw-muted'); root.append(scopeNote);
    for (const [name, title] of [['overview', '결제 요약'], ['timeline', '결제 흐름'], ['ledger', '통합 원장']]) {
      const element = node('section', name === 'overview' ? '' : 'pw-panel');
      element.dataset.section = name;
      const head = node('div', 'pw-panel-head'); head.append(node('h2', '', title));
      const status = node('p', 'pw-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
      const body = node('div'); element.append(head, status, body); root.append(element);
      panels[name] = {element, status, body, data: null, reports: {}, controllers: {}, states: {}, pages: {KRW: 1, USD: 1}, cursors: {KRW: [''], USD: ['']}};
    }
    target.replaceChildren(root);
    const globalStatus = document.getElementById('webr-admin-read-status');
    if (globalStatus && globalStatus.getAttribute('data-admin-read-state') !== 'denied') globalStatus.hidden = true;
    const ownerTimer = setInterval(authorized, 250);
    window.addEventListener('pagehide', retire, {once: true});
    window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { active.forEach(controller => controller.abort()); return; }
      if (!scope || !authorized()) return;
      for (const group of ['summary', 'ledger']) for (const currency of requestedCurrencies()) {
        const names = group === 'summary' ? ['overview', 'timeline'] : ['ledger'];
        const usable = names.some(name => {
          const source = panels[name].reports[currency]?.sources[currency];
          return group === 'summary' ? ['complete', 'filtered', 'environment_required'].includes(source?.summary_state) : ['complete', 'filtered'].includes(source?.ledger_state);
        });
        if (!usable && names.some(name => ['pending', 'unavailable'].includes(panels[name].states[currency]))) load(group, epoch, currency);
      }
    });
    window.addEventListener('webr:language-change', () => {
      if (!authorized()) return;
      root.querySelectorAll('[data-payment-label]').forEach(n => { n.textContent = t(n.dataset.paymentLabel); });
      Object.keys(panels).forEach(name => { if (panels[name].data) render(name, panels[name].data); });
    });

    function table(headers, className = '') {
      const wrap = node('div', 'pw-scroll'), table = node('table', className), head = table.createTHead().insertRow();
      wrap.tabIndex = 0; wrap.setAttribute('aria-label', t('표의 나머지 열은 가로로 스크롤하여 확인할 수 있습니다.'));
      headers.forEach(text => { const th = node('th', '', text); th.scope = 'col'; head.append(th); });
      const body = table.createTBody(); wrap.append(table); return {wrap, table, body};
    }
    function cells(row, values) {
      values.forEach(value => { const td = row.insertCell(); if (value instanceof Node) td.append(value); else { td.textContent = String(value ?? '—'); td.dataset.webrUserContent = ''; } });
    }
    function badge(text, warning = false, live = false) { return node('span', 'pw-badge' + (warning ? ' pw-warning' : live ? ' pw-live' : ''), text); }
    function pair(parent, currency, value) {
      const line = node('div', 'pw-currency-line'), amount = node('strong');
      line.dataset.currency = currency; amount.textContent = value;
      line.append(node('small', '', currency), amount); parent.append(line);
    }
    function revenueScope() { return scope.environment === 'live' || scope.environment === 'sandbox'; }
    function renderOverview(payload) {
      const body = panels.overview.body, fragment = document.createDocumentFragment(), cards = node('div', 'pw-overview');
      for (const [title, kind] of [['완료 결제액', 'amount'], ['완료 건수', 'count'], ['수수료 추정', 'fee'], ['예상 정산액', 'net']]) {
        const card = node('section', 'pw-card'); card.append(node('h3', '', title));
        currencies.forEach(c => {
          const metrics = payload.overview[c], breakdown = payload.breakdown[c];
          let value = t(payload.sources[c].state === 'pending' ? '확인 중' : payload.sources[c].state === 'filtered' ? '선택 제외' : '확인되지 않음');
          if (revenueScope() && payload.sources[c].summary_state === 'complete') {
            if (kind === 'amount') value = money(metrics?.completed_amount_minor, c);
            if (kind === 'count' && integer(metrics?.completed_count)) value = metrics.completed_count.toLocaleString() + ' ' + t('건');
            if (kind === 'fee') value = money(breakdown?.amt_toss, c, false);
            if (kind === 'net') value = money(breakdown?.amt_result, c, false);
          }
          pair(card, c, value);
        }); cards.append(card);
      }
      fragment.append(cards, node('p', 'pw-status', scope.environment === 'sandbox' ? '테스트 결제는 실제 매출이나 정산액이 아닙니다.' :
        revenueScope() ? 'KRW 수수료·세금·정산액은 기존 산식의 추정값입니다. USD 수수료와 실수령액은 기록되지 않았습니다.' : '환경을 선택하면 해당 환경의 합계를 확인할 수 있습니다. 실제·테스트 금액은 합산하지 않습니다.'));
      const detail = node('details'); detail.append(node('summary', '', '금액 상세 · 누적 기간 · 상품 구성'));
      const breakdownTable = table(['정산 항목', 'KRW', 'USD']);
      for (const [title, key] of [['총 결제액', 'amt_total'], ['부가세', 'amt_tax'], ['Toss 수수료', 'amt_toss'], ['운영 수수료', 'amt_statground'], ['소득세', 'amt_benefit_tax'], ['예상 정산액', 'amt_result']]) {
        cells(breakdownTable.body.insertRow(), [t(title), ...currencies.map(c => revenueScope() ? money(payload.breakdown[c]?.[key], c, false) : t('확인되지 않음'))]);
      }
      detail.append(breakdownTable.wrap, node('p', 'pw-muted', '원화 산식을 PayPal 금액에 적용하지 않습니다.'));
      const windows = table(['누적 기준', 'KRW 완료 금액 / 건수', 'USD 완료 금액 / 건수']);
      for (const [key, title] of [['all', '전체 기간'], ['year', '올해'], ['month', '이번 달'], ['today', '오늘']]) {
        cells(windows.body.insertRow(), [t(title), ...currencies.map(c => {
          const value = payload.windows[c]?.[key];
          return revenueScope() && value ? money(value.completed_amount_minor, c) + ' / ' + (integer(value.completed_count) ? value.completed_count.toLocaleString() : '—') : t('확인되지 않음');
        })]);
      }
      detail.append(windows.wrap);
      const rights = table(['권한 · 검토 상태', 'KRW', 'USD']);
      for (const [key, title] of [['membership_applied_count', '적용 확인'], ['membership_pending_count', '권한 미반영'], ['membership_unknown_count', '권한 적용 미확인'], ['review_count', '검토 필요'], ['unconfirmed_date_count', '완료일 미확인']]) {
        cells(rights.body.insertRow(), [t(title), ...currencies.map(c => integer(payload.overview[c]?.[key]) ? payload.overview[c][key].toLocaleString() : t('확인되지 않음'))]);
      }
      detail.append(rights.wrap);
      if (payload.products.length) {
        const products = table(['수단 · 환경', '상품', '통화', '완료 금액', '완료 건수'], 'pw-products');
        payload.products.forEach(row => cells(products.body.insertRow(), [String(row.provider || '') + ' · ' + String(row.environment || ''), row.product_name || row.product_id, row.currency, money(row.completed_amount_minor, row.currency), row.completed_count]));
        detail.append(node('h3', '', '상품별 완료 결제'), products.wrap);
      }
      fragment.append(detail); body.replaceChildren(fragment);
    }
    function renderTimeline(payload) {
      const body = panels.timeline.body;
      if (!revenueScope()) { body.replaceChildren(node('p', 'pw-empty', '환경별 흐름은 실제 또는 테스트 환경을 선택한 뒤 확인할 수 있습니다.')); return; }
      if (!payload.timeline.length) { body.replaceChildren(node('p', 'pw-empty', requestedCurrencies().some(c => panels.timeline.states[c] === 'pending') ?
        '통화별 결제 흐름을 확인하고 있습니다.' : payload.complete ? '선택한 기간에 확인된 완료 결제가 없습니다.' : '결제 흐름을 확인하지 못했습니다.')); return; }
      const fragment = document.createDocumentFragment();
      fragment.append(node('p', 'pw-muted', '통화별 눈금입니다. KRW와 USD 막대의 길이는 서로 비교하지 않습니다.'));
      const maxima = Object.fromEntries(currencies.map(c => [c, Math.max(1, ...payload.timeline.map(row => Number(row[c]?.amount_minor || 0)))]));
      payload.timeline.forEach(row => {
        const line = node('div', 'pw-timeline-row'); line.append(node('time', '', row.date));
        currencies.forEach(c => {
          const track = node('div', 'pw-track'); track.dataset.currency = c;
          const text = node('span'); text.textContent = row[c] ? money(row[c].amount_minor, c) + ' · ' + row[c].count + t('건') : t('확인되지 않음');
          const bar = node('i'); bar.setAttribute('aria-hidden', 'true');
          bar.style.width = (row[c] ? Math.max(0, Number(row[c].amount_minor)) / maxima[c] * 100 : 0) + '%';
          track.append(text, bar); line.append(track);
        }); fragment.append(line);
      }); body.replaceChildren(fragment);
    }
    function renderLedger(payload) {
      const body = panels.ledger.body, fragment = document.createDocumentFragment(), report = payload.ledger;
      if (scope.status === 'diagnostic') fragment.append(node('p', 'pw-status', '대기·완료일 미확인·검토 내역입니다. 매출 합계에는 포함하지 않습니다.'));
      if (scope.status === 'refund') fragment.append(node('p', 'pw-status', '환불·취소 상태를 확인한 기록입니다. 원결제 금액은 실제 환불액과 다를 수 있습니다.'));
      if (!report.rows.length) fragment.append(node('p', 'pw-empty', requestedCurrencies().some(c => panels.ledger.states[c] === 'pending') ? '통화별 결제 원장을 확인하고 있습니다.' :
        report.state === 'complete' || report.state === 'filtered' ? '선택한 조건에 해당하는 내역이 없습니다.' : '일부 결제 원장을 확인하지 못했습니다.'));
      else {
        const result = table(['일시', '상품 · 결제 식별자', '수단 · 통화 · 환경', '금액', '상태 · 권한'], 'pw-ledger');
        report.rows.forEach(row => {
          const when = node('div'), date = row.activity_at;
          when.append(node('div', '', date ? new Intl.DateTimeFormat(undefined, {timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short'}).format(new Date(date)) : '일자 미확인'),
            node('div', 'pw-muted', row.time_basis === 'membership_applied' ? '권한 반영일' : row.confirmed_at ? '결제 확인일' : '생성일 · 완료 미확인'));
          const product = node('div'); product.append(literal('div', '', row.product_name || row.product_id || t('상품 미확인')), literal('div', 'pw-muted', row.id));
          if (row.owner_id) product.append(literal('div', 'pw-muted', t('계정') + ' · ' + row.owner_id));
          const source = node('div'); source.append(badge(row.kind === 'subscription' ? '정기결제' : '단건 결제'), badge(row.provider === 'paypal' ? 'PayPal' : 'Toss'), badge(row.currency), badge(row.environment === 'live' ? '실제' : row.environment === 'sandbox' ? '테스트' : '환경 미확인', row.environment !== 'live', row.environment === 'live'));
          const amount = node('span', 'pw-amount'); amount.textContent = money(row.amount_minor, row.currency);
          const state = node('div'); state.append(badge(row.status, row.review_required));
          state.append(node('div', 'pw-muted', row.granted === null ? '권한 확인되지 않음' : row.grant_status === 'applied' && row.granted ? '권한 반영됨' : row.grant_status === 'canceled' ? '권한 취소됨' : '권한 미반영'));
          if (row.review_required) state.append(node('div', 'pw-muted', '확인 필요'));
          cells(result.body.insertRow(), [when, product, source, amount, state]);
        }); fragment.append(result.wrap);
      }
      const pager = node('nav', 'pw-pager'); pager.setAttribute('aria-label', t('결제 원장 페이지'));
      pager.append(node('span', 'pw-muted', '통화별 최대 50건 · 현재 페이지를 함께 시간순으로 표시합니다.'));
      const buttons = node('div');
      requestedCurrencies().forEach(c => {
        const own = ledgerPage(c), page = panels.ledger.pages[c];
        const group = node('div'), count = node('span', 'pw-muted');
        count.textContent = c + ' · ' + page + t('페이지') + ' / ' + (own?.total == null ? t('전체 건수 미확인') : own.total.toLocaleString() + t('건'));
        group.append(count);
        for (const [title, step, disabled] of [['이전', -1, page <= 1], ['다음', 1, !own?.has_more]]) {
          const button = node('button', '', title); button.type = 'button'; button.disabled = disabled || panels.ledger.states[c] === 'pending';
          button.setAttribute('aria-label', c + ' ' + t(title));
          button.addEventListener('click', () => {
            if (step > 0) {
              if (!own?.has_more || !own.next_cursor) return;
              panels.ledger.cursors[c] = panels.ledger.cursors[c].slice(0, page);
              panels.ledger.cursors[c].push(own.next_cursor);
            }
            panels.ledger.pages[c] += step; panels.ledger.reports[c] = null; load('ledger', epoch, c);
          }); group.append(button);
        }
        buttons.append(group);
      });
      pager.append(buttons); fragment.append(pager); body.replaceChildren(fragment);
    }
    function render(name, payload) {
      if (!authorized()) return;
      if (name === 'overview') renderOverview(payload);
      else if (name === 'timeline') renderTimeline(payload);
      else renderLedger(payload);
    }
    function requestedCurrencies() { return currencies.filter(c => (scope.currency === 'all' || scope.currency === c) &&
      (scope.provider === 'all' || scope.provider === (c === 'KRW' ? 'toss' : 'paypal'))); }
    function ledgerPage(currency) {
      const summary = panels.overview.reports[currency]?.ledger;
      const own = panels.ledger.reports[currency]?.ledger;
      const total = summary?.total ?? own?.total ?? null;
      return {total, has_more: own?.has_more === true, next_cursor: own?.next_cursor || null};
    }
    function combined(name) {
      const panel = panels[name], wanted = requestedCurrencies();
      const result = {complete: wanted.every(c => panel.reports[c] && (name === 'ledger' ? ['complete', 'filtered'].includes(panel.reports[c].sources[c].ledger_state) :
        ['complete', 'filtered', 'environment_required'].includes(panel.reports[c].sources[c].summary_state))), sources: {}, overview: {}, breakdown: {}, windows: {}, products: [], timeline: [], ledger: {state: 'partial', rows: [], total: null, has_more: false}};
      const days = new Map();
      currencies.forEach(c => {
        const report = panel.reports[c];
        result.sources[c] = report?.sources[c] || {state: wanted.includes(c) ? panel.states[c] || 'pending' : 'filtered'};
        result.overview[c] = report?.overview?.[c] || null;
        result.breakdown[c] = report?.breakdown?.[c] || null;
        result.windows[c] = report?.windows?.[c] || null;
        result.products.push(...(report?.products || []).filter(row => row.currency === c));
        (report?.timeline || []).forEach(row => {
          if (!days.has(row.date)) days.set(row.date, {date: row.date, KRW: null, USD: null});
          days.get(row.date)[c] = row[c];
        });
        result.ledger.rows.push(...(report?.ledger?.rows || []).filter(row => row.currency === c));
      });
      result.timeline = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
      result.ledger.rows.sort((a, b) => Date.parse(b.activity_at) - Date.parse(a.activity_at) || a.currency.localeCompare(b.currency) || a.id.localeCompare(b.id));
      if (wanted.every(c => ledgerPage(c).total != null)) result.ledger.total = wanted.reduce((sum, c) => sum + ledgerPage(c).total, 0);
      result.ledger.state = wanted.every(c => ['complete', 'filtered'].includes(panel.reports[c]?.ledger?.state)) ? 'complete' : 'partial';
      return result;
    }
    function paint(name) {
      const panel = panels[name];
      const pending = requestedCurrencies().some(c => panel.states[c] === 'pending');
      const failed = requestedCurrencies().some(c => panel.states[c] === 'unavailable');
      panel.data = combined(name); render(name, panel.data);
      panel.element.setAttribute('aria-busy', String(pending));
      panel.element.dataset.state = failed ? 'unavailable' : pending ? 'pending' : panel.data.complete ? 'complete' : 'partial';
      label(panel.status, pending ? '확인된 통화를 먼저 표시합니다. 나머지 내역을 확인하고 있습니다.' : failed ?
        '일부 통화를 확인하지 못했습니다. 확인된 다른 통화는 그대로 표시합니다.' : panel.data.complete ?
          '선택한 조건의 내역을 확인했습니다.' : '확인된 항목을 표시합니다. 일부 내역은 확인되지 않았습니다.');
    }
    async function load(group, ownEpoch, currency) {
      if (!authorized()) return;
      const names = group === 'summary' ? ['overview', 'timeline'] : ['ledger'];
      const expected = {...scope, currency, section: group, page: group === 'ledger' ? panels.ledger.pages[currency] : 1,
        cursor: group === 'ledger' ? panels.ledger.cursors[currency][panels.ledger.pages[currency] - 1] : ''}, controller = new AbortController();
      names.forEach(name => { const panel = panels[name]; panel.controllers[currency]?.abort(); panel.controllers[currency] = controller; panel.states[currency] = 'pending'; paint(name); });
      active.add(controller);
      const timer = setTimeout(() => controller.abort(), requestBudgets[currency]);
      const current = () => authorized() && ownEpoch === epoch && names.every(name => panels[name].controllers[currency] === controller);
      try {
        const response = await fetch(endpoint, {method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error',
          body: new URLSearchParams(expected), signal: controller.signal});
        if (!current()) return;
        if (response.status === 401 || response.status === 403) { retire(); return; }
        const raw = await response.text();
        if (raw.length > 4 * 1024 * 1024) throw new Error('payment_section_bound');
        const payload = JSON.parse(raw);
        if (!current() || controller.signal.aborted) return;
        if (response.status === 503 && object(payload) && payload.error === 'authority_unavailable') { retire(); return; }
        if (!response.ok) throw new Error('payment_section_unavailable');
        if (payload.admin_snapshot_owner !== owner) { retire(); return; }
        if (!names.every(name => validate(payload, expected, name, owner))) throw new Error('payment_section_invalid');
        names.forEach(name => { panels[name].reports[currency] = payload; panels[name].states[currency] = name === 'ledger' ? payload.sources[currency].ledger_state : payload.sources[currency].summary_state; });
      } catch (_) {
        if (!current()) return;
        names.forEach(name => { panels[name].states[currency] = 'unavailable'; });
      } finally {
        clearTimeout(timer); active.delete(controller);
        if (!closed && ownEpoch === epoch && names.every(name => panels[name].controllers[currency] === controller)) {
          names.forEach(paint);
          if (group === 'summary' && panels.ledger.data) paint('ledger');
        }
      }
    }
    function apply() {
      if (!authorized()) return;
      const from = balance ? inputs.month.value + '-01' : inputs.from.value;
      const to = balance ? periodEnd(inputs.month.value) : inputs.to.value;
      if (!validDate(from) || !validDate(to) || from > to) return;
      if (balance && inputs.month.value !== month) {
        location.href = '/admin/balance_account/' + Number(inputs.month.value.slice(0, 4)) + '/' + Number(inputs.month.value.slice(5)) + '/'; return;
      }
      ++epoch; active.forEach(controller => controller.abort()); active.clear();
      scope = {from, to, environment: inputs.environment.value, provider: inputs.provider.value, currency: inputs.currency.value, status: inputs.status.value, page: 1, page_size: 50};
      scopeNote.textContent = from + ' – ' + to + ' · ' + t(scope.environment === 'live' ? '실제 결제' : scope.environment === 'sandbox' ? '테스트 결제' : '환경별 합계 구분 필요');
      Object.values(panels).forEach(panel => { panel.data = null; panel.reports = {}; panel.states = {}; panel.pages = {KRW: 1, USD: 1}; panel.cursors = {KRW: [''], USD: ['']}; panel.body.replaceChildren(); });
      if (!requestedCurrencies().length) {
        scopeNote.textContent = t('선택한 결제 수단과 통화가 일치하지 않습니다.');
        Object.values(panels).forEach(panel => { panel.element.setAttribute('aria-busy', 'false'); panel.element.dataset.state = 'unavailable'; label(panel.status, '결제 수단과 통화 조건을 확인해 주세요.'); });
        return;
      }
      renderOverview({overview: {KRW: null, USD: null}, breakdown: {KRW: null, USD: null}, windows: {KRW: null, USD: null}, products: [], sources: {KRW: {state: 'unavailable'}, USD: {state: 'unavailable'}}});
      ['summary', 'ledger'].forEach(group => requestedCurrencies().forEach(currency => load(group, epoch, currency)));
    }
    form.addEventListener('submit', event => { event.preventDefault(); apply(); });
    instance = Object.freeze({mount: () => instance, stop: retire});
    apply(); return instance;
  }
  window.WebRPaymentWorkspace = Object.freeze({mount, validate, money});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
  else mount();
})(window, document);
