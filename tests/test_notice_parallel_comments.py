"""Real Notice renderer; all data is synthetic and every request intercepted."""
import json
import unittest

from tests import test_notice_comment_read_ownership as base
ARTICLE, COMMENT, ID, CID, READ, COMMENTS = base.ARTICLE, base.COMMENT, base.ID, base.CID, base.READ, base.COMMENTS


class NoticeParallelCommentTests(base.NoticeCommentReadTests):
    # Reuse the existing fixture, not its test groups.
    test_body_paints_before_held_comments_then_real_rows_or_healthy_empty = None
    test_list_role_only_handoff_discards_old_body_and_uses_second_read = None
    test_comment_role_handoff_and_exhaustion_preserve_primary = None
    test_denial_pending_and_invalid_rows_are_terminal_without_fake_zero = None
    test_comment_fetch_and_body_deadlines_stop_late_results = None
    test_account_route_locale_or_replaced_root_retires_old_comment = None
    test_immediate_fallback_latest_typing_survives_asset_and_host_wait = None
    test_failed_assets_leave_typed_fallback_and_owner_changes_retire_it = None
    test_edit_empty_and_reply_typing_are_not_reset_after_lazy_mount = None

    def test_either_completion_order_starts_once_and_never_holds_primary_paint(self):
        for width in (1440, 390):
            for first in ('primary', 'comments'):
                with self.subTest(width=width, first=first):
                    primary=[]
                    def parent(route,*_):
                        if first=='comments': primary.append(route)
                        else: self.fulfill(route,ARTICLE)
                    page,calls,errors,held=self.render(
                        lambda route,path,n,parked: parked.append(route) if first=='primary' else self.fulfill(route,{'0':COMMENT}),
                        primary=parent,width=width)
                    page.wait_for_function("noticePublicOwners.has('comments')")
                    page.wait_for_timeout(15)
                    self.assertEqual(self.count(calls,READ),1)
                    self.assertEqual(self.count(calls,COMMENTS),1)
                    if first=='comments':
                        self.assertNotIn(COMMENT['content'],page.locator('#div_main').inner_text())
                        self.fulfill(primary.pop(),ARTICLE)
                    else:
                        page.get_by_text(ARTICLE['content'],exact=True).wait_for()
                        self.assertNotIn(COMMENT['content'],page.locator('#div_main').inner_text())
                        self.fulfill(held.pop(),{'0':COMMENT})
                    page.get_by_text(COMMENT['content'],exact=True).wait_for()
                    page.wait_for_function("!noticePublicOwners.has('comments')")
                    self.assertEqual(self.count(calls,COMMENTS),1)
                    self.assertEqual(errors,[])

    def test_early_failure_and_empty_remain_joined_until_primary_is_valid(self):
        for status,rows in ((503,{'ok':False,'pending':True}), (200,{})):
            with self.subTest(status=status):
                primary=[]
                page,calls,errors,_=self.render(lambda route,*_:self.fulfill(route,rows,status),primary=lambda route,*_:primary.append(route))
                page.wait_for_function("noticePublicOwners.has('comments')")
                page.wait_for_timeout(20)
                box=page.locator('#div_community_read_comment')
                self.assertEqual(box.locator('[role=alert]').count(),0)
                self.assertNotIn('댓글 (0)',box.inner_text())
                self.fulfill(primary.pop(),ARTICLE)
                page.wait_for_function("!noticePublicOwners.has('comments')")
                self.assertIn(ARTICLE['content'],page.locator('#div_main').inner_text())
                self.assertEqual(box.locator('[role=alert]').count(),1 if status==503 else 0)
                if status==200:self.assertIn('댓글 (0)',box.inner_text())
                else:self.assertNotIn('댓글 (0)',box.inner_text())
                page.clock.run_for(45001)
                self.assertEqual(self.count(calls,COMMENTS),1)
                self.assertEqual(errors,[])

    def test_denied_masked_or_unknown_parent_discards_early_data_and_stops_body(self):
        for kind in ('denied','masked','unknown','held-body-denied'):
            with self.subTest(kind=kind):
                primary=[]
                page,calls,errors,_=self.render(lambda route,*_:self.fulfill(route,{'0':COMMENT}),
                    primary=lambda route,*_:primary.append(route),body_hold=kind=='held-body-denied')
                page.wait_for_function("noticePublicOwners.has('comments')")
                if kind=='held-body-denied':page.wait_for_function('!!window.finishCommentBody')
                else:page.wait_for_timeout(15)
                item=dict(ARTICLE,is_secret=1,check_reader='user',content='비밀 글입니다.') if kind=='masked' else dict(ARTICLE,is_secret=2)
                self.fulfill(primary.pop(),{} if 'denied' in kind else item,403 if 'denied' in kind else 200)
                page.wait_for_function("!noticePublicOwners.has('comments')")
                if kind=='held-body-denied':page.evaluate('finishCommentBody({0:'+json.dumps(COMMENT)+'})')
                box=page.locator('#div_community_read_comment')
                self.assertNotIn(COMMENT['content'],page.locator('#div_main').inner_text())
                self.assertNotIn('댓글 (0)',box.inner_text())
                self.assertEqual(box.locator('.animate-pulse').count(),0)
                self.assertEqual(box.get_attribute('aria-busy'),'false')
                self.assertEqual(self.count(calls,COMMENTS),1)
                self.assertEqual(errors,[])

    def test_scope_and_existing_parent_fields_cannot_promote_stale_response(self):
        cases=[('scope',"gv_username='another-fixture'"),('scope',"document.documentElement.lang='en'"),
               ('scope',"history.pushState({},'',location.pathname+'?retired=1')"),('scope',"document.querySelector('#div_community_read_comment').replaceWith(document.createElement('aside'))"),
               ('scope',"document.querySelector('#div_community_read_comment').replaceWith(Object.assign(document.createElement('div'),{id:'div_community_read_comment'}))"),
               ('row',{'article_category_url':'free'}),('row',{'article_category_url_sub':'other'}),('row',{'check_article_reader':'writer'}),('row',{'uuid_article':CID}),
               ('row_missing','article_category_url'),('row_missing','article_category_url_sub'),('row_missing','check_article_reader')]
        for kind,value in cases:
            with self.subTest(kind=kind,value=value):
                primary=[]
                row=dict(COMMENT,**value) if kind=='row' else dict(COMMENT)
                if kind=='row_missing':del row[value]
                page,calls,errors,_=self.render(lambda route,*_:self.fulfill(route,{'0':row}),primary=lambda route,*_:primary.append(route))
                page.wait_for_function("noticePublicOwners.has('comments')")
                page.wait_for_timeout(15)
                if kind=='scope':page.evaluate(value)
                self.fulfill(primary.pop(),ARTICLE)
                page.wait_for_function("!noticePublicOwners.has('comments')")
                self.assertNotIn(COMMENT['content'],page.locator('#div_main').inner_text())
                self.assertEqual(self.count(calls,COMMENTS),1)
                self.assertEqual(errors,[])

    def test_original_deadline_and_single_role_handoff_never_create_another_action(self):
        for change in ('deadline','role'):
            with self.subTest(change=change):
                parents=[]
                def parent(route,path,n,parked):
                    if n==1:
                        parents.append(route)
                        parked.append(route)
                    else:self.fulfill(route,ARTICLE)
                def comment(route,path,n,_):
                    self.fulfill(route,{'0':dict(COMMENT,content='OLD EARLY ROW') if n==1 else COMMENT})
                page,calls,errors,_=self.render(comment,primary=parent)
                page.wait_for_function("noticePublicOwners.has('comments')")
                page.wait_for_timeout(15)
                if change=='deadline':
                    page.clock.run_for(45001)
                else:
                    page.evaluate("gv_role='member'")
                    self.fulfill(parents.pop(),ARTICLE)
                    page.get_by_text(COMMENT['content'],exact=True).wait_for()
                page.wait_for_function("!noticePublicOwners.has('comments')")
                self.assertNotIn('OLD EARLY ROW',page.locator('#div_main').inner_text())
                self.assertEqual(self.count(calls,COMMENTS),1 if change=='deadline' else 2)
                self.assertEqual(self.count(calls,READ),1 if change=='deadline' else 2)
                if change=='deadline':
                    self.assertEqual(page.locator('#div_community_read_comment .animate-pulse').count(),0)
                    self.assertNotIn('댓글 (0)',page.locator('#div_main').inner_text())
                self.assertEqual(errors,[])

    def test_held_loader_fallback_can_submit_and_mutation_ack_starts_fresh_read(self):
        for action in ('new','edit'):
            with self.subTest(action=action):
                saved=dict(COMMENT,content='Fresh saved '+action,check_comment_reader='writer')
                def comments(route,path,n,_):
                    self.fulfill(route,{} if n==1 and action=='new' else {'0':dict(COMMENT,check_comment_reader='writer') if n==1 else saved})
                page,calls,errors,_=self.render(comments,editor_hold=True)
                dialogs=[]
                page.on('dialog',lambda dialog:(dialogs.append(dialog.message),dialog.dismiss()))
                page.wait_for_function('!!window.finishEditorLoad')
                mutations=[]
                endpoint='/blank/ajax_board/'+('insert_comment/' if action=='new' else 'update_comment/')
                def mutation(route):
                    mutations.append({'method':route.request.method,'body':route.request.post_data})
                    self.fulfill(route,{'uuid':CID})
                page.route('**'+endpoint,mutation)
                if action=='new':
                    field=page.locator('#txt_content_comment_new_fallback')
                    button=page.locator('#div_community_read_comment_new').get_by_role('button',name='등록',exact=True)
                else:
                    page.get_by_role('button',name='수정',exact=True).click()
                    field=page.locator('#div_comment_editor_main_'+CID+' textarea')
                    button=page.locator('#div_comment_'+CID).get_by_role('button',name='등록',exact=True)
                field.fill('Typed '+action+' before assets')
                button.click()
                page.get_by_text(saved['content'],exact=True).wait_for()
                self.assertEqual(len(mutations),1)
                self.assertEqual(mutations[0]['method'],'POST')
                self.assertIn('name="txt_content"\r\n\r\nTyped '+action+' before assets',mutations[0]['body'])
                self.assertEqual(self.count(calls,COMMENTS),2)
                self.assertEqual(self.count(calls,READ),1)
                self.assertEqual(dialogs,[])
                next_draft=page.locator('#txt_content_comment_new_fallback')
                next_draft.fill('Unsubmitted next draft')
                page.evaluate('finishEditorLoad(false)')
                page.wait_for_function("!noticePublicOwners.has('comments')")
                self.assertEqual(next_draft.input_value(),'Unsubmitted next draft')
                self.assertEqual(self.count(calls,COMMENTS),2)
                self.assertEqual(errors,[])

    def test_new_initial_coordinator_same_url_does_not_join_retired_first_action(self):
        parents=[]
        def parent(route,path,n,parked):
            parents.append(route);parked.append(route)
        def comments(route,path,n,_):
            self.fulfill(route,{'0':dict(COMMENT,content='OLD ACTION' if n==1 else 'New initial action comment')})
        page,calls,errors,_=self.render(comments,primary=parent)
        page.wait_for_function("noticePublicOwners.has('comments')")
        page.wait_for_timeout(15)
        page.evaluate('void set_main()')
        page.wait_for_function("document.querySelector('#div_community_read_comment').getAttribute('aria-busy')==='true'")
        page.wait_for_timeout(15)
        self.assertEqual(self.count(calls,READ),2)
        self.assertEqual(self.count(calls,COMMENTS),2)
        self.fulfill(parents.pop(),ARTICLE)
        page.get_by_text('New initial action comment',exact=True).wait_for()
        self.assertNotIn('OLD ACTION',page.locator('#div_main').inner_text())
        page.wait_for_function("!noticePublicOwners.has('comments')")
        self.assertEqual(errors,[])


if __name__=='__main__':unittest.main(verbosity=2)
