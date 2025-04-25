// filepath: /Users/sarvottamb/insider/test/pages/RequirementsPage.js
const BasePage = require('./BasePage');

/**
 * Page Object Model for the Requirements Page
 */
class RequirementsPage extends BasePage {
  /**
   * @param {import('playwright').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Selectors for requirements page elements
    this.requirementsContentSelector = 'main, div[class*="content"], div[role="main"]';
    this.requirementsHeaderSelector = 'h1, h2, div[class*="header"], div[class*="title"]';
    this.requirementsListSelector = 'ul, ol, div[class*="list"]';
    this.requirementItemSelector = 'li, div[class*="item"], div[class*="requirement"]';
    this.requirementStatusSelector = 'span[class*="status"], div[class*="status"]';
  }

  /**
   * Wait for the requirements page to load completely
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForRequirementsPageLoad(timeout = 15000) {
    console.log('Waiting for requirements page to load...');

    try {
      // Wait for the page to load
      await this.waitForLoadState('domcontentloaded', timeout / 3);
      console.log('Requirements page DOM content loaded');

      // Wait for network activity to settle
      await this.waitForLoadState('networkidle', timeout / 3);
      console.log('Network activity has settled');

      // Take a screenshot after initial load
      await this.takeScreenshot('requirements-initial-load.png');

      // Wait for content to appear
      await this.page.waitForSelector(this.requirementsContentSelector, { timeout: timeout / 3 });
      console.log('Requirements content found');

      // Wait for any animations to complete
      await this.wait(1000);

      // Check if requirements header is present
      try {
        const headerElement = await this.page.$(this.requirementsHeaderSelector);
        if (headerElement) {
          const headerText = await headerElement.textContent();
          console.log(`Requirements header found: "${headerText.trim()}"`);
        } else {
          console.log('No requirements header found');
        }
      } catch (error) {
        console.log(`Error checking requirements header: ${error.message}`);
      }

      // Check if requirements list is present
      try {
        await this.page.waitForSelector(this.requirementsListSelector, { timeout: 5000 });
        const requirementItems = await this.page.$$(this.requirementItemSelector);
        console.log(`Found ${requirementItems.length} requirement items on the page`);
      } catch (error) {
        console.log(`Requirements list not found: ${error.message}`);
      }

      // Take a screenshot of the fully loaded requirements page
      await this.takeScreenshot('requirements-fully-loaded.png');
      console.log('Requirements page loaded successfully');
      
      return true;
    } catch (error) {
      console.log(`Warning: Error during requirements page load: ${error.message}`);
      await this.takeScreenshot('requirements-page-load-error.png');
      return false;
    }
  }

  /**
   * Get all requirement items on the page
   * @returns {Promise<Array>} - Array of requirement element handles
   */
  async getAllRequirements() {
    try {
      const requirements = await this.page.$$(this.requirementItemSelector);
      console.log(`Found ${requirements.length} requirements on the page`);
      return requirements;
    } catch (error) {
      console.log(`Error getting requirements: ${error.message}`);
      return [];
    }
  }

  /**
   * Get the status of a specific requirement
   * @param {Object} requirement - Requirement element handle
   * @returns {Promise<string>} - The status of the requirement
   */
  async getRequirementStatus(requirement) {
    try {
      const statusElement = await requirement.$(this.requirementStatusSelector);
      if (statusElement) {
        const status = await statusElement.textContent();
        return status.trim();
      }
      return 'Unknown';
    } catch (error) {
      console.log(`Error getting requirement status: ${error.message}`);
      return 'Error';
    }
  }

  /**
   * Get the text content of a specific requirement
   * @param {Object} requirement - Requirement element handle
   * @returns {Promise<string>} - The text content of the requirement
   */
  async getRequirementText(requirement) {
    try {
      const text = await requirement.textContent();
      return text.trim();
    } catch (error) {
      console.log(`Error getting requirement text: ${error.message}`);
      return 'Error';
    }
  }

  /**
   * Get all requirement texts and statuses
   * @returns {Promise<Array<Object>>} - Array of objects with text and status properties
   */
  async getAllRequirementTextsAndStatuses() {
    const requirements = await this.getAllRequirements();
    const result = [];

    for (const requirement of requirements) {
      const text = await this.getRequirementText(requirement);
      const status = await this.getRequirementStatus(requirement);
      result.push({ text, status });
    }

    return result;
  }

  /**
   * Check if the requirements page is loaded
   * @returns {Promise<boolean>} - True if the requirements page is loaded, false otherwise
   */
  async isRequirementsPageLoaded() {
    try {
      const content = await this.page.$(this.requirementsContentSelector);
      return content !== null;
    } catch (error) {
      console.log(`Error checking if requirements page is loaded: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the requirements page title
   * @returns {Promise<string>} - The requirements page title
   */
  async getRequirementsPageTitle() {
    try {
      return await this.getTitle();
    } catch (error) {
      console.log(`Error getting requirements page title: ${error.message}`);
      return 'Error Getting Title';
    }
  }

  /**
   * Wait for a specific period of time on the requirements page
   * @param {number} seconds - Time to wait in seconds
   */
  async waitOnRequirementsPage(seconds) {
    console.log(`Waiting on requirements page for ${seconds} seconds...`);
    await this.wait(seconds * 1000);
    console.log(`Completed waiting for ${seconds} seconds`);
  }
}

module.exports = RequirementsPage;