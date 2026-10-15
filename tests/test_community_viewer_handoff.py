"""Controlled role fixtures; no issued sessions or native/backend recovery claim."""
import json
import os
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "scripts_go/web_r_go_20260629_1025"
SCRIPT = Path(os.environ.get("COMMUNITY_ROLE_TEST_SCRIPT", ASSETS / "scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js"))
HEADER = ASSETS / "scripts_v2/common/header/header_product_20260927_1610.js"
VENDOR = ASSETS / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"


class CommunityViewerHandoffTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def render(self, role, *, width=1440, failure=None):
        page = self.browser.new_page(viewport={"width": width, "height": 900})
        page.set_default_timeout(2000)
        self.addCleanup(page.close)
        errors, requests = [], []
        page.on("pageerror", lambda error: errors.append(str(error)))

        def route(request):
            requests.append(request.request.url)
            if request.request.url == "https://roles.test/community/":
                request.fulfill(status=200, content_type="text/html", body='<div id="div_menu_sub_header"></div><div id="div_main"></div><p id="sibling">Healthy sibling</p>')
            else:
                request.abort()

        page.route("**/*", route)
        page.goto("https://roles.test/community/")
        page.clock.install()
        page.add_script_tag(path=str(VENDOR))
        page.evaluate("window.__role=" + json.dumps(role) + ";window.__failure=" + json.dumps(failure))
        page.evaluate("""() => {
          window.url='all';window.sub='';window.mode='';window.gv_username='';window.gv_role='';window.gv_is_admin=false;
          window.WEBR_CDN='https://unused.test/';window.WebRI18n={language:'ko'};window.getCookie=()=> 'controlled-csrf';
          window.__calls=[];window.__held=[];window.__counts={};window.__aborts=0;
          window.fetch=(endpoint,init={})=>{
            if(endpoint==='/ajax_get_menu_header/')return new Promise(resolve=>window.__header=()=>resolve(new Response(JSON.stringify({role:window.__role,name:window.__role?'Controlled viewer':''}))));
            const form=[...init.body.entries()];const tag=init.body.get('tag');const key=endpoint+'|'+tag;
            const ordinal=window.__counts[key]=(window.__counts[key]||0)+1;
            window.__calls.push({endpoint,tag,ordinal,at:performance.now(),csrf:init.headers['X-CSRFToken']});
            return new Promise((resolve,reject)=>{
              let settled=false;
              const finish=()=>{
                if(settled)return;settled=true;
                const old=ordinal===1 && tag!=='rcommunity';
                const denied=window.__failure==='denied';
                if(ordinal>1 && window.__failure==='body') {
                  resolve({status:200,ok:true,headers:new Headers(),json:()=>new Promise(()=>{})});return;
                }
                if(ordinal>1 && window.__failure==='hold')return;
                let body;
                const title=(old?'Discarded prior viewer':('Allowed '+(window.__role||'anonymous')))+' '+tag;
                if(endpoint.includes('get_article_list'))body={count:{cnt:{free:3,notebook:7,rcommunity:1145}[tag]},list:{0:{uuid:'controlled-'+tag,category_url:tag,title,check_reader:'user'}}};
                else if(endpoint.includes('get_new_comment'))body={0:{uuid:'controlled-comment',uuid_article:'controlled-free',article_category_url:'free',article_title:'Allowed article',content:old?'Discarded prior comment':'Allowed current comment'}};
                else body={0:{uuid:'controlled-popular',category_url:'free',title:old?'Discarded prior popular':'Allowed current popular'}};
                resolve(new Response(JSON.stringify(body),{status:denied&&ordinal>1?403:200}));
              };
              init.signal?.addEventListener('abort',()=>{window.__aborts++;if(settled)return;settled=true;reject(new DOMException('controlled abort','AbortError'));},{once:true});
              if(ordinal===1&&tag!=='rcommunity')window.__held.push(finish);else finish();
            });
          };
        }""")
        page.add_script_tag(path=str(ASSETS / "scripts_v2/common/div/page_header_20260506_2320.js"))
        page.add_script_tag(path=str(HEADER))
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate("window.__done=false;void set_main().then(()=>window.__done=true);void get_menu_header()")
        try:
            page.wait_for_function("window.__calls.length===4 && typeof window.__header==='function'")
        except Exception:
            raise AssertionError({"errors": errors, "calls": page.evaluate("window.__calls"), "header": page.evaluate("typeof window.__header")})
        page.evaluate("window.__header()")
        page.wait_for_function("window.gv_role===window.__role")
        self.assertEqual(page.evaluate("window.gv_username"), "")
        self.assertEqual(page.locator("#div_menu_sub_header").inner_text().find("Controlled viewer") >= 0, bool(role))
        page.evaluate("window.__held.forEach(finish=>finish())")
        return page, errors, requests

    def assert_scoped(self, page, errors, requests):
        self.assertEqual(errors, [])
        self.assertEqual(requests, ["https://roles.test/community/"])
        self.assertEqual(page.locator("#sibling").inner_text(), "Healthy sibling")
        self.assertEqual(page.locator("#div_main button").filter(has_text="Retry").count(), 0)
        self.assertTrue(all(call["csrf"] == "controlled-csrf" for call in page.evaluate("window.__calls")))

    def test_actual_header_resolution_hands_off_admin_member_and_anonymous(self):
        for role in ("관리자", "정회원", ""):
            for width in (1440, 390):
                with self.subTest(role=role, width=width):
                    page, errors, requests = self.render(role, width=width)
                    page.wait_for_function("window.__done===true")
                    if role:
                        page.clock.run_for(800)
                    page.get_by_text("Allowed current comment", exact=True).wait_for() if role else page.get_by_text("Discarded prior comment", exact=True).wait_for()
                    self.assert_scoped(page, errors, requests)
                    self.assertEqual(page.locator("#div_main .animate-pulse").count(), 0)
                    if role:
                        self.assertNotIn("Discarded prior", page.locator("#div_main").inner_text())
                    for tag in ("free", "notebook", "rcommunity"):
                        expected = "Allowed " + (role or "anonymous") + " " + tag if role or tag == "rcommunity" else "Discarded prior viewer " + tag
                        self.assertIn(expected, page.locator("#div_community_card_" + tag).inner_text())
                    self.assertEqual(page.evaluate("communityState.cardCounters"), {"free": 3, "notebook": 7, "rcommunity": 1145})
                    self.assertEqual(page.evaluate("window.__counts['/blank/ajax_board/get_article_list/|free']"), 2 if role else 1)
                    self.assertEqual(page.evaluate("window.__counts['/blank/ajax_board/get_article_list/|rcommunity']"), 1)

    def test_handoff_denial_is_terminal_and_cannot_reuse_prior_rows(self):
        page, errors, requests = self.render("관리자", failure="denied")
        page.wait_for_function("window.__done===true")
        page.clock.run_for(800)
        page.locator("#div_new_comment_list [role=alert]").wait_for()
        self.assert_scoped(page, errors, requests)
        self.assertEqual(page.locator("#div_main .animate-pulse").count(), 0)
        self.assertNotIn("Discarded prior", page.locator("#div_main").inner_text())
        self.assertLessEqual(max(page.evaluate("Object.values(window.__counts)")), 2)
        page.clock.run_for(45000)
        self.assertLessEqual(max(page.evaluate("Object.values(window.__counts)")), 2)

    def test_denied_headers_retire_previous_card_without_reading_held_body(self):
        for status in (401, 403):
            with self.subTest(status=status):
                page, errors, requests = self.render("관리자")
                page.wait_for_function("window.__done===true")
                page.clock.run_for(800)
                page.get_by_text("Allowed current comment", exact=True).wait_for()
                self.assertIn("Allowed 관리자 free", page.locator("#div_community_card_free").inner_text())
                page.evaluate("""(status) => {
                  window.__deniedCalls=0;window.__deniedBodyReads=0;
                  window.fetch=()=>{window.__deniedCalls++;return Promise.resolve({status,ok:false,headers:new Headers(),
                    json:()=>{window.__deniedBodyReads++;return new Promise(()=>{});}});};
                  window.__deniedDone=false;
                  void loadCommunityBoardCard(communityCardDefinitions()[0],1).then(()=>window.__deniedDone=true);
                }""", status)
                page.wait_for_function("window.__deniedDone===true")
                self.assertNotIn("Allowed 관리자 free", page.locator("#div_community_card_free").inner_text())
                self.assertEqual(page.evaluate("window.__deniedBodyReads"), 0)
                self.assertEqual(page.evaluate("window.__deniedCalls"), 1)
                self.assertFalse(page.evaluate("Object.hasOwn(communityCardLastGood,communityCardRequestKey('free',1))"))
                self.assert_scoped(page, errors, requests)
                page.clock.run_for(45000)
                self.assertEqual(page.evaluate("window.__deniedCalls"), 1)

    def test_handoff_keeps_original_45_second_fetch_and_body_deadline(self):
        for failure in ("hold", "body"):
            with self.subTest(failure=failure):
                page, errors, requests = self.render("정회원", failure=failure)
                page.wait_for_function("window.__counts['/blank/ajax_board/get_article_list/|free']===2")
                page.clock.run_for(45000)
                page.wait_for_function("window.__done===true")
                self.assert_scoped(page, errors, requests)
                self.assertEqual(page.locator("#div_main .animate-pulse").count(), 0)
                self.assertEqual(page.locator("#div_new_comment_list").get_attribute("aria-busy"), "false")
                self.assertLessEqual(max(page.evaluate("Object.values(window.__counts)")), 3)
                self.assertNotIn("Discarded prior", page.locator("#div_main").inner_text())


if __name__ == "__main__":
    unittest.main()
