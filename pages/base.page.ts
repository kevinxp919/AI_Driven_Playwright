import { Page, Locator, expect } from 'playwright';

/**
 * Base Page Class - Base class for all page objects
 * Provides common page operations and validation methods
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to specified URL
   */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Validate element exists (must validate before use)
   */
  async validateElementExists(locator: Locator, timeout: number = 5000): Promise<void> {
    try {
      // Use native Playwright method to wait for element visibility
      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(`Element validation failed: ${locator.toString()} - ${error}`);
    }
  }

  /**
   * Wait for element to load
   */
  async waitForElement(locator: Locator, timeout: number = 5000): Promise<void> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(`Element load timeout: ${locator.toString()} - ${error}`);
    }
  }

  /**
   * Validate element is ready (interactive state)
   */
  async validateElementReady(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout: 5000 });
    await locator.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Validate element is visible
   */
  async validateElementVisible(locator: Locator, timeout: number = 5000): Promise<void> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(`Element visibility validation failed: ${locator.toString()} - ${error}`);
    }
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for page to fully load
   */
  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    await this.page.waitForLoadState(state);
  }
}
