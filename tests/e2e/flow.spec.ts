import { expect, test } from '@playwright/test';
import { readStored, startGame } from './helpers';

test('countdown runs once per run, not before every round', async ({ page }) => {
  await startGame(page, 'memory');
  const shown = (await page.locator('.memory-number').textContent())?.trim() ?? '';
  await page.locator('#memoryInput').fill(shown);
  await page.locator('#memoryInput').press('Enter');
  await expect(page.locator('#round')).toHaveText('2');
  await expect(page.locator('#countdown')).toHaveCount(0);
  await expect(page.locator('.memory-number')).toBeVisible();
});

test('next game cycles and home shows bests', async ({ page }) => {
  await startGame(page, 'different');
  await page.locator('#backBtn').click();
  await expect(page.locator('#nextGame')).toContainText('Memory');
  await page.locator('#nextGame').click();
  await expect(page.locator('#countdown')).toBeVisible();
  await page.locator('#backBtn').click();
  await page.locator('#goHome').click();
  await expect(page.locator('#play-memory')).toBeVisible();
});

test('phone back button returns home from a run', async ({ page }) => {
  await startGame(page, 'pattern');
  await page.goBack();
  await expect(page.locator('#play-memory')).toBeVisible();
});

test('Escape ends a run and lands on results', async ({ page }) => {
  await startGame(page, 'sequence');
  await page.keyboard.press('Escape');
  await expect(page.locator('#results')).toBeVisible();
});

test('sound toggle persists across reloads', async ({ page }) => {
  await page.goto('/');
  await page.locator('#soundBtn').click();
  await expect(page.locator('#soundBtn')).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('#soundBtn')).toHaveAttribute('aria-pressed', 'false');
});

test('legacy bests from the original game are migrated', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('mindMaster_pattern', '240');
  });
  await page.reload();
  await expect(page.locator('#play-pattern .game-best')).toContainText('240');
  expect((await readStored(page)).bests.pattern).toBe(240);
});

test('scores screen lists runs and reset needs two taps', async ({ page }) => {
  await startGame(page, 'different');
  await page.locator('#backBtn').click();
  await page.locator('#goHome').click();
  await page.locator('#scoresBtn').click();
  await expect(page.locator('#recent .score-row')).toHaveCount(1);
  await page.locator('#resetBtn').click();
  await expect(page.locator('#resetBtn')).toContainText('Tap again');
  await page.locator('#resetBtn').click();
  await expect(page.locator('#recent .score-row')).toHaveCount(0);
});
