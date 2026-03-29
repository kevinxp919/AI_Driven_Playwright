import { Page, Locator } from 'playwright';
import { BasePage } from './base.page';

/**
 * Cart Page Object
 * Extends BasePage following Page Object Model pattern
 */
export class CartPage extends BasePage {
  // Page element locators - must validate before use
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
   * Validate page load
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._cartHeader);
    await this.validateElementExists(this._checkoutButton);
  }

  /**
   * Validate cart is not empty
   */
  async validateCartNotEmpty(): Promise<boolean> {
    const itemCount = await this._cartItemContainer.count();
    return itemCount > 0;
  }

  /**
   * Get cart items list
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
   * Validate specific product is in cart
   */
  async validateProductInCart(productName: string): Promise<boolean> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);
    return true;
  }

  /**
   * Remove product from cart
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
   * Click checkout button
   */
  async clickCheckoutButton(): Promise<void> {
    await this.validateElementReady(this._checkoutButton);
    await this._checkoutButton.click();
    await this.waitForLoadState();
  }

  /**
   * Clear cart - remove all items one by one
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
   * Validate specific product is disabled (cannot be removed)
   */
  async validateRemoveButtonDisabled(productName: string): Promise<boolean> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);

    // Get cart_item containing product name
    const itemElement = locator.locator('..');

    // Remove button uses fixed selector
    const removeButton = itemElement.locator('[data-test="remove"]');

    // Validate button state
    const isDisabled = await removeButton.count() === 0 || await removeButton.isEnabled() === false;
    return isDisabled;
  }

  /**
   * Get cart total
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
   * Validate page title
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    // Cart page uses .title element for validation
    const titleElement = this.page.locator('.title');
    await this.validateElementExists(titleElement);
    const title = await titleElement.innerText();
    return title.includes(expectedTitle);
  }

  /**
   * Validate item quantity
   */
  async validateItemQuantity(productName: string, expectedQuantity: string): Promise<boolean> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);

    const itemContainer = locator.locator('..');
    const quantity = await itemContainer.locator(this._cartItemQuantity).innerText();
    return quantity === expectedQuantity;
  }

  // Getter methods (for testing)
  getCartHeader(): Locator { return this._cartHeader; }
  getBackButton(): Locator { return this._backButton; }
  getCheckoutButton(): Locator { return this._checkoutButton; }
  getClearCartButton(): Locator { return this._clearCartButton; }
  getCartItem(index: number): Locator { return this._cartItemContainer.nth(index); }
  getRemoveButton(index: number): Locator { return this._removeButton.nth(index); }
}
