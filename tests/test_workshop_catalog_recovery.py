import json
import os
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1] / "scripts_go/web_r_go_20260629_1025"
SCRIPT = ROOT / "scripts_v2/workshop/workshop/catalog_20260630_2323_image_fallback.js"
ROWS = [{"uuid": f"public-workshop-{i}", "title": f"Public R workshop {i}",
         "active": True, "status": "published", "registration_mode": "closed"}
        for i in range(32)]
COMPLETE = {"ok": True, "complete": True, "workshops": ROWS,
            "is_admin": False, "is_logged_in": False, "current_user_uuid": ""}
CARDS = "#div_main article:has(a[href^='/workshop/read/'])"


class WorkshopCatalogRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, scenarios, *, width=1440):
        page = self.browser.new_page(viewport={"width": width, "height": 1000})
        page.set_default_timeout(3000)
        self.addCleanup(page.close)
        page_errors, calls = [], []
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        pending = list(scenarios)

        def respond(route):
            path = urlsplit(route.request.url).path
            if path == "/workshop/":
                route.fulfill(status=200, content_type="text/html",
                              body='<html lang="ko"><div id="div_main"></div></html>')
            elif path == "/workshop/ajax_list/":
                calls.append({"path": path, "method": route.request.method})
                scenario = pending.pop(0) if len(pending) > 1 else pending[0]
                if scenario.get("network"):
                    route.abort("failed")
                else:
                    route.fulfill(status=scenario.get("status", 200), content_type="application/json",
                                  body=json.dumps(scenario["body"]))
            else:
                route.abort()

        page.route("**/*", respond)
        page.goto("https://workshop.test/workshop/")
        page.add_style_tag(path=str(ROOT / "styles_v2/common/public_tailwind_20260905.min.css"))
        page.add_script_tag(path=str(ROOT / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"))
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate("set_main()")
        return page, calls, page_errors

    def screenshot(self, page, label):
        output = os.environ.get("WEBR_WORKSHOP_TEST_ARTIFACTS")
        if output:
            directory = Path(output)
            directory.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(directory / (label + ".png")), full_page=True)

    def assert_failed_without_empty(self, page):
        page.get_by_role("button", name="다시 시도", exact=True).wait_for(state="visible")
        self.assertEqual(page.locator("[data-workshop-count], [data-workshop-empty]").count(), 0)
        self.assertNotIn("0개의 워크샵", page.locator("#div_main").inner_text())
        self.assertNotIn("등록된 워크샵이 없습니다.", page.locator("#div_main").inner_text())
        self.assertTrue(page.locator("input[placeholder='검색어']").is_visible())
        self.assertEqual(page.get_by_role("alert").count(), 1)

    def assert_full_list(self, page, expected_cards=12):
        page.locator("[data-workshop-count]").wait_for()
        self.assertEqual(page.locator("[data-workshop-count]").inner_text(), "32개의 워크샵이 검색되었습니다.")
        self.assertEqual(page.locator(CARDS).count(), expected_cards)
        self.assertEqual(page.get_by_role("alert").count(), 0)
        self.assertEqual(page.locator("[data-workshop-empty]").count(), 0)

    def test_network_failure_keeps_controls_and_manual_retry_recovers_real_count_and_cards(self):
        page, calls, errors = self.render([{"network": True}, {"body": COMPLETE}])
        self.assert_failed_without_empty(page)
        self.screenshot(page, "network-failure")
        page.get_by_role("button", name="다시 시도", exact=True).click()
        self.assert_full_list(page)
        self.screenshot(page, "network-recovered")
        self.assertEqual(calls, [{"path": "/workshop/ajax_list/", "method": "POST"}] * 2)
        self.assertEqual(errors, [])

    def test_503_valid_looking_payload_cannot_be_treated_as_success(self):
        page, calls, errors = self.render([{"status": 503, "body": COMPLETE}, {"body": COMPLETE}])
        self.assert_failed_without_empty(page)
        self.assertEqual(page.locator(CARDS).count(), 0)
        self.screenshot(page, "503-failure")
        page.get_by_role("button", name="다시 시도", exact=True).click()
        self.assert_full_list(page)
        self.assertEqual(len(calls), 2)
        self.assertEqual(errors, [])

    def test_unavailable_or_malformed_empty_payload_does_not_claim_zero(self):
        for payload in [{"ok": False, "workshops": []}, {"ok": True, "complete": True},
                        {"ok": True, "complete": False, "workshops": []},
                        {"ok": True, "complete": True, "partial": True, "workshops": []}]:
            with self.subTest(payload=payload):
                page, calls, errors = self.render([{"body": payload}, {"body": COMPLETE}])
                self.assert_failed_without_empty(page)
                page.get_by_role("button", name="다시 시도", exact=True).click()
                self.assert_full_list(page)
                self.assertEqual(len(calls), 2)
                self.assertEqual(errors, [])

    def test_complete_empty_remains_authoritative_zero(self):
        page, calls, errors = self.render([{"body": {**COMPLETE, "workshops": []}}])
        page.locator("[data-workshop-empty='complete']").wait_for()
        self.assertEqual(page.locator("[data-workshop-count]").inner_text(), "0개의 워크샵이 검색되었습니다.")
        self.assertEqual(page.locator(CARDS).count(), 0)
        self.assertEqual(page.get_by_role("alert").count(), 0)
        self.assertEqual(page.get_by_role("button", name="다시 시도", exact=True).count(), 0)
        self.screenshot(page, "complete-empty")
        self.assertEqual(len(calls), 1)
        self.assertEqual(errors, [])

    def test_failed_refresh_preserves_cards_filters_and_paging_without_current_count_claim(self):
        page, calls, errors = self.render([{"body": COMPLETE}, {"network": True}, {"body": COMPLETE}])
        self.assert_full_list(page)
        page.evaluate("set_main()")
        self.assert_failed_without_empty(page)
        self.assertEqual(page.locator(CARDS).count(), 12)
        self.assertEqual(page.locator("nav[aria-label='워크샵 목록 페이지'] p").count(), 0)
        page.locator("nav[aria-label='워크샵 목록 페이지']").get_by_role("button", name="다음", exact=True).click()
        self.assertEqual(page.locator(CARDS).count(), 12)
        self.assertEqual(page.locator("nav button[aria-current='page']").inner_text(), "2")
        page.locator("input[placeholder='검색어']").fill("Public R workshop 31")
        self.assertEqual(page.locator(CARDS).count(), 1)
        self.assertEqual(page.locator(CARDS + " h2").inner_text(), "Public R workshop 31")
        self.screenshot(page, "last-good-failure-filtered")
        page.locator("input[placeholder='검색어']").fill("")
        page.get_by_role("button", name="다시 시도", exact=True).click()
        self.assert_full_list(page)
        self.assertEqual(len(calls), 3)
        self.assertEqual(errors, [])

    def test_previous_healthy_empty_cannot_survive_failure_as_current_empty_claim(self):
        page, _, errors = self.render([{"body": {**COMPLETE, "workshops": []}}, {"network": True}])
        page.locator("[data-workshop-empty]").wait_for()
        page.evaluate("set_main()")
        self.assert_failed_without_empty(page)
        self.assertEqual(errors, [])

    def test_partial_rows_are_usable_without_complete_inventory_count(self):
        page, _, errors = self.render([{"body": {**COMPLETE, "complete": False,
                                                "workshops": ROWS[:4], "unavailable_sections": ["collected"]}}], width=390)
        page.locator("[data-workshop-list-status='partial']").wait_for()
        self.assertEqual(page.locator(CARDS).count(), 3)
        self.assertEqual(page.locator("[data-workshop-count], [data-workshop-empty]").count(), 0)
        self.assertEqual(page.get_by_role("alert").count(), 0)
        self.assertTrue(page.locator("input[placeholder='검색어']").is_visible())
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
