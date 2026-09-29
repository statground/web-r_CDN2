const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'scripts_go',
  'web_r_go_20260629_1025', 'scripts_v2', 'workshop', 'youtube',
  'set_main_comment_mini_20260930_first_paint.js'), 'utf8');

function fixture(fetch) {
  const nodes = new Map();
  const calls = [];
  const timers = new Map();
  let nextTimer = 1;
  const location = { pathname: '/workshop/youtube/', href: '' };
  const node = (id) => {
    if (!nodes.has(id)) nodes.set(id, { id, innerHTML: '', appendChild() {}, setAttribute() {} });
    return nodes.get(id);
  };
  const window = {
    location, addEventListener() {}, removeEventListener() {},
    setTimeout(fn, ms) { const id = nextTimer++; timers.set(id, { fn, ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
  };
  const context = vm.createContext({
    window, location, console, FormData, AbortController, URL,
    document: { getElementById: node, cookie: '', documentElement: { scrollHeight: 1000 }, createElement: () => node('created') },
    React: { createElement: (type, props, ...children) => ({ type, props, children }) },
    ReactDOM: { render(tree, target) { calls.push({ kind: 'render', tree, target: target.id }); } },
    fetch: (...args) => { calls.push({ kind: 'fetch', url: args[0], options: args[1] }); return fetch(...args); },
    mode: 'list', url: 'youtube', sub: '', init_url: '/workshop/youtube/',
    gv_username: 'cached-admin', gv_role: 'admin',
  });
  vm.runInContext(source, context);
  return { context, calls, timers, nodes, location };
}

const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

async function run() {
  const hanging = fixture(() => new Promise(() => {}));
  vm.runInContext('get_article_list_youtube=()=>{window.listStarted=true;};set_main()', hanging.context);
  assert.equal(hanging.calls[0].kind, 'render');
  assert.equal(hanging.calls[0].target, 'div_main');
  assert.equal(hanging.calls[0].tree.props.showWriteButton, false);
  assert.equal(hanging.context.window.listStarted, true);
  await settle();
  assert.equal(hanging.calls[1].url, '/ajax_get_menu_header/');
  assert.equal(hanging.calls[1].options.method, 'POST');
  const permissionTimer = [...hanging.timers.values()].find((timer) => timer.ms === 3000);
  permissionTimer.fn();
  await settle();
  assert.equal(hanging.calls[1].options.signal.aborted, true);
  assert.equal(hanging.calls.filter((call) => call.kind === 'render').length, 1);
  assert.equal(vm.runInContext('youtubeListCanWrite', hanging.context), false);

  for (const currentRole of ['admin', 'member']) {
    const current = fixture(async () => ({ ok: true, json: async () => ({ username: 'current-user', role: currentRole }) }));
    vm.runInContext('get_article_list_youtube=()=>{};set_main()', current.context);
    await settle();
    const renders = current.calls.filter((call) => call.kind === 'render');
    assert.equal(renders.filter((call) => call.target === 'div_main').length, 1, 'permission must not remount list cards');
    assert.equal(renders.some((call) => call.target === 'div_youtube_write'), currentRole === 'admin');
    assert.equal(vm.runInContext('youtubeListCanWrite', current.context), currentRole === 'admin');
    assert.equal(current.timers.size, 0);
  }

  const denied = fixture(async () => ({ ok: false, json: async () => ({ username: 'admin', role: 'admin' }) }));
  vm.runInContext('get_article_list_youtube=()=>{};set_main()', denied.context);
  await settle();
  assert.equal(vm.runInContext('youtubeListCanWrite', denied.context), false);

  let finishPermission;
  const departed = fixture(() => new Promise((resolve) => { finishPermission = resolve; }));
  vm.runInContext('get_article_list_youtube=()=>{};set_main()', departed.context);
  await settle();
  departed.location.pathname = '/community/';
  finishPermission({ ok: true, json: async () => ({ username: 'admin', role: 'admin' }) });
  await settle();
  assert.equal(departed.calls.filter((call) => call.kind === 'render').length, 1);

  const list = fixture(() => new Promise(() => {}));
  vm.runInContext('get_article_list_youtube("init")', list.context);
  await settle();
  const readTimer = [...list.timers.values()].find((timer) => timer.ms === 15000);
  assert.ok(readTimer, 'list network/body read must have a finite deadline');
  readTimer.fn();
  await settle();
  assert.equal(list.calls.find((call) => call.kind === 'fetch').options.signal.aborted, true);
  assert.equal(vm.runInContext('toggle_page', list.context), false);
  assert.equal(vm.runInContext('youtubeListError', list.context), '영상 목록을 잠시 불러오지 못했습니다.');
  assert.ok([...list.timers.values()].some((timer) => timer.ms === 1500), 'failed list keeps bounded retry');
  assert.equal(vm.runInContext('youtubeLoadedItems.length', list.context), 0);
  const image = { dataset: { fallbackApplied: '1' }, src: '', style: {}, naturalWidth: 120, naturalHeight: 90,
    closest() { throw new Error('thumbnail failure must never hide the verified card'); } };
  list.context.imageEvent = { currentTarget: image };
  vm.runInContext('onYoutubeThumbError(imageEvent, {youtube_url:"https://www.youtube.com/watch?v=l45h6KH_RTo"})', list.context);
  assert.equal(image.style.display, 'none');
  vm.runInContext('onYoutubeThumbLoad(imageEvent)', list.context);
  assert.equal(image.style.display, '');
  console.log('YouTube first paint, current permission, departure, and bounded list checks passed');
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
