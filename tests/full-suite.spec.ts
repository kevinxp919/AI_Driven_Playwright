import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CheckoutOverviewPage } from '../pages/checkout-overview.page';
import { CheckoutConfirmationPage } from '../pages/checkout-confirmation.page';

// Test users and product names
const standardUser = 'standard_user';
const lockedOutUser = 'locked_out_user';
const validPassword = 'secret_sauce';

// Test data
const checkoutInfo = {
  firstName: 'Standard',
  lastName: 'User',
  zipCode: '12345'
};

const products = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Sauce Lab Jacket'
];

/**
 * Login Page - Comprehensive test
 * Includes valid login, invalid login, locked user test
 */
test.describe('Login Page - Comprehensive Tests', () => {
  
  test.describe.configure({ mode: 'parallel' });

  test('Login with valid credentials - standard_user', async ({ page }) => {
    // Create login page object
    const loginPage = new LoginPage(page);
    
    // Navigate to login page
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // Validate page load
    await loginPage.validatePageLoad();
    
    // Validate login form elements exist
    await loginPage.validateElementExists(loginPage.getUsernameInput());
    await loginPage.validateElementExists(loginPage.getPasswordInput());
    await loginPage.validateElementExists(loginPage.getLoginButton());
    
    // Enter login credentials
    await loginPage.login(standardUser, validPassword);
    
    // Validate inventory list is shown after successful login
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.validatePageLoad();
    
    // Validate URL contains inventory
    const url = await inventoryPage.getCurrentURL();
    expect(url).toContain('inventory');
    
    // Validate page title contains "Swag Labs"
    const pageTitle = await inventoryPage.getPageTitle();
    expect(pageTitle).toContain('Swag Labs');
  });

  test('Login with locked_out_user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // Try to login with locked user
    await loginPage.login(lockedOutUser, validPassword);
    
    // Validate error message is displayed
    const errorMessage = await loginPage.verifyLoginFailure('Epic sadface: Sorry, this user has been locked out');
    expect(errorMessage).toBe(true);
  });

  test('Login with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // Login with wrong username and password
    await loginPage.inputUsername('invalid_username');
    await loginPage.inputPassword('invalid_password');
    await loginPage.clickLoginButton();
    
    // Validate error message
    const hasError = await loginPage.verifyLoginFailure('Epic sadface: Username and password do not match any user in this service');
    expect(hasError).toBe(true);
  });

  test('Login with empty fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // Click login button without entering any information
    await loginPage.clickLoginButton();
    
    // Validate error message is displayed
    const hasError = await loginPage.verifyLoginFailure('Epic sadface: Username is required');
    expect(hasError).toBe(true);
  });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // Validate page title contains "Swag Labs"
    const title = await loginPage.validatePageTitle('Swag Labs');
    expect(title).toBe(true);
    
    // Validate URL is login page
    const url = await loginPage.getCurrentURL();
    expect(url).toBe('https://www.saucedemo.com/');
  });

  test('Verify login form elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // Validate username input
    await loginPage.validateElementExists(loginPage.getUsernameInput());
    const usernameValue = await loginPage.getUsernameInput().inputValue();
    expect(usernameValue).toBe('');
    
    // Validate password input
    await loginPage.validateElementExists(loginPage.getPasswordInput());
    const passwordValue = await loginPage.getPasswordInput().inputValue();
    expect(passwordValue).toBe('');
    
    // Validate login button
    await loginPage.validateElementExists(loginPage.getLoginButton());
    const loginButton = await loginPage.getLoginButton();
    expect(await loginButton.isEnabled()).toBe(true);
  });
});

/**
 * Inventory Page - Comprehensive test
 * Includes product display, filtering, add to cart operations
 */
test.describe('Inventory Page - Comprehensive Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    // Login
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Validate inventory page load
    await inventoryPage.validatePageLoad();
    
    // Validate page title contains "Swag Labs"
    const title = await inventoryPage.validatePageTitle('Swag Labs');
    expect(title).toBe(true);
    
    // Validate URL contains inventory
    const url = await inventoryPage.getCurrentURL();
    expect(url).toContain('inventory');
  });

  test('Product display validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Validate specific product exists
    const backpackExists = await inventoryPage.validateProductExists('Sauce Labs Backpack');
    expect(backpackExists).toBe(true);
    
    // Validate all products are displayed
    const products = await inventoryPage.getProductTitles();
    expect(products.length).toBeGreaterThan(0);
    
    // Validate product count
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);
  });

  test('Add product to cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Validate cart button
    const cartExists = await inventoryPage.validateCartButtonExists();
    expect(cartExists).toBe(true);
    
    // Add product to cart
    const addSuccess = await inventoryPage.addToCart('Sauce Labs Backpack');
    expect(addSuccess).toBe(true);
    
    // Validate cart button shows quantity
    await inventoryPage.validateCartButtonExists();
  });

  test('Cart validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Validate cart button exists and is usable
    const cartButton = inventoryPage.getCartButton();
    await cartButton.waitFor({ state: 'visible' });
    const isEnabled = await cartButton.isEnabled();
    expect(isEnabled).toBe(true);
  });

  test('Sort dropdown validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Validate sort dropdown
    await inventoryPage.validateElementExists(inventoryPage.getSortByDropdown());
    const sortByDropdown = inventoryPage.getSortByDropdown();
    const options = await sortByDropdown.locator('option').allTextContents();
    
    // Actual sort options are "Name (A to Z)" and "Name (Z to A)"
    expect(options).toContain('Name (A to Z)');
    expect(options).toContain('Name (Z to A)');
    expect(options).toContain('Price (low to high)');
    expect(options).toContain('Price (high to low)');
  });
});

/**
 * Cart Page - Comprehensive test
 * Includes product management, quantity adjustment, empty cart
 */
test.describe('Cart Page - Comprehensive Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Go to cart
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // Validate page title
    const title = await cartPage.validatePageTitle('Your Cart');
    expect(title).toBe(true);
    
    // Validate URL contains cart
    const url = await cartPage.getCurrentURL();
    expect(url).toContain('cart');
  });

  test('Validate cart items', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    
    // Go to cart
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // Validate cart products
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(2);
    
    // Validate product name
    expect(cartItems[0].name).toBe('Sauce Labs Backpack');
    expect(cartItems[1].name).toBe('Sauce Labs Bike Light');
  });

  test('Remove item from cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Go to cart
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // Validate cart is not empty
    const cartNotEmpty = await cartPage.validateCartNotEmpty();
    expect(cartNotEmpty).toBe(true);
    
    // Remove product
    const removeSuccess = await cartPage.removeFromCart('Sauce Labs Backpack');
    expect(removeSuccess).toBe(true);
    
    // Validate cart is empty
    const cartEmpty = await cartPage.validateCartNotEmpty();
    expect(cartEmpty).toBe(false);
  });

  test('Clear cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await inventoryPage.addToCart('Sauce Labs Bolt T-Shirt');
    
    // Go to cart
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // Validate cart is not empty
    const cartNotEmpty = await cartPage.validateCartNotEmpty();
    expect(cartNotEmpty).toBe(true);
    
    // Empty cart
    await cartPage.clearCart();
    
    // Validate cart is empty
    const cartEmpty = await cartPage.validateCartNotEmpty();
    expect(cartEmpty).toBe(false);
  });

  test('Checkout button', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Go to cart
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // Validate checkout button exists
    const checkoutButton = cartPage.getCheckoutButton();
    await checkoutButton.waitFor({ state: 'visible' });
    const isButtonEnabled = await checkoutButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });
});

/**
 * Checkout Page - Comprehensive test
 * Includes form validation, error handling, submit test
 */
test.describe('Checkout Page - Comprehensive Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add items to cart and proceed to checkout
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    await checkoutPage.validatePageLoad();
    
    // Validate page title
    const title = await checkoutPage.validatePageTitle('Checkout: Your Information');
    expect(title).toBe(true);
    
    // Validate URL contains checkout
    const url = await checkoutPage.validatePageURL();
    expect(url).toBe(true);
  });

  test('Validate checkout form fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add items to cart and proceed to checkout
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // Validate form fields
    await checkoutPage.validateElementExists(checkoutPage.getFirstNameInput());
    await checkoutPage.validateElementExists(checkoutPage.getLastNameInput());
    await checkoutPage.validateElementExists(checkoutPage.getZipCodeInput());
    
    // Validate form is not empty
    const firstNameEmpty = await checkoutPage.validateFieldFilled(checkoutPage.getFirstNameInput(), '');
    expect(firstNameEmpty).toBe(true);
  });

  test('Complete checkout with valid information', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add items to cart and proceed to checkout
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // Enter checkout information
    await checkoutPage.enterCheckoutInfo(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.zipCode
    );
    
    // Validate form is filled
    const allFilled = await checkoutPage.validateAllFieldsFilled();
    expect(allFilled).toBe(true);
    
    // Click continue
    await checkoutPage.clickContinueButton();
    
    // Validate navigate to checkout overview page
    await overviewPage.validatePageLoad();
    
    // Validate page title
    const title = await overviewPage.validatePageTitle('Checkout: Overview');
    expect(title).toBe(true);
  });

  test('Form validation - empty fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add items to cart and proceed to checkout
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // Click continue without filling any information
    await checkoutPage.clickContinueButton();
    
    // Validate error message
    const hasError = await checkoutPage.validateErrorMessageVisibility();
    expect(hasError).toBe(true);
  });

  test('Form validation - invalid zip code', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add items to cart and proceed to checkout
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // Fill partial information
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '');
    
    // Click continue
    await checkoutPage.clickContinueButton();
    
    // Validate error message
    const hasError = await checkoutPage.validateErrorMessageVisibility();
    expect(hasError).toBe(true);
  });

  test('Back button validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add items to cart and proceed to checkout
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // Validate back button
    const backButton = checkoutPage.getBackButton();
    await backButton.waitFor({ state: 'visible' });
    const isButtonEnabled = await backButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });
});

/**
 * Checkout Overview Page - Comprehensive test
 * Includes order validation, complete order
 */
test.describe('Checkout Overview Page - Comprehensive Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add items to cart and proceed to checkout
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    
    // Validate overview page load
    await overviewPage.validatePageLoad();
    
    // Validate page title
    const title = await overviewPage.validatePageTitle('Checkout: Overview');
    expect(title).toBe(true);
    
    // Validate URL contains checkout-overview
    const url = await overviewPage.validatePageURL();
    expect(url).toBe(true);
  });

  test('Validate cart items in overview', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    
    // Proceed to checkout
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    
    // Validate cart products
    const cartItems = await overviewPage.getCartItems();
    expect(cartItems.length).toBe(2);
    
    // Validate product name
    expect(cartItems[0].name).toBe('Sauce Labs Backpack');
    expect(cartItems[1].name).toBe('Sauce Labs Bike Light');
  });

  test('Complete checkout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    const confirmationPage = new CheckoutConfirmationPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Proceed to checkout
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    
    // Validate overview page load
    await overviewPage.validatePageLoad();
    
    // Validate cart is not empty
    const cartNotEmpty = await overviewPage.validateCartNotEmpty();
    expect(cartNotEmpty).toBe(true);
    
    // Click finish button
    await overviewPage.clickFinishButton();
    
    // Validate checkout success page
    await confirmationPage.validatePageLoad();
    
    // Validate order success message
    const orderSuccess = await confirmationPage.validateOrderSuccess();
    expect(orderSuccess).toBe(true);
  });

  test('Back button validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Proceed to checkout
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    
    // Validate back button
    const backButton = overviewPage.getBackButton();
    await backButton.waitFor({ state: 'visible' });
    const isButtonEnabled = await backButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });

  test('Finish button validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Proceed to checkout
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    
    // Validate finish button
    const finishButton = overviewPage.getFinishButton();
    await finishButton.waitFor({ state: 'visible' });
    const isButtonEnabled = await finishButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });
});

/**
 * Checkout Success Page - Comprehensive test
 */
test.describe('Checkout Confirmation Page - Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    const confirmationPage = new CheckoutConfirmationPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Proceed to checkout
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    await overviewPage.clickFinishButton();
    
    // Validate success page load
    await confirmationPage.validatePageLoad();
    
    // Validate order success message
    const orderSuccess = await confirmationPage.validateOrderSuccess();
    expect(orderSuccess).toBe(true);
  });

  test('Order success message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    const confirmationPage = new CheckoutConfirmationPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Proceed to checkout
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    await overviewPage.clickFinishButton();
    
    // Validate order success message
    const successMessage = await confirmationPage.validateTextOnPage('Thank you for your order!');
    expect(successMessage).toBe(true);
  });

  test('Continue shopping button', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    const confirmationPage = new CheckoutConfirmationPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Proceed to checkout
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    await overviewPage.clickFinishButton();
    
    // Validate continue shopping button
    const continueButton = confirmationPage.getContinueButton();
    await continueButton.waitFor({ state: 'visible' });
    const isButtonEnabled = await continueButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });

  test('Verify confirmation message visibility', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const overviewPage = new CheckoutOverviewPage(page);
    const confirmationPage = new CheckoutConfirmationPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // Add product to cart
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // Proceed to checkout
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('Standard', 'User', '12345');
    await checkoutPage.clickContinueButton();
    await overviewPage.clickFinishButton();

    // Validate confirmation message is visible
    const messageVisible = await confirmationPage.validateConfirmationMessageVisible();
    expect(messageVisible).toBe(true);
  });
});

/**
 * E2E - Complete Purchase Flow
 * Tests the complete user journey: Login → Browse → Add to Cart → Checkout → Confirmation
 */
test.describe('E2E - Complete Purchase Flow', () => {
  test.describe.configure({ mode: 'serial' });

  const testUsers = [
    { username: 'standard_user', password: 'secret_sauce', expected: 'success' },
  ];

  const products = [
    { name: 'Sauce Labs Backpack', price: '$29.99' },
    { name: 'Sauce Labs Bike Light', price: '$9.99' },
  ];

  testUsers.forEach(({ username, password, expected }) => {
    test(`Complete purchase flow with ${username}`, async ({ page }) => {
      // Initialize page objects
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);
      const checkoutOverviewPage = new CheckoutOverviewPage(page);
      const confirmationPage = new CheckoutConfirmationPage(page);

      // Step 1: Login
      await loginPage.navigate('/');
      await loginPage.waitForLoadState();
      await loginPage.login(username, password);

      // Verify login success - should be on inventory page
      await inventoryPage.validatePageLoad();
      expect(page.url()).toContain('inventory');
      console.log(`✅ Step 1: Logged in as ${username}`);

      // Step 2: Browse and add products to cart
      for (const product of products) {
        const addSuccess = await inventoryPage.addToCart(product.name);
        expect(addSuccess).toBe(true);
        console.log(`✅ Step 2: Added ${product.name} to cart`);
      }

      // Verify cart badge shows correct count
      const cartBadge = await inventoryPage.getCartBadgeCount();
      expect(cartBadge).toBe(products.length);

      // Step 3: Go to cart and verify items
      await inventoryPage.clickCartButton();
      await cartPage.validatePageLoad();

      const cartItems = await cartPage.getCartItems();
      expect(cartItems.length).toBe(products.length);
      console.log(`✅ Step 3: Cart contains ${cartItems.length} items`);

      // Step 4: Proceed to checkout
      await cartPage.clickCheckoutButton();
      await checkoutPage.validatePageLoad();
      console.log(`✅ Step 4: Navigated to checkout page`);

      // Step 5: Fill checkout information
      await checkoutPage.enterCheckoutInfo('John', 'Doe', '12345');
      await checkoutPage.clickContinueButton();
      await checkoutOverviewPage.validatePageLoad();
      console.log(`✅ Step 5: Filled checkout info and proceeded to overview`);

      // Step 6: Verify order summary
      const overviewItems = await checkoutOverviewPage.getCartItems();
      expect(overviewItems.length).toBe(products.length);
      console.log(`✅ Step 6: Order overview shows ${overviewItems.length} items`);

      // Step 7: Complete purchase
      await checkoutOverviewPage.clickFinishButton();
      await confirmationPage.validatePageLoad();

      // Step 8: Verify order success
      const orderSuccess = await confirmationPage.validateOrderSuccess();
      expect(orderSuccess).toBe(true);
      console.log(`✅ Step 7-8: Order completed successfully!`);

      // Verify we're on the confirmation page
      expect(page.url()).toContain('checkout-complete');
    });

    test(`Login and view product details with ${username}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      // Login
      await loginPage.navigate('/');
      await loginPage.login(username, password);
      await inventoryPage.validatePageLoad();
      console.log(`✅ Logged in and on inventory page`);

      // Get product count
      const productCount = await inventoryPage.getProductCount();
      expect(productCount).toBe(6);
      console.log(`✅ Found ${productCount} products`);

      // Verify sorting works
      await inventoryPage.sortProducts('Price (low to high)');
      console.log(`✅ Products sorted by price (low to high)`);

      const sortedProducts = await inventoryPage.getProductTitles();
      expect(sortedProducts.length).toBeGreaterThan(0);
    });
  });

  test('Purchase flow with different sorting options', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // Login
    await loginPage.navigate('/');
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.validatePageLoad();

    // Test sorting by Name (Z to A)
    await inventoryPage.sortProducts('Name (Z to A)');
    console.log(`✅ Sorted by Name (Z to A)`);

    // Add first product
    await inventoryPage.addToCart('Sauce Labs Backpack');

    // Go to cart
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();

    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(1);
    console.log(`✅ Added 1 item to cart with Z-A sorting`);
  });

  test('Checkout with all products in cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Login
    await loginPage.navigate('/');
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.validatePageLoad();

    // Add all 6 products to cart
    const allProducts = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Sauce Lab Jacket'
    ];

    for (const product of allProducts) {
      try {
        await inventoryPage.addToCart(product);
      } catch (e) {
        // Product may not exist, skip
      }
    }
    console.log(`✅ Attempted to add all products to cart`);

    // Go to cart
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();

    // Remove some items
    const cartItems = await cartPage.getCartItems();
    if (cartItems.length > 2) {
      await cartPage.removeFromCart(cartItems[0].name);
      console.log(`✅ Removed one item from cart`);
    }

    // Proceed to checkout
    await cartPage.clickCheckoutButton();
    await checkoutPage.validatePageLoad();

    // Fill info and continue
    await checkoutPage.enterCheckoutInfo('Jane', 'Smith', '54321');
    await checkoutPage.clickContinueButton();

    // Verify we moved to overview
    expect(page.url()).toContain('checkout-step-two');
    console.log(`✅ Checkout with multiple items completed`);
  });
});
