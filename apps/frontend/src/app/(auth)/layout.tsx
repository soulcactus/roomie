import { redirect } from 'next/navigation';
import { hasSessionCookie } from '@/lib/auth/session-server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await hasSessionCookie();
  if (isAuthenticated) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
