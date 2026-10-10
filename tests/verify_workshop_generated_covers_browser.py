"""Controlled Chromium proof; all requests are intercepted, never target/native reads."""
import hashlib
import json
import re
import argparse
import sys
import time
import unittest
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from PIL import Image
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--cdn-root", type=Path, required=True)
parser.add_argument("--app-root", type=Path, required=True)
parser.add_argument("--asset-identity", required=True, help="Exact40SHA controlled delivery identity, never proof of CDN publication")
parser.add_argument("--script-sha256", required=True)
parser.add_argument("--artifacts", type=Path, required=True)
args = parser.parse_args()
if not re.fullmatch(r"[0-9a-f]{40}", args.asset_identity) or not re.fullmatch(r"[0-9a-f]{64}", args.script_sha256):
    parser.error("Exact40SHA identity and exact64SHA script are required")
CDN = args.cdn_root.resolve()
APP = args.app_root.resolve()
COMMIT = args.asset_identity
BASE = "https://cdn.jsdelivr.net/gh/statground/web-r_CDN2@" + COMMIT + "/"
ROOT = CDN / "scripts_go/web_r_go_20260629_1025"
REL = "scripts_v2/workshop/workshop/catalog_20260630_2323_image_fallback.js"
SCRIPT = ROOT / REL
EXPECTED_SCRIPT_SHA = args.script_sha256
ARTIFACTS = args.artifacts.resolve()
if ARTIFACTS.is_relative_to(CDN) or ARTIFACTS.is_relative_to(APP):
    parser.error("Browser proof artifacts must stay outside source repositories")
CARDS = "#div_main article:has(a[href^='/workshop/read/'])"
CONFERENCE = "images/banner/r_conference_external_20261010.webp"
WORKSHOP = "images/banner/r_workshop_external_20261010.webp"
FOREIGN = "https://organizer.test/images/banner/r_workshop_fallback_20260526.svg"
PHOTO = CDN / "images/webr/lecture_ttest.png"
PHOTO_WIDTH = Image.open(PHOTO).width
MEASUREMENTS = []
NETWORK = []
SCREENSHOTS = []


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def fixture_rows():
    return [
        {"uuid": "external-embl", "title": "EMBL symposium on data analysis of high-throughput methodologies", "subtitle": "Shifting Gears: Automation, AI, and High-Throughput Methodologies", "summary": "A controlled presentation fixture for an external research event.", "description": "Controlled event description.\nOrganizer links stay outside the Web-R application.", "venue": "Heidelberg, Germany", "starts_at": "2026-12-02 09:00:00", "source_id": "posit", "source_name": "Posit Community", "cover_image_url": BASE + "images/banner/r_workshop_fallback_20260526.svg", "external": True, "active": True, "status": "published", "registration_mode": "external", "canonical_url": "https://organizer.test/embl", "is_new": True},
        {"uuid": "external-user", "title": "useR! 2026", "subtitle": "useR! conference", "summary": "Research talks and community exchange.", "description": "Controlled conference description.", "venue": "Warsaw, Poland", "starts_at": "2026-07-06 09:00:00", "ends_at": "2026-07-09 23:59:00", "source_id": "rproject", "source_name": "R Project conferences", "cover_image_url": BASE + "images/banner/r_conference_fallback_20260526.svg", "external": True, "active": True, "status": "published", "registration_mode": "external", "canonical_url": "https://organizer.test/user"},
        {"uuid": "organizer-photo", "title": "Organizer supplied cover remains unchanged", "summary": "This controlled cover URL intentionally shares a legacy fallback basename on a foreign host.", "description": "Organizer content.", "venue": "Online", "source_id": "posit", "source_name": "Organizer", "cover_image_url": FOREIGN, "external": True, "active": True, "status": "published", "registration_mode": "external"},
        {"uuid": "empty-cover", "title": "R community workshop", "subtitle": "Open source research and learning", "venue": "Online", "source_id": "posit", "source_name": "Posit Community", "cover_image_url": "", "external": True, "active": True, "status": "published", "registration_mode": "external"},
    ]


def rect(page, selector):
    return page.locator(selector).evaluate("node => { const r=node.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}; }")


class CoversBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if sha(SCRIPT) != EXPECTED_SCRIPT_SHA:
            raise AssertionError("Workshop script changed before controlled proof")
        ARTIFACTS.mkdir(exist_ok=True)
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def render(self, *, width=1440, mode="list", item=None, held=False,
               fail_primary=False, fail_installed=False, fail_foreign=False, installed_script=False,
               partial=False, reduced_motion="no-preference"):
        page = self.browser.new_page(viewport={"width": width, "height": 1100}, reduced_motion=reduced_motion)
        page.set_default_timeout(4000)
        self.addCleanup(page.close)
        errors, unknown, calls, held_routes = [], [], [], []
        page.on("pageerror", lambda error: errors.append(str(error)))
        rows = fixture_rows()
        payload = {"ok": True, "complete": not partial, "partial": partial, "workshops": rows,
                   "is_admin": False, "is_logged_in": False, "current_user_uuid": ""}
        if partial:
            payload["unavailable_sections"] = ["collected_events"]
        target = item or rows[0]
        page_path = "/workshop/" if mode == "list" else "/workshop/read/?uuid=" + target["uuid"]
        script_url = ("https://workshop.test/_webr/assets/" + COMMIT + "/" if installed_script else BASE) + "scripts_go/web_r_go_20260629_1025/" + REL
        globals_value = {"mode": mode, "uuid": target["uuid"] if mode == "read" else ""}
        style_text = (APP / "templates/catalog_loading.html").read_text()
        critical_css = re.search(r"<style\b[^>]*>(.*?)</style>", style_text, re.S).group(1)
        fallback_template = (APP / "templates/cdn_fallback.html").read_text()
        fallback_markup = re.search(r"(<script\b.*?</script>)", fallback_template, re.S).group(1)
        fallback_markup = fallback_markup.replace("{{.CSPNonce}}", "controlled-offline-nonce")
        fallback_markup = re.sub(r'\{\{cdnGo "[^"]+"\}\}', BASE + "scripts_go/web_r_go_20260629_1025/vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js", fallback_markup)
        doc = ('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
               '<link rel="stylesheet" href="' + BASE + 'scripts_go/web_r_go_20260629_1025/styles_v2/common/public_tailwind_20260905.min.css">'
               '<style>' + critical_css + '</style></head><body><div id="div_main"></div>'
               '<script>window.__webr_globals__=' + json.dumps(globals_value) + ';</script>' + fallback_markup
               + '<script src="' + BASE + 'scripts_go/web_r_go_20260629_1025/vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"></script>'
               '<script src="' + script_url + '"></script><script>set_main();</script></body></html>')

        def respond(route):
            url = route.request.url
            parsed = urlsplit(url)
            calls.append({"url": url, "method": route.request.method, "resource": route.request.resource_type})
            if parsed.hostname == "workshop.test" and parsed.path == urlsplit(page_path).path:
                route.fulfill(content_type="text/html", body=doc)
            elif parsed.hostname == "workshop.test" and parsed.path == "/workshop/ajax_list/":
                if held:
                    held_routes.append(route)
                else:
                    route.fulfill(content_type="application/json", body=json.dumps(payload))
            elif parsed.hostname == "workshop.test" and parsed.path == "/workshop/ajax_read/":
                route.fulfill(content_type="application/json", body=json.dumps({"ok": True, "workshop": target, "posts": [], "is_admin": False, "is_logged_in": False, "current_user_uuid": ""}))
            elif url == FOREIGN:
                if fail_foreign:
                    route.abort("failed")
                else:
                    route.fulfill(content_type="image/png", body=PHOTO.read_bytes())
            elif url == script_url:
                route.fulfill(content_type="application/javascript", body=SCRIPT.read_bytes())
            elif url.startswith(BASE) or url.startswith("https://workshop.test/_webr/assets/" + COMMIT + "/"):
                rel = url[len(BASE):] if url.startswith(BASE) else parsed.path.split("/" + COMMIT + "/", 1)[1]
                if rel in (CONFERENCE, WORKSHOP):
                    if (url.startswith(BASE) and fail_primary) or (not url.startswith(BASE) and fail_installed):
                        route.abort("failed")
                    else:
                        route.fulfill(content_type="image/webp", body=(CDN / rel).read_bytes())
                elif rel == "scripts_go/web_r_go_20260629_1025/styles_v2/common/public_tailwind_20260905.min.css":
                    route.fulfill(content_type="text/css", body=(CDN / rel).read_bytes())
                elif rel == "scripts_go/web_r_go_20260629_1025/vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js":
                    route.fulfill(content_type="application/javascript", body=(CDN / rel).read_bytes())
                else:
                    unknown.append(url)
                    route.abort("blockedbyclient")
            else:
                unknown.append(url)
                route.abort("blockedbyclient")

        page.route("**/*", respond)
        page.goto("https://workshop.test" + page_path, wait_until="domcontentloaded")
        self.addCleanup(lambda: self.assertEqual(errors, [], "Browser JavaScript exceptions"))
        self.addCleanup(lambda: self.assertEqual(unknown, [], "Unexpected offline route"))
        NETWORK.append({"test": self.id(), "width": width, "mode": mode, "calls": calls, "unknown": unknown, "page_errors": errors})
        return page, calls, held_routes, payload

    def screenshot(self, page, label):
        path = ARTIFACTS / (label + ".png")
        page.screenshot(path=str(path), full_page=True, animations="disabled")
        SCREENSHOTS.append({"path": str(path), "sha256": sha(path), "bytes": path.stat().st_size})

    def assert_loaded_images(self, page, selector):
        page.wait_for_function("selector => Array.from(document.querySelectorAll(selector)).every(n=>n.complete&&n.naturalWidth>0)", arg=selector)

    def assert_generated_ratio(self, page, selector):
        values = page.locator(selector).evaluate("n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {width:r.width,height:r.height,naturalWidth:n.naturalWidth,naturalHeight:n.naturalHeight,objectFit:s.objectFit,src:n.src};}")
        self.assertEqual((values["naturalWidth"], values["naturalHeight"]), (1672, 941))
        self.assertLess(abs(values["width"] / values["height"] - 1672 / 941), 0.002)
        MEASUREMENTS.append({"test": self.id(), "image": values})

    def test_list_desktop_and_mobile_artwork_badges_and_foreign_cover_preservation(self):
        for width, expected in ((1440, 4), (390, 3)):
            with self.subTest(width=width):
                page, calls, _, _ = self.render(width=width)
                page.locator("[data-workshop-count]").wait_for()
                self.assertEqual(page.locator(CARDS).count(), expected)
                self.assert_loaded_images(page, CARDS + " img")
                for i in (0, 1):
                    card = page.locator(CARDS).nth(i)
                    self.assert_generated_ratio(page, CARDS + f":nth-child({i + 1}) img")
                    frame = card.locator("[data-workshop-cover-frame]").bounding_box()
                    badges = card.locator("[data-workshop-cover-badges]").bounding_box()
                    self.assertGreaterEqual(badges["y"] + 0.01, frame["y"] + frame["height"])
                    self.assertEqual(card.locator("[data-workshop-cover-frame] span").count(), 0)
                    self.assertGreaterEqual(card.bounding_box()["height"], 570)
                    self.assertTrue(card.locator("img").get_attribute("src").startswith("/_webr/assets/" + COMMIT + "/"))
                    price = card.locator("div.mt-auto > span").first
                    self.assertEqual(price.evaluate("n=>getComputedStyle(n).whiteSpace"), "nowrap")
                    self.assertEqual(price.evaluate("n=>getComputedStyle(n).flexShrink"), "0")
                self.assertEqual(page.locator(CARDS).nth(2).locator("img").get_attribute("src"), FOREIGN)
                self.assertEqual(page.locator(CARDS).nth(2).locator("img").evaluate("n=>n.naturalWidth"), PHOTO_WIDTH)
                self.assertEqual(page.get_by_role("alert").count(), 0)
                self.assertEqual(page.locator("[data-workshop-list-status]").count(), 0)
                self.assertLessEqual(page.evaluate("document.documentElement.scrollWidth"), width)
                self.assertEqual(len([c for c in calls if c["url"].endswith("/workshop/ajax_list/")]), 1)
                self.assertEqual(len([c for c in calls if c["resource"] == "image" and c["url"].startswith(BASE)]), 0)
                self.screenshot(page, f"list-loaded-{width}")

    def test_loading_to_loaded_grid_keeps_cover_and_card_geometry(self):
        for width, n in ((1440, 4), (390, 3)):
            with self.subTest(width=width):
                page, calls, held, payload = self.render(width=width, held=True)
                page.locator("[data-workshop-catalog-progress]").wait_for()
                self.assertEqual(page.locator("[data-workshop-count], [data-workshop-empty]").count(), 0)
                self.assertEqual(page.locator(".webr-catalog-placeholder-card").count(), n)
                before = [rect(page, ".webr-catalog-placeholder-card:nth-child(" + str(i + 1) + ")") for i in range(n)]
                covers = [rect(page, ".webr-catalog-placeholder-card:nth-child(" + str(i + 1) + ") .webr-catalog-placeholder-cover") for i in range(n)]
                self.screenshot(page, f"list-pending-{width}")
                held.pop().fulfill(content_type="application/json", body=json.dumps(payload))
                page.locator("[data-workshop-count]").wait_for()
                self.assert_loaded_images(page, CARDS + " img")
                after = [rect(page, CARDS + ":nth-child(" + str(i + 1) + ")") for i in range(n)]
                after_covers = [rect(page, CARDS + ":nth-child(" + str(i + 1) + ") [data-workshop-cover-frame]") for i in range(n)]
                for i in range(n):
                    for field in ("x", "y", "width"):
                        self.assertLessEqual(abs(before[i][field] - after[i][field]), 1.0, (width, i, field))
                        self.assertLessEqual(abs(covers[i][field] - after_covers[i][field]), 1.0, (width, i, "cover", field))
                    self.assertLessEqual(abs(covers[i]["height"] - after_covers[i]["height"]), 1.0)
                    self.assertGreaterEqual(after[i]["height"], before[i]["height"])
                MEASUREMENTS.append({"test": self.id(), "width": width, "pending_cards": before, "loaded_cards": after, "pending_covers": covers, "loaded_covers": after_covers})
                self.assertEqual(len([c for c in calls if c["url"].endswith("/workshop/ajax_list/")]), 1)

    def test_generated_detail_desktop_and_mobile_is_uncropped_and_data_preserved(self):
        rows = fixture_rows()
        for width in (1440, 390):
            for i in (0, 1):
                with self.subTest(width=width, kind=i):
                    page, calls, _, _ = self.render(width=width, mode="read", item=rows[i])
                    page.get_by_role("heading", name=rows[i]["title"], exact=True).wait_for()
                    selector = "#div_main img[alt='" + rows[i]["title"] + "']"
                    self.assert_loaded_images(page, selector)
                    self.assert_generated_ratio(page, selector)
                    self.assertEqual(page.get_by_role("link", name="원문 보기", exact=True).get_attribute("href"), rows[i]["canonical_url"])
                    self.assertIn(rows[i]["venue"], page.locator("#div_main").inner_text())
                    self.assertLessEqual(page.evaluate("document.documentElement.scrollWidth"), width)
                    self.assertEqual(len([c for c in calls if c["url"].endswith("/workshop/ajax_read/")]), 1)
                    self.screenshot(page, f"detail-generated-{i}-{width}")

    def test_detail_foreign_same_basename_preserves_organizer_asset(self):
        page, _, _, _ = self.render(mode="read", item=fixture_rows()[2])
        selector = "#div_main img[alt='Organizer supplied cover remains unchanged']"
        self.assert_loaded_images(page, selector)
        self.assertEqual(page.locator(selector).get_attribute("src"), FOREIGN)
        self.assertEqual(page.locator(selector).evaluate("n=>n.style.aspectRatio"), "")
        self.screenshot(page, "detail-organizer-preserved-1440")

    def test_foreign_organizer_image_failure_recovers_once_to_same_origin(self):
        row = fixture_rows()[2]
        page, calls, _, _ = self.render(mode="read", item=row, fail_foreign=True)
        selector = "#div_main img[alt='" + row["title"] + "']"
        self.assert_loaded_images(page, selector)
        image_calls = [c for c in calls if c["resource"] == "image"]
        self.assertEqual([c["url"] for c in image_calls], [FOREIGN, "https://workshop.test/_webr/assets/" + COMMIT + "/" + WORKSHOP])
        self.assertEqual(page.locator(selector).get_attribute("data-webr-fallback-applied"), "1")
        self.assert_generated_ratio(page, selector)
        self.screenshot(page, "detail-organizer-to-same-origin-recovered-1440")

    def test_second_image_failure_stops_after_one_recovery_without_data_retry(self):
        row = fixture_rows()[2]
        page, calls, _, _ = self.render(mode="read", item=row, fail_foreign=True, fail_installed=True)
        selector = "#div_main img[alt='" + row["title"] + "']"
        page.wait_for_function("selector => {const n=document.querySelector(selector);return n&&n.style.display==='none';}", arg=selector)
        first_len = len(calls)
        page.wait_for_timeout(250)
        self.assertEqual(len(calls), first_len)
        image_calls = [c for c in calls if c["resource"] == "image"]
        self.assertEqual([c["url"] for c in image_calls], [FOREIGN, "https://workshop.test/_webr/assets/" + COMMIT + "/" + WORKSHOP])
        self.assertEqual(len([c for c in calls if c["url"].endswith("/workshop/ajax_read/")]), 1)
        self.assertTrue(page.get_by_role("heading", name=row["title"], exact=True).is_visible())
        self.screenshot(page, "detail-image-failure-bounded-1440")

    def test_initial_same_origin_image_failure_never_retries_same_address_or_uses_cdn(self):
        row = fixture_rows()[0]
        page, calls, _, _ = self.render(mode="read", item=row, fail_installed=True)
        selector = "#div_main img[alt='" + row["title"] + "']"
        page.wait_for_function("selector => {const n=document.querySelector(selector);return n&&n.style.display==='none';}", arg=selector)
        self.assertEqual([c["url"] for c in calls if c["resource"] == "image"], ["https://workshop.test/_webr/assets/" + COMMIT + "/" + WORKSHOP])
        self.assertEqual(page.locator(selector).get_attribute("data-webr-fallback-applied"), "1")
        self.assertTrue(page.get_by_role("heading", name=row["title"], exact=True).is_visible())

    def test_installed_script_selects_same_generation_artwork_without_external_image_request(self):
        page, calls, _, _ = self.render(width=390, installed_script=True)
        page.locator("[data-workshop-count]").wait_for()
        self.assert_loaded_images(page, CARDS + " img")
        self.assertEqual(page.locator(CARDS).nth(0).locator("img").get_attribute("src"), "/_webr/assets/" + COMMIT + "/" + WORKSHOP)
        self.assertEqual(page.locator(CARDS).nth(1).locator("img").get_attribute("src"), "/_webr/assets/" + COMMIT + "/" + CONFERENCE)
        self.assertEqual(len([c for c in calls if c["resource"] == "image" and c["url"].startswith(BASE)]), 0)

    def test_real_partial_envelope_keeps_warning_and_never_claims_complete_count(self):
        page, _, _, _ = self.render(partial=True)
        page.locator("[data-workshop-list-status='partial']").wait_for()
        self.assertEqual(page.locator("[data-workshop-count]").count(), 0)
        self.assertIn("수집된 워크샵 정보를 일시적으로 불러오지 못했습니다.", page.locator("[data-workshop-list-status]").inner_text())
        self.assertEqual(page.locator(CARDS).count(), 4)

    def test_reduced_motion_placeholder_stops_shimmer_and_keeps_assistive_loading(self):
        page, _, held, payload = self.render(width=390, held=True, reduced_motion="reduce")
        page.locator("[data-workshop-catalog-progress]").wait_for()
        self.assertEqual(page.locator("[data-workshop-catalog-progress]").get_attribute("aria-hidden"), "true")
        self.assertEqual(page.locator(".webr-catalog-placeholder-cover").first.evaluate("n=>getComputedStyle(n,'::after').animationName"), "none")
        status = page.locator(".webr-catalog-assistive-status")
        self.assertEqual(status.get_attribute("role"), "status")
        self.assertEqual(status.evaluate("n=>Math.round(n.getBoundingClientRect().width)"), 1)
        self.assertEqual(page.locator("[data-workshop-count], [data-workshop-empty]").count(), 0)
        held.pop().fulfill(content_type="application/json", body=json.dumps(payload))
        page.locator("[data-workshop-count]").wait_for()


class RecordingResult(unittest.TextTestResult):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.passed = []

    def addSuccess(self, test):
        self.passed.append(test.id())
        super().addSuccess(test)


if __name__ == "__main__":
    start = time.monotonic()
    result = unittest.TextTestRunner(verbosity=2, resultclass=RecordingResult).run(unittest.defaultTestLoader.loadTestsFromTestCase(CoversBrowserTests))
    sources = [SCRIPT, APP / "templates/catalog_loading.html", APP / "templates/cdn_fallback.html", ROOT / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js", ROOT / "styles_v2/common/public_tailwind_20260905.min.css", CDN / WORKSHOP, CDN / CONFERENCE, PHOTO, Path(__file__)]
    proof = {"schema": "webr.workshop.generated-covers.controlled-browser.v3", "at": datetime.now(timezone.utc).isoformat(), "controlled_delivery_identity": COMMIT, "immutable_cdn_publication_verified": False, "script_sha256": EXPECTED_SCRIPT_SHA, "controlled": True, "all_requests_intercepted": True, "external_native_target_runtime_calls": 0, "fixture_identity": "Public guest DTOs; no session, no rights assertion", "runtime_host_verified": False, "tests_run": result.testsRun, "passed": result.passed, "failures": [{"test": str(t), "traceback": e} for t, e in result.failures], "errors": [{"test": str(t), "traceback": e} for t, e in result.errors], "elapsed_seconds": time.monotonic() - start, "browser_engine": "Chromium through installed Playwright", "sources": [{"path": str(p), "sha256": sha(p), "bytes": p.stat().st_size} for p in sources], "screenshots": SCREENSHOTS, "measurements": MEASUREMENTS, "requests": NETWORK, "limitations": ["Exact40SHA delivery identity is a controlled fixture and does not claim that Git commit contains current proposed bytes", "Controlled route replay is not actual Workshop source availability or admin authorization", "A foreign organizer cover fixture uses unchanged existing PNG bytes to prove URL preservation", "Loading and loaded geometry use exact app critical CSS and actual vendor utility CSS, without the production site header"]}
    path = ARTIFACTS / ("proof-green.json" if result.wasSuccessful() else "proof-red.json")
    if path.exists():
        path = ARTIFACTS / (path.stem + "-" + str(time.time_ns()) + ".json")
    path.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"proof": str(path), "sha256": sha(path), "tests_run": result.testsRun, "passed": len(result.passed), "failures": len(result.failures), "errors": len(result.errors)}))
    sys.exit(not result.wasSuccessful())
