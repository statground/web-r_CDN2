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
CURRENT_ID = "e2c01e26-4d2f-460c-bc0e-70111db914ab"
STALE_ID = "11111111-1111-4111-8111-111111111111"


def summary(*, status=200):
    return {
        "status": status,
        "body": {
            "ok": True,
            "complete": True,
            "statistics": {},
            "sections": {
                "notices": [{"title": "삭제된 캐시 공지", "href": f"/intro/notice/read/{STALE_ID}/"}],
                "rcommunity": [{"title": "R 자료 유지", "href": "/community/r-community/"}],
            },
            "unavailable_sections": [],
            "stale_sections": [],
        },
    }


def current_notice(title="현재 공지"):
    return {"body": {"0": {"uuid": CURRENT_ID, "title": title, "created_at": "2026-09-27 10:00:00"}}}


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

    def render(self, summary_reply, notice_reply):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        state = {"summary": summary_reply, "notice": notice_reply, "summary_calls": 0, "notice_calls": 0}
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
                state["summary_calls"] += 1
                reply = state["summary"]
                route.fulfill(status=reply.get("status", 200), content_type="application/json", body=json.dumps(reply.get("body", {})))
            elif path == "/ajax_index_notice/":
                state["notice_calls"] += 1
                reply = state["notice"]
                route.fulfill(status=reply.get("status", 200), content_type="application/json", body=json.dumps(reply.get("body", {})))
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

    def test_current_notice_outranks_stale_summary_without_blocking_other_cards(self):
        page, body, state, errors = self.render(summary(), current_notice())
        link = body.get_by_role("link", name="현재 공지")
        link.wait_for()
        self.assertEqual(link.get_attribute("href"), f"/intro/notice/read/{CURRENT_ID}/")
        self.assertEqual(body.get_by_text("삭제된 캐시 공지").count(), 0)
        self.assertIn("R 자료 유지", page.locator(".webr-home-compact__category-grid").inner_text())
        self.assertEqual(state["notice_calls"], 1)
        self.assertEqual(errors, [])

    def test_failed_authority_never_replays_stale_notice_and_retry_recovers(self):
        page, body, state, errors = self.render(summary(), {"status": 503})
        body.get_by_text(UNAVAILABLE).wait_for()
        self.assertEqual(body.get_by_text("삭제된 캐시 공지").count(), 0)
        self.assertEqual(body.get_by_text("공지사항 전체 보기").count(), 0)
        state["notice"] = current_notice("복구된 공지")
        body.get_by_role("button", name="다시 시도").click()
        body.get_by_role("link", name="복구된 공지").wait_for()
        self.assertEqual(state["notice_calls"], 2)
        self.assertEqual(errors, [])

    def test_empty_authority_and_failed_summary_are_independent(self):
        page, body, state, errors = self.render(summary(status=503), {"body": {}})
        body.get_by_text("공지사항 전체 보기").wait_for()
        self.assertEqual(body.get_by_text("삭제된 캐시 공지").count(), 0)
        self.assertEqual(state["notice_calls"], 1)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
