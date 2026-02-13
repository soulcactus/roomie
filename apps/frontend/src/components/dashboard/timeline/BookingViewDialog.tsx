'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatTimeRange } from '@/components/dashboard/format';
import type { Booking } from './types';

interface BookingViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

/**
 * 예약 상세 보기 다이얼로그
 */
export function BookingViewDialog({
  open,
  onOpenChange,
  booking,
}: BookingViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">회의 정보</DialogTitle>
        </DialogHeader>

        {booking && (
          <div className="mt-4 space-y-3.5">
            <InfoRow
              label="회의실 · 날짜"
              value={`${booking.roomName} · ${new Date(booking.startAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`}
            />
            <InfoRow label="회의명" value={booking.title} />
            <InfoRow
              label="시간"
              value={formatTimeRange(booking.startAt, booking.endAt)}
            />
            <InfoRow label="예약자" value={booking.reserverName} />

            <div className="grid gap-1.5">
              <p className="text-[12px] font-medium text-foreground">참석자</p>
              <div className="flex flex-wrap gap-1.5 text-[12px]">
                {booking.participantNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-[12px] text-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid gap-1.5">
      <p className="text-[12px] font-medium text-foreground">{label}</p>
      <p className="text-[14px] text-foreground">{value}</p>
    </div>
  );
}
