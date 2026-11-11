import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { content } from '../src/content.mjs';
import { patents } from '../src/patents.mjs';
import { publications } from '../src/publications.mjs';
import { scholarProfile } from '../src/scholar.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH, args: ['--no-proxy-server'] });
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const evidence = process.env.EVIDENCE_DIR || '.omo/evidence/shared-slide-frame';
const ids = ['welcome', 'translation', 'research', 'research-imaging', 'research-signals', 'publications', 'people', 'contact'];
const viewports = [[1440, 900], [1280, 640], [768, 1024], [390, 844], [375, 667], [320, 568], [667, 375]];
await mkdir(evidence, { recursive: true });

async function checkDialog(page, id, check) {
  const button = page.locator('.is-current .slide-overview [data-read="' + id + '"]');
  await button.click();
  const dialog = page.locator('.reading-dialog[open]');
  assert.equal(await dialog.locator('[id="' + id + '"]').count(), 1, 'The selected content is inside the modal');
  await check(dialog);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert(await button.evaluate(node => node === document.activeElement), 'Closing must return focus to its trigger');
}

try {
  for (const language of ['ko', 'en']) {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(base + (language === 'en' ? 'en/' : '') + '?lang=' + language);
    await page.locator('main > #welcome.is-current').waitFor();
    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await page.keyboard.press('Home');
      assert.deepEqual(await page.locator('main > [data-slide]').evaluateAll(nodes => nodes.map(node => node.id)), ids);
      for (const [index, id] of ids.entries()) {
        if (index > 0) await page.locator('[data-slide-next]').click();
        const slide = page.locator('main > #' + id + '.is-current');
        await slide.waitFor();
        assert.equal(await page.locator('.slide-position').textContent(), String(index + 1).padStart(2, '0') + ' / 08');
        assert.equal(await page.locator('main > [data-slide]:visible').count(), 1);
        const inaccessible = await slide.locator('.slide-overview :is(h1,h2,button,a):visible').evaluateAll(nodes => {
          const top = document.querySelector('.site-header').getBoundingClientRect().bottom;
          const dock = document.querySelector('.slide-controls').getBoundingClientRect();
          return nodes.filter(node => {
            const box = node.getBoundingClientRect();
            const behindDock = box.right > dock.left + 1 && box.left < dock.right - 1 && box.bottom > dock.top + 1 && box.top < dock.bottom - 1;
            return box.left < -1 || box.right > innerWidth + 1 || box.top < top - 1 || box.bottom > innerHeight + 1 || behindDock;
          }).map(node => node.textContent.trim() || node.getAttribute('aria-label'));
        });
        assert.deepEqual(inaccessible, [], [language, width, height, id, 'headings and controls must fit'].join(' '));
        if (id === 'contact') {
          assert(await slide.locator('.slide-overview [href^="mailto:"]').isVisible());
          assert(await page.locator('[data-slide-next]').isDisabled());
        }
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.keyboard.press('Home');
    await page.locator('[data-slide-next]').click();
    await checkDialog(page, 'detail-transfers', async dialog => {
      for (const transfer of content[language].translation.items.filter(item => item.name !== 'AVIEW NeuroCAD')) {
        assert((await dialog.innerText()).includes(transfer.name));
      }
    });
    for (const id of ['research', 'research-imaging', 'research-signals']) {
      await page.locator('[data-slide-next]').click();
      await checkDialog(page, 'detail-' + id, async dialog => {
        assert(await dialog.locator('.research-plate').count() > 0, 'Full original figures remain available');
      });
    }
    await page.locator('[data-slide-next]').click();
    const annual = await page.locator('#publications .scholar-year').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label').match(/\d+/g).slice(0, 2).map(Number)));
    assert.deepEqual(annual, scholarProfile.trend.map(({ year, count }) => [year, count]));
    await checkDialog(page, 'publication-content', async dialog => {
      assert.deepEqual(await dialog.locator('[data-paper] h3').allTextContents(), publications.map(paper => paper.title));
      const search = dialog.locator('#publication-search');
      await search.fill(publications[0].title);
      assert(await dialog.locator('[data-paper]:visible').count() > 0);
      assert(await dialog.locator('[data-paper]:visible').count() < publications.length);
    });
    await checkDialog(page, 'patent-content', async dialog => {
      assert.equal(await dialog.locator('.patent').count(), patents.length);
    });
    await page.screenshot({ path: path.join(evidence, language + '-results-mobile.png') });
    await page.locator('[data-slide-next]').click();
    await checkDialog(page, 'detail-people', async dialog => {
      assert.deepEqual(await dialog.locator('.career-columns li').allTextContents(), [...content[language].people.education, ...content[language].people.career]);
    });
    await page.locator('[data-reading]').click();
    assert.equal(await page.locator('html.presentation').count(), 0);
    assert(await page.locator('#detail-research .research-plate').first().isVisible());
    await page.locator('[data-reading]').click();
    assert.equal(await page.locator('.slide-position').textContent(), '07 / 08');
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS: eight slides, seven advances, responsive controls, research details, outputs, reading mode and focus.');
} finally {
  await browser.close();
}
