import json
import unittest
from unittest.mock import patch

import test_home_lane_recovery as fixtures

CORE = "set_main_compact_portal_20261011_1930_lane_states.js"
GUARD = "home_summary_terminal_guard_20261011_1930.js"
CLOSED = ["rcommunity", "community", "packages", "ecosystem", "workshops", "lectures", "youtube"]

class CurrentScripts:
    def __truediv__(self, name):
        return fixtures.SCRIPTS_ORIGINAL / {"set_main_compact_portal_20260930_lane_recovery.js": CORE,
            "home_summary_terminal_guard_20260828_2306.js": GUARD}.get(name, name)


def closed_summary(*, book=True):
    payload = fixtures.summary(books=[fixtures.BOOK] if book else [], unavailable=CLOSED + ([] if book else ["books"]))
    for key in CLOSED:
        payload["sections"][key] = []
    payload["section_states"] = {key: "closed" for key in CLOSED}
    return payload


class HomeConfirmedUnavailableTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixtures.SCRIPTS_ORIGINAL = fixtures.SCRIPTS
        cls.current_scripts = patch.object(fixtures, "SCRIPTS", CurrentScripts())
        cls.current_scripts.start()
        fixtures.HomeLaneRecoveryTests.setUpClass.__func__(cls)

    @classmethod
    def tearDownClass(cls):
        fixtures.HomeLaneRecoveryTests.tearDownClass.__func__(cls)
        cls.current_scripts.stop()

    render = fixtures.HomeLaneRecoveryTests.render
    assert_global_controls_absent = fixtures.HomeLaneRecoveryTests.assert_global_controls_absent

    def assert_closed_now(self, page):
        page.wait_for_function("document.querySelectorAll('.webr-home-compact__lane-error').length === 6", timeout=1000)
        for key in CLOSED[:5]:
            body = page.locator('[data-home-category="' + key + '"] .webr-home-compact__category-body')
            self.assertEqual(body.get_attribute("aria-busy"), "false")
            self.assertEqual(body.locator('[data-home-pending], .webr-home-compact__skeleton').count(), 0)
        self.assert_global_controls_absent(page)

    def test_closed_current_response_settles_before_one_second_and_keeps_independent_book(self):
        page, errors = self.render(closed_summary(), real_retry=True)
        self.assert_closed_now(page)
        self.assertEqual(page.get_by_role("link", name="Current R book", exact=False).count(), 1)
        self.assertTrue(page.evaluate("window.__readyEvents.some(event => event.ok === true && event.complete === false)"))
        self.assertFalse(page.evaluate("window.__readyEvents.some(event => event.complete === true)"))
        self.assertEqual(errors, [])

    def test_closed_lanes_settle_without_other_resources_while_unknown_book_waits(self):
        page, errors = self.render(closed_summary(book=False), real_retry=True)
        self.assert_closed_now(page)
        book = page.locator('[data-home-category="books"] .webr-home-compact__category-body')
        self.assertEqual(book.get_attribute("aria-busy"), "true")
        self.assertEqual(book.locator('.webr-home-compact__lane-error').count(), 0)
        self.assertEqual(errors, [])

    def test_unknown_preparation_retains_original_quiet_window(self):
        payload = closed_summary()
        del payload["section_states"]
        page, errors = self.render(payload, real_retry=True)
        page.get_by_role("link", name="Current R book", exact=False).wait_for()
        page.wait_for_timeout(250)
        self.assertEqual(page.locator('.webr-home-compact__lane-error').count(), 0)
        self.assertEqual(page.locator('[data-home-pending="true"]').count(), 6)
        self.assertEqual(errors, [])

    def test_explicit_http_failure_ends_pending_and_retains_healthy_current_card(self):
        payload = fixtures.summary(unavailable=["books"])
        page, errors = self.render(payload, real_retry=True)
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        page.evaluate("window.__status = 503")
        page.locator('[data-home-category="books"] .webr-home-compact__lane-error').wait_for(timeout=1500)
        self.assertEqual(page.get_by_role("link", name="Healthy R package", exact=False).count(), 1)
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])

    def test_terminal_denial_clears_summary_cards_and_stops_automatic_retry(self):
        page, errors = self.render(fixtures.summary(unavailable=["books"]), real_retry=True)
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        page.evaluate("window.__status = 403")
        page.locator('[data-home-category="packages"] .webr-home-compact__lane-error').wait_for(timeout=1500)
        self.assertEqual(page.get_by_role("link", name="Healthy R package", exact=False).count(), 0)
        calls = page.evaluate("window.__calls.length")
        page.wait_for_timeout(1100)
        self.assertEqual(page.evaluate("window.__calls.length"), calls)
        self.assertEqual(errors, [])

    def test_guard_preserves_closed_state_and_never_replays_denied_cached_rows_or_renews_age(self):
        cached = fixtures.summary(books=[fixtures.BOOK], youtube=[fixtures.VIDEO])
        for key in CLOSED[:5]:
            cached["sections"][key] = [{"title": "Saved " + key, "href": "/community/"}]
        cached["sections"]["activity"] = [{"title": "A user visited.", "href": "/", "published_at": "2026-01-01T00:00:00Z"}]
        page, errors = self.render(closed_summary(), cached=cached)
        age = page.evaluate("JSON.parse(localStorage.getItem('webr.home.public-summary.v1')).stored_at")
        self.assert_closed_now(page)
        self.assertEqual(page.get_by_role("link", name="Saved community", exact=False).count(), 0)
        self.assertEqual(page.evaluate("JSON.parse(localStorage.getItem('webr.home.public-summary.v1')).stored_at"), age)
        self.assertEqual(page.get_by_role("link", name="Current R book", exact=False).count(), 1)
        self.assertEqual(errors, [])

    def test_unknown_preparation_settles_only_at_original_deadline_and_can_recover(self):
        payload = closed_summary()
        del payload["section_states"]
        page, errors = self.render(payload, grace_ms=250)
        self.assertEqual(page.locator('.webr-home-compact__lane-error').count(), 0)
        self.assert_closed_now(page)
        page.evaluate("window.__liveSummary=" + json.dumps(fixtures.summary(books=[fixtures.BOOK], youtube=[fixtures.VIDEO])))
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for(timeout=2000)
        self.assertEqual(page.locator('[data-home-category="packages"] [data-home-pending]').count(), 0)
        self.assertEqual(errors, [])

    def test_malformed_closed_payload_cannot_replay_saved_generation(self):
        cached = fixtures.summary(books=[fixtures.BOOK], youtube=[fixtures.VIDEO])
        cached["sections"]["community"] = [{"title": "Saved community", "href": "/community/"}]
        cached["sections"]["activity"] = [{"title": "A user visited.", "href": "/", "published_at": "2026-01-01T00:00:00Z"}]
        malformed = closed_summary()
        malformed["section_states"] = {"community": "preparing"}
        page, errors = self.render(malformed, cached=cached, grace_ms=250)
        page.wait_for_function("window.__calls.length > 0")
        page.locator('[data-home-category="community"] .webr-home-compact__lane-error').wait_for(timeout=1500)
        self.assertEqual(page.get_by_role("link", name="Saved community", exact=False).count(), 0)
        self.assertFalse(page.evaluate("window.__readyEvents.some(event => event.complete === true)"))
        self.assertEqual(errors, [])

    def test_unauthorized_response_retires_cache_preview_without_age_renewal(self):
        cached = fixtures.summary(books=[fixtures.BOOK], youtube=[fixtures.VIDEO])
        cached["sections"]["community"] = [{"title": "Saved community", "href": "/community/"}]
        cached["sections"]["activity"] = [{"title": "A user visited.", "href": "/", "published_at": "2026-01-01T00:00:00Z"}]
        page, errors = self.render(closed_summary(), cached=cached, status=401, real_retry=True)
        age = page.evaluate("JSON.parse(localStorage.getItem('webr.home.public-summary.v1')).stored_at")
        page.locator('[data-home-category="community"] .webr-home-compact__lane-error').wait_for(timeout=1500)
        self.assertEqual(page.get_by_role("link", name="Saved community", exact=False).count(), 0)
        self.assertEqual(page.evaluate("JSON.parse(localStorage.getItem('webr.home.public-summary.v1')).stored_at"), age)
        calls = page.evaluate("window.__calls.length")
        page.wait_for_timeout(1100)
        self.assertEqual(page.evaluate("window.__calls.length"), calls)
        self.assertFalse(page.evaluate("window.__readyEvents.some(event => event.complete === true)"))
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
