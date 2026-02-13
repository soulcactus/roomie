'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { httpClient, ApiError } from '@/lib/http/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  accessToken: string;
}

export function useUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => httpClient<User>('/users/me'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginDto) =>
      httpClient<AuthResponse>('/auth/login', { method: 'POST', body: data }),

    onSuccess: (response) => {
      // Access Token은 메모리에 저장 (또는 상태 관리)
      // Refresh Token은 서버가 HttpOnly Cookie로 설정
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', response.data.accessToken);
      }

      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('로그인 되었습니다.');
      router.push('/rooms');
    },

    onError: (error: ApiError) => {
      if (error.status === 401) {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }
      toast.error(error.message ?? '로그인에 실패했습니다.');
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterDto) =>
      httpClient<User>('/auth/register', { method: 'POST', body: data }),

    onSuccess: () => {
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
      router.push('/login');
    },

    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast.error('이미 존재하는 이메일입니다.');
        return;
      }
      toast.error(error.message ?? '회원가입에 실패했습니다.');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => httpClient<{ message: string }>('/auth/logout', { method: 'POST' }),

    onSuccess: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
      }

      queryClient.clear();
      toast.success('로그아웃 되었습니다.');
      router.push('/');
    },

    onError: () => {
      // 로그아웃 실패해도 로컬 상태는 정리
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
      }
      queryClient.clear();
      router.push('/');
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      httpClient<AuthResponse>('/auth/refresh', { method: 'POST' }),

    onSuccess: (response) => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', response.data.accessToken);
      }
    },

    onError: () => {
      // 리프레시 실패 시 로그아웃 처리
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
      }
      queryClient.clear();
    },
  });
}
