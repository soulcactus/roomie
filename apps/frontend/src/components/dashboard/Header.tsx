'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/brand';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick?: () => void;
  user?: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
  isLoggingOut?: boolean;
  showUserMenu?: boolean;
  showHeaderAction?: boolean;
}

export function Header({
  onMenuClick,
  user,
  onLogout,
  isLoggingOut = false,
  showUserMenu = true,
  showHeaderAction = true,
}: HeaderProps) {
  const currentUser = user ?? {
    name: '사용자',
    email: 'user@roomie.app',
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {onMenuClick ? (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : null}
        <Link href="/" aria-label="Roomie 홈으로 이동">
          <Logo size="sm" />
        </Link>
      </div>

      {!showHeaderAction ? null : showUserMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {currentUser.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              disabled={isLoggingOut}
              className="text-red-600"
            >
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          로그아웃
        </Button>
      )}
    </header>
  );
}
