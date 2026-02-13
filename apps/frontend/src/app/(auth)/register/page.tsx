'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  AuthCard,
  evaluatePasswordPolicy,
  FormError,
  FormField,
  PasswordStrengthGuide,
} from '@/components/patterns';
import { useRegister } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해 주세요.')
      .email('올바른 이메일 형식을 입력해 주세요.'),
    name: z.string().min(1, '이름을 입력해 주세요.'),
    password: z.string().min(1, '비밀번호를 입력해 주세요.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .superRefine((data, ctx) => {
    const policy = evaluatePasswordPolicy(data.password, data.email, data.name);
    const firstFailed = policy.checks.find((check) => !check.passed);

    if (firstFailed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: `비밀번호 조건: ${firstFailed.label}`,
      });
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: '비밀번호가 일치하지 않습니다.',
      });
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });
  const email = watch('email');
  const name = watch('name');
  const password = watch('password');
  const passwordPolicy = evaluatePasswordPolicy(password ?? '', email ?? '', name ?? '');

  const handleFieldChange = (field: keyof RegisterFormData) => () => {
    clearErrors(field);
    setGeneralError(null);
  };

  const onSubmit = async (data: RegisterFormData) => {
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData;
        setError(field, { message: issue.message });
      });
      return;
    }

    setGeneralError(null);

    try {
      await registerMutation.mutateAsync({
        email: data.email,
        name: data.name,
        password: data.password,
      });

      setIsSuccess(true);
    } catch {
      setGeneralError('회원가입에 실패했습니다. 입력값을 확인해 주세요.');
    }
  };

  if (isSuccess) {
    return (
      <AuthCard
        bgVariant="gray"
        subtitle="회의실 예약을 더욱 간편하게"
        footer={{
          text: '',
          linkText: '로그인하러 가기',
          linkHref: '/login',
        }}
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            회원가입이 완료되었습니다
          </h2>
          <p className="text-xs text-muted-foreground">
            로그인하여 서비스를 이용해 주세요.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      bgVariant="gray"
      subtitle="회의실 예약을 더욱 간편하게"
      footer={{
        text: '이미 계정이 있으신가요?',
        linkText: '로그인',
        linkHref: '/login',
      }}
      footerDisabled={registerMutation.isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <FormField
            label="이메일"
            type="email"
            placeholder="name@company.com"
            disabled={registerMutation.isPending}
            error={errors.email?.message}
            {...register('email', { onChange: handleFieldChange('email') })}
          />

          <FormField
            label="이름"
            type="text"
            placeholder="홍길동"
            disabled={registerMutation.isPending}
            error={errors.name?.message}
            {...register('name', { onChange: handleFieldChange('name') })}
          />

          <FormField
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            disabled={registerMutation.isPending}
            showPasswordToggle
            error={errors.password?.message}
            {...register('password', {
              onChange: handleFieldChange('password'),
            })}
          />
          <PasswordStrengthGuide
            password={password ?? ''}
            email={email ?? ''}
            name={name ?? ''}
          />

          <FormField
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            disabled={registerMutation.isPending}
            showPasswordToggle
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              onChange: handleFieldChange('confirmPassword'),
            })}
          />
        </div>

        {generalError && <FormError message={generalError} />}

        <div className="mt-5">
          <Button
            type="submit"
            variant="gradient"
            size="auth"
            className="w-full"
            disabled={registerMutation.isPending || !passwordPolicy.isValid}
          >
            {registerMutation.isPending ? '가입 중...' : '회원가입'}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
