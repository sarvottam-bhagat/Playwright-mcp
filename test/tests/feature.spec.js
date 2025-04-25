const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import page objects
const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');
const InternationalStudentPage = require('../pages/InternationalStudentPage');

// Set a longer timeout for this test
test.setTimeout(120000); // 2 minutes

test('Navigate to International Student card', async ({ page, context }) => {
  console.log('Starting International Student card navigation test');

  // Create page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);
  const internationalStudentPage = new InternationalStudentPage(page);

  // Step 1: Navigate to Ellucian portal and sign in
  console.log('Step 1: Navigating to login page and signing in...');
  const url = 'https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/';
  const username = 'vberg';
  const password = '111111';

  // Use loginAndWaitForNavigation method from LoginPage which handles navigation more reliably
  await loginPage.loginAndWaitForNavigation(url, username, password);

  // Take a screenshot after login
  await page.screenshot({ path: 'screenshots/after-login.png', fullPage: true });

  // Step 2: Wait for portal page to load completely with all cards
  console.log('Step 2: Waiting for portal page to load with all cards...');
  await portalPage.waitForPortalPageLoad();
  await page.screenshot({ path: 'screenshots/portal-cards-loaded.png', fullPage: true });

  // Step 3: Find the International Student card and click on it
  console.log('Step 3: Finding and clicking the International Student card...');
  const cardName = 'International Student and Scholar Management (ISSM)';

  // Try clicking the card
  const cardClicked = await portalPage.clickCard(cardName);
  expect(cardClicked, 'Should successfully find and click card').toBeTruthy();
  await page.screenshot({ path: 'screenshots/after-clicking-card.png', fullPage: true });

  // Step 4: Wait for navigation to complete and content to render
  console.log('Step 4: Waiting for navigation and content to render...');
  await portalPage.waitForNavigationAfterButtonClick(context);

  // Step 5: Wait an additional 10 seconds as requested
  console.log('Step 5: Waiting additional 10 seconds');
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'screenshots/international-student-page-after-wait.png', fullPage: true });

  // Test completed successfully
  console.log('Test completed successfully');
});