"""Offline real SolidEdit/helper controls. Every browser request is intercepted."""
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import unittest

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'scripts_go/web_r_go_20260629_1025'
COMMON = ASSETS / 'scripts_v2/common/solid-edit'
CORE_URL = 'https://cdn.jsdelivr.net/gh/statground/solid-edit@ba2b1a6097fa2c677d9a51499a9a5e332afe4fb5/versions/0.0.4/editor.js'
CORE_SRI = 'sha384-o1lxhgutT7T8DymtCkYZMTZogs02eQQ49iziFUhnjFTwe4XR8OWMyrzZAvy9wS7Q'
COMMIT = '81fca7896f70d89651c49cd91ea7e03e846a0e66'
HOST_PATH = 'scripts_go/web_r_go_20260629_1025/scripts_v2/common/solid-edit/host_20260530_1745.js'
HOST_URL = 'https://cdn.jsdelivr.net/gh/statground/web-r_CDN2@' + COMMIT + '/' + HOST_PATH

class SolidEditReadLazyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.core = subprocess.check_output(['git','show','ba2b1a6097fa2c677d9a51499a9a5e332afe4fb5:versions/0.0.4/editor.js'],cwd=os.environ.get('SOLID_EDIT_SOURCE_REPO','/home/lv999/django/libraries/solid-edit'))
        if 'sha384-'+base64.b64encode(hashlib.sha384(cls.core).digest()).decode()!=CORE_SRI:
            raise AssertionError('immutable core SRI mismatch')
        cls.host = (COMMON/'host_20260530_1745.js').read_bytes()
        cls.descriptor = dict(version=1,commit=COMMIT,core=dict(src=CORE_URL,integrity=CORE_SRI),host=dict(src=HOST_URL,integrity='sha256-'+base64.b64encode(hashlib.sha256(cls.host).digest()).decode()))
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True,executable_path=os.environ.get('WEBR_CHROMIUM_EXECUTABLE','/home/lv999/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome'))

    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.pw.stop()

    def fixture(self, *, descriptor=True, held=True, width=390, fallback=False, legacy=False, legacy_nonce=False, held_host=False):
        page=self.browser.new_page(viewport=dict(width=width,height=900));self.addCleanup(page.close)
        page.set_default_timeout(4000)
        calls=[];parked=[]
        desc=self.descriptor if descriptor is True else descriptor
        html='<html><head><meta charset="utf-8"><script id="webr-legacy-context" nonce="controlled-nonce" type="application/json">{}</script>'
        if fallback:
            template=Path(os.environ.get('WEBR_APP_SOURCE_REPO','/tmp/webr-read-only-lazy-editor-app-source-audit-20261016'))/'templates/cdn_fallback.html'
            script=template.read_text().split('<script',1)[1].split('>',1)[1].split('</script>',1)[0]
            if legacy_nonce: script=script.replace('      if (node.nonce) replacement.nonce = node.nonce;\n','')
            active='https://cdn.jsdelivr.net/gh/statground/web-r_CDN2@'+COMMIT+'/scripts_go/web_r_go_20260629_1025/vendor/common/react_stack_jquery_react_htmx_alpine_20260510.js'
            html+='<script data-webr-cdn-active="'+active+'">'+script+'</script>'
        if legacy: html+='<script defer src="'+CORE_URL+'" integrity="'+CORE_SRI+'" crossorigin="anonymous"></script>'
        html+='<script>window.WEBR_SOLID_EDIT_READ_ASSETS='+json.dumps(desc)+'</script><script defer src="/disable.js"></script><script defer src="/helpers.js"></script></head><body><div id="body"></div><div id="comments">Existing public comment</div><textarea id="fallback">Initial draft</textarea><div id="editor"></div><script>document.addEventListener("DOMContentLoaded",()=>WebRSolidEdit.renderContent(document.getElementById("body"),\'<p>Public body first</p><script>window.bad=1<\\/script><img onerror="window.bad=2" src="data:,">\'));</script></body></html>'
        def fulfill(route,body):route.fulfill(status=200,content_type='application/javascript; charset=utf-8',headers={'Access-Control-Allow-Origin':'*'},body=body)
        def respond(route):
            u=route.request.url;calls.append(u)
            if u=='https://lazy.test/community/free/read/fixture/':route.fulfill(content_type='text/html; charset=utf-8',body=html)
            elif u.endswith('/disable.js'):fulfill(route,(COMMON/'disable_autoinit_20260503.js').read_bytes())
            elif u.endswith('/helpers.js'):fulfill(route,(COMMON/'helpers_20260530_2334.js').read_bytes())
            elif u==CORE_URL:
                if held:parked.append(route)
                else:fulfill(route,self.core)
            elif u==HOST_URL:
                if fallback:route.abort()
                elif held_host:parked.append(route)
                else:fulfill(route,self.host)
            elif u=='https://lazy.test/_webr/assets/'+COMMIT+'/'+HOST_PATH:fulfill(route,self.host)
            else:route.abort()
        page.route('**/*',respond)
        page.goto('https://lazy.test/community/free/read/fixture/',wait_until='commit' if legacy else 'domcontentloaded')
        return page,calls,parked,fulfill

    def test_body_and_comments_paint_before_core_then_real_mount_preserves_latest_draft(self):
        for width in (390,1440):
            with self.subTest(width=width):
                p,calls,held,fulfill=self.fixture(width=width)
                self.assertIn('Public body first',p.locator('#body').inner_text())
                self.assertIn('Existing public comment',p.locator('#comments').inner_text())
                self.assertEqual(p.locator('#body script,#body [onerror]').count(),0)
                self.assertNotIn(CORE_URL,calls)
                p.evaluate('''window.deadline=Date.now()+15000;window.ready=[];
                  WebRSolidEdit.ensureEditorAssets({deadline}).then(v=>ready.push(v));
                  WebRSolidEdit.ensureEditorAssets({deadline}).then(v=>ready.push(v));void 0;''')
                p.wait_for_function('document.querySelectorAll("script[integrity]").length===1')
                p.wait_for_timeout(10)
                self.assertEqual(calls.count(CORE_URL),1);self.assertEqual(len(held),1)
                p.locator('#fallback').fill('Typed while loading')
                fulfill(held.pop(),self.core)
                p.wait_for_function('ready.length===2')
                self.assertEqual(p.evaluate('ready'),[True,True])
                p.evaluate('''async()=>{window.mounted=await WebRSolidEditor.mountHost(document.getElementById('editor'),
                  {html:document.getElementById('fallback').value,restoreDraft:false,storageKey:'controlled-draft',timeoutMs:deadline-Date.now(),toolbarSize:'mini'});}''')
                self.assertIn('Typed while loading',p.evaluate('WebRSolidEditor.getHTML(mounted)'))
                self.assertEqual(calls.count(HOST_URL),1)
                self.assertEqual(p.evaluate('Array.from(document.querySelectorAll("script[integrity]")).map(s=>[s.crossOrigin,s.nonce])'),[['anonymous','controlled-nonce'],['anonymous','controlled-nonce']])

    def test_malformed_missing_descriptor_no_network_and_full_write_api_unchanged(self):
        invalid=[None,{},dict(self.descriptor,version=2),dict(self.descriptor,extra=True),dict(self.descriptor,host=dict(src='https://attacker.invalid/editor.js',integrity=self.descriptor['host']['integrity'])),dict(self.descriptor,core=dict(src=CORE_URL,integrity='sha384-wrong'))]
        for desc in invalid:
            p,calls,_,_=self.fixture(descriptor=desc)
            self.assertFalse(p.evaluate('WebRSolidEdit.ensureEditorAssets({deadline:Date.now()+15000})'))
            self.assertNotIn(CORE_URL,calls);self.assertNotIn(HOST_URL,calls)
            p.evaluate('window.WebRSolidEditor={mountHost:()=>{}};window.mountContentEditor=()=>{}')
            self.assertTrue(p.evaluate('WebRSolidEdit.ensureEditorAssets({deadline:Date.now()+15000})'))

    def test_single_deadline_failure_keeps_fallback_and_never_loads_host_late(self):
        p,calls,held,fulfill=self.fixture();p.clock.install()
        p.evaluate('window.done=null;WebRSolidEdit.ensureEditorAssets({deadline:Date.now()+15000}).then(v=>done=v);void 0')
        p.wait_for_timeout(10);self.assertEqual(len(held),1)
        p.locator('#fallback').fill('Unsent safe draft')
        p.clock.run_for(15001);p.wait_for_function('done===false')
        self.assertEqual(p.locator('#fallback').input_value(),'Unsent safe draft')
        fulfill(held.pop(),self.core);p.wait_for_timeout(20)
        self.assertNotIn(HOST_URL,calls);self.assertFalse(p.evaluate('!!window.WebRSolidEditor'))

    def test_core_and_host_share_the_same_fifteen_second_deadline(self):
        p,calls,held,fulfill=self.fixture(held_host=True);p.clock.install()
        p.evaluate('window.ready=null;WebRSolidEdit.ensureEditorAssets({deadline:Date.now()+15000}).then(v=>ready=v);void 0')
        p.wait_for_timeout(10);self.assertEqual(len(held),1)
        p.clock.run_for(9000);fulfill(held.pop(),self.core)
        p.wait_for_function('document.querySelectorAll("script[integrity]").length===2')
        p.wait_for_timeout(10);self.assertEqual(len(held),1)
        p.clock.run_for(6001);p.wait_for_function('ready===false')
        self.assertEqual(p.locator('#fallback').input_value(),'Initial draft')
        fulfill(held.pop(),self.host)
        self.assertEqual(calls.count(CORE_URL),1);self.assertEqual(calls.count(HOST_URL),1)

    def test_original_deferred_core_blocks_read_and_original_fallback_loses_nonce(self):
        p,calls,held,fulfill=self.fixture(legacy=True)
        p.wait_for_timeout(40)
        self.assertEqual(len(held),1)
        self.assertEqual(p.locator('#body').inner_text(),'')
        fulfill(held.pop(),self.core)
        p.wait_for_function('document.readyState!=="loading" && document.getElementById("body").textContent.includes("Public body first")')
        p2,_,_,_=self.fixture(held=False,fallback=True,legacy_nonce=True)
        self.assertTrue(p2.evaluate('WebRSolidEdit.ensureEditorAssets({deadline:Date.now()+15000})'))
        self.assertEqual(p2.locator('script[data-webr-cdn-original]').evaluate('(s)=>s.nonce'),'')

    def test_actual_same_origin_fallback_retains_sri_nonce_and_resolves(self):
        p,calls,_,_=self.fixture(held=False,fallback=True)
        self.assertTrue(p.evaluate('WebRSolidEdit.ensureEditorAssets({deadline:Date.now()+15000})'))
        replacement=p.locator('script[data-webr-cdn-original]')
        self.assertEqual(replacement.get_attribute('integrity'),self.descriptor['host']['integrity'])
        self.assertEqual(replacement.evaluate('(s)=>s.nonce'),'controlled-nonce')
        self.assertEqual(replacement.get_attribute('crossorigin'),'anonymous')
        self.assertEqual(calls.count(HOST_URL),1)
        self.assertEqual(sum('/_webr/assets/' in u for u in calls),1)

if __name__=='__main__':unittest.main()
