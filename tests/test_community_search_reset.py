import json
import os
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "scripts_go/web_r_go_20260629_1025"
SCRIPT = Path(os.environ.get("COMMUNITY_SEARCH_TEST_SCRIPT", ASSETS / "scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js"))


class CommunitySearchResetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def render(self, tag):
        page = self.browser.new_page()
        page.set_default_timeout(2000)
        self.addCleanup(page.close)
        errors, external = [], []
        page.on("pageerror", lambda error: errors.append(str(error)))

        def route(request):
            external.append(request.request.url)
            if request.request.url == "https://search.test/community/":
                request.fulfill(status=200, content_type="text/html", body='<div id="div_main"></div>')
            else:
                request.abort()

        page.route("**/*", route)
        page.goto("https://search.test/community/")
        page.add_script_tag(path=str(ASSETS / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"))
        page.evaluate("window.url=" + json.dumps(tag))
        page.evaluate("""() => {
          window.sub=''; window.mode=''; window.gv_username=''; window.gv_role='';
          window.header_title='Community'; window.header_subtitle=''; window.init_url='/community/';
          window.WebRI18n={language:'ko'}; window.getCookie=()=> 'fixture-csrf';
          window.Div_page_header=p=>React.createElement('h1',null,p.title);
          window.Div_box_header=p=>React.createElement('h2',null,p.title,p.count);
          window.__calls=[];window.__alerts=[];window.alert=t=>window.__alerts.push(t);
          window.fetch=async(endpoint,init={})=>{
            const form=Object.fromEntries(init.body.entries());window.__calls.push({endpoint,form});
            if(!endpoint.endsWith('/get_article_list/'))return new Response('{}',{status:200});
            const n=form.txt_search?1:3;
            const list={};
            for(let i=0;i<n;i++)list[i]={uuid:'00000000-0000-4000-8000-00000000000'+i,
              title:i===0?'Known result':'Other row '+i,category_url:form.tag,
              created_at:'2026-10-09 00:00:00',user_nickname:'Fixture'};
            return new Response(JSON.stringify({count:{cnt:n},list}),{status:200});
          };
        }""")
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate("renderListPageShell();void getCommunityBoardCards()")
        page.locator('#div_community_card_' + tag).get_by_text('Other row 2', exact=True).wait_for()
        return page, errors, external

    def test_clearing_search_restores_complete_list_for_every_public_board(self):
        for tag in ('free', 'notebook', 'rcommunity'):
            with self.subTest(tag=tag):
                page, errors, external = self.render(tag)
                search = page.locator('#txt_search')
                search.fill('Known')
                search.press('Enter')
                card = page.locator('#div_community_card_' + tag)
                page.wait_for_function("communityState.cardCounters[window.url]===1")
                self.assertNotIn('Other row 2', card.inner_text())
                search.fill('')
                search.press('Enter')
                card.get_by_text('Other row 2', exact=True).wait_for()
                self.assertEqual(page.evaluate('communityState.cardCounters[window.url]'), 3)
                self.assertEqual(page.evaluate('communityState.cardPages[window.url]'), 1)
                calls = page.evaluate("window.__calls.filter(c=>c.endpoint.endsWith('/get_article_list/'))")
                self.assertEqual([c['form'].get('txt_search', '') for c in calls], ['', 'Known', ''])
                self.assertTrue(all(c['form']['tag'] == tag and c['form']['page'] == '1' for c in calls))
                self.assertEqual(page.evaluate('window.__alerts'), [])
                self.assertEqual(errors, [])
                self.assertEqual(external, ['https://search.test/community/'])


if __name__ == '__main__':
    unittest.main()
