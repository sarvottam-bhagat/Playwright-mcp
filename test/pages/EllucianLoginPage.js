const BasePage = require('./BasePage');
const PortalPage = require('./PortalPage');

/**
 * Page Object Model for the Ellucian Login Page
 */
class EllucianLoginPage extends BasePage {
  /**
   * @param {import('playwright').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Specific selectors for Ellucian login page elements
    this.usernameInput = '#usernameUserInput'; // From observation, this is the actual username field
    this.hiddenUsernameInput = '#username'; // Hidden username field that gets populated
    this.passwordInput = '#password';
    this.loginButton = 'button[type="submit"]';
    this.rememberMeCheckbox = '#chkRemember';
    this.errorMessage = '#error-msg';
  }

  /**
   * Navigate to the Ellucian login page
   * @param {string} url - The URL of the Ellucian login page
   */
  async navigateToLoginPage(url) {
    console.log(`Navigating to Ellucian login page: ${url}`);
    await this.navigate(url);
    await this.waitForLoginForm();
  }

  /**
   * Wait for the Ellucian login form to be visible
   */
  async waitForLoginForm() {
    try {
      console.log('Waiting for Ellucian login form to be visible...');
      await this.page.waitForSelector(this.usernameInput, { timeout: 10000 });
      await this.page.waitForSelector(this.passwordInput, { timeout: 5000 });
      await this.page.waitForSelector(this.loginButton, { timeout: 5000 });
      console.log('Login form is visible');
    } catch (error) {
      console.log(`Error waiting for login form: ${error.message}`);
      await this.takeScreenshot('login-form-error.png');
      throw error; // Re-throw as login form is critical
    }
  }

  /**
   * Enter username in the Ellucian login form
   * @param {string} username - Username to enter
   */
  async enterUsername(username) {
    console.log(`Entering username: ${username}`);
    try {
      await this.page.fill(this.usernameInput, username);
    } catch (error) {
      console.log(`Error entering username: ${error.message}`);
      await this.takeScreenshot('username-error.png');
      throw error;
    }
  }

  /**
   * Enter password in the Ellucian login form
   * @param {string} password - Password to enter
   */
  async enterPassword(password) {
    console.log('Entering password');
    try {
      await this.page.fill(this.passwordInput, password);
    } catch (error) {
      console.log(`Error entering password: ${error.message}`);
      await this.takeScreenshot('password-error.png');
      throw error;
    }
  }

  /**
   * Toggle remember me checkbox
   * @param {boolean} check - Whether to check or uncheck
   */
  async toggleRememberMe(check = true) {
    try {
      const isChecked = await this.page.$eval(this.rememberMeCheckbox, el => el.checked);
      if ((check && !isChecked) || (!check && isChecked)) {
        await this.page.click(this.rememberMeCheckbox);
        console.log(`Remember me checkbox ${check ? 'checked' : 'unchecked'}`);
      }
    } catch (error) {
      console.log(`Error toggling remember me: ${error.message}`);
      // Non-critical, so don't throw
    }
  }

  /**
   * Click the login button on the Ellucian login form
   */
  async clickLoginButton() {
    console.log('Clicking Continue button');
    try {
      await this.page.click(this.loginButton);
    } catch (error) {
      console.log(`Error clicking login button: ${error.message}`);
      await this.takeScreenshot('login-button-error.png');
      throw error;
    }
  }

  /**
   * Complete the Ellucian login process
   * @param {string} username - Username for login
   * @param {string} password - Password for login
   * @param {boolean} rememberMe - Whether to check remember me
   * @returns {Promise<PortalPage>} - A portal page object for further interactions
   */
  async login(username, password, rememberMe = false) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    
    if (rememberMe) {
      await this.toggleRememberMe(true);
    }
    
    await this.clickLoginButton();
    return new PortalPage(this.page);
  }

  /**
   * Complete the login process and wait for navigation to the portal page
   * @param {string} url - The URL of the login page
   * @param {string} username - Username for login
   * @param {string} password - Password for login
   * @param {boolean} rememberMe - Whether to check remember me
   * @returns {Promise<PortalPage>} - A portal page object for further interactions
   */
  async loginAndWaitForNavigation(url, username, password, rememberMe = false) {
    console.log(`Starting complete login flow to ${url} with username ${username}`);
    
    try {
      await this.navigateToLoginPage(url);
      await this.takeScreenshot('at-login-page.png');

      const portalPage = await this.login(username, password, rememberMe);
      
      // Wait for navigation after login
      try {
        console.log('Waiting for page to load after login...');
        // First wait for domcontentloaded which is faster
        await this.waitForLoadState('domcontentloaded', 20000);
        console.log('DOM content loaded after login');
        
        // Then wait a bit for initial resources to load
        await this.wait(2000);
        
        // Take a screenshot after login navigation
        await this.takeScreenshot('after-login-navigation.png');
      } catch (error) {
        console.log(`Warning: Timeout waiting for page load after login: ${error.message}`);
        // Continue anyway - the page might still be usable
      }
      
      return portalPage;
    } catch (error) {
      console.log(`Error during complete login process: ${error.message}`);
      await this.takeScreenshot('login-process-error.png');
      throw error;
    }
  }

  /**
   * Get any error message displayed on the login page
   * @returns {Promise<string|null>} - The error message or null if none
   */
  async getErrorMessage() {
    try {
      const errorVisible = await this.page.isVisible(this.errorMessage);
      if (errorVisible) {
        const message = await this.page.textContent(this.errorMessage);
        console.log(`Login error message: ${message}`);
        return message;
      }
      return null;
    } catch (error) {
      console.log(`Error checking for error message: ${error.message}`);
      return null;
    }
  }
}

module.exports = EllucianLoginPage;