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
};
const window = {
  WebRI18n: { language: 'en', t: source => source },
  url: 'all',
  addEventListener(name, callback) { listeners[name] = callback; },
};
const root = {};
let renders = 0;
const context = vm.createContext({
  window,
  document: { getElementById(id) { return id === 'div_main' ? root : null; } },
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

context.article = { title: '자유게시판', user_nickname: '작성자', category_url: 'free', uuid: 'source-uuid' };
const article = vm.runInContext('LatestArticleItem({data:article})', context);
const articleJSON = JSON.stringify(article);
assert.ok(articleJSON.includes('자유게시판'), 'authored title remains unchanged');
assert.ok(articleJSON.includes('작성자'), 'author nickname remains unchanged');
assert.ok(articleJSON.includes('General Discussion'), 'category UI label is localized');

window.WebRI18n.t = source => source;
vm.runInContext('renderListPageShell()', context);
assert.equal(renders, 1);
vm.runInContext('refreshSidebarWidgets = () => {}; getCommunityBoardCards = async () => {}', context);
window.WebRI18n.t = source => translations[source] || source;
listeners['webr:language-change']({ detail: { language: 'en' } });
assert.equal(renders, 2, 'catalog arrival rerenders the same-locale static shell');
assert.equal(vm.runInContext('communityState.uiLocaleSignature', context), 'en|General Discussion');
