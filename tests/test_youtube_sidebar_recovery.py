import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1] / "scripts_go/web_r_go_20260629_1025"
RENDERER = ROOT / "scripts_v2/workshop/youtube/set_main_comment_mini_20260930_first_paint.js"
ARTICLE_ID = "11111111-1111-4111-8111-111111111111"
COMMENT_ID = "22222222-2222-4222-8222-222222222222"
ARTICLE = {"uuid": ARTICLE_ID, "title": "Current public R video", "user_nickname": "Reader"}
COMMENT = {"uuid": COMMENT_ID, "uuid_article": ARTICLE_ID,
           "content": "<p>Current comment</p>", "article_title": ARTICLE["title"]}
TARGETS = ("div_article_famous_list", "div_new_comment_list", "div_my_article_list", "div_my_comment_list")


class YouTubeSidebarRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, responder, *, username="", short_deadline=False):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.add_init_script("Object.assign(window," + json.dumps({
            "url": "youtube", "init_url": "/workshop/youtube/", "gv_username": username,
        }) + ");")
        if short_deadline:
            page.add_init_script("const timer=window.setTimeout.bind(window);window.setTimeout=(fn,ms,...args)=>timer(fn,ms===15000?30:ms,...args);")
        errors, requests, parked = [], [], []
        page.on("pageerror", lambda error: errors.append(str(error)))

        def respond(route):
            path = urlsplit(route.request.url).path
            if path == "/workshop/youtube/read/" + ARTICLE_ID + "/":
                body = "<div id='div_main'></div>" + "".join("<div id='" + target + "'></div>" for target in TARGETS)
                route.fulfill(status=200, content_type="text/html", body=body)
            elif path.startswith("/blank/ajax_board/"):
                requests.append({"path": path, "headers": route.request.headers, "body": route.request.post_data})
                responder(route, path, requests, parked)
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
        page.goto("https://sidebar.test/workshop/youtube/read/" + ARTICLE_ID + "/")
        page.evaluate("document.cookie='csrftoken=current-csrf;path=/'")
        page.add_script_tag(path=str(ROOT / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"))
        page.add_script_tag(path=str(RENDERER))
        return page, requests, errors, parked

    @staticmethod
    def fulfill(route, payload, status=200):
        route.fulfill(status=status, content_type="application/json", body=json.dumps(payload))

    def assert_unavailable(self, page, target):
        box = page.locator("#" + target)
        self.assertEqual(box.locator("a").count(), 0)
        self.assertEqual(box.get_by_role("alert").count(), 1)
        self.assertEqual(box.get_by_role("button", name="다시 시도", exact=True).count(), 1)
        self.assertNotIn("0개", box.inner_text())
        self.assertEqual(box.get_attribute("aria-busy"), "false")

    def test_pending_is_not_rows_and_retry_uses_current_server_response(self):
        payloads = [{"ok": False, "pending": True}, {"0": ARTICLE}]
        page, requests, errors, _ = self.render(lambda route, *_: self.fulfill(route, payloads.pop(0)))
        page.evaluate("get_article_famous_list()")
        self.assert_unavailable(page, TARGETS[0])
        page.locator("#" + TARGETS[0]).get_by_role("button", name="다시 시도", exact=True).click()
        page.locator("#" + TARGETS[0]).get_by_role("link", name=ARTICLE["title"], exact=False).wait_for()
        self.assertEqual(page.locator("#" + TARGETS[0] + " a").get_attribute("href"), "/workshop/youtube/read/" + ARTICLE_ID + "/")
        self.assertEqual(len(requests), 2)
        self.assertTrue(all(request["headers"]["x-csrftoken"] == "current-csrf" for request in requests))
        self.assertTrue(all('name="tag"\r\n\r\nyoutube' in request["body"] for request in requests))
        self.assertEqual(errors, [])

    def test_malformed_envelopes_and_rows_never_create_links_or_healthy_empty(self):
        payloads = [None, [], "invalid JSON DTO", {"ok": False, "error": "unavailable"},
                    {"complete": False, "0": ARTICLE}, {"0": True},
                    {"0": {**ARTICLE, "uuid": "undefined"}},
                    {"0": {**ARTICLE, "uuid": "00000000-0000-0000-0000-000000000000"}},
                    {"0": {"uuid": ARTICLE_ID}}, {"0": ARTICLE, "1": {"uuid": "null"}}]
        page, _, errors, _ = self.render(lambda route, *_: self.fulfill(route, payloads.pop(0)))
        for _ in range(len(payloads)):
            page.evaluate("get_article_famous_list()")
            self.assert_unavailable(page, TARGETS[0])
        self.assertEqual(errors, [])

    def test_comments_require_comment_and_parent_ids_and_string_content(self):
        payloads = [{"ok": False, "pending": True},
                    {"0": {**COMMENT, "uuid_article": "undefined"}},
                    {"0": {**COMMENT, "uuid": "null"}},
                    {"0": {**COMMENT, "content": 5}},
                    {"0": COMMENT}]
        page, _, errors, _ = self.render(lambda route, *_: self.fulfill(route, payloads.pop(0)))
        for _ in range(4):
            page.evaluate("get_new_comment_list()")
            self.assert_unavailable(page, TARGETS[1])
        page.evaluate("get_new_comment_list()")
        link = page.locator("#" + TARGETS[1] + " a")
        self.assertEqual(link.get_attribute("href"), "/workshop/youtube/read/" + ARTICLE_ID + "/")
        self.assertIn("Current comment", link.inner_text())
        self.assertNotIn("<p>", link.inner_text())
        self.assertEqual(errors, [])

    def test_complete_empty_is_quiet_and_healthy_rows_keep_server_order(self):
        second = {**ARTICLE, "uuid": COMMENT_ID, "title": "Second current video"}
        payloads = [{}, {"0": second, "1": ARTICLE}]
        page, _, errors, _ = self.render(lambda route, *_: self.fulfill(route, payloads.pop(0)))
        page.evaluate("get_article_famous_list()")
        box = page.locator("#" + TARGETS[0])
        self.assertEqual(box.locator("a, [role=alert], button").count(), 0)
        self.assertIn("최신 인기 글", box.inner_text())
        page.evaluate("get_article_famous_list()")
        self.assertEqual(box.locator("a").evaluate_all("nodes=>nodes.map(node=>node.getAttribute('href'))"),
                         ["/workshop/youtube/read/" + COMMENT_ID + "/", "/workshop/youtube/read/" + ARTICLE_ID + "/"])
        self.assertEqual(errors, [])

    def test_http_and_network_failures_are_scoped_and_retryable(self):
        def responder(route, _, requests, __):
            if len(requests) == 1:
                self.fulfill(route, {}, status=503)
            elif len(requests) == 2:
                route.abort()
            else:
                self.fulfill(route, {"0": ARTICLE})

        page, requests, errors, _ = self.render(responder)
        for _ in range(2):
            page.evaluate("get_article_famous_list()")
            self.assert_unavailable(page, TARGETS[0])
            self.assertEqual(page.locator("#" + TARGETS[1]).inner_text(), "")
        page.locator("#" + TARGETS[0]).get_by_role("button", name="다시 시도", exact=True).click()
        page.locator("#" + TARGETS[0] + " a").wait_for()
        self.assertEqual(len(requests), 3)
        self.assertEqual(errors, [])

    def test_hanging_read_has_bounded_deadline(self):
        page, _, errors, _ = self.render(lambda route, _, __, parked: parked.append(route), short_deadline=True)
        page.evaluate("void get_article_famous_list()")
        page.locator("#" + TARGETS[0]).get_by_role("button", name="다시 시도", exact=True).wait_for()
        self.assert_unavailable(page, TARGETS[0])
        self.assertEqual(errors, [])

    def test_obsolete_owner_and_replaced_target_cannot_render(self):
        def responder(route, _, requests, parked):
            if len(requests) in (1, 3):
                parked.append(route)
            else:
                self.fulfill(route, {"0": ARTICLE})

        page, requests, errors, _ = self.render(responder)
        page.evaluate("void get_article_famous_list()")
        page.wait_for_function("document.querySelector('#div_article_famous_list').getAttribute('aria-busy')==='true'")
        page.evaluate("get_article_famous_list()")
        page.locator("#" + TARGETS[0] + " a").wait_for()
        page.evaluate("void get_article_famous_list()")
        page.wait_for_function("document.querySelector('#div_article_famous_list').getAttribute('aria-busy')==='true'")
        page.evaluate("document.querySelector('#div_article_famous_list').outerHTML='<div id=div_article_famous_list>New page</div>';window.dispatchEvent(new Event('pagehide'))")
        page.wait_for_timeout(60)
        self.assertEqual(page.locator("#" + TARGETS[0]).inner_text(), "New page")
        self.assertEqual(page.locator("#" + TARGETS[0] + " a, #" + TARGETS[0] + " [role=alert]").count(), 0)
        self.assertEqual(len(requests), 3)
        self.assertEqual(errors, [])

    def test_navigation_cancels_read_without_error_and_anonymous_mine_never_fetches(self):
        page, requests, errors, _ = self.render(lambda route, _, __, parked: parked.append(route))
        page.evaluate("void get_article_famous_list()")
        page.wait_for_function("document.querySelector('#div_article_famous_list').getAttribute('aria-busy')==='true'")
        page.evaluate("clearInfiniteScroll();get_my_article_list();get_my_comment_list()")
        page.wait_for_timeout(60)
        self.assertEqual(page.locator("#" + TARGETS[0] + " [role=alert]").count(), 0)
        self.assertEqual(page.locator("#" + TARGETS[0]).get_attribute("aria-busy"), "false")
        for target in TARGETS[2:]:
            self.assertIn("로그인이 필요합니다.", page.locator("#" + target).inner_text())
        self.assertEqual(len(requests), 1)
        self.assertEqual(errors, [])

    def test_authenticated_mine_validates_current_server_responses(self):
        def responder(route, path, *_):
            self.fulfill(route, {"0": ARTICLE} if "my_article" in path else {"ok": False, "pending": True})

        page, requests, errors, _ = self.render(responder, username="current-user")
        page.evaluate("Promise.all([get_my_article_list(),get_my_comment_list()])")
        self.assertEqual(page.locator("#" + TARGETS[2] + " a").get_attribute("href"), "/workshop/youtube/read/" + ARTICLE_ID + "/")
        self.assert_unavailable(page, TARGETS[3])
        self.assertEqual(len(requests), 2)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
