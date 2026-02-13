// 인증 관련 상수
export const AUTH = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '14d',
  REFRESH_TOKEN_COOKIE_NAME: 'refresh_token',
} as const;

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// 예약 관련 상수
export const BOOKING = {
  MIN_DURATION_MINUTES: 15,
  MAX_DURATION_HOURS: 8,
  ADVANCE_BOOKING_DAYS: 30, // 최대 30일 전에 예약 가능
} as const;

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
