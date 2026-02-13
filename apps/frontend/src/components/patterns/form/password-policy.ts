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

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  'qwerty123',
  '12345678',
  '11111111',
  'asdf1234',
  'letmein',
  'welcome1',
  'admin123',
  'iloveyou',
]);

function getEmailId(email: string) {
  const emailId = email.split('@')[0]?.trim().toLowerCase() ?? '';
  return emailId.length >= 3 ? emailId : '';
}

function getNameToken(name: string) {
  const token = name.trim().toLowerCase();
  return token.length >= 2 ? token : '';
}

export function evaluatePasswordPolicy(
  password: string,
  email: string,
  name: string,
): PasswordPolicyResult {
  const normalized = password.trim();
  const lower = normalized.toLowerCase();
  const emailId = getEmailId(email);
  const nameToken = getNameToken(name);

  const hasLength = normalized.length >= 8 && normalized.length <= 64;
  const charTypes = [
    /[a-zA-Z]/.test(normalized),
    /\d/.test(normalized),
    /[^a-zA-Z\d]/.test(normalized),
  ].filter(Boolean).length;
  const hasDiversity = charTypes >= 2;
  const noTripleRepeat = !/(.)\1{2,}/.test(normalized);
  const noPersonalInfo =
    normalized.length === 0
      ? false
      : (!emailId || !lower.includes(emailId)) &&
        (!nameToken || !lower.includes(nameToken));
  const notCommonPassword = normalized.length > 0 && !COMMON_PASSWORDS.has(lower);

  const checks: PasswordPolicyCheck[] = [
    {
      key: 'length',
      label: '8~64자 길이',
      passed: hasLength,
    },
    {
      key: 'diversity',
      label: '영문/숫자/특수문자 중 2종 이상 포함',
      passed: hasDiversity,
    },
    {
      key: 'repeat',
      label: '같은 문자 3회 이상 반복 금지',
      passed: noTripleRepeat,
    },
    {
      key: 'personal',
      label: '이메일 ID·이름 포함 금지',
      passed: noPersonalInfo,
    },
    {
      key: 'common',
      label: '너무 흔한 비밀번호 사용 금지',
      passed: notCommonPassword,
    },
  ];

  const score = checks.filter((check) => check.passed).length;
  const level: PasswordPolicyResult['level'] =
    score <= 2 ? '약함' : score <= 4 ? '보통' : '강함';
  const isValid = checks.every((check) => check.passed);

  return {
    checks,
    score,
    level,
    isValid,
  };
}
