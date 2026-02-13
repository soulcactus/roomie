import { redirect } from 'next/navigation';
import { hasSessionCookie } from '@/lib/auth/session-server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await hasSessionCookie();
  if (!isAuthenticated) {
    redirect('/login');
  }

  return <>{children}</>;
}
