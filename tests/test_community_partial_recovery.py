import json
import os
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "scripts_go/web_r_go_20260629_1025"
SCRIPT = Path(os.environ.get("COMMUNITY_PARTIAL_TEST_SCRIPT", ASSETS / "scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js"))
VENDOR = ASSETS / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"


def payload(title="Verified row", *, partial=False, count=1115):
    data = {"count": {"cnt": count}, "list": {"0": {"uuid": "fixture-row", "title": title, "category_url": "rcommunity"}}}
    if partial:
        data.update(ok=True, partial=True, complete=False, unavailable_sections=["article-feed"])
    return data


class CommunityPartialRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, scenarios, *, generic=False):
        page = self.browser.new_page()
        page.set_default_timeout(2500)
        self.addCleanup(page.close)
        errors = []
        requests = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        def route(request):
            requests.append(request.request.url)
            if request.request.url == "https://community.test/":
                request.fulfill(status=200, content_type="text/html", body='<div id="div_community_card_rcommunity"></div><div id="div_article_list"></div>')
            else:
                request.abort()

        page.route("**/*", route)
        page.goto("https://community.test/")
        page.add_script_tag(path=str(VENDOR))
        page.evaluate("window.__scenarios=" + json.dumps(scenarios))
        page.evaluate("""() => {
          window.url='rcommunity'; window.sub=''; window.mode=''; window.gv_username='';
          window.WebRI18n={language:'ko'}; window.getCookie=()=>'';
          window.Div_box_header=props=>React.createElement('h2',null,props.title,props.count);
          window.__calls=[]; window.__sleeps=[]; window.__active=0; window.__maxActive=0;
          window.__aborts=0; window.__held=[]; window.__now=0;
          Date.now=()=>window.__now;
          Object.defineProperty(performance,'now',{value:()=>window.__now});
          const timer=window.setTimeout.bind(window);
          window.setTimeout=(fn,ms,...args)=>{
            if(ms===16000) {
              window.__sleeps.push(ms);
              return timer(()=>{window.__now+=ms;fn(...args);},400);
            }
            if(ms>=10000)return timer(()=>{window.__now+=ms;fn(...args);},120);
            return timer(fn,ms,...args);
          };
          window.fetch=(url,init={})=>{
            window.__calls.push({url,form:[...init.body.entries()],at:Date.now()});
            window.__maxActive=Math.max(window.__maxActive,++window.__active);
            const scenario=window.__scenarios.length>1?window.__scenarios.shift():window.__scenarios[0];
            return new Promise((resolve,reject)=>{
              let done=false;
              const finish=()=>{
                if(done)return;done=true;--window.__active;
                if(scenario.network)reject(new TypeError('controlled network failure'));
                else resolve(new Response(JSON.stringify(scenario.body),{status:scenario.status||200}));
              };
              if(init.signal)init.signal.addEventListener('abort',()=>{
                if(done)return;done=true;--window.__active;++window.__aborts;
                reject(new DOMException('controlled abort','AbortError'));
              },{once:true});
              if(scenario.hold)window.__held.push(finish);else timer(finish,0);
            });
          };
        }""")
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate("prefetchCommunityArticlePages=()=>{};window.__def={tag:'rcommunity',title:'R Community',empty:'No rows'};")
        expression = "get_article_list('page',2)" if generic else "loadCommunityBoardCard(window.__def,2)"
        page.evaluate("window.__done=false;void " + expression + ".then(()=>window.__done=true)")
        return page, errors, requests

    def settled(self, page, errors, requests):
        page.wait_for_function("window.__done===true")
        self.assertEqual(errors, [])
        self.assertEqual(requests, ["https://community.test/"])
        self.assertEqual(page.evaluate("window.__maxActive"), 1)

    def test_card_partial_cache_expiry_recovers_complete_and_pagination(self):
        page, errors, requests = self.render([{"body": payload("Partial row", partial=True)}, {"body": payload("Complete row")}])
        page.get_by_text("Partial row", exact=True).wait_for()
        self.assertEqual(page.locator("nav").count(), 0)
        self.assertEqual(page.evaluate("Object.keys(communityCardLastGood).length"), 0)
        self.settled(page, errors, requests)
        self.assertIn("Complete row", page.locator("body").inner_text())
        self.assertEqual(page.locator("nav").count(), 1)
        self.assertEqual(page.evaluate("window.__calls.map(call=>call.at)"), [0, 16000])
        self.assertEqual(page.evaluate("window.__calls.map(call=>call.form)"), [page.evaluate("window.__calls[0].form")] * 2)

    def test_main_partial_recovers_using_real_article_renderer_and_complete_cache(self):
        page, errors, requests = self.render([{"body": payload("Partial row", partial=True)}, {"body": payload("Complete row")}], generic=True)
        page.get_by_text("Partial row", exact=True).wait_for()
        self.assertEqual(page.locator("nav").count(), 0)
        self.settled(page, errors, requests)
        self.assertIn("Complete row", page.locator("#div_article_list").inner_text())
        self.assertEqual(page.locator("nav").count(), 1)
        self.assertEqual(page.evaluate("Object.keys(communityArticlePageCache).length"), 1)

    def test_exhaustion_keeps_partial_rows_without_totals_cache_or_more_requests(self):
        page, errors, requests = self.render([{"body": payload("Partial row", partial=True)}])
        self.settled(page, errors, requests)
        self.assertEqual(page.evaluate("window.__calls.length"), 3)
        self.assertEqual(page.evaluate("window.__sleeps"), [16000, 16000])
        self.assertIn("Partial row", page.locator("body").inner_text())
        self.assertNotIn("1,115", page.locator("body").inner_text())
        self.assertEqual(page.locator("nav").count(), 0)
        self.assertEqual(page.evaluate("Object.keys(communityCardLastGood).length"), 0)
        page.wait_for_timeout(160)
        self.assertEqual(page.evaluate("window.__calls.length"), 3)

    def test_main_retains_verified_partial_after_retryable_http_or_network_failure(self):
        for failed in [{"status": 503, "body": {}}, {"network": True}]:
            with self.subTest(failed=failed):
                page, errors, requests = self.render([{"body": payload("Retained main row", partial=True)}, failed], generic=True)
                self.settled(page, errors, requests)
                self.assertIn("Retained main row", page.locator("#div_article_list").inner_text())
                self.assertEqual(page.locator("nav").count(), 0)
                self.assertEqual(page.evaluate("Object.keys(communityArticlePageCache).length"), 0)
                self.assertEqual(page.evaluate("window.__calls.length"), 3)
                self.assertEqual(page.evaluate("communityState.article_counter"), 0)

    def test_exact_last_good_rows_survive_but_partial_does_not_renew_authority(self):
        page, errors, requests = self.render([{"body": payload("Prior complete")}])
        self.settled(page, errors, requests)
        before = page.evaluate("JSON.stringify(communityCardLastGood)")
        page.evaluate("window.__scenarios=" + json.dumps([{"body": payload("Partial replacement", partial=True)}]) + ";window.__done=false;void loadCommunityBoardCard(window.__def,2).then(()=>window.__done=true)")
        page.get_by_role("status").wait_for()
        self.assertIn("Prior complete", page.locator("body").inner_text())
        self.assertEqual(page.locator("nav").count(), 0)
        self.settled(page, errors, requests)
        self.assertEqual(page.evaluate("JSON.stringify(communityCardLastGood)"), before)
        self.assertNotIn("Partial replacement", page.locator("body").inner_text())

    def test_denied_unknown_or_untyped_partial_is_not_retried(self):
        unknown = payload(partial=True)
        unknown["unavailable_sections"] = ["different-source"]
        invalid = payload(partial=True)
        invalid["count"]["cnt"] = "1115"
        for scenario in [{"status": 401, "body": payload(partial=True)}, {"status": 403, "body": payload(partial=True)}, {"body": unknown}, {"body": invalid}]:
            with self.subTest(scenario=scenario):
                page, errors, requests = self.render([scenario])
                self.settled(page, errors, requests)
                self.assertEqual(page.evaluate("window.__calls.length"), 1)
                self.assertEqual(page.locator("nav").count(), 0)

    def test_changed_search_cannot_retry_or_paint_obsolete_request(self):
        page, errors, requests = self.render([{"body": payload("Obsolete row", partial=True)}, {"body": payload("Fresh search")}])
        page.get_by_text("Obsolete row", exact=True).wait_for()
        page.evaluate("communityState.searchText='new search';window.__done=false;void loadCommunityBoardCard(window.__def,2).then(()=>window.__done=true)")
        self.settled(page, errors, requests)
        page.wait_for_timeout(100)
        self.assertIn("Fresh search", page.locator("body").inner_text())
        self.assertNotIn("Obsolete row", page.locator("body").inner_text())
        self.assertEqual(page.evaluate("window.__calls.length"), 2)
        self.assertIn(["txt_search", "new search"], page.evaluate("window.__calls[1].form"))

    def test_changed_page_locale_or_viewer_cannot_continue_old_recovery(self):
        for change in ["communityState.cardPages.rcommunity=3", "communityLocaleEpoch++;window.WebRI18n.language='en'", "gv_username='different fixture viewer'"]:
            with self.subTest(change=change):
                page, errors, requests = self.render([{"body": payload("Prior request", partial=True)}])
                page.get_by_text("Prior request", exact=True).wait_for()
                page.evaluate(change)
                self.settled(page, errors, requests)
                self.assertEqual(page.evaluate("window.__calls.length"), 1)
                self.assertEqual(page.locator("nav").count(), 0)

    def test_deadline_aborts_hung_retry_and_pagehide_stops_waiting_retry(self):
        page, errors, requests = self.render([{"body": payload("Retained partial", partial=True)}, {"hold": True}])
        self.settled(page, errors, requests)
        self.assertEqual(page.evaluate("window.__aborts"), 1)
        self.assertEqual(page.evaluate("window.__calls.length"), 2)
        self.assertIn("Retained partial", page.locator("body").inner_text())
        self.assertEqual(page.locator("nav").count(), 0)
        page, errors, requests = self.render([{"body": payload(partial=True)}])
        page.get_by_role("status").wait_for()
        page.evaluate("window.dispatchEvent(new Event('pagehide'))")
        self.settled(page, errors, requests)
        page.wait_for_timeout(100)
        self.assertEqual(page.evaluate("window.__calls.length"), 1)

    def test_ordinary_pending_attempts_and_verified_empty_remain_bounded(self):
        page, errors, requests = self.render([{"body": {"ok": False, "pending": True}}])
        self.settled(page, errors, requests)
        self.assertEqual(page.evaluate("window.__calls.length"), 3)
        self.assertEqual(page.evaluate("window.__sleeps"), [])
        page, errors, requests = self.render([{"body": {"count": {"cnt": 0}, "list": {}}}])
        self.settled(page, errors, requests)
        self.assertEqual(page.evaluate("window.__calls.length"), 2)
        self.assertIn(["page", "1"], page.evaluate("window.__calls.at(-1).form"))
        self.assertIn("No rows", page.locator("body").inner_text())


if __name__ == "__main__":
    unittest.main()
