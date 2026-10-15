"""Controlled Chromium list/detail proof; no DB, auth or live recovery claim."""
import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1] / "scripts_go/web_r_go_20260629_1025"
SCRIPT = ROOT / "scripts_v2/workshop/workshop/catalog_20260630_2323_image_fallback.js"
ID = "public-workshop"
READ = "/workshop/ajax_read/"
BOARD = "/workshop/ajax_board/list/"
ITEM = {"uuid": ID, "slug": "public-alias", "board_key": "canonical-board", "external_id": "event-alias",
        "title": "Current public R workshop", "description": "Verified workshop description",
        "active": True, "status": "published", "registration_mode": "closed"}
COMPLETE = {"ok": True, "workshop": ITEM, "posts": [], "is_admin": False,
            "is_logged_in": False, "current_user_uuid": ""}


class WorkshopDetailRecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def render(self, scenarios, *, width=1440, target=ID, start="read", native_stage=None):
        page = self.browser.new_page(viewport={"width": width, "height": 900})
        page.set_default_timeout(2500)
        self.addCleanup(page.close)
        calls, held, errors = [], [], []
        pending = {path: list(values) for path, values in scenarios.items()}
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.add_init_script("""window.__webr_globals__={mode:location.pathname==='/workshop/'?'list':'read',
          orderID:decodeURIComponent(location.pathname.split('/')[3]||'')};
          window.primaryMax=0;window.primaryActive=0;window.primaryAborts=0;
          const nativeFetch=window.fetch.bind(window);window.fetch=(url,options={})=>{
            if(new URL(url,location.href).pathname!=='/workshop/ajax_read/')return nativeFetch(url,options);
            primaryMax=Math.max(primaryMax,++primaryActive);
            options.signal?.addEventListener('abort',()=>primaryAborts++,{once:true});
            return nativeFetch(url,options).finally(()=>primaryActive--);
          };""")

        def respond(route):
            path = urlsplit(route.request.url).path
            if route.request.is_navigation_request():
                route.fulfill(status=200, content_type="text/html", body='<html lang="ko"><div id="div_main"></div></html>')
            elif path in pending:
                calls.append({"path": path, "body": route.request.post_data})
                queue = pending[path]
                value = queue.pop(0) if len(queue) > 1 else queue[0]
                if value.get("hold"):
                    held.append(route)
                elif value.get("network"):
                    route.abort("failed")
                else:
                    route.fulfill(status=value.get("status", 200), content_type="application/json",
                                  body=json.dumps(value.get("body")))
            else:
                route.abort()

        def cleanup():
            for route in held:
                try:
                    route.abort()
                except Exception:
                    pass
            page.unroute_all(behavior="ignoreErrors")
        self.addCleanup(cleanup)
        page.route("**/*", respond)
        page.goto("https://workshop.test/workshop/" + ("" if start == "list" else "read/" + target + "/"))
        page.clock.install()
        if native_stage:
            page.evaluate("""stage => {
              window.readHeld={calls:0,aborted:false,release:null};
              window.fetch=(_url, options={})=>{
                readHeld.calls++;options.signal?.addEventListener('abort',()=>readHeld.aborted=true,{once:true});
                const stalled=new Promise(resolve=>{readHeld.release=resolve;});
                return stage==='fetch'?stalled:Promise.resolve({ok:true,json:()=>stalled});
              };}
            """, native_stage)
        self.install(page)
        return page, calls, held, errors

    @staticmethod
    def install(page):
        page.add_style_tag(path=str(ROOT / "styles_v2/common/public_tailwind_20260905.min.css"))
        page.add_script_tag(path=str(ROOT / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"))
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate("set_main()")

    @staticmethod
    def assert_body(page):
        page.get_by_role("heading", name=ITEM["title"], exact=True).wait_for()
        assert "Verified workshop description" in page.locator("#div_main").inner_text()
        assert page.locator("[data-workshop-read-progress], [data-workshop-read-error]").count() == 0

    def assert_error(self, page, retry=True):
        page.locator("[data-workshop-read-error]").wait_for()
        self.assertEqual(page.locator("[data-workshop-read-progress]").count(), 0)
        self.assertEqual(page.locator("[data-workshop-read-error] button").count(), 0)
        self.assertNotIn(ITEM["title"], page.locator("#div_main").inner_text())

    def resolve_header(self, page, role):
        page.evaluate('''role => {
          document.body.insertAdjacentHTML('afterbegin','<div id="div_menu_sub_header"></div>');
          const original = window.fetch;
          window.fetch=(url,init)=>url==='/ajax_get_menu_header/'?
            Promise.resolve(new Response(JSON.stringify({role,name:'Controlled viewer'}))):original(url,init);
        }''', role)
        page.add_script_tag(path=str(ROOT / 'scripts_v2/common/header/header_product_20260927_1610.js'))
        page.evaluate('void get_menu_header()')
        page.wait_for_function('role=>window.gv_role===role', arg=role)

    def test_actual_late_header_role_discards_old_detail_and_reads_current_body(self):
        for role in ('관리자', '정회원', ''):
            for width in (1440, 390):
                with self.subTest(role=role, width=width):
                    page, calls, held, errors = self.render({READ: [{'hold': True}, {'body': COMPLETE}]}, width=width)
                    page.wait_for_function('primaryActive===1')
                    self.resolve_header(page, role)
                    first = {**COMPLETE,'workshop':{**ITEM,'title':'Discarded prior role'}} if role else COMPLETE
                    held[0].fulfill(status=200,content_type='application/json',body=json.dumps(first))
                    self.assert_body(page)
                    self.assertNotIn('Discarded prior role', page.locator('#div_main').inner_text())
                    self.assertEqual(sum(c['path']==READ for c in calls), 2 if role else 1)
                    self.assertEqual(page.evaluate('primaryMax'), 1)
                    self.assertEqual(page.evaluate('String(window.gv_username||"")'), '')
                    self.assertEqual(errors, [])

    def test_role_handoff_secondary_board_remains_separate_from_ready_detail(self):
        page, calls, held, errors = self.render({READ: [{'body': {**COMPLETE,'board_error':'pending source'}}],
            BOARD:[{'hold':True},{'body':{'ok':True,'posts':[{'uuid':'post','title':'Fresh current post','content':'Current board body'}],'is_logged_in':False}}]})
        self.assert_body(page)
        page.wait_for_function("document.querySelector('[data-workshop-board-progress]')!==null")
        self.resolve_header(page, '정회원')
        held[0].fulfill(status=200,content_type='application/json',body=json.dumps(
            {'ok':True,'posts':[{'uuid':'old','title':'Discarded prior board','content':'Old body'}]}))
        page.get_by_role('heading',name='Fresh current post',exact=True).wait_for()
        self.assert_body(page)
        self.assertNotIn('Discarded prior board',page.locator('#div_main').inner_text())
        self.assertEqual(sum(c['path']==READ for c in calls),1)
        self.assertEqual(sum(c['path']==BOARD for c in calls),2)
        self.assertEqual(errors,[])

    def test_role_handoff_preserves_terminal_denial_and_single_45_second_deadline(self):
        for status in (401,403,404):
            page,calls,held,errors=self.render({READ:[{'hold':True}]})
            page.wait_for_function('primaryActive===1')
            self.resolve_header(page,'관리자')
            held[0].fulfill(status=status,content_type='application/json',body='{}')
            self.assert_error(page)
            self.assertEqual(len(calls),1)
            self.assertEqual(errors,[])
        page,calls,held,errors=self.render({READ:[{'hold':True},{'hold':True}]})
        page.wait_for_function('primaryActive===1')
        page.clock.run_for(44000)
        self.resolve_header(page,'정회원')
        held[0].fulfill(status=200,content_type='application/json',body=json.dumps(COMPLETE))
        page.wait_for_function('primaryActive===1 && primaryAborts===0')
        page.wait_for_timeout(20)
        page.clock.run_for(1000)
        self.assert_error(page)
        self.assertEqual(len(calls),2)
        self.assertEqual(errors,[])

    def test_desktop_and_mobile_list_card_click_reaches_same_detail(self):
        for width in [1440, 390]:
            with self.subTest(width=width):
                page, calls, held, errors = self.render({"/workshop/ajax_list/": [{"body": {
                    "ok": True, "complete": True, "workshops": [ITEM]}}], READ: [{"body": COMPLETE}]}, width=width, start="list")
                link = page.get_by_role("link", name="자세히 보기", exact=True)
                self.assertEqual(link.get_attribute("href"), "/workshop/read/" + ID + "/")
                link.click()
                self.assertTrue(page.url.endswith("/workshop/read/" + ID + "/"))
                self.install(page)
                self.assert_body(page)
                self.assertEqual(sum(c["path"] == READ for c in calls), 1)
                self.assertEqual(errors, [])
                self.assertTrue(page.evaluate("document.documentElement.scrollWidth<=innerWidth"))

    def test_board_key_only_public_card_reaches_original_detail_identity(self):
        item = {**ITEM, "uuid": "", "slug": "", "external_id": ""}
        page, calls, held, errors = self.render({"/workshop/ajax_list/": [{"body": {
            "ok": True, "complete": True, "workshops": [item]}}], READ: [{"body": {**COMPLETE, "workshop": item}}]}, start="list")
        link = page.get_by_role("link", name="자세히 보기", exact=True)
        self.assertEqual(link.get_attribute("href"), "/workshop/read/canonical-board/")
        link.click()
        self.install(page)
        self.assert_body(page)
        self.assertIn("uuid=canonical-board", calls[-1]["body"])
        self.assertEqual(errors, [])

    def test_failed_write_releases_cancelled_secondary_read_progress(self):
        # Controlled server rights only: no real login, write or account changes.
        initial = {**COMPLETE, "is_logged_in": True, "board_error": "retry board"}
        page, calls, held, errors = self.render({READ: [{"body": initial}], BOARD: [{"hold": True}],
            "/workshop/ajax_board/save/": [{"body": {"ok": False, "error": "Controlled write denied"}}]})
        self.assert_body(page)
        page.locator("[data-workshop-board-progress]").wait_for()
        page.get_by_placeholder("제목", exact=True).fill("Controlled draft")
        page.get_by_role("button", name="글쓰기", exact=True).click()
        page.get_by_text("Controlled write denied", exact=True).wait_for()
        self.assertEqual(page.locator("[data-workshop-board-progress]").count(), 0)
        self.assertNotIn("게시글이 없습니다.", page.locator("#div_main").inner_text())
        self.assertEqual(errors, [])

    def test_hanging_fetch_and_body_stop_at_original_45s_without_late_paint(self):
        for stage in ["fetch", "body"]:
            with self.subTest(stage=stage):
                page, calls, held, errors = self.render({}, native_stage=stage)
                page.locator("[data-workshop-read-progress]").wait_for()
                page.wait_for_function("readHeld.release!==null")
                page.clock.fast_forward(45001)
                self.assert_error(page)
                self.assertTrue(page.evaluate("readHeld.aborted"))
                response = {"ok": True, "body": COMPLETE}
                page.evaluate("([stage,data])=>readHeld.release(stage==='body'?data:{ok:true,json:()=>Promise.resolve(data)})", [stage, COMPLETE])
                page.wait_for_timeout(30)
                self.assert_error(page)
                self.assertEqual(errors, [])

    def test_http_failure_cannot_render_even_with_valid_looking_body_and_fresh_navigation_recovers(self):
        page, calls, held, errors = self.render({READ: [{"status": 503, "body": COMPLETE}, {"body": COMPLETE}]})
        self.assert_error(page)
        self.assertNotIn("워크샵을 찾을 수 없습니다.", page.locator("#div_main").inner_text())
        page.reload(); self.install(page)
        self.assert_body(page)
        self.assertEqual(sum(c["path"] == READ for c in calls), 2)
        self.assertEqual(errors, [])

    def test_denials_and_confirmed_missing_are_terminal_without_retry(self):
        for status, body in [(401, COMPLETE), (403, COMPLETE), (404, COMPLETE),
                             (200, {"ok": False, "error": "워크샵을 찾을 수 없습니다."})]:
            with self.subTest(status=status, body=body):
                page, calls, held, errors = self.render({READ: [{"status": status, "body": body}]})
                self.assert_error(page, retry=False)
                page.clock.fast_forward(45001)
                self.assertEqual(len(calls), 1)
                self.assertEqual(errors, [])

    def test_wrong_identity_and_control_payload_never_become_details(self):
        for body in [{**COMPLETE, "workshop": {**ITEM, "uuid": "other", "slug": "", "board_key": "", "external_id": ""}},
                     {"ok": False, "pending": True}, {"ok": True, "workshop": {"uuid": ID}}]:
            with self.subTest(body=body):
                page, calls, held, errors = self.render({READ: [{"body": body}]})
                self.assert_error(page)
                self.assertEqual(len(calls), 1)
                self.assertEqual(errors, [])

    def test_canonical_board_slug_and_external_id_aliases_keep_exact_backend_contract(self):
        for target in [ITEM["slug"], ITEM["board_key"], ITEM["external_id"]]:
            page, calls, held, errors = self.render({READ: [{"body": COMPLETE}]}, target=target)
            self.assert_body(page)
            self.assertIn("uuid=" + target, calls[0]["body"])
            self.assertEqual(errors, [])

    def test_duplicate_calls_and_pagehide_keep_one_owner_and_no_late_result(self):
        page, calls, held, errors = self.render({READ: [{"hold": True}]})
        page.locator("[data-workshop-read-progress]").wait_for()
        page.evaluate("set_main();set_main()")
        self.assertEqual(len(calls), 1)
        page.evaluate("dispatchEvent(new PageTransitionEvent('pagehide'))")
        page.wait_for_timeout(30)
        self.assertGreaterEqual(page.evaluate("primaryAborts"), 1)
        self.assertNotIn(ITEM["title"], page.locator("#div_main").inner_text())
        self.assertEqual(errors, [])

    def test_obsolete_route_root_locale_and_viewer_do_not_receive_unabortable_body(self):
        mutations = ["history.pushState({},'', '/workshop/read/other/')", "document.getElementById('div_main').outerHTML='<div id=div_main>new owner</div>'",
                     "document.documentElement.lang='en'", "window.gv_username='changed-viewer'"]
        for mutation in mutations:
            page, calls, held, errors = self.render({}, native_stage="body")
            page.locator("[data-workshop-read-progress]").wait_for()
            page.wait_for_function("readHeld.release!==null")
            page.evaluate(mutation)
            page.evaluate("data=>readHeld.release(data)", COMPLETE)
            page.wait_for_timeout(30)
            self.assertNotIn(ITEM["title"], page.locator("#div_main").inner_text())
            self.assertEqual(errors, [])

    def test_board_failure_keeps_detail_has_no_false_empty_and_fresh_navigation(self):
        with_board = {**COMPLETE, "board_error": "temporary source error"}
        page, calls, held, errors = self.render({READ: [{"body": with_board}], BOARD: [
            {"status": 503, "body": {"ok": True, "posts": []}},
            {"body": {"ok": True, "posts": [{"uuid": "post", "title": "Current workshop post", "content": "Current board body"}], "is_logged_in": False}}]})
        self.assert_body(page)
        page.locator("[data-workshop-board-error]").wait_for()
        self.assertNotIn("게시글이 없습니다.", page.locator("#div_main").inner_text())
        self.assertEqual(page.locator("[data-workshop-board-error] button").count(), 0)
        page.reload(); self.install(page)
        page.get_by_role("heading", name="Current workshop post", exact=True).wait_for()
        self.assertEqual(page.locator("[data-workshop-board-progress], [data-workshop-board-error]").count(), 0)
        self.assertEqual(errors, [])

    def test_board_hang_is_independently_bounded_and_terminal_denial_has_no_retry(self):
        for scenario in [{"hold": True}, {"status": 403, "body": {"ok": True, "posts": []}}]:
            page, calls, held, errors = self.render({READ: [{"body": {**COMPLETE, "board_error": "source error"}}], BOARD: [scenario]})
            self.assert_body(page)
            if scenario.get("hold"):
                page.locator("[data-workshop-board-progress]").wait_for()
                page.clock.fast_forward(45001)
            page.locator("[data-workshop-board-error]").wait_for()
            self.assertEqual(page.locator("[data-workshop-board-progress]").count(), 0)
            self.assertEqual(page.locator("[data-workshop-board-error] button").count(), 0)
            self.assertNotIn("게시글이 없습니다.", page.locator("#div_main").inner_text())
            self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
