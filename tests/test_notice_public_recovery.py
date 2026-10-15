"""Finite actual Notice renderer proof with synthetic public records only."""
import json
from pathlib import Path
import unittest
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1] / 'scripts_go/web_r_go_20260629_1025'
SCRIPT = ROOT / 'scripts_v2/intro/notice/set_main_solid_edit_comment_mini_20260822_1548.js'
ID = '11111111-1111-4111-8111-111111111111'
ITEM = {'uuid': ID, 'title': 'Current public notice', 'content': 'Current notice body',
        'category_url': 'notice', 'check_reader': 'user', 'is_secret': 0, 'attachments': []}
READ = '/blank/ajax_board/get_read_article/'
LIST = '/blank/ajax_board/get_article_list/'


class NoticePublicRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def render(self, replies, *, start='read', width=1440, held_stage=None):
        page = self.browser.new_page(viewport={'width': width, 'height': 900})
        page.set_default_timeout(2500)
        self.addCleanup(page.close)
        calls, errors = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.add_init_script("""window.mode=location.pathname.includes('/read/')?'read':'';
          window.url='notice';window.sub='';window.gv_username='';window.gv_role='';window.orderID=location.pathname.includes('/read/')?location.pathname.split('/')[4]:'';
          window.getCookie=()=>'';window.Div_page_header=()=>null;
          window.WebRSolidEdit={renderContent:(target,content)=>target.textContent=content};
          const timer=window.setTimeout.bind(window);window.setTimeout=(fn,ms,...args)=>timer(fn,[350,700,1050].includes(ms)?1:ms,...args);""")

        def serve(route):
            path = urlsplit(route.request.url).path
            if route.request.is_navigation_request():
                route.fulfill(content_type='text/html', body='<html lang="ko"><div id="div_main"></div></html>')
            elif path in [READ, LIST]:
                calls.append({'path': path, 'body': route.request.post_data})
                reply = replies.pop(0) if len(replies) > 1 else replies[0]
                route.fulfill(status=reply.get('status', 200), content_type='application/json', body=json.dumps(reply.get('body', {})))
            elif path.startswith('/blank/ajax_board/'):
                route.fulfill(content_type='application/json', body='{}')
            else:
                route.abort()

        page.route('**/*', serve)
        page.goto('https://notice.test/intro/notice/'+('read/'+ID+'/' if start=='read' else ''))
        page.clock.install()
        if held_stage:
            page.evaluate("""stage=>{window.held={calls:0,aborted:false,release:null};window.fetch=(_url,options={})=>{
              held.calls++;options.signal?.addEventListener('abort',()=>held.aborted=true,{once:true});
              const stalled=new Promise(resolve=>held.release=resolve);
              return stage==='fetch'?stalled:Promise.resolve({ok:true,json:()=>stalled});};}""", held_stage)
        self.install(page)
        return page, calls, errors

    @staticmethod
    def install(page):
        page.add_style_tag(path=str(ROOT / 'styles_v2/common/public_tailwind_20260905.min.css'))
        page.add_script_tag(path=str(ROOT / 'vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js'))
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate('void set_main()')

    def assert_failure(self, page):
        page.get_by_role('alert').wait_for()
        self.assertEqual(page.get_by_role('button', name='다시 시도').count(), 0)
        self.assertNotIn(ITEM['title'], page.locator('#div_main').inner_text())
        self.assertEqual(page.locator('#div_community_read_content .animate-pulse, #div_community_read_comment .animate-pulse').count(), 0)

    def test_desktop_mobile_list_link_reads_exact_same_identity(self):
        for width in [1440, 390]:
            with self.subTest(width=width):
                page, calls, errors = self.render([{'body': {'count': {'cnt': 1}, 'list': {'0': ITEM}}}, {'body': ITEM}], start='list', width=width)
                link = page.locator('article a').first
                link.wait_for(state='visible')
                self.assertEqual(link.get_attribute('href'), '/intro/notice/read/'+ID+'/')
                link.click()
                self.install(page)
                page.get_by_text(ITEM['content'], exact=True).wait_for()
                self.assertIn('name="orderID"\r\n\r\n'+ID, calls[-1]['body'])
                self.assertEqual(errors, [])
                self.assertTrue(page.evaluate('document.documentElement.scrollWidth<=innerWidth'))

    def test_stalled_fetch_and_body_finish_at_45s_without_late_record(self):
        for stage in ['fetch', 'body']:
            with self.subTest(stage=stage):
                page, _, errors = self.render([], held_stage=stage)
                page.wait_for_function('held.release!==null')
                page.clock.fast_forward(45001)
                self.assert_failure(page)
                self.assertTrue(page.evaluate('held.aborted'))
                page.evaluate('([stage,data])=>held.release(stage===\'body\'?data:{ok:true,json:()=>Promise.resolve(data)})', [stage, ITEM])
                page.wait_for_timeout(20)
                self.assert_failure(page)
                self.assertEqual(page.evaluate('held.calls'), 1)
                self.assertEqual(errors, [])

    def test_list_timeout_is_unavailable_without_fabricated_empty_or_retry(self):
        page, _, errors = self.render([], start='list', held_stage='body')
        page.wait_for_function('held.release!==null')
        page.clock.fast_forward(45001)
        self.assert_failure(page)
        self.assertNotIn('표시할 공지사항이 없습니다.', page.locator('#div_main').inner_text())
        self.assertEqual(errors, [])

    def test_authoritative_denial_has_one_read_no_record_no_retry(self):
        for status in [401,403,404]:
            with self.subTest(status=status):
                page, calls, errors = self.render([{'status':status,'body':ITEM}])
                self.assert_failure(page)
                self.assertEqual(len(calls),1)
                self.assertEqual(page.get_by_role('link',name='목록',exact=True).get_attribute('href'),'/intro/notice/')
                self.assertEqual(errors, [])

    def test_transient_failure_keeps_original_four_attempt_limit_and_no_false_notfound(self):
        page, calls, errors = self.render([{'status':503,'body':ITEM}])
        page.clock.run_for(20)
        self.assert_failure(page)
        self.assertEqual(len(calls),4)
        self.assertNotIn('찾을 수 없습니다',page.locator('#div_main').inner_text())
        page.clock.run_for(60000)
        self.assertEqual(len(calls),4)
        self.assertEqual(errors, [])

    def test_wrong_identity_never_renders_looks_valid_article(self):
        page, calls, errors = self.render([{'body':{**ITEM,'uuid':'22222222-2222-4222-8222-222222222222'}}])
        page.clock.run_for(20)
        self.assert_failure(page)
        self.assertEqual(len(calls),4)
        self.assertEqual(errors, [])

    def test_new_root_retires_previous_fetch_before_rendering_new_read(self):
        page, _, errors = self.render([], held_stage='body')
        page.wait_for_function('held.release!==null')
        page.evaluate('window.oldHeld=held;window.fetch=url=>Promise.resolve({ok:true,json:()=>Promise.resolve(url.includes("/get_read_article/")?'+json.dumps(ITEM)+':{})});void set_main();')
        page.get_by_text(ITEM['content'],exact=True).wait_for()
        self.assertTrue(page.evaluate('oldHeld.aborted'))
        page.evaluate('oldHeld.release({uuid:"wrong",title:"Obsolete notice",content:"obsolete"})')
        page.wait_for_timeout(20)
        self.assertNotIn('Obsolete notice',page.locator('#div_main').inner_text())
        self.assertEqual(errors, [])

    def test_viewer_or_locale_change_cannot_paint_previous_read(self):
        for change in ['window.gv_username="different"','document.documentElement.lang="en"']:
            with self.subTest(change=change):
                page, _, errors = self.render([],held_stage='body')
                page.wait_for_function('held.release!==null')
                page.evaluate(change)
                page.evaluate('held.release('+json.dumps(ITEM)+')')
                page.clock.run_for(20)
                self.assertNotIn(ITEM['title'],page.locator('#div_main').inner_text())
                self.assertEqual(errors, [])

    def test_late_header_viewer_handoff_uses_fresh_response_and_keeps_body_independent(self):
        for width in [1440, 390]:
            for change in ['window.gv_role="관리자"', 'window.gv_username="Current member"']:
                with self.subTest(width=width, change=change):
                    page, _, errors = self.render([], held_stage='body', width=width)
                    page.wait_for_function('held.release!==null')
                    page.evaluate("""() => {
                      window.oldHeld=held;window.freshReads=0;window.relatedReads=0;
                      window.fetch=url=>{
                        if(url.includes('/get_read_article/')) { freshReads++;return Promise.resolve({ok:true,json:async()=>({
                          uuid:orderID,title:'Fresh viewer title',content:'Fresh authorized body',category_url:'notice',check_reader:'user',is_secret:0,attachments:[]
                        })}); }
                        relatedReads++;return new Promise(()=>{});
                      };
                    }""")
                    page.evaluate(change)
                    page.evaluate('oldHeld.release('+json.dumps(ITEM)+')')
                    page.get_by_text('Fresh authorized body', exact=True).wait_for()
                    self.assertNotIn(ITEM['content'], page.locator('#div_main').inner_text())
                    self.assertEqual(page.evaluate('freshReads'), 1)
                    self.assertEqual(page.evaluate('relatedReads'), 1)
                    self.assertEqual(errors, [])

    def test_viewer_handoff_does_not_extend_deadline_or_four_attempts(self):
        page, _, errors = self.render([], held_stage='body')
        page.wait_for_function('held.release!==null')
        page.clock.fast_forward(20000)
        page.evaluate('window.oldHeld=held;window.gv_role="관리자";oldHeld.release('+json.dumps(ITEM)+')')
        page.clock.run_for(20)
        self.assertEqual(page.evaluate('held.calls'), 2)
        page.clock.fast_forward(25001)
        self.assert_failure(page)
        self.assertEqual(page.evaluate('held.calls'), 2)
        self.assertEqual(errors, [])

        page, _, errors = self.render([], held_stage='body')
        page.wait_for_function('held.release!==null')
        page.evaluate("""() => {
          window.oldHeld=held;window.churnReads=1;
          window.fetch=()=>{churnReads++;window.gv_role=String(churnReads);return Promise.resolve({ok:true,json:async()=>({})});};
          window.gv_role='1';oldHeld.release({});
        }""")
        page.clock.run_for(20)
        self.assert_failure(page)
        self.assertEqual(page.evaluate('churnReads'), 4)
        self.assertEqual(errors, [])

    def test_viewer_change_cannot_replay_terminal_denial(self):
        page, _, errors = self.render([], held_stage='fetch')
        page.wait_for_function('held.release!==null')
        page.evaluate('window.gv_role="관리자";held.release({ok:false,status:403})')
        self.assert_failure(page)
        self.assertEqual(page.evaluate('held.calls'), 1)
        self.assertEqual(errors, [])

    def test_body_renderer_failure_is_scoped_and_finite(self):
        page, _, errors = self.render([], held_stage='body')
        page.wait_for_function('held.release!==null')
        page.evaluate('WebRSolidEdit.renderContent=()=>{throw Error("controlled viewer unavailable")};held.release('+json.dumps(ITEM)+')')
        page.get_by_text('본문을 표시할 수 없습니다. 잠시 후 다시 확인해 주세요.', exact=True).wait_for()
        self.assertIn(ITEM['title'], page.locator('#div_community_read_header').inner_text())
        self.assertEqual(page.locator('#div_community_read_content .animate-pulse').count(), 0)
        self.assertEqual(errors, [])


if __name__ == '__main__':
    unittest.main()
