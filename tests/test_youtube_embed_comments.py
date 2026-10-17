"""Offline real-renderer controls. All external requests are intercepted; no playback."""
import json
import os
from pathlib import Path
import unittest
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright
import test_youtube_primary_recovery as primary
import test_youtube_detail_width as width_fixture

ID = primary.ARTICLE_ID
COMMENT = {'uuid': '33333333-3333-4333-8333-333333333333', 'uuid_article': ID,
           'uuid_upper': None, 'content': 'Current comment fixture', 'user_nickname': 'Fixture',
           'check_comment_reader': 'user', 'is_secret': 0}


class YouTubeEmbedCommentTests(unittest.TestCase):
    setUpClass = classmethod(primary.YouTubePrimaryRecoveryTests.setUpClass.__func__)
    tearDownClass = classmethod(primary.YouTubePrimaryRecoveryTests.tearDownClass.__func__)
    render = primary.YouTubePrimaryRecoveryTests.render
    fulfill = staticmethod(primary.YouTubePrimaryRecoveryTests.fulfill)

    def held(self, comment=None, status=200, raw=None):
        page, requests, parked, errors = self.render(lambda route, _, held: held.append(route))
        page.set_default_timeout(1500)
        page.add_script_tag(path=str(primary.ROOT / 'scripts_v2/common/solid-edit/helpers_20260530_2334.js'))
        page.wait_for_function('primaryActive===1')
        page.route('**/blank/ajax_board/get_read_article_comment/', lambda route:
            route.fulfill(status=status, content_type='application/json', body=raw if raw is not None else json.dumps({} if comment is None else comment)))
        return page, requests, parked, errors

    def start(self, page, parked):
        self.fulfill(parked[0], primary.ARTICLE)
        page.get_by_role('heading', name=primary.ARTICLE['title'], exact=True).wait_for()

    def test_comments_visible_while_primary_and_comment_body_are_held_then_true_empty(self):
        page, _, parked, errors = self.held()
        root = page.locator('#div_community_read_comment')
        self.assertTrue(root.get_by_role('heading', name='댓글', exact=True).is_visible())
        self.assertEqual(root.get_attribute('aria-busy'), 'true')
        self.assertNotIn('(0)', root.inner_text())
        page.evaluate('''() => {const original=fetch;window.fetch=async(url,options)=>{
          const response=await original(url,options);if(new URL(url,location.href).pathname.endsWith('/get_read_article_comment/'))
          response.json=()=>new Promise(resolve=>{window.finishCommentBody=resolve;});return response;};}''')
        self.start(page, parked)
        page.wait_for_function('!!window.finishCommentBody')
        self.assertEqual(root.get_attribute('aria-busy'), 'true')
        self.assertTrue(root.locator('.animate-pulse').is_visible())
        self.assertNotIn('댓글 (0)', root.inner_text())
        page.evaluate('finishCommentBody({})')
        root.get_by_text('아직 등록된 댓글이 없습니다.', exact=True).wait_for()
        self.assertEqual(root.get_attribute('aria-busy'), 'false')
        self.assertEqual(root.locator('.animate-pulse').count(), 0)
        self.assertEqual(errors, [])

    def test_failure_control_malformed_and_foreign_rows_never_become_empty(self):
        for value, status, raw in [({}, 503, None), ({}, 403, None),
                ({'ok': False, 'pending': True}, 200, None), ([], 200, None),
                ({'0': {**COMMENT, 'uuid_article': primary.OTHER_ID}}, 200, None),
                ({'0': {**COMMENT, 'uuid_upper': primary.OTHER_ID}}, 200, None), ({}, 200, '')]:
            with self.subTest(status=status, value=value, raw=raw):
                page, _, parked, errors = self.held(value, status, raw)
                self.start(page, parked)
                root=page.locator('#div_community_read_comment')
                root.get_by_role('alert').wait_for()
                self.assertEqual(root.get_attribute('aria-busy'), 'false')
                self.assertEqual(root.locator('.animate-pulse').count(), 0)
                self.assertNotIn('댓글 (0)', root.inner_text())
                self.assertNotIn('아직 등록된 댓글', root.inner_text())
                self.assertEqual(root.get_by_role('button').count(), 0)
                self.assertEqual(errors, [])

    def test_deadline_is_finite_and_pagehide_discards_late_body(self):
        for cancel in ('deadline', 'pagehide', 'same_id_replacement', 'viewer'):
            with self.subTest(cancel=cancel):
                page, _, parked, errors=self.held()
                page.evaluate('''() => {const original=fetch;window.fetch=async(url,options)=>{
                  const response=await original(url,options);if(new URL(url,location.href).pathname.endsWith('/get_read_article_comment/'))
                  response.json=()=>new Promise(resolve=>{window.finishCommentBody=resolve;});return response;};}''')
                self.start(page, parked);page.wait_for_function('!!window.finishCommentBody')
                if cancel=='deadline':
                    page.clock.run_for(45000)
                    page.locator('#div_community_read_comment [role=alert]').wait_for()
                elif cancel=='pagehide':page.evaluate("dispatchEvent(new PageTransitionEvent('pagehide'))")
                elif cancel=='viewer':
                    page.evaluate("gv_username='different-user'");page.clock.run_for(100)
                else:
                    page.evaluate("document.getElementById('div_community_read_comment').replaceWith(Object.assign(document.createElement('div'),{id:'div_community_read_comment'}))")
                    page.clock.run_for(100)
                page.evaluate('finishCommentBody({"0":'+json.dumps(COMMENT)+'})')
                page.wait_for_timeout(20)
                root=page.locator('#div_community_read_comment')
                self.assertNotIn(COMMENT['content'],root.inner_text())
                self.assertNotIn('댓글 (0)',root.inner_text())
                self.assertEqual(root.locator('.animate-pulse').count(),0)
                self.assertEqual(errors,[])

    def test_verified_comment_refresh_failure_preserves_body(self):
        page, _, parked, errors=self.held({'0': COMMENT})
        self.start(page, parked)
        page.get_by_text(COMMENT['content'],exact=True).wait_for()
        page.route('**/blank/ajax_board/get_read_article_comment/',lambda route:self.fulfill(route,{},503))
        page.evaluate('get_read_article_comment(orderID)')
        root=page.locator('#div_community_read_comment');root.get_by_role('alert').wait_for()
        self.assertIn(COMMENT['content'],root.inner_text())
        self.assertEqual(root.get_attribute('aria-busy'),'false')
        self.assertEqual(errors,[])

    def test_responsive_player_has_visible_external_fallback_on_error(self):
        for viewport in (390,1440):
            with self.subTest(viewport=viewport):
                page, _, _=width_fixture.YouTubeDetailWidthTests.render(self,viewport,'normal')
                page.set_default_timeout(1500)
                frame=page.locator('#div_community_read_youtube iframe')
                box=frame.bounding_box();self.assertGreaterEqual(box['width'],200);self.assertGreaterEqual(box['height'],200)
                self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'),viewport+1)
                link=page.locator('#div_community_read_youtube').get_by_role('link',name='YouTube에서 보기')
                self.assertTrue(link.is_visible());self.assertEqual(link.get_attribute('href'),'https://www.youtube.com/watch?v=abcdefghijk')
                frame.evaluate("n=>n.dispatchEvent(new Event('error'))")
                page.locator('#div_community_read_youtube [role=alert]').wait_for()
                self.assertTrue(link.is_visible());self.assertEqual(frame.count(),0)

    def test_actual_app_csp_allows_only_detail_frame(self):
        fixture=os.environ.get('WEBR_YOUTUBE_FRAME_HEADER_PROOF')
        if not fixture:self.skipTest('actual App header fixture not supplied')
        headers=json.loads(Path(fixture).read_bytes())
        for key, expected in (('blocked_csp',0),('allowed_csp',1)):
            page=self.browser.new_page();self.addCleanup(page.close);calls=[]
            def respond(route):
                if urlsplit(route.request.url).hostname=='www.youtube.com':
                    calls.append(route.request.url);route.fulfill(content_type='text/html',body='<html><body>Offline player</body></html>')
                else:route.fulfill(content_type='text/html',headers={'Content-Security-Policy':headers[key]},body='<html><body></body></html>')
            page.route('**/*',respond);page.goto('https://csp.test/workshop/youtube/read/'+ID+'/')
            page.evaluate('''() => {let f=document.createElement('iframe');f.src='https://www.youtube.com/embed/abcdefghijk';document.body.append(f);}''')
            page.wait_for_timeout(80)
            self.assertEqual(len(calls),expected)
            page.close()


if __name__=='__main__':unittest.main()
