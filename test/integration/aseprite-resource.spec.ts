import { test, expect } from '@playwright/test';

test('Aseprite parsed resource', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.click('#excalibur-play');
  
  await expect(page).toHaveScreenshot();
});