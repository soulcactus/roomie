'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CircleAlert } from 'lucide-react';
import {
  AuthCard,
  FormError,
  FormField,
} from '@/components/patterns';
import { useRegister } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해 주세요.')
      .email('올바른 이메일 형식을 입력해 주세요.'),
    name: z
      .string()
      .min(1, '이름을 입력해 주세요.')
      .min(2, '이름은 최소 2자 이상 입력해 주세요.'),
    password: z
      .string()
      .min(1, '비밀번호를 입력해 주세요.')
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(100, '비밀번호는 최대 100자 이하여야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .superRefine((data, ctx) => {
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

          <div className="space-y-1">
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
            {!errors.password?.message && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CircleAlert className="h-3.5 w-3.5" />
                최소 8자 이상 입력하세요
              </p>
            )}
          </div>

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
          >
            {registerMutation.isPending ? '가입 중...' : '회원가입'}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
