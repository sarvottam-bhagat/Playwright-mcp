# GitHub Copilot Instructions for Playwright Test Generation

## Test Generation Guidelines

When generating Playwright test code, always follow these guidelines:

### Page Object Model Requirements

1. **ALWAYS use the Page Object Model (POM) pattern** for all test cases.
2. **Create separate page classes** for each distinct page or component in the application.
3. **Extend from BasePage** for all page objects to inherit common functionality.
4. **Encapsulate selectors** within the page objects, never in the test files.
5. **Implement action methods** in page objects (e.g., `login()`, `clickButton()`, etc.).
6. **Return new page objects** when navigation occurs between pages.

### Test Structure

1. **Start with imports** for required page objects and Playwright modules.
2. **Initialize page objects** at the beginning of each test.
3. **Use descriptive test names** that explain the user journey being tested.
4. **Include proper setup and teardown** with `beforeEach`/`afterEach` or `beforeAll`/`afterAll`.
5. **Add comments** explaining the purpose of each test step.
6. **Implement proper assertions** to verify expected outcomes.

### Code Generation from Manual Actions

1. **Convert manual actions to code** after observing them in headed mode.
2. **Include all observed interactions** such as clicks, form fills, navigations, etc.
3. **Capture waiting patterns** for elements, navigation, and network requests.
4. **Record selector strategies** used to identify elements (prefer test IDs, roles, or text).
5. **Document any timing issues** or special handling required.

### Error Handling and Resilience

1. **Implement robust waiting strategies** to handle dynamic content.
2. **Add retry logic** for flaky interactions when necessary.
3. **Include proper error messages** to aid debugging.
4. **Take screenshots on failure** to help with troubleshooting.
5. **Add logging** for important steps and state changes.

### Example Structure

```javascript
// Import page objects
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

test.describe('User authentication flow', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Step 1: Enter login credentials
    await loginPage.enterUsername('testuser');
    await loginPage.enterPassword('password123');

    // Step 2: Submit login form
    dashboardPage = await loginPage.clickLoginButton();

    // Step 3: Verify successful login
    expect(await dashboardPage.isLoggedIn()).toBeTruthy();
    expect(await dashboardPage.getWelcomeMessage()).toContain('Welcome, Test User');
  });
});
```

### Execution Requirements

1. **Tests must be runnable manually** without special configuration.
2. **Avoid hardcoded timeouts** where possible, use dynamic waiting.
3. **Support both headed and headless modes** without code changes.
4. **Make tests independent** of each other to avoid order dependencies.
5. **Support parallel execution** when possible.

## Specific Patterns for Our Application

1. **Use our existing BasePage class** which provides common functionality.
2. **Follow our naming conventions** for page objects and methods.
3. **Implement proper state verification** before performing actions.
4. **Handle any application-specific timing issues** with appropriate waits.
5. **Support our environment configuration** approach using `.env` files.

## Converting Manual Actions to Code

1. **Observe and record all actions** performed in the headed browser.
2. **Generate code that reproduces these exact actions** in the same order.
3. **Include all clicks, form fills, and navigations** observed during manual testing.
4. **Add appropriate waits** between actions to ensure stability.
5. **Capture screenshots at key points** to verify visual state.

## Example Page Objects

### Login Page Example

```javascript
const BasePage = require('./BasePage');
const DashboardPage = require('./DashboardPage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = 'input[type="text"]';
    this.passwordInput = 'input[type="password"]';
    this.loginButton = 'button[type="submit"]';
    this.errorMessage = '.error-message';
  }

  /**
   * Navigate to the login page
   * @param {string} url - The URL to navigate to, defaults to environment variable
   */
  async navigate(url = process.env.url) {
    await this.page.goto(url);
    await this.waitForLoginForm();
  }

  /**
   * Wait for the login form to be visible
   */
  async waitForLoginForm() {
    await this.page.waitForSelector(this.usernameInput);
    await this.page.waitForSelector(this.passwordInput);
    await this.page.waitForSelector(this.loginButton);
  }

  /**
   * Enter username in the login form
   * @param {string} username - The username to enter
   */
  async enterUsername(username) {
    await this.page.fill(this.usernameInput, username);
  }

  /**
   * Enter password in the login form
   * @param {string} password - The password to enter
   */
  async enterPassword(password) {
    await this.page.fill(this.passwordInput, password);
  }

  /**
   * Click the login button and wait for navigation
   * @returns {Promise<DashboardPage>} - The dashboard page object
   */
  async clickLoginButton() {
    await this.page.click(this.loginButton);
    await this.waitForLoadState('networkidle');
    return new DashboardPage(this.page);
  }

  /**
   * Complete the login process
   * @param {string} username - The username to enter
   * @param {string} password - The password to enter
   * @returns {Promise<DashboardPage>} - The dashboard page object
   */
  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    return await this.clickLoginButton();
  }

  /**
   * Complete the login process and wait for navigation
   * @param {string} url - The URL to navigate to
   * @param {string} username - The username to enter
   * @param {string} password - The password to enter
   */
  async loginAndWaitForNavigation(url, username, password) {
    await this.navigate(url);
    await this.login(username, password);

    // Wait for navigation after login
    try {
      await this.waitForLoadState('networkidle', 60000);
      // Additional wait to ensure all elements are loaded
      await this.wait(5000);
    } catch (error) {
      console.log('Warning: Timeout waiting for page load after login');
    }
  }

  /**
   * Get error message if login fails
   * @returns {Promise<string>} - The error message text
   */
  async getErrorMessage() {
    try {
      await this.page.waitForSelector(this.errorMessage, { timeout: 5000 });
      return await this.page.textContent(this.errorMessage);
    } catch (error) {
      return null; // No error message found
    }
  }
}

module.exports = LoginPage;
```

### Portal Page Example with Icon Handling

```javascript
const BasePage = require('./BasePage');

class PortalPage extends BasePage {
  constructor(page) {
    super(page);
    this.cardContainer = '.card-container';
    this.card = '.card';
    this.cardTitle = '.card-title';
    this.cardButton = '.card-button, button';
    this.cardIcon = '.card-icon, svg, .icon';
  }

  /**
   * Wait for the portal page to load completely
   */
  async waitForPortalPageLoad() {
    await this.page.waitForSelector(this.cardContainer);
    await this.waitForCardsToRender();
  }

  /**
   * Wait for all cards to render completely
   */
  async waitForCardsToRender() {
    let previousCardCount = 0;
    let currentCardCount = 0;
    let stableCount = 0;
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        await this.page.waitForTimeout(1000);
        currentCardCount = await this.page.$$eval(this.card, cards => cards.length);
        console.log(`Current card count: ${currentCardCount}`);

        if (currentCardCount === previousCardCount) {
          stableCount++;
          if (stableCount >= 3) {
            console.log(`Card count stable at ${currentCardCount} for 3 consecutive checks`);
            break;
          }
        } else {
          stableCount = 0;
        }

        previousCardCount = currentCardCount;
        attempts++;
      } catch (error) {
        console.log(`Error waiting for cards: ${error.message}`);
        break;
      }
    }

    // Wait a bit more for card content to fully load
    await this.page.waitForTimeout(2000);
  }

  /**
   * Find a specific card by its title or content
   * @param {string} cardName - The name or title of the card to find
   * @returns {Promise<ElementHandle|null>} - The card element or null if not found
   */
  async findCard(cardName) {
    try {
      // Try to find by exact title match
      const cards = await this.page.$$(this.card);
      for (const card of cards) {
        const titleElement = await card.$(this.cardTitle);
        if (titleElement) {
          const title = await titleElement.textContent();
          if (title.trim() === cardName) {
            return card;
          }
        }
      }

      // Try to find by partial text match
      for (const card of cards) {
        const text = await card.textContent();
        if (text.includes(cardName)) {
          return card;
        }
      }

      // Try to find using JavaScript
      return await this.page.evaluateHandle((selector, name) => {
        const cards = Array.from(document.querySelectorAll(selector));
        return cards.find(card => card.textContent.includes(name)) || null;
      }, this.card, cardName);
    } catch (error) {
      console.log(`Error finding card: ${error.message}`);
      return null;
    }
  }

  /**
   * Click a button on a specific card
   * @param {string} cardName - The name or title of the card
   * @param {string} buttonText - The text of the button to click
   * @param {boolean} clickCardIfNoButton - Whether to click the card itself if no button is found
   * @returns {Promise<boolean>} - Whether a button was clicked
   */
  async clickCardButton(cardName, buttonText, clickCardIfNoButton = false) {
    try {
      const card = await this.findCard(cardName);
      if (!card) {
        console.log(`Card not found: ${cardName}`);
        return false;
      }

      // Try to find button by text
      const button = await card.evaluateHandle((el, buttonSelector, text) => {
        const buttons = Array.from(el.querySelectorAll(buttonSelector));
        return buttons.find(btn => btn.textContent.trim().includes(text)) || null;
      }, this.cardButton, buttonText);

      if (button && !(await button.evaluate(el => el === null))) {
        await button.click({ force: true });
        console.log(`Clicked button with text: ${buttonText}`);
        return true;
      }

      // If no button found and clickCardIfNoButton is true, click the card
      if (clickCardIfNoButton) {
        await card.click({ force: true });
        console.log(`No button found, clicked the card itself: ${cardName}`);
        return true;
      }

      console.log(`No button found and card click not allowed`);
      return false;
    } catch (error) {
      console.log(`Error clicking card button: ${error.message}`);
      return false;
    }
  }

  /**
   * Click an icon on a specific card
   * @param {string} cardName - The name or title of the card
   * @param {string} iconSelector - CSS selector for the icon
   * @param {boolean} clickCardIfNoIcon - Whether to click the card itself if no icon is found
   * @returns {Promise<boolean>} - Whether an icon was clicked
   */
  async clickCardIcon(cardName, iconSelector, clickCardIfNoIcon = false) {
    try {
      const card = await this.findCard(cardName);
      if (!card) {
        console.log(`Card not found: ${cardName}`);
        return false;
      }

      // Try to find icon using the provided selector
      const icon = await card.$(iconSelector);

      if (icon) {
        // Make sure the icon is visible before clicking
        const isVisible = await icon.isVisible();
        if (isVisible) {
          await icon.click({ force: true });
          console.log(`Clicked icon with selector: ${iconSelector}`);
          return true;
        } else {
          console.log(`Icon found but not visible: ${iconSelector}`);
        }
      }

      // Try alternative approaches to find icons
      const alternativeIconFound = await card.evaluate((el) => {
        // Try to find any SVG elements
        const svgs = el.querySelectorAll('svg');
        if (svgs.length > 0) {
          svgs[0].click();
          return true;
        }

        // Try to find elements with icon classes
        const iconElements = el.querySelectorAll('[class*="icon"], [class*="fa-"]');
        if (iconElements.length > 0) {
          iconElements[0].click();
          return true;
        }

        // Try to find image elements that might be icons
        const images = el.querySelectorAll('img[width="24"], img[height="24"]');
        if (images.length > 0) {
          images[0].click();
          return true;
        }

        return false;
      });

      if (alternativeIconFound) {
        console.log(`Clicked icon found through alternative methods`);
        return true;
      }

      // If no icon found and clickCardIfNoIcon is true, click the card
      if (clickCardIfNoIcon) {
        await card.click({ force: true });
        console.log(`No icon found, clicked the card itself: ${cardName}`);
        return true;
      }

      console.log(`No icon found and card click not allowed`);
      return false;
    } catch (error) {
      console.log(`Error clicking card icon: ${error.message}`);
      return false;
    }
  }

  /**
   * Click a card directly
   * @param {string} cardName - The name or title of the card
   * @returns {Promise<boolean>} - Whether the card was clicked
   */
  async clickCard(cardName) {
    try {
      const card = await this.findCard(cardName);
      if (!card) {
        console.log(`Card not found: ${cardName}`);
        return false;
      }

      await card.click({ force: true });
      console.log(`Clicked card: ${cardName}`);
      return true;
    } catch (error) {
      console.log(`Error clicking card: ${error.message}`);
      return false;
    }
  }

  /**
   * Wait for navigation to complete after clicking a button or card
   * @param {BrowserContext} context - The browser context
   * @returns {Promise<Page|null>} - The new page if one was opened, or null
   */
  async waitForNavigationAfterButtonClick(context) {
    try {
      // Wait for navigation on current page
      await this.page.waitForNavigation({ timeout: 10000 }).catch(() => {});

      // Check if a new page was opened
      const pages = context.pages();
      const newPage = pages[pages.length - 1];

      if (newPage !== this.page) {
        await newPage.waitForLoadState('networkidle');
        console.log('New page opened and loaded');
        return newPage;
      }

      // If no new page, check if current page navigated
      await this.page.waitForLoadState('networkidle');
      console.log('Current page navigated and loaded');
      return this.page;
    } catch (error) {
      console.log(`Error waiting for navigation: ${error.message}`);
      return null;
    }
  }

  /**
   * Take a screenshot with a specific name
   * @param {string} name - Name for the screenshot file
   */
  async takeScreenshot(name) {
    try {
      await this.page.screenshot({ path: `./screenshots/${name}`, fullPage: true });
      console.log(`Screenshot saved: ${name}`);
    } catch (error) {
      console.log(`Error taking screenshot: ${error.message}`);
    }
  }
}

module.exports = PortalPage;
```

## Playwright MCP-Style Test Generation

1. **Record all actions performed in the headed browser** during manual testing.
2. **Generate a complete test script** that reproduces these actions exactly.
3. **Structure the code to use our Page Object Model** for maintainability.
4. **Include all necessary setup and teardown** to make the test self-contained.
5. **Add appropriate assertions** to verify the expected outcomes.
6. **Make the test runnable manually** with a simple command like `npx playwright test`.
7. **Verify syntax correctness** especially for methods with multiple parameters:
   ```javascript
   // CORRECT
   await page.screenshot({ path: 'screenshot.png', fullPage: true });

   // INCORRECT - will cause syntax error
   await page.screenshot({ path: 'screenshot.png', { fullPage: true } });
   ```

## Portal Testing Specifics

1. **Use the existing POM structure** in the `test/pages` directory.
2. **Follow the appropriate POM pattern based on the test type**:
   - For International Portal tests: Use `LoginPage`, `PortalPage`, and `DashboardPage`
   - For International Student card tests: Use `LoginPage`, `PortalPage`, and `InternationalStudentPage`
   - For Requirements navigation tests: Use `LoginPage`, `PortalPage`, `DashboardPage`, and `RequirementsPage`
3. **Use the correct page object for each page**:
   - Use `PortalPage` methods ONLY for interactions on the portal page
   - Use `DashboardPage` methods ONLY for interactions on the dashboard page
   - NEVER use `PortalPage` methods to interact with elements on the dashboard page
4. **Follow the exact pattern from the working Requirements Navigation test**:
   - Initialize all required page objects at the beginning of the test
   - Use `loginPage.navigateToLoginPage(url)` and `loginPage.login(username, password)` for login
   - Use `portalPage.waitForPortalPageLoad()` to wait for the portal page to load
   - Use `portalPage.clickCardButton(cardName, buttonText, true)` to click a button on a card or the card itself
   - Use `dashboardPage.waitForDashboardPageLoad()` to wait for the dashboard page to load
   - Use `dashboardPage.clickCard(cardName)` to click a card on the dashboard
   - Use `requirementsPage.waitForRequirementsPageLoad()` to wait for the requirements page to load
   - Take screenshots at key points with `takeScreenshot()` methods
   - Add appropriate assertions to verify each step was successful
5. **Handle authentication** using the provided credentials from environment variables.
6. **Manage dynamic content loading** with appropriate waiting strategies.
7. **Wait for all cards to render completely** after login before proceeding with any actions.
8. **Verify card content is fully displayed** by implementing stable card count checks and waiting for images to load.
9. **Find specific cards** using multiple selector strategies to ensure reliability.
10. **Locate and click buttons on cards** or click the card itself if no button is present.
11. **Wait for navigation to complete** after clicking a card or button.
12. **Take screenshots at key points** to aid in debugging.
13. **Use multiple selector strategies** to find elements reliably.

## Example of Converting Manual Actions to POM-based Test for Portal

### Manual Actions Observed:
1. Navigate to the portal login page
2. Enter username from environment variables
3. Enter password from environment variables
4. Click login button
5. Wait for portal page to load completely
6. Wait for all cards to render fully with their content
7. Find a specific card by its title or content
8. Locate a button on the card or prepare to click the card itself
9. Click on the button or the card
10. Wait for navigation to complete
11. Verify the new page has loaded correctly
12. Exit successfully

### Generated Test Code:

```javascript
const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Example for International Portal test
const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');
const DashboardPage = require('../pages/DashboardPage');

// SECURE: Get environment variables without any fallback values
const url = process.env.url;
const username = process.env.Username;
const password = process.env.Password;

// REQUIRED: Verify environment variables are set before proceeding
if (!url || !username || !password) {
  throw new Error('Required environment variables (url, Username, Password) must be set in .env file');
}

test('International Portal Navigation Flow', async ({ page, context }) => {
  console.log('Starting International Portal test with Page Object Model');
  console.log(`URL: ${url}`);
  console.log(`Username: ${username}`);

  // Initialize page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);
  const dashboardPage = new DashboardPage(page);

  // Step 1-4: Navigate to login page and sign in
  console.log('Step 1-4: Navigating to login page and signing in...');
  await loginPage.loginAndWaitForNavigation(url, username, password);
  await loginPage.takeScreenshot('after-login.png');

  // Step 5-6: Wait for portal page to load completely with all cards rendered
  console.log('Step 5-6: Waiting for portal page to load with all cards...');
  await portalPage.waitForPortalPageLoad();
  await portalPage.takeScreenshot('portal-cards-loaded.png');

  // Step 7: Find a specific card
  console.log('Step 7: Finding a specific card...');
  const cardName = 'Example Card';
  const card = await portalPage.findCard(cardName);
  expect(card).not.toBeNull();
  await portalPage.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-card-found.png`);

  // Step 8-9: Click on a button, icon, or the card itself
  console.log('Step 8-9: Clicking on the card, button, or icon in the card...');
  const buttonText = 'View Details';
  const iconSelector = '.card-icon, svg[aria-label="details"], .fa-info-circle';
  const clickCardIfNoButtonOrIcon = true;

  // Try clicking a button first
  let elementClicked = await portalPage.clickCardButton(cardName, buttonText, false);

  // If no button found, try clicking an icon
  if (!elementClicked) {
    console.log('No button found, trying to click an icon...');
    elementClicked = await portalPage.clickCardIcon(cardName, iconSelector, false);
  }

  // If neither button nor icon found, click the card itself if allowed
  if (!elementClicked && clickCardIfNoButtonOrIcon) {
    console.log('No button or icon found, clicking the card itself...');
    elementClicked = await portalPage.clickCard(cardName);
  }

  expect(elementClicked).toBeTruthy();
  await portalPage.takeScreenshot('after-clicking-card.png');

  // Step 10-11: Wait for navigation to complete and verify new page
  console.log('Step 10-11: Waiting for navigation to complete...');
  const newPage = await portalPage.waitForNavigationAfterButtonClick(context);
  expect(newPage).not.toBeNull();

  // Use dashboard page for further interactions
  await dashboardPage.waitForDashboardToLoad();
  await dashboardPage.takeScreenshot('dashboard-loaded.png');

  // Step 12: Exit successfully
  console.log('Step 12: Test completed successfully');
});
```

### Example for International Student Card Test

```javascript
const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Example for International Student card test
const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');
const InternationalStudentPage = require('../pages/InternationalStudentPage');

// SECURE: Get environment variables without any fallback values
const url = process.env.url;
const username = process.env.Username;
const password = process.env.Password;

// REQUIRED: Verify environment variables are set before proceeding
if (!url || !username || !password) {
  throw new Error('Required environment variables (url, Username, Password) must be set in .env file');
}

test('International Student Card Test', async ({ page, context }) => {
  console.log('Starting International Student Card test with Page Object Model');
  console.log(`URL: ${url}`);
  console.log(`Username: ${username}`);

  // Initialize page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);
  const internationalStudentPage = new InternationalStudentPage(page);

  // Step 1-4: Navigate to login page and sign in
  console.log('Step 1-4: Navigating to login page and signing in...');
  await loginPage.loginAndWaitForNavigation(url, username, password);
  await loginPage.takeScreenshot('after-login.png');

  // Step 5-6: Wait for portal page to load completely with all cards rendered
  console.log('Step 5-6: Waiting for portal page to load with all cards...');
  await portalPage.waitForPortalPageLoad();
  await portalPage.takeScreenshot('portal-cards-loaded.png');

  // Find and click the International Student card
  console.log('Finding and clicking the International Student card...');
  const cardName = 'International Student';
  const elementClicked = await portalPage.clickCard(cardName);
  expect(elementClicked).toBeTruthy();
  await portalPage.takeScreenshot('after-clicking-international-student-card.png');

  // Wait for navigation and use the International Student page for specific interactions
  await portalPage.waitForNavigationAfterButtonClick(context);

  // Use International Student page for specific interactions
  await internationalStudentPage.waitForPageLoad();
  await internationalStudentPage.takeScreenshot('international-student-page-loaded.png');

  // Perform International Student specific actions
  await internationalStudentPage.verifyInternationalStudentContent();

  console.log('Test completed successfully');
});
```

## Instructions for GitHub Copilot When Generating Portal Tests

1. **Always use the existing Page Object Model** in the `test/pages` directory.
2. **Follow the exact pattern** shown in the examples above.
3. **Use the correct POM classes based on the test type**:
   - For International Portal tests: Use `LoginPage`, `PortalPage`, and `DashboardPage`
   - For International Student card tests: Use `LoginPage`, `PortalPage`, and `InternationalStudentPage`
   - For Requirements navigation tests: Use `LoginPage`, `PortalPage`, `DashboardPage`, and `RequirementsPage`
4. **For OPT Information tests, follow this exact pattern**:
   ```javascript
   // Initialize page objects
   const loginPage = new LoginPage(page);
   const portalPage = new PortalPage(page);
   const dashboardPage = new DashboardPage(page);

   // Step 1-3: Navigate to login page and sign in
   await loginPage.loginAndWaitForNavigation(portalUrl, username, password);
   await loginPage.takeScreenshot('screenshots/after-login.png');

   // Step 4: Wait for portal page to load
   await portalPage.waitForPortalPageLoad();
   await portalPage.takeScreenshot('screenshots/portal-cards-loaded.png');

   // Step 5: Find and click GO TO DASHBOARD button
   const internationalPortalCard = 'International Portal';
   const buttonText = 'GO TO DASHBOARD';
   const buttonClicked = await portalPage.clickCardButton(internationalPortalCard, buttonText, true);
   expect(buttonClicked, 'Should successfully find and click GO TO DASHBOARD button').toBeTruthy();

   // Wait for navigation to complete
   await portalPage.waitForNavigationAfterButtonClick(context);

   // Step 6: Wait for dashboard page to load
   await dashboardPage.waitForDashboardPageLoad();
   await dashboardPage.takeScreenshot('screenshots/dashboard-cards-loaded.png');

   // Step 7: Find and click on the OPT Information card
   const optCardName = 'OPT Information';
   const cardClicked = await dashboardPage.clickCard(optCardName);
   expect(cardClicked, 'Should successfully find and click OPT Information card').toBeTruthy();

   // Wait for navigation to complete
   await dashboardPage.waitForNavigationAfterButtonClick(context);
   ```

5. **For Requirements Navigation tests, follow this exact pattern**:
   ```javascript
   // Initialize page objects
   const loginPage = new LoginPage(page);
   const portalPage = new PortalPage(page);
   const dashboardPage = new DashboardPage(page);
   const requirementsPage = new RequirementsPage(page);

   // Step 1: Navigate to the login page
   await loginPage.navigateToLoginPage(url);
   await loginPage.takeScreenshot('login-page.png');

   // Step 2: Login with credentials
   await loginPage.login(username, password);

   // Step 3: Wait for the portal page to load
   await portalPage.waitForPortalPageLoad();
   await portalPage.takeScreenshot('portal-page-loaded.png');

   // Step 4: Look for the International Portal card and click "GO TO DASHBOARD" or click the card itself
   const cardName = 'International Portal';
   const buttonText = 'GO TO DASHBOARD';
   const buttonClicked = await portalPage.clickCardButton(cardName, buttonText, true);
   expect(buttonClicked, 'International Portal card or GO TO DASHBOARD button should be clicked successfully').toBeTruthy();

   // Step 5: Wait for dashboard page to load
   await dashboardPage.waitForDashboardPageLoad();
   await dashboardPage.takeScreenshot('dashboard-page-loaded.png');

   // Step 6: Find and click on Requirements card
   const requirementsCardName = 'Requirements1112';
   const cardClicked = await dashboardPage.clickCard(requirementsCardName);
   expect(cardClicked, 'Requirements1112 card should be clicked successfully').toBeTruthy();

   // Step 7: Wait for requirements page to load
   await requirementsPage.waitForRequirementsPageLoad();
   ```
6. **SECURITY CRITICAL: NEVER include credentials or fallback values** in the test scripts. Only use environment variables like `process.env.Username` and `process.env.Password` without any fallbacks.
7. **SECURITY CRITICAL: NEVER generate example code with any credentials** - even fake or placeholder ones.
8. **SECURITY CRITICAL: Always verify environment variables exist** before using them, and throw an error if they don't.
9. **Use environment variables for URLs** like `process.env.url` instead of hardcoding them.
10. **Handle all edge cases** with appropriate error handling and retries.
11. **Generate code that exactly reproduces** the manual actions performed in the headed browser.
12. **Include appropriate assertions** to verify each step was successful.
13. **Add detailed comments** explaining each step of the test.
14. **Take screenshots at key points** to aid in debugging.
15. **Make the test runnable manually** with a simple command.

## Environment Variables and Security

### ⚠️ CRITICAL SECURITY REQUIREMENT ⚠️

1. **NEVER, UNDER ANY CIRCUMSTANCES, include credentials in code** - this is a severe security violation.
2. **ABSOLUTELY PROHIBITED:**
   ```javascript
   // NEVER DO THIS - SECURITY VIOLATION:
   const username = process.env.Username || 'anyusername'; // WRONG!
   const password = process.env.Password || 'anypassword'; // WRONG!
   const url = process.env.url || 'https://any-url.com'; // WRONG!
   ```

3. **ALWAYS DO THIS INSTEAD:**
   ```javascript
   // CORRECT APPROACH - SECURE:
   const username = process.env.Username;
   const password = process.env.Password;
   const url = process.env.url;

   // Then verify they exist:
   if (!username || !password || !url) {
     throw new Error('Required environment variables (url, Username, Password) must be set in .env file');
   }
   ```

4. **Always use the exact environment variable names** from the `.env` file:
   - `process.env.url` for the application URL
   - `process.env.Username` for the username
   - `process.env.Password` for the password

5. **Include dotenv configuration** at the top of test files:
   ```javascript
   require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
   ```

6. **NEVER generate examples or code snippets that include:**
   - Default credentials (even fake ones)
   - Fallback values for URLs that might expose internal systems
   - Any sensitive information whatsoever

7. **NO EXCEPTIONS** to these rules, even for:
   - Example code
   - Test cases
   - Documentation
   - Temporary code
   - Development environments

## Example Test for OPT Information Card Navigation

```javascript
const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const LoginPage = require('../pages/LoginPage');
const PortalPage = require('../pages/PortalPage');
const DashboardPage = require('../pages/DashboardPage');

// Set a longer timeout for this test to handle potential loading delays
test.setTimeout(180000); // 3 minutes

test('Navigate to OPT Information from Portal Dashboard', async ({ page, context }) => {
  console.log('Starting OPT Information navigation test with Page Object Model');

  // Create page objects
  const loginPage = new LoginPage(page);
  const portalPage = new PortalPage(page);
  const dashboardPage = new DashboardPage(page);

  // Step 1-3: Navigate to Ellucian Portal login page and login
  console.log('Step 1-3: Navigating to login page and signing in...');
  const portalUrl = process.env.PORTAL_URL;
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  // Verify environment variables are set
  if (!portalUrl || !username || !password) {
    throw new Error('Required environment variables (PORTAL_URL, USERNAME, PASSWORD) must be set in .env file');
  }

  // IMPORTANT: Always use the loginAndWaitForNavigation method from the LoginPage
  // This method handles navigation more reliably than using individual methods and waiting for networkidle
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
  console.log('Waiting for navigation to OfPT page...');
  await dashboardPage.waitForNavigationAfterButtonClick(context);

  // Step 8: Wait 10 seconds on the OPT page as requested
  console.log('Step 8: Waiting 10 seconds on the OPT page...');
  // Use a limited wait time to avoid exceeding timeout but respect the 10 second requirement
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'screenshots/opt-page-after-10-seconds.png' });

  // Step 9: Successfully exit
  console.log('Step 9: Test completed successfully');
});
```

**CRITICAL NOTES FOR OPT INFORMATION TEST:**
1. The test uses `LoginPage`, `PortalPage`, and `DashboardPage` page objects.
2. After clicking the GO TO DASHBOARD button, it calls `portalPage.waitForNavigationAfterButtonClick(context)`.
3. After clicking the OPT Information card, it calls `dashboardPage.waitForNavigationAfterButtonClick(context)`.
4. Both `PortalPage` and `DashboardPage` must have the `waitForNavigationAfterButtonClick` method implemented.
5. The test follows this exact pattern:
   ```javascript
   // Initialize page objects
   const loginPage = new LoginPage(page);
   const portalPage = new PortalPage(page);
   const dashboardPage = new DashboardPage(page);

   // Step 1-3: Navigate to login page and sign in
   await loginPage.loginAndWaitForNavigation(portalUrl, username, password);
   await loginPage.takeScreenshot('screenshots/after-login.png');

   // Step 4: Wait for portal page to load
   await portalPage.waitForPortalPageLoad();
   await portalPage.takeScreenshot('screenshots/portal-cards-loaded.png');

   // Step 5: Find and click GO TO DASHBOARD button
   const internationalPortalCard = 'International Portal';
   const buttonText = 'GO TO DASHBOARD';
   const buttonClicked = await portalPage.clickCardButton(internationalPortalCard, buttonText, true);
   expect(buttonClicked, 'Should successfully find and click GO TO DASHBOARD button').toBeTruthy();

   // Wait for navigation to complete
   await portalPage.waitForNavigationAfterButtonClick(context);

   // Step 6: Wait for dashboard page to load
   await dashboardPage.waitForDashboardPageLoad();
   await dashboardPage.takeScreenshot('screenshots/dashboard-cards-loaded.png');

   // Step 7: Find and click on the OPT Information card
   const optCardName = 'OPT Information';
   const cardClicked = await dashboardPage.clickCard(optCardName);
   expect(cardClicked, 'Should successfully find and click OPT Information card').toBeTruthy();

   // Wait for navigation to complete
   await dashboardPage.waitForNavigationAfterButtonClick(context);
   ```

**CRITICAL NOTES FOR REQUIREMENTS NAVIGATION TEST:**
1. The test uses `LoginPage`, `PortalPage`, `DashboardPage`, and `RequirementsPage` page objects.
2. After clicking the GO TO DASHBOARD button on the International Portal card, it waits for the dashboard page to load with `dashboardPage.waitForDashboardPageLoad()`.
3. After clicking the Requirements1112 card, it waits for the requirements page to load with `requirementsPage.waitForRequirementsPageLoad()`.
4. The test verifies successful navigation with assertions like `expect(buttonClicked).toBeTruthy()` and `expect(isDashboardLoaded).toBeTruthy()`.
5. The test takes screenshots at key points with methods like `loginPage.takeScreenshot('login-page.png')` and `requirementsPage.takeScreenshot('requirements-page-final.png')`.
6. The test follows this exact pattern:
   ```javascript
   // Initialize page objects
   const loginPage = new LoginPage(page);
   const portalPage = new PortalPage(page);
   const dashboardPage = new DashboardPage(page);
   const requirementsPage = new RequirementsPage(page);

   // Step 1: Navigate to the login page
   await loginPage.navigateToLoginPage(url);
   await loginPage.takeScreenshot('login-page.png');

   // Step 2: Login with credentials
   await loginPage.login(username, password);

   // Step 3: Wait for the portal page to load
   await portalPage.waitForPortalPageLoad();
   await portalPage.takeScreenshot('portal-page-loaded.png');

   // Step 4: Look for the International Portal card and click "GO TO DASHBOARD" or click the card itself
   const cardName = 'International Portal';
   const buttonText = 'GO TO DASHBOARD';
   const buttonClicked = await portalPage.clickCardButton(cardName, buttonText, true);
   expect(buttonClicked, 'International Portal card or GO TO DASHBOARD button should be clicked successfully').toBeTruthy();

   // Step 5: Wait for dashboard page to load
   await dashboardPage.waitForDashboardPageLoad();
   await dashboardPage.takeScreenshot('dashboard-page-loaded.png');

   // Step 6: Verify the dashboard page is loaded
   const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
   expect(isDashboardLoaded, 'Dashboard should be loaded').toBeTruthy();

   // Step 7: Find and click on Requirements1112 card
   const requirementsCardName = 'Requirements1112';
   const cardClicked = await dashboardPage.clickCard(requirementsCardName);
   expect(cardClicked, 'Requirements1112 card should be clicked successfully').toBeTruthy();

   // Step 8: Wait for requirements page to load
   await requirementsPage.waitForRequirementsPageLoad();
   ```

## Critical Requirements for Reliable Tests

### Test Configuration
1. **Set appropriate timeouts** (5 minutes is recommended):
   ```javascript
   // In the test file
   test.setTimeout(300000);

   // In playwright.config.js
   timeout: 300000, // 5 minutes
   ```

2. **Disable retries** to prevent the test from running multiple times:
   ```javascript
   // In playwright.config.js
   retries: 0,
   ```

3. **Use try-catch blocks** around critical operations:
   ```javascript
   try {
     await someOperation();
   } catch (error) {
     console.log(`Warning: ${error.message}`);
     // Continue with fallback
   }
   ```

4. **Add a clean exit** with a small delay:
   ```javascript
   // At the end of the test
   console.log('Test completed successfully');
   await new Promise(resolve => setTimeout(resolve, 1000));
   ```

### Waiting for Cards to Render
1. **After login, wait for all cards to fully render** before proceeding with any actions.
2. **Implement a stable card count check** that waits until the number of cards stops increasing.
3. **Wait for card content and images to load** after the cards themselves appear.
4. **Take screenshots of the cards** after they are fully rendered.
5. **Log the card count** at each step of the waiting process.
6. **Handle timeout errors gracefully** and continue with the test.

### Finding and Clicking Card Buttons, Icons, or Cards
1. **First locate the specific card** using multiple selector strategies.
2. **Look for buttons or icons within the card** using appropriate selectors.
3. **Try multiple approaches** to find the button or icon, including:
   - Exact text match for the button text
   - Case-insensitive text match
   - Using JavaScript to find and click the button or icon
   - Looking for buttons or icons within the card
   - Using icon-specific selectors like SVG paths, image elements, or font icons
4. **Handle icon elements specifically** by:
   - Identifying icons by their aria-label, title, or data attributes
   - Using CSS selectors that target icon classes (e.g., `.icon`, `.fa-*`, etc.)
   - Looking for SVG elements or specific icon fonts
   - Ensuring the icon is visible and clickable before attempting to click
5. **If no button or icon is found, click the card itself** when appropriate.
6. **Take screenshots before clicking** the button, icon, or card.
7. **Ensure the element is visible and clickable** before attempting to click it.
8. **Use force click options** when necessary to bypass overlay issues.
9. **Handle navigation after clicking** properly.

### Waiting for Navigation
1. **After clicking a button or card, wait for navigation to complete**.
2. **ALWAYS use the waitForNavigationAfterButtonClick method** after clicking a card or button that causes navigation:
   ```javascript
   // After clicking a card or button on the portal page
   await portalPage.waitForNavigationAfterButtonClick(context);

   // After clicking a card or button on the dashboard page
   await dashboardPage.waitForNavigationAfterButtonClick(context);
   ```
3. **CRITICAL: Both PortalPage and DashboardPage MUST have the waitForNavigationAfterButtonClick method** to handle navigation after clicking cards or buttons.
4. **The waitForNavigationAfterButtonClick method must be implemented in both classes** with the same functionality:
   - Check if a new page was opened
   - If a new page is detected, wait for it to load and return it
   - If no new page is detected, wait for navigation on the current page and return it
5. **AVOID using page.waitForLoadState('networkidle') directly** as it can cause timeouts:
   ```javascript
   // AVOID this - may cause timeouts
   await page.waitForLoadState('networkidle');

   // INSTEAD use the loginAndWaitForNavigation method for login
   await loginPage.loginAndWaitForNavigation(url, username, password);

   // And use waitForNavigationAfterButtonClick for other navigation
   await portalPage.waitForNavigationAfterButtonClick(context);
   ```
6. **Check for new pages** that might have been opened.
7. **Wait for the new page to load completely**.
8. **Use multiple approaches to detect if the page is loaded**, including:
   - Checking for specific content
   - Checking the page title
   - Checking for any content on the page
9. **Handle timeout errors gracefully** and continue with the test.
10. **Take screenshots of the fully loaded page**.
11. **Verify page content is displayed** before completing the test.

## Converting Playwright MCP Actions to POM-based Tests

When converting actions recorded in Playwright MCP to POM-based tests:

1. **Identify the pages** involved in the test flow.
2. **Map each action** to the appropriate page object method.
3. **Replace direct selectors** with the encapsulated selectors in the page objects.
4. **Add appropriate waits** between actions.
5. **Handle page transitions** by returning new page objects.
6. **Add assertions** to verify the expected state after each significant action.
7. **Structure the test** to follow the user journey logically.
8. **Make the test resilient** to timing and UI changes.

## Dashboard and Requirements Navigation Testing

### Dashboard Card Handling

1. **Use the DashboardPage object for dashboard interactions**:
   - When navigating from the portal to the dashboard, use the DashboardPage object for all interactions on the dashboard page.
   - Do NOT use PortalPage methods for finding or clicking cards on the dashboard page.
   - ALWAYS use `dashboardPage.waitForNavigationAfterButtonClick(context)` after clicking a card or button on the dashboard that causes navigation.

2. **Implement robust card finding on the dashboard**:
   - Use multiple selector strategies to find cards on the dashboard:
     ```javascript
     // Example dashboard card selector
     this.dashboardCardSelector = 'div[class*="card"], div[role="article"], div[class*="tile"], div[class*="item"], section[class*="card"]';
     ```
   - Try finding by title, then by content, then by text matching if other methods fail.
   - **IMPORTANT**: The `findCard` method may return either an ElementHandle or a Locator object (when using `page.getByText()`). The `clickCardButton` method must handle both types of objects:
     ```javascript
     // Check if card is a Locator object (returned by page.getByText) or an ElementHandle
     const isLocator = typeof card.$$ !== 'function';

     if (isLocator) {
       // Use Locator methods for finding buttons
       const nearbyButton = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).filter({ has: card });
       // ...
     } else {
       // Use ElementHandle methods for finding buttons
       const cardButtons = await card.$$(this.cardButtonSelector);
       // ...
     }
     ```

3. **Handle missing buttons gracefully**:
   - Always provide a fallback to click the card itself when a button is not found:
     ```javascript
     // Set clickCardIfNoButton to true to click the card if button not found
     const buttonClicked = await dashboardPage.clickCardButton(cardName, buttonText, true);
     ```

4. **Use appropriate assertions**:
   - Assert that either the button was clicked or the card was clicked:
     ```javascript
     expect(buttonClicked, 'Card or button should be clicked successfully').toBeTruthy();
     ```

### Requirements Card Navigation

1. **Use the correct page object for each page**:
   - Use LoginPage for login
   - Use PortalPage for portal interactions
   - Use DashboardPage for dashboard interactions
   - Use RequirementsPage for requirements page interactions

2. **Follow the exact pattern from the working test file**:
   ```javascript
   // Step 1: Navigate to the login page
   await loginPage.navigateToLoginPage(url);
   await loginPage.takeScreenshot('login-page.png');

   // Step 2: Login with credentials
   await loginPage.login(username, password);

   // Step 3: Wait for the portal page to load
   await portalPage.waitForPortalPageLoad();
   await portalPage.takeScreenshot('portal-page-loaded.png');

   // Step 4: Look for the International Portal card and click "GO TO DASHBOARD" or click the card itself
   const cardName = 'International Portal';
   const buttonText = 'GO TO DASHBOARD';

   // Try to click the button on the card, if not found, click the card itself
   const buttonClicked = await portalPage.clickCardButton(cardName, buttonText, true);
   expect(buttonClicked, 'International Portal card or GO TO DASHBOARD button should be clicked successfully').toBeTruthy();

   // Step 5: Wait for dashboard page to load
   await dashboardPage.waitForDashboardPageLoad();
   await dashboardPage.takeScreenshot('dashboard-page-loaded.png');

   // Step 6: Verify the dashboard page is loaded
   const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
   expect(isDashboardLoaded, 'Dashboard should be loaded').toBeTruthy();

   // Step 7: Find and click on Requirements1112 card
   const requirementsCardName = 'Requirements1112';

   // Use the dashboardPage object to find and click the card on the dashboard
   const cardClicked = await dashboardPage.clickCard(requirementsCardName);
   expect(cardClicked, 'Requirements1112 card should be clicked successfully').toBeTruthy();

   // Step 8: Wait for requirements page to load
   await requirementsPage.waitForRequirementsPageLoad();
   ```

3. **CRITICAL: Card and Button Handling Pattern**:
   - Use `portalPage.clickCardButton(cardName, buttonText, true)` to try clicking a button on a card first, then fall back to clicking the card itself if the button is not found
   - Use `dashboardPage.clickCard(cardName)` to click cards on the dashboard
   - Always verify the click was successful with an assertion: `expect(buttonClicked).toBeTruthy()`
   - Always wait for the page to load after navigation with the appropriate wait method: `waitForPortalPageLoad()`, `waitForDashboardPageLoad()`, `waitForRequirementsPageLoad()`

3. **Handle screenshot syntax correctly**:
   - Use the correct syntax for screenshots to avoid errors:
     ```javascript
     // CORRECT
     await page.screenshot({ path: 'screenshot.png', fullPage: true });

     // INCORRECT - will cause syntax error
     await page.screenshot({ path: 'screenshot.png', { fullPage: true } });
     ```

4. **Use generic selectors that work across different designs**:
   ```javascript
   // Example of robust selectors for dashboard cards
   this.dashboardCardSelector = 'div[class*="card"], div[role="article"], div[class*="tile"], div[class*="item"], section[class*="card"]';
   this.cardTitleSelector = 'h1, h2, h3, h4, h5, div[class*="title"], div[class*="header"], span[class*="title"]';
   ```