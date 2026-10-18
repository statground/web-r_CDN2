"""Controlled DOM/API fixtures only; no real account, host, cookie or provider."""
import asyncio
from datetime import datetime, timedelta, timezone
import json
import os
import hashlib
from pathlib import Path
import unittest
from urllib.parse import parse_qs

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'scripts_go/web_r_go_20260629_1025/payment_assets/admin.js'
BRIDGES = ROOT / 'scripts_go/web_r_go_20260530_1258/scripts_v2/admin'
BROWSER = os.environ.get('WEBR_BROWSER', '/home/lv999/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome')
OWNER = '11111111-1111-4111-8111-111111111111'
DAY = (datetime.now(timezone.utc) + timedelta(hours=9)).date().isoformat()


def payload(currency, query):
    other = 'USD' if currency == 'KRW' else 'KRW'
    metrics = {'completed_amount_minor': 123450 if currency == 'KRW' else 2099,
               'completed_count': 2, 'membership_applied_count': 1,
               'membership_pending_count': 1, 'membership_unknown_count': 1 if currency == 'KRW' else 0, 'review_count': 0,
               'unconfirmed_date_count': 0}
    date = query['from']
    row = {'provider': 'toss' if currency == 'KRW' else 'paypal', 'currency': currency,
           'environment': 'live' if query['environment'] == 'all' else query['environment'], 'kind': 'one_time',
           'id': 'fixture-' + currency, 'owner_id': 'private-fixture-owner',
           'product_id': 'membership', 'product_name': 'Fixture membership',
           'status': 'DONE' if currency == 'KRW' else 'COMPLETED', 'classification': 'completed', 'amount_minor': metrics['completed_amount_minor'],
           'confirmed_at': date + 'T01:00:00Z', 'created_at': date + 'T00:00:00Z', 'activity_at': date + 'T01:00:00Z',
           'time_basis': 'paid_at', 'grant_status': 'applied' if currency == 'USD' else '', 'grant_role': 'member' if currency == 'USD' else '',
           'granted': True if currency == 'USD' else None, 'review_required': False, 'review_reason': ''}
    row['account'] = {'email': 'reader@example.invalid', 'nickname': '테스트 독자', 'name': '합성 사용자'}
    row['account_state'] = 'complete'
    breakdown = {'amt_total': '1234.125', 'amt_tax': '12.345', 'amt_toss': '44.798',
                 'amt_statground': '123.4125', 'amt_benefit_tax': '8.801',
                 'amt_result': '-1234.125', 'basis': 'legacy_krw_formula'} if currency == 'KRW' else {
                     key: None for key in ('amt_total', 'amt_tax', 'amt_toss', 'amt_statground', 'amt_benefit_tax', 'amt_result')}
    if currency == 'USD':
        breakdown['basis'] = 'not_recorded'
    result = {'schema': 'webr.admin.payments.v1', 'ok': True, 'complete': True,
            'admin_snapshot_owner': OWNER, 'admin_snapshot_date': DAY,
            'scope': {key: int(query[key]) if key in ('page', 'page_size') else query[key]
                      for key in ('from', 'to', 'environment', 'provider', 'currency', 'status', 'page', 'page_size', 'section', 'cursor')},
            'sources': {currency: {'state': 'complete', 'summary_state': 'complete', 'ledger_state': 'complete', 'revenue': query['environment'] == 'live'},
                        other: {'state': 'filtered', 'summary_state': 'filtered', 'ledger_state': 'filtered', 'revenue': False}},
            'overview': {currency: metrics, other: None},
            'breakdown': {currency: breakdown, other: None},
            'windows': {currency: {key: metrics for key in ('all', 'year', 'month', 'today')}, other: None},
            'products': [{'provider': row['provider'], 'environment': row['environment'],
                          'currency': currency, 'product_id': 'membership',
                          'product_name': 'Fixture membership',
                          'completed_amount_minor': metrics['completed_amount_minor'], 'completed_count': 2}],
            'timeline': [{'date': date, currency: {'completed_amount_minor': metrics['completed_amount_minor'], 'completed_count': 2}, other: None}],
            'ledger': {'state': 'complete', 'rows': [row], 'total': 1, 'has_more': False, 'next_cursor': None}}
    if query['environment'] in ('all', 'unknown'):
        result['overview'][currency] = result['breakdown'][currency] = result['windows'][currency] = None
        result['products'] = []; result['timeline'] = []
        result['sources'][currency]['summary_state'] = 'environment_required'
    if query['section'] == 'trend':
        result['scope']['grain'] = query['grain']
        grain = query['grain']
        periods = [date[:8] + str(day).zfill(2) for day in range(1, 4)] if grain == 'day' else [date[:4] + '-' + str(month).zfill(2) for month in range(1, 13)] if grain == 'month' else [str(year) for year in range(int(query['from'][:4]), int(query['to'][:4]) + 1)]
        periods = [period for period in periods if query['from'][:len(period)] <= period <= query['to'][:len(period)]]
        result['series'] = {'grain': grain, 'currency': currency, 'environment': query['environment'], 'status': query['status'],
                            'state': 'complete' if query['environment'] in ('live', 'sandbox') else 'environment_required',
                            'time_basis': 'original_payment_activity', 'amount_basis': 'completed_payment' if query['status'] == 'completed' else 'not_recorded',
                            'coverage': {'from': query['from'], 'to': query['to'], 'source_complete': True, 'as_of': DAY + 'T23:59:59+09:00'},
                            'buckets': [{'period': period, 'amount_minor': str(int(metrics['completed_amount_minor']) * (1 + index % 4)) if query['status'] == 'completed' else None,
                                         'count': 2 + index % 4, 'complete': True} for index, period in enumerate(periods)]}
        for bucket in result['series']['buckets']:
            if bucket['period'] > DAY[:len(bucket['period'])]: bucket.update(amount_minor=None, count=None, complete=False)
        if result['series']['state'] != 'complete':
            for row in result['series']['buckets']: row.update(amount_minor=None, count=None, complete=False)
        result['sources'][currency]['trend_state'] = result['series']['state']
        result['sources'][other]['trend_state'] = 'filtered'
        result['sources'][currency]['summary_state'] = result['sources'][currency]['ledger_state'] = 'not_requested'
        result['ledger'].update(state='not_requested', rows=[], total=None)
        return result
    if query['section'] == 'summary':
        result['sources'][currency]['ledger_state'] = 'not_requested'
        result['ledger'].update(state='not_requested', rows=[])
    else:
        result['sources'][currency]['summary_state'] = 'not_requested'
        result['sources'][currency]['revenue'] = False
        result['overview'][currency] = result['breakdown'][currency] = result['windows'][currency] = None
        result['products'] = []; result['timeline'] = []
        result['ledger'].update(total=None)
    return result


class PaymentWorkspace(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True, executable_path=BROWSER)
        self.context = await self.browser.new_context(viewport={'width': 1440, 'height': 1000})
        self.page = await self.context.new_page()
        self.calls = []
        self.producer_records = None
        self.actual_legacy_css = ''.join(Path(p).read_text() for p in os.environ.get('PAYMENT_LEGACY_CSS', '').split(os.pathsep) if p)
        self.producer_scope_errors = []
        self.gates = {'KRW': asyncio.Event(), 'USD': asyncio.Event()}
        self.ledger_gate = asyncio.Event(); self.ledger_gate.set()
        self.failed_currencies = set()
        self.deny = False
        self.wrong_scope = False
        self.keyset = False
        self.trend_gap = False
        self.trend_zero = False
        self.trend_gate = asyncio.Event(); self.trend_gate.set()
        self.trend_fail = set()
        self.authority_unavailable = False
        self.html = '''<!doctype html><html><head><meta charset="utf-8"><style>
          *{box-sizing:border-box}body{margin:0;background:#f8fafc}#div_main{max-width:1400px;margin:auto;padding:24px}
          .webr-admin-shell{display:grid;grid-template-columns:220px minmax(0,1fr);gap:24px}
          aside{background:white;padding:20px;font:14px system-ui;border:1px solid #e2e8f0;border-radius:8px}
          @media(max-width:768px){#div_main{padding:12px}.webr-admin-shell{grid-template-columns:minmax(0,1fr)}aside{display:none}}
          </style></head><body><div id="webr-admin-read-status" data-admin-read-state="pending"></div>
          <div id="div_main"><div class="webr-admin-shell"><aside>관리자<br>결제 현황<br>정산 내역</aside>
          <main class="webr-admin-firstview-content">Original server frame</main></div></div></body></html>'''
        if self.actual_legacy_css:
            self.html = self.html.replace('<html>', '<html data-webr-admin-dashboard=payments>').replace('</style>', self.actual_legacy_css + '</style>').replace('class="webr-admin-firstview-content"', 'class="webr-admin-firstview-content webr-admin-statistics-payments"')
        await self.context.route('**/*', self.route)
        await self.page.goto('https://fixture.invalid/admin/payments/')
        await self.page.evaluate('''owner => {
          window.WEBR_ADMIN_SNAPSHOTS={schema:1,owner};window.gv_is_admin=true;window.gv_role='관리자';
          window.WebRAdminSnapshots={stop(){window.fixtureRetired=true;}};
        }''', OWNER)

    async def asyncTearDown(self):
        for gate in self.gates.values():
            gate.set()
        self.ledger_gate.set(); self.trend_gate.set()
        await self.context.close()
        await self.browser.close()
        await self.playwright.stop()

    async def route(self, route):
        if route.request.is_navigation_request():
            await route.fulfill(status=200, content_type='text/html', body=self.html)
            return
        if route.request.url != 'https://fixture.invalid/admin/ajax_get_admin_payment_workspace/':
            await route.abort()
            return
        query = {key: values[0] for key, values in parse_qs(route.request.post_data, keep_blank_values=True).items()}
        self.calls.append(query)
        if self.producer_records is not None:
            # These objects were serialized by the actual Go handler. Never
            # rebuild a response with payload() or repair a producer field.
            scope = {key: int(value) if key in ('page', 'page_size') else value
                     for key, value in query.items()}
            records = [record for record in self.producer_records if record['request'] == scope]
            if len(records) != 1:
                self.producer_scope_errors.append(scope)
                await route.fulfill(status=503, json={'error': 'fixture_scope_mismatch'})
            else:
                await route.fulfill(status=200, json=records[0]['response'])
            return
        await self.gates[query['currency']].wait()
        if query['section'] == 'ledger':
            await self.ledger_gate.wait()
        if query['section'] == 'trend':
            await self.trend_gate.wait()
        try:
            if self.deny:
                await route.fulfill(status=403, content_type='application/json', body='not-json-private-denial')
            elif query['currency'] in self.failed_currencies or query['section'] == 'trend' and query['currency'] in self.trend_fail:
                await route.fulfill(status=503, content_type='application/json', body=json.dumps({'error': 'authority_unavailable'} if self.authority_unavailable else {}))
            else:
                value = payload(query['currency'], query)
                if query['section'] == 'trend':
                    if self.trend_gap and len(value['series']['buckets']) > 1: value['series']['buckets'][1].update(amount_minor=None, count=None, complete=False)
                    if self.trend_zero:
                        for bucket in value['series']['buckets']:
                            if bucket['complete']: bucket.update(amount_minor=0, count=0)
                if self.keyset and query['currency'] == 'KRW':
                    value['ledger']['total'] = 70 if query['section'] == 'summary' else None
                    if query['section'] == 'ledger':
                        second = query['cursor'] == 'opaque-KRW-page-2'
                        value['ledger']['rows'][0]['id'] = 'fixture-page-2' if second else 'fixture-page-1'
                        value['ledger']['rows'][0]['kind'] = 'subscription' if second else 'one_time'
                        value['ledger']['rows'][0]['status'] = 'paid' if second else 'DONE'
                        value['ledger']['has_more'] = not second
                        value['ledger']['next_cursor'] = None if second else 'opaque-KRW-page-2'
                if self.keyset and query['currency'] == 'USD' and query['section'] == 'ledger':
                    value['ledger']['rows'][0]['activity_at'] = query['from'] + 'T09:30:00+09:00'
                if self.wrong_scope:
                    value['scope']['environment'] = 'sandbox'
                await route.fulfill(status=200, content_type='application/json', body=json.dumps(value))
        except Exception:
            # Aborted older ownership is expected; it cannot affect current UI.
            pass

    async def start(self):
        await self.page.add_script_tag(content=(BRIDGES / 'payments/set_main_20260815_2125.js').read_text())
        await self.page.add_script_tag(content=SCRIPT.read_text())
        await self.page.wait_for_function('document.querySelectorAll("[data-section]").length===3')

    async def test_trends_and_account_identity_preserve_independent_scopes(self):
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(len(self.calls), 6)
        self.assertEqual([q['grain'] for q in self.calls if q['section'] == 'trend'], ['day', 'day'])
        self.assertEqual(await self.page.locator('.pw-trend-figure svg').count(), 2)
        self.assertIn('reader@example.invalid', await self.page.locator('.pw-ledger').inner_text())
        self.assertIn('테스트 독자', await self.page.locator('.pw-ledger').inner_text())
        self.assertIn('합성 사용자', await self.page.locator('.pw-ledger').inner_text())
        self.assertNotIn('private-fixture-owner', await self.page.locator('.pw-ledger').inner_text())
        original = [(q['from'], q['to']) for q in self.calls if q['section'] != 'trend']
        await self.page.locator('[data-trend-preset=year]').click()
        await self.page.wait_for_function('document.querySelector("[data-section=timeline]").getAttribute("aria-busy")==="false"')
        self.assertEqual(len(self.calls), 8)
        self.assertTrue(all(q['grain'] == 'year' for q in self.calls[-2:]))
        self.assertEqual(int(self.calls[-1]['to'][:4]) - int(self.calls[-1]['from'][:4]), 9)
        self.assertEqual([(q['from'], q['to']) for q in self.calls if q['section'] != 'trend'], original)
        self.assertIn('추이 기간은 위 요약·원장 기간과 별도', await self.page.locator('[data-section=timeline]').inner_text())
        await self.page.locator('[data-trend-metric=count]').click()
        self.assertEqual(len(self.calls), 8)
        self.assertIn('완료 건수', await self.page.locator('.pw-trend-figure').first.inner_text())
        for width in (1440, 390):
            await self.page.set_viewport_size({'width': width, 'height': 1000})
            self.assertFalse(await self.page.evaluate('document.documentElement.scrollWidth>innerWidth'))
            host = await self.page.locator('main').bounding_box(); workspace = await self.page.locator('.webr-payment-workspace').bounding_box()
            self.assertAlmostEqual(host['width'], workspace['width'], delta=1)
            if os.environ.get('PAYMENT_SCREENSHOT_DIR'):
                folder = Path(os.environ['PAYMENT_SCREENSHOT_DIR']); folder.mkdir(parents=True, exist_ok=True)
                await self.page.screenshot(path=str(folder / f'payments-synthetic-{width}.png'), full_page=True)
        await self.page.evaluate("document.dispatchEvent(new PageTransitionEvent('pagehide'))")
        await self.page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide'))")
        self.assertNotIn('reader@example.invalid', await self.page.locator('#div_main').inner_text())

    async def test_trend_failure_gap_zero_and_future_are_not_revenue_or_sibling_failure(self):
        self.gates['KRW'].set(); self.gates['USD'].set(); self.trend_gate.clear(); self.trend_gap = True
        await self.start()
        await self.page.wait_for_function('document.querySelector("[data-section=overview]").getAttribute("aria-busy")==="false" && document.querySelector("[data-section=ledger]").getAttribute("aria-busy")==="false"')
        self.assertEqual(await self.page.locator('[data-section=timeline]').get_attribute('aria-busy'), 'true')
        self.assertIn('reader@example.invalid', await self.page.locator('.pw-ledger').inner_text())
        self.trend_fail.add('USD'); self.trend_gate.set()
        await self.page.wait_for_function('document.querySelector("[data-section=timeline]").getAttribute("aria-busy")==="false"')
        self.assertEqual(await self.page.locator('.pw-trend-figure svg').count(), 1)
        self.assertIn('누락 구간을 0으로', await self.page.locator('[data-section=timeline]').inner_text())
        path = await self.page.locator('.pw-chart-line').get_attribute('d')
        self.assertEqual(path.count('M'), 2)
        self.assertEqual(await self.page.locator('[data-section=overview]').get_attribute('data-state'), 'complete')
        self.trend_fail.clear(); self.trend_gap = False; self.trend_zero = True
        await self.page.locator('[data-trend-grain=month]').click()
        await self.page.wait_for_function('document.querySelector("[data-section=timeline]").getAttribute("aria-busy")==="false"')
        self.assertIn('완료 결제는 0', await self.page.locator('[data-section=timeline]').inner_text())
        self.assertEqual(len(self.calls), 8)
        query = dict(self.calls[-1]); value = payload(query['currency'], query)
        future_query = dict(query, **{'from': DAY[:4] + '-01-01', 'to': DAY[:4] + '-12-31'})
        bad = payload(query['currency'], future_query); bad['series']['buckets'][-1].update(complete=True, amount_minor='0', count=0)
        self.assertFalse(await self.page.evaluate('v=>WebRPaymentWorkspace.validate(v,v.scope,"trend",v.admin_snapshot_owner)', bad))
        # Mixed environments cannot turn null amounts into fake revenue.
        mixed = dict(query, environment='all'); value = payload(query['currency'], mixed)
        value['sources'][query['currency']]['state'] = 'environment_required'
        self.assertTrue(await self.page.evaluate('v=>WebRPaymentWorkspace.validate(v,v.scope,"trend",v.admin_snapshot_owner)', value))
        value['series']['buckets'][0].update(amount_minor='1', count=1, complete=True)
        self.assertFalse(await self.page.evaluate('v=>WebRPaymentWorkspace.validate(v,v.scope,"trend",v.admin_snapshot_owner)', value))

    async def test_route_purpose_and_period_presets_screenshots(self):
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        async def capture(label):
            for width in (1440, 390):
                await self.page.set_viewport_size({'width': width, 'height': 1000})
                self.assertFalse(await self.page.evaluate('document.documentElement.scrollWidth>innerWidth'))
                host = await self.page.locator('main').bounding_box(); body = await self.page.locator('.webr-payment-workspace').bounding_box()
                self.assertAlmostEqual(host['width'], body['width'], delta=1)
                if os.environ.get('PAYMENT_SCREENSHOT_DIR'):
                    folder = Path(os.environ['PAYMENT_SCREENSHOT_DIR']); folder.mkdir(parents=True, exist_ok=True)
                    await self.page.screenshot(path=str(folder / f'{label}-{width}.png'), full_page=True)
        self.assertIn('권한 적용 확인', await self.page.locator('[data-section=overview]').inner_text())
        self.assertNotIn('예상 정산액', await self.page.locator('[data-section=overview]').inner_text())
        self.assertEqual(await self.page.locator('.pw-chart-scale').count(), 2)
        self.assertGreater(await self.page.locator('.pw-chart-dot[tabindex="0"]').count(), 0)
        await capture('payments-daily')
        old_scope = await self.page.locator('[name=from]').input_value()
        await self.page.locator('[data-trend-preset=month]').click()
        await self.page.wait_for_function('document.querySelector("[data-section=timeline]").getAttribute("aria-busy")==="false"')
        self.assertEqual(await self.page.locator('[name=from]').input_value(), old_scope)
        self.assertTrue(all(q['section'] == 'trend' and q['grain'] == 'month' for q in self.calls[-2:]))
        self.assertEqual(len(self.calls), 8)
        await capture('payments-monthly')
        await self.page.locator('[data-trend-preset=year]').click()
        await self.page.wait_for_function('document.querySelector("[data-section=timeline]").getAttribute("aria-busy")==="false"')
        await capture('payments-annual')
        await self.page.goto('https://fixture.invalid/admin/balance_account/2026/9/')
        await self.page.evaluate('''owner=>{window.WEBR_ADMIN_SNAPSHOTS={schema:1,owner};window.gv_is_admin=true;window.gv_role='관리자';window.WebRAdminSnapshots={stop(){}};}''', OWNER)
        before = len(self.calls)
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(len(self.calls) - before, 4)
        self.assertFalse(any(q['section'] == 'trend' for q in self.calls[before:]))
        self.assertFalse(await self.page.locator('[data-section=timeline]').is_visible())
        self.assertIn('예상 정산액', await self.page.locator('[data-section=overview]').inner_text())
        self.assertIn('1,234.125 KRW', await self.page.locator('.pw-card').first.inner_text())
        self.assertEqual(await self.page.locator('[data-section=overview] table').first.locator('tbody tr').count(), 6)
        await capture('balance-settlement')

    async def test_legacy_grid_host_is_full_width_and_filters_do_not_overlap(self):
        # Both the pending host and live mount must retain the outer sidebar,
        # while the retired legacy two-column statistics grid has one workspace.
        await self.page.add_style_tag(content='''.statistics-payments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}''')
        await self.page.locator('main').evaluate("node=>node.classList.add('statistics-payments')")
        await self.start()
        for width in (1440, 820, 390):
            await self.page.set_viewport_size({'width': width, 'height': 1000})
            bounds = await self.page.evaluate('''() => {
              const host=document.querySelector('main').getBoundingClientRect(),root=document.querySelector('.webr-payment-workspace').getBoundingClientRect();
              const fields=[...document.querySelectorAll('.pw-filter input,.pw-filter select')].map(n=>({field:n.getBoundingClientRect().toJSON(),label:n.parentElement.getBoundingClientRect().toJSON()}));
              return {host:host.width,root:root.width,overflow:document.documentElement.scrollWidth>innerWidth,fields};
            }''')
            self.assertAlmostEqual(bounds['root'], bounds['host'], delta=1)
            self.assertFalse(bounds['overflow'])
            for item in bounds['fields']:
                self.assertGreaterEqual(item['field']['left'], item['label']['left'] - 1)
                self.assertLessEqual(item['field']['right'], item['label']['right'] + 1)
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(len(self.calls), 6)
        self.assertIn('USD', await self.page.locator('[data-section=overview]').inner_text())
        await self.page.set_viewport_size({'width': 1440, 'height': 1000})
        host = await self.page.locator('main').bounding_box()
        workspace = await self.page.locator('.webr-payment-workspace').bounding_box()
        self.assertAlmostEqual(host['width'], workspace['width'], delta=1)
        self.assertEqual(round((await self.page.locator('aside').bounding_box())['width']), 260 if self.actual_legacy_css else 220)

    async def test_actual_go_serialized_summary_and_ledger_contract(self):
        # Generated by the current App actual handler + writeJSON under its
        # synctest clock. Only database rows and admitted identity are synthetic.
        fixture = (ROOT / 'tests/fixtures/admin_payment_workspace_producer.json').read_bytes()
        self.assertEqual(hashlib.sha256(fixture).hexdigest(),
                         '2529cd13923268f8e8f933ba17855d05b7d4750dae38447c2235cdd126face87')
        self.producer_records = json.loads(fixture)
        self.assertEqual(len(self.producer_records), 20)
        await self.page.clock.set_fixed_time(datetime(2000, 1, 1, tzinfo=timezone.utc))
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(len(self.calls), 6)
        self.assertEqual(self.producer_scope_errors, [])
        self.assertTrue(all(q['from'] == '2000-01-01' and q['to'] == '2000-01-31' for q in self.calls))
        overview = self.page.locator('[data-section=overview]')
        self.assertIn('32,000 KRW', await overview.inner_text())
        self.assertIn('12.99 USD', await overview.inner_text())
        timeline = await self.page.locator('[data-section=timeline]').inner_text()
        self.assertIn('32,000 KRW', timeline)
        self.assertIn('12.99 USD', timeline)
        self.assertEqual(await self.page.locator('.pw-ledger tbody tr').count(), 3)
        ledger = await self.page.locator('.pw-ledger').inner_text()
        self.assertIn('정기결제', ledger)
        self.assertIn('권한 확인되지 않음', ledger)
        await overview.locator('summary').click()
        review = overview.locator('.pw-card').filter(has=self.page.get_by_role('heading', name='검토 필요', exact=True))
        self.assertIn('확인되지 않음', await review.inner_text())
        for grain in ('month', 'year'):
            await self.page.locator(f'[data-trend-grain={grain}]').click()
            await self.page.wait_for_function('document.querySelector("[data-section=timeline]").getAttribute("aria-busy")==="false"')
        self.assertEqual(len(self.calls), 10)
        # The next natural filter uses the remaining real producer records.
        # Unsupported KRW sandbox coverage must not erase the verified USD part.
        await self.page.locator('[name=environment]').select_option('sandbox')
        await self.page.locator('.pw-filter button[type=submit]').click()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(len(self.calls), 16)
        self.assertEqual(self.producer_scope_errors, [])
        text = await self.page.locator('[data-section=overview]').inner_text()
        self.assertIn('12.99 USD', text)
        self.assertIn('확인되지 않음', text)
        self.assertNotIn('32,000 KRW', text)
        self.assertEqual(await self.page.locator('.pw-ledger tbody tr').count(), 1)
        self.assertIn('일부 통화를 확인하지 못했습니다', await self.page.locator('[data-section=ledger] .pw-status').inner_text())

        for grain in ('day', 'month'):
            await self.page.locator(f'[data-trend-grain={grain}]').click()
            await self.page.wait_for_function('document.querySelector("[data-section=timeline]").getAttribute("aria-busy")==="false"')
        self.assertEqual(len(self.calls), 20)
        self.assertEqual(self.producer_scope_errors, [])

    async def test_both_arrival_orders_paint_independently(self):
        for first in ('KRW', 'USD'):
            with self.subTest(first=first):
                self.gates = {'KRW': asyncio.Event(), 'USD': asyncio.Event()}
                self.calls.clear()
                await self.page.reload()
                await self.page.evaluate('''owner=>{window.WEBR_ADMIN_SNAPSHOTS={schema:1,owner};window.gv_is_admin=true;window.gv_role='관리자';window.WebRAdminSnapshots={stop(){}};}''', OWNER)
                await self.start()
                await self.page.wait_for_function('document.querySelector("[data-section=overview]").getAttribute("aria-busy")==="true"')
                while len(self.calls) < 6:
                    await asyncio.sleep(.01)
                self.assertEqual({(q['section'], q['currency']) for q in self.calls},
                                 {(s, c) for s in ('summary', 'ledger', 'trend') for c in ('KRW', 'USD')})
                self.gates[first].set()
                amount = '123,450 KRW' if first == 'KRW' else '20.99 USD'
                await self.page.wait_for_function('text=>document.querySelector("[data-section=overview]").textContent.includes(text)', arg=amount)
                overview = await self.page.locator('[data-section=overview]').inner_text()
                self.assertIn('확인 중', overview)
                self.assertEqual(await self.page.locator('[data-section=overview]').get_attribute('aria-busy'), 'true')
                self.gates['USD' if first == 'KRW' else 'KRW'].set()
                await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
                self.assertEqual(await self.page.locator('.pw-ledger tbody tr').count(), 2)
                self.assertEqual(await self.page.locator('#paypal-admin-orders').count(), 0)
                self.assertIn('20.99 USD', await self.page.locator('[data-section=overview]').inner_text())
                self.assertIn('123,450 KRW', await self.page.locator('[data-section=overview]').inner_text())

    async def test_one_source_failure_does_not_erase_good_currency_or_round_money(self):
        self.failed_currencies.add('USD')
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        overview = await self.page.locator('[data-section=overview]').inner_text()
        self.assertIn('123,450 KRW', overview)
        self.assertIn('확인되지 않음', overview)
        self.assertNotIn('예상 정산액', overview)
        self.assertNotIn('0.00 USD', overview)
        self.assertEqual(await self.page.locator('.pw-ledger tbody tr').count(), 1)
        self.assertIn('권한 확인되지 않음', await self.page.locator('.pw-ledger').inner_text())
        self.assertIn('일부 통화를 확인하지 못했습니다', await self.page.locator('[data-section=ledger] .pw-status').inner_text())

    async def test_denial_retires_all_private_data_without_retry(self):
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.deny = True
        await self.page.locator('[name=environment]').select_option('sandbox')
        await self.page.locator('.pw-filter button[type=submit]').click()
        await self.page.wait_for_function('window.fixtureRetired===true')
        text = await self.page.locator('#webr-payment-workspace').inner_text()
        self.assertNotIn('123,450', text)
        self.assertNotIn('Fixture membership', text)
        self.assertEqual(await self.page.locator('.pw-ledger').count(), 0)
        self.assertLessEqual(len(self.calls), 12)
        self.assertGreaterEqual(len(self.calls), 7)

    async def test_wrong_filter_response_is_not_adopted_and_mobile_has_no_page_overflow(self):
        self.wrong_scope = True
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.page.set_viewport_size({'width': 390, 'height': 844})
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertNotIn('123,450', await self.page.locator('#webr-payment-workspace').inner_text())
        self.assertFalse(await self.page.evaluate('document.documentElement.scrollWidth>innerWidth+1'))

    async def test_mixed_environment_suppresses_revenue_and_layout_has_no_blank_chart(self):
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        await self.page.locator('[name=environment]').select_option('all')
        await self.page.locator('.pw-filter button[type=submit]').click()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        overview = await self.page.locator('[data-section=overview]').inner_text()
        self.assertNotIn('123,450 KRW', overview)
        self.assertNotIn('20.99 USD', overview)
        self.assertIn('실제·테스트 금액은 합산하지 않습니다', overview)
        self.assertEqual(await self.page.locator('canvas,#div_statistics_graph').count(), 0)
        self.assertFalse(await self.page.evaluate('document.documentElement.scrollWidth>innerWidth+1'))

    async def test_populated_balance_month_and_mobile_layout(self):
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.page.goto('https://fixture.invalid/admin/balance_account/2026/9/')
        await self.page.evaluate('''owner=>{window.WEBR_ADMIN_SNAPSHOTS={schema:1,owner};window.gv_is_admin=true;window.gv_role='관리자';window.WebRAdminSnapshots={stop(){}};}''', OWNER)
        await self.page.add_script_tag(content=(BRIDGES / 'balance_account/set_main_20260815_2125.js').read_text())
        await self.page.add_script_tag(content=SCRIPT.read_text())
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(await self.page.locator('h1').inner_text(), '정산액 조회')
        self.assertEqual(await self.page.locator('[name=month]').input_value(), '2026-09')
        self.assertTrue(all(q['from'] == '2026-09-01' and q['to'] == '2026-09-30' for q in self.calls))
        self.assertTrue(await self.page.locator('[data-section=overview] details').get_attribute('open') is not None)
        self.assertEqual(await self.page.locator('[data-section=overview] table').first.locator('tbody tr').count(), 6)
        self.assertEqual(await self.page.locator('[data-section=overview] table').nth(1).locator('tbody tr').count(), 4)
        self.assertIn('권한 적용 미확인', await self.page.locator('[data-section=overview]').inner_text())
        self.assertIn('1,234.125 KRW', await self.page.locator('[data-section=overview]').inner_text())
        self.assertIn('−1,234.125 KRW', await self.page.locator('[data-section=overview]').inner_text())
        self.assertFalse(await self.page.locator('[data-section=timeline]').is_visible())
        self.assertEqual(len(self.calls), 4)
        self.assertEqual(await self.page.locator('.pw-ledger tbody tr').count(), 2)
        out = Path('/tmp/webr-step4-payment-trends-source-backend-20261018/balance-controlled')
        out.mkdir(parents=True, exist_ok=True)
        await self.page.screenshot(path=str(out / 'desktop.png'), full_page=True)
        await self.page.set_viewport_size({'width': 390, 'height': 844})
        self.assertFalse(await self.page.evaluate('document.documentElement.scrollWidth>innerWidth+1'))
        await self.page.screenshot(path=str(out / 'mobile.png'), full_page=True)

    async def test_summary_paints_without_waiting_for_ledger(self):
        self.ledger_gate.clear()
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelector("[data-section=overview]").getAttribute("aria-busy")==="false"')
        self.assertIn('123,450 KRW', await self.page.locator('[data-section=overview]').inner_text())
        self.assertEqual(await self.page.locator('[data-section=ledger]').get_attribute('aria-busy'), 'true')
        self.assertNotIn('해당하는 내역이 없습니다', await self.page.locator('[data-section=ledger]').inner_text())
        self.ledger_gate.set()
        await self.page.wait_for_function('document.querySelector("[data-section=ledger]").getAttribute("aria-busy")==="false"')
        self.assertEqual(await self.page.locator('.pw-ledger tbody tr').count(), 2)

    async def test_money_and_row_scope_mismatches_are_rejected(self):
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        summary_query = dict(self.calls[0], currency='USD', section='summary')
        ledger_query = dict(summary_query, section='ledger')
        summary, ledger = payload('USD', summary_query), payload('USD', ledger_query)
        results = await self.page.evaluate('''({summary,ledger,owner})=>{
          const validate=window.WebRPaymentWorkspace.validate;
          const clone=v=>JSON.parse(JSON.stringify(v));
          const good=[validate(summary,summary.scope,'overview',owner),validate(ledger,ledger.scope,'ledger',owner)];
          const bad=[];
          for(const [path,value] of [['environment','sandbox'],['currency','KRW']]){
            const p=clone(ledger);p.ledger.rows[0][path]=value;bad.push(validate(p,p.scope,'ledger',owner));
          }
          const fee=clone(summary);fee.breakdown.USD.amt_toss=1;bad.push(validate(fee,fee.scope,'overview',owner));
          const count=clone(summary);count.ledger.total='1';bad.push(validate(count,count.scope,'overview',owner));
          const cursor=clone(ledger);cursor.ledger.has_more=true;bad.push(validate(cursor,cursor.scope,'ledger',owner));
          return {good,bad};
        }''', {'summary': summary, 'ledger': ledger, 'owner': OWNER})
        self.assertEqual(results, {'good': [True, True], 'bad': [False] * 5})

    async def test_keyset_next_previous_and_filter_reset_are_currency_scoped(self):
        self.keyset = True
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(len(self.calls), 6)
        self.assertTrue(all(q['cursor'] == '' for q in self.calls))
        self.assertIn('fixture-page-1', await self.page.locator('.pw-ledger tbody tr').first.text_content())
        await self.page.get_by_role('button', name='KRW 다음', exact=True).click()
        await self.page.wait_for_function('document.querySelector(".pw-ledger").textContent.includes("fixture-page-2")')
        self.assertEqual(len(self.calls), 7)
        self.assertEqual((self.calls[-1]['currency'], self.calls[-1]['section'], self.calls[-1]['cursor']),
                         ('KRW', 'ledger', 'opaque-KRW-page-2'))
        self.assertIn('fixture-USD', await self.page.locator('.pw-ledger').text_content())
        self.assertIn('정기결제', await self.page.locator('.pw-ledger').text_content())
        self.assertTrue(await self.page.get_by_role('button', name='KRW 다음', exact=True).is_disabled())
        await self.page.get_by_role('button', name='KRW 이전', exact=True).click()
        await self.page.wait_for_function('document.querySelector(".pw-ledger").textContent.includes("fixture-page-1")')
        self.assertEqual(self.calls[-1]['cursor'], '')
        await self.page.locator('.pw-filter button[type=submit]').click()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(len(self.calls), 14)
        self.assertTrue(all(q['cursor'] == '' for q in self.calls[-6:]))
        self.assertNotIn('opaque-KRW', await self.page.locator('#webr-payment-workspace').inner_text())

    async def test_authority_unavailable_retires_previously_painted_currency(self):
        self.failed_currencies.add('USD'); self.authority_unavailable = True
        self.gates['KRW'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelector("[data-section=overview]").textContent.includes("123,450 KRW")')
        self.gates['USD'].set()
        await self.page.wait_for_function('window.fixtureRetired===true')
        text = await self.page.locator('#webr-payment-workspace').inner_text()
        self.assertNotIn('123,450', text)
        self.assertNotIn('Fixture membership', text)
        self.assertEqual(await self.page.locator('.pw-ledger').count(), 0)

    async def test_visible_resume_reloads_only_unapplied_sections_without_adopting_draft(self):
        self.gates['KRW'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelector("[data-section=overview]").textContent.includes("123,450 KRW")')
        await self.page.wait_for_function('document.querySelector(".pw-ledger")?.textContent.includes("fixture-KRW")')
        await self.page.locator('[name=environment]').select_option('sandbox')
        await self.page.evaluate('''()=>{
          window.fixtureHidden=true;
          Object.defineProperty(document,'hidden',{configurable:true,get(){return window.fixtureHidden;}});
          document.dispatchEvent(new Event('visibilitychange'));
          window.fixtureHidden=false;document.dispatchEvent(new Event('visibilitychange'));
        }''')
        self.gates['USD'].set()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertIn('20.99 USD', await self.page.locator('[data-section=overview]').inner_text())
        self.assertEqual(sum(q['currency'] == 'KRW' for q in self.calls), 3)
        self.assertEqual(sum(q['currency'] == 'USD' for q in self.calls), 6)
        self.assertTrue(all(q['environment'] == 'live' for q in self.calls))
        self.assertEqual(await self.page.locator('[name=environment]').input_value(), 'sandbox')
        self.assertIn('123,450 KRW', await self.page.locator('[data-section=overview]').inner_text())

    async def test_transport_waits_past_four_seconds_and_cleans_at_twelve(self):
        await self.page.evaluate('''()=>{
          const set=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window),fetch=window.fetch.bind(window);
          let now=0,next=-1;const timers=new Map();window.fixtureAborts=0;
          window.setTimeout=(fn,delay,...args)=>{
            if(delay<4000)return set(fn,delay,...args);
            const id=next--;timers.set(id,{at:now+delay,run:()=>fn(...args)});return id;
          };
          window.clearTimeout=id=>{if(!timers.delete(id))clear(id);};
          window.fetch=(url,options)=>{
            options?.signal?.addEventListener('abort',()=>window.fixtureAborts++,{once:true});
            return fetch(url,options);
          };
          window.fixtureAdvance=ms=>{
            now+=ms;for(const [id,timer] of [...timers])if(timer.at<=now){timers.delete(id);timer.run();}
            return timers.size;
          };
        }''')
        await self.start()
        while len(self.calls) < 6:
            await asyncio.sleep(.01)
        self.assertEqual(await self.page.evaluate('window.fixtureAdvance(4000)'), 6)
        self.assertEqual(await self.page.evaluate('window.fixtureAborts'), 0)
        self.assertEqual(await self.page.locator('[data-section=overview]').get_attribute('aria-busy'), 'true')
        self.assertEqual(await self.page.evaluate('window.fixtureAdvance(8000)'), 0)
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(await self.page.evaluate('window.fixtureAborts'), 6)
        self.assertEqual(len(self.calls), 6)
        self.assertNotIn('123,450', await self.page.locator('#webr-payment-workspace').inner_text())

    async def test_toss_recurring_paid_status_keeps_legacy_and_paypal_gates(self):
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        query=dict(self.calls[0],currency='KRW',section='ledger')
        recurring=payload('KRW',query)
        recurring['ledger']['rows'][0].update(kind='subscription',status='paid',granted=True,grant_status='applied')
        results=await self.page.evaluate('''({data,owner})=>{
          const validate=window.WebRPaymentWorkspace.validate,run=v=>validate(v,v.scope,'ledger',owner);
          const clone=()=>JSON.parse(JSON.stringify(data));
          const positive=run(data),bad=[];
          for(const status of ['DONE','pending','failed']){const v=clone();v.ledger.rows[0].status=status;bad.push(run(v));}
          const review=clone();review.ledger.rows[0].review_required=true;bad.push(run(review));
          const noDate=clone();noDate.ledger.rows[0].confirmed_at=null;bad.push(run(noDate));
          const legacy=clone();legacy.ledger.rows[0].kind='one_time';bad.push(run(legacy));
          legacy.ledger.rows[0].status='DONE';const legacyValid=run(legacy);
          const paypal=clone();paypal.scope.currency='USD';Object.assign(paypal.ledger.rows[0],{provider:'paypal',currency:'USD'});bad.push(run(paypal));
          paypal.ledger.rows[0].status='COMPLETED';const paypalValid=run(paypal);
          return {positive,legacyValid,paypalValid,bad};
        }''',{'data':recurring,'owner':OWNER})
        self.assertEqual(results,{'positive':True,'legacyValid':True,'paypalValid':True,'bad':[False]*7})


if __name__ == '__main__':
    unittest.main()
