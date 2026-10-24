"""Initial pageshow must not duplicate completed independent Home card reads."""
import unittest
from test_home_independent_cards import IndependentCards,KEYS

class HomeInitialPageshow(unittest.TestCase):
 @classmethod
 def setUpClass(cls):IndependentCards.setUpClass.__func__(cls)
 @classmethod
 def tearDownClass(cls):IndependentCards.tearDownClass.__func__(cls)
 page=IndependentCards.page
 def test_initial_pageshow_keeps_restore_and_visibility_revalidation(self):
  page,errors=self.page(390,None)
  def settled(n):
   page.wait_for_function("n=>window.__calls.length===9*n&&document.querySelector('#webr-home-portal').getAttribute('aria-busy')==='false'",arg=n,timeout=2500)
   self.assertEqual(page.evaluate("Object.fromEntries(Object.keys(window.__data).map(k=>[k,window.__calls.filter(x=>x===k).length]))"),{k:n for k in KEYS})
   self.assertEqual(errors,[])
  settled(1)
  page.evaluate("dispatchEvent(new PageTransitionEvent('pageshow',{persisted:false}))")
  self.assertEqual(page.evaluate('window.__calls.length'),9)
  page.evaluate("dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))")
  settled(2)
  page.evaluate("window.__controlledHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__controlledHidden});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>window.__controlledHidden?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'))")
  self.assertEqual(page.evaluate('window.__calls.length'),18)
  page.evaluate("window.__controlledHidden=false;document.dispatchEvent(new Event('visibilitychange'))")
  settled(3)
  page.evaluate("dispatchEvent(new CustomEvent('webr:language-change'))")
  self.assertEqual(page.evaluate('window.__calls.length'),27)
  self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
