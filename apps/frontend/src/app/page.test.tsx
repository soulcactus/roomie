import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe('Home redirect', () => {
  beforeEach(() => {
    replaceMock.mockReset();
    sessionStorage.clear();
  });

  it('토큰이 없으면 로그인 페이지로 이동한다', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/login');
    });
  });

  it('토큰이 있으면 대시보드로 이동한다', async () => {
    sessionStorage.setItem('accessToken', 'mock-token');

    render(<Home />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/dashboard');
    });
  });
});
