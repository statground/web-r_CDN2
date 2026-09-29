const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = path.join(__dirname, '..', 'scripts_go', 'web_r_go_20260629_1025',
  'scripts_v2', 'community', 'set_main_solid_edit_comment_mini_20260927_pending_publication.js');
const listeners = {};
const translations = {
  '커뮤니티': 'Community',
  '자유게시판': 'General Discussion',
  '전체보기': 'View All',
  '작성자': 'Author',
  '표시할 글이 없습니다.': 'No posts to display.',
  '전체 출처': 'All Sources',
  '총 {total}건 / {page} / {pages}페이지': '{total} posts · Page {page} of {pages}',
  '원글: ': 'Original post: ',
  '내가 쓴 댓글': 'My comments',
  '댓글 내용': 'Comment text',
  '댓글 ({count})': 'Comments ({count})',
  '작성자 차단': 'Block author',
  '제목을 입력해주세요.': 'Enter a title.',
  '내용을 입력해주세요.': 'Enter content.',
  '비밀글로 작성하기 (본인과 관리자만 읽을 수 있습니다.)': 'Post privately.',
  '게시글 목록을 일시적으로 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.': 'Posts are temporarily unavailable. Please try again shortly.',
  '일부 커뮤니티 자료를 일시적으로 불러오지 못했습니다.': 'Some community content is temporarily unavailable.',
};
const window = {
  WebRI18n: { language: 'en', t: source => source },
  url: 'all',
  addEventListener(name, callback) { listeners[name] = callback; },
};
const root = {};
const elements = {};
let renders = 0;
const context = vm.createContext({
  window,
  document: { getElementById(id) { return elements[id] || (id === 'div_main' ? root : null); } },
  location: { pathname: '/community/' },
  url: 'all',
  sub: '',
  mode: '',
  gv_username: '',
  React: { createElement(type, props, ...children) { return { type, props: props || {}, children }; } },
  ReactDOM: { render() { renders += 1; } },
  console,
});
vm.runInContext(fs.readFileSync(script, 'utf8'), context, { filename: script });
assert.equal(vm.runInContext('getCommunityHeaderTitle("all")', context), '커뮤니티');

window.WebRI18n.t = source => translations[source] || source;
assert.equal(vm.runInContext('getCommunityHeaderTitle("all")', context), 'Community');
assert.equal(vm.runInContext('communityCardDefinitions()[0].empty', context), 'No posts to display.');
assert.equal(vm.runInContext('isAdminViewer()', context), false);
window.gv_role = '관리자';
assert.equal(vm.runInContext('isAdminViewer()', context), true, 'role authority stays in its source language');
const roleBadge = vm.runInContext('Span_btn_user({role:"관리자",user_nickname:"sample"})', context);
assert.ok(roleBadge.props.class.includes('bg-yellow-100'), 'role styling keeps its source identity');

const boardTab = vm.runInContext('DivBoardTabs()', context);
const encoded = JSON.stringify(boardTab);
assert.ok(encoded.includes('View All'));
assert.ok(encoded.includes('General Discussion'));
assert.ok(JSON.stringify(vm.runInContext('SourceFilterButton({value:"",label:"전체 출처"})', context)).includes('All Sources'));

context.article = { title: '자유게시판', user_nickname: '작성자', category_url: 'free', uuid: 'source-uuid' };
const article = vm.runInContext('LatestArticleItem({data:article})', context);
const articleJSON = JSON.stringify(article);
assert.ok(articleJSON.includes('자유게시판'), 'authored title remains unchanged');
assert.ok(articleJSON.includes('작성자'), 'author nickname remains unchanged');
assert.ok(articleJSON.includes('General Discussion'), 'category UI label is localized');

const pagination = vm.runInContext('ArticlePagination({totalCount:125,currentPage:2,pageSize:10,onPageChange:()=>{}})', context);
assert.ok(JSON.stringify(pagination).includes('125 posts · Page 2 of 13'));
const sidebarComment = vm.runInContext('SidebarCommentItem({data:{uuid_article:"post-1",article_title:"원래 제목",content:"내가 쓴 본문",display_content_language:"ko",display_article_title_language:"ko"}})', context);
const commentJSON = JSON.stringify(sidebarComment);
assert.ok(commentJSON.includes('Original post: '));
assert.ok(commentJSON.includes('원래 제목'));
assert.ok(commentJSON.includes('내가 쓴 본문'));
assert.ok(commentJSON.includes('"data-webr-user-content":"comment"'));
assert.ok(commentJSON.includes('"data-webr-user-content":"title"'));
assert.ok(commentJSON.includes('"lang":"ko"'));
assert.equal(vm.runInContext('communityT("댓글 ({count})",{count:7})', context), 'Comments (7)');
assert.equal(vm.runInContext('communityT("내가 쓴 댓글")', context), 'My comments');
assert.equal(vm.runInContext('communityT("작성자 차단")', context), 'Block author');
assert.equal(vm.runInContext('communityArticleListPendingMessage({message:"게시글 목록을 일시적으로 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."})', context), 'Posts are temporarily unavailable. Please try again shortly.');
assert.equal(vm.runInContext('communityArticleListPartialMessage({message:"일부 커뮤니티 자료를 일시적으로 불러오지 못했습니다."})', context), 'Some community content is temporarily unavailable.');
assert.equal(vm.runInContext('communityArticleListPartialMessage({message:"Unknown source status"})', context), 'Unknown source status', 'unrecognized source text is never guessed or translated');

window.WebRI18n.t = source => source;
vm.runInContext('renderListPageShell()', context);
assert.equal(renders, 1);
vm.runInContext('refreshSidebarWidgets = () => {}; getCommunityBoardCards = async () => {}', context);
window.WebRI18n.t = source => translations[source] || source;
listeners['webr:language-change']({ detail: { language: 'en' } });
assert.equal(renders, 2, 'catalog arrival rerenders the same-locale static shell');
assert.equal(vm.runInContext('communityState.uiLocaleSignature', context), 'en|General Discussion');

context.mode = 'edit';
elements.txt_title = { value: 'authored title' };
elements.txt_content = { value: 'typed draft' };
elements.chk_secret = { checked: true, labels: [{ textContent: '' }] };
elements.div_button_list = {};
window.WebRI18n.language = 'ja';
listeners['webr:language-change']({ detail: { language: 'ja' } });
assert.equal(elements.txt_title.value, 'authored title');
assert.equal(elements.txt_title.placeholder, 'Enter a title.');
assert.equal(elements.txt_content.value, 'typed draft');
assert.equal(elements.txt_content.placeholder, 'Enter content.');
assert.equal(elements.chk_secret.checked, true);
assert.equal(elements.chk_secret.labels[0].textContent, 'Post privately.');
