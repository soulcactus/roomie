export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
}
