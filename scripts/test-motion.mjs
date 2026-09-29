import assert from 'node:assert/strict';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH, args:['--no-proxy-server']});
try {
  const page = await browser.newPage({viewport:{width:1280,height:800}});
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/dist/?lang=ko');
  await page.waitForFunction(() => document.querySelector('.deck-page'));
  await page.evaluate(() => navigateTo(document.getElementById('translation')));
  assert(await page.evaluate(() => document.getAnimations().length > 0));
  await page.evaluate(() => navigateTo(document.getElementById('research')));
  assert.equal(await page.locator('.is-current').getAttribute('id'), 'research');
  assert.equal(await page.locator('#translation').evaluate(e => e.getAnimations({subtree:true}).length), 0);
  await page.waitForTimeout(650);
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(() => navigateTo(document.getElementById('publications')));
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  assert.equal(await page.evaluate(() => scrollY), 0);
  console.log('Motion entrance, interruption, completion and reduced motion: PASS');
} finally {
  await browser.close();
}
