import { redirect } from 'next/navigation';
import { hasValidSession } from '@/lib/auth/session-server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await hasValidSession();
  if (!isAuthenticated) {
    redirect('/login');
  }

  return <>{children}</>;
}
