const BasePage = require('./BasePage');

/**
 * Page Object Model for the Ellucian Login Page
 */
class LoginPage extends BasePage {
  /**
   * @param {import('playwright').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Selectors for login page elements
    this.usernameInput = 'input[type="text"]';
    this.passwordInput = 'input[type="password"]';
    this.loginButton = 'button[type="submit"]';
  }

  /**
   * Navigate to the login page
   * @param {string} url - The URL of the login page
   */
  async navigateToLoginPage(url) {
    await this.navigate(url);
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
   * @param {string} username - Username to enter
   */
  async enterUsername(username) {
    await this.page.fill(this.usernameInput, username);
  }

  /**
   * Enter password in the login form
   * @param {string} password - Password to enter
   */
  async enterPassword(password) {
    await this.page.fill(this.passwordInput, password);
  }

  /**
   * Click the login button
   */
  async clickLoginButton() {
    await this.page.click(this.loginButton);
  }

  /**
   * Complete login process
   * @param {string} username - Username to enter
   * @param {string} password - Password to enter
   */
  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Complete the login process and wait for the page to load
   * @param {string} url - The URL of the login page
   * @param {string} username - Username for login
   * @param {string} password - Password for login
   */
  async loginAndWaitForNavigation(url, username, password) {
    console.log(`Navigating to ${url}...`);
    try {
      await this.navigateToLoginPage(url);

      console.log(`Logging in with username: ${username}...`);
      await this.login(username, password);

      // Wait for navigation after login with reduced timeout
      try {
        console.log('Waiting for page to load after login...');
        // First wait for domcontentloaded which is faster
        await this.waitForLoadState('domcontentloaded', 10000);
        console.log('DOM content loaded after login');

        // Then wait a bit more for additional resources, but not too long
        console.log('Waiting for additional resources to load...');
        await this.wait(1000); // Reduced from 3000ms to 1000ms
        console.log('Login navigation completed');
      } catch (error) {
        console.log(`Warning: Timeout waiting for page load after login: ${error.message}`);
        // Continue anyway - the page might still be usable
      }

      // Take a screenshot after login
      await this.takeScreenshot('after-login.png');
    } catch (error) {
      console.log(`Error during login process: ${error.message}`);
      await this.takeScreenshot('login-error.png');
      // Rethrow the error since login is critical
      throw error;
    }
  }
}

module.exports = LoginPage;
