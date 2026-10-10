import json
import os
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "scripts_go/web_r_go_20260629_1025"
SCRIPT = Path(os.environ.get("COMMUNITY_SIDEBAR_TEST_SCRIPT", ASSETS / "scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js"))
PENDING = {"ok": False, "pending": True}
COMMENT = {"uuid": "comment-fixture", "uuid_article": "article-fixture", "article_category_url": "free",
           "content": "Verified current comment", "article_title": "Verified article", "user_nickname": "Fixture author"}
ARTICLE = {"uuid": "article-fixture", "category_url": "free", "title": "Verified popular article"}


class CommunitySidebarRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, scenarios, *, famous=False):
        page = self.browser.new_page()
        page.set_default_timeout(2000)
        self.addCleanup(page.close)
        errors, requests = [], []
        page.on("pageerror", lambda error: errors.append(str(error)))

        def route(request):
            requests.append(request.request.url)
            if request.request.url == "https://sidebar.test/community/":
                request.fulfill(status=200, content_type="text/html", body='''<div id="div_new_comment_list"></div>
                    <div id="div_article_famous_list"></div><div id="unrelated">Healthy sibling content</div>''')
            else:
                request.abort()

        page.route("**/*", route)
        page.goto("https://sidebar.test/community/")
        page.clock.install()
        page.add_script_tag(path=str(ASSETS / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"))
        page.evaluate("window.__scenarios=" + json.dumps(scenarios))
        page.evaluate("""() => {
          window.url='all'; window.sub=''; window.mode=''; window.gv_username=''; window.gv_role='';
          window.WebRI18n={language:'ko'}; window.getCookie=()=> 'fixture-csrf';
          window.__calls=[]; window.__aborts=0; window.__active=0; window.__maxActive=0; window.__held=[];
          window.fetch=(endpoint,init={})=>{
            window.__calls.push({endpoint,form:[...init.body.entries()],at:performance.now(),csrf:init.headers['X-CSRFToken']});
            window.__maxActive=Math.max(window.__maxActive,++window.__active);
            const scenario=window.__scenarios.length>1?window.__scenarios.shift():window.__scenarios[0];
            return new Promise((resolve,reject)=>{
              let settled=false;
              const finish=()=>{
                if(settled)return;settled=true;--window.__active;
                if(scenario.network)reject(new TypeError('controlled network failure'));
                else if(scenario.hold_body)resolve({status:200,ok:true,headers:new Headers(),json:()=>new Promise(()=>{})});
                else resolve(new Response(JSON.stringify(scenario.body),{status:scenario.status||200}));
              };
              init.signal?.addEventListener('abort',()=>{
                ++window.__aborts;
                if(scenario.ignore_abort||settled)return;
                settled=true;--window.__active;reject(new DOMException('controlled abort','AbortError'));
              },{once:true});
              if(scenario.hold)window.__held.push(finish);else finish();
            });
          };
        }""")
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate("getCommunityBoardCards=()=>Promise.resolve();get_article_list=()=>Promise.resolve();")
        page.evaluate("window.__done=false;void " + ("get_article_famous_list()" if famous else "get_new_comment_list()") + ".then(()=>window.__done=true)")
        return page, errors, requests

    def settled(self, page, errors, requests):
        page.wait_for_function("window.__done===true")
        self.assertEqual(errors, [])
        self.assertEqual(requests, ["https://sidebar.test/community/"])
        self.assertEqual(page.locator("#unrelated").inner_text(), "Healthy sibling content")

    def exhausted(self, page):
        page.wait_for_function("window.__calls.length===1")
        page.clock.run_for(800)
        page.wait_for_function("window.__calls.length===2")
        page.clock.run_for(800)
        page.wait_for_function("window.__calls.length===3")

    def assert_failure(self, page, *, denied=False, target="#div_new_comment_list"):
        panel = page.locator(target)
        self.assertEqual(panel.get_by_role("alert").count(), 1)
        self.assertEqual(panel.get_by_role("button").count(), 0 if denied else 1)
        self.assertEqual(panel.locator(".animate-pulse").count(), 0)
        self.assertEqual(panel.get_attribute("aria-busy"), "false")
        self.assertNotIn("불러오는 중", panel.inner_text())

    def test_three_pending_reads_finish_with_scoped_manual_retry(self):
        page, errors, requests = self.render([{"body": PENDING}])
        self.exhausted(page)
        self.settled(page, errors, requests)
        self.assert_failure(page)
        calls = page.evaluate("window.__calls")
        self.assertEqual(len(calls), 3)
        self.assertEqual([round(calls[i+1]["at"]-calls[i]["at"]) for i in range(2)], [800, 800])
        self.assertTrue(all(call["form"] == [["tag", "all"], ["url", "all"]] and call["csrf"] == "fixture-csrf" for call in calls))
        page.clock.run_for(45000)
        self.assertEqual(page.evaluate("window.__calls.length"), 3)
        page.evaluate("window.__scenarios=[{body:{'0':" + json.dumps(COMMENT) + "}}]")
        page.locator("#div_new_comment_list").get_by_role("button", name="다시 시도").click()
        page.get_by_text(COMMENT["content"], exact=True).wait_for()
        self.assertEqual(page.evaluate("window.__calls.length"), 4)
        self.assertEqual(page.locator("#div_new_comment_list").get_by_role("alert").count(), 0)

    def test_hung_fetch_and_hung_body_have_one_45_second_deadline(self):
        for scenario in [{"hold": True}, {"hold": True, "ignore_abort": True}, {"hold_body": True}]:
            with self.subTest(scenario=scenario):
                page, errors, requests = self.render([scenario])
                page.wait_for_function("window.__calls.length===1")
                self.assertEqual(page.locator("#div_new_comment_list").get_attribute("aria-busy"), "true")
                page.clock.run_for(45000)
                self.settled(page, errors, requests)
                self.assert_failure(page)
                self.assertEqual(page.evaluate("window.__calls.length"), 1)
                self.assertEqual(page.evaluate("window.__aborts"), 1)

    def test_terminal_denial_never_retries_or_renders_response_rows(self):
        for status in [401, 403]:
            with self.subTest(status=status):
                page, errors, requests = self.render([{"status": status, "body": {"0": COMMENT}}])
                self.settled(page, errors, requests)
                self.assert_failure(page, denied=True)
                page.clock.run_for(45000)
                self.assertEqual(page.evaluate("window.__calls.length"), 1)
                self.assertNotIn(COMMENT["content"], page.locator("body").inner_text())

    def test_current_success_and_verified_empty_stop_after_one_request(self):
        for body in [{"0": COMMENT}, {}]:
            with self.subTest(body=body):
                page, errors, requests = self.render([{"body": body}])
                self.settled(page, errors, requests)
                text = page.locator("#div_new_comment_list").inner_text()
                self.assertIn(COMMENT["content"] if body else "표시할 최근 댓글이 없습니다.", text)
                self.assertEqual(page.locator("#div_new_comment_list").get_by_role("button").count(), 0)
                page.clock.run_for(45000)
                self.assertEqual(page.evaluate("window.__calls.length"), 1)

    def test_partial_or_error_envelopes_never_become_rows_or_empty_success(self):
        bodies = [{"ok": True, "partial": True, "complete": False, "count": {"cnt": 1115}, "list": {"0": COMMENT}},
                  {"ok": False, "error": "source-unavailable"}, {"count": {"cnt": 0}, "list": {}}]
        for body in bodies:
            with self.subTest(body=body):
                page, errors, requests = self.render([{"body": body}])
                self.exhausted(page)
                self.settled(page, errors, requests)
                self.assert_failure(page)
                self.assertNotIn(COMMENT["content"], page.locator("#div_new_comment_list").inner_text())
                self.assertNotIn("1,115", page.locator("#div_new_comment_list").inner_text())

    def test_network_failure_and_popular_widget_use_the_same_finite_outcome(self):
        page, errors, requests = self.render([{"network": True}], famous=True)
        self.exhausted(page)
        self.settled(page, errors, requests)
        self.assert_failure(page, target="#div_article_famous_list")

    def test_pagehide_cancels_ignored_abort_and_late_rows_cannot_paint(self):
        page, errors, requests = self.render([{"hold": True, "ignore_abort": True, "body": {"0": COMMENT}}])
        page.wait_for_function("window.__calls.length===1")
        page.evaluate("window.dispatchEvent(new Event('pagehide'))")
        self.settled(page, errors, requests)
        page.evaluate("window.__held[0]()")
        page.clock.run_for(45000)
        self.assertEqual(page.evaluate("window.__calls.length"), 1)
        self.assertNotIn(COMMENT["content"], page.locator("body").inner_text())

    def test_pagehide_during_retry_delay_stops_the_next_request(self):
        page, errors, requests = self.render([{"body": PENDING}])
        page.wait_for_function("window.__calls.length===1")
        page.evaluate("window.dispatchEvent(new Event('pagehide'))")
        self.settled(page, errors, requests)
        page.clock.run_for(45000)
        self.assertEqual(page.evaluate("window.__calls.length"), 1)

    def test_same_owner_coalesces_only_while_its_read_is_active(self):
        page, errors, requests = self.render([{"hold": True, "body": {"0": COMMENT}}])
        page.wait_for_function("window.__calls.length===1")
        page.evaluate("void get_new_comment_list();void get_new_comment_list()")
        self.assertEqual(page.evaluate("window.__calls.length"), 1)
        page.evaluate("window.__held[0]()")
        self.settled(page, errors, requests)
        page.get_by_text(COMMENT["content"], exact=True).wait_for()
        self.assertEqual(page.evaluate("window.__maxActive"), 1)

    def test_obsolete_tab_locale_viewer_and_dom_owner_abort_without_late_update(self):
        for change in ["url='free'", "communityLocaleEpoch++;WebRI18n.language='en'", "gv_username='new fixture viewer'",
                       "document.querySelector('#div_new_comment_list').replaceWith(document.createElement('div'))"]:
            with self.subTest(change=change):
                page, errors, requests = self.render([{"hold": True, "ignore_abort": True, "body": {"0": COMMENT}}])
                page.wait_for_function("window.__calls.length===1")
                page.evaluate(change)
                page.clock.run_for(100)
                self.settled(page, errors, requests)
                page.evaluate("window.__held[0]()")
                page.clock.run_for(45000)
                self.assertEqual(page.evaluate("window.__calls.length"), 1)
                self.assertNotIn(COMMENT["content"], page.locator("body").inner_text())

    def test_replacement_owner_keeps_new_rows_when_old_fetch_resolves_late(self):
        page, errors, requests = self.render([{"hold": True, "ignore_abort": True, "body": {"0": dict(COMMENT, content="Obsolete comment")}},
                                             {"body": {"0": COMMENT}}])
        page.wait_for_function("window.__calls.length===1")
        page.evaluate("url='free';window.__done=false;void get_new_comment_list().then(()=>window.__done=true)")
        self.settled(page, errors, requests)
        page.get_by_text(COMMENT["content"], exact=True).wait_for()
        page.evaluate("window.__held[0]()")
        page.clock.run_for(45000)
        self.assertNotIn("Obsolete comment", page.locator("body").inner_text())
        self.assertEqual(page.evaluate("window.__calls.length"), 2)


if __name__ == "__main__":
    unittest.main()
