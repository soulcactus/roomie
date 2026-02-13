// Role enum
export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

// Booking Status enum
export const BookingStatus = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

// 공통 응답 타입
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

// 에러 응답 타입
export interface ApiErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
}

// 예약 충돌 에러 코드
export const ErrorCode = {
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
