import { RequestConfig, ApiResponse, ApiErrorResponse } from './types';

const BASE_URL =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    : '';
const API_PREFIX = '/api/v1';
const REFRESH_ENDPOINT = '/auth/refresh';
const LOGOUT_ENDPOINT = '/auth/logout';

let refreshPromise: Promise<boolean> | null = null;

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

function toApiUrl(endpoint: string) {
  return endpoint.startsWith('http') ? endpoint : `${BASE_URL}${API_PREFIX}${endpoint}`;
}

function isAuthRefreshRequest(url: string) {
  return url.includes(REFRESH_ENDPOINT);
}

function isAuthLogoutRequest(url: string) {
  return url.includes(LOGOUT_ENDPOINT);
}

async function tryRefreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshRes = await fetch(toApiUrl(REFRESH_ENDPOINT), {
      method: 'POST',
      credentials: 'include',
    });
    return refreshRes.ok;
  })()
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function forceLogoutAndRedirect() {
  try {
    await fetch(toApiUrl(LOGOUT_ENDPOINT), {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // no-op
  }

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
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
  const url = toApiUrl(endpoint);

  const runRequest = () =>
    fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache,
      next,
      credentials: 'include',
    });

  let res = await runRequest();

  if (
    res.status === 401 &&
    !isAuthRefreshRequest(url) &&
    !isAuthLogoutRequest(url)
  ) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      res = await runRequest();
    } else {
      await forceLogoutAndRedirect();
    }
  }

  if (!res.ok) {
    let errorData: ApiErrorResponse;
    try {
      const parsed = await res.json();
      const message =
        typeof parsed?.message === 'string'
          ? parsed.message
          : Array.isArray(parsed?.message)
            ? parsed.message.join(', ')
            : res.statusText;
      errorData = {
        ...parsed,
        message,
      };
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

  const parsed = await res.json();

  if (
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    'data' in parsed
  ) {
    return parsed as ApiResponse<T>;
  }

  // 백엔드가 raw payload를 반환해도 프론트는 동일한 data 래퍼로 사용
  return { data: parsed as T };
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
