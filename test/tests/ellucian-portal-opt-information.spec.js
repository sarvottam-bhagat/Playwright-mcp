// filepath: /Users/sarvottamb/insider/test/tests/ellucian-portal-opt-information.spec.js
const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');
const DashboardPage = require('../pages/DashboardPage');

// Set a longer timeout for this test to handle potential loading delays
test.setTimeout(180000); // 3 minutes

/**
 * Test scenario:
 * 1. Navigate to the Ellucian Portal login page
 * 2-3. Login with credentials (username = vberg, password = 111111)
 * 4. Wait for portal page to load with all cards rendered
 * 5. Click "GO TO DASHBOARD" on the International Portal card
 * 6. Wait for dashboard page to load with all cards
 * 7. Click on the "OPT Information" card
 * 8. Wait 10 seconds on the OPT page
 * 9. Successfully exit
 */
test('Navigate to OPT Information from Portal Dashboard', async ({ page, context }) => {
  console.log('Starting OPT Information navigation test with Page Object Model');
  
  // Create page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);
  const dashboardPage = new DashboardPage(page);

  // Step 1-3: Navigate to Ellucian Portal login page and login
  console.log('Step 1-3: Navigating to login page and signing in...');
  const portalUrl = 'https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/';
  const username = 'vberg';
  const password = '111111';

  // Use the loginAndWaitForNavigation method from the LoginPage
  await loginPage.loginAndWaitForNavigation(portalUrl, username, password);
  await loginPage.takeScreenshot('screenshots/after-login.png');
  
  // Step 4: Wait for portal page to load completely with all cards
  console.log('Step 4: Waiting for portal page to load with all cards...');
  await portalPage.waitForPortalPageLoad();
  await portalPage.takeScreenshot('screenshots/portal-cards-loaded.png');

  // Step 5: Find the International Portal card and click its GO TO DASHBOARD button
  console.log('Step 5: Finding International Portal card and clicking GO TO DASHBOARD button...');
  const internationalPortalCard = 'International Portal';
  const buttonText = 'GO TO DASHBOARD';
  
  // Try clicking the button on the card
  const buttonClicked = await portalPage.clickCardButton(internationalPortalCard, buttonText, true);
  expect(buttonClicked, 'Should successfully find and click GO TO DASHBOARD button').toBeTruthy();
  await portalPage.takeScreenshot('screenshots/after-click-go-to-dashboard.png');

  // Wait for navigation to complete - Dashboard page should now be loaded
  console.log('Waiting for navigation to dashboard page...');
  await portalPage.waitForNavigationAfterButtonClick(context);
  
  // Step 6: Wait for dashboard page to load completely
  console.log('Step 6: Waiting for dashboard page to load with all cards...');
  await dashboardPage.waitForDashboardPageLoad();
  await dashboardPage.takeScreenshot('screenshots/dashboard-cards-loaded.png');
  
  // Step 7: Find and click on the OPT Information card
  console.log('Step 7: Finding and clicking on the OPT Information card...');
  const optCardName = 'OPT Information';
  const cardClicked = await dashboardPage.clickCard(optCardName);
  expect(cardClicked, 'Should successfully find and click OPT Information card').toBeTruthy();
  await dashboardPage.takeScreenshot('screenshots/after-click-opt-card.png');
  
  // Wait for navigation to complete after clicking the OPT Information card
  console.log('Waiting for navigation to OPT page...');
  await dashboardPage.waitForNavigationAfterButtonClick(context);
  
  // Step 8: Wait 10 seconds on the OPT page as requested
  console.log('Step 8: Waiting 10 seconds on the OPT page...');
  // Use a limited wait time to avoid exceeding timeout but respect the 10 second requirement
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'screenshots/opt-page-after-10-seconds.png' });
  
  // Step 9: Successfully exit
  console.log('Step 9: Test completed successfully');
});