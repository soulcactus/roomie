'use client';

import { Clock3 } from 'lucide-react';
import { useMemo } from 'react';
import { DAY_END_HOUR } from './constants';
import { useListboxDropdown } from './hooks/use-listbox-dropdown';
import { toTimeString } from './utils';

interface TimePickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TimePickerInput({ label, value, onChange }: TimePickerInputProps) {
  const timeOptions = useMemo(() => {
    const options: string[] = [];
    const endMinutes = DAY_END_HOUR * 60;

    for (let minutes = 0; minutes <= endMinutes; minutes += 30) {
      options.push(toTimeString(minutes));
    }

    return options;
  }, []);
  const {
    isOpen,
    activeIndex,
    rootRef,
    listRef,
    toggleOpen,
    selectValue,
    handleTriggerKeyDown,
  } = useListboxDropdown<string>({
    options: timeOptions,
    value,
    onSelect: onChange,
  });

  return (
    <div ref={rootRef} className="grid gap-1.5">
      <label className="text-[12px] font-medium text-foreground">{label}</label>

      <div className="relative">
        <button
          type="button"
          onClick={toggleOpen}
          onKeyDown={handleTriggerKeyDown}
          className="flex h-12 w-full items-center justify-between rounded-[10px] border border-gray-200 bg-gray-50/50 px-3 text-left text-[14px] text-foreground shadow-none transition-colors hover:bg-gray-100/60 focus:border-primary focus:outline-none"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{value}</span>
          <Clock3 className="h-4 w-4 text-brand-info" aria-hidden />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[10px] border border-gray-200 bg-popover shadow-[0_16px_30px_rgba(0,0,0,0.14)]">
            <div ref={listRef} className="pretty-scrollbar max-h-52 overflow-y-auto p-1">
              {timeOptions.map((time, index) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => selectValue(time)}
                  className={`w-full rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                    value === time
                      ? 'bg-brand-primary-light font-medium text-foreground'
                      : activeIndex === index
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  role="option"
                  aria-selected={value === time}
                  data-selected={value === time}
                  data-active={activeIndex === index}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
