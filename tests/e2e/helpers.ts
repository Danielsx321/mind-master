import { expect, type Page } from '@playwright/test';

/** Waits out the once-per-run countdown (3 ticks × 600 ms) and returns when the first round is on screen. */
export async function startGame(page: Page, id: string, seed = 1): Promise<void> {
  await page.goto(`/?seed=${seed}`);
  await page.locator(`#play-${id}`).click();
  await expect(page.locator('#countdown')).toBeVisible();
  await expect(page.locator('#countdown')).toBeHidden({ timeout: 5000 });
}

export async function score(page: Page): Promise<number> {
  return Number(await page.locator('#score').textContent());
}

export async function readStored(page: Page): Promise<{ bests: Record<string, number>; runs: { gameId: string; score: number }[] }> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('mm:v1') ?? '{"bests":{},"runs":[]}'));
}
