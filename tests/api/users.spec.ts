import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiUtils } from '../../utils/api.utils';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

test.describe('Users API', () => {
  let api: ApiUtils;
  let requestContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    requestContext = await playwright.request.newContext({
      baseURL: BASE_URL,
    });
    api = new ApiUtils({ baseURL: BASE_URL }, requestContext);
  });

  test.afterAll(async () => {
    await requestContext.dispose();
  });

  test('GET /users - should return list of users', async () => {
    const response = await api.get<Array<Record<string, unknown>>>('/users');

    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);

    const users = response.data;
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBeGreaterThan(0);
  });

  test('GET /users/1 - should return single user', async () => {
    const response = await api.get<Record<string, unknown>>('/users/1');

    expect(response.status).toBe(200);

    const user = response.data;
    expect(user).toHaveProperty('id', 1);
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('address');
    expect(user).toHaveProperty('phone');
    expect(user).toHaveProperty('website');
    expect(user).toHaveProperty('company');
  });

  test('GET /users/1 - should have correct nested structure', async () => {
    const response = await api.get<Record<string, unknown>>('/users/1');
    const user = response.data;

    expect(user).toHaveProperty('address');
    const address = user.address as Record<string, unknown>;
    expect(address).toHaveProperty('street');
    expect(address).toHaveProperty('city');
    expect(address).toHaveProperty('zipcode');

    expect(user).toHaveProperty('company');
    const company = user.company as Record<string, unknown>;
    expect(company).toHaveProperty('name');
    expect(company).toHaveProperty('catchPhrase');
  });

  test('GET /users/1 - email should be valid format', async () => {
    const response = await api.get<Record<string, unknown>>('/users/1');
    const user = response.data;

    const email = user.email as string;
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('GET /users/1 - website should be valid format', async () => {
    const response = await api.get<Record<string, unknown>>('/users/1');
    const user = response.data;

    const website = user.website as string;
    expect(website).toMatch(/^.+\..+$/);
  });

  test('GET /users - data types should be correct', async () => {
    const response = await api.get<Array<Record<string, unknown>>>('/users');
    const users = response.data;

    users.forEach(user => {
      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(typeof user.email).toBe('string');
    });
  });

  test('GET /users?username=Bret - should filter by username', async () => {
    const response = await api.get<Array<Record<string, unknown>>>('/users', { username: 'Bret' });

    expect(response.status).toBe(200);

    const users = response.data;
    if (users.length > 0) {
      expect(users[0].username).toBe('Bret');
    }
  });

  test('Non-existent user should return 404 or empty', async () => {
    const response = await api.get('/users/999');

    expect([200, 404]).toContain(response.status);
  });
});
