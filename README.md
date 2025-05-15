# Playwright MCP (Model Context Protocol) Server Test Automation

[![Demo Video](https://img.youtube.com/vi/5lWOUmS8qAc/maxresdefault.jpg)](https://youtu.be/5lWOUmS8qAc?si=Xkk8I3d7zcTduXeC)

## Demo Video

The video above provides a comprehensive demonstration of the test automation framework in action. It showcases the full testing process, including:
- Test initialization and setup
- Browser automation with Playwright
- Page Object Model implementation
- Test execution and validation
- Results reporting

Click on the thumbnail to watch the full demonstration.

## Prompt Used

The following prompt was used to generate the test automation framework:

```
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
```

This prompt guided the development of the test structure, page objects, and test scenarios implemented in this repository.

## Configuration to use Playwright Server

To use the Playwright MCP Server, add the following configuration to your VSCode `settings.json` file:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

This configuration enables the Model Context Protocol Server to work with Playwright, allowing for standardized communication between your test scripts and the browser automation.

## Overview

This repository contains automated end-to-end tests for the Ellucian Model Context Protocol Server using Playwright. The tests are designed to validate the functionality of various portal features, including login, navigation, and interaction with different cards and pages within the application. The MCP server provides a standardized interface for interacting with various educational management systems.

## Features

- **Page Object Model (POM)** architecture for maintainable and scalable test code
- **Cross-browser testing** capabilities using Playwright
- **Screenshot capture** for visual verification and debugging
- **Detailed logging** for test execution monitoring
- **Environment variable support** for flexible configuration
- **Robust error handling** with descriptive error messages

## Project Structure

```
├── .github/                  # GitHub-specific files
├── node_modules/             # Node.js dependencies
├── test/                     # Test-related files
│   ├── pages/                # Page Object Model classes
│   │   ├── BasePage.js       # Base class with common functionality
│   │   ├── DashboardPage.js  # Dashboard page interactions
│   │   ├── LoginPage.js      # Login page interactions
│   │   ├── PortalPage.js     # Portal page interactions
│   │   └── ...               # Other page objects
│   ├── tests/                # Test scripts
│   │   ├── ellucian-portal-login.spec.js
│   │   ├── ellucian-portal-features.spec.js
│   │   ├── ellucian-portal-opt-information.spec.js
│   │   └── ...               # Other test scripts
│   └── package.json          # Test-specific dependencies
├── package.json              # Project dependencies
├── package-lock.json         # Dependency lock file
└── playwright.config.js      # Playwright configuration
```

## Test Scenarios

The repository includes several test scenarios:

1. **Login Test**: Validates the ability to log in to the Ellucian Portal
2. **International Student Card Navigation**: Tests navigation to the International Student card
3. **Portal Features Access**: Tests accessing Portal Features through the settings menu
4. **OPT Information Navigation**: Tests navigation to OPT Information from the Portal Dashboard
5. **Event Signup Navigation**: Tests navigation to Event Signup functionality

## Page Objects

The tests use a Page Object Model pattern with the following key classes:

- **BasePage**: Contains common functionality for all pages
- **LoginPage**: Handles login form interactions
- **PortalPage**: Manages interactions with the main portal page and cards
- **DashboardPage**: Handles interactions with the dashboard page
- **InternationalStudentPage**: Manages interactions specific to the International Student page

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Playwright-mcp.git
   cd Playwright-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
url=https://experience-dev-devinternal.elluciancloud.com/ebuildcanadaglobal/
Username=vberg
Password=111111
```

Note: For production use, replace these values with appropriate credentials.

## Running Tests

### Run all tests:

```bash
npm test
```

### Run a specific test:

```bash
npx playwright test test/tests/ellucian-portal-login.spec.js
```

### Run tests with a specific browser:

```bash
npx playwright test --project=chromium
```

### Run tests in headed mode (with browser UI):

```bash
npx playwright test --headed
```

## Test Reports

After running tests, you can view the HTML report:

```bash
npx playwright show-report
```

## Screenshots

Screenshots are saved in the `screenshots` directory during test execution for debugging and verification purposes.

## Best Practices

When contributing to this project, follow these guidelines:

1. **Always use the Page Object Model pattern**
2. **Create separate page classes** for each distinct page or component
3. **Extend from BasePage** for all page objects to inherit common functionality
4. **Encapsulate selectors** within the page objects, never in the test files
5. **Implement action methods** in page objects (e.g., `login()`, `clickButton()`, etc.)
6. **Return new page objects** when navigation occurs between pages

## Troubleshooting

### Common Issues:

1. **Test timeouts**: Increase the timeout in the test file or in playwright.config.js
2. **Element not found**: Check if selectors have changed in the application
3. **Navigation issues**: Use the waitForNavigation methods provided in the page objects

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
