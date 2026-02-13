'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CircleUserRound,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface SidebarNavProps {
  role?: 'USER' | 'ADMIN';
  userName?: string;
  onNavigate?: () => void;
}

const baseItems = [{ label: '통합 대시보드', href: '/dashboard', icon: LayoutDashboard }];
const adminItem = { label: '관리자 메뉴', href: '/admin', icon: ShieldCheck };

export function SidebarNav({ role = 'USER', userName = '사용자', onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const mainItems = baseItems;
  const userItems =
    role === 'ADMIN'
      ? [
          { label: '내 정보', href: '/dashboard', icon: CircleUserRound },
          adminItem,
        ]
      : [{ label: '내 정보', href: '/dashboard', icon: CircleUserRound }];

  return (
    <nav className="flex h-full flex-col p-3">
      <div>
        <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">워크스페이스</p>
      </div>
      <div className="space-y-1">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-3">
        <Separator />
        <div className="rounded-xl bg-muted/60 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-semibold">{userName}</p>
              <p className="text-[11px] text-muted-foreground">{role}</p>
            </div>
          </div>
          <div className="space-y-1">
            {userItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'bg-background text-foreground'
                      : 'text-muted-foreground hover:bg-background hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
