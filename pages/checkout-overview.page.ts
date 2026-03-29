import { Page, Locator } from 'playwright';
import { BasePage } from './base.page';

/**
 * 结算概述页面对象
 * 基于 BasePage 类，遵循 Page Object Model 模式
 */
export class CheckoutOverviewPage extends BasePage {
  // 页面元素定位器 - 必须先验证后才能使用
  private readonly _overviewHeader: Locator = this.page.locator('.title');
  private readonly _backButton: Locator = this.page.locator('[data-test="back-to-cart"]');
  private readonly _finishButton: Locator = this.page.locator('[data-test="finish"]');
  private readonly _cartSummary: Locator = this.page.locator('.cart_item');
  private readonly _itemName: Locator = this.page.locator('.inventory_item_name');
  private readonly _itemDescription: Locator = this.page.locator('.inventory_item_desc');
  private readonly _itemPrice: Locator = this.page.locator('.inventory_item_price');

  constructor(page: Page) {
    super(page);
  }

  /**
   * 验证页面加载
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._overviewHeader);
    await this.validateElementExists(this._finishButton);
    // 使用 .first() 因为可能存在多个购物车项
    await this._cartSummary.first().waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * 获取购物车项目列表
   */
  async getCartItems(): Promise<{ name: string; description: string; price: string }[]> {
    const items: { name: string; description: string; price: string }[] = [];
    const count = await this._cartSummary.count();
    
    for (let i = 0; i < count; i++) {
      const cartItem = this._cartSummary.nth(i);
      const name = await cartItem.locator(this._itemName).innerText();
      const description = await cartItem.locator(this._itemDescription).innerText();
      const price = await cartItem.locator(this._itemPrice).innerText();
      
      items.push({ name, description, price });
    }
    
    return items;
  }

  /**
   * 验证特定商品在购物车中
   */
  async validateProductInCart(productName: string): Promise<boolean> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);
    return true;
  }

  /**
   * 点击完成按钮
   */
  async clickFinishButton(): Promise<void> {
    await this.validateElementReady(this._finishButton);
    await this._finishButton.click();
    await this.waitForLoadState();
  }

  /**
   * 验证购物车不为空
   */
  async validateCartNotEmpty(): Promise<boolean> {
    const itemCount = await this._cartSummary.count();
    return itemCount > 0;
  }

  /**
   * 验证购物车商品数量
   */
  async validateCartItemCount(expectedCount: number): Promise<boolean> {
    const count = await this._cartSummary.count();
    return count === expectedCount;
  }

  /**
   * 验证特定商品的数量
   */
  async validateProductCount(productName: string): Promise<number> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);
    return await locator.count();
  }

  /**
   * 验证页面标题
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    // 结算概览页面使用 .title 元素验证，因为文档标题都是 "Swag Labs"
    const titleElement = this.page.locator('.title').first();
    await titleElement.waitFor({ state: 'visible', timeout: 5000 });
    const title = await titleElement.innerText();
    return title.includes(expectedTitle);
  }

  /**
   * 验证 URL 包含 checkout-step-two
   */
  async validatePageURL(): Promise<boolean> {
    const url = await this.getCurrentURL();
    return url.includes('checkout-step-two');
  }

  // 获取器方法（用于测试）
  getOverviewHeader(): Locator { return this._overviewHeader; }
  getBackButton(): Locator { return this.page.locator('[data-test="cancel"]'); }
  getFinishButton(): Locator { return this._finishButton; }
  getCartItem(index: number): Locator { return this._cartSummary.nth(index); }
  getItemName(index: number): Locator { return this._itemName.nth(index); }
  getItemDescription(index: number): Locator { return this._itemDescription.nth(index); }
  getItemPrice(index: number): Locator { return this._itemPrice.nth(index); }
}