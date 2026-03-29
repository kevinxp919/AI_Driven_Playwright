import { Page, Locator } from 'playwright';
import { BasePage } from './base.page';

/**
 * 结算成功页面对象
 * 基于 BasePage 类，遵循 Page Object Model 模式
 */
export class CheckoutConfirmationPage extends BasePage {
  // 页面元素定位器 - 必须先验证后才能使用
  private readonly _confirmationHeader: Locator = this.page.locator('.complete-header');
  private readonly _continueButton: Locator = this.page.locator('[data-test="back-to-products"]');
  private readonly _confirmationMessage: Locator = this.page.locator('.complete-header');

  constructor(page: Page) {
    super(page);
  }

  /**
   * 验证页面加载
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._confirmationHeader);
    await this.validateElementExists(this._continueButton);
    await this.validateElementExists(this._confirmationMessage);
  }

  /**
   * 验证订单成功消息
   */
  async validateOrderSuccess(): Promise<boolean> {
    await this.validateElementExists(this._confirmationHeader, 5000);
    const headerText = await this._confirmationHeader.innerText();
    return headerText.includes('Thank you');
  }

  /**
   * 验证特定文本出现在页面上
   */
  async validateTextOnPage(expectedText: string): Promise<boolean> {
    const locator = this.page.locator(`text="${expectedText}"`);
    await this.validateElementExists(locator);
    return true;
  }

  /**
   * 点击继续购物按钮
   */
  async clickContinueShopping(): Promise<void> {
    await this.validateElementReady(this._continueButton);
    await this._continueButton.click();
    await this.waitForLoadState();
  }

  /**
   * 验证订单确认消息可见
   */
  async validateConfirmationMessageVisible(): Promise<boolean> {
    await this.validateElementVisible(this._confirmationMessage);
    return true;
  }

  /**
   * 验证页面标题
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    const title = await this.getPageTitle();
    return title.includes('Swag Labs');
  }

  /**
   * 验证 URL 包含 checkout
   */
  async validatePageURL(): Promise<boolean> {
    const url = await this.getCurrentURL();
    return url.includes('checkout');
  }

  // 获取器方法（用于测试）
  getConfirmationHeader(): Locator { return this._confirmationHeader; }
  getContinueButton(): Locator { return this._continueButton; }
  getConfirmationMessage(): Locator { return this._confirmationMessage; }
}