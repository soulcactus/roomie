import { describe, expect, it } from 'vitest';
import { getViewState } from './format';

describe('dashboard format helpers', () => {
  it('지원하지 않는 state 값은 success로 처리한다', () => {
    expect(getViewState(null)).toBe('success');
    expect(getViewState('unknown')).toBe('success');
  });

  it('허용된 state 값은 그대로 반환한다', () => {
    expect(getViewState('empty')).toBe('empty');
    expect(getViewState('error')).toBe('error');
  });
});
