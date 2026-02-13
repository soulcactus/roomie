'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthCard, FormError, FormField } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { useLogin } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('유효한 이메일 주소를 입력해주세요'),
});

const loginSchema = emailSchema.extend({
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type LoginStep = 'email' | 'password';

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('email');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const email = watch('email');
  const passwordField = register('password', {
    onChange: () => {
      clearErrors('password');
      setGeneralError(null);
    },
  });

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue('email', value);
    clearErrors('email');
    setGeneralError(null);

    if (step === 'password') {
      setStep('email');
      setValue('password', '');
      clearErrors('password');
    }
  };

  const handleEmailSubmit = () => {
    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      const emailError = result.error.issues.find(
        (issue) => issue.path[0] === 'email',
      );
      if (emailError) {
        setError('email', { message: emailError.message });
      }
      return;
    }

    setStep('password');
  };

  const handleLoginSubmit = async (data: LoginFormData) => {
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData;
        setError(field, { message: issue.message });
      });
      return;
    }

    setGeneralError(null);

    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
    } catch {
      setGeneralError('로그인에 실패했습니다. 입력값을 확인해 주세요.');
    }
  };

  const onSubmit = (data: LoginFormData) => {
    if (step === 'email') {
      handleEmailSubmit();
      return;
    }

    void handleLoginSubmit(data);
  };

  useEffect(() => {
    if (step === 'password' && passwordInputRef.current) {
      const timer = window.setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 300);
      return () => window.clearTimeout(timer);
    }
  }, [step]);

  const showContinueButton = email.trim().length > 0 && step === 'email';

  return (
    <AuthCard
      footer={{
        text: '계정이 없으신가요?',
        linkText: '회원가입',
        linkHref: '/register',
      }}
      footerDisabled={loginMutation.isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="이메일로 로그인"
          type="email"
          placeholder="name@company.com"
          disabled={loginMutation.isPending}
          error={errors.email?.message}
          {...register('email')}
          onChange={handleEmailChange}
        />

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            step === 'password'
              ? 'max-h-[120px] opacity-100 mt-5'
              : 'max-h-0 opacity-0 mt-0',
          )}
        >
          <FormField
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            disabled={loginMutation.isPending}
            showPasswordToggle
            error={errors.password?.message}
            {...passwordField}
            ref={(element) => {
              passwordField.ref(element);
              passwordInputRef.current = element;
            }}
          />
        </div>

        {generalError && <FormError message={generalError} />}

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            showContinueButton
              ? 'max-h-[60px] opacity-100 mt-5'
              : 'max-h-0 opacity-0 mt-0',
          )}
        >
          <Button type="submit" variant="gradient" size="auth" className="w-full">
            계속하기
          </Button>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            step === 'password'
              ? 'max-h-[60px] opacity-100 mt-5'
              : 'max-h-0 opacity-0 mt-0',
          )}
        >
          <Button
            type="submit"
            variant="gradient"
            size="auth"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? '로그인 중...' : '로그인하기'}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
