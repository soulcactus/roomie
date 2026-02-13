'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Button,
} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { BookingDraft, EditBookingDraft } from './types';
import { ParticipantSelector } from './ParticipantSelector';
import { TimePickerInput } from './TimePickerInput';

interface BookingFormDialogBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCapacity?: number;
  participantOptions?: string[];
  canSubmit: boolean;
}

interface CreateModeProps extends BookingFormDialogBaseProps {
  mode: 'create';
  draft: BookingDraft | null;
  onDraftChange: Dispatch<SetStateAction<BookingDraft | null>>;
  onSubmit: (event: React.FormEvent) => void;
}

interface EditModeProps extends BookingFormDialogBaseProps {
  mode: 'edit';
  draft: EditBookingDraft | null;
  onDraftChange: Dispatch<SetStateAction<EditBookingDraft | null>>;
  onSubmit: (event: React.FormEvent) => void;
  onDelete: (id: string) => void;
}

type BookingFormDialogProps = CreateModeProps | EditModeProps;

/**
 * 예약 생성/수정 다이얼로그
 */
export function BookingFormDialog(props: BookingFormDialogProps) {
  const { open, onOpenChange, roomCapacity, participantOptions, canSubmit, mode, draft, onSubmit } = props;

  const isEditMode = mode === 'edit';
  const title = isEditMode ? '예약 수정' : '예약 생성';
  const submitText = isEditMode ? '예약 수정' : '예약 등록';

  const handleClose = () => onOpenChange(false);

  const updateDraft = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => {
    if (props.mode === 'create') {
      props.onDraftChange((previousDraft) =>
        previousDraft ? { ...previousDraft, [key]: value } : previousDraft,
      );
    } else {
      props.onDraftChange((previousDraft) =>
        previousDraft ? { ...previousDraft, [key]: value } : previousDraft,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] sm:overflow-visible">
        <DialogHeader>
          <div className="flex items-center gap-2 pr-10">
            <DialogTitle className="text-lg md:text-xl">{title}</DialogTitle>
            {isEditMode && props.draft && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-red-600 hover:text-red-700"
                onClick={() => props.onDelete(props.draft!.id)}
                aria-label="예약 삭제"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            )}
          </div>
        </DialogHeader>

        {draft && (
          <form className="mt-4 space-y-3.5" onSubmit={onSubmit}>
            {/* 회의실 · 날짜 · 정원 */}
            <div className="grid gap-1">
              <p className="text-[12px] font-medium text-foreground">
                회의실 · 날짜 · 정원
              </p>
              <p className="text-[14px] font-semibold text-brand-info">
                {draft.roomName} ·{' '}
                {draft.date.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                {roomCapacity ? `· 최대 ${roomCapacity}명` : ''}
              </p>
            </div>

            {/* 시간 선택 */}
            <div className="grid grid-cols-2 gap-2.5">
              <TimePickerInput
                label="시작"
                value={draft.startTime}
                onChange={(nextValue) => updateDraft('startTime', nextValue)}
              />
              <TimePickerInput
                label="종료"
                value={draft.endTime}
                onChange={(nextValue) => updateDraft('endTime', nextValue)}
              />
            </div>

            {/* 회의명 */}
            <div className="grid gap-1.5">
              <label className="text-[12px] font-medium text-foreground">
                회의명
              </label>
              <Input
                value={draft.title}
                onChange={(event) => updateDraft('title', event.target.value)}
                placeholder="회의 제목을 입력하세요"
                className="h-12 rounded-[10px] border-gray-200 bg-gray-50/50 px-3 text-[14px] shadow-none placeholder:text-brand-placeholder focus:border-primary focus-visible:ring-0"
              />
            </div>

            {/* 참석자 */}
            <ParticipantSelector
              participants={draft.participants}
              options={participantOptions}
              maxCapacity={roomCapacity}
              onParticipantsChange={(participants) => updateDraft('participants', participants)}
            />

            {/* 푸터 스페이서 (모바일 고정 푸터용) */}
            <div className="h-[20px]" aria-hidden />

            {/* 모바일 고정 푸터 */}
            <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 px-4 py-3 backdrop-blur max-sm:block sm:hidden">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-12 w-full rounded-[10px] border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="auth"
                  className="w-full"
                  disabled={!canSubmit}
                >
                  {submitText}
                </Button>
              </div>
            </div>

            {/* 데스크탑 푸터 */}
            <DialogFooter className="mt-0 hidden sm:flex">
              <button
                type="button"
                onClick={handleClose}
                className="h-12 md:h-14 w-full rounded-[10px] border border-gray-200 bg-white text-sm md:text-base font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                취소
              </button>
              <Button
                type="submit"
                variant="gradient"
                size="auth"
                className="w-full"
                disabled={!canSubmit}
              >
                {submitText}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
