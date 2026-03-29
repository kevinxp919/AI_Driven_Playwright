import { APIRequestContext } from '@playwright/test';

export interface ApiConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
  ok: boolean;
}

export class ApiUtils {
  private baseURL: string;
  private headers: Record<string, string>;
  private timeout: number;
  private request: APIRequestContext;

  constructor(config: ApiConfig, request: APIRequestContext) {
    this.baseURL = config.baseURL;
    this.headers = config.headers || { 'Content-Type': 'application/json' };
    this.timeout = config.timeout || 30000;
    this.request = request;
  }

  async get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params
      ? `${this.baseURL}${endpoint}?${new URLSearchParams(params)}`
      : `${this.baseURL}${endpoint}`;

    const response = await this.request.get(url, {
      headers: this.headers,
      timeout: this.timeout,
    });

    return this.formatResponse<T>(response);
  }

  async post<T = unknown>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.headers,
      timeout: this.timeout,
    });

    return this.formatResponse<T>(response);
  }

  async put<T = unknown>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await this.request.put(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.headers,
      timeout: this.timeout,
    });

    return this.formatResponse<T>(response);
  }

  async patch<T = unknown>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await this.request.patch(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.headers,
      timeout: this.timeout,
    });

    return this.formatResponse<T>(response);
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
      timeout: this.timeout,
    });

    return this.formatResponse<T>(response);
  }

  async head(endpoint: string): Promise<ApiResponse<void>> {
    const response = await this.request.head(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
      timeout: this.timeout,
    });

    return this.formatResponse<void>(response);
  }

  async options(endpoint: string): Promise<ApiResponse<void>> {
    const response = await this.request.fetch(`${this.baseURL}${endpoint}`, {
      method: 'OPTIONS',
      headers: this.headers,
      timeout: this.timeout,
    });

    return this.formatResponse<void>(response);
  }

  private async formatResponse<T>(response: { status: () => number; ok: () => boolean; headers: () => Record<string, string>; json: () => Promise<T>; text: () => Promise<string> }): Promise<ApiResponse<T>> {
    const status = response.status();
    const contentType = response.headers()['content-type'] || '';
    let data: T;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as unknown as T;
    }

    return {
      status,
      data,
      headers: response.headers(),
      ok: response.ok(),
    };
  }

  validateStatus(response: ApiResponse, expected: number): boolean {
    return response.status === expected;
  }

  validateProperty(obj: unknown, path: string, expectedValue: unknown): boolean {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || current === undefined) return false;
      current = (current as Record<string, unknown>)[key];
    }

    return current === expectedValue;
  }

  validateSchema(obj: unknown, schema: Record<string, string>): boolean {
    if (typeof obj !== 'object' || obj === null) return false;

    for (const [key, type] of Object.entries(schema)) {
      const value = (obj as Record<string, unknown>)[key];
      if (value === undefined) return false;

      switch (type) {
        case 'string':
          if (typeof value !== 'string') return false;
          break;
        case 'number':
          if (typeof value !== 'number') return false;
          break;
        case 'boolean':
          if (typeof value !== 'boolean') return false;
          break;
        case 'array':
          if (!Array.isArray(value)) return false;
          break;
        case 'object':
          if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
          break;
      }
    }
    return true;
  }
}

// Factory function for creating API utils with request fixture
export function createApiUtils(baseURL: string, request: APIRequestContext): ApiUtils {
  return new ApiUtils({ baseURL }, request);
}
