const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = path.join(__dirname, '..', 'scripts_go', 'web_r_go_20260629_1025',
  'scripts_v2', 'community', 'set_main_solid_edit_comment_mini_20260927_pending_publication.js');
const listeners = {};
const window = {
  WebRI18n: { language: 'ko' },
  url: 'free',
  addEventListener(name, callback) { listeners[name] = callback; },
  setTimeout(callback) { callback(); },
};
const context = vm.createContext({
  window,
  document: { getElementById() { return null; } },
  FormData,
  location: { pathname: '/community/free/' },
  url: 'free',
  sub: '',
  mode: '',
  gv_username: '',
  console,
});
vm.runInContext(fs.readFileSync(script, 'utf8'), context, { filename: script });

assert.equal(typeof listeners['webr:language-change'], 'function');
const koreanKey = vm.runInContext('communityArticlePageCacheKey(1, "")', context);
vm.runInContext('communityArticlePageCache[communityArticlePageCacheKey(1, "")] = {at: Date.now(), data:{list:{}}}', context);

let refreshed = '';
context.refreshed = (value) => { refreshed = value; };
vm.runInContext('get_article_list = async (kind, page) => refreshed(kind + ":" + page)', context);
vm.runInContext('getCommunityBoardCards = async () => refreshed("cards")', context);
window.WebRI18n.language = 'en';
listeners['webr:language-change']({ detail: { language: 'en' } });
assert.equal(refreshed, 'cards');
const englishKey = vm.runInContext('communityArticlePageCacheKey(1, "")', context);
assert.notEqual(englishKey, koreanKey);
assert.equal(vm.runInContext('Object.keys(communityArticlePageCache).length', context), 0);
assert.equal(vm.runInContext('readCommunityArticlePageCache(1, "")', context), null);

window.url = 'rblogger';
window.WebRI18n.language = 'es';
listeners['webr:language-change']({ detail: { language: 'es' } });
assert.equal(refreshed, 'page:1');

context.mode = 'read';
vm.runInContext('get_read_article = async (kind) => refreshed("read:" + kind)', context);
window.WebRI18n.language = 'ja';
listeners['webr:language-change']({ detail: { language: 'ja' } });
assert.equal(refreshed, 'read:locale');

context.mode = 'edit';
window.WebRI18n.language = 'fr';
listeners['webr:language-change']({ detail: { language: 'fr' } });
assert.equal(refreshed, 'read:locale', 'author editing must not be replaced by a translated view');
