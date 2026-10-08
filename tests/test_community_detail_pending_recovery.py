import json
import os
import re
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'scripts_go/web_r_go_20260629_1025'
SCRIPT = Path(os.environ.get('COMMUNITY_DETAIL_TEST_SCRIPT', ASSETS / 'scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js'))
ID = '11111111-1111-4111-8111-111111111111'
OTHER = '22222222-2222-4222-8222-222222222222'
READ = '/blank/ajax_board/get_read_article/'
COMMENTS = '/blank/ajax_board/get_read_article_comment/'
ARTICLE = {'uuid': ID, 'title': 'Current verified article', 'content': 'Current verified body',
           'category_url': 'free', 'check_reader': 'user', 'is_secret': 0,
           'user_nickname': 'Public fixture author', 'user_role': 'fixture',
           'created_at': '2026-10-08 23:58:15', 'cnt_read': 1, 'cnt_comment': 0, 'attachments': []}
PENDING = {'ok': False, 'pending': True, 'uuid': '', 'title': '', 'content': '',
           'category_url': '', 'check_reader': 'user', 'is_secret': 0}


class CommunityDetailRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    @staticmethod
    def fulfill(route, body, status=200):
        route.fulfill(status=status, content_type='application/json', body=json.dumps(body))

    def render(self, responder, *, reduced_motion=False, ignore_abort=False, hold_comments=False):
        page = self.browser.new_page(reduced_motion='reduce' if reduced_motion else 'no-preference')
        self.addCleanup(page.close)
        page.set_default_timeout(2000)
        page.add_init_script('Object.assign(window,' + json.dumps({'url': 'free', 'sub': '', 'mode': 'read',
            'orderID': ID, 'gv_username': '', 'gv_role': 'guest', 'init_url': '/community/'}) + ');')
        page.add_init_script('''window.WebRI18n={language:'ko'};
          window.getCookie=(key)=>key==='csrftoken'?'fixture-csrf':'';
          window.WebRSolidEdit={renderContent:(target,content)=>{target.textContent=content;}};
          window.primaryActive=0;window.primaryMax=0;window.primaryCompleted=0;window.primaryAborts=0;
          const nativeFetch=window.fetch.bind(window);
          window.fetch=(url,init={})=>{
            if(new URL(url,location.href).pathname!=='/blank/ajax_board/get_read_article/')return nativeFetch(url,init);
            primaryMax=Math.max(primaryMax,++primaryActive);
            init.signal?.addEventListener('abort',()=>primaryAborts++,{once:true});
            return nativeFetch(url,init).finally(()=>{primaryActive--;primaryCompleted++;});
          };''')
        if ignore_abort:
            page.add_init_script('''const trackedFetch=window.fetch;
              window.fetch=(url,init={})=>new URL(url,location.href).pathname==='/blank/ajax_board/get_read_article/'?
                new Promise(resolve=>{window.ignoredCalls=(window.ignoredCalls||0)+1;window.resolveIgnored=resolve;}):trackedFetch(url,init);''')
        calls, held, errors, unexpected = [], [], [], []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def route(r):
            path = urlsplit(r.request.url).path
            if path == '/community/free/read/' + ID + '/':
                r.fulfill(status=200, content_type='text/html', body='<html lang="ko"><div id="div_main"></div></html>')
            elif path == READ:
                calls.append({'path': path, 'body': r.request.post_data, 'form': re.findall(r'name="([^"]+)"\r\n\r\n([^\r]*)', r.request.post_data or ''), 'headers': r.request.headers})
                responder(r, sum(c['path'] == READ for c in calls), held)
            elif path == COMMENTS:
                calls.append({'path': path, 'body': r.request.post_data})
                if hold_comments:
                    held.append(r)
                else:
                    self.fulfill(r, {})
            elif urlsplit(r.request.url).netloc == 'cdn.jsdelivr.net' and path.startswith('/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/') and path.endswith('.svg'):
                r.fulfill(status=200, content_type='image/svg+xml', body='<svg xmlns="http://www.w3.org/2000/svg"/>')
            else:
                unexpected.append(path)
                r.abort()

        def cleanup():
            for r in held:
                try:
                    r.abort()
                except Exception:
                    pass
            page.unroute_all(behavior='ignoreErrors')
        self.addCleanup(cleanup)
        page.route('**/*', route)
        page.goto('https://detail.test/community/free/read/' + ID + '/')
        page.clock.install()
        page.add_style_tag(path=str(ASSETS / 'styles_v2/common/public_tailwind_20260905.min.css'))
        page.add_script_tag(path=str(ASSETS / 'vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js'))
        page.evaluate("() => {window.Div_page_header=props=>React.createElement('h2',null,props.title);}")
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate('window.__done=false;void set_main_read().then(()=>window.__done=true)')
        return page, calls, held, errors, unexpected

    @staticmethod
    def count(calls, path=READ):
        return sum(c['path'] == path for c in calls)

    def assert_no_fake_article(self, page):
        self.assertTrue(page.evaluate('communityState.articleData===null'))
        self.assertNotIn('제목 없음', page.locator('#div_main').inner_text())
        self.assertEqual(page.locator('#div_article_read_buttons button').count(), 0)

    def assert_error(self, page, terminal=False):
        page.locator('#div_community_read_header').get_by_role('alert').wait_for()
        self.assert_no_fake_article(page)
        self.assertEqual(page.locator('#div_community_read_content .animate-pulse').count(), 0)
        self.assertEqual(page.locator('#div_community_read_header').get_attribute('aria-busy'), 'false')
        self.assertEqual(page.locator('#div_community_read_header button').count(), 0 if terminal else 1)

    def test_real_twenty_second_pending_then_valid_body_never_renders_control_envelope(self):
        page, calls, held, errors, unexpected = self.render(lambda r, n, h: h.append(r) if n == 1 else self.fulfill(r, ARTICLE))
        page.wait_for_function('primaryActive===1')
        page.clock.run_for(20364)
        self.fulfill(held[0], PENDING)
        page.wait_for_function('primaryCompleted===1')
        self.assert_no_fake_article(page)
        self.assertEqual(self.count(calls, COMMENTS), 0)
        page.clock.run_for(180)
        page.get_by_text(ARTICLE['title'], exact=True).wait_for()
        page.wait_for_function('window.__done===true')
        self.assertEqual(page.locator('#div_community_read_content').inner_text(), ARTICLE['content'])
        self.assertIn(ARTICLE['created_at'], page.locator('#div_community_read_header').inner_text())
        self.assertEqual(self.count(calls), 2)
        self.assertEqual(self.count(calls, COMMENTS), 1)
        self.assertEqual(page.evaluate('primaryMax'), 1)
        self.assertEqual([c['form'] for c in calls if c['path'] == READ][0], [c['form'] for c in calls if c['path'] == READ][1])
        self.assertTrue(all(c['headers']['x-csrftoken'] == 'fixture-csrf' for c in calls if c['path'] == READ))
        self.assertEqual((errors, unexpected), ([], []))

    def test_three_pending_attempts_stop_with_explicit_manual_retry(self):
        page, calls, _, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, PENDING if n <= 3 else ARTICLE))
        page.wait_for_function('primaryCompleted===1')
        page.clock.run_for(180)
        page.wait_for_function('primaryCompleted===2')
        page.clock.run_for(360)
        self.assert_error(page)
        page.clock.run_for(45000)
        self.assertEqual(self.count(calls), 3)
        self.assertEqual(self.count(calls, COMMENTS), 0)
        page.locator('#div_community_read_header').get_by_role('button', name='다시 시도', exact=True).click()
        page.get_by_text(ARTICLE['title'], exact=True).wait_for()
        self.assertEqual(self.count(calls), 4)
        self.assertEqual((errors, unexpected), ([], []))

    def test_deadline_aborts_slow_second_read_and_does_not_extend_total(self):
        page, calls, held, errors, unexpected = self.render(lambda r, n, h: h.append(r))
        page.wait_for_function('primaryActive===1')
        page.clock.run_for(20364)
        self.fulfill(held[0], PENDING)
        page.wait_for_function('primaryCompleted===1')
        page.clock.run_for(180)
        page.wait_for_function('primaryActive===1')
        page.clock.run_for(24456)
        self.assert_error(page)
        page.wait_for_function('window.__done===true')
        self.assertEqual(self.count(calls), 2)
        self.assertGreaterEqual(page.evaluate('primaryAborts'), 1)
        page.clock.run_for(45000)
        self.assertEqual(self.count(calls), 2)
        self.assertEqual((errors, unexpected), ([], []))

    def test_terminal_denials_clear_previous_body_without_retry_or_comments(self):
        scenarios = [({}, status) for status in (401, 403, 404, 410)] + [({**PENDING, flag: True}, 200) for flag in ('not_found', 'access_denied', 'denied', 'withdrawn')]
        for body, status in scenarios:
            with self.subTest(status=status, flags=list(body)):
                page, calls, _, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, body, status))
                self.assert_error(page, terminal=True)
                page.clock.run_for(45000)
                self.assertEqual(self.count(calls), 1)
                self.assertEqual(self.count(calls, COMMENTS), 0)
                self.assertEqual((errors, unexpected), ([], []))
        page, calls, _, _, _ = self.render(lambda r, n, h: self.fulfill(r, ARTICLE if n == 1 else {'ok': False, 'not_found': True}))
        page.get_by_text(ARTICLE['title'], exact=True).wait_for()
        page.wait_for_function('window.__done===true')
        page.evaluate('void get_read_article("locale")')
        self.assert_error(page, terminal=True)
        self.assertNotIn(ARTICLE['content'], page.locator('#div_main').inner_text())

    def test_unknown_or_mismatched_payload_never_auto_retries_or_paints(self):
        for data in [{'pending': True}, {**PENDING, 'error': 'fixed test error'}, {**ARTICLE, 'uuid': OTHER},
                     {**ARTICLE, 'check_reader': 'unknown'}, {**ARTICLE, 'content': None}, {**ARTICLE, 'partial': True},
                     {**ARTICLE, 'complete': False}, {**ARTICLE, 'ok': False}]:
            with self.subTest(keys=list(data)):
                page, calls, _, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, data))
                self.assert_error(page)
                page.clock.run_for(45000)
                self.assertEqual(self.count(calls), 1)
                self.assertEqual(self.count(calls, COMMENTS), 0)
                self.assertEqual((errors, unexpected), ([], []))

    def test_empty_title_body_and_fresh_server_masked_secret_keep_original_contract(self):
        for data in [{**ARTICLE, 'title': '', 'content': ''}, {**ARTICLE, 'is_secret': 1, 'content': '<p>비밀 글입니다.</p>'},
                     {**ARTICLE, 'is_secret': 1, 'check_reader': 'writer'}]:
            with self.subTest(secret=data['is_secret'], reader=data['check_reader']):
                page, calls, _, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, data))
                page.wait_for_function('window.__done===true')
                self.assertEqual(page.evaluate('communityState.articleData.check_reader'), data['check_reader'])
                self.assertEqual(page.locator('#div_community_read_content').inner_text(), data['content'])
                self.assertEqual(page.locator('#div_community_read_header [role=alert]').count(), 0)
                self.assertEqual(self.count(calls), 1)
                self.assertEqual((errors, unexpected), ([], []))

    def test_changed_uuid_locale_viewer_or_route_cancels_old_owner_before_paint(self):
        for change in [f'orderID={json.dumps(OTHER)}', 'communityLocaleEpoch++;WebRI18n.language="en"',
                       'gv_username="different viewer"', 'gv_role="different role"', 'history.pushState({},"","/community/free/")']:
            with self.subTest(change=change):
                page, calls, held, errors, unexpected = self.render(lambda r, n, h: h.append(r))
                page.wait_for_function('primaryActive===1')
                page.evaluate(change)
                page.clock.run_for(100)
                page.wait_for_function('window.__done===true')
                self.assert_no_fake_article(page)
                self.assertEqual(page.locator('#div_community_read_header [role=alert]').count(), 0)
                self.assertGreaterEqual(page.evaluate('primaryAborts'), 1)
                self.assertEqual(self.count(calls), 1)
                self.assertEqual((errors, unexpected), ([], []))

    def test_ignored_abort_late_response_and_stale_comments_cannot_paint_new_owner(self):
        page, _, _, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, ARTICLE), ignore_abort=True)
        page.wait_for_function('typeof window.resolveIgnored==="function"')
        page.evaluate(f'orderID={json.dumps(OTHER)}')
        page.clock.run_for(100)
        page.wait_for_function('window.__done===true')
        page.evaluate('resolveIgnored(new Response(' + json.dumps(json.dumps(ARTICLE)) + ',{status:200}))')
        page.wait_for_timeout(40)
        self.assert_no_fake_article(page)
        self.assertEqual((errors, unexpected), ([], []))
        page, calls, held, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, ARTICLE), hold_comments=True)
        page.get_by_text(ARTICLE['title'], exact=True).wait_for()
        page.wait_for_function('window.__done===true')
        self.assertEqual(self.count(calls, COMMENTS), 1)
        page.evaluate(f'orderID={json.dumps(OTHER)};communityState.articleData=null')
        self.fulfill(held[0], {'0': {'uuid': 'old-comment', 'content': 'Old private comment'}})
        page.wait_for_timeout(40)
        self.assertTrue(page.evaluate('communityState.commentData===null'))
        self.assertNotIn('Old private comment', page.locator('#div_main').inner_text())
        self.assertEqual((errors, unexpected), ([], []))

    def test_deadline_rejects_unabortable_late_fetch_and_json_completion(self):
        for after_json in (False, True):
            with self.subTest(after_json=after_json):
                page, calls, _, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, ARTICLE), ignore_abort=True)
                page.wait_for_function('typeof window.resolveIgnored==="function"')
                if after_json:
                    page.evaluate("resolveIgnored({ok:true,status:200,json:()=>new Promise(resolve=>window.resolveLateJSON=resolve)})")
                    page.wait_for_function('typeof window.resolveLateJSON==="function"')
                page.clock.run_for(45000)
                self.assert_error(page)
                page.wait_for_function('window.__done===true')
                if after_json:
                    page.evaluate('resolveLateJSON(' + json.dumps(ARTICLE) + ')')
                else:
                    page.evaluate('resolveIgnored(new Response(' + json.dumps(json.dumps(ARTICLE)) + ',{status:200}))')
                page.wait_for_timeout(40)
                self.assert_error(page)
                self.assertEqual(self.count(calls, COMMENTS), 0)
                self.assertEqual((errors, unexpected), ([], []))

    def test_bfcache_restore_starts_exactly_one_fresh_owner_and_ignores_old_response(self):
        page, calls, _, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, ARTICLE), ignore_abort=True)
        page.wait_for_function('window.ignoredCalls===1')
        page.evaluate('window.oldResolver=window.resolveIgnored;window.dispatchEvent(new Event("pagehide"))')
        page.wait_for_function('window.__done===true')
        self.assert_no_fake_article(page)
        page.evaluate('window.dispatchEvent(new PageTransitionEvent("pageshow",{persisted:true}));window.dispatchEvent(new PageTransitionEvent("pageshow",{persisted:true}))')
        page.wait_for_function('window.ignoredCalls===2')
        page.evaluate('resolveIgnored(new Response(' + json.dumps(json.dumps(ARTICLE)) + ',{status:200}))')
        page.get_by_text(ARTICLE['title'], exact=True).wait_for()
        page.wait_for_function('communityDetailRead.running===false')
        old = {**ARTICLE, 'title': 'Obsolete article title', 'content': 'Obsolete article body'}
        page.evaluate('oldResolver(new Response(' + json.dumps(json.dumps(old)) + ',{status:200}))')
        page.wait_for_timeout(40)
        self.assertEqual(page.evaluate('window.ignoredCalls'), 2)
        self.assertEqual(page.locator('#div_community_read_content').inner_text(), ARTICLE['content'])
        self.assertNotIn(old['title'], page.locator('#div_main').inner_text())
        self.assertEqual(self.count(calls, COMMENTS), 1)
        self.assertEqual((errors, unexpected), ([], []))
        for change in ['mode="edit"', 'orderID=' + json.dumps(OTHER), 'history.replaceState({},"","/community/free/")']:
            with self.subTest(ineligible=change):
                page, _, _, errors, unexpected = self.render(lambda r, n, h: self.fulfill(r, ARTICLE), ignore_abort=True)
                page.wait_for_function('window.ignoredCalls===1')
                page.evaluate('window.dispatchEvent(new Event("pagehide"));' + change)
                page.wait_for_function('window.__done===true')
                page.evaluate('window.dispatchEvent(new PageTransitionEvent("pageshow",{persisted:true}))')
                page.wait_for_timeout(40)
                self.assertEqual(page.evaluate('window.ignoredCalls'), 1)
                self.assert_no_fake_article(page)
                self.assertEqual((errors, unexpected), ([], []))

    def test_pagehide_reduced_motion_and_duplicate_call_share_bounded_owner(self):
        page, calls, _, errors, unexpected = self.render(lambda r, n, h: h.append(r), reduced_motion=True)
        page.wait_for_function('primaryActive===1')
        self.assertEqual(page.locator('#div_community_read_content .animate-pulse').count(), 0)
        page.evaluate('void get_read_article("init");window.dispatchEvent(new Event("pagehide"))')
        page.wait_for_function('window.__done===true')
        page.clock.run_for(45000)
        self.assert_no_fake_article(page)
        self.assertEqual(self.count(calls), 1)
        self.assertGreaterEqual(page.evaluate('primaryAborts'), 1)
        self.assertEqual((errors, unexpected), ([], []))


if __name__ == '__main__':
    unittest.main()
