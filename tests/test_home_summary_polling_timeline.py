import asyncio
import base64
import hashlib
import json
import time
import unittest
from pathlib import Path
from urllib.parse import urlsplit

from playwright.async_api import async_playwright


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts_go/web_r_go_20260629_1025/scripts_v2/index"
ORIGIN = "https://home.poll.test"
CORE = ["rcommunity", "community", "packages", "ecosystem", "workshops"]
KEYS = CORE + ["books", "notices", "lectures", "youtube", "activity"]


def summary(fresh):
    sections = {key: [] for key in KEYS}
    for key in CORE:
        sections[key] = [{"title": "Verified " + key, "href": "/community/", "published_at": "2026-10-05"}]
    return {"ok": True, "complete": fresh, "sections": sections,
            "community_generation": "current-generation:10:20:30", "notice_authority": "direct",
            "statistics": {"cnt_member": 1, "cnt_visitor": 0, "cnt_pageview": 0},
            "unavailable_sections": [] if fresh else KEYS, "stale_sections": [] if fresh else KEYS}


class HomeSummaryPollingTimelineTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True)

    async def asyncTearDown(self):
        await self.browser.close()
        await self.playwright.stop()

    async def render(self, random_value, ready_at):
        context = await self.browser.new_context(viewport={"width": 1280, "height": 1000})
        self.addAsyncCleanup(context.close)
        page = await context.new_page()
        errors, calls = [], []
        active, maximum = 0, 0
        started = time.monotonic()
        scripts = []
        for name in ["set_main_compact_portal_20260930_lane_recovery.js", "home_summary_terminal_guard_20260828_2306.js"]:
            body = (SCRIPTS / name).read_bytes()
            sri = "sha256-" + base64.b64encode(hashlib.sha256(body).digest()).decode()
            scripts.append(f'<script src="{ORIGIN}/assets/{name}" integrity="{sri}" crossorigin="anonymous"></script>')
        html = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="div_main"></div>' + "".join(scripts) + '<script>window.set_main()</script></body></html>'
        await page.add_init_script(f"Math.random=()=>{random_value};window.__wallOffset=0;const realNow=Date.now.bind(Date);Date.now=()=>realNow()+window.__wallOffset;window.__summaryEvents=[];document.addEventListener('webr:home-summary-ready',event=>window.__summaryEvents.push(event.detail));")
        page.on("pageerror", lambda error: errors.append(str(error)))

        async def serve(route):
            nonlocal active, maximum
            parsed = urlsplit(route.request.url)
            if parsed.hostname != "home.poll.test":
                await route.abort()
            elif parsed.path == "/":
                await route.fulfill(content_type="text/html", body=html)
            elif parsed.path.startswith("/assets/"):
                source = SCRIPTS / parsed.path.rsplit("/", 1)[-1]
                await route.fulfill(content_type="application/javascript", body=source.read_bytes(), headers={"Access-Control-Allow-Origin": "*"})
            elif parsed.path == "/ajax_index_notice/":
                await route.fulfill(content_type="application/json", body="{}")
            elif parsed.path == "/homepage/content-summary/":
                elapsed = time.monotonic() - started
                is_fresh = ready_at is not None and elapsed >= ready_at
                calls.append({"started": elapsed, "fresh": is_fresh})
                active += 1
                maximum = max(maximum, active)
                if len(calls) == 1:
                    await asyncio.sleep(2.354)
                try:
                    await route.fulfill(content_type="application/json", body=json.dumps(summary(is_fresh)), headers={"Cache-Control": "no-store"})
                finally:
                    active -= 1
            else:
                errors.append("unexpected same-origin request " + parsed.path)
                await route.abort()

        await context.route("**/*", serve)
        await page.goto(ORIGIN + "/", wait_until="domcontentloaded")
        await page.locator("#webr-home-portal").wait_for()
        return page, calls, errors, lambda: maximum, started

    async def test_fresh_at_fourteen_seconds_is_rendered_within_twenty_four_for_both_jitter_extremes(self):
        async def case(random_value):
            page, calls, errors, maximum, started = await self.render(random_value, 14)
            remaining = max(1, (24 - (time.monotonic() - started)) * 1000)
            await page.wait_for_function("window.__summaryEvents.some(event=>event.complete===true)", timeout=remaining)
            accepted = time.monotonic() - started
            self.assertLess(accepted, 24, "server was ready at14s but recovery polling missed the unchanged browser deadline")
            self.assertEqual(await page.locator("#webr-home-portal").get_attribute("data-home-summary-state"), "ready")
            for key in CORE:
                self.assertEqual(await page.locator(f'[data-home-category="{key}"] .webr-home-compact__article').count(), 1)
            self.assertEqual(await page.locator(".webr-home-compact__status,.webr-home-compact__summary-retry").count(), 0)
            self.assertFalse(await page.locator("[data-home-category] .webr-home-compact__category-body").evaluate_all("nodes=>nodes.some(node=>node.innerText.includes('전체 보기'))"))
            self.assertEqual(await page.get_by_role("link", name="공지사항 전체 보기", exact=True).count(), 1)
            self.assertEqual(maximum(), 1)
            self.assertEqual(errors, [])
            completed_calls = len(calls)
            await page.wait_for_timeout(4500)
            self.assertEqual(len(calls), completed_calls, "healthy complete response did not stop recovery polling")

        await asyncio.gather(case(0), case(0.999999))

    async def test_fast_recovery_window_returns_to_normal_backoff_and_stops_while_hidden(self):
        page, calls, errors, maximum, _ = await self.render(0.999999, None)
        while len(calls) < 4:
            await page.wait_for_timeout(50)
        # Advance wall age, not timers, to exercise the bounded window without
        # adding a thirty-second idle wait to every regression run.
        await page.evaluate("window.__wallOffset=31000")
        before = len(calls)
        deadline = time.monotonic() + 5
        while len(calls) == before and time.monotonic() < deadline:
            await page.wait_for_timeout(50)
        self.assertEqual(len(calls), before + 1)
        after_window = len(calls)
        await page.wait_for_timeout(5000)
        self.assertEqual(len(calls), after_window, "expired initial window kept the short polling cadence")
        await page.evaluate("Object.defineProperty(document,'hidden',{get:()=>true});Object.defineProperty(document,'visibilityState',{get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'))")
        await page.wait_for_timeout(15250)
        self.assertEqual(len(calls), after_window, "hidden page issued recovery requests")
        self.assertEqual(maximum(), 1)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
