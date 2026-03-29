import { Page, Locator } from 'playwright';
import { BasePage } from './base.page';

/**
 * Checkout Overview Page Object
 * Extends BasePage following Page Object Model pattern
 */
export class CheckoutOverviewPage extends BasePage {
  // Page element locators - must validate before use
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
   * Validate page load
   */
  async validatePageLoad(): Promise<void> {
    await this.validateElementExists(this._overviewHeader);
    await this.validateElementExists(this._finishButton);
    // Use .first() because there may be multiple cart items
    await this._cartSummary.first().waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get cart items list
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
   * Validate specific product is in cart
   */
  async validateProductInCart(productName: string): Promise<boolean> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);
    return true;
  }

  /**
   * Click finish button
   */
  async clickFinishButton(): Promise<void> {
    await this.validateElementReady(this._finishButton);
    await this._finishButton.click();
    await this.waitForLoadState();
  }

  /**
   * Validate cart is not empty
   */
  async validateCartNotEmpty(): Promise<boolean> {
    const itemCount = await this._cartSummary.count();
    return itemCount > 0;
  }

  /**
   * Validate cart item count
   */
  async validateCartItemCount(expectedCount: number): Promise<boolean> {
    const count = await this._cartSummary.count();
    return count === expectedCount;
  }

  /**
   * Validate specific product quantity
   */
  async validateProductCount(productName: string): Promise<number> {
    const locator = this.page.locator(`.inventory_item_name:has-text("${productName}")`);
    await this.validateElementExists(locator);
    return await locator.count();
  }

  /**
   * Validate page title
   */
  async validatePageTitle(expectedTitle: string): Promise<boolean> {
    // Checkout overview page uses .title element for validation
    const titleElement = this.page.locator('.title').first();
    await titleElement.waitFor({ state: 'visible', timeout: 5000 });
    const title = await titleElement.innerText();
    return title.includes(expectedTitle);
  }

  /**
   * Validate URL contains checkout-step-two
   */
  async validatePageURL(): Promise<boolean> {
    const url = await this.getCurrentURL();
    return url.includes('checkout-step-two');
  }

  // Getter methods (for testing)
  getOverviewHeader(): Locator { return this._overviewHeader; }
  getBackButton(): Locator { return this.page.locator('[data-test="cancel"]'); }
  getFinishButton(): Locator { return this._finishButton; }
  getCartItem(index: number): Locator { return this._cartSummary.nth(index); }
  getItemName(index: number): Locator { return this._itemName.nth(index); }
  getItemDescription(index: number): Locator { return this._itemDescription.nth(index); }
  getItemPrice(index: number): Locator { return this._itemPrice.nth(index); }
}