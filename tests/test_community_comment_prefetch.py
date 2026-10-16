"""Offline first-read overlap, current-parent gate and finite ownership controls."""
import json
import os
from pathlib import Path
import unittest
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

ASSETS=Path(__file__).resolve().parents[1]/'scripts_go/web_r_go_20260629_1025'
SCRIPT=ASSETS/'scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js'
ID='11111111-1111-4111-8111-111111111111'
CID='22222222-2222-4222-8222-222222222222'
READ='/blank/ajax_board/get_read_article/'
COMMENTS='/blank/ajax_board/get_read_article_comment/'
INSERT='/blank/ajax_board/insert_comment/'
ARTICLE=dict(uuid=ID,title='Current allowed parent',content='Current parent body',category_url='free',category_url_sub='',check_reader='user',is_secret=0,created_at='2026-10-16',user_nickname='Public author',user_role='user',cnt_read=1,cnt_comment=1)
COMMENT=dict(uuid=CID,uuid_article=ID,uuid_upper='',content='Early comment must wait for current parent',active=1,visible=1,is_secret=0,check_article_reader='user',check_comment_reader='user',article_category_url='free',article_category_url_sub='',user_uuid='public-writer',user_nickname='Comment writer',user_role='user',created_at='2026-10-16')

class CommunityCommentPrefetchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True,executable_path=os.environ.get('WEBR_CHROMIUM_EXECUTABLE','/home/lv999/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome'))
    @classmethod
    def tearDownClass(cls):cls.browser.close();cls.pw.stop()
    @staticmethod
    def fulfill(route,value,status=200):route.fulfill(status=status,content_type='application/json',body=json.dumps(value))
    def fixture(self,width=1440,hold_body=False,tag="free",editor_hold=False):
        p=self.browser.new_page(viewport=dict(width=width,height=900));self.addCleanup(p.close);p.set_default_timeout(2500)
        calls=[];held={READ:[],COMMENTS:[],INSERT:[]};errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
        def serve(route):
            path=urlsplit(route.request.url).path
            if route.request.is_navigation_request():route.fulfill(content_type='text/html; charset=utf-8',body='<html lang="ko"><div id="div_main"></div></html>')
            elif path in held:calls.append(path);held[path].append(route)
            else:route.abort()
        p.route('**/*',serve)
        p.goto('https://prefetch.test/community/free/read/'+ID+'/');p.clock.install()
        p.add_script_tag(path=str(ASSETS/'vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js'))
        p.evaluate('''id=>{Object.assign(window,{url:'free',sub:'',mode:'read',orderID:id,gv_username:'',gv_role:'user',getCookie:()=>'',WebRI18n:{language:'ko'},
          WebRSolidEdit:{renderContent:(target,html)=>target.textContent=html},Div_page_header:p=>React.createElement('h1',null,p.title)});void 0;}''',ID)
        p.evaluate('tag=>{window.url=tag;history.replaceState({},"","/community/"+tag+"/read/"+orderID+"/");}',tag)
        if editor_hold:p.evaluate("gv_username='controlled-member';window.editorCalls=0;WebRSolidEdit.ensureEditorAssets=()=>++editorCalls===1?new Promise(resolve=>window.finishFirstEditorAssets=resolve):Promise.resolve(false);window.alert=()=>{};void 0")
        if hold_body:p.evaluate('''window.heldCommentJSON=null;const originalFetch=window.fetch.bind(window);window.fetch=(url,init)=>originalFetch(url,init).then(r=>{
          if(String(url).includes('/get_read_article_comment/'))r.json=()=>new Promise(resolve=>window.heldCommentJSON=resolve);return r;});void 0;''')
        p.add_script_tag(path=str(SCRIPT));p.evaluate('window.mainDone=false;void set_main_read().then(()=>mainDone=true)')
        if tag=='free':p.wait_for_function('communityCommentRead!==null')
        p.wait_for_timeout(10)
        def cleanup():
            for rows in held.values():
                for r in rows:
                    try:r.abort()
                    except Exception:pass
            p.unroute_all(behavior='ignoreErrors')
        self.addCleanup(cleanup)
        self.assertEqual(calls.count(READ),1);self.assertEqual(calls.count(COMMENTS),1 if tag=="free" else 0)
        return p,calls,held,errors

    def test_both_response_orders_overlap_without_exposing_before_primary_or_duplicate_reads(self):
        for width in (1440,390):
            for comments_first in (True,False):
                with self.subTest(width=width,comments_first=comments_first):
                    p,c,h,e=self.fixture(width)
                    if comments_first:
                        self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT});p.wait_for_timeout(30)
                        self.assertNotIn(COMMENT['content'],p.locator('#div_main').inner_text())
                        self.assertNotIn('댓글 (0)',p.locator('#div_main').inner_text())
                        self.assertTrue(p.evaluate('communityCommentRead.running'))
                        self.fulfill(h[READ].pop(0),ARTICLE)
                    else:
                        self.fulfill(h[READ].pop(0),ARTICLE);p.get_by_text(ARTICLE['content'],exact=True).wait_for()
                        self.assertTrue(p.evaluate('mainDone'))
                        self.assertNotIn(COMMENT['content'],p.locator('#div_main').inner_text())
                        self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT})
                    p.get_by_text(COMMENT['content'],exact=True).wait_for()
                    self.assertEqual(c.count(READ),1);self.assertEqual(c.count(COMMENTS),1);self.assertEqual(e,[])

    def test_early_error_or_healthy_empty_waits_for_parent_without_error_retry(self):
        for status,value in ((503,{'ok':False,'pending':True}),(200,{})):
            with self.subTest(status=status):
                p,c,h,e=self.fixture();self.fulfill(h[COMMENTS].pop(0),value,status);p.wait_for_timeout(30)
                self.assertEqual(p.locator('[data-webr-community-action-status]').count(),0)
                self.assertNotIn('댓글 (0)',p.locator('#div_main').inner_text())
                self.assertTrue(p.evaluate('communityCommentRead.running'))
                self.fulfill(h[READ].pop(0),ARTICLE)
                p.get_by_text(ARTICLE['content'],exact=True).wait_for()
                if status==503:p.locator('[data-webr-community-action-status="comment-read"]').wait_for()
                else:p.get_by_text('댓글 (0)',exact=True).wait_for()
                p.clock.run_for(46000);self.assertEqual(c.count(COMMENTS),1);self.assertEqual(e,[])

    def test_parent_denial_failure_or_masked_secret_discards_earlier_comment(self):
        for status,value in ((403,{}),(503,{}),(200,dict(ARTICLE,is_secret=1,content='Masked private parent')),(200,dict(ARTICLE,not_found=True))):
            with self.subTest(status=status,value=value):
                p,c,h,e=self.fixture();self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT});p.wait_for_timeout(20)
                self.fulfill(h[READ].pop(0),value,status);p.wait_for_function('mainDone');p.wait_for_timeout(20)
                self.assertNotIn(COMMENT['content'],p.locator('#div_main').inner_text())
                self.assertNotIn('댓글 (0)',p.locator('#div_main').inner_text())
                self.assertIsNone(p.evaluate('communityState.commentData'));self.assertEqual(c.count(COMMENTS),1);self.assertEqual(e,[])

    def test_current_parent_tuple_mismatch_is_unavailable_without_followup_post(self):
        for delta in (dict(uuid_article=CID),dict(article_category_url='notice'),dict(article_category_url_sub='different'),dict(check_article_reader='writer')):
            with self.subTest(delta=delta):
                p,c,h,e=self.fixture();self.fulfill(h[COMMENTS].pop(0),{'0':dict(COMMENT,**delta)})
                self.fulfill(h[READ].pop(0),ARTICLE)
                p.locator('[data-webr-community-action-status="comment-read"]').wait_for()
                self.assertIn(ARTICLE['content'],p.locator('#div_main').inner_text())
                self.assertNotIn(COMMENT['content'],p.locator('#div_main').inner_text())
                self.assertIsNone(p.evaluate('communityState.commentData'));self.assertEqual(c.count(COMMENTS),1);self.assertEqual(e,[])

    def test_non_free_keeps_original_sequential_comment_read(self):
        p,c,h,e=self.fixture(tag='notebook')
        self.assertEqual(c.count(COMMENTS),0)
        self.fulfill(h[READ].pop(0),dict(ARTICLE,category_url='notebook'))
        p.get_by_text(ARTICLE['content'],exact=True).wait_for();p.wait_for_timeout(10)
        self.assertEqual(c.count(COMMENTS),1)
        self.fulfill(h[COMMENTS].pop(0),{})
        p.get_by_text('댓글 (0)',exact=True).wait_for();self.assertEqual(e,[])

    def test_prefetch_requires_object_map_and_present_parent_subcategory(self):
        for value in (1,[],dict({'0':dict(COMMENT,article_category_url_sub=None)})):
            with self.subTest(value=value):
                p,c,h,e=self.fixture();parent=dict(ARTICLE)
                if isinstance(value,dict):parent.pop('category_url_sub');value['0'].pop('article_category_url_sub')
                self.fulfill(h[COMMENTS].pop(0),value)
                self.fulfill(h[READ].pop(0),parent)
                p.locator('[data-webr-community-action-status="comment-read"]').wait_for()
                self.assertNotIn('댓글 (0)',p.locator('#div_main').inner_text());self.assertEqual(c.count(COMMENTS),1);self.assertEqual(e,[])

    def test_retired_first_flight_is_not_restarted_by_original_primary_callback(self):
        for change in ("communityCommentRead.cancel()","document.getElementById('div_community_read_comment').replaceWith(Object.assign(document.createElement('div'),{id:'div_community_read_comment'}))"):
            with self.subTest(change=change):
                p,c,h,e=self.fixture();self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT});p.wait_for_timeout(20)
                p.evaluate(change);p.clock.run_for(101)
                p.wait_for_function('communityCommentRead===null')
                self.fulfill(h[READ].pop(0),ARTICLE);p.get_by_text(ARTICLE['content'],exact=True).wait_for()
                p.wait_for_timeout(20)
                self.assertEqual(c.count(COMMENTS),1)
                self.assertNotIn(COMMENT['content'],p.locator('#div_main').inner_text());self.assertEqual(e,[])

    def test_successful_mutation_refresh_does_not_join_initial_held_editor_snapshot(self):
        p,c,h,e=self.fixture(editor_hold=True)
        self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT});self.fulfill(h[READ].pop(0),ARTICLE)
        fallback=p.locator('#txt_content_comment_new_fallback');fallback.wait_for()
        self.assertTrue(p.evaluate('communityCommentRead.running'))
        fallback.fill('Submitted comment')
        p.evaluate("void comment_action('submit','new').then(()=>window.mutationDone=true)")
        p.wait_for_timeout(10);self.assertEqual(c.count(INSERT),1)
        fallback.fill('Next unsent revision')
        acknowledged=dict(COMMENT,uuid='33333333-3333-4333-8333-333333333333',content='Submitted comment',check_comment_reader='writer')
        self.fulfill(h[INSERT].pop(0),dict(checker='SUCCESS',uuid=acknowledged['uuid'],comment=acknowledged))
        p.wait_for_function('window.mutationDone===true');p.wait_for_timeout(20)
        self.assertEqual(c.count(COMMENTS),2)
        self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT,'1':acknowledged})
        p.get_by_text('Submitted comment',exact=True).wait_for()
        p.evaluate('finishFirstEditorAssets(false)');p.wait_for_timeout(20)
        self.assertEqual(p.locator('#txt_content_comment_new_fallback').input_value(),'Next unsent revision')
        self.assertEqual(c.count(INSERT),1);self.assertEqual(c.count(COMMENTS),2);self.assertEqual(e,[])

    def test_secret_parent_requires_server_writer_or_admin_and_keeps_masked_comment(self):
        for reader in ('writer','admin'):
            with self.subTest(reader=reader):
                p,c,h,e=self.fixture()
                comment=dict(COMMENT,check_article_reader=reader,is_secret=1,content='Server-masked comment')
                self.fulfill(h[COMMENTS].pop(0),{'0':comment})
                self.fulfill(h[READ].pop(0),dict(ARTICLE,is_secret=1,check_reader=reader))
                p.get_by_text(comment['content'],exact=True).wait_for()
                self.assertEqual(c.count(COMMENTS),1);self.assertEqual(e,[])

    def test_owner_account_locale_route_dom_and_pagehide_stop_early_result(self):
        changes=["gv_username='other-account'","document.documentElement.lang='en';communityLocaleEpoch++","history.pushState({},'',location.pathname+'?changed=1')","document.getElementById('div_community_read_comment').replaceWith(document.createElement('aside'))","window.dispatchEvent(new Event('pagehide'))"]
        for change in changes:
            with self.subTest(change=change):
                p,c,h,e=self.fixture();self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT});p.evaluate(change);p.clock.run_for(101)
                self.fulfill(h[READ].pop(0),ARTICLE);p.wait_for_timeout(20)
                self.assertNotIn(COMMENT['content'],p.locator('#div_main').inner_text())
                self.assertIsNone(p.evaluate('communityState.commentData'));self.assertEqual(c.count(COMMENTS),1);self.assertEqual(e,[])

    def test_same_original_deadline_stops_ignored_late_body_without_recovery(self):
        p,c,h,e=self.fixture(hold_body=True);self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT});p.wait_for_function('!!heldCommentJSON')
        self.fulfill(h[READ].pop(0),ARTICLE);p.get_by_text(ARTICLE['content'],exact=True).wait_for()
        p.clock.run_for(45001);p.locator('[data-webr-community-action-status="comment-read"]').wait_for()
        p.evaluate('heldCommentJSON('+json.dumps({'0':COMMENT})+')');p.wait_for_timeout(20)
        self.assertNotIn(COMMENT['content'],p.locator('#div_main').inner_text());self.assertEqual(c.count(COMMENTS),1);self.assertEqual(e,[])

    def test_role_handoff_consumes_same_two_attempts_without_old_body_promotion(self):
        p,c,h,e=self.fixture();p.evaluate("gv_role='admin'")
        self.fulfill(h[COMMENTS].pop(0),{'0':dict(COMMENT,content='OLD ROLE COMMENT')})
        self.fulfill(h[READ].pop(0),dict(ARTICLE,content='OLD ROLE PARENT'))
        p.wait_for_function('primary=>communityDetailRead.running',arg=True);p.wait_for_timeout(20)
        self.assertEqual(c.count(READ),2);self.assertEqual(c.count(COMMENTS),2)
        self.fulfill(h[COMMENTS].pop(0),{'0':COMMENT});p.wait_for_timeout(20)
        self.assertNotIn(COMMENT['content'],p.locator('#div_main').inner_text())
        self.fulfill(h[READ].pop(0),ARTICLE);p.get_by_text(COMMENT['content'],exact=True).wait_for()
        self.assertNotIn('OLD ROLE',p.locator('#div_main').inner_text());self.assertEqual(e,[])

if __name__=='__main__':unittest.main()
