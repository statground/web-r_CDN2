import json
import unittest
import test_home_lane_recovery as fixture
class ActivityTimeTests(unittest.TestCase):
    setUpClass = classmethod(fixture.HomeLaneRecoveryTests.setUpClass.__func__)
    tearDownClass = classmethod(fixture.HomeLaneRecoveryTests.tearDownClass.__func__)
    render = fixture.HomeLaneRecoveryTests.render
    assert_global_controls_absent = fixture.HomeLaneRecoveryTests.assert_global_controls_absent
    def test_old_activity_remains_visible_with_original_time(self):
        payload = fixture.summary()
        payload['sections']['activity'] = [
            {'title': '이***자님이 MirType에 로그인했습니다.', 'published_at': '2000-01-01 00:00:00'},
            {'title': '일***원님이 Statground에 로그인했습니다.', 'published_at': '2026-10-07T11:00:00Z'}]
        page, errors = self.render(payload)
        page.wait_for_selector('.webr-home-compact__activity-title')
        self.assertEqual(errors, [])
        self.assertIn('MirType에 로그인했습니다.', page.locator('.webr-home-compact__activity-list').inner_text())
        self.assertEqual(page.locator('.webr-home-compact__activity-list time').count(), 2)
        text = page.locator('.webr-home-compact__activity-list').inner_text()
        self.assertIn('일 전', text)
        self.assertNotIn('2000', text)
        self.assertEqual(page.locator('time').first.get_attribute('datetime'), '1999-12-31T15:00:00.000Z')
    def test_authority_unavailable_is_not_reported_as_empty_activity(self):
        payload = fixture.summary()
        payload['unavailable_sections'] = ['activity']
        page, errors = self.render(payload)
        page.wait_for_selector('.webr-home-compact__activity-empty')
        text = page.locator('.webr-home-compact__activity-empty').inner_text()
        self.assertIn('확인하지 못했습니다', text)
        self.assertNotIn('활동이 없습니다', text)
        self.assertEqual(errors, [])
    def test_relative_clock_is_timezone_independent_and_updates_without_requests(self):
        payload = fixture.summary()
        payload['sections']['activity'] = [{'title': '이***원님이 Web-R에 로그인했습니다.', 'published_at': '2026-10-10T10:00:00Z'}]
        page, errors = self.render(payload)
        page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState === 'ready'")
        page.evaluate("""() => {
            window.__ageNow = Date.parse('2026-10-10T12:00:00Z');
            Date.now = () => window.__ageNow;
            const timer = window.setTimeout;
            window.setTimeout = (fn, ms, ...args) => {
                if (fn.name === 'refreshActivityTimes') window.__ageTick = fn;
                return timer(fn, ms, ...args);
            };
            window.dispatchEvent(new Event('webr:language-change'));
        }""")
        self.assertEqual(page.locator('time').inner_text(), '2시간 전')
        self.assertEqual(page.locator('time').get_attribute('datetime'), '2026-10-10T10:00:00.000Z')
        calls = page.evaluate('window.__calls.length')
        page.evaluate('() => {window.__ageNow += 86400000; window.__ageTick()}')
        self.assertEqual(page.locator('time').inner_text(), '1일 전')
        self.assertEqual(page.evaluate('window.__calls.length'), calls)
        page.evaluate("() => {document.documentElement.lang='en';window.dispatchEvent(new Event('webr:language-change'))}")
        self.assertEqual(page.locator('time').inner_text(), '1 day ago')
        self.assertEqual(page.locator('time').get_attribute('lang'), 'en')
        self.assertEqual(errors, [])
    def test_invalid_unknown_and_future_time_never_invent_an_age(self):
        payload = fixture.summary()
        payload['sections']['activity'] = [{'title': '이***원님이 Web-R에 방문했습니다.', 'published_at': raw}
            for raw in ['', 'not-a-time', '2026-02-31T10:00:00Z', '2026-01-01T24:00:00Z', '2099-01-01T00:00:00Z']]
        page, errors = self.render(payload)
        page.wait_for_selector('.webr-home-compact__activity-title')
        self.assertEqual(page.locator('.webr-home-compact__activity-item').count(), 5)
        self.assertEqual(page.locator('time').count(), 0)
        self.assertEqual(errors, [])
    def test_five_latest_rows_balance_desktop_cards_and_fit_mobile(self):
        payload = fixture.summary(youtube=[fixture.VIDEO], lectures=[fixture.LECTURE])
        payload['sections']['activity'] = [
            {'title': name + '님이 ' + event, 'published_at': '2000-01-01 00:00:00'}
            for name, event in [
                ('일***원', 'Web-R에 방문했습니다.'),
                ('이***원', 'MirType에 로그인했습니다.'),
                ('삼***원', 'Statground에 로그인했습니다.'),
                ('사***원', 'Web-R에 로그인했습니다.'),
                ('오***원', '샘플 수의 계산을 사용하고 있습니다.'),
                ('육***원', 'Web-R에 방문했습니다.')]
        ]
        notices = {str(index): {'title': title, 'uuid': '11111111-1111-4111-8111-' + str(index).zfill(12),
                               'created_at': '2026-06-29'} for index, title in enumerate([
                                   'Web-R 2.0에 PubMed WordCloud 추가',
                                   'Web-R 계정 및 멤버십 권한 오류 수정 안내',
                                   'Web-R 홈페이지가 새롭게 개편되었습니다'])}
        for width in [1440, 390]:
            with self.subTest(width=width):
                page, errors = self.render(payload, notices=notices)
                page.set_viewport_size({'width': width, 'height': 1200})
                page.add_style_tag(path=str(fixture.ROOT / 'scripts_go/web_r_go_20260629_1025/styles_v2/index/home_visual_20261001.css'))
                rows = page.locator('.webr-home-compact__activity-item')
                page.wait_for_function("document.querySelectorAll('.webr-home-compact__activity-item').length === 5")
                self.assertEqual(rows.count(), 5)
                self.assertNotIn('육***원', page.locator('.webr-home-compact__activity-list').inner_text())
                self.assertIn('MirType에 로그인했습니다.', rows.nth(1).inner_text())
                self.assertIn('Statground에 로그인했습니다.', rows.nth(2).inner_text())
                self.assertEqual(page.locator('.webr-home-compact__activity-list time').count(), 5)
                boxes = page.locator('.webr-home-compact__rail-card').evaluate_all("cards => cards.map(card => {const b=card.getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};})")
                activity = page.locator('.webr-home-compact__rail-card--activity').bounding_box()
                last_row = rows.last.bounding_box()
                self.assertLessEqual(last_row['y'] + last_row['height'], activity['y'] + activity['height'])
                if width == 1440:
                    peer_heights = [box['height'] for box in boxes if abs(box['y'] - activity['y']) < 1]
                    self.assertEqual(len(peer_heights), 3)
                    self.assertLessEqual(max(peer_heights) - min(peer_heights), 1)
                else:
                    self.assertTrue(all(box['x'] >= 0 and box['right'] <= width for box in boxes))
                for index in range(5):
                    title, age = rows.nth(index).locator('strong').bounding_box(), rows.nth(index).locator('time').bounding_box()
                    self.assertGreaterEqual(age['x'], title['x'] + title['width'])
                self.assertEqual(errors, [])
if __name__ == '__main__': unittest.main()
