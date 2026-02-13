import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ParticipantSelector } from './ParticipantSelector';

describe('ParticipantSelector', () => {
  it('체크 후 적용하면 참석자 목록이 반영된다', () => {
    const onParticipantsChange = vi.fn();

    render(
      <ParticipantSelector
        participants={['홍길동']}
        maxCapacity={8}
        onParticipantsChange={onParticipantsChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /총 1명 선택됨/i }));
    fireEvent.click(screen.getByRole('button', { name: '김지은' }));
    fireEvent.click(screen.getByRole('button', { name: '적용' }));

    expect(onParticipantsChange).toHaveBeenCalledWith(['홍길동', '김지은']);
  });

  it('외부 참석자 수를 증가시키고 적용하면 번호가 붙어 반영된다', () => {
    const onParticipantsChange = vi.fn();

    render(
      <ParticipantSelector
        participants={['홍길동']}
        maxCapacity={8}
        onParticipantsChange={onParticipantsChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /총 1명 선택됨/i }));
    fireEvent.click(screen.getByLabelText('외부 참석자 증가'));
    fireEvent.click(screen.getByRole('button', { name: '적용' }));

    expect(onParticipantsChange).toHaveBeenCalledWith(['홍길동', '외부참석자 1']);
  });
});
