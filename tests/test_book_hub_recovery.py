import os
import unittest
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright


SCRIPT = Path(os.environ.get("BOOK_RECOVERY_SCRIPT", Path(__file__).resolve().parents[1] /
    "scripts_go/web_r_go_20260629_1025/scripts_v2/book/book_actions_20260524_2315.js"))
PENDING = '<section data-webr-book-hub data-webr-book-retry aria-busy="true"><p role="status" aria-live="polite">R 도서 목록을 현재 확인할 수 없습니다</p></section>'


def complete(title="Current book"):
    return '<section data-webr-book-hub><article><a href="/book/d/9780000000001/">' + title + '</a></article></section>'


class BookHubRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, scenarios):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.route("**/*", lambda route: route.fulfill(content_type="text/html", body=
            '<html lang="ko"><div id="div_main"><aside data-webr-book-admin-counts>Verified admin counts</aside>' + PENDING + '</div></html>'))
        page.goto("https://book.test/book/?q=R")
        page.clock.install(time=datetime(2026, 10, 18, tzinfo=timezone.utc))
        page.clock.pause_at(datetime(2026, 10, 18, 0, 0, 1, tzinfo=timezone.utc))
        page.evaluate("""scenarios => {
            window.calls = []; window.releases = []; window.hiddenForTest = false;
            const started = Date.now();
            Object.defineProperty(document, 'hidden', {get: () => hiddenForTest});
            window.fetch = (url, options) => {
                const i = calls.length, scenario = scenarios[Math.min(i, scenarios.length - 1)];
                const call = {url, credentials:options.credentials, cache:options.cache, aborted:false};
                calls.push(call);
                if (options.signal) options.signal.addEventListener('abort', () => {call.aborted=true;});
                const status = scenario.readyAfter && Date.now()-started < scenario.readyAfter ? 503 : (scenario.status || 200);
                const response = {ok:!(status >= 400), status,
                    text:() => scenario.hold === 'body' ? new Promise(resolve => {releases[i]=resolve;}) : Promise.resolve(scenario.html || '')};
                return scenario.hold === 'fetch' ? new Promise(resolve => {releases[i]=html => resolve({...response,text:()=>Promise.resolve(html)});}) : Promise.resolve(response);
            };
        }""", scenarios)
        page.add_script_tag(path=str(SCRIPT))
        return page, errors

    def advance(self, page, milliseconds):
        page.clock.fast_forward(milliseconds)
        page.evaluate("Promise.resolve()")

    def assert_stopped(self, page):
        self.assertEqual(page.locator('[data-webr-book-hub]').get_attribute('aria-busy'), 'false')
        self.assertEqual(page.locator('[data-webr-book-recovery-state=stopped]').count(), 1)
        self.assertEqual(page.locator('button').count(), 0)
        self.assertEqual(page.locator('[data-webr-book-hub] article').count(), 0)

    def test_repeated_unavailability_stops_without_manual_retry_or_empty_claim(self):
        page, errors = self.render([{"status": 503}])
        self.advance(page, 1999)
        self.assertEqual(page.evaluate('calls.length'), 0)
        self.advance(page, 1)
        self.advance(page, 4000)
        self.advance(page, 8000)
        self.advance(page, 15000)
        self.advance(page, 15000)
        self.assertEqual(page.evaluate('calls.length'), 5)
        self.advance(page, 1000)
        self.assert_stopped(page)
        self.advance(page, 90000)
        page.evaluate("document.dispatchEvent(new Event('visibilitychange')); document.dispatchEvent(new Event('htmx:afterSwap'))")
        self.advance(page, 45000)
        self.assertEqual(page.evaluate('calls.length'), 5)
        self.assertIn('현재 확인할 수 없습니다', page.locator('[role=status]').inner_text())
        self.assertNotIn('0권', page.locator('#div_main').inner_text())
        self.assertEqual(errors, [])

    def test_original_cold_readiness_at_38_seconds_recovers_before_45_second_deadline(self):
        page, errors = self.render([{"readyAfter": 38000, "html": complete('Cold ready book')}])
        self.advance(page, 2000)
        self.advance(page, 4000)
        self.advance(page, 8000)
        self.advance(page, 15000)
        self.advance(page, 9000)
        self.assertEqual(page.evaluate('calls.length'), 4)
        self.assertEqual(page.locator('[data-webr-book-recovery-state=stopped]').count(), 0)
        self.advance(page, 6000)
        self.assertEqual(page.get_by_role('link', name='Cold ready book').count(), 1)
        self.advance(page, 45000)
        self.assertEqual(page.evaluate('calls.length'), 5)
        self.assertEqual(page.locator('[data-webr-book-admin-counts]').count(), 1)
        self.assertEqual(errors, [])

    def test_complete_recovery_preserves_independent_admin_panel_and_request_scope(self):
        page, errors = self.render([{"html": PENDING}, {"html": complete()}])
        self.advance(page, 2000)
        self.advance(page, 4000)
        self.assertEqual(page.get_by_role('link', name='Current book').count(), 1)
        self.assertEqual(page.locator('[data-webr-book-admin-counts]').inner_text(), 'Verified admin counts')
        self.advance(page, 45000)
        calls = page.evaluate('calls')
        self.assertEqual(len(calls), 2)
        self.assertTrue(all(c['credentials'] == 'same-origin' and c['cache'] == 'no-store' and '?q=R&fragment=content' in c['url'] for c in calls))
        self.assertEqual(errors, [])

    def test_terminal_http_denials_stop_after_one_request(self):
        for status in (401, 403, 404):
            with self.subTest(status=status):
                page, errors = self.render([{"status": status}, {"html": complete()}])
                self.advance(page, 2000)
                self.assert_stopped(page)
                self.advance(page, 90000)
                self.assertEqual(page.evaluate('calls.length'), 1)
                self.assertEqual(errors, [])

    def test_shared_deadline_covers_fetch_and_body_even_when_abort_is_ignored(self):
        for stage in ('fetch', 'body'):
            with self.subTest(stage=stage):
                page, errors = self.render([{"hold": stage}])
                self.advance(page, 2000)
                self.advance(page, 42999)
                self.assertEqual(page.locator('[data-webr-book-recovery-state=stopped]').count(), 0)
                self.advance(page, 1)
                self.assert_stopped(page)
                self.assertTrue(page.evaluate('calls[0].aborted'))
                page.evaluate('html => releases[0](html)', complete('Obsolete late book'))
                self.advance(page, 90000)
                self.assert_stopped(page)
                self.assertEqual(page.evaluate('calls.length'), 1)
                self.assertEqual(errors, [])

    def test_hidden_cancels_and_does_not_reset_original_window_or_paint_late_body(self):
        page, errors = self.render([{"hold": "body"}, {"html": complete()}])
        self.advance(page, 2000)
        page.evaluate("hiddenForTest=true; document.dispatchEvent(new Event('visibilitychange'))")
        self.assertTrue(page.evaluate('calls[0].aborted'))
        page.evaluate('html => releases[0](html)', complete('Obsolete hidden book'))
        self.advance(page, 43000)
        page.evaluate("hiddenForTest=false; document.dispatchEvent(new Event('visibilitychange'))")
        self.advance(page, 45000)
        self.assert_stopped(page)
        self.assertEqual(page.evaluate('calls.length'), 1)
        self.assertEqual(errors, [])

    def test_pagehide_retires_request_and_bfcache_starts_fresh_owner(self):
        page, errors = self.render([{"hold": "body"}, {"html": complete('Fresh restored book')}])
        self.advance(page, 2000)
        page.evaluate("dispatchEvent(new PageTransitionEvent('pagehide'))")
        self.assertTrue(page.evaluate('calls[0].aborted'))
        page.evaluate('html => releases[0](html)', complete('Obsolete page book'))
        self.advance(page, 45000)
        self.assertEqual(page.locator('[data-webr-book-hub] article').count(), 0)
        self.assertEqual(page.evaluate('calls.length'), 1)
        page.evaluate("dispatchEvent(new PageTransitionEvent('pageshow', {persisted:true}))")
        self.advance(page, 2000)
        self.assertEqual(page.get_by_role('link', name='Fresh restored book').count(), 1)
        self.assertEqual(page.evaluate('calls.length'), 2)
        self.assertEqual(errors, [])

    def test_replaced_root_and_changed_route_cannot_receive_obsolete_body(self):
        for kind in ('root', 'route'):
            with self.subTest(kind=kind):
                page, errors = self.render([{"hold": "body"}, {"html": complete('New owner book')}])
                self.advance(page, 2000)
                page.evaluate("""({kind,pending}) => {
                    if (kind === 'root') document.querySelector('[data-webr-book-hub]').outerHTML=pending;
                    else history.replaceState(null,'','/book/?q=new');
                    document.dispatchEvent(new Event('htmx:afterSwap'));
                }""", {"kind": kind, "pending": PENDING})
                self.assertTrue(page.evaluate('calls[0].aborted'))
                page.evaluate('html => releases[0](html)', complete('Obsolete owner book'))
                self.advance(page, 2000)
                self.assertEqual(page.get_by_role('link', name='New owner book').count(), 1)
                self.assertNotIn('Obsolete', page.locator('#div_main').inner_text())
                self.assertEqual(page.locator('[data-webr-book-admin-counts]').count(), 1)
                self.assertEqual(page.evaluate('calls.length'), 2)
                self.assertEqual(errors, [])


if __name__ == '__main__':
    unittest.main()
