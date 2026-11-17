// E2E smoke for the MedLand homepage. Uses the studio Playwright (VEON tools), nothing installed in the project.
// Run: npm run dev (or preview), then  npm run test:e2e  (or node tests/e2e.mjs <url>)
// Studio path: $VEON_WEB_STUDIO, ~/Desktop/VEON WEB-STUDIO or ~/Documents/ai-web-studio.
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const url = process.argv[2] || "http://localhost:4321/";
const studio = [process.env.VEON_WEB_STUDIO, path.join(os.homedir(), "Desktop", "VEON WEB-STUDIO"), path.join(os.homedir(), "Documents", "ai-web-studio")]
  .filter(Boolean).find((p) => fs.existsSync(path.join(p, "quality", "scripts", "veon_pw.mjs")));
if (!studio) { console.error("VEON studio not found (set VEON_WEB_STUDIO)"); process.exit(2); }
const { loadPlaywright, launchBrowser } = await import(pathToFileURL(path.join(studio, "quality", "scripts", "veon_pw.mjs")).href);
const { chromium } = loadPlaywright();
const browser = await launchBrowser(chromium);
let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failed += 1; };

for (const [w, h] of [[320, 640], [375, 812], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= w, `${w}px: no horizontal scroll (${sw})`);
  ok(await page.locator("h1").count() === 1, `${w}px: one h1`);
  const inView = await page.evaluate(() => {
    const els = [document.querySelector("h1"), document.querySelector(".hero__call"), ...document.querySelectorAll(".hero__msg a")];
    return els.every((e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; });
  });
  ok(inView || h < 700, `${w}px: H1 and the hero actions visible without scrolling`);
  const outside = await page.evaluate(() => [...document.querySelectorAll("a, button, [role=link]")].filter((e) => {
    if (e.closest(".shelf, [popover], .visually-hidden") || !e.offsetParent) return false;
    const r = e.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
  }).map((e) => e.textContent.trim().slice(0, 30)));
  ok(outside.length === 0, `${w}px: every control inside the screen width ${outside.join(", ")}`);
  ok(errors.length === 0, `${w}px: no script errors ${errors.join("; ")}`);
  await ctx.close();
}

// Scenario C2: mark directions, the letter fills, the counter shows, copy works.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.click('button[data-dir="Реанімаційне обладнання"]');
  await page.click('button[data-dir="Кардіологія"]');
  ok(await page.getAttribute('button[data-dir="Кардіологія"]', "aria-pressed") === "true", "plus sets aria-pressed");
  const dirs = await page.textContent("[data-letter-dirs]");
  ok(dirs.includes("Реанімаційне обладнання") && dirs.includes("Кардіологія"), `letter lists chosen directions: ${dirs}`);
  ok(await page.locator(".site-header [data-req-count]").isVisible(), "header request counter visible");
  ok((await page.textContent(".site-header [data-req-n]")).trim() === "2", "counter shows 2");
  const mail = await page.getAttribute("[data-mail]", "href");
  ok(mail.startsWith("mailto:medland.magazin@gmail.com?") && decodeURIComponent(mail).includes("Кардіологія"), "mailto body carries the request");
  await page.click("[data-copy]");
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  ok(clip.includes("Напрями: Реанімаційне обладнання, Кардіологія"), "copy puts the letter into the clipboard");
  ok((await page.textContent("[data-copy-status]")).toLowerCase().includes("скопійовано"), "status announces the copy");
  await page.click('button[data-dir="Кардіологія"]');
  ok((await page.textContent(".site-header [data-req-n]")).trim() === "1", "second click removes the direction");
  const fl = page.locator(".future-link").first();
  ok(await fl.getAttribute("aria-disabled") === "true" && (await fl.getAttribute("href")) === null, "FutureLink is inactive");
  await ctx.close();
}

// Mobile menu and contact bar.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  ok(!(await page.locator("[data-mbar]").isVisible()), "contact bar hidden on the first screen");
  await page.click(".menu-btn");
  ok(await page.locator("#mobile-menu").isVisible(), "menu opens");
  await page.click('#mobile-menu a[href="#umovy"]');
  await page.waitForTimeout(1200);
  ok(!(await page.locator("#mobile-menu").isVisible()), "menu closes after choosing an item");
  ok(await page.locator("[data-mbar]").isVisible(), "contact bar visible after the first screen");
  await page.click(".menu-btn");
  await page.keyboard.press("Escape");
  ok(!(await page.locator("#mobile-menu").isVisible()), "Esc closes the menu");
  await ctx.close();
}

// Links: only anchors, tel:, mailto:, the client's Telegram, Viber and the map. No client domain.
{
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
  const allowed = /^(#|tel:\+380983006090$|mailto:medland\.magazin@gmail\.com|https:\/\/t\.me\/medland_olena$|viber:\/\/chat\?number=%2B380983006090$|https:\/\/www\.google\.com\/maps\/search\/)/;
  const bad = hrefs.filter((h) => !allowed.test(h));
  ok(bad.length === 0, `only allowed links ${bad.join(", ")}`);
  ok(!(await page.content()).includes("medland.com.ua"), "no medland.com.ua anywhere in the page");
  ok(hrefs.every((h) => h !== "#" && h !== ""), "no empty links");
  for (const id of ["hero", "napryamy", "pidbir", "umovy", "kontakty"]) ok(await page.locator(`section#${id}`).count() === 1, `section #${id}`);
  for (const r of ["W-R001", "W-R004", "W-R007", "W-R009", "W-R011"]) ok(await page.locator(`[data-rec*="${r}"]`).count() > 0, `data-rec ${r}`);
  await page.close();
}

// Reduced motion and no-JS: content visible.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const op = await page.evaluate(() => [...document.querySelectorAll("[data-reveal]")].map((e) => getComputedStyle(e).opacity));
  ok(op.every((o) => o === "1"), "reduced motion: index rows visible at once");
  await ctx.close();
  const nojs = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const p2 = await nojs.newPage();
  await p2.goto(url);
  await p2.locator("#napryamy").scrollIntoViewIfNeeded();
  ok(await p2.locator("#napryamy .index__row").first().isVisible(), "no-JS: index visible");
  const op2 = await p2.evaluate(() => getComputedStyle(document.querySelector("[data-reveal]")).opacity);
  ok(op2 === "1", "no-JS: rows not hidden");
  await nojs.close();
}

await browser.close();
console.log(failed ? `\n${failed} FAIL` : "\nALL PASS");
process.exit(failed ? 1 : 0);
