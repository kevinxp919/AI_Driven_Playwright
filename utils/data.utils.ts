/**
 * Data Utilities - Test data generators and fixtures
 */

export class DataUtils {
  /**
   * Generate random string
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random email
   */
  static randomEmail(): string {
    return `user${this.randomString(6)}@test.com`;
  }

  /**
   * Generate random phone number
   */
  static randomPhone(): string {
    return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  }

  /**
   * Generate random zip code
   */
  static randomZipCode(): string {
    return String(Math.floor(Math.random() * 90000 + 10000));
  }

  /**
   * Get test users
   */
  static getTestUsers() {
    return [
      { username: 'standard_user', password: 'secret_sauce', expected: 'success' },
      { username: 'locked_out_user', password: 'secret_sauce', expected: 'locked' },
      { username: 'problem_user', password: 'secret_sauce', expected: 'success' },
      { username: 'performance_glitch_user', password: 'secret_sauce', expected: 'success' },
      { username: 'error_user', password: 'secret_sauce', expected: 'error' },
    ];
  }

  /**
   * Get product data
   */
  static getProducts() {
    return [
      { name: 'Sauce Labs Backpack', price: '$29.99', id: 'item-4' },
      { name: 'Sauce Labs Bike Light', price: '$9.99', id: 'item-5' },
      { name: 'Sauce Labs Bolt T-Shirt', price: '$15.99', id: 'item-6' },
      { name: 'Sauce Labs Fleece Jacket', price: '$49.99', id: 'item-7' },
      { name: 'Sauce Labs Onesie', price: '$7.99', id: 'item-8' },
      { name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99', id: 'item-3' },
    ];
  }

  /**
   * Get checkout data
   */
  static getCheckoutData() {
    return {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345',
    };
  }

  /**
   * Get sorting options
   */
  static getSortingOptions() {
    return [
      'Name (A to Z)',
      'Name (Z to A)',
      'Price (low to high)',
      'Price (high to low)',
    ];
  }
}
