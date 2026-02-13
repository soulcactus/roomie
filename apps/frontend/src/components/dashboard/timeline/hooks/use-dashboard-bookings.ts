'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpClient } from '@/lib/http/client';
import type { Booking, BookingDraft, EditBookingDraft } from '../types';
import { CURRENT_USER, DAY_START_HOUR, DAY_END_HOUR } from '../constants';
import {
  toMinutes,
  toMinutesFromTime,
  toTimeString,
  toDateTimeString,
  isSameDay,
} from '../utils';

interface DashboardRoom {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

interface UseDashboardBookingsOptions {
  selectedDate: Date;
}

/**
 * 예약 생성/수정/삭제와 상태를 관리하는 훅
 */
export function useDashboardBookings({ selectedDate }: UseDashboardBookingsOptions) {
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [draftBooking, setDraftBooking] = useState<BookingDraft | null>(null);
  const [editDraft, setEditDraft] = useState<EditBookingDraft | null>(null);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);
  const [isEditChecking, setIsEditChecking] = useState(false);
  const [isEditSlotAvailable, setIsEditSlotAvailable] = useState(true);

  const { data: roomsResponse } = useQuery({
    queryKey: ['dashboard', 'rooms'],
    queryFn: () => httpClient<DashboardRoom[]>('/dashboard/rooms'),
  });

  const { data: todayBookingsResponse } = useQuery({
    queryKey: ['dashboard', 'bookings', 'today'],
    queryFn: () => httpClient<Booking[]>('/dashboard/bookings'),
  });

  const { data: myBookingsResponse } = useQuery({
    queryKey: ['dashboard', 'bookings', 'mine'],
    queryFn: () => httpClient<Booking[]>('/dashboard/bookings?mine=true'),
  });

  const createBookingMutation = useMutation({
    mutationFn: (booking: Booking) =>
      httpClient<Booking>('/dashboard/bookings', {
        method: 'POST',
        body: booking,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'bookings'] });
      toast.success('예약이 등록되었습니다.');
      setIsCreateOpen(false);
    },
    onError: () => {
      toast.error('예약 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    },
  });

  const editBookingMutation = useMutation({
    mutationFn: (input: { id: string; booking: Booking }) =>
      httpClient<{ id: string }>(`/dashboard/bookings/${input.id}`, {
        method: 'PUT',
        body: input.booking,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'bookings'] });
      toast.success('예약이 수정되었습니다.');
      setIsEditOpen(false);
    },
    onError: () => {
      toast.error('예약 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      httpClient<{ id: string }>(`/dashboard/bookings/${bookingId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'bookings'] });
      toast.success('예약이 삭제되었습니다.');
      setIsEditOpen(false);
    },
    onError: () => {
      toast.error('예약 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    },
  });

  const rooms = useMemo(() => roomsResponse?.data ?? [], [roomsResponse?.data]);

  const roomIdByName = useMemo(
    () => new Map(rooms.map((room) => [room.name, room.id] as const)),
    [rooms],
  );

  const allBookings = useMemo(() => {
    const today = todayBookingsResponse?.data ?? [];
    const mine = myBookingsResponse?.data ?? [];

    return Array.from(
      new Map(
        [...today, ...mine].map((booking) => [
          `${booking.id}-${booking.roomName}-${booking.startAt}-${booking.endAt}`,
          booking,
        ]),
      ).values(),
    );
  }, [myBookingsResponse?.data, todayBookingsResponse?.data]);

  const bookings = useMemo(
    () => allBookings.filter((booking) => isSameDay(new Date(booking.startAt), selectedDate)),
    [allBookings, selectedDate],
  );

  const selectedRoomCapacity = useMemo(() => {
    if (!draftBooking) return undefined;
    return rooms.find((room) => room.name === draftBooking.roomName)?.capacity;
  }, [draftBooking, rooms]);

  const editRoomCapacity = useMemo(() => {
    if (!editDraft) return undefined;
    return rooms.find((room) => room.name === editDraft.roomName)?.capacity;
  }, [editDraft, rooms]);

  useEffect(() => {
    if (!draftBooking) return;

    const startMinutes = toMinutesFromTime(draftBooking.startTime);
    const endMinutes = toMinutesFromTime(draftBooking.endTime);
    const hasValidTime = endMinutes > startMinutes;

    if (!hasValidTime) {
      setIsSlotAvailable(false);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const timer = window.setTimeout(() => {
      const overlapping = allBookings.some((booking) => {
        if (booking.roomName !== draftBooking.roomName) return false;
        if (!isSameDay(new Date(booking.startAt), draftBooking.date)) return false;

        const bookingStart = toMinutes(booking.startAt);
        const bookingEnd = toMinutes(booking.endAt);
        return startMinutes < bookingEnd && endMinutes > bookingStart;
      });

      setIsSlotAvailable(!overlapping);
      setIsChecking(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [allBookings, draftBooking]);

  useEffect(() => {
    if (!editDraft) return;

    const startMinutes = toMinutesFromTime(editDraft.startTime);
    const endMinutes = toMinutesFromTime(editDraft.endTime);
    const hasValidTime = endMinutes > startMinutes;

    if (!hasValidTime) {
      setIsEditSlotAvailable(false);
      setIsEditChecking(false);
      return;
    }

    setIsEditChecking(true);
    const timer = window.setTimeout(() => {
      const overlapping = allBookings.some((booking) => {
        if (booking.id === editDraft.id) return false;
        if (booking.roomName !== editDraft.roomName) return false;
        if (!isSameDay(new Date(booking.startAt), editDraft.date)) return false;

        const bookingStart = toMinutes(booking.startAt);
        const bookingEnd = toMinutes(booking.endAt);
        return startMinutes < bookingEnd && endMinutes > bookingStart;
      });

      setIsEditSlotAvailable(!overlapping);
      setIsEditChecking(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [allBookings, editDraft]);

  const canSubmit = Boolean(
    draftBooking &&
      draftBooking.title.trim().length > 0 &&
      toMinutesFromTime(draftBooking.endTime) > toMinutesFromTime(draftBooking.startTime) &&
      isSlotAvailable &&
      !isChecking &&
      !createBookingMutation.isPending,
  );

  const canEditSubmit = Boolean(
    editDraft &&
      editDraft.title.trim().length > 0 &&
      toMinutesFromTime(editDraft.endTime) > toMinutesFromTime(editDraft.startTime) &&
      isEditSlotAvailable &&
      !isEditChecking &&
      !editBookingMutation.isPending,
  );

  const openCreateBooking = (
    roomId: string,
    roomName: string,
    minuteOffset: number,
  ) => {
    const step = 30;
    const dayMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
    const rounded = Math.round(minuteOffset / step) * step;
    const clamped = Math.min(Math.max(rounded, 0), dayMinutes - 60);
    const startMinutes = DAY_START_HOUR * 60 + clamped;
    const endMinutes = Math.min(startMinutes + 60, DAY_END_HOUR * 60);

    setDraftBooking({
      roomId,
      roomName,
      date: selectedDate,
      startTime: toTimeString(startMinutes),
      endTime: toTimeString(endMinutes),
      title: '',
      participants: [CURRENT_USER],
      participantQuery: '',
    });
    setIsCreateOpen(true);
  };

  const openEditBooking = (booking: Booking) => {
    setEditDraft({
      id: booking.id,
      roomId: roomIdByName.get(booking.roomName) ?? booking.roomName,
      roomName: booking.roomName,
      date: new Date(booking.startAt),
      startTime: toTimeString(toMinutes(booking.startAt)),
      endTime: toTimeString(toMinutes(booking.endAt)),
      title: booking.title,
      participants: booking.participantNames.length
        ? booking.participantNames
        : [CURRENT_USER],
      participantQuery: '',
    });
    setIsEditOpen(true);
  };

  const openViewBooking = (booking: Booking) => {
    setViewBooking(booking);
    setIsViewOpen(true);
  };

  const handleCreateSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draftBooking) return;

    const startAt = toDateTimeString(draftBooking.date, draftBooking.startTime);
    const endAt = toDateTimeString(draftBooking.date, draftBooking.endTime);
    const participantNames =
      draftBooking.participants.length > 0 ? draftBooking.participants : [CURRENT_USER];

    createBookingMutation.mutate({
      id: `local-${Date.now()}`,
      title: draftBooking.title.trim() || '새 예약',
      roomName: draftBooking.roomName,
      startAt,
      endAt,
      reserverName: CURRENT_USER,
      participantNames,
      attendees: Math.max(1, participantNames.length),
      status: 'CONFIRMED',
    });
  };

  const handleEditSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editDraft) return;

    const startAt = toDateTimeString(editDraft.date, editDraft.startTime);
    const endAt = toDateTimeString(editDraft.date, editDraft.endTime);
    const participantNames =
      editDraft.participants.length > 0 ? editDraft.participants : [CURRENT_USER];

    editBookingMutation.mutate({
      id: editDraft.id,
      booking: {
        id: editDraft.id,
        title: editDraft.title.trim() || '새 예약',
        roomName: editDraft.roomName,
        startAt,
        endAt,
        reserverName: CURRENT_USER,
        participantNames,
        attendees: Math.max(1, participantNames.length),
        status: 'CONFIRMED',
      },
    });
  };

  const handleDeleteBooking = (bookingId: string) => {
    const confirmed = window.confirm(
      '예약을 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
    );
    if (!confirmed) return;

    deleteBookingMutation.mutate(bookingId);
  };

  return {
    rooms,
    bookings,
    allBookings,

    isCreateOpen,
    setIsCreateOpen,
    draftBooking,
    setDraftBooking,
    selectedRoomCapacity,
    canSubmit,
    openCreateBooking,
    handleCreateSubmit,

    isEditOpen,
    setIsEditOpen,
    editDraft,
    setEditDraft,
    editRoomCapacity,
    canEditSubmit,
    openEditBooking,
    handleEditSubmit,
    handleDeleteBooking,

    isViewOpen,
    setIsViewOpen,
    viewBooking,
    openViewBooking,
  };
}
