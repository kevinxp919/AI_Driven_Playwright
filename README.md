# AI-Driven Playwright Automation Framework

An intelligent Playwright testing framework with MCP-powered self-healing capabilities.

## Features

- **AI-Powered Test Generation** - Generate tests using MCP tools with page object reuse patterns
- **Self-Healing** - Automatically修复破碎的选择器 when tests fail
- **Multi-Browser Testing** - Chromium, Firefox, WebKit support
- **Embedded Reports** - Playwright's built-in HTML, JSON, JUnit reporters

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

Edit `playwright.config.ts` to customize:

```typescript
export default defineConfig({
  testDir: './tests',        // Test files location
  baseURL: 'https://your-app.com',
  timeout: 30000,           // Test timeout
  retries: 0,               // Retry on CI
  workers: undefined,       // Parallel workers
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

### Run Tests with Tags

```bash
npx playwright test --grep="@smoke"
```

### Run Tests in UI Mode

```bash
npx playwright test --ui
```

---

## 3. Debug

### Debug in Browser

```bash
npx playwright test --project=chromium --debug
```

### Debug with Trace Viewer

Failed tests automatically save traces. View them:

```bash
npx playwright show-trace test-results/<trace-id>
```

### Debug Specific Test

```typescript
test('debug me', async ({ page }) => {
  await page.goto('/');
  // Add debug points
  await page.pause();  // Pause for inspection
});
```

### Check Selectors

```bash
# Open Playwright Inspector
npx playwright inspect
```

### View Console Logs

```bash
# Capture browser console output
npx playwright test --project=chromium 2>&1 | grep -i console
```

---

## 4. Self-Healing

When a selector fails, the framework automatically:

1. **Detects** the failure (element not found / timeout)
2. **Analyzes** the DOM using MCP browser snapshot
3. **Generates** a new stable selector
4. **Updates** the page object and retries
5. **Documents** the healing action

### Manual Self-Healing

If you encounter a broken selector:

```bash
# Use MCP to analyze and heal
# 1. Navigate to the page
# 2. Get browser snapshot
# 3. Identify new selector
# 4. Update the page object
```

### Healed Selector Logging

Healed selectors are logged in test output:

```
[Self-Healing] Selector updated: .old-button → [data-testid="submit-btn"]
[Self-Healing] Test passed after healing
```

---

## 5. Generate Reports

Playwright embeds multiple reporters for different outputs.

### HTML Report (Recommended)

```bash
# Generate and open HTML report
npx playwright show-report
```

The HTML report includes:
- Test results summary
- Failure details with screenshots
- Trace viewer links
- Retry information

### JSON Report

```bash
# JSON output (configured in playwright.config.ts)
npx playwright test --reporter=json
```

Output: `playwright-report/test-results.json`

### JUnit XML Report

```bash
# JUnit XML for CI integration
npx playwright test --reporter=junit
```

Output: `playwright-report/junit-results.xml`

### Merge Reports (CI)

```bash
# Merge blob reports from parallel workers
npx playwright merge-reports playwright-report/
```

### GitHub Actions Integration

Reports are automatically posted to GitHub PR comments when using `@playwright/test` reporter.

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

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: npx playwright test

- name: Upload Report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

---

## Tips

- **Use `data-testid`** attributes for stable selectors
- **Enable trace** on first retry for debugging (`trace: 'on-first-retry'`)
- **Self-healing** runs automatically on selector failures
- **HTML report** is the best for human review
