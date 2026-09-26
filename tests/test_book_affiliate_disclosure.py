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
BOOK_JS = ASSETS / "scripts_v2/book/set_main.js"
DISCLOSURE = "이 링크를 통해 구매하면 수수료를 제공받을 수 있습니다."
AFFILIATE = "https://book.test/book/affiliate/curated/001/yes24/"
DIRECT = "https://www.yes24.com/Product/Goods/12345"
BOOK = {
    "uuid_board_category": "001",
    "board_url_sub": "001",
    "content_format": "plain_text",
    "title": "Example Book",
    "publisher": "Example Publisher",
    "url_image": "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
}


class BookAffiliateDisclosureTests(unittest.TestCase):
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

    def page_for(self, path, links=None, render=True):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        info = {**BOOK, "links": links or []}

        def fulfill(route):
            request_path = urlsplit(route.request.url).path
            if request_path == path:
                route.fulfill(status=200, content_type="text/html", body='<div id="div_main"></div>')
            elif request_path == "/book/ajax_get_book_list/":
                route.fulfill(status=200, content_type="application/json", body=json.dumps({"book": BOOK}))
            elif request_path == "/book/ajax_get_book_info/":
                route.fulfill(status=200, content_type="application/json", body=json.dumps(info))
            elif request_path == "/blank/ajax_board/get_article_list/":
                route.fulfill(status=200, content_type="application/json", body='{"count":{"cnt":0},"list":{}}')
            else:
                route.abort()

        page.route("**/*", fulfill)
        page.goto("https://book.test" + path)
        if render:
            page.add_script_tag(path=str(VENDOR))
            page.evaluate(
                "window.Div_page_header=()=>null; window.Div_box_header=()=>null; "
                "window.Div_book_content_skeleton=()=>null; "
                "window.Div_article_list_skeleton=()=>null; window.getCookie=()=>'';"
            )
        page.add_script_tag(path=str(BOOK_JS))
        return page, errors

    def test_exact_https_same_origin_routes_only(self):
        page, errors = self.page_for("/book/001/", render=False)
        accepted = [
            f"https://book.test/book/affiliate/curated/{book_id:03d}/{merchant}/"
            for book_id in range(1, 9)
            for merchant in ("yes24", "kyobo")
        ]
        rejected = [
            "http://book.test/book/affiliate/curated/001/yes24/",
            "https://other.test/book/affiliate/curated/001/yes24/",
            "https://book.test/book/affiliate/curated/009/yes24/",
            "https://book.test/book/affiliate/curated/001/other/",
            "https://book.test/book/affiliate/curated/001/yes24/extra",
            "https://book.test/book/affiliate/curated/001/yes24/?ref=1",
            "https://book.test/book/affiliate/curated/001/yes24/#top",
            DIRECT,
        ]
        self.assertEqual(page.evaluate("urls => urls.map(window.WebRBookIsCuratedAffiliateLink)", accepted), [True] * len(accepted))
        self.assertEqual(page.evaluate("urls => urls.map(window.WebRBookIsCuratedAffiliateLink)", rejected), [False] * len(rejected))
        self.assertEqual(errors, [])

    def test_affiliate_disclosure_on_detail_and_compact_list(self):
        links = [
            {"marketplace": "Yes24", "url": AFFILIATE},
            {"marketplace": "LeanPub", "url": "https://leanpub.com/example"},
        ]
        for path, route_name, selector in (
            ("/book/001/", "detail", "#book-detail"),
            ("/book/list/001/", "list", "#div_book_info"),
        ):
            with self.subTest(route_name=route_name):
                page, errors = self.page_for(path, links)
                page.evaluate(f"window.WebRBookPages.{route_name}()")
                self.assertEqual(page.locator(selector).get_by_text(DISCLOSURE).count(), 1)
                affiliate_links = page.locator(f'{selector} a[href="{AFFILIATE}"]')
                self.assertGreaterEqual(affiliate_links.count(), 1)
                for link in affiliate_links.all():
                    self.assertIn("sponsored", link.get_attribute("rel").split())
                self.assertEqual(errors, [])

    def test_direct_marketplace_link_has_no_affiliate_disclosure(self):
        links = [{"marketplace": "Yes24", "url": DIRECT}]
        for path, route_name, selector in (
            ("/book/001/", "detail", "#book-detail"),
            ("/book/list/001/", "list", "#div_book_info"),
        ):
            with self.subTest(route_name=route_name):
                page, errors = self.page_for(path, links)
                page.evaluate(f"window.WebRBookPages.{route_name}()")
                self.assertEqual(page.locator(selector).get_by_text(DISCLOSURE).count(), 0)
                direct_links = page.locator(f'{selector} a[href="{DIRECT}"]')
                self.assertGreaterEqual(direct_links.count(), 1)
                for link in direct_links.all():
                    self.assertNotIn("sponsored", link.get_attribute("rel").split())
                self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
