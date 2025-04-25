// Test script for navigating through the portal to OPT Information card
const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Import the page objects we'll use
const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');
const DashboardPage = require('../pages/DashboardPage');

// Set a longer timeout for this test to handle potential loading delays
test.setTimeout(300000); // 5 minutes

test('Navigate to OPT Information from Portal Dashboard', async ({ page, context }) => {
  console.log('Starting OPT Information navigation test with Page Object Model');

  // Initialize page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);
  const dashboardPage = new DashboardPage(page);

  // Step 1-2: Navigate to login page and sign in with credentials
  console.log('Step 1-2: Navigating to login page and signing in...');
  const portalUrl = 'https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/';
  const username = 'vberg';
  const password = '111111';

  // Verify environment variables are set - in this case we're using hardcoded values for demonstration
  // In production, you would use environment variables:
  // const portalUrl = process.env.url;
  // const username = process.env.Username;
  // const password = process.env.Password;

  // Navigate to login page and sign in
  await loginPage.navigateToLoginPage(portalUrl);
  console.log('Login page loaded, entering credentials...');
  await loginPage.login(username, password);
  await loginPage.takeScreenshot('screenshots/after-login.png');

  // Step 3: Wait for portal page to load completely with all cards
  console.log('Step 3: Waiting for portal page to load with all cards...');
  await portalPage.waitForPortalPageLoad();
  await portalPage.takeScreenshot('screenshots/portal-cards-loaded.png');

  // Step 4: Find the International Portal card and click its GO TO DASHBOARD button
  console.log('Step 4: Finding International Portal card and clicking GO TO DASHBOARD button...');
  const internationalPortalCard = 'International Portal';
  const buttonText = 'GO TO DASHBOARD';

  // Try clicking the button on the card, fall back to clicking the card itself if needed
  const buttonClicked = await portalPage.clickCardButton(internationalPortalCard, buttonText, true);
  expect(buttonClicked, 'Should successfully find and click GO TO DASHBOARD button').toBeTruthy();
  await portalPage.takeScreenshot('screenshots/after-click-go-to-dashboard.png');

  // Wait for navigation to complete - Dashboard page should now be loaded
  console.log('Waiting for navigation to dashboard page...');
  await portalPage.waitForNavigationAfterButtonClick(context);

  // Step 5: Wait for dashboard page to load completely
  console.log('Step 5: Waiting for dashboard page to load with all cards...');
  await dashboardPage.waitForDashboardPageLoad();
  await dashboardPage.takeScreenshot('screenshots/dashboard-cards-loaded.png');

  // Step 6: Find and click on the OPT Information card
  console.log('Step 6: Finding and clicking on the OPT Information card...');
  const optCardName = 'OPT Information';
  const cardClicked = await dashboardPage.clickCard(optCardName);
  expect(cardClicked, 'Should successfully find and click OPT Information card').toBeTruthy();
  await dashboardPage.takeScreenshot('screenshots/after-click-opt-card.png');

  // Wait for navigation to complete after clicking the OPT Information card
  console.log('Waiting for navigation to OPT page...');
  await dashboardPage.waitForNavigationAfterButtonClick(context);

  // Step 7: Wait 10 seconds on the OPT page as requested
  console.log('Step 7: Waiting 10 seconds on the OPT page...');
  // Use a limited wait time to avoid exceeding timeout but respect the 10 second requirement
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'screenshots/opt-page-after-10-seconds.png' });

  // Step 8: Successfully exit
  console.log('Step 8: Test completed successfully');
});