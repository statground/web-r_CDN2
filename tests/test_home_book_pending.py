import json
import unittest

import test_home_lane_recovery as fixtures

BOOK = fixtures.BOOK
summary = fixtures.summary


class HomeBookPendingTests(unittest.TestCase):
    setUpClass = classmethod(fixtures.HomeLaneRecoveryTests.setUpClass.__func__)
    tearDownClass = classmethod(fixtures.HomeLaneRecoveryTests.tearDownClass.__func__)
    render = fixtures.HomeLaneRecoveryTests.render
    assert_global_controls_absent = fixtures.HomeLaneRecoveryTests.assert_global_controls_absent

    def test_healthy_sibling_does_not_end_book_visual_wait(self):
        page, errors = self.render(summary(unavailable=["books"]), grace_ms=1000)
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        book = page.locator('[data-home-category="books"] .webr-home-compact__category-body')
        self.assertEqual(book.get_attribute("aria-busy"), "true")
        self.assertEqual(book.locator('[role="status"]').count(), 1)
        self.assertEqual(book.locator('.webr-home-compact__pending-cover[aria-hidden="true"]').count(), 1)
        self.assertGreater(book.locator('.webr-home-compact__pending-card').bounding_box()['height'], 90)
        self.assertNotIn("일부 자료 집계", page.locator("body").inner_text())
        self.assertEqual(book.locator('.webr-home-compact__lane-retry').count(), 0)
        self.assertEqual(errors, [])

    def test_wait_deadline_is_scoped_and_retry_keeps_healthy_card(self):
        page, errors = self.render(summary(unavailable=["books"]), grace_ms=200, deadline=200)
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        book = page.locator('[data-home-category="books"] .webr-home-compact__category-body')
        retry = book.get_by_role("button", name="다시 확인", exact=True)
        retry.wait_for()
        self.assertEqual(book.get_attribute("aria-busy"), "false")
        self.assertEqual(book.locator('.webr-home-compact__pending-card').count(), 0)
        self.assertIn("자료를 불러오지 못했습니다.", book.inner_text())
        self.assertIn("Healthy R package", page.locator("body").inner_text())
        page.evaluate("window.__liveSummary=" + json.dumps(summary(books=[BOOK])))
        retry.click()
        page.get_by_role("link", name="Current R book", exact=False).wait_for()
        self.assertEqual(book.locator('.webr-home-compact__lane-retry').count(), 0)
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])

    def test_current_book_arrives_during_wait_and_is_not_cleared_at_deadline(self):
        page, errors = self.render(summary(unavailable=["books"]), grace_ms=300)
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        page.evaluate("window.__liveSummary=" + json.dumps(summary(books=[BOOK])))
        page.get_by_role("link", name="Current R book", exact=False).wait_for()
        page.wait_for_timeout(350)
        self.assertIn("Current R book", page.locator("body").inner_text())
        self.assertEqual(page.locator('[data-home-category="books"] [data-home-pending]').count(), 0)
        self.assertEqual(page.locator('[data-home-category="books"] .webr-home-compact__lane-error').count(), 0)
        self.assertEqual(errors, [])

    def test_hidden_deadline_does_not_replay_book_or_start_parallel_request(self):
        page, errors = self.render(summary(unavailable=["books"]), grace_ms=200)
        page.get_by_role("link", name="Healthy R package", exact=False).wait_for()
        page.evaluate("window.__hidden=true;document.dispatchEvent(new Event('visibilitychange'))")
        calls = page.evaluate("window.__calls.length")
        page.wait_for_timeout(300)
        self.assertEqual(page.evaluate("window.__calls.length"), calls)
        page.evaluate("window.__wallOffset=31000;window.__hidden=false;document.dispatchEvent(new Event('visibilitychange'))")
        page.locator('[data-home-category="books"] .webr-home-compact__lane-error').wait_for()
        self.assertNotIn("Current R book", page.locator("body").inner_text())
        self.assertEqual(page.evaluate("window.__maxActive"), 1)
        self.assertEqual(errors, [])


if __name__ == '__main__':
    unittest.main()
