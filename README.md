# AI-Driven Playwright Automation Framework

**Author:** Kevin Cai | **Email:** kevinxp919@gmail.com

An intelligent Playwright testing framework with **AI-powered self-healing** capabilities. When selectors break, the AI automatically discovers and fixes them.

## Features

- **AI-Powered Self-Healing** - Automatically fixes broken selectors when tests fail
- **MCP Integration** - Uses Model Context Protocol for intelligent DOM analysis
- **Multi-Browser Testing** - Chromium, Firefox, WebKit support
- **Embedded HTML Reports** - Built-in Playwright HTML reporter with traces

---

## 1. Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

Edit `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  baseURL: 'https://your-app.com',
  timeout: 30000,
  retries: 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['line'],
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## 2. Execute Tests

### Run All Tests (All Browsers)

```bash
npx playwright test
```

### Run Tests (Single Browser)

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Specific Test File

```bash
npx playwright test tests/login.spec.ts
```

### Run Tests in UI Mode

```bash
npx playwright test --ui
```

---

## 3. AI Self-Healing

When a test fails due to a broken selector, the AI automatically:

1. **Detects** the failure (element not found / timeout)
2. **Analyzes** the DOM using MCP browser snapshot (headless)
3. **Discovers** alternative selectors (CSS, XPath, data-testid, text)
4. **Selects** the most stable selector
5. **Updates** the page object automatically
6. **Retries** the test with the new selector

### Self-Healing Flow

```
Test Fails (Selector Timeout)
        │
        ▼
┌───────────────────┐
│ MCP browser_      │
│ snapshot (DOM)    │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ AI Analyzes       │
│ Available Elements│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ AI Selects Best   │
│ Alternative       │
│ Selector          │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Updates Page Obj  │
│ Retries Test     │
└───────────────────┘
```

### Healed Selector Logging

```
[AI Self-Healing] Detected: element "#old-button" not found
[AI Self-Healing] Analyzing DOM for alternatives...
[AI Self-Healing] Found 3 candidate selectors:
  - [data-testid="submit-btn"] (preferred)
  - button[type="submit"]
  - text("Submit")
[AI Self-Healing] Selected: [data-testid="submit-btn"]
[AI Self-Healing] Updated: pages/login.page.ts
[AI Self-Healing] Retrying test... ✓ PASSED
```

---

## 4. Debug

### View HTML Report

```bash
npx playwright show-report
```

The HTML report includes:
- Test results summary
- Failure details with screenshots
- Trace viewer links
- Self-healing action logs

### Debug with Trace Viewer

Failed tests save traces automatically. View traces:

```bash
npx playwright show-trace test-results/<trace-id>
```

### Debug in Browser

```bash
npx playwright test --project=chromium --debug
```

### Check Browser Console

```bash
npx playwright test --project=chromium 2>&1 | grep -i console
```

---

## 5. CI/CD

GitHub Actions workflow is in `.github/workflows/playwright.yml`.

### What Gets Uploaded

- `playwright-report/` - HTML report (downloadable from Actions tab)
- `test-results/` - Trace files for debugging

### Viewing CI Reports

1. Go to **Actions** tab in your GitHub repo
2. Select the workflow run
3. Download **playwright-report** artifact
4. Open `index.html` locally

---

## Project Structure

```
.
├── pages/              # Page Object Models
│   ├── base.page.ts   # Base class with common methods
│   ├── login.page.ts
│   └── ...
├── tests/              # Test specifications
│   └── *.spec.ts
├── utils/              # Utility functions
├── playwright.config.ts
└── package.json
```

---

## Page Objects

Extend `BasePage` for consistent page objects:

```typescript
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  async login(username: string, password: string) {
    await this.fill('[data-testid="username"]', username);
    await this.fill('[data-testid="password"]', password);
    await this.click('[data-testid="login-button"]');
  }
}
```

---

## Best Practices

1. **Use `data-testid`** attributes for stable selectors
2. **Enable trace** on first retry: `trace: 'on-first-retry'`
3. **Self-healing** runs automatically on selector failures
4. **HTML report** is best for human review
5. **Traces** are best for deep debugging

---

## Tips

- Tests run in parallel by default
- Set `retries: 2` in CI for flaky tests
- Use `baseURL` in config for easy environment switching
