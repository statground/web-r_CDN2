"""Opt-in browser contract for the pinned notice list renderer."""

import json
import os
import re
import unittest
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None


SCRIPT = (
    Path(__file__).resolve().parents[1]
    / "scripts_go/web_r_go_20260629_1025/scripts_v2/intro/notice"
    / "set_main_solid_edit_comment_mini_20260822_1548.js"
)
NOTICE_URL = "https://testgo.web-r.org/intro/notice/"


@unittest.skipUnless(sync_playwright and os.getenv("NOTICE_BROWSER_TEST") == "1", "opt-in Playwright test")
class NoticeListStatusBrowserTest(unittest.TestCase):
    def test_partial_is_not_rendered_as_empty(self):
        fixtures = (
            (
                {"ok": False, "complete": False, "partial": True,
                 "count": {"cnt": 0}, "list": {}, "unavailable_sections": ["board"]},
                "공지 목록을 일시적으로 불러오지 못했습니다.",
                "표시할 공지사항이 없습니다.",
            ),
            (
                {"ok": True, "complete": False, "partial": True,
                 "count": {"cnt": 1}, "list": {"0": {
                     "uuid": "00000000-0000-4000-8000-000000000001",
                     "title": "검증된 기존 공지", "created_at": "2026-09-24 09:00:00",
                     "category_url": "notice", "user_nickname": "운영자",
                 }}, "unavailable_sections": ["board"]},
                "검증된 기존 공지",
                "표시할 공지사항이 없습니다.",
            ),
            (
                {"count": {"cnt": 0}, "list": {}},
                "표시할 공지사항이 없습니다.",
                "공지 목록을 일시적으로 불러오지 못했습니다.",
            ),
        )
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            try:
                for payload, expected, absent in fixtures:
                    with self.subTest(expected=expected):
                        page = browser.new_page()
                        intercepted = {"html": False, "script": False, "list": False}
                        errors = []
                        page.on("pageerror", lambda error: errors.append(str(error)))

                        def serve_script(route):
                            intercepted["script"] = True
                            route.fulfill(path=str(SCRIPT), content_type="application/javascript")

                        def serve_list(route):
                            intercepted["list"] = True
                            route.fulfill(body=json.dumps(payload), content_type="application/json")

                        def serve_html(route):
                            response = route.fetch()
                            html = re.sub(
                                r'(<script[^>]*set_main_solid_edit_comment_mini_20260822_1548\.js") integrity="[^"]+"',
                                r"\1",
                                response.text(),
                            )
                            intercepted["html"] = True
                            route.fulfill(response=response, body=html)

                        try:
                            page.route("**/intro/notice/", serve_html)
                            page.route("**/set_main_solid_edit_comment_mini_20260822_1548.js", serve_script)
                            page.route("**/blank/ajax_board/get_article_list/", serve_list)
                            page.goto(NOTICE_URL, wait_until="domcontentloaded", timeout=15000)
                            page.get_by_text(expected, exact=False).wait_for(timeout=8000)
                            self.assertFalse(page.get_by_text(absent, exact=False).count())
                            if payload.get("partial"):
                                self.assertTrue(page.get_by_text("공지 목록을 일시적으로 불러오지 못했습니다.").count())
                            self.assertTrue(intercepted["html"])
                            self.assertTrue(intercepted["script"])
                            self.assertTrue(intercepted["list"])
                            if expected == "공지 목록을 일시적으로 불러오지 못했습니다." and os.getenv("NOTICE_TEST_SCREENSHOT"):
                                page.screenshot(path=os.environ["NOTICE_TEST_SCREENSHOT"])
                        except Exception:
                            print("intercepted=", intercepted, "errors=", errors,
                                  "body=", page.locator("body").inner_text()[:500])
                            raise
                        finally:
                            page.close()
            finally:
                browser.close()


if __name__ == "__main__":
    unittest.main()
