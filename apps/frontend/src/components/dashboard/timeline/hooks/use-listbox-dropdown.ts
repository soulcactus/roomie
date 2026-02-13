'use client';

import { useEffect, useRef, useState } from 'react';

interface UseListboxDropdownOptions<T> {
  options: T[];
  value: T;
  onSelect: (value: T) => void;
}

export function useListboxDropdown<T extends string | number>({
  options,
  value,
  onSelect,
}: UseListboxDropdownOptions<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const selectedIndex = Math.max(options.indexOf(value), 0);
    setActiveIndex(selectedIndex);
  }, [isOpen, options, value]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;

    const listEl = listRef.current;
    const activeEl = listEl.querySelector<HTMLElement>('[data-active="true"]');
    if (!activeEl) return;

    requestAnimationFrame(() => {
      const targetTop =
        activeEl.offsetTop - listEl.clientHeight / 2 + activeEl.clientHeight / 2;
      listEl.scrollTop = Math.max(0, targetTop);
    });
  }, [activeIndex, isOpen]);

  const selectValue = (nextValue: T) => {
    onSelect(nextValue);
    setIsOpen(false);
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      if (!isOpen) return;
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((prev) => {
        const next = prev + direction;
        return Math.min(Math.max(next, 0), options.length - 1);
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const activeValue = options[activeIndex];
      if (activeValue !== undefined) selectValue(activeValue);
      return;
    }

    if (event.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return {
    isOpen,
    activeIndex,
    rootRef,
    listRef,
    toggleOpen,
    selectValue,
    handleTriggerKeyDown,
  };
}
