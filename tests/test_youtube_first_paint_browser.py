import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1] / "scripts_go/web_r_go_20260629_1025"
RENDERER = ROOT / "scripts_v2/workshop/youtube/set_main_comment_mini_20260930_first_paint.js"
VIDEO = {"uuid": "11111111-1111-4111-8111-111111111111", "title": "Current public R video",
         "youtube_url": "https://www.youtube.com/watch?v=l45h6KH_RTo", "youtube_publish_date": "2026-09-28"}


class YouTubeFirstPaintBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, *, pending_list=False, hanging_list=False):
        page = self.browser.new_page(viewport={"width": 1440, "height": 900})
        self.addCleanup(page.close)
        page.add_init_script("Object.assign(window,{url:'youtube',mode:'list',sub:'',init_url:'/workshop/youtube/',gv_username:'cached-admin',gv_role:'admin'});")
        if hanging_list:
            page.add_init_script("const timer=window.setTimeout.bind(window);window.setTimeout=(fn,ms,...args)=>timer(fn,ms===15000?30:ms,...args);")
        requests, parked = [], []

        def release_parked():
            for route in parked:
                try:
                    route.abort()
                except Exception:
                    pass
            page.unroute_all(behavior="ignoreErrors")

        self.addCleanup(release_parked)

        def respond(route):
            parsed = urlsplit(route.request.url)
            requests.append(parsed.path)
            if parsed.path == "/workshop/youtube/":
                route.fulfill(status=200, content_type="text/html", body='<div id="div_main"></div>')
            elif parsed.path == "/ajax_get_menu_header/":
                parked.append(route)
            elif parsed.path == "/blank/ajax_board/get_article_list_youtube/":
                if hanging_list:
                    parked.append(route)
                else:
                    payload = {"pending": True, "ok": False} if pending_list else {"count": {"cnt": 1}, "list": {"0": VIDEO}}
                    route.fulfill(status=200, content_type="application/json", body=json.dumps(payload))
            else:
                route.abort()

        page.route("**/*", respond)
        page.goto("https://paint.test/workshop/youtube/")
        page.add_style_tag(path=str(ROOT / "styles_v2/common/public_tailwind_20260905.min.css"))
        page.add_script_tag(path=str(ROOT / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"))
        page.add_script_tag(path=str(ROOT / "scripts_v2/common/div/page_header_20260506_2320.js"))
        page.add_script_tag(path=str(RENDERER))
        page.evaluate("set_main()")
        return page, requests, parked

    def test_hanging_permission_does_not_delay_list_or_hide_healthy_video_on_image_failure(self):
        page, requests, _ = self.render()
        page.get_by_role("heading", name="유튜브", exact=True).wait_for(state="visible")
        page.get_by_role("heading", name=VIDEO["title"], exact=True).wait_for(state="visible")
        page.get_by_role("link", name="자세히 보기", exact=True).wait_for(state="visible")
        self.assertIn("/blank/ajax_board/get_article_list_youtube/", requests)
        self.assertEqual(page.get_by_role("button", name="글쓰기", exact=True).count(), 0)
        page.wait_for_timeout(100)
        self.assertTrue(page.get_by_role("heading", name=VIDEO["title"], exact=True).is_visible())
        self.assertLessEqual(sum("/hqdefault.jpg" in url for url in requests), 1)

    def test_pending_list_keeps_controls_and_explicit_retry_without_empty_claim(self):
        page, _, _ = self.render(pending_list=True)
        page.get_by_role("button", name="다시 시도", exact=True).wait_for(state="visible")
        self.assertTrue(page.get_by_role("heading", name="유튜브", exact=True).is_visible())
        self.assertTrue(page.get_by_role("button", name="검색", exact=True).is_visible())
        self.assertIn("영상 목록을 잠시 불러오지 못했습니다.", page.locator("#div_main").inner_text())
        self.assertNotIn("전체 0개", page.locator("#div_main").inner_text())

    def test_hanging_list_has_deadline_and_manual_retry(self):
        page, _, _ = self.render(hanging_list=True)
        page.get_by_role("button", name="다시 시도", exact=True).wait_for(state="visible")
        self.assertTrue(page.get_by_role("heading", name="유튜브", exact=True).is_visible())
        self.assertFalse(page.evaluate("toggle_page"))


if __name__ == "__main__":
    unittest.main()
