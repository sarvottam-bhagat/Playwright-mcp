const { test, expect } = require('@playwright/test');
const path = require('path');
// Optional: Use dotenv for environment variables
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import page objects
const EllucianLoginPage = require('../pages/EllucianLoginPage');
const PortalPage = require('../pages/PortalPage');
const DashboardPage = require('../pages/DashboardPage');

// Test configuration
test.describe('Ellucian Portal International Navigation Flow', () => {
  // Set a longer timeout for this test to handle Ellucian's load times
  test.setTimeout(300000); // 5 minutes

  // Test credentials from the provided scenario
  const ellucianUrl = 'https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/';
  const username = 'vberg'; // Use environment variable if available: process.env.ELLUCIAN_USERNAME || 'vberg'
  const password = '111111'; // Use environment variable if available: process.env.ELLUCIAN_PASSWORD || '111111'
  
  let loginPage;
  let portalPage;
  let dashboardPage;

  // Test the International Portal navigation flow
  test('should login and navigate to International Portal dashboard', async ({ page, context }) => {
    console.log('Starting Ellucian Portal International Navigation test');

    // Initialize page objects with specialized Ellucian login page
    loginPage = new EllucianLoginPage(page);
    portalPage = new PortalPage(page);
    dashboardPage = new DashboardPage(page);

    // Step 1: Navigate to the Ellucian login page
    console.log(`Navigating to ${ellucianUrl}...`);
    await loginPage.navigateToLoginPage(ellucianUrl);
    await loginPage.takeScreenshot('login-page.png');

    // Step 2: Login with the provided credentials
    console.log('Entering login credentials...');
    await loginPage.enterUsername(username);
    await loginPage.enterPassword(password);
    
    // Take screenshot before clicking login button
    await loginPage.takeScreenshot('before-login-submit.png');
    
    // Step 3: Click the login button to submit the form
    console.log('Submitting login form...');
    await loginPage.clickLoginButton();

    // Step 4: Wait for the page to load after login
    console.log('Waiting for page to load after login...');
    await portalPage.waitForLoadState('domcontentloaded');
    await portalPage.takeScreenshot('after-login.png');

    // Step 5: Wait for portal page to fully load with all cards rendered
    console.log('Waiting for portal page to fully load with all cards...');
    await portalPage.waitForPortalPageLoad();
    await portalPage.takeScreenshot('portal-page-with-cards.png');

    // Step 6: Find the International Portal card
    console.log('Looking for International Portal card...');
    const cardName = 'International Portal';
    const card = await portalPage.findCard(cardName);
    
    // Verify the card was found
    expect(card).not.toBeNull();
    console.log('International Portal card found');

    // Step 7: Click the "GO TO DASHBOARD" button on the International Portal card
    console.log('Clicking GO TO DASHBOARD button on International Portal card...');
    const buttonText = 'GO TO DASHBOARD';
    const buttonClicked = await portalPage.clickCardButton(cardName, buttonText);
    
    // Verify the button was clicked
    expect(buttonClicked).toBeTruthy();
    console.log('GO TO DASHBOARD button clicked');

    // Step 8: Wait for navigation to complete after clicking the button
    console.log('Waiting for navigation to the dashboard...');
    const newPage = await portalPage.waitForNavigationAfterButtonClick(context);
    expect(newPage).not.toBeNull();

    // Step 9: Verify the dashboard has loaded
    console.log('Waiting for dashboard page to fully load...');
    await dashboardPage.waitForDashboardPageLoad();
    
    // Take screenshot of fully loaded dashboard
    await dashboardPage.takeScreenshot('dashboard-page-loaded.png');

    // Verify the dashboard is loaded
    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
    console.log('Dashboard page loaded successfully');

    // Step 10: Record the completion of the test
    console.log('Test completed successfully - Recorded steps:');
    console.log('1. Navigated to Ellucian login page');
    console.log('2. Entered username: vberg');
    console.log('3. Entered password: 111111');
    console.log('4. Clicked Continue button');
    console.log('5. Waited for portal page to load with all cards');
    console.log('6. Found International Portal card');
    console.log('7. Clicked GO TO DASHBOARD button on the International Portal card');
    console.log('8. Waited for navigation to complete');
    console.log('9. Verified dashboard page loaded successfully');
    console.log('10. Successfully completed the navigation flow');
  });
});