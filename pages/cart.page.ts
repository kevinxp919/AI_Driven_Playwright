import { Page, Locator } from 'playwright';
import { BasePage } from './base.page';

/**
 * 购物车页面对象
 * 基于 BasePage 类，遵循 Page Object Model 模式
 */
export class CartPage extends BasePage {
  // 页面元素定位器 - 必须先验证后才能使用
  private readonly _cartHeader: Locator = this.page.locator('.title');
  private readonly _backButton: Locator = this.page.locator('.backpack_back_link');
  private readonly _cartItemContainer: Locator = this.page.locator('.cart_item');
  private readonly _cartItemName: Locator = this.page.locator('.inventory_item_name');
  private readonly _cartItemDescription: Locator = this.page.locator('.inventory_item_desc');
  private readonly _cartItemPrice: Locator = this.page.locator('.inventory_item_price');
  private readonly _cartItemQuantity: Locator = this.page.locator('.cart_quantity');
  private readonly _removeButton: Locator = this.page.locator('.cart_button');
  private readonly _checkoutButton: Locator = this.page.locator('[data-test="checkout"]');
  private readonly _clearCartButton: Locator = this.page.locator('[data-test="clear"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * 验证页面加载
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._cartHeader);
    await this.validateElementExists(this._checkoutButton);
  }

  /**
   * 验证购物车不为空
   */
  async validateCartNotEmpty(): Promise<boolean> {
    const itemCount = await this._cartItemContainer.count();
    return itemCount > 0;
  }

  /**
   * 获取购物车商品列表
   */
  async getCartItems(): Promise<{ name: string; description: string; price: string; quantity: string }[]> {
    const items: { name: string; description: string; price: string; quantity: string }[] = [];
    const count = await this._cartItemContainer.count();
    
    for (let i = 0; i < count; i++) {
      const itemContainer = this._cartItemContainer.nth(i);
      const name = await itemContainer.locator(this._cartItemName).innerText();
      const description = await itemContainer.locator(this._cartItemDescription).innerText();
      const price = await itemContainer.locator(this._cartItemPrice).innerText();
      const quantity = await itemContainer.locator(this._cartItemQuantity).innerText();
      
      items.push({ name, description, price, quantity });
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
   * 从购物车移除商品
   */
  async removeFromCart(productName: string): Promise<boolean> {
    const productId = productName.toLowerCase().replace(/\s+/g, '-');
    const removeButton = this.page.locator(`[data-test="remove-${productId}"]`);
    try {
      await this.validateElementReady(removeButton);
      await removeButton.click();
      await this.waitForLoadState();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 点击结算按钮
   */
  async clickCheckoutButton(): Promise<void> {
    await this.validateElementReady(this._checkoutButton);
    await this._checkoutButton.click();
    await this.waitForLoadState();
  }

  /**
   * 清空购物车 - 逐个移除所有商品
   */
  async clearCart(): Promise<void> {
    const removeButtons = this.page.locator('[data-test^="remove-"]');
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      const btn = removeButtons.first();
      await btn.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * 验证特定商品是否被禁用（不可移除）
   */
  async validateRemoveButtonDisabled(productName: string): Promise<boolean> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);
    
    // 获取包含产品名称的 cart_item
    const itemElement = locator.locator('..');
    
    // 移除按钮使用固定选择器
    const removeButton = itemElement.locator('[data-test="remove"]');
    
    // 验证按钮状态
    const isDisabled = await removeButton.count() === 0 || await removeButton.isEnabled() === false;
    return isDisabled;
  }

  /**
   * 验证购物车总价
   */
  async getCartTotal(): Promise<string> {
    const itemCount = await this._cartItemContainer.count();
    if (itemCount === 0) {
      return '0 items';
    }
    
    const totalElement = this.page.locator('.cart_total_label');
    const totalText = await totalElement.innerText();
    return totalText;
  }

  /**
   * 验证页面标题
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    // 购物车页面使用 .title 元素验证，因为文档标题都是 "Swag Labs"
    const titleElement = this.page.locator('.title');
    await this.validateElementExists(titleElement);
    const title = await titleElement.innerText();
    return title.includes(expectedTitle);
  }

  /**
   * 验证商品数量
   */
  async validateItemQuantity(productName: string, expectedQuantity: string): Promise<boolean> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);
    
    const itemContainer = locator.locator('..');
    const quantity = await itemContainer.locator(this._cartItemQuantity).innerText();
    return quantity === expectedQuantity;
  }

  // 获取器方法（用于测试）
  getCartHeader(): Locator { return this._cartHeader; }
  getBackButton(): Locator { return this._backButton; }
  getCheckoutButton(): Locator { return this._checkoutButton; }
  getClearCartButton(): Locator { return this._clearCartButton; }
  getCartItem(index: number): Locator { return this._cartItemContainer.nth(index); }
  getRemoveButton(index: number): Locator { return this._removeButton.nth(index); }
}