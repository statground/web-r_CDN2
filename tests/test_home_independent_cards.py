"""Controlled Home card/retirement browser fixtures; no live-service evidence."""
import json
import os
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
APP = Path(os.environ.get('WEBR_APP_ROOT', ROOT.parent / 'web_r_go'))
SCRIPTS = ROOT / 'scripts_go/web_r_go_20260629_1025/scripts_v2/index'
KEYS = ['rcommunity','community','books','packages','ecosystem','workshops','lectures','youtube','activity']
ROUTES = {'rcommunity':'/community/read/fixture-r/','community':'/community/read/fixture-free/',
 'books':'/book/d/9781484258286/','packages':'/r-ecosystem/packages/stats/','ecosystem':'/r-ecosystem/',
 'workshops':'/workshop/read/fixture-workshop/','lectures':'/workshop/lecture/42/',
 'youtube':'/workshop/youtube/read/11111111-1111-4111-8111-111111111111/','activity':'/webr/'}

def cards():
 result={}
 for key in KEYS:
  item={'kind':'book' if key=='books' else 'product' if key=='activity' else key,
    'title':'한 이용자가 Web-R에 방문했습니다.' if key=='activity' else 'Fast '+key,
    'summary':'최근 공개 활동' if key=='activity' else 'Verified source fixture',
    'href':ROUTES[key],'published_at':'2026-10-15T09:00:00Z'}
  result[key]={'schema':'webr.home-card.v1','section':key,'ok':True,'complete':True,
    'unavailable':False,'stale':False,'closed':False,'book_visibility_revision':'fixture-current',
    'items':[item]}
 return result

class IndependentCards(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=sync_playwright().start()
  cls.browser=cls.p.chromium.launch(headless=True,executable_path=os.environ.get('WEBR_CHROMIUM_EXECUTABLE'))
 @classmethod
 def tearDownClass(cls): cls.browser.close();cls.p.stop()

 def page(self,width,held):
  page=self.browser.new_page(viewport={'width':width,'height':1000});self.addCleanup(page.close)
  errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.add_init_script('window.__data='+json.dumps(cards())+';window.__heldKey='+json.dumps(held)+';')
  page.add_init_script(r"""
   window.__calls=[];window.__pending=[];window.__status={};window.__aborted=0;
   window.fetch=(url,init={})=>{
    const u=new URL(url,location.href);
    if(u.pathname==='/ajax_index_notice/')return Promise.resolve(new Response(JSON.stringify({'0':{uuid:'11111111-1111-4111-8111-111111111111',title:'Fast notice',created_at:'2026-10-15'}}),{status:200}));
    if(u.pathname==='/ajax_index_statistics/'){
     const day=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
     return Promise.resolve(new Response(JSON.stringify({cnt_member:42,cnt_visitor:7,cnt_pageview:9,
      traffic_status:'available',traffic_snapshot_status:'live',traffic_date:day,traffic_generation:day+':7:9',
      traffic_authority:'canonical_v5_wrappers',traffic_snapshot_complete:1,traffic_bucket_presence:1}),{status:200}));
    }
    if(u.pathname!=='/homepage/content-summary/')throw Error('unexpected '+u.pathname);
    const key=u.searchParams.get('section');if(!key)throw Error('aggregate summary request');
    window.__calls.push(key);
    if(key===window.__heldKey)return new Promise((resolve,reject)=>{
     window.__pending.push(payload=>resolve(new Response(JSON.stringify(payload||window.__data[key]),{status:200})));
     if(init.signal)init.signal.addEventListener('abort',()=>{window.__aborted++;reject(new DOMException('Aborted','AbortError'));},{once:true});
    });
    return Promise.resolve(new Response(JSON.stringify(window.__data[key]),{status:window.__status[key]||200}));
   };
  """)
  page.route('**/*',lambda route:route.fulfill(status=200,content_type='text/html',body='<html lang="ko"><body><div id="div_main"></div></body></html>') if route.request.url=='https://home.test/' else route.abort())
  page.goto('https://home.test/')
  page.add_style_tag(path=str(ROOT/'scripts_go/web_r_go_20260629_1025/styles_v2/index/home_compact_portal_20260729_1530.css'))
  page.add_script_tag(path=str(SCRIPTS/'set_main_compact_portal_20261015_independent_cards.js'))
  page.add_script_tag(path=str(SCRIPTS/'home_summary_terminal_guard_20261011_1930.js'))
  page.add_script_tag(path=str(APP/'internal/web/homepage_statistics.js'))
  page.evaluate('window.set_main()')
  return page,errors

 def test_delayed_book_does_not_hold_siblings_notice_activity_or_stats(self):
  for width in (1440,390):
   with self.subTest(width=width):
    page,errors=self.page(width,'books')
    for key in ('rcommunity','community','packages','ecosystem','workshops','lectures','youtube'):
     page.get_by_role('link',name='Fast '+key,exact=False).wait_for(state='visible',timeout=2000)
    page.get_by_role('link',name='Fast notice',exact=False).wait_for(state='visible',timeout=2000)
    page.get_by_text('한 이용자가 Web-R에 방문했습니다.',exact=True).wait_for(timeout=2000)
    page.wait_for_function("document.querySelector('[data-stat-key=cnt_member]').textContent.includes('42')",timeout=2000)
    self.assertEqual(page.get_by_role('link',name='Fast books',exact=False).count(),0)
    self.assertEqual(page.locator('[data-home-category=books] [data-home-pending=true]').count(),1)
    self.assertEqual(sorted(page.evaluate('window.__calls')),sorted(KEYS))
    self.assertEqual(page.get_by_role('button',name='다시 시도',exact=True).count(),0)
    page.evaluate('window.__pending.shift()()')
    page.get_by_role('link',name='Fast books',exact=False).wait_for(timeout=2000)
    self.assertEqual(errors,[])

 def test_delayed_video_and_failed_refresh_keep_lecture_and_other_cards(self):
  for width in (1440,390):
   with self.subTest(width=width):
    page,errors=self.page(width,'youtube')
    page.get_by_role('link',name='Fast lectures',exact=False).wait_for(timeout=2000)
    page.get_by_role('link',name='Fast packages',exact=False).wait_for(timeout=2000)
    self.assertEqual(page.get_by_role('link',name='Fast youtube',exact=False).count(),0)
    page.evaluate('window.__pending.shift()();window.__heldKey=null')
    page.get_by_role('link',name='Fast youtube',exact=False).wait_for(timeout=2000)
    page.evaluate("window.__status.youtube=503;dispatchEvent(new PageTransitionEvent('pagehide'));dispatchEvent(new PageTransitionEvent('pageshow'))")
    page.locator('[data-home-card-refresh=youtube]').wait_for(timeout=2000)
    for key in ('lectures','youtube','packages','books'):
     self.assertEqual(page.get_by_role('link',name='Fast '+key,exact=False).count(),1)
    page.evaluate("window.__status.youtube=200;Object.assign(window.__data.youtube,{items:[],complete:false,unavailable:true});dispatchEvent(new PageTransitionEvent('pagehide'));dispatchEvent(new PageTransitionEvent('pageshow'))")
    page.wait_for_function("window.__calls.filter(key=>key==='youtube').length>=3",timeout=2000)
    page.locator('[data-home-card-refresh=youtube]').wait_for(timeout=2000)
    self.assertEqual(page.get_by_role('link',name='Fast youtube',exact=False).count(),1)
    page.evaluate("window.__status.youtube=403;dispatchEvent(new PageTransitionEvent('pagehide'));dispatchEvent(new PageTransitionEvent('pageshow'))")
    page.get_by_role('link',name='Fast youtube',exact=False).wait_for(state='detached',timeout=2000)
    self.assertEqual(page.get_by_role('link',name='Fast lectures',exact=False).count(),1)
    self.assertEqual(errors,[])

 def test_retired_page_request_cannot_paint_after_restore(self):
  for width in (1440,390):
   with self.subTest(width=width):
    page,errors=self.page(width,'books')
    page.wait_for_function('window.__pending.length===1',timeout=2000)
    page.evaluate("window.__old=window.__pending.shift();dispatchEvent(new PageTransitionEvent('pagehide'));window.__heldKey=null;window.__data.books.items[0].title='Fresh restored book';dispatchEvent(new PageTransitionEvent('pageshow'))")
    page.get_by_role('link',name='Fresh restored book',exact=False).wait_for(timeout=2000)
    stale=cards()['books'];stale['items'][0]['title']='Retired book'
    page.evaluate('window.__old('+json.dumps(stale)+')')
    page.wait_for_timeout(20)
    self.assertEqual(page.get_by_role('link',name='Retired book',exact=False).count(),0)
    self.assertEqual(page.get_by_role('link',name='Fresh restored book',exact=False).count(),1)
    self.assertGreaterEqual(page.evaluate('window.__aborted'),1)
    self.assertEqual(errors,[])

if __name__=='__main__':unittest.main(verbosity=2)
