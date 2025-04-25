
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('OptInformationNavigation_2025-04-21', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/');

    // Fill input field
    await page.fill('input#username', 'vberg');

    // Take screenshot
    await page.screenshot({ path: 'login-page.png' });

    // Fill input field
    await page.fill('input#usernameUserInput', 'vberg');

    // Fill input field
    await page.fill('input#password', '111111');

    // Click element
    await page.click('button.ui.primary.large.button');

    // Take screenshot
    await page.screenshot({ path: 'portal-after-login.png' });

    // Click element
    await page.click('text="GO TO DASHBOARD"');

    // Take screenshot
    await page.screenshot({ path: 'dashboard-page.png' });

    // Click element
    await page.click('text="OPT Information"');

    // Take screenshot
    await page.screenshot({ path: 'opt-page.png' });
});