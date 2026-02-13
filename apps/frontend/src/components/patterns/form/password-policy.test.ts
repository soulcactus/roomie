import { describe, expect, it } from 'vitest';
import { evaluatePasswordPolicy } from './password-policy';

describe('evaluatePasswordPolicy', () => {
  it('모든 정책을 통과하면 유효한 비밀번호로 판단한다', () => {
    const result = evaluatePasswordPolicy(
      'Abc!1234',
      'hong@company.com',
      '홍길동',
    );

    expect(result.isValid).toBe(true);
    expect(result.level).toBe('강함');
    expect(result.score).toBe(5);
  });

  it('흔한 비밀번호는 거부한다', () => {
    const result = evaluatePasswordPolicy(
      'password123',
      'hong@company.com',
      '홍길동',
    );

    const commonRule = result.checks.find((check) => check.key === 'common');
    expect(commonRule?.passed).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it('이메일/이름이 포함된 비밀번호는 거부한다', () => {
    const result = evaluatePasswordPolicy(
      'hong!1234',
      'hong@company.com',
      '홍길동',
    );

    const personalRule = result.checks.find((check) => check.key === 'personal');
    expect(personalRule?.passed).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it('같은 문자 3회 이상 반복은 거부한다', () => {
    const result = evaluatePasswordPolicy(
      'Abc!!!123',
      'hong@company.com',
      '홍길동',
    );

    const repeatRule = result.checks.find((check) => check.key === 'repeat');
    expect(repeatRule?.passed).toBe(false);
    expect(result.isValid).toBe(false);
  });
});
