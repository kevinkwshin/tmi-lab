import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { researchEvidence } from '../src/research.mjs';
import { content } from '../src/content.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH, args: ['--no-proxy-server'] });
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const evidenceDir = process.env.EVIDENCE_DIR || '.omo/evidence/research-stories';
const researchSlides = ['research', 'research-imaging', 'research-signals'];
await mkdir(evidenceDir, { recursive: true });

try {
  for (const lang of ['ko', 'en']) {
    for (const [width, height] of [[1280, 800], [768, 1024], [390, 844], [375, 667]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.goto(base + (lang === 'en' ? 'en/' : '') + '?lang=' + lang + '#research');
      for (const [index, id] of researchSlides.entries()) {
        if (index > 0) await page.locator('[data-slide-next]').click();
        const summary = page.locator('main > #' + id + '.is-current .slide-overview');
        await summary.waitFor();
        const research = content[lang].research.items[index];
        const evidence = researchEvidence[lang][index];
        assert.match(await summary.locator('.deck-lead').innerText(), /\?$/, 'The overview states its clinical question');
        const image = summary.locator('img:visible').first();
        await image.evaluate(img => img.decode());
        assert(await image.evaluate(img => img.naturalWidth > 0), 'The main research visual loads');

        const open = summary.locator('[data-read="detail-' + id + '"]');
        await open.click();
        const dialog = page.locator('.reading-dialog[open]');
        const body = await dialog.innerText();
        for (const value of [research.body, evidence.method, evidence.value, evidence.study, evidence.note]) {
          assert(body.includes(value), 'The full research account remains readable: ' + value);
        }
        for (const figure of evidence.images) {
          const source = dialog.locator('.research-plate img[src$="/' + figure.name + '.webp"]');
          assert.equal(await source.getAttribute('alt'), figure.alt);
          await source.scrollIntoViewIfNeeded();
          await source.evaluate(img => img.decode());
          assert(await source.evaluate(img => img.naturalWidth > 0));
        }
        await dialog.locator('form[method="dialog"] button').click();
        await dialog.waitFor({ state: 'hidden' });
        assert(await open.evaluate(node => node === document.activeElement));
        assert.equal(await page.locator('.slide-position').textContent(), '0' + (index + 3) + ' / 08');
        await page.screenshot({ path: path.join(evidenceDir, [lang, width + 'x' + height, id].join('-') + '.png') });
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  console.log('PASS: bilingual research summaries, clinical questions, clickable methods and original study figures.');
} finally {
  await browser.close();
}
