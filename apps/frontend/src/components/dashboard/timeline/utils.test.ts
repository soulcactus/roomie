import { describe, expect, it } from 'vitest';
import {
  normalizeExternalParticipants,
  toMinutesFromTime,
  generateTimeLabels,
} from './utils';

describe('timeline utils', () => {
  it('외부참석자 이름을 연속 번호로 정규화한다', () => {
    const result = normalizeExternalParticipants([
      '홍길동',
      '외부참석자',
      '김지은',
      '외부참석자 9',
    ]);

    expect(result).toEqual(['홍길동', '외부참석자 1', '김지은', '외부참석자 2']);
  });

  it('시간 문자열을 분 단위로 변환한다', () => {
    expect(toMinutesFromTime('00:00')).toBe(0);
    expect(toMinutesFromTime('09:30')).toBe(570);
    expect(toMinutesFromTime('23:59')).toBe(1439);
  });

  it('타임라인 라벨은 2시간 간격으로 13개 생성된다', () => {
    const labels = generateTimeLabels();

    expect(labels).toHaveLength(13);
    expect(labels[0]).toEqual({ label: '00:00', percent: 0 });
    expect(labels[labels.length - 1]).toEqual({ label: '24:00', percent: 100 });
  });
});
