import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CheckoutOverviewPage } from '../pages/checkout-overview.page';
import { CheckoutConfirmationPage } from '../pages/checkout-confirmation.page';

const standardUser = 'standard_user';
const validPassword = 'secret_sauce';
const checkoutInfo = { firstName: 'Auto', lastName: 'Test', zipCode: '12345' };

test.describe('Single request end-to-end scenario', () => {
  test('Happy path checkout with one product', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    const confirmationPage = new CheckoutConfirmationPage(page);

    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();

    await cartPage.validatePageLoad();
    await cartPage.clickCheckoutButton();

    await checkoutPage.enterCheckoutInfo(checkoutInfo.firstName, checkoutInfo.lastName, checkoutInfo.zipCode);
    await checkoutPage.clickContinueButton();

    await overviewPage.validatePageLoad();
    await overviewPage.clickFinishButton();

    await confirmationPage.validatePageLoad();
    expect(await confirmationPage.validateOrderSuccess()).toBe(true);
  });
});
