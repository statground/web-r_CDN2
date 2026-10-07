import json
import unittest
import test_home_lane_recovery as fixture
class ActivityTimeTests(unittest.TestCase):
    setUpClass = classmethod(fixture.HomeLaneRecoveryTests.setUpClass.__func__)
    tearDownClass = classmethod(fixture.HomeLaneRecoveryTests.tearDownClass.__func__)
    render = fixture.HomeLaneRecoveryTests.render
    assert_global_controls_absent = fixture.HomeLaneRecoveryTests.assert_global_controls_absent
    def test_old_activity_remains_visible_without_any_time_label(self):
        payload = fixture.summary()
        payload['sections']['activity'] = [
            {'title': '이***자님이 MirType에 로그인했습니다.', 'published_at': '2000-01-01 00:00:00'},
            {'title': '일***원님이 Statground에 로그인했습니다.', 'published_at': '2026-10-07T11:00:00Z'}]
        page, errors = self.render(payload)
        page.wait_for_selector('.webr-home-compact__activity-title')
        self.assertEqual(errors, [])
        self.assertIn('MirType에 로그인했습니다.', page.locator('.webr-home-compact__activity-list').inner_text())
        self.assertEqual(page.locator('.webr-home-compact__activity-time, .webr-home-compact__activity-list time').count(), 0)
        text = page.locator('.webr-home-compact__activity-list').inner_text()
        for value in ['2000', '2026', '시간 전', '일 전', 'ago']:
            self.assertNotIn(value, text)
    def test_authority_unavailable_is_not_reported_as_empty_activity(self):
        payload = fixture.summary()
        payload['unavailable_sections'] = ['activity']
        page, errors = self.render(payload)
        page.wait_for_selector('.webr-home-compact__activity-empty')
        text = page.locator('.webr-home-compact__activity-empty').inner_text()
        self.assertIn('확인하지 못했습니다', text)
        self.assertNotIn('활동이 없습니다', text)
        self.assertEqual(errors, [])
if __name__ == '__main__': unittest.main()
