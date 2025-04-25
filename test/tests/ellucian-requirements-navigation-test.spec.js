const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');
const DashboardPage = require('../pages/DashboardPage');
const RequirementsPage = require('../pages/RequirementsPage');

// Set a longer timeout for this test to handle potential loading delays
test.setTimeout(300000); // 5 minutes

test('Navigate to Requirements1112 from Portal Dashboard', async ({ page, context }) => {
  console.log('Starting Requirements1112 Navigation test with Page Object Model');

  // Initialize page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);
  const dashboardPage = new DashboardPage(page);
  const requirementsPage = new RequirementsPage(page);

  // Step 1: Navigate to the login page
  console.log('Step 1: Navigating to login page...');
  const url = process.env.url || 'https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/';
  const username = process.env.Username || 'vberg';
  const password = process.env.Password || '111111';

  // Verify environment variables are set
  if (!url || !username || !password) {
    throw new Error('Required environment variables (url, Username, Password) must be set in .env file');
  }

  await loginPage.navigateToLoginPage(url);
  await loginPage.takeScreenshot('login-page.png');

  // Step 2: Login with credentials
  console.log('Step 2: Logging in with credentials...');
  await loginPage.login(username, password);

  // Step 3: Wait for the portal page to load
  console.log('Step 3: Waiting for portal page to load...');
  await portalPage.waitForPortalPageLoad();
  await portalPage.takeScreenshot('portal-page-loaded.png');

  // Step 4: Look for the International Portal card and click "GO TO DASHBOARD" or click the card itself
  console.log('Step 4: Finding International Portal card and clicking GO TO DASHBOARD button...');
  const cardName = 'International Portal';
  const buttonText = 'GO TO DASHBOARD';
  const buttonClicked = await portalPage.clickCardButton(cardName, buttonText, true);
  expect(buttonClicked, 'International Portal card or GO TO DASHBOARD button should be clicked successfully').toBeTruthy();

  // Step 5: Wait for navigation to complete and dashboard page to load
  console.log('Step 5: Waiting for navigation to dashboard page...');
  await portalPage.waitForNavigationAfterButtonClick(context);
  
  // Step 6: Wait for dashboard page to load completely
  console.log('Step 6: Waiting for dashboard page to load...');
  await dashboardPage.waitForDashboardPageLoad();
  await dashboardPage.takeScreenshot('dashboard-page-loaded.png');

  // Verify the dashboard page is loaded
  const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
  expect(isDashboardLoaded, 'Dashboard should be loaded').toBeTruthy();

  // Step 7: Find and click on Requirements1112 card
  console.log('Step 7: Finding and clicking on the Requirements1112 card...');
  const requirementsCardName = 'Requirements1112';
  const cardClicked = await dashboardPage.clickCard(requirementsCardName);
  expect(cardClicked, 'Requirements1112 card should be clicked successfully').toBeTruthy();

  // Wait for navigation to complete after clicking the Requirements card
  console.log('Waiting for navigation to requirements page...');
  await dashboardPage.waitForNavigationAfterButtonClick(context);

  // Step 8: Wait for requirements page to load
  console.log('Step 8: Waiting for requirements page to load...');
  await requirementsPage.waitForRequirementsPageLoad();
  await requirementsPage.takeScreenshot('requirements-page-loaded.png');

  // Step 9: Wait 5 seconds on the requirements page as requested
  console.log('Step 9: Waiting 5 seconds on the requirements page...');
  // Use a limited wait time as requested
  await page.waitForTimeout(5000);
  await requirementsPage.takeScreenshot('requirements-page-final.png');

  // Step 10: Successfully exit
  console.log('Step 10: Test completed successfully');
  // Add small delay before exiting to ensure all operations complete
  await new Promise(resolve => setTimeout(resolve, 1000));
});