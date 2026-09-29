const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..', 'scripts_go', 'web_r_go_20260629_1025');
const cases = [
  ['scripts/admin/set_main_20240506_2337.js'],
  ['scripts/common/board/read/set_main_20240915_1931.js'],
  ['scripts/common/board/read/set_main_20251122_2104.js'],
  ['scripts/workshop/youtube/read/set_main.js'],
  ['scripts_v2/account/change_password/auth/set_main_20260601_2104.js'],
  ['scripts_v2/account/change_password/main/set_main.js'],
  ['scripts_v2/account/google_login_20260725_1135.js'],
  ['scripts_v2/account/myinfo/edit/set_main.js'],
  ['scripts_v2/account/myinfo/myinfo/myinfo_20260704_1549.js'],
  ['scripts_v2/account/team/team_20260506_1630.js'],
  ['scripts_v2/account/welcome/set_main.js'],
  ...['detail', 'list', 'write', 'edit'].map((bookRoute) => ['scripts_v2/book/set_main.js', 'list', bookRoute]),
  ...['list', 'read', 'write', 'edit'].map((mode) => ['scripts_v2/community/set_main_solid_edit_comment_mini_20260927_pending_publication.js', mode]),
  ['scripts_v2/intro/intro/set_main_20260603_1437.js'],
  ...['list', 'read', 'write', 'edit'].map((mode) => ['scripts_v2/intro/notice/set_main_solid_edit_comment_mini_20260822_1548.js', mode]),
  ['scripts_v2/intro/privates/set_main_20260420_1415.js'],
  ['scripts_v2/intro/refund/set_main_20260603_1638_refund_policy.js'],
  ['scripts_v2/intro/terms/set_main_20260420_1415.js'],
  ['scripts_v2/webr/notebook/set_main.js'],
  ['scripts_v2/webr/shinyapps/set_main.js'],
  ['scripts_v2/workshop/workshop/catalog_20260630_2323_image_fallback.js'],
  ...['list', 'read', 'write', 'edit'].map((mode) => ['scripts_v2/workshop/youtube/set_main_comment_mini_20260930_first_paint.js', mode]),
];

function verify(file, mode = 'list', bookRoute = 'detail') {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const calls = [];
  const nodes = new Map();
  const pending = () => new Promise(() => {});
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      id, style: {}, dataset: {}, innerHTML: '', value: '', children: [],
      classList: { add() {}, remove() {}, toggle() {} },
      appendChild() {}, setAttribute() {}, getAttribute() { return null; },
      querySelector() { return null; }, querySelectorAll() { return []; },
      addEventListener() {}, removeEventListener() {},
    });
    return nodes.get(id);
  }
  const context = {
    console: { log() {}, error() {} }, URL, URLSearchParams, FormData, AbortController,
    setTimeout() { return 1; }, clearTimeout() {}, setInterval() { return 1; }, clearInterval() {},
    location: { href: 'https://paint.test/community/', pathname: '/community/', origin: 'https://paint.test', search: '' },
    history: { replaceState() {} }, navigator: {},
    fetch(url) { calls.push({ type: 'request', url }); return pending(); },
    localStorage: { getItem() { return null; }, setItem() {} },
    sessionStorage: { getItem() { return null; }, setItem() {} },
    document: {
      getElementById: node, querySelector() { return node('query'); }, querySelectorAll() { return []; },
      createElement() { return node('created'); }, addEventListener() {},
      documentElement: { dataset: {}, classList: { add() {}, remove() {} } }, body: node('body'), cookie: '',
    },
    React: { createElement(type, props, ...children) { return { type, props, children }; }, createContext() { return {}; } },
    ReactDOM: {
      render(tree, target) { calls.push({ type: 'render', id: target.id }); },
      createRoot(target) { return { render() { calls.push({ type: 'render', id: target.id }); } }; },
    },
    gv_username: 'current-member', gv_role: 'member', gv_name: 'Member',
    gv_uuid: '11111111-1111-4111-8111-111111111111',
    mode, url: 'free', sub: '', orderID: '11111111-1111-4111-8111-111111111111', init_url: '/community/',
    getCookie() { return ''; },
    get_read_article: pending, get_article_famous_list() {}, get_new_comment_list() {}, get_my_article_list() {}, get_my_comment_list() {},
    WebRSolidEdit: { mountEditor() { return { setHTML() {} }; } },
  };
  context.window = context;
  context.addEventListener = () => {};
  context.removeEventListener = () => {};
  context.matchMedia = () => ({ matches: false, addEventListener() {} });
  context.requestAnimationFrame = () => 1;
  context.cancelAnimationFrame = () => {};
  context.WEBR_NOTEBOOK_API = { list: '/list/', toggle_favoriate: '/toggle/', delete: '/delete/' };
  context.WebRBookRouteContext = { route: bookRoute, sub: 'book' };
  const jquery = () => ({ ready() {}, on() {}, scroll() {}, val() { return ''; } });
  jquery.ajax = (options) => calls.push({ type: 'request', url: options.url });
  context.$ = jquery;
  // Shared component declarations are dependencies of the route bundle.
  // Their markup is irrelevant to whether that bundle starts a network read
  // before mounting the main page root.
  for (const name of source.matchAll(/React\.createElement\(\s*([A-Z][A-Za-z0-9_$]*)\s*[,)]/g)) {
    context[name[1]] = () => ({});
  }
  vm.createContext(context);
  vm.runInContext(source, context, { timeout: 1000 });
  const completion = vm.runInContext('typeof set_main === "function" ? set_main() : window.set_main()', context, { timeout: 1000 });
  if (completion && typeof completion.catch === 'function') completion.catch(() => {});
  assert.deepEqual(calls[0], { type: 'render', id: 'div_main' }, `${file} (${mode}/${bookRoute}) must mount its page before any unresolved data read`);
}

for (const entry of cases) verify(...entry);
console.log(`${cases.length} legacy renderer entry branches mounted before unresolved data reads`);
