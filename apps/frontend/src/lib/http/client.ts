import { RequestConfig, ApiResponse, ApiErrorResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 서버/클라이언트 공용 fetch 기반 HTTP 클라이언트
 *
 * 특징:
 * - credentials: 'include'로 HttpOnly Cookie 자동 전송
 * - 에러 시 ApiError 예외 발생 (status, message, code 포함)
 * - Next.js App Router의 cache/next 옵션 지원
 */
export async function httpClient<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers, cache, next } = config;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}/api/v1${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache,
    next,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText };
    }

    throw new ApiError(
      res.status,
      errorData.message ?? 'An error occurred',
      errorData.code,
    );
  }

  // 204 No Content 처리
  if (res.status === 204) {
    return { data: {} as T };
  }

  return res.json();
}

/**
 * GET 요청 헬퍼
 */
export function get<T>(
  endpoint: string,
  config: Omit<RequestConfig, 'method' | 'body'> = {},
) {
  return httpClient<T>(endpoint, { ...config, method: 'GET' });
}

/**
 * POST 요청 헬퍼
 */
export function post<T>(
  endpoint: string,
  body?: unknown,
  config: Omit<RequestConfig, 'method' | 'body'> = {},
) {
  return httpClient<T>(endpoint, { ...config, method: 'POST', body });
}

/**
 * PUT 요청 헬퍼
 */
export function put<T>(
  endpoint: string,
  body?: unknown,
  config: Omit<RequestConfig, 'method' | 'body'> = {},
) {
  return httpClient<T>(endpoint, { ...config, method: 'PUT', body });
}

/**
 * DELETE 요청 헬퍼
 */
export function del<T>(
  endpoint: string,
  config: Omit<RequestConfig, 'method' | 'body'> = {},
) {
  return httpClient<T>(endpoint, { ...config, method: 'DELETE' });
}
