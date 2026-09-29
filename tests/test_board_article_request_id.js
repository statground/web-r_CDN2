const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'scripts_go',
  'web_r_go_20260629_1025', 'scripts_v2', 'community',
  'set_main_solid_edit_comment_mini_20260927_pending_publication.js'), 'utf8');
const requestID = '11111111-1111-4111-8111-111111111111';
const articleID = '22222222-2222-4222-8222-222222222222';
const stored = new Map();
const storage = {
  getItem: (key) => stored.get(key) || null,
  setItem: (key, value) => stored.set(key, value),
  removeItem: (key) => stored.delete(key),
};

async function submit(response) {
  const calls = [];
  const location = { pathname: '/community/free/write/', href: '' };
  const window = { WebRI18n: { language: 'ko' }, addEventListener() {}, location };
  const ctx = vm.createContext({
    window, location, sessionStorage: storage,
    crypto: { randomUUID: () => requestID },
    document: { getElementById(id) {
      if (id === 'txt_title') return { value: '테스트 글' };
      if (id === 'chk_secret') return { checked: false };
      return {};
    } },
    ReactDOM: { render() {} }, React: { createElement() { return {}; } },
    FormData, console,
    fetch: async (url, options) => {
      calls.push({ url, id: options.body.get('request_id') });
      return { json: async () => response };
    },
    alert: (message) => { throw new Error(message); },
    url: 'free', sub: '', mode: 'write', gv_username: 'writer',
    init_url: '/community/free/',
  });
  vm.runInContext(script, ctx);
  vm.runInContext(`getArticleEditorHTML=()=>'<p>본문</p>';
    isArticleContentEmpty=()=>false;
    showPendingArticlePublication=(uuid)=>{window.pendingUUID=uuid};
    uploadQueuedFiles=async()=>{}; queuedArticleFiles=()=>[];
    getCookie=()=>'';`, ctx);
  await vm.runInContext('submit_write()', ctx);
  return { calls, location, pendingUUID: window.pendingUUID };
}

(async () => {
  const first = await submit({ pending: true, uuid: articleID });
  assert.equal(first.pendingUUID, articleID);
  assert.equal(first.location.href, '');
  assert.equal(first.calls[0].id, requestID);
  assert.equal(stored.size, 1);

  const second = await submit({ uuid: articleID, publication_pending: true });
  assert.equal(second.pendingUUID, articleID);
  assert.equal(second.location.href, '');
  assert.equal(second.calls[0].id, requestID);
  assert.equal(stored.size, 1);

  const third = await submit({ uuid: articleID, publication_pending: false });
  assert.equal(third.calls[0].id, requestID);
  assert.equal(third.location.href, `/community/free/read/${articleID}/`);
  assert.equal(stored.size, 0);
})().catch((error) => { console.error(error); process.exitCode = 1; });
