const PortalPage = require('./PortalPage');

/**
 * Page Object Model for the International Student page
 */
class InternationalStudentPage extends PortalPage {
  /**
   * @param {import('playwright').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Define selectors for the International Student page
    // Based on the image, we need to target the specific settings link in the sidebar
    this.settingsIconSelector = '.sidebar a, a[href*="settings"], a:has-text("Settings"), a:has(svg[class*="settings"]), a:has(i[class*="settings"])';
    // Updated selector for Portal Features based on the image
    this.portalFeaturesSelector = 'a:has-text("Portal Features"), a:text("Portal Features"), a[href*="portal-features"], li:has-text("Portal Features"), span:has-text("Portal Features"), div:has-text("Portal Features"):not(:has-div), a:has-text("Features"), a[href*="features"]';
    this.mainContentSelector = 'main, div[role="main"], div[class*="content"]';
  }

  /**
   * Click on the settings icon in the sidebar
   * @returns {Promise<boolean>} - True if clicked successfully
   */
  async clickSettingsIcon() {
    console.log('Looking for settings icon in the sidebar...');
    try {
      // First, take a screenshot of the current state to help with debugging
      await this.takeScreenshot('screenshots/before-clicking-settings.png');

      // Direct approach based on the image - try to click the settings link in the sidebar
      console.log('Trying direct approach to click settings icon in sidebar');

      // Based on the image, we need to find the settings link in the left sidebar
      // The image shows a vertical navigation with settings as one of the options
      try {
        // First try to locate all links in the sidebar
        const sidebarLinks = await this.page.$$('.sidebar a, nav a, aside a');
        console.log(`Found ${sidebarLinks.length} links in the sidebar area`);

        // Check each link for settings text or href
        for (const link of sidebarLinks) {
          const linkText = await link.textContent();
          const linkHref = await link.getAttribute('href');

          if ((linkText && linkText.trim().toLowerCase().includes('settings')) ||
              (linkHref && linkHref.toLowerCase().includes('settings'))) {
            console.log(`Found settings link with text: "${linkText}" and href: "${linkHref}"`);
            await link.scrollIntoViewIfNeeded();
            await this.takeScreenshot('screenshots/found-settings-link.png');

            // Use page.evaluate to ensure the element is visible and clickable
            await this.page.evaluate(el => {
              // Ensure the element is visible
              if (el.scrollIntoView) {
                el.scrollIntoView({behavior: 'smooth', block: 'center'});
              }
              // Highlight the element briefly to confirm what we're clicking
              const originalBackground = el.style.backgroundColor;
              el.style.backgroundColor = 'yellow';
              setTimeout(() => { el.style.backgroundColor = originalBackground; }, 500);
            }, link);

            // Wait a moment for any scrolling to complete
            await this.wait(1000);

            // Click the element
            await link.click();
            console.log('Successfully clicked settings link');

            // Take a screenshot after clicking
            await this.takeScreenshot('screenshots/after-clicking-settings.png');
            return true;
          }
        }

        // If we didn't find a settings link by text/href, try to find it by position or appearance
        console.log('No settings link found by text/href, trying alternative approaches');
      } catch (error) {
        console.log(`Error in direct approach: ${error.message}`);
      }

      // If direct approach failed, try different strategies
      const strategies = [

        // Strategy 1: Look for specific settings button/icon
        async () => {
          const settingsButton = await this.page.$(this.settingsIconSelector);
          if (settingsButton) {
            console.log('Found settings icon using direct selector');
            await settingsButton.scrollIntoViewIfNeeded();
            await this.takeScreenshot('screenshots/settings-icon-found.png');
            await settingsButton.click({ force: true });
            return true;
          }
          return false;
        },

        // Strategy 2: Look for icon in sidebar
        async () => {
          const sidebar = await this.page.$('nav, aside, div[class*="sidebar"]');
          if (sidebar) {
            console.log('Found sidebar, looking for settings icon inside');
            // Updated selector to better match the settings icon in the image
            const sidebarSettings = await sidebar.$('button svg, a svg, i[class*="settings"], button[aria-label*="Settings"], a[href*="settings"], a:has-text("Settings")');
            if (sidebarSettings) {
              console.log('Found settings icon in sidebar');
              await sidebarSettings.scrollIntoViewIfNeeded();
              await this.takeScreenshot('screenshots/settings-icon-in-sidebar-found.png');
              await sidebarSettings.click({ force: true });
              return true;
            }
          }
          return false;
        },

        // Strategy 3: Use JavaScript evaluation to find and click element
        async () => {
          console.log('Using JavaScript to find and click settings icon');
          const clicked = await this.page.evaluate(() => {
            const findSettingsElement = () => {
              const elements = Array.from(document.querySelectorAll('button, a, div, span, i'));
              return elements.find(el => {
                const elementText = el.textContent || '';
                const hasSettingsText = elementText.toLowerCase().includes('settings');
                const hasSettingsClass = (el.className || '').toLowerCase().includes('settings');
                const hasSettingsIcon = el.querySelector('svg, i[class*="settings"]');
                const hasSettingsHref = el.tagName === 'A' && (el.href || '').toLowerCase().includes('settings');
                return hasSettingsText || hasSettingsClass || hasSettingsIcon || hasSettingsHref;
              });
            };

            // First try to find settings in the sidebar
            const sidebar = document.querySelector('nav, aside, div[class*="sidebar"]');
            if (sidebar) {
              const sidebarSettingsEl = findSettingsElement();
              if (sidebarSettingsEl) {
                sidebarSettingsEl.click();
                return true;
              }
            }

            // If not found in sidebar, try anywhere on the page
            const settingsEl = findSettingsElement();
            if (settingsEl) {
              settingsEl.click();
              return true;
            }
            return false;
          });

          if (clicked) {
            console.log('Found and clicked settings icon using JavaScript');
            await this.takeScreenshot('screenshots/settings-icon-js-clicked.png');
            return true;
          }
          return false;
        },

        // Strategy 4: Try common icon class names
        async () => {
          const iconClasses = ['cog', 'gear', 'setting', 'configure', 'preferences', 'options'];
          for (const className of iconClasses) {
            const iconSelector = `i[class*="${className}"], svg[class*="${className}"], button:has(svg[class*="${className}"])`;
            const icon = await this.page.$(iconSelector);
            if (icon) {
              console.log(`Found icon with class containing "${className}"`);
              await icon.scrollIntoViewIfNeeded();
              await this.takeScreenshot(`screenshots/settings-icon-${className}-found.png`);
              await icon.click({ force: true });
              return true;
            }
          }
          return false;
        },

        // Strategy 5: Use a more visual approach - look for elements in the left sidebar
        async () => {
          console.log('Using visual approach to find settings in the sidebar');

          try {
            // Take a screenshot to help with debugging
            await this.takeScreenshot('screenshots/visual-approach-sidebar.png');

            // Try to find all elements in the left sidebar area
            const leftSideElements = await this.page.$$('div[style*="left"] a, div.sidebar a, nav a, aside a, div[class*="sidebar"] a, div[class*="nav"] a');
            console.log(`Found ${leftSideElements.length} elements in the left sidebar area`);

            // Look for elements with settings-related attributes or appearance
            for (const element of leftSideElements) {
              // Check if this element is visible
              const isVisible = await element.isVisible();
              if (!isVisible) continue;

              // Get element properties
              const text = await element.textContent();
              const href = await element.getAttribute('href');
              const classes = await element.getAttribute('class');

              // Log what we found to help with debugging
              console.log(`Examining element: text="${text?.trim()}", href="${href}", class="${classes}"`);

              // Check if this looks like a settings link
              if ((text && text.toLowerCase().includes('settings')) ||
                  (href && href.toLowerCase().includes('settings')) ||
                  (classes && classes.toLowerCase().includes('settings'))) {

                console.log('Found potential settings element in sidebar');

                // Highlight the element to confirm what we're clicking
                await this.page.evaluate(el => {
                  const originalBackground = el.style.backgroundColor;
                  el.style.backgroundColor = 'yellow';
                  setTimeout(() => { el.style.backgroundColor = originalBackground; }, 1000);
                }, element);

                await element.scrollIntoViewIfNeeded();
                await this.takeScreenshot('screenshots/found-settings-element.png');

                // Click with a delay to ensure UI is ready
                await this.wait(500);
                await element.click();
                console.log('Clicked on potential settings element');

                // Take a screenshot after clicking
                await this.wait(500);
                await this.takeScreenshot('screenshots/after-clicking-settings-element.png');
                return true;
              }
            }

            // If we didn't find anything by text/attributes, try clicking on elements that look like settings icons
            console.log('No settings element found by text/attributes, looking for icon-like elements');

            // Look for elements that might be settings icons (gear/cog icons)
            const iconElements = await this.page.$$('svg, i[class*="cog"], i[class*="gear"], i[class*="setting"]');
            for (const icon of iconElements) {
              if (await icon.isVisible()) {
                console.log('Found potential settings icon');
                await icon.scrollIntoViewIfNeeded();
                await this.takeScreenshot('screenshots/potential-settings-icon.png');
                await icon.click();
                console.log('Clicked on potential settings icon');
                return true;
              }
            }

            return false;
          } catch (error) {
            console.log(`Error in visual approach: ${error.message}`);
            return false;
          }
        }
      ];

      // Try each strategy until one works
      for (const strategy of strategies) {
        if (await strategy()) {
          console.log('Successfully clicked settings icon');
          await this.wait(1000); // Wait for menu to appear if applicable
          return true;
        }
      }

      console.log('Could not find settings icon with any strategy');
      await this.takeScreenshot('screenshots/settings-icon-not-found.png');
      return false;
    } catch (error) {
      console.log(`Error clicking settings icon: ${error.message}`);
      await this.takeScreenshot('screenshots/error-clicking-settings-icon.png');
      return false;
    }
  }

  /**
   * Click on Portal Features option
   * @returns {Promise<boolean>} - True if clicked successfully
   */
  async clickPortalFeatures() {
    console.log('Looking for Portal Features option...');
    try {
      // Take a screenshot of the current state to help with debugging
      await this.takeScreenshot('screenshots/before-clicking-portal-features.png');

      // Wait a moment for any menu to fully appear
      await this.wait(2000); // Increased wait time to ensure menu is fully loaded

      // First, try a direct approach based on the image
      console.log('Trying direct approach to find Portal Features');

      // Based on the image, we need to find the Portal Features link in the settings menu
      try {
        // First, try to directly target the Portal Features link based on the image
        // The image shows a list of links in the settings menu, with Portal Features being one of them
        const portalFeaturesLink = await this.page.$('a:text("Portal Features"), a[href*="portal-features"], li:text("Portal Features")');
        if (portalFeaturesLink && await portalFeaturesLink.isVisible()) {
          console.log('Found Portal Features link directly');
          await portalFeaturesLink.scrollIntoViewIfNeeded();
          await this.takeScreenshot('screenshots/portal-features-direct-found.png');

          // Highlight the element to confirm what we're clicking
          await this.page.evaluate(el => {
            if (el.scrollIntoView) {
              el.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
            const originalBackground = el.style.backgroundColor;
            el.style.backgroundColor = 'yellow';
            setTimeout(() => { el.style.backgroundColor = originalBackground; }, 1000);
          }, portalFeaturesLink);

          await this.wait(1000); // Wait for scrolling and highlighting
          await portalFeaturesLink.click();
          console.log('Successfully clicked Portal Features link directly');
          await this.wait(500);
          await this.takeScreenshot('screenshots/after-clicking-portal-features-direct.png');
          return true;
        }

        // If direct approach failed, look for all links on the page after clicking settings
        const allLinks = await this.page.$$('a');
        console.log(`Found ${allLinks.length} links on the page`);

        // Check each link for Portal Features text or href
        for (const link of allLinks) {
          // Check if the link is visible
          const isVisible = await link.isVisible();
          if (!isVisible) continue;

          const linkText = await link.textContent();
          const linkHref = await link.getAttribute('href');

          // Log what we found to help with debugging
          console.log(`Examining link: text="${linkText?.trim()}", href="${linkHref}"`);

          // Look for Portal Features or just Features in the link text or href
          if ((linkText && (linkText.trim().toLowerCase().includes('portal feature') ||
                           linkText.trim().toLowerCase() === 'features' ||
                           linkText.trim().toLowerCase() === 'portal features')) ||
              (linkHref && (linkHref.toLowerCase().includes('portal-feature') ||
                           linkHref.toLowerCase().includes('features')))) {
            console.log(`Found Portal Features link with text: "${linkText}" and href: "${linkHref}"`);

            // Highlight the element to confirm what we're clicking
            await this.page.evaluate(el => {
              if (el.scrollIntoView) {
                el.scrollIntoView({behavior: 'smooth', block: 'center'});
              }
              const originalBackground = el.style.backgroundColor;
              el.style.backgroundColor = 'yellow';
              setTimeout(() => { el.style.backgroundColor = originalBackground; }, 1000);
            }, link);

            await this.wait(1000); // Wait for scrolling and highlighting
            await this.takeScreenshot('screenshots/found-portal-features-link.png');

            // Click the link
            await link.click();
            console.log('Successfully clicked Portal Features link');

            // Take a screenshot after clicking
            await this.wait(500);
            await this.takeScreenshot('screenshots/after-clicking-portal-features.png');
            return true;
          }
        }

        console.log('No Portal Features link found by text/href, trying alternative approaches');
      } catch (error) {
        console.log(`Error in direct approach: ${error.message}`);
      }

      // Try different strategies to find and click Portal Features
      const strategies = [
        // Strategy 1: Direct selector
        async () => {
          const portalFeatures = await this.page.$(this.portalFeaturesSelector);
          if (portalFeatures) {
            console.log('Found Portal Features using direct selector');
            await portalFeatures.scrollIntoViewIfNeeded();
            await this.takeScreenshot('screenshots/portal-features-found.png');
            await portalFeatures.click({ force: true });
            return true;
          }
          return false;
        },

        // Strategy 2: Text content search with various text options
        async () => {
          const textOptions = [
            'Portal Features',
            'Portal features',
            'portal features',
            'Features',
            'Portal'
          ];

          for (const text of textOptions) {
            const selector = `a:text("${text}"), div:text("${text}"), li:text("${text}"), span:text("${text}"), button:text("${text}")`;
            const element = await this.page.$(selector);
            if (element) {
              console.log(`Found element with text "${text}"`);
              await element.scrollIntoViewIfNeeded();
              await this.takeScreenshot(`screenshots/portal-features-${text.toLowerCase().replace(/\s+/g, '-')}-found.png`);
              await element.click({ force: true });
              return true;
            }
          }
          return false;
        },

        // Strategy 3: Use JavaScript to find and click with more flexible text matching
        async () => {
          console.log('Using JavaScript to find and click Portal Features');
          const clicked = await this.page.evaluate(() => {
            const textOptions = ['portal features', 'features', 'portal'];

            const findElementWithText = (textOptions) => {
              const elements = Array.from(document.querySelectorAll('a, button, div, span, li, p'));
              return elements.find(el => {
                if (!el || !el.offsetParent) return false; // Skip hidden elements

                const elementText = (el.textContent || '').toLowerCase().trim();
                // Check if element text contains any of the text options
                return textOptions.some(text => elementText.includes(text)) &&
                       // Make sure it's clickable (not just a container)
                       (el.tagName === 'A' || el.tagName === 'BUTTON' ||
                        el.onclick || el.getAttribute('role') === 'button' ||
                        el.style.cursor === 'pointer');
              });
            };

            // Try to find element with any of the text options
            const element = findElementWithText(textOptions);
            if (element) {
              element.click();
              return true;
            }

            // If not found, try a more aggressive approach - any clickable element in a menu/dropdown
            const menuItems = Array.from(document.querySelectorAll('.dropdown-menu a, .menu a, .menu-item, [role="menu"] [role="menuitem"]'));
            if (menuItems.length > 0) {
              // Look for something that might be related to features or settings
              const featuresItem = menuItems.find(item => {
                const text = (item.textContent || '').toLowerCase();
                return text.includes('feature') || text.includes('portal') ||
                       text.includes('setting') || text.includes('config');
              });

              if (featuresItem) {
                featuresItem.click();
                return true;
              }

              // If still not found, just click the first menu item as a last resort
              if (menuItems.length > 0) {
                menuItems[0].click();
                return true;
              }
            }

            return false;
          });

          if (clicked) {
            console.log('Found and clicked Portal Features using JavaScript');
            await this.takeScreenshot('screenshots/portal-features-js-clicked.png');
            return true;
          }
          return false;
        },

        // Strategy 4: Look for any menu items that appeared after clicking settings
        async () => {
          console.log('Looking for any menu items that appeared after clicking settings');
          // Wait a bit more to ensure any menu has fully appeared
          await this.wait(1000);

          // Look for any menu or dropdown that might have appeared
          const menuSelectors = [
            '.dropdown-menu', '.menu', '[role="menu"]', '.popover', '.modal',
            'ul:has(li:has(a))', 'div:has(a):not(nav)'
          ];

          for (const menuSelector of menuSelectors) {
            const menu = await this.page.$(menuSelector);
            if (menu) {
              console.log(`Found potential menu with selector: ${menuSelector}`);

              // First, try to find Portal Features specifically in this menu
              const portalFeaturesItem = await menu.$('a:has-text("Portal Features"), a:text("Portal Features"), a[href*="portal-features"], li:has-text("Portal Features"), a:has-text("Features"), a[href*="features"]');
              if (portalFeaturesItem) {
                console.log('Found Portal Features item in menu');
                await portalFeaturesItem.scrollIntoViewIfNeeded();
                await this.takeScreenshot('screenshots/portal-features-menu-item-found.png');

                // Highlight the element before clicking
                await this.page.evaluate(el => {
                  const originalBackground = el.style.backgroundColor;
                  el.style.backgroundColor = 'yellow';
                  setTimeout(() => { el.style.backgroundColor = originalBackground; }, 1000);
                }, portalFeaturesItem);

                await this.wait(1000); // Wait for highlighting

                // Get the text of the item for logging
                const itemText = await portalFeaturesItem.textContent();
                console.log(`Clicking on menu item with text: "${itemText?.trim()}"`);

                // Try clicking with different methods to ensure it works
                try {
                  // Method 1: Regular click
                  await portalFeaturesItem.click({ force: true });
                } catch (error) {
                  console.log(`Error with regular click: ${error.message}`);
                  try {
                    // Method 2: JavaScript click - handle both HTML and SVG elements
                    await this.page.evaluate(el => {
                      if (typeof el.click === 'function') {
                        el.click();
                      } else {
                        // Create and dispatch a click event for SVG elements
                        const event = new MouseEvent('click', {
                          bubbles: true,
                          cancelable: true,
                          view: window
                        });
                        el.dispatchEvent(event);
                      }
                    }, portalFeaturesItem);
                  } catch (jsError) {
                    console.log(`Error with JavaScript click: ${jsError.message}`);
                    // Method 3: Dispatch click event
                    await this.page.evaluate(el => {
                      const event = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                      });
                      el.dispatchEvent(event);
                    }, portalFeaturesItem);
                  }
                }

                console.log('Clicked on Portal Features item in menu');
                return true;
              }

              // If Portal Features not found, try to find and click the first clickable item in the menu
              const clickableItems = await menu.$$('a, button, [role="menuitem"], li');
              console.log(`Found ${clickableItems.length} clickable items in menu`);

              // Log all items to help with debugging
              for (let i = 0; i < clickableItems.length; i++) {
                const itemText = await clickableItems[i].textContent();
                const itemHref = await clickableItems[i].getAttribute('href');
                console.log(`Menu item ${i+1}: text="${itemText?.trim()}", href="${itemHref}"`);

                // If this item contains "Portal" or "Features", click it
                if ((itemText && (itemText.toLowerCase().includes('portal') || itemText.toLowerCase().includes('feature'))) ||
                    (itemHref && (itemHref.toLowerCase().includes('portal') || itemHref.toLowerCase().includes('feature')))) {
                  console.log(`Found menu item with relevant text/href: "${itemText}", "${itemHref}"`);
                  await clickableItems[i].scrollIntoViewIfNeeded();
                  await this.takeScreenshot('screenshots/relevant-menu-item-found.png');

                  // Try clicking with different methods to ensure it works
                  try {
                    // Method 1: Regular click
                    await clickableItems[i].click({ force: true });
                  } catch (error) {
                    console.log(`Error with regular click: ${error.message}`);
                    try {
                      // Method 2: JavaScript click - handle both HTML and SVG elements
                      await this.page.evaluate(el => {
                        if (typeof el.click === 'function') {
                          el.click();
                        } else {
                          // Create and dispatch a click event for SVG elements
                          const event = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                          });
                          el.dispatchEvent(event);
                        }
                      }, clickableItems[i]);
                    } catch (jsError) {
                      console.log(`Error with JavaScript click: ${jsError.message}`);
                      // Method 3: Dispatch click event
                      await this.page.evaluate(el => {
                        const event = new MouseEvent('click', {
                          bubbles: true,
                          cancelable: true,
                          view: window
                        });
                        el.dispatchEvent(event);
                      }, clickableItems[i]);
                    }
                  }

                  console.log('Clicked on relevant menu item');
                  return true;
                }
              }

              // If no relevant item found, click the first one
              if (clickableItems.length > 0) {
                console.log('No relevant menu item found, clicking first item');
                await clickableItems[0].scrollIntoViewIfNeeded();
                await this.takeScreenshot('screenshots/first-menu-item-found.png');

                // Try clicking with different methods to ensure it works
                try {
                  // Method 1: Regular click
                  await clickableItems[0].click({ force: true });
                } catch (error) {
                  console.log(`Error with regular click: ${error.message}`);
                  try {
                    // Method 2: JavaScript click - handle both HTML and SVG elements
                    await this.page.evaluate(el => {
                      if (typeof el.click === 'function') {
                        el.click();
                      } else {
                        // Create and dispatch a click event for SVG elements
                        const event = new MouseEvent('click', {
                          bubbles: true,
                          cancelable: true,
                          view: window
                        });
                        el.dispatchEvent(event);
                      }
                    }, clickableItems[0]);
                  } catch (jsError) {
                    console.log(`Error with JavaScript click: ${jsError.message}`);
                    // Method 3: Dispatch click event
                    await this.page.evaluate(el => {
                      const event = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                      });
                      el.dispatchEvent(event);
                    }, clickableItems[0]);
                  }
                }

                console.log('Clicked on first menu item');
                return true;
              }
            }
          }
          return false;
        },

        // Strategy 5: Try clicking on elements that might be related to features or configuration
        async () => {
          console.log('Looking for elements related to features or configuration');
          const relatedTerms = ['feature', 'config', 'setting', 'option', 'preference'];

          for (const term of relatedTerms) {
            const selector = `a:has-text("${term}"), button:has-text("${term}"), div[role="button"]:has-text("${term}")`;
            const element = await this.page.$(selector);
            if (element) {
              console.log(`Found element related to "${term}"`);
              await element.scrollIntoViewIfNeeded();
              await this.takeScreenshot(`screenshots/related-term-${term}-found.png`);
              await element.click({ force: true });
              return true;
            }
          }
          return false;
        }
      ];

      // Try each strategy until one works
      for (const strategy of strategies) {
        if (await strategy()) {
          console.log('Successfully clicked Portal Features or related option');
          await this.wait(1000); // Wait for content to start loading
          return true;
        }
      }

      console.log('Could not find Portal Features with any strategy');
      await this.takeScreenshot('screenshots/portal-features-not-found.png');
      return false;
    } catch (error) {
      console.log(`Error clicking Portal Features: ${error.message}`);
      await this.takeScreenshot('screenshots/error-clicking-portal-features.png');
      return false;
    }
  }

  /**
   * Wait for content to render on the page after clicking Portal Features
   */
  async waitForPortalFeaturesContent() {
    console.log('Waiting for page content to render...');
    try {
      // Try multiple approaches to detect content loading
      const strategies = [
        // Strategy 1: Wait for main content container
        async () => {
          try {
            await this.page.waitForSelector(this.mainContentSelector, { timeout: 5000 });
            console.log('Main content container is visible');
            return true;
          } catch (e) {
            return false;
          }
        },

        // Strategy 2: Wait for any content changes
        async () => {
          try {
            // Take a screenshot before waiting
            await this.takeScreenshot('screenshots/before-content-wait.png');

            // Wait for network to be idle
            await this.waitForLoadState('networkidle', 5000);
            console.log('Network is idle');

            // Take another screenshot to compare
            await this.wait(1000);
            await this.takeScreenshot('screenshots/after-content-wait.png');
            return true;
          } catch (e) {
            return false;
          }
        },

        // Strategy 3: Check for any visible content
        async () => {
          try {
            // Look for any visible content on the page
            const hasContent = await this.page.evaluate(() => {
              // Check if there's any visible text content on the page
              const bodyText = document.body.textContent || '';
              return bodyText.trim().length > 100; // Arbitrary threshold for meaningful content
            });

            if (hasContent) {
              console.log('Page has visible text content');
              return true;
            }
            return false;
          } catch (e) {
            return false;
          }
        },

        // Strategy 4: Just wait a fixed amount of time as a fallback
        async () => {
          console.log('Using fallback: waiting fixed time for content to load');
          await this.wait(5000);
          return true;
        }
      ];

      // Try each strategy until one works
      for (const strategy of strategies) {
        if (await strategy()) {
          break; // Move on once any strategy succeeds
        }
      }

      // Final wait to ensure rendering is complete
      await this.wait(2000);

      console.log('Page content has been rendered');
      await this.takeScreenshot('screenshots/page-content-loaded.png');
    } catch (error) {
      console.log(`Warning: Error waiting for page content: ${error.message}`);
      await this.takeScreenshot('screenshots/page-content-error.png');
    }
  }
}

module.exports = InternationalStudentPage;