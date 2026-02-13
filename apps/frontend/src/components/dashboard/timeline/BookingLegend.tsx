import { cn } from '@/lib/utils';

const LEGEND_ITEMS = [
  { label: '내 예약', colorClass: 'bg-primary' },
  { label: '참여 회의', colorClass: 'bg-emerald-500' },
  { label: '다른 회의', colorClass: 'bg-cyan-500' },
] as const;

interface BookingLegendProps {
  variant?: 'mobile' | 'desktop';
}

/**
 * 예약 유형별 범례
 * - 모바일: 가로 정렬 (우측 정렬)
 * - 데스크톱: 세로 정렬
 */
export function BookingLegend({ variant = 'desktop' }: BookingLegendProps) {
  if (variant === 'mobile') {
    return (
      <div className="mb-1.5 flex max-w-full flex-wrap items-center justify-end gap-x-2.5 gap-y-1 text-[11px]">
        {LEGEND_ITEMS.map(({ label, colorClass }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-muted-foreground"
          >
            <span className={cn('h-2.5 w-2.5 rounded-full', colorClass)} />
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 px-1 text-[11px]">
      {LEGEND_ITEMS.map(({ label, colorClass }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-full', colorClass)} />
          <span className="text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
