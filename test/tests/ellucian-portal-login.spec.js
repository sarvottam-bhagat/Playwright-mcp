const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Import the necessary page objects
const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');

// Set a longer timeout for this test to handle potential loading delays
test.setTimeout(120000); // 2 minutes

test('Navigate to Ellucian Portal and Sign In', async ({ page, context }) => {
  console.log('Starting Ellucian Portal login test with Page Object Model');

  // Create page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);

  // Step 1: Define the URL and credentials
  // NOTE: In a production environment, these should come from environment variables
  // Here we're using the specific values provided in the prompt
  const portalUrl = 'https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/';
  const username = 'vberg';
  const password = '111111';

  // Step 2: Navigate to login page and sign in
  console.log('Step 2: Navigating to login page and signing in...');
  try {
    // Use the loginAndWaitForNavigation method from LoginPage
    await loginPage.loginAndWaitForNavigation(portalUrl, username, password);
    await loginPage.takeScreenshot('screenshots/ellucian-after-login.png');
    
    console.log('Successfully logged in to the Ellucian portal');
  } catch (error) {
    console.error(`Failed to login: ${error.message}`);
    await page.screenshot({ path: 'screenshots/login-failure.png' });
    throw error;
  }

  // Step 3: Wait for portal page to load completely with all cards
  console.log('Step 3: Waiting for portal page to load with all cards...');
  try {
    await portalPage.waitForPortalPageLoad();
    await portalPage.takeScreenshot('screenshots/ellucian-portal-loaded.png');
    
    console.log('Portal page loaded successfully');
  } catch (error) {
    console.error(`Failed to load portal page: ${error.message}`);
    await page.screenshot({ path: 'screenshots/portal-load-failure.png' });
    throw error;
  }

  // Step 4: Verify successful login by checking for portal content
  console.log('Step 4: Verifying successful login...');
  try {
    // Get the page text and confirm it contains expected content
    const pageText = await portalPage.getPageText();
    expect(pageText).toBeTruthy();
    
    // Take a final screenshot showing the successful login state
    await portalPage.takeScreenshot('screenshots/ellucian-portal-verified.png');
    
    console.log('Successfully verified login to Ellucian portal');
  } catch (error) {
    console.error(`Failed to verify login: ${error.message}`);
    await page.screenshot({ path: 'screenshots/verification-failure.png' });
    throw error;
  }
});