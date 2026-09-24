import { expect, test } from '@playwright/test';

test('no console errors and no horizontal scroll at 360px', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  for (const id of ['memory', 'sequence', 'pattern', 'reaction', 'different']) {
    await page.locator(`#play-${id}`).click();
    await expect(page.locator('#countdown')).toBeHidden({ timeout: 5000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${id} overflows horizontally`).toBeLessThanOrEqual(0);
    await page.locator('#backBtn').click();
    await page.locator('#goHome').click();
  }
  expect(errors).toEqual([]);
});

test('every tap target is at least 44px tall', async ({ page }) => {
  await page.goto('/');
  const small = await page.locator('button:visible').evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent?.trim() || e.getAttribute('aria-label')));
  expect(small).toEqual([]);
});

test('works offline after the first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15000 });
  await page.waitForTimeout(500);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#play-memory')).toBeVisible();
  await context.setOffline(false);
});

test('manifest and icons resolve', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifest = await (await request.get(href!)).json();
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  for (const icon of manifest.icons) expect((await request.get(icon.src)).status()).toBe(200);
  expect((await request.get('/og.png')).status()).toBe(200);
});
