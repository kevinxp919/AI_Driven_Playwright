import { Page, Locator, expect } from 'playwright';
import { BasePage } from './base.page';

/**
 * Checkout Page Object
 * Extends BasePage following Page Object Model pattern
 */
export class CheckoutPage extends BasePage {
  // Page element locators - must validate before use
  private readonly _checkoutHeader: Locator = this.page.locator('.title');
  private readonly _checkoutForm: Locator = this.page.locator('#checkout_info');
  private readonly _firstNameInput: Locator = this.page.locator('#first-name');
  private readonly _lastNameInput: Locator = this.page.locator('#last-name');
  private readonly _zipCodeInput: Locator = this.page.locator('#postal-code');
  private readonly _continueButton: Locator = this.page.locator('#continue');
  private readonly _errorMessage: Locator = this.page.locator('[data-test="error"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Validate page load
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._checkoutHeader);
    await this.validateElementExists(this._firstNameInput);
    await this.validateElementExists(this._lastNameInput);
    await this.validateElementExists(this._zipCodeInput);
    await this.validateElementExists(this._continueButton);
  }

  /**
   * Enter checkout information
   */
  async enterCheckoutInfo(firstName: string, lastName: string, zipCode: string): Promise<void> {
    await this.validateElementReady(this._firstNameInput);
    await this._firstNameInput.fill(firstName);

    await this.validateElementReady(this._lastNameInput);
    await this._lastNameInput.fill(lastName);

    await this.validateElementReady(this._zipCodeInput);
    await this._zipCodeInput.fill(zipCode);
  }

  /**
   * Validate specific field is filled
   */
  async validateFieldFilled(locator: Locator, expectedValue: string): Promise<boolean> {
    await this.validateElementReady(locator);
    const value = await locator.inputValue();
    return value === expectedValue;
  }

  /**
   * Click continue button
   */
  async clickContinueButton(): Promise<void> {
    await this.validateElementReady(this._continueButton);
    await this._continueButton.click();
    await this.waitForLoadState();
  }

  /**
   * Validate error message
   */
  async validateErrorMessage(expectedError: string): Promise<boolean> {
    try {
      await this.validateElementExists(this._errorMessage);
      const errorText = await this._errorMessage.innerText();
      return errorText.includes(expectedError);
    } catch {
      return false;
    }
  }

  /**
   * Validate form validation failure
   */
  async validateFormValidation(): Promise<boolean> {
    await this.clickContinueButton();
    const hasError = await this._errorMessage.count() > 0;
    return hasError;
  }

  /**
   * Validate all fields are filled
   */
  async validateAllFieldsFilled(): Promise<boolean> {
    const firstNameFilled = await this.validateFieldFilled(this._firstNameInput, 'Standard');
    const lastNameFilled = await this.validateFieldFilled(this._lastNameInput, 'User');
    const zipCodeFilled = await this.validateFieldFilled(this._zipCodeInput, '12345');
    return firstNameFilled && lastNameFilled && zipCodeFilled;
  }

  /**
   * Validate form error message
   */
  async validateErrorMessageVisibility(): Promise<boolean> {
    try {
      await this.validateElementExists(this._errorMessage);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate page title
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    // Checkout page uses .title element for validation
    const titleElement = this.page.locator('.title');
    await this.validateElementExists(titleElement);
    const title = await titleElement.innerText();
    return title.includes(expectedTitle);
  }

  /**
   * Validate URL contains checkout
   */
  async validatePageURL(): Promise<boolean> {
    const url = await this.getCurrentURL();
    return url.includes('checkout');
  }

  // Getter methods (for testing)
  getCheckoutHeader(): Locator { return this._checkoutHeader; }
  getCheckoutForm(): Locator { return this._checkoutForm; }
  getFirstNameInput(): Locator { return this._firstNameInput; }
  getLastNameInput(): Locator { return this._lastNameInput; }
  getZipCodeInput(): Locator { return this._zipCodeInput; }
  getContinueButton(): Locator { return this._continueButton; }
  getBackButton(): Locator { return this.page.locator('[data-test="cancel"]'); }
  getErrorMessage(): Locator { return this._errorMessage; }
}