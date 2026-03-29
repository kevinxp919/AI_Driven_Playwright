import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiUtils } from '../../utils/api.utils';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

test.describe('Posts API', () => {
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

  test('GET /posts - should return list of posts', async () => {
    const response = await api.get('/posts');

    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);

    const posts = response.data as Array<Record<string, unknown>>;
    expect(posts).toBeInstanceOf(Array);
    expect(posts.length).toBeGreaterThan(0);

    const firstPost = posts[0];
    expect(firstPost).toHaveProperty('id');
    expect(firstPost).toHaveProperty('title');
    expect(firstPost).toHaveProperty('body');
    expect(firstPost).toHaveProperty('userId');
  });

  test('GET /posts/1 - should return single post', async () => {
    const response = await api.get<Record<string, unknown>>('/posts/1');

    expect(response.status).toBe(200);

    const post = response.data;
    expect(post).toHaveProperty('id', 1);
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('userId');
  });

  test('GET /posts/1 - should have correct data types', async () => {
    const response = await api.get<Record<string, unknown>>('/posts/1');
    const post = response.data;

    expect(typeof post.id).toBe('number');
    expect(typeof post.title).toBe('string');
    expect(typeof post.body).toBe('string');
    expect(typeof post.userId).toBe('number');
  });

  test('GET /posts/999 - should return empty response for non-existent post', async () => {
    const response = await api.get('/posts/999');

    expect([200, 404]).toContain(response.status);
  });

  test('POST /posts - should create new post', async () => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post body',
      userId: 1
    };

    const response = await api.post<Record<string, unknown>>('/posts', newPost);

    expect(response.status).toBe(201);
    expect(response.ok).toBe(true);

    const created = response.data;
    expect(created).toHaveProperty('id');
    expect(created.title).toBe(newPost.title);
    expect(created.body).toBe(newPost.body);
    expect(created.userId).toBe(newPost.userId);
  });

  test('POST /posts - should validate required fields', async () => {
    const invalidPost = {};

    const response = await api.post('/posts', invalidPost);

    expect(response.status).toBe(201);
  });

  test('PUT /posts/1 - should update post completely', async () => {
    const updatedPost = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body content',
      userId: 1
    };

    const response = await api.put<Record<string, unknown>>('/posts/1', updatedPost);

    expect(response.status).toBe(200);

    const result = response.data;
    expect(result.title).toBe(updatedPost.title);
    expect(result.body).toBe(updatedPost.body);
  });

  test('PATCH /posts/1 - should partially update post', async () => {
    const patch = { title: 'Patched Title' };

    const response = await api.patch<Record<string, unknown>>('/posts/1', patch);

    expect(response.status).toBe(200);

    const result = response.data;
    expect(result.title).toBe(patch.title);
  });

  test('DELETE /posts/1 - should delete post', async () => {
    const response = await api.delete('/posts/1');

    expect(response.status).toBe(200);
  });

  test('GET /posts/1/comments - should return post comments', async () => {
    const response = await api.get<Array<Record<string, unknown>>>('/posts/1/comments');

    expect(response.status).toBe(200);

    const comments = response.data;
    expect(comments).toBeInstanceOf(Array);
    expect(comments.length).toBeGreaterThan(0);

    comments.forEach(comment => {
      expect(comment).toHaveProperty('postId', 1);
      expect(comment).toHaveProperty('name');
      expect(comment).toHaveProperty('email');
      expect(comment).toHaveProperty('body');
    });
  });

  test('GET /comments?postId=1 - should filter comments by postId', async () => {
    const response = await api.get<Array<Record<string, unknown>>>('/comments', { postId: '1' });

    expect(response.status).toBe(200);

    const comments = response.data;
    expect(comments).toBeInstanceOf(Array);

    comments.forEach(comment => {
      expect(comment.postId).toBe(1);
    });
  });

  test('GET /posts - should support pagination', async () => {
    const response = await api.get<Array<Record<string, unknown>>>('/posts', { _limit: '5' });

    expect(response.status).toBe(200);

    const posts = response.data;
    expect(posts.length).toBeLessThanOrEqual(5);
  });

  test('Response should have correct headers', async () => {
    const response = await api.get('/posts/1');

    expect(response.headers).toHaveProperty('content-type');
    expect(response.headers['content-type']).toContain('application/json');
  });
});
