"""Controlled DOM/API fixtures only; no real account, host, cookie or provider."""
import asyncio
from datetime import datetime, timedelta, timezone
import json
import os
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
            'timeline': [{'date': date, currency: {'amount_minor': metrics['completed_amount_minor'], 'count': 2}, other: None}],
            'ledger': {'state': 'complete', 'rows': [row], 'total': 1, 'has_more': False, 'next_cursor': None}}
    if query['environment'] in ('all', 'unknown'):
        result['overview'][currency] = result['breakdown'][currency] = result['windows'][currency] = None
        result['products'] = []; result['timeline'] = []
        result['sources'][currency]['summary_state'] = 'environment_required'
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
        self.gates = {'KRW': asyncio.Event(), 'USD': asyncio.Event()}
        self.ledger_gate = asyncio.Event(); self.ledger_gate.set()
        self.fail = set()
        self.deny = False
        self.wrong_scope = False
        self.keyset = False
        self.authority_unavailable = False
        self.html = '''<!doctype html><html><head><meta charset="utf-8"><style>
          body{margin:0;background:#f8fafc}#div_main{max-width:1400px;margin:auto;padding:24px}
          .webr-admin-shell{display:grid;grid-template-columns:220px minmax(0,1fr);gap:24px}
          aside{background:white;padding:20px;font:14px system-ui;border:1px solid #e2e8f0;border-radius:8px}
          @media(max-width:768px){#div_main{padding:12px}.webr-admin-shell{grid-template-columns:minmax(0,1fr)}aside{display:none}}
          </style></head><body><div id="webr-admin-read-status" data-admin-read-state="pending"></div>
          <div id="div_main"><div class="webr-admin-shell"><aside>관리자<br>결제 현황<br>정산 내역</aside>
          <main class="webr-admin-firstview-content">Original server frame</main></div></div></body></html>'''
        await self.context.route('**/*', self.route)
        await self.page.goto('https://fixture.invalid/admin/payments/')
        await self.page.evaluate('''owner => {
          window.WEBR_ADMIN_SNAPSHOTS={schema:1,owner};window.gv_is_admin=true;window.gv_role='관리자';
          window.WebRAdminSnapshots={stop(){window.fixtureRetired=true;}};
        }''', OWNER)

    async def asyncTearDown(self):
        for gate in self.gates.values():
            gate.set()
        self.ledger_gate.set()
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
        await self.gates[query['currency']].wait()
        if query['section'] == 'ledger':
            await self.ledger_gate.wait()
        try:
            if self.deny:
                await route.fulfill(status=403, content_type='application/json', body='not-json-private-denial')
            elif query['currency'] in self.fail:
                await route.fulfill(status=503, content_type='application/json', body=json.dumps({'error': 'authority_unavailable'} if self.authority_unavailable else {}))
            else:
                value = payload(query['currency'], query)
                if self.keyset and query['currency'] == 'KRW':
                    value['ledger']['total'] = 70 if query['section'] == 'summary' else None
                    if query['section'] == 'ledger':
                        second = query['cursor'] == 'opaque-KRW-page-2'
                        value['ledger']['rows'][0]['id'] = 'fixture-page-2' if second else 'fixture-page-1'
                        value['ledger']['rows'][0]['kind'] = 'subscription' if second else 'one_time'
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

    async def test_both_arrival_orders_paint_independently(self):
        for first in ('KRW', 'USD'):
            with self.subTest(first=first):
                self.gates = {'KRW': asyncio.Event(), 'USD': asyncio.Event()}
                self.calls.clear()
                await self.page.reload()
                await self.page.evaluate('''owner=>{window.WEBR_ADMIN_SNAPSHOTS={schema:1,owner};window.gv_is_admin=true;window.gv_role='관리자';window.WebRAdminSnapshots={stop(){}};}''', OWNER)
                await self.start()
                await self.page.wait_for_function('document.querySelector("[data-section=overview]").getAttribute("aria-busy")==="true"')
                while len(self.calls) < 4:
                    await asyncio.sleep(.01)
                self.assertEqual({(q['section'], q['currency']) for q in self.calls},
                                 {(s, c) for s in ('summary', 'ledger') for c in ('KRW', 'USD')})
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
        self.fail.add('USD')
        self.gates['KRW'].set(); self.gates['USD'].set()
        await self.start()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        overview = await self.page.locator('[data-section=overview]').inner_text()
        self.assertIn('123,450 KRW', overview)
        self.assertIn('확인되지 않음', overview)
        self.assertIn('1,234.125 KRW', overview)
        self.assertIn('−1,234.125 KRW', overview)
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
        await self.page.locator('button[type=submit]').click()
        await self.page.wait_for_function('window.fixtureRetired===true')
        text = await self.page.locator('#webr-payment-workspace').inner_text()
        self.assertNotIn('123,450', text)
        self.assertNotIn('Fixture membership', text)
        self.assertEqual(await self.page.locator('.pw-ledger').count(), 0)
        self.assertLessEqual(len(self.calls), 8)
        self.assertGreaterEqual(len(self.calls), 5)

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
        await self.page.locator('button[type=submit]').click()
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
        await self.page.locator('[data-section=overview] summary').click()
        self.assertEqual(await self.page.locator('[data-section=overview] table').first.locator('tbody tr').count(), 6)
        self.assertEqual(await self.page.locator('[data-section=overview] table').nth(1).locator('tbody tr').count(), 4)
        self.assertIn('권한 적용 미확인', await self.page.locator('[data-section=overview]').inner_text())
        self.assertEqual(await self.page.locator('.pw-ledger tbody tr').count(), 2)
        out = Path('/tmp/webr-step4-payment-workspace-controls-v2-audit-20261018')
        out.mkdir(exist_ok=True)
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
        self.assertEqual(len(self.calls), 4)
        self.assertTrue(all(q['cursor'] == '' for q in self.calls))
        self.assertIn('fixture-page-1', await self.page.locator('.pw-ledger tbody tr').first.inner_text())
        await self.page.get_by_role('button', name='KRW 다음', exact=True).click()
        await self.page.wait_for_function('document.querySelector(".pw-ledger").textContent.includes("fixture-page-2")')
        self.assertEqual(len(self.calls), 5)
        self.assertEqual((self.calls[-1]['currency'], self.calls[-1]['section'], self.calls[-1]['cursor']),
                         ('KRW', 'ledger', 'opaque-KRW-page-2'))
        self.assertIn('fixture-USD', await self.page.locator('.pw-ledger').inner_text())
        self.assertIn('정기결제', await self.page.locator('.pw-ledger').inner_text())
        self.assertTrue(await self.page.get_by_role('button', name='KRW 다음', exact=True).is_disabled())
        await self.page.get_by_role('button', name='KRW 이전', exact=True).click()
        await self.page.wait_for_function('document.querySelector(".pw-ledger").textContent.includes("fixture-page-1")')
        self.assertEqual(self.calls[-1]['cursor'], '')
        await self.page.locator('button[type=submit]').click()
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(len(self.calls), 10)
        self.assertTrue(all(q['cursor'] == '' for q in self.calls[-4:]))
        self.assertNotIn('opaque-KRW', await self.page.locator('#webr-payment-workspace').inner_text())

    async def test_authority_unavailable_retires_previously_painted_currency(self):
        self.fail.add('USD'); self.authority_unavailable = True
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
        self.assertEqual(sum(q['currency'] == 'KRW' for q in self.calls), 2)
        self.assertEqual(sum(q['currency'] == 'USD' for q in self.calls), 4)
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
        while len(self.calls) < 4:
            await asyncio.sleep(.01)
        self.assertEqual(await self.page.evaluate('window.fixtureAdvance(4000)'), 4)
        self.assertEqual(await self.page.evaluate('window.fixtureAborts'), 0)
        self.assertEqual(await self.page.locator('[data-section=overview]').get_attribute('aria-busy'), 'true')
        self.assertEqual(await self.page.evaluate('window.fixtureAdvance(8000)'), 0)
        await self.page.wait_for_function('document.querySelectorAll("[data-section][aria-busy=true]").length===0')
        self.assertEqual(await self.page.evaluate('window.fixtureAborts'), 4)
        self.assertEqual(len(self.calls), 4)
        self.assertNotIn('123,450', await self.page.locator('#webr-payment-workspace').inner_text())


if __name__ == '__main__':
    unittest.main()
