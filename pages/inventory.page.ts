import { Page, Locator, expect } from 'playwright';
import { BasePage } from './base.page';

/**
 * Inventory Page Object
 * Extends BasePage following Page Object Model pattern
 */
export class InventoryPage extends BasePage {
  // Page element locators - must validate before use
  private readonly _inventoryContainer: Locator = this.page.locator('.inventory_container');
  private readonly _inventoryList: Locator = this.page.locator('.inventory_list');
  private readonly _inventoryItem: Locator = this.page.locator('.inventory_item');
  private readonly _sortByDropdown: Locator = this.page.locator('.product_sort_container');
  private readonly _cartButton: Locator = this.page.locator('.shopping_cart_link');
  private readonly _productTitle: Locator = this.page.locator('.inventory_item_name');
  private readonly _addCartButton: Locator = this.page.locator('[data-test^="add-to-cart"]');
  private readonly _productPrice: Locator = this.page.locator('.inventory_item_price');
  private readonly _cartBadge: Locator = this.page.locator('.shopping_cart_badge');

  // Known product name mappings
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
   * Validate page load
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._inventoryContainer);
    await this.validateElementExists(this._inventoryList);
    await this.validateElementExists(this._sortByDropdown);
  }

  /**
   * Validate page URL
   */
  async validatePageURL(): Promise<boolean> {
    const url = await this.getCurrentURL();
    return url.includes('inventory');
  }

  /**
   * Get all product titles
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
   * Validate specific product exists
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
   * Add product to cart
   */
  async addToCart(productName: string): Promise<boolean> {
    // Get formatted product name (e.g., "Sauce Labs Backpack" -> "sauce-labs-backpack")
    const formattedName = productName.toLowerCase().replace(/\s+/g, '-');

    // Find corresponding add-to-cart button (using dynamic selector)
    const addButton = this.page.locator(`[data-test="add-to-cart-${formattedName}"]`);
    await this.validateElementReady(addButton);
    await addButton.click();

    return true;
  }

  /**
   * Validate cart button exists
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
   * Click cart button
   */
  async clickCartButton(): Promise<void> {
    await this.validateElementReady(this._cartButton);
    await this._cartButton.click();
    await this.waitForLoadState();
  }

  /**
   * Validate product count
   */
  async validateProductCount(expectedCount: number): Promise<boolean> {
    const count = await this._productTitle.count();
    return count === expectedCount;
  }

  /**
   * Get total product count
   */
  async getProductCount(): Promise<number> {
    return await this._productTitle.count();
  }

  /**
   * Get cart badge count
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
   * Sort products
   */
  async sortProducts(sortOption: string): Promise<void> {
    await this.validateElementReady(this._sortByDropdown);
    await this._sortByDropdown.selectOption(sortOption);
    await this.waitForLoadState();
  }

  /**
   * Validate page title
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    const title = await this.getPageTitle();
    return title.includes(expectedTitle);
  }

  // Getter methods (for testing)
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
