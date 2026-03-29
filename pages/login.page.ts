import { Page, Locator, expect } from 'playwright';
import { BasePage } from './base.page';

/**
 * Login Page Object
 * Extends BasePage following Page Object Model pattern
 */
export class LoginPage extends BasePage {
  // Page element locators - must validate before use
  private readonly _usernameInput: Locator = this.page.locator('#user-name');
  private readonly _passwordInput: Locator = this.page.locator('#password');
  private readonly _loginButton: Locator = this.page.locator('#login-button');
  private readonly _errorMessage: Locator = this.page.locator('[data-test="error"]');
  private readonly _inventoryList: Locator = this.page.locator('.inventory_list');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Validate page elements are loaded
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._usernameInput);
    await this.validateElementExists(this._passwordInput);
    await this.validateElementExists(this._loginButton);
  }

  /**
   * Input username
   */
  async inputUsername(username: string): Promise<void> {
    await this.validateElementReady(this._usernameInput);
    await this._usernameInput.fill(username);
    await this.validateElementExists(this._usernameInput);
  }

  /**
   * Input password
   */
  async inputPassword(password: string): Promise<void> {
    await this.validateElementReady(this._passwordInput);
    await this._passwordInput.fill(password);
    await this.validateElementExists(this._passwordInput);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    await this.validateElementReady(this._loginButton);
    await this._loginButton.click();
  }

  /**
   * Perform login operation
   */
  async login(username: string, password: string): Promise<void> {
    await this.inputUsername(username);
    await this.inputPassword(password);
    await this.clickLoginButton();
    await this.waitForLoadState();
  }

  /**
   * Verify login success shows inventory list
   */
  async verifyLoginSuccess(): Promise<boolean> {
    await this.validateElementExists(this._inventoryList, 10000);
    return true;
  }

  /**
   * Verify login failure error message
   */
  async verifyLoginFailure(expectedError: string): Promise<boolean> {
    await this.validateElementExists(this._errorMessage, 5000);
    const errorText = await this._errorMessage.innerText();
    return errorText.includes(expectedError);
  }

  /**
   * Validate page title
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    const title = await this.getPageTitle();
    return title.includes(expectedTitle);
  }

  /**
   * Get username input locator (for testing)
   */
  getUsernameInput(): Locator {
    return this._usernameInput;
  }

  /**
   * Get password input locator (for testing)
   */
  getPasswordInput(): Locator {
    return this._passwordInput;
  }

  /**
   * Get login button locator (for testing)
   */
  getLoginButton(): Locator {
    return this._loginButton;
  }

  /**
   * Get error message locator (for testing)
   */
  getErrorMessage(): Locator {
    return this._errorMessage;
  }

  /**
   * Get inventory list locator (for testing)
   */
  getInventoryList(): Locator {
    return this._inventoryList;
  }
}
