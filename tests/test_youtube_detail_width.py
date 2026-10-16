"""Actual renderer/layout controls with synthetic records; all requests aborted."""
import json
import os
from pathlib import Path
import unittest

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'scripts_go/web_r_go_20260629_1025'
RENDERER = ASSETS / 'scripts_v2/workshop/youtube/set_main_comment_mini_20260930_first_paint.js'
STYLES = (
    ASSETS / 'styles_v2/common/public_tailwind_20260905.min.css',
    ASSETS / 'vendor/flowbite/flowbite_4_0_1.min.css',
    ROOT / 'styles/webr_go_typography_20260504_0027.css',
    ROOT / 'styles/webr_go_page_header_20260506_1645.css',
    ROOT / 'scripts/common/scroll_hide/scroll_hide.css',
    ROOT / 'styles/legacy_shell_20260503_1355.css',
    ROOT / 'styles/legacy_content_width_20260511.css',
)
ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
LONG_TOKEN = 'RPackageWithoutBreak' * 12


class YouTubeDetailWidthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            headless=True, executable_path=os.environ.get('CHROMIUM_EXECUTABLE_PATH') or None)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, width, case):
        page = self.browser.new_page(viewport={'width': width, 'height': 1000})
        self.addCleanup(page.close)
        # No server, account, provider, embedded player or font request is sent.
        page.route('**/*', lambda route: route.abort())
        page.set_content('<html lang="ko"><div id="div_main"></div></html>')
        for path in STYLES:
            page.add_style_tag(path=str(path))
        page.add_script_tag(path=str(ASSETS / 'vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js'))
        page.evaluate("""Object.assign(window,{url:'youtube',mode:'read',init_url:'/workshop/youtube/',
          orderID:'11111111-1111-4111-8111-111111111111',gv_username:'',gv_role:'guest',
          WebRSolidEdit:{renderContent:(target,content)=>target.innerHTML=content}})""")
        page.add_script_tag(path=str(RENDERER))
        item = {'uuid': ARTICLE_ID, 'title': 'Subsetting objects in R', 'content': '<p>Public fixture body.</p>',
                'youtube_url': 'https://www.youtube.com/watch?v=abcdefghijk', 'youtube_publish_date': '2026-10-15',
                'youtube_views': 1234, 'user_nickname': 'Fixture channel', 'check_reader': 'user'}
        sidebar = dict(item)
        if case == 'long_primary_title':
            item['title'] = LONG_TOKEN
        elif case == 'long_body':
            item['content'] = '<p>' + LONG_TOKEN + '</p>'
        elif case == 'long_sidebar_title':
            sidebar['title'] = LONG_TOKEN
        page.evaluate("""({item,sidebar})=>{
          ReactDOM.render(React.createElement(YouTubeReadPage),document.getElementById('div_main'));
          data_article=item;render_article();
          ReactDOM.render(React.createElement(Div_new_article_list,{data:sidebar}),document.getElementById('div_article_famous_list'));
        }""", {'item': item, 'sidebar': sidebar})
        page.evaluate('()=>document.fonts.ready')
        return page, item, sidebar

    def assert_layout(self, page, width, item, sidebar):
        values = page.evaluate("""()=>{
          const grid=document.getElementById('div_community_read_header').parentElement;
          const frame=document.querySelector('#div_community_read_youtube iframe');
          const bounds=frame.getBoundingClientRect();
          return {width:innerWidth,scroll:document.documentElement.scrollWidth,
            globalOverflow:['html','body','#div_main'].map(s=>getComputedStyle(document.querySelector(s)).overflowX),
            columns:getComputedStyle(grid).gridTemplateColumns.split(' '),
            frame:{left:bounds.left,right:bounds.right,width:bounds.width,height:bounds.height},
            title:document.querySelector('#div_community_read_header h1').textContent,
            body:document.querySelector('#div_community_read_content').textContent,
            sidebarTitle:document.querySelector('#div_article_famous_list a').textContent,
            sidebarHref:document.querySelector('#div_article_famous_list a').getAttribute('href')};
        }""")
        self.assertEqual(values['width'], width)
        self.assertLessEqual(values['scroll'], width + 1, values)
        self.assertEqual(values['title'], item['title'])
        self.assertIn('Public fixture body.' if item['content'].startswith('<p>Public') else LONG_TOKEN, values['body'])
        self.assertIn(sidebar['title'], values['sidebarTitle'])
        self.assertEqual(values['sidebarHref'], '/workshop/youtube/read/' + ARTICLE_ID + '/')
        self.assertTrue(all(v not in ('hidden', 'clip') for v in values['globalOverflow']), values)
        self.assertGreater(values['frame']['width'], 0)
        self.assertGreater(values['frame']['height'], 0)
        self.assertGreaterEqual(values['frame']['left'], -1)
        self.assertLessEqual(values['frame']['right'], width + 1)
        return values

    def test_mobile_long_fields_stay_inside_viewport_without_hiding_content(self):
        for width in (390, 320):
            for case in ('normal', 'long_primary_title', 'long_body', 'long_sidebar_title'):
                with self.subTest(width=width, case=case):
                    page, item, sidebar = self.render(width, case)
                    values = self.assert_layout(page, width, item, sidebar)
                    self.assertEqual(len(values['columns']), 1)

    def test_desktop_keeps_two_columns_and_complete_text_links(self):
        for case in ('normal', 'long_primary_title', 'long_body', 'long_sidebar_title'):
            with self.subTest(case=case):
                page, item, sidebar = self.render(1440, case)
                values = self.assert_layout(page, 1440, item, sidebar)
                self.assertEqual(len(values['columns']), 2)


if __name__ == '__main__':
    unittest.main()
