import { Page, Locator, expect } from 'playwright';
import { BasePage } from './base.page';

/**
 * 商品清单页面对象
 * 基于 BasePage 类，遵循 Page Object Model 模式
 */
export class InventoryPage extends BasePage {
  // 页面元素定位器 - 必须先验证后才能使用
  private readonly _inventoryContainer: Locator = this.page.locator('.inventory_container');
  private readonly _inventoryList: Locator = this.page.locator('.inventory_list');
  private readonly _inventoryItem: Locator = this.page.locator('.inventory_item');
  private readonly _sortByDropdown: Locator = this.page.locator('.product_sort_container');
  private readonly _cartButton: Locator = this.page.locator('.shopping_cart_link');
  private readonly _productTitle: Locator = this.page.locator('.inventory_item_name');
  private readonly _addCartButton: Locator = this.page.locator('[data-test^="add-to-cart"]');
  private readonly _productPrice: Locator = this.page.locator('.inventory_item_price');
  private readonly _cartBadge: Locator = this.page.locator('.shopping_cart_badge');

  // 已知商品名称映射
  private readonly _productNames = {
    'Sauce Labs Backpack': '[data-test="item-4"]',
    'Sauce Labs Bike Light': '[data-test="item-5"]',
    'Sauce Labs Bolt T-Shirt': '[data-test="item-6"]',
    'Sauce Labs Fleece Jacket': '[data-test="item-7"]',
    'Sauce Labs Onesie': '[data-test="item-8"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * 验证页面加载
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._inventoryContainer);
    await this.validateElementExists(this._inventoryList);
    await this.validateElementExists(this._sortByDropdown);
  }

  /**
   * 验证页面 URL
   */
  async validatePageURL(): Promise<boolean> {
    const url = await this.getCurrentURL();
    return url.includes('inventory');
  }

  /**
   * 获取所有商品标题
   */
  async getProductTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this._productTitle.count();
    for (let i = 0; i < count; i++) {
      const title = await this._productTitle.nth(i).innerText();
      titles.push(title);
    }
    return titles;
  }

  /**
   * 验证特定商品是否存在
   */
  async validateProductExists(productName: string): Promise<boolean> {
    const locator = this.page.locator(`text="${productName}"`);
    try {
      await this.validateElementExists(locator);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 添加商品到购物车
   */
  async addToCart(productName: string): Promise<boolean> {
    // 获取产品名称的格式化版本（例如："Sauce Labs Backpack" -> "sauce-labs-backpack"）
    const formattedName = productName.toLowerCase().replace(/\s+/g, '-');
    
    // 查找对应的加入购物车按钮（使用动态选择器）
    const addButton = this.page.locator(`[data-test="add-to-cart-${formattedName}"]`);
    await this.validateElementReady(addButton);
    await addButton.click();
    
    return true;
  }

  /**
   * 验证购物车按钮存在
   */
  async validateCartButtonExists(): Promise<boolean> {
    try {
      await this.validateElementExists(this._cartButton);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 点击购物车按钮
   */
  async clickCartButton(): Promise<void> {
    await this.validateElementReady(this._cartButton);
    await this._cartButton.click();
    await this.waitForLoadState();
  }

  /**
   * 验证商品数量
   */
  async validateProductCount(expectedCount: number): Promise<boolean> {
    const count = await this._productTitle.count();
    return count === expectedCount;
  }

  /**
   * 获取商品总数
   */
  async getProductCount(): Promise<number> {
    return await this._productTitle.count();
  }

  /**
   * 获取购物车徽章数量
   */
  async getCartBadgeCount(): Promise<number> {
    const badgeCount = await this._cartBadge.count();
    if (badgeCount === 0) {
      return 0;
    }
    const badgeText = await this._cartBadge.innerText();
    return parseInt(badgeText, 10) || 0;
  }

  /**
   * 对产品进行排序
   */
  async sortProducts(sortOption: string): Promise<void> {
    await this.validateElementReady(this._sortByDropdown);
    await this._sortByDropdown.selectOption(sortOption);
    await this.waitForLoadState();
  }

  /**
   * 验证页面标题
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    const title = await this.getPageTitle();
    return title.includes(expectedTitle);
  }

  // 获取器方法（用于测试）
  getInventoryContainer(): Locator { return this._inventoryContainer; }
  getInventoryList(): Locator { return this._inventoryList; }
  getInventoryItem(index: number): Locator { return this._inventoryItem.nth(index); }
  getSortByDropdown(): Locator { return this._sortByDropdown; }
  getCartButton(): Locator { return this._cartButton; }
  getProductTitle(index: number): Locator { return this._productTitle.nth(index); }
  getAddCartButton(index: number): Locator { return this._addCartButton.nth(index); }
  getProductPrice(index: number): Locator { return this._productPrice.nth(index); }
  getCartBadge(): Locator { return this._cartBadge; }
}
