'use client';

import { useEffect, useRef, useState } from 'react';

interface UseDashboardTimelineScrollOptions {
  viewState: 'loading' | 'success' | 'empty' | 'error';
  selectedDate: Date;
  isToday: boolean;
}

export function useDashboardTimelineScroll({
  viewState,
  selectedDate,
  isToday,
}: UseDashboardTimelineScrollOptions) {
  const [now, setNow] = useState(() => new Date());
  const [isTimelineShifted, setIsTimelineShifted] = useState(false);
  const [isTimelineAtRightEdge, setIsTimelineAtRightEdge] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const nowLineRef = useRef<HTMLDivElement | null>(null);

  const syncTimelineScrollState = (scroller: HTMLDivElement) => {
    const nextShifted = scroller.scrollLeft > 0;
    const maxScrollLeft = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    const nextAtRightEdge = maxScrollLeft === 0 || scroller.scrollLeft >= maxScrollLeft - 1;

    setIsTimelineShifted((prev) => (prev === nextShifted ? prev : nextShifted));
    setIsTimelineAtRightEdge((prev) =>
      prev === nextAtRightEdge ? prev : nextAtRightEdge,
    );
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    syncTimelineScrollState(event.currentTarget);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (viewState !== 'success' || !isToday) return;

    const syncScrollToNow = () => {
      const scroller = scrollContainerRef.current;
      const nowLine = nowLineRef.current;
      if (!scroller || !nowLine) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const lineRect = nowLine.getBoundingClientRect();
      const isMobile =
        typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
      const desiredViewportX = scroller.clientWidth * (isMobile ? 0.56 : 0.5);
      const delta = lineRect.left - scrollerRect.left - desiredViewportX;
      scroller.scrollLeft += delta;
    };

    const raf = requestAnimationFrame(syncScrollToNow);
    window.addEventListener('resize', syncScrollToNow);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', syncScrollToNow);
    };
  }, [viewState, selectedDate, isToday]);

  useEffect(() => {
    if (viewState !== 'success' || isToday) return;

    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    const raf = requestAnimationFrame(() => {
      scroller.scrollLeft = 0;
    });

    return () => cancelAnimationFrame(raf);
  }, [viewState, selectedDate, isToday]);

  useEffect(() => {
    if (viewState !== 'success') return;
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    const raf = requestAnimationFrame(() => syncTimelineScrollState(scroller));
    const handleResize = () => syncTimelineScrollState(scroller);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [viewState, selectedDate]);

  return {
    now,
    scrollContainerRef,
    nowLineRef,
    isTimelineShifted,
    isTimelineAtRightEdge,
    handleScroll,
  };
}
