'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/dashboard/Header';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';
import { useLogout, useUser } from '@/hooks/use-auth';

type UserRole = 'USER' | 'ADMIN';

interface AppShellProps {
  children: ReactNode;
  role?: UserRole;
}

export function AppShell({ children, role = 'USER' }: AppShellProps) {
  const userQuery = useUser();
  const logoutMutation = useLogout();

  const fallbackUser = {
    name: '사용자',
    email: 'user@roomie.app',
    role,
  };

  const currentUser = userQuery.data?.data ?? fallbackUser;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-brand-surface">
      <Header
        user={{ name: currentUser.name, email: currentUser.email }}
        onLogout={() => logoutMutation.mutate()}
        isLoggingOut={logoutMutation.isPending}
        showUserMenu={false}
        showHeaderAction={false}
      />

      <main className="w-full flex-1 overflow-hidden p-4 md:p-6">{children}</main>
      <DashboardFooter
        user={{ name: currentUser.name, email: currentUser.email }}
        isLoggingOut={logoutMutation.isPending}
        onLogout={() => logoutMutation.mutate()}
      />
    </div>
  );
}
