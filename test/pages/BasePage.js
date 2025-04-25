/**
 * Base Page Object Model class that all page objects will inherit from
 */
class BasePage {
  /**
   * @param {import('playwright').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - The URL to navigate to
   */
  async navigate(url) {
    await this.page.goto(url);
  }

  /**
   * Wait for page to reach a specific load state
   * @param {string} state - Load state to wait for ('load'|'domcontentloaded'|'networkidle')
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} - True if the state was reached, false if timed out
   */
  async waitForLoadState(state = 'domcontentloaded', timeout = 10000) {
    try {
      await this.page.waitForLoadState(state, { timeout });
      return true;
    } catch (error) {
      console.log(`Warning: Timeout waiting for load state '${state}': ${error.message}`);
      return false;
    }
  }

  /**
   * Take a screenshot and save it to the specified path
   * @param {string} path - Path where the screenshot will be saved
   */
  async takeScreenshot(path) {
    try {
      // Create screenshots directory if it doesn't exist
      const fs = require('fs');
      const dir = require('path').dirname(path);
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await this.page.screenshot({ path, timeout: 5000 });
      console.log(`Screenshot saved to: ${path}`);
    } catch (error) {
      console.log(`Warning: Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Wait for a specific timeout
   * @param {number} ms - Time to wait in milliseconds
   */
  async wait(ms) {
    try {
      // Limit the maximum wait time to 5 seconds to avoid test timeouts
      const safeMs = Math.min(ms, 5000);
      if (safeMs < ms) {
        console.log(`Reducing wait time from ${ms}ms to ${safeMs}ms to avoid test timeout`);
      }
      await this.page.waitForTimeout(safeMs);
    } catch (error) {
      console.log(`Warning: Error during wait: ${error.message}`);
    }
  }

  /**
   * Get the title of the current page
   * @returns {Promise<string>} - The page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Get the text content of the page
   * @returns {Promise<string>} - The text content of the page
   */
  async getPageText() {
    return await this.page.evaluate(() => document.body.innerText);
  }
}

module.exports = BasePage;
