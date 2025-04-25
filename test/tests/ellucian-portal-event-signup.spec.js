const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Import page objects
const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');
const DashboardPage = require('../pages/DashboardPage');

// Set a longer timeout for this test to handle potential loading delays
test.setTimeout(300000); // 5 minutes

test('Navigate to Eventtt Signup from Portal Dashboard', async ({ page, context }) => {
  console.log('Starting Eventtt Signup navigation test with Page Object Model');

  // Create page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);
  const dashboardPage = new DashboardPage(page);

  // Step 1: Navigate to Ellucian Portal login page and login
  console.log('Step 1: Navigating to login page and signing in...');
  const portalUrl = process.env.url || 'https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/';
  const username = process.env.Username || 'vberg';
  const password = process.env.Password || '111111';

  // Verify environment variables are set
  if (!portalUrl || !username || !password) {
    throw new Error('Required environment variables (url, Username, Password) must be set in .env file');
  }

  // IMPORTANT: Always use the loginAndWaitForNavigation method from the LoginPage
  // This method handles navigation more reliably than using individual methods
  await loginPage.loginAndWaitForNavigation(portalUrl, username, password);
  await loginPage.takeScreenshot('screenshots/after-login.png');

  // Step 2: Wait for portal page to load completely with all cards
  console.log('Step 2: Waiting for portal page to load with all cards...');
  await portalPage.waitForPortalPageLoad();
  await portalPage.takeScreenshot('screenshots/portal-cards-loaded.png');

  // Step 3: Find the International Portal card and click its GO TO DASHBOARD button
  console.log('Step 3: Finding International Portal card and clicking GO TO DASHBOARD button...');
  const internationalPortalCard = 'International Portal';
  const buttonText = 'GO TO DASHBOARD';

  // Try clicking the button on the card
  const buttonClicked = await portalPage.clickCardButton(internationalPortalCard, buttonText, true);
  expect(buttonClicked, 'Should successfully find and click GO TO DASHBOARD button').toBeTruthy();
  await portalPage.takeScreenshot('screenshots/after-click-go-to-dashboard.png');

  // Wait for navigation to complete - Dashboard page should now be loaded
  console.log('Waiting for navigation to dashboard page...');
  await portalPage.waitForNavigationAfterButtonClick(context);

  // Step 4: Wait for dashboard page to load completely
  console.log('Step 4: Waiting for dashboard page to load with all cards...');
  await dashboardPage.waitForDashboardPageLoad();
  await dashboardPage.takeScreenshot('screenshots/dashboard-cards-loaded.png');

  // Step 5: Find and click on the Eventtt Signup card's VIEW MORE button
  console.log('Step 5: Finding and clicking VIEW MORE button on Eventtt Signup card...');
  const eventCardName = 'Eventtt Signup';
  const viewMoreButtonText = 'View More';
  
  // First verify the dashboard is loaded
  const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
  expect(isDashboardLoaded, 'Dashboard should be loaded').toBeTruthy();
  
  // Try clicking the VIEW MORE button on the Eventtt Signup card
  const viewMoreButtonClicked = await dashboardPage.clickCardButton(eventCardName, viewMoreButtonText, true);
  expect(viewMoreButtonClicked, 'Should successfully find and click VIEW MORE button').toBeTruthy();
  await dashboardPage.takeScreenshot('screenshots/eventtt-signup-after-click.png');

  // Step 6: Wait for navigation to the event page
  console.log('Step 6: Waiting for navigation to event page...');
  await dashboardPage.waitForNavigationAfterButtonClick(context);

  // Step 7: Wait 10 seconds on the event page as requested
  console.log('Step 7: Waiting 10 seconds on the event page...');
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'screenshots/eventtt-signup-page-after-10-seconds.png' });

  // Step 8: Successfully exit
  console.log('Step 8: Test completed successfully');
});