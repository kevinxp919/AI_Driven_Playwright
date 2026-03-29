import { Page, Locator, expect } from 'playwright';
import { BasePage } from './base.page';

/**
 * 结算信息页面对象
 * 基于 BasePage 类，遵循 Page Object Model 模式
 */
export class CheckoutPage extends BasePage {
  // 页面元素定位器 - 必须先验证后才能使用
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
   * 验证页面加载
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._checkoutHeader);
    await this.validateElementExists(this._firstNameInput);
    await this.validateElementExists(this._lastNameInput);
    await this.validateElementExists(this._zipCodeInput);
    await this.validateElementExists(this._continueButton);
  }

  /**
   * 输入收货信息
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
   * 验证特定字段是否已填充
   */
  async validateFieldFilled(locator: Locator, expectedValue: string): Promise<boolean> {
    await this.validateElementReady(locator);
    const value = await locator.inputValue();
    return value === expectedValue;
  }

  /**
   * 点击继续按钮
   */
  async clickContinueButton(): Promise<void> {
    await this.validateElementReady(this._continueButton);
    await this._continueButton.click();
    await this.waitForLoadState();
  }

  /**
   * 验证错误消息
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
   * 验证表单验证失败
   */
  async validateFormValidation(): Promise<boolean> {
    await this.clickContinueButton();
    const hasError = await this._errorMessage.count() > 0;
    return hasError;
  }

  /**
   * 验证所有字段已填充
   */
  async validateAllFieldsFilled(): Promise<boolean> {
    const firstNameFilled = await this.validateFieldFilled(this._firstNameInput, '标准');
    const lastNameFilled = await this.validateFieldFilled(this._lastNameInput, '用户');
    const zipCodeFilled = await this.validateFieldFilled(this._zipCodeInput, '12345');
    return firstNameFilled && lastNameFilled && zipCodeFilled;
  }

  /**
   * 验证表单错误消息
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
   * 验证页面标题
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    // 结算页面使用 .title 元素验证，因为文档标题都是 "Swag Labs"
    const titleElement = this.page.locator('.title');
    await this.validateElementExists(titleElement);
    const title = await titleElement.innerText();
    return title.includes(expectedTitle);
  }

  /**
   * 验证 URL 包含 checkout
   */
  async validatePageURL(): Promise<boolean> {
    const url = await this.getCurrentURL();
    return url.includes('checkout');
  }

  // 获取器方法（用于测试）
  getCheckoutHeader(): Locator { return this._checkoutHeader; }
  getCheckoutForm(): Locator { return this._checkoutForm; }
  getFirstNameInput(): Locator { return this._firstNameInput; }
  getLastNameInput(): Locator { return this._lastNameInput; }
  getZipCodeInput(): Locator { return this._zipCodeInput; }
  getContinueButton(): Locator { return this._continueButton; }
  getBackButton(): Locator { return this.page.locator('[data-test="cancel"]'); }
  getErrorMessage(): Locator { return this._errorMessage; }
}