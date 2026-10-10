import json
import os
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'scripts_go/web_r_go_20260629_1025'
SCRIPT = Path(os.environ.get('COMMUNITY_ACTION_TEST_SCRIPT', ASSETS / 'scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js'))
ID = '11111111-1111-4111-8111-111111111111'
CID = '22222222-2222-4222-8222-222222222222'


class CommunityActionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def render(self, mode='write'):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_default_timeout(1500)
        page.route('**/*', lambda r: r.fulfill(content_type='text/html', body='<html><div id="div_main"></div></html>'))
        page.goto('https://actions.test/community/free/' + mode + '/' + (ID + '/' if mode != 'write' else ''))
        page.clock.install()
        page.add_script_tag(path=str(ASSETS / 'vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js'))
        page.evaluate('''({mode,id}) => {
          Object.assign(window,{url:'free',sub:'',mode,orderID:id,gv_username:'fixture-writer',gv_role:'user',init_url:'/community/',
            getCookie:()=>'',WebRI18n:{language:'ko'},Div_page_header:p=>React.createElement('h1',null,p.title),
            WebRSolidEdit:{renderContent:(target,html)=>{if(target)target.innerHTML=html;}},alerts:[],calls:[],responses:[],held:[],done:false});
          window.alert=m=>alerts.push(m);window.confirm=()=>true;
          window.fetch=(endpoint,init={})=>{
            calls.push({endpoint,fields:Object.fromEntries(init.body?.entries()||[]),signal:!!init.signal});
            const result=responses.shift()||{};
            if(result.reject)return Promise.reject(new TypeError('controlled network failure'));
            const response={ok:!result.status||result.status<400,status:result.status||200,
              json:()=>result.holdBody?new Promise(resolve=>held.push(resolve)):Promise.resolve(result.body||{})};
            return result.hold?new Promise(resolve=>held.push(resolve)):Promise.resolve(response);
          };
        }''', {'mode': mode, 'id': ID})
        page.add_script_tag(path=str(SCRIPT))
        if mode == 'write':
            page.evaluate('set_main_write()')
            page.locator('#txt_title').fill('Unsent fixture title')
            page.locator('#txt_content').fill('<p>Unsent fixture body</p>')
        else:
            page.evaluate('''({id,cid})=>{
              renderReadPageShell();communityState.articleData={uuid:id,title:'Fixture article',content:'body',category_url:'free',check_reader:'writer',is_secret:0};
              communityState.commentData={0:{uuid:cid,uuid_article:id,uuid_upper:'',user_uuid:'fixture-user',user_nickname:'Fixture writer',user_role:'user',created_at:'2026-10-10 00:00:00',content:'Saved fixture comment',active:1,visible:1,is_secret:0,check_comment_reader:'writer'}};
              return set_comment();
            }''', {'id': ID, 'cid': CID})
        return page

    def test_rejected_create_unlocks_and_preserves_draft(self):
        page = self.render()
        page.evaluate('responses.push({reject:true});void submit_write().catch(()=>{}).finally(()=>done=true)')
        page.wait_for_function('done')
        self.assertFalse(page.evaluate('communityState.toggle_click_submit'))
        self.assertEqual(page.locator('#txt_title').input_value(), 'Unsent fixture title')
        self.assertIn('Unsent fixture body', page.locator('#txt_content').input_value())
        self.assertEqual(page.evaluate('calls.length'), 1)
        self.assertTrue(page.evaluate('alerts.length>0') or page.locator('[data-webr-community-action-status]').count())

    def test_stalled_create_body_stops_unknown_without_reposting(self):
        page = self.render()
        page.evaluate('responses.push({holdBody:true});void submit_write().catch(()=>{}).finally(()=>done=true)')
        page.wait_for_function('held.length===1')
        page.clock.run_for(45001)
        self.assertTrue(page.evaluate('done'), 'body deadline must release action')
        self.assertFalse(page.evaluate('communityState.toggle_click_submit'))
        self.assertEqual(page.evaluate('calls.length'), 1)
        self.assertIn('Unsent fixture body', page.locator('#txt_content').input_value())
        self.assertIn('확인', page.locator('[data-webr-community-action-status]').inner_text())

    def test_comment_refresh_preserves_unsent_draft_focus_and_secret(self):
        page = self.render('read')
        page.locator('#txt_content_comment_new_fallback').fill('Unsent comment draft')
        page.locator('#chk_secret_new').check()
        page.locator('#txt_content_comment_new_fallback').focus()
        page.evaluate("document.getElementById('txt_content_comment_new_fallback').setSelectionRange(3,8)")
        page.evaluate('set_comment()')
        self.assertEqual(page.locator('#txt_content_comment_new_fallback').input_value(), 'Unsent comment draft')
        self.assertTrue(page.locator('#chk_secret_new').is_checked())
        self.assertEqual(page.evaluate('document.activeElement.id'), 'txt_content_comment_new_fallback')
        self.assertEqual(page.evaluate('[document.activeElement.selectionStart,document.activeElement.selectionEnd]'), [3, 8])

    def test_comment_editor_logical_lock_rejects_second_invocation(self):
        page = self.render('read')
        page.locator('#txt_content_comment_new_fallback').fill('Comment submitted once')
        page.evaluate("responses.push({hold:true},{hold:true});void comment_action('submit','new');void comment_action('submit','new')")
        page.wait_for_function('calls.length>0')
        self.assertEqual(page.evaluate('calls.length'), 1)
        self.assertTrue(page.evaluate('calls[0].signal'))
        self.assertRegex(page.evaluate("calls[0].fields.request_id||''"), r'^[0-9a-f-]{36}$')

    def test_http_denial_retires_comment_body_and_actions(self):
        page = self.render('read')
        page.evaluate("responses.push({status:403,body:{error:'denied'}});void get_read_article_comment(orderID).finally(()=>done=true)")
        page.wait_for_function('done')
        self.assertNotIn('Saved fixture comment', page.locator('#div_main').inner_text())
        self.assertEqual(page.locator('#div_community_read_comment button').count(), 0)

    def test_healthy_ack_replica_lag_retained_but_fresh_rights_demotion_wins(self):
        page = self.render('read')
        page.evaluate("const row=communityState.commentData[0];row.content='Acknowledged edit';row.__optimistic=true;row.__optimisticAt=Date.now();row.__optimisticAction='edit';row.__owner=typeof communityDraftOwnerKey==='function'?communityDraftOwnerKey():''")
        self.assertEqual(page.evaluate("Object.values(mergeOptimisticComments({}))[0].content"), 'Acknowledged edit')
        page.evaluate("window.currentRow={...communityState.commentData[0],content:'Current masked content',check_comment_reader:'user',is_secret:1};delete currentRow.__optimistic;delete currentRow.__optimisticAt;delete currentRow.__optimisticAction")
        self.assertEqual(page.evaluate('Object.values(mergeOptimisticComments({0:currentRow}))[0].content'), 'Current masked content')

    def test_late_previous_viewer_comment_ack_cannot_repaint(self):
        page = self.render('read')
        page.locator('#txt_content_comment_new_fallback').fill('Old viewer submission')
        page.evaluate("responses.push({hold:true});void comment_action('submit','new').finally(()=>done=true)")
        page.wait_for_function('held.length===1')
        page.evaluate("gv_username='different-viewer';window.ack={checker:'SUCCESS',uuid:'33333333-3333-4333-8333-333333333333',comment:{uuid:'33333333-3333-4333-8333-333333333333',uuid_article:orderID,uuid_upper:'',active:1,visible:1,is_secret:0,check_comment_reader:'writer',created_at:'2026-10-10 00:00:00',content:'Old acknowledged private body'}};held.shift()({ok:true,status:200,json:async()=>ack})")
        page.wait_for_function('done')
        self.assertNotIn('Old acknowledged private body', page.locator('#div_main').inner_text())

    def test_unknown_comment_manual_retry_reuses_id_without_automatic_post(self):
        page = self.render('read')
        page.locator('#txt_content_comment_new_fallback').fill('Unknown comment revision')
        page.evaluate("responses.push({holdBody:true});void comment_action('submit','new').finally(()=>done=true)")
        page.wait_for_function('held.length===1')
        page.clock.run_for(45001)
        self.assertTrue(page.evaluate('done'))
        self.assertEqual(page.evaluate('calls.length'), 1)
        self.assertEqual(page.locator('#txt_content_comment_new_fallback').input_value(), 'Unknown comment revision')
        page.evaluate("done=false;responses.push({reject:true});void comment_action('submit','new').finally(()=>done=true)")
        page.wait_for_function('done')
        self.assertEqual(page.evaluate('calls[0].fields.request_id'), page.evaluate('calls[1].fields.request_id'))
        self.assertEqual(page.evaluate('calls.length'), 2)

    def test_new_typing_during_successful_save_survives_ack_refresh(self):
        page = self.render('read')
        page.locator('#txt_content_comment_new_fallback').fill('Submitted revision')
        page.evaluate("responses.push({hold:true});void comment_action('submit','new').finally(()=>done=true)")
        page.wait_for_function('held.length===1')
        page.locator('#txt_content_comment_new_fallback').fill('Next unsent revision')
        page.evaluate("const comment={...communityState.commentData[0],uuid:'33333333-3333-4333-8333-333333333333',content:'Submitted revision'};held.shift()({ok:true,status:200,json:async()=>({checker:'SUCCESS',uuid:comment.uuid,comment})})")
        page.wait_for_function('done')
        self.assertEqual(page.locator('#txt_content_comment_new_fallback').input_value(), 'Next unsent revision')
        self.assertIn('Submitted revision', page.locator('#div_main').inner_text())

    def test_attachment_failure_reports_saved_comment_and_preserves_pending_file(self):
        page = self.render('read')
        page.locator('#txt_content_comment_new_fallback').fill('Saved before attachment')
        page.evaluate("const comment={...communityState.commentData[0],uuid:'33333333-3333-4333-8333-333333333333',content:'Saved before attachment'};communityState.commentFiles.new=[new File(['public fixture'],'fixture.txt')];responses.push({body:{checker:'SUCCESS',uuid:comment.uuid,comment}},{reject:true});void comment_action('submit','new').finally(()=>done=true)")
        page.wait_for_function('done')
        self.assertEqual(page.evaluate('communityState.commentFiles.new.length'), 1)
        self.assertEqual(page.evaluate('calls.length'), 2)
        self.assertEqual(page.locator('[data-webr-community-action-status]').count(), 1)
        self.assertIn('내용은 저장되었습니다', page.locator('[data-webr-community-action-status]').inner_text())
        self.assertEqual(page.locator('#txt_content_comment_new_fallback').input_value(), 'Saved before attachment')

    def test_malformed_comment_ack_never_clears_draft_or_adds_row(self):
        page = self.render('read')
        page.locator('#txt_content_comment_new_fallback').fill('Keep until canonical ACK')
        page.evaluate("responses.push({body:{ok:false,pending:true,uuid:'unverified'}});void comment_action('submit','new').finally(()=>done=true)")
        page.wait_for_function('done')
        self.assertEqual(page.locator('#txt_content_comment_new_fallback').input_value(), 'Keep until canonical ACK')
        self.assertEqual(page.evaluate('Object.values(communityState.commentData).length'), 1)
        self.assertEqual(page.evaluate('calls.length'), 1)

    def test_pending_article_keeps_request_identity_and_check_is_bounded(self):
        page = self.render()
        page.evaluate("responses.push({body:{pending:true,uuid:orderID}});void submit_write().finally(()=>done=true)")
        page.wait_for_function('done')
        self.assertIn('글이 저장되었습니다', page.locator('#div_button_list').inner_text())
        self.assertEqual(page.evaluate('calls.length'), 1)
        self.assertTrue(page.evaluate('sessionStorage.length>0'))
        page.evaluate('responses.push({holdBody:true})')
        page.get_by_role('button', name='공개 여부 확인', exact=True).click()
        page.wait_for_function('held.length===1')
        page.clock.run_for(45001)
        self.assertTrue(page.get_by_role('button', name='공개 여부 확인', exact=True).is_enabled())
        self.assertEqual(page.evaluate('calls.length'), 2)
        self.assertTrue(page.evaluate('sessionStorage.length>0'))

    def test_edit_error_dto_never_grants_edit_form(self):
        page = self.render('edit')
        page.evaluate("responses.push({body:{ok:false,error:'controlled dependency error'}});void set_main_edit().finally(()=>done=true)")
        page.wait_for_function('done')
        self.assertEqual(page.locator('#txt_title').count(), 0)
        self.assertEqual(page.locator('#div_button_list button').count(), 0)

    def test_pagehide_cancels_mutation_and_late_ack_does_not_paint(self):
        page = self.render('read')
        page.locator('#txt_content_comment_new_fallback').fill('Leaving page submission')
        page.evaluate("responses.push({hold:true});void comment_action('submit','new').finally(()=>done=true)")
        page.wait_for_function('held.length===1')
        page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide'));const comment={uuid:'33333333-3333-4333-8333-333333333333',uuid_article:orderID,uuid_upper:'',active:1,visible:1,is_secret:0,check_comment_reader:'writer',created_at:'2026-10-10 00:00:00',user_nickname:'Fixture writer',user_role:'user',content:'Retired page ACK'};held.shift()({ok:true,status:200,json:async()=>({checker:'SUCCESS',uuid:comment.uuid,comment})})")
        page.wait_for_function('done')
        self.assertNotIn('Retired page ACK', page.locator('#div_main').inner_text())
        self.assertEqual(page.evaluate('calls.length'), 1)


if __name__ == '__main__':
    unittest.main()
