'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpClient } from '@/lib/http/client';
import { useUser } from '@/hooks/use-auth';
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

interface DashboardBookingApi {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  externalParticipants?: string[];
  room?: {
    id: string;
    name: string;
    location: string | null;
    capacity?: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  bookingParticipants?: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      role: 'USER' | 'ADMIN';
    };
  }>;
}

interface DashboardEmployeeApi {
  id: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface UseDashboardBookingsOptions {
  selectedDate: Date;
}

function getDayRangeParams(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

function isExternalParticipantName(name: string) {
  return name.startsWith('외부참석자');
}

/**
 * 예약 생성/수정/삭제와 상태를 관리하는 훅
 */
export function useDashboardBookings({ selectedDate }: UseDashboardBookingsOptions) {
  const queryClient = useQueryClient();
  const userQuery = useUser();
  const currentUserId = userQuery.data?.data.id;
  const currentUserName = userQuery.data?.data.name ?? CURRENT_USER;
  const dayRange = useMemo(() => getDayRangeParams(selectedDate), [selectedDate]);

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
    queryFn: () => httpClient<DashboardRoom[]>('/rooms?limit=100'),
  });

  const { data: todayBookingsResponse } = useQuery({
    queryKey: ['dashboard', 'bookings', 'today', dayRange.startDate, dayRange.endDate],
    queryFn: () =>
      httpClient<DashboardBookingApi[]>(
        `/bookings?startDate=${encodeURIComponent(dayRange.startDate)}&endDate=${encodeURIComponent(dayRange.endDate)}&limit=300`,
      ),
  });

  const { data: myBookingsResponse } = useQuery({
    queryKey: ['dashboard', 'bookings', 'mine'],
    queryFn: () => httpClient<DashboardBookingApi[]>('/bookings/my?limit=300'),
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ['dashboard', 'employees'],
    queryFn: () => httpClient<DashboardEmployeeApi[]>('/users/employees'),
  });

  const createBookingMutation = useMutation({
    mutationFn: (booking: {
      roomId: string;
      title: string;
      startAt: string;
      endAt: string;
      participantIds: string[];
      externalParticipants: string[];
    }) =>
      httpClient<DashboardBookingApi>('/bookings', {
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
    mutationFn: (input: {
      id: string;
      booking: {
        title: string;
        startAt: string;
        endAt: string;
        participantIds: string[];
        externalParticipants: string[];
      };
    }) =>
      httpClient<{ id: string }>(`/bookings/${input.id}`, {
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
      httpClient<{ id: string }>(`/bookings/${bookingId}`, {
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

  const rooms = useMemo(
    () =>
      (roomsResponse?.data ?? []).map((room) => ({
        ...room,
        location: room.location ?? '',
      })),
    [roomsResponse?.data],
  );

  const roomIdByName = useMemo(
    () => new Map(rooms.map((room) => [room.name, room.id] as const)),
    [rooms],
  );

  const participantOptions = useMemo(() => {
    const names = (employeesResponse?.data ?? []).map((employee) => employee.name);
    const merged = names.length > 0 ? names : [currentUserName];
    return Array.from(new Set([currentUserName, ...merged]));
  }, [currentUserName, employeesResponse?.data]);
  const employeeIdByName = useMemo(
    () =>
      new Map((employeesResponse?.data ?? []).map((employee) => [employee.name, employee.id] as const)),
    [employeesResponse?.data],
  );

  const allBookings = useMemo(() => {
    const today = todayBookingsResponse?.data ?? [];
    const myBookings = myBookingsResponse?.data ?? [];
    const myBookingIds = new Set(myBookings.map((booking) => booking.id));

    return Array.from(
      new Map(
        today.map((booking) => [
          booking.id,
          (() => {
            const isMine = myBookingIds.has(booking.id) || booking.userId === currentUserId;
            const participantNamesFromApi = (booking.bookingParticipants ?? []).map(
              ({ user }) => user.name,
            );
            const participantNames = Array.from(
              new Set([
                ...participantNamesFromApi,
                ...(booking.externalParticipants ?? []),
              ]),
            );
            const normalizedParticipantNames = participantNames.length
              ? participantNames
              : [booking.user?.name ?? currentUserName];
            const isIncluded =
              !isMine && normalizedParticipantNames.includes(currentUserName);
            const kind = isMine ? 'mine' : isIncluded ? 'included' : 'other';
            const reserverName = booking.user?.name ?? (isMine ? currentUserName : '사용자');
            const normalizedTitle = booking.title.replace(/\s*\(참여\)\s*$/, '');

            return {
              id: booking.id,
              title: normalizedTitle,
              roomName: booking.room?.name ?? '-',
              startAt: booking.startAt,
              endAt: booking.endAt,
              reserverName,
              participantNames: normalizedParticipantNames,
              attendees: normalizedParticipantNames.length,
              status: booking.status,
              kind,
            } satisfies Booking;
          })(),
        ]),
      ).values(),
    );
  }, [
    currentUserId,
    currentUserName,
    myBookingsResponse?.data,
    todayBookingsResponse?.data,
  ]);

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
      participants: [currentUserName],
      participantQuery: '',
    });
    setIsCreateOpen(true);
  };

  const openEditBooking = (booking: Booking) => {
    const normalizedParticipants = Array.from(
      new Set([currentUserName, ...booking.participantNames]),
    );

    setEditDraft({
      id: booking.id,
      roomId: roomIdByName.get(booking.roomName) ?? booking.roomName,
      roomName: booking.roomName,
      date: new Date(booking.startAt),
      startTime: toTimeString(toMinutes(booking.startAt)),
      endTime: toTimeString(toMinutes(booking.endAt)),
      title: booking.title,
      participants: normalizedParticipants.length ? normalizedParticipants : [currentUserName],
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

    createBookingMutation.mutate({
      roomId: draftBooking.roomId,
      title: draftBooking.title.trim() || '새 예약',
      startAt,
      endAt,
      participantIds: draftBooking.participants
        .filter((name) => !isExternalParticipantName(name))
        .map((name) => employeeIdByName.get(name))
        .filter((id): id is string => Boolean(id)),
      externalParticipants: draftBooking.participants.filter((name) =>
        isExternalParticipantName(name),
      ),
    });
  };

  const handleEditSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editDraft) return;

    const startAt = toDateTimeString(editDraft.date, editDraft.startTime);
    const endAt = toDateTimeString(editDraft.date, editDraft.endTime);

    editBookingMutation.mutate({
      id: editDraft.id,
      booking: {
        title: editDraft.title.trim() || '새 예약',
        startAt,
        endAt,
        participantIds: editDraft.participants
          .filter((name) => !isExternalParticipantName(name))
          .map((name) => employeeIdByName.get(name))
          .filter((id): id is string => Boolean(id)),
        externalParticipants: editDraft.participants.filter((name) =>
          isExternalParticipantName(name),
        ),
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
    participantOptions,
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
