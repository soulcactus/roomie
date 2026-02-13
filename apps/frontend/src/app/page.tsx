'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasAccessToken =
      typeof window !== 'undefined' &&
      Boolean(sessionStorage.getItem('accessToken'));

    router.replace(hasAccessToken ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
