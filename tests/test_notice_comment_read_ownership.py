"""Offline actual Notice renderer; synthetic data, intercepted requests only."""
import json
import os
from pathlib import Path
import unittest
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1] / "scripts_go/web_r_go_20260629_1025"
SCRIPT = ROOT / "scripts_v2/intro/notice/set_main_solid_edit_comment_mini_20260822_1548.js"
ID = "11111111-1111-4111-8111-111111111111"
CID = "22222222-2222-4222-8222-222222222222"
READ = "/blank/ajax_board/get_read_article/"
LIST = "/blank/ajax_board/get_article_list/"
COMMENTS = "/blank/ajax_board/get_read_article_comment/"
ARTICLE = dict(uuid=ID, title="Current notice", content="Independent current notice body",
               category_url="notice", check_reader="guest", is_secret=0, attachments=[])
COMMENT = dict(uuid=CID, uuid_article=ID, uuid_upper=None, content="Current comment body",
               active=1, is_secret=0, check_comment_reader="user", created_at="2026-10-16")


class NoticeCommentReadTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True,
            executable_path=os.environ.get("CHROMIUM_EXECUTABLE_PATH") or None)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    @staticmethod
    def fulfill(route, value, status=200):
        route.fulfill(status=status, content_type="application/json", body=json.dumps(value))

    def render(self, responder, *, start="read", width=1440, body_hold=False, editor_hold=False):
        page = self.browser.new_page(viewport={"width": width, "height": 900})
        self.addCleanup(page.close)
        page.set_default_timeout(2500)
        calls, errors, parked = [], [], []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.add_init_script("""Object.assign(window,{url:'notice',sub:'',gv_username:'',gv_role:'',
          getCookie:()=>'',Div_page_header:()=>null,WebRSolidEdit:{renderContent:(node,text)=>node.textContent=text}});
          window.mode=location.pathname.includes('/read/')?'read':'';
          window.orderID=mode==='read'?location.pathname.split('/')[4]:'';
          window.deniedBodyReads=0;
          const originalFetch=window.fetch.bind(window);
          window.fetch=(url,options)=>originalFetch(url,options).then(response=>{
            if([401,403].includes(response.status))response.json=()=>{deniedBodyReads++;return new Promise(()=>{});};
            return response;
          });""")
        if body_hold:
            page.add_init_script("""const beforeBodyHold=window.fetch;
              window.fetch=(url,options)=>beforeBodyHold(url,options).then(response=>{
                if(String(url).includes('/get_read_article_comment/'))response.json=()=>new Promise(resolve=>window.finishCommentBody=resolve);
                return response;
              });""")

        def serve(route):
            path = urlsplit(route.request.url).path
            if route.request.is_navigation_request():
                route.fulfill(content_type="text/html", body='<html lang="ko"><div id="div_main"></div></html>')
            elif path in (READ, LIST, COMMENTS):
                calls.append({"path": path, "body": route.request.post_data})
                if path == READ:
                    self.fulfill(route, ARTICLE)
                else:
                    responder(route, path, sum(r["path"] == path for r in calls), parked)
            else:
                route.abort()
        page.route("**/*", serve)
        page.goto("https://notice.test/intro/notice/" + ("read/" + ID + "/" if start == "read" else ""))
        page.clock.install()
        if editor_hold:
            page.evaluate("""gv_username='fixture-member';window.editorLoadCalls=0;window.editorMounts=[];
              WebRSolidEdit.ensureEditorAssets=options=>{window.editorLoadCalls++;window.editorDeadline=options.deadline;
                return window.editorLoadPromise || (window.editorLoadPromise=new Promise(resolve=>window.finishEditorLoad=resolve));};void 0;""")
        page.add_script_tag(path=str(ROOT / "vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js"))
        page.add_script_tag(path=str(SCRIPT))
        page.evaluate("void set_main()")

        def close_routes():
            for route in parked:
                try: route.abort()
                except Exception: pass
            page.unroute_all(behavior="ignoreErrors")
        self.addCleanup(close_routes)
        return page, calls, errors, parked

    @staticmethod
    def count(calls, path):
        return sum(r["path"] == path for r in calls)

    def test_body_paints_before_held_comments_then_real_rows_or_healthy_empty(self):
        for width in (1440, 390):
            for value in ({"0": COMMENT}, {}):
                with self.subTest(width=width, value=value):
                    page, calls, errors, parked = self.render(lambda route, path, n, held: held.append(route), width=width)
                    page.get_by_text(ARTICLE["content"], exact=True).wait_for()
                    page.wait_for_function("noticePublicOwners.has('comments')")
                    self.assertEqual(len(parked), 1)
                    self.assertEqual(page.locator("#div_community_read_comment").get_attribute("aria-busy"), "true")
                    self.fulfill(parked.pop(), value)
                    page.wait_for_function("!noticePublicOwners.has('comments')")
                    box = page.locator("#div_community_read_comment")
                    self.assertEqual(box.locator("[role=alert],.animate-pulse").count(), 0)
                    self.assertEqual(box.get_attribute("aria-busy"), "false")
                    self.assertIn("Current comment body" if value else "댓글 (0)", box.inner_text())
                    self.assertEqual(self.count(calls, COMMENTS), 1)
                    self.assertIn('name="tag"\r\n\r\nnotice', calls[-1]["body"])
                    self.assertEqual(errors, [])

    def test_list_role_only_handoff_discards_old_body_and_uses_second_read(self):
        for width in (1440, 390):
            with self.subTest(width=width):
                def respond(route, path, count, held):
                    if count == 1: held.append(route)
                    else: self.fulfill(route, {"count": {"cnt": 1}, "list": {"0": ARTICLE}})
                page, calls, errors, held = self.render(respond, start="list", width=width)
                page.wait_for_function("noticePublicOwners.has('list')")
                page.wait_for_timeout(20)
                page.evaluate("gv_role='member'")
                self.fulfill(held.pop(), {"count": {"cnt": 1}, "list": {"0": dict(ARTICLE, title="OLD ROLE MUST NOT PAINT")}})
                page.get_by_role("heading", name=ARTICLE["title"], exact=True).wait_for()
                self.assertNotIn("OLD ROLE", page.locator("#div_main").inner_text())
                self.assertEqual(self.count(calls, LIST), 2)
                self.assertTrue(all('name="list_titles"\r\n\r\n1' in call['body'] for call in calls if call['path']==LIST))
                page.clock.run_for(45001)
                self.assertEqual(self.count(calls, LIST), 2)
                self.assertEqual(page.locator("#div_article_list .animate-pulse,[role=alert]").count(), 0)
                self.assertEqual(errors, [])

    def test_comment_role_handoff_and_exhaustion_preserve_primary(self):
        for exhaust in (False, True):
            with self.subTest(exhaust=exhaust):
                def respond(route, path, count, held):
                    if count == 1 or exhaust: held.append(route)
                    else: self.fulfill(route, {"0": COMMENT})
                page, calls, errors, held = self.render(respond)
                page.get_by_text(ARTICLE["content"], exact=True).wait_for()
                page.evaluate("gv_role='member'")
                self.fulfill(held.pop(0), {"0": dict(COMMENT, content="OLD ROLE MUST NOT PAINT")})
                if exhaust:
                    page.wait_for_function("document.querySelector('#div_community_read_comment').getAttribute('aria-busy')==='true'")
                    page.wait_for_timeout(20)
                    page.evaluate("gv_role='admin'")
                    self.fulfill(held.pop(0), {"0": COMMENT})
                    page.locator("#div_community_read_comment [role=alert]").wait_for()
                else:
                    page.get_by_text(COMMENT["content"], exact=True).wait_for()
                self.assertEqual(self.count(calls, COMMENTS), 2)
                self.assertNotIn("OLD ROLE", page.locator("#div_main").inner_text())
                self.assertIn(ARTICLE["content"], page.locator("#div_community_read_content").inner_text())
                self.assertEqual(errors, [])

    def test_denial_pending_and_invalid_rows_are_terminal_without_fake_zero(self):
        for start in ("list", "read"):
            for status, value in ((401, {}), (403, {}), (503, {"ok": False, "pending": True}),
                                  (200, {"ok": False, "pending": True}),
                                  (200, {"0": dict(COMMENT, uuid_article=CID)})):
                with self.subTest(start=start, status=status, value=value):
                    page, calls, errors, _ = self.render(lambda route, *_: self.fulfill(route, value, status), start=start)
                    target = "#div_article_list" if start == "list" else "#div_community_read_comment"
                    page.locator(target + " [role=alert]").wait_for()
                    self.assertEqual(page.evaluate("deniedBodyReads"), 0)
                    self.assertNotIn("댓글 (0)", page.locator(target).inner_text())
                    self.assertEqual(page.locator(target + " button").count(), 0)
                    page.clock.run_for(45001)
                    self.assertEqual(self.count(calls, LIST if start == "list" else COMMENTS), 1)
                    if start == "read": self.assertIn(ARTICLE["content"], page.locator("#div_community_read_content").inner_text())
                    self.assertEqual(errors, [])

    def test_comment_fetch_and_body_deadlines_stop_late_results(self):
        for stage in ("fetch", "body"):
            with self.subTest(stage=stage):
                page, calls, errors, held = self.render(lambda route, path, n, parked: parked.append(route) if stage == "fetch" else self.fulfill(route, {}), body_hold=stage == "body")
                page.get_by_text(ARTICLE["content"], exact=True).wait_for()
                if stage == "body": page.wait_for_function("!!window.finishCommentBody")
                page.clock.run_for(45001)
                page.locator("#div_community_read_comment [role=alert]").wait_for()
                if stage == "body":
                    page.evaluate("finishCommentBody({0:" + json.dumps(COMMENT) + "})")
                    page.wait_for_timeout(20)
                self.assertNotIn(COMMENT["content"], page.locator("#div_community_read_comment").inner_text())
                self.assertEqual(self.count(calls, COMMENTS), 1)
                self.assertEqual(errors, [])

    def test_account_route_locale_or_replaced_root_retires_old_comment(self):
        for change in ("gv_username='different-fixture-account'", "history.pushState({},'',location.pathname+'?other=1')",
                       "document.documentElement.lang='en'", "document.querySelector('#div_community_read_comment').replaceWith(document.createElement('aside'))"):
            with self.subTest(change=change):
                page, calls, errors, held = self.render(lambda route, path, n, parked: parked.append(route))
                page.get_by_text(ARTICLE["content"], exact=True).wait_for()
                page.evaluate(change)
                self.fulfill(held.pop(), {"0": COMMENT})
                page.wait_for_timeout(20)
                self.assertNotIn(COMMENT["content"], page.locator("#div_main").inner_text())
                self.assertEqual(self.count(calls, COMMENTS), 1)
                self.assertEqual(errors, [])

    @staticmethod
    def install_editor_api(page, *, hold_host=False):
        page.evaluate("""hold=>{window.WebRSolidEditor={
          mountHost:(host,options)=>{
            editorMounts.push({timeoutMs:options.timeoutMs,storageKey:options.storageKey,restoreDraft:options.restoreDraft,html:options.html});
            host.innerHTML='';const field=document.createElement('textarea');field.id=options.textareaID;field.value=options.html;host.appendChild(field);
            const api={editor:field,getHTML:()=>field.value,setHTML:html=>field.value=html};
            if(hold && editorMounts.length===1)return new Promise(resolve=>window.finishHostMount=()=>resolve(api));
            return Promise.resolve(api);
          },setHTML:(api,html)=>{api.setHTML(html);return true;},getHTML:api=>api.getHTML(),
          destroy:api=>api.editor.remove()};}""", hold_host)

    def test_immediate_fallback_latest_typing_survives_asset_and_host_wait(self):
        for expired in (False,True):
            with self.subTest(host_deadline_expired=expired):
                page, calls, errors, _ = self.render(lambda route, *_: self.fulfill(route, {}), editor_hold=True)
                page.get_by_text(ARTICLE["content"], exact=True).wait_for()
                page.wait_for_function("!!window.finishEditorLoad")
                fallback=page.locator('#txt_content_comment_new_fallback')
                fallback.fill('typed while asset loader is held')
                self.assertIn("댓글 (0)", page.locator("#div_community_read_comment").inner_text())
                self.assertEqual(self.count(calls, COMMENTS), 1)
                page.clock.run_for(9000)
                self.install_editor_api(page, hold_host=True)
                page.evaluate('finishEditorLoad(true)')
                page.wait_for_function('!!window.finishHostMount')
                fallback.fill('latest typed while host readiness is held')
                if expired: page.clock.run_for(6001)
                page.evaluate('finishHostMount()')
                page.wait_for_function("!noticePublicOwners.has('comments')")
                final=page.locator('#txt_content_comment_new_fallback' if expired else '#txt_content_comment_new')
                self.assertEqual(final.input_value(),'latest typed while host readiness is held')
                self.assertEqual(fallback.count(),1 if expired else 0)
                mounts=page.evaluate('editorMounts')
                self.assertEqual(len(mounts),1)
                self.assertGreater(mounts[0]['timeoutMs'],0)
                self.assertLessEqual(mounts[0]['timeoutMs'],6000)
                self.assertTrue(mounts[0]['restoreDraft'])
                self.assertEqual(mounts[0]['storageKey'],'web-r:intro:notice:comment:'+ID+':new')
                self.assertEqual(errors,[])

    def test_failed_assets_leave_typed_fallback_and_owner_changes_retire_it(self):
        cases=(('failure',None),('assets',"gv_username='different-fixture-account'"),
               ('host',"gv_role='admin'"),('host',"gv_is_admin=true"),('host',"history.pushState({},'',location.pathname+'?changed=1')"),
               ('host',"document.querySelector('#div_community_read_comment_new_form').replaceWith(Object.assign(document.createElement('div'),{id:'div_community_read_comment_new_form'}))"))
        for stage,change in cases:
            with self.subTest(stage=stage,change=change):
                page, calls, errors, _=self.render(lambda route,*_:self.fulfill(route,{}),editor_hold=True)
                page.wait_for_function('!!window.finishEditorLoad')
                page.locator('#txt_content_comment_new_fallback').fill('retained draft')
                if stage=='failure':
                    page.evaluate('finishEditorLoad(false)')
                else:
                    self.install_editor_api(page,hold_host=stage=='host')
                    if stage=='assets':page.evaluate(change)
                    page.evaluate('finishEditorLoad(true)')
                    if stage=='host':
                        page.wait_for_function('!!window.finishHostMount')
                        page.evaluate(change)
                        page.evaluate('finishHostMount()')
                page.wait_for_function("!noticePublicOwners.has('comments')")
                if stage=='failure':
                    self.assertEqual(page.locator('#txt_content_comment_new_fallback').input_value(),'retained draft')
                    self.assertEqual(page.evaluate('editorMounts'),[])
                else:
                    self.assertEqual(page.locator('#txt_content_comment_new_fallback,#txt_content_comment_new').count(),0)
                self.assertIn(ARTICLE['content'],page.locator('#div_community_read_content').inner_text())
                self.assertEqual(self.count(calls,COMMENTS),1)
                self.assertEqual(errors,[])

    def test_edit_empty_and_reply_typing_are_not_reset_after_lazy_mount(self):
        own_comment=dict(COMMENT,check_comment_reader='writer',is_secret=1)
        page, calls, errors, _=self.render(lambda route,*_:self.fulfill(route,{'0':own_comment}),editor_hold=True)
        page.wait_for_function('!!window.finishEditorLoad')
        page.evaluate('finishEditorLoad(false)')
        page.wait_for_function("!noticePublicOwners.has('comments')")
        page.evaluate("WebRSolidEdit.ensureEditorAssets=()=>new Promise(resolve=>window.finishEditLoad=resolve);void 0;")
        page.get_by_role('button',name='수정',exact=True).click()
        edit=page.locator('#div_comment_editor_main_'+CID+' textarea')
        edit.wait_for()
        self.assertEqual(edit.input_value(),COMMENT['content'])
        edit.fill('')
        secret=page.locator('#div_comment_'+CID+' #chk_secret_'+CID)
        self.assertTrue(secret.is_checked())
        secret.uncheck()
        self.install_editor_api(page)
        page.evaluate('finishEditLoad(true)')
        page.wait_for_function('!document.querySelector("#div_comment_editor_main_'+CID+' textarea[id$=fallback]")')
        self.assertEqual(edit.input_value(),'')
        self.assertFalse(secret.is_checked())
        # Exercise the reply mount on its actual rendered host, with no data requests.
        page.evaluate("""key=>{WebRSolidEdit.ensureEditorAssets=()=>new Promise(resolve=>window.finishReplyLoad=resolve);
          window.replyMount=mountSolidNoticeCommentEditor(key,'');}""",CID)
        reply_host=page.locator('#div_community_read_comment_new_'+CID+'_form')
        reply=reply_host.locator('textarea')
        reply.fill('reply typed during lazy load')
        page.evaluate('finishReplyLoad(true)')
        page.wait_for_function('!document.querySelector("#div_community_read_comment_new_'+CID+'_form textarea[id$=fallback]")')
        self.assertEqual(reply.input_value(),'reply typed during lazy load')
        self.assertEqual(self.count(calls,COMMENTS),1)
        self.assertEqual(errors,[])


if __name__ == "__main__":
    unittest.main(verbosity=2)
