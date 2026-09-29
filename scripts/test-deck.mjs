import assert from 'node:assert/strict';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH, args:['--no-proxy-server']});
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
try {
  for (const language of ['ko', 'en']) {
    const page = await browser.newPage({viewport:{width:1280,height:800}, reducedMotion:'reduce'});
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(`${base}${language === 'en' ? 'en/' : ''}?lang=${language}`);
    await page.waitForFunction(() => document.querySelector('.deck-page'));
    const coverage = await page.evaluate(() => {
      const text = [...document.querySelectorAll('.deck-block')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).join(' ');
      const fields = '.research-body,.research-brief dd,.study-intro p,.transfer > p,.publication h3,.patent h3,.career-columns li,.profile-project p,.profile-study p,.profile-scholar p,.scholar-trend figcaption';
      return [...document.querySelectorAll(`.slide-detail :is(${fields})`)].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(value => !text.includes(value));
    });
    assert.deepEqual(coverage, [], 'The deck must retain the reading content');
    assert.deepEqual(await page.locator('.slide-detail .citation-bars li').evaluateAll(es => es.map(e => e.getAttribute('aria-label').match(/\d+/g).map(Number))), [[2020,34],[2021,86],[2022,128],[2023,171],[2024,201],[2025,274],[2026,175]]);
    await page.evaluate(() => navigateTo(document.getElementById('publications--2'), false));
    await page.locator('[data-reading]').click();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('presentation')), false);
    assert.equal(await page.locator('[data-deck-continuation]:visible').count(), 0);
    await page.locator('[data-reading]').click();
    assert.equal(await page.evaluate(() => document.querySelector('.is-current').dataset.deckSource), 'publications');
    await page.locator('.is-current .slide-overview [data-read]').click();
    assert.equal(await page.locator('.reading-dialog').evaluate(e => e.open), true);
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:375,height:667});
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => document.querySelector('.is-current').dataset.deckSource), 'publications');
    const ids = await page.locator('main > [data-slide]').evaluateAll(es => es.map(e => e.id));
    for (const id of ids) {
      await page.evaluate(id => navigateTo(document.getElementById(id), false), id);
      assert.equal(await page.evaluate(() => scrollY), 0);
      assert.equal(await page.locator('main > [data-slide]:visible').count(), 1);
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('Deck content, continuation, modes, modal, resize and navigation: PASS');
} finally {
  await browser.close();
}
