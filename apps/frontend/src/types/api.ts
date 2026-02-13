// 공통 응답 타입
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User 관련 타입
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

// Room 관련 타입
export interface Room {
  id: string;
  name: string;
  location?: string;
  capacity: number;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  name: string;
  location?: string;
  capacity: number;
  amenities?: string[];
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  isActive?: boolean;
}

// Booking 관련 타입
export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  room?: Pick<Room, 'id' | 'name' | 'location'>;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface CreateBookingDto {
  roomId: string;
  title: string;
  startAt: string; // ISO 8601
  endAt: string;   // ISO 8601
}

export interface UpdateBookingDto {
  title?: string;
  startAt?: string;
  endAt?: string;
}

// Auth 관련 타입
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
}

// 에러 타입
export interface ApiErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
}
