"""Offline actual Community renderer, sanitizer and immutable editing assets."""
from pathlib import Path
import unittest

import test_solid_edit_read_lazy as base
ASSETS=base.ASSETS

ID='11111111-1111-4111-8111-111111111111'

class CommunityLazyEditorTests(base.SolidEditReadLazyTests):
    # Inherit the fixture, not the base test groups.
    test_body_and_comments_paint_before_core_then_real_mount_preserves_latest_draft=None
    test_malformed_missing_descriptor_no_network_and_full_write_api_unchanged=None
    test_single_deadline_failure_keeps_fallback_and_never_loads_host_late=None
    test_actual_same_origin_fallback_retains_sri_nonce_and_resolves=None
    test_original_deferred_core_blocks_read_and_original_fallback_loses_nonce=None
    test_core_and_host_share_the_same_fifteen_second_deadline=None

    def community(self):
        p,calls,held,fulfill=self.fixture()
        p.evaluate("document.body.insertAdjacentHTML('beforeend','<div id=div_main></div>')")
        p.add_script_tag(path=str(ASSETS/'vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js'))
        p.evaluate('''id=>{history.replaceState({},'', '/community/free/read/'+id+'/');Object.assign(window,{url:'free',sub:'',mode:'read',orderID:id,gv_username:'controlled-writer',gv_role:'user',getCookie:()=>'',
          WebRI18n:{language:'ko'},Div_page_header:p=>React.createElement('h1',null,p.title)});void 0;}''',ID)
        p.add_script_tag(path=str(ASSETS/'scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js'))
        p.evaluate('''id=>{renderReadPageShell();communityState.articleData={uuid:id,title:'Public article',content:'<p>Public article body</p>',category_url:'free',check_reader:'user',is_secret:0};
          WebRSolidEdit.renderContent(document.getElementById('div_community_read_content'),communityState.articleData.content);
          communityState.commentData={0:{uuid:'22222222-2222-4222-8222-222222222222',uuid_article:id,uuid_upper:'',user_uuid:'fixture-user',user_nickname:'Fixture writer',user_role:'user',created_at:'2026-10-16 00:00:00',content:'<p>Visible comment first</p>',active:1,visible:1,is_secret:0,check_comment_reader:'user'}};
          window.commentDone=false;void set_comment().then(()=>commentDone=true);}''',ID)
        p.locator('#div_community_read_comment_new_form textarea').wait_for()
        return p,calls,held,fulfill

    def test_actual_comment_mount_promotes_current_fallback_and_retains_draft(self):
        p,calls,held,fulfill=self.community()
        self.assertIn('Public article body',p.locator('#div_community_read_content').inner_text())
        self.assertIn('Visible comment first',p.locator('#div_community_read_comment').inner_text())
        p.wait_for_timeout(10);self.assertEqual(len(held),1)
        p.locator('#div_community_read_comment_new_form textarea').fill('Typed during delayed core')
        fulfill(held.pop(),self.core)
        p.wait_for_function('commentDone')
        self.assertIn('Typed during delayed core',p.evaluate("getCommentEditorHTML(communityState.commentEditors.new)"))
        self.assertEqual(p.locator('#div_community_read_comment_new_form [data-comment-editor-fallback]').count(),0)
        p.evaluate('void set_comment().then(()=>window.rebuilt=true)')
        p.wait_for_function('window.rebuilt===true')
        self.assertIn('Typed during delayed core',p.evaluate("getCommentEditorHTML(communityState.commentEditors.new)"))

    def test_role_account_route_and_dom_retirement_never_mount_or_restore_previous_draft(self):
        changes=["history.replaceState({},'','?changed=1')","document.documentElement.lang='en'","window.gv_role='admin'","window.gv_username='another-account'","history.replaceState({},'', '/community/free/read/other/')","document.getElementById('div_community_read_comment').replaceWith(document.createElement('div'))"]
        for change in changes:
            with self.subTest(change=change):
                p,_,held,fulfill=self.community();p.wait_for_timeout(10)
                p.locator('#div_community_read_comment_new_form textarea').fill('Retired private draft')
                p.evaluate(change);fulfill(held.pop(),self.core)
                p.wait_for_function('commentDone')
                self.assertEqual(p.locator('.lre-editor').count(),0)
                self.assertFalse(p.evaluate('!!communityState.commentEditors.new?.editor'))
                self.assertNotIn('Retired private draft',p.locator('body').inner_text())
                self.assertNotIn('Retired private draft',p.locator('textarea').evaluate_all('(xs)=>xs.map(x=>x.value).join(" ")'))

    def test_edit_clear_to_empty_during_lazy_load_does_not_restore_saved_content(self):
        p,_,held,fulfill=self.community();p.wait_for_timeout(10)
        p.evaluate("communityState.commentData[0].is_secret=1;void click_btn_edit_comment('22222222-2222-4222-8222-222222222222').then(()=>window.editingDone=true)")
        target=p.locator('#div_comment_editor_main_22222222-2222-4222-8222-222222222222 textarea')
        target.wait_for();target.fill('')
        secret=p.locator('#chk_secret_22222222-2222-4222-8222-222222222222').first
        self.assertTrue(secret.is_checked());secret.uncheck()
        fulfill(held.pop(),self.core);p.wait_for_function('window.editingDone===true')
        html=p.evaluate("getCommentEditorHTML(communityState.commentEditors['22222222-2222-4222-8222-222222222222'])")
        self.assertNotIn('Visible comment first',html)
        self.assertFalse(secret.is_checked())
        self.assertTrue(p.evaluate("WebRSolidEditor.isEmpty(getCommentEditorHTML(communityState.commentEditors['22222222-2222-4222-8222-222222222222']))"))

    def test_existing_persisted_pageshow_restarts_fresh_read_after_pending_mount_retirement(self):
        p,_,held,fulfill=self.community();p.wait_for_timeout(10)
        p.locator('#div_community_read_comment_new_form textarea').fill('Retired page draft')
        p.evaluate("window.resumeReads=[];get_read_article=(...args)=>{resumeReads.push(args);return Promise.resolve()};window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));void 0")
        self.assertEqual(p.evaluate('resumeReads'),[['init']])
        fulfill(held.pop(),self.core);p.wait_for_function('commentDone')
        self.assertEqual(p.locator('.lre-editor').count(),0)
        self.assertNotIn('Retired page draft',p.locator('textarea').evaluate_all('(xs)=>xs.map(x=>x.value).join(" ")'))

    def test_failed_load_keeps_current_fallback_usable_without_losing_comments(self):
        p,_,held,_=self.community();p.wait_for_timeout(10)
        p.locator('#div_community_read_comment_new_form textarea').fill('Unsent draft on failure')
        held.pop().abort();p.wait_for_function('commentDone')
        self.assertEqual(p.locator('#div_community_read_comment_new_form textarea').input_value(),'Unsent draft on failure')
        self.assertIn('Visible comment first',p.locator('#div_community_read_comment').inner_text())

if __name__=='__main__':unittest.main()
