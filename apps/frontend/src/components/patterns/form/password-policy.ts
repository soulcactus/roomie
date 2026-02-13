export interface PasswordPolicyCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface PasswordPolicyResult {
  checks: PasswordPolicyCheck[];
  score: number;
  level: '약함' | '보통' | '강함';
  isValid: boolean;
}

export function evaluatePasswordPolicy(
  password: string,
  _email: string,
  _name: string,
): PasswordPolicyResult {
  const normalized = password.trim();
  const hasMinLength = normalized.length >= 8;
  const hasMaxLength = normalized.length <= 100;

  const checks: PasswordPolicyCheck[] = [
    {
      key: 'min-length',
      label: '최소 8자 이상',
      passed: hasMinLength,
    },
    {
      key: 'max-length',
      label: '최대 100자 이하',
      passed: hasMaxLength,
    },
  ];

  const score = checks.filter((check) => check.passed).length;
  const level: PasswordPolicyResult['level'] =
    score === 0 ? '약함' : score === 1 ? '보통' : '강함';
  const isValid = checks.every((check) => check.passed);

  return {
    checks,
    score,
    level,
    isValid,
  };
}
