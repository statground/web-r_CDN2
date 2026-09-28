import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts_go/web_r_go_20260629_1025/scripts_v2/index"
KEYS = ["rcommunity", "community", "books", "packages", "ecosystem", "workshops", "notices", "lectures", "youtube", "activity"]


def payload(youtube, lectures=None):
    sections = {key: [] for key in KEYS}
    sections["youtube"] = youtube
    sections["lectures"] = lectures or []
    return {
        "ok": True, "complete": True,
        "statistics": {"cnt_member": 8160, "cnt_visitor": 1, "cnt_pageview": 2},
        "sections": sections, "book_visibility_revision": "verified-revision",
        "unavailable_sections": [], "stale_sections": [],
    }


def video(title, **extra):
    return {"title": title, "href": "/workshop/youtube/read/11111111-1111-4111-8111-111111111111/",
            "published_at": "2026-09-28", **extra}


LECTURE = {"title": "Healthy lecture", "href": "/workshop/lecture/", "published_at": "2026-09-20"}


class HomeYouTubeVisibilityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, live, *, cached=None, status=200):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.add_init_script("const timer=window.setTimeout.bind(window);window.setTimeout=(fn,ms,...args)=>timer(fn,[900,1800,3000].includes(ms)?1:ms,...args);")
        if cached:
            page.add_init_script("localStorage.setItem('webr.home.public-summary.v1',JSON.stringify({schema:1,stored_at:Date.now(),payload:" + json.dumps(cached) + "}));")
        calls = []
        def respond(route):
            path = urlsplit(route.request.url).path
            if path == "/":
                route.fulfill(status=200, content_type="text/html", body='<div id="div_main"></div>')
            elif path == "/homepage/content-summary/":
                calls.append(path)
                route.fulfill(status=status, content_type="application/json", body=json.dumps(live))
            elif path == "/ajax_index_notice/":
                route.fulfill(status=200, content_type="application/json", body="{}")
            else:
                route.abort()
        page.route("**/*", respond)
        page.goto("https://home.test/")
        page.add_script_tag(path=str(SCRIPTS / "set_main_compact_portal_20260801_0138.js"))
        page.add_script_tag(path=str(SCRIPTS / "home_summary_terminal_guard_20260828_2306.js"))
        page.evaluate("window.set_main()")
        return page, calls

    def test_placeholder_and_inactive_live_videos_fall_back_to_lecture(self):
        live = payload([video("youtube video #qLZmigdY7wg"), video("Former public title", active=False)], [LECTURE])
        page, _ = self.render(live)
        page.get_by_role("link", name="Healthy lecture", exact=False).wait_for()
        media = page.locator(".webr-home-compact__media-title")
        self.assertEqual(media.inner_text(), "Healthy lecture")

    def test_saved_youtube_never_reappears_when_current_read_fails(self):
        saved = payload([video("Former public title")], [LECTURE])
        page, calls = self.render({}, cached=saved, status=503)
        page.get_by_role("link", name="Healthy lecture", exact=False).wait_for()
        page.wait_for_function("document.querySelector('#webr-home-portal').getAttribute('aria-busy') === 'false'")
        self.assertNotIn("Former public title", page.locator("body").inner_text())
        self.assertGreater(len(calls), 0)

    def test_current_healthy_video_displays_but_is_not_saved_as_visibility(self):
        live = payload([video("Current public video")], [LECTURE])
        page, _ = self.render(live)
        page.get_by_role("link", name="Current public video", exact=False).wait_for()
        saved = page.evaluate("JSON.parse(localStorage.getItem('webr.home.public-summary.v1'))")
        self.assertEqual(saved["payload"]["sections"]["youtube"], [])
        self.assertEqual(saved["payload"]["sections"]["lectures"][0]["title"], "Healthy lecture")


if __name__ == "__main__":
    unittest.main()
