'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpClient, ApiError } from '@/lib/http/client';

interface Booking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  room: {
    id: string;
    name: string;
    location?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateBookingDto {
  roomId: string;
  title: string;
  startAt: string;
  endAt: string;
}

interface BookingsResponse {
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useBookings(filters?: {
  roomId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.roomId) params.set('roomId', filters.roomId);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (filters?.page) params.set('page', String(filters.page));

  const queryString = params.toString();
  const endpoint = `/bookings${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => httpClient<BookingsResponse['data']>(endpoint),
  });
}

export function useMyBookings(page = 1) {
  return useQuery({
    queryKey: ['bookings', 'my', page],
    queryFn: () => httpClient<BookingsResponse['data']>(`/bookings/my?page=${page}`),
  });
}

export function useRoomBookings(roomId: string, date: string) {
  return useQuery({
    queryKey: ['bookings', 'room', roomId, date],
    queryFn: () => httpClient<Booking[]>(`/bookings/room/${roomId}?date=${date}`),
    enabled: !!roomId && !!date,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDto) =>
      httpClient<Booking>('/bookings', { method: 'POST', body: data }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('예약이 완료되었습니다.');
    },

    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast.error(
          '해당 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.',
        );
        return;
      }

      if (error.status === 401) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      toast.error(error.message ?? '예약에 실패했습니다. 다시 시도해주세요.');
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) =>
      httpClient<{ message: string }>(`/bookings/${bookingId}`, {
        method: 'DELETE',
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('예약이 취소되었습니다.');
    },

    onError: (error: ApiError) => {
      if (error.status === 403) {
        toast.error('본인의 예약만 취소할 수 있습니다.');
        return;
      }

      toast.error(error.message ?? '예약 취소에 실패했습니다.');
    },
  });
}
