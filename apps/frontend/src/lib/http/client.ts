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
 * 서버/클라이언트 공용 요청 클라이언트
 *
 * 특징:
 * - `credentials: 'include'`로 HttpOnly 쿠키 자동 전송
 * - 오류 발생 시 `ApiError` 예외 반환 (status, message, code 포함)
 * - Next.js App Router의 `cache`/`next` 옵션 사용 가능
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

  // 204 응답(본문 없음) 처리
  if (res.status === 204) {
    return { data: {} as T };
  }

  return res.json();
}

/**
 * 조회 요청 도우미
 */
export function get<T>(
  endpoint: string,
  config: Omit<RequestConfig, 'method' | 'body'> = {},
) {
  return httpClient<T>(endpoint, { ...config, method: 'GET' });
}

/**
 * 생성 요청 도우미
 */
export function post<T>(
  endpoint: string,
  body?: unknown,
  config: Omit<RequestConfig, 'method' | 'body'> = {},
) {
  return httpClient<T>(endpoint, { ...config, method: 'POST', body });
}

/**
 * 수정 요청 도우미
 */
export function put<T>(
  endpoint: string,
  body?: unknown,
  config: Omit<RequestConfig, 'method' | 'body'> = {},
) {
  return httpClient<T>(endpoint, { ...config, method: 'PUT', body });
}

/**
 * 삭제 요청 도우미
 */
export function del<T>(
  endpoint: string,
  config: Omit<RequestConfig, 'method' | 'body'> = {},
) {
  return httpClient<T>(endpoint, { ...config, method: 'DELETE' });
}
