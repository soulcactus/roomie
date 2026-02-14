'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/dashboard/AppShell';
import { getViewState, type ViewState } from '@/components/dashboard/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MiniCalendar,
  BookingLegend,
  RoomTimelineRow,
  BookingFormDialog,
  BookingViewDialog,
  useDashboardBookings,
  useDashboardTimelineScroll,
  AXIS_LEFT_PX,
  AXIS_RIGHT_PX,
  getTimelineLeft,
  toPercent,
  generateTimeLabels,
  generateHourLinePercents,
  isToday as checkIsToday,
} from '@/components/dashboard/timeline';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <AppShell>
      <div className="grid h-full w-full min-w-0 gap-3 md:grid-cols-[272px_minmax(0,1fr)]">
        <div className="w-full animate-pulse">
          <div className="h-[280px] rounded-xl bg-muted/50" />
        </div>
        <div className="h-full animate-pulse rounded-xl bg-muted/50" />
      </div>
    </AppShell>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const initialState = getViewState(searchParams.get('state'));

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  if (!selectedDate) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardContentReady
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      initialState={initialState}
    />
  );
}

interface DashboardContentReadyProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  initialState: ViewState;
}

function DashboardContentReady({
  selectedDate,
  setSelectedDate,
  initialState,
}: DashboardContentReadyProps) {
  const [viewState, setViewState] = useState<ViewState>('loading');

  // 예약 관리 훅
  const {
    rooms,
    bookings,
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
  } = useDashboardBookings({ selectedDate });

  // 타임라인 데이터
  const labelMarks = useMemo(() => generateTimeLabels(), []);
  const hourLinePercents = useMemo(() => generateHourLinePercents(), []);
  const isToday = checkIsToday(selectedDate);
  const {
    now,
    scrollContainerRef,
    nowLineRef,
    isTimelineShifted,
    isTimelineAtRightEdge,
    handleScroll,
  } = useDashboardTimelineScroll({
    viewState,
    selectedDate,
    isToday,
  });
  const nowLineLeft = getTimelineLeft(toPercent(now.toISOString()));

  // 초기 로딩
  useEffect(() => {
    setViewState('loading');
    const timer = window.setTimeout(() => {
      setViewState(initialState);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [initialState]);

  const retryLoad = () => {
    setViewState('loading');
    window.setTimeout(() => setViewState('success'), 700);
  };

  return (
    <AppShell>
      <div className="grid h-full w-full min-w-0 gap-3 md:grid-cols-[272px_minmax(0,1fr)]">
        {/* 좌측: 캘린더 & 범례 */}
        <div className="w-full min-w-0 md:w-auto">
          <div className="md:hidden">
            <BookingLegend variant="mobile" />
          </div>

          <div className="md:pb-2">
            <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          <div className="mt-1.5 hidden md:block">
            <BookingLegend variant="desktop" />
          </div>
        </div>

        {/* 우측: 타임라인 */}
        <Card
          className={cn(
            'min-h-0 min-w-0 overflow-hidden border-0 shadow-[0px_25px_50px_-12px_rgba(198,210,255,0.24)]',
            isTimelineAtRightEdge ? 'rounded-xl' : 'rounded-l-xl rounded-r-none',
          )}
        >
          <CardContent
            ref={scrollContainerRef}
            className="pretty-scrollbar h-full overflow-x-auto overflow-y-auto p-0 touch-pan-x"
            onScroll={handleScroll}
          >
            {viewState === 'error' && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">
                  데이터를 불러오지 못했습니다.
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={retryLoad}>
                  다시 시도
                </Button>
              </div>
            )}

            {viewState === 'empty' && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm font-medium">오늘 예약이 없습니다.</p>
              </div>
            )}

            {viewState === 'success' && (
              rooms.length === 0 ? (
                <div className="relative m-3 min-h-[560px] rounded-xl bg-white">
                  <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="h-5 w-5 text-slate-500" />
                      <p className="text-sm font-medium">
                        현재 설정된 회의실이 없습니다. 관리자에게 문의 바랍니다.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative min-w-[2600px] px-3 pb-3">
                  {/* 시간 라벨 헤더 */}
                  <div
                    className={cn(
                      'sticky top-0 z-50 border-b bg-background/95 py-2',
                    )}
                  >
                    <div
                      className="relative h-5 text-xs text-muted-foreground"
                      style={{
                        marginLeft: `${AXIS_LEFT_PX}px`,
                        marginRight: `${AXIS_RIGHT_PX}px`,
                      }}
                    >
                      {labelMarks.map((mark, index) => {
                        const xTransform =
                          index === 0
                            ? '0%'
                            : index === labelMarks.length - 1
                              ? '-100%'
                              : '-50%';
                        return (
                          <span
                            key={mark.label}
                            className="absolute top-1/2"
                            style={{
                              left: `${mark.percent}%`,
                              transform: `translate(${xTransform}, -50%)`,
                            }}
                          >
                            {mark.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* 타임라인 본문 */}
                  <div className="relative min-h-[420px] space-y-3 pb-2 pt-2.5">
                    {/* 시간선 */}
                    {hourLinePercents
                      .filter((percent) => percent !== 100)
                      .map((percent, index) => (
                        <div
                          key={`hour-line-${index}`}
                          className={cn(
                            'pointer-events-none absolute bottom-0 top-0 z-20 w-px !mt-0',
                            index % 2 === 0 ? 'bg-zinc-500/15' : 'bg-zinc-400/10',
                          )}
                          style={{ left: getTimelineLeft(percent) }}
                          aria-hidden
                        />
                      ))}

                    {/* 마지막 라인 */}
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 z-20 w-px bg-zinc-500/15 -translate-x-px !mt-0"
                      style={{ left: getTimelineLeft(100) }}
                      aria-hidden
                    />

                    {/* 현재 시간선 */}
                    {isToday && (
                      <div
                        ref={nowLineRef}
                        className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-rose-500/90 !mt-0"
                        style={{ left: nowLineLeft }}
                        aria-hidden
                      />
                    )}

                    {/* 회의실별 행 */}
                    {rooms.map((room) => (
                      <RoomTimelineRow
                        key={room.id}
                        room={room}
                        bookings={bookings.filter((b) => b.roomName === room.name)}
                        now={now}
                        isTimelineShifted={isTimelineShifted}
                        isTimelineAtRightEdge={isTimelineAtRightEdge}
                        onCreateBooking={openCreateBooking}
                        onEditBooking={openEditBooking}
                        onViewBooking={openViewBooking}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* 예약 생성 다이얼로그 */}
      <BookingFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        draft={draftBooking}
        onDraftChange={setDraftBooking}
        roomCapacity={selectedRoomCapacity}
        participantOptions={participantOptions}
        canSubmit={canSubmit}
        onSubmit={handleCreateSubmit}
      />

      {/* 예약 수정 다이얼로그 */}
      <BookingFormDialog
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        draft={editDraft}
        onDraftChange={setEditDraft}
        roomCapacity={editRoomCapacity}
        participantOptions={participantOptions}
        canSubmit={canEditSubmit}
        onSubmit={handleEditSubmit}
        onDelete={handleDeleteBooking}
      />

      {/* 예약 상세 다이얼로그 */}
      <BookingViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        booking={viewBooking}
      />
    </AppShell>
  );
}
