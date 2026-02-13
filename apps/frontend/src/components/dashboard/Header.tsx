"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
    name: "사용자",
    email: "user@roomie.app",
  };
  const repositoryUrl = "https://github.com/soulcactus/roomie";

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

      <div className="flex items-center gap-2">
        <a
          href={repositoryUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub 저장소 열기"
          className="inline-flex h-[34px] w-[34px] items-center justify-center"
        >
            <svg
              aria-hidden="true"
              focusable="false"
              className="h-[26px] w-[26px] shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z" />
            </svg>
        </a>

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
                <p className="text-xs text-muted-foreground">
                  {currentUser.email}
                </p>
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
      </div>
    </header>
  );
}
