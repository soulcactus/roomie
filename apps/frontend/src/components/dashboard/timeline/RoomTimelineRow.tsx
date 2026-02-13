'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeRange } from '@/components/dashboard/format';
import type { Booking } from './types';
import { TIMELINE_LAYOUT, DAY_START_HOUR, DAY_END_HOUR } from './constants';
import { BookingBar } from './BookingBar';

interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

interface RoomTimelineRowProps {
  room: Room;
  bookings: Booking[];
  now: Date;
  isTimelineShifted: boolean;
  isTimelineAtRightEdge: boolean;
  onCreateBooking: (roomId: string, roomName: string, minuteOffset: number) => void;
  onEditBooking: (booking: Booking) => void;
  onViewBooking: (booking: Booking) => void;
}

/**
 * 회의실별 타임라인 행 컴포넌트
 */
export function RoomTimelineRow({
  room,
  bookings,
  now,
  isTimelineShifted,
  isTimelineAtRightEdge,
  onCreateBooking,
  onEditBooking,
  onViewBooking,
}: RoomTimelineRowProps) {
  const currentBooking = bookings.find((booking) => {
    const nowMs = now.getTime();
    return (
      nowMs >= new Date(booking.startAt).getTime() &&
      nowMs <= new Date(booking.endAt).getTime()
    );
  });

  const attendees = currentBooking?.attendees ?? 0;
  const highlighted = Boolean(currentBooking);

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-booking-bar]')) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const offset = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const minuteOffset = (offset / rect.width) * (DAY_END_HOUR - DAY_START_HOUR) * 60;
    onCreateBooking(room.id, room.name, minuteOffset);
  };

  return (
    <div
      className={cn(
        'grid gap-2.5 border p-2.5',
        isTimelineAtRightEdge ? 'rounded-xl' : 'rounded-l-xl rounded-r-none',
        currentBooking
          ? 'border-blue-300/70 bg-blue-50/30 shadow-[0_14px_36px_rgba(59,130,246,0.24)]'
          : 'bg-background',
        highlighted && 'ring-2 ring-blue-400/35',
      )}
      style={{
        gridTemplateColumns: `${TIMELINE_LAYOUT.ROOM_INFO_WIDTH + 3}px minmax(0, 1fr)`,
      }}
    >
      {/* 회의실 정보 */}
      <div
        className={cn(
          'sticky left-0 z-20 flex h-[68px] flex-col justify-center bg-muted/70 px-2 backdrop-blur-sm backdrop-saturate-150',
          isTimelineShifted ? 'rounded-r-lg rounded-l-none' : 'rounded-lg',
        )}
      >
        <div className="flex items-center gap-1">
          <p className="text-[13px] font-semibold">{room.name}</p>
          <p className="text-[11px] text-muted-foreground">{room.location}</p>
        </div>

        <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
          <p className="min-w-0 font-semibold text-foreground/90">
            {currentBooking
              ? `${currentBooking.reserverName} · ${formatTimeRange(currentBooking.startAt, currentBooking.endAt)}`
              : '현재 예약 없음'}
          </p>
          <span className="mt-0.5 inline-flex items-center gap-0.5 tabular-nums">
            <Users className="h-2.5 w-2.5" />
            {attendees} / {room.capacity}
          </span>
        </div>
      </div>

      {/* 타임라인 */}
      <div
        className={cn(
          'relative h-[68px] bg-zinc-50',
          isTimelineAtRightEdge ? 'rounded-lg' : 'rounded-l-lg rounded-r-none',
        )}
        onClick={handleTimelineClick}
      >
        {bookings.map((booking) => (
          <BookingBar
            key={booking.id}
            booking={booking}
            roomName={room.name}
            onEdit={onEditBooking}
            onView={onViewBooking}
          />
        ))}
      </div>
    </div>
  );
}
