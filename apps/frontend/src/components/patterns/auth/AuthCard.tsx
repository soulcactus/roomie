'use client';

import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  subtitle?: string;
  footer?: {
    text: string;
    linkText: string;
    linkHref: string;
  };
  className?: string;
  footerDisabled?: boolean;
  bgVariant?: 'gradient' | 'gray';
}

export function AuthCard({
  children,
  subtitle = '회의실 예약을 더욱 간편하게',
  footer,
  className,
  footerDisabled,
  bgVariant = 'gradient',
}: AuthCardProps) {
  return (
    <main
      className={cn(
        'flex min-h-screen items-center justify-center p-4',
        bgVariant === 'gradient'
          ? 'bg-gradient-to-br from-brand-gradient-start via-brand-gradient-mid to-brand-gradient-end'
          : 'bg-brand-surface',
      )}
    >
      <div className="flex w-full max-w-[440px] flex-col gap-6 md:gap-8">
        <div className="text-center">
          <Link href="/" aria-label="Roomie 홈으로 이동">
            <Logo size="lg" className="mb-2 justify-center" />
          </Link>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div
          className={cn(
            'rounded-3xl bg-white shadow-[0px_25px_50px_-12px_rgba(198,210,255,0.4)]',
            className,
          )}
        >
          <div className="p-6 md:p-8">
            {children}

            {footer && (
              <div
                className={cn(
                  'mt-5 flex items-center justify-center gap-1.5 transition-opacity duration-200',
                  footerDisabled && 'opacity-50',
                )}
              >
                <span className="text-xs text-muted-foreground md:text-sm">
                  {footer.text}
                </span>
                <Link
                  href={footer.linkHref}
                  className={cn(
                    'text-xs font-medium text-primary hover:underline md:text-sm',
                    footerDisabled && 'pointer-events-none',
                  )}
                >
                  {footer.linkText}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
