
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('RequirementsNavigation_2025-04-21', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/');

    // Fill input field
    await page.fill('input[type="text"]', 'vberg');

    // Fill input field
    await page.fill('input[type="password"]', '111111');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'portal-page-loaded.png' });

    // Take screenshot
    await page.screenshot({ path: 'looking-for-international-portal-card.png' });

    // Click element
    await page.click('text=International Portal');

    // Click element
    await page.click('text=GO TO DASHBOARD');

    // Take screenshot
    await page.screenshot({ path: 'dashboard-loaded.png' });

    // Click element
    await page.click('text=Requirements1112');

    // Take screenshot
    await page.screenshot({ path: 'requirements-page-loaded.png' });
});