'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatTimeRange } from '@/components/dashboard/format';
import type { Booking, BookingKind } from './types';
import { toPercent, getBookingKind } from './utils';

interface BookingBarProps {
  booking: Booking;
  roomName: string;
  onEdit: (booking: Booking) => void;
  onView: (booking: Booking) => void;
}

const KIND_STYLES: Record<BookingKind, string> = {
  mine: 'border-indigo-300/75 bg-indigo-600',
  included: 'border-emerald-300/75 bg-emerald-600',
  other: 'border-cyan-300/75 bg-cyan-600',
};

const KIND_LABELS: Record<BookingKind, string> = {
  mine: '내 예약',
  included: '참여 회의',
  other: '다른 회의',
};

/**
 * 타임라인 예약 바 컴포넌트
 */
export function BookingBar({ booking, roomName, onEdit, onView }: BookingBarProps) {
  const kind = getBookingKind(booking);
  const left = toPercent(booking.startAt);
  const right = toPercent(booking.endAt);
  const visualCompensation = 0.2;
  const width = Math.max(Math.min(right - left + visualCompensation, 100 - left), 0.8);

  const bookingLabel =
    kind === 'mine'
      ? `내 예약(${booking.title})`
      : kind === 'included'
        ? `참여 회의(${booking.title})`
        : booking.title;

  const handleClick = () => {
    if (kind === 'mine') {
      onEdit(booking);
    } else {
      onView(booking);
    }
  };

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'absolute top-1/2 h-7 -translate-y-1/2 rounded-md border px-2 text-[10px] text-white shadow-[0_4px_10px_rgba(30,64,175,0.22)]',
              KIND_STYLES[kind],
              kind === 'mine' && 'cursor-pointer',
            )}
            style={{
              left: `${left}%`,
              width: `${width}%`,
            }}
            data-booking-bar
            aria-label={`${bookingLabel} 상세 정보 보기`}
            onClick={handleClick}
          >
            <div className="flex h-full items-center justify-between gap-2 overflow-hidden">
              <span className="truncate font-medium">{bookingLabel}</span>
              <span className="shrink-0 inline-flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px]">
                <Users className="h-3 w-3" />
                {booking.attendees}
              </span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="min-w-[180px]">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">{booking.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {KIND_LABELS[kind]} · {roomName}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatTimeRange(booking.startAt, booking.endAt)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              예약자 {booking.reserverName} · 참석 {booking.attendees}명
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
