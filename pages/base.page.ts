import { Page, Locator, expect } from 'playwright';

/**
 * 基础页面类 - 所有页面对象的基类
 * 提供通用的页面操作方法和验证功能
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 导航到指定 URL
   */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * 验证元素是否存在（必须验证后才能使用）
   */
  async validateElementExists(locator: Locator, timeout: number = 5000): Promise<void> {
    try {
      // 使用原生 Playwright 方法等待元素可见
      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(`元素验证失败：${locator.toString()} - ${error}`);
    }
  }

  /**
   * 等待元素加载
   */
  async waitForElement(locator: Locator, timeout: number = 5000): Promise<void> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(`元素加载超时：${locator.toString()} - ${error}`);
    }
  }

  /**
   * 验证元素是否已就绪（可交互状态）
   */
  async validateElementReady(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout: 5000 });
    await locator.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * 验证元素是否可见
   */
  async validateElementVisible(locator: Locator, timeout: number = 5000): Promise<void> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(`元素可见性验证失败：${locator.toString()} - ${error}`);
    }
  }

  /**
   * 获取页面标题
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * 获取当前 URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * 等待页面完全加载
   */
  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    await this.page.waitForLoadState(state);
  }
}
