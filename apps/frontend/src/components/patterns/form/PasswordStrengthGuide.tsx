'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { evaluatePasswordPolicy } from './password-policy';

interface PasswordStrengthGuideProps {
  password: string;
  email: string;
  name: string;
}

export function PasswordStrengthGuide({
  password,
  email,
  name,
}: PasswordStrengthGuideProps) {
  const policy = evaluatePasswordPolicy(password, email, name);

  if (!password) return null;

  const levelStyle =
    policy.level === '강함'
      ? 'text-emerald-600'
      : policy.level === '보통'
        ? 'text-amber-600'
        : 'text-brand-danger-text';

  return (
    <div className="rounded-[10px] border border-gray-200 bg-gray-50/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-medium text-foreground">비밀번호 안전도</p>
        <p className={`text-[12px] font-semibold ${levelStyle}`}>{policy.level}</p>
      </div>

      <div className="mb-3 grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full ${
              index < policy.score
                ? policy.level === '강함'
                  ? 'bg-emerald-500'
                  : policy.level === '보통'
                    ? 'bg-amber-500'
                    : 'bg-brand-danger-border'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        {policy.checks.map((check) => (
          <p
            key={check.key}
            className={`flex items-center gap-1.5 text-[12px] ${
              check.passed ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {check.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-gray-300" />
            )}
            {check.label}
          </p>
        ))}
      </div>
    </div>
  );
}
