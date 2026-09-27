const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const bundle = fs.readFileSync(path.join(__dirname, '..', 'scripts_go',
  'web_r_go_20260629_1025', 'scripts_v2', 'community',
  'set_main_solid_edit_comment_mini_20260927_pending_publication.js'), 'utf8');
const articleID = '22222222-2222-4222-8222-222222222222';

async function run(action, response) {
  const alerts = [];
  const location = { pathname: '/community/free/read/' + articleID + '/', href: '' };
  const window = { WebRI18n: { language: 'ko' }, addEventListener() {}, location };
  const ctx = vm.createContext({
    window, location, FormData, console,
    document: { getElementById(id) {
      if (id === 'txt_title') return { value: '수정 제목' };
      if (id === 'chk_secret') return { checked: false };
      return {};
    } },
    ReactDOM: { render() {} }, React: { createElement() { return {}; } },
    fetch: async () => {
      if (response instanceof Error) throw response;
      return { ok: response.http !== false, status: response.http === false ? 503 : 200,
        json: async () => response.body };
    },
    alert: (message) => alerts.push(message), confirm: () => true,
    url: 'free', sub: '', mode: action === 'edit' ? 'edit' : 'read',
    orderID: articleID, gv_username: 'writer', init_url: '/community/',
  });
  vm.runInContext(bundle, ctx);
  vm.runInContext(`getCookie=()=>'';
    getArticleEditorHTML=()=>'<p>수정 본문</p>';
    isArticleContentEmpty=()=>false;
    uploadQueuedFiles=async()=>{}; queuedArticleFiles=()=>[];`, ctx);
  await vm.runInContext(action === 'edit' ? 'submit_edit()' : 'click_btn_delete()', ctx);
  return { alerts, href: location.href,
    submitting: vm.runInContext('communityState.toggle_click_submit', ctx) };
}

(async () => {
  for (const response of [
    { body: { checker: 'ERROR', error: '삭제 실패' } },
    { body: {} }, { http: false }, new Error('network'),
  ]) {
    const result = await run('delete', response);
    assert.equal(result.href, '', 'delete failure must stay on the article');
    assert.equal(result.alerts.length, 1, 'delete failure must be visible');
  }
  assert.equal((await run('delete', { body: { checker: 'SUCCESS' } })).href, '/community/');

  for (const response of [
    { body: { error: '수정 실패' } }, { body: {} },
    { http: false }, new Error('network'),
  ]) {
    const result = await run('edit', response);
    assert.equal(result.href, '', 'edit failure must stay on the form');
    assert.equal(result.alerts.length, 1, 'edit failure must be visible');
    assert.equal(result.submitting, false, 'edit form must allow retry');
  }
  assert.equal((await run('edit', { body: { uuid: articleID } })).href,
    `/community/read/${articleID}/`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
