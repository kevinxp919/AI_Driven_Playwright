import { Page, Locator } from 'playwright';
import { BasePage } from './base.page';

/**
 * Checkout Confirmation Page Object
 * Extends BasePage following Page Object Model pattern
 */
export class CheckoutConfirmationPage extends BasePage {
  // Page element locators - must validate before use
  private readonly _confirmationHeader: Locator = this.page.locator('.complete-header');
  private readonly _continueButton: Locator = this.page.locator('[data-test="back-to-products"]');
  private readonly _confirmationMessage: Locator = this.page.locator('.complete-header');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Validate page load
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._confirmationHeader);
    await this.validateElementExists(this._continueButton);
    await this.validateElementExists(this._confirmationMessage);
  }

  /**
   * Validate order success message
   */
  async validateOrderSuccess(): Promise<boolean> {
    await this.validateElementExists(this._confirmationHeader, 5000);
    const headerText = await this._confirmationHeader.innerText();
    return headerText.includes('Thank you');
  }

  /**
   * Validate specific text appears on page
   */
  async validateTextOnPage(expectedText: string): Promise<boolean> {
    const locator = this.page.locator(`text="${expectedText}"`);
    await this.validateElementExists(locator);
    return true;
  }

  /**
   * Click continue shopping button
   */
  async clickContinueShopping(): Promise<void> {
    await this.validateElementReady(this._continueButton);
    await this._continueButton.click();
    await this.waitForLoadState();
  }

  /**
   * Validate confirmation message is visible
   */
  async validateConfirmationMessageVisible(): Promise<boolean> {
    await this.validateElementVisible(this._confirmationMessage);
    return true;
  }

  /**
   * Validate page title
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    const title = await this.getPageTitle();
    return title.includes('Swag Labs');
  }

  /**
   * Validate URL contains checkout
   */
  async validatePageURL(): Promise<boolean> {
    const url = await this.getCurrentURL();
    return url.includes('checkout');
  }

  // Getter methods (for testing)
  getConfirmationHeader(): Locator { return this._confirmationHeader; }
  getContinueButton(): Locator { return this._continueButton; }
  getConfirmationMessage(): Locator { return this._confirmationMessage; }
}