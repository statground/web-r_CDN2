import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "scripts_go/web_r_go_20260629_1025"
VENDOR = ASSETS / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"
NOTICE_JS = ASSETS / "scripts_v2/intro/notice/set_main_solid_edit_comment_mini_20260822_1548.js"
EMPTY_TEXT = "표시할 공지사항이 없습니다."
UNAVAILABLE_TEXT = "공지 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."


class NoticeListStatusTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if sync_playwright is None:
            raise unittest.SkipTest("Playwright is not installed")
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, responses):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        calls = []
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        def fulfill(route):
            path = urlsplit(route.request.url).path
            if path == "/intro/notice/":
                route.fulfill(status=200, content_type="text/html", body='<div id="div_main"></div>')
            elif path == "/blank/ajax_board/get_article_list/":
                calls.append(route.request.post_data)
                response = responses.pop(0)
                if response == "abort":
                    route.abort("failed")
                else:
                    route.fulfill(
                        status=response.get("status", 200),
                        content_type="application/json",
                        body=json.dumps(response["body"]),
                    )
            else:
                route.abort()

        page.route("**/*", fulfill)
        page.goto("https://notice.test/intro/notice/")
        page.add_script_tag(path=str(VENDOR))
        page.evaluate("window.Div_page_header=()=>null; window.getCookie=()=>'';")
        page.add_script_tag(path=str(NOTICE_JS))
        page.evaluate("window.set_main()")
        return page, calls, errors

    def test_pending_and_failed_payloads_retry_to_visible_notice(self):
        notice = {"uuid": "notice-1", "title": "복구된 공지", "category_url": "notice"}
        for failed in (
            {"ok": False, "pending": True, "count": {"cnt": 0}, "list": {}},
            {"ok": False, "count": {"cnt": 0}, "list": {}},
            {"count": {"cnt": 1}, "list": {}},
            {"count": {"cnt": 0}, "list": []},
            {"count": {"cnt": 0}, "list": None},
            {},
        ):
            with self.subTest(failed=failed):
                page, calls, errors = self.render([
                    {"body": failed},
                    {"body": {"count": {"cnt": 1}, "list": {"0": notice}}},
                ])
                page.get_by_role("alert").get_by_text(UNAVAILABLE_TEXT).wait_for()
                self.assertEqual(page.get_by_text(EMPTY_TEXT).count(), 0)
                page.get_by_role("button", name="다시 시도").click()
                page.get_by_role("heading", name="복구된 공지").wait_for()
                self.assertEqual(page.locator("article a").get_attribute("href"), "/intro/notice/read/notice-1/")
                self.assertEqual(len(calls), 2)
                self.assertEqual(errors, [])

    def test_fetch_failure_has_retry_and_true_empty_stays_empty(self):
        page, calls, errors = self.render([
            "abort",
            {"body": {"count": {"cnt": 0}, "list": {}}},
        ])
        page.get_by_role("alert").get_by_text(UNAVAILABLE_TEXT).wait_for()
        page.get_by_role("button", name="다시 시도").click()
        page.get_by_text(EMPTY_TEXT).wait_for()
        self.assertEqual(page.get_by_role("alert").count(), 0)
        self.assertEqual(len(calls), 2)
        self.assertEqual(errors, [])

    def test_valid_list_keeps_pagination_and_detail_links(self):
        rows = {
            str(index): {"uuid": f"notice-{index}", "title": f"공지 {index}", "category_url": "notice"}
            for index in range(6)
        }
        page, calls, errors = self.render([{"body": {"count": {"cnt": 6}, "list": rows}}])
        page.get_by_role("heading", name="공지 0").wait_for()
        self.assertEqual(page.locator("article").count(), 5)
        self.assertEqual(page.locator("article a").first.get_attribute("href"), "/intro/notice/read/notice-0/")
        page.get_by_role("button", name="다음").click()
        page.get_by_role("heading", name="공지 5").wait_for()
        self.assertEqual(page.locator("article").count(), 1)
        self.assertEqual(page.locator("article a").first.get_attribute("href"), "/intro/notice/read/notice-5/")
        self.assertEqual(page.get_by_role("alert").count(), 0)
        self.assertEqual(len(calls), 1)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
