"""Controlled pinned Home formatter/cache checks; no issued login or host proof."""
import json
import os
import unittest
from pathlib import Path

import test_home_lane_recovery as fixture


class HomeActivityCopyTests(unittest.TestCase):
    setUpClass = classmethod(fixture.HomeLaneRecoveryTests.setUpClass.__func__)
    tearDownClass = classmethod(fixture.HomeLaneRecoveryTests.tearDownClass.__func__)
    render = fixture.HomeLaneRecoveryTests.render
    assert_global_controls_absent = fixture.HomeLaneRecoveryTests.assert_global_controls_absent

    def test_all_real_sources_and_domain_actions_keep_order_time_and_five_rows(self):
        payload = fixture.summary()
        exported = os.environ.get('WEBR_ACTIVITY_COPY_FIXTURE')
        if exported:
            payload['sections']['activity'] = json.loads(Path(exported).read_text())['sections']['activity']
        else:
            payload['sections']['activity'] = [
                {'title':name + '님이 ' + event, 'published_at':date, 'href':href}
                for name,event,date,href in [
                    ('첫***원','MirType에 로그인했습니다.','2026-10-10T09:00:00Z','https://www.mirtype.com/'),
                    ('둘***원','Statground에 로그인했습니다.','2026-10-10T08:00:00Z','https://www.statground.net/'),
                    ('셋***원','Web-R에 로그인했습니다.','2026-10-10T07:00:00Z','/webr/'),
                    ('넷***원','Web-R에 방문했습니다.','2026-10-09T07:00:00Z','/webr/'),
                    ('다***원','Web-R Notebook을 사용하고 있습니다.','2026-10-08T07:00:00Z','/webr/notebook/')]]
        payload['sections']['activity'].append({'title':'초과***원님이 방문했습니다.'})
        for width in (1440,390):
            page,errors=self.render(payload)
            page.set_viewport_size({'width':width,'height':1200})
            page.wait_for_selector('.webr-home-compact__activity-title')
            titles=page.locator('.webr-home-compact__activity-title').all_text_contents()
            self.assertEqual(titles,['첫***원님이 로그인했습니다.','둘***원님이 로그인했습니다.','셋***원님이 로그인했습니다.','넷***원님이 방문했습니다.','다***원님이 Web-R Notebook을 사용하고 있습니다.'])
            self.assertEqual(page.locator('.webr-home-compact__activity-item time').count(),5)
            self.assertEqual(page.locator('.webr-home-compact__activity-item time').first.get_attribute('datetime'),'2026-10-10T09:00:00.000Z')
            for i in range(5):
                row=page.locator('.webr-home-compact__activity-item').nth(i)
                title,age=row.locator('strong').bounding_box(),row.locator('time').bounding_box()
                self.assertGreaterEqual(age['x'],title['x']+title['width']-1)
            output=os.environ.get('WEBR_ACTIVITY_COPY_PROOF_DIR')
            if output:
                Path(output).mkdir(parents=True,exist_ok=True)
                page.locator('.webr-home-compact__rail-card--activity').screenshot(path=str(Path(output)/f'current-{width}.png'))
            self.assertEqual(errors,[])

    def test_old_browser_cache_is_normalized_without_cache_or_source_time_renewal(self):
        cached=fixture.summary()
        cached['sections']['activity']=[{'title':'첫***원님이 MirType에 로그인했습니다.','published_at':'2026-10-10T09:00:00Z','href':'https://www.mirtype.com/'}, {'title':'둘***원님이 Statground에 로그인했습니다.','published_at':'2026-10-10T08:00:00Z','href':'https://www.statground.net/'}, {'title':'셋***원님이 Web-R에 방문했습니다.','published_at':'2026-10-09T07:00:00Z','href':'/webr/'}]
        page,errors=self.render(fixture.summary(),cached=cached,status=503)
        page.wait_for_selector('.webr-home-compact__activity-title')
        self.assertEqual(page.locator('.webr-home-compact__activity-title').all_text_contents(),['첫***원님이 로그인했습니다.','둘***원님이 로그인했습니다.','셋***원님이 방문했습니다.'])
        before=page.evaluate("localStorage.getItem('webr.home.public-summary.v1')")
        page.evaluate("window.dispatchEvent(new Event('webr:language-change'))")
        page.wait_for_timeout(30)
        self.assertEqual(page.evaluate("localStorage.getItem('webr.home.public-summary.v1')"),before)
        saved=json.loads(before)
        self.assertEqual(saved['payload']['sections']['activity'],cached['sections']['activity'])
        self.assertEqual(page.locator('time').first.get_attribute('datetime'),'2026-10-10T09:00:00.000Z')
        self.assertEqual(errors,[])

    def test_every_existing_localized_cache_template_and_new_locale_copy(self):
        catalog=json.loads((Path(__file__).parent/'fixtures/home_activity_copy_catalog.json').read_text())
        app_root=os.environ.get('WEBR_ACTIVITY_COPY_APP_ROOT')
        if app_root:
            import hashlib
            raw=(Path(app_root)/catalog['source_path']).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(),catalog['source_sha256'])
        portal=(fixture.SCRIPTS/'set_main_compact_portal_20260930_lane_recovery.js').read_text()
        start=portal.index('  var activityCopyTemplates = ')
        end=portal.index('  function renderActivity(',start)
        helper=portal[start:end]
        page,errors=self.render(fixture.summary())
        page.evaluate("window.__activityPresentation = new Function('cleanText',"+json.dumps(helper+';return activityPresentation;')+")((v,n)=>String(v||'').replace(/\\s+/g,' ').trim().slice(0,n));")
        for locale,values in catalog['locales'].items():
            for key,action in [('{name}님이 Web-R에 방문했습니다.','방문'),('한 이용자가 Web-R에 방문했습니다.','방문'),('{name}님이 방문했습니다.','방문'),('한 이용자가 방문했습니다.','방문'),('{name}님이 로그인했습니다.','로그인'),('한 이용자가 로그인했습니다.','로그인')]:
                raw=values[key].replace('{name}','첫***원')
                got=page.evaluate('value=>window.__activityPresentation(value)',raw)
                expected=('{name}님이 ' if '{name}' in key else '한 이용자가 ')+action+'했습니다.'
                self.assertEqual(got['key'],expected,(locale,raw,got))
                self.assertEqual(got['vars'],{'name':'첫***원'} if '{name}' in key else {})
        for raw in ['첫***원님이 Web-R Notebook을 사용하고 있습니다.','첫***원님이 커뮤니티에 새 글을 게시하였습니다.','새 공지사항이 등록되었습니다.','임의 문장: MirType에 로그인했습니다.']:
            self.assertEqual(page.evaluate('value=>window.__activityPresentation(value)',raw),{'title':raw})
        self.assertEqual(errors,[])

    def test_actual_locale_runtime_repaints_action_copy_without_fetching_activity(self):
        app_root=os.environ.get('WEBR_ACTIVITY_COPY_APP_ROOT')
        if not app_root:
            self.skipTest('cross-repo actual locale runtime requires explicit App fixture root')
        app=Path(app_root)
        catalog=json.loads((app/'internal/web/webr_i18n/public-home.json').read_text())
        payload=fixture.summary()
        payload['sections']['activity']=[{'title':'첫***원님이 MirType에 로그인했습니다.','published_at':'2026-10-10T09:00:00Z'}, {'title':'둘***원님이 Web-R에 방문했습니다.','published_at':'2026-10-09T07:00:00Z'}]
        page,errors=self.render(payload)
        page.wait_for_function("document.querySelector('#webr-home-portal').dataset.homeSummaryState==='ready'")
        page.evaluate("value=>{const real=window.fetch;window.fetch=(input,init)=>String(input).startsWith('/_webr/i18n/catalog.json')?Promise.resolve(new Response(JSON.stringify(value))):real(input,init)}",catalog)
        page.add_script_tag(path=str(app/'internal/web/webr_i18n/runtime.js'))
        page.evaluate('window.WebRI18n.ready')
        for locale,values in catalog['locales'].items():
            calls=page.evaluate('window.__calls.length')
            page.evaluate("locale=>window.WebRI18n.setLanguage(locale,{persist:false,broadcast:false})",locale)
            expected=[values['{name}님이 로그인했습니다.'].replace('{name}','첫***원'),values['{name}님이 방문했습니다.'].replace('{name}','둘***원')]
            page.wait_for_function("expected=>Array.from(document.querySelectorAll('.webr-home-compact__activity-title'),n=>n.textContent).join('|')===expected.join('|')",arg=expected)
            self.assertEqual(page.evaluate('window.__calls.length'),calls)
        self.assertEqual(errors,[])

if __name__=='__main__': unittest.main()
