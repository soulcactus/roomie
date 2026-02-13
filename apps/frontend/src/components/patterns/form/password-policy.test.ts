import { describe, expect, it } from 'vitest';
import { evaluatePasswordPolicy } from './password-policy';

describe('evaluatePasswordPolicy', () => {
  it('최소/최대 길이를 모두 만족하면 유효한 비밀번호로 판단한다', () => {
    const result = evaluatePasswordPolicy('Abc!1234', 'hong@company.com', '홍길동');

    expect(result.isValid).toBe(true);
    expect(result.level).toBe('강함');
    expect(result.score).toBe(2);
  });

  it('8자 미만 비밀번호는 거부한다', () => {
    const result = evaluatePasswordPolicy('Abc123!', 'hong@company.com', '홍길동');

    const minLengthRule = result.checks.find((check) => check.key === 'min-length');
    expect(minLengthRule?.passed).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it('100자 초과 비밀번호는 거부한다', () => {
    const result = evaluatePasswordPolicy('a'.repeat(101), 'hong@company.com', '홍길동');

    const maxLengthRule = result.checks.find((check) => check.key === 'max-length');
    expect(maxLengthRule?.passed).toBe(false);
    expect(result.isValid).toBe(false);
  });
});
