'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface DashboardFooterProps {
  user: {
    name: string;
    email: string;
  };
  isLoggingOut: boolean;
  onLogout: () => void;
}

export function DashboardFooter({
  user,
  isLoggingOut,
  onLogout,
}: DashboardFooterProps) {
  return (
    <footer className="z-30 shrink-0 border-t bg-background/95 backdrop-blur">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onLogout} disabled={isLoggingOut}>
            로그아웃
          </Button>
        </div>
      </div>
    </footer>
  );
}
