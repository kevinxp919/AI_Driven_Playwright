/**
 * Element Utilities - Reusable element interaction helpers
 */
import { Page, Locator, expect } from 'playwright';

export class ElementUtils {
  constructor(private page: Page) {}

  /**
   * Smart wait for element with multiple strategies
   */
  async waitForElement(locator: Locator, options?: { timeout?: number; state?: 'visible' | 'attached' | 'hidden' | 'detached' }): Promise<void> {
    const timeout = options?.timeout ?? 5000;
    const state = options?.state ?? 'visible';
    await locator.waitFor({ state, timeout });
  }

  /**
   * Click element with retry logic
   */
  async clickWithRetry(locator: Locator, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await locator.click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * Fill input with clear first
   */
  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Select dropdown option by label
   */
  async selectByLabel(locator: Locator, label: string): Promise<void> {
    await locator.selectOption({ label });
  }

  /**
   * Select dropdown option by value
   */
  async selectByValue(locator: Locator, value: string): Promise<void> {
    await locator.selectOption({ value });
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get element attribute
   */
  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return locator.getAttribute(attribute);
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  /**
   * Get text content
   */
  async getText(locator: Locator): Promise<string> {
    return locator.innerText();
  }

  /**
   * Count elements
   */
  async count(locator: Locator): Promise<number> {
    return locator.count();
  }
}
