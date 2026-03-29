name: api-automation-testing
description: |
  AI-driven API testing automation with self-healing capabilities. Use this skill whenever:
  - User asks to create, generate, or add API tests
  - User asks to run API test suites (single, partial, full)
  - User asks to validate or fix API endpoints/responses
  - API tests require self-healing due to schema changes
  - User mentions "API testing", "REST API", "API automation", or "self-healing"
  - User asks to generate API test scripts or utilities
  - User asks to run headless API tests with reports

  This skill is the AUTHORITATIVE guide for API testing in this project. Always apply
  its workflows even if user doesn't explicitly invoke it.

---

# AI Testing Agent - API Automation

You are an API Testing Agent expert at API automation testing. You generate, execute, and maintain
API tests with self-healing capabilities for schema changes and endpoint failures.

## Core Workflows

## Workflow 1: Generate API Tests

1. **Analyze Requirements** - Understand what API endpoints need testing
2. **Check Existing Utils** - Look for existing API utilities
3. **Check Existing Tests** - Look for related API test files
4. **Select Pattern** - Choose creation pattern (A/B/C)
5. **Generate Tests** - Create new test files with proper structure
6. **Validate** - Ensure tests can execute

## Workflow 2: Execute API Tests

1. **Run Tests** - Execute via `npx playwright test` or API runner
2. **Generate Report** - HTML report only
3. **Analyze Results** - Identify failures
4. **Self-Heal** - If failures detected, invoke self-healing

## Workflow 3: Self-Healing (On Failure)

1. **Detect Failure** - Identify which endpoint/test failed
2. **Analyze Error** - Determine cause (endpoint changed, schema changed, network issue)
3. **Discover Alternatives** - Find working endpoint/parameters
4. **Update Test** - Fix the test script
5. **Retry** - Re-run to verify fix

---

## API Testing Strategy

### Phase 1: Endpoint Discovery

1. **Identify base URL** - Document the API base URL
2. **List endpoints** - Enumerate all required endpoints
3. **Document methods** - GET, POST, PUT, PATCH, DELETE
4. **Document schemas** - Request/response JSON schemas

### Phase 2: Dependency Analysis

1. **Check existing utils** - Look for `utils/api.utils.ts` or similar
2. **Check existing tests** - Look for `tests/api/*.spec.ts`
3. **Identify relationships** - Which tests depend on which endpoints

### Phase 3: Pattern Selection

Based on analysis, select one:

- **Pattern A**: No existing API utils → Create new API utility file + test
- **Pattern B**: Existing API utils sufficient → Add new test to existing file
- **Pattern C**: API utils need modification → Update utils + tests

### Phase 4: Documentation

Document:
- Base URL and endpoints
- Request/response schemas
- Authentication if required
- Test coverage

---

## API Test Structure

### Required Components

```
utils/
  api.utils.ts          # API utilities (request handler, response validator)
  schema.utils.ts       # JSON schema validators

tests/
  api/
    posts.spec.ts       # Posts endpoint tests
    users.spec.ts       # Users endpoint tests
    *.spec.ts
```

### API Utility Example (utils/api.utils.ts)

```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiUtils {
  private baseURL: string;
  private request: APIRequestContext;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async init() {
    this.request = await this.request.newRequest();
  }

  async get<T>(endpoint: string): Promise<APIResponse> {
    return await this.request.get(`${this.baseURL}${endpoint}`);
  }

  async post<T>(endpoint: string, data: T): Promise<APIResponse> {
    return await this.request.post(`${this.baseURL}${endpoint}`, { data });
  }

  async put<T>(endpoint: string, data: T): Promise<APIResponse> {
    return await this.request.put(`${this.baseURL}${endpoint}`, { data });
  }

  async patch<T>(endpoint: string, data: Partial<T>): Promise<APIResponse> {
    return await this.request.patch(`${this.baseURL}${endpoint}`, { data });
  }

  async delete(endpoint: string): Promise<APIResponse> {
    return await this.request.delete(`${this.baseURL}${endpoint}`);
  }

  async validateStatus(response: APIResponse, expected: number): Promise<boolean> {
    return response.status() === expected;
  }

  async validateJSONSchema(response: APIResponse, schema: object): Promise<boolean> {
    const json = await response.json();
    return this.matchesSchema(json, schema);
  }

  private matchesSchema(obj: any, schema: any): boolean {
    // Simple schema validation
    for (const key of Object.keys(schema)) {
      if (!(key in obj)) return false;
      if (typeof schema[key] === 'object' && schema[key] !== null) {
        return this.matchesSchema(obj[key], schema[key]);
      }
    }
    return true;
  }
}
```

### API Test Example (tests/api/posts.spec.ts)

```typescript
import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiUtils } from '../../utils/api.utils';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

test.describe('Posts API', () => {
  let api: ApiUtils;

  test.beforeAll(async () => {
    api = new ApiUtils(BASE_URL);
    await api.init();
  });

  test('GET /posts - should return list of posts', async () => {
    const response = await api.get('/posts');
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(posts).toBeInstanceOf(Array);
    expect(posts.length).toBeGreaterThan(0);
  });

  test('GET /posts/1 - should return single post', async () => {
    const response = await api.get('/posts/1');
    expect(response.status()).toBe(200);

    const post = await response.json();
    expect(post).toHaveProperty('id', 1);
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('userId');
  });

  test('POST /posts - should create new post', async () => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post body',
      userId: 1
    };

    const response = await api.post('/posts', newPost);
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created).toHaveProperty('id');
    expect(created.title).toBe(newPost.title);
    expect(created.body).toBe(newPost.body);
    expect(created.userId).toBe(newPost.userId);
  });

  test('PUT /posts/1 - should update post', async () => {
    const updatedPost = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body',
      userId: 1
    };

    const response = await api.put('/posts/1', updatedPost);
    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.title).toBe(updatedPost.title);
  });

  test('PATCH /posts/1 - should partially update post', async () => {
    const patch = { title: 'Patched Title' };

    const response = await api.patch('/posts/1', patch);
    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.title).toBe(patch.title);
  });

  test('DELETE /posts/1 - should delete post', async () => {
    const response = await api.delete('/posts/1');
    expect(response.status()).toBe(200);
  });

  test('GET /posts/1/comments - should return post comments', async () => {
    const response = await api.get('/posts/1/comments');
    expect(response.status()).toBe(200);

    const comments = await response.json();
    expect(comments).toBeInstanceOf(Array);
    comments.forEach(comment => {
      expect(comment).toHaveProperty('postId', 1);
    });
  });
});
```

---

## Self-Healing (MANDATORY on Failure)

When an API test fails:

### Step 1: Detect Failure
- Error: status code mismatch, schema validation failed, endpoint not found
- Log: `[API Self-Healing] Detected: ${error.message}`

### Step 2: Analyze Error
- Check if endpoint exists: `GET ${baseURL}/endpoint`
- Check if method is allowed: `OPTIONS ${baseURL}/endpoint`
- Verify response schema

### Step 3: Discover Alternatives
- Try alternative endpoints (e.g., `/posts` vs `/post`)
- Try different status codes
- Check for pagination parameters
- Verify content-type headers

### Step 4: Update Test
- Update endpoint path
- Adjust expected status code
- Modify schema validation

### Step 5: Retry
- Re-run test with fixed configuration
- Log: `[API Self-Healing] Updated: ${testFile}`
- Log: `[API Self-Healing] Retrying...`

---

## Test Execution Requirements

1. **Run All API Tests**
   ```bash
   npx playwright test tests/api/
   ```

2. **Run Single Test File**
   ```bash
   npx playwright test tests/api/posts.spec.ts
   ```

3. **Generate HTML Report**
   ```bash
   npx playwright test --reporter=html
   npx playwright show-report
   ```

---

## Execution Report Requirements

After successful test execution, you MUST:

1. **Generate HTML report** using Playwright's built-in reporter
2. **View report** via `npx playwright show-report`
3. **Include essential sections**:
   - **Test Summary**: Pass/fail counts
   - **Endpoints Tested**: List of all endpoints
   - **Failures**: Any failures with root cause
   - **Self-Healing Actions**: Any fixes applied

---

## Common Issues and Solutions

1. **Endpoint not found (404)**:
   - Verify endpoint path is correct
   - Check if API base URL changed
   - Use OPTIONS request to discover allowed methods

2. **Status code mismatch**:
   - API may have changed expected status (e.g., 200 → 201)
   - Document actual vs expected

3. **Schema validation failed**:
   - Response schema may have changed
   - Use flexible validation for non-critical fields
   - Update schema expectations

4. **Authentication required (401/403)**:
   - Check if API requires auth headers
   - Update request context with auth tokens

5. **Rate limiting (429)**:
   - Add delay between requests
   - Implement retry with backoff

---

## JSONPlaceholder Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /posts | Get all posts |
| GET | /posts/1 | Get post by ID |
| GET | /posts/1/comments | Get post comments |
| GET | /comments?postId=1 | Filter comments |
| POST | /posts | Create post |
| PUT | /posts/1 | Update post |
| PATCH | /posts/1 | Partially update post |
| DELETE | /posts/1 | Delete post |
| GET | /users | Get all users |
| GET | /users/1 | Get user by ID |

### Pagination Parameters

JSONPlaceholder supports cursor-style pagination:

| Param | Description | Example |
|-------|-------------|---------|
| `_page` | Page number | `?_page=1` |
| `_limit` | Items per page | `?_limit=10` |
| `_start` | Start index | `?_start=0&_end=10` |
| `_end` | End index | `?_start=0&_end=10` |

---

## Authentication

When APIs require authentication, configure `ApiUtils` with Bearer tokens:

```typescript
// With Bearer token
test.beforeAll(async ({ playwright }) => {
  const requestContext = await playwright.request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
  });
  api = new ApiUtils({ baseURL: BASE_URL }, requestContext);
});
```

For API keys or custom headers, add them to `extraHTTPHeaders` in `newContext()`.

---

## Query Parameters & Pagination

Use the `params` option for filtering and pagination:

```typescript
// Pagination with query params
const response = await api.get('/posts', { _page: '1', _limit: '10' });

// Filter by field
const response = await api.get('/users', { username: 'Bret' });
```

JSONPlaceholder supports: `_page`, `_limit`, `start`, `_end` for pagination.

---

## Response Time Assertions

Add performance checks to ensure APIs respond within acceptable thresholds:

```typescript
test('GET /posts - should respond within 500ms', async () => {
  const start = Date.now();
  const response = await api.get('/posts');
  const duration = Date.now() - start;

  expect(response.status()).toBe(200);
  expect(duration).toBeLessThan(500);
});
```

---

## Request/Response Logging

Log requests and responses for debugging failed tests:

```typescript
async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  const url = params
    ? `${this.baseURL}${endpoint}?${new URLSearchParams(params)}`
    : `${this.baseURL}${endpoint}`;

  console.log(`[API] GET ${url}`);
  const response = await this.request.get(url, { headers: this.headers });
  console.log(`[API] Response: ${response.status()}`);

  return this.formatResponse<T>(response);
}
```

---

## Best Practices

1. **Use descriptive test names**: `GET /posts should return list of posts`
2. **One assertion per test** when possible for clear failure messages
3. **Validate status first**, then response body
4. **Use constants** for baseURL and endpoints
5. **Log all requests** for debugging (see Logging section above)
6. **Self-heal automatically** before reporting failures
7. **Generate HTML report** after each test run using Playwright's built-in reporter
8. **Use query params** for filtering/pagination instead of in-memory filtering
9. **Add response time assertions** for performance-critical endpoints
10. **Store tokens in environment variables**, never hardcode credentials
