const BasePage = require('./BasePage');

/**
 * Page Object Model for a generic Portal Page with cards
 */
class PortalPage extends BasePage {
  /**
   * @param {import('playwright').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Selectors for portal page elements - using generic selectors that work across different designs
    this.mainContentSelector = 'main, div[role="main"], div[class*="content"]';
    this.cardsContainerSelector = 'div[class*="cards"], div[class*="grid"], div[class*="container"]';
    this.cardSelector = 'div[class*="card"], div[role="article"], div[class*="tile"], section[class*="card"]';
    this.cardTitleSelector = 'h1, h2, h3, h4, h5, div[class*="title"], div[class*="header"]';
    this.cardContentSelector = 'div[class*="content"], div[class*="body"], p';
    this.cardButtonSelector = 'button, a[role="button"], a[class*="button"]';
    this.cardIconSelector = 'svg, [class*="icon"], [class*="fa-"], img[width="24"], img[height="24"], img[width="16"], img[height="16"]';
  }

  /**
   * Wait for the portal page to load completely with all cards rendered
   * @param {number} timeout - Timeout in milliseconds for the overall operation (used for individual wait operations)
   */
  async waitForPortalPageLoad(timeout = 30000) {
    console.log('Waiting for portal page to load completely...');

    try {
      // Wait for main content to be visible
      await this.page.waitForSelector(this.mainContentSelector, { timeout: timeout / 3 });
      console.log('Main content is visible');

      // Wait for cards container to be visible
      await this.page.waitForSelector(this.cardsContainerSelector, { timeout: timeout / 3 });
      console.log('Cards container is visible');

      // Wait for cards to appear
      await this.page.waitForSelector(this.cardSelector, { timeout: timeout / 3 });
      console.log('Cards are visible');

      // Wait for a stable number of cards
      let previousCardCount = 0;
      let currentCardCount = 0;
      let stableCount = 0;
      const maxAttempts = 10;
      let attempt = 0;

      while (attempt < maxAttempts && stableCount < 3) {
        await this.wait(1000); // Wait a second between checks

        // Count the cards
        const cards = await this.page.$$(this.cardSelector);
        currentCardCount = cards.length;

        console.log(`Card count: ${currentCardCount} (previous: ${previousCardCount})`);

        if (currentCardCount === previousCardCount && currentCardCount > 0) {
          stableCount++;
          console.log(`Stable card count: ${stableCount}/3`);
        } else {
          stableCount = 0;
        }

        previousCardCount = currentCardCount;
        attempt++;
      }

      console.log(`Final card count: ${currentCardCount}`);

      // Wait a bit more for card content to fully load
      await this.wait(2000);

      // Take a screenshot of the loaded cards
      await this.takeScreenshot('portal-page-cards-loaded.png');
      console.log('All cards have been rendered completely');
    } catch (error) {
      console.log(`Warning: Error during portal page load: ${error.message}`);
      await this.takeScreenshot('portal-page-load-error.png');
    }
  }

  /**
   * Find a specific card by name and wait for it to fully render
   * @param {string} cardName - The name of the card to find
   * @returns {Promise<Object|null>} - Card element handle if found, null otherwise
   */
  async findCard(cardName) {
    console.log(`Looking for ${cardName} card...`);

    // First, make sure all cards are loaded
    await this.waitForPortalPageLoad();

    try {
      // Get all cards
      const cards = await this.page.$$(this.cardSelector);
      console.log(`Found ${cards.length} cards on the page`);

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
   * Get all cards on the page
   * @returns {Promise<Array>} - Array of card element handles
   */
  async getAllCards() {
    // Make sure all cards are loaded
    await this.waitForPortalPageLoad();

    try {
      const cards = await this.page.$$(this.cardSelector);
      console.log(`Found ${cards.length} cards on the page`);
      return cards;
    } catch (error) {
      console.log(`Error getting all cards: ${error.message}`);
      return [];
    }
  }

  /**
   * Get the content of a specific card
   * @param {Object} card - Card element handle
   * @returns {Promise<Object>} - Object containing card title and content
   */
  async getCardContent(card) {
    try {
      // Get the card title
      const titleElement = await card.$(this.cardTitleSelector);
      const title = titleElement ? await titleElement.textContent() : 'Unknown Title';

      // Get the card content
      const contentElement = await card.$(this.cardContentSelector);
      const content = contentElement ? await contentElement.textContent() : '';

      return { title: title.trim(), content: content.trim() };
    } catch (error) {
      console.log(`Error getting card content: ${error.message}`);
      return { title: 'Error', content: '' };
    }
  }

  /**
   * Click a button on a specific card
   * @param {string} cardName - The name of the card
   * @param {string} buttonText - The text on the button to click (optional)
   * @param {boolean} clickCardIfNoButton - Whether to click the card itself if no button is found (default: false)
   * @returns {Promise<boolean>} - True if clicked successfully, false otherwise
   */
  async clickCardButton(cardName, buttonText = null, clickCardIfNoButton = false) {
    console.log(`Looking for ${buttonText ? buttonText + ' button on ' : 'any button in '}${cardName} card...`);

    try {
      // Find the card first
      const card = await this.findCard(cardName);
      if (!card) {
        console.log(`Cannot click button because ${cardName} card was not found`);
        return false;
      }

      // If buttonText is provided, look for that specific button
      if (buttonText) {
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
      } else {
        // If no buttonText provided, click the first button in the card
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

  /**
   * Get all card titles on the page
   * @returns {Promise<Array<string>>} - Array of card titles
   */
  async getAllCardTitles() {
    const cards = await this.getAllCards();
    const titles = [];

    for (const card of cards) {
      const { title } = await this.getCardContent(card);
      titles.push(title);
    }

    return titles;
  }

  /**
   * Get all card contents on the page
   * @returns {Promise<Array<Object>>} - Array of objects with title and content properties
   */
  async getAllCardContents() {
    const cards = await this.getAllCards();
    const contents = [];

    for (const card of cards) {
      const cardContent = await this.getCardContent(card);
      contents.push(cardContent);
    }

    return contents;
  }

  /**
   * Click an icon on a specific card
   * @param {string} cardName - The name of the card
   * @param {string} [iconSelector=null] - Optional CSS selector for the icon. If not provided, uses the default cardIconSelector
   * @param {boolean} [clickCardIfNoIcon=false] - Whether to click the card itself if no icon is found
   * @returns {Promise<boolean>} - True if clicked successfully, false otherwise
   */
  async clickCardIcon(cardName, iconSelector = null, clickCardIfNoIcon = false) {
    // Use provided iconSelector or fall back to the default cardIconSelector
    const selector = iconSelector || this.cardIconSelector;
    console.log(`Looking for icon in ${cardName} card using selector: ${selector}...`);

    try {
      // Find the card first
      const card = await this.findCard(cardName);
      if (!card) {
        console.log(`Cannot click icon because ${cardName} card was not found`);
        return false;
      }

      // Try to find the icon using the provided selector
      const icon = await card.$(selector);
      if (icon) {
        // Check if the icon is visible
        const isVisible = await icon.isVisible();
        if (isVisible) {
          await icon.scrollIntoViewIfNeeded();
          await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-icon-before-click.png`);

          await icon.click({ force: true });
          console.log(`Successfully clicked icon in ${cardName} card with selector: ${selector}`);
          await this.wait(1000); // Wait for click to take effect
          await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-icon-after-click.png`);
          return true;
        } else {
          console.log(`Icon found in ${cardName} card but it's not visible`);
        }
      }

      // If no icon found with the provided selector, try alternative approaches
      console.log(`No icon found in ${cardName} card with selector ${selector}, trying alternative approaches...`);

      // Try to find any SVG elements, common icon fonts, or small images that might be icons
      const alternativeIconFound = await card.evaluate((el) => {
        // Try SVG elements first
        const svgs = el.querySelectorAll('svg');
        if (svgs.length > 0) {
          svgs[0].click();
          return true;
        }

        // Try elements with icon classes
        const iconElements = el.querySelectorAll('[class*="icon"], [class*="fa-"], .material-icons');
        if (iconElements.length > 0) {
          iconElements[0].click();
          return true;
        }

        // Try small images that might be icons
        const smallImages = el.querySelectorAll('img[width="24"], img[height="24"], img[width="16"], img[height="16"]');
        if (smallImages.length > 0) {
          smallImages[0].click();
          return true;
        }

        // Try elements with aria-label that might be icons
        const ariaElements = el.querySelectorAll('[aria-label*="icon"], [aria-label*="detail"], [aria-label*="info"]');
        if (ariaElements.length > 0) {
          ariaElements[0].click();
          return true;
        }

        return false;
      });

      if (alternativeIconFound) {
        console.log(`Successfully clicked icon in ${cardName} card using alternative approach`);
        await this.wait(1000); // Wait for click to take effect
        await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-icon-alternative-click.png`);
        return true;
      }

      // If no icon found and clickCardIfNoIcon is true, click the card itself
      if (clickCardIfNoIcon) {
        console.log(`No icon found in ${cardName} card, clicking the card itself`);
        return await this.clickCard(cardName);
      }

      console.log(`Could not find any icon in the ${cardName} card`);
      await this.takeScreenshot('icon-not-found.png');
      return false;
    } catch (error) {
      console.log(`Error clicking icon: ${error.message}`);
      await this.takeScreenshot('error-clicking-icon.png');
      return false;
    }
  }

  /**
   * Click directly on a card (useful when there are no buttons)
   * @param {string} cardName - The name of the card to click
   * @returns {Promise<boolean>} - True if clicked successfully, false otherwise
   */
  async clickCard(cardName) {
    console.log(`Looking for ${cardName} card to click directly...`);

    try {
      // Find the card first
      const card = await this.findCard(cardName);
      if (!card) {
        console.log(`Cannot click card because ${cardName} card was not found`);
        return false;
      }

      // Click the card
      await card.scrollIntoViewIfNeeded();
      await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-card-before-click.png`);

      await card.click({ force: true });
      console.log(`Successfully clicked the ${cardName} card`);
      await this.wait(1000); // Wait for click to take effect
      await this.takeScreenshot(`${cardName.toLowerCase().replace(/\s+/g, '-')}-card-after-click.png`);

      return true;
    } catch (error) {
      console.log(`Error clicking ${cardName} card: ${error.message}`);
      await this.takeScreenshot('error-clicking-card.png');
      return false;
    }
  }
}

module.exports = PortalPage;
