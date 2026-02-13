import { redirect } from 'next/navigation';
import { hasValidSession } from '@/lib/auth/session-server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await hasValidSession();
  if (isAuthenticated) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
