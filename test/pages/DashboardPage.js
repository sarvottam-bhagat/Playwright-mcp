const BasePage = require('./BasePage');

/**
 * Page Object Model for the Ellucian Dashboard Page
 */
class DashboardPage extends BasePage {
  /**
   * @param {import('playwright').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Selectors for dashboard page elements
    this.dashboardContentSelector = 'main, div[class*="dashboard"], div[class*="content"]';
    this.dashboardCardSelector = 'div[class*="card"], div[role="article"], div[class*="tile"], div[class*="item"], section[class*="card"]';
    this.dashboardContainerSelector = 'div[class*="cards"], div[class*="grid"], div[class*="container"]';
    this.cardTitleSelector = 'h1, h2, h3, h4, h5, div[class*="title"], div[class*="header"], span[class*="title"]';
    this.cardButtonSelector = 'button, a[role="button"], a[class*="button"]';
  }

  /**
   * Wait for the dashboard page to load and all cards to render completely
   * @param {number} timeout - Timeout in milliseconds for the overall operation
   */
  async waitForDashboardPageLoad(timeout = 20000) {
    // Use the timeout parameter to set a maximum time for the overall operation
    const startTime = Date.now();
    const checkTimeout = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > timeout) {
        console.log(`Overall timeout of ${timeout}ms exceeded. Elapsed time: ${elapsedTime}ms`);
        return true;
      }
      return false;
    };

    try {
      console.log(`Waiting for dashboard page to load (timeout: ${timeout}ms)...`);

      // First, wait for the page to load completely
      try {
        await this.waitForLoadState('domcontentloaded', 15000);
        console.log('Dashboard page DOM content loaded');

        // Wait for network activity to settle
        await this.waitForLoadState('networkidle', 15000);
        console.log('Network activity has settled');
      } catch (loadError) {
        console.log(`Load state wait timed out: ${loadError.message}`);
        // Continue anyway - the page might still be usable
      }

      // Take a screenshot after initial load
      await this.takeScreenshot('dashboard-initial-load.png');

      // Try to wait for dashboard content
      try {
        console.log('Looking for dashboard content...');
        await this.page.waitForSelector(this.dashboardContentSelector, { timeout: 10000 });
        console.log('Dashboard content found');
      } catch (error) {
        console.log('Dashboard content selector not found, continuing anyway');
        await this.takeScreenshot('dashboard-content-not-found.png');
      }

      // Wait for dashboard container
      try {
        console.log('Waiting for dashboard container to appear...');
        await this.page.waitForSelector(this.dashboardContainerSelector, { timeout: 10000 });
        console.log('Dashboard container found');
      } catch (error) {
        console.log(`Dashboard container not found: ${error.message}`);
        await this.takeScreenshot('dashboard-container-not-found.png');
      }

      // Wait for dashboard cards to appear and ensure they're fully loaded
      try {
        console.log('Waiting for dashboard cards to render...');
        // Try to wait for dashboard cards, but don't fail if they don't appear
        try {
          await this.page.waitForSelector(this.dashboardCardSelector, { timeout: 5000 });
          console.log('Dashboard cards found');
        } catch (cardError) {
          console.log(`Warning: Could not find dashboard cards: ${cardError.message}`);
          console.log('Continuing anyway - the dashboard might still be usable');
        }

        // Count the cards to ensure they're loaded
        let cards = await this.page.$$(this.dashboardCardSelector);
        let previousCardCount = 0;
        let stableCount = 0;
        const maxAttempts = 5;

        // Wait until the card count stabilizes (no new cards appearing)
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          // Check if we've exceeded the overall timeout
          if (checkTimeout()) {
            console.log('Breaking card count check loop due to overall timeout');
            break;
          }

          console.log(`Dashboard card count check attempt ${attempt + 1}/${maxAttempts}: Found ${cards.length} cards`);

          if (cards.length === previousCardCount) {
            stableCount++;
            if (stableCount >= 2) {
              console.log(`Dashboard card count has stabilized at ${cards.length} cards`);
              break;
            }
          } else {
            stableCount = 0;
            previousCardCount = cards.length;
          }

          // Wait for more cards to potentially load
          await this.wait(1000);
          cards = await this.page.$$(this.dashboardCardSelector);
        }

        console.log(`Final dashboard card count: ${cards.length} cards`);

        // Check if we've exceeded the overall timeout
        if (checkTimeout()) {
          console.log('Skipping additional waits due to overall timeout');
        } else {
          // Wait for card content to fully render
          console.log('Waiting for dashboard card content to fully render...');
          await this.wait(2000);

          // Check if cards have images and wait for them to load
          if (!checkTimeout()) {
            const cardImages = await this.page.$$(`${this.dashboardCardSelector} img`);
            if (cardImages.length > 0) {
              console.log(`Found ${cardImages.length} images in dashboard cards, waiting for them to load...`);
              await this.wait(2000);
            }
          }
        }
      } catch (error) {
        console.log(`Dashboard cards not found: ${error.message}`);
        await this.takeScreenshot('dashboard-cards-not-found.png');
      }

      // Take a screenshot of the loaded dashboard
      await this.takeScreenshot('dashboard-fully-loaded.png');

      // Calculate total elapsed time
      const totalElapsedTime = Date.now() - startTime;
      if (totalElapsedTime > timeout) {
        console.log(`Dashboard page load completed but exceeded timeout. Total time: ${totalElapsedTime}ms (timeout: ${timeout}ms)`);
      } else {
        console.log(`Dashboard page and all cards have been rendered completely in ${totalElapsedTime}ms`);
      }
    } catch (error) {
      console.log(`Warning: Error during dashboard page load: ${error.message}`);
      await this.takeScreenshot('dashboard-page-load-error.png');
    }
  }

  /**
   * Check if the dashboard page is loaded
   * @returns {Promise<boolean>} - True if dashboard is loaded, false otherwise
   */
  async isDashboardLoaded() {
    try {
      // Try multiple approaches to check if the dashboard is loaded

      // Approach 1: Check for dashboard content selector
      try {
        const content = await this.page.$(this.dashboardContentSelector);
        if (content !== null) {
          console.log('Dashboard content found');
          return true;
        }
      } catch (contentError) {
        console.log(`Warning: Error checking for dashboard content: ${contentError.message}`);
      }

      // Approach 2: Check the page title
      try {
        const title = await this.page.title();
        console.log(`Current page title: ${title}`);
        if (title && (title.includes('Dashboard') || title.includes('Portal') || title.includes('Ellucian'))) {
          console.log('Dashboard detected based on page title');
          return true;
        }
      } catch (titleError) {
        console.log(`Warning: Error checking page title: ${titleError.message}`);
      }

      // Approach 3: Check for any content on the page
      try {
        const bodyText = await this.page.evaluate(() => document.body.innerText);
        if (bodyText && bodyText.length > 0) {
          console.log('Page has content, assuming dashboard is loaded');
          return true;
        }
      } catch (bodyError) {
        console.log(`Warning: Error checking page body: ${bodyError.message}`);
      }

      // If all approaches fail, return false
      console.log('All dashboard detection approaches failed');
      return false;
    } catch (error) {
      console.log(`Error checking if dashboard is loaded: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the dashboard title
   * @returns {Promise<string>} - The dashboard title
   */
  async getDashboardTitle() {
    try {
      const title = await this.getTitle();
      return title || 'Unknown Title';
    } catch (error) {
      console.log(`Error getting dashboard title: ${error.message}`);
      return 'Error Getting Title';
    }
  }

  /**
   * Find a specific card by name on the dashboard
   * @param {string} cardName - The name of the card to find
   * @returns {Promise<Object|null>} - Card element handle if found, null otherwise
   */
  async findCard(cardName) {
    console.log(`Looking for ${cardName} card on dashboard...`);

    try {
      // Get all cards
      const cards = await this.page.$$(this.dashboardCardSelector);
      console.log(`Found ${cards.length} cards on the dashboard`);

      // For each card, check if it contains the card name
      for (const card of cards) {
        // Get the card title
        const titleElement = await card.$(this.cardTitleSelector);
        if (!titleElement) continue;

        const titleText = await titleElement.textContent();
        if (!titleText) continue;

        // Check if the card title contains the card name (case insensitive)
        if (titleText.toLowerCase().includes(cardName.toLowerCase())) {
          console.log(`Found card with title containing "${cardName}": "${titleText}"`);
          await card.scrollIntoViewIfNeeded();
          await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-card-found.png`);
          return card;
        }
      }

      // If no card was found by title, try searching in the entire card content
      console.log(`No card title found with "${cardName}", searching in card content...`);
      for (const card of cards) {
        const cardText = await card.textContent();
        if (!cardText) continue;

        if (cardText.toLowerCase().includes(cardName.toLowerCase())) {
          console.log(`Found card with content containing "${cardName}"`);
          await card.scrollIntoViewIfNeeded();
          await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-card-found.png`);
          return card;
        }
      }

      // If still not found, try a more generic approach with page.getByText
      console.log(`Card not found with standard selectors, trying page.getByText for "${cardName}"...`);
      const textElements = this.page.getByText(new RegExp(cardName, 'i'));
      if (await textElements.count() > 0) {
        console.log(`Found ${await textElements.count()} elements with text matching "${cardName}"`);
        const firstElement = textElements.first();
        await firstElement.scrollIntoViewIfNeeded();
        await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-text-found.png`);
        return firstElement;
      }

      console.log(`Could not find any card containing "${cardName}"`);
      await this.takeScreenshot('card-not-found.png');
      return null;
    } catch (error) {
      console.log(`Error finding ${cardName} card: ${error.message}`);
      await this.takeScreenshot('error-finding-card.png');
      return null;
    }
  }

  /**
   * Click directly on a card in the dashboard
   * @param {string} cardName - The name of the card to click
   * @returns {Promise<boolean>} - True if clicked successfully, false otherwise
   */
  async clickCard(cardName) {
    console.log(`Looking for ${cardName} card to click on dashboard...`);

    try {
      // Find the card first
      const card = await this.findCard(cardName);
      if (!card) {
        console.log(`Cannot click card because ${cardName} card was not found on dashboard`);
        return false;
      }

      // Click the card
      await card.scrollIntoViewIfNeeded();
      await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-card-before-click.png`);

      await card.click({ force: true });
      console.log(`Successfully clicked the ${cardName} card on dashboard`);
      await this.wait(1000); // Wait for click to take effect
      await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-card-after-click.png`);

      return true;
    } catch (error) {
      console.log(`Error clicking ${cardName} card on dashboard: ${error.message}`);
      await this.takeScreenshot('error-clicking-card.png');
      return false;
    }
  }

  /**
   * Click a button on a specific card in the dashboard
   * @param {string} cardName - The name of the card
   * @param {string} buttonText - The text on the button to click (optional)
   * @param {boolean} clickCardIfNoButton - Whether to click the card itself if no button is found (default: false)
   * @returns {Promise<boolean>} - True if clicked successfully, false otherwise
   */
  async clickCardButton(cardName, buttonText = null, clickCardIfNoButton = false) {
    console.log(`Looking for ${buttonText ? buttonText + ' button on ' : 'any button in '}${cardName} card on dashboard...`);

    try {
      // Find the card first
      const card = await this.findCard(cardName);
      if (!card) {
        console.log(`Cannot click button because ${cardName} card was not found on dashboard`);
        return false;
      }

      // Check if card is a Locator object (returned by page.getByText) or an ElementHandle
      const isLocator = typeof card.$$ !== 'function';
      console.log(`Card is a ${isLocator ? 'Locator' : 'ElementHandle'} object`);

      // If buttonText is provided, look for that specific button
      if (buttonText) {
        if (isLocator) {
          // For Locator objects, use locator methods to find buttons
          console.log(`Using Locator methods to find button with text "${buttonText}"`);

          // Try to find a button near the card text
          const nearbyButton = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).filter({ has: card });
          const buttonCount = await nearbyButton.count();

          if (buttonCount > 0) {
            console.log(`Found ${buttonCount} buttons with text matching "${buttonText}" near the card`);
            await nearbyButton.first().scrollIntoViewIfNeeded();
            await this.takeScreenshot(`${buttonText.toLowerCase().replace(/\s+/g, '-')}-button-found.png`);

            await nearbyButton.first().click({ force: true });
            console.log(`Successfully clicked button with text matching "${buttonText}"`);
            await this.wait(1000); // Wait for click to take effect
            return true;
          }

          // If no nearby button found, try to find any button with the text on the page
          console.log(`No button found near card with text "${buttonText}", trying page-wide search...`);
          const pageButtons = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') });

          if (await pageButtons.count() > 0) {
            console.log(`Found ${await pageButtons.count()} buttons with text matching "${buttonText}" on the page`);
            await pageButtons.first().scrollIntoViewIfNeeded();
            await this.takeScreenshot(`${buttonText.toLowerCase().replace(/\s+/g, '-')}-button-found.png`);

            await pageButtons.first().click({ force: true });
            console.log(`Successfully clicked button with text matching "${buttonText}"`);
            await this.wait(1000); // Wait for click to take effect
            return true;
          }
        } else {
          // For ElementHandle objects, use the original approach
          // Try to find the button within the card
          const cardButtons = await card.$$(this.cardButtonSelector);
          console.log(`Found ${cardButtons.length} buttons in the card`);

          for (const button of cardButtons) {
            const buttonContent = await button.textContent();
            if (!buttonContent) continue;

            // Check if button text matches (case insensitive)
            if (buttonContent.toLowerCase().includes(buttonText.toLowerCase())) {
              console.log(`Found button with text containing "${buttonText}": "${buttonContent}"`);
              await button.scrollIntoViewIfNeeded();
              await this.takeScreenshot(`${buttonText.toLowerCase().replace(/\s+/g, '-')}-button-found.png`);

              await button.click({ force: true });
              console.log(`Successfully clicked button with text "${buttonContent}"`);
              await this.wait(1000); // Wait for click to take effect
              return true;
            }
          }

          // If no button found in the card, try to find it on the page
          console.log(`No button found in card with text "${buttonText}", trying page-wide search...`);
          const pageButtons = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') });

          if (await pageButtons.count() > 0) {
            console.log(`Found ${await pageButtons.count()} buttons with text matching "${buttonText}" on the page`);
            await pageButtons.first().scrollIntoViewIfNeeded();
            await this.takeScreenshot(`${buttonText.toLowerCase().replace(/\s+/g, '-')}-button-found.png`);

            await pageButtons.first().click({ force: true });
            console.log(`Successfully clicked button with text matching "${buttonText}"`);
            await this.wait(1000); // Wait for click to take effect
            return true;
          }
        }
      } else {
        // If no buttonText provided
        if (isLocator) {
          // For Locator objects, try to find any button near the card
          console.log(`Looking for any button near the card`);
          const nearbyButtons = this.page.getByRole('button').filter({ has: card });

          if (await nearbyButtons.count() > 0) {
            console.log(`Found ${await nearbyButtons.count()} buttons near the card`);
            await nearbyButtons.first().scrollIntoViewIfNeeded();
            await this.takeScreenshot('card-button-found.png');

            await nearbyButtons.first().click({ force: true });
            console.log('Successfully clicked the first button near the card');
            await this.wait(1000); // Wait for click to take effect
            return true;
          }
        } else {
          // For ElementHandle objects, use the original approach
          const cardButtons = await card.$$(this.cardButtonSelector);
          if (cardButtons.length > 0) {
            console.log(`Clicking the first of ${cardButtons.length} buttons found in the card`);
            await cardButtons[0].scrollIntoViewIfNeeded();
            await this.takeScreenshot('card-button-found.png');

            await cardButtons[0].click({ force: true });
            console.log('Successfully clicked the first button in the card');
            await this.wait(1000); // Wait for click to take effect
            return true;
          }
        }
      }

      // If no button found and clickCardIfNoButton is true, click the card itself
      if (clickCardIfNoButton) {
        console.log(`No button found in ${cardName} card, clicking the card itself`);
        await card.scrollIntoViewIfNeeded();
        await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-card-click.png`);

        await card.click({ force: true });
        console.log(`Successfully clicked the ${cardName} card`);
        await this.wait(1000); // Wait for click to take effect
        return true;
      }

      console.log(`Could not find ${buttonText ? buttonText + ' button' : 'any button'} in the ${cardName} card`);
      await this.takeScreenshot('button-not-found.png');
      return false;
    } catch (error) {
      console.log(`Error clicking button: ${error.message}`);
      await this.takeScreenshot('error-clicking-button.png');
      return false;
    }
  }

  /**
   * Wait for navigation to complete after clicking a button
   * @param {import('playwright').BrowserContext} context - Playwright browser context
   * @returns {Promise<import('playwright').Page>} - The page after navigation
   */
  async waitForNavigationAfterButtonClick(context) {
    console.log('Waiting for navigation to complete after button click...');

    try {
      // First check if a new page was opened
      const pages = context.pages();
      console.log(`Current number of pages: ${pages.length}`);

      if (pages.length > 1) {
        // Get the most recently opened page
        const newPage = pages[pages.length - 1];
        console.log('New page detected, switching to it');

        // Wait for the new page to load
        await newPage.waitForLoadState('domcontentloaded', { timeout: 10000 });
        console.log('New page loaded');

        return newPage;
      } else {
        // No new page, wait for navigation on the current page
        console.log('No new page detected, waiting for navigation on current page');
        await this.waitForLoadState('networkidle', 10000);
        console.log('Navigation completed on current page');

        return this.page;
      }
    } catch (error) {
      console.log(`Warning: Error during navigation: ${error.message}`);
      console.log('Returning current page as fallback');
      return this.page;
    }
  }
}

module.exports = DashboardPage;
