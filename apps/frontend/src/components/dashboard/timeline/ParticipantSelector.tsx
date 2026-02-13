'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PARTICIPANT_OPTIONS } from './constants';
import { normalizeExternalParticipants } from './utils';

interface ParticipantSelectorProps {
  participants: string[];
  options?: string[];
  maxCapacity?: number;
  onParticipantsChange: (participants: string[]) => void;
}

function isExternalParticipant(name: string) {
  return name.startsWith('외부참석자');
}

function getExternalCount(list: string[]) {
  return list.filter((name) => isExternalParticipant(name)).length;
}

function getInternalParticipants(list: string[], ownerName: string) {
  const internal = list.filter((name) => !isExternalParticipant(name));
  if (!ownerName || internal.includes(ownerName)) {
    return internal;
  }

  return [ownerName, ...internal];
}

export function ParticipantSelector({
  participants,
  options,
  maxCapacity,
  onParticipantsChange,
}: ParticipantSelectorProps) {
  const ownerName =
    participants.find((name) => !isExternalParticipant(name)) ??
    participants[0] ??
    '';
  const [isOpen, setIsOpen] = useState(false);
  const [draftInternal, setDraftInternal] = useState<string[]>(() =>
    getInternalParticipants(participants, ownerName),
  );
  const [draftExternalCount, setDraftExternalCount] = useState(() =>
    getExternalCount(participants),
  );
  const participantOptions: string[] =
    options && options.length > 0 ? options : [...PARTICIPANT_OPTIONS];

  useEffect(() => {
    if (!isOpen) {
      setDraftInternal(getInternalParticipants(participants, ownerName));
      setDraftExternalCount(getExternalCount(participants));
    }
  }, [isOpen, ownerName, participants]);

  const selectedCount = draftInternal.length + draftExternalCount;
  const isOverCapacity = maxCapacity !== undefined && selectedCount > maxCapacity;
  const maxExternalCount = Math.max((maxCapacity ?? Number.MAX_SAFE_INTEGER) - draftInternal.length, 0);

  const toggleInternal = (name: string) => {
    if (name === ownerName) return;

    setDraftInternal((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      }

      if (maxCapacity !== undefined && prev.length + draftExternalCount >= maxCapacity) {
        return prev;
      }

      return [...prev, name];
    });
  };

  const updateExternalCount = (next: number) => {
    const clamped = Math.max(0, Math.min(next, maxExternalCount));
    setDraftExternalCount(clamped);
  };

  const handleApply = () => {
    const ensuredInternal = ownerName
      ? draftInternal.includes(ownerName)
        ? draftInternal
        : [ownerName, ...draftInternal]
      : draftInternal;

    const externalParticipants = Array.from(
      { length: draftExternalCount },
      (_, index) => `외부참석자 ${index + 1}`,
    );

    onParticipantsChange(
      normalizeExternalParticipants([...ensuredInternal, ...externalParticipants]),
    );
    setIsOpen(false);
  };

  const removeParticipant = (name: string) => {
    if (name === ownerName) return;
    onParticipantsChange(
      normalizeExternalParticipants(participants.filter((participant) => participant !== name)),
    );
  };

  return (
    <div className="grid gap-1.5">
      <label className="text-[12px] font-medium text-foreground">참석자</label>

      <div className="relative">
        <button
          type="button"
          className="flex h-12 w-full items-center justify-between rounded-[10px] border border-gray-200 bg-gray-50/50 px-3 text-left text-[14px] shadow-none"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <span className="truncate text-foreground">
            {participants.length > 0
              ? `총 ${participants.length}명 선택됨`
              : '참석자를 선택해 주세요'}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border bg-popover p-2 text-[12px] shadow-md">
            <div className="pretty-scrollbar max-h-[108px] overflow-y-auto rounded-[10px] border border-gray-200 bg-white/80 p-1">
              {participantOptions.map((name) => {
                const checked = draftInternal.includes(name);
                const isOwner = name === ownerName;
                const disabled =
                  !checked &&
                  !isOwner &&
                  maxCapacity !== undefined &&
                  draftInternal.length + draftExternalCount >= maxCapacity;

                return (
                  <button
                    key={name}
                    type="button"
                    className={cn(
                      'flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-accent',
                      (disabled || isOwner) && 'cursor-not-allowed opacity-45',
                    )}
                    onClick={() => toggleInternal(name)}
                    disabled={disabled || isOwner}
                  >
                    <span>{name}</span>
                    <span
                      className={cn(
                        'inline-flex h-4 w-4 items-center justify-center rounded border',
                        checked ? 'border-primary bg-primary text-white' : 'border-muted-foreground/40',
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 rounded-md border p-2">
              <p className="text-[11px] font-medium text-foreground">외부 참석자</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="inline-flex items-center rounded border">
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center hover:bg-accent disabled:opacity-40"
                    onClick={() => updateExternalCount(draftExternalCount - 1)}
                    disabled={draftExternalCount === 0}
                    aria-label="외부 참석자 감소"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="inline-flex h-7 min-w-9 items-center justify-center border-x px-2 text-[12px]">
                    {draftExternalCount}
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center hover:bg-accent disabled:opacity-40"
                    onClick={() => updateExternalCount(draftExternalCount + 1)}
                    disabled={draftExternalCount >= maxExternalCount}
                    aria-label="외부 참석자 증가"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  최대 {maxExternalCount}명 추가 가능
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className={cn(isOverCapacity ? 'text-red-600' : 'text-muted-foreground')}>
                선택 {selectedCount}명{maxCapacity ? ` / ${maxCapacity}명` : ''}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-[11px]"
                  onClick={() => setIsOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-2 text-[11px]"
                  onClick={handleApply}
                  disabled={isOverCapacity}
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 text-[12px]">
        {participants.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-[12px] text-foreground"
          >
            {name}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => removeParticipant(name)}
              aria-label={`${name} 제거`}
              disabled={name === ownerName}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
