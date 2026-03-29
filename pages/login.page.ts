import { Page, Locator, expect } from 'playwright';
import { BasePage } from './base.page';

/**
 * 登录页面对象
 * 基于 BasePage 类，遵循 Page Object Model 模式
 */
export class LoginPage extends BasePage {
  // 页面元素定位器 - 必须先验证后才能使用
  private readonly _usernameInput: Locator = this.page.locator('#user-name');
  private readonly _passwordInput: Locator = this.page.locator('#password');
  private readonly _loginButton: Locator = this.page.locator('#login-button');
  private readonly _errorMessage: Locator = this.page.locator('[data-test="error"]');
  private readonly _inventoryList: Locator = this.page.locator('.inventory_list');

  constructor(page: Page) {
    super(page);
  }

  /**
   * 验证页面元素是否已加载
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._usernameInput);
    await this.validateElementExists(this._passwordInput);
    await this.validateElementExists(this._loginButton);
  }

  /**
   * 输入用户名
   */
  async inputUsername(username: string): Promise<void> {
    await this.validateElementReady(this._usernameInput);
    await this._usernameInput.fill(username);
    await this.validateElementExists(this._usernameInput);
  }

  /**
   * 输入密码
   */
  async inputPassword(password: string): Promise<void> {
    await this.validateElementReady(this._passwordInput);
    await this._passwordInput.fill(password);
    await this.validateElementExists(this._passwordInput);
  }

  /**
   * 点击登录按钮
   */
  async clickLoginButton(): Promise<void> {
    await this.validateElementReady(this._loginButton);
    await this._loginButton.click();
  }

  /**
   * 执行登录操作
   */
  async login(username: string, password: string): Promise<void> {
    await this.inputUsername(username);
    await this.inputPassword(password);
    await this.clickLoginButton();
    await this.waitForLoadState();
  }

  /**
   * 验证登录成功后是否显示库存列表
   */
  async verifyLoginSuccess(): Promise<boolean> {
    await this.validateElementExists(this._inventoryList, 10000);
    return true;
  }

  /**
   * 验证登录失败错误信息
   */
  async verifyLoginFailure(expectedError: string): Promise<boolean> {
    await this.validateElementExists(this._errorMessage, 5000);
    const errorText = await this._errorMessage.innerText();
    return errorText.includes(expectedError);
  }

  /**
   * 验证页面标题
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    const title = await this.getPageTitle();
    return title.includes(expectedTitle);
  }

  /**
   * 获取用户名输入框定位器（用于测试）
   */
  getUsernameInput(): Locator {
    return this._usernameInput;
  }

  /**
   * 获取密码输入框定位器（用于测试）
   */
  getPasswordInput(): Locator {
    return this._passwordInput;
  }

  /**
   * 获取登录按钮定位器（用于测试）
   */
  getLoginButton(): Locator {
    return this._loginButton;
  }

  /**
   * 获取错误消息定位器（用于测试）
   */
  getErrorMessage(): Locator {
    return this._errorMessage;
  }

  /**
   * 获取库存列表定位器（用于测试）
   */
  getInventoryList(): Locator {
    return this._inventoryList;
  }
}
