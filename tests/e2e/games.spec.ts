import { expect, test } from '@playwright/test';
import { readStored, startGame } from './helpers';

test.describe('each game plays to a result', () => {
  test('memory: correct with Enter, wrong loses a life, quit keeps the best', async ({ page }) => {
    await startGame(page, 'memory');
    const shown = (await page.locator('.memory-number').textContent())?.trim() ?? '';
    expect(shown).toMatch(/^\d{4}$/);
    const input = page.locator('#memoryInput');
    await input.fill(shown);
    await input.press('Enter');
    await expect(page.locator('#score')).toHaveText('10');
    await expect(page.locator('#round')).toHaveText('2');

    await page.locator('#memoryInput').fill('0');
    await page.locator('#memorySubmit').click();
    await expect(page.locator('.flash-bad')).toContainText('It was');
    await expect(page.locator('.hearts')).toHaveAttribute('aria-label', '2 of 3 lives');

    await page.locator('#backBtn').click();
    await expect(page.locator('#finalScore')).toHaveText('10');
    await expect(page.locator('#resultBadge')).toHaveText('New best');
    expect((await readStored(page)).bests.memory).toBe(10);
  });

  test('sequence: wrong option greys out, right option scores', async ({ page }) => {
    await startGame(page, 'sequence');
    const live = await page.locator('[aria-live="polite"].visually-hidden').textContent();
    const numbers = /Sequence (.*)\. Options/.exec(live ?? '')?.[1]?.split(', ').map((x) => (x === 'blank' ? null : Number(x))) ?? [];
    const known = numbers.filter((n): n is number => n !== null);
    const step = (known[1] as number) - (known[0] as number);
    const gap = numbers.indexOf(null);
    const answer = gap === 0 ? (known[0] as number) - step : (numbers[gap - 1] as number) + step;

    const wrong = page.locator('.option').filter({ hasNotText: new RegExp(`^${answer}$`) }).first();
    await wrong.click();
    await expect(wrong).toHaveClass(/wrong/);
    await expect(wrong).toBeDisabled();
    await page.locator('.option', { hasText: new RegExp(`^${answer}$`) }).click();
    await expect(page.locator('#score')).toHaveText('15');
  });

  test('pattern: tap back the lit tiles', async ({ page }) => {
    await startGame(page, 'pattern');
    const lit = await page.locator('.tile.lit').evaluateAll((els) => els.map((el) => Array.from(el.parentElement!.children).indexOf(el)));
    expect(lit.length).toBeGreaterThanOrEqual(3);
    await expect(page.locator('.tile.lit')).toHaveCount(0, { timeout: 5000 });
    for (const i of lit) await page.locator('#arena .tile').nth(i).click();
    await expect(page.locator('#score')).toHaveText('20');
  });

  test('reaction: early tap costs a life, fast tap scores, five taps end the run', async ({ page }) => {
    await startGame(page, 'reaction');
    await page.locator('#reactionArea').dispatchEvent('pointerdown');
    await expect(page.locator('.flash-bad')).toContainText('Too early');
    for (let i = 0; i < 5; i++) {
      await expect(page.locator('#reactionArea.ready')).toBeVisible({ timeout: 10_000 });
      await page.locator('#reactionArea').dispatchEvent('pointerdown');
      await expect(page.locator('.flash-good')).toBeVisible();
      if (i < 4) await expect(page.locator('#reactionArea:not(.ready):not(.done)')).toBeVisible({ timeout: 3000 });
    }
    await expect(page.locator('#results')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#avgMs')).toBeVisible();
    expect(await page.locator('#finalScore').textContent()).toMatch(/^\d+$/);
  });

  test('different: wrong tap regenerates the board, three wrongs end the run', async ({ page }) => {
    await startGame(page, 'different');
    const odd = () =>
      page.locator('#arena .tile').evaluateAll((els) => {
        const cs = els.map((e) => (e as HTMLElement).style.getPropertyValue('--c'));
        return cs.findIndex((c) => cs.filter((x) => x === c).length === 1);
      });
    const first = await odd();
    expect(first).toBeGreaterThanOrEqual(0);
    await page.locator('#arena .tile').nth((first + 1) % 9).click();
    await expect(page.locator('.hearts')).toHaveAttribute('aria-label', '2 of 3 lives');
    await expect(page.locator('#arena .tile.bad')).toHaveCount(0, { timeout: 3000 });
    const second = await odd();
    await page.locator('#arena .tile').nth(second).click();
    await expect(page.locator('#score')).toHaveText('12');
    await expect(page.locator('#arena .round-label')).toContainText('Round 2', { timeout: 3000 });
    for (let i = 0; i < 2; i++) {
      await expect(page.locator('#arena .tile')).toHaveCount(9, { timeout: 3000 });
      const o = await odd();
      await page.locator('#arena .tile').nth((o + 1) % 9).click();
      await page.waitForTimeout(800);
    }
    await expect(page.locator('#results')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#finalScore')).toHaveText('12');
    await expect(page.locator('#score')).toHaveCount(0);
  });
});
