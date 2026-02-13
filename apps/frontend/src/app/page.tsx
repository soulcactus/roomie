'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasAccessToken =
      typeof window !== 'undefined' &&
      document.cookie.includes('access_token=');

    router.replace(hasAccessToken ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
