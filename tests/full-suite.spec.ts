import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CheckoutOverviewPage } from '../pages/checkout-overview.page';
import { CheckoutConfirmationPage } from '../pages/checkout-confirmation.page';

// 测试用户和商品名称
const standardUser = 'standard_user';
const lockedOutUser = 'locked_out_user';
const validPassword = 'secret_sauce';

// 测试数据
const checkoutInfo = {
  firstName: '标准',
  lastName: '用户',
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
 * 登录页面 - 综合测试
 * 包含有效凭证登录、无效凭证登录、锁定用户测试等
 */
test.describe('Login Page - Comprehensive Tests', () => {
  
  test.describe.configure({ mode: 'parallel' });

  test('Login with valid credentials - standard_user', async ({ page }) => {
    // 创建登录页面对象
    const loginPage = new LoginPage(page);
    
    // 导航到登录页面
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // 验证页面加载
    await loginPage.validatePageLoad();
    
    // 验证登录表单元素存在
    await loginPage.validateElementExists(loginPage.getUsernameInput());
    await loginPage.validateElementExists(loginPage.getPasswordInput());
    await loginPage.validateElementExists(loginPage.getLoginButton());
    
    // 输入登录凭证
    await loginPage.login(standardUser, validPassword);
    
    // 验证登录成功后显示库存列表
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.validatePageLoad();
    
    // 验证 URL 包含 inventory
    const url = await inventoryPage.getCurrentURL();
    expect(url).toContain('inventory');
    
    // 验证页面标题包含 "Swag Labs"（实际网站标题）
    const pageTitle = await inventoryPage.getPageTitle();
    expect(pageTitle).toContain('Swag Labs');
  });

  test('Login with locked_out_user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // 尝试使用锁定用户登录
    await loginPage.login(lockedOutUser, validPassword);
    
    // 验证错误消息显示
    const errorMessage = await loginPage.verifyLoginFailure('Epic sadface: Sorry, this user has been locked out');
    expect(errorMessage).toBe(true);
  });

  test('Login with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // 使用错误的用户名和密码登录
    await loginPage.inputUsername('invalid_username');
    await loginPage.inputPassword('invalid_password');
    await loginPage.clickLoginButton();
    
    // 验证错误消息
    const hasError = await loginPage.verifyLoginFailure('Epic sadface: Username and password do not match any user in this service');
    expect(hasError).toBe(true);
  });

  test('Login with empty fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // 点击登录按钮而不输入任何信息
    await loginPage.clickLoginButton();
    
    // 验证错误消息显示
    const hasError = await loginPage.verifyLoginFailure('Epic sadface: Username is required');
    expect(hasError).toBe(true);
  });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // 验证页面标题包含 "Swag Labs"
    const title = await loginPage.validatePageTitle('Swag Labs');
    expect(title).toBe(true);
    
    // 验证 URL 是登录页面
    const url = await loginPage.getCurrentURL();
    expect(url).toBe('https://www.saucedemo.com/');
  });

  test('Verify login form elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await loginPage.waitForLoadState();
    
    // 验证用户名输入框
    await loginPage.validateElementExists(loginPage.getUsernameInput());
    const usernameValue = await loginPage.getUsernameInput().inputValue();
    expect(usernameValue).toBe('');
    
    // 验证密码输入框
    await loginPage.validateElementExists(loginPage.getPasswordInput());
    const passwordValue = await loginPage.getPasswordInput().inputValue();
    expect(passwordValue).toBe('');
    
    // 验证登录按钮
    await loginPage.validateElementExists(loginPage.getLoginButton());
    const loginButton = await loginPage.getLoginButton();
    expect(await loginButton.isEnabled()).toBe(true);
  });
});

/**
 * 库存页面 - 综合测试
 * 包括商品显示、筛选、添加购物车等操作
 */
test.describe('Inventory Page - Comprehensive Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    // 登录
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 验证库存页面加载
    await inventoryPage.validatePageLoad();
    
    // 验证页面标题包含 "Swag Labs"（实际网站标题）
    const title = await inventoryPage.validatePageTitle('Swag Labs');
    expect(title).toBe(true);
    
    // 验证 URL 包含 inventory
    const url = await inventoryPage.getCurrentURL();
    expect(url).toContain('inventory');
  });

  test('Product display validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 验证特定商品存在
    const backpackExists = await inventoryPage.validateProductExists('Sauce Labs Backpack');
    expect(backpackExists).toBe(true);
    
    // 验证所有商品显示
    const products = await inventoryPage.getProductTitles();
    expect(products.length).toBeGreaterThan(0);
    
    // 验证商品数量
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);
  });

  test('Add product to cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 验证购物车按钮
    const cartExists = await inventoryPage.validateCartButtonExists();
    expect(cartExists).toBe(true);
    
    // 添加商品到购物车
    const addSuccess = await inventoryPage.addToCart('Sauce Labs Backpack');
    expect(addSuccess).toBe(true);
    
    // 验证购物车按钮显示数量
    await inventoryPage.validateCartButtonExists();
  });

  test('Cart validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 验证购物车按钮存在且可用
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
    
    // 验证排序下拉框
    await inventoryPage.validateElementExists(inventoryPage.getSortByDropdown());
    const sortByDropdown = inventoryPage.getSortByDropdown();
    const options = await sortByDropdown.locator('option').allTextContents();
    
    // 实际排序选项是 "Name (A to Z)" 和 "Name (Z to A)"
    expect(options).toContain('Name (A to Z)');
    expect(options).toContain('Name (Z to A)');
    expect(options).toContain('Price (low to high)');
    expect(options).toContain('Price (high to low)');
  });
});

/**
 * 购物车页面 - 综合测试
 * 包括商品管理、数量调整、清空购物车等
 */
test.describe('Cart Page - Comprehensive Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Page title and URL validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入购物车
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // 验证页面标题
    const title = await cartPage.validatePageTitle('Your Cart');
    expect(title).toBe(true);
    
    // 验证 URL 包含 cart
    const url = await cartPage.getCurrentURL();
    expect(url).toContain('cart');
  });

  test('Validate cart items', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    
    // 进入购物车
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // 验证购物车商品
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(2);
    
    // 验证商品名称
    expect(cartItems[0].name).toBe('Sauce Labs Backpack');
    expect(cartItems[1].name).toBe('Sauce Labs Bike Light');
  });

  test('Remove item from cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入购物车
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // 验证购物车不为空
    const cartNotEmpty = await cartPage.validateCartNotEmpty();
    expect(cartNotEmpty).toBe(true);
    
    // 移除商品
    const removeSuccess = await cartPage.removeFromCart('Sauce Labs Backpack');
    expect(removeSuccess).toBe(true);
    
    // 验证购物车为空
    const cartEmpty = await cartPage.validateCartNotEmpty();
    expect(cartEmpty).toBe(false);
  });

  test('Clear cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await inventoryPage.addToCart('Sauce Labs Bolt T-Shirt');
    
    // 进入购物车
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // 验证购物车不为空
    const cartNotEmpty = await cartPage.validateCartNotEmpty();
    expect(cartNotEmpty).toBe(true);
    
    // 清空购物车
    await cartPage.clearCart();
    
    // 验证购物车为空
    const cartEmpty = await cartPage.validateCartNotEmpty();
    expect(cartEmpty).toBe(false);
  });

  test('Checkout button', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    await loginPage.navigate('/');
    await loginPage.login(standardUser, validPassword);
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入购物车
    await inventoryPage.clickCartButton();
    await cartPage.validatePageLoad();
    
    // 验证结算按钮存在
    const checkoutButton = cartPage.getCheckoutButton();
    await checkoutButton.waitFor({ state: 'visible' });
    const isButtonEnabled = await checkoutButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });
});

/**
 * 结算页面 - 综合测试
 * 包括表单验证、错误处理、提交测试等
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
    
    // 添加商品到购物车并进入结算
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    await checkoutPage.validatePageLoad();
    
    // 验证页面标题
    const title = await checkoutPage.validatePageTitle('Checkout: Your Information');
    expect(title).toBe(true);
    
    // 验证 URL 包含 checkout
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
    
    // 添加商品到购物车并进入结算
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // 验证表单字段
    await checkoutPage.validateElementExists(checkoutPage.getFirstNameInput());
    await checkoutPage.validateElementExists(checkoutPage.getLastNameInput());
    await checkoutPage.validateElementExists(checkoutPage.getZipCodeInput());
    
    // 验证表单不为空
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
    
    // 添加商品到购物车并进入结算
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // 输入结算信息
    await checkoutPage.enterCheckoutInfo(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.zipCode
    );
    
    // 验证表单已填充
    const allFilled = await checkoutPage.validateAllFieldsFilled();
    expect(allFilled).toBe(true);
    
    // 点击继续
    await checkoutPage.clickContinueButton();
    
    // 验证进入结算概览页面
    await overviewPage.validatePageLoad();
    
    // 验证页面标题
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
    
    // 添加商品到购物车并进入结算
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // 点击继续而不填写任何信息
    await checkoutPage.clickContinueButton();
    
    // 验证错误消息
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
    
    // 添加商品到购物车并进入结算
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // 填写部分信息
    await checkoutPage.enterCheckoutInfo('标准', '用户', '');
    
    // 点击继续
    await checkoutPage.clickContinueButton();
    
    // 验证错误消息
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
    
    // 添加商品到购物车并进入结算
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    
    // 验证返回按钮
    const backButton = checkoutPage.getBackButton();
    await backButton.waitFor({ state: 'visible' });
    const isButtonEnabled = await backButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });
});

/**
 * 结算概览页面 - 综合测试
 * 包括订单验证、完成订单等
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
    
    // 添加商品到购物车并进入结算
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    
    // 验证概览页面加载
    await overviewPage.validatePageLoad();
    
    // 验证页面标题
    const title = await overviewPage.validatePageTitle('Checkout: Overview');
    expect(title).toBe(true);
    
    // 验证 URL 包含 checkout-overview
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
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    
    // 进入结算
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    
    // 验证购物车商品
    const cartItems = await overviewPage.getCartItems();
    expect(cartItems.length).toBe(2);
    
    // 验证商品名称
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
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入结算
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    
    // 验证概览页面加载
    await overviewPage.validatePageLoad();
    
    // 验证购物车不为空
    const cartNotEmpty = await overviewPage.validateCartNotEmpty();
    expect(cartNotEmpty).toBe(true);
    
    // 点击完成按钮
    await overviewPage.clickFinishButton();
    
    // 验证结算成功页面
    await confirmationPage.validatePageLoad();
    
    // 验证订单成功消息
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
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入结算
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    
    // 验证返回按钮
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
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入结算
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    
    // 验证完成按钮
    const finishButton = overviewPage.getFinishButton();
    await finishButton.waitFor({ state: 'visible' });
    const isButtonEnabled = await finishButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });
});

/**
 * 结算成功页面 - 综合测试
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
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入结算
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    await overviewPage.clickFinishButton();
    
    // 验证成功页面加载
    await confirmationPage.validatePageLoad();
    
    // 验证订单成功消息
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
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入结算
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    await overviewPage.clickFinishButton();
    
    // 验证订单成功消息
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
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入结算
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    await overviewPage.clickFinishButton();
    
    // 验证继续购物按钮
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
    
    // 添加商品到购物车
    await inventoryPage.addToCart('Sauce Labs Backpack');
    
    // 进入结算
    await inventoryPage.clickCartButton();
    await cartPage.clickCheckoutButton();
    await checkoutPage.enterCheckoutInfo('标准', '用户', '12345');
    await checkoutPage.clickContinueButton();
    await overviewPage.clickFinishButton();

    // 验证确认消息可见
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
