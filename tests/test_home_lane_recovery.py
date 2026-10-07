import json
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts_go/web_r_go_20260629_1025/scripts_v2/index"
KEYS = ["rcommunity", "community", "books", "packages", "ecosystem", "workshops", "notices", "lectures", "youtube", "activity"]
BOOK = {"kind": "book", "title": "Current R book", "href": "/book/d/9781484258286/", "published_at": "2026-09-28"}
VIDEO = {"title": "Current R video", "href": "/workshop/youtube/read/11111111-1111-4111-8111-111111111111/", "published_at": "2026-09-29"}
LECTURE = {"title": "Healthy R lecture", "href": "/workshop/lecture/42/", "published_at": "2026-09-27"}


def summary(*, books=None, youtube=None, lectures=None, unavailable=None):
    sections = {key: [] for key in KEYS}
    sections.update({"books": books or [], "youtube": youtube or [], "lectures": lectures or [],
                     "packages": [{"title": "Healthy R package", "href": "/r-ecosystem/packages/stats/"}]})
    return {"ok": True, "complete": not unavailable, "sections": sections,
            "statistics": {"cnt_member": 8160, "cnt_visitor": 1, "cnt_pageview": 2},
            "unavailable_sections": unavailable or [], "stale_sections": [],
            "book_visibility_revision": "current-server-revision"}


class HomeLaneRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def assert_global_controls_absent(self, page):
        self.assertEqual(page.locator(".webr-home-compact__status, .webr-home-compact__summary-retry").count(), 0)
        self.assertEqual(page.get_by_role("button", name="최신 자료 다시 확인", exact=True).count(), 0)

    def render(self, live, *, cached=None, hold=False, hold_notices=False, notices=None, deadline=None, grace_ms=None, status=200, real_retry=False, manual_only=True):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.add_init_script("window.__liveSummary=" + json.dumps(live) + ";window.__holdSummary=" + json.dumps(hold) + ";")
        page.add_init_script("window.__holdNotices=" + json.dumps(hold_notices) + ";")
        page.add_init_script("window.__liveNotices=" + json.dumps(notices or {}) + ";")
        page.add_init_script("window.__status=" + str(status) + ";window.__initialGraceMs=" + json.dumps(grace_ms) + ";")
        page.add_init_script("window.__realRetry=" + json.dumps(real_retry) + ";")
        page.add_init_script("""
          window.__hidden = false; window.__calls = []; window.__aborts = 0;
          window.__active = 0; window.__maxActive = 0; window.__held = [];
          window.__readyEvents = [];
          document.addEventListener('webr:home-summary-ready', event => window.__readyEvents.push(event.detail));
          Object.defineProperty(document, 'hidden', {get: () => window.__hidden});
          Object.defineProperty(document, 'visibilityState', {get: () => window.__hidden ? 'hidden' : 'visible'});
          const realNow = Date.now.bind(Date);
          window.__wallOffset = 0;
          Date.now = () => realNow() + window.__wallOffset;
          const timer = window.setTimeout.bind(window);
          window.setTimeout = (fn, ms, ...args) => fn.name === 'expirePendingLaneGrace' && (window.__initialGraceMs || window.__deadline)
            ? timer(() => { window.__wallOffset = 31000; fn(...args); }, window.__initialGraceMs || window.__deadline)
            : timer(fn,
            fn.name === 'expireInitialSummaryGrace' ? (window.__initialGraceMs || window.__deadline || ms) :
              ms === 12000 ? (window.__deadline || ms) :
              window.__manualOnly && ms >= 800 ? 60000 :
              !window.__realRetry && ms >= 800 && ms <= 3000 ? 1 :
              !window.__realRetry && ms > 3000 && ms < 20000 ? 70 : ms, ...args);
          window.fetch = function(url, init = {}) {
            const path = new URL(url, location.href).pathname;
            if (path === '/ajax_index_notice/') return window.__holdNotices
              ? new Promise(() => {}) : Promise.resolve(new Response(JSON.stringify(window.__liveNotices), {status: 200}));
            if (path !== '/homepage/content-summary/') throw new Error('unexpected request ' + path);
            window.__calls.push({cache: init.cache, method: init.method, url: String(url)});
            window.__maxActive = Math.max(window.__maxActive, ++window.__active);
            if (init.signal) init.signal.addEventListener('abort', () => ++window.__aborts, {once: true});
            if (window.__holdSummary) return new Promise(resolve => {
              window.__held.push(body => {--window.__active; resolve(new Response(JSON.stringify(body), {status: 200}));});
            });
            --window.__active;
            return Promise.resolve(new Response(JSON.stringify(window.__liveSummary), {status: window.__status || 200}));
          };
        """)
        if deadline:
            page.add_init_script("window.__manualOnly=" + json.dumps(manual_only) + ";window.__deadline=" + str(deadline) + ";")
        if cached:
            page.add_init_script("localStorage.setItem('webr.home.public-summary.v1', JSON.stringify({schema:1,stored_at:Date.now(),payload:" + json.dumps(cached) + "}));")
        page.route("**/*", lambda route: route.fulfill(status=200, content_type="text/html", body='<div id="div_main"></div>') if route.request.url == "https://home.test/" else route.abort())
        page.goto("https://home.test/")
        page.add_style_tag(path=str(ROOT / "scripts_go/web_r_go_20260629_1025/styles_v2/index/home_compact_portal_20260729_1530.css"))
        page.add_script_tag(path=str(SCRIPTS / "set_main_compact_portal_20260930_lane_recovery.js"))
        page.add_script_tag(path=str(SCRIPTS / "home_summary_terminal_guard_20260828_2306.js"))
        page.evaluate("window.set_main()")
        self.assert_global_controls_absent(page)
        return page, errors

    def test_delayed_first_response_keeps_quiet_placeholders_until_real_cards_arrive(self):
        live = summary(books=[BOOK], youtube=[VIDEO])
        for key in ["rcommunity", "community", "packages", "ecosystem", "workshops"]:
            live["sections"][key] = [{"title": "Current " + key, "href": "/community/", "published_at": "2026-10-05"}]
        page, errors = self.render(live, hold=True, hold_notices=True)
        page.wait_for_function("window.__held.length === 1")
        # The harness advances the old 2.5-second settlement timer. This checks
        # the actual bundle/guard interaction while the source is still pending.
        page.wait_for_timeout(100)
        portal = page.locator("#webr-home-portal")
        self.assertNotIn("전체 보기", portal.inner_text())
        self.assertNotIn("공지사항 확인 중", portal.inner_text())
        self.assertEqual(portal.locator("[data-home-category] .webr-home-compact__skeleton[aria-hidden=true]").count(), 6)
        self.assert_global_controls_absent(page)
        self.assertEqual(portal.locator("[data-home-category] .webr-home-compact__more").count(), 6)
        page.evaluate("window.__held.shift()(window.__liveSummary)")
        page.get_by_role("link", name="Current R book", exact=False).wait_for()
        page.get_by_role("link", name="Current rcommunity", exact=False).wait_for()
        self.assertEqual(portal.locator("[data-home-category] .webr-home-compact__skeleton").count(), 0)
        self.assertEqual(errors, [])

    def test_complete_empty_lanes_stay_quiet_and_unavailable_lanes_report_delay(self):
        page, errors = self.render(summary())
        page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState === 'ready'")
        empty_category = page.locator('[data-home-category="community"] .webr-home-compact__category-body')
        self.assertEqual(empty_category.inner_text(), "")
        media_card = page.locator(".webr-home-compact__rail-card").filter(has=page.get_by_role("heading", name="강의 / YouTube"))
        self.assertEqual(media_card.locator(".webr-home-compact__rail-body").inner_text(), "")
        self.assertNotIn("자료를 불러오지 못했습니다.", page.locator("#webr-home-portal").inner_text())
        self.assertEqual(errors, [])

        unavailable_page, unavailable_errors = self.render(summary(unavailable=["community", "lectures", "youtube"]), grace_ms=200)
        unavailable_page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState === 'partial'")
        unavailable_page.locator('[data-home-category="community"] .webr-home-compact__lane-error').wait_for()
        self.assertIn("자료를 불러오지 못했습니다.", unavailable_page.locator('[data-home-category="community"]').inner_text())
        unavailable_media = unavailable_page.locator(".webr-home-compact__rail-card").filter(has=unavailable_page.get_by_role("heading", name="강의 / YouTube"))
        self.assertIn("자료를 불러오지 못했습니다.", unavailable_media.locator(".webr-home-compact__rail-body").inner_text())
        self.assert_global_controls_absent(unavailable_page)
        self.assertNotIn("전체 보기", unavailable_page.locator('[data-home-category="community"]').inner_text())
        self.assertEqual(unavailable_errors, [])

    def test_summary_timeout_preserves_independently_verified_notice(self):
        notices = {"0": {"uuid": "11111111-1111-4111-8111-111111111111",
                         "title": "Verified current notice", "created_at": "2026-10-05"}}
        page, errors = self.render(summary(), hold=True, notices=notices, deadline=200)
        page.get_by_role("link", name="Verified current notice", exact=False).wait_for()
        page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState === 'fallback'")
        self.assert_global_controls_absent(page)
        self.assertIn("Verified current notice", page.locator("body").inner_text())
        self.assertEqual(errors, [])

    def test_unavailable_summary_reports_delay_and_recovers_without_erasing_healthy_cards(self):
        unavailable = summary(unavailable=KEYS[:6] + ["lectures", "youtube", "activity"])
        unavailable["sections"] = {key: [] for key in KEYS}
        page, errors = self.render(unavailable, grace_ms=200)
        page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState === 'fallback'")
        self.assert_global_controls_absent(page)
        self.assertIn("자료를 불러오지 못했습니다.", page.locator('[data-home-category="community"]').inner_text())
        page.evaluate("window.__status=503")
        page.wait_for_function("window.__calls.length >= 4")
        self.assert_global_controls_absent(page)

        page.evaluate("window.__status=200;window.__liveSummary=" + json.dumps(summary(unavailable=["books", "youtube"])))
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        self.assert_global_controls_absent(page)
        calls = page.evaluate("window.__calls.length")
        page.evaluate("window.__status=503")
        page.wait_for_function("window.__calls.length > " + str(calls))
        self.assertIn("Healthy R package", page.locator("body").inner_text())
        self.assert_global_controls_absent(page)
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])

    def test_quick_initial_failures_and_empty_partial_stay_quiet_until_prepared_cards(self):
        page, errors = self.render(summary(), status=503, grace_ms=1000)
        page.wait_for_function("window.__calls.length >= 2")
        self.assert_global_controls_absent(page)
        self.assertEqual(page.locator('[data-home-category] .webr-home-compact__skeleton').count(), 6)
        self.assertEqual(page.evaluate("window.__readyEvents.length"), 0)
        unavailable = summary(unavailable=KEYS[:6] + ["lectures", "youtube", "activity"])
        unavailable["sections"] = {key: [] for key in KEYS}
        page.evaluate("window.__status=200;window.__liveSummary=" + json.dumps(unavailable))
        calls = page.evaluate("window.__calls.length")
        page.wait_for_function("window.__calls.length > " + str(calls))
        self.assert_global_controls_absent(page)
        self.assertEqual(page.locator('[data-home-category] .webr-home-compact__skeleton').count(), 6)
        self.assertEqual(page.evaluate("window.__readyEvents.length"), 0)
        self.assertIn("8,160", page.locator('[data-stat-key="cnt_member"]').inner_text())
        page.evaluate("window.__liveSummary=" + json.dumps(summary(books=[BOOK], youtube=[VIDEO])))
        page.get_by_role("link", name="Current R book", exact=False).wait_for()
        page.wait_for_timeout(1100)
        self.assertIn("Current R book", page.locator("body").inner_text())
        self.assertNotIn("자료를 불러오지 못했습니다.", page.locator("#webr-home-portal").inner_text())
        self.assertEqual(errors, [])

    def test_persistent_initial_failure_becomes_explicit_when_grace_expires(self):
        page, errors = self.render(summary(), status=503, grace_ms=300)
        page.wait_for_function("window.__calls.length >= 2")
        self.assert_global_controls_absent(page)
        page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState === 'fallback'")
        self.assert_global_controls_absent(page)
        self.assertIn("자료를 불러오지 못했습니다.", page.locator('[data-home-category="community"]').inner_text())
        self.assertEqual(page.locator('[data-home-category] .webr-home-compact__skeleton').count(), 0)
        self.assertGreaterEqual(page.evaluate("window.__readyEvents.length"), 1)
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])

    def test_real_first_retry_recovers_quick_failure_without_a_delay_flash(self):
        page, errors = self.render(summary(), status=503, real_retry=True)
        page.wait_for_function("window.__calls.length === 1")
        page.wait_for_timeout(300)
        self.assert_global_controls_absent(page)
        self.assertEqual(page.locator('[data-home-category] .webr-home-compact__skeleton').count(), 6)
        self.assertEqual(page.evaluate("window.__readyEvents.length"), 0)
        page.evaluate("window.__status=200;window.__liveSummary=" + json.dumps(summary(books=[BOOK], youtube=[VIDEO])))
        page.get_by_role("link", name="Current R book", exact=False).wait_for(timeout=2500)
        self.assertEqual(page.evaluate("window.__calls.length"), 2)
        self.assertNotIn("자료를 불러오지 못했습니다.", page.locator("#webr-home-portal").inner_text())
        self.assertEqual(errors, [])

    def test_complete_server_dto_omits_empty_section_metadata_and_stops_recovery(self):
        page, errors = self.render(summary(unavailable=["books", "youtube"]))
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        current = summary(books=[BOOK], youtube=[VIDEO])
        del current["unavailable_sections"]
        del current["stale_sections"]
        page.evaluate("window.__liveSummary=" + json.dumps(current))
        page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState === 'ready'", timeout=3000)
        self.assert_global_controls_absent(page)
        calls = page.evaluate("window.__calls.length")
        page.wait_for_timeout(150)
        self.assertEqual(page.evaluate("window.__calls.length"), calls)
        self.assertEqual(errors, [])

    def test_complete_response_with_non_array_metadata_keeps_recovery(self):
        page, errors = self.render(summary(unavailable=["books", "youtube"]))
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        malformed = summary(books=[BOOK])
        malformed["stale_sections"] = None
        page.evaluate("window.__liveSummary=" + json.dumps(malformed))
        page.get_by_role("link", name="Current R book", exact=False).wait_for()
        self.assert_global_controls_absent(page)
        self.assertEqual(page.locator("#webr-home-portal").get_attribute("data-home-summary-state"), "partial")
        self.assertEqual(errors, [])

    def test_book_arrival_does_not_stop_later_youtube_and_other_lane_recovery(self):
        page, errors = self.render(summary(unavailable=["books", "youtube", "lectures"]))
        page.wait_for_function("window.__calls.length >= 4")
        page.evaluate("window.__liveSummary = " + json.dumps(summary(books=[BOOK], unavailable=["youtube", "lectures"])))
        page.get_by_role("link", name="Current R book", exact=False).wait_for()
        page.evaluate("window.__liveSummary = " + json.dumps(summary(books=[BOOK], youtube=[VIDEO], lectures=[LECTURE])))
        page.get_by_role("link", name="Current R video", exact=False).wait_for()
        page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState === 'ready'")
        completed = page.evaluate("window.__calls.length")
        page.wait_for_timeout(180)
        self.assertEqual(page.evaluate("window.__calls.length"), completed)
        self.assertGreaterEqual(completed, 6)
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertTrue(page.evaluate("window.__calls.every(call => call.cache === 'no-store' && call.method === 'GET')"))
        self.assertEqual(errors, [])

    def test_fresh_withdrawal_clears_previous_book_video_and_preserves_independent_lane(self):
        page, errors = self.render(summary(books=[BOOK], youtube=[VIDEO], unavailable=["lectures"]))
        page.get_by_role("link", name="Current R video", exact=False).wait_for()
        withdrawn = summary(youtube=[{**VIDEO, "active": False}], lectures=[LECTURE], unavailable=["books"])
        withdrawn["book_visibility_revision"] = ""
        page.evaluate("window.__liveSummary = " + json.dumps(withdrawn))
        page.get_by_role("link", name="Healthy R lecture", exact=False).wait_for()
        self.assertNotIn("Current R book", page.locator("body").inner_text())
        self.assertNotIn("Current R video", page.locator("body").inner_text())
        self.assertIn("Healthy R package", page.locator("body").inner_text())
        self.assertEqual(errors, [])

    def test_saved_visibility_is_never_replayed_during_recovery(self):
        cached = summary(books=[BOOK], youtube=[VIDEO], lectures=[LECTURE])
        page, errors = self.render(summary(unavailable=["books", "youtube"]), cached=cached)
        page.wait_for_function("window.__calls.length >= 4")
        self.assertNotIn("Current R book", page.locator("body").inner_text())
        self.assertNotIn("Current R video", page.locator("body").inner_text())
        self.assertEqual(errors, [])

    def test_hidden_page_cancels_and_late_response_cannot_resurrect_visibility(self):
        live = summary(lectures=[LECTURE])
        page, errors = self.render(live, hold=True)
        page.wait_for_function("window.__held.length === 1")
        page.evaluate("window.__hidden=true;document.dispatchEvent(new Event('visibilitychange'))")
        self.assertEqual(page.evaluate("window.__aborts"), 1)
        page.wait_for_timeout(100)
        self.assertEqual(page.evaluate("window.__calls.length"), 1)
        page.evaluate("window.dispatchEvent(new Event('pagehide'));window.__hidden=false;window.dispatchEvent(new Event('pageshow'));window.__holdSummary=false")
        page.evaluate("window.__held.shift()(" + json.dumps(summary(books=[BOOK], youtube=[VIDEO])) + ")")
        page.get_by_role("link", name="Healthy R lecture", exact=False).wait_for()
        self.assertNotIn("Current R book", page.locator("body").inner_text())
        self.assertNotIn("Current R video", page.locator("body").inner_text())
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])

    def test_uncertified_book_and_placeholder_video_never_gain_visibility(self):
        live = summary(books=[BOOK], youtube=[{**VIDEO, "title": "youtube video #qLZmigdY7wg"}], lectures=[LECTURE])
        live["book_visibility_revision"] = ""
        page, errors = self.render(live)
        page.get_by_role("link", name="Healthy R lecture", exact=False).wait_for()
        self.assertNotIn("Current R book", page.locator("body").inner_text())
        self.assertNotIn("youtube video #qLZmigdY7wg", page.locator("body").inner_text())
        self.assert_global_controls_absent(page)
        self.assertEqual(errors, [])

    def test_hanging_summary_has_deadline_and_automatic_recovery_without_global_controls(self):
        page, errors = self.render(summary(), hold=True, deadline=20, manual_only=False)
        page.wait_for_function("window.__aborts >= 1")
        self.assert_global_controls_absent(page)
        page.evaluate("window.__holdSummary=false;window.__liveSummary=" + json.dumps(summary(youtube=[VIDEO])))
        page.get_by_role("link", name="Current R video", exact=False).wait_for()
        self.assert_global_controls_absent(page)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
