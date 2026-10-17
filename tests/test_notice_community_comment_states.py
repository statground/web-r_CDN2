"""Real renderers with synthetic data and every browser request intercepted."""
import unittest

from tests import test_community_comment_prefetch as community
from tests import test_notice_comment_read_ownership as notice
from tests.test_youtube_detail_width import STYLES

BOX = "#div_community_read_comment"
EMPTY = "아직 등록된 댓글이 없습니다."


class CommentStateTests(unittest.TestCase):
    setUpClass = classmethod(community.CommunityCommentPrefetchTests.setUpClass.__func__)
    tearDownClass = classmethod(community.CommunityCommentPrefetchTests.tearDownClass.__func__)
    fixture = community.CommunityCommentPrefetchTests.fixture
    render = notice.NoticeCommentReadTests.render
    fulfill = staticmethod(community.CommunityCommentPrefetchTests.fulfill)
    count = staticmethod(notice.NoticeCommentReadTests.count)

    def assert_pending(self, page):
        box = page.locator(BOX)
        self.assertEqual(box.get_attribute("aria-busy"), "true")
        self.assertEqual(box.get_by_role("heading", name="댓글", exact=True).count(), 1)
        self.assertIn("댓글을 불러오고 있습니다.", box.inner_text())
        self.assertGreater(box.locator(".animate-pulse").count(), 0)
        self.assertNotIn("댓글 (0)", box.inner_text())
        self.assertNotIn(EMPTY, box.inner_text())

    def assert_styled_pending_geometry(self, page):
        for stylesheet in STYLES:
            page.add_style_tag(path=str(stylesheet))
        self.assert_pending(page)
        for selector in (BOX, BOX + " h2", BOX + " [role=status]", BOX + " .animate-pulse"):
            self.assertTrue(page.locator(selector).evaluate("""node => {
              const rect=node.getBoundingClientRect();
              if(rect.width<=0||rect.height<=0)return false;
              for(let el=node;el;el=el.parentElement){const style=getComputedStyle(el);
                if(el.hidden||style.display==='none'||style.visibility==='hidden')return false;}
              return true;
            }"""), selector)

    def assert_settled(self, page, state):
        box = page.locator(BOX)
        self.assertEqual(box.get_attribute("aria-busy"), "false")
        self.assertEqual(box.get_attribute("data-webr-comment-state"), state)
        self.assertEqual(box.locator(".animate-pulse,[role=status]").count(), 0)

    def test_community_primary_and_comment_fetch_pending_have_visible_context(self):
        page, calls, held, errors = self.fixture(width=390)
        self.assert_styled_pending_geometry(page)
        self.fulfill(held[community.READ].pop(), community.ARTICLE)
        page.get_by_text(community.ARTICLE["content"], exact=True).wait_for()
        self.assert_pending(page)
        self.fulfill(held[community.COMMENTS].pop(), {"0": community.COMMENT})
        page.get_by_text(community.COMMENT["content"], exact=True).wait_for()
        self.assert_settled(page, "ready")
        self.assertNotIn(EMPTY, page.locator(BOX).inner_text())
        self.assertEqual(calls.count(community.READ), 1)
        self.assertEqual(calls.count(community.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_notice_primary_and_comment_fetch_pending_have_visible_context(self):
        primary = []
        page, calls, errors, held = self.render(lambda route, path, n, parked: parked.append(route),
            primary=lambda route, *_: primary.append(route), width=1440)
        page.wait_for_function("noticePublicOwners.has('comments')")
        self.assert_styled_pending_geometry(page)
        self.fulfill(primary.pop(), notice.ARTICLE)
        page.get_by_text(notice.ARTICLE["content"], exact=True).wait_for()
        self.assert_pending(page)
        self.fulfill(held.pop(), {"0": notice.COMMENT})
        page.get_by_text(notice.COMMENT["content"], exact=True).wait_for()
        self.assert_settled(page, "ready")
        self.assertNotIn(EMPTY, page.locator(BOX).inner_text())
        self.assertEqual(self.count(calls, notice.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_community_held_body_is_pending_until_verified_empty(self):
        page, calls, held, errors = self.fixture(hold_body=True)
        self.fulfill(held[community.READ].pop(), community.ARTICLE)
        self.fulfill(held[community.COMMENTS].pop(), {})
        page.wait_for_function("!!heldCommentJSON")
        self.assert_pending(page)
        page.evaluate("heldCommentJSON({})")
        page.get_by_text(EMPTY, exact=True).wait_for()
        self.assert_settled(page, "empty")
        self.assertEqual(calls.count(community.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_notice_held_body_is_pending_until_verified_empty(self):
        page, calls, errors, _ = self.render(lambda route, *_: self.fulfill(route, {}), body_hold=True, width=390)
        page.wait_for_function("!!window.finishCommentBody")
        self.assert_pending(page)
        page.evaluate("finishCommentBody({})")
        page.get_by_text(EMPTY, exact=True).wait_for()
        self.assert_settled(page, "empty")
        self.assertEqual(self.count(calls, notice.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_community_http_error_stops_pulse_without_empty_or_retries(self):
        page, calls, held, errors = self.fixture()
        self.fulfill(held[community.READ].pop(), community.ARTICLE)
        self.fulfill(held[community.COMMENTS].pop(), {"ok": False}, 503)
        page.locator('[data-webr-community-action-status="comment-read"]').wait_for()
        self.assert_settled(page, "unavailable")
        self.assertNotIn(EMPTY, page.locator(BOX).inner_text())
        self.assertNotIn("댓글 (0)", page.locator(BOX).inner_text())
        page.clock.run_for(45001)
        self.assertEqual(calls.count(community.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_notice_http_error_stops_pulse_without_empty_or_retries(self):
        page, calls, errors, _ = self.render(lambda route, *_: self.fulfill(route, {"ok": False}, 503))
        page.locator(BOX + " [role=alert]").wait_for()
        self.assert_settled(page, "unavailable")
        self.assertNotIn(EMPTY, page.locator(BOX).inner_text())
        self.assertNotIn("댓글 (0)", page.locator(BOX).inner_text())
        page.clock.run_for(45001)
        self.assertEqual(self.count(calls, notice.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_community_denial_retires_pending_and_does_not_show_empty(self):
        page, calls, held, errors = self.fixture()
        self.fulfill(held[community.READ].pop(), community.ARTICLE)
        self.fulfill(held[community.COMMENTS].pop(), {}, 403)
        page.get_by_role("alert").wait_for()
        self.assertEqual(page.locator(BOX + " .animate-pulse").count(), 0)
        self.assertNotIn(EMPTY, page.locator("#div_main").inner_text())
        self.assertNotIn("댓글 (0)", page.locator("#div_main").inner_text())
        self.assertEqual(calls.count(community.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_notice_denial_is_unavailable_without_fake_empty(self):
        page, calls, errors, _ = self.render(lambda route, *_: self.fulfill(route, {}, 403))
        page.locator(BOX + " [role=alert]").wait_for()
        self.assert_settled(page, "unavailable")
        self.assertNotIn(EMPTY, page.locator(BOX).inner_text())
        self.assertNotIn("댓글 (0)", page.locator(BOX).inner_text())
        self.assertEqual(self.count(calls, notice.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_community_held_editor_does_not_keep_read_busy_or_erase_rows(self):
        page, calls, held, errors = self.fixture(editor_hold=True)
        self.fulfill(held[community.READ].pop(), community.ARTICLE)
        self.fulfill(held[community.COMMENTS].pop(), {"0": community.COMMENT})
        page.wait_for_function("!!window.finishFirstEditorAssets")
        page.locator("#txt_content_comment_new_fallback").fill("Unsent draft")
        self.assert_settled(page, "ready")
        page.clock.run_for(45001)
        self.assertIn(community.COMMENT["content"], page.locator(BOX).inner_text())
        self.assertEqual(page.locator("#txt_content_comment_new_fallback").input_value(), "Unsent draft")
        self.assertEqual(page.locator('[data-webr-community-action-status="comment-read"]').count(), 0)
        self.assertEqual(calls.count(community.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_notice_held_editor_does_not_keep_read_busy_or_erase_rows(self):
        page, calls, errors, _ = self.render(lambda route, *_: self.fulfill(route, {"0": notice.COMMENT}), editor_hold=True)
        page.wait_for_function("!!window.finishEditorLoad")
        page.locator("#txt_content_comment_new_fallback").fill("Unsent draft")
        self.assert_settled(page, "ready")
        page.clock.run_for(45001)
        self.assertIn(notice.COMMENT["content"], page.locator(BOX).inner_text())
        self.assertEqual(page.locator("#txt_content_comment_new_fallback").input_value(), "Unsent draft")
        self.assertEqual(page.locator(BOX + " [role=alert]").count(), 0)
        self.assertEqual(self.count(calls, notice.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_community_role_change_retires_painted_rows_and_restates_pending(self):
        page, calls, held, errors = self.fixture(editor_hold=True)
        self.fulfill(held[community.READ].pop(), community.ARTICLE)
        self.fulfill(held[community.COMMENTS].pop(), {"0": community.COMMENT})
        page.wait_for_function("!!window.finishFirstEditorAssets")
        self.assert_settled(page, "ready")
        page.evaluate("gv_role='admin'")
        page.clock.run_for(101)
        self.assert_pending(page)
        self.assertNotIn(community.COMMENT["content"], page.locator(BOX).inner_text())
        page.clock.run_for(45001)
        self.assert_settled(page, "unavailable")
        self.assertNotIn(EMPTY, page.locator(BOX).inner_text())
        self.assertEqual(calls.count(community.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_notice_role_change_cannot_preserve_prior_viewer_rows_after_editor_wait(self):
        page, calls, errors, _ = self.render(lambda route, *_: self.fulfill(route, {"0": notice.COMMENT}), editor_hold=True)
        page.wait_for_function("!!window.finishEditorLoad")
        self.assert_settled(page, "ready")
        page.evaluate("gv_role='admin';finishEditorLoad(false)")
        page.locator(BOX + " [role=alert]").wait_for()
        self.assert_settled(page, "unavailable")
        self.assertNotIn(notice.COMMENT["content"], page.locator(BOX).inner_text())
        self.assertNotIn(EMPTY, page.locator(BOX).inner_text())
        self.assertEqual(self.count(calls, notice.COMMENTS), 1)
        self.assertEqual(errors, [])

    def test_notice_failed_refresh_keeps_same_viewer_rows_draft_and_reply_data(self):
        row = dict(notice.COMMENT, active=1, check_comment_reader="writer")
        def comments(route, path, n, held):
            if n == 1:
                self.fulfill(route, {"0": row})
            else:
                held.append(route)
        page, calls, errors, held = self.render(comments, editor_hold=True)
        page.wait_for_function("!!window.finishEditorLoad")
        page.route("**/blank/ajax_board/insert_comment/", lambda route: self.fulfill(route, {"uuid": notice.CID}))
        draft = page.locator("#txt_content_comment_new_fallback")
        draft.fill("Submitted comment")
        page.locator("#div_community_read_comment_new").get_by_role("button", name="등록", exact=True).click()
        page.wait_for_function("noticePublicOwners.has('comments')")
        page.wait_for_timeout(20)
        draft.fill("Next unsent draft")
        self.assertEqual(page.locator(BOX).get_attribute("aria-busy"), "true")
        self.assertIn(row["content"], page.locator(BOX).inner_text())
        self.fulfill(held.pop(), {"ok": False}, 503)
        page.locator(BOX + " [role=alert]").wait_for()
        self.assert_settled(page, "unavailable")
        self.assertIn(row["content"], page.locator(BOX).inner_text())
        self.assertEqual(draft.input_value(), "Next unsent draft")
        page.get_by_role("button", name="수정", exact=True).click()
        self.assertEqual(page.locator("#div_comment_editor_main_" + notice.CID + " textarea").input_value(), row["content"])
        self.assertEqual(self.count(calls, notice.COMMENTS), 2)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
