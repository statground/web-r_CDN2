import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None


ROOT = Path(__file__).resolve().parents[1]
PORTAL_JS = ROOT / "scripts_go/web_r_go_20260629_1025/scripts_v2/index/set_main_compact_portal_20260801_0138.js"
PORTAL_CSS = ROOT / "scripts_go/web_r_go_20260629_1025/styles_v2/index/home_compact_portal_20260729_1530.css"
UNAVAILABLE = "공지사항을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요."


def summary(notices, *, unavailable=(), complete=True):
    return {
        "ok": True,
        "complete": complete,
        "statistics": {},
        "sections": {
            "notices": notices,
            "rcommunity": [{"title": "R 자료 유지", "href": "/community/r-community/"}],
        },
        "unavailable_sections": list(unavailable),
        "stale_sections": [],
    }


class HomeNoticeStatusTests(unittest.TestCase):
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

    def render(self, initial):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        state = {"reply": initial, "calls": 0}
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.add_init_script(
            "const timer=window.setTimeout.bind(window);"
            "window.setTimeout=(fn,ms,...args)=>timer(fn,[900,1800,3000].includes(ms)?1:ms,...args);"
        )

        def fulfill(route):
            path = urlsplit(route.request.url).path
            if path == "/":
                route.fulfill(status=200, content_type="text/html", body='<div id="div_main"></div>')
            elif path == "/homepage/content-summary/":
                state["calls"] += 1
                reply = state["reply"]
                route.fulfill(
                    status=reply.get("status", 200),
                    content_type="application/json",
                    body=json.dumps(reply.get("body", {})),
                )
            else:
                route.abort()

        page.route("**/*", fulfill)
        page.goto("https://home.test/")
        page.add_style_tag(path=str(PORTAL_CSS))
        page.add_script_tag(path=str(PORTAL_JS))
        page.evaluate("window.set_main()")
        notice_body = page.locator(".webr-home-compact__rail-card").filter(
            has=page.get_by_role("heading", name="공지사항")
        ).locator(".webr-home-compact__rail-body")
        return page, notice_body, state, errors

    def test_unavailable_notice_has_retry_and_preserves_other_card(self):
        page, body, state, errors = self.render({"body": summary([], unavailable=("notices",), complete=False)})
        page.locator('#webr-home-portal[data-home-summary-state="partial"]').wait_for()
        body.get_by_text(UNAVAILABLE).wait_for()
        self.assertEqual(body.locator(".webr-home-compact__notice-unavailable").evaluate(
            "node => getComputedStyle(node).backgroundColor"
        ), "rgb(255, 251, 235)")
        self.assertEqual(body.get_by_text("공지사항 전체 보기").count(), 0)
        self.assertEqual(body.get_by_role("link", name="공지사항으로 이동").get_attribute("href"), "/intro/notice/")
        self.assertIn("R 자료 유지", page.locator(".webr-home-compact__category-grid").inner_text())

        state["reply"] = {"body": summary([
            {"title": "복구된 공지", "href": "/intro/notice/read/notice-1/", "published_at": "2026-09-27"}
        ])}
        body.get_by_role("button", name="다시 시도").click()
        notice = body.get_by_role("link", name="복구된 공지")
        notice.wait_for()
        self.assertEqual(notice.get_attribute("href"), "/intro/notice/read/notice-1/")
        self.assertIn("R 자료 유지", page.locator(".webr-home-compact__category-grid").inner_text())
        self.assertGreaterEqual(state["calls"], 5)
        self.assertEqual(errors, [])

    def test_complete_empty_and_existing_notice_cards(self):
        for notices, expected in (
            ([], "공지사항 전체 보기"),
            ([{"title": "기존 공지", "href": "/intro/notice/read/notice-2/"}], "기존 공지"),
        ):
            with self.subTest(expected=expected):
                page, body, state, errors = self.render({"body": summary(notices)})
                body.get_by_text(expected).wait_for()
                self.assertEqual(body.get_by_role("button", name="다시 시도").count(), 0)
                if notices:
                    self.assertEqual(body.get_by_role("link", name="기존 공지").get_attribute("href"), "/intro/notice/read/notice-2/")
                self.assertEqual(state["calls"], 1)
                self.assertEqual(errors, [])

    def test_failed_summary_shows_unavailable_then_retries(self):
        page, body, state, errors = self.render({"status": 503})
        page.locator('#webr-home-portal[data-home-summary-state="fallback"]').wait_for()
        body.get_by_text(UNAVAILABLE).wait_for()
        self.assertEqual(body.get_by_text("공지사항 전체 보기").count(), 0)
        state["reply"] = {"body": summary([
            {"title": "다시 읽은 공지", "href": "/intro/notice/read/notice-3/"}
        ])}
        body.get_by_role("button", name="다시 시도").click()
        body.get_by_role("link", name="다시 읽은 공지").wait_for()
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
