import json
import os
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1] / "scripts_go/web_r_go_20260629_1025"
RENDERER = Path(os.environ.get("WEBR_YOUTUBE_PRIMARY_SOURCE", str(
    ROOT / "scripts_v2/workshop/youtube/set_main_comment_mini_20260930_first_paint.js")))
ARTICLE_ID = "11111111-1111-4111-8111-111111111111"
OTHER_ID = "22222222-2222-4222-8222-222222222222"
READ = "/blank/ajax_board/get_read_article/"
COMMENTS = "/blank/ajax_board/get_read_article_comment/"
ARTICLE = {"uuid": ARTICLE_ID, "title": "Current visible R video",
           "youtube_url": "https://www.youtube.com/watch?v=l45h6KH_RTo",
           "content": "Current visible introduction", "check_reader": "guest", "is_secret": 0}


class YouTubePrimaryRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, responder, *, language="ko", ignore_abort=False):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.add_init_script("Object.assign(window," + json.dumps({
            "url": "youtube", "mode": "read", "sub": "", "init_url": "/workshop/youtube/",
            "orderID": ARTICLE_ID, "gv_username": "", "gv_role": "guest",
        }) + ");")
        page.add_init_script("""
          window.WebRSolidEdit={renderContent:(target,content)=>{target.textContent=content;}};
          window.primaryActive=0;window.primaryMax=0;window.primaryCompleted=0;window.primaryAborts=0;
          const nativeFetch=window.fetch.bind(window);
          window.fetch=(url,options)=>{
            if(new URL(url,location.href).pathname!=="/blank/ajax_board/get_read_article/")return nativeFetch(url,options);
            window.primaryActive++;window.primaryMax=Math.max(window.primaryMax,window.primaryActive);
            options.signal?.addEventListener('abort',()=>window.primaryAborts++,{once:true});
            return nativeFetch(url,options).finally(()=>{window.primaryActive--;window.primaryCompleted++;});
          };
        """)
        if ignore_abort:
            page.add_init_script("""
              const previous=window.fetch;
              window.fetch=(url,options)=>new URL(url,location.href).pathname==='/blank/ajax_board/get_read_article/'?
                new Promise(resolve=>{window.resolveObsolete=resolve;}):previous(url,options);
            """)
        errors, requests, parked = [], [], []
        page.on("pageerror", lambda error: errors.append(str(error)))

        def respond(route):
            path = urlsplit(route.request.url).path
            if path == "/workshop/youtube/read/" + ARTICLE_ID + "/":
                route.fulfill(status=200, content_type="text/html", body=f"<html lang='{language}'><div id='div_main'></div></html>")
            elif path == READ:
                requests.append({"path": path, "body": route.request.post_data, "headers": route.request.headers})
                responder(route, len([r for r in requests if r["path"] == READ]), parked)
            elif path.startswith("/blank/ajax_board/"):
                requests.append({"path": path})
                self.fulfill(route, {})
            else:
                route.abort()

        def cleanup():
            for route in parked:
                try:
                    route.abort()
                except Exception:
                    pass
            page.unroute_all(behavior="ignoreErrors")

        self.addCleanup(cleanup)
        page.route("**/*", respond)
        page.goto("https://primary.test/workshop/youtube/read/" + ARTICLE_ID + "/")
        page.clock.install()
        page.evaluate("document.cookie='csrftoken=current-csrf;path=/'")
        page.add_style_tag(path=str(ROOT / "styles_v2/common/public_tailwind_20260905.min.css"))
        page.add_script_tag(path=str(ROOT / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"))
        page.add_script_tag(path=str(RENDERER))
        page.evaluate("renderWorkshopReadPage()")
        return page, requests, parked, errors

    @staticmethod
    def fulfill(route, payload, status=200):
        route.fulfill(status=status, content_type="application/json", body=json.dumps(payload))

    @staticmethod
    def primary_count(requests):
        return sum(r["path"] == READ for r in requests)

    def wait_retry(self, page):
        page.wait_for_function("youtubePrimaryRead && youtubePrimaryRead.retryTimer !== null", timeout=1000)

    def assert_no_fake_article(self, page):
        self.assertTrue(page.evaluate("data_article === null"))
        self.assertEqual(page.locator("#div_community_read_header h1").count(), 0)
        self.assertNotIn("제목 없음", page.locator("#div_main").inner_text())
        self.assertNotIn("전체 0", page.locator("#div_main").inner_text())

    def assert_error(self, page, *, terminal=False, english=False):
        header = page.locator("#div_community_read_header")
        header.get_by_role("alert").wait_for(timeout=1000)
        self.assert_no_fake_article(page)
        self.assertEqual(header.get_by_role("button").count(), 0 if terminal else 1)
        self.assertEqual(page.locator("#div_community_read_content .animate-pulse").count(), 0)
        self.assertEqual(header.get_attribute("aria-busy"), "false")
        if english:
            self.assertIn("request could not be completed", header.inner_text())
            self.assertEqual(header.get_by_role("button", name="Try again", exact=True).count(), 1)

    def test_slow_pending_then_fast_body_never_renders_control_envelope(self):
        def responder(route, number, parked):
            parked.append(route) if number == 1 else self.fulfill(route, ARTICLE)

        page, requests, parked, errors = self.render(responder)
        page.wait_for_function("primaryActive===1")
        page.clock.run_for(9000)
        self.fulfill(parked[0], {"ok": False, "pending": True, "title": "", "uuid": ""})
        page.wait_for_function("primaryCompleted===1")
        page.wait_for_timeout(40)
        self.assert_no_fake_article(page)
        self.assertEqual(sum(r["path"] == COMMENTS for r in requests), 0)
        page.clock.run_for(150)
        page.get_by_role("heading", name=ARTICLE["title"], exact=True).wait_for(timeout=1000)
        page.wait_for_function("document.querySelector('#div_community_read_header').getAttribute('aria-busy')==='false'")
        self.assertEqual(self.primary_count(requests), 2)
        self.assertEqual(page.evaluate("primaryMax"), 1)
        self.assertEqual(sum(r["path"] == COMMENTS for r in requests), 1)
        self.assertTrue(all(r["headers"]["x-csrftoken"] == "current-csrf" for r in requests if r["path"] == READ))
        self.assertEqual(errors, [])

    def test_two_nine_second_reads_do_not_extend_seventeen_second_deadline(self):
        page, requests, parked, errors = self.render(lambda route, _, held: held.append(route))
        page.wait_for_function("primaryActive===1")
        page.clock.run_for(9000)
        self.fulfill(parked[0], {"ok": False, "pending": True})
        self.wait_retry(page)
        page.clock.run_for(150)
        page.wait_for_function("primaryActive===1 && primaryCompleted===1")
        page.clock.run_for(7850)
        self.assert_error(page)
        self.assertEqual(self.primary_count(requests), 2)
        self.assertEqual(sum(r["path"] == COMMENTS for r in requests), 0)
        page.wait_for_function("primaryActive===0")
        self.assertGreaterEqual(page.evaluate("primaryAborts"), 1)
        self.assertEqual(errors, [])

    def test_terminal_denials_and_withdrawals_never_retry_or_render_private_body(self):
        for payload, status in [({}, 401), ({}, 403), ({}, 404),
                                ({"ok": False, "not_found": True, "pending": True}, 200),
                                ({**ARTICLE, "is_secret": 1}, 200), ({**ARTICLE, "withdrawn": True}, 200)]:
            with self.subTest(status=status, payload_keys=list(payload)):
                page, requests, _, errors = self.render(lambda route, _, __: self.fulfill(route, payload, status))
                self.assert_error(page, terminal=True)
                page.clock.run_for(18000)
                self.assertEqual(self.primary_count(requests), 1)
                self.assertEqual(sum(r["path"] == COMMENTS for r in requests), 0)
                self.assertNotIn(ARTICLE["content"], page.locator("#div_main").inner_text())
                self.assertEqual(errors, [])

    def test_duplicate_initial_calls_share_one_inflight_read(self):
        page, requests, parked, errors = self.render(lambda route, _, held: held.append(route))
        page.wait_for_function("primaryActive===1")
        page.evaluate("void get_read_article('init');void get_read_article('init')")
        self.assertEqual(self.primary_count(requests), 1)
        self.fulfill(parked[0], ARTICLE)
        page.get_by_role("heading", name=ARTICLE["title"], exact=True).wait_for(timeout=1000)
        self.assertEqual(page.evaluate("primaryMax"), 1)
        self.assertEqual(errors, [])

    def test_pagehide_during_backoff_cancels_without_late_retry_or_error(self):
        page, requests, _, errors = self.render(lambda route, _, __: self.fulfill(route, {"pending": True, "ok": False}))
        self.wait_retry(page)
        page.evaluate("history.replaceState({},'', '/workshop/youtube/');window.dispatchEvent(new Event('pagehide'))")
        page.clock.run_for(18000)
        self.assertEqual(self.primary_count(requests), 1)
        self.assertEqual(page.locator("#div_community_read_header [role=alert]").count(), 0)
        self.assertEqual(page.locator("#div_community_read_header").get_attribute("aria-busy"), "false")
        self.assertEqual(errors, [])

    def test_ignored_abort_and_replaced_owner_cannot_render_late_article(self):
        page, _, _, errors = self.render(lambda *_: None, ignore_abort=True)
        page.wait_for_function("typeof resolveObsolete==='function'")
        page.evaluate("document.querySelector('#div_community_read_header').outerHTML='<div id=div_community_read_header>New page</div>';window.dispatchEvent(new Event('pagehide'))")
        page.evaluate("resolveObsolete(new Response(JSON.stringify(" + json.dumps(ARTICLE) + "),{status:200,headers:{'Content-Type':'application/json'}}))")
        page.clock.run_for(18000)
        self.assertEqual(page.locator("#div_community_read_header").inner_text(), "New page")
        self.assertTrue(page.evaluate("data_article===null"))
        self.assertEqual(errors, [])

    def test_retry_exhaustion_is_explicit_and_manual_retry_reads_current_body(self):
        page, requests, _, errors = self.render(lambda route, number, _: self.fulfill(
            route, {"ok": False, "pending": True} if number < 4 else ARTICLE))
        for delay in (150, 300):
            self.wait_retry(page)
            page.clock.run_for(delay)
        self.assert_error(page)
        self.assertEqual(self.primary_count(requests), 3)
        page.locator("#div_community_read_header").get_by_role("button", name="다시 시도", exact=True).click()
        page.get_by_role("heading", name=ARTICLE["title"], exact=True).wait_for(timeout=1000)
        self.assertEqual(self.primary_count(requests), 4)
        self.assertEqual(page.evaluate("primaryMax"), 1)
        self.assertEqual(errors, [])

    def test_network_and_server_errors_recover_without_overlapping_requests(self):
        def responder(route, number, _):
            if number == 1:
                route.abort()
            else:
                self.fulfill(route, {} if number == 2 else ARTICLE, 503 if number == 2 else 200)

        page, requests, _, errors = self.render(responder)
        for delay in (150, 300):
            self.wait_retry(page)
            page.clock.run_for(delay)
        page.get_by_role("heading", name=ARTICLE["title"], exact=True).wait_for(timeout=1000)
        self.assertEqual(self.primary_count(requests), 3)
        self.assertEqual(page.evaluate("primaryMax"), 1)
        self.assertEqual(errors, [])

    def test_wrong_uuid_never_renders_and_fresh_withdrawal_clears_previous_body(self):
        responses = [{**ARTICLE, "uuid": OTHER_ID}, ARTICLE, {"ok": False, "not_found": True}]
        page, requests, _, errors = self.render(lambda route, _, __: self.fulfill(route, responses.pop(0)))
        self.wait_retry(page)
        self.assert_no_fake_article(page)
        page.clock.run_for(150)
        page.get_by_role("heading", name=ARTICLE["title"], exact=True).wait_for(timeout=1000)
        page.evaluate("void get_read_article('init')")
        self.assert_error(page, terminal=True)
        self.assertEqual(self.primary_count(requests), 3)
        self.assertNotIn(ARTICLE["content"], page.locator("#div_main").inner_text())
        self.assertEqual(errors, [])

    def test_pending_status_is_quiet_and_deadline_error_is_localized(self):
        page, requests, _, errors = self.render(lambda route, _, held: held.append(route), language="en")
        status = page.locator("#div_community_read_header [role=status]")
        self.assertEqual(status.inner_text(), "Loading items.")
        self.assertEqual(status.get_attribute("aria-live"), "polite")
        self.assertEqual(status.locator("xpath=ancestor::*[@aria-hidden='true']").count(), 0)
        box = status.bounding_box()
        self.assertLessEqual(box["width"], 2)
        self.assertLessEqual(box["height"], 2)
        page.clock.run_for(17000)
        self.assert_error(page, english=True)
        self.assertEqual(self.primary_count(requests), 1)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
