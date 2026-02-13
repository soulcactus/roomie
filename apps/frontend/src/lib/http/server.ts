import { cookies } from 'next/headers';
import { httpClient } from './client';
import { RequestConfig, ApiResponse } from './types';

/**
 * 서버 컴포넌트 전용 fetch 함수
 *
 * 특징:
 * - cookies()에서 access_token을 읽어 Authorization 헤더에 주입
 * - 기본적으로 no-store 캐싱 (동적 데이터)
 * - 서버 컴포넌트에서만 사용 가능
 */
export async function serverFetch<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  return httpClient<T>(endpoint, {
    ...config,
    headers: {
      ...config.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    cache: config.cache ?? 'no-store',
  });
}
