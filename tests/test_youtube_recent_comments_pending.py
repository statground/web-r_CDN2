"""Offline real-renderer controls; no public/API/provider requests or issued sessions."""
import json
import unittest
from urllib.parse import urlsplit

import test_youtube_sidebar_recovery as base

RECENT = "/blank/ajax_board/get_new_comment_list/"
PRIMARY = "/blank/ajax_board/get_read_article/"
ARTICLE = dict(base.ARTICLE, youtube_url="", content="Primary public introduction", check_reader="guest", is_secret=0)


class RecentCommentPendingTests(unittest.TestCase):
    setUpClass = classmethod(base.YouTubeSidebarRecoveryTests.setUpClass.__func__)
    tearDownClass = classmethod(base.YouTubeSidebarRecoveryTests.tearDownClass.__func__)
    render = base.YouTubeSidebarRecoveryTests.render
    fulfill = staticmethod(base.YouTubeSidebarRecoveryTests.fulfill)
    assert_unavailable = base.YouTubeSidebarRecoveryTests.assert_unavailable

    def fixture(self, recent, *, primary=False):
        def respond(route, path, requests, parked):
            if path == RECENT:
                recent(route, sum(r["path"] == RECENT for r in requests), parked)
            elif path == PRIMARY:
                self.fulfill(route, ARTICLE)
            elif "get_article_famous_list" in path:
                self.fulfill(route, {"0": base.ARTICLE})
            else:
                self.fulfill(route, {})
        page, requests, errors, parked = self.render(respond)
        page.clock.install()
        page.evaluate("""window.recentTimes=[];window.recentActive=0;window.recentMax=0;window.deniedBodyReads=0;
          const fetchOriginal=window.fetch.bind(window);
          window.fetch=(url,options)=>fetchOriginal(url,options).then(response=>{
            if(new URL(url,location.href).pathname==='/blank/ajax_board/get_new_comment_list/'&&[401,403].includes(response.status)){
              response.json=()=>{window.deniedBodyReads++;return new Promise(()=>{});};
              response.text=()=>{window.deniedBodyReads++;return new Promise(()=>{});};
            }return response;
          });
          const fetchCurrent=window.fetch;
          window.fetch=(url,options)=>{
            if(new URL(url,location.href).pathname!=='/blank/ajax_board/get_new_comment_list/')return fetchCurrent(url,options);
            window.recentTimes.push(performance.now());window.recentActive++;window.recentMax=Math.max(window.recentMax,window.recentActive);
            return fetchCurrent(url,options).finally(()=>window.recentActive--);
          };
          window.storageSnapshot=()=>JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)]);
          window.storageBeforeRecent=storageSnapshot();void 0;""")
        if primary:
            page.evaluate("""for(const id of ['div_article_famous_list','div_new_comment_list','div_my_article_list','div_my_comment_list'])document.getElementById(id).remove();
              Object.assign(window,{mode:'read',sub:'',orderID:""" + json.dumps(base.ARTICLE_ID) + """,WebRSolidEdit:{renderContent:(target,text)=>target.textContent=text}});
              renderWorkshopReadPage();""")
        return page, requests, errors, parked

    @staticmethod
    def retry_waiting(page):
        page.wait_for_function("youtubeSidebarReads.get('div_new_comment_list')?.retryTimer!==null && !!youtubeSidebarReads.get('div_new_comment_list')?.retryTimer")

    @staticmethod
    def count(requests):
        return sum(r["path"] == RECENT for r in requests)

    def test_pending_then_valid_after_worker_turn_does_not_hold_primary_or_sibling(self):
        page, requests, errors, _ = self.fixture(lambda route, count, _: self.fulfill(route, {"0": base.COMMENT} if count == 3 else {"ok": False, "pending": True}), primary=True)
        page.get_by_role("heading", name=ARTICLE["title"], exact=True).wait_for()
        self.assertEqual(page.locator("#div_community_read_content").inner_text(), ARTICLE["content"])
        page.locator("#div_article_famous_list a").wait_for()
        self.retry_waiting(page)
        self.assertEqual(self.count(requests), 1)
        self.assertEqual(page.locator("#div_new_comment_list [role=alert]").count(), 0)
        page.clock.run_for(2000); page.wait_for_function("recentTimes.length===2"); self.retry_waiting(page)
        page.clock.run_for(4000)
        page.locator("#div_new_comment_list a").wait_for()
        self.assertEqual(self.count(requests), 3)
        self.assertEqual(page.evaluate("recentMax"), 1)
        intervals = page.evaluate("recentTimes.slice(1).map((t,i)=>t-recentTimes[i])")
        self.assertGreaterEqual(intervals[0], 2000); self.assertGreaterEqual(intervals[1], 4000)
        self.assertEqual(sum(r["path"] == PRIMARY for r in requests), 1)
        self.assertEqual(page.locator("#div_new_comment_list a").get_attribute("href"), "/workshop/youtube/read/" + base.ARTICLE_ID + "/")
        self.assertEqual(page.locator("#div_new_comment_list").get_attribute("aria-busy"), "false")
        self.assertEqual(errors, [])

    def test_existing_live_rows_remain_during_pending_and_finite_error_no_storage(self):
        page, requests, errors, _ = self.fixture(lambda route, count, _: self.fulfill(route, {"0": base.COMMENT} if count == 1 else {"ok": False, "pending": True}))
        page.evaluate("get_new_comment_list()")
        box = page.locator("#div_new_comment_list"); box.locator("a").wait_for()
        page.evaluate("void get_new_comment_list()")
        self.retry_waiting(page)
        self.assertIn("Current comment", box.locator("a").inner_text())
        self.assertEqual(box.get_attribute("aria-busy"), "true")
        self.assertEqual(box.locator("[role=alert]").count(), 0)
        page.clock.run_for(2000); page.wait_for_function("recentTimes.length===3"); self.retry_waiting(page)
        page.clock.run_for(4000); box.locator("[role=alert]").wait_for()
        self.assertEqual(self.count(requests), 4)
        self.assertIn("Current comment", box.locator("a").inner_text())
        self.assertEqual(box.get_attribute("aria-busy"), "false")
        self.assertEqual(box.get_by_role("button").count(), 0)
        self.assertNotIn("0개", box.inner_text())
        self.assertTrue(page.evaluate("storageSnapshot()===storageBeforeRecent"))
        page.clock.run_for(15000); self.assertEqual(self.count(requests), 4)
        self.assertEqual(errors, [])

    def test_denials_skip_body_retire_rows_and_malformed_stops_while_complete_empty_is_healthy(self):
        for status, payload in ((401, {}), (403, {}), (200, {"pending": "true"}), (200, {})):
            with self.subTest(status=status, payload=payload):
                page, requests, errors, _ = self.fixture(lambda route, count, _: self.fulfill(route, {"0": base.COMMENT} if count == 1 else payload, 200 if count == 1 else status))
                page.evaluate("get_new_comment_list()")
                page.locator("#div_new_comment_list a").wait_for()
                page.evaluate("get_new_comment_list()")
                box = page.locator("#div_new_comment_list")
                self.assertEqual(self.count(requests), 2)
                if status in (401, 403):
                    self.assertEqual(page.evaluate("deniedBodyReads"), 0)
                    self.assertEqual(box.locator("a").count(), 0)
                    self.assertEqual(box.locator("[role=alert]").count(), 1)
                elif payload:
                    self.assertEqual(box.locator("a").count(), 1)
                    self.assertEqual(box.locator("[role=alert]").count(), 1)
                else:
                    self.assertEqual(box.locator("a,[role=alert]").count(), 0)
                page.clock.run_for(15000); self.assertEqual(self.count(requests), 2)
                self.assertEqual(errors, [])

    def test_body_and_pending_waits_share_one_fifteen_second_deadline(self):
        page, _, errors, _ = self.fixture(lambda route, *_: self.fulfill(route, {}))
        page.evaluate("""const previous=window.fetch;window.fetch=(url,options)=>{
          if(new URL(url,location.href).pathname!=='/blank/ajax_board/get_new_comment_list/')return previous(url,options);
          return Promise.resolve({ok:true,status:200,headers:new Headers(),json:()=>new Promise(resolve=>window.finishLateBody=resolve)});
        };void get_new_comment_list();""")
        page.wait_for_function("!!window.finishLateBody")
        page.clock.run_for(15000)
        self.assert_unavailable(page, "div_new_comment_list")
        page.evaluate("finishLateBody({0:" + json.dumps(base.COMMENT) + "})")
        page.wait_for_timeout(20)
        self.assertEqual(page.locator("#div_new_comment_list a").count(), 0)
        self.assertEqual(errors, [])

    def test_pending_header_never_promotes_invalid_control_or_delays_real_rows(self):
        cases = (
            ("string", "invalid", True, False),
            ("error", {"ok": False, "error": "unavailable"}, True, False),
            ("mixed-error", {"ok": False, "pending": True, "error": "unavailable"}, True, False),
            ("mixed-row", {"ok": False, "pending": True, "0": base.COMMENT}, True, False),
            ("empty-pending", {}, True, False),
            ("real-rows", {"0": base.COMMENT}, True, True),
            ("complete-empty", {}, False, True),
        )
        for name, payload, header, healthy in cases:
            with self.subTest(name=name):
                def respond(route, *_):
                    route.fulfill(status=200, content_type="application/json", body=json.dumps(payload),
                                  headers={"X-WebR-Cache": "pending"} if header else {})
                page, requests, errors, _ = self.fixture(respond)
                page.evaluate("get_new_comment_list()")
                box = page.locator("#div_new_comment_list")
                self.assertEqual(box.get_attribute("aria-busy"), "false")
                self.assertEqual(box.locator("[role=alert]").count(), 0 if healthy else 1)
                self.assertEqual(box.locator("a").count(), 1 if name == "real-rows" else 0)
                page.clock.run_for(15000)
                self.assertEqual(self.count(requests), 1)
                self.assertEqual(errors, [])

    def test_owner_retirement_prevents_late_commit_and_same_owner_calls_join(self):
        for change in ("gv_username='different-fixture-viewer'", "history.pushState({},'',location.pathname+'?retired=1')", "window.dispatchEvent(new Event('pagehide'))"):
            with self.subTest(change=change):
                page, _, errors, _ = self.fixture(lambda route, *_: self.fulfill(route, {}))
                page.evaluate("""window.heldReads=0;window.fetch=()=>{window.heldReads++;return new Promise(resolve=>window.finishRetired=resolve);};
                  void get_new_comment_list();void get_new_comment_list();""")
                page.wait_for_function("!!window.finishRetired")
                self.assertEqual(page.evaluate("heldReads"), 1)
                page.evaluate(change); page.clock.run_for(100)
                page.evaluate("finishRetired(new Response(JSON.stringify({0:" + json.dumps(base.COMMENT) + "}),{status:200,headers:{'Content-Type':'application/json'}}))")
                page.wait_for_timeout(20)
                self.assertEqual(page.locator("#div_new_comment_list a").count(), 0)
                self.assertEqual(page.locator("#div_new_comment_list").get_attribute("aria-busy"), "false")
                self.assertEqual(errors, [])

    def test_role_only_handoff_discards_old_response_inside_same_attempt_budget(self):
        page, _, errors, _ = self.fixture(lambda route, *_: self.fulfill(route, {}))
        page.evaluate("""window.handoffReads=0;window.fetch=()=>{
          window.handoffReads++;if(handoffReads===1)return new Promise(resolve=>window.finishPriorRole=resolve);
          return Promise.resolve(new Response(JSON.stringify({0:""" + json.dumps(base.COMMENT) + """}),{status:200,headers:{'Content-Type':'application/json'}}));
        };void get_new_comment_list();""")
        page.wait_for_function("!!window.finishPriorRole")
        page.evaluate("gv_role='member';window.gv_is_admin=false"); page.clock.run_for(100)
        page.evaluate("finishPriorRole(new Response(JSON.stringify({0:" + json.dumps(dict(base.COMMENT, content='PRIOR ROLE MUST NOT PAINT')) + "}),{status:200,headers:{'Content-Type':'application/json'}}))")
        page.locator("#div_new_comment_list a").wait_for()
        self.assertEqual(page.evaluate("handoffReads"), 2)
        self.assertNotIn("PRIOR ROLE", page.locator("#div_new_comment_list").inner_text())
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
