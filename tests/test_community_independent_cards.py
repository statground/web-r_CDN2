"""Real card reads/rendering: one slow section must not queue a healthy sibling."""
import json
import os
from pathlib import Path
import unittest

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'scripts_go/web_r_go_20260629_1025'
SCRIPT = Path(os.environ.get('COMMUNITY_CARDS_TEST_SCRIPT', ASSETS /
    'scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js'))


class IndependentCardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def render(self, fast, width):
        page = self.browser.new_page(viewport={'width': width, 'height': 900})
        self.addCleanup(page.close)
        errors, unexpected = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def route(r):
            if r.request.url == 'https://cards.test/community/':
                r.fulfill(content_type='text/html', body='<html lang="ko"><div id="cards"></div></html>')
            else:
                unexpected.append(r.request.url)
                r.abort()

        page.route('**/*', route)
        page.goto('https://cards.test/community/')
        page.clock.install()
        page.add_script_tag(path=str(ASSETS / 'vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js'))
        page.evaluate('''fast => {
          Object.assign(window,{url:'all',sub:'',mode:'',gv_username:'',gv_role:'',
            WebRI18n:{language:'ko'},getCookie:()=>'',__fast:fast,__calls:[],__held:{},__aborts:[]});
          window.Div_box_header=p=>React.createElement('h2',null,p.title);
          window.fetch=(endpoint,init)=>{
            const tag=init.body.get('tag');
            window.__calls.push({endpoint,tag,form:[...init.body.entries()]});
            return new Promise((resolve,reject)=>{
              let settled=false;
              const finish=()=>{
                if(settled)return;settled=true;
                resolve(new Response(JSON.stringify({count:{cnt:1},list:{0:{
                  uuid:'11111111-1111-4111-8111-111111111111',title:'Ready '+tag,
                  category_url:tag,check_reader:'user',is_new:0}}})));};
              init.signal?.addEventListener('abort',()=>{
                if(settled)return;settled=true;window.__aborts.push(tag);
                reject(new DOMException('fixture cancel','AbortError'));},{once:true});
              if(tag===fast)finish();else window.__held[tag]=finish;
            });
          };
        }''', fast)
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate('''ReactDOM.render(React.createElement(CommunityCardShell),document.getElementById('cards'));
          window.__done=false;void getCommunityBoardCards().then(()=>window.__done=true);''')
        return page, errors, unexpected

    def test_each_card_starts_and_paints_before_two_slow_siblings(self):
        for fast in ('free', 'notebook', 'rcommunity'):
            for width in (1440, 390):
                with self.subTest(fast=fast, width=width):
                    page, errors, unexpected = self.render(fast, width)
                    page.wait_for_function('window.__calls.length===3', timeout=1000)
                    page.get_by_text('Ready ' + fast, exact=True).wait_for(timeout=1000)
                    self.assertFalse(page.evaluate('window.__done'))
                    for tag in ('free', 'notebook', 'rcommunity'):
                        if tag != fast:
                            self.assertGreater(page.locator('#div_community_card_' + tag + ' .animate-pulse').count(), 0)
                    self.assertEqual(page.evaluate('window.__calls.map(c=>c.tag)'), ['free', 'notebook', 'rcommunity'])
                    page.evaluate('Object.values(window.__held).forEach(f=>f())')
                    page.wait_for_function('window.__done')
                    for tag in ('free', 'notebook', 'rcommunity'):
                        page.get_by_text('Ready ' + tag, exact=True).wait_for()
                    self.assertEqual(page.evaluate('window.__calls.length'), 3)
                    self.assertEqual((errors, unexpected), ([], []))

    def test_pagehide_cancels_held_siblings_without_replaying_fast_card(self):
        page, errors, unexpected = self.render('rcommunity', 390)
        page.wait_for_function('window.__calls.length===3', timeout=1000)
        page.get_by_text('Ready rcommunity', exact=True).wait_for()
        page.evaluate('window.dispatchEvent(new PageTransitionEvent("pagehide"))')
        page.wait_for_function('window.__done')
        self.assertEqual(sorted(page.evaluate('window.__aborts')), ['free', 'notebook'])
        page.clock.run_for(45000)
        self.assertEqual(page.evaluate('window.__calls.length'), 3)
        self.assertEqual((errors, unexpected), ([], []))


if __name__ == '__main__':
    unittest.main()
