"""Offline selected Home assets: titles retain text and wrap within their card."""
import os
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "scripts_go/web_r_go_20260629_1025"
SCRIPTS = ASSETS / "scripts_v2/index"
CURRENT_TITLE = "Web-R 2.0에 PubMed WordCloud가 추가되었습니다"
NOTICE_ID = "11111111-1111-4111-8111-111111111111"


class NoticeTitleWidth(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            headless=True,
            executable_path=os.environ.get("WEBR_CHROMIUM_EXECUTABLE"),
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, width, title):
        page = self.browser.new_page(viewport={"width": width, "height": 1200})
        self.addCleanup(page.close)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.route("**/*", lambda route: route.fulfill(
            status=200, content_type="text/html",
            body='<html lang="ko"><body style="margin:0"><div id="div_main"></div></body></html>',
        ) if route.request.url == "https://home.test/" else route.abort())
        page.goto("https://home.test/")
        page.evaluate("""({title,id}) => {
          window.__noticeCalls = 0;
          window.fetch = (url) => {
            const u = new URL(url, location.href);
            if (u.pathname === '/ajax_index_notice/') {
              window.__noticeCalls++;
              const rows = {};
              for (let i = 0; i < 4; i++) rows[i] = {
                uuid: i ? id.slice(0,-1) + i : id,
                title: i ? '다른 공지 ' + i : title,
                created_at: '2026-10-16T09:00:00Z', is_new: true
              };
              return Promise.resolve(new Response(JSON.stringify(rows), {status:200}));
            }
            if (u.pathname === '/homepage/content-summary/' && u.searchParams.has('section')) {
              return Promise.resolve(new Response(JSON.stringify({
                schema:'webr.home-card.v1', section:u.searchParams.get('section'),
                ok:true, complete:false, unavailable:true, items:[]
              }), {status:200}));
            }
            throw Error('Unexpected fixture request');
          };
        }""", {"title": title, "id": NOTICE_ID})
        page.add_style_tag(path=str(ASSETS / "styles_v2/index/home_compact_portal_20260729_1530.css"))
        for name in ("set_main_compact_portal_20261015_independent_cards.js",
                     "home_summary_terminal_guard_20261011_1930.js"):
            page.add_script_tag(path=str(SCRIPTS / name))
        page.evaluate("window.set_main()")
        page.wait_for_function("document.querySelectorAll('.webr-home-compact__notice').length === 3")
        return page, errors

    def assert_geometry(self, page, title):
        result = page.locator(".webr-home-compact__notice").first.evaluate("""a => {
          const t = a.querySelector('.webr-home-compact__notice-title');
          const badge = a.querySelector('.webr-home-compact__new');
          const date = a.querySelector('.webr-home-compact__notice-date');
          const row = t.parentElement;
          const box = e => { const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}; };
          const s = getComputedStyle(t);
          return {text:t.textContent,title:t.title,fullTitle:t.dataset.fullTitle,
            href:a.getAttribute('href'),lines:Number(s.webkitLineClamp),
            lineHeight:parseFloat(s.lineHeight),whiteSpace:s.whiteSpace,
            card:box(a),textBox:box(t),badge:box(badge),row:box(row),date:box(date),
            dateText:date.textContent,scrollWidth:document.documentElement.scrollWidth,
            viewport:innerWidth,noticeCalls:window.__noticeCalls};
        }""")
        self.assertEqual(result["text"], title)
        self.assertEqual(result["title"], title)
        self.assertEqual(result["fullTitle"], title)
        self.assertEqual(result["href"], f"/intro/notice/read/{NOTICE_ID}/")
        self.assertEqual(result["lines"], 2)
        self.assertEqual(result["whiteSpace"], "normal")
        self.assertLessEqual(result["textBox"]["height"], 2 * result["lineHeight"] + 1)
        self.assertLessEqual(result["scrollWidth"], result["viewport"])
        self.assertGreater(result["badge"]["width"], 0)
        self.assertLessEqual(result["textBox"]["right"], result["badge"]["left"] + 1)
        self.assertLessEqual(result["badge"]["right"], result["card"]["right"])
        self.assertGreaterEqual(result["date"]["top"], result["row"]["bottom"])
        self.assertTrue(result["dateText"])
        self.assertEqual(result["noticeCalls"], 1)

    def test_actual_title_full_text_and_native_two_line_layout(self):
        for width in (320, 390, 619, 1440):
            with self.subTest(viewport=width):
                page, errors = self.render(width, CURRENT_TITLE)
                self.assert_geometry(page, CURRENT_TITLE)
                if width == 1440:
                    # The reported wide card must use its width, not a character count.
                    page.locator('.webr-home-compact__notice').first.evaluate(
                        "a => {a.style.width='619px';a.style.maxWidth='none';}"
                    )
                    self.assert_geometry(page, CURRENT_TITLE)
                self.assertEqual(errors, [])

    def test_long_word_bound_metadata_and_mutation_idempotence(self):
        title = "긴공지" + "A" * 197
        for width in (320, 390, 619, 1440):
            with self.subTest(viewport=width):
                page, errors = self.render(width, title)
                expected = title
                self.assert_geometry(page, expected)
                page.evaluate("""() => {
                  window.__mutations=0;
                  const root=document.getElementById('webr-home-portal');
                  window.__watch=new MutationObserver(rows => {window.__mutations += rows.length;});
                  window.__watch.observe(root,{childList:true,subtree:true});
                  root.querySelector('.webr-home-compact__notice-title').textContent='temporary';
                }""")
                page.wait_for_function("document.querySelector('.webr-home-compact__notice-title').textContent.length===200")
                page.wait_for_timeout(20)
                settled = page.evaluate("window.__mutations")
                self.assertLessEqual(settled, 3)
                page.wait_for_timeout(20)
                self.assertEqual(page.evaluate("window.__mutations"), settled)
                self.assert_geometry(page, expected)
                self.assertEqual(errors, [])
        page, errors = self.render(390, title + "B" * 40)
        self.assert_geometry(page, title[:199] + "…")
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
