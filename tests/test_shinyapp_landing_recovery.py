import json
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts_go/web_r_go_20260629_1025/scripts_v2/webr/shinyapps/set_main.js"
VENDOR = ROOT / "scripts_go/web_r_go_20260629_1025/vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"
CATALOG = {"0": {"name": "Current R app", "tag": "Free", "auth": "NO", "url": "", "url_image": ""}}


class ShinyappLandingRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, scenarios, *, deadline=1000, real_retry=False, url="None", username="", translations=None):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html", body='<div id="div_main"></div>') if route.request.url == "https://shiny.test/" else route.abort())
        page.goto("https://shiny.test/")
        page.add_script_tag(path=str(VENDOR))
        page.evaluate("window.__scenarios=" + json.dumps(scenarios) + ";window.__deadline=" + str(deadline) + ";window.__realRetry=" + json.dumps(real_retry) + ";window.url=" + json.dumps(url) + ";window.gv_username=" + json.dumps(username) + ";")
        page.evaluate("""() => {
          window.__calls = []; window.__aborts = 0; window.__active = 0;
          window.__maxActive = 0; window.__held = [];
          window.Div_page_header = props => React.createElement('h1', null, props.title);
          const timer = window.setTimeout.bind(window);
          window.setTimeout = (fn, ms, ...args) => timer(fn,
            ms === 12000 ? window.__deadline : !window.__realRetry && ms >= 900 && ms <= 3000 ? 20 : ms, ...args);
          window.fetch = (url, init = {}) => {
            window.__calls.push({url, method: init.method, tag: init.body.get('tag'),
              cache: init.cache, credentials: init.credentials});
            window.__maxActive = Math.max(window.__maxActive, ++window.__active);
            const scenario = window.__scenarios.length > 1 ? window.__scenarios.shift() : window.__scenarios[0];
            return new Promise((resolve, reject) => {
              let settled = false;
              const finish = (body = scenario.body) => {
                if (settled) return;
                settled = true; --window.__active;
                if (scenario.network) reject(new TypeError('network unavailable'));
                else resolve(new Response(JSON.stringify(body), {status: scenario.status || 200}));
              };
              if (init.signal) init.signal.addEventListener('abort', () => {
                if (!settled) {settled = true; --window.__active; ++window.__aborts; reject(new DOMException('Aborted', 'AbortError'));}
              }, {once: true});
              if (scenario.hold) window.__held.push(finish);
              else timer(finish, scenario.delay || 0);
            });
          };
        }""")
        if translations:
            page.evaluate("window.__translations=" + json.dumps(translations) + ";window.WebRI18n={t: source => window.__translations[source] || source};")
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate("set_main()")
        return page, errors

    def test_pending_status_is_accessible_localized_and_outside_decorative_skeletons(self):
        for translations, label in [(None, "자료를 불러오고 있습니다."), ({"자료를 불러오고 있습니다.": "Loading items."}, "Loading items.")]:
            page, errors = self.render([{"hold": True}], translations=translations)
            status = page.get_by_role("status")
            self.assertEqual(status.inner_text(), label)
            self.assertEqual(status.get_attribute("aria-live"), "polite")
            self.assertEqual(status.get_attribute("class"), "sr-only")
            self.assertTrue(status.evaluate("node => !node.closest('[aria-hidden=true]')"))
            self.assertEqual(page.locator("#div_app_list").get_attribute("aria-busy"), "true")
            self.assertEqual(page.locator("#div_app_list [aria-hidden=true] > div").count(), 6)
            page.get_by_role("button", name="다시 시도").wait_for()
            self.assertEqual(page.get_by_role("status").count(), 0)
            self.assertEqual(page.locator("#div_app_list").get_attribute("aria-busy"), "false")
            self.assertEqual(errors, [])

    def test_real_retry_recovers_first_503_without_permanent_error(self):
        page, errors = self.render([{"status": 503, "body": {}}, {"body": CATALOG}], deadline=4000, real_retry=True)
        page.wait_for_function("window.__calls.length === 1")
        page.wait_for_timeout(150)
        self.assertNotIn("앱 목록을 불러오지 못했습니다.", page.locator("#div_app_list").inner_text())
        page.get_by_role("heading", name="Current R app").wait_for()
        self.assertEqual(page.evaluate("window.__calls.length"), 2)
        self.assertIn("로그인이 필요합니다.", page.locator("#div_app_list").inner_text())
        self.assertEqual(page.get_by_role("button", name="접속하기").count(), 0)
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])

    def test_five_second_500_recovers_within_bounded_initial_window(self):
        page, errors = self.render([{"status": 500, "body": {}, "delay": 5000}, {"body": CATALOG}], deadline=12000, real_retry=True)
        page.get_by_role("heading", name="Current R app").wait_for(timeout=9000)
        self.assertEqual(page.evaluate("window.__calls.length"), 2)
        self.assertNotIn("앱 목록을 불러오지 못했습니다.", page.locator("#div_app_list").inner_text())
        self.assertEqual(errors, [])

    def test_persistent_failure_is_explicit_and_manual_retry_recovers(self):
        page, errors = self.render([{"status": 503, "body": {}}], deadline=250)
        page.get_by_role("button", name="다시 시도").wait_for()
        self.assertIn("앱 목록을 불러오지 못했습니다.", page.get_by_role("alert").inner_text())
        self.assertNotIn("표시할 Web-R 앱이 없습니다.", page.locator("body").inner_text())
        calls = page.evaluate("window.__calls.length")
        page.wait_for_timeout(100)
        self.assertEqual(page.evaluate("window.__calls.length"), calls)
        page.evaluate("window.__scenarios=" + json.dumps([{"body": CATALOG}]))
        page.get_by_role("button", name="다시 시도").click()
        page.get_by_role("heading", name="Current R app").wait_for()
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])

    def test_hung_request_aborts_at_deadline_and_late_result_cannot_replace_retry(self):
        page, errors = self.render([{"hold": True}], deadline=200)
        page.get_by_role("button", name="다시 시도").wait_for()
        self.assertEqual(page.evaluate("window.__aborts"), 1)
        page.evaluate("window.__scenarios=" + json.dumps([{"body": CATALOG}]))
        page.get_by_role("button", name="다시 시도").click()
        page.get_by_role("heading", name="Current R app").wait_for()
        page.evaluate("window.__held.shift()({})")
        self.assertIn("Current R app", page.locator("#div_app_list").inner_text())
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])

    def test_terminal_access_denials_are_not_retried(self):
        for status in [401, 403]:
            page, errors = self.render([{"status": status, "body": {}}])
            page.get_by_role("button", name="다시 시도").wait_for()
            page.wait_for_timeout(100)
            self.assertEqual(page.evaluate("window.__calls.length"), 1)
            self.assertEqual(page.get_by_role("button", name="접속하기").count(), 0)
            self.assertEqual(errors, [])

    def test_network_and_malformed_responses_recover_without_fake_empty(self):
        for scenario in [{"network": True}, {"body": None}, {"body": []}, {"body": {"error": "unavailable"}}]:
            page, errors = self.render([scenario, {"body": CATALOG}])
            page.get_by_role("heading", name="Current R app").wait_for()
            self.assertEqual(page.evaluate("window.__calls.length"), 2)
            self.assertNotIn("표시할 Web-R 앱이 없습니다.", page.locator("body").inner_text())
            self.assertEqual(errors, [])

    def test_free_member_tags_and_server_access_decisions_are_preserved(self):
        for url, tag, username, auth in [("None", "Free", "", "NO"), ("member", "Advance", "Verified fixture user", "NO"), ("member", "Advance", "Verified fixture user", "YES")]:
            catalog = {"0": dict(CATALOG["0"], auth=auth, tag=tag)}
            page, errors = self.render([{"body": catalog}], url=url, username=username)
            page.get_by_role("heading", name="Current R app").wait_for()
            call = page.evaluate("window.__calls[0]")
            self.assertEqual(call["tag"], tag)
            self.assertEqual(call["method"], "post")
            self.assertEqual(call["cache"], "no-store")
            self.assertEqual(call["credentials"], "same-origin")
            self.assertEqual(page.get_by_role("button", name="접속하기").count(), 1 if username and auth == "YES" else 0)
            self.assertEqual(errors, [])

    def test_verified_empty_catalog_is_terminal_and_does_not_retry(self):
        page, errors = self.render([{"body": {}}])
        page.get_by_text("표시할 Web-R 앱이 없습니다.", exact=True).wait_for()
        page.wait_for_timeout(100)
        self.assertEqual(page.evaluate("window.__calls.length"), 1)
        self.assertEqual(page.get_by_role("button", name="다시 시도").count(), 0)
        self.assertEqual(errors, [])

    def test_remount_aborts_previous_catalog_request(self):
        page, errors = self.render([{"hold": True}], deadline=1000)
        page.wait_for_function("window.__calls.length === 1")
        page.evaluate("window.__scenarios=" + json.dumps([{"body": CATALOG}]) + ";set_main();")
        page.get_by_role("heading", name="Current R app").wait_for()
        self.assertEqual(page.evaluate("window.__aborts"), 1)
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
