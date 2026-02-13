'use client';

import { useMemo } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useListboxDropdown } from './hooks/use-listbox-dropdown';

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

/**
 * 날짜 선택 캘린더 컴포넌트
 * - 모바일: 년/월/일 드롭다운
 * - 데스크톱: react-day-picker 캘린더
 */
export function MiniCalendar({ selectedDate, onSelectDate }: MiniCalendarProps) {
  const yearOptions = useMemo(() => {
    const baseYear = selectedDate.getFullYear();
    return [baseYear - 1, baseYear, baseYear + 1];
  }, [selectedDate]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => idx + 1);
  }, []);

  const dayOptions = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, idx) => idx + 1);
  }, [selectedDate]);

  const updateSelectedDate = (next: {
    year?: number;
    month?: number;
    day?: number;
  }) => {
    const year = next.year ?? selectedDate.getFullYear();
    const month = (next.month ?? selectedDate.getMonth() + 1) - 1;
    const maxDay = new Date(year, month + 1, 0).getDate();
    const day = Math.min(next.day ?? selectedDate.getDate(), maxDay);
    onSelectDate(new Date(year, month, day));
  };

  return (
    <Card className="w-full overflow-hidden rounded-xl border-0 shadow-[0px_25px_50px_-12px_rgba(198,210,255,0.28)]">
      <CardContent className="p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold">날짜 선택</p>
        </div>

        {/* 모바일: 드롭다운 */}
        <div className="md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <DateSelect
              value={selectedDate.getFullYear()}
              options={yearOptions}
              suffix="년"
              onChange={(value) => updateSelectedDate({ year: value })}
            />
            <DateSelect
              value={selectedDate.getMonth() + 1}
              options={monthOptions}
              suffix="월"
              onChange={(value) => updateSelectedDate({ month: value })}
            />
            <DateSelect
              value={selectedDate.getDate()}
              options={dayOptions}
              suffix="일"
              onChange={(value) => updateSelectedDate({ day: value })}
            />
          </div>
        </div>

        {/* 데스크탑: 캘린더 */}
        <div className="hidden md:block">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              onSelectDate(date);
            }}
            className="rounded-md bg-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface DateSelectProps {
  value: number;
  options: number[];
  suffix: string;
  onChange: (value: number) => void;
}

function DateSelect({ value, options, suffix, onChange }: DateSelectProps) {
  const {
    isOpen,
    activeIndex,
    rootRef,
    listRef,
    toggleOpen,
    selectValue,
    handleTriggerKeyDown,
  } = useListboxDropdown<number>({
    options,
    value,
    onSelect: onChange,
  });

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-11 w-full items-center justify-between rounded-[10px] border border-gray-200 bg-gray-50/60 px-3 text-left text-[14px] text-foreground transition-colors hover:bg-gray-100/70 focus:border-primary focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="font-medium">
          {value}
          {suffix}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-brand-info transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[10px] border border-gray-200 bg-popover shadow-[0_16px_30px_rgba(0,0,0,0.14)]">
          <div ref={listRef} className="pretty-scrollbar max-h-52 overflow-y-auto p-1">
            {options.map((opt, index) => (
              <button
                key={opt}
                type="button"
                onClick={() => selectValue(opt)}
                className={`w-full rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                  value === opt
                    ? 'bg-brand-primary-light font-medium text-foreground'
                    : activeIndex === index
                      ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                role="option"
                aria-selected={value === opt}
                data-selected={value === opt}
                data-active={activeIndex === index}
              >
                {opt}
                {suffix}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
